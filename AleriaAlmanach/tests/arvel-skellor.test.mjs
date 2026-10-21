import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { HOUSE_SKELLOR_FAMILY as family } from '../../Stammbäume/assets/js/data/house-skellor-family.js';
import { createExtinctPlaceholderHouseFamily } from '../../Stammbäume/assets/js/data/blank-house-family-factory.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { buildZitteraaleCharacters } from '../modules/schwarze-zitteraale/zitteraale-characters.mjs';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { upgradeZitteraaleEntry } from '../modules/schwarze-zitteraale/zitteraale-migration.mjs';
import { ARVEL_CHARACTER_ID, ARVEL_WORLD_PERSON_ID, SKELLOR_PEOPLE } from '../modules/schwarze-zitteraale/skellor-people.mjs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
const oldBiographies = JSON.parse(await readFile(new URL('./fixtures/skellor-merek-house-biographies-v2.json', import.meta.url), 'utf8'));

test('Skellor has one serial origin gap, two lines and only Arvel surviving the old household', () => {
  assertValidFamily(family);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.deepEqual(family.timeJumps[0].childIds, ['caradog-skellor']);
  assert.deepEqual(family.parentages.filter(p => p.parentIds.includes('caradog-skellor')).map(p => p.childId), ['rhydan-skellor', 'cadfan-skellor']);
  assert.deepEqual(SKELLOR_PEOPLE.filter(p => !p.death).map(p => p.id), ['arvel-skellor']);
  assert.ok(SKELLOR_PEOPLE.filter(p => p.death).every(p => Number(p.death) <= 1720));
  assert.equal(family.cadetBranches.some(b => b.linkType === 'line-extinct'), false);
  assert.equal(family.houses[0].status, 'active');
});

test('forced relationships retain three unknown victims and two separate nonresident sons', () => {
  const forced = family.partnerships.filter(p => p.type === 'forced');
  assert.equal(forced.length, 3);
  for (const relation of forced) {
    const victim = family.persons.find(p => relation.participantIds.includes(p.id) && p.sex === 'female');
    assert.equal(victim.name, 'Unbekannt');
    assert.equal(victim.familyRole, 'forced');
    assert.match(relation.notes, /Keine Ehe, keine Affäre/);
  }
  const sons = family.persons.filter(p => p.familyRole === 'bastard');
  assert.deepEqual(sons.map(p => 1740 - Number(p.birth)), [18, 8]);
  for (const son of sons) {
    assert.equal(son.portrait, ''); assert.equal(son.portraitPlaceholder, 'child');
    assert.match(son.notes, /lebt nicht bei seinem Vater/);
  }
  const parents = sons.map(son => family.parentages.find(p => p.childId === son.id));
  assert.ok(parents.every(p => p.legitimacy === 'illegitimate' && p.parentIds.includes('arvel-skellor')));
  assert.notEqual(parents[0].partnershipId, parents[1].partnershipId);
  assert.equal(family.parentages.filter(p => p.partnershipId === forced[2].id).length, 0);
});

test('old extinct placeholders upgrade without deleting custom additions or restoring the extinction marker', () => {
  const old = structuredClone(createExtinctPlaceholderHouseFamily({ id: 'haus-skellor', title: 'Haus Skellor', emblem: 'old.png', houseProfile: family.document.houseProfile }));
  old.extensions.customNote = 'Eigene Notiz erhalten';
  old.persons.push({ ...old.persons[0], id: 'custom-relative', worldPersonId: 'person--custom--relative', name: 'Eigene Person' });
  const upgraded = resolveRegisteredFamilyUpgrade(family, old);
  assertValidFamily(upgraded);
  assert.equal(upgraded.extensions.blankFamily, false);
  assert.equal(upgraded.extensions.customNote, 'Eigene Notiz erhalten');
  assert.ok(upgraded.persons.some(p => p.id === 'custom-relative'));
  assert.ok(upgraded.persons.some(p => p.worldPersonId === ARVEL_WORLD_PERSON_ID));
  assert.equal(upgraded.cadetBranches.some(b => b.linkType === 'line-extinct'), false);
  assert.equal(upgraded.view.focusPersonId, 'caradog-skellor');
  assert.equal(upgraded.persons.find(p => p.id === family.persons[0].id).status, 'dead');
});

test('biography uses the established character and current portrait with exactly three new age portraits', () => {
  const chief = buildZitteraaleCharacters().find(p => p.id === ARVEL_CHARACTER_ID);
  assert.equal(chief.genealogy.worldPersonId, ARVEL_WORLD_PERSON_ID);
  assert.equal(chief.genealogy.birth, '1699');
  assert.equal(chief.biography.biography.portrait, chief.portrait);
  assert.equal(chief.biography.biography.portraitStages.filter(Boolean).length, 3);
  const familyBio = family.persons.find(p => p.id === 'arvel-skellor').extensions.biographyModule;
  assert.deepEqual(familyBio, chief.biography);
  assert.match(chief.biography.biography.extraSections.find(s => /tatsächlich/.test(s.title)).text, /Massaker nach vollzogener Kapitulation fand nicht statt/);
  assert.match(chief.biography.biography.historyText, /bewusst für den entschieden/);
});

test('known older house bios update while edited or explicitly removed bios survive', () => {
  for (const id of ['skellor', 'merek']) {
    const registered = getRegisteredFamily(`haus-${id}`).family;
    const old = structuredClone(registered);
    old.extensions.sourceRevision = 2;
    old.extensions.houseBiographyModule = oldBiographies[id];
    const upgraded = resolveRegisteredFamilyUpgrade(registered, old);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, registered.extensions.houseBiographyModule);
    const edited = structuredClone(old);
    edited.extensions.houseBiographyModule.house.biographyText = 'Eigene Hausgeschichte';
    assert.equal(resolveRegisteredFamilyUpgrade(registered, edited).extensions.houseBiographyModule.house.biographyText, 'Eigene Hausgeschichte');
    const removed = structuredClone(old); removed.extensions.houseBiographyModule = null;
    assert.equal(resolveRegisteredFamilyUpgrade(registered, removed).extensions.houseBiographyModule, null);
  }
});

test('chronology corrections retain scene edits, thread identities and unrelated data', () => {
  const canonical = buildZitteraaleModule();
  const old = structuredClone(canonical); old.zitteraaleRevision = '20261021-bandenakte-v2'; old.custom = 'Keep';
  old.pages[0].description = '<p>Eigene Ergänzung.</p>Um 1730 fanden sich Überlebende, Deserteure und Gesetzlose zu einer dauerhaften Bande zusammen.';
  old.pages.at(-1).sessionIntro = '<p>Eigene Ruinenszene</p>';
  old.pages.at(-1).sceneId = 'existing-scene';
  const upgraded = upgradeZitteraaleEntry(old, canonical);
  assert.equal(upgraded.custom, 'Keep');
  assert.match(upgraded.pages[0].description, /Eigene Ergänzung/);
  assert.match(upgraded.pages[0].description, /Seit 1720/);
  assert.equal(upgraded.pages.at(-1).sessionIntro, '<p>Eigene Ruinenszene</p>');
  assert.equal(upgraded.pages.at(-1).sceneId, 'existing-scene');
  assert.deepEqual(upgraded.pages.map(p => p.commentThreadKey), old.pages.map(p => p.commentThreadKey));
  assert.equal(upgradeZitteraaleEntry(upgraded, canonical), upgraded);
});

test('family and biography image references resolve to repository assets', async () => {
  const value = JSON.stringify([family, buildZitteraaleCharacters()[0].biography]);
  const paths = new Set([...value.matchAll(/"(\/(?:AleriaAlmanach|Stammbäume)\/[^"<>]+\.(?:png|webp))"/g)].map(m => m[1]));
  for (const path of paths) await access(new URL(`../../${path.slice(1)}`, import.meta.url));
  const map = JSON.parse(await readFile(new URL('../../Karten/Cenyr/celtigerns-wacht/data.json', import.meta.url), 'utf8'));
  const pin = map.state.pins.find(p => p.id === 'mmgyet0kggqr');
  assert.equal(pin.title, 'Caer Creigfryn'); assert.equal(pin.house, 'Haus Merek');
  assert.match(pin.text, /kleine Burg.*kleinen|kleine Burg auf einer felsigen Insel/);
});
