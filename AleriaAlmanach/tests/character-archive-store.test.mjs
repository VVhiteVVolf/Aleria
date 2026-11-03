import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { matchesArchiveSource } from '../modules/character-archive/character-archive-query.js';

let storeNumber = 0;
async function withStore(run, { remoteEntries = [], localEntries = [] } = {}) {
  const globals = new Map(['localStorage', '_fb', 'fetch', 'document', 'CustomEvent'].map(key => [key, globalThis[key]]));
  const local = new Map(), writes = [];
  if (localEntries.length) local.set('aleria-character-archive-v1', JSON.stringify(localEntries));
  let remote = structuredClone(remoteEntries);
  const subscribers = new Set();
  globalThis.localStorage = { getItem: key => local.get(key), setItem: (key, value) => local.set(key, value) };
  globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) });
  globalThis.document = { dispatchEvent() {} };
  globalThis.CustomEvent ||= class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis._fb = {
    loadCharacterArchiveEntries: async () => structuredClone(remote),
    saveCharacterArchiveEntries: async entries => {
      writes.push(structuredClone(entries));
      const rows = new Map(remote.map(entry => [entry.id, entry]));
      entries.forEach(entry => rows.set(entry.id, structuredClone(entry)));
      remote = [...rows.values()];
    },
    subscribeCharacterArchiveEntries(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
  };
  const reload = async () => {
    const store = await import(`../modules/character-archive/character-archive-store.js?store-test-${++storeNumber}`);
    await store.ensureCharacterArchiveLoaded();
    return store;
  };
  try {
    const store = await reload();
    await run(store, writes, local, { reload, snapshot(entries) {
      remote = structuredClone(entries);
      subscribers.forEach(callback => callback(structuredClone(entries)));
    } });
  } finally {
    for (const [key, value] of globals) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
}

const catalogSpell = store => store.getCharacterArchiveEntries().find(entry => entry.kind === 'spell'
  && entry.data.catalogReference && entry.data.upcast?.enabled);
const record = abilities => ({ id: 'public-archive-test', name: 'Öffentliche Archivtestfigur',
  combatProfile: { progression: { level: 1, development: { mode: 'purchase' } }, abilities, techniques: [], quirks: [], weapons: [] } });

test('live profile refresh reads source rules without persisting archive copies or touching the source', async () => {
  await withStore(async (store, writes) => {
    const character = record([{ id: 'live-ability', name: 'Persönliche Testhaltung', description: '+1 RK.', mechanics: { armorClass: 1 } }]);
    const before = structuredClone(character);
    store.setCharacterArchiveLiveRecords([character], []);
    store.setCharacterArchiveLiveRecords([character], []);
    assert.ok(store.getCharacterArchiveEntries().some(entry => entry.name === 'Persönliche Testhaltung'));
    assert.equal(writes.length, 0);
    assert.deepEqual(character, before);
  });
});

test('icon-only catalog edits and explicit icon clearing retain the exact catalog rules and higher forms', async () => {
  await withStore(async (store, writes) => {
    const original = catalogSpell(store);
    assert.ok(original);
    const before = structuredClone(original);
    const edited = await store.saveCharacterArchiveEntry({ ...original, icon: '/my-spell.png', iconOverride: '/my-spell.png',
      data: { ...original.data, icon: '/my-spell.png' } });
    assert.equal(edited.id, original.id);
    assert.deepEqual(edited.data.catalogReference, original.data.catalogReference);
    assert.deepEqual(edited.data.upcast, original.data.upcast);
    assert.deepEqual(edited.data.effects, original.data.effects);
    assert.deepEqual(edited.data.costs, original.data.costs);
    assert.equal(edited.icon, '/my-spell.png');
    assert.equal(edited.data.userAuthored, true);
    assert.equal(matchesArchiveSource(edited, 'custom'), true);
    const cleared = await store.saveCharacterArchiveEntry({ ...edited, icon: '', iconOverride: '',
      data: { ...edited.data, icon: '' } });
    assert.deepEqual(cleared.data.catalogReference, original.data.catalogReference);
    assert.deepEqual(cleared.data.upcast, original.data.upcast);
    assert.equal(cleared.icon, '');
    assert.equal(cleared.iconAssignmentVersion, 1);
    assert.equal(writes.length, 2);
    assert.deepEqual(original, before);
  });
});

test('a genuine catalog rule edit detaches only the edited version and keeps its supplied rules', async () => {
  await withStore(async (store, writes) => {
    const original = catalogSpell(store), before = structuredClone(original);
    const edited = await store.saveCharacterArchiveEntry({ ...original,
      description: `${original.description} Eigene Regel: zusätzlicher Schaden.`,
      data: { ...original.data, description: `${original.data.description} Eigene Regel: zusätzlicher Schaden.`, rollFormula: '9d6' } });
    assert.match(edited.id, /^custom--/);
    assert.equal(edited.data.catalogReference, undefined);
    assert.deepEqual(edited.data.catalogOrigin, original.data.catalogReference);
    assert.equal(edited.data.upcast.enabled, false);
    assert.equal(edited.data.rollFormula, '9d6');
    assert.equal(writes.length, 1);
    assert.deepEqual(original, before);
  });
});

test('explicit archival still persists a new profile rule once, even if the live view already shows it', async () => {
  await withStore(async (store, writes) => {
    const character = record([{ id: 'manual-ability', name: 'Bewusst archivierte Testhaltung', description: '+2 RK.', mechanics: { armorClass: 2 } }]);
    const before = structuredClone(character);
    store.setCharacterArchiveLiveRecords([character], []);
    const archived = await store.archiveCharacterRecord(character);
    const own = archived.find(entry => entry.name === 'Bewusst archivierte Testhaltung');
    assert.ok(own);
    assert.equal(own.data.userAuthored, true);
    assert.equal(matchesArchiveSource(own, 'custom'), true);
    assert.equal(writes.length, 1);
    assert.deepEqual(await store.archiveCharacterRecord(character), []);
    assert.equal(writes.length, 1, 'Repeated explicit archival never grows equivalent documents');
    assert.deepEqual(character, before);
  });
});

test('explicit archival recognizes a legacy UUID copy of an existing shared ability by its actual rules', async () => {
  await withStore(async (store, writes) => {
    const known = store.getCharacterArchiveEntries().find(entry => entry.kind === 'ability' && entry.name === 'Tierbegleiter');
    assert.ok(known);
    const data = { ...structuredClone(known.data), id: '550e8400-e29b-41d4-a716-446655440000' };
    delete data.catalogAbilityId;
    delete data.sourceAbilityId;
    const character = record([data]);
    const archived = await store.archiveCharacterRecord(character);
    assert.ok(!archived.some(entry => entry.name === known.name));
    assert.equal(writes.length, 0);
  });
});

test('editing the same saved automatic document replaces its old rules once and survives stale snapshots and repeated reloads', async () => {
  const old = { id: 'saved-automatic-document', kind: 'ability', name: 'Gespeicherte Snapshot-Testhaltung',
    builtin: false, archivedFromProfile: true, createdAt: '2020-01-01', updatedAt: '2020-01-02',
    data: { id: 'source-snapshot-ability', name: 'Gespeicherte Snapshot-Testhaltung', mechanics: { armorClass: 1 } },
    sources: [{ kind: 'character', id: 'public-fixture', name: 'Öffentliche Testfigur' }] };
  const unrelated = { ...old, id: 'unrelated-document', name: 'Unveränderte andere Fähigkeit',
    data: { id: 'unrelated-source', mechanics: { armorClass: 7 } } };
  await withStore(async (store, writes, local, controls) => {
    const edited = await store.saveCharacterArchiveEntry({ ...old, data: { ...old.data, mechanics: { armorClass: 3 } } });
    assert.equal(edited.id, old.id);
    assert.equal(edited.archivedFromProfile, true, 'Legacy origin stays recorded');
    const assertCurrent = (view, expected) => {
      const rows = view.getCharacterArchiveEntries().filter(entry => entry.name === old.name);
      assert.equal(rows.length, 1, 'One actual document is never retained as two semantic versions');
      assert.equal(rows[0].data.mechanics.armorClass, expected);
      assert.equal(view.getCharacterArchiveEntries().find(entry => entry.name === unrelated.name).data.mechanics.armorClass, 7);
    };
    assertCurrent(store, 3);
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0].map(entry => entry.id), [old.id], 'The saved document ID is not rewritten');
    controls.snapshot([old, unrelated]);
    assertCurrent(store, 3);
    assertCurrent(await controls.reload(), 3);
    assertCurrent(await controls.reload(), 3);
    const cached = JSON.parse(local.get('aleria-character-archive-v1')).filter(entry => entry.id === old.id);
    assert.equal(cached.length, 1);
    assert.equal(cached[0].data.mechanics.armorClass, 3);
    const newerRemote = { ...edited, updatedAt: '2099-01-01', data: { ...edited.data, mechanics: { armorClass: 4 } } };
    controls.snapshot([newerRemote, unrelated]);
    assertCurrent(store, 4);
    assertCurrent(await controls.reload(), 4);
    assert.equal(writes.length, 1, 'Snapshot reconciliation performs no backend writes or deletes');
  }, { remoteEntries: [old, unrelated] });
});

test('bootstrap compares actual creation/update times per saved ID and keeps a newer unsynchronized local draft', async () => {
  const remote = { id: 'same-draft-document', kind: 'ability', name: 'Lokaler Snapshot-Test', builtin: false,
    archivedFromProfile: true, createdAt: '2020-01-01', updatedAt: '2021-01-01',
    data: { id: 'same-source', mechanics: { armorClass: 1 } } };
  const local = { ...remote, createdAt: '2022-01-01', updatedAt: '', data: { ...remote.data, mechanics: { armorClass: 2 } } };
  await withStore(async (store, writes) => {
    const rows = store.getCharacterArchiveEntries().filter(entry => entry.name === remote.name);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].data.mechanics.armorClass, 2);
    assert.equal(writes.length, 0);
  }, { remoteEntries: [remote], localEntries: [local] });
});
