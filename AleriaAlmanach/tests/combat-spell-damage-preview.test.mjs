import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { estimateCombatDamage, getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { getCombatDisplayStats, renderMagicValueStrip } from '../modules/combat/ui/combat-action-card.js';
import { reconcileClassDamageRevisions } from '../modules/classes/class-damage-revisions.js';

const rhiannon = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;
const target = resolveCombatProfile({
  id: 'preview-target', name: 'Prüfziel', combatProfile: {
    enabled: true, attributes: { strength: 10, dexterity: 10 },
    hitPoints: { current: 60, maximumOverride: 60 }, armorClass: { override: 10 }
  }
});

class RecordingDice {
  damageRequests = [];
  async rollAttack({ modifier = 0 }) {
    return { natural: 10, dice: [10], keptDice: [10], total: 10 + modifier };
  }
  async rollDamage(request) {
    this.damageRequests.push(request);
    return { notation: request.damageFormula, dice: [1], keptDice: [1], total: 1 + request.bonus, modifier: request.bonus };
  }
}

const damageSpells = [
  ['magisches-geschoss', 1, ['1d4+1', '2d4+1', '3d4+1'], [8.5, 11, 13.5], ['1W4+6', '2W4+6', '3W4+6']],
  ['windklinge', 1, ['1d8', '1d8', '1d8'], [9.5, 9.5, 9.5], ['1W8+5', '1W8+5', '1W8+5']],
  ['druckstoss', 1, ['1d6', '1d6', '1d6'], [8.5, 8.5, 8.5], ['1W6+5', '1W6+5', '1W6+5']],
  ['sichelwind', 2, ['2d6', '2d6'], [12, 12], ['2W6+5', '2W6+5']],
  ['berstende-boe', 2, ['2d4', '2d4'], [10, 10], ['2W4+5', '2W4+5']],
  ['hundert-klingen-sturm', 3, ['3d4'], [12.5], ['3W4+5']],
  ['blitzfunken', 3, ['3d6'], [15.5], ['3W6+5']]
];

for (const [id, baseGrade, formulas, averages, notations] of damageSpells) {
  test(`Rhiannon ${id}: sichtbare Würfel, Durchschnitt und Würfelanforderung stimmen auf jedem freigeschalteten Grad überein`, async () => {
    for (let index = 0; index < formulas.length; index++) {
      const actor = resolveCombatProfile(rhiannon, { actionId: `spell:rhiannon-${id}`, castLevel: baseGrade + index });
      assert.equal(actor.selectedAction.id, `spell:rhiannon-${id}`);
      assert.equal(actor.selectedAction.compatible, true);
      assert.equal(estimateCombatDamage(actor), averages[index]);
      assert.equal(getCombatDamagePreview(actor).notation, notations[index].replaceAll('W', 'd'));
      assert.equal(getCombatDisplayStats(actor).damage, notations[index]);
      const markup = renderMagicValueStrip(actor);
      assert.ok(markup.includes(`<span>Schaden</span><strong>${notations[index]}</strong>`));
      assert.ok(markup.includes(`<span>Ø Schaden</span><strong>${averages[index].toLocaleString('de-DE')}</strong>`));
      assert.ok(markup.includes(`<small>${actor.selectedAction.effects[0].damageType} · Schadensmod. +5</small>`));
      assert.doesNotMatch(markup, /<details/);

      const dice = new RecordingDice();
      const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
      assert.equal(result.attack.hit, true);
      assert.equal(dice.damageRequests.length, 1);
      assert.equal(dice.damageRequests[0].damageFormula, formulas[index]);
      assert.equal(dice.damageRequests[0].bonus, 5, 'INT-Modifikator gilt genau einmal, zusätzlich zur Zauberformel');
      assert.equal(dice.damageRequests[0].critical, false);
    }
  });
}

test('allgemeine Schadensboni und Zusatzwürfel erscheinen auch bei Zaubern; Waffenboni bleiben ausgeschlossen', async () => {
  const character = structuredClone(rhiannon);
  character.combatProfile.conditions.push({ id: 'damage-buff', name: 'Verstärkung', active: true,
    mechanics: { damage: 2, damageScope: 'all-effects', bonusDamageFormula: '1d4', weaponBonusDamageFormula: '1d12' } });
  const actor = resolveCombatProfile(character, { actionId: 'spell:rhiannon-windklinge' });
  assert.deepEqual(getCombatDamagePreview(actor), { notation: '1d8+1d4+7', modifier: 7, average: 14, damageType: 'Wind' });
  assert.ok(renderMagicValueStrip(actor).includes('<strong>1W8+1W4+7</strong>'));
  assert.match(renderMagicValueStrip(actor), /Schadensmod\. \+7/);
  const dice = new RecordingDice();
  await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(dice.damageRequests[0].damageFormula, '1d8+1d4');
  assert.equal(dice.damageRequests[0].bonus, 7);
});

test('der Attributbonus folgt Rhiannons aktuellem INT-Wert einschließlich manueller Modifikatoren', () => {
  const character = structuredClone(rhiannon);
  const intelligence = character.combatProfile.attributes.find(attribute => attribute.key === 'intelligence');
  for (const [score, override, modifier, average] of [[18, null, 4, 7.5], [8, null, -1, 2.5], [20, 7, 7, 10.5]]) {
    intelligence.score = score;
    intelligence.modifierOverride = override;
    const actor = resolveCombatProfile(character, { actionId: 'spell:rhiannon-druckstoss' });
    assert.equal(getCombatDamagePreview(actor).modifier, modifier);
    assert.equal(estimateCombatDamage(actor), average);
  }
});

test('Rettungswurf halbiert auch den INT-Bonus; ein Krit verdoppelt nur die Würfel', async () => {
  for (const [id, natural, critical] of [['druckstoss', 19, false], ['windklinge', 20, true]]) {
    const actor = resolveCombatProfile(rhiannon, { actionId: `spell:rhiannon-${id}` });
    const dice = new RecordingDice();
    dice.rollAttack = async ({ modifier }) => ({ natural, dice: [natural], keptDice: [natural], total: natural + modifier });
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    assert.equal(dice.damageRequests[0].bonus, 5);
    assert.equal(dice.damageRequests[0].critical, critical);
    if (!critical) {
      assert.equal(result.attack.saveSucceeded, true);
      assert.equal(result.damage.total, 3, '(gewürfelte 1 + INT 5) / 2');
    }
  }
});

test('alte Rhiannon-Kopien erhalten den Attributbezug idempotent; andere Zauber und eigene Einstellungen bleiben erhalten', () => {
  const profile = { magic: { spells: [
    { id: 'rhiannon-druckstoss', effects: [{ type: 'damage', formula: '2d6' }] },
    { id: 'rhiannon-windklinge', effects: [{ type: 'damage', formula: '1d8', bonusAttribute: 'charisma' }] },
    { id: 'other-spell', effects: [{ type: 'damage', formula: '1d6' }] }
  ] } };
  const revised = reconcileClassDamageRevisions(profile);
  assert.equal(revised.magic.spells[0].effects[0].bonusAttribute, 'intelligence');
  assert.equal(profile.magic.spells[0].effects[0].bonusAttribute, undefined);
  assert.equal(revised.magic.spells[1].effects[0].bonusAttribute, 'charisma');
  assert.deepEqual(revised.magic.spells[2], profile.magic.spells[2]);
  assert.deepEqual(reconcileClassDamageRevisions(revised), revised);
});

test('Schutzzauber zeigen auch beim Hochwirken keinen Schaden durch ihre Effektwürfel', () => {
  for (const id of ['magierruestung', 'schild', 'spiegelbilder', 'person-festhalten']) {
    const actor = resolveCombatProfile(rhiannon, { actionId: `spell:rhiannon-${id}`, castLevel: 3 });
    assert.equal(actor.selectedAction.id, `spell:rhiannon-${id}`);
    assert.equal(getCombatDamagePreview(actor), null);
    assert.equal(getCombatDisplayStats(actor).damage, '—');
    assert.doesNotMatch(renderMagicValueStrip(actor), /<span>(?:Ø )?Schaden<\/span>/);
  }
});

test('fester Schaden zeigt denselben Betrag wie sein Durchschnitt statt veralteter Waffenwürfel', () => {
  const actor = { profileActionKind: 'spell', damageModifier: 99, weapon: { damageFormula: '1d12' },
    selectedAction: { kind: 'spell', effects: [{ type: 'damage', amount: 5, damageType: 'Feuer' }] },
    conditions: [{ id: 'fixed-buff', name: 'Verstärkung', active: true,
      mechanics: { damage: 2, damageScope: 'all-effects', bonusDamageFormula: '1d4' } }] };
  assert.deepEqual(getCombatDamagePreview(actor), { notation: '7', modifier: 2, average: 7, damageType: 'Feuer' });
  assert.equal(getCombatDisplayStats(actor).damage, '7');
  assert.doesNotMatch(renderMagicValueStrip(actor), /1W12|1W4|99/);
});

test('Heilung, Eigenschaden und Schaden nur bei Fehlschlag erzeugen keinen normalen Haupttreffer', () => {
  for (const effect of [{ type: 'healing' }, { type: 'damage', target: 'self' },
    { type: 'damage', on: 'miss' }, { type: 'damage', on: 'save-success' }]) {
    const actor = { weapon: { damageFormula: '1d8' }, selectedAction: { kind: 'spell', effects: [{ ...effect, formula: '1d8' }] } };
    assert.equal(estimateCombatDamage(actor), null);
    assert.doesNotMatch(renderMagicValueStrip(actor), /<span>(?:Ø )?Schaden<\/span>/);
  }
});

test('ungültige importierte Schadensformeln bleiben sicher lesbar, ohne einen Durchschnitt zu erfinden', () => {
  const actor = { selectedAction: { kind: 'spell', effects: [{ type: 'damage', formula: '1W6<script>' }] } };
  const markup = renderMagicValueStrip(actor);
  assert.match(markup, /1W6&lt;SCRIPT&gt;/);
  assert.doesNotMatch(markup, /<script|Ø Schaden/i);
  assert.equal(estimateCombatDamage(actor), null);
});
