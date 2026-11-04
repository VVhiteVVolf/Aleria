import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { THERIANTHROPY_TRAIT_DEFINITIONS, SYMBIOSIS_TRAIT_DEFINITIONS, TRANSFORMATION_TRAIT_ORIGINS, getTransformationTraitOrigin } from '../modules/character-development/development-theriantrophie-traits.js';
import { previewCharacterLevelUp, createCharacterLevelUpPlan } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSavingThrowTotal, getMaximumHitPoints, getPassivePerception, resolveCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { renderDevelopmentTraits } from '../modules/character-development/development-ui.js';
import { createCharacterArchiveProfileItem } from '../modules/character-archive/character-archive-model.js';
import { sanitizeCharacterCombatProfile as serverSanitize } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { getDevelopmentTraitTestBatches } from './support/development-trait-batches.mjs';
import { assertDevelopmentTraitSnapshotPreserved } from './support/development-trait-snapshot.mjs';

const root = new URL('../../', import.meta.url);
const definitions = [...THERIANTHROPY_TRAIT_DEFINITIONS, ...SYMBIOSIS_TRAIT_DEFINITIONS];
const ids = definitions.map(([id]) => `development-trait-${id}`);
const base = () => sanitizeCharacterCombatProfile({ identity: { ancestry: 'Mensch' }, hitPoints: { current: 2 }, progression: { level: 1, development: { mode: 'purchase' } } });

test('Zatrach traits always name the beast and distinguish curse from follower blessing', () => {
  assert.equal(THERIANTHROPY_TRAIT_DEFINITIONS.length, 8);
  for (const form of ['Werwolf', 'Werbär', 'Wereber', 'Werluchs']) {
    const traits = THERIANTHROPY_TRAIT_DEFINITIONS.filter(([, name]) => name.includes(`(${form})`));
    assert.equal(traits.length, 2);
    assert.ok(traits.some(([, name, description]) => name.endsWith('Fluchform') && description.includes('Kontrollverlust')));
    assert.ok(traits.some(([, name, description]) => name.endsWith('Jüngersegen') && description.includes('erhaltenem Verstand')));
    for (const [id, name] of traits) {
      assert.ok(name.startsWith(`Zatracher Theriantrophie (${form})`));
      const origin = getTransformationTraitOrigin(`development-trait-${id}`);
      assert.equal(origin.kind, 'therianthropy');
      assert.equal(DEVELOPMENT_TRAITS.find(trait => trait.id === origin.id).tags.includes('Angeboren'), false);
    }
  }
});

test('symbiosis names real clans and animals and reuses their actual emblems', async () => {
  assert.equal(SYMBIOSIS_TRAIT_DEFINITIONS.length, 4);
  for (const origin of TRANSFORMATION_TRAIT_ORIGINS.filter(origin => origin.kind === 'symbiosis')) {
    const trait = DEVELOPMENT_TRAITS.find(trait => trait.id === origin.id);
    assert.equal(trait.name, `Silvanische Symbiose der ${origin.clanName} (${origin.animal})`);
    assert.ok(trait.tags.includes('Angeboren') && !trait.tags.includes('Blutträger'));
    const family = FAMILY_REGISTRY.find(family => family.id === origin.familyId);
    assert.ok(family, origin.clanName);
    assert.ok(family.family.houses.some(house => `/Stammbäume/${house.emblem}` === origin.clanEmblem));
    await access(new URL(origin.clanEmblem.slice(1), root));
  }
  assert.equal(getTransformationTraitOrigin('development-trait-symbiose-varulv-wolf').animal, 'Wolf');
  assert.equal(getTransformationTraitOrigin('development-trait-symbiose-haig-baer').confidence, 'rare-unconfirmed-tradition');
  assert.ok(getTransformationTraitOrigin('development-trait-symbiose-diuid-baer').lineageId === getTransformationTraitOrigin('development-trait-symbiose-haig-baer').lineageId);
});

test('module and clan sources remain authoritative; previous 114 definitions are exact or explicitly revised by the balance manifest', async () => {
  const before = JSON.parse(await readFile(new URL('diagnostics/theriantrophie-traits-20261102/catalog-before.json', root), 'utf8'));
  assert.equal(before.length, 114);
  assertDevelopmentTraitSnapshotPreserved(before);
  const source = JSON.parse(await readFile(new URL('diagnostics/theriantrophie-traits-20261102/source-review.json', root), 'utf8'));
  assert.ok(source.moduleText.includes('Symbiosis Animalis Sacra'));
  assert.ok(source.moduleText.includes('Tierkommunikation') && source.moduleText.includes('Urform'));
  assert.ok(source.moduleText.includes('nicht übertragbar'));
  assert.equal(TRANSFORMATION_TRAIT_ORIGINS.filter(origin => origin.sourceBasis === 'authored-variant').length, 4);
});

test('passive baselines affect only declared values without auto-transformation, equipment, spells or healing', () => {
  const original = base();
  for (const [id, name, , mechanics] of definitions) {
    const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: [`development-trait-${id}`] });
    assert.equal(result.ready, true, name);
    for (const key of ['identity', 'templateSelections', 'weapons', 'armorItems', 'techniques', 'abilities', 'magic', 'resources', 'combat', 'attributes', 'skills']) assert.deepEqual(result.profile[key], original[key], `${name}/${key}`);
    assert.equal(result.profile.hitPoints.current, 2);
    assert.equal(getMaximumHitPoints(result.profile) - getMaximumHitPoints(original), mechanics.maximumHitPoints || 0, name);
    const perceptionBonus = (mechanics.skillModifiers || []).filter(modifier => getSkillIdentity(modifier.name) === getSkillIdentity('Wahrnehmung')).reduce((sum, modifier) => sum + modifier.bonus, 0);
    assert.equal(getPassivePerception(result.profile) - getPassivePerception(original), (mechanics.passivePerception || 0) + perceptionBonus, name);
    assert.equal(resolveCharacterCombatProfile({ combatProfile: result.profile }).initiative - resolveCharacterCombatProfile({ combatProfile: original }).initiative, mechanics.initiative || 0, name);
    for (const modifier of mechanics.skillModifiers || []) {
      const skill = original.skills.find(skill => getSkillIdentity(skill.name) === getSkillIdentity(modifier.name));
      assert.ok(skill, modifier.name);
      assert.equal(getSkillTotal(result.profile, skill) - getSkillTotal(original, skill), modifier.bonus, name);
    }
    for (const modifier of mechanics.saveAttributeModifiers || []) assert.equal(getSavingThrowTotal(result.profile, modifier.attributeKey) - getSavingThrowTotal(original, modifier.attributeKey), modifier.bonus, name);
    assert.deepEqual(serverSanitize(result.profile), sanitizeCharacterCombatProfile(result.profile), name);
  }
});

test('filters explain control and inherited grades; source and clan links are visible', () => {
  for (const [group, count] of [['therianthropy', 8], ['symbiosis', 4]]) {
    const preview = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: group, traitIds: [ids[0]] });
    assert.equal(preview.plan.traitGroup, group);
    const markup = renderDevelopmentTraits(preview.plan);
    assert.equal((markup.match(/data-development-trait=/g) || []).length, count);
    assert.equal((markup.match(/>Modul ↗/g) || []).length, count);
    if (group === 'symbiosis') {
      assert.match(markup, /Tierkommunikation/); assert.match(markup, /Urform/);
      assert.equal((markup.match(/class="development-clan-emblem"/g) || []).length, 4);
      assert.match(markup, /Clanname allein vergibt diese Fähigkeiten nicht/);
    } else assert.match(markup, /Wähle die passende Ausprägung je Tier/);
    assert.deepEqual(preview.plan.traitIds, [ids[0]]);
  }
});

test('contradictory modes and repeated bear lineage receive explicit advisory warnings', () => {
  const mixed = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ['development-trait-theriantrophie-werwolf-fluch', 'development-trait-theriantrophie-werwolf-segen'], development: { startingPoints: 0 } });
  assert.equal(mixed.ready, true); assert.ok(mixed.balance.remaining < 0);
  assert.ok(mixed.balance.warnings.some(warning => warning.includes('alternative Ausprägungen')));
  const bears = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ['development-trait-symbiose-diuid-baer', 'development-trait-symbiose-haig-baer'] });
  assert.ok(bears.balance.warnings.some(warning => warning.includes('Mhathain-Linie')));
  assert.equal(bears.ready, true);
});

test('archive copies retain animal/clan status and catalogue growth never silently enlarges character storage', () => {
  for (const id of ids) {
    const trait = DEVELOPMENT_TRAITS.find(trait => trait.id === id);
    const copy = createCharacterArchiveProfileItem({ kind: 'trait', name: trait.name, data: trait }, 'quirks');
    const profile = sanitizeCharacterCombatProfile({ ...base(), quirks: [copy] });
    assert.equal(profile.quirks[0].name, trait.name);
    assert.equal(profile.quirks[0].tags, trait.tags);
    assert.ok(createCharacterLevelUpPlan(profile).traitIds.includes(trait.id));
  }
  assert.deepEqual(getDevelopmentTraitTestBatches().flat().map(trait => trait.id), DEVELOPMENT_TRAITS.map(trait => trait.id));
  const result = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: DEVELOPMENT_TRAITS.map(trait => trait.id) });
  assert.ok(DEVELOPMENT_TRAITS.length > 120);
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(error => error.includes('120 Merkmale')));
});
