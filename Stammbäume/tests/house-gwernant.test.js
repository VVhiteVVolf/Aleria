import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { HOUSE_GWERNANT_FAMILY as family, GWERNANT_EMBLEM } from '../assets/js/data/house-gwernant-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { validateWorkspaceForPublishing } from '../../firebase/functions/src/families/family-validation.js';
import { HOUSE_CONTENT } from '../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwernant/haus.content.mjs';
import { createHousePageData, createHouseBiography } from '../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';
import { buildGoettlicheEleganz } from '../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-module.mjs';
import { addEleganzSalesStaff, ELEGANZ_SALES_STAFF } from '../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-sales-staff.mjs';

const person = id => family.persons.find(member => member.id === id);
const sourceRoot = new URL('../../', import.meta.url);

test('Gwernant is a valid small civilian family accepted by the actual chart and publisher models', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  const chart = toFamilyChartData(family);
  assert.deepEqual(chart.diagnostics, []);
  assert.equal(new Set(chart.data.map(node => node.id)).size, chart.data.length);
  const { persons, houses, partnerships, parentages, cadetBranches, timeJumps, ...root } = family;
  assert.equal(validateWorkspaceForPublishing({ root: { ...root, familyId: family.document.id }, collections: { persons, houses, partnerships, parentages, cadetBranches, timeJumps } }).valid, true);
  assert.equal(persons.length, 11);
  assert.equal(persons.filter(member => !member.id.startsWith('haus-gwernant-gruender')).length, 9);
  assert.equal(partnerships.length, 4); assert.equal(parentages.length, 6);
  assert.equal(houses.length, 1); assert.equal(cadetBranches.length, 0);
});

test('unknown founders lead through one serial crest gap into three coherent concrete generations', () => {
  assert.equal(family.timeJumps.length, 1);
  const gap = family.timeJumps[0];
  assert.equal(gap.parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(gap.childIds, ['bryn-gwernant']);
  assert.equal(family.lineage.crestFrame, 'iron');
  const connection = family.parentages.find(edge => edge.childId === 'bryn-gwernant');
  assert.equal(connection.type, 'claimed');
  assert.equal(connection.certainty, 'unknown');
  assert.equal(connection.extensions.timeJumpId, gap.id);
  for (const id of connection.parentIds) {
    assert.match(person(id).name, /^Unbekannt/);
    assert.equal(person(id).birth, ''); assert.equal(person(id).death, '????');
  }
  for (const edge of family.parentages.filter(relation => relation.type === 'biological')) {
    const child = person(edge.childId);
    for (const id of edge.parentIds) {
      const parent = person(id);
      assert.ok(Number(child.birth) - Number(parent.birth) >= 18);
      if (parent.death) assert.ok(Number(child.birth) <= Number(parent.death));
    }
    assert.deepEqual(edge.parentIds, family.partnerships.find(relation => relation.id === edge.partnershipId).participantIds);
  }
  for (const marriage of family.partnerships.filter(relation => relation.start)) {
    for (const id of marriage.participantIds) assert.ok(Number(marriage.start) - Number(person(id).birth) >= 18);
  }
});

test('Catrin and Efa retain their accepted ages, same parents, single status and independent world identities', () => {
  for (const [id, birth, age] of [['catrin-gwernant', '1714', 26], ['efa-gwernant', '1718', 22]]) {
    const member = person(id);
    assert.equal(member.birth, birth); assert.equal(1740 - Number(member.birth), age);
    assert.equal(member.worldPersonId, `person--haus-gwernant--${id}`);
    assert.match(member.notes, /unverheiratet und ohne Verlobung/);
    assert.equal(family.partnerships.filter(relation => relation.participantIds.includes(id)).length, 0);
    assert.deepEqual(family.parentages.find(edge => edge.childId === id).parentIds, ['idwal-gwernant', 'gwenllian-spouse-gwernant']);
  }
  for (const id of ['mabli-spouse-gwernant', 'gwenllian-spouse-gwernant', 'nerys-spouse-gwernant']) {
    assert.equal(person(id).houseId, ''); assert.equal(person(id).familyRole, 'married');
    assert.match(person(id).notes, /Herkunft/);
  }
  assert.equal(person('idwal-gwernant').birth, '1688');
  assert.equal(person('gwenllian-spouse-gwernant').birth, '1691');
  const ids = new Set(family.persons.map(member => member.worldPersonId));
  for (const record of FAMILY_REGISTRY.filter(record => record.id !== family.document.id)) {
    for (const member of record.family.persons) assert.ok(!ids.has(member.worldPersonId));
  }
});

test('one current registry entry links the new commoner family, shared biography and local house page', () => {
  const matches = FAMILY_REGISTRY.filter(record => record.id === 'haus-gwernant');
  assert.equal(matches.length, 1); assert.equal(matches[0].type, 'commoner');
  assert.deepEqual(matches[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(matches[0].family.document.emblem, GWERNANT_EMBLEM);
  const bio = matches[0].family.extensions.houseBiographyModule;
  assert.match(bio.house.documents[0].link, /kleinehaeuser\.html\?haus=haus-gwernant$/);
  assert.equal(bio.pageTitle, 'Familie Gwernant');
  assert.equal(HOUSE_CONTENT.images.scene, '../Stammbäume/assets/images/portraits/haus-gwernant/catrin-gwernant.png');
  assert.match(HOUSE_CONTENT.images.sceneAlt, /Catrin Gwernant/);
  assert.equal(HOUSE_CONTENT.omitMilitaryProfile, true);
});

test('approved sales assignments are pure, preserve Rhys and Eirlys, and leave the unrelated shop unchanged', () => {
  const entry = buildGoettlicheEleganz();
  const sales = entry.pages[3].hierarchy.trees.find(tree => tree.id === 'verkauf');
  const advice = sales.levels.find(level => level.label === 'Beratung im Verkaufsraum').nodes;
  assert.deepEqual(advice.map(node => node.title), ['Rhys Maerllys', 'Eirlys Vann', 'Catrin Gwernant']);
  assert.deepEqual(sales.levels.find(level => level.label === 'Pflege des Hauses').nodes.map(node => node.title), ['Efa Gwernant']);
  assert.equal(sales.levels[0].nodes[0].title, 'Maelwen Coeddu');
  assert.equal(entry.pages.length, 6); assert.equal(entry.sessionCast.length, 7);
  assert.equal(entry.pages[4].tradeCatalog.items.length, 51);
  assert(!JSON.stringify(sales).includes('Falchdyn'));
  const trees = [{ id: 'verkauf', levels: [{ nodes: ELEGANZ_SALES_STAFF.map(staff => ({ id: staff.slotId, portrait: '', subtitle: 'Unbesetzter Posten' })) }] }, { id: 'unchanged', levels: [] }];
  const before = structuredClone(trees), rendered = addEleganzSalesStaff(trees);
  assert.deepEqual(trees, before);
  assert.strictEqual(rendered[1], trees[1]);
  assert.equal(rendered[0].levels[0].nodes.length, 3);
  for (const id of ['catrin-gwernant', 'efa-gwernant']) {
    const staff = ELEGANZ_SALES_STAFF.find(member => member.personId === id);
    assert.equal(staff.worldPersonId, person(id).worldPersonId);
    assert.equal(staff.portrait, `../Stammbäume/${person(id).portrait}`);
  }
});

test('generated house and biography match their single editorial source and all three commissioned images exist', async () => {
  const directory = new URL('../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwernant/', import.meta.url);
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('haus.data.js', directory), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.HAEUSER_DATA)), createHousePageData(HOUSE_CONTENT));
  const { HOUSE_BIOGRAPHY } = await import(new URL('haus.biography.mjs', directory));
  assert.deepEqual(HOUSE_BIOGRAPHY, createHouseBiography(HOUSE_CONTENT));
  for (const path of [GWERNANT_EMBLEM, person('catrin-gwernant').portrait, person('efa-gwernant').portrait]) {
    await access(new URL(`Stammbäume/${path}`, sourceRoot));
  }
  assert.equal(HOUSE_CONTENT.figures.length, 9);
});
