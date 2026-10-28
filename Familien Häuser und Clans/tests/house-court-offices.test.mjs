import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSE_OFFICES } from '../modules/court/house-office-catalog.mjs';
import { hasNobleCourt, completeHouseOffices, houseOfficeRole, partitionHouseCourtEntries } from '../modules/court/house-court-model.mjs';
import { createHousePageData } from '../modules/house-content/house-content-outputs.mjs';
import { createUathneachHouseContent } from '../modules/uathneach/uathneach-house-content.mjs';
import { HOUSE_CONTENT } from '../Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.content.mjs';

test('Hofämter werden für belegten Adel vom Ritterhaus bis zur Krone und für albische Clanränge vervollständigt', () => {
  for (const rank of ['Ritter', 'Ritterherr', 'Ritterfürst', 'Baron', 'Graf', 'König', 'Laird', 'Dún-Tiarna', 'Mor Tiarna', 'Ard Tiarna', 'Hersir', 'Thengr', 'Huskarl', 'Walküre']) {
    assert.ok(hasNobleCourt({ profile: { highestTitle: rank } }), rank);
    assert.equal(completeHouseOffices([], true).length, HOUSE_OFFICES.length);
  }
  assert.ok(!hasNobleCourt({ profile: { highestTitle: 'Bürgerlich' } }));
  assert.ok(!hasNobleCourt({ meta: { type: 'Clan' }, profile: { highestTitle: 'Rang offen' } }));
  assert.ok(!hasNobleCourt({ classification: { houseType: 'Bürgerliches Haus' } }));
  assert.deepEqual(completeHouseOffices([], false), []);
});

test('Alle Standardämter bleiben als anklickbar beschreibbare Vakanzen vorhanden', () => {
  const page = createHousePageData(createUathneachHouseContent('laga'));
  assert.ok(hasNobleCourt(page));
  const entries = completeHouseOffices([], true);
  for (const [index, entry] of entries.entries()) {
    const role = houseOfficeRole(entry, index, page);
    assert.equal(role.name, '');
    assert.equal(role.portrait, '');
    assert.ok(role.description && role.practice);
    assert.ok(role.duties.length >= 3 && role.duties.length <= 5);
  }
  assert.equal(new Set(entries.map(entry => entry.role)).size, entries.length);
});

test('Besetzungen, Silhouetten und Personenlinks bleiben bei der Ergänzung unverändert', () => {
  const page = createHousePageData(HOUSE_CONTENT);
  const existing = page.court.groups.find(group => group.id === 'offices').entries;
  const before = structuredClone(existing);
  const completed = completeHouseOffices(existing, true);
  for (const entry of existing) assert.deepEqual(completed.find(item => item.role === entry.role), entry);
  assert.deepEqual(existing, before);
  const index = completed.findIndex(entry => entry.name === 'Odyar Draig');
  const role = houseOfficeRole(completed[index], index, page);
  assert.equal(role.portrait, page.images[existing.find(entry => entry.name === 'Odyar Draig').imageKey].src);
  assert.ok(role.links.some(link => link.href.includes('person=odyar-draig')));
  assert.ok(role.facts.some(([key, value]) => key === 'Hausrang' && value === 'Graf'));
});

test('Mehrfachbesetzungen, eigene Hofrollen und bekannte Titelvarianten gehen nicht verloren', () => {
  const entries = [{ role: 'Kommandant', name: 'A' }, { role: 'Schatzmeisterin', name: 'B' }, { role: 'Schatzmeister', name: 'C' }, { role: 'Eigene Sonderrolle', name: 'D' }];
  const completed = completeHouseOffices(entries, true);
  assert.equal(completed.filter(entry => entry.name === 'A').length, 1);
  for (const name of ['A', 'B', 'C', 'D']) assert.ok(completed.some(entry => entry.name === name));
  assert.equal(completed.filter(entry => /Kommandant/.test(entry.role)).length, 1);
  assert.deepEqual(completeHouseOffices(completed, true), completed);
  const ids = completed.map((entry, index) => houseOfficeRole(entry, index, {}).id);
  assert.equal(new Set(ids).size, ids.length);
});

test('In alten Amtslisten abgelegte Kinder und Erben erhalten kein erfundenes Hofamt', () => {
  const daughter = { role: 'Erstgeborene Tochter Hrolfs', name: 'Tochter' };
  const ward = { role: 'Mündel bei Haus Balchder', name: 'Mündel' };
  const official = { role: 'Kommandant der Garde', name: 'Kommandant' };
  const split = partitionHouseCourtEntries([daughter, ward, official]);
  assert.deepEqual(split.relationships, [daughter, ward]);
  assert.deepEqual(split.offices, [official]);
  assert.ok(!completeHouseOffices(split.offices, true).some(entry => entry.name === 'Mündel'));
});
