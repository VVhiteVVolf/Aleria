import assert from 'node:assert/strict';
import test from 'node:test';
import { getBalanceCatalog } from './support/technique-balance-catalog.mjs';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { isSelfTargetAction } from '../modules/combat/combat-action-targeting.js';
import { listSpellCatalogEntries, createCatalogSpell } from '../modules/spell-catalog/spell-catalog.js';

// This is an effect/dice contract test. Eligibility, class grants and real
// loadouts have separate tests; every catalog entry must reach this engine test.
function fixture(id, techniques = [], spells = []) {
  const result = resolveCombatProfile({ id, name: id, combatProfile: {
    progression: { level: 20 }, hitPoints: { current: 5000, maximumOverride: 5000 },
    attributes: [{ key: 'strength', score: 16 }], armorClass: { override: 5 },
    weapons: [{ id: 'audit-sword', name: 'Prüfschwert', weaponType: 'sword', equipped: true, damageFormula: '1d8' }],
    techniques: techniques.map(entry => ({ ...entry, active: true })),
    magic: { enabled: true, spells: spells.map(entry => ({ ...entry, prepared: true })) }
  } }, { includeAiSnapshot: false });
  result.resources.forEach(resource => { resource.current = resource.maximum = 100; });
  return result;
}

// An independent arithmetic oracle: do not reuse the production dice parser.
function maximum(formula, bonus = 0, critical = false) {
  const terms = String(formula).toLowerCase().replaceAll('w', 'd').replaceAll(' ', '').match(/[+-]?[^+-]+/g) || [];
  return Math.max(0, terms.reduce((sum, term) => {
    const die = /^\+?(\d+)d(4|6|8|10|12)$/.exec(term);
    if (die) return sum + Number(die[1]) * Number(die[2]) * (critical ? 2 : 1);
    assert.match(term, /^[+-]?\d+$/, `invalid formula ${formula}`);
    return sum + Number(term);
  }, bonus));
}

class ContractDice extends SeededCombatDice {
  constructor(mode, savingThrow) { super(1, 20); this.mode = mode; this.savingThrow = savingThrow; }
  async rollAttack({ modifier = 0, rollMode = 'normal' }) {
    const natural = this.savingThrow ? (this.mode === 'miss' ? 20 : 1) : this.mode === 'critical' ? 20 : this.mode === 'miss' ? 1 : 12;
    return { natural, dice: Array(rollMode === 'normal' ? 1 : 2).fill(natural), keptDice: [natural], total: natural + modifier };
  }
  async rollSavingThrow({ modifier = 0 }) {
    const natural = this.mode === 'save-success' ? 20 : 1;
    return { natural, dice: [natural], keptDice: [natural], total: natural + modifier };
  }
  async rollDamage(request) {
    const roll = await super.rollDamage(request);
    assert.equal(roll.total, maximum(request.damageFormula, request.bonus, request.critical));
    return roll;
  }
}

async function checkActions(profile, kind, seen) {
  for (const selected of profile.actions.filter(action => action.kind === kind)) {
    const action = { ...selected, compatible: true, channelComments: 0 };
    seen.add(action.sourceId);
    const modes = ['normal', 'miss', 'critical', ...(action.secondarySave?.enabled ? ['save-success'] : [])];
    for (const mode of modes) {
      const actor = { ...profile, selectedAction: action, profileActionId: action.id, profileActionKind: action.kind,
        weapon: action.weapon, attackModifier: action.attackModifier, damageModifier: action.damageModifier,
        resourceCosts: action.costs, actionResolutionMode: action.resolutionMode,
        actionSaveAttribute: action.saveAttribute, actionSpellSaveDc: action.spellSaveDc || 15,
        actionHalfDamageOnSave: !!action.halfDamageOnSave, forcedRollMode: action.forcedRollMode || 'normal' };
      const target = isSelfTargetAction(action) ? actor : { ...profile, characterId: 'target', name: 'Ziel', totalDefense: 5 };
      const dice = new ContractDice(mode, actor.actionResolutionMode === 'saving-throw');
      const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
      const label = `${action.name} / ${mode}`;
      for (const cost of action.costs) {
        const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId).current;
        const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId).current;
        assert.equal(before - after, cost.amount, `${label}: ${cost.resourceId}`);
      }
      const preview = getCombatDamagePreview(actor);
      const damage = result.effectResults.filter(entry => entry.effect.type === 'damage' && entry.recipient === 'target');
      for (const entry of damage.filter(entry => entry.effect.inheritWeaponDamageType)) {
        assert.equal(entry.effect.damageType, actor.weapon.damageType, `${label}: weapon damage type`);
      }
      if (mode === 'normal' && result.attack.hit && preview) {
        assert.equal(damage.reduce((sum, entry) => sum + entry.amount, 0), maximum(preview.notation), `${label}: preview versus rolled damage`);
      }
      if (!preview && isSelfTargetAction(action)) assert.equal(damage.length, 0, `${label}: support cannot damage`);
      assert.ok(result.targetSnapshot.hitPointsAfter >= 0, label);
      if (action.secondarySave?.enabled && result.attack.hit) {
        assert.equal(result.secondarySaves.length, 1, label);
        assert.equal(result.secondarySaves[0].succeeded, mode === 'save-success', label);
        assert.equal(!!result.targetConditionSnapshot?.applied, mode !== 'save-success', `${label}: save consequence`);
      }
    }
  }
}

test('all 816 form techniques: hit, miss, critical, costs, support and damage preview', async () => {
  const catalog = getBalanceCatalog();
  const seen = new Set();
  // Profile storage deliberately caps learned techniques; test in bounded batches.
  for (let offset = 0; offset < catalog.length; offset += 64) {
    await checkActions(fixture('actor', catalog.slice(offset, offset + 64)), 'technique', seen);
  }
  assert.equal(seen.size, catalog.length);
});

test('all current spell catalog forms: dice, normal/save/critical outcomes and costs', async () => {
  const spells = ['elemente', 'restitution'].flatMap(catalog => listSpellCatalogEntries({ catalog }))
    .flatMap(entry => [entry.level, ...entry.forms.map(form => form.level)].filter((level, index, list) => list.indexOf(level) === index)
      .map(level => createCatalogSpell(entry.id, { level })));
  let checked = 0;
  // One entry per profile also tests each authored/upcast grade without duplicate IDs.
  for (const spell of spells) {
    const seen = new Set();
    await checkActions(fixture('actor', [], [spell]), 'spell', seen);
    assert.equal(seen.size, 1, spell.name);
    checked++;
  }
  assert.ok(checked > 100);
});
