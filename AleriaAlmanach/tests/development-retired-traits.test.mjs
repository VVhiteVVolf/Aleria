import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { RETIRED_DEVELOPMENT_TRAIT_IDS, getRetiredDevelopmentTrait, getOwnedRetiredDevelopmentTraits } from '../modules/character-development/development-retired-traits.js';
import { sanitizeCharacterCombatProfile, getSkillTotal } from '../modules/combat/combat-profile-model.js';
import { createCharacterLevelUpPlan, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { applyDevelopmentChoices, getDevelopmentSummary } from '../modules/character-development/development-purchases.js';
import { renderDevelopmentTraits, updateDevelopmentSelection } from '../modules/character-development/development-ui.js';
import { handleDevelopmentAction, renderDevelopmentSelections } from '../modules/character-development/development-overview.js';

const before = JSON.parse(await readFile(new URL('../../diagnostics/standard-talents-abilities-20261106/before.json', import.meta.url), 'utf8'));
const old = before.traits.find(entry => entry.id === 'development-trait-talent-knotengefuehl');
const personal = cost => ({ ...structuredClone(old), id: 'personal-archive-instance', developmentTraitId: old.id,
  name: '<Persönliche Knotenschule>', ...(cost == null ? {} : { cost }),
  mechanics: { skillModifiers: [{ name: 'Athletik', bonus: 4 }] } });
const profile = entry => sanitizeCharacterCombatProfile({
  hitPoints: { current: 8, maximumOverride: 20 }, quirks: entry ? [entry] : [],
  attributes: ['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(key => ({ key, score: 10 }))
});

test('only the thirty exact retired identities have metadata and none is restored to the active catalog', () => {
  assert.deepEqual([...RETIRED_DEVELOPMENT_TRAIT_IDS].sort(), [...before.retiredIds].sort());
  for (const id of RETIRED_DEVELOPMENT_TRAIT_IDS) {
    const metadata = getRetiredDevelopmentTrait(id);
    assert.deepEqual(Object.keys(metadata).sort(), ['cost','id','name']);
    assert.equal(DEVELOPMENT_TRAITS.some(entry => entry.id === id), false);
  }
  assert.equal(getRetiredDevelopmentTrait('development-trait-marotte-notizdrang'), null);
  assert.equal(getRetiredDevelopmentTrait({ id: 'unrelated', name: old.name }), null);
});

test('owned archive references preserve personal mechanics and stored cost through normalization, with exact historical fallback', () => {
  const owned = profile(personal(7));
  assert.equal(owned.quirks[0].cost, 7);
  assert.equal(getDevelopmentSummary(owned).traitCost, 7);
  assert.equal(getSkillTotal(owned, owned.skills.find(entry => entry.name === 'Athletik')), 4);
  assert.deepEqual(getOwnedRetiredDevelopmentTraits(owned)[0].mechanics, owned.quirks[0].mechanics);
  assert.equal(getDevelopmentSummary(profile(personal(0))).traitCost, 0);
  const fallback = personal(); delete fallback.cost;
  assert.equal(getDevelopmentSummary(profile(fallback)).traitCost, old.cost);
  assert.equal(getDevelopmentSummary(profile({ ...fallback, active: false })).traitCost, 0);
  const raw = profile({ ...old, cost: 9 });
  assert.equal(getDevelopmentSummary(raw).traitCost, 9);
});

test('default plans and the real preview retain old copies and their cost while explicit unchecked choices deactivate only the copy', () => {
  const owned = profile(personal(7)), original = structuredClone(owned);
  const plan = createCharacterLevelUpPlan(owned);
  assert.ok(plan.traitIds.includes(old.id));
  plan.targetLevel = owned.progression.level;
  assert.deepEqual(previewCharacterLevelUp(owned, plan).profile.quirks, owned.quirks);
  const unchanged = applyDevelopmentChoices(owned, plan);
  assert.deepEqual(unchanged.errors, []);
  assert.deepEqual(unchanged.profile.quirks, owned.quirks);
  assert.equal(unchanged.balance.traitCost, 7);
  updateDevelopmentSelection(plan, { dataset: { developmentTrait: old.id }, checked: false });
  const disabled = applyDevelopmentChoices(owned, plan);
  assert.equal(disabled.profile.quirks[0].active, false);
  assert.equal(disabled.balance.traitCost, 0);
  assert.deepEqual({ ...disabled.profile.quirks[0], active: true }, owned.quirks[0]);
  updateDevelopmentSelection(plan, { dataset: { developmentTrait: old.id }, checked: true });
  const restored = applyDevelopmentChoices(disabled.profile, plan);
  assert.deepEqual(restored.profile.quirks, owned.quirks);
  assert.equal(restored.balance.traitCost, 7);
  assert.deepEqual(owned, original);
  assert.deepEqual(restored.profile.hitPoints, owned.hitPoints);
});

test('retired IDs cannot be newly selected and lookalike personal entries do not become grandfathered', () => {
  const fresh = profile();
  const plan = createCharacterLevelUpPlan(fresh); plan.traitIds = [old.id];
  const result = applyDevelopmentChoices(fresh, plan);
  assert.match(result.errors[0], /Unbekannter Trait/);
  assert.deepEqual(result.profile.quirks, []);
  const lookalike = profile({ id: 'free-personal-trait', name: old.name, mechanics: old.mechanics });
  assert.deepEqual(getOwnedRetiredDevelopmentTraits(lookalike), []);
  assert.equal(getDevelopmentSummary(lookalike).traitCost, 0);
});

test('the shared picker shows only owned legacy copies with a safe checkbox and resets preserve original active choices', () => {
  const owned = profile(personal(7)), plan = createCharacterLevelUpPlan(owned);
  const html = renderDevelopmentTraits(plan, owned);
  assert.match(html, /Gespeicherter Altbestand/);
  assert.match(html, /&lt;Persönliche Knotenschule&gt;/);
  assert.ok(html.includes(`data-development-trait="${old.id}" checked`));
  assert.match(html, /7 P · Altbestand/);
  assert.match(renderDevelopmentSelections(plan, owned), /Altbestand/);
  plan.traitIds = [];
  handleDevelopmentAction(plan, owned, 'reset-choices');
  assert.ok(plan.traitIds.includes(old.id));
  const fresh = profile(), freshPlan = createCharacterLevelUpPlan(fresh);
  assert.equal(renderDevelopmentTraits(freshPlan, fresh).includes(old.id), false);
  assert.equal(renderDevelopmentTraits(freshPlan, fresh).includes('Gespeicherter Altbestand'), false);
});
