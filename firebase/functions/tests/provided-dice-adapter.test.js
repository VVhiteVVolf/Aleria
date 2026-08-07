import assert from 'node:assert/strict';
import test from 'node:test';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';

test('berechnet Vorteil und Angriffssumme serverseitig neu', async () => {
  const adapter = new ProvidedDiceAdapter({
    attack: { diceResults: [4, 17], naturalRoll: 17, total: 999 }
  });
  const result = await adapter.rollAttack({ modifier: 6, rollMode: 'advantage' });
  assert.equal(result.natural, 17);
  assert.equal(result.total, 23);
});

test('weist manipulierte natürliche Würfe zurück', async () => {
  const adapter = new ProvidedDiceAdapter({
    attack: { diceResults: [4, 17], naturalRoll: 20 }
  });
  await assert.rejects(adapter.rollAttack({ modifier: 2, rollMode: 'advantage' }));
});

test('berechnet Schaden ausschließlich aus validen Einzelwürfeln und Serverbonus', async () => {
  const adapter = new ProvidedDiceAdapter({
    damage: { diceResults: [3, 7], total: 999, modifier: 99 }
  });
  const result = await adapter.rollDamage({ damageFormula: '2d8+1', bonus: 4 });
  assert.equal(result.modifier, 5);
  assert.equal(result.total, 15);
  await assert.rejects(new ProvidedDiceAdapter({ damage: { diceResults: [9, 1] } })
    .rollDamage({ damageFormula: '2d8', bonus: 0 }));
});

test('berechnet Fertigkeitswuerfe aus Einzelwuerfeln und dem serverseitigen Modifikator neu', async () => {
  const adapter = new ProvidedDiceAdapter({ diceResults: [6, 15], natural: 15, total: 999 });
  const result = await adapter.rollSkill({ modifier: 4, rollMode: 'advantage' });
  assert.equal(result.natural, 15);
  assert.equal(result.total, 19);
  await assert.rejects(new ProvidedDiceAdapter({ diceResults: [6], natural: 6 })
    .rollSkill({ modifier: 4, rollMode: 'advantage' }));
});

test('berechnet einen Abwehrladungen-Ablenkungswurf ueber einen eigenen W20-Kanal, unabhaengig vom Schadenswurf', async () => {
  const adapter = new ProvidedDiceAdapter({
    wardResolution: { roll: { natural: 13, rollId: 'ward-1' } },
    damage: { diceResults: [5] }
  });
  const wardResult = await adapter.rollWardDeflection();
  assert.equal(wardResult.natural, 13);
  assert.equal(wardResult.total, 13);
  // Der Ablenkungswurf darf den Schadenswuerfel-Index nicht verbrauchen.
  const damageResult = await adapter.rollDamage({ damageFormula: '1d6', bonus: 0 });
  assert.equal(damageResult.total, 5);
});

test('weist einen manipulierten oder fehlenden Ablenkungswurf zurueck', async () => {
  await assert.rejects(new ProvidedDiceAdapter({}).rollWardDeflection());
  await assert.rejects(new ProvidedDiceAdapter({ wardResolution: { roll: { natural: 21 } } }).rollWardDeflection());
});

test('validiert gemischte Technikschadenswuerfel, Sekundaerrettung und Folgeangriff getrennt', async () => {
  const adapter = new ProvidedDiceAdapter({
    attack: { diceResults: [14], naturalRoll: 14 },
    damage: { diceResults: [8, 3] },
    secondarySaves: [{ diceResults: [7], naturalRoll: 7 }],
    followUpAttacks: [{
      attack: { diceResults: [12], naturalRoll: 12 },
      damage: { diceResults: [4] }
    }]
  });
  assert.equal((await adapter.rollAttack({ modifier: 4 })).total, 18);
  assert.equal((await adapter.rollDamage({ damageFormula: '1W10+1W4', bonus: 2 })).total, 13);
  assert.equal((await adapter.rollSavingThrow({ modifier: 3 })).total, 10);
  assert.equal((await adapter.rollAttack({ modifier: 4 })).total, 16);
  assert.equal((await adapter.rollDamage({ damageFormula: '1W4', bonus: 2 })).total, 6);
});
