import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';
import { resolveTechniqueDamageFormula, getTechniqueDamageScaling } from '../modules/combat/combat-technique-damage.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { buildDamageNotation, parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { CHARACTER_CLASS_TEMPLATES } from '../modules/combat/character-creation-templates.js';

const attacks = getCombatStyle('drachentanz').forms.flatMap(form => form.techniques);
const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
const totals = formula => {
  if (!formula) return { maximum: 0, average: 0 };
  const parsed = parseDamageFormula(formula);
  return (parsed.terms || [parsed]).reduce((total, term) => ({
    maximum: total.maximum + term.diceCount * term.sides,
    average: total.average + term.diceCount * (term.sides + 1) / 2
  }), { maximum: parsed.fixedModifier, average: parsed.fixedModifier });
};

class MaximumDice {
  constructor(critical = false) { this.critical = critical; this.damageCalls = []; }
  async rollAttack({ modifier }) { return { natural: this.critical ? 20 : 19, total: (this.critical ? 20 : 19) + modifier, modifier, keptDice: [this.critical ? 20 : 19] }; }
  async rollDamage(input) { this.damageCalls.push(input); return { notation: buildDamageNotation(input.damageFormula, input.bonus, input.critical), total: totals(buildDamageNotation(input.damageFormula, input.bonus, input.critical)).maximum, keptDice: [], modifier: input.bonus }; }
  async rollSavingThrow({ modifier }) { return { natural: 1, total: 1 + modifier, keptDice: [1] }; }
}

test('alle 212 Klassenattacken bleiben mit jeder regulären Waffengröße innerhalb ihrer Ausbildungsbudgets', () => {
  assert.equal(attacks.length, 212);
  for (const attack of attacks) for (const formula of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
    const stats = totals(resolveTechniqueDamageFormula(attack, { damageFormula: formula }, { progression: { level: attack.minimumLevel } }));
    const ceiling = attack.minimumLevel <= 6 ? 22 : (attack.minimumLevel <= 8 ? 26 : (attack.minimumLevel < 13 ? 34 : (attack.minimumLevel < 17 ? 38 : 53)));
    assert.ok(stats.maximum <= ceiling, `${attack.name} mit ${formula}: ${stats.maximum} > ${ceiling}`);
    let last = stats.average;
    for (let level = attack.minimumLevel + 1; level <= 20; level++) {
      const next = totals(resolveTechniqueDamageFormula(attack, { damageFormula: formula }, { progression: { level } })).average;
      assert.ok(next >= last, `${attack.name} sinkt auf Stufe ${level}`);
      last = next;
    }
  }
});

test('alte Grundformen erhalten genau einen wachsenden Bonus; zusätzliche Pfadwahlen vervielfachen ihn nicht', () => {
  const attack = attacks.find(attack => attack.name === 'Sechsfacher Lehrhieb');
  const weapon = { damageFormula: '1d8' };
  assert.deepEqual([6, 7, 8, 9, 12, 13, 16, 17, 20].map(level => resolveTechniqueDamageFormula(attack, weapon, { progression: { level } })),
    ['2d8+2', '2d8+1d4+2', '2d8+1d4+2', '2d8+1d6+2', '2d8+1d6+2', '3d8+2', '3d8+2', '2d8+1d10+2', '2d8+1d10+2']);
  const manyPaths = { progression: { level: 16 }, classTraining: { selections: attacks.slice(0, 5).map((entry, index) => ({ kind: 'path', selectionId: entry.id, selectedAtLevel: 9 + index })) } };
  assert.equal(resolveTechniqueDamageFormula(attack, weapon, manyPaths), '3d8+2');
  assert.equal(getTechniqueDamageScaling(attack, { progression: { level: 1 } }), null);
});

test('sämtliche Klassen-Grundwaffen und ausgearbeiteten Schadenszauber bleiben im niedrigen Stufenbereich maßvoll', async () => {
  assert.equal(CHARACTER_CLASS_TEMPLATES.length, 34);
  for (const template of CHARACTER_CLASS_TEMPLATES) for (const weapon of template.weapons || []) {
    assert.ok(totals(weapon.damageFormula).maximum <= 12, `${template.label}: ${weapon.name}`);
  }
  let spellCount = 0;
  for (const slug of ['freya-skald', 'rhiannon-draig']) {
    const character = await load(slug);
    for (const spell of character.combatProfile.magic.spells) {
      spellCount++;
      for (const effect of spell.effects || []) if (effect.type === 'damage' && effect.formula) {
        assert.ok(totals(effect.formula).maximum <= 18, `${character.name}: ${spell.name}`);
      }
    }
  }
  assert.equal(spellCount, 31);
});

test('Barddwyr, Milwr und Arthwyr behalten ihre unterschiedlichen Ausbildungsabschnitte', () => {
  const milwr = attacks.find(attack => attack.name === 'Erster Soldhieb');
  const bard = attacks.find(attack => attack.name === 'Auftaktstich');
  const early = attacks.find(attack => attack.name === 'Welpengebrüll');
  assert.equal(getTechniqueDamageScaling(milwr, { progression: { level: 6 } }).formula, '1d4');
  assert.equal(getTechniqueDamageScaling(milwr, { progression: { level: 20 } }).formula, '1d8');
  assert.equal(getTechniqueDamageScaling(bard, { progression: { level: 7 } }).formula, '1d4');
  assert.equal(getTechniqueDamageScaling(early, { progression: { level: 6 } }), null);
  assert.equal(getTechniqueDamageScaling(early, { progression: { level: 7 } }).formula, '1d4');
});

test('Gildas kann Gawain mit seinem stärksten einhändigen Jungritterangriff selbst bei maximalem Krit nicht sofort ausschalten', async () => {
  const gildas = await load('gildas-gafyr');
  const target = resolveCombatProfile(await load('gawain-draig'));
  assert.equal(target.currentHitPoints, 49);
  const actor = resolveCombatProfile(gildas, { actionId: 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb' });
  assert.equal(actor.weapon.damageFormula, '2d8+2');
  assert.equal(actor.damageModifier, 5);
  for (const critical of [false, true]) {
    const result = await new CombatResolutionService(new MaximumDice(critical)).resolveAttack({ actor, target });
    assert.equal(result.damage.total, critical ? 39 : 23);
    assert.ok(result.targetSnapshot.hitPointsAfter > 0);
  }
});

test('Gildas stärkster Abschluss plus Reaktionsangriff lässt Gawain bei normalen Maximalwürfen noch 12 TP', async () => {
  const character = await load('gildas-gafyr');
  const target = resolveCombatProfile(await load('gawain-draig'));
  const first = resolveCombatProfile(character, { actionId: 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb' });
  const response = resolveCombatProfile(character, { actionId: 'technique:combat-style-drachentanz-jungdrache-03-gekreuzte-klauen' });
  const spent = new Map();
  for (const cost of [...first.resourceCosts, ...response.resourceCosts]) spent.set(cost.resourceId, (spent.get(cost.resourceId) || 0) + cost.amount);
  for (const [id, amount] of spent) assert.ok(amount <= first.resources.find(resource => resource.id === id).current, id);
  const resolver = new CombatResolutionService(new MaximumDice());
  const result = await resolver.resolveAttack({ actor: first, target });
  const follow = await resolver.resolveAttack({ actor: response, target: { ...target, currentHitPoints: result.targetSnapshot.hitPointsAfter } });
  assert.equal(result.damage.total + follow.damage.total, 37);
  assert.equal(follow.targetSnapshot.hitPointsAfter, 12);
});

test('zweihändige Waffenführung und manuelle Stufenwechsel berechnen die Technik neu ohne gespeicherte Zusatzwürfel zu stapeln', async () => {
  const character = await load('gildas-gafyr');
  const actionId = 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb';
  assert.equal(resolveCombatProfile(character, { actionId, weaponGrip: 'two-handed' }).weapon.damageFormula, '1d10+1d8+2');
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 16).profile;
  assert.equal(resolveCombatProfile(character, { actionId }).weapon.damageFormula, '3d8+2');
  character.combatProfile = sanitizeCharacterCombatProfile(character.combatProfile);
  assert.equal(resolveCombatProfile(character, { actionId }).weapon.damageFormula, '3d8+2');
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 6).profile;
  assert.equal(resolveCombatProfile(character, { actionId }).weapon.damageFormula, '2d8+2');
});

test('Flächenschaden verwendet ebenfalls die aktuelle Waffen- und Ausbildungsformel', async () => {
  const character = await load('gildas-gafyr');
  character.combatProfile.progression.level = 16;
  const actor = resolveCombatProfile(character, { actionId: 'technique:combat-style-drachentanz-jungdrache-04-schweifkreis' });
  const dice = new MaximumDice();
  await new CombatResolutionService(dice).resolveAttack({ actor, target: resolveCombatProfile(await load('gawain-draig')) });
  assert.equal(dice.damageCalls[0].damageFormula, actor.weapon.damageFormula);
  assert.equal(actor.selectedAction.effects.find(effect => effect.type === 'damage').formula, '');
});

test('Fenrirs Doppelhieb addiert Attribut und Berserkerwürfel nur beim Hauptangriff', async () => {
  const character = await load('fenrir-varulv');
  const rage = character.combatProfile.abilities.find(ability => ability.id === 'fenrir-berserkergang').effects.find(effect => effect.type === 'apply-condition').condition;
  character.combatProfile.conditions.push({ ...rage, active: true });
  const actor = resolveCombatProfile(character, { actionId: 'technique:fenrir-twin-axe-flurry' });
  const dice = new MaximumDice();
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: resolveCombatProfile(await load('gawain-draig')) });
  assert.equal(result.followUpAttacks.length, 1);
  assert.equal(dice.damageCalls[0].damageFormula, '1d6+1d4+1');
  assert.equal(dice.damageCalls[1].damageFormula, '1d4');
  assert.equal(dice.damageCalls[1].bonus, 0);
});

test('alte Magier- und Skjaldr-Kopien werden idempotent aktualisiert; Utility und Freyas begrenzter Schrei bleiben erhalten', async () => {
  const raw = { magic: { spells: [{ id: 'rhiannon-hundert-klingen-sturm', effects: [{ type: 'damage', formula: '6d6' }] }] } };
  const updated = reconcileClassDamageRevisions(raw);
  assert.equal(raw.magic.spells[0].effects[0].formula, '6d6');
  assert.equal(updated.magic.spells[0].effects[0].formula, '3d4');
  assert.deepEqual(reconcileClassDamageRevisions(updated), updated);
  const rhiannon = await load('rhiannon-draig');
  const missile = rhiannon.combatProfile.magic.spells.find(spell => spell.id === 'rhiannon-magisches-geschoss');
  assert.equal(missile.effects[0].formula, '1d4+1');
  assert.equal(missile.upcast.formulaPerLevel, '1d4');
  const freya = await load('freya-skald');
  assert.deepEqual(reconcileClassDamageRevisions(freya.combatProfile), freya.combatProfile);
});

test('ein gespeicherter alter Berserkerzustand übernimmt die neue Formel ohne Dauer oder Verbrauch zurückzusetzen', async () => {
  const character = await load('fenrir-varulv');
  const condition = character.combatProfile.abilities.find(ability => ability.id === 'fenrir-berserkergang').effects.find(effect => effect.type === 'apply-condition').condition;
  const stale = JSON.parse(JSON.stringify(condition).replaceAll('1d4', '1d6'));
  delete stale.berserk;
  stale.id = 'fenrir-berserkergang-state-legacy';
  const stored = { current: 31, temporaryConditions: [{ ...stale, active: true }] };
  const actor = overlayCombatHitPointState(resolveCombatProfile(character), stored);
  assert.ok(JSON.stringify(actor.temporaryConditions[0]).includes('1d4'));
  assert.ok(!JSON.stringify(actor.temporaryConditions[0]).includes('1d6'));
  assert.ok(JSON.stringify(stored.temporaryConditions[0]).includes('1d6'), 'Der historische Kampfstand bleibt unverändert');
  assert.equal(actor.currentHitPoints, 31);
  assert.equal(actor.temporaryConditions[0].durationModel.kind, condition.durationModel.kind);
});
