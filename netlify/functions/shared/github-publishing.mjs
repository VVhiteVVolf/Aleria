import { timingSafeEqual } from 'node:crypto';
const API_VERSION = '2026-03-10';

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export function secureEqual(first, second) {
  const left = Buffer.from(String(first || ''));
  const right = Buffer.from(String(second || ''));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function bearerToken(headers = {}) {
  const value = String(headers.authorization || headers.Authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

export function repositoryConfig() {
  const repository = String(process.env.ALERIA_GITHUB_REPOSITORY || 'VVhiteVVolf/Aleria').trim();
  const [owner, repo, ...rest] = repository.split('/');
  if (!owner || !repo || rest.length) throw new Error('ALERIA_GITHUB_REPOSITORY muss als OWNER/REPOSITORY gesetzt sein.');
  return {
    owner,
    repo,
    repository,
    branch: String(process.env.ALERIA_GITHUB_BRANCH || 'master').trim() || 'master',
    token: String(process.env.ALERIA_GITHUB_TOKEN || ''),
    publishKey: String(process.env.ALERIA_GITHUB_PUBLISH_KEY || ''),
  };
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function createGitHubClient(config, fetchRef = fetch) {
  const root = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;

  async function request(path, options = {}, allowMissing = false) {
    const response = await fetchRef(`${root}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': API_VERSION,
        'User-Agent': config.userAgent || 'Aleria-Publisher',
        ...(options.headers || {}),
      },
    });
    if (allowMissing && response.status === 404) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || `GitHub antwortete mit HTTP ${response.status}.`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  return Object.freeze({
    request,
    readContent: async (path, ref) => {
      const record = await request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, {}, true);
      // GitHub omits inline content above 1 MB; embedded document fonts can cross that threshold.
      if (record?.encoding === 'none' && /^[a-f0-9]{40}$/i.test(record.sha || '')) {
        return request(`/git/blobs/${record.sha}`);
      }
      return record;
    },
  });
}

// Daten und Registry werden gemeinsam sichtbar. Kein Force-Push bei fremden Änderungen.
export async function commitGitHubFiles(github, { branch, head, baseTree, files, message }) {
  const post = (path, body, method = 'POST') => github.request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const blobs = await Promise.all(files.map(file => post('/git/blobs', { content: file.content, encoding: file.encoding || 'utf-8' })));
  const tree = await post('/git/trees', { base_tree: baseTree, tree: files.map((file, index) => ({ path: file.path, mode: '100644', type: 'blob', sha: blobs[index].sha })) });
  const created = await post('/git/commits', { message, tree: tree.sha, parents: [head] });
  await post(`/git/refs/heads/${encodeURIComponent(branch)}`, { sha: created.sha, force: false }, 'PATCH');
  return created;
}
