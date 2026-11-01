// Local diagnostic bridge only. No production credentials or remote project.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') {
  throw Error('This diagnostic requires FIRESTORE_EMULATOR_HOST exactly 127.0.0.1:8187.');
}
const projectId = 'demo-aleria-group-ui', groupId = 'gawain-duncan';
const host = '127.0.0.1', port = 8879;
const allowedOrigins = new Set(['http://127.0.0.1:8765', 'http://localhost:8765']);
const require = createRequire(new URL('../../firebase/functions/package.json', import.meta.url));
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp({ projectId }, 'local-group-ui-only');
const db = getFirestore(app);
const { commitGroupInventoryOperation } = await import('../../firebase/functions/src/groups/commit-group-inventory.js');
const { STANDARD_ITEMS, STANDARD_VERSION } = await import('../../firebase/functions/src/generated/item-register/item-register-standard.js');
const { itemDefinitionRegistry } = await import('../../firebase/functions/src/generated/item-definitions/item-definition-registry.js');
const { getBuiltinCreatureTemplates } = await import('../../AleriaAlmanach/modules/creatures/creature-catalog.js');
const auth = { uid: 'local-group-ui-moderator', token: { aleriaRole: 'moderator' } };
const characterNames = ['Gawain Draig', 'Duncan Gafyr', 'Ylva Wolfshorn'];
const creatureNames = ['Freki', 'Tanor', 'Carreg'];
// Read public sources immediately before seeding. No private dossier imports.
const { entry } = JSON.parse(await readFile(new URL('../../AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json', import.meta.url), 'utf8'));
if (entry?.id !== groupId) throw Error('Unexpected diagnostic group source.');
const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const characters = snapshot.characters.filter(record => characterNames.includes(record.name));
const creatures = getBuiltinCreatureTemplates().filter(record => creatureNames.includes(record.name));
if (characters.length !== 3 || creatures.length !== 3) throw Error('The fixed public diagnostic actors are incomplete.');
const recordIds = { characters: new Set(characters.map(record => record.id)), creatures: new Set(creatures.map(record => record.id)) };
const moduleRef = db.doc(`module_store_entries/${groupId}`), accountRef = db.doc(`group_quest_accounts/${groupId}`);
await moduleRef.set({ entryJson: JSON.stringify(entry) });
for (const [kind, rows] of [['characters', characters], ['creatures', creatures]]) for (const row of rows) {
  const reference = db.doc(`${kind}/${row.id}`);
  if (!(await reference.get()).exists) await reference.create(row);
}
if (!(await accountRef.get()).exists) await accountRef.create({ id: groupId, name: entry.title, schemaVersion: 1,
  revision: 1, inventory: { revision: 1, items: [], moneyState: { totalCopper: 50 } } });
const grants = [['standard:gemischtwarenhandler:rationen', 6], ['standard:waffen-rustungen:stahlschwert', 1], ['standard:alchemist:heiltrank', 2]];
for (const [index, [productId, quantity]] of grants.entries()) {
  const product = STANDARD_ITEMS.find(item => item.id === productId);
  if (!product?.definitionRef) throw Error(`Missing standard diagnostic product: ${productId}`);
  await commitGroupInventoryOperation(db, auth, { operationId: `ui-seed-${index + 1}`, groupId, action: 'grant',
    product: { definitionRef: product.definitionRef }, quantity, expectedGroupRevision: index + 1 });
}

const send = (response, status, value) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    ...(response.diagnosticOrigin ? { 'Access-Control-Allow-Origin': response.diagnosticOrigin } : {}),
    Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type' });
  response.end(JSON.stringify(value));
};
const records = async kind => Promise.all([...recordIds[kind]].map(async id => ({ ...(await db.doc(`${kind}/${id}`).get()).data(), id })));
async function body(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 30000) throw Object.assign(Error('Diagnostic payload too large.'), { code: 'invalid-argument' });
  }
  try { return JSON.parse(raw); } catch { throw Object.assign(Error('Invalid JSON.'), { code: 'invalid-argument' }); }
}
const server = createServer(async (request, response) => {
  if (request.headers.origin && !allowedOrigins.has(request.headers.origin)) return send(response, 403, { error: { code: 'permission-denied', message: 'Local diagnostic origin only.' } });
  response.diagnosticOrigin = request.headers.origin || '';
  if (request.method === 'OPTIONS') return send(response, 200, { ok: true });
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (request.method === 'GET' && url.pathname === '/state') return send(response, 200, {
      groupId, account: (await accountRef.get()).data(), characters: await records('characters'), creatures: await records('creatures'), standardVersion: STANDARD_VERSION
    });
    if (request.method === 'GET' && url.pathname === '/record') {
      const kind = url.searchParams.get('kind'), id = url.searchParams.get('id');
      if (!recordIds[kind]?.has(id)) return send(response, 404, { error: { code: 'not-found', message: 'Not a fixed diagnostic actor.' } });
      return send(response, 200, (await db.doc(`${kind}/${id}`).get()).data());
    }
    if (request.method === 'GET' && url.pathname === '/definition') {
      const definition = itemDefinitionRegistry.get({ id: url.searchParams.get('id'), revision: url.searchParams.get('revision') });
      return send(response, definition ? 200 : 404, definition || { error: { code: 'not-found', message: 'Unknown standard item revision.' } });
    }
    if (request.method === 'POST' && url.pathname === '/commit') {
      const input = await body(request);
      if (input.groupId !== groupId) return send(response, 403, { error: { code: 'permission-denied', message: 'Only the fixed diagnostic group is allowed.' } });
      if (input.member && !recordIds[input.member.kind === 'character' ? 'characters' : input.member.kind === 'creature' ? 'creatures' : '']?.has(input.member.recordId)) {
        return send(response, 403, { error: { code: 'permission-denied', message: 'Only fixed diagnostic members are allowed.' } });
      }
      return send(response, 200, await commitGroupInventoryOperation(db, auth, input));
    }
    return send(response, 404, { error: { code: 'not-found', message: 'Unknown diagnostic route.' } });
  } catch (error) {
    const status = { 'invalid-argument': 400, 'not-found': 404, 'permission-denied': 403, aborted: 409, 'already-exists': 409 }[error.code] || 412;
    return send(response, status, { error: { code: error.code || 'failed-precondition', message: error.message } });
  }
});
server.listen(port, host, () => console.log(`Diagnostic group UI ready: http://${host}:${port}; project=${projectId}; actors=3+3; products=3.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(async () => { await db.terminate(); process.exit(0); });
});
