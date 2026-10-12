const encodedPath = path => path.split('/').map(encodeURIComponent).join('/');

export function createGoogleBackupReader({ accessToken, project, fetchRef = fetch }) {
  async function request(url, body, raw = false) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetchRef(url, { method: body ? 'POST' : 'GET', headers: {
        Authorization: `Bearer ${accessToken}`, 'x-goog-user-project': project, 'Content-Type': 'application/json'
      }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000) });
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 4) {
        await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt)); continue;
      }
      if (!response.ok) throw new Error(`Google-Sicherung: HTTP ${response.status} (${new URL(url).hostname}).`);
      return raw ? Buffer.from(await response.arrayBuffer()) : response.json();
    }
  }
  return {
    request,
    async firestore(databaseId, readTime, progress = () => {}) {
      const root = `projects/${project}/databases/${databaseId}/documents`;
      const pending = [root], documents = [], collections = new Map(); let parents = 0;
      async function inspect(parent) {
        let nextPageToken;
        do {
          const data = await request(`https://firestore.googleapis.com/v1/${encodedPath(parent)}:listCollectionIds`, {
            readTime, pageSize: 1000, ...(nextPageToken ? { pageToken: nextPageToken } : {})
          });
          for (const collectionId of data.collectionIds || []) {
            const collectionPath = `${parent}/${collectionId}`;
            let pageToken; let count = 0;
            do {
              const url = new URL(`https://firestore.googleapis.com/v1/${encodedPath(collectionPath)}`);
              url.searchParams.set('readTime', readTime); url.searchParams.set('showMissing', 'true'); url.searchParams.set('pageSize', '1000');
              if (pageToken) url.searchParams.set('pageToken', pageToken);
              const page = await request(url);
              for (const document of page.documents || []) {
                pending.push(document.name);
                // Missing parents can still own real subcollections.
                if (document.createTime || document.updateTime || document.fields) { documents.push(document); count++; }
              }
              pageToken = page.nextPageToken;
            } while (pageToken);
            collections.set(collectionPath.slice(root.length + 1), count);
          }
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);
        parents++;
      }
      while (pending.length) {
        await Promise.all(pending.splice(0, 12).map(inspect));
        if (parents % 120 < 12) progress({ databaseId, documents: documents.length, inspectedParents: parents });
        if (Date.now() - Date.parse(readTime) > 50 * 60 * 1000) throw new Error('Sicherungsfenster überschritten; kein unvollständiges Archiv geschrieben.');
      }
      return { databaseId, readTime, documents: documents.sort((a, b) => a.name.localeCompare(b.name)), collections: Object.fromEntries([...collections].sort()) };
    },
    async users() {
      const users = []; let nextPageToken;
      do {
        const url = new URL(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:batchGet`);
        url.searchParams.set('maxResults', '1000'); if (nextPageToken) url.searchParams.set('nextPageToken', nextPageToken);
        const data = await request(url); users.push(...(data.users || [])); nextPageToken = data.nextPageToken;
      } while (nextPageToken);
      return users;
    },
    async bucket(bucketName) {
      const objects = []; let pageToken;
      do {
        const url = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}/o`);
        url.searchParams.set('versions', 'true'); url.searchParams.set('maxResults', '1000'); if (pageToken) url.searchParams.set('pageToken', pageToken);
        const data = await request(url);
        for (const metadata of data.items || []) {
          const download = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(metadata.name)}`);
          download.searchParams.set('alt', 'media'); download.searchParams.set('generation', metadata.generation);
          const bytes = await request(download, undefined, true);
          objects.push({ metadata, base64: bytes.toString('base64') });
        }
        pageToken = data.nextPageToken;
      } while (pageToken);
      return { bucketName, objects };
    }
  };
}
