import { fingerprintBeforeMathgham } from './mathgham-invariants.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { BLAITHNEACH_SOURCE_FAMILIES } from '../assets/js/data/blaithneach-source-families.js';
import { BLAITHNEACH_SOURCE_CATALOG as catalog } from '../assets/js/data/blaithneach-source-catalog.js';
import { BLAITHNEACH_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/blaithneach-source-counter-patches.js';
import { withBlaithneachSourceCounterUpgrade } from '../assets/js/data/blaithneach-source-counter-upgrade.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const audit = read('assets/data/source-inventories/blaithneach-families-audit-2026-10-08.json');
const inventory = read(catalog.inventory);
const counts = { ronain: 87, nessa: 79, magach: 81, suiste: 53, gairner: 44, goidin: 39, eala: 48, haeghra: 59, cleirigh: 69 };
const id = ref => audit.sourceToPerson[ref];
const family = slug => getRegisteredFamily('haus-' + slug).family;
const person = ref => family(ref.split(':')[0]).persons.find(p => p.id === id(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(p => p.childId === id(ref));

test('559 supplied cards resolve to nine connected families and 465 stable identities', () => {
  assert.equal(audit.sourceCards.length, 559);
  assert.equal(Object.keys(audit.sourceToPerson).length, 559);
  assert.equal(Object.keys(catalog.persons).length, 465);
  for (const [slug, count] of Object.entries(counts)) {
    const f = normalizeFamily(family(slug));
    assertValidFamily(f);
    assert.equal(f.persons.length, count, slug);
    assert.equal(new Set(f.persons.map(p => p.worldPersonId)).size, count, slug);
    assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, [], slug);
    assert.deepEqual(toFamilyChartData(f).diagnostics.filter(d => d.severity !== 'info'), [], slug);
    const connected = new Set([...f.partnerships.flatMap(p => p.participantIds), ...f.parentages.flatMap(p => [p.childId, ...p.parentIds])]);
    for (const p of f.persons) assert.ok(connected.has(p.id), p.id);
    for (const card of audit.sourceCards.filter(c => c.slug === slug)) assert.ok(f.persons.some(p => p.id === id(card.ref)), card.ref);
    const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = f;
    const result = validateWorkspaceForPublishing({ root: { ...root, familyId: f.document.id }, collections: { persons, houses, partnerships, parentages, cadetBranches, timeJumps } });
    assert.equal(result.valid, true, JSON.stringify(result.diagnostics));
  }
});

test('Dympna belongs to Fergus and Samthann; forced relationships remain separate', () => {
  const link = parentage('magach:193:0');
  assert.equal(link.legitimacy, 'illegitimate');
  assert.deepEqual(new Set(link.parentIds), new Set([id('magach:171:4'), id('magach:180:3')]));
  assert.equal(id('magach:180:3'), id('nessa:168:0'));
  assert.equal(family('magach').partnerships.find(p => p.id === link.partnershipId).type, 'engagement');
  const forced = family('magach').partnerships.find(p => p.type === 'forced');
  assert.ok(forced.participantIds.includes(id('magach:184:0')));
  assert.ok(!family('magach').parentages.some(p => p.partnershipId === forced.id));
  for (const ref of ['nessa:190:0', 'nessa:190:1']) {
    const p = parentage(ref);
    assert.equal(p.legitimacy, 'illegitimate');
    assert.equal(family('nessa').partnerships.find(pair => pair.id === p.partnershipId).type, 'forced');
  }
  assert.equal(person('magach:171:4').status, 'alive');
});

test('cadet founders, genuine generation gaps and foster placements follow the graphics', () => {
  assert.equal(id('gairner:86:0'), id('ronain:137:1'));
  assert.equal(id('gairner:96:0'), id('ronain:147:1'));
  assert.equal(parentage('gairner:96:0').legitimacy, 'illegitimate');
  assert.equal(family('gairner').view.focusPersonId, id('gairner:96:0'));
  assert.equal(id('suiste:86:0'), id('ronain:113:2'));
  assert.equal(id('eala:83:0'), id('ronain:125:2'));
  assert.equal(id('goidin:83:0'), id('nessa:98:1'));
  for (const [slug, child, guardian] of [['ronain','231:2','209:2'],['nessa','186:0','164:0'],['nessa','186:4','164:3'],['magach','189:4','171:0'],['suiste','170:2','160:0'],['haeghra','172:1','154:0']]) {
    const link = family(slug).parentages.find(p => p.childId === id(`${slug}:${child}`) && p.type === 'foster');
    assert.deepEqual(link.parentIds, [id(`${slug}:${guardian}`)]);
    assert.equal(link.partnershipId, '');
  }
  for (const f of BLAITHNEACH_SOURCE_FAMILIES) for (const gap of f.timeJumps) {
    assert.ok(f.parentages.filter(p => p.extensions?.timeJumpId === gap.id).every(p => p.type === 'claimed'));
  }
  assert.deepEqual(new Set(parentage('suiste:160:3').parentIds), new Set([id('suiste:150:0'), id('suiste:155:0')]));
  assert.deepEqual(new Set(parentage('cleirigh:125:3').parentIds), new Set([id('cleirigh:115:4'), id('cleirigh:120:4')]));
  assert.deepEqual(new Set(parentage('eala:115:2').parentIds), new Set([id('eala:105:1'), id('eala:110:0')]));
});

test('shared people and partnerships agree with every existing counterpart', () => {
  const all = FAMILY_REGISTRY.flatMap(r => r.family.persons);
  const pairs = FAMILY_REGISTRY.flatMap(r => r.family.partnerships);
  for (const f of BLAITHNEACH_SOURCE_FAMILIES) {
    for (const p of getRegisteredFamily(f.document.id).family.persons) for (const other of all.filter(o => o.worldPersonId === p.worldPersonId)) {
      for (const field of ['worldPersonId','name','sex','birth','death','status','houseId','portrait','portraitPlaceholder']) assert.equal(other[field], p[field], `${p.id}/${field}`);
    }
    for (const p of f.partnerships) for (const other of pairs.filter(o => o.id === p.id)) {
      assert.deepEqual(other.participantIds, p.participantIds, p.id);
      assert.equal(other.type, p.type, p.id);
    }
  }
  assert.equal(person('magach:175:1').id, 'vencha-mac-magach');
  assert.equal(person('eala:125:3').id, 'alastar-mac-eala');
  assert.equal(person('haeghra:140:0').id, 'donnagh-heaghra');
  assert.equal(person('haeghra:181:0').birth, '1714');
  assert.equal(family('cleirigh').houses.find(h => h.id === 'house-cleirigh').status, 'expelled');
  assert.equal(person('cleirigh:163:3').status, 'alive');
  assert.equal(person('cleirigh:105:2').status, 'alive');
});

test('source upgrades preserve local research, ancestry and orientation and are idempotent', () => {
  for (const registered of BLAITHNEACH_SOURCE_FAMILIES) {
    const stale = structuredClone(registered);
    for (const key of ['persons','partnerships','parentages','cadetBranches','timeJumps']) stale[key] = [];
    stale.extensions.sourceRevision = 1;
    stale.extensions.blankFamily = true;
    stale.extensions.localNote = 'Eigene Recherche';
    stale.view.orientation = 'horizontal';
    stale.persons.push({ id:'local-extra', worldPersonId:'person--local--extra', name:'Eigene Person', houseId:registered.lineage.houseId, notes:'Erhalten' });
    const updated = resolveRegisteredFamilyUpgrade(registered, stale);
    assertValidFamily(updated);
    assert.equal(updated.persons.length, registered.persons.length + 1);
    assert.equal(updated.extensions.localNote, 'Eigene Recherche');
    assert.equal(updated.view.orientation, 'horizontal');
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, updated), updated);
  }
  for (const [familyId, patch] of Object.entries(patches)) {
    const registered = getRegisteredFamily(familyId).family, stale = structuredClone(registered);
    stale.extensions.sourceRevision = patch.revision - 1;
    delete stale.extensions.blaithneachSourceCounterInventory;
    stale.view.orientation = 'horizontal';
    for (const p of stale.persons) p.title = 'Eigener Titel';
    for (const [key, entities] of Object.entries(patch.collections)) for (const [id, fields] of Object.entries(entities)) {
      const entity = stale[key].find(p => p.id === id);
      for (const field of Object.keys(fields)) entity[field] = field === 'status' ? 'unknown' : field === 'type' ? 'marriage' : '';
    }
    const oldParents = normalizeFamily(stale).parentages;
    const updated = resolveRegisteredFamilyUpgrade(registered, stale);
    assertValidFamily(updated);
    assert.deepEqual(updated.parentages, oldParents, familyId);
    assert.equal(updated.view.orientation, 'horizontal');
    assert.ok(updated.persons.every(p => p.title === 'Eigener Titel'));
    for (const [key, entities] of Object.entries(patch.collections)) for (const [id, fields] of Object.entries(entities)) {
      for (const [field, value] of Object.entries(fields)) assert.deepEqual(updated[key].find(p => p.id === id)[field], value, `${familyId}/${id}/${field}`);
    }
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, updated), updated);
    assert.equal(withBlaithneachSourceCounterUpgrade(registered), registered);
  }
});

test('all unmodified families retain their complete pre-import fingerprints, including Leite', () => {
  const faelaornBaseline = read('scripts/faelaorn-source-import/baseline-fingerprints.json');
  const faelaornPatches = read('assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json').counterpartPatches;
  const portraitBaseline = read('scripts/alben-portrait-reconciliation/baseline-fingerprints.json');
  const fingerprints = read('scripts/blaithneach-source-import/baseline-fingerprints.json');
  // The subsequent Aislearneach import has its own complete preservation test.
  const laterBaseline = read('scripts/aislearneach-source-import/baseline-fingerprints.json');
  const laterAudit = read('assets/data/source-inventories/aislearneach-families-audit-2026-10-08.json');
  const laterChanged = new Set([...Object.keys(laterAudit.counterpartPatches), ...laterAudit.sourceCards.map(p => (p.slug === 'techtmar' ? 'sept-' : 'haus-') + p.slug)]);
  const changed = new Set([...Object.keys(patches), ...BLAITHNEACH_SOURCE_FAMILIES.map(f => f.document.id)]);
  for (const r of FAMILY_REGISTRY.filter(r => Object.hasOwn(fingerprints, r.id) && !changed.has(r.id))) {
    assert.equal(laterChanged.has(r.id) ? laterBaseline[r.id] : (ALBEN_SOURCE_PORTRAIT_FAMILIES[r.id] ? portraitBaseline[r.id] : faelaornPatches[r.id] ? faelaornBaseline[r.id] : fingerprintBeforeMathgham(r.family)), fingerprints[r.id], r.id);
  }
});

test('nine bios, warriors, source graphics and all portraits retain verified original bytes', () => {
  assert.equal(inventory.sources.length, 9);
  assert.equal(audit.referenceAssets.length, 18);
  assert.equal(audit.portraitAssets.length, 251);
  assert.equal(Object.keys(audit.reusedPortraits).length, 81);
  for (const asset of [...inventory.sources, ...audit.referenceAssets, ...audit.portraitAssets]) {
    const bytes = fs.readFileSync(new URL('../' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  }
  for (const path of Object.values(catalog.portraits)) assert.ok(fs.existsSync(new URL('../' + path, import.meta.url)), path);
  for (const f of BLAITHNEACH_SOURCE_FAMILIES) {
    assert.ok(f.extensions.houseBiographyModule.description.length > 150);
    assert.equal(f.extensions.houseBiographyModule.image, f.extensions.warriorReference);
    for (const p of f.persons) if (p.portraitPlaceholder === 'child') assert.equal(p.portrait, ALBEN_SOURCE_PORTRAITS[p.id] || '', p.id);
  }
});
