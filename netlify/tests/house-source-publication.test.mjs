import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isAuthoringArchive } from '../build/publication-policy.mjs';
import { shouldPublish } from '../build/site-publish.mjs';

const root = 'Familien Häuser und Clans/';
const houses = [
  'Estryll/Cenyr/Tal_der_Milane/Yvains_Klamm/Haus_Aderyn/',
  'Estryll/Cenyr/Ährental/Glyndraith/Haus_Grawn/',
  'Estryll/Cenyr/Aehrental/Glyndraith/Haus_Gwarchod/',
  'Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Arwydd/',
  'Estryll/Cenyr/Silberinsel/Silberbucht/Haus_Saith/',
  'Aldervan/Aeldrunmar/Beispiel/Haus_Beispiel/'
];

test('house HTML source archives stay private to authoring across regions and both filename families', () => {
  for (const house of houses) for (const filename of [
    'animexx-original.html', 'animexx-source.html', 'animexx-source-2026-11-03.html',
    'animexx-source-2026-10-24.html', 'animexx-original-2026-11-03.html', 'animexx-source-2026-11-03-v2.html'
  ]) {
    const file = root + house + filename;
    assert.equal(isAuthoringArchive(file), true, file);
    assert.equal(shouldPublish(file), false, file);
  }
});

test('house source decisions and manifests are excluded without excluding their active assets', () => {
  for (const house of houses) for (const filename of [
    'SOURCE_DECISIONS.md', 'REDAKTION.md', 'source-manifest.json', 'sources.json',
    'quellen.json', 'image-generation.json', 'image-generation-v2.json', 'image-generation-v3.json',
    'assets/quellen.json'
  ]) assert.equal(shouldPublish(root + house + filename), false, root + house + filename);
});

test('active house data, biographies, HTML pages, PNG artwork and explicit original downloads remain public', () => {
  for (const house of houses) for (const filename of [
    'haus.data.js', 'haus.biography.mjs', 'index.html', 'assets/hausdarstellung-original.png',
    'assets/wappen-original.png', 'assets/krieger.png', 'assets/buerger.png',
    'downloads/original.html', 'downloads/original.pdf', 'downloads/original.png', 'downloads/original.zip'
  ]) {
    const file = root + house + filename;
    assert.equal(isAuthoringArchive(file), false, file);
    assert.equal(shouldPublish(file), true, file);
  }
  assert.equal(shouldPublish('AleriaAlmanach/source-manifest.json'), true, 'the ownership boundary is limited to house authoring sources');
});

test('the active house page keeps its public data, biography and canonical family-tree iframe target', async () => {
  const house = root + houses[0];
  const source = await readFile(new URL('../../' + house + 'haus.data.js', import.meta.url), 'utf8');
  const serialized = source.match(/window\.HAEUSER_DATA\s*=\s*([\s\S]*);\s*$/)?.[1];
  assert.ok(serialized, 'the active house data contract must remain readable');
  const data = JSON.parse(serialized);
  assert.match(data.familyTreeEmbed.src, /Stammbaum\.html\?family=haus-aderyn&mode=view/);
  const iframeTarget = decodeURIComponent(new URL(data.familyTreeEmbed.src, 'https://aleria.invalid/AleriaAlmanach/index.html').pathname.slice(1));
  assert.equal(shouldPublish(iframeTarget), true, iframeTarget);
  assert.equal(shouldPublish(house + 'haus.data.js'), true);
  assert.equal(shouldPublish(house + 'haus.biography.mjs'), true);
  assert.equal(shouldPublish(house + 'animexx-source-2026-11-03.html'), false);
});
