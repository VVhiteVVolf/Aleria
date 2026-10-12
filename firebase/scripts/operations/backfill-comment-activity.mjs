// Only derived activity is written. Preconditions protect newer trigger updates.
import { createRequire } from 'node:module';
import { buildCommentThreadActivity } from '../../../AleriaAlmanach/modules/comments/comment-activity-preview.js';
import { activityDocumentId, COMMENT_ACTIVITY_FIELDS, compareActivityReadTimes } from '../../functions/src/comments/comment-activity-index.js';
import { createGoogleBackupReader } from '../backup/project-backup-source.mjs';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
const require = createRequire(new URL('../../package.json', import.meta.url));
const cliAuth = require('firebase-tools/lib/auth.js');
const account = cliAuth.getProjectDefaultAccount(process.cwd());
const access = await cliAuth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const { request } = createGoogleBackupReader({ accessToken: access.access_token, project: 'aleriaprojekt' });
const root = 'https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents';
const headers = { Authorization: `Bearer ${access.access_token}`, 'x-goog-user-project': 'aleriaprojekt', 'Content-Type': 'application/json' };
function encode(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: fields(value) } };
}
const fields = value => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
async function query(collectionId, names, threadId) {
  return request(`${root}:runQuery`, { structuredQuery: { from: [{ collectionId }], select: { fields: names.map(fieldPath => ({ fieldPath })) }, ...(threadId ? { where: { fieldFilter: { field: { fieldPath: 'entryId' }, op: 'EQUAL', value: { stringValue: threadId } } } } : {}) } });
}
const comments = await query('comments', ['entryId']);
const existing = await query('comment_activity', ['threadId']);
const threads = [...new Set([...comments, ...existing].filter(row => row.document).map(row => { const data = decodeFirestoreFields(row.document.fields); return data.entryId || data.threadId; }).filter(Boolean))];
if (process.argv.includes('--apply')) {
  for (const thread of threads) {
    let written = false;
    for (let attempt = 0; attempt < 4 && !written; attempt++) {
      const rows = await query('comments', COMMENT_ACTIVITY_FIELDS, thread);
      const capturedAt = rows.at(-1).readTime;
      const summary = buildCommentThreadActivity(thread, rows.filter(row => row.document).map(row => ({ ...decodeFirestoreFields(row.document.fields || {}), id: row.document.name.split('/').at(-1) })));
      const url = `${root}/comment_activity/${activityDocumentId(thread)}`;
      const currentResponse = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
      if (!currentResponse.ok && currentResponse.status !== 404) throw new Error(`Activity read HTTP ${currentResponse.status}`);
      const current = currentResponse.ok ? await currentResponse.json() : null;
      if (current?.fields?.capturedAt && compareActivityReadTimes(decodeFirestoreFields({ time: current.fields.capturedAt }).time, decodeFirestoreFields({ time: { timestampValue: capturedAt } }).time) >= 0) { written = true; break; }
      const response = await fetch(`${root}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes: [{ update: { name: url.split('/v1/')[1], fields: { ...fields(summary), capturedAt: { timestampValue: capturedAt } } }, currentDocument: current ? { updateTime: current.updateTime } : { exists: false } }] }), signal: AbortSignal.timeout(30000) });
      if (response.ok) written = true;
      else if (![409, 412].includes(response.status)) throw new Error(`Activity write HTTP ${response.status}`);
    }
    if (!written) throw new Error('Gleichzeitige Aktualisierung. Bitte erneut initialisieren.');
  }
  await request(`${root}:commit`, { writes: [{ update: { name: `${root}/comment_activity_meta/state`.split('/v1/')[1], fields: { ...fields({ ready: true, version: 1, threadCount: threads.length }), initializedAt: { timestampValue: new Date().toISOString() } } } }] });
}
console.log(JSON.stringify({ applied: process.argv.includes('--apply'), threads: threads.length, comments: comments.filter(row => row.document).length, liveDocumentsWritten: 0 }));
