import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { loadPublicCenyrCoverageInputs, auditCenyrHouseCoverage } from '../modules/house-coverage/cenyr-house-coverage-node.mjs';
import { createRuralFamilyCoverageProfile } from '../modules/house-coverage/rural-family-profile.mjs';
import { FLEISCHSAMMLER_FAMILIES_INDEX } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';
import countyBaseline from './fixtures/celtigerns-family-cards-baseline-20261104.json' with { type: 'json' };
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { withHouseBiographyDefault } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-registry-default.js';

const feature = new URL('../', import.meta.url);
const project = new URL('../../', import.meta.url);
const registryContext = { window: {} };
vm.runInNewContext(await readFile(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = registryContext.window.HaeuserRegistry;
const { project: publicFamilyRegistry, scope: publicCenyrScope } = loadPublicCenyrCoverageInputs();
const areaFamilies = publicFamilyRegistry.filter(r => r.folderPath.includes('Celtigerns Wacht') || r.id === 'haus-von-hochreuth');
const families = areaFamilies.filter(record => registry.byId(record.id));
const familiesWithoutHousePage = areaFamilies.filter(record => !registry.byId(record.id));
const profileCoverage = await auditCenyrHouseCoverage({ allowlistIds: publicCenyrScope.map(record => record.id) });
const localityIds = new Set(FLEISCHSAMMLER_FAMILIES_INDEX.map(record => record.familyId));
const sources = new Map();
for (const record of families) {
  const entry = registry.byId(record.id);
  const source = new URL(entry.data.replace('haus.data.js', 'haus.content.mjs'), feature);
  source.search = '';
  sources.set(record.id, (await import(source)).HOUSE_CONTENT);
}

test('Die 107 eigenständigen öffentlichen Hausseiten einschließlich Perllan, Melog und Pert bleiben erreichbar und mit ihren Bios verknüpft', async () => {
  const completedPageIds = [
    'haus-blevis', 'haus-brogar', 'haus-crewe', 'haus-glyn', 'haus-jernigan', 'haus-talfryn',
    'haus-tarw', 'haus-tynged', 'haus-cochdon', 'haus-llythfor', 'haus-twyllod', 'perllan', 'melog', 'pert',
  ];
  assert.equal(completedPageIds.length, 14);
  assert.equal(families.length, 107);
  assert.equal(families.filter(record => !completedPageIds.includes(record.id)).length, 93);
  for (const id of completedPageIds) assert.ok(sources.has(id), id);
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
    assert.ok(text.split(/\s+/).length < 1000, record.id);
    if (!sources.get(record.id).biographyManagedExternally) {
      assert.equal(biography.house.abilities.length, 0);
      assert.equal(biography.house.works.length, 0);
    }
  }
});

test('Cochdon, Llythfor und Twyllod behalten ihre Hausbios; acht örtliche Familien besitzen echte zugängliche Familienprofile', async () => {
  assert.deepEqual(familiesWithoutHousePage.map(record => record.id).sort(), [...localityIds].sort());
  assert.equal(profileCoverage.ok, true);
  assert.equal(profileCoverage.records.filter(record => record.existingPage.kind === 'family-record').length, localityIds.size);
  for (const record of familiesWithoutHousePage) {
    const profile = createRuralFamilyCoverageProfile(record, record.family.extensions.houseBiographyModule);
    const checked = profileCoverage.records.find(row => row.stableId === record.id);
    assert.ok(profile, record.id);
    assert.equal(checked.existingPage.kind, 'family-record', record.id);
    assert.equal(checked.existingPage.path, profile.href);
    assert.equal(checked.existingBiography.present, true);
    assert.equal(checked.profileImageRole, 'family-crest');
    assert.deepEqual(checked.missing, { page: false, bio: false, art: false, localArt: false });
    assert.ok(profile.biography.house.biographyText.trim(), record.id);
    await access(new URL(profile.sourcePath, project));
    await access(new URL(profile.href, project));
    assert.equal(checked.boundPageScenePath, '', 'A family crest is not a commissioned warrior image');
  }
  for (const id of ['haus-cochdon', 'haus-llythfor', 'haus-twyllod']) {
    const record = areaFamilies.find(record => record.id === id);
    assert.ok(record, id);
    assert.equal(registry.byId(id).page, 'kleinehaeuser.html', id);
    assert.ok(record.family.document.description.length > 150, record.id);
    assert.ok(record.family.persons.length > 0, record.id);
  }
  assert.ok(areaFamilies.find(record => record.id === 'haus-twyllod').family.extensions.houseBiographyModule);
});

test('Grafschaft erhält exakt ihre 65 bisherigen Hauskarten und ergänzt die acht belegten örtlichen Familienprofile sowie Melog und Pert', async () => {
  const context = { window: {} };
  vm.runInNewContext(await readFile(new URL('Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/grafschaft.data.js', project), 'utf8'), context);
  const sections = context.window.KONTINENTE_DATA.view.familySections;
  const cards = JSON.parse(JSON.stringify(sections.flatMap(section => section.cards)));
  assert.equal(countyBaseline.beforeCommit, '887693c81224ec8fd7e17cab50c8dcbb5a0f6d05');
  assert.equal(countyBaseline.cards.length, 65);
  assert.equal(createHash('sha256').update(JSON.stringify(countyBaseline.cards)).digest('hex'), 'f024aebd0206f205811cf7947ae208f748bd6e596925e8f58280d5515b6f8e96');
  const existingCards = cards.filter(card => !localityIds.has(card.id) && !['melog', 'pert'].includes(card.id));
  assert.deepEqual(existingCards, countyBaseline.cards, 'Every original card, image, link and card order remains unchanged');
  assert.deepEqual(cards.filter(card => localityIds.has(card.id)).map(card => card.id).sort(), [...localityIds].sort());
  assert.equal(localityIds.size, 8);
  assert.equal(cards.length, countyBaseline.cards.length + localityIds.size + 2);
  const melog = cards.filter(card => card.id === 'melog');
  assert.equal(melog.length, 1);
  assert.equal(melog[0].name, 'Melog');
  assert.equal(melog[0].seat, 'Gwynthor');
  assert.equal(melog[0].liege, 'Draig');
  assert.equal(melog[0].rank, 'Bürgerliche Familie');
  assert.equal(melog[0].imageSrc, '/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Melog/melog-emblem.png');
  assert.equal(melog[0].href, '/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=melog');
  const pert = cards.filter(card => card.id === 'pert');
  assert.equal(pert.length, 1);
  assert.equal(pert[0].name, 'Pert');
  assert.equal(pert[0].seat, 'Gwynthor · Hof Maesglas');
  assert.equal(pert[0].liege, 'Draig');
  assert.equal(pert[0].rank, 'Bürgerliche Familie');
  assert.equal(pert[0].imageSrc, '/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pert/pert-emblem.png');
  assert.equal(pert[0].href, '/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=pert');
  assert.equal(new Set(cards.map(c => c.id)).size, cards.length);
  const perllan = cards.filter(card => card.id === 'perllan');
  assert.equal(perllan.length, 1);
  assert.ok(perllan[0].imageSrc.endsWith('/Perllan/perllan-emblem.png'));
  assert.ok(perllan[0].href.endsWith('kleinehaeuser.html?haus=perllan'));
  assert.equal(existingCards.filter(card => card.id !== 'perllan').length, 64);
  for (const card of cards) {
    assert.ok(areaFamilies.some(record => record.id === card.id), card.id);
    if (registry.byId(card.id)) {
      assert.equal(card.href, '/Familien%20H%C3%A4user%20und%20Clans/' + registry.linkFor(card.id));
    } else {
      const profile = createRuralFamilyCoverageProfile(areaFamilies.find(record => record.id === card.id),
        areaFamilies.find(record => record.id === card.id).family.extensions.houseBiographyModule);
      assert.ok(profile, card.id);
      const target = new URL(card.href, 'http://aleria.local');
      assert.equal(decodeURIComponent(target.pathname), '/Stammbäume/Stammbaum.html');
      assert.equal(target.searchParams.get('family'), card.id);
      assert.equal(target.searchParams.get('mode'), 'view');
      assert.equal(target.href, new URL(profile.href, 'http://aleria.local/').href);
      assert.equal(decodeURIComponent(card.imageSrc), '/Stammbäume/' + profile.imageSource);
      await access(new URL('Stammbäume/Stammbaum.html', project));
    }
    await access(new URL(card.imageSrc.slice(1), project));
  }
  assert.equal(sections.at(-1).title, 'Ausgestorbene Häuser');
});

test('Originalquellen bleiben archiviert; Vorbereitungen enthalten keine erfundenen Chroniken', async () => {
  const added = [...sources.values()].filter(c => c.registerPage);
  const neutralPreparedHistories = new Set([
    'Folgt …',
    'Über die Anfänge und die weitere Geschichte der Familie ist bislang wenig überliefert.',
  ]);
  assert.ok(added.length >= 79);
  for (const content of added) {
    if (content.historySource) {
      await access(new URL(content.historySource, project));
      const family = families.find(record => record.id === content.id).family;
      assert.equal(content.sections.history, family.document.description.replace('Ritterherrenhaus', 'Ministerialenhaus'));
      for (const head of content.heads) assert.ok(family.persons.some(person => person.id === head.id));
    } else if (content.prepared) {
      assert.ok(neutralPreparedHistories.has(content.sections.history), content.id);
      assert.equal(content.profile.founding, '', content.id);
      assert.equal(content.founder ?? null, null, content.id);
      assert.equal(content.heads.length, 0, content.id);
    } else if (content.sourceBatch) {
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
      assert.ok(publicFamilyRegistry.find(f => f.id === entry.familyId)?.family.persons.some(p => p.id === entry.id), entry.id);
    }
  }
});

test('Ungeklärte Angaben bleiben leer; ausgestorbene Ritterhäuser bekommen kein fremdes Todesjahr', () => {
  for (const [id, key] of [['tlawd','founding'],['gostyn','founding'],['cludwyr','seat'],['cludwyr','wealth'],['loer','wealth'],['sgrechiwr','wealth'],['ard-conbhron','highestTitle'],['ui-talamh','seat']]) {
    assert.equal(sources.get('haus-' + id).profile[key], '', id);
  }
  assert.equal(sources.get('haus-ard-conbhron').extinct, false);
  for (const id of ['haus-morveth', 'haus-ui-talamh']) {
    const bio = families.find(r => r.id === id).family.extensions.houseBiographyModule;
    assert.ok(!bio.stats.some(([label]) => label === 'Erbe'));
    assert.ok(!JSON.stringify(bio).includes('1720'));
  }
  assert.equal(sources.get('haus-skellor').extinct, false);
  assert.match(sources.get('haus-skellor').sections.history, /1720/);
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
