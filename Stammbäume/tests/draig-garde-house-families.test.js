import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { DRAIG_GARDE_PEOPLE } from '../assets/js/data/draig-garde-people.js';
import { DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS, DRAIG_GARDE_COMMONER_HOUSE_FAMILIES, HOUSE_BRONNOR_FAMILY } from '../assets/js/data/draig-garde-house-families.js';
import { TAL_DER_MILANE_HOUSE_EMBLEMS, TAL_DER_MILANE_HOUSE_PROFILES } from '../assets/js/data/tal-der-milane-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from '../assets/js/data/blank-house-family-factory.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';

const families = [...DRAIG_GARDE_COMMONER_HOUSE_FAMILIES, HOUSE_BRONNOR_FAMILY];
const getPerson = (family, id) => family.persons.find(person => person.id === id);

test('Fünf neue Bürgerhäuser sind in Gwynthor registriert; Bronnor bleibt das bestehende Ritterhaus', () => {
  assert.deepEqual(DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS.map(record => record.slug), ['brandyddyn', 'curiad', 'caelrith', 'myrgath', 'aelgorn']);
  for (const family of families) {
    const record = FAMILY_REGISTRY.find(record => record.id === family.document.id);
    assert.ok(record, family.document.id);
    assert.equal(FAMILY_REGISTRY.filter(record => record.id === family.document.id).length, 1);
    const checked = assertValidFamily(record.family);
    assert.deepEqual(checked.diagnostics, []);
    assert.deepEqual(auditFamilyChartLayoutPolicy(checked.family).issues, []);
    assert.equal(checked.family.persons.length, family.persons.length);
    if (family.document.id === 'haus-bronnor') {
      assert.deepEqual(record.houseProfile, TAL_DER_MILANE_HOUSE_PROFILES.bronnor);
      assert.equal(record.houseProfile.rankId, 'knight');
      assert.equal(record.family.document.emblem, TAL_DER_MILANE_HOUSE_EMBLEMS.bronnor);
      assert.equal(record.family.lineage.crestFrame, 'silver');
    } else {
      assert.deepEqual(record.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
      assert.equal(record.houseProfile.rankId, 'commoner');
      assert.equal(record.family.lineage.crestFrame, 'iron');
    }
  }
});

test('Unbekannte Gründer, Hauswappen und genau ein serieller Zeitsprung gehen den Mitgliedern voraus', () => {
  for (const family of families) {
    const checked = assertValidFamily(family).family;
    const founders = checked.partnerships.find(pair => pair.id === checked.lineage.founderPartnershipId);
    assert.deepEqual(founders.participantIds.map(id => getPerson(checked, id).name), ['Unbekannter Gründer', 'Unbekannte Gründerin']);
    assert.equal(checked.timeJumps.length, 1);
    const jump = checked.timeJumps[0];
    assert.equal(jump.parentPartnershipId, founders.id);
    assert.ok(jump.childIds.length > 0);
    assert.ok(jump.childIds.every(id => !checked.parentages.some(link => link.childId === id)));
    const chart = toFamilyChartData(checked);
    assert.deepEqual(chart.diagnostics, []);
    const crest = chart.data.find(node => node.data.nodeKind === 'house-crest');
    const gap = chart.data.find(node => node.data.nodeKind === 'time-jump');
    assert.deepEqual(crest.rels.parents.sort(), [...founders.participantIds].sort());
    assert.deepEqual(gap.rels.parents, [crest.id]);
    assert.deepEqual(gap.rels.children.sort(), [...jump.childIds].sort());
    for (const id of jump.childIds) assert.deepEqual(chart.data.find(node => node.id === id).rels.parents, [gap.id]);
  }
});

test('Eurgains Elternschaft ist in beiden Gegenakten identisch, ohne eine Ehe oder Legitimität zu erfinden', () => {
  const brandyddyn = families.find(family => family.document.id === 'haus-brandyddyn');
  for (const family of [brandyddyn, HOUSE_BRONNOR_FAMILY]) {
    assert.equal(family.parentages.length, 1);
    const parentage = family.parentages[0];
    assert.equal(parentage.childId, 'eurgain-brandyddyn');
    assert.deepEqual(parentage.parentIds, ['pellinard-brandyddyn', 'ysabel-bronnor']);
    assert.equal(parentage.type, 'biological');
    assert.equal(parentage.legitimacy, 'unknown');
    assert.equal(parentage.partnershipId, '');
    assert.equal(family.partnerships.length, 1);
    assert.equal(family.cadetBranches.length, 0);
    assert.equal(getPerson(family, 'ysabel-bronnor').houseId, 'house-bronnor');
    assert.equal(getPerson(family, 'eurgain-brandyddyn').houseId, 'house-brandyddyn');
  }
  assert.deepEqual(brandyddyn.parentages, HOUSE_BRONNOR_FAMILY.parentages);
  for (const id of ['pellinard-brandyddyn', 'ysabel-bronnor', 'eurgain-brandyddyn']) {
    assert.deepEqual(getPerson(brandyddyn, id), getPerson(HOUSE_BRONNOR_FAMILY, id));
  }
});

test('Die drei Curiad sind keine erfundenen Geschwister; Altersschätzungen erzeugen keine Lebensdaten', () => {
  const curiad = families.find(family => family.document.id === 'haus-curiad');
  assert.equal(curiad.persons.length, 5);
  assert.deepEqual(curiad.parentages, []);
  assert.deepEqual(curiad.timeJumps[0].childIds, ['marared-curiad', 'mathon-curiad', 'morcant-curiad']);
  assert.equal(DRAIG_GARDE_PEOPLE.length, 9);
  assert.equal(new Set(DRAIG_GARDE_PEOPLE.map(person => person.worldPersonId)).size, 9);
  for (const source of DRAIG_GARDE_PEOPLE) {
    assert.match(source.ageEstimate, /^etwa \d+–\d+ Jahre$/);
    for (const family of families.filter(family => getPerson(family, source.id))) {
      const person = getPerson(family, source.id);
      assert.equal(person.birth, '');
      assert.equal(person.death, '');
      assert.equal(person.extensions.ageEstimate, source.ageEstimate);
      assert.equal(person.worldPersonId, source.worldPersonId);
    }
  }
  assert.equal(getPerson(curiad, 'mathon-curiad').extensions.almanachCharacterId, 'HWUuhs0eUIaWLQ5IwdE2');
});

test('Bronnors bestehende Gründer und eigene Notizen bleiben beim wiederholten Upgrade erhalten', () => {
  const prior = createFounderPlaceholderHouseFamily({
    id: 'haus-bronnor', title: 'Haus Bronnor', emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.bronnor,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.bronnor
  });
  const local = structuredClone(prior);
  local.document.motto = 'Eigene Devise';
  local.persons[0].notes = 'Eigene Gründernotiz';
  local.persons[1].name = 'Eigener Gründerinnenname';
  const upgraded = resolveRegisteredFamilyUpgrade(HOUSE_BRONNOR_FAMILY, local);
  assert.deepEqual(assertValidFamily(upgraded).diagnostics, []);
  assert.equal(upgraded.document.motto, 'Eigene Devise');
  assert.equal(upgraded.persons.find(person => person.id === local.persons[0].id).notes, 'Eigene Gründernotiz');
  assert.equal(upgraded.persons.find(person => person.id === local.persons[1].id).name, 'Eigener Gründerinnenname');
  assert.deepEqual(upgraded.persons.slice(0, 2).map(person => person.id), prior.persons.map(person => person.id));
  assert.deepEqual(resolveRegisteredFamilyUpgrade(HOUSE_BRONNOR_FAMILY, upgraded), upgraded);
});

test('Neue Portraits und Wappen sind lokal vorhanden und alle fünf Häuser stehen im Bürgerregister', async () => {
  for (const family of families) {
    await access(new URL('../' + family.document.emblem, import.meta.url));
    for (const person of family.persons.filter(person => person.portrait)) await access(new URL('../' + person.portrait, import.meta.url));
  }
  const county = await readFile(new URL('../../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/grafschaft.data.js', import.meta.url), 'utf8');
  const commoners = county.slice(county.indexOf('familySection("Bürgerliche Häuser'), county.indexOf('familySection("Ausgestorbene Häuser'));
  for (const definition of DRAIG_GARDE_COMMONER_HOUSE_DEFINITIONS) assert.ok(commoners.includes(`"haus-${definition.slug}"`));
  assert.ok(!commoners.includes('"haus-bronnor"'));
});
