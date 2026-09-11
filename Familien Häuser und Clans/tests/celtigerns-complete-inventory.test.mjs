import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { withHouseBiographyDefault } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-registry-default.js';

const feature = new URL('../', import.meta.url);
const project = new URL('../../', import.meta.url);
const registryContext = { window: {} };
vm.runInNewContext(await readFile(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = registryContext.window.HaeuserRegistry;
const families = FAMILY_REGISTRY.filter(r => r.folderPath.includes('Celtigerns Wacht') || r.id === 'haus-von-hochreuth');
const sources = new Map();
for (const record of families) {
  const entry = registry.byId(record.id);
  const source = new URL(entry.data.replace('haus.data.js', 'haus.content.mjs'), feature);
  source.search = '';
  sources.set(record.id, (await import(source)).HOUSE_CONTENT);
}

test('Jede der 77 Familien besitzt eine erreichbare Hausseite und eine kurze, korrekt verlinkte Bio', async () => {
  assert.equal(families.length, 77);
  for (const record of families) {
    const entry = registry.byId(record.id);
    assert.equal(entry.status, 'active', record.id);
    await access(new URL(entry.page || 'haus.html', feature));
    const biography = record.family.extensions.houseBiographyModule;
    assert.ok(biography, record.id);
    const target = new URL(biography.house.documents.find(doc => doc.link?.includes(`haus=${record.id}`)).link, new URL('Stammbäume/Stammbaum.html', project));
    assert.equal(target.searchParams.get('haus'), record.id);
    assert.ok(target.pathname.endsWith('/' + (entry.page || 'haus.html')));
    const text = Object.values(sources.get(record.id).biographySummary).join(' ');
    assert.ok(text.split(/\s+/).length < 200, record.id);
    if (!sources.get(record.id).biographyManagedExternally) {
      assert.equal(biography.house.abilities.length, 0);
      assert.equal(biography.house.works.length, 0);
    }
  }
});

test('Grafschaft führt ihre 37 ausgewählten Häuser mit direkten Hausseitenlinks und lokalen Wappen', async () => {
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/grafschaft.data.js', project), 'utf8'), context);
  const sections = context.window.KONTINENTE_DATA.view.familySections;
  const cards = sections.flatMap(section => section.cards);
  assert.equal(cards.length, 37);
  assert.equal(new Set(cards.map(c => c.id)).size, 37);
  for (const card of cards) {
    assert.ok(families.some(record => record.id === card.id), card.id);
    assert.equal(card.href, '/Familien%20H%C3%A4user%20und%20Clans/' + registry.linkFor(card.id));
    await access(new URL(card.imageSrc.slice(1), project));
  }
  assert.equal(sections.at(-1).title, 'Ausgestorbene Häuser');
});

test('33 Originale sind archiviert; 36 übrige Vorbereitungen enthalten keine erfundenen Chroniken', async () => {
  const added = [...sources.values()].filter(c => c.registerPage);
  assert.equal(added.length, 69);
  assert.equal(added.filter(c => c.prepared).length, 36);
  assert.equal(added.filter(c => !c.prepared).length, 33);
  for (const content of added) {
    if (content.prepared) {
      assert.equal(content.sections.history, 'Folgt …');
      assert.equal(content.profile.founding, '');
      assert.equal(content.heads.length, 0);
    } else {
      const entry = registry.byId(content.id);
      const archive = new URL(entry.data.replace('haus.data.js', 'animexx-original.html'), feature);
      archive.search = '';
      assert.ok((await readFile(archive, 'utf8')).includes('<table'));
    }
  }
});

test('Neue Bilder, Banner und Personenlinks zeigen auf vorhandene Projektdateien und Personen', async () => {
  for (const content of sources.values()) {
    for (const src of Object.values(content.images).filter(v => typeof v === 'string' && /\.(png|jpe?g|webp)$/i.test(v))) {
      await access(new URL(src, feature));
    }
    if (content.territoryHref) await access(new URL(content.territoryHref, feature));
    for (const entry of [...content.heads, ...content.heirs, ...content.offices, ...content.figures]) {
      if (!entry.id) continue;
      assert.ok(FAMILY_REGISTRY.find(f => f.id === entry.familyId)?.family.persons.some(p => p.id === entry.id), entry.id);
    }
  }
});

test('Ungeklärte Angaben bleiben leer; ausgestorbene Ritterhäuser bekommen kein fremdes Todesjahr', () => {
  for (const [id, key] of [['tlawd','founding'],['gostyn','founding'],['cludwyr','seat'],['cludwyr','wealth'],['loer','wealth'],['sgrechiwr','wealth'],['ard-conbhron','highestTitle'],['ui-talamh','seat']]) {
    assert.equal(sources.get('haus-' + id).profile[key], '', id);
  }
  assert.equal(sources.get('haus-ard-conbhron').extinct, false);
  for (const id of ['haus-morveth', 'haus-skellor', 'haus-ui-talamh']) {
    const bio = families.find(r => r.id === id).family.extensions.houseBiographyModule;
    assert.ok(!bio.stats.some(([label]) => label === 'Erbe'));
    assert.ok(!JSON.stringify(bio).includes('1720'));
  }
  assert.ok(sources.get('haus-chwedlonol').offices.some(o => o.role === 'Kommandantin' && !o.id && o.silhouette === 'female'));
});

test('Neue Registry-Bios ergänzen alte Akten, erhalten aber eigene Texte, Löschung und Familiengraphen', () => {
  for (const content of [...sources.values()].filter(c => c.biographySourceRevision)) {
    const family = families.find(r => r.id === content.id).family;
    const local = structuredClone(family);
    local.extensions.sourceRevision = content.biographySourceRevision - 1;
    delete local.extensions.houseBiographyModule;
    const baseline = normalizeFamily(local);
    const updated = resolveRegisteredFamilyUpgrade(family, local);
    assert.deepEqual(updated.extensions.houseBiographyModule, family.extensions.houseBiographyModule, content.id);
    for (const field of ['persons','partnerships','parentages','houses','cadetBranches','timeJumps']) {
      const normalizedExtensions = entries => entries.map(entry => ({ ...entry, extensions: entry.extensions || {} }));
      assert.deepEqual(normalizedExtensions(updated[field]), normalizedExtensions(baseline[field]), `${content.id} ${field}`);
    }
    for (const bio of [null, { schema: 'aleria.house-module', description: 'Eigener Text' }]) {
      local.extensions.houseBiographyModule = bio;
      assert.deepEqual(resolveRegisteredFamilyUpgrade(family, local).extensions.houseBiographyModule, bio, content.id);
    }
  }
});

test('Default-Anbindung verändert keine Rohakte und respektiert schon zugewiesene Bios', () => {
  const raw = { document: { id: 'haus-test' }, persons: [], extensions: { sourceRevision: 7 } };
  const defaults = { 'haus-test': { biography: { description: 'Kurz' }, sourceRevision: 8 } };
  const updated = withHouseBiographyDefault(raw, defaults);
  assert.equal(raw.extensions.sourceRevision, 7);
  assert.equal(updated.persons, raw.persons);
  assert.equal(updated.extensions.sourceRevision, 8);
  const removed = { ...raw, extensions: { ...raw.extensions, houseBiographyModule: null } };
  assert.equal(withHouseBiographyDefault(removed, defaults), removed);
});
