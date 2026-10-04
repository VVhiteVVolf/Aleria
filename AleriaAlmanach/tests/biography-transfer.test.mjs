import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { buildBiographyExportPayload, buildBiographyPageExportPayload, parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';
import { normalizePersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { renderPersonBiography } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-renderer.js';
import { createPublicPersonExtensions } from '../../firebase/functions/src/families/person-biography-publication.js';

const source = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/Biographien/lynnes-schiffsmannschaft-modulpaket-2026-10-04.json', import.meta.url), 'utf8'));
const entry = source.module.entry;
const pageIndex = entry.pages.findIndex(page => page.biographyPage);
const page = entry.pages[pageIndex];
const baseUrl = 'https://aleria.example/AleriaAlmanach/AleriaAlmanach.html';

async function characterContext() {
  const context = vm.createContext({ document: { addEventListener() {} } });
  for (const file of ['module-editor/module-editor-data.js', 'characters/character-biography-tab.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('Lynnes tatsächliche Bio wird einzeln exportiert, ohne das Quellmodul zu verändern', () => {
  const before = JSON.stringify(entry);
  const payload = buildBiographyPageExportPayload(page, entry, { baseUrl, pageIndex });
  assert.equal(payload.personName, 'Lady Lynne Arth');
  assert.equal(payload.personId, '');
  assert.deepEqual(payload.source, { moduleId: entry.id, moduleTitle: entry.title, pageIndex, pageTitle: page.pageTitle });
  assert.deepEqual(payload.biographyModule.stats, page.stats);
  assert.equal(payload.biographyModule.quote, page.quote);
  assert.equal(payload.biographyModule.biography.historyText, page.biography.historyText);
  assert.equal(payload.biographyModule.biography.portrait, new URL(page.image, baseUrl).href);
  assert.equal(payload.biographyModule.biography.connections.length, 4);
  for (const field of ['pages', 'commentsExport', 'commentSequence', 'combatProfile', 'inventory', 'hierarchy']) {
    assert.equal(Object.hasOwn(payload, field), false);
    assert.equal(Object.hasOwn(payload.biographyModule, field), false);
  }
  assert.equal(JSON.stringify(entry), before);
  assert.throws(() => buildBiographyPageExportPayload(entry.pages[0], entry), /Biografie-Seite/);
  assert.throws(() => buildBiographyPageExportPayload({ ...page, _commentsPage: true }, entry), /Biografie-Seite/);
});

test('beide Importziele erhalten Bio, Tabellen, Zitate, Bilder und exportieren sie erneut', async () => {
  const payload = buildBiographyPageExportPayload(page, entry, { baseUrl });
  const parsed = parseBiographyImportPayload(JSON.parse(JSON.stringify(payload)));
  const family = normalizePersonBiographyModule(parsed);
  const context = await characterContext();
  const character = context.getCharacterBiographyProfileSource({ biography: parsed });
  assert.deepEqual(JSON.parse(JSON.stringify(character)), family);
  const again = parseBiographyImportPayload(buildBiographyExportPayload({ biographyModule: character }));
  assert.deepEqual(again, family);
  const html = renderPersonBiography({ person: { name: 'Lynne Arth', portrait: '/anderes-portrait.png' }, biographyModule: family });
  assert.ok(html.includes(family.biography.portrait));
  assert.ok(!html.includes('/anderes-portrait.png'));
  assert.match(html, /Die Taufe der Leeren Flasche/);
  assert.match(html, /Cerys Blodyn/);
});

test('Biografieportrait bleibt bei Stammbaum-Veröffentlichung erhalten und wird geprüft', () => {
  const payload = buildBiographyPageExportPayload(page, entry, { baseUrl });
  const published = createPublicPersonExtensions({ biographyModule: payload.biographyModule }).biographyModule;
  assert.equal(published.biography.portrait, payload.biographyModule.biography.portrait);
  assert.deepEqual(normalizePersonBiographyModule(published), normalizePersonBiographyModule(payload.biographyModule));
  published.biography.portrait = 'javascript:alert(1)';
  assert.equal(createPublicPersonExtensions({ biographyModule: published }).biographyModule.biography.portrait, '');
});

test('relative Medienpfade bleiben über App-Grenzen gültig; Icons und Quelle bleiben unverändert', () => {
  const page = { biographyPage: true, image: './portrait.jpg', imageTabs: [{ image: '../young.jpg' }], description: '<p>Alttext</p>', biography: {
    abilities: [{ icon: '✦' }, { icon: '../icons/ship.png' }],
    connections: [{ image: '/portraits/friend.png' }],
    documents: [{ icon: '⚓', link: './ship.html', text: 'Schiff' }]
  } };
  const before = structuredClone(page);
  const bio = buildBiographyPageExportPayload(page, {}, { baseUrl }).biographyModule.biography;
  assert.equal(bio.portrait, 'https://aleria.example/AleriaAlmanach/portrait.jpg');
  assert.equal(bio.portraitStages[0], 'https://aleria.example/young.jpg');
  assert.equal(bio.connections[0].image, 'https://aleria.example/portraits/friend.png');
  assert.equal(bio.abilities[0].icon, '✦');
  assert.equal(bio.abilities[1].icon, 'https://aleria.example/icons/ship.png');
  assert.equal(bio.documents[0].link, 'https://aleria.example/AleriaAlmanach/ship.html');
  assert.equal(bio.biographyText, '<p>Alttext</p>');
  assert.deepEqual(page, before);
});

test('bestehende Dateien und Firestore-Tabellen bleiben lesbar; falsche Dateien werden abgewiesen', async () => {
  const legacy = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/Biographien/ifor-beryn-biographie.json', import.meta.url), 'utf8'));
  assert.equal(normalizePersonBiographyModule(parseBiographyImportPayload(legacy)).biography.portrait, '');
  const raw = { schema: 'aleria.biography-module', stats: [{ label: 'Haus', value: 'Arth' }], biography: {} };
  assert.deepEqual(normalizePersonBiographyModule(parseBiographyImportPayload(raw)).stats, [['Haus', 'Arth']]);
  for (const invalid of [null, [], {}, source, { ...raw, schemaVersion: 2 }, { ...raw, biography: [] }, { ...raw, biographyModule: null, stats: {} }]) {
    assert.throws(() => parseBiographyImportPayload(invalid), /Biographie/);
  }
});
