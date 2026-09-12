import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createCatalogSpell, listSpellCatalogEntries, getSpellCatalogEntry, detachCatalogSpell } from '../modules/spell-catalog/spell-catalog.js';
import { buildSpellCatalogArchiveEntries } from '../modules/spell-catalog/spell-catalog-archive.js';
import { createCharacterArchiveProfileItem, mergeCharacterArchiveEntries, normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';
import { getCharacterSheetEntryIconPresentation } from '../modules/character-archive/character-archive-icons.js';
import { FIRE_SPELL_ARSENAL } from '../modules/character-archive/fire-spell-arsenal.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';
import { getRollIconSource } from '../modules/combat/combat-entry-icons.js';
import { combatNarrationInternals } from '../modules/combat/combat-narration-service.js';
import { getCharacterSpellPresentation } from '../modules/characters/character-spell-presentation.js';

const entries = listSpellCatalogEntries({ revision: 1 });
const referenceCharacter = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;
function actorFor(slug, castLevel) {
  const character = structuredClone(referenceCharacter);
  character.id = 'catalog-test-caster'; character.name = 'Elementarist';
  character.combatProfile.progression.level = 20;
  const spell = createCatalogSpell(`elementarismus-${slug}`, { revision: 1 });
  assert.ok(spell, slug);
  character.combatProfile.magic.spells = [spell];
  const actor = resolveCombatProfile(character, { segmentKind: 'spell', actionId: `spell:${spell.id}`, castLevel });
  actor.resources = actor.resources.map(resource => ({ ...resource, current: resource.maximum }));
  return actor;
}
function target() {
  return resolveCombatProfile({ id: 'catalog-target', name: 'Prüfziel', combatProfile: {
    hitPoints: { current: 200, maximumOverride: 200 }, armorClass: { override: 10 }
  } });
}
function dice(saveSucceeds = false) {
  return {
    async rollAttack({ modifier = 0 }) { return { natural: 15, dice: [15], keptDice: [15], total: saveSucceeds ? 999 : 15 + modifier }; },
    async rollSavingThrow() { return { natural: saveSucceeds ? 20 : 1, dice: [1], keptDice: [1], total: saveSucceeds ? 999 : -99 }; },
    async rollDamage({ damageFormula, bonus = 0 }) { return { notation: damageFormula, dice: [11], keptDice: [11], total: 11 + bonus, modifier: bonus }; }
  };
}
function assertCostsPaid(result, actor) {
  for (const cost of actor.resourceCosts) {
    const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId);
    const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId);
    assert.equal(before.current - after.current, cost.amount, `${actor.name}: ${cost.resourceId}`);
  }
}

test('all 72 source spells have distinct catalog identities, valid icons and explicit authored forms', async () => {
  const source = JSON.parse(await readFile(new URL('../../Magie/docs/elementarismus/source-spells-v1_1.json', import.meta.url), 'utf8'));
  assert.equal(entries.length, 72);
  assert.equal(new Set(entries.map(entry => entry.id)).size, 72);
  assert.deepEqual(entries.map(entry => entry.sourceId).sort(), source.map(entry => entry.sourceId).sort());
  assert.deepEqual(Object.fromEntries(['F','W','L','DN','BL','E','Z'].map(id => [id, entries.filter(entry => entry.section === id).length])), { F:14,W:14,L:10,DN:2,BL:2,E:14,Z:16 });
  for (const entry of entries) {
    if (entry.iconPath) await access(new URL(`../../${entry.iconPath}`, import.meta.url));
    assert.ok(entry.effect && entry.limits && entry.requirements, entry.name);
    for (const form of [entry, ...entry.forms]) {
      const spell = createCatalogSpell(entry.id, { revision: entry.revision, level: form.level });
      assert.equal(spell.manaCost, getSpellManaCost(form.level));
      assert.equal(spell.costs.find(cost => cost.resourceId === 'mana-focus').amount, spell.manaCost);
      assert.deepEqual(spell.costs.filter(cost => cost.resourceId !== 'mana-focus').map(cost => cost.resourceId), form.actionIds);
      assert.ok(spell.effects.length, `${entry.name} remains selectable even without damage`);
      for (const part of form.damage) await access(new URL(getRollIconSource(part.formula, part.damageType)));
      assert.ok(spell.costs.every(cost => cost.resourceId === 'mana-focus' || cost.amount === 1));
      for (const cost of spell.costs.filter(cost => cost.resourceId === 'special-action')) assert.equal(cost.scope, 'persistent');
    }
  }
  assert.equal(createCatalogSpell('elementarismus-feuerball', { revision: 1, level: 9 }), null);
  const mutable = getSpellCatalogEntry(entries[0].id, 1); mutable.name = 'changed';
  assert.equal(getSpellCatalogEntry(entries[0].id, 1).name, entries[0].name);
});

test('archive, profile and serialized snapshots preserve references without merging old same-name spells', () => {
  const catalog = buildSpellCatalogArchiveEntries().map(normalizeCharacterArchiveEntry);
  const oldFireball = FIRE_SPELL_ARSENAL.find(spell => spell.name === 'Feuerball');
  const oldEntry = { kind: 'spell', name: 'Feuerball', data: oldFireball };
  const fireball = catalog.find(entry => entry.name === 'Feuerball');
  const merged = mergeCharacterArchiveEntries([oldEntry], catalog);
  assert.equal(merged.filter(entry => entry.name === 'Feuerball').length, 2);
  const item = createCharacterArchiveProfileItem(fireball, 'magic.spells');
  assert.notEqual(item.id, fireball.data.id);
  const profile = sanitizeCharacterCombatProfile(JSON.parse(JSON.stringify({ magic: { spells: [oldFireball, item] } })));
  assert.equal(profile.magic.spells[0].rollFormula, oldFireball.rollFormula);
  assert.equal(profile.magic.spells[0].catalogReference, undefined);
  assert.deepEqual(profile.magic.spells[1].catalogReference, fireball.data.catalogReference);
  assert.equal(profile.magic.spells[1].id, item.id);
  assert.deepEqual(getCharacterSheetEntryIconPresentation('spell', profile.magic.spells[1], merged).source, fireball.icon);
  assert.equal(getCharacterSheetEntryIconPresentation('spell', oldFireball, merged).source, '');
  const own = detachCatalogSpell({ ...item, rollFormula: '2d6', name: 'Eigener Feuerball' });
  const ownProfile = sanitizeCharacterCombatProfile({ magic: { spells: [own] } });
  assert.equal(ownProfile.magic.spells[0].rollFormula, '2d6');
  assert.equal(ownProfile.magic.spells[0].catalogReference, undefined);
  assert.equal(ownProfile.magic.spells[0].upcast.enabled, false);
  assert.equal(ownProfile.magic.spells[0].catalogOrigin.id, fireball.data.catalogReference.id);
});

test('Feuerball uses authored upcast damage and pays mana plus both actions; missing resources block it', async () => {
  const card = getCharacterSpellPresentation(createCatalogSpell('elementarismus-feuerball', { revision: 1 }));
  assert.equal(card.costs, 'Aktion + Besondere Aktion · 5 Mana');
  assert.match(card.higherForms[1], /10W6/);
  const actor = actorFor('feuerball', 5);
  assert.equal(actor.weapon.damageFormula, '10d6');
  assert.equal(actor.selectedAction.maximumTargets, 20);
  assert.equal(actor.resourceCosts.find(cost => cost.resourceId === 'mana-focus').amount, 7);
  assert.deepEqual(actor.resourceCosts.filter(cost => cost.resourceId !== 'mana-focus').map(cost => cost.resourceId), ['action', 'special-action']);
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: target() });
  assertCostsPaid(result, actor);
  assert.deepEqual(result.catalogReference, actor.selectedAction.catalogReference);
  for (const cost of actor.resourceCosts) {
    const blocked = { ...actor, resources: actor.resources.map(resource => resource.id === cost.resourceId ? { ...resource, current: 0 } : resource) };
    await assert.rejects(new CombatResolutionService(dice()).resolveAttack({ actor: blocked, target: target() }));
  }
});

test('Hagelsturm halves both typed components after a successful save, then applies cold resistance', async () => {
  const actor = actorFor('hagelsturm', 5);
  assert.deepEqual(actor.selectedAction.effects.filter(effect => effect.type === 'damage').map(effect => [effect.formula, effect.damageType]), [['5d6','Wucht'],['4d6','Kälte']]);
  assert.equal(getCombatDamagePreview(actor).average, 31.5);
  assert.match(getCharacterSpellPresentation(createCatalogSpell('elementarismus-hagelsturm', { revision: 1 })).damage.label, /4W6 \+ 3W6/);
  const victim = target(); victim.damageAffinities = [{ damageType: 'Kälte', response: 'resistant', magicScope: 'any' }];
  const result = await new CombatResolutionService(dice(true)).resolveAttack({ actor, target: victim });
  const damage = result.effectResults.filter(result => result.effect.type === 'damage');
  assert.equal(damage.length, 2);
  assert.equal(damage[0].amount, 5);
  assert.equal(damage[1].amount, 5);
  assert.equal(damage[1].applied.incoming, 2);
  assert.equal(result.targetSnapshot.hitPointsBefore - result.targetSnapshot.hitPointsAfter, 7);
  assert.match(renderCombatEvaluation({ resolution: result }), /5d6 \+ 4d6/);
  assertCostsPaid(result, actor);
});

test('Herdhauch, Feuerdämpfung and Frostsprengung report effects without dealing creature damage', async () => {
  for (const slug of ['herdhauch','feuerdaempfung','frostsprengung']) {
    const actor = actorFor(slug);
    assert.equal(getCombatDamagePreview(actor), null, slug);
    const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: target() });
    assert.equal(result.damage, null, slug);
    assert.equal(result.targetSnapshot.hitPointsAfter, result.targetSnapshot.hitPointsBefore, slug);
    assert.ok(result.effectResults.some(result => result.effect.type === 'narrative' && result.applied === false));
    if (slug !== 'herdhauch') assert.equal(result.effectResults[0].amount, 11);
    assertCostsPaid(result, actor);
    const rendered = renderCombatEvaluation({ resolution: result });
    assert.match(rendered, /Mit der Spielleitung auflösen/);
    assert.match(rendered, /Zauberhandlung verbucht/);
    assert.match(combatNarrationInternals.fallbackNarration({ actor:'Elementarist', target:'Ziel', weapon:actor.weapon.name, attack:result.attack, effectResults:result.effectResults }), /Spielleitung/);
  }
});

test('announced Brandkreis charges only on completion, never during preparation', async () => {
  let actor = actorFor('grosser-brandkreis');
  const service = new CombatResolutionService(dice());
  const first = await service.resolveAttack({ actor, target: target() }, { rulePeriods: { comment: 'preparation' } });
  assert.equal(first.actionType, 'channeling');
  assert.deepEqual(first.resourceCosts, []);
  assert.equal(first.damage, null);
  actor = { ...actor, channeling: first.actorChannelingSnapshot.after };
  await assert.rejects(service.resolveAttack({ actor, target: target() }, { rulePeriods: { comment: 'preparation' } }));
  const final = await service.resolveAttack({ actor, target: target() }, { rulePeriods: { comment: 'completion' } });
  assert.ok(final.damage);
  assertCostsPaid(final, actor);
});
