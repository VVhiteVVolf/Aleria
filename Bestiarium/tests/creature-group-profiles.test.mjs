import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';
import { CREATURE_GROUP_PROFILE_IDS } from '../modules/creature-group-profile/creature-group-profile-registry.mjs';
import { renderCreatureGroupProfile } from '../modules/creature-group-profile/creature-group-profile-template.mjs';

const expectedIds = ['geister', 'nekrophagen', 'trolle', 'riesen', 'kobolde', 'ogroiden', 'vampire', 'inferniiden', 'aelvar', 'unhold', 'nautiloiden', 'sylvaniiden', 'infestiden', 'psioniden'];
const expectedNames = ['Geister', 'Nekrophagen', 'Trolle', 'Riesen', 'Kobolde, Wichtel & Goblins', 'Ogroiden', 'Vampire', 'Inferniiden', 'Aelvar', 'Unholde', 'Nautiloiden', 'Sylvaniiden', 'Infestiiden', 'Psioniden'];
const expectedKnownNames = {
  geister: ['Dullahan', 'Erscheinung (Geist)', 'Mahr', 'Dämon', 'Wächtergeist', 'Banshee (Todesfee)', 'Irrlichter & Irrlichtmutter', 'Naturahne'],
  nekrophagen: ['Zombie', 'Ghule', 'Draugr', 'Lich', 'Versunkener', 'Scheusal', 'Gruftweib / Verschlinger', 'Skelett', 'Nebling', 'Widergänger', 'Hexenrabe / Rabenhexe', 'Grall', 'Mumie', 'Sumpfzehrer'],
  trolle: ['Frosttroll', 'Flusstroll', 'Waldtroll', 'Bergtroll', 'Landtroll', 'Höhlentroll', 'Sumpftroll', 'Hügeltroll', 'Nebeltroll', 'Steppentroll', 'Aschetroll', 'Tundratroll', 'Dschungeltroll', 'Tiefentroll', 'Steintroll'],
  riesen: ['Jötun', 'Goliath', 'Zyklop', 'Fomóraig', 'Tlacharn', 'Bogann', 'Silvarn'],
  kobolde: ['Feuerkobold', 'Leidling', 'Grimling', 'Blutling', 'Hornling', 'Drachling', 'Schädling', 'Racheling', 'Wunschling', 'Lustling'],
  ogroiden: ['Gorak', 'Ognir', 'Grimnak', 'Bhalgar', 'Zarok'],
  vampire: ['Vampirfürst', 'Nosferat', 'Mula', 'Alp', 'Nachzehrer', 'Striga', 'Blutsauger'],
  inferniiden: ['Erzteufel', 'Dagonar', 'Ignarii', 'Ignit', 'Nixhunde', 'Balgrath', 'Flickerlinge', 'Erzdämon', 'Sukkubus & Inkubus', 'Formwandler', 'Lustling', 'Satyr'],
  aelvar: ['Lunen (Lunara)', 'Lamenta (Hela)', 'Nyxaren (Nyxara)', 'Erinyen (Nemsara)', 'Umbren (Nyxara)'],
  unhold: ['Basilisk', 'Tschort', 'Lykan', 'Ursa', 'Drakar', 'Tuskar', 'Stravin', 'Araknor', 'Felkris', 'Lithrak', 'Chimäre', 'Mantikor', 'Phönix', 'Hydra', 'Sphinx'],
  nautiloiden: ['Thraalkin', 'Sirenen', 'Leviathane'],
  sylvaniiden: ['Korrumpierter (Ahnenbaum)', 'Korrumpierter (Abkömmling)', 'Korrumpiertes (Ahnentier)', 'Korrumpierter (Ahnengeist)', 'Waldschrat', 'Erlschrat', 'Zarok', 'Zatrakin', 'Hornling'],
  infestiden: ['Naga'],
  psioniden: ['Lenker', 'Sucher', 'Lauerer', 'Schädling', 'Brütling', 'Wandler']
};
const expectedUnknownCounts = { geister: 7, nekrophagen: 1, trolle: 0, riesen: 8, kobolde: 5, ogroiden: 10, vampire: 9, inferniiden: 2, aelvar: 0, unhold: 5, nautiloiden: 7, sylvaniiden: 6, infestiden: 9, psioniden: 4 };
const expectedEntryCounts = { geister: 15, nekrophagen: 15, trolle: 15, riesen: 15, kobolde: 15, ogroiden: 15, vampire: 16, inferniiden: 14, aelvar: 5, unhold: 20, nautiloiden: 10, sylvaniiden: 15, infestiden: 10, psioniden: 10 };
const expectedMetricLabels = {
  geister: ['Bedrohung', 'Manifestation', 'Eigenwille', 'Bindungsstärke', 'Bannresistenz', 'Jenseitsmacht'],
  nekrophagen: ['Bedrohung', 'Körperkraft', 'Jagdtrieb', 'Eigenwille', 'Zähigkeit', 'Nekrotische Macht'],
  trolle: ['Gefahr', 'Körperlichkeit', 'Intelligenz', 'Widerstandskraft', 'Sozialverhalten', 'Übernatürliche Macht'],
  riesen: ['Gefahr', 'Körperlichkeit', 'Intelligenz', 'Widerstandskraft', 'Sozialverhalten', 'Übernatürliche Macht'],
  kobolde: ['Überzahldruck', 'Fallenbau', 'Anführerbindung', 'Infernale Prägung', 'Anpassungsbreite', 'Einzelkampfkraft'],
  ogroiden: ['Nahkampfdruck', 'Kriegserfahrung', 'Hierarchiezwang', 'Infernale Prägung', 'Magiebegabung', 'Taktische Wendigkeit'],
  vampire: ['Hierarchiemacht', 'Blutbindung', 'Gestaltwandel', 'Menschentarnung', 'Sakralanfälligkeit', 'Sonnenmeidung'],
  inferniiden: ['Schöpferbindung', 'Hierarchiedruck', 'Infernale Macht', 'Seelenformung', 'Gestaltvielfalt', 'Sakralanfälligkeit'],
  aelvar: ['Täuschung', 'Matronenmacht', 'Zauberwirken', 'Heimlichkeit', 'Göttinnenbindung', 'Nahkampfdruck'],
  unhold: ['Jagdtrieb', 'Anpassung', 'Revierbindung', 'Körperhärte', 'Regeneration', 'Korruptionsgefahr'],
  nautiloiden: ['Tiefenbindung', 'Wasserkraft', 'Fremdartigkeit', 'Thraalbindung', 'Landtauglichkeit', 'Bannresistenz'],
  sylvaniiden: ['Jagdtrieb', 'Reviermacht', 'Verderbnisgrad', 'Umgebungswandel', 'Fluchbindung', 'Feueranfälligkeit'],
  infestiden: ['Ausbreitungsdruck', 'Nergalothbindung', 'Körperwandel', 'Brutbeharrlichkeit', 'Verbergung', 'Reinigungsanfälligkeit'],
  psioniden: ['Schwarmkopplung', 'Willensdruck', 'Gedankenraub', 'Metamorphose', 'Befehlsabhängigkeit', 'Netzstörung']
};

async function readProfile(id) {
  const directory = new URL(`../wesen/gruppen/${id}/`, import.meta.url);
  return JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
}

const profiles = await Promise.all(CREATURE_GROUP_PROFILE_IDS.map(readProfile));

test('the creature-group registry preserves the catalog order', () => {
  assert.deepEqual(CREATURE_GROUP_PROFILE_IDS, expectedIds);
  assert.deepEqual(profiles.map(profile => profile.name), expectedNames);
});

for (const [index, profile] of profiles.entries()) {
  test(`${profile.id}: generated dossier is complete, local and current`, async () => {
    const directory = new URL(`../wesen/gruppen/${profile.id}/`, import.meta.url);
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    const navigation = {
      previous: index > 0 ? profiles[index - 1] : null,
      next: index < profiles.length - 1 ? profiles[index + 1] : null
    };

    assert.equal(html, renderCreatureGroupProfile(profile, navigation));
    assert(profile.summary.length >= 180);
    assert(profile.quote.length >= 65);
    assert(profile.quoteAttribution.length >= 25);
    assert(profile.sections.length >= 6);
    assert(profile.sections.every(section => section.blocks.length));
    assert(profile.sections.some(section => section.id === 'trivia'));
    assert(profile.facts.length >= 11);
    assert.deepEqual(profile.metrics.labels, expectedMetricLabels[profile.id]);
    assert(profile.metrics.values.every(value => Number.isInteger(value) && value >= 1 && value <= 10));
    assert.equal(profile.related.entries.length, expectedEntryCounts[profile.id]);

    const known = profile.related.entries.filter(entry => !entry.unknown);
    const unknown = profile.related.entries.filter(entry => entry.unknown);
    assert.deepEqual(known.map(entry => entry.name), expectedKnownNames[profile.id]);
    assert.equal(unknown.length, expectedUnknownCounts[profile.id]);
    assert(known.every(entry => entry.image && /vollständig/i.test(entry.image.alt)));
    assert(unknown.every(entry => entry.name === '???' && entry.region === '???' && entry.href === null && !entry.image));

    if (profile.related.groups?.length) {
      assert.deepEqual(profile.related.groups.flatMap(group => group.entryIds), profile.related.entries.map(entry => entry.id));
      assert.match(html, /field-related-groups\.css/);
      assert.match(html, /data-related-group=/);
      assert.doesNotMatch(html, /data-related-tier=/);
    }

    if (profile.related.branches?.length) {
      assert.deepEqual(profile.related.branches.flatMap(branch => branch.levels.flatMap(level => level.entryIds)), profile.related.entries.map(entry => entry.id));
      assert.match(html, /field-related-branches\.css/);
      assert.match(html, /data-related-branch=/);
      assert.match(html, /data-related-branch-level=/);
      assert.doesNotMatch(html, /data-related-tier=/);
    }

    assert(html.indexOf('field-profile-narrative') < html.indexOf('field-profile-facts'));
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/index\.html#kreaturen"/);
    assert(!/https?:\/\/|animexx|tumblr|onclick=|oninput=|onchange=|Zitat bla|Zitat sprecher|(?:^|\W)\.{3,}(?:\W|$)/i.test(html));

    await access(new URL(profile.icon.src, directory));
    await access(new URL(profile.hero.src, directory));
    await Promise.all(known.map(entry => access(new URL(entry.image.src, directory))));
  });
}

test('all supplied creature-group images are documented and preserved without cropping rules', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/creature-group-profile-sources.json', import.meta.url), 'utf8'));
  assert.equal(manifest.items.length, 116);
  assert.equal(new Set(manifest.items.map(item => item.id)).size, 116);
  assert(manifest.items.every(item => ['user-provided-profile-table', 'generated-for-missing-group-image'].includes(item.sourceType)));
  const generated = manifest.items.filter(item => item.sourceType === 'generated-for-missing-group-image');
  assert.deepEqual(generated.map(item => item.id), ['aelvar-hero', 'nautiloiden-leviathan']);
  assert(generated.every(item => item.generationPrompt?.length >= 80));
  const expectedMappedSources = {
    'unhold-hero': 'https://i.imgur.com/sdiH7BN.png', 'unhold-basilisk': 'https://i.imgur.com/5kLnA2v.png',
    'unhold-tschort': 'https://i.imgur.com/EEYpcCv.png', 'unhold-lykan': 'https://i.imgur.com/izAOftv.png',
    'unhold-ursa': 'https://i.imgur.com/A97z1rG.png', 'unhold-drakar': 'https://i.imgur.com/zLOuQzl.png',
    'unhold-tuskar': 'https://i.imgur.com/3ez2GEC.png', 'unhold-stravin': 'https://i.imgur.com/xy5frcH.png',
    'unhold-araknor': 'https://i.imgur.com/BX8kfXb.png', 'unhold-felkris': 'https://i.imgur.com/hnyzA6t.png',
    'unhold-lithrak': 'https://i.imgur.com/qFO1FAl.png', 'unhold-chimaere': 'https://i.imgur.com/6tql639.png',
    'unhold-mantikor': 'https://i.imgur.com/SCjJ32w.png', 'unhold-phoenix': 'https://i.imgur.com/L5ZeKhX.png',
    'unhold-hydra': 'https://i.imgur.com/F9ES2JM.png', 'unhold-sphinx': 'https://i.imgur.com/DCqq4g7.png',
    'nautiloiden-hero': 'https://i.imgur.com/z8Dhcbd.png', 'nautiloiden-thraalkin': 'https://i.imgur.com/KCr6CLK.png',
    'nautiloiden-sirenen': 'https://i.imgur.com/gFPrARY.png', 'sylvaniiden-hero': 'https://i.imgur.com/93Bu7Ab.png',
    'sylvaniiden-korrumpierter-ahnenbaum': 'https://i.imgur.com/7wPt2O2.png', 'sylvaniiden-korrumpierter-abkoemmling': 'https://i.imgur.com/pUpypu6.png',
    'sylvaniiden-korrumpiertes-ahnentier': 'https://i.imgur.com/vKdP6P9.png', 'sylvaniiden-korrumpierter-ahnengeist': 'https://i.imgur.com/PNTQhkX.png',
    'sylvaniiden-waldschrat': 'https://i.imgur.com/QwZKTpG.png', 'sylvaniiden-erlschrat': 'https://i.imgur.com/LIhyIP3.png',
    'sylvaniiden-zarok': 'https://i.imgur.com/w9MaNxy.png', 'sylvaniiden-zatrakin': 'https://i.imgur.com/F6uVdHZ.png',
    'sylvaniiden-hornling': 'https://i.imgur.com/rfIwU2f.png', 'infestiden-hero': 'https://i.imgur.com/4RLsyUE.png',
    'infestiden-naga': 'https://i.imgur.com/S2g1gGo.png', 'psioniden-lenker': 'https://i.imgur.com/lfCuUra.png',
    'psioniden-sucher': 'https://i.imgur.com/8N3bOht.png', 'psioniden-lauerer': 'https://i.imgur.com/hoWoM6E.png',
    'psioniden-schaedling': 'https://i.imgur.com/sH0sfJC.png', 'psioniden-bruetling': 'https://i.imgur.com/5DQvils.png',
    'psioniden-wandler': 'https://i.imgur.com/MQ04jZC.png', 'aelvar-lunen': 'https://i.imgur.com/JgLi9Wi.png',
    'aelvar-lamenta': 'https://i.imgur.com/y8S45aX.png', 'aelvar-nyxaren': 'https://i.imgur.com/Z4O2fic.png',
    'aelvar-erinyen': 'https://i.imgur.com/5c2XAJI.png', 'aelvar-umbren': 'https://i.imgur.com/KHLv9w4.png'
  };
  const manifestById = new Map(manifest.items.map(item => [item.id, item]));
  for (const [id, source] of Object.entries(expectedMappedSources)) assert.equal(manifestById.get(id)?.source, source, id);
  assert(manifest.items.every(item => item.width > 0 && item.height > 0));
  await Promise.all(manifest.items.map(item => access(new URL(`../assets/${item.file.slice(2)}`, import.meta.url))));

  const css = await readFile(new URL('../modules/field-guide-profile/field-guide-profile.css', import.meta.url), 'utf8');
  assert(css.includes('.field-profile-portrait-image'));
  assert(css.includes('.field-related-image'));
  assert(css.includes('object-fit: contain'));
  assert(!/object-fit:\s*cover/.test(css));
  assert(css.includes('filter: drop-shadow'));
  assert(css.includes('grid-template-columns: minmax(0, 1fr) 255px'));
});

test('the creature catalog links directly to every completed group dossier', () => {
  for (const id of expectedIds) {
    const entry = BESTIARY_ENTRIES.find(candidate => candidate.id === id);
    assert.equal(entry.href, `./wesen/gruppen/${id}/index.html`);
    assert(!/künftig|folgt/i.test(entry.description));
  }
});

test('the creature-group renderer escapes authored text', () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const image = { src: './image.webp', width: 1, height: 1, alt: unsafe, caption: unsafe };
  const record = {
    id: 'escape', name: unsafe, classification: unsafe, continent: unsafe, region: unsafe,
    folio: unsafe, summary: unsafe, quote: unsafe, quoteAttribution: unsafe, parentGroupId: unsafe,
    icon: image, hero: image, facts: [{ label: unsafe, value: unsafe }],
    metrics: { labels: ['A', 'B', 'C'], values: [1, 2, 3], source: unsafe },
    related: { title: unsafe, intro: unsafe, entries: [{ id: 'bad', name: unsafe, region: unsafe, description: unsafe, status: unsafe, image }] },
    sections: [{ id: 'intro', title: unsafe, blocks: [{ type: 'paragraph', text: unsafe }, { type: 'list', items: [unsafe] }] }],
    plates: []
  };
  const html = renderCreatureGroupProfile(record);
  assert(!html.includes(unsafe));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
