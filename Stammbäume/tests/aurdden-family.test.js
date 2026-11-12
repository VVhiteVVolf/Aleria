import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { HOUSE_AURDDEN_FAMILY as family } from '../assets/js/data/house-aurdden-family.js';
import { AURDDEN_FAMILY_PEOPLE, AURDDEN_GUARDS, AURDDEN_PORTRAIT_PEOPLE } from '../assets/js/data/aurdden-people.js';
import { HOUSE_LOER_FAMILY } from '../assets/js/data/house-loer-family.js';
import { withAurddenLoerEngagement, AURDDEN_LOER_ENGAGEMENT_ID } from '../assets/js/data/aurdden-loer-engagement.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { HOUSE_CONTENT } from '../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Aurdden/haus.content.mjs';
import { createHousePageData, createHouseBiography } from '../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';

const member = id => family.persons.find(person => person.id === id);
const children = id => family.parentages.filter(parentage => parentage.parentIds.includes(id));

test('Aurdden is a single valid civilian Loer family with a serial origin and no isolated fictional generations', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.diagnostics, []);
  assert.equal(new Set(chart.data.map(node => node.id)).size, chart.data.length);
  const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = family;
  assert.equal(validateWorkspaceForPublishing({ root: { ...root, familyId: family.document.id }, collections: { persons, houses, partnerships, parentages, cadetBranches, timeJumps } }).valid, true);
  assert.equal(persons.length, 39); assert.equal(partnerships.length, 12); assert.equal(parentages.length, 26);
  assert.equal(cadetBranches.length, 2); assert.equal(timeJumps.length, 1);
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.liegeHouseId, 'house-loer');
  assert.equal(family.lineage.crestFrame, 'iron');
  assert.deepEqual(timeJumps[0].childIds, ['heledric-aurdden']);
  assert.equal(timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  const origin = parentages.find(edge => edge.childId === 'heledric-aurdden');
  assert.equal(origin.type, 'claimed'); assert.equal(origin.certainty, 'unknown');
  assert.equal(origin.extensions.timeJumpId, timeJumps[0].id);
  assert.ok(origin.parentIds.every(id => /^Unbekannt/.test(member(id).name)));
  assert.ok(persons.every(person => chart.data.some(node => node.id === person.id)));
});

test('brothers, sisters and all three legitimate lines satisfy the requested ages and parentage', () => {
  for (const [id, age, daughters, sons] of [['kyrwyn-aurdden', 55, 4, 0], ['thalan-aurdden', 51, 1, 2], ['saithen-aurdden', 46, 3, 3]]) {
    assert.equal(1740 - Number(member(id).birth), age);
    assert.deepEqual(family.parentages.find(edge => edge.childId === id).parentIds, ['iwrwyn-aurdden', 'brenella-spouse-aurdden']);
    const legitimate = children(id).filter(edge => edge.legitimacy === 'legitimate');
    assert.equal(legitimate.filter(edge => member(edge.childId).sex === 'female').length, daughters);
    assert.equal(legitimate.filter(edge => member(edge.childId).sex === 'male').length, sons);
    assert.ok(legitimate.every(edge => 1740 - Number(member(edge.childId).birth) >= 10 && 1740 - Number(member(edge.childId).birth) <= 27));
  }
  for (const id of ['iwrwyn-aurdden', 'brenella-spouse-aurdden']) assert.equal(member(id).status, 'dead');
  for (const edge of family.parentages.filter(edge => edge.type === 'biological')) {
    for (const parentId of edge.parentIds) {
      const parent = member(parentId), child = member(edge.childId);
      if (parent.birth) assert.ok(Number(child.birth) - Number(parent.birth) >= 18);
      if (parent.death) assert.ok(Number(child.birth) <= Number(parent.death));
    }
  }
  for (const source of AURDDEN_FAMILY_PEOPLE.filter(person => person.spouse)) assert.ok(!source.name.includes(' '));
});

test('away relatives and bastard remain outside shop employment and no engagement is misrepresented as marriage', () => {
  const away = ['cyrwen-aurdden', 'lleirena-aurdden', 'avelin-aurdden', 'cyrion-aurdden-bastard'];
  for (const id of away) assert.equal(AURDDEN_FAMILY_PEOPLE.find(person => person.id === id).shopEmployee, false);
  for (const branch of family.cadetBranches) {
    assert.equal(branch.targetFamilyId, 'haus-unbekannt');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(family.partnerships.find(relation => relation.id === branch.parentPartnershipId).type, 'marriage');
  }
  assert.ok(family.cadetBranches.every(branch => !family.partnerships.find(relation => relation.id === branch.parentPartnershipId).participantIds.includes('avelin-aurdden')));
  const bastard = member('cyrion-aurdden-bastard');
  assert.equal(bastard.name, 'Cyrion'); assert.equal(bastard.familyRole, 'bastard'); assert.equal(bastard.houseId, '');
  const parentage = family.parentages.find(edge => edge.childId === bastard.id);
  assert.deepEqual(parentage.parentIds, ['saithen-aurdden', 'unknown-cyrion-mother']);
  assert.equal(parentage.legitimacy, 'illegitimate');
  assert.equal(family.partnerships.find(relation => relation.id === parentage.partnershipId).type, 'affair');
  assert.equal(member('unknown-cyrion-mother').status, 'unknown');
  for (const edge of family.parentages.filter(edge => Number(member(edge.childId).birth) >= 1713 && edge.childId !== 'avelin-aurdden')) {
    assert.equal(family.partnerships.filter(relation => relation.participantIds.includes(edge.childId)).length, 0);
  }
});

test('the separate unpictured bank branch is genuinely first-cousin kin and carries no jeweller or licence assignment', () => {
  const bank = AURDDEN_FAMILY_PEOPLE.filter(person => person.branch === 'bank');
  assert.equal(bank.length, 7);
  assert.ok(bank.every(person => person.portrait === '' && !person.portraitNeeded && !person.shopEmployee));
  assert.deepEqual(family.parentages.find(edge => edge.childId === 'oeneth-aurdden').parentIds, family.parentages.find(edge => edge.childId === 'iwrwyn-aurdden').parentIds);
  assert.deepEqual(family.parentages.find(edge => edge.childId === 'pereth-aurdden').parentIds, ['oeneth-aurdden', 'rhewae-spouse-aurdden']);
  assert.deepEqual(children('pereth-aurdden').map(edge => edge.childId), ['ellric-aurdden', 'kyria-aurdden', 'neddan-aurdden']);
  assert.ok(bank.filter(person => Number(person.birth) >= 1716).every(person => !family.partnerships.some(relation => relation.participantIds.includes(person.id))));
  assert.match(HOUSE_CONTENT.sections.holdings, /Münzprägerecht.*Loer/);
  assert.match(HOUSE_CONTENT.sections.holdings, /Roten Bank.*Ergalla/);
  assert.equal(AURDDEN_GUARDS.length, 2);
  assert.ok(AURDDEN_GUARDS.every(person => !family.persons.some(relative => relative.id === person.id)));
  assert.equal(AURDDEN_PORTRAIT_PEOPLE.length, 28);
});

test('Avelin and the originally free Aeron share exactly one reciprocal engagement and canonical world identities', async () => {
  const before = JSON.parse(await readFile(new URL('fixtures/loer-before-aurdden.json', import.meta.url), 'utf8'));
  assert.equal(before.partnerships.some(relation => relation.participantIds.includes('aeron-loer')), false);
  const aurdden = family.partnerships.find(relation => relation.id === AURDDEN_LOER_ENGAGEMENT_ID);
  const loer = HOUSE_LOER_FAMILY.partnerships.find(relation => relation.id === AURDDEN_LOER_ENGAGEMENT_ID);
  assert.deepEqual(aurdden.participantIds, loer.participantIds);
  for (const relation of [aurdden, loer]) { assert.equal(relation.type, 'engagement'); assert.equal(relation.status, 'active'); }
  for (const id of aurdden.participantIds) {
    assert.equal(member(id).worldPersonId, HOUSE_LOER_FAMILY.persons.find(person => person.id === id).worldPersonId);
    assert.equal(member(id).portrait, HOUSE_LOER_FAMILY.persons.find(person => person.id === id).portrait);
  }
  assert.equal(member('aeron-loer').birth, '1712'); assert.equal(member('avelin-aurdden').birth, '1713');
  for (const collection of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps']) {
    for (const old of before[collection]) {
      const actual = HOUSE_LOER_FAMILY[collection].find(entity => entity.id === old.id);
      const { extensions: oldExtensions, ...oldFields } = old;
      const { extensions: newExtensions, ...newFields } = actual;
      assert.deepEqual(newFields, oldFields, `${collection}/${old.id}`);
    }
  }
  assert.strictEqual(withAurddenLoerEngagement(HOUSE_LOER_FAMILY), HOUSE_LOER_FAMILY);
  const occupied = structuredClone(before);
  occupied.partnerships.push({ id: 'test-exclusive', participantIds: ['aeron-loer', 'unknown-ynyrion-spouse'], type: 'engagement', status: 'active' });
  assert.throws(() => withAurddenLoerEngagement(occupied), /exklusive Verbindung/);
});

test('Loer revision upgrade adds the engagement once while preserving independent notes and existing relationships', async () => {
  const old = JSON.parse(await readFile(new URL('fixtures/loer-before-aurdden.json', import.meta.url), 'utf8'));
  const local = structuredClone(old);
  local.persons.find(person => person.id === 'aeron-loer').notes = 'Eigene unabhängige Chroniknotiz.';
  local.persons.find(person => person.id === 'garmon-loer').title = 'Lokal gepflegtes Amt';
  const registered = FAMILY_REGISTRY.find(record => record.id === 'haus-loer').family;
  const result = resolveRegisteredFamilyUpgrade(registered, local);
  assert.equal(result.persons.length, old.persons.length + 1);
  assert.equal(result.partnerships.length, old.partnerships.length + 1);
  assert.equal(result.persons.find(person => person.id === 'aeron-loer').notes, 'Eigene unabhängige Chroniknotiz.');
  assert.equal(result.persons.find(person => person.id === 'garmon-loer').title, 'Lokal gepflegtes Amt');
  assert.deepEqual(result.parentages, old.parentages);
  assert.equal(result.partnerships.filter(relation => relation.id === AURDDEN_LOER_ENGAGEMENT_ID).length, 1);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, result), result);
});

test('registered placement, native house outputs and the source roster agree', async () => {
  const records = FAMILY_REGISTRY.filter(record => record.id === 'haus-aurdden');
  assert.equal(records.length, 1); assert.equal(records[0].type, 'commoner');
  assert.deepEqual(records[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(HOUSE_CONTENT.figures.length, 33);
  assert.equal(HOUSE_CONTENT.figures.filter(person => person.image).length, 26);
  assert.equal(HOUSE_CONTENT.omitMilitaryProfile, true);
  assert.equal(HOUSE_CONTENT.relatedRecords[0].link, '../AleriaAlmanach/AleriaAlmanach.html?entry=der-sternenfang-aurdden');
  const directory = new URL('../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Aurdden/', import.meta.url);
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('haus.data.js', directory), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.HAEUSER_DATA)), createHousePageData(HOUSE_CONTENT));
  const { HOUSE_BIOGRAPHY } = await import(new URL('haus.biography.mjs', directory));
  assert.deepEqual(HOUSE_BIOGRAPHY, createHouseBiography(HOUSE_CONTENT));
});
