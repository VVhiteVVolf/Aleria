import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { WEAPON_STANDARD_CATALOG } from '../modules/weapon-standards/weapon-standard-catalog.js';
import { WEAPON_STANDARD_DISPLAY_AXES, WEAPON_STANDARD_DISPLAY_IDS,
  getWeaponStandardDisplayProfile } from '../modules/weapon-standards/weapon-standard-presentation.js';

const marketScript = await readFile(new URL('../../Markt/WaffenRüstungen/data/shop-data.js', import.meta.url), 'utf8');
const shopScript = await readFile(new URL('../../Markt/WaffenRüstungen/scripts/shop.js', import.meta.url), 'utf8');

test('all 35 authored standards publish complete individual qualitative profiles in the generated market', () => {
  assert.deepEqual(new Set(WEAPON_STANDARD_DISPLAY_IDS), new Set(WEAPON_STANDARD_CATALOG.map(row => row.id)));
  const context = { window: {} };
  vm.runInNewContext(marketScript, context);
  const published = JSON.parse(JSON.stringify(context.window.ARMORY_DATA.items));
  const distinct = new Set();
  for (const row of WEAPON_STANDARD_CATALOG) {
    const profile = row.weaponDisplayProfile;
    assert.deepEqual(Object.keys(profile), WEAPON_STANDARD_DISPLAY_AXES, row.id);
    assert.ok(Object.values(profile).every(value => Number.isInteger(value) && value >= 1 && value <= 10), row.id);
    assert.ok(Object.values(profile).some(value => value !== 5), row.id);
    distinct.add(JSON.stringify(profile));
    const actual = published.find(value => value.id === row.id);
    assert.deepEqual(actual.weaponDisplayProfile, profile, row.id);
    assert.deepEqual(actual.combatDefinition, row.combatDefinition, 'Display data must not alter combat definitions');
  }
  assert.equal(distinct.size, 35, 'Distinct forms should no longer share the generic placeholder polygon');
});

test('qualitative profiles express the actual weapon roles and do not grant rule bonuses', () => {
  const profile = getWeaponStandardDisplayProfile;
  assert.ok(profile('rapier').reach > profile('degen').reach);
  assert.ok(profile('dolch').speed > profile('nodachi').speed);
  assert.ok(profile('nodachi').damage > profile('dolch').damage);
  assert.ok(profile('schwere-armbrust').reach > profile('handarmbrust').reach);
  assert.ok(profile('schwere-armbrust').speed < profile('handarmbrust').speed);
  assert.ok(profile('kampfklauen').reach < profile('speer').reach);
  assert.ok(profile('rabenschnabel').penetration > profile('peitsche').penetration);
  for (const row of WEAPON_STANDARD_CATALOG) {
    assert.equal(row.combatDefinition.attackBonus, 0);
    assert.equal(row.combatDefinition.damageBonus, 0);
    assert.deepEqual(row.combatDefinition.effects, []);
    assert.ok(!('weaponDisplayProfile' in row.combatDefinition));
  }
  const copy = profile('katana'); copy.damage = 99;
  assert.notEqual(profile('katana').damage, 99);
});

function marketView() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '', value: '', listeners: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, addEventListener(event, callback) { this.listeners[event] = callback; } });
    return elements.get(id);
  };
  const context = { window: {}, document: { getElementById: element, querySelectorAll: () => [],
    addEventListener() {}, body: { style: {} } } };
  vm.runInNewContext(marketScript, context);
  vm.runInNewContext(shopScript, context);
  return { element, detail(id) {
    element('itemGrid').listeners.click({ target: { closest: () => ({ dataset: { action: 'detail', id } }) } });
    return element('modalContent').innerHTML;
  } };
}
const displayedValues = html => [...html.matchAll(/class="stat-row">[\s\S]*?<b>(\d+)<\/b>/g)].map(match => Number(match[1]));
const polygon = html => html.match(/<polygon points="([^"]+)" class="radar-shape">/)[1];

test('real market cards and detail dialogs render every authored profile while retaining existing weapon profiles', () => {
  const view = marketView(), html = view.element('itemGrid').innerHTML;
  const shapes = new Set();
  for (const row of WEAPON_STANDARD_CATALOG) {
    const card = html.match(new RegExp(`<article class="item-card" data-id="${row.id}">([\\s\\S]*?)</article>`))[1];
    const detail = view.detail(row.id);
    const expected = WEAPON_STANDARD_DISPLAY_AXES.map(axis => row.weaponDisplayProfile[axis]);
    assert.deepEqual(displayedValues(card), expected, `card ${row.id}`);
    assert.deepEqual(displayedValues(detail), expected, `detail ${row.id}`);
    assert.equal(polygon(card), polygon(detail), row.id);
    assert.match(card, /Qualitativer Vergleich/);
    shapes.add(polygon(card));
  }
  assert.equal(shapes.size, 35);
  assert.deepEqual(displayedValues(view.detail('stahlschwert')), [5, 4, 7, 5, 8, 8]);
  assert.deepEqual(displayedValues(view.detail('kriegshammer')), [10, 9, 2, 5, 2, 4]);
});
