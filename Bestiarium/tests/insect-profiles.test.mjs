import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { INSECT_PROFILE_IDS } from '../modules/insect-profile/insect-profile-registry.mjs';
import { renderInsectProfile } from '../modules/insect-profile/insect-profile-template.mjs';

const expectedIds = ['hoehlenkriecher', 'garnspinnen', 'koloss-spinnen', 'raub-laufspinnen', 'gratspinnen', 'panzerspinnen'];
const expectedNames = ['Höhlenkriecher', 'Garnspinnen', 'Koloss-Spinnen', 'Raub- & Laufspinnen', 'Gratspinnen', 'Panzerspinnen'];
const metricLabels = ['Gefahr', 'Zähmbarkeit', 'Jagdintelligenz', 'Körperkraft', 'Revierkontrolle', 'Widerstandskraft'];

async function readProfile(id) {
  const directory = new URL(`../tiere/insekten/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(INSECT_PROFILE_IDS.map(readProfile));

test('the insect registry contains all six supplied dossiers in atlas order', () => {
  assert.deepEqual(INSECT_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../tiere/insekten/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderInsectProfile(profile, navigation));
    assert(profile.summary.length >= 120);
    assert(profile.quote.length >= 35);
    assert(profile.quoteAttribution.length >= 15);
    assert(profile.sections.length >= 7);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.facts.length >= 11);
    assert.deepEqual(profile.metrics.labels, metricLabels);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));
    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all((profile.related?.entries || []).filter(entry => entry.image).map(entry => access(new URL(entry.image.src, directory))));
  });
}

test('known castes and spider lines retain their names and complete illustrations', () => {
  const [crawler, yarnSpider, , runningSpider] = profiles;
  assert.deepEqual(crawler.related.entries.map(entry => entry.name), ['Eier', 'Larven', 'Drohnen', 'Krieger', 'Kundschafter', 'Adlige', 'Schwarmkönigin']);
  assert.deepEqual(yarnSpider.related.entries.map(entry => entry.name), ['Höhlengarn', 'Waldgarn', 'Blutgarn', 'Sumpfgarn', 'Frostgarn']);
  assert.deepEqual(runningSpider.related.entries.map(entry => entry.name), ['Frosthetzer', 'Steinläufer', 'Knochenläufer', 'Blutsucher', 'Sumpfhetzer']);
  for (const profile of [crawler, yarnSpider, runningSpider]) {
    assert(profile.related.entries.every(entry => entry.image && entry.name !== '???'));
  }
});

test('unknown Koloss, Grat and Panzer variants remain explicitly unfilled', () => {
  for (const profile of [profiles[2], profiles[4], profiles[5]]) {
    assert.equal(profile.related.entries.length, 5);
    assert(profile.related.entries.every(entry => entry.name === '???'));
    assert(profile.related.entries.every(entry => entry.status === 'Noch unausgefüllt'));
    assert(profile.related.entries.every(entry => !entry.image && !entry.href));
  }
});

test('all supplied caste, variant and theme images are local and documented', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/insect-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 21);
  assert(manifest.items.every(item => item.sourceType === 'user-provided-profile-table'));
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  for (const profile of profiles.slice(1)) {
    assert.equal(profile.hero.src, `../../../assets/insect-profiles/${profile.id}-hero.webp`);
    assert(manifest.items.some(item => item.file.endsWith(`/${profile.id}-hero.webp`) && item.role === 'Themenbild'));
  }
});

test('field-guide portraits and cards preserve complete illustrations and keep facts beside text', async () => {
  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
  assert(css.includes('.field-profile-facts { position: sticky'));
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-related-image'));
  assert(css.includes('.field-plate img'));
  assert.equal((css.match(/object-fit:\s*contain/g) || []).length, 4);
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('overflow-wrap: anywhere'));
});

test('the insect overview links every completed dossier', async () => {
  const overview = JSON.parse(await readFile(new URL('../tiere/insekten/art.json', import.meta.url), 'utf8'));
  const entries = overview.atlas.groups.flatMap(group => group.entries);
  for (const id of expectedIds) {
    const entry = entries.find(candidate => candidate.id === id);
    assert.equal(entry.href, `./${id}/index.html`);
    assert.equal(entry.status, 'Dossier verfügbar');
  }
});

test('the insect-profile renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }],
    plates: []
  };
  const html = renderInsectProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
