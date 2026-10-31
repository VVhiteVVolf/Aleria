import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { buildLotsensucheNotices, LOTSENSUCHE_BOARD_BINDING as binding } from '../tools/quests/lotsensuche.mjs';
import { buildLotsensucheCharacterExports, LOTSENSUCHE_PEOPLE } from '../../AleriaAlmanach/modules/gwynthor-lotsensuche/lotsensuche-characters.mjs';
import { buildGwynthorQuestPack } from '../tools/build-gwynthor-quest-notices.mjs';

const root = new URL('../../', import.meta.url);
const assets = JSON.parse(readFileSync(new URL('../assets/data/board-art-catalog.json', import.meta.url))).posters;
const notes = buildLotsensucheNotices(assets.find(asset => asset.id === binding.assetId));

test('the two chronological sheets retain their independent replies and agreed payment terms', async () => {
  assert.equal(notes.length, 2);
  assert.deepEqual(notes.map(note => note.stackOrder), [0, 1]);
  assert.deepEqual(notes.map(note => note.publicationStatus), ['filled', 'open']);
  assert.deepEqual(notes.map(note => note.comments.length), [2, 6]);
  assert.ok(notes.every(note => note.noticeGroupId === binding.noticeId && note.stackId === binding.noticeId && note.typography.font === 'schoolbell'));
  assert.match(notes[0].text, /aus Gwynthor/);
  assert.match(notes[1].text, /ERST DIE HELFTE/);
  assert.match(notes[1].text, /andre helfte wen meine arbeit fertig/);
  assert.match(notes[1].text, /WIRKLICH auskent/);
  assert.match(notes[1].text, /unter vier augen/);
  const pack = await buildGwynthorQuestPack();
  assert.deepEqual(pack.zettel.filter(note => note.noticeGroupId === binding.noticeId), notes);
});

test('Rob corrects exactly three errors in the final insult and the corrected reply retains the insult', () => {
  const replies = notes[1].comments;
  assert.deepEqual(replies.map(reply => reply.name), ['Rob', 'Vébrand Wolfsruf', 'Rob', 'Vébrand Wolfsruf', 'Rob', 'Vébrand Wolfsruf']);
  assert.match(replies[2].text, /Gestiefelten Muschi/);
  assert.match(replies[1].text, /Sechs tage/);
  assert.ok(replies.every(reply => !reply.unterschrift && !reply.media.unterschrift));
  const original = replies[3].text.split('. ').at(-1);
  assert.equal(original, 'Du bist ein misserabler lügner und ein dummkopf.');
  const corrected = original.replace('misserabler', 'miserabler').replace('lügner', 'Lügner').replace('dummkopf', 'Dummkopf');
  assert.equal(replies[5].text, corrected);
  assert.match(replies[4].text, /Drei Schreibfehler/);
});

function views() {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const context = { window: { TafelRuntime: { esc, canEditZettel: () => false }, TafelZettelRichText: { renderHtml: text => text } },
    document: { baseURI: 'https://aleria.test/Anzeigetafeln/tafel.html' }, URL, URLSearchParams };
  for (const file of ['media/notice-media-model.js', 'notes/notice-text-layout.js', 'notes/zettel-config.js', 'notes/zettel-document-views.js', 'notes/zettel-comments.js', 'notes/zettel-scroll-views.js']) {
    vm.runInNewContext(readFileSync(new URL('../assets/js/' + file, import.meta.url), 'utf8'), context);
  }
  return context.window.TafelZettelViews;
}

test('the filled sheet and its replies are greyed as one publication; the replacement remains open', () => {
  const renderer = views();
  const before = JSON.stringify(notes);
  const old = renderer.renderLive(notes[0]);
  assert.match(old, /notice-publication--filled/);
  assert.match(old, /Angenommen/);
  assert.match(old, /Rob mein Name/);
  assert.doesNotMatch(old, /Eine Antwort hinterlassen/);
  assert.match(renderer.renderPreview(notes[0]), /notice-publication--filled/);
  const current = renderer.renderLive(notes[1]);
  assert.doesNotMatch(current, /notice-publication--filled/);
  assert.match(current, /Eine Antwort hinterlassen/);
  assert.match(current, /data-comment-handwriting="schoolbell"/);
  assert.match(current, /data-comment-handwriting="kalam"/);
  assert.equal(JSON.stringify(notes), before);
});

test('public profiles contain the two intended civilian and mercenary records with active local portraits', () => {
  const entries = buildLotsensucheCharacterExports();
  assert.deepEqual(entries.map(entry => entry.character.id), ['vebrand-wolfsruf', 'rob-gwynthor-tageloehner']);
  const rob = entries[1].character;
  assert.equal(rob.name, 'Rob');
  assert.equal(rob.title, 'Tagelöhner');
  assert.deepEqual(rob.biography.stats.map(stat => stat.label), ['Name', 'Alter', 'Tätigkeit', 'Aufenthalt']);
  assert.match(rob.bio, /braunes Haar/);
  assert.match(rob.bio, /glatt rasiert/);
  for (const entry of entries) {
    assert.ok(existsSync(new URL(entry.character.portrait.slice(1), root)));
    assert.equal(entry.assignedTab, 'Gwynthor');
  }
  assert.equal(LOTSENSUCHE_PEOPLE.vebrand.name, 'Vébrand Wolfsruf');
});

test('all authored reply portraits, signatures, insignia and paper catalog images resolve locally', () => {
  for (const note of notes) {
    for (const path of [note.verfasser, note.emblem, note.siegel, note.unterschrift,
      ...note.comments.map(comment => comment.avatar)]) {
      assert.ok(existsSync(new URL(path, new URL('../tafel.html', import.meta.url))), path);
    }
  }
  const asset = assets.find(asset => asset.id === binding.assetId);
  assert.ok(existsSync(new URL('../' + asset.src, import.meta.url)));
  assert.ok(existsSync(new URL('../' + asset.thumbnail.src, import.meta.url)));
});

test('size and duration corrections preserve saved placement, unrelated replies and custom choices', async () => {
  const pack = await buildGwynthorQuestPack();
  const scope = { window: {} };
  vm.runInNewContext(readFileSync(new URL('../assets/js/data/authored-notices.js', import.meta.url), 'utf8'), scope);
  const merge = scope.window.TafelAuthoredNotices.merge;
  const sheet = structuredClone(notes[1]);
  const correction = pack.updates.find(update => update.id === 'gwynthor-lotsensuche-six-days-20261031');
  sheet.comments[1].text = correction.fields[0].from;
  sheet.comments.push({ id: 'user-reply', text: 'Eigene Antwort bleibt.' });
  const source = { zettel: [], updates: [correction], boardLayoutUpdates: pack.boardLayoutUpdates };
  const previous = { zettel: [sheet], boardLayout: { version: 1, posters: pack.boardLayoutUpdates.map(update => ({
    id: update.posterId, assetId: update.assetId, width: update.from, x: .123, y: .456, rotation: 17, pin: { x: .2, y: .3 } })) } };
  const original = JSON.stringify(previous);
  const changed = merge(previous, source);
  assert.equal(JSON.stringify(previous), original);
  assert.equal(changed.zettel[0].comments[1].text, notes[1].comments[1].text);
  assert.equal(changed.zettel[0].comments.at(-1).text, 'Eigene Antwort bleibt.');
  for (const poster of changed.boardLayout.posters) {
    assert.equal(poster.width, .05933);
    assert.equal(poster.x, .123);
    assert.equal(poster.y, .456);
    assert.equal(poster.rotation, 17);
    assert.equal(poster.pin.x, .2);
  }
  changed.boardLayout.posters[0].width = .111;
  assert.equal(merge(changed, source).boardLayout.posters[0].width, .111);
  const custom = structuredClone(previous);
  custom.boardLayout.posters[0].width = .222;
  custom.zettel[0].comments[1].text = 'Eigener Wortlaut';
  const preserved = merge(custom, source);
  assert.equal(preserved.boardLayout.posters[0].width, .222);
  assert.equal(preserved.zettel[0].comments[1].text, 'Eigener Wortlaut');
});
