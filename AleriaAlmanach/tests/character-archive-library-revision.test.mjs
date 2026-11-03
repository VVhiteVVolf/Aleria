import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCharacterArchiveEntry as entry } from '../modules/character-archive/character-archive-model.js';
import { reconcileCharacterArchiveLibraryEntries as reconcile } from '../modules/character-archive/character-archive-library-revision.js';

const librarySource = { kind: 'character-library', id: 'teulu', name: 'Öffentliche Testfigur' };
const automatic = (id, extras = {}) => entry({ kind: 'ability', name: id, builtin: true,
  sources: [librarySource], data: { id, description: 'Alte Wirkung' }, ...extras });
const current = automatic('current-ability', { name: 'Aktuelle Fähigkeit', description: 'Aktuelle Wirkung',
  icon: '/current.png', data: { id: 'current-ability', description: 'Aktuelle Wirkung', duration: '1 Beitrag', mechanics: { damageBonus: 1 } } });
const snapshot = { entries: [current], libraryRevision: 'confirmed-current-fixture' };

test('versioned library reconciliation retires automatic rows and refreshes current rules without changing its inputs', () => {
  const historical = automatic('removed-ability', { createdAt: '2020-01-01', updatedAt: '2020-01-02' });
  const retained = automatic('current-ability', { createdAt: '2020-01-01', updatedAt: '2020-01-02',
    sources: [librarySource, { kind: 'character', id: 'public-fixture', name: 'Öffentliche Testfigur' }] });
  const source = [historical, retained], before = structuredClone(source);
  const result = reconcile(source, snapshot);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, current.name);
  assert.deepEqual(result[0].data, current.data);
  assert.equal(result[0].icon, current.icon);
  assert.equal(result[0].createdAt, retained.createdAt);
  assert.ok(result[0].sources.some(source => source.id === 'public-fixture'));
  assert.deepEqual(source, before);
  assert.deepEqual(reconcile(result, snapshot), result);
});

test('explicit archive edits, manual artwork and ambiguous user-owned rows survive a retired library source', () => {
  const protectedEntries = [
    automatic('custom-record', { builtin: false, updatedAt: '2026-11-03' }),
    automatic('manual-icon-version', { iconAssignmentVersion: 1, icon: '/manual.png' }),
    automatic('manual-icon-override', { iconOverride: '/manual-override.png' }),
    automatic('detached-record', { id: 'custom--detached-record' }),
    entry({ kind: 'ability', name: 'Aus einem Bogen archiviert', archivedFromProfile: true,
      data: { id: 'personal-only' }, sources: [{ kind: 'character', id: 'public-fixture', name: 'Öffentliche Testfigur' }] })
  ];
  assert.deepEqual(reconcile(protectedEntries, snapshot), protectedEntries);
  assert.deepEqual(reconcile(protectedEntries, { entries: [], libraryRevision: 'confirmed-empty-source' }), protectedEntries);
});

test('offline or legacy unversioned source loading cannot retire cached entries', () => {
  const cached = [automatic('removed-ability')];
  assert.deepEqual(reconcile(cached, { entries: [] }), cached);
  assert.deepEqual(reconcile(cached, { entries: [], libraryRevision: '' }), cached);
});

test('archive bootstrap and later backend snapshots reconcile automatic local copies without backend writes', async () => {
  const savedGlobals = new Map(['localStorage', '_fb', 'fetch', 'document', 'CustomEvent'].map(key => [key, globalThis[key]]));
  const oldAutomatic = automatic('removed-ability');
  const custom = automatic('custom-record', { builtin: false, iconAssignmentVersion: 1, updatedAt: '2026-11-03', icon: '/custom.png' });
  const cache = new Map([['aleria-character-archive-v1', JSON.stringify([oldAutomatic, custom])]]);
  let subscription, backendWrites = 0;
  globalThis.localStorage = { getItem: key => cache.get(key), setItem: (key, value) => cache.set(key, value) };
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ sourceRevision: 'store-fixture', byClass: {} }) });
  globalThis.document = { dispatchEvent() {} };
  globalThis.CustomEvent ||= class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis._fb = {
    loadCharacterArchiveEntries: async () => [oldAutomatic, custom],
    subscribeCharacterArchiveEntries(callback) { subscription = callback; return () => {}; },
    async saveCharacterArchiveEntries() { backendWrites++; }
  };
  try {
    const store = await import('../modules/character-archive/character-archive-store.js?library-cache-regression');
    const loaded = await store.ensureCharacterArchiveLoaded();
    assert.ok(!loaded.some(value => value.data.id === 'removed-ability'));
    assert.ok(loaded.some(value => value.data.id === 'custom-record' && value.icon === '/custom.png'));
    assert.ok(!JSON.parse(cache.get('aleria-character-archive-v1')).some(value => value.data.id === 'removed-ability'));
    subscription([oldAutomatic, custom]);
    assert.ok(!store.getCharacterArchiveEntries().some(value => value.data.id === 'removed-ability'));
    assert.ok(!JSON.parse(cache.get('aleria-character-archive-v1')).some(value => value.data.id === 'removed-ability'));
    assert.equal(backendWrites, 0);
  } finally {
    for (const [key, value] of savedGlobals) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
