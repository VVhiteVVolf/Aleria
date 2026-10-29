import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { createPosterInspector } from '../assets/js/composition/board-composition-inspector.mjs';
import { indexPosterGroups, groupForPoster } from '../assets/js/composition/board-composition-model.mjs';
import { paperMarkup } from '../assets/js/composition/board-composition-view.mjs';

test('nail drag retains DOM, batches both axes, flushes the release point and restores cancelled gestures', () => {
  const original = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame };
  const listeners = new Map(), pending = new Map(); let sequence = 0, calls = 0, rectReads = 0, held = false, writes = 0;
  const poster = { id: 'paper', pin: { x: .4, y: .2 } }, pin = { style: {} }, fields = { pinX: {}, pinY: {} };
  const preview = { getBoundingClientRect: () => { rectReads++; return { left: 10, top: 20, width: 100, height: 200 }; },
    setPointerCapture() { held = true; }, hasPointerCapture: () => held, releasePointerCapture() { held = false; }, querySelector: () => pin };
  const root = { setAttribute() {}, addEventListener: (type, fn) => listeners.set(type, fn),
    set innerHTML(value) { writes++; }, querySelector: selector => fields[selector.includes('pinX') ? 'pinX' : 'pinY'] };
  globalThis.document = { createElement: () => root, querySelector: () => ({ append() {} }) };
  globalThis.requestAnimationFrame = callback => { pending.set(++sequence, callback); return sequence; };
  globalThis.cancelAnimationFrame = id => pending.delete(id);
  const event = (type, x, y) => ({ type, target: { closest: () => preview }, button: 0, pointerId: 7, clientX: x, clientY: y, preventDefault() {} });
  const flush = () => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn()); };
  try {
    createPosterInspector({ getSelected: () => poster, movePin: (point, id) => {
      assert.equal(id, poster.id); calls++; Object.assign(poster.pin, point);
    } });
    listeners.get('pointerdown')(event('pointerdown', 50, 60));
    for (let i = 0; i < 240; i++) listeners.get('pointermove')(event('pointermove', 90, 180));
    assert.equal(calls, 0); assert.equal(pending.size, 1); flush();
    assert.equal(calls, 1); assert.deepEqual(poster.pin, { x: .8, y: .8 });
    assert.equal(rectReads, 1); assert.equal(writes, 0); assert.equal(pin.style.left, '80%');
    listeners.get('pointerup')(event('pointerup', 95, 200));
    assert.deepEqual(poster.pin, { x: .85, y: .9 }); assert.equal(held, false); assert.equal(pending.size, 0);
    listeners.get('pointerdown')(event('pointerdown', 10, 20)); flush();
    listeners.get('pointercancel')(event('pointercancel', 10, 20));
    assert.deepEqual(poster.pin, { x: .85, y: .9 }); assert.equal(writes, 0);
  } finally { Object.assign(globalThis, original); }
});

test('one group index matches original secret/public stack resolution and observes in-place edits', () => {
  const window = {};
  vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js', import.meta.url), 'utf8'), { window });
  const stacks = window.TafelNoticeStacks;
  const notices = [{ id: 'private', secret: true }, { id: 'public', stackId: 'private' }, { id: 'other' }];
  let count = 0;
  const counting = { groups(...args) { count++; return stacks.groups(...args); } };
  const index = indexPosterGroups(notices, counting);
  assert.equal(count, 2);
  for (const notice of notices) {
    assert.deepEqual(index.allById.get(notice.id), groupForPoster({ noticeId: notice.id }, notices, stacks, true));
    assert.deepEqual(index.visibleById.get(notice.id), groupForPoster({ noticeId: notice.id }, notices, stacks) || undefined);
  }
  notices[1].secret = true;
  assert.equal(indexPosterGroups(notices, stacks).visibleById.has('private'), false);
});

test('all library choices use small lazy thumbnails; original artwork remains available', () => {
  const catalog = JSON.parse(readFileSync(new URL('../assets/data/board-art-catalog.json', import.meta.url))).posters;
  let bytes = 0;
  for (const asset of catalog) {
    assert.ok(asset.thumbnail, asset.id);
    assert.ok(asset.thumbnail.width <= 200 && asset.thumbnail.height <= 200);
    bytes += statSync(new URL('../' + asset.thumbnail.src, import.meta.url)).size;
    const html = paperMarkup(asset, value => value, { thumbnail: true });
    assert.ok(html.includes(asset.thumbnail.src)); assert.match(html, /loading="lazy"/); assert.match(html, /decoding="async"/);
    if (asset.originalSrc) assert.ok(statSync(new URL('../' + asset.originalSrc, import.meta.url)).size);
  }
  assert.ok(bytes < 1_000_000, `library thumbnail transfer budget: ${bytes}`);
});
