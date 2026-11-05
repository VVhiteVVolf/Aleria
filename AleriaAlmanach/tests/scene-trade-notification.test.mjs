import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { escape } from '../modules/item-register/item-register-markup.js';
import { describeSceneTrade } from '../modules/scene-trade/scene-trade-summary.js';
import { isSceneTradeComment, renderSceneTradeNotification } from '../modules/scene-trade/scene-trade-notification.js';

const receipt = () => ({ schemaVersion: 1, actor: { id: 'gawain', name: 'Gawain', portrait: './gawain.png' },
  merchant: { id: 'module:kanne', name: 'Krumme Kanne', portrait: './kanne.png' },
  participants: [{ key: 'character:gawain', name: 'Gawain' }, { key: 'character:ylva', name: 'Ylva' }],
  lines: [{ direction: 'buy', name: 'Brot', quantity: 2, totalMinor: 1000, baselineTotalMinor: 1200,
    priceMode: 'agreed', payerKey: 'character:gawain', recipientKey: 'character:gawain' }] });

test('one cart is a quiet receipt with two miniatures and details only on demand', () => {
  const trade = receipt(); trade.lines.push({ ...trade.lines[0], name: 'Bier', recipientKey: 'character:ylva' });
  const html = renderSceneTradeNotification({ id: 'receipt', sceneTrade: trade }, { lockMarkup: '<span>Beleg geschützt</span>' });
  assert.equal((html.match(/class="scene-trade-mini-avatar"/g) || []).length, 2);
  assert.equal((html.match(/<article/g) || []).length, 1);
  assert.match(html, /für die Gruppe/);
  assert.match(html, /20 KT/);
  assert.match(html, /Zahlt: Gawain · Erhält: Ylva/);
  assert.match(html, /Richtwert: 12 KT/);
  assert.match(html, /Beleg geschützt/);
  assert.ok(!html.includes('<details open'));
  assert.ok(!html.includes('scene-transfer-event'));
  assert.ok(!html.includes('comment-divider'));
});

test('long carts summarize goods while the receipt keeps every position', () => {
  const trade = receipt();
  trade.lines = Array.from({ length: 6 }, (_, i) => ({ ...trade.lines[0], name: `Ware ${i}` }));
  const text = describeSceneTrade(trade);
  assert.match(text, /Ware 0, 2 × Ware 1, 4 weitere Waren/);
  assert.ok(!text.includes('Ware 5'));
  assert.match(renderSceneTradeNotification({ sceneTrade: trade }), /Ware 5/);
});

test('gifts through direct delivery name the recipient and sales use the sale direction', () => {
  const trade = receipt(); trade.lines[0].recipientKey = 'character:ylva';
  assert.match(describeSceneTrade(trade), /Gawain kauft für Ylva/);
  trade.lines[0] = { ...trade.lines[0], direction: 'sell', sellerKey: 'character:gawain' };
  assert.match(describeSceneTrade(trade), /Gawain verkauft 2 × Brot an Krumme Kanne/);
});

test('legacy sale keeps its saved direction instead of misreading legacy giver/receiver roles', () => {
  const comment = { text: 'Gawain verkauft sein Pferd für 750 KT.', inventoryTransaction: { trade: true },
    sceneInventoryTransfer: { giver: { id: 'vendor', name: 'Händler' }, receiver: { id: 'gawain', name: 'Gawain' }, object: { name: 'Pferd', totalCopper: 750 } } };
  assert.ok(isSceneTradeComment(comment));
  assert.match(renderSceneTradeNotification(comment), /Gawain verkauft sein Pferd für 750 KT/);
  assert.ok(!renderSceneTradeNotification(comment).includes('Gawain kauft'));
});

test('new compact gifts use giver and recipient miniatures, retain notes and leave old gifts unchanged', () => {
  const comment = { text: 'Gawain übergibt Ylva den Kristall.', sceneInventoryTransfer: { presentation: 'compact',
    giver: { id: 'gawain', name: 'Gawain', portrait: './giver.png' }, receiver: { id: 'ylva', name: 'Ylva', portrait: './recipient.png' },
    object: { kind: 'item', name: 'Kristall', quantity: 1 }, flavour: 'Ein Geschenk.' } };
  assert.ok(isSceneTradeComment(comment));
  const html = renderSceneTradeNotification(comment);
  assert.ok(html.indexOf('./giver.png') < html.indexOf('./recipient.png'));
  assert.match(html, /Ein Geschenk/);
  delete comment.sceneInventoryTransfer.presentation;
  assert.ok(!isSceneTradeComment(comment));
});

test('untrusted actor, item, note and image strings cannot become executable markup', () => {
  const trade = receipt();
  trade.actor.name = '<script>alert(1)</script>'; trade.actor.portrait = 'javascript:alert(1)';
  trade.lines[0].name = '<img src=x onerror=alert(1)>'; trade.note = '<iframe src=x>';
  const html = renderSceneTradeNotification({ id: '" onclick="bad', sceneTrade: trade });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(!html.includes('src="javascript:'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!isSceneTradeComment({ sceneTrade: { lines: 'invalid' } }));
});

test('initial classic scene render keeps correct narration while the module bridge is loading', async () => {
  const source = await readFile(new URL('../modules/comments/comments-render.js', import.meta.url), 'utf8');
  const context = vm.createContext({ window: {}, escapeHtml: escape, console });
  vm.runInContext(source, context);
  context.comment = { id: 'trade', sceneTrade: receipt(), text: 'Gawain kauft Brot. <img src=x>' };
  const fallback = vm.runInContext('renderCommentBubble(comment, 0)', context);
  assert.match(fallback, /data-scene-trade-pending/);
  assert.match(fallback, /Gawain kauft Brot/);
  assert.ok(!fallback.includes('<img src=x>'));
  context.window.AleriaSceneTrade = { isComment: () => true, renderComment: () => 'COMPLETE-RECEIPT' };
  assert.equal(vm.runInContext('renderCommentBubble(comment, 0)', context), 'COMPLETE-RECEIPT');
});

test('quiet receipts add no time header, insertion toolbar or roleplay page', async () => {
  const source = await readFile(new URL('../modules/comments/comments-thread.js', import.meta.url), 'utf8');
  const comments = [{ id: 'first' }, { id: 'trade', sceneTrade: receipt() }, { id: 'next' }];
  const timeline = comments.map(comment => ({ comment, startSeconds: 100, endSeconds: 100, aleriaDayIndex: 1 }));
  let rendered;
  const date = { year: 1740, month: 3, day: 9 };
  const context = vm.createContext({ console, window: {}, document: { querySelector: () => null, addEventListener() {} },
    AleriaSceneDateDefaults: { resolve: () => date },
    sortCommentsByTimeline: values => values, getCommentPaginationThreadId: () => 'scene',
    getCommentPaginationWindow: values => ({ comments: values, startIndex: 0, currentPage: 1, pageCount: 1 }),
    buildSceneTimeline: () => timeline, hasAleriaDate: () => true, getSceneDayFromSeconds: () => 1,
    getSceneTimelineAleriaDate: () => date, updateSceneClockTimeline() {},
    renderCommentPaginationControls: () => '', renderSceneCommentTime: () => 'TIME', renderCommentBubble: comment => `ROW:${comment.id}`,
    syncCommentJumpTools() {}, applyCommentToolsVisibility() {} });
  vm.runInContext(source, context);
  context.patchCommentScroll = (_scroll, _top, units) => { rendered = units; };
  context.renderCommentInsertControl = () => 'INSERT';
  context.comments = comments;
  vm.runInContext('renderCommentsToScroll({dataset:{}}, comments)', context);
  assert.equal(rendered.find(row => row.key === 'trade').html, 'ROW:trade');
  assert.equal(timeline[0].aleriaPageInDay, 1);
  assert.equal(timeline[1].aleriaPageInDay, undefined);
  assert.equal(timeline[2].aleriaPageInDay, 2);
  assert.match(rendered[0].html, /TIME.*INSERT/);
});
