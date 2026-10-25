import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../assets/js/data/families.registry.js';
import { normalizeFamily, assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { createBlankHouseFamily } from '../assets/js/data/blank-house-family-factory.js';
import { LAGA_KNOWN_LINKS, LAGA_KNOWN_WARDS } from '../assets/js/modules/laga-family/laga-known-links.js';
import { withLagaCounterpartUpgrade } from '../assets/js/modules/laga-family/laga-counterpart-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';

const family = normalizeFamily(getRegisteredFamily('haus-laga').family);
const person = id => family.persons.find(entry => entry.id === id);
const expectedNames = [
  'Laoise Laga', 'Laoise Laga', 'Quillíne Laga', 'Meabhróg Laga', 'Clodagh Laga',
  'Fiadh Laga', 'Maolmhuire Laga', 'Duibhseach Laga', 'Fionnchu Laga', 'Glaodhaich Laga',
  'Lagaid Laga', 'Lugaid Laga', 'Luibheas Laga', 'Seònaid Laga', 'Meadhbh Laga'
];

test('the Laga skeleton has comparable size, a complete connected graph and four serial gaps', () => {
  assertValidFamily(family);
  assert.equal(family.persons.length, 104);
  assert.equal(family.persons.filter(entry => entry.status === 'alive').length, 42);
  assert.equal(family.persons.filter(entry => entry.status === 'alive' && entry.houseId === 'house-laga').length, 26);
  assert.equal(family.partnerships.length, 44);
  assert.equal(family.timeJumps.length, 4);
  assert.equal(new Set(family.persons.map(entry => entry.worldPersonId)).size, 104);
  const edges = [
    ...family.partnerships.map(pair => pair.participantIds),
    ...family.parentages.map(link => [link.childId, ...link.parentIds])
  ];
  const connected = new Set(['laga0001']);
  for (let pass = 0; pass < family.persons.length; pass++) {
    for (const edge of edges) if (edge.some(id => connected.has(id))) edge.forEach(id => connected.add(id));
  }
  assert.equal(connected.size, 104);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.deepEqual(toFamilyChartData(family).diagnostics.filter(issue => issue.severity !== 'info'), []);
  const { persons, partnerships, parentages, houses, cadetBranches, timeJumps, ...root } = family;
  const validation = validateWorkspaceForPublishing({ root: { ...root, familyId: family.document.id },
    collections: { persons, partnerships, parentages, houses, cadetBranches, timeJumps } });
  assert.equal(validation.valid, true, JSON.stringify(validation.diagnostics));
});

test('the founder knot leads to three married sons and two married-away daughters before the first gap', () => {
  assert.equal(family.lineage.founderPartnershipId, 'marriage-laga-0001');
  const children = family.parentages.filter(link => link.partnershipId === family.lineage.founderPartnershipId);
  assert.deepEqual(children.map(link => link.childId), ['laga0002', 'laga0003', 'laga0004', 'laga0005', 'laga0006']);
  assert.deepEqual(children.map(link => person(link.childId).sex), ['male', 'male', 'male', 'female', 'female']);
  for (const link of children) {
    const member = person(link.childId), pair = family.partnerships.find(pair => pair.participantIds.includes(member.id));
    assert.ok(pair);
    assert.ok(pair.participantIds.includes('a' + member.id));
    assert.ok(!link.extensions.timeJumpId);
    if (member.sex === 'female') assert.ok(member.tags.includes('Wegverheiratet'));
  }
  assert.equal(family.timeJumps[0].parentPartnershipId, 'marriage-laga-0002');
  for (const jump of family.timeJumps) {
    for (const childId of jump.childIds) {
      const link = family.parentages.find(entry => entry.childId === childId);
      assert.equal(link.type, 'claimed');
      assert.equal(link.extensions.timeJumpId, jump.id);
    }
  }
});

test('all fifteen known Laga people and their existing spouses preserve identity, dates and marriages', () => {
  assert.deepEqual(LAGA_KNOWN_LINKS.map(link => link.person.name).sort(), expectedNames.sort());
  const sharedFields = ['worldPersonId', 'name', 'sex', 'birth', 'death', 'status', 'houseId', 'portrait', 'portraitPlaceholder'];
  for (const link of LAGA_KNOWN_LINKS) {
    const source = getRegisteredFamily(link.sourceFamilyId).family;
    const original = source.persons.find(entry => entry.id === link.sourcePersonId);
    for (const field of sharedFields) assert.deepEqual(person(link.person.id)[field], original[field], `${link.person.id}: ${field}`);
    const pair = family.partnerships.find(entry => entry.id === link.pair.id);
    assert.deepEqual(pair.participantIds, link.pair.participantIds);
    assert.equal(pair.type, link.pair.type);
    assert.equal(pair.status, link.pair.status);
    for (const field of sharedFields) assert.deepEqual(person(link.partner.id)[field], source.persons.find(p => p.id === link.partner.id)[field]);
  }
  const old = person('laoise-1125-laga'), recent = person('laoise-laga');
  assert.notEqual(old.worldPersonId, recent.worldPersonId);
  assert.equal(old.birth, '1125');
  assert.equal(recent.birth, '1625');
  assert.ok(family.cadetBranches.every(branch => getRegisteredFamily(branch.targetFamilyId)));
});

test('Lugaid remains married to Blathnath and has exactly the three requested biological children', () => {
  const head = person('lugaid-1690-laga');
  assert.equal(head.lineageRole, 'head');
  assert.equal(head.title, 'Ard Tiarna von Uathneach');
  assert.equal(head.sex, 'male');
  const pair = family.partnerships.find(pair => pair.participantIds.includes(head.id));
  assert.ok(pair.participantIds.includes('blathnath-1695-chulainn'));
  const children = family.parentages.filter(link => link.parentIds.includes(head.id) && link.type === 'biological');
  assert.deepEqual(children.map(link => person(link.childId).name), ['Aibhilin Laga', 'Brothaigh Laga', 'Sheena Laga']);
  assert.deepEqual(children.map(link => 1740 - Number(person(link.childId).birth)), [27, 23, 18]);
  assert.ok(children.every(link => link.partnershipId === pair.id));
  const origin = family.parentages.find(link => link.childId === head.id);
  const brotherOrigin = family.parentages.find(link => link.childId === 'lagaid-1689-laga');
  assert.equal(person('lagaid-1689-laga').sex, 'male');
  assert.equal(person('lagaid-1689-laga').title, 'Bruder des Ard Tiarna');
  assert.equal(brotherOrigin.partnershipId, origin.partnershipId);
  assert.deepEqual(brotherOrigin.parentIds, origin.parentIds);
  assert.ok(family.partnerships.some(pair => pair.participantIds.includes('lagaid-1689-laga')
    && pair.participantIds.includes('sadhbh-1696-durthacht')));
});

test('new names are only numbered Laga/ALaga placeholders and recent parent ages are plausible', () => {
  const placeholders = family.persons.filter(entry => entry.extensions.lagaSkeletonPlaceholder);
  assert.equal(placeholders.length, 68);
  for (const entry of placeholders) assert.match(entry.name, /^(?:A)?Laga\d{4}$/);
  for (const partner of placeholders.filter(entry => entry.name.startsWith('ALaga'))) {
    assert.ok(family.partnerships.some(pair => pair.participantIds.includes(partner.id) && pair.participantIds.includes(partner.id.slice(1))));
  }
  for (const link of family.parentages.filter(link => link.type === 'biological')) {
    const child = person(link.childId);
    for (const id of link.parentIds) {
      const parent = person(id);
      if (/^\d{4}$/.test(parent.birth) && /^\d{4}$/.test(child.birth)) {
        const age = Number(child.birth) - Number(parent.birth);
        assert.ok(age >= 16 && age <= 60, `${parent.name} at birth of ${child.name}: ${age}`);
        if (/^\d{4}$/.test(parent.death)) assert.ok(Number(child.birth) <= Number(parent.death));
      }
    }
  }
});

test('the three existing wards keep their clan identities and have distinct male guardians aged at least forty', () => {
  assert.equal(LAGA_KNOWN_WARDS.length, 3);
  const guardians = new Set();
  for (const ward of LAGA_KNOWN_WARDS) {
    const entry = person(ward.person.id);
    assert.equal(entry.familyRole, 'ward');
    assert.equal(entry.houseId, ward.person.houseId);
    assert.equal(entry.worldPersonId, ward.person.worldPersonId);
    const links = family.parentages.filter(link => link.childId === entry.id);
    assert.deepEqual(links.map(link => link.type), ['foster']);
    assert.equal(links[0].parentIds.length, 1);
    const guardian = person(links[0].parentIds[0]);
    assert.notEqual(guardian.id, 'lugaid-1690-laga');
    assert.equal(guardian.houseId, 'house-laga');
    assert.equal(guardian.sex, 'male');
    assert.equal(guardian.status, 'alive');
    assert.ok(1740 - Number(guardian.birth) >= 40);
    guardians.add(guardian.id);
  }
  assert.equal(guardians.size, 3);
});

test('blank and locally edited snapshots gain the skeleton once without losing local data', () => {
  const blank = createBlankHouseFamily({ id: 'haus-laga', title: family.document.title,
    emblem: family.document.emblem, houseProfile: family.document.houseProfile });
  blank.extensions.sourceRevision = 2;
  blank.extensions.localNote = 'Eigene Recherche';
  blank.persons.push({ id: 'local-person', name: 'Lokaler Eintrag', houseId: 'house-laga', notes: 'Erhalten' });
  blank.view.orientation = 'horizontal';
  const upgraded = resolveRegisteredFamilyUpgrade(family, blank);
  assertValidFamily(upgraded);
  assert.equal(upgraded.persons.length, 105);
  assert.equal(upgraded.persons.find(p => p.id === 'local-person').notes, 'Erhalten');
  assert.equal(upgraded.extensions.localNote, 'Eigene Recherche');
  assert.equal(upgraded.lineage.founderPartnershipId, family.lineage.founderPartnershipId);
  assert.equal(upgraded.view.orientation, 'horizontal');
  assert.equal(upgraded.extensions.blankFamily, false);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(family, upgraded), upgraded);
  const edited = structuredClone(family);
  edited.persons.find(p => p.id === 'laga0001').name = 'Später vergebener Name';
  assert.equal(resolveRegisteredFamilyUpgrade(family, edited).persons.find(p => p.id === 'laga0001').name, 'Später vergebener Name');
  const previousSkeleton = structuredClone(edited);
  previousSkeleton.extensions.sourceRevision = 3;
  const oldBrother = previousSkeleton.parentages.find(link => link.childId === 'lagaid-1689-laga');
  oldBrother.parentIds = ['laga0016', 'alaga0016'];
  oldBrother.partnershipId = 'marriage-laga-0016';
  for (const link of previousSkeleton.parentages.filter(link => link.type === 'foster')) link.parentIds = ['lugaid-1690-laga'];
  previousSkeleton.partnerships.find(pair => pair.id === 'marriage-laga-0011').extensions.chartAlignChildGroupBelowParentPair = true;
  const corrected = resolveRegisteredFamilyUpgrade(family, previousSkeleton);
  assert.equal(corrected.persons.find(p => p.id === 'laga0001').name, 'Später vergebener Name');
  assert.deepEqual(corrected.parentages.find(link => link.childId === 'lagaid-1689-laga').parentIds, ['laga0019', 'alaga0019']);
  assert.ok(corrected.parentages.filter(link => link.type === 'foster').every(link => !link.parentIds.includes('lugaid-1690-laga')));
  assert.equal(corrected.partnerships.find(pair => pair.id === 'marriage-laga-0011').extensions.chartAlignChildGroupBelowParentPair, false);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(family, corrected), corrected);
});

test('counterpart corrections are idempotent and leave every relationship untouched', () => {
  const affected = ['haus-gallchobhair', 'haus-chulainn', 'haus-durthacht'];
  for (const id of affected) {
    const current = getRegisteredFamily(id).family;
    const stale = structuredClone(current);
    const personId = id === 'haus-chulainn' ? 'lugaid-1690-laga'
      : id === 'haus-durthacht' ? 'lagaid-1689-laga' : 'laoise-laga';
    const entry = stale.persons.find(p => p.id === personId);
    if (id !== 'haus-gallchobhair') entry.sex = 'unknown';
    else entry.worldPersonId = 'person--haus-laga--laoise-laga';
    entry.title = 'Eigener Titel';
    stale.extensions.sourceRevision = current.extensions.sourceRevision - 1;
    const corrected = withLagaCounterpartUpgrade(stale);
    assert.deepEqual(corrected.partnerships.map(p => [p.id, p.participantIds]), stale.partnerships.map(p => [p.id, p.participantIds]));
    assert.deepEqual(corrected.parentages.map(p => [p.id, p.parentIds, p.childId]), stale.parentages.map(p => [p.id, p.parentIds, p.childId]));
    assert.equal(withLagaCounterpartUpgrade(corrected), corrected);
    const upgraded = resolveRegisteredFamilyUpgrade(current, stale);
    assert.equal(upgraded.persons.find(p => p.id === entry.id).worldPersonId, current.persons.find(p => p.id === entry.id).worldPersonId);
    assert.equal(upgraded.persons.find(p => p.id === entry.id).sex, current.persons.find(p => p.id === entry.id).sex);
    assert.equal(upgraded.persons.find(p => p.id === entry.id).title, 'Eigener Titel');
  }
  for (const r of FAMILY_REGISTRY.filter(r => !affected.includes(r.id))) {
    assert.equal(withLagaCounterpartUpgrade(r.family), r.family);
  }
});
