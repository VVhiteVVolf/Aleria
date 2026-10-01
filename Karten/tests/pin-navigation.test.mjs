import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function fixture({ filter = 'other', width = 2000 } = {}) {
  const pins = [{ id: 'place', cat: 'town', x: .3, y: .7 }, { id: 'secret', secret: true }];
  const classes = new Set();
  const marker = { dataset: { id: 'place' }, classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name) } };
  const calls = [];
  const runtime = {
    visiblePins: () => pins.filter(pin => !pin.secret), activeFilter: () => filter,
    mapImageSize: () => ({ width, height: 1000 }), mapViewportSize: () => ({ width: 800, height: 600 }),
    mapTransform: () => ({ x: 20, y: 30, z: .5 }),
    setMapTransform: (...args) => calls.push(['transform', ...args]),
    pinLayer: () => ({ children: [marker] }),
  };
  const window = {
    KartoRuntime: runtime,
    setFilter: value => { filter = value; calls.push(['filter', value]); },
    activateLayer: value => calls.push(['layer', value]),
  };
  vm.runInNewContext(fs.readFileSync(new URL('../assets/js/pins/pin-navigation.js', import.meta.url), 'utf8'), { window });
  return { focus: window.KartoPinNavigation.focus, calls, classes };
}

test('navigation reveals a filtered result, centers it at the current zoom and highlights it', () => {
  const f = fixture();
  assert.equal(f.focus('place'), true);
  assert.deepEqual(f.calls, [['filter', 'all'], ['layer', 'pins'], ['transform', 100, -50, .5]]);
  assert.ok(f.classes.has('navigation-target'));
});

test('matching category filters remain selected', () => {
  const f = fixture({ filter: 'town' });
  f.focus('place');
  assert.ok(!f.calls.some(([action]) => action === 'filter'));
});

test('secret or stale results cannot reveal a pin', () => {
  const f = fixture();
  assert.equal(f.focus('secret'), false);
  assert.equal(f.focus('deleted'), false);
  assert.deepEqual(f.calls, []);
});

test('a result can still open its detail card before map image dimensions are available', () => {
  const f = fixture({ width: 0 });
  assert.equal(f.focus('place'), true);
  assert.ok(!f.calls.some(([action]) => action === 'transform'));
});
