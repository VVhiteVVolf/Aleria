import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../assets/js/map/map-display-settings.js', import.meta.url), 'utf8'), context);
const { resolve } = context.KartoDisplaySettings;
const plain = state => JSON.parse(JSON.stringify(resolve(state)));

test('new maps and legacy published states or drafts start at dot 80 / label 50', () => {
  for (const state of [undefined, {}, {dotSize:18,lblSize:13}, {dotSize:120,lblSize:90}]) {
    assert.deepEqual(plain(state), { dotSize:80, lblSize:50, displaySettingsVersion:1 });
  }
});
test('subsequent size choices persist without resetting on each load', () => {
  assert.deepEqual(plain({dotSize:120,lblSize:70,displaySettingsVersion:1}), {dotSize:120,lblSize:70,displaySettingsVersion:1});
  assert.deepEqual(plain({dotSize:-1,lblSize:Infinity,displaySettingsVersion:1}), {dotSize:80,lblSize:50,displaySettingsVersion:1});
});
test('display migration does not modify map contents', () => {
  const state = {dotSize:18,lblSize:13,pins:[{id:'preserved'}],dominions:[{id:'duchy'}]};
  const before=JSON.stringify(state);
  resolve(state);
  assert.equal(JSON.stringify(state),before);
});
