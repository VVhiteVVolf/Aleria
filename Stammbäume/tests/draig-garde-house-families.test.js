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
import { calculateAge } from '../assets/js/domain/person-presentation.js';
import previousFamilies from './fixtures/gwynthor-warrior-families-before.json' with { type: 'json' };

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
    assert.equal(jump.childIds.length, 1);
    if (family.document.id !== 'haus-bronnor') assert.equal(getPerson(checked, jump.childIds[0]).status, 'dead');
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

test('Pellinards und Ysabels drei Kinder stimmen in beiden Hausakten überein', () => {
  const brandyddyn = families.find(family => family.document.id === 'haus-brandyddyn');
  const children = ['eurgain-brandyddyn', 'aelwryd-brandyddyn', 'gwrgant-brandyddyn'];
  const parentIds = ['pellinard-brandyddyn', 'ysabel-bronnor'];
  for (const family of [brandyddyn, HOUSE_BRONNOR_FAMILY]) {
    const branches = family.parentages.filter(link => link.parentIds.includes('ysabel-bronnor'));
    assert.deepEqual(branches.map(link => link.childId), children);
    assert.ok(branches.every(link => link.type === 'biological' && link.legitimacy === 'unknown'));
    for (const link of branches) assert.deepEqual(link.parentIds, parentIds);
    const marriage = family.partnerships.find(partnership => partnership.id === branches[0].partnershipId);
    assert.equal(marriage.type, 'marriage');
    assert.equal(marriage.certainty, 'confirmed');
    assert.equal(marriage.start, '');
    assert.deepEqual(marriage.participantIds, parentIds);
    assert.deepEqual(children.map(id => calculateAge(getPerson(family, id))), [25, 23, 19]);
    assert.equal(getPerson(family, 'ysabel-bronnor').houseId, 'house-bronnor');
    assert.equal(getPerson(family, 'eurgain-brandyddyn').houseId, 'house-brandyddyn');
  }
  for (const id of [...parentIds, ...children]) {
    assert.equal(getPerson(brandyddyn, id).worldPersonId, getPerson(HOUSE_BRONNOR_FAMILY, id).worldPersonId);
    assert.equal(getPerson(brandyddyn, id).portrait, getPerson(HOUSE_BRONNOR_FAMILY, id).portrait);
  }
  assert.equal(getPerson(brandyddyn, 'ysabel-bronnor').familyRole, 'married');
  assert.equal(getPerson(HOUSE_BRONNOR_FAMILY, 'ysabel-bronnor').familyRole, 'core');
  assert.equal(getPerson(brandyddyn, 'pellinard-brandyddyn').title, 'Erbe');
  assert.equal(brandyddyn.persons.find(person => person.lineageRole === 'head').name, 'Ceredryn Brândyddyn');
});

test('Die früheren Stammbaumstände erhalten die neuen Zweige und bewahren lokale Notizen', () => {
  for (const old of previousFamilies) {
    const previous = structuredClone(old);
    const family = families.find(row => row.document.id === previous.document.id);
    previous.document.motto = 'Eigene Devise';
    previous.persons[2].notes = 'Eigener Eintrag';
    const upgraded = resolveRegisteredFamilyUpgrade(family, previous);
    assert.equal(upgraded.persons.length, family.persons.length);
    assert.equal(upgraded.document.motto, previous.document.motto);
    assert.equal(getPerson(upgraded, previous.persons[2].id).notes, 'Eigener Eintrag');
    assert.deepEqual(upgraded.timeJumps[0].childIds, family.timeJumps[0].childIds);
    assert.deepEqual(auditFamilyChartLayoutPolicy(upgraded).issues, []);
    assert.deepEqual(toFamilyChartData(assertValidFamily(upgraded).family).diagnostics, []);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(family, upgraded), upgraded);
  }
});

test('Die vorhandenen Figuren behalten ihre Identitäten und Portraits', () => {
  const curiad = families.find(family => family.document.id === 'haus-curiad');
  for (const id of ['mathon-curiad', 'morcant-curiad']) {
    assert.ok(curiad.parentages.find(link => link.childId === id).parentIds.includes('marared-curiad'));
  }
  assert.equal(DRAIG_GARDE_PEOPLE.length, 9);
  assert.equal(new Set(DRAIG_GARDE_PEOPLE.map(person => person.worldPersonId)).size, 9);
  const gwendolyn = FAMILY_REGISTRY.find(record => record.id === 'haus-aderyn').family.persons
    .find(person => person.id === 'gwendolyn-aderyn');
  for (const source of DRAIG_GARDE_PEOPLE) {
    for (const family of families.filter(family => getPerson(family, source.id))) {
      const person = getPerson(family, source.id);
      if (source.id === 'ysabel-bronnor') {
        assert.equal(person.birth, gwendolyn.birth);
        assert.equal(person.extensions.ageEstimate, undefined);
      } else if (source.id !== 'eurgain-brandyddyn') {
        assert.match(source.ageEstimate, /^etwa \d+–\d+ Jahre$/);
        assert.equal(person.birth, '');
        assert.equal(person.extensions.ageEstimate, source.ageEstimate);
      }
      assert.equal(person.death, '');
      assert.equal(person.worldPersonId, source.worldPersonId);
      assert.equal(person.portrait, source.portrait);
    }
  }
  assert.equal(getPerson(curiad, 'mathon-curiad').extensions.almanachCharacterId, 'HWUuhs0eUIaWLQ5IwdE2');
});

test('Die neuen Linien bestehen aus datierten ehelichen Haushalten und offenen Wegheiraten', () => {
  const names = new Set();
  for (const family of DRAIG_GARDE_COMMONER_HOUSE_FAMILIES) {
    assert.ok(family.persons.length >= 35 && family.persons.length <= 40);
    assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 1);
    assert.equal(family.persons.filter(person => person.title === 'Erbe').length, 1);
    for (const person of family.persons) {
      if (person.extensions.authoredSource === 'gwynthor-warrior-families-20261124') {
        const givenName = person.name.split(' ')[0].toLowerCase();
        assert.ok(!names.has(givenName), givenName);
        names.add(givenName);
        if (family.document.id !== 'haus-brandyddyn') assert.equal(person.portrait, '');
        if (person.extensions.appearance?.hairColor === 'grau') assert.ok(calculateAge(person) >= 64);
      }
      if (person.id.startsWith('partner-')) {
        assert.match(person.name, /^Unbekannte?r? Partner(in)?$/);
        assert.equal(person.portrait, '');
      }
    }
    for (const partnership of family.partnerships) {
      assert.equal(partnership.type, 'marriage');
      for (const id of partnership.participantIds) {
        const person = getPerson(family, id);
        const age = calculateAge(person);
        assert.ok(age === null || age >= 25, id);
        if (partnership.start && person.birth) assert.ok(Number(partnership.start) - Number(person.birth) >= 25, id);
      }
    }
    for (const link of family.parentages) {
      assert.equal(link.type, 'biological');
      assert.notEqual(link.legitimacy, 'illegitimate');
      const child = getPerson(family, link.childId);
      const pair = family.partnerships.find(pair => pair.id === link.partnershipId);
      assert.ok(pair);
      if (!child.birth) continue;
      if (pair.start) assert.ok(Number(child.birth) >= Number(pair.start), child.id);
      for (const id of link.parentIds) {
        const parent = getPerson(family, id);
        if (parent.birth) assert.ok(Number(child.birth) - Number(parent.birth) >= 18, child.id);
        if (parent.death) assert.ok(Number(child.birth) < Number(parent.death), child.id);
      }
    }
    assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away' && branch.targetFamilyId === 'haus-unbekannt'));
  }
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
