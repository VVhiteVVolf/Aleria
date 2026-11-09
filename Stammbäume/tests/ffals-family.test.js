import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { HOUSE_FFALS_FAMILY as family } from '../assets/js/data/house-ffals-family.js';
import { validateFamily } from '../assets/js/domain/family-schema.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { HOUSE_CONTENT } from '../../Familien Häuser und Clans/Estryll/Venalys/Familie_Ffals/haus.content.mjs';

test('Die echte Ffals-Familie ist genau einmal unter ihrem heutigen Wohnort registriert', () => {
  assert.deepEqual(validateFamily(family).diagnostics, []);
  const records = FAMILY_REGISTRY.filter(record => record.id === 'haus-ffals');
  assert.equal(records.length, 1);
  assert.equal(records[0].type, 'commoner');
  assert.equal(records[0].houseProfile.kingdom, 'Venalys');
  assert.equal(records[0].additionalPlacements.length, 0);
});

test('Vier echte lebende Angehörige bleiben von den vier Onlinefiguren getrennt', () => {
  const living = family.persons.filter(person => person.status === 'alive');
  assert.deepEqual(living.map(person => person.name).sort(), ['Alwyn Ffals', 'Bryn Ffals', 'Rhun Ffals', 'Seren Ffals']);
  assert.equal(family.persons.length, 7);
  assert.equal(family.persons.filter(person => person.status === 'dead').length, 1);
  for (const person of family.persons) {
    assert.equal(person.portrait, '');
    assert.equal(person.birth, '');
    assert.equal(person.death, '');
    assert.match(person.worldPersonId, /^person--haus-ffals--/);
    assert.ok(!('characterId' in person.extensions));
  }
});

test('Witwerschaft, erwachsene Kinder und jüngerer Bruder bleiben im Graphen erhalten', () => {
  const partner = family.partnerships.find(item => item.participantIds.includes('alwyn-ffals-echt'));
  assert.equal(partner.status, 'ended');
  const children = family.parentages.filter(item => item.parentIds.includes('alwyn-ffals-echt'));
  assert.deepEqual(children.map(item => item.childId).sort(), ['rhun-ffals-echt', 'seren-ffals-echt']);
  assert.ok(children.every(item => item.parentIds.includes('unbenannte-gemahlin-alwyn-ffals')));
  const brothers = family.parentages.filter(item => ['alwyn-ffals-echt', 'bryn-ffals-echt'].includes(item.childId));
  assert.equal(brothers.length, 2);
  assert.deepEqual(brothers[0].parentIds, brothers[1].parentIds);
  assert.ok(brothers.every(item => item.certainty === 'unknown'));
  assert.equal(family.partnerships[0].type, 'union', 'No undocumented marriage is inferred for the unnamed parents.');
  assert.equal(family.cadetBranches.length, 0);
  assert.equal(family.timeJumps.length, 0);
});

test('Öffentliche Familienquellen enthalten weder Fallgeheimnis noch erfundene Porträts', async () => {
  const publicText = JSON.stringify([family, HOUSE_CONTENT]);
  assert.doesNotMatch(publicText, /Keller|gefangen|Betrüger|Hehler|Entführung|angenommene Identitäten/i);
  assert.equal(HOUSE_CONTENT.images.scene, '');
  assert.ok(HOUSE_CONTENT.figures.every(person => person.image === ''));
  assert.match(HOUSE_CONTENT.sections.history, /genauer Grad jedoch nicht/);
  await access(new URL(`../${family.document.emblem}`, import.meta.url));
  const page = await readFile(new URL('../../Familien Häuser und Clans/Estryll/Venalys/Familie_Ffals/haus.data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /Keller|gefangen|Betrüger|Hehler|Entführung/i);
});
