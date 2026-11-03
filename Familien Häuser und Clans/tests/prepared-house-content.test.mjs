import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreparedHouseContent } from '../modules/house-content/prepared-house-content.mjs';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';

const record = (rankId = 'knight') => ({ id: 'haus-beispiel', title: 'Haus Beispiel', sourceRevision: 3,
  folderPath: ['Cenyr', 'Graue Weite', 'Silberwald', 'Skelettküste', 'Caer Asgwrn'],
  profile: { rankId, seat: 'Caer Asgwrn', barony: 'Silberwald', county: 'Graue Weite', kingdom: 'Cenyr',
    liegeHouseId: 'haus-pysgod', liegeHouseName: "Haus Pysgod O'Tredegar", regionEmblems: { county: 'assets/images/regions/graue-weite.png' } },
  emblem: 'assets/images/crest.png', motto: 'Ein belegter Leitspruch.' });
const territory = { id: 'graue-weite', name: 'Graue Weite', href: '../Kontinente/GraueWeite.html' };
const prepare = row => createPreparedHouseContent({ record: row, territory, image: 'assets/figure.png', contentVersion: 'test' });

test('preparation keeps the actual rank, liege, motto and full residential hierarchy', () => {
  const source = record('knight-prince'), before = structuredClone(source), content = prepare(source);
  assert.equal(content.parentHouseId, 'haus-pysgod');
  assert.equal(content.profile.highestTitle, 'Ritterfürst');
  assert.equal(content.profile.motto, source.motto);
  assert.equal(content.showMotto, true);
  for (const name of source.folderPath) assert.ok(content.hierarchy.some(entry => entry.name === name));
  assert.ok(content.hierarchy.every(entry => entry.type));
  assert.deepEqual(source, before);
});

test('unknown families retain a neutral status instead of becoming knights or commoners', () => {
  const content = prepare(record('unknown'));
  assert.equal(content.type, 'Familie');
  assert.equal(content.profile.rank, 'Offen');
  assert.match(content.images.sceneAlt, /Repräsentative Familiendarstellung/);
  assert.doesNotMatch(content.sections.overview, /Ritterhaus|bürgerliche Familie/);
  assert.equal(content.founder, null);
  assert.deepEqual(content.heads, []);
});

test('ancient and extinct family facts remain distinct and cannot create a new current seat', () => {
  const ancient = record('dun-tiarna'); ancient.title = 'Clan Beispiel';
  ancient.folderPath = ['Cenyr', 'Graue Weite', 'Antike Crannath Clans', 'Ard Ghallon'];
  ancient.profile.seat = 'Ard Ghallon'; ancient.profile.barony = 'Antike Crannath Clans';
  const clan = prepare(ancient);
  assert.equal(clan.type, 'Clan'); assert.equal(clan.profile.highestTitle, 'Dún Tiarna');
  assert.equal(clan.extinct, false);
  assert.doesNotMatch(clan.sections.overview, /liegt in Antike/);
  const extinct = record('unknown'); extinct.folderPath = ['Cenyr', 'Graue Weite', 'Ausgestorbene Häuser'];
  extinct.profile.seat = ''; extinct.profile.barony = 'Ausgestorbene Häuser';
  const ended = prepare(extinct);
  assert.equal(ended.extinct, true); assert.equal(ended.profile.seat, '');
  assert.match(ended.sections.overview, /war eine Familie/);
});

test('canonical lore is retained while technical placeholder descriptions are omitted', () => {
  const row = record(); row.description = 'Die Familie betreibt eine belegte Fischerei. Diese Akte allein führt die Nachkommen fort.';
  const content = prepare(row);
  assert.match(content.sections.overview, /belegte Fischerei/);
  assert.doesNotMatch(content.sections.overview, /Akte|Registerort|Datensatz/);
  row.description = 'Vorbereitete Familienakte des Hauses.';
  assert.doesNotMatch(prepare(row).sections.overview, /Vorbereitete Familienakte/);
});

test('a commoner emblem does not invent an occupation, house chronicle or military statistics', () => {
  const row = record('commoner'); row.title = 'Familie Beispiel';
  const content = createPreparedHouseContent({ record: row, territory, emblemDescription: 'Ein Hammer steht im Hauszeichen.', contentVersion: 'test' });
  assert.equal(content.type, 'Bürgerliches Haus');
  assert.doesNotMatch(content.sections.overview, /Schmied|Handwerker|Gerber/);
  assert.deepEqual(content.heirs, []); assert.deepEqual(content.offices, []);
  for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(content.profile[key], '');
  assert.equal(content.omitMilitaryProfile, true);
});

test('page, biography and existing tree use the same stable identity without replacing an external biography', () => {
  const content = prepare(record()), page = createHousePageData(content), biography = createHouseBiography(content);
  assert.match(page.familyTreeEmbed.src, /family=haus-beispiel&mode=view/);
  assert.match(biography.house.documents[0].link, /haus=haus-beispiel/);
  assert.equal(content.biographySourceRevision, 4);
  const external = createPreparedHouseContent({ record: record(), territory, biographyManagedExternally: true });
  assert.equal(external.biographyManagedExternally, true);
  assert.equal(external.biographySourceRevision, 0);
});
