import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';
import { TORVIK_NOTICE_ID, FEARNAN_NOTICE_ID } from '../tools/build-household-quests.mjs';
import { GWYNTHOR_HOUSEHOLDS } from '../../AleriaAlmanach/modules/gwynthor-heime/households.mjs';
const window = {};
vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js', import.meta.url), 'utf8'), { window });
const model = window.TafelNoticeStacks;
const json = value => JSON.parse(JSON.stringify(value));

test('eighteen sheets form five announcements on four nails; related sheets are never separate quests', async () => {
  const { zettel } = await buildGwynthorQuestPack();
  assert.equal(zettel.length, 18);
  assert.equal(model.groups(zettel).length, 4);
  const entries = model.publications(zettel);
  assert.equal(entries.length, 5);
  assert.deepEqual(Array.from(entries, entry => entry.notices.length), [4, 2, 1, 7, 4]);
  assert.equal(model.publication(zettel, `${TORVIK_NOTICE_ID}-haldor`).id, TORVIK_NOTICE_ID);
  assert.equal(entries[0].stackKey, entries[1].stackKey);
});

test('combining and separating announcements preserves all content and independent sheet replies', async () => {
  const { zettel } = await buildGwynthorQuestPack();
  const before = zettel.map(({ noticeGroupId, ...notice }) => notice);
  const main = zettel[0].id;
  assert.equal(model.combine(zettel, TORVIK_NOTICE_ID, main), true);
  assert.equal(model.publication(zettel, main).notices.length, 6);
  assert.equal(model.separate(zettel, main), true);
  assert.equal(model.publication(zettel, main).notices.length, 1, 'former group root is not reabsorbed');
  assert.equal(model.publication(zettel, `${main}-cyrwyn`).notices.length, 5);
  assert.deepEqual(zettel.map(({ noticeGroupId, ...notice }) => notice), before);
  assert.equal(model.combine(zettel, FEARNAN_NOTICE_ID, main), false, 'different nails are not silently merged');
});

test('whole publications can change nails and move back without splitting their attachments', async () => {
  const { zettel } = await buildGwynthorQuestPack();
  assert.equal(model.detachPublication(zettel, TORVIK_NOTICE_ID), true);
  assert.equal(model.groups(zettel).length, 5);
  assert.equal(model.publication(zettel, TORVIK_NOTICE_ID).notices.length, 2);
  assert.equal(model.attachPublication(zettel, TORVIK_NOTICE_ID, FEARNAN_NOTICE_ID), true);
  assert.equal(model.groups(zettel).length, 4);
  assert.equal(model.publication(zettel, TORVIK_NOTICE_ID).notices.length, 2);
  assert.deepEqual(json(model.publications(json(zettel))), json(model.publications(zettel)));
});

test('secret roots or attachments do not leak into public publication titles or counts', async () => {
  const { zettel } = await buildGwynthorQuestPack();
  zettel[0].secret = true;
  zettel[0].title = 'VERTRAULICHER-TITEL-NUR-FUER-EDITOR';
  zettel[1].secret = true;
  const entry = model.publication(zettel, zettel[2].id);
  assert.equal(entry.primary.id, zettel[2].id);
  assert.equal(entry.notices.length, 2);
  assert.ok(!JSON.stringify(entry).includes(zettel[0].title));
  assert.equal(model.publication(zettel, zettel[0].id), undefined);
});

test('household quests retain the agreed circumstances, real item template, conditional copper and new illustrations', async () => {
  const { zettel } = await buildGwynthorQuestPack();
  const fearnan = zettel.find(note => note.id === FEARNAN_NOTICE_ID);
  const torvik = zettel.find(note => note.id === TORVIK_NOTICE_ID);
  assert.match(fearnan.text, /Metallschatulle unter unserem Bett/);
  assert.match(fearnan.text, /Haus verkaufen/);
  assert.deepEqual(fearnan.rewards, []);
  assert.match(torvik.text, /Gesuchsplätze/);
  assert.match(torvik.text, /neuen Arbeitsstelle/);
  assert.match(torvik.text, /Kleinen Durst/);
  assert.equal(torvik.rewards[0].itemId, 'standard:arkanist:unverzaubertes-amulett');
  assert.equal(torvik.rewards[1].amount, 30);
  assert.match(torvik.rewards[1].condition, /Nur falls/);
  assert.ok(!zettel.some(note => /celynfor/i.test(note.id)), 'third household remains open');
  assert.match(GWYNTHOR_HOUSEHOLDS[0].story.join(' '), /Haus gehört der Familie/);
  for (const note of zettel.filter(note => note.typ === 'vermisst')) {
    assert.match(note.portrait, /^assets\/images\/missing-sketches\//);
    assert.ok(existsSync(new URL(note.portrait, new URL('../tafel.html', import.meta.url))));
  }
  const main = zettel[0];
  assert.match(main.text, /Ruine betritt/);
  assert.match(main.text, /sichere Rückführung/);
  assert.doesNotMatch(main.text, /Auszahlung erfolgt nach überprüfbarer Feststellung ihres Aufenthalts/);
});
