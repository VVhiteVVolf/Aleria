import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { INFERNIID_PROFILE_IDS } from '../modules/inferniid-profile/inferniid-profile-registry.mjs';
import { renderArchdevilOverview, renderInferniidProfile } from '../modules/inferniid-profile/inferniid-profile-template.mjs';
import { renderCreatureGroupProfile } from '../modules/creature-group-profile/creature-group-profile-template.mjs';

const expectedIds = ['dagonar', 'ignarii', 'ignit', 'nixhund', 'balgrath', 'flickerling', 'sukkubus-inkubus', 'formwandler', 'satyr'];
const expectedNames = ['Dagonar', 'Ignarii', 'Ignit', 'Nixhund', 'Balgrath', 'Flickerling', 'Sukkubus & Inkubus', 'Formling & Formwandler', 'Satyr'];
const expectedMetricLabels = {
  dagonar: ['Kriegstaktik', 'Feuermacht', 'Körperkraft', 'Feuerresistenz', 'Hierarchietreue', 'Kälteanfälligkeit'],
  ignarii: ['Lavakontrolle', 'Vulkanwut', 'Nahkampfwucht', 'Feuerimmunität', 'Disziplin', 'Kältestarre'],
  ignit: ['Dienstgehorsam', 'Arbeitsausdauer', 'Schwarmdruck', 'Feuerfestigkeit', 'Eigenplanung', 'Kälteanfälligkeit'],
  nixhund: ['Jagdtrieb', 'Rudelkoordination', 'Magmaentladung', 'Panzerkörper', 'Führungsbindung', 'Kälteanfälligkeit'],
  balgrath: ['Tyrannenmacht', 'Höllenfeuer', 'Körpergewalt', 'Hitzeregeneration', 'Dienerzwang', 'Rivalitätsdrang'],
  flickerling: ['Feuerlist', 'Schwarmchaos', 'Verratsneigung', 'Meisterbindung', 'Beweglichkeit', 'Kältefurcht'],
  'sukkubus-inkubus': ['Traumzugriff', 'Verführung', 'Lebensraub', 'Gestaltwandel', 'Illusionsmacht', 'Willensabwehr'],
  formwandler: ['Identitätsraub', 'Transmorphose', 'Sozialtarnung', 'Gefühlslenkung', 'Langzeitplanung', 'Silberanfälligkeit'],
  satyr: ['Emotionslenkung', 'Klangmagie', 'Illusionskunst', 'Akrobatik', 'Festorganisation', 'Fluchtneigung']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/inferniiden/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(INFERNIID_PROFILE_IDS.map(readProfile));

test('the Inferniid registry follows Dagon and Sanguine without duplicating the canonical Lustling dossier', () => {
  assert.deepEqual(INFERNIID_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
  assert(!INFERNIID_PROFILE_IDS.includes('lustling'));
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated Inferniid dossier is complete, themed and current`, async () => {
    const directory = new URL(`../wesen/inferniiden/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderInferniidProfile(profile, navigation));
    assert(profile.summary.length >= 180);
    assert(profile.quote.length >= 70);
    assert(profile.quoteAttribution.length >= 25);
    assert.equal(profile.parentGroupId, 'inferniiden');
    assert(profile.sections.length >= 8);
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert.equal(profile.sections.find(section => section.id === 'unterarten')?.blocks[0]?.text, '???');
    assert(profile.facts.length >= 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.match(profile.icon.alt, /vollständig/i);
    assert.match(profile.icon.src, /inferniid-profiles\/.*\.webp$/);
    assert.match(profile.hero.src, /inferniid-profiles\/.*\.webp$/);
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /grid-template-columns: minmax\(0, 1fr\) 255px|field-profile-facts/);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/wesen\/gruppen\/inferniiden\/index\.html"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
  });
}

test('the Inferniid overview renders two explicit creator branches in the requested order', async () => {
  const directory = new URL('../wesen/gruppen/inferniiden/', import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  const html = await readFile(new URL('index.html', directory), 'utf8');
  const [dagon, sanguine] = profile.related.branches;

  assert.deepEqual([dagon.id, sanguine.id], ['dagon', 'sanguine']);
  assert.deepEqual(dagon.levels.map(level => level.entryIds), [
    ['erzteufel'], ['dagonar', 'ignarii'], ['ignit', 'nixhund'], ['balgrath', 'flickerling', 'balor-unbekannt-1', 'balor-unbekannt-2']
  ]);
  assert.deepEqual(sanguine.levels.map(level => level.entryIds), [
    ['erzdaemon'], ['sukkubus-inkubus', 'formwandler'], ['lustling', 'satyr']
  ]);
  assert.equal(profile.related.entries.filter(entry => entry.unknown).length, 2);
  assert.equal(profile.related.entries.find(entry => entry.id === 'erzteufel').href, '../erzteufel/index.html');
  assert.equal(profile.related.entries.find(entry => entry.id === 'lustling').href, '../../kobolde/lustling/index.html');
  assert.equal(profile.related.entries.find(entry => entry.id === 'erzdaemon').href, null);
  assert.match(html, /field-related-branches\.css/);
  assert.match(html, /data-related-branch="dagon"/);
  assert.match(html, /data-related-branch="sanguine"/);
  assert.equal((html.match(/data-related-branch-level=/g) || []).length, 7);

  const known = profile.related.entries.filter(entry => !entry.unknown);
  assert(known.every(entry => /vollständig/i.test(entry.image.alt)));
  await Promise.all(known.map(entry => access(new URL(entry.image.src, directory))));
});

test('the six archdevils have their own overview above the remaining Inferniids', async () => {
  const directory = new URL('../wesen/gruppen/erzteufel/', import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');

  assert.equal(html, renderArchdevilOverview(profile));
  assert.deepEqual(profile.related.entries.map(entry => entry.id), ['asharon', 'malekar', 'nashira', 'tamaraon', 'zabaron', 'balor']);
  assert(profile.related.entries.every(entry => entry.href === null && /vollständig/i.test(entry.image.alt)));
  assert.deepEqual(profile.metrics.labels, ['Dagonessenz', 'Herrschaft', 'Reichsbindung', 'Unsterblichkeit', 'Intrigendruck', 'Zerstörungsmacht']);
  assert.match(html, /href="\.\.\/inferniiden\/index\.html"/);
  await Promise.all(profile.related.entries.map(entry => access(new URL(entry.image.src, directory))));
});

test('the canonical Lustling dossier remains shared by the Kobold and Inferniid registers', async () => {
  const lustling = JSON.parse(await readFile(new URL('../wesen/kobolde/lustling/profil.json', import.meta.url), 'utf8'));
  assert.match(lustling.classification, /Inferniide/i);
  assert.match(lustling.summary, /Sanguine/i);
  await access(new URL('../wesen/kobolde/lustling/index.html', import.meta.url));
});

test('all supplied Inferniid images and the corrected Flickerling scene are documented without crop rules', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/inferniid-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 30);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 30);
  assert.equal(manifest.items.filter(item => item.sourceType === 'user-provided-profile-table').length, 29);
  const generated = manifest.items.find(item => item.id === 'flickerling-hero');
  assert.equal(generated.sourceType, 'generated-for-incorrect-source-image');
  assert(generated.generationPrompt.length >= 150);
  assert.notEqual(generated.source, 'https://i.imgur.com/170BqZD.png');
  assert.equal(manifest.items.find(item => item.id === 'balgrath-hero').source, 'https://i.imgur.com/170BqZD.png');
  assert.equal(manifest.items.find(item => item.id === 'inferniiden-flickerling').source, 'https://i.imgur.com/UPg9gks.png');
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  const branchCss = await readFile(new URL('../modules/field-guide-profile/field-related-branches.css', import.meta.url), 'utf8');
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css + branchCss));
  assert(css.includes('filter: drop-shadow'));
  assert.match(branchCss, /grid-template-columns: repeat\(2/);
});

test('the production build includes the hierarchy, archdevils, canonical Lustling and all Inferniid dossiers', async () => {
  const viteConfig = await readFile(new URL('../../AleriaAlmanach/vite.config.mjs', import.meta.url), 'utf8');
  assert.match(viteConfig, /CREATURE_GROUP_PROFILE_IDS/);
  assert.match(viteConfig, /INFERNIID_PROFILE_IDS/);
  assert.match(viteConfig, /KOBOLD_PROFILE_IDS/);
  assert.match(viteConfig, /bestiary-creature-group-erzteufel/);
  assert.match(viteConfig, /bestiary-inferniid-/);
  assert.match(viteConfig, /bestiary-kobold-/);
});

test('the branch renderer escapes hierarchy labels and entries', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const picture = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe, folio: unsafe,
    summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe, icon: picture, hero: picture,
    facts: [{ label: unsafe, value: unsafe }], metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    related: {
      title: unsafe, intro: unsafe,
      entries: [{ id: 'bad', name: unsafe, region: unsafe, description: unsafe, status: unsafe, image: picture }],
      branches: [{ id: 'bad', theme: 'dagon', eyebrow: unsafe, title: unsafe, intro: unsafe, levels: [{ id: 'level', eyebrow: unsafe, title: unsafe, intro: unsafe, entryIds: ['bad'] }] }]
    },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }] }], plates: []
  };
  const html = renderCreatureGroupProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
