import { json, secureEqual, bearerToken, repositoryConfig, createGitHubClient, commitGitHubFiles } from './shared/github-publishing.mjs';
import { validateWedding, validateWeddingEnvelope, validateWeddingId, weddingRegistryEntry, WEDDING_MAX_BYTES } from '../../Ereignisse/modules/weddings/wedding-schema.mjs';

const ROOT = 'Ereignisse/Hochzeiten';
const error = (message, status = 400) => Object.assign(new Error(message), { status });
function decode(record, fallback) {
  if (!record) return fallback;
  if (!record.content) throw error('Die aktuelle GitHub-Fassung ist nicht lesbar.', 502);
  return JSON.parse(Buffer.from(record.content.replace(/\s/g, ''), 'base64').toString('utf8'));
}
export function parseWeddingPublication(body) {
  const input = JSON.parse(body);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw error('Ungültige Veröffentlichungsdaten.');
  const id = validateWeddingId(input.id);
  if (id === 'neue-hochzeit') throw error('Bitte zuerst einen eigenen Kurznamen für die Hochzeitsseite vergeben.');
  if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) throw error('Ungültige Ausgangsversion.');
  return { id, expectedRevision: input.expectedRevision, wedding: validateWedding(input.wedding) };
}
export async function publishWedding(record, config, fetchRef = fetch) {
  if (!config.token) throw error('Der GitHub-Dienst ist noch nicht eingerichtet.', 503);
  const github = createGitHubClient(config, fetchRef);
  const head = (await github.request(`/git/ref/heads/${encodeURIComponent(config.branch)}`)).object.sha;
  const commit = await github.request(`/git/commits/${head}`);
  const dataPath = `${ROOT}/data/${record.id}.json`;
  const existing = decode(await github.readContent(dataPath, head), null);
  const current = existing ? validateWeddingEnvelope(existing) : null;
  if (current && current.id !== record.id) throw error('Die Online-Datei enthält eine andere Hochzeit.', 409);
  if ((current?.revision || 0) !== record.expectedRevision) throw error('Auf GitHub liegt eine andere Fassung. Euer Entwurf bleibt erhalten. Bitte die Online-Fassung laden und Änderungen abgleichen.', 409);
  const registry = decode(await github.readContent(`${ROOT}/registry.json`, head), { schemaVersion: 1, weddings: [] });
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.weddings)) throw error('Das Online-Register ist ungültig.', 502);
  const ids = registry.weddings.map(entry => validateWeddingId(entry.id));
  if (new Set(ids).size !== ids.length) throw error('Das Online-Register enthält doppelte Einträge.', 502);
  const envelope = { schemaVersion: 1, id: record.id, revision: record.expectedRevision + 1, updatedAt: new Date().toISOString(), wedding: record.wedding };
  const entries = new Map(registry.weddings.map(entry => [entry.id, entry]));
  entries.set(record.id, weddingRegistryEntry(envelope));
  const files = [
    { path: dataPath, content: JSON.stringify(envelope, null, 2) + '\n' },
    { path: `${ROOT}/registry.json`, content: JSON.stringify({ schemaVersion: 1, weddings: [...entries.values()] }, null, 2) + '\n' }
  ];
  const saved = await commitGitHubFiles(github, { branch: config.branch, head, baseTree: commit.tree.sha, files, message: `Hochzeit aktualisieren: ${record.wedding.title}` });
  return { envelope, commitSha: saved.sha, commitUrl: `https://github.com/${config.repository}/commit/${saved.sha}` };
}
export async function handler(event) {
  try {
    if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { message: 'Methode nicht unterstützt.' });
    const config = repositoryConfig();
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      if (!id) return json(200, { repository: config.repository, branch: config.branch, configured: !!(config.token && config.publishKey) });
      validateWeddingId(id);
      if (!config.token) return json(503, { message: 'Der GitHub-Dienst ist noch nicht eingerichtet.' });
      const result = decode(await createGitHubClient(config).readContent(`${ROOT}/data/${id}.json`, config.branch), null);
      return result ? json(200, validateWeddingEnvelope(result)) : json(404, { message: 'Diese Hochzeit wurde noch nicht veröffentlicht.' });
    }
    if (!config.publishKey || !secureEqual(bearerToken(event.headers), config.publishKey)) return json(401, { message: 'Der Veröffentlichungsschlüssel fehlt oder ist ungültig.' });
    const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    if (Buffer.byteLength(body, 'utf8') > WEDDING_MAX_BYTES) return json(413, { message: 'Die Hochzeitsdaten sind zu groß.' });
    return json(200, await publishWedding(parseWeddingPublication(body), config));
  } catch (failure) {
    const status = failure instanceof SyntaxError ? 400 : failure.status === 422 ? 409 : failure.status || 500;
    return json(status, { code: status === 409 ? 'revision-conflict' : 'publication-failed', message: status === 409 && failure.status === 422 ? 'Der GitHub-Stand wurde inzwischen verändert. Der Entwurf bleibt erhalten. Bitte erneut abgleichen.' : failure.message });
  }
}
