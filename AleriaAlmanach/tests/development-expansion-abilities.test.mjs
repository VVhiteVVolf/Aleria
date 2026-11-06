import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EXPANSION_ABILITY_DEFINITIONS } from '../modules/character-development/development-expansion-abilities.js';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { sanitizeCharacterCombatProfile, getArmorClass, getCombatInitiative, getSavingThrowTotal,
  getSpellcastingValues, getWeaponAttackModifier, getWeaponDamageModifier, getProficiencyBonus } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService, getCombatRollContext } from '../modules/combat/combat-resolution-service.js';
import { collectApplicableCombatRules, mergeCombatRuleEffects } from '../modules/combat/combat-trigger-rules.js';
import { getSkillRollContext } from '../modules/skill-checks/skill-resolution-service.js';
import { reviewDevelopmentTraitBalance } from '../modules/character-development/development-balance-review.js';
import { developmentTraitEffectSignature as signature, developmentTraitNameKey } from './support/development-trait-distinctness.mjs';
const asTrait = ([id, name, description, mechanics, cost, extra = {}]) => ({ id: `development-trait-${id}`, name, description, mechanics, cost, active: true, type: 'trait', triggerRules: extra.triggerRules || [] });
const trait = id => asTrait(EXPANSION_ABILITY_DEFINITIONS.find(entry => entry[0] === `faehigkeit-${id}`));
const base = () => sanitizeCharacterCombatProfile({ hitPoints: { current: 20, maximumOverride: 20 },
  attributes: ['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(key => ({ key, score: 10 })) });
const profile = id => ({ ...sanitizeCharacterCombatProfile({ ...base(), quirks: id ? [trait(id)] : [] }), characterId: 'self' });
const fighter = (id, abilityId = '', weaponType = 'sword') => resolveCombatProfile({ id, name: id, combatProfile: {
  ...base(), quirks: abilityId ? [trait(abilityId)] : [],
  weapons: [{ id: 'weapon', name: 'Prüfwaffe', equipped: true, proficient: true, weaponType, damageFormula: '1d6', damageType: 'Hieb' }]
} });
const effects = (owner, actor, phase, recipient = 'actor', actionKind = actor.profileActionKind, extra = {}) => mergeCombatRuleEffects(collectApplicableCombatRules({
  phase, actionKind, state: { actorProfile: actor, targetProfile: recipient === 'target' ? owner : fighter('other'), ...extra },
  sources: [{ actorId: owner.characterId, profile: owner, relationToActor: recipient === 'actor' ? 'self' : 'enemy', relationToTarget: recipient === 'target' ? 'self' : 'enemy' }]
}));

test('fifteen ordinary RPG passives have new IDs, names and normalized effects compared with all 272 previous and 1061 archived entries', async () => {
  const prior = JSON.parse(await readFile(new URL('../../diagnostics/standard-talents-abilities-20261106/abilities-a/prior-272-catalog.json',import.meta.url),'utf8')).entries;
  const archive = JSON.parse(await readFile(new URL('../../diagnostics/talents-quirks-abilities-20261106/existing-catalog.json',import.meta.url),'utf8')).entries;
  assert.equal(prior.length,272); assert.equal(archive.length,1061); assert.equal(EXPANSION_ABILITY_DEFINITIONS.length,15);
  const names = new Set([...prior,...archive].map(e=>developmentTraitNameKey(e.name))), signatures = new Set([...prior,...archive].map(signature));
  for(const entry of EXPANSION_ABILITY_DEFINITIONS.map(asTrait)) {
    assert.equal(names.has(developmentTraitNameKey(entry.name)),false,entry.name);
    assert.equal(signatures.has(signature(entry)),false,`${entry.name}: identical mechanics`);
    names.add(developmentTraitNameKey(entry.name));signatures.add(signature(entry));
    assert.ok(entry.cost >= 1 && entry.cost <= 6);
  }
});

test('melee and ranged training affect attacks across weapon families and authored throwing techniques, never spell attacks', () => {
  for(const id of ['nahkampftraining','fernkampftraining']) {
    for(const weaponType of ['unarmed','sword','dagger','axe','mace','spear','polearm','staff','shield','improvised','natural','bow','crossbow','firearm']) {
      const actor = fighter('self',id,weaponType), ranged = ['bow','crossbow','firearm'].includes(weaponType);
      const expected = ranged === (id==='fernkampftraining') ? 1 : 0;
      assert.equal(getCombatRollContext(actor,fighter('enemy')).preRollEffects.attackModifier,expected,`${id}/${weaponType}`);
      assert.equal(effects(actor,{...actor,profileActionKind:'technique'},'pre-roll').attackModifier,expected);
      assert.equal(effects(actor,{...actor,profileActionKind:'spell',actionResolutionMode:'spell-attack'},'pre-roll').attackModifier,0);
    }
    const thrown = fighter('self',id,'spear');thrown.weapon.attackRange='ranged';thrown.profileActionKind='technique';
    assert.equal(effects(thrown,thrown,'pre-roll').attackModifier,id==='fernkampftraining'?1:0);
  }
});

test('unarmed combat improves attack and damage only for unarmed weapons and never grants extra actions', () => {
  for(const weaponType of ['unarmed','sword','natural','bow']) {
    const actor=fighter('self','unbewaffneter-kampf',weaponType), plain=fighter('self','',weaponType), bonus=weaponType==='unarmed'?1:0;
    assert.equal(getWeaponAttackModifier(actor,actor.weapon),getWeaponAttackModifier(plain,plain.weapon)+bonus);
    assert.equal(getWeaponDamageModifier(actor,actor.weapon),getWeaponDamageModifier(plain,plain.weapon)+bonus);
    assert.deepEqual(actor.resources,plain.resources);
  }
});

test('power attack and precision shots apply their accuracy tradeoff and real damage bonus only in their authored range', async () => {
  for(const [id,weaponType,otherType] of [['kraftangriff','sword','bow'],['praezisionsschuetze','bow','sword']]) {
    const actor=fighter('self',id,weaponType), other=fighter('self',id,otherType);
    assert.equal(getCombatRollContext(actor,fighter('enemy')).preRollEffects.attackModifier,-1);
    assert.equal(effects(actor,actor,'pre-damage').damageModifier,2);
    assert.equal(effects(other,other,'pre-damage').damageModifier,0);
    assert.equal(effects(actor,{...actor,profileActionKind:'spell',actionResolutionMode:'spell-attack'},'pre-damage').damageModifier,0);
    const dice={async rollAttack({modifier}){return{natural:15,dice:[15],keptDice:[15],total:15+modifier};},async rollDamage({bonus}){return{notation:'1d6',keptDice:[4],total:4+bonus,modifier:bonus};}};
    const result=await new CombatResolutionService(dice).resolveAttack({actor,target:fighter('enemy')});
    assert.equal(result.damage.total,6);
  }
});

test('evasion, resilience and combat reflexes affect their actual totals, respect fixed AC and preserve stored state', () => {
  const plain=profile(); assert.equal(getArmorClass(profile('ausweichen')),getArmorClass(plain)+1);
  const fixed=profile('ausweichen');fixed.armorClass.override=17;assert.equal(getArmorClass(fixed),17);
  for(const attribute of ['strength','dexterity','constitution','intelligence','wisdom','charisma']) {
    assert.equal(getSavingThrowTotal(profile('widerstandstraining'),attribute),getSavingThrowTotal(plain,attribute)+1);
    assert.equal(getSavingThrowTotal(profile('kampfreflexe'),attribute),getSavingThrowTotal(plain,attribute)+(attribute==='dexterity'?1:0));
  }
  assert.equal(getCombatInitiative(profile('kampfreflexe')),getCombatInitiative(plain)+2);
  for(const [id] of EXPANSION_ABILITY_DEFINITIONS) {
    const entry=profile(id.replace('faehigkeit-',''));const before=structuredClone(entry);
    getArmorClass(entry);getCombatInitiative(entry);getSavingThrowTotal(entry,'constitution');
    assert.deepEqual(entry,before);for(const key of ['hitPoints','resources','weapons','skills','attributes','magic'])assert.deepEqual(entry[key],plain[key],`${id}/${key}`);
  }
});

test('magic control and battle caster distinguish concentration, spell DC, spell attacks and CON saves without granting magic', () => {
  const plain=profile(), control=profile('magiekontrolle'), caster=profile('kampfzauberer');
  assert.equal(getSpellcastingValues(control).saveDc,getSpellcastingValues(plain).saveDc+1);
  assert.equal(getSpellcastingValues(control).attack,getSpellcastingValues(plain).attack);
  assert.equal(effects(control,control,'on-concentration-check','target').rollMode,'advantage');
  assert.equal(getSavingThrowTotal(control,'constitution'),getSavingThrowTotal(plain,'constitution'));
  assert.equal(getSpellcastingValues(caster).attack,getSpellcastingValues(plain).attack+1);
  assert.equal(getSpellcastingValues(caster).saveDc,getSpellcastingValues(plain).saveDc);
  assert.equal(getSavingThrowTotal(caster,'constitution'),getSavingThrowTotal(plain,'constitution')+1);
  assert.equal(effects(caster,caster,'on-concentration-check','target').rollMode,'normal');
  assert.equal(control.magic.enabled,false);assert.equal(caster.magic.enabled,false);
  const older=DEVELOPMENT_TRAITS.find(entry=>entry.id==='development-trait-konzentriert');
  assert.equal(reviewDevelopmentTraitBalance({...plain,quirks:[older]},[trait('magiekontrolle')]).traitCost,3);
});

test('arcane defense applies to all six saves against spells prayers and songs in primary secondary and standalone checks', () => {
  const owner=profile('arkane-abwehr');
  for(const attribute of ['strength','dexterity','constitution','intelligence','wisdom','charisma']) {
    for(const kind of ['spell','prayer','song','weapon','technique','ability']) {
      const actor={...fighter('enemy'),profileActionKind:kind,actionResolutionMode:'saving-throw',actionSaveAttribute:attribute};
      for(const phase of ['pre-roll','pre-secondary-save'])assert.equal(effects(owner,actor,phase,'target',kind,{saveAttribute:attribute}).savingThrowModifier,['spell','prayer','song'].includes(kind)?1:0,`${kind}/${attribute}/${phase}`);
      const context=getSkillRollContext({actor:{id:'self',name:'Test'},settings:{skillId:`save:${attribute}`,saveContext:{actionKind:kind}}},{actorProfile:owner});
      assert.equal(context.preEffects.savingThrowModifier,['spell','prayer','song'].includes(kind)?1:0,`standalone/${kind}/${attribute}`);
    }
  }
});

test('learned skill packages resolve through public checks, preserve existing expertise and restore baseline when inactive', () => {
  const checks=[['wildniskunde','nature','survival'],['heilkunst','medicine','body-control'],['diplomatie','persuasion','insight'],['diebeskunst','sleight-of-hand','stealth']];
  const plain=profile(), actor={id:'self',name:'Test'}, get=(entry,skillId)=>getSkillRollContext({actor,settings:{skillId}},{actorProfile:entry}).skill.modifier;
  const proficiency=getProficiencyBonus(plain);
  for(const [id,primary,secondary] of checks) {
    const entry=profile(id);
    assert.equal(get(entry,primary),get(plain,primary)+2*proficiency,id);
    assert.equal(get(entry,secondary),get(plain,secondary)+(id==='wildniskunde'?proficiency:1),id);
    assert.deepEqual(entry.skills,plain.skills);
    if(id==='wildniskunde') {
      entry.skills.find(skill=>skill.name==='Überleben').proficiency='expertise';
      assert.equal(get(entry,'survival'),get(plain,'survival')+2*proficiency);
    }
    entry.quirks[0].active=false;
    assert.equal(get(entry,primary),get(plain,primary),`${id}/inactive`);
  }
});
