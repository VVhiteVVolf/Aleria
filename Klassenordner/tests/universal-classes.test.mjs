import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { UNIVERSAL_CLASS_IDS, resolveUniversalClassId, getUniversalClassPageHref } from '../modules/pages/universal-class-registry.js';
import { validateClassDocument, validateClassRichText } from '../modules/pages/class-page-content.js';
import { renderUniversalClassPage } from '../modules/pages/class-page-template.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterCreationTemplate } from '../../AleriaAlmanach/modules/combat/character-creation-templates.js';

const root = new URL('../', import.meta.url);
const documents = await Promise.all(UNIVERSAL_CLASS_IDS.map(async id => validateClassDocument(
  JSON.parse(await readFile(new URL(`Basisklassen/${id}/klasse.json`, root), 'utf8')), id
)));
const byId = new Map(documents.map(document => [document.id, document]));
const plain = markup => markup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('all fifteen supplied classes retain characteristic source passages and their own pages', async () => {
  const passages = {
    kampfer: 'Sir Morgen', reiter: 'Tarosh', alchemist: 'Sonne Shirazads',
    magier: 'Halfdan der Schwarze', asket: 'Sei wie das Wasser', druide: 'Gärtner der Welt',
    schurke: 'Künstler des Hinterhalts', barde: 'Bewahrer von Legenden',
    pakttrager: 'So sei es besiegelt', kleriker: 'Gebet eines Jüngers des Knechts',
    eidgeschworener: 'Maldras', barbar: 'Sprache der Jagd',
    waldlaufer: 'Meister der Wildnis', seefahrer: 'Kind der Gezeiten', schamane: 'Haketh'
  };
  assert.equal(documents.length, 15);
  assert.equal(new Set(documents.map(document => document.source.sha256)).size, 15, 'The duplicate warrior attachment must not replace the druid');
  for (const [id, passage] of Object.entries(passages)) {
    const document = byId.get(id);
    assert(plain(document.sections.map(section => section.html).join(' ')).includes(passage), `Source passage missing: ${id}`);
    const page = await readFile(new URL(`Basisklassen/${id}/index.html`, root), 'utf8');
    assert(page.includes(passage), `Static content missing: ${id}`);
    const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate document IDs: ${id}`);
    for (const link of page.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^https?:/.test(link[1])) continue;
      if (link[1].startsWith('#')) {
        assert(ids.includes(link[1].slice(1)), `${id}: missing chapter ${link[1]}`);
      } else {
        const target = new URL(link[1], new URL(`Basisklassen/${id}/index.html`, root));
        target.search = ''; target.hash = '';
        await access(target);
      }
    }
  }
});

test('unfinished source material remains pending and no level mechanics are inferred', () => {
  for (const id of ['druide', 'schurke', 'barde', 'kleriker', 'eidgeschworener', 'barbar', 'waldlaufer', 'seefahrer', 'schamane']) {
    const document = byId.get(id);
    assert.equal(document.sections.filter(section => section.status === 'written').length, 1, id);
    assert(document.sections.filter(section => section.status === 'pending').every(section => section.html === ''));
    assert.equal(document.facts.length, 0);
  }
  assert.equal(byId.get('barde').icon, 'https://i.imgur.com/JEBhRaS.png', 'The separately supplied bard emblem is used as the class icon');
  assert.equal(byId.get('barde').illustration, 'https://i.imgur.com/yyP7j4x.png', 'The bard image belongs to the introduction portrait');
  assert(byId.get('asket').sections.some(section => section.html.includes('Klostermönch')), 'The distinction from a religious monk must survive the rename');
  for (const document of documents) {
    assert.equal(document.progression, undefined);
    assert(!renderUniversalClassPage(document, documents).includes('select-level'));
  }
});

test('new names and historical aliases navigate to the same class pages', () => {
  for (const [oldName, id] of [['Mönch', 'asket'], ['monch', 'asket'], ['Hexenmeister', 'pakttrager'], ['Hexer', 'pakttrager'], ['Paktträger', 'pakttrager'], ['Paladin', 'eidgeschworener'], ['Krieger', 'kampfer']]) {
    assert.equal(resolveUniversalClassId(oldName), id);
    assert.equal(getUniversalClassPageHref(oldName), `Basisklassen/${id}/index.html`);
  }
  assert.equal(getUniversalClassPageHref('../../secrets'), '');
  assert.equal(getUniversalClassPageHref('teulu'), '');
});

test('persisted archive aliases project onto renamed classes without changing combat IDs', () => {
  const old = ['Mönch', 'Hexenmeister', 'Hexer', 'Paladin'].map((name, index) => ({
    kind: 'class', name, data: { id: `custom-existing-${index}` }, sources: [{ kind: 'character', id: 'test-character' }]
  }));
  const projected = classifyCharacterArchiveEntries(old);
  assert.deepEqual(projected.map(entry => entry.name), ['Asket', 'Paktträger', 'Paktträger', 'Eidgeschworener']);
  projected.forEach((entry, index) => {
    assert.equal(entry.data.id, old[index].data.id);
    assert.equal(entry.data.baseClass, true);
  });
  assert.equal(getCharacterCreationTemplate('class', 'hexer').id, 'hexer');
  assert.equal(getCharacterCreationTemplate('class', 'hexer').label, 'Paktträger');
});

test('class publishing rejects scripts, handlers, layout HTML and inconsistent records', () => {
  for (const unsafe of ['<script>alert(1)</script>', '<p onclick="alert(1)">Text</p>', '<img src=x onerror=alert(1)>', '<table><tr><td>Layout</td></tr></table>', '<script', '<p style="color:red">Text</p>']) {
    assert.throws(() => validateClassRichText(unsafe));
  }
  assert.equal(validateClassRichText('<p>Text <strong>mit Gewicht</strong>.</p>'), '<p>Text <strong>mit Gewicht</strong>.</p>');
  const duplicate = structuredClone(byId.get('druide'));
  duplicate.sections.push({ ...duplicate.sections[0] });
  assert.throws(() => validateClassDocument(duplicate, 'druide'), /Kapitel-ID/);
  const mismatch = structuredClone(byId.get('druide'));
  mismatch.sections[0].status = 'pending';
  assert.throws(() => validateClassDocument(mismatch, 'druide'), /widersprechen/);
});
