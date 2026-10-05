import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { migrateGroupLandingEntry } from '../modules/landing/group-landing-migration.js';
import { collectGroupRoster } from '../modules/landing/group-landing-roster.js';
import { renderGroupTreasury } from '../modules/landing/group-landing-view.js';

function editorContext() {
  const context = vm.createContext({ console, document: { addEventListener() {} },
    getTrimmedFormValue: (scope, selector) => String(scope.values?.[selector] ?? '').trim(),
    collectAleriaDateFromBlock: () => ({}), sanitizeAleriaDate: value => value || {} });
  context.window = context;
  for (const source of ['../modules/landing/landing-model.global.js', '../modules/module-editor/module-editor-landing.js', '../modules/landing/landing-renderer.js']) {
    vm.runInContext(readFileSync(new URL(source, import.meta.url), 'utf8'), context, { filename: source });
  }
  return context;
}

test('The full module editor retains operational state and task links when editing page text', () => {
  const context = editorContext();
  const original = context.sanitizeLandingData({ title: 'Mannschaft', group: { threadId: 'crew::session:3', sceneThreads: ['old'],
    guests: [{ id: 'guest', name: 'Gast', characterId: 'char', assignment: 'active', until: 'Tag 3' }],
    treasury: { openingCopper: 500, entries: [{ id: 'booking', copper: 10, direction: 'expense', label: 'Proviant' }] },
    presets: [{ id: 'shore', name: 'Landgang', memberIds: ['guest'] }], icons: { roster: '⚑' },
    inventory: [{ id: 'stock', sourceKey: 'standard:rope', name: 'Seil', quantity: 3 }] },
    quests: [{ id: 'q', title: 'Landgang', ownerMemberId: 'guest', moduleId: 'quest', dueDate: 'Tag 3' }] });
  const block = { dataset: { landingBase: JSON.stringify(original) }, values: { '.me-landing-title': 'Neuer Titel' }, querySelectorAll(selector) {
    if (selector !== '.landing-editor-quest-row') return [];
    return [{ values: Object.fromEntries(Object.entries(original.quests[0]).map(([key, value]) => [`.me-landing-quest-${key}`, value])) }];
  } };
  const next = context.collectLandingDataFromBlock(block);
  assert.equal(next.title, 'Neuer Titel');
  assert.equal(JSON.stringify(next.group), JSON.stringify(original.group));
  assert.equal(next.quests[0].moduleId, 'quest');
  assert.equal(next.quests[0].ownerMemberId, 'guest');
  assert.equal(next.quests[0].dueDate, 'Tag 3');
});

test('The built-in Draig guard receives a page and selects actual serving members, excluding historical trees', () => {
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(readFileSync(new URL('../modules/draig-leibgarde/draig-leibgarde-data.js', import.meta.url), 'utf8'), context);
  const section = context.SECTIONS[0];
  const source = JSON.parse(JSON.stringify(section.entries[0]));
  const entry = migrateGroupLandingEntry(source, { tab: section.tab });
  assert.equal(entry.pages[4].landingPage, true);
  assert.deepEqual(collectGroupRoster(entry).map(member => member.name), ['Steffan Draig', 'Llywelyn Coeddu', 'Hywel Craigddu', 'Mathon Curiad']);
  assert.equal(source.pages.length, 4);
});

test('Treasury display uses actual ledger denomination fields and escapes labels', () => {
  const markup = renderGroupTreasury({ openingCopper: 1000, entries: [{ id: 'one', copper: 101, direction: 'expense', label: '<script>Proviant</script>' }] });
  assert.match(markup, /1 Silber, 1 Kupfer/);
  assert.match(markup, /&lt;script&gt;Proviant/);
  assert.doesNotMatch(markup, /undefined|NaN|<script>/);
});
