import test from 'node:test';
import assert from 'node:assert/strict';
import { RORIKSHEIM_DEPENDENT_HOUSE_FAMILIES, RORIKSHEIM_HUSKARL_CLAN_DEFINITIONS } from '../assets/js/data/roriksheim-house-families.js';
import { RORIKSHEIM_HOUSE_EMBLEMS, RORIKSHEIM_HOUSE_PROFILES } from '../assets/js/data/roriksheim-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from '../assets/js/data/blank-house-family-factory.js';
import { extendRorikshallSkalliRetinueFamily } from '../assets/js/data/rorikshall-skalli-retinue-families.js';
import { HOUSE_VARULV_FAMILY } from '../assets/js/data/house-varulv-family.js';
import { HOUSE_EISENJUNGFER_FAMILY } from '../assets/js/data/house-eisenjungfer-family.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';

const familyById = id => RORIKSHEIM_DEPENDENT_HOUSE_FAMILIES.find(family => family.document.id === id);

test('Skallis neue Angehörige erweitern genau ihre drei bestehenden Huskarlakten', () => {
  const expected = new Map([
    ['haus-baerenherz', ['ragna-baerenherz', 'svala-baerenherz']],
    ['haus-rotstahl', ['torben-rotstahl', 'kjell-rotstahl']],
    ['haus-unholdbann', ['hakon-unholdbann']]
  ]);
  for (const definition of RORIKSHEIM_HUSKARL_CLAN_DEFINITIONS) {
    const id = `haus-${definition.slug}`;
    const base = createFounderPlaceholderHouseFamily({ id, title: definition.title,
      emblem: RORIKSHEIM_HOUSE_EMBLEMS[definition.slug], houseProfile: RORIKSHEIM_HOUSE_PROFILES[definition.slug] });
    if (!expected.has(id)) {
      assert.equal(extendRorikshallSkalliRetinueFamily(base), base);
      continue;
    }
    const actual = familyById(id);
    const { family } = assertValidFamily(actual);
    assert.equal(family.lineage.crestFrame, 'silver');
    for (const founder of base.persons) assert.deepEqual(actual.persons.find(person => person.id === founder.id), founder);
    assert.deepEqual(actual.partnerships, base.partnerships);
    const named = family.persons.filter(person => person.name !== '???');
    assert.deepEqual(named.map(person => person.id), expected.get(id));
    for (const person of named) {
      assert.equal(person.worldPersonId, `person--${id}--${person.id}`);
      const finalPortrait = person.id === 'svala-baerenherz' ? 'svala-baerenherz-v2' : person.id;
      assert.equal(person.portrait, `assets/images/portraits/${id}/${finalPortrait}.png`);
      assert.ok(person.tags.includes('Unverheiratet'));
      assert.ok(!family.partnerships.some(partnership => partnership.participantIds.includes(person.id)));
    }
  }
});

test('Die Bärenherz-Schwestern teilen unbenannte Eltern und keine erfundene Gründerabstammung', () => {
  const source = familyById('haus-baerenherz');
  const family = assertValidFamily(source).family;
  const graph = createFamilyGraph(family);
  assert.equal(graph.describeConnection('ragna-baerenherz', 'svala-baerenherz'), 'Geschwister');
  const parents = graph.getParents('ragna-baerenherz');
  assert.equal(parents.length, 2);
  assert.ok(parents.every(person => person.name === '???' && !person.birth && !person.death && person.extensions.structuralPlaceholder));
  assert.deepEqual(graph.getParents('svala-baerenherz').map(person => person.id), parents.map(person => person.id));
  assert.equal(graph.getAncestors('ragna-baerenherz').length, 2);
  assert.ok(parents.every(parent => !family.partnerships.some(partnership => partnership.participantIds.includes(parent.id))));
  const { data } = toFamilyChartData(family);
  assert.deepEqual(data.find(person => person.id === 'svala-baerenherz').rels.parents.slice().sort(), parents.map(person => person.id).sort());
});

test('Kjells noch unbestimmte Vetternschaft erfindet keine Eltern oder Clanlinie', () => {
  const family = assertValidFamily(familyById('haus-rotstahl')).family;
  assert.equal(family.parentages.length, 0);
  assert.equal(family.persons.find(person => person.id === 'torben-rotstahl').birth, '1714');
  const kjell = family.persons.find(person => person.id === 'kjell-rotstahl');
  assert.equal(kjell.birth, '1726');
  assert.equal(kjell.title, 'Drengr von Torben Rotstahl');
  assert.match(kjell.notes, /Vetter vorgesehen/);
});

test('Gundels Maer-Ergänzung erhält Daten, Abstammung und redaktionelle Änderungen anderer Varulv', () => {
  const registered = assertValidFamily(HOUSE_VARULV_FAMILY).family;
  const previous = structuredClone(registered);
  previous.extensions.sourceRevision = 4;
  const gundel = previous.persons.find(person => person.id === 'gundel-varulv');
  gundel.title = ''; gundel.tags = []; gundel.notes = '';
  previous.persons.find(person => person.id === 'fenrir-varulv').notes = 'Bestehende persönliche Notiz';
  const updated = resolveRegisteredFamilyUpgrade(registered, previous);
  const current = updated.persons.find(person => person.id === gundel.id);
  assert.equal(current.title, 'Maer von Skalli Varulv');
  assert.equal(current.worldPersonId, gundel.worldPersonId);
  assert.equal(current.birth, '1725');
  assert.equal(updated.persons.find(person => person.id === 'fenrir-varulv').notes, 'Bestehende persönliche Notiz');
  assert.deepEqual(updated.parentages, previous.parentages);
  assert.deepEqual(updated.partnerships, previous.partnerships);
  assertValidFamily(updated);
});

test('Eisenjungfer-Porträts füllen leere Felder und erhalten vorhandene lokale Porträts', () => {
  const registered = assertValidFamily(HOUSE_EISENJUNGFER_FAMILY).family;
  const previous = structuredClone(registered);
  previous.extensions.sourceRevision = 2;
  previous.persons.find(person => person.id === 'aslaug-eisenjungfer').portrait = '';
  previous.persons.find(person => person.id === 'eira-eisenjungfer').portrait = 'assets/images/eigene-eira.png';
  previous.persons.find(person => person.id === 'hildigunn-eisenjungfer').notes = 'Bestehende persönliche Notiz';
  const updated = resolveRegisteredFamilyUpgrade(registered, previous);
  assert.equal(updated.persons.find(person => person.id === 'aslaug-eisenjungfer').portrait, 'assets/images/portraits/haus-eisenjungfer/aslaug-eisenjungfer-v2.png');
  assert.equal(updated.persons.find(person => person.id === 'eira-eisenjungfer').portrait, 'assets/images/eigene-eira.png');
  assert.equal(updated.persons.find(person => person.id === 'hildigunn-eisenjungfer').notes, 'Bestehende persönliche Notiz');
  assert.deepEqual(updated.parentages, previous.parentages);
  assert.deepEqual(updated.partnerships, previous.partnerships);
  assertValidFamily(updated);
});
