import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { getDraigGardeEntry } from '../modules/draig-leibgarde/draig-leibgarde-entry.mjs';
import { buildDraigGardeActiveLevels } from '../modules/draig-leibgarde/draig-garde-active-levels.mjs';
import { collectGroupRoster } from '../modules/landing/group-landing-roster.js';

test('the screenshot hierarchy contains its named officers, knights, guards and seven anonymous placeholders', () => {
  const levels = buildDraigGardeActiveLevels();
  assert.deepEqual(levels.map(level => level.nodes.length), [1, 1, 2, 5, 5, 5, 5, 5, 5]);
  assert.equal(levels[1].nodes[0].title, 'Sir Marared Curiad');
  assert.deepEqual(levels[2].nodes.map(node => node.title), ['Sir Pellinard Brândyddyn', 'Lady Ysabel Bronnor']);
  assert.match(levels[2].nodes[1].text, /Ysabel stammt aus dem Tal der Milane.*Ritterhauses Bronnor.*Gwendolyn Aderyn/);
  assert.deepEqual(levels[3].nodes.map(node => node.title), ['Lady Eurgain Brândyddyn', 'Sir Urien Caelrith', 'Sir Mathon Curiad', 'Garde Ritter', 'Garde Ritter']);
  assert.deepEqual(levels[4].nodes.map(node => node.title), ['Llywelyn Coeddu', 'Hywel Craigddu', 'Morcant Curiad', 'Lleucu Myrgath', 'Angharad Aelgorn']);
  assert(levels[5].nodes.every(node => node.title === 'Gardist' && node.subtitle === '' && node.portrait));
  assert(levels.slice(6).flatMap(level => level.nodes).every(node => node.title === 'Freier Platz' && node.portrait === ''));
  assert.equal(collectGroupRoster(getDraigGardeEntry()).length, 12, 'Generic illustrated slots are not invented people');
  assert(levels[3].nodes.slice(3).every(node => node.subtitle === '' && node.text === 'Ritter der Garde'));
});

test('media URLs are projected by person and role keys without mutating shared source', () => {
  const entry = getDraigGardeEntry({ mediaByKey: {
    'portrait:ysabel-bronnor': 'https://example.test/ysabel.png',
    'portrait:llywelyn-coeddu': 'https://example.test/llywelyn.png',
    'placeholder:garde-ritter': 'https://example.test/knight.png',
    'placeholder:gardist': 'https://example.test/guard.png'
  } });
  const levels = entry.pages[3].hierarchy.trees[0].levels;
  assert.equal(levels[2].nodes[1].portrait, 'https://example.test/ysabel.png');
  assert.equal(levels[4].nodes[0].portrait, 'https://example.test/llywelyn.png');
  assert(levels[3].nodes.slice(3).every(node => node.portrait === 'https://example.test/knight.png'));
  assert(levels[5].nodes.every(node => node.portrait === 'https://example.test/guard.png'));
  entry.pages[0].description = 'Mutated caller copy';
  assert.notEqual(getDraigGardeEntry().pages[0].description, entry.pages[0].description);
  const fromMap = getDraigGardeEntry({ mediaByKey: new Map([
    ['portrait:ysabel-bronnor', { url: 'https://example.test/ysabel.png' }],
    ['placeholder:garde-ritter', { verifiedURL: 'https://example.test/knight.png' }]
  ]) });
  assert.equal(fromMap.pages[3].hierarchy.trees[0].levels[2].nodes[1].portrait, 'https://example.test/ysabel.png');
  assert.equal(fromMap.pages[3].hierarchy.trees[0].levels[3].nodes[4].portrait, 'https://example.test/knight.png');
});

test('the generated classic seed uses the same entry and preserves registration idempotence', async () => {
  const code = await readFile(new URL('../modules/draig-leibgarde/draig-leibgarde-data.js', import.meta.url), 'utf8');
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(code, context); vm.runInContext(code, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(context.SECTIONS[0].entries[0])), getDraigGardeEntry());
  assert.equal(getDraigGardeEntry().pages.length, 4);
  const former = getDraigGardeEntry().pages[3].hierarchy.trees[1];
  assert.equal(former.levels[0].nodes[0].title, 'Brenric Coeddu');
  assert.equal(former.levels[1].nodes[0].title, 'Idwalladr Arwydd');
});
