import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { createFormOpponent } from './combat-class-form-fixtures.mjs';
import { CheckupDice, commitAction, database, undo } from './combat-test-context.mjs';
import { getBuiltinCreatureTemplates } from '../../../../AleriaAlmanach/modules/creatures/creature-catalog.js';
import { CREATURE_TURN_END_ID, getEscapeActionId } from '../../../../AleriaAlmanach/modules/combat/combat-creature-actions.js';

after(() => database.terminate());

const templates = new Map(getBuiltinCreatureTemplates().map(entry => [entry.id, entry]));
const creature = id => structuredClone(templates.get(`catalog-${id}`));
const combatResult = saved => saved.mechanics.commentSegments.at(-1).combatResolution;

class SaveDice extends CheckupDice {
  constructor(natural, save) { super(natural); this.save = save; }
  async rollSavingThrow({ modifier = 0, rollMode = 'normal' }) { return this.rollD20(modifier, rollMode, this.save); }
}

test('Versunkener gegen eine Figur im Emulator. Griff, Fehlversuch, eigener Biss und erfolgreiche Befreiung mit Rücknahme', async () => {
  const party = await createCombatParty([
    { key: 'drowned', actor: creature('versunkener-fahlhaeutig'), team: 'Versunkene' },
    { key: 'victim', actor: createFormOpponent('victim-drowned'), team: 'Wache' }
  ]);
  const grip = await party.prepare({ actor: 'drowned', targets: ['victim'], actionId: 'ability:versunkener-tiefengriff', natural: 3 });
  const savedGrip = combatResult(await party.commit(grip));
  assert.equal(savedGrip.attack.saveSucceeded, false);
  assert.equal(savedGrip.targetConditionSnapshot.after.find(condition => condition.name === 'Festgehalten')?.restraint.dc, 13);
  const escape = (method, roll) => party.prepare({ actor: 'victim', targets: ['victim'], actionId: getEscapeActionId(method), dice: new SaveDice(15, roll) });
  const miss = combatResult(await party.commit(await escape('dexterity', 3)));
  assert.deepEqual(miss.secondarySaves[0].diceResults, [3, 3]);
  assert.equal(miss.secondarySaves[0].succeeded, false);
  const bite = combatResult(await party.commit(await party.prepare({ actor: 'drowned', targets: ['victim'], actionId: 'ability:versunkener-biss', natural: 17 })));
  assert.equal(bite.attack.rollMode, 'advantage');
  assert(bite.targetConditionSnapshot.after.some(condition => condition.name === 'Blutend'));
  const savedEscape = await party.commit(await escape('athletics', 16));
  const release = combatResult(savedEscape);
  assert.deepEqual(release.secondarySaves[0].diceResults, [16]);
  assert.equal(release.secondarySaves[0].succeeded, true);
  assert(!release.actorConditionSnapshot.after.some(condition => condition.restraint));
  await undo(savedEscape.id);
  const restored = (await party.assertConsistent()).profiles.get('victim');
  assert(restored.temporaryConditions.some(condition => condition.restraint?.attempted));
});

test('Der Emulator verbucht Trollblut nach dem Angriff einmal und gibt es bei Rücknahme zurück', async () => {
  const troll = creature('landtroll-jung');
  const party = await createCombatParty([
    { key: 'troll', actor: troll, hitPoints: 60, team: 'Trolle' },
    { key: 'opponent', actor: createFormOpponent('opponent-troll'), team: 'Wache' }
  ]);
  const strike = await party.prepare({ actor: 'troll', targets: ['opponent'], natural: 17 });
  await assert.rejects(() => commitAction(strike.payload), /Trollblut.*fehlt/);
  assert.equal((await party.snapshot()).profiles.get('opponent').currentHitPoints, 60);
  const ending = await party.prepare({ actor: 'troll', targets: ['troll'], actionId: CREATURE_TURN_END_ID, priorSegments: [strike.segment] });
  const saved = await party.commit(ending);
  const result = combatResult(saved);
  assert.equal(result.turnEnd.suppressed, false);
  assert.equal(result.targetSnapshot.hitPointsAfter, 74);
  assert.equal((await party.assertConsistent()).profiles.get('troll').currentHitPoints, 74);
  await undo(saved.id);
  const afterUndo = await party.assertConsistent();
  assert.equal(afterUndo.profiles.get('troll').currentHitPoints, 60);
  assert.equal(afterUndo.profiles.get('opponent').currentHitPoints, 60);
});

test('Mehrzielbrüller des Madrúach sperrt Reaktionen und bezahlt nur einmal', async () => {
  const party = await createCombatParty([
    { key: 'urgr', actor: creature('madruach-urgr'), team: 'Urgren' },
    ...['a', 'b', 'c'].map(key => ({ key, actor: createFormOpponent(`roar-${key}`), team: 'Wache' }))
  ]);
  const saved = await party.commit(await party.prepare({ actor: 'urgr', targets: ['a', 'b', 'c'], actionId: 'ability:urgr-bruell', natural: 4 }));
  const resolutions = saved.mechanics.commentSegments[0].combatResolutions;
  assert.equal(resolutions.length, 3);
  assert.deepEqual(resolutions.map(result => result.resourceCosts.length), [2, 0, 0]);
  assert(resolutions.every(result => result.targetConditionSnapshot.after.some(condition => condition.blockedResource === 'reaction')));
  assert((await party.assertConsistent()).profiles.get('a').resources.find(resource => resource.id === 'reaction')?.current === 0);
});
