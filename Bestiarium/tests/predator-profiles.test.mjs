import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { PREDATOR_GROUPS, PREDATOR_PROFILE_IDS, predatorGroupFor } from '../modules/predator-profile/predator-registry.mjs';
import { renderPredatorOverview } from '../modules/predator-profile/predator-overview-template.mjs';
import { renderPredatorProfile } from '../modules/predator-profile/predator-profile-template.mjs';

const metricLabels = ['Gefahr', 'Zähmbarkeit', 'Intelligenz', 'Körperkraft', 'Sozialverhalten', 'Ausdauer'];
const expectedProfileIds = ['gramnir', 'faerog', 'brychgi', 'lughar', 'ulfr', 'ruadhr', 'rhewddann', 'brannoc', 'arth', 'draugrbjorn', 'dubharr', 'gramh', 'broan', 'muine', 'banmor-isbjorn'];

async function readOverview(groupId) {
  const directory = new URL(`../tiere/raubtiere/${groupId}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('uebersicht.json', directory), 'utf8'));
}

async function readProfile(groupId, profileId) {
  const directory = new URL(`../tiere/raubtiere/${groupId}/${profileId}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const overviews = await Promise.all(PREDATOR_GROUPS.map(group => readOverview(group.id)));
const profilesByGroup = new Map();
for (const group of PREDATOR_GROUPS) {
  profilesByGroup.set(group.id, await Promise.all(group.profileIds.map(id => readProfile(group.id, id))));
}

test('predator registry preserves the requested hierarchy and all completed dossiers', () => {
  assert.deepEqual(PREDATOR_GROUPS.map(group => group.id), ['raubkatzen', 'woelfe', 'baeren']);
  assert.deepEqual(PREDATOR_PROFILE_IDS, expectedProfileIds);
  assert.equal(new Set(PREDATOR_PROFILE_IDS).size, 15);
  assert.equal(predatorGroupFor('ulfr')?.id, 'woelfe');
  assert.equal(predatorGroupFor('brannoc')?.id, 'baeren');
  assert.equal(predatorGroupFor('llewroth'), null);
});

for (const [overviewIndex, overview] of overviews.entries()) {
  test(`${overview.id}: generated overview is complete, local and current`, async () => {
    const group = PREDATOR_GROUPS[overviewIndex];
    const directory = new URL(`../tiere/raubtiere/${overview.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const entries = overview.atlas.groups.flatMap(atlasGroup => atlasGroup.entries);

    assert.equal(overview.id, group.id);
    assert.equal(html, renderPredatorOverview(overview));
    assert(overview.lead.length >= 100);
    assert(overview.sections.length >= 2);
    assert(overview.comparison.columns.length >= 2);
    assert(entries.length >= 3);
    assert(!/https?:\/\/|animexx|onclick=|oninput=|onchange=|Zitat bla|\.\.\.\.|\?\?/i.test(html));
    assert(html.includes('object-fit:') === false);
    await access(new URL(overview.icon.src, directory));
    await access(new URL(overview.hero.src, directory));
    await Promise.all(entries.map(entry => access(new URL(entry.image.src, directory))));
    await Promise.all(entries.filter(entry => entry.href).map(entry => access(new URL(entry.href, directory))));
  });
}

for (const group of PREDATOR_GROUPS) {
  const profiles = profilesByGroup.get(group.id);
  for (const [index, profile] of profiles.entries()) {
    test(`${group.id}/${profile.id}: generated dossier preserves text, image and field values`, async () => {
      const directory = new URL(`../tiere/raubtiere/${group.id}/${profile.id}/`, import.meta.url);
      const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
      const navigation = {
        previous: index > 0 ? profiles[index - 1] : null,
        next: index < profiles.length - 1 ? profiles[index + 1] : null
      };

      assert.equal(html, renderPredatorProfile(profile, navigation));
      assert.equal(profile.group.id, group.id);
      assert(profile.summary.length >= 90);
      assert(profile.quote.length >= 20);
      assert(profile.facts.length >= 6);
      assert(profile.sections.length >= (profile.id === 'brannoc' ? 5 : 8));
      assert(profile.sections.every(section => section.id && section.title && section.blocks.length));
      assert(profile.sections.every(section => section.blocks.every(block => block.type === 'list' ? block.items.length : Boolean(block.text))));
      assert.deepEqual(profile.metrics.labels, metricLabels);
      assert.equal(profile.metrics.values.length, 6);
      assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
      assert.equal(profile.metrics.source, 'Aus dem Arttext abgeleitete Feldbewertung');
      assert(html.includes('keine exakten Messwerte'));
      assert(!/https?:\/\/|animexx|onclick=|oninput=|onchange=|Zitat bla|\.\.\.\.|\?\?/i.test(html));
      assert(html.includes('object-fit:') === false);
      await access(new URL(profile.icon.src, directory));
      await access(new URL(profile.hero.src, directory));
    });
  }
}

test('text-derived danger profiles preserve representative distinctions', () => {
  const profiles = Object.fromEntries([...profilesByGroup.values()].flat().map(profile => [profile.id, profile]));
  assert.deepEqual(profiles.brychgi.metrics.values, [9, 1, 7, 7, 9, 8]);
  assert.deepEqual(profiles.faerog.metrics.values, [3, 5, 9, 4, 4, 7]);
  assert.deepEqual(profiles.ulfr.metrics.values, [10, 1, 9, 8, 3, 8]);
  assert.deepEqual(profiles.brannoc.metrics.values, [3, 9, 8, 10, 7, 6]);
  assert.deepEqual(profiles['banmor-isbjorn'].metrics.values, [10, 1, 8, 10, 1, 10]);
});

test('overview cards expose 15 dossiers and preserve seven explicit placeholders', () => {
  const entries = overviews.flatMap(overview => overview.atlas.groups.flatMap(group => group.entries));
  const available = entries.filter(entry => entry.href);
  const pending = entries.filter(entry => !entry.href);

  assert.equal(available.length, 15);
  assert.deepEqual(available.map(entry => entry.id), expectedProfileIds);
  assert(available.every(entry => entry.status === 'Dossier verfügbar'));
  assert.equal(pending.length, 7);
  assert.deepEqual(pending.map(entry => entry.id), ['llewroth', 'saebelzahntiger', 'estryller-luchs', 'gnoll', 'lothir-moinneach', 'lothir-west', 'lothir-ost']);
  assert(pending.every(entry => entry.status === 'Dossier vorgemerkt'));
});

test('the parent predator page links all three group overviews', async () => {
  const directory = new URL('../tiere/raubtiere/', import.meta.url);
  const record = JSON.parse(await readFile(new URL('art.json', directory), 'utf8'));
  const entries = record.atlas.groups.flatMap(group => group.entries);
  assert.deepEqual(entries.map(entry => entry.id), PREDATOR_GROUPS.map(group => group.id));
  assert(entries.every(entry => entry.href === `./${entry.id}/index.html`));
  assert(entries.every(entry => entry.status === 'Übersicht verfügbar'));
  await Promise.all(entries.map(entry => access(new URL(entry.href, directory))));
});

test('all 38 inherited and user-provided predator images are archived locally', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/predator-sources.json', import.meta.url), 'utf8'));
  const userImages = manifest.items.filter(item => item.sourceType === 'user-provided');
  assert.equal(manifest.items.length, 38);
  assert.deepEqual(userImages.map(item => item.sourceUrl), [
    'https://i.imgur.com/J4IU88Z.png',
    'https://i.imgur.com/dSPnaAB.png',
    'https://i.imgur.com/63ozpzP.png'
  ]);
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));
});

test('predator templates escape authored content', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const overview = {
    id: 'escape', title: unsafe, subtitle: unsafe, classification: unsafe, folio: unsafe, lead: unsafe,
    quote: unsafe, quoteAttribution: unsafe, icon: image, hero: image,
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }] }],
    comparison: { eyebrow: unsafe, title: unsafe, intro: unsafe, columns: [{ kicker: unsafe, title: unsafe, points: [unsafe] }] },
    atlas: { title: unsafe, intro: unsafe, groups: [{ id: 'group', kicker: unsafe, title: unsafe, description: unsafe, entries: [{ id: 'entry', title: unsafe, region: unsafe, description: unsafe, status: unsafe, href: null, image }] }] }
  };
  const profile = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe, folio: unsafe,
    quote: unsafe, quoteAttribution: unsafe, summary: unsafe, icon: image, hero: image,
    facts: [{ label: unsafe, value: unsafe }], metrics: { labels: Array(6).fill(unsafe), values: Array(6).fill(5), source: unsafe },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }],
    group: { id: 'woelfe', title: unsafe, subgroupId: 'woelfe' }
  };

  for (const html of [renderPredatorOverview(overview), renderPredatorProfile(profile)]) {
    assert(!html.includes(unsafe));
    assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  }
});
