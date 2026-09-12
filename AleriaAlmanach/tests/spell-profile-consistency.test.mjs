import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCatalogSpell, listSpellCatalogEntries, detachCatalogSpell } from '../modules/spell-catalog/spell-catalog.js';
import { normalizeCharacterArchiveEntry, createCharacterArchiveProfileItem } from '../modules/character-archive/character-archive-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { getCharacterSpellPresentation } from '../modules/characters/character-spell-presentation.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

const rhiannon = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;
const manaByGrade = [2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 18];
const target = resolveCombatProfile({ id: 'spell-audit-target', name: 'Prüfziel', combatProfile: {
  hitPoints: { current: 5000, maximumOverride: 5000 }, armorClass: { override: 5 }
} });
const caster = spell => ({ id: 'spell-audit-caster', name: 'Prüfmagier', combatProfile: {
  progression: { level: 20 }, attributes: [{ key: 'wisdom', score: 18 }],
  hitPoints: { current: 100, maximumOverride: 100 },
  magic: { enabled: true, castingAttribute: 'wisdom', casterTier: 'full', spells: [spell] }
} });
const damagedParts = spell => spell.effects.filter(effect => effect.type === 'damage').map(effect => [effect.formula, effect.damageType]);
const prices = costs => costs.map(cost => [cost.resourceId, cost.amount]);

test('Zauberkarten und Kampf verwenden dieselben allgemeinen Zusatzwürfel ohne Waffenwürfel', () => {
  const character = structuredClone(rhiannon);
  character.combatProfile.conditions.push({ id: 'audit-bonus', name: 'Verstärkung', active: true,
    mechanics: { damage: 2, damageScope: 'all-effects', bonusDamageFormula: '1d4', weaponBonusDamageFormula: '1d12' } });
  const actor = resolveCombatProfile(character, { actionId: 'spell:rhiannon-windklinge' });
  const spell = actor.magic.spells.find(entry => entry.id === 'rhiannon-windklinge');
  const presentation = getCharacterSpellPresentation(spell, character.combatProfile);
  assert.equal(presentation.damage.label, '1W8+1W4+7 · Wind');
  assert.equal(getCombatDamagePreview(actor).notation, '1d8+1d4+7');
});

test('Waffen- und allgemeine Boni werden in Profilzuständen und Szenenzuständen gleich interpretiert', async () => {
  for (const damageScope of ['weapon', 'all-effects']) {
    const condition = { id: 'audit-state', name: 'Prüfzustand', active: true,
      mechanics: { attack: 2, spellAttack: 3, spellSaveDc: 1, damage: 4, damageScope, weaponBonusDamageFormula: '1d12' } };
    const character = structuredClone(rhiannon);
    character.combatProfile.conditions.push(condition);
    const persistent = resolveCombatProfile(character, { actionId: 'spell:rhiannon-windklinge' });
    const base = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-windklinge' });
    const scene = overlayCombatHitPointState(base, { temporaryConditions: [condition] });
    assert.equal(persistent.attackModifier, base.attackModifier + 5, 'Allgemeiner Angriff gilt wie im Szenenmodell auch für Zauber');
    assert.equal(scene.attackModifier, persistent.attackModifier);
    assert.equal(scene.spellAttackModifier, persistent.spellAttackModifier);
    assert.equal(scene.aiSnapshot.derivedCombatValues.spellAttackModifier, scene.attackModifier);
    assert.equal(scene.actionSpellSaveDc, persistent.actionSpellSaveDc);
    assert.deepEqual(getCombatDamagePreview(scene), getCombatDamagePreview(persistent));
    assert.equal(getCombatDamagePreview(scene).modifier, damageScope === 'all-effects' ? 9 : 5);
    const result = await new CombatResolutionService(new SeededCombatDice(1, 10)).resolveAttack({ actor: scene, target });
    assert.equal(result.damage.modifier, damageScope === 'all-effects' ? 9 : 5);
  }
});

test('alte persönliche Zauber werden vor dem Archivkopieren abgeglichen, solange ihre Regel-ID noch vorliegt', () => {
  const original = structuredClone(rhiannon.combatProfile.magic.spells.find(spell => spell.id === 'rhiannon-druckstoss'));
  original.costs = [{ resourceId: 'action', amount: 1 }];
  original.effects[0].formula = '2d6';
  delete original.effects[0].bonusAttribute;
  const before = structuredClone(original);
  const entry = normalizeCharacterArchiveEntry({ kind: 'spell', name: original.name, data: original });
  assert.equal(entry.data.effects[0].formula, '1d6');
  assert.equal(entry.data.effects[0].bonusAttribute, 'intelligence');
  assert.deepEqual(prices(entry.data.costs), [['reaction', 1], ['bonus-action', 1], ['mana-focus', 3]]);
  const item = createCharacterArchiveProfileItem(entry, 'magic.spells');
  const profile = sanitizeCharacterCombatProfile({ magic: { spells: [item] } });
  assert.notEqual(item.id, original.id);
  assert.equal(profile.magic.spells[0].effects[0].bonusAttribute, 'intelligence');
  assert.deepEqual(prices(profile.magic.spells[0].costs), prices(entry.data.costs));
  assert.deepEqual(original, before);
});

test('gebundene Archivfassungen zeigen den Katalognamen; eigene Fassungen behalten ihre Zielgrenze', () => {
  const original = createCatalogSpell('elementarismus-feuerball', { revision: 1 });
  const archive = normalizeCharacterArchiveEntry({ kind: 'spell', name: 'Veralteter Name', description: 'Veraltete Wirkung',
    data: { ...original, rollFormula: '99d20', manaCost: 0, costs: [] } });
  assert.equal(archive.name, original.name);
  assert.equal(archive.description, original.description);
  assert.equal(archive.data.rollFormula, original.rollFormula);
  const own = detachCatalogSpell({ ...original, id: 'own-two-targets', name: 'Eigener begrenzter Zauber', maximumTargets: 2 });
  const actor = resolveCombatProfile(caster(own), { actionId: `spell:${own.id}` });
  assert.equal(actor.magic.spells[0].maximumTargets, 2);
  assert.equal(actor.selectedAction.maximumTargets, 2);
  assert.equal(actor.magic.spells[0].catalogReference, undefined);
});

test('alle 31 persönlichen Zauber von Rhiannon und Freya behalten ihre Regeln nach dem Archivkopieren', async () => {
  const freya = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/freya-skald.json', import.meta.url), 'utf8')).character;
  let count = 0;
  for (const character of [rhiannon, freya]) {
    const profile = sanitizeCharacterCombatProfile(character.combatProfile);
    for (const spell of profile.magic.spells) {
      const item = createCharacterArchiveProfileItem(normalizeCharacterArchiveEntry({ kind: 'spell', name: spell.name, data: spell }), 'magic.spells');
      const after = sanitizeCharacterCombatProfile({ ...profile, magic: { ...profile.magic, spells: [item] } }).magic.spells[0];
      assert.deepEqual(after.effects, spell.effects, spell.name);
      assert.deepEqual(prices(after.costs), prices(spell.costs), spell.name);
      assert.equal(after.rollFormula, spell.rollFormula, spell.name);
      assert.equal(after.resolutionType, spell.resolutionType, spell.name);
      count++;
    }
  }
  assert.equal(count, 31);
});

for (const revision of [1, 2]) test(`Katalogfassung ${revision}: alle Formen über Archiv, JSON, Profil, Vorschau und tatsächliches Wirken`, async () => {
  let checked = 0;
  for (const entry of listSpellCatalogEntries({ revision })) {
    const base = createCatalogSpell(entry.id, { revision });
    const archive = normalizeCharacterArchiveEntry({ kind: 'spell', name: entry.name, data: base, iconAssignmentVersion: 1 });
    const learned = createCharacterArchiveProfileItem(archive, 'magic.spells');
    const character = JSON.parse(JSON.stringify(caster(learned)));
    for (const form of [entry, ...entry.forms]) {
      const context = `${entry.id}@${revision} Grad ${form.level}`;
      const actor = resolveCombatProfile(character, { actionId: `spell:${learned.id}`, castLevel: form.level });
      assert.equal(actor.selectedAction.compatible, true, context);
      assert.deepEqual(actor.selectedAction.catalogReference, { id: entry.id, revision }, context);
      assert.deepEqual(damagedParts(actor.selectedAction), form.damage.map(part => [part.formula, part.damageType]), context);
      assert.deepEqual(prices(actor.resourceCosts), [...form.actionIds.map(id => [id, 1]), ['mana-focus', manaByGrade[form.level]]], context);
      assert.equal(actor.attackModifier, 10, `${context}: WE +4 und Übung +6, kein fremder INT-Bonus`);
      assert.equal(actor.actionSpellSaveDc, 18, context);
      assert.equal(actor.weapon.range, form.range || entry.range, context);
      const preview = getCombatDamagePreview(actor);
      assert.equal(preview == null, form.damage.length === 0, context);
      const gradeSpell = createCatalogSpell(entry.id, { revision, level: form.level });
      const card = getCharacterSpellPresentation(gradeSpell, character.combatProfile);
      if (preview) assert.equal(card.damage.label, `${preview.notation.toUpperCase().replaceAll('D', 'W')} · ${preview.damageType}`, context);
      const service = new CombatResolutionService(new SeededCombatDice(1, 10));
      if (entry.channelComments > 1) actor.channeling = { actionId: actor.profileActionId, progress: entry.channelComments - 1,
        requiredComments: entry.channelComments, lastProgressCommentKey: 'earlier' };
      const result = await service.resolveAttack({ actor, target }, { rulePeriods: { comment: 'completion' } });
      assert.equal(result.effectResults.filter(effect => effect.effect.type === 'damage').length, form.damage.length, context);
      for (const cost of actor.resourceCosts) {
        const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId);
        const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId);
        assert.equal(before.current - after.current, cost.amount, context);
      }
      assert.ok(result.actorResourceSnapshot.before.filter(resource => resource.category === 'spell-slot')
        .every(resource => result.actorResourceSnapshot.after.find(after => after.id === resource.id).current === resource.current), context);
      checked++;
    }
  }
  assert.ok(checked > 100);
});
