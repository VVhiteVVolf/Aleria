#!/usr/bin/env node

import assert from 'node:assert/strict';
import { HOUSE_ARWYDD_FAMILY } from '../../Stammbäume/assets/js/data/house-arwydd-family.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { createFamilyViewLink } from '../../Stammbäume/assets/js/services/family-links.js';
import {
  buildFamilyPersonViewUrl,
  buildImportedCharacter,
  createFamilyCandidates
} from '../modules/character-genealogy/genealogy-mapping.js';
import {
  extractBirthYear,
  findBestCharacterMatch,
  normalizePersonName
} from '../modules/character-genealogy/person-identity.js';

const family = normalizeFamily(HOUSE_ARWYDD_FAMILY);
const record = {
  id: 'haus-arwydd',
  title: 'Haus Arwydd',
  folderPath: ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn'],
  releaseId: 'r-test',
  publishedAt: '2026-07-16T12:00:00.000Z',
  source: 'project',
  family
};
const candidates = createFamilyCandidates(record);
const idris = candidates.find(candidate => candidate.personId === 'idris-arwydd');

assert.ok(idris, 'Idris muss als importierbare Stammbaum-Person vorhanden sein.');
assert.equal(idris.displayName, 'Idris Arwydd', 'Der Hausname wird bei Kernmitgliedern als Nachname ergänzt.');
assert.equal(idris.worldPersonId, 'person--haus-arwydd--idris-arwydd');
assert.deepEqual(idris.relationships.parents.map(person => person.name), ['Idwalladr Arwydd', 'Carys']);
assert.deepEqual(idris.relationships.partners.map(person => person.name), ['Deliah Mwyalchen']);
assert.equal(idris.relationships.partners[0].type, 'marriage');
assert.deepEqual(idris.relationships.children.map(person => person.name), [
  'Ianto Arwydd',
  'Izolda Arwydd',
  'Ieuan Arwydd',
  'Izobel Arwydd',
  'Iorwerth Arwydd'
]);

assert.equal(normalizePersonName('Ídris  Arwydd'), 'idris arwydd');
assert.equal(extractBirthYear('* 1687'), 1687);
assert.equal(extractBirthYear('????'), null);

const datedIdris = { ...idris, birth: '1687', birthYear: 1687 };
const probable = findBestCharacterMatch(datedIdris, [{
  id: 'existing-idris',
  name: 'Idris Arwydd',
  genealogy: { birth: '1687' }
}]);
assert.equal(probable.kind, 'probable');
assert.equal(probable.score, 90);

const conflict = findBestCharacterMatch(datedIdris, [{
  id: 'other-idris',
  name: 'Idris Arwydd',
  genealogy: { birth: '1660' }
}]);
assert.equal(conflict.kind, 'conflict', 'Gleiche Namen mit abweichendem Geburtsjahr dürfen nicht automatisch verknüpft werden.');

assert.equal(findBestCharacterMatch({ ...datedIdris, displayName: 'Carys' }, [{
  id: 'some-carys',
  name: 'Carys',
  genealogy: { birth: '1687' }
}]), null, 'Ein einzelner Vorname reicht nicht für eine wahrscheinliche Identität.');

const linked = findBestCharacterMatch(idris, [{
  id: 'linked-idris',
  name: 'Idris ap Arwydd',
  identity: { worldPersonId: idris.worldPersonId },
  genealogy: { birth: '1600' }
}]);
assert.equal(linked.kind, 'linked', 'Die feste Personen-ID hat Vorrang vor veränderlichen Namen und Daten.');

const imported = buildImportedCharacter(idris, {
  id: 'existing-idris',
  name: 'Idris Arwydd',
  bio: 'Bereits im Almanach gepflegte Biografie.',
  title: 'Bewahrer von Castellbryn',
  genealogy: { birth: '1687', sources: [] }
}, '2026-07-16T13:00:00.000Z');
assert.equal(imported.bio, 'Bereits im Almanach gepflegte Biografie.');
assert.equal(imported.title, 'Bewahrer von Castellbryn');
assert.equal(imported.genealogy.birth, '1687');
assert.equal(imported.genealogy.houseName, 'Haus Arwydd');
assert.equal(imported.genealogy.relationships.children[0].legitimacy, 'legitimate');
assert.equal(imported.identity.worldPersonId, idris.worldPersonId);
assert.equal(imported.genealogy.sources.length, 1);
assert.match(imported.genealogy.sources[0].url, /family=haus-arwydd/);
assert.match(imported.genealogy.sources[0].url, /person=idris-arwydd/);
assert.equal(buildFamilyPersonViewUrl(idris), imported.genealogy.sources[0].url);
assert.equal(
  createFamilyViewLink('haus-arwydd', 'idris-arwydd'),
  'Stammbaum.html?family=haus-arwydd&mode=view&person=idris-arwydd'
);

console.log('Character-genealogy checks passed.');
