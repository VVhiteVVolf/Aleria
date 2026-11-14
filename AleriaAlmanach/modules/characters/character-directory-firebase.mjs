// Read-only, field-masked register pages. Full character documents remain owned
// by the existing SDK gateway; these projections must never become save data.
export const CHARACTER_DIRECTORY_FIELDS = Object.freeze([
  'name', 'title', 'portrait', 'aliases', 'fraktion', 'faction', 'role', 'status',
  'relevance', 'taxonomyPath', 'currentLocation', 'origin', 'plotNode', 'playerOwner', 'birth', 'birthYear',
  'playedBy', 'player', 'archived', 'createdAt', 'updatedAt', 'identity', 'mergeIdentity',
  'genealogy.worldPersonId', 'genealogy.houseId', 'genealogy.houseName',
  'genealogy.birth', 'genealogy.death', 'genealogy.sources', 'localRecord.firestoreDocumentIds'
]);

function decodeValue(value) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields);
  return undefined;
}

function decodeFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

export function createCharacterDirectoryReader({ projectId, getIdToken, fetch: read = globalThis.fetch }) {
  const root = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/characters`;
  return async function loadCharacterDirectoryPage({ pageToken = '', signal } = {}) {
    const url = new URL(root);
    url.searchParams.set('pageSize', '200');
    CHARACTER_DIRECTORY_FIELDS.forEach(field => url.searchParams.append('mask.fieldPaths', field));
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await read(url, { method: 'GET', cache: 'no-store', signal: signal || AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${await getIdToken()}` } });
    if (!response.ok) throw new Error('Das Figurenverzeichnis konnte nicht geladen werden. Bitte erneut versuchen.');
    const payload = await response.json();
    if (payload.error || (payload.documents && !Array.isArray(payload.documents))) {
      throw new Error('Das Figurenverzeichnis enthält keine lesbare Antwort.');
    }
    return { records: (payload.documents || []).map(document => ({
      ...decodeFields(document.fields), id: document.name.split('/').at(-1), _directorySummary: true
    })), nextPageToken: String(payload.nextPageToken || '') };
  };
}
