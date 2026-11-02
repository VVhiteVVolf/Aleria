import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { BLOODLINE_TRAIT_DEFINITIONS, BLOODLINE_TRAIT_ORIGINS, getBloodlineTraitOrigin } from '../modules/character-development/development-bloodline-traits.js';
import { previewCharacterLevelUp, createCharacterLevelUpPlan } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile, getSpellcastingValues, getMaximumHitPoints, getSavingThrowTotal, getSkillTotal } from '../modules/combat/combat-profile-model.js';
import { getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { renderDevelopmentTraits } from '../modules/character-development/development-ui.js';
import { createCharacterArchiveProfileItem } from '../modules/character-archive/character-archive-model.js';
import { sanitizeCharacterCombatProfile as serverSanitize } from '../../firebase/functions/src/generated/combat/combat-profile-model.js';

const root = new URL('../../', import.meta.url);
const bloodlines = DEVELOPMENT_TRAITS.filter(trait => getBloodlineTraitOrigin(trait.id));
const base = () => sanitizeCharacterCombatProfile({ identity: { ancestry: 'Mensch' }, hitPoints: { current: 2 }, progression: { level: 1 }, magic: { enabled: false } });
const choose = (...names) => previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: names.map(name => `development-trait-bluttraeger-${name}`) });

test('ten innate human bloodlines have real source pages and five origins of each kind', async () => {
  assert.equal(BLOODLINE_TRAIT_DEFINITIONS.length, 10);
  assert.equal(bloodlines.length, 10);
  assert.equal(BLOODLINE_TRAIT_ORIGINS.filter(origin => origin.kind === 'infernal').length, 5);
  assert.equal(BLOODLINE_TRAIT_ORIGINS.filter(origin => origin.kind === 'celestial').length, 5);
  for (const trait of bloodlines) {
    assert.ok(trait.tags.includes('Angeboren') && trait.tags.includes('Blutträger'));
    assert.match(trait.description, /Angeborenes menschliches Erbe/);
    assert.ok(trait.cost >= 4 && trait.cost <= 5);
    const origin = getBloodlineTraitOrigin(trait.id);
    for (const url of [origin.referenceUrl, origin.compatibilityUrl]) await access(new URL(url.slice(1), root));
  }
});

test('previous 104 definitions remain unchanged; authors examples distinguish direct and distant ancestry', async () => {
  const before = JSON.parse(await readFile(new URL('diagnostics/blood-carriers-20261102/catalog-before.json', root), 'utf8'));
  assert.equal(before.length, 104);
  assert.deepEqual(before.map(trait => DEVELOPMENT_TRAITS.find(current => current.id === trait.id)), before);
  const myriad = getBloodlineTraitOrigin('development-trait-bluttraeger-succubusspross').examples[0];
  const aradin = getBloodlineTraitOrigin('development-trait-bluttraeger-vampirspross').examples[0];
  assert.equal(myriad.name, 'Myriad Draig'); assert.match(myriad.reason, /Afallith/);
  assert.equal(aradin.name, 'Aradin Hyrmgarthr'); assert.match(aradin.reason, /Ursprung des Clans/);
});

test('bloodline bonuses work while humanity, classes, spells, resources and current HP stay intact', () => {
  const original = base();
  for (const [id, name, , mechanics] of BLOODLINE_TRAIT_DEFINITIONS) {
    const result = previewCharacterLevelUp(original, { targetLevel: 1, traitIds: [`development-trait-${id}`] });
    assert.equal(result.ready, true, name);
    assert.deepEqual(result.profile.identity, original.identity, name);
    for (const key of ['templateSelections', 'weapons', 'armorItems', 'techniques', 'proficiencies', 'resources', 'magic', 'attributes', 'skills']) assert.deepEqual(result.profile[key], original[key], `${name}/${key}`);
    assert.equal(result.profile.hitPoints.current, 2);
    assert.equal(getSpellcastingValues(result.profile).attack - getSpellcastingValues(original).attack, mechanics.spellAttack || 0, name);
    assert.equal(getSpellcastingValues(result.profile).saveDc - getSpellcastingValues(original).saveDc, mechanics.spellSaveDc || 0, name);
    assert.equal(getMaximumHitPoints(result.profile) - getMaximumHitPoints(original), mechanics.maximumHitPoints || 0, name);
    for (const modifier of mechanics.skillModifiers || []) {
      const skill = original.skills.find(skill => getSkillIdentity(skill.name) === getSkillIdentity(modifier.name));
      assert.ok(skill, modifier.name);
      assert.equal(getSkillTotal(result.profile, skill) - getSkillTotal(original, skill), modifier.bonus, name);
    }
    for (const modifier of mechanics.saveAttributeModifiers || []) assert.equal(getSavingThrowTotal(result.profile, modifier.attributeKey) - getSavingThrowTotal(original, modifier.attributeKey), modifier.bonus, name);
    assert.deepEqual(serverSanitize(result.profile), sanitizeCharacterCombatProfile(result.profile), name);
  }
});

test('elemental inheritance protects the named damage types, never doubles resistance or adds sunlight weakness', () => {
  const flame = choose('flammenspross').profile, thunder = choose('donnerspross').profile;
  const damage = (profile, type) => applyTypedCombatDamage({ current: 30, maximum: 30 }, 8, profile, { damageType: type }).after.current;
  assert.equal(damage(flame, 'Feuer'), 26); assert.equal(damage(flame, 'fire'), 26);
  assert.equal(damage(flame, 'Kälte'), 22);
  assert.equal(damage(thunder, 'Blitz'), 26); assert.equal(damage(thunder, 'lightning'), 26);
  assert.equal(damage(thunder, 'Donner'), 22);
  const doubled = previewCharacterLevelUp(base(), { targetLevel: 1, traitIds: ['development-trait-bluttraeger-flammenspross', 'development-trait-feueraffinitaet'] });
  assert.equal(damage(doubled.profile, 'Feuer'), 26); assert.equal(doubled.balance.traitCost, 5);
  const vampire = choose('vampirspross').profile;
  assert.ok(!vampire.quirks[0].mechanics.damageAffinities?.some(affinity => affinity.response === 'vulnerable'));
});

test('bloodline filter explains innate ancestry and archival copies preserve that identity', () => {
  const preview = previewCharacterLevelUp(base(), { targetLevel: 1, traitGroup: 'bloodline', traitIds: ['development-trait-bluttraeger-vampirspross'] });
  assert.equal(preview.plan.traitGroup, 'bloodline');
  const markup = renderDevelopmentTraits(preview.plan);
  assert.equal((markup.match(/data-development-trait=/g) || []).length, 10);
  assert.equal((markup.match(/>Bestiarium ↗/g) || []).length, 10);
  assert.match(markup, /Abstammung wird nicht durch Training erworben/);
  assert.match(markup, /Aradin Hyrmgarthr/); assert.match(markup, /Myriad Draig/);
  const trait = bloodlines[0];
  const copy = createCharacterArchiveProfileItem({ kind: 'trait', name: trait.name, data: trait }, 'quirks');
  const profile = sanitizeCharacterCombatProfile({ ...base(), quirks: [copy] });
  assert.ok(profile.quirks[0].tags.includes('Angeboren'));
  assert.equal(profile.quirks[0].developmentTraitId, trait.id);
  assert.ok(createCharacterLevelUpPlan(profile).traitIds.includes(trait.id));
  assert.deepEqual(serverSanitize(profile), profile);
});

test('multiple proven inheritances stay selectable with a warning and a negative advisory balance', () => {
  const result = choose('vampirspross', 'succubusspross');
  assert.equal(result.ready, true); assert.ok(result.balance.remaining < 0);
  assert.ok(result.balance.warnings.some(warning => warning.includes('Mehrere Blutlinien')));
  assert.equal(result.profile.quirks.length, 2);
});
