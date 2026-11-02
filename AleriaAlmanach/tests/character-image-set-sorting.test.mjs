import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadSorting() {
  const listeners = new Map();
  const classes = () => {
    const values = new Set();
    return { add: (...items) => items.forEach(item => values.add(item)), remove: (...items) => items.forEach(item => values.delete(item)), contains: item => values.has(item) };
  };
  const tabs = {
    children: [],
    addEventListener: (type, listener) => listeners.set(type, listener),
    contains: node => tabs.children.includes(node)
  };
  const sets = ['standard', 'kampf', 'hochzeit'].map(id => ({ id }));
  tabs.children = sets.map(set => ({
    dataset: { imageSetId: set.id }, classList: classes(),
    closest() { return this; }, focus() {},
    getBoundingClientRect: () => ({ left: 100, width: 100 })
  }));
  const moves = [];
  const selections = [];
  vm.runInNewContext(fs.readFileSync(new URL('../modules/characters/character-image-set-sorting.js', import.meta.url), 'utf8'), {
    document: { getElementById: () => tabs },
    _characterImageSets: sets,
    moveCharacterImageSet: (...args) => moves.push(args),
    selectCharacterImageSet: id => selections.push(id)
  });
  function send(type, index, options = {}) {
    const event = { target: tabs.children[index], preventDefault() { this.prevented = true; }, ...options };
    listeners.get(type)(event);
    return event;
  }
  return { tabs, moves, selections, send };
}

test('tab arrows select sets; Alt+arrows and Alt+Home/End move them with focus', () => {
  const ui = loadSorting();
  assert.equal(ui.send('keydown', 1, { key: 'ArrowLeft' }).prevented, true);
  assert.deepEqual(ui.selections, ['standard']);
  ui.send('keydown', 1, { key: 'ArrowRight', altKey: true });
  ui.send('keydown', 1, { key: 'Home', altKey: true });
  ui.send('keydown', 1, { key: 'End', altKey: true });
  assert.deepEqual(ui.moves.map(move => move.slice(0, 2)), [['kampf', 2], ['kampf', 0], ['kampf', 2]]);
  assert.ok(ui.moves.every(move => move[2].focus));
});

test('dragging sets calculates insertion on either side and clears drop markers', () => {
  for (const [from, target, clientX, destination] of [[2, 0, 110, 0], [0, 2, 190, 2], [2, 0, 190, 1], [0, 2, 110, 1]]) {
    const ui = loadSorting();
    const payload = new Map();
    const dataTransfer = { setData: (type, value) => payload.set(type, value) };
    ui.send('dragstart', from, { dataTransfer });
    assert.equal(dataTransfer.effectAllowed, 'move');
    assert.equal(payload.get('application/x-aleria-image-set'), ui.tabs.children[from].dataset.imageSetId);
    ui.send('dragover', target, { dataTransfer, clientX });
    assert.equal(dataTransfer.dropEffect, 'move');
    ui.send('drop', target, { dataTransfer, clientX });
    assert.equal(ui.moves[0][1], destination);
    assert.ok(ui.tabs.children.every(tab => !tab.classList.contains('is-drop-before') && !tab.classList.contains('is-drop-after')));
  }
});

test('external image drags and self drops do not reorder sets', () => {
  const ui = loadSorting();
  assert.equal(ui.send('dragover', 0, {}).prevented, undefined);
  const dataTransfer = { setData() {} };
  ui.send('dragstart', 1, { dataTransfer });
  ui.send('drop', 1, { dataTransfer, clientX: 120 });
  assert.deepEqual(ui.moves, []);
  assert.equal(ui.send('drop', 2, {}).prevented, undefined);
});
