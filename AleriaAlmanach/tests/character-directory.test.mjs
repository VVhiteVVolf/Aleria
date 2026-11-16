import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createCharacterDirectoryReader, CHARACTER_DIRECTORY_FIELDS } from '../modules/characters/character-directory-firebase.mjs';
import { createLocalCharacterDirectory } from '../modules/characters/character-directory-local.mjs';

test('directory requests mask heavy fields, carry the session token and follow the exact server cursor', async () => {
  const calls = [];
  const read = createCharacterDirectoryReader({ projectId: 'fixture', getIdToken: async () => 'fixture-token',
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ documents: [{
      name: 'projects/fixture/databases/(default)/documents/characters/real-id',
      fields: { name: { stringValue: 'Éowen' }, archived: { booleanValue: false },
        genealogy: { mapValue: { fields: { houseName: { stringValue: 'Draig' } } } },
        aliases: { arrayValue: { values: [{ stringValue: 'Eo' }] } }, updatedAt: { timestampValue: '2026-11-13T10:00:00Z' } }
    }], nextPageToken: 'opaque/+cursor' }) }; } });
  const result = await read({ pageToken: 'opaque/+previous' });
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer fixture-token');
  assert.equal(calls[0].url.searchParams.get('pageSize'), '200');
  assert.equal(calls[0].url.searchParams.get('pageToken'), 'opaque/+previous');
  assert.deepEqual(calls[0].url.searchParams.getAll('mask.fieldPaths'), [...CHARACTER_DIRECTORY_FIELDS]);
  for (const heavy of ['inventory', 'combatProfile', 'imageSets', 'emotes', 'biography', 'bio']) assert.ok(!CHARACTER_DIRECTORY_FIELDS.includes(heavy));
  assert.deepEqual(result.records[0], { id: 'real-id', name: 'Éowen', archived: false,
    aliases: ['Eo'], genealogy: { houseName: 'Draig' }, updatedAt: '2026-11-13T10:00:00Z', _directorySummary: true });
  assert.equal(result.nextPageToken, 'opaque/+cursor');
});

function harness(backend) {
  const events = new Map();
  const context = vm.createContext({ console, setTimeout, clearTimeout, queueMicrotask,
    window: { _fb: backend }, document: { addEventListener: (type, handler) => events.set(type, handler),
      getElementById: () => null, querySelector: () => null },
    normalizeSearchText: value => String(value || '').toLowerCase(),
    normalizeCharacterPlayerOwner: value => value || '',
    characterWorldIdentitiesConflict: () => false,
    getCharacterWorldIdentity: record => record.identity?.worldPersonId || '',
    loadCharacterTabData: async () => {},
    loadLocalCharacterDirectoryState: async () => ({ loadMissing: async () => {}, loadFull: async () => null }),
    loadCharacters: () => { throw Error('The register must not load the entire character collection'); },
    getAllCharacterRecords: () => context.records,
    getCharacterById: id => context.records.find(record => record.id === id) || null,
    handleExternallySavedCharacter: event => {
      context.records = context.records.filter(record => record.id !== event.detail.record.id).concat(event.detail.record);
      vm.runInContext('_characters = records;', context);
    }, records: [] });
  vm.runInContext('let _characters = records; let _charactersLoaded = false; let _fbReady = true; let _hiddenBuiltinCharacterIds = new Set();', context);
  vm.runInContext(readFileSync(new URL('../modules/characters/character-directory.js', import.meta.url), 'utf8')
    + '\nglobalThis.directory = AleriaCharacterDirectory;', context);
  return { context, directory: context.directory, events };
}

test('paged directory metadata stays separate from complete records and overlapping requests share work', async () => {
  let reads = 0, finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const { directory, context } = harness({ loadCharacterDirectoryPage: async ({ pageToken }) => {
    reads++;
    if (!pageToken) { await pending; return { records: [{ id: 'first', name: 'Ada', _directorySummary: true }], nextPageToken: 'next' }; }
    return { records: [{ id: 'last', name: 'Zita', _directorySummary: true }], nextPageToken: '' };
  } });
  const first = directory.load(), second = directory.load();
  assert.equal(first, second);
  finish(); await first;
  assert.equal(reads, 2);
  assert.equal(directory.getRecords().length, 2);
  assert.equal(directory.getById('last').name, 'Zita');
  assert.equal(context.records.length, 0, 'no summary may enter the editor/scene store');
  await directory.load(); assert.equal(reads, 2);
  assert.equal(directory.isComplete(), true);
});

test('a failed directory read remains incomplete and retry loads every page without duplicating records', async () => {
  let fail = true;
  const { directory } = harness({ loadCharacterDirectoryPage: async ({ pageToken }) => {
    if (pageToken && fail) throw Error('offline');
    return { records: [{ id: pageToken ? 'b' : 'a', _directorySummary: true }], nextPageToken: pageToken ? '' : 'next' };
  } });
  await assert.rejects(directory.load(), /offline/);
  assert.equal(directory.isComplete(), false);
  assert.equal(directory.getRecords().length, 1);
  fail = false; await directory.load();
  assert.equal(directory.getRecords().length, 2);
});

test('only a requested full record is hydrated; partial saves during the read preserve untouched server fields', async () => {
  let finish, reads = 0;
  const pending = new Promise(resolve => { finish = resolve; });
  const { directory, context, events } = harness({ loadCharacterDirectoryPage: async () => ({ records: [{ id: 'a', name: 'Ada', _directorySummary: true }], nextPageToken: '' }),
    loadCharacters: async options => { reads++; assert.deepEqual(Array.from(options.ids), ['a']); assert.equal(options.throwOnError, true); return pending; } });
  await directory.load();
  const first = directory.ensureRecord('a'), second = directory.ensureRecord('a');
  assert.equal(first, second);
  events.get('aleria:character-saved')({ detail: { record: { id: 'a', title: 'New title' } } });
  finish([{ id: 'a', name: 'Ada', title: 'Server title', bio: 'Full prose', inventory: { revision: 7 }, combatProfile: { hp: 1 } }]);
  const full = await first;
  assert.equal(reads, 1);
  assert.equal(full.title, 'New title');
  assert.equal(full.bio, 'Full prose');
  assert.equal(full.inventory.revision, 7);
  assert.equal(full._directorySummary, undefined);
  assert.equal(context.records.length, 1);
  await directory.ensureRecord('a'); assert.equal(reads, 1);
});

test('missing full records reject instead of opening an empty editable profile and can be retried', async () => {
  let found = false;
  const { directory } = harness({ loadCharacters: async () => found ? [{ id: 'a', name: 'Ada' }] : [] });
  await assert.rejects(directory.ensureRecord('a'), /nicht mehr vorhanden/);
  found = true; assert.equal((await directory.ensureRecord('a')).name, 'Ada');
});

test('concurrent canonical reads join a pending main record and retain its complete fields', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const { directory } = harness({ loadCharacters: async ({ ids }) => ids[0] === 'main' ? pending : [{ id: 'old',
    mergeIdentity: { status: 'merged', canonicalCharacterId: 'main', canonicalWorldPersonId: 'world-main' } }] });
  const main = directory.ensureRecord('main'), old = directory.ensureRecord('old');
  await new Promise(resolve => setImmediate(resolve));
  finish([{ id: 'main', name: 'Ada', identity: { worldPersonId: 'world-main' }, inventory: { revision: 17 } }]);
  assert.equal((await old).inventory.revision, 17);
  assert.equal((await main).id, 'main');
});

test('cyclic canonical records fail without a deadlock or an editable empty record', async () => {
  const { directory, context } = harness({ loadCharacters: async ({ ids }) => [{ id: ids[0],
    mergeIdentity: { status: 'merged', canonicalCharacterId: ids[0] === 'a' ? 'b' : 'a' } }] });
  const results = await Promise.allSettled([directory.ensureRecord('a'), directory.ensureRecord('b')]);
  assert.ok(results.every(result => result.status === 'rejected' && /kreisförmig/.test(result.reason.message)));
  assert.equal(context.records.length, 0);
});

test('a directory-only record can be removed without reappearing from its summary', async () => {
  const { directory } = harness({ loadCharacterDirectoryPage: async () => ({ records: [{ id: 'a', _directorySummary: true }], nextPageToken: '' }) });
  await directory.load(); assert.equal(directory.getRecords().length, 1);
  directory.remove('a'); assert.equal(directory.getRecords().length, 0);
});

test('the existing local index supplements online metadata and reads only missing local character files', async () => {
  const calls = [], summaries = [];
  const registry = { schema: 'aleria.character-registry', records: [
    { recordId: 'known', firestoreDocumentId: 'old-alias', firestoreDocumentIds: ['online-id'], worldPersonId: 'world-known', aliases: ['Alias'], primary: { kind: 'family', label: 'House A' } },
    { recordId: 'local', firestoreDocumentId: 'local-id', firestoreDocumentIds: ['local-id'], path: 'records/familien/house-a/local/character.json' }
  ] };
  const local = { schema: 'aleria.character-record', recordId: 'local', character: { id: 'local-id', name: 'Local only',
    archived: true, bio: 'Full local biography', imageSets: [{ id: 'original' }], inventory: { revision: 9 }, genealogy: { houseName: 'House A' } } };
  const repository = createLocalCharacterDirectory({ fetch: async url => {
    calls.push(url.pathname); return { ok: true, json: async () => url.pathname.endsWith('registry.json') ? registry : local };
  } });
  await repository.loadMissing([{ id: 'online-id', name: 'Current name' }], record => summaries.push(record));
  assert.equal(calls.length, 2);
  assert.ok(!calls.some(path => path.includes('characters.snapshot')));
  assert.equal(summaries.find(record => record.id === 'online-id').genealogy.houseName, 'House A');
  const projected = summaries.find(record => record.id === 'local-id');
  assert.equal(projected.archived, true);
  for (const heavy of ['inventory', 'bio', 'imageSets']) assert.equal(projected[heavy], undefined);
  assert.equal(repository.getFull('local-id').inventory.revision, 9);
  assert.equal(registry.records[0].name, undefined, 'source index is not modified');
});

test('an online avatar override still hydrates its complete local profile on demand', async () => {
  const calls = [];
  const registry = { schema: 'aleria.character-registry', records: [{
    recordId: 'local-person', firestoreDocumentId: 'person-local', firestoreDocumentIds: ['person-local'],
    worldPersonId: 'world-local', path: 'records/familien/test/local/character.json'
  }] };
  const local = { schema: 'aleria.character-record', recordId: 'local-person', character: {
    id: 'person-local', name: 'Local person', bio: 'Complete biography',
    inventory: { revision: 7, items: [{ id: 'existing-item' }] },
    combatProfile: { revision: 9, hitPoints: { current: 3 } }, identity: { worldPersonId: 'world-local' }
  } };
  const repository = createLocalCharacterDirectory({ fetch: async url => {
    calls.push(url.pathname);
    return { ok: true, json: async () => url.pathname.endsWith('registry.json') ? registry : local };
  } });
  const online = { id: 'online-alias', name: 'Local person', identity: { worldPersonId: 'world-local' }, portrait: '/new.png' };
  await repository.loadMissing([online]);
  assert.equal(calls.length, 1, 'a matching register summary needs no full profile read');
  const complete = await repository.loadFull('online-alias');
  const merged = await repository.mergeRecord(online, complete);
  assert.equal(calls.length, 2);
  assert.equal(merged.id, 'online-alias');
  assert.equal(merged.portrait, '/new.png');
  assert.equal(merged.bio, 'Complete biography');
  assert.equal(merged.inventory.revision, 7);
  assert.equal(merged.combatProfile.hitPoints.current, 3);
  await repository.loadFull('online-alias');
  assert.equal(calls.length, 2, 'the full local record is reused');
});
