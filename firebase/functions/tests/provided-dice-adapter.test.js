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
