import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const previous = JSON.parse(readFileSync(new URL('diagnostics/celtigerns-house-refresh-2026-10-24/previous-defaults.json', root)));
const audit = JSON.parse(readFileSync(new URL('diagnostics/celtigerns-house-refresh-2026-10-24/refresh-audit.json', root)));
const sources = new Map(await Promise.all(audit.map(async entry => [entry.id, (await import(new URL(entry.file, root))).HOUSE_CONTENT])));
const records = FAMILY_REGISTRY.filter(record => sources.has(record.id));
const graph = family => Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches']
  .map(key => [key, family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));

test('Alle 92 aktuellen Familien besitzen Hausseite, passende Hauptabbildung und das kanonische Stammbaum-Iframe', () => {
  assert.equal(records.length, 92);
  for (const record of records) {
    const content = sources.get(record.id);
    assert.ok(content, record.id);
    const page = createHousePageData(content);
    assert.equal(new URL(page.familyTreeEmbed.src, feature).searchParams.get('family'), record.id);
    assert.equal(new URL(page.familyTreeEmbed.src, feature).searchParams.get('mode'), 'view');
    assert.ok(existsSync(new URL(content.images.scene, feature)), content.images.scene);
    assert.ok(record.family.extensions.houseBiographyModule, record.id);
    if (record.family.document.motto) assert.equal(content.profile.motto, record.family.document.motto, record.id);
    if (!content.biographyManagedExternally) assert.equal(createHouseBiography(content).image, `../Familien Häuser und Clans/${content.images.scene}`.replace('../Familien Häuser und Clans/../', '../'));
    assert.deepEqual(page.hiddenProfileGroups, ['military']);
    for (const key of ['troopStrength','tiarna','kerns','fleet']) assert.equal(page.profile[key], '', `${record.id} ${key}`);
  }
});

test('Ein Standardbio-Upgrade lässt alle Graphsammlungen der geladenen Familie unverändert', () => {
  for (const record of records) {
    const local = structuredClone(record.family);
    local.extensions.sourceRevision = previous[record.id].sourceRevision;
    local.extensions.houseBiographyModule = previous[record.id].biography;
    const expected = normalizeFamily(local);
    const updated = resolveRegisteredFamilyUpgrade(record.family, local);
    assert.deepEqual(graph(updated), graph(expected), record.id);
  }
});

test('Ausgelieferte alte Standardbios werden erneuert; eigene Texte, Löschung, Notizen und Personenänderungen bleiben erhalten', () => {
  for (const record of records.filter(r => !sources.get(r.id).biographyManagedExternally)) {
    const before = previous[record.id];
    const local = structuredClone(record.family);
    local.extensions.sourceRevision = before.sourceRevision;
    if (before.biography) local.extensions.houseBiographyModule = structuredClone(before.biography);
    else delete local.extensions.houseBiographyModule;
    assert.deepEqual(resolveRegisteredFamilyUpgrade(record.family, local).extensions.houseBiographyModule, record.family.extensions.houseBiographyModule, record.id);
    if (local.persons.length) local.persons[0].name = 'Eigener bearbeiteter Personenname';
    for (const custom of [null, { ...structuredClone(record.family.extensions.houseBiographyModule), description: 'Eigene Redaktion', commentSequence: [{ text: 'Eigene Notiz' }] }]) {
      local.extensions.houseBiographyModule = custom;
      const upgraded = resolveRegisteredFamilyUpgrade(record.family, local);
      assert.deepEqual(upgraded.extensions.houseBiographyModule, custom, record.id);
      if (local.persons.length) assert.equal(upgraded.persons[0].name, 'Eigener bearbeiteter Personenname', record.id);
    }
  }
});

test('Neue Berufs- und Familienseiten verwenden vorhandene Personen statt neuer erfundener Hofinhaber', () => {
  for (const content of sources.values()) {
    for (const person of [...content.heads, ...content.heirs, ...content.offices, ...content.figures, ...(content.founder ? [content.founder] : [])]) {
      if (!person.id) continue;
      assert.ok(FAMILY_REGISTRY.find(record => record.id === person.familyId)?.family.persons.some(p => p.id === person.id), `${content.id}: ${person.id}`);
    }
  }
  assert.equal(sources.get('haus-draig').offices.find(p => p.role === 'Jagdmeister').id, 'stennis-gwefrydd');
  const commander = sources.get('haus-saethwyr').offices.find(p => p.role === 'Kommandant der Garde');
  assert.equal(commander.name, 'Melyn Saethwyr');
  assert.ok(!commander.id, 'Keine Verwechslung mit Melyn Arth');
  assert.match(sources.get('haus-torvik').sections.overview, /Schmiedegehilfe/);
  assert.match(sources.get('haus-cymrath-o-traethlan').sections.traditions, /Lamellen/);
});

test('Die Galerie ordnet sämtliche 92 Haus-Hauptbilder demselben kanonischen Haus zu', () => {
  const catalog = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/catalog.json', root)));
  for (const content of sources.values()) {
    const file = new URL(content.images.scene, feature);
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
    const image = catalog.illustrations.find(image => image.sha256 === hash);
    assert.ok(image?.houseIds.includes(content.id), content.id);
  }
});
