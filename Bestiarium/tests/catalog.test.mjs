import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { BESTIARY_CHAPTERS, BESTIARY_ENTRIES } from '../modules/catalog/catalog-data.js';
import { BESTIARY_TOPICS } from '../modules/topic-board/topic-board-data.js';
import { filterEntries, matchesEntry } from '../modules/catalog/catalog-model.js';

test('the legacy chapters, specimens and source topics remain represented', () => {
  assert.deepEqual(BESTIARY_CHAPTERS.map(chapter => chapter.title), ['Tiere', 'Besondere Exemplare', 'Kreaturen', 'Infernale Wesen', 'Celestiale Wesen']);
  assert.equal(BESTIARY_ENTRIES.length, 43);
  assert.equal(BESTIARY_TOPICS.length, 13);
  const entries = [...BESTIARY_ENTRIES, ...BESTIARY_TOPICS];
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  for (const title of ['Sturmbock', 'Mondläufer', 'Cuimhorn', 'Fairean', 'Lütten', 'Djinn', 'Muhmen', 'Gorgonnen', 'Noch ohne Namen', 'Pferdekreuzungsmatrix']) {
    assert(entries.some(entry => entry.title === title), `Missing legacy subject: ${title}`);
  }
  assert.equal(BESTIARY_ENTRIES.filter(entry => entry.group === 'Diener der Souveränen').length, 5);
  assert.equal(BESTIARY_TOPICS.filter(entry => entry.group === 'Literaturverweis').length, 6);
});

test('search combines words and categories and accepts German umlaut transliterations', () => {
  assert.deepEqual(filterEntries(BESTIARY_ENTRIES, { query: 'MONDLAEUFER Lichthain' }).map(entry => entry.id), ['mondlaeufer']);
  assert.deepEqual(filterEntries(BESTIARY_ENTRIES, { query: 'lütten' }).map(entry => entry.id), ['luetten']);
  assert.equal(filterEntries(BESTIARY_ENTRIES, { query: 'Mondläufer', kind: 'infernale' }).length, 0);
  assert.equal(filterEntries(BESTIARY_ENTRIES, { kind: 'tiere' }).length, 13);
  assert.equal(filterEntries(BESTIARY_ENTRIES, { query: '  ' }).length, 43);
  assert.equal(filterEntries(BESTIARY_ENTRIES, { query: 'nirgendwo-gefunden' }).length, 0);
  assert(BESTIARY_TOPICS.some(entry => matchesEntry(entry, 'Hoellenpakte')));
});

test('each illustrated entry has its own local asset and no obsolete external link', async () => {
  assert.equal(new Set(BESTIARY_ENTRIES.map(entry => entry.image)).size, 43);
  await Promise.all(BESTIARY_ENTRIES.map(entry => access(new URL(entry.image))));
  for (const entry of [...BESTIARY_ENTRIES, ...BESTIARY_TOPICS]) {
    if (entry.href !== null) {
      assert(entry.href.startsWith('./'), 'Published entries must link to a local Bestiarium page');
      await access(new URL(entry.href, new URL('../index.html', import.meta.url)));
    }
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert(!/animexx|onclick=|oninput=|onchange=|https?:\/\//i.test(html));
});

test('project entry points use the new Bestiarium and the retired page is gone', async () => {
  const retiredFiles = ['Bestiarium.html', 'bestiarium-data.js', 'script.js', 'styles.css', 'test.html'];
  await Promise.all(retiredFiles.map(file => assert.rejects(access(new URL(`../${file}`, import.meta.url)))));

  const [directory, portal] = await Promise.all([
    readFile(new URL('../../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../../Hauptseite/index.html', import.meta.url), 'utf8')
  ]);
  assert(!/Bestiarium\/(?:Bestiarium|test)\.html/i.test(`${directory}\n${portal}`));
  assert.match(directory, /href="Bestiarium\/index\.html"/);
  assert.match(portal, /href="\.\.\/Bestiarium\/index\.html"/);
});
