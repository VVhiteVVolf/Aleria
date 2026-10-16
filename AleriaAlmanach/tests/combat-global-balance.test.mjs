import assert from 'node:assert/strict';
import test from 'node:test';
import { listCombatTechniqueCatalog } from '../modules/combat-styles/combat-technique-catalog.js';
import { createWeaponTechniqueDamageProfile, hasWeaponTechniqueControl, getWeaponTechniqueControlTier } from '../modules/combat-styles/weapon-technique-budget.js';
import { reviseWeaponTechniqueSave } from '../modules/combat-styles/weapon-technique-control.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { resolveTechniqueSaveDc } from '../modules/combat/combat-technique-save-dc.js';
import { damageMetrics } from '../modules/combat-balance/combat-balance-metrics.js';

test('Kontrollrettungen aller drei Kampfstile folgen derselben Waffen-Ausbildung', () => {
  const entries = listCombatTechniqueCatalog();
  assert.equal(entries.length, 816);
  const controls = entries.filter(entry => entry.secondarySave?.enabled);
  assert.equal(controls.length, 137);
  for (const technique of controls) {
    const save = technique.secondarySave;
    assert.equal(save.useWeaponAttribute, true, technique.name);
    assert.equal(save.dcBase, technique.costs.some(c => c.resourceId === 'special-action') ? 11 : 10, technique.name);
  }
  for (const style of ['drachentanz', 'sirenentanz', 'huskarl-waffenlehre']) assert.ok(controls.some(entry => entry.combatStyleId === style));
  const save = controls[0].secondarySave;
  const profile = { progression: { level: 7 }, attributes: [{ key: 'strength', score: 6 }, { key: 'dexterity', score: 18 }] };
  assert.equal(resolveTechniqueSaveDc(save, profile, { attackAttribute: 'dexterity', attackBonus: 99 }), 17);
  assert.equal(resolveTechniqueSaveDc(save, profile, { attackAttribute: 'strength' }), 11);
  assert.equal(resolveTechniqueSaveDc(reviseWeaponTechniqueSave({ ...save, fixedDc: 15 }, true), profile, { attackAttribute: 'dexterity' }), 15);
});

test('kleine Stellungen kosten einen Schadenspunkt, stärkere Kontrollen einen Zusatzwürfel; eigene Nachteile sind kein Nutzen', () => {
  const costs = [{ resourceId: 'action', amount: 1 }, { resourceId: 'bonus-action', amount: 1 }];
  const formula = spec => resolveTechniqueDamageFormula(createWeaponTechniqueDamageProfile({ damageControl: hasWeaponTechniqueControl(spec), damageControlTier: getWeaponTechniqueControlTier(spec) }, costs), { damageFormula: '1d8' });
  const enemy = { effects: [{ type: 'debuff', target: 'target', condition: { mechanics: { attack: -1 } } }] };
  const own = { effects: [{ type: 'debuff', target: 'self', condition: { mechanics: { armorClass: -1 } } }] };
  assert.equal(formula({}), '1d8+1d4');
  for (const spec of [{ mobility: 2 }, { slow: true }, { effects: [{ type: 'move', target: 'self', movementMeters: 2 }] }]) assert.equal(formula(spec), '1d8+1d4-1');
  assert.equal(formula(enemy), '1d8');
  assert.equal(formula(own), '1d8+1d4');
});

test('stärkere Krits ändern keine Schadensobergrenze und vervielfachen keine festen Boni', () => {
  for (const formula of ['1d4', '2d6', '1d8+3', '1d10+1d4-2']) {
    const metric = damageMetrics(formula, 2);
    assert.ok(metric.critical.minimum >= metric.maximum);
    assert.equal(metric.critical.maximum, metric.diceMaximum * 2 + metric.fixedBonus);
    assert.ok(metric.critical.average < metric.critical.maximum);
  }
});
