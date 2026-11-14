import test from 'node:test';
import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-20261112.js';
import { isExactDevelopmentTraitCatalogCopy } from '../modules/character-development/development-trait-revisions.js';
import { previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, normalizeCombatTrait, getArmorClass, getCombatInitiative,
  getCombatMovement, getSkillTotal, getMaximumHitPoints, getSavingThrowTotal, getSpellcastingValues } from '../modules/combat/combat-profile-model.js';
import * as server from '../../firebase/functions/src/generated/combat/combat-profile-model.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';

const trait = slug => DEVELOPMENT_TRAITS.find(entry => entry.id === `development-trait-${slug}`);
const base = () => sanitizeCharacterCombatProfile({ progression: { level: 1, development: { mode: 'purchase' } },
  hitPoints: { current: 3, temporary: 2 }, resources: [{ id: 'personal', name: 'Eigener Vorrat', current: 1, maximum: 6 }] });
const choose = (...slugs) => previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: slugs.map(slug => trait(slug).id) });
const skill = (profile, name) => getSkillTotal(profile, profile.skills.find(entry => getSkillIdentity(entry.name) === getSkillIdentity(name)));

test('every active trait uses mapless rules; historical movement remains an immutable revision input', () => {
  assert.equal(PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS.filter(entry => entry.mechanics.movement).length, 27);
  for (const entry of DEVELOPMENT_TRAITS) {
    assert.equal(entry.mechanics.movement, undefined, entry.name);
    assert.doesNotMatch(entry.description, /[+−-]\d+\s*m\s+Bewegung/, entry.name);
  }
});

test('Flinke Fuesse improves actual defense and acrobatics with a positive price and reversible selection', () => {
  const original = base(), result = choose('flink'), profile = result.profile;
  assert.equal(result.ready, true);
  assert.equal(getArmorClass(profile), getArmorClass(original) + 1);
  assert.equal(skill(profile, 'Akrobatik'), skill(original, 'Akrobatik') + 1);
  assert.equal(getCombatMovement(profile), getCombatMovement(original));
  assert.equal(result.balance.traitCost, 4);
  profile.quirks[0].active = false;
  assert.equal(getArmorClass(profile), getArmorClass(original));
  assert.equal(skill(profile, 'Akrobatik'), skill(original, 'Akrobatik'));
  const removed = previewCharacterLevelUp(result.profile, { targetLevel: 1, traitIds: [] }).profile;
  assert.equal(getArmorClass(removed), getArmorClass(original));
  assert.deepEqual(removed.resources, original.resources);
  assert.deepEqual(removed.hitPoints, original.hitPoints);
});

test('movement is interpreted by its cause while credible tradeoffs and purely negative habits remain', () => {
  const original = base(), hasty = choose('hastiger-schritt').profile;
  assert.equal(getCombatInitiative(hasty), getCombatInitiative(original) + 1);
  assert.equal(skill(hasty, 'Akrobatik'), skill(original, 'Akrobatik') - 1);
  const planted = choose('standfest').profile;
  assert.equal(getArmorClass(planted), getArmorClass(original) + 1);
  assert.equal(skill(planted, 'Akrobatik'), skill(original, 'Akrobatik') - 1);
  assert.deepEqual(trait('schneller-stoffwechsel').mechanics, {});
  assert.equal(getMaximumHitPoints(choose('schneller-stoffwechsel').profile), getMaximumHitPoints(original));
  for (const [slug, name] of [['marotte-rechthaberei', 'Überzeugen'], ['marotte-nestelnde-finger', 'Heimlichkeit']]) {
    const entry = trait(slug), profile = choose(slug).profile;
    assert.equal(entry.cost, -1);
    assert.equal(skill(profile, name), skill(original, name) - 1);
    assert.ok(entry.mechanics.skillModifiers.every(modifier => modifier.bonus < 0));
  }
});

test('ordinary strengths no longer force unrelated penalties and still pay for their actual effects', () => {
  for (const slug of ['gelehrt', 'silberzunge', 'konzentriert', 'robuste-haut', 'leiser-tritt', 'ruhiger-atem',
    'kraftvoller-griff', 'behutsame-haende', 'namenhueter', 'wissensdurst', 'unerschuetterliche-ruhe',
    'trockener-humor', 'marotte-notizdrang', 'marotte-kraeftemessen']) {
    const entry = trait(slug);
    assert.ok(entry.cost > 0, slug);
    for (const [key, value] of Object.entries(entry.mechanics)) {
      if (typeof value === 'number') assert.ok(value >= 0, `${slug}/${key}`);
      if (Array.isArray(value)) for (const modifier of value) if (modifier.bonus !== undefined) assert.ok(modifier.bonus >= 0, `${slug}/${key}`);
    }
  }
});

test('both exact historical catalog generations normalize to current rules while instance data survives', () => {
  for (const previous of PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS) {
    const stored = { ...structuredClone(previous), id: `personal-${previous.id}`, developmentTraitId: previous.id,
      icon: '/personal-icon.png', active: false };
    const revised = normalizeCombatTrait(stored), current = normalizeCombatTrait(trait(previous.id.replace('development-trait-', '')));
    assert.deepEqual(revised.mechanics, current.mechanics, previous.name);
    assert.deepEqual(revised.triggerRules, current.triggerRules, previous.name);
    assert.equal(revised.description, current.description, previous.name);
    assert.equal(revised.id, stored.id);
    assert.equal(revised.icon, stored.icon);
    assert.equal(revised.active, false);
    assert.deepEqual(normalizeCombatTrait(revised), revised);
    assert.equal(isExactDevelopmentTraitCatalogCopy(previous), true);
  }
});

test('personal mechanical changes, annotations and trigger variants never migrate by ID alone', () => {
  const previous = PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS.find(entry => entry.id === trait('flink').id);
  for (const change of [{ description: 'Persönlich vereinbarte Ausnahme.' }, { mechanics: { armorClass: -2, movement: 4 } },
    { triggerRules: [{ id: 'personal', phase: 'pre-roll', effects: { attackModifier: 2 } }] }]) {
    const stored = { ...structuredClone(previous), ...change }, revised = normalizeCombatTrait(stored);
    assert.deepEqual(revised.mechanics, { ...normalizeCombatTrait({ ...stored, id: 'unrelated' }).mechanics });
    assert.equal(revised.description, stored.description);
    assert.equal(isExactDevelopmentTraitCatalogCopy(stored), false);
  }
});

test('all revised rules and actual derived results agree with the generated server without touching resources', () => {
  const original = base();
  for (const previous of PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS) {
    const profile = sanitizeCharacterCombatProfile({ ...original, quirks: [previous] });
    const generated = server.sanitizeCharacterCombatProfile({ ...original, quirks: [previous] });
    assert.deepEqual(generated, profile, previous.name);
    for (const key of ['getArmorClass', 'getCombatInitiative', 'getCombatMovement', 'getMaximumHitPoints', 'getSpellcastingValues']) {
      const local = { getArmorClass, getCombatInitiative, getCombatMovement, getMaximumHitPoints, getSpellcastingValues }[key];
      assert.deepEqual(server[key](generated), local(profile), `${previous.name}/${key}`);
    }
    for (const name of ['Akrobatik', 'Heimlichkeit', 'Körperbeherrschung']) assert.equal(
      server.getSkillTotal(generated, generated.skills.find(entry => entry.name === name)), skill(profile, name));
    for (const attribute of ['strength', 'dexterity', 'constitution', 'wisdom']) assert.equal(
      server.getSavingThrowTotal(generated, attribute), getSavingThrowTotal(profile, attribute));
    assert.deepEqual(profile.resources, original.resources);
    assert.equal(profile.hitPoints.current, 3);
    assert.equal(profile.hitPoints.temporary, 2);
  }
});
