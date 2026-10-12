const API_ROOT = 'https://api.github.com';

export class GitHubBackupError extends Error {
  constructor(status) {
    super(`GitHub-Sicherung fehlgeschlagen (HTTP ${status}).`);
    this.status = status;
    this.retryable = status === 429 || status >= 500;
  }
}

export function createSceneBackupGitHub({ token, repository = 'VVhiteVVolf/Aleria', branch = 'master', fetchImpl = fetch }) {
  const secret = String(token || '').trim();
  if (!secret || !/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[\w./-]+$/.test(branch)) {
    throw Object.assign(new Error('Die GitHub-Backup-Konfiguration ist unvollständig.'), { retryable: false });
  }
  const root = `/repos/${repository}`;
  const encodedBranch = branch.split('/').map(encodeURIComponent).join('/');
  async function request(path, method = 'GET', body = undefined) {
    const response = await fetchImpl(`${API_ROOT}${root}${path}`, {
      method, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${secret}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) {
      const error = new GitHubBackupError(response.status);
      // Rate-limit responses use 403 as well. Never log GitHub response bodies or credentials.
      error.retryable ||= response.status === 403 && (response.headers?.get('x-ratelimit-remaining') === '0' || !!response.headers?.get('retry-after'));
      throw error;
    }
    return response.json();
  }
  async function head() {
    const ref = await request(`/git/ref/heads/${encodedBranch}`);
    const commit = await request(`/git/commits/${ref.object.sha}`);
    return { sha: ref.object.sha, tree: commit.tree.sha };
  }
  async function existingManifest(treeSha, directory) {
    let sha = treeSha;
    const segments = `${directory}/manifest.json`.split('/');
    for (const [index, segment] of segments.entries()) {
      const tree = await request(`/git/trees/${sha}`);
      if (tree.truncated) throw new Error('GitHub-Verzeichnis konnte nicht vollständig geprüft werden.');
      const item = tree.tree.find(entry => entry.path === segment);
      if (!item) return null;
      if (index === segments.length - 1) return item.sha;
      if (item.type !== 'tree') throw new Error('Der GitHub-Backup-Pfad ist bereits durch eine Datei belegt.');
      sha = item.sha;
    }
    return null;
  }
  return {
    async commitBackup({ directory, files, backupId, moduleTitle }) {
      const manifest = files.find(file => file.path === 'manifest.json');
      if (!manifest) throw new Error('Backup-Manifest fehlt.');
      // Blob identity makes a retry after a lost response safe without overwriting a snapshot.
      const blobs = [];
      for (const file of files) {
        const blob = await request('/git/blobs', 'POST', { content: Buffer.from(file.content).toString('base64'), encoding: 'base64' });
        blobs.push({ path: `${directory}/${file.path}`, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const manifestSha = blobs.find(blob => blob.path.endsWith('/manifest.json')).sha;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const current = await head();
        const existing = await existingManifest(current.tree, directory);
        if (existing) {
          if (existing !== manifestSha) throw new Error('Ein anderer Sicherungsstand belegt bereits diesen Backup-Pfad.');
          return { commitSha: current.sha, url: `https://github.com/${repository}/tree/${current.sha}/${directory}`, reused: true };
        }
        const tree = await request('/git/trees', 'POST', { base_tree: current.tree, tree: blobs });
        const commit = await request('/git/commits', 'POST', {
          message: `Szenenbackup: ${String(moduleTitle || 'Szene').replace(/[\r\n]/g, ' ').slice(0, 150)} [${backupId}] [skip ci]`,
          tree: tree.sha, parents: [current.sha]
        });
        try {
          await request(`/git/refs/heads/${encodedBranch}`, 'PATCH', { sha: commit.sha, force: false });
          return { commitSha: commit.sha, url: `https://github.com/${repository}/tree/${commit.sha}/${directory}`, reused: false };
        } catch (error) {
          if (![409, 422].includes(error.status)) throw error;
        }
      }
      const error = new Error('Der GitHub-Branch wurde gleichzeitig geändert. Die Sicherung wird erneut versucht.');
      error.retryable = true;
      throw error;
    }
  };
}
