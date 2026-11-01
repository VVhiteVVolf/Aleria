import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import { AUTHORED_QUEST_PREPARATIONS } from '../modules/quests/quest-authored-dossiers.js';
import { questTravelGroup } from '../modules/quests/quest-dossier-model.js';
import { normalizeQuest } from '../modules/quests/quest-model.js';
import { splitQuestMoney } from '../modules/quests/quest-reward-allocation.js';
import { toMinor } from '../modules/item-register/item-register-money.js';
import { renderQuestDetail } from '../modules/quests/quest-view.js';
const preparation = AUTHORED_QUEST_PREPARATIONS['gwynthor-der-staedter-und-sein-pferd'];
test('Trötzli has an unassigned public cast, four goals and existing artwork for every role', async () => {
  assert.equal(preparation.dossier.participants.length, 5); assert.equal(preparation.objectives.length, 4);
  assert.equal(preparation.dossier.participants.find(row => row.name === 'Trötzli').recordId, 'companion-cynddelw-troetzli');
  for (const row of [...preparation.dossier.participants, ...preparation.dossier.rewardArt]) assert.ok((await stat(new URL(`../..${row.image}`, import.meta.url))).size > 1000);
  const quest = normalizeQuest({ id: 'test', title: 'Trötzli', dossier: preparation.dossier });
  assert.deepEqual(quest.dossier, preparation.dossier); assert.ok(!quest.party);
});
test('road estimates use the real calibration and travel tools, horizontal 30 km, stops and adult foot pace', async () => {
  const context = vm.createContext({ window: {} });
  for (const name of ['lsb-config','lsb-calculations']) vm.runInContext(await readFile(new URL(`../../Karten/assets/js/lsb/${name}.js`, import.meta.url), 'utf8'), context);
  const { route } = preparation.dossier;
  assert.equal(route.widthKm, 30); assert.equal(route.width, 8192); assert.equal(route.height, 6300);
  for (const path of route.paths) {
    const calculated = context.window.KartoLsbCalculations.calcRoute(questTravelGroup(route, path.id), 30 / 8192);
    for (const key of ['totalKm','travelH','delayH','totalH']) assert.equal(path.estimate[key], calculated[key]);
    assert.equal(path.travelMode, 'foot_e');
  }
  assert.ok(route.paths[0].estimate.totalH < route.paths[1].estimate.totalH); assert.equal(route.paths[0].estimate.delayH, .75);
  assert.equal(Math.round(route.paths[0].estimate.totalH * 60), 157);
});
test('splitting money conserves every Pfennig, never duplicates objects, and is safe to click twice', () => {
  const party = ['a','b','c'].map(recordId => ({ kind: 'character', recordId }));
  const item = { kind: 'item', itemId: 'notebook', quantity: 1, recordId: 'a' };
  const result = splitQuestMoney([{ kind: 'money', amount: 50, currency: 'copper' }, item], party);
  assert.equal(result.filter(row => row.kind === 'money').reduce((sum, row) => sum + toMinor(row.amount), 0), 5000);
  assert.equal(result.filter(row => row.kind === 'item').length, 1); assert.deepEqual(result.at(-1), item);
  assert.deepEqual(splitQuestMoney(result, party), result);
});
test('the plain copper icon keeps the amount separate and follows changed rewards', () => {
  const quest = normalizeQuest({ id: 'test', title: 'Trötzli', dossier: preparation.dossier, rewards: [{ kind: 'money', amount: 50, currency: 'copper' }] });
  const render = value => renderQuestDetail(value, { catalog: { boards: [], maps: [], modules: [] } });
  assert.match(render(quest), /copper-coin-v1.png/); assert.match(render(quest), /50 Kupferstücke/);
  const changed = render({ ...quest, rewards: [{ kind: 'money', amount: 100, currency: 'copper' }] });
  assert.match(changed, /copper-coin-v1.png/); assert.match(changed, /100 Kupferstücke/); assert.doesNotMatch(changed, /50 Kupferstücke/);
  assert.doesNotMatch(render({ ...quest, rewards: [{ kind: 'money', amount: 1, currency: 'gold' }] }), /copper-coin-v1.png/);
});
