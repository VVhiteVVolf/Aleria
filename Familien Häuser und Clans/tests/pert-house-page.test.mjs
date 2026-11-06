import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { HOUSE_CONTENT as content } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Pert/haus.content.mjs';
import { HOUSE_BIOGRAPHY as biography } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Pert/haus.biography.mjs';
import { HOUSE_PERT_FAMILY as family } from '../../Stammbäume/assets/js/data/house-pert-family.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { hasNobleCourt } from '../modules/court/house-court-model.mjs';

const feature = new URL('../', import.meta.url);
const house = new URL('Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Pert/', feature);
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('haus.data.js', house), 'utf8'), context);
const page = context.window.HAEUSER_DATA;
const original = JSON.parse(readFileSync(new URL('pert-original.json', house), 'utf8'));
const named = family.persons.filter(person => !/^Unbekannt/i.test(person.name));

test('both Pert sources remain byte-identical and the source decisions preserve uncertainty', () => {
  const manifest = JSON.parse(readFileSync(new URL('source-manifest.json', house), 'utf8'));
  for (const source of manifest.sources) assert.equal(createHash('sha256').update(readFileSync(new URL(source.file, house))).digest('hex'), source.sha256);
  assert.equal(manifest.familyId, 'pert');
  assert.equal(manifest.houseId, 'house-pert');
  assert.ok(manifest.decisions.some(value => value.includes('älterer Charakterdatenbankeintrag Kevan Pert')));
  assert.ok(manifest.decisions.some(value => value.includes('Canna bleibt unknown')));
});

test('Pert remains a commoner family with a farm heir and sourced employment, without a new family ruler', () => {
  assert.equal(content.type, 'Bürgerliches Haus');
  assert.equal(content.profile.rank, 'Bürgerlich');
  assert.equal(content.profile.people, 'Cenyri');
  assert.equal(content.profile.religion, 'Alerische Kirche');
  assert.equal(content.profile.wealth, 'Beschaulich');
  assert.equal(content.profile.liege, 'Haus Draig');
  assert.equal(content.profile.motto, '');
  assert.equal(content.profile.patronDeities, '');
  assert.equal(content.currentHead, '');
  assert.equal(content.founder, null);
  assert.equal(content.heads.length, 0);
  assert.equal(content.offices.length, 7);
  assert.equal(content.heirs.length, 1);
  assert.equal(content.heirs[0].id, 'person-96cdce72');
  assert.equal(content.heirs[0].role, 'Hoferbe');
  assert.equal(content.parentHouseId, '');
  assert.equal(hasNobleCourt(page), false);
  assert.deepEqual(Array.from(page.hiddenProfileGroups), ['military']);
});

test('the complete source history and both branches remain in the house article and biography', () => {
  for (const phrase of ['Iorwerth', 'Gwerfyl', 'Idwal', 'Mared Maesglas', '1720', 'Goronvy', 'Lowri', 'Kevan', 'Rhiain', 'Geraint', 'Bethan', 'Ceitheach']) assert.ok(content.sections.history.includes(phrase), phrase);
  for (const phrase of ['Ackerbau', 'Rinder', 'Milchwirtschaft', 'Pferde', 'Stallungen', 'Wirtschaftsgebäude', 'Anstellungen und Einkünfte']) assert.ok(content.sections.holdings.includes(phrase), phrase);
  assert.match(content.sections.traditions, /Gemeinsame Mahlzeiten/);
  assert.match(content.sections.traditions, /entfernte Verwandte/);
  assert.match(content.sections.conflictsAlliances, /politische Feindschaften.*einzelnen Menschen/s);
  assert.match(content.sections.values, /gegenseitige Verantwortung/);
  assert.match(content.sections.overview, /goldenes Füllhorn/);
  const bio = JSON.stringify(biography);
  for (const phrase of ['Castell Draig', 'Hof Maesglas', '1720', 'Rinder', 'Milchwirtschaft', 'Donnchadh', 'Ceitheach', 'Gastfreundschaft']) assert.ok(bio.includes(phrase), phrase);
});

test('all seventeen named relatives retain real canonical person links and original life dates', () => {
  assert.equal(family.persons.length, 19);
  assert.equal(named.length, 17);
  assert.deepEqual(content.figures.map(person => person.id), named.map(person => person.id));
  assert.equal(page.figures.entries.length, 17);
  for (const person of named) {
    const source = original.persons.find(source => source.id === person.id);
    for (const key of ['name', 'birth', 'death', 'status']) assert.equal(person[key], source[key], `${person.id}/${key}`);
    const card = content.figures.find(card => card.id === person.id);
    assert.equal(card.familyId, 'pert');
    assert.ok(card.description);
    assert.ok(existsSync(new URL(card.image, feature)), card.image);
    const image = Object.values(page.images).find(image => image.href?.endsWith(`&person=${person.id}`));
    assert.ok(image, person.id);
    assert.equal(new URL(image.href, 'https://aleria.example/Familien/').searchParams.get('family'), 'pert');
  }
  assert.equal(family.persons.find(person => person.id === 'person-3a869794').sex, 'female');
  assert.equal(family.persons.find(person => person.id === 'person-cf926021').sex, 'unknown');
  const roisin = family.parentages.find(parentage => parentage.childId === 'person-618119d8');
  assert.deepEqual(roisin.parentIds, ['person-4ee10c57']);
  assert.equal(roisin.legitimacy, 'legitimized');
});

test('Pert house, biography and registry share local art and canonical compact-tree links without a shop', () => {
  const registryContext = { window: {} };
  vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
  const entries = registryContext.window.HAEUSER_REGISTRY.filter(row => row.id === 'pert');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].page, 'kleinehaeuser.html');
  assert.equal(registryContext.window.HAEUSER_REGISTRY.some(row => row.id === 'haus-pert'), false);
  assert.equal(page.familyTreeEmbed.src, '../Stammb%C3%A4ume/Stammbaum.html?family=pert&mode=view&embed=1');
  assert.equal(page.figures.mobileLayout, 'stacked');
  assert.equal(Object.hasOwn(page.images['haus-hauptbild'], 'href'), false);
  const treeRoot = new URL('../../Stammbäume/', import.meta.url);
  assert.deepEqual(readFileSync(new URL(content.images.crest, feature)), readFileSync(new URL(family.document.emblem, treeRoot)));
  assert.deepEqual(readFileSync(new URL(biography.image, treeRoot)), readFileSync(new URL(content.images.scene, feature)));
  for (const image of Object.values(page.images)) if (image.src) assert.ok(existsSync(new URL(image.src, feature)), image.src);
  assert.equal(biography.house.documents.length, 1);
  assert.equal(new URL(biography.house.documents[0].link, 'https://aleria.example/Stammbäume/').searchParams.get('haus'), 'pert');
  assert.equal(content.relatedRecords, undefined);
});

test('registered biography preserves the complete Pert graph and generated outputs match their authoring', () => {
  const records = FAMILY_REGISTRY.filter(record => record.id === 'pert');
  assert.equal(records.length, 1);
  for (const key of ['persons', 'partnerships', 'parentages', 'timeJumps', 'lineage']) assert.deepEqual(records[0].family[key], family[key], key);
  assert.equal(records[0].family.extensions.houseBiographyModule.pageTitle, 'Familie Pert');
  assert.deepEqual(createHouseBiography(content), biography);
  assert.deepEqual(JSON.parse(JSON.stringify(createHousePageData(content))), JSON.parse(JSON.stringify(page)));
});
