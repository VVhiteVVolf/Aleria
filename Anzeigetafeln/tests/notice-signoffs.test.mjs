import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';
import { buildLlysfaenSignoffPack } from '../tools/build-notice-signoffs.mjs';
import { buildNoticeSignoffUpdates, signoffForNotice } from '../tools/issuers/notice-signoffs.mjs';

const copy = value => JSON.parse(JSON.stringify(value));
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
function feature() {
  const context = vm.createContext({ window: {}, console });
  vm.runInContext(readFileSync(new URL('../assets/js/data/authored-notices.js', import.meta.url), 'utf8'), context);
  return context.window.TafelAuthoredNotices;
}
const llysfaen = 'Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen/';

test('all 36 existing sheets receive valid local signoffs without adding notices or altering their content', async () => {
  const app = feature();
  const packs = [await buildGwynthorQuestPack(), await buildLlysfaenSignoffPack()];
  const originals = [copy(packs[0].zettel), read(`${llysfaen}data.json`).state.zettel];
  let total = 0;
  for (const [index, pack] of packs.entries()) {
    const before = copy(originals[index]);
    const merged = app.merge({ zettel: originals[index] }, pack);
    assert.equal(merged.zettel.length, before.length);
    assert.deepEqual(originals[index], before, 'source objects remain untouched');
    for (const notice of merged.zettel) {
      total++;
      assert.ok(notice.verfasserName, notice.id);
      for (const field of ['unterschrift', 'siegel']) {
        assert.ok(notice[field], `${notice.id}: ${field}`);
        assert.ok(existsSync(new URL(decodeURI(notice[field]), new URL('../tafel.html', import.meta.url))), `${notice.id}: local ${field}`);
      }
      const old = before.find(entry => entry.id === notice.id);
      for (const field of ['text', 'title', 'table', 'rewards', 'comments', 'personen', 'x', 'y', 'stackId', 'noticeGroupId', 'portrait']) {
        assert.equal(JSON.stringify(notice[field]), JSON.stringify(old[field]), `${notice.id}: preserve ${field}`);
      }
      for (const field of ['siegel', 'unterschrift']) if (old[field]) assert.equal(notice[field], old[field]);
    }
  }
  assert.equal(total, 36);
  assert.equal(packs[1].zettel.length, 0, 'Llysfaen is a correction pack, not a second copy of existing sheets');
});

test('missing, null, blank and whitespace fields are filled; existing images and their metadata stay untouched', () => {
  const app = feature();
  const id = 'gwynthor-torvik-seit-lyristag-vermisst';
  const updates = buildNoticeSignoffUpdates([id]);
  const expected = signoffForNotice(id);
  for (const blank of [undefined, null, '', ' \t ']) {
    const notice = { id, siegel: blank, unterschrift: blank, verfasserName: blank, text: 'Original', comments: [{ id: 'reply' }] };
    const updated = app.merge({ zettel: [notice] }, { zettel: [], updates }).zettel[0];
    assert.equal(updated.siegel, expected.siegel);
    assert.equal(updated.unterschrift, expected.unterschrift);
    assert.equal(updated.media.unterschrift.fit, 'cover');
    assert.equal(updated.text, notice.text);
    assert.equal(updated.comments, notice.comments);
  }
  const own = { id, siegel: 'own-seal.png', unterschrift: 'own-ink.png', verfasserName: 'Eigener Absender',
    media: { unterschrift: { src: 'own-ink.png', fit: 'contain', position: 'bottom' } } };
  const original = copy(own);
  assert.deepEqual(copy(app.merge({ zettel: [own] }, { zettel: [], updates }).zettel[0]), original);
});

test('explicit seal choices are preserved and later clear/delete operations survive repeated loading', () => {
  const app = feature();
  const id = 'gwynthor-fearnan-die-verschwundene-schatulle';
  const pack = { zettel: [], updates: buildNoticeSignoffUpdates([id]) };
  for (const sealPreset of ['none', 'baeurlich', 'buergerlich', 'federkiel', 'wolken-der-daemmerung']) {
    const result = app.merge({ zettel: [{ id, siegel: '', sealPreset }] }, pack);
    assert.equal(result.zettel[0].siegel, '', sealPreset);
    assert.equal(result.zettel[0].media.siegel, undefined);
    assert.ok(result.zettel[0].unterschrift);
    result.zettel[0].unterschrift = '';
    assert.equal(app.merge(result, pack).zettel[0].unterschrift, '', 'later deliberate clearing remains effective');
    result.zettel = [];
    assert.equal(app.merge(result, pack).zettel.length, 0, 'deleted sheets are never recreated');
  }
});

test('formatting metadata is not attached to a custom image when metadata is absent', () => {
  const id = 'llysfaen-feuerstollen';
  const pack = { zettel: [], updates: buildNoticeSignoffUpdates([id]) };
  const notice = { id, unterschrift: 'custom.png', siegel: 'custom-seal.png' };
  const merged = feature().merge({ zettel: [notice] }, pack).zettel[0];
  assert.equal(merged.media, undefined);
  assert.equal(merged.unterschrift, 'custom.png');
});
