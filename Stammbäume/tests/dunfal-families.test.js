import { BRANN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/brann-source-counter-patches.js';
import { FAERNA_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faerna-source-counter-patches.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from '../assets/js/data/mathgham-source-counter-patches.js';
import { BRAIGH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/braigh-source-counter-patches.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from '../assets/js/data/faelaorn-source-counter-patches.js';
import { ALBEN_SOURCE_PORTRAITS, ALBEN_SOURCE_PORTRAIT_FAMILIES } from '../assets/js/data/alben-source-portraits.js';
import test from 'node:test';
import { AISLEARNEACH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/aislearneach-source-counter-patches.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { DUNFAL_SOURCE_CATALOG as catalog } from '../assets/js/data/dunfal-source-catalog.js';
import { DUNFAL_SOURCE_COUNTER_PATCHES as patches } from '../assets/js/data/dunfal-source-counter-patches.js';
import { withDunfalSourceCounterUpgrade } from '../assets/js/data/dunfal-source-counter-upgrade.js';
import { assertValidFamily, normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { BLAITHNEACH_SOURCE_COUNTER_PATCHES } from '../assets/js/data/blaithneach-source-counter-patches.js';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const audit = read('assets/data/source-inventories/dunfal-families-audit-2026-10-07.json');
const inventory = read(catalog.inventory);
const counts = { chulainn: 70, nuadat: 67, ailella: 66, cein: 70, birn: 49, riangabra: 45, morath: 66, aonghusa: 47, anbhair: 40, casur: 49, eachtrai: 48, ferbend: 7 };
const id = ref => audit.sourceToPerson[ref];
const family = slug => getRegisteredFamily(slug === 'ferbend' ? 'sept-ferbend' : 'haus-' + slug).family;
const person = ref => family(ref.split(':')[0]).persons.find(person => person.id === id(ref));
const parentage = ref => family(ref.split(':')[0]).parentages.find(entry => entry.childId === id(ref));

test('all 626 source cards resolve into twelve complete, connected families and 544 identities', () => {
  assert.equal(audit.sourceCards.length, 626);
  assert.equal(Object.keys(catalog.persons).length, 544);
  assert.equal(Object.keys(audit.sourceToPerson).length, 626);
  for (const [slug, count] of Object.entries(counts)) {
    const current = normalizeFamily(family(slug));
    assertValidFamily(current);
    assert.equal(current.persons.length, count, slug);
    assert.equal(new Set(current.persons.map(person => person.worldPersonId)).size, count, slug);
    assert.equal(current.extensions.sourceRevision, BRANN_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || FAERNA_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || BRAIGH_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || MATHGHAM_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || FAELAORN_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || ALBEN_SOURCE_PORTRAIT_FAMILIES[current.document.id]?.revision || AISLEARNEACH_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || BLAITHNEACH_SOURCE_COUNTER_PATCHES[current.document.id]?.revision || 2);
    assert.deepEqual(auditFamilyChartLayoutPolicy(current).issues, [], slug);
    assert.deepEqual(toFamilyChartData(current).diagnostics.filter(d => d.severity !== 'info'), [], slug);
    const connected = new Set([
      ...current.partnerships.flatMap(pair => pair.participantIds),
      ...current.parentages.flatMap(link => [link.childId, ...link.parentIds])
    ]);
    for (const person of current.persons) assert.ok(connected.has(person.id), person.id);
    for (const card of audit.sourceCards.filter(card => card.slug === slug)) {
      assert.ok(current.persons.some(person => person.id === id(card.ref)), card.ref);
    }
    const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = current;
    const validation = validateWorkspaceForPublishing({ root: { ...root, familyId: current.document.id }, collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps } });
    assert.equal(validation.valid, true, JSON.stringify(validation.diagnostics));
  }
});

test('confirmed corrections preserve adoption, cousin marriage, birth year and distinct Emer identities', () => {
  assert.equal(person('cein:182:3').birth, '1730');
  for (const ref of ['chulainn:128:2', 'chulainn:128:3']) {
    assert.equal(person(ref).familyRole, 'adopted');
    assert.equal(parentage(ref).type, 'adoptive');
    assert.deepEqual(new Set(parentage(ref).parentIds), new Set([id('chulainn:106:1'), id('chulainn:115:1')]));
  }
  const birn = family('birn'), xina = id('birn:133:0'), oran = id('birn:129:2');
  const relationships = birn.partnerships.filter(pair => pair.participantIds.includes(xina));
  assert.equal(relationships.length, 1);
  assert.deepEqual(new Set(relationships[0].participantIds), new Set([xina, oran]));
  assert.equal(birn.persons.filter(person => person.id === xina).length, 1);
  assert.ok(birn.parentages.some(link => link.partnershipId === relationships[0].id));
  assert.deepEqual(birn.persons.find(person => person.id === oran).extensions.chartRepeatForPartnershipIds, [relationships[0].id]);
  assert.deepEqual(birn.persons.find(person => person.id === xina).extensions.chartPartnerMirrorForPartnershipIds, [relationships[0].id]);
  const contemporary = person('ailella:136:1');
  const historical = family('neidr').persons.find(person => person.id === 'emer-ailella');
  assert.equal(contemporary.birth, '1675');
  assert.notEqual(contemporary.worldPersonId, historical.worldPersonId);
  assert.equal(family('ciarog').persons.find(person => person.id === 'emer-ailella').worldPersonId, contemporary.worldPersonId);
  assert.equal(historical.worldPersonId, 'person--haus-ailella--emer-ailella');
  const zephen = family('riangabra').persons.find(person => person.id === 'zephen-1720-riangabra');
  assert.equal(zephen.death, '1735');
  assert.equal(zephen.portraitPlaceholder, 'child');
  assert.equal(zephen.portrait, ALBEN_SOURCE_PORTRAITS[zephen.id]);
});

test('foster relationships preserve biological origins and outward house links', () => {
  for (const [slug, child, guardian] of [
    ['chulainn', '146:3', '120:0'], ['ailella', '164:4', '146:2'],
    ['cein', '190:2', '168:0'], ['morath', '176:3', '158:0'], ['anbhair', '145:2', '135:0']
  ]) {
    const link = family(slug).parentages.find(link => link.childId === id(slug + ':' + child) && link.type === 'foster');
    assert.ok(link, slug);
    assert.deepEqual(link.parentIds, [id(slug + ':' + guardian)], slug);
    assert.equal(link.partnershipId, '');
  }
  const shan = family('ciarog').persons.find(person => person.id === 'shan-ciarog');
  assert.equal(shan.familyRole, 'ward-away');
  assert.ok(family('ciarog').parentages.some(link => link.childId === shan.id && link.type === 'biological'));
  assert.ok(family('ciarog').cadetBranches.some(branch => branch.parentPersonId === shan.id && branch.targetFamilyId === 'haus-anbhair'));
  assert.equal(family('nuadat').cadetBranches.filter(branch => branch.linkType === 'cadet-house' && ['haus-aonghusa', 'haus-anbhair', 'haus-casur'].includes(branch.targetFamilyId)).length, 3);
  assert.equal(person('ferbend:94:0').houseId, 'house-ui-faill-duibhne');
  assert.equal(person('ferbend:94:0').familyRole, 'core');
});

test('shared people and relationships agree across existing counterpart records', () => {
  const fields = ['worldPersonId', 'name', 'sex', 'birth', 'death', 'status', 'houseId', 'portrait', 'portraitPlaceholder'];
  for (const slug of Object.keys(counts)) for (const person of family(slug).persons) {
    for (const other of FAMILY_REGISTRY.flatMap(record => record.family.persons).filter(other => other.worldPersonId === person.worldPersonId)) {
      for (const field of fields) assert.equal(other[field], person[field], `${person.id}: ${field}`);
    }
  }
  for (const slug of Object.keys(counts)) for (const pair of family(slug).partnerships) {
    for (const other of FAMILY_REGISTRY.flatMap(record => record.family.partnerships).filter(other => other.id === pair.id)) {
      assert.deepEqual(other.participantIds, pair.participantIds, pair.id);
      assert.equal(other.type, pair.type, pair.id);
    }
  }
});

test('blank-to-source upgrades retain local people, custom fields and deletion markers and are idempotent', () => {
  for (const slug of Object.keys(counts)) {
    const registered = family(slug), stale = structuredClone(registered);
    for (const collection of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) stale[collection] = [];
    stale.extensions.sourceRevision = 1;
    stale.extensions.blankFamily = true;
    stale.extensions.localNote = 'Eigene Recherche';
    stale.extensions.registryTombstones = { persons: ['local-deleted'] };
    stale.view.orientation = 'horizontal';
    stale.persons.push({ id: 'local-extra', worldPersonId: 'person--local--extra', name: 'Lokale Ergänzung', houseId: registered.lineage.houseId, notes: 'Notiz erhalten' });
    const upgraded = resolveRegisteredFamilyUpgrade(registered, stale);
    assertValidFamily(upgraded);
    assert.equal(upgraded.persons.length, registered.persons.length + 1, slug);
    assert.equal(upgraded.persons.find(person => person.id === 'local-extra').notes, 'Notiz erhalten');
    assert.equal(upgraded.extensions.localNote, 'Eigene Recherche');
    assert.equal(upgraded.view.orientation, 'horizontal');
    assert.ok(upgraded.extensions.registryTombstones.persons.includes('local-deleted'));
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded, slug);
  }
});

test('counterpart revisions update only specified fields and preserve local ancestry and view', () => {
  for (const [familyId, patch] of Object.entries(patches)) {
    const registered = getRegisteredFamily(familyId).family;
    const stale = structuredClone(registered);
    stale.extensions.sourceRevision = patch.revision - 1;
    delete stale.extensions.dunfalSourceCounterInventory;
    stale.view.orientation = 'horizontal';
    stale.extensions.localNote = 'Privat';
    for (const person of stale.persons) person.title = 'Lokaler Titel';
    for (const [personId, fields] of Object.entries(patch.collections.persons || {})) {
      const person = stale.persons.find(person => person.id === personId);
      for (const key of Object.keys(fields)) person[key] = key === 'status' ? 'unknown' : key === 'familyRole' ? 'core' : '';
    }
    if (patch.identityCorrection) stale.persons.find(person => person.id === patch.identityCorrection.personId).worldPersonId = patch.identityCorrection.from;
    if (patch.wardAway) stale.cadetBranches = stale.cadetBranches.filter(branch => branch.id !== `ward-away-${patch.wardAway.personId}-dunfal`);
    const oldParentages = structuredClone(stale.parentages);
    const upgraded = resolveRegisteredFamilyUpgrade(registered, stale);
    assertValidFamily(upgraded);
    assert.deepEqual(upgraded.parentages, oldParentages, familyId);
    assert.equal(upgraded.extensions.localNote, 'Privat');
    assert.equal(upgraded.view.orientation, 'horizontal');
    for (const [personId, fields] of Object.entries(patch.collections.persons || {})) {
      const person = upgraded.persons.find(person => person.id === personId);
      for (const [key, value] of Object.entries(fields)) assert.equal(person[key], value, `${familyId}/${personId}/${key}`);
    }
    assert.ok(upgraded.persons.every(person => person.title === 'Lokaler Titel'), familyId);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded, familyId);
    assert.equal(withDunfalSourceCounterUpgrade(registered), registered, familyId);
  }
});

test('original sources, eleven warrior images and all portraits have verified local provenance', () => {
  assert.equal(inventory.sources.length, 12);
  assert.equal(audit.referenceAssets.length, 23);
  assert.equal(audit.portraitAssets.length, 318);
  for (const asset of [...inventory.sources, ...audit.referenceAssets, ...audit.portraitAssets]) {
    const bytes = fs.readFileSync(new URL('../' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  }
  for (const path of Object.values(catalog.portraits)) assert.ok(fs.existsSync(new URL('../' + path, import.meta.url)), path);
  for (const slug of Object.keys(counts)) {
    const current = family(slug), biography = current.extensions.houseBiographyModule;
    assert.ok(biography.description.length > 100, slug);
    if (slug !== 'ferbend') {
      assert.equal(biography.image, current.extensions.warriorReference);
      assert.ok(fs.existsSync(new URL('../' + biography.image, import.meta.url)));
    }
    for (const person of current.persons) if (person.portraitPlaceholder === 'child') assert.equal(person.portrait, ALBEN_SOURCE_PORTRAITS[person.id] || '', person.id);
  }
});
