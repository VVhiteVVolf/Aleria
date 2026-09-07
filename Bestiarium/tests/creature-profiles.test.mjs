import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { CREATURE_PROFILE_IDS } from '../modules/creature-profile/profile-registry.mjs';
import { renderCreatureProfile } from '../modules/creature-profile/profile-template.mjs';
import { BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';

for (const id of CREATURE_PROFILE_IDS) {
  const directory = new URL(`../wesen/${id}/`, import.meta.url);
  const profile = JSON.parse(await readFile(new URL('profil.json', directory), 'utf8'));
  test(`${id}: published page is current, linked and readable without client rendering`, async () => {
    const html = (await readFile(new URL('index.html', directory), 'utf8')).replace(/\r\n/g, '\n');
    assert.equal(html, renderCreatureProfile(profile));
    assert.equal(BESTIARY_ENTRIES.find(entry => entry.id === id).href, `./wesen/${id}/index.html`);
    for (const section of profile.sections) {
      assert(html.includes(`id="${section.id}"`));
      assert(section.paragraphs.length > 0);
    }
    assert(!/onclick=|oninput=|onchange=|animexx|Zitat bla bla|Trivia\.\.\./i.test(html));
  });

  test(`${id}: illustrations are local and unfinished entries do not lead to missing pages`, async () => {
    const entries = [...profile.lineages, ...profile.gallery.items];
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
    for (const image of [profile.portrait, ...entries.map(entry => entry.image)]) {
      assert(image.src.startsWith('./assets/'));
      assert(image.width > 0 && image.height > 0);
      await access(new URL(image.src, directory));
    }
    for (const entry of entries) {
      if (entry.href) {
        assert(entry.href.startsWith('./'));
        await access(new URL(entry.href, directory));
      } else {
        assert.equal(entry.status, 'Noch nicht ausgearbeitet');
      }
    }
  });
}

test('Lütten profile retains all named lineages, facts and seven requested gallery titles', async () => {
  const profile = JSON.parse(await readFile(new URL('../wesen/luetten/profil.json', import.meta.url), 'utf8'));
  assert.equal(profile.sections.length, 8);
  assert.equal(profile.facts.length, 11);
  assert.deepEqual(profile.lineages.map(entry => entry.title), ['Frostlütten', 'Laublütten', 'Felslütten']);
  assert.deepEqual(profile.gallery.items.map(entry => entry.title), [
    'Laublütten Krötenmeister', 'Frostlütten Eremit', 'Felslütten Schmiedemeister',
    'Laublütten Druide', 'Laublütten Jägerin', 'Laublütten Waldpirscher', 'Laublütten Krähenherr'
  ]);
});

test('Fairean profile retains every lore section, known form and requested gallery title', async () => {
  const profile = JSON.parse(await readFile(new URL('../wesen/fairean/profil.json', import.meta.url), 'utf8'));
  assert.equal(profile.sections.length, 6);
  assert.equal(profile.sections.reduce((count, section) => count + section.paragraphs.length, 0) + profile.lineages.length, 27);
  assert.equal(profile.facts.length, 11);
  assert.deepEqual(profile.lineages.map(entry => entry.title), ['Faire Wächter', 'Faire Vertraute', 'Faire Golems']);
  assert.deepEqual(profile.lineages.map(entry => entry.image.src), [
    './assets/faire-waechter.webp', './assets/faire-vertraute.webp', './assets/faire-golems.webp'
  ]);
  assert.deepEqual(profile.gallery.items.map(entry => entry.title), [
    'Faire Golem I.', 'Faire Golem II.', 'Faire Golem III.', 'Faire Wächter I.',
    'Faire Wächter II.', 'Faire Vertrauter I.', 'Faire Vertrauter II.'
  ]);
  assert.equal(
    profile.lineages.some(lineage => profile.gallery.items.some(item => item.image.src === lineage.image.src)),
    false
  );
  assert.equal(profile.facts.filter(fact => fact.value === 'Noch nicht ausgearbeitet').length, 3);
  assert(profile.facts.every(fact => fact.label.length < 30 && fact.value));
});

test('the static profile template escapes authored text', () => {
  const text = '<img src=x onerror="alert(1)">';
  const profile = {
    title: text, lead: text, chapter: { id: 'kreaturen', title: 'Kreaturen' },
    habitats: [], sections: [], facts: [], portrait: { src: './assets/picture.webp', width: 100, height: 100 },
    gallery: { title: text, intro: text, items: [] }, trivia: { title: text, text }
  };
  const html = renderCreatureProfile(profile);
  assert(!html.includes(text));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
});
