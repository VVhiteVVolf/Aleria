import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { HOUSE_CONTENT } from '../Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.content.mjs';
import { HOUSE_BIOGRAPHY } from '../Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.biography.mjs';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { HOUSE_DRAIG_FAMILY } from '../../Stammbäume/assets/js/data/house-draig-family.js';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeHouseBiographyModule, getHouseBiographyModule, sanitizeHouseBiographyForFirestore } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-model.js';

const page = createHousePageData(HOUSE_CONTENT);
const sourceDirectory = new URL('../Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/', import.meta.url);
const pageUrl = new URL('../haus.html', import.meta.url);

test('Das Herrschaftsbanner führt zur vorhandenen Seite von Celtigerns Wacht', async () => {
  const target = new URL(page.images['haus-banner'].href, pageUrl);
  assert.ok(decodeURI(target.pathname).endsWith('/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html'));
  await access(target);
});

test('Hausseite und Stammbaum-Bio stammen vollständig aus derselben Quelle', async () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await readFile(new URL('haus.data.js', sourceDirectory), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.HAEUSER_DATA)), page);
  assert.deepEqual(HOUSE_BIOGRAPHY, createHouseBiography(HOUSE_CONTENT));
  assert.deepEqual(HOUSE_DRAIG_FAMILY.extensions.houseBiographyModule, HOUSE_BIOGRAPHY);
  assert.equal(page.court.groups.find(group => group.id === 'heads').entries.length, 17);
  assert.equal(page.court.groups.find(group => group.id === 'heirs').entries.length, 5);
  assert.equal(page.court.groups.find(group => group.id === 'offices').entries.length, 20);
  assert.equal(page.court.cadets.length, 3);
  assert.equal(HOUSE_BIOGRAPHY.house.biographyText, HOUSE_CONTENT.biographySummary.overview);
  assert.equal(HOUSE_BIOGRAPHY.house.historyText, HOUSE_CONTENT.biographySummary.history);
  assert.deepEqual(HOUSE_BIOGRAPHY.house.works, []);
  assert.equal(HOUSE_BIOGRAPHY.house.extraSections.length, 1);
  assert.ok(!JSON.stringify(HOUSE_BIOGRAPHY).includes('Hofämter'));
  const biographyWords = [HOUSE_BIOGRAPHY.house.biographyText, HOUSE_BIOGRAPHY.house.historyText, HOUSE_BIOGRAPHY.house.extraSections[0].text].join(' ').split(/\s+/);
  assert.ok(biographyWords.length < 200, 'Die Hausbio bleibt ein kurzer Überblick.');
});

test('Alle elf unbenannten Hofämter verwenden die Silhouetten der Quelle', () => {
  const offices = page.court.groups.find(group => group.id === 'offices').entries;
  const unassigned = offices.filter(entry => entry.name === 'Nicht benannt');
  assert.equal(unassigned.length, 11);
  for (const entry of unassigned) {
    const expected = ['Brotmeister', 'Gartenmeister', 'Hoffalkner'].includes(entry.role) ? 'female' : 'male';
    assert.equal(page.images[entry.imageKey].src, `../Stammbäume/assets/images/placeholders/${expected}.png`);
    assert.equal(entry.href, '');
  }
});

test('Alle Personenlinks verweisen auf vorhandene Stammbaumeinträge', () => {
  for (const entry of [...HOUSE_CONTENT.heads, ...HOUSE_CONTENT.heirs, ...HOUSE_CONTENT.offices, ...HOUSE_CONTENT.figures]) {
    if (!entry.id) continue;
    const family = getRegisteredFamily(entry.familyId)?.family;
    assert.ok(family?.persons.some(person => person.id === entry.id), `${entry.familyId}/${entry.id}`);
  }
  for (const entry of page.court.cadets) assert.ok(getRegisteredFamily(new URL(entry.href, 'https://example.invalid/').searchParams.get('family')));
  assert.ok(page.court.groups.find(group => group.id === 'heirs').entries[3].href.endsWith('person=neithon-1718-draig'));
  assert.ok(page.court.groups.find(group => group.id === 'heads').entries[6].href.endsWith('person=neithon-1136-draig'));
});

test('Alle Bilder sind lokale, vorhandene Dateien', async () => {
  for (const image of Object.values(page.images)) {
    assert.ok(!/^https?:/.test(image.src));
    await access(new URL(image.src, pageUrl));
  }
  const bio = HOUSE_BIOGRAPHY;
  for (const src of [bio.image, bio.house.crestImage, ...bio.house.abilities.map(entry => entry.icon), ...bio.house.connections.map(entry => entry.image), ...bio.house.documents.map(entry => entry.icon)]) {
    await access(new URL(src, new URL('../../Stammbäume/Stammbaum.html', import.meta.url)));
  }
});

test('Unbekanntes Hausmotto bleibt nach Normalisierung und Speicherung leer', () => {
  let bio = getHouseBiographyModule(HOUSE_DRAIG_FAMILY);
  bio = normalizeHouseBiographyModule(sanitizeHouseBiographyForFirestore(bio));
  assert.equal(bio.quote, '');
  assert.equal(bio.quoteBy, '');
  assert.deepEqual(bio.house.quotes, []);
  assert.ok(normalizeHouseBiographyModule({}).quote, 'Vorlagen behalten ihre bisherige Schreibhilfe');
});

test('Bestehende Draig-Snapshots erhalten die Bio ohne Änderungen am Familiengraphen', () => {
  const old = structuredClone(HOUSE_DRAIG_FAMILY);
  old.extensions.sourceRevision = 7;
  delete old.extensions.houseBiographyModule;
  const upgraded = resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old);
  assert.equal(upgraded.extensions.sourceRevision, 9);
  assert.deepEqual(upgraded.extensions.houseBiographyModule, HOUSE_BIOGRAPHY);
  const normalized = normalizeFamily(old);
  for (const key of ['persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
    const withExtensionDefaults = entries => entries.map(entry => ({ ...entry, extensions: entry.extensions || {} }));
    assert.deepEqual(withExtensionDefaults(upgraded[key]), withExtensionDefaults(normalized[key]), key);
  }
  old.extensions.houseBiographyModule = { ...HOUSE_BIOGRAPHY, description: 'Bereits selbst bearbeitete Hausbio.' };
  assert.equal(resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old).extensions.houseBiographyModule.description, old.extensions.houseBiographyModule.description);
  old.extensions.houseBiographyModule = null;
  assert.equal(resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old).extensions.houseBiographyModule, null, 'Bewusst gelöschte Bio bleibt gelöscht');
});

test('Die unveränderte lange Standardbio wird gekürzt, eigene Änderungen bleiben erhalten', async () => {
  const previous = JSON.parse(await readFile(new URL('../../Stammbäume/tests/fixtures/house-biography/draig-full-v1.json', import.meta.url), 'utf8'));
  const old = structuredClone(HOUSE_DRAIG_FAMILY);
  old.extensions.sourceRevision = 8;
  old.extensions.houseBiographyModule = previous;
  assert.deepEqual(resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old).extensions.houseBiographyModule, HOUSE_BIOGRAPHY);
  old.extensions.houseBiographyModule = sanitizeHouseBiographyForFirestore(previous);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old).extensions.houseBiographyModule, HOUSE_BIOGRAPHY);
  for (const edit of [bio => { bio.house.historyText += ' Eigene Ergänzung.'; }, bio => { bio.commentSequence.push({ text: 'Eigene Notiz' }); }, bio => { bio.image = 'mein-portrait.png'; }]) {
    const changed = structuredClone(previous);
    edit(changed);
    old.extensions.houseBiographyModule = changed;
    assert.deepEqual(resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, old).extensions.houseBiographyModule, changed);
  }
});
