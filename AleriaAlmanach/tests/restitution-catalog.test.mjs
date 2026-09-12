import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { listSpellCatalogEntries, createCatalogSpell, getSpellCatalogEntry, resolveCatalogSpellSnapshot } from '../modules/spell-catalog/spell-catalog.js';
import { buildSpellCatalogArchiveEntries } from '../modules/spell-catalog/spell-catalog-archive.js';
import { createCharacterArchiveProfileItem, normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';
import { createCharacterArchiveIndex, queryCharacterArchive } from '../modules/character-archive/character-archive-query.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { getCharacterSpellPresentation } from '../modules/characters/character-spell-presentation.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';

const entries = listSpellCatalogEntries({ catalog: 'restitution' });
const reference = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;
function actorFor(slug, castLevel) {
  const character = structuredClone(reference);
  character.id = 'restitution-test-caster'; character.name = 'Restitutionsgelehrte';
  character.combatProfile.progression.level = 20;
  const spell = createCatalogSpell(`restitution-${slug}`);
  character.combatProfile.magic.spells = [spell];
  const actor = resolveCombatProfile(character, { segmentKind: 'spell', actionId: `spell:${spell.id}`, castLevel });
  actor.resources = actor.resources.map(resource => ({ ...resource, current: resource.maximum }));
  return actor;
}
function target(current = 5, id = 'patient') {
  return resolveCombatProfile({ id, name: 'Patient', combatProfile: {
    hitPoints: { current, maximumOverride: 20 }, armorClass: { override: 10 }
  } });
}
function dice(total = 8) {
  return {
    async rollAttack() { throw new Error('Heilung benötigt keinen Angriffswurf.'); },
    async rollSavingThrow() { throw new Error('Direkte Heilung benötigt keinen Rettungswurf.'); },
    async rollDamage({ damageFormula, bonus, critical }) {
      assert.equal(bonus, 0, 'Rhiannons INT-Schadensbonus darf Heilung nicht erhöhen');
      assert.equal(critical, false);
      return { notation: damageFormula, dice: [3, 5], keptDice: [3, 5], total, modifier: bonus };
    }
  };
}

test('Restitution has 46 independent spells, 18 complete forms and existing optional icons', async () => {
  assert.equal(entries.length, 46);
  assert.equal(new Set(entries.map(entry => entry.id)).size, 46);
  assert.equal(entries.reduce((sum, entry) => sum + entry.forms.length, 0), 18);
  assert.equal(entries.filter(entry => entry.iconPath).length, 21);
  assert.equal(listSpellCatalogEntries().length, 120, 'legacy default is still Elemente');
  assert.equal(listSpellCatalogEntries({ catalog: 'elemente', revision: 1 }).length, 72);
  assert.deepEqual(listSpellCatalogEntries({ catalog: 'restitution', revision: 2 }), []);
  assert.equal(getSpellCatalogEntry('restitution-vollstaendige-restitution'), null);
  for (const entry of entries) {
    assert.ok(entry.effect && entry.limits && entry.requirements);
    if (entry.iconPath) await access(new URL(`../../${entry.iconPath}`, import.meta.url));
    for (const form of [entry, ...entry.forms]) {
      const spell = createCatalogSpell(entry.id, { level: form.level });
      assert.equal(spell.manaCost, getSpellManaCost(form.level));
      assert.deepEqual(spell.costs.filter(cost => cost.resourceId !== 'mana-focus').map(cost => cost.resourceId), form.actionIds);
      assert.ok(spell.effects.length);
      assert.equal(spell.effects.some(effect => effect.type === 'damage' || effect.type === 'remove-condition'), false);
      assert.ok(spell.effects.every(effect => effect.on === 'always'));
      assert.ok(spell.costs.filter(cost => cost.resourceId === 'special-action').every(cost => cost.scope === 'persistent'));
    }
  }
});

test('archive references survive learning and serialization without replacing a same-name personal spell', () => {
  const archive = buildSpellCatalogArchiveEntries().map(normalizeCharacterArchiveEntry);
  assert.equal(archive.filter(entry => entry.data.school === 'Restitution').length, 46);
  const template = archive.find(entry => entry.data.catalogReference?.id === 'restitution-heilende-hand');
  const index = createCharacterArchiveIndex(archive);
  assert.equal(queryCharacterArchive(index, { kind: 'spell', search: 'restitution' }).length, 46);
  assert.deepEqual(queryCharacterArchive(index, { kind: 'spell', search: 'restitution-heilende-hand' }).map(entry => entry.id), [template.id]);
  const learned = createCharacterArchiveProfileItem(template, 'magic.spells');
  assert.notEqual(learned.id, template.data.id);
  const own = { id: 'old-healing', name: 'Heilende Hand', level: 1, effects: [{ type: 'healing', amount: 3, on: 'always' }] };
  const profile = sanitizeCharacterCombatProfile(JSON.parse(JSON.stringify({ magic: { spells: [own, learned] } })));
  assert.equal(profile.magic.spells[0].catalogReference, undefined);
  assert.equal(profile.magic.spells[0].effects[0].amount, 3);
  assert.deepEqual(profile.magic.spells[1].catalogReference, { id: 'restitution-heilende-hand', revision: 1 });
  assert.equal(profile.magic.spells[1].id, learned.id);
  const missing = { ...own, catalogReference: { id: 'restitution-missing', revision: 9 } };
  assert.deepEqual(resolveCatalogSpellSnapshot(missing), missing);
});

test('Heilende Hand uses healing, caps overheal and pays the current mana and action once', async () => {
  const actor = actorFor('heilende-hand');
  assert.equal(getCombatDamagePreview(actor), null);
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: target(17) });
  const healing = result.effectResults.find(result => result.effect.type === 'healing');
  assert.equal(healing.amount, 8);
  assert.equal(healing.applied.restored, 3);
  assert.equal(result.targetSnapshot.hitPointsAfter, 20);
  assert.equal(result.damage, null);
  for (const cost of actor.resourceCosts) {
    const before = result.actorResourceSnapshot.before.find(resource => resource.id === cost.resourceId);
    const after = result.actorResourceSnapshot.after.find(resource => resource.id === cost.resourceId);
    assert.equal(before.current - after.current, cost.amount);
  }
  const rendered = renderCombatEvaluation({ resolution: result });
  assert.match(rendered, /Heilung/);
  assert.match(rendered, /\+3 TP/);
});

test('higher healing forms replace amounts, action costs and descriptions in combat and character presentation', async () => {
  const actor = actorFor('heilende-hand', 5);
  assert.equal(actor.selectedAction.effects[0].formula, '6d6');
  assert.deepEqual(actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['action',1],['special-action',1],['mana-focus',9]]);
  assert.equal(getCombatDamagePreview(actor), null);
  const text = getCharacterSpellPresentation(createCatalogSpell('restitution-heilende-hand'));
  assert.match(text.damage.label, /2W6 Heilung/);
  assert.match(text.higherForms.at(-1), /11 Mana.*7W6/);
  assert.match(text.catalogHref, /Magie\/restitution\/index.html#restitution-heilende-hand/);
  const big = actorFor('grosse-heilung');
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor: big, target: target(0) });
  assert.equal(result.effectResults.find(effect => effect.effect.type === 'healing').amount, 35);
  assert.equal(result.targetSnapshot.hitPointsAfter, 20);
});

test('Wundverschluss refuses zero HP while Lebensruf heals a still-living target without resetting resources', async () => {
  await assert.rejects(new CombatResolutionService(dice()).resolveAttack({ actor: actorFor('wundverschluss'), target: target(0) }), /mindestens 1/);
  const patient = target(0);
  const result = await new CombatResolutionService(dice(4)).resolveAttack({ actor: actorFor('lebensruf'), target: patient });
  assert.equal(result.targetSnapshot.hitPointsAfter, 4);
  assert.equal(result.targetResourceSnapshot, null, 'healing creates no target resource mutation');
  const dead = target(0);
  dead.conditions = [{ name: 'Tot', active: true }];
  await assert.rejects(new CombatResolutionService(dice()).resolveAttack({ actor: actorFor('lebensruf'), target: dead }), /bestätigten Tod/);
});

test('multi-target healing uses separate capped results and the shared continuation consumes costs once', async () => {
  const actor = actorFor('geteilte-heilung');
  assert.equal(actor.selectedAction.maximumTargets, 2);
  const service = new CombatResolutionService(dice(6));
  const first = await service.resolveAttack({ actor, target: target(5,'patient-a') });
  const second = await service.resolveAttack({ actor, target: target(19,'patient-b') }, {
    skipResourceCosts: true, skipSelfEffects: true, startedAction: first
  });
  assert.equal(first.targetSnapshot.hitPointsAfter, 11);
  assert.equal(second.targetSnapshot.hitPointsAfter, 20);
  assert.equal(second.resourceCosts.length, 0);
});

test('guided cleansing and timed wards do not silently delete states or apply permanent healing', async () => {
  for (const slug of ['gift-ausleiten', 'nachheilender-faden', 'lebenswacht', 'lebenspolster']) {
    const actor = actorFor(slug);
    const patient = target(7);
    const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: patient });
    assert.equal(result.targetSnapshot.hitPointsAfter, 7, slug);
    assert.ok(result.effectResults.some(result => result.effect.type === 'narrative'));
    assert.match(renderCombatEvaluation({ resolution: result }), /Spielleitung/);
  }
});

test('Schmerzlinderung offers its authored grade II instead of silently retaining the cantrip package', () => {
  const actor = actorFor('schmerzlinderung', 2);
  assert.equal(actor.selectedAction.castLevel, 2);
  assert.equal(actor.selectedAction.isCantrip, false);
  assert.equal(actor.selectedAction.compatible, true);
  assert.deepEqual(actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['action',1],['reaction',1],['mana-focus',4]]);
  assert.equal(actorFor('schmerzlinderung', 1).selectedAction.compatible, false);
});
