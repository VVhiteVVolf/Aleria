import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { EXPANSION_TALENT_DEFINITIONS } from '../modules/character-development/development-expansion-talents.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { SKILL_DEFINITIONS, getSkillIdentity } from '../modules/skill-checks/skill-definitions.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSavingThrowTotal, getCombatInitiative,
  getCombatMovement, getMaximumHitPoints, getEffectiveCombatAttribute, getPassivePerception,
  getArmorClass, getSpellcastingValues, resolveSavingThrowRollMode } from '../modules/combat/combat-profile-model.js';
import { getSkillRollContext } from '../modules/skill-checks/skill-resolution-service.js';
import { collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';
import { developmentTraitEffectSignature, developmentTraitNameKey } from './support/development-trait-distinctness.mjs';

const asTrait = ([id, name, description, mechanics, cost, extra = {}]) => ({
  id: `development-trait-${id}`, name, description, mechanics, cost,
  type: 'trait', active: true, triggerRules: extra.triggerRules || []
});
const entries = EXPANSION_TALENT_DEFINITIONS.map(asTrait);
const trait = id => entries.find(entry => entry.id === `development-trait-talent-${id}`);
const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const base = (score = 11, level = 5) => sanitizeCharacterCombatProfile({
  hitPoints: { current: 3, hitDie: 8 }, progression: { level },
  attributes: attributes.map(key => ({ key, score }))
});
const withTalent = (id, original = base()) => sanitizeCharacterCombatProfile({ ...original, quirks: [trait(id)] });
const context = (profile, skillId) => getSkillRollContext({ actor: { id: 'self', name: 'Testfigur' }, settings: { skillId } }, { actorProfile: { ...profile, characterId: 'self' } });
const skillTotal = (profile, skillId) => getSkillTotal(profile, profile.skills.find(skill => getSkillIdentity(skill.name) === skillId));

test('fifteen broad talents have new IDs, names and normalized effects against all 272 prior and 1061 archived definitions', async () => {
  const prior = JSON.parse(await readFile(new URL('../../diagnostics/standard-talents-abilities-20261106/before.json', import.meta.url), 'utf8')).traits;
  const archive = JSON.parse(await readFile(new URL('../../diagnostics/talents-quirks-abilities-20261106/existing-catalog.json', import.meta.url), 'utf8')).entries;
  assert.equal(prior.length, 272);
  assert.equal(archive.length, 1061);
  assert.equal(entries.length, 15);
  const names = new Set([...prior, ...archive].map(entry => developmentTraitNameKey(entry.name)));
  const signatures = new Set([...prior, ...archive].map(developmentTraitEffectSignature));
  const oldIds = new Set(prior.map(entry => entry.id));
  for (const entry of entries) {
    assert.equal(oldIds.has(entry.id), false, entry.id);
    assert.equal(names.has(developmentTraitNameKey(entry.name)), false, entry.name);
    assert.equal(signatures.has(developmentTraitEffectSignature(entry)), false, `${entry.name}: identical effect`);
    names.add(developmentTraitNameKey(entry.name));
    signatures.add(developmentTraitEffectSignature(entry));
    assert.ok(entry.cost >= 4 && entry.cost <= 6, entry.name);
  }
  const discarded = prior.filter(entry => entry.id.startsWith('development-trait-talent-'));
  assert.equal(discarded.length, 15);
  for (const entry of discarded) assert.equal(DEVELOPMENT_TRAITS.some(current => current.id === entry.id), false, entry.id);
});

test('attribute and broad skill packages affect the actual sheet totals at both modifier boundaries', () => {
  const expected = [
    ['athlet', 'strength', {}],
    ['akrobat', 'dexterity', {}],
    ['belesen', 'intelligence', { history: 1, religion: 1, 'arcane-kunde': 1, nature: 1 }],
    ['naturbursche', 'wisdom', { survival: 1, nature: 1, 'animal-handling': 1 }],
    ['redetalent', 'charisma', { persuasion: 2, deception: 1 }],
    ['feinmotoriker', 'dexterity', { 'sleight-of-hand': 2, 'body-control': 1 }]
  ];
  for (const score of [10, 11]) for (const [id, attribute, bonuses] of expected) {
    const plain = base(score), profile = withTalent(id, plain), modifierDelta = score === 11 ? 1 : 0;
    for (const key of attributes) assert.equal(getEffectiveCombatAttribute(profile, key).score,
      score + (key === attribute ? 1 : 0), `${id}/${key}/${score}`);
    for (const skill of SKILL_DEFINITIONS) assert.equal(skillTotal(profile, skill.id) - skillTotal(plain, skill.id),
      (bonuses[skill.id] || 0) + (skill.attributeKey === attribute ? modifierDelta : 0), `${id}/${skill.id}/${score}`);
    for (const key of attributes) assert.equal(getSavingThrowTotal(profile, key) - getSavingThrowTotal(plain, key),
      key === attribute ? modifierDelta : 0, `${id}/${key} save/${score}`);
    assert.deepEqual(profile.attributes, plain.attributes);
    assert.deepEqual(profile.skills, plain.skills);
  }
});

test('Athlet, Akrobat and Wachsam give only their own public skill check advantage and deactivate cleanly', () => {
  for (const [id, ownSkill] of [['athlet', 'athletics'], ['akrobat', 'acrobatics'], ['wachsam', 'perception']]) {
    const profile = withTalent(id);
    for (const skill of SKILL_DEFINITIONS) assert.equal(context(profile, skill.id).rollMode,
      skill.id === ownSkill ? 'advantage' : 'normal', `${id}/${skill.id}`);
    assert.equal(context(profile, 'save:constitution').rollMode, 'normal', `${id}/save`);
    const effects = mergeCombatRuleEffects(collectApplicableCombatRules({
      phase: 'pre-roll', actionKind: 'weapon', state: { actorProfile: profile, skillId: ownSkill },
      sources: [{ actorId: 'self', profile, relationToActor: 'self', relationToTarget: 'enemy' }]
    }));
    assert.equal(effects.rollMode, 'normal', `${id}/weapon`);
    profile.quirks[0].active = false;
    assert.equal(context(profile, ownSkill).rollMode, 'normal', `${id}/inactive`);
  }
  const plain = base(), watchful = withTalent('wachsam', plain);
  assert.equal(getCombatInitiative(watchful), getCombatInitiative(plain) + 2);
  assert.equal(getPassivePerception(watchful), getPassivePerception(plain));
});

test('four forms of resilience use their own saving throw advantage with normal cancellation', () => {
  for (const [id, advantageAttribute, flatAttribute] of [
    ['willensstark', 'wisdom', 'charisma'], ['widerstandsfaehig', 'constitution', 'strength'],
    ['scharfer-verstand', 'intelligence', ''], ['anfuehrer', 'charisma', '']
  ]) {
    const plain = base(), profile = withTalent(id, plain);
    for (const key of attributes) {
      assert.equal(resolveSavingThrowRollMode(profile, key), key === advantageAttribute ? 'advantage' : 'normal', `${id}/${key}`);
      assert.equal(getSavingThrowTotal(profile, key) - getSavingThrowTotal(plain, key), key === flatAttribute ? 1 : 0);
    }
    assert.equal(resolveSavingThrowRollMode(profile, advantageAttribute, 'disadvantage'), 'normal');
    assert.equal(context(profile, `save:${advantageAttribute}`).rollMode, 'advantage');
    profile.quirks[0].active = false;
    assert.equal(resolveSavingThrowRollMode(profile, advantageAttribute), 'normal');
  }
  const plain = base();
  assert.equal(skillTotal(withTalent('scharfer-verstand', plain), 'investigation'), skillTotal(plain, 'investigation') + 2);
  assert.equal(skillTotal(withTalent('scharfer-verstand', plain), 'history'), skillTotal(plain, 'history') + 1);
  for (const skillId of ['persuasion', 'intimidation']) assert.equal(skillTotal(withTalent('anfuehrer', plain), skillId), skillTotal(plain, skillId) + 1);
});

test('Ausdauernd scales through constitution and fixed HP totals retain priority without filling current HP', () => {
  for (const level of [1, 5, 12]) for (const score of [10, 11]) {
    const plain = base(score, level), profile = withTalent('ausdauernd', plain);
    assert.equal(getMaximumHitPoints(profile) - getMaximumHitPoints(plain), 4 + (score === 11 ? level : 0));
    assert.equal(profile.hitPoints.current, 3);
    assert.deepEqual(profile.hitPoints, plain.hitPoints);
    profile.hitPoints.maximumOverride = 47;
    assert.equal(getMaximumHitPoints(profile), 47);
  }
});

test('Alleskoenner improves all twenty skills and Kundschafter keeps its full exploration package', () => {
  const plain = base(), allrounder = withTalent('alleskoenner', plain), scout = withTalent('kundschafter', plain);
  for (const skill of SKILL_DEFINITIONS) {
    assert.equal(skillTotal(allrounder, skill.id), skillTotal(plain, skill.id) + 1, skill.id);
    assert.equal(skillTotal(scout, skill.id) - skillTotal(plain, skill.id),
      ({ stealth: 2, perception: 1, survival: 1 })[skill.id] || 0, skill.id);
  }
  assert.equal(getArmorClass(allrounder), getArmorClass(plain));
  for (const attribute of attributes) {
    assert.equal(context(allrounder, `attribute:${attribute}`).skill.modifier, context(plain, `attribute:${attribute}`).skill.modifier + 1);
    assert.equal(context(allrounder, `save:${attribute}`).skill.modifier, context(plain, `save:${attribute}`).skill.modifier);
  }
  assert.equal(getCombatMovement(scout), getCombatMovement(plain) + 1);
});

test('Magiebegabt improves only existing spell values and never grants access, resources or actions', () => {
  for (const enabled of [false, true]) {
    const original = base();
    const plain = sanitizeCharacterCombatProfile({ ...original, magic: { ...original.magic, enabled } });
    for (const resource of plain.resources) resource.current = Math.min(resource.current, 1);
    const profile = withTalent('magiebegabt', plain);
    assert.equal(getSpellcastingValues(profile).attack, getSpellcastingValues(plain).attack + 1);
    assert.equal(getSpellcastingValues(profile).saveDc, getSpellcastingValues(plain).saveDc + 1);
    assert.deepEqual(profile.magic, plain.magic);
    assert.deepEqual(profile.resources, plain.resources);
    assert.deepEqual(profile.techniques, plain.techniques);
    profile.magic.spellAttackOverride = 9; profile.magic.spellSaveDcOverride = 16;
    assert.deepEqual(getSpellcastingValues(profile), { attack: 9, saveDc: 16 });
  }
});

test('all broad talents preserve stored base values, training, possessions and resources and reverse when inactive', () => {
  const plain = base();
  for (const entry of entries) {
    const profile = sanitizeCharacterCombatProfile({ ...plain, quirks: [entry] });
    for (const key of ['attributes', 'skills', 'savingThrows', 'weapons', 'armorItems', 'resources', 'hitPoints', 'techniques', 'templateSelections', 'identity', 'magic'])
      assert.deepEqual(profile[key], plain[key], `${entry.name}/${key}`);
    profile.quirks[0].active = false;
    for (const skill of SKILL_DEFINITIONS) assert.equal(skillTotal(profile, skill.id), skillTotal(plain, skill.id), entry.name);
    assert.equal(getCombatInitiative(profile), getCombatInitiative(plain), entry.name);
    assert.equal(getCombatMovement(profile), getCombatMovement(plain), entry.name);
    assert.equal(getMaximumHitPoints(profile), getMaximumHitPoints(plain), entry.name);
    assert.deepEqual(getSpellcastingValues(profile), getSpellcastingValues(plain), entry.name);
  }
});

test('each replacement talent has its own new PNG and WebP rather than a discarded talent icon', async () => {
  for (const [id] of EXPANSION_TALENT_DEFINITIONS) {
    await access(new URL(`../assets/development-traits/${id}.png`, import.meta.url));
    await access(new URL(`../assets/development-traits/web/${id}.webp`, import.meta.url));
  }
});
