import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getArmorClass,
  getAttributeModifier,
  getCharacterCombatInventoryOptions,
  getEffectiveCombatLevel,
  getMaximumHitPoints,
  getPassivePerception,
  getProficiencyBonus,
  getSkillTotal,
  resolveAttackRollMode,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from '../modules/combat/combat-profile-model.js';
import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import {
  createCharacterLevelUpPlan,
  getSuggestedHitPointGain,
  previewCharacterLevelUp
} from '../modules/combat/combat-level-up-model.js';
import {
  resolveCombatProfile,
  validateCombatActorProfile,
  validateCombatTargetProfile
} from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { combatNarrationInternals, narrateCombatResolution } from '../modules/combat/combat-narration-service.js';
import { combatUiInternals } from '../modules/combat/ui/combat-ui.js';
import {
  buildAttackNotation,
  buildDamageNotation,
  evaluateAttackRoll,
  parseDamageFormula
} from '../modules/combat/rules/combat-mvp-rules.js';

function character(id, combatProfile = {}) {
  return {
    id,
    name: id === 'actor' ? 'Alwyn' : 'Ziel',
    combatProfile: {
      progression: { level: 1, specialLevels: 0 },
      attributes: [
        { key: 'strength', score: 14 },
        { key: 'dexterity', score: 10 },
        { key: 'constitution', score: 12 },
        { key: 'intelligence', score: 10 },
        { key: 'wisdom', score: 10 },
        { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 18, maximumOverride: 20, hitDie: 8 },
      armorClass: { base: 12, dexterityMode: 'full' },
      combat: { attackBonus: 1, damageBonus: 2 },
      weapons: [{
        id: 'sword', name: 'Langschwert', damageFormula: '1W8', damageType: 'Hieb',
        attackAttribute: 'strength', proficient: true, attackBonus: 1, damageBonus: 1,
        range: 'Nahkampf', equipped: true
      }],
      armorItems: [{ id: 'leather', name: 'Lederrüstung', armorClassBonus: 2, equipped: true }],
      skills: [], resources: [],
      ...combatProfile
    }
  };
}

class FakeDiceAdapter {
  constructor(attackRoll, damageRoll = { total: 9, notation: '1d8+5', keptDice: [4], modifier: 5 }) {
    this.attackRoll = attackRoll;
    this.damageRoll = damageRoll;
    this.attackCalls = [];
    this.damageCalls = [];
  }

  async rollAttack(request) {
    this.attackCalls.push(request);
    return { id: 'attack-roll', dice: [this.attackRoll.natural], keptDice: [this.attackRoll.natural], visualMode: '3d', ...this.attackRoll };
  }

  async rollDamage(request) {
    this.damageCalls.push(request);
    return { id: 'damage-roll', visualMode: '3d', ...this.damageRoll };
  }
}

test('migriert das alte Kampfprofil verlustarm in Schema drei', () => {
  const profile = sanitizeCharacterCombatProfile({
    defense: 13,
    maximumHitPoints: 22,
    currentHitPoints: 17,
    baseAttackBonus: 4,
    baseDamageBonus: 2,
    weapon: { name: 'Speer', damageFormula: '1W6 + 1' },
    armor: { name: 'Lederrüstung', defenseBonus: 2 }
  });
  assert.equal(profile.schemaVersion, 3);
  assert.equal(profile.armorClass.base, 13);
  assert.equal(profile.hitPoints.maximumOverride, 22);
  assert.equal(profile.combat.attackBonus, 4);
  assert.equal(profile.weapons[0].damageFormula, '1d6+1');
  assert.equal(profile.weapons[0].proficient, false);
  assert.equal(profile.armorItems[0].armorClassBonus, 2);
});

test('begrenzt normale Stufen auf 20 und Sonderstufen auf insgesamt 30', () => {
  const profile = sanitizeCharacterCombatProfile({ progression: { level: 99, specialLevels: 99 } });
  assert.equal(profile.progression.level, 20);
  assert.equal(profile.progression.specialLevels, 10);
  assert.equal(getEffectiveCombatLevel(profile), 30);
  assert.equal(getProficiencyBonus(profile), 9);
});

test('führt einen normalen Stufenaufstieg mit automatischen Trefferpunkten als Vorschau aus', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 1, experience: 280, nextLevelExperience: 300 },
    attributes: [{ key: 'constitution', score: 14 }],
    hitPoints: { current: 10, hitDie: 8, maximumOverride: null },
    resources: []
  });
  const plan = createCharacterLevelUpPlan(profile);
  plan.experience = 300;
  plan.nextLevelExperience = 900;
  const preview = previewCharacterLevelUp(profile, plan);
  assert.equal(preview.ready, true);
  assert.equal(preview.profile.progression.level, 2);
  assert.equal(preview.profile.progression.specialLevels, 0);
  assert.equal(preview.profile.progression.experience, 300);
  assert.equal(preview.profile.progression.nextLevelExperience, 900);
  assert.equal(getSuggestedHitPointGain(profile), 7);
  assert.equal(getMaximumHitPoints(preview.profile), 17);
  assert.equal(preview.profile.hitPoints.current, 17);
  assert.equal(profile.progression.level, 1, 'Das Ausgangsprofil darf nicht verändert werden.');
});

test('wechselt nach Stufe 20 in Sonderstufen und respektiert das Gesamtlimit 30', () => {
  const levelTwenty = sanitizeCharacterCombatProfile({ progression: { level: 20, specialLevels: 0 } });
  const specialPreview = previewCharacterLevelUp(levelTwenty, createCharacterLevelUpPlan(levelTwenty));
  assert.equal(specialPreview.ready, true);
  assert.equal(specialPreview.profile.progression.level, 20);
  assert.equal(specialPreview.profile.progression.specialLevels, 1);
  assert.equal(specialPreview.after.levelKind, 'special');

  const capped = sanitizeCharacterCombatProfile({ progression: { level: 20, specialLevels: 10 } });
  const cappedPreview = previewCharacterLevelUp(capped, createCharacterLevelUpPlan(capped));
  assert.equal(cappedPreview.ready, false);
  assert.match(cappedPreview.errors[0], /Gesamtstufe 30/);
});

test('wendet freie Level-up-Entscheidungen auf Attribute, Ressourcen und Freischaltungen an', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 4 },
    attributes: [{ key: 'constitution', score: 13 }, { key: 'wisdom', score: 15 }],
    hitPoints: { current: 25, maximumOverride: 25 },
    resources: [{ id: 'mana', name: 'Mana', current: 3, maximum: 5 }],
    skills: [], abilities: [], magic: { enabled: false, spells: [] }
  });
  const plan = createCharacterLevelUpPlan(profile);
  plan.attributeIncreases.constitution = 1;
  plan.attributeIncreases.wisdom = 2;
  plan.hitPointMode = 'manual';
  plan.manualHitPointGain = 9;
  plan.resourceIncreases.mana = { current: 4, maximum: 4 };
  plan.newSkill = { name: 'Fährtenlesen', attributeKey: 'wisdom', proficiency: 'expertise', bonus: 1, notes: 'Nur in Wildnis.' };
  plan.newAbility = { name: 'Waldschritt', description: 'Ignoriert Gestrüpp.', usesMaximum: 2, recovery: 'long-rest', rollFormula: '1W6' };
  plan.newSpell = { name: 'Dornenruf', level: 2, manaCost: 3, rollFormula: '2W6', description: 'Dornen brechen hervor.', prepared: true };
  const preview = previewCharacterLevelUp(profile, plan);
  assert.equal(preview.profile.attributes.find(attribute => attribute.key === 'constitution').score, 14);
  assert.equal(preview.profile.attributes.find(attribute => attribute.key === 'wisdom').score, 17);
  assert.equal(preview.profile.hitPoints.maximumOverride, 34);
  assert.equal(preview.profile.hitPoints.current, 34);
  assert.deepEqual(preview.profile.resources.find(resource => resource.id === 'mana'), {
    id: 'mana', name: 'Mana', current: 7, maximum: 9, recovery: 'manual', notes: ''
  });
  assert.equal(preview.profile.skills[0].name, 'Fährtenlesen');
  assert.equal(preview.profile.abilities[0].usesCurrent, 2);
  assert.equal(preview.profile.magic.enabled, true);
  assert.equal(preview.profile.magic.spells[0].damageFormula, undefined);
  assert.equal(preview.profile.magic.spells[0].rollFormula, '2d6');
});

test('berechnet Trefferpunkte aus Trefferwürfel, Konstitution und Stufe', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 3 },
    attributes: [{ key: 'constitution', score: 14 }],
    hitPoints: { hitDie: 8, maximumOverride: null }
  });
  assert.equal(getMaximumHitPoints(profile), 24);
  profile.hitPoints.maximumOverride = 31;
  assert.equal(getMaximumHitPoints(profile), 31);
});

test('leitet Attributsmodifikatoren ab, lässt aber bewusste Überschreibungen zu', () => {
  assert.equal(getAttributeModifier({ score: 18, modifierOverride: null }), 4);
  assert.equal(getAttributeModifier({ score: 18, modifierOverride: -2 }), -2);
});

test('berechnet Rüstungsklasse aus Rüstung, Geschick und aktiven Effekten', () => {
  const profile = sanitizeCharacterCombatProfile({
    attributes: [{ key: 'dexterity', score: 16 }],
    armorClass: { base: 10, magicModifier: 1 },
    armorItems: [
      { id: 'leather', name: 'Leder', kind: 'armor', baseArmorClass: 11, dexterityMode: 'full', equipped: true },
      { id: 'shield', name: 'Schild', kind: 'shield', armorClassBonus: 2, equipped: true }
    ],
    conditions: [{ id: 'blessing', name: 'Segen', active: true, mechanics: { armorClass: 1 } }]
  });
  assert.equal(getArmorClass(profile), 18);
});

test('berechnet frei angelegte Fertigkeiten mit Training, Expertise und Effekten', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 5 },
    attributes: [{ key: 'dexterity', score: 18 }],
    skills: [{ id: 'stealth', name: 'Heimlichkeit', attributeKey: 'dexterity', proficiency: 'expertise', bonus: 1 }],
    quirks: [{ id: 'quiet', name: 'Leise Sohlen', active: true, mechanics: { skill: 2 } }]
  });
  assert.equal(getSkillTotal(profile, 'stealth'), 13);
});

test('berechnet passive Wahrnehmung aus der vollständigen Wahrnehmungs-Fertigkeit', () => {
  const profile = sanitizeCharacterCombatProfile({
    progression: { level: 5 },
    attributes: [{ key: 'wisdom', score: 16 }],
    combat: { passivePerceptionBonus: 1 },
    skills: [{ id: 'perception', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 2 }],
    conditions: [{ id: 'alert', name: 'Wachsam', active: true, mechanics: { skill: 1 } }]
  });
  assert.equal(getSkillTotal(profile, 'perception'), 9);
  assert.equal(getPassivePerception(profile), 20);
  assert.equal(resolveCharacterCombatProfile({ combatProfile: profile }).passivePerception, 20);
});

test('übernimmt Waffen und Rüstungen aus dem Inventar als editierbare Ausgangswerte', () => {
  const source = {
    inventory: { items: [
      { id: 'sword', category: 'weapon', name: 'Silberklinge', description: 'Geweihtes Familienerbstück.', combatDefinition: { damageFormula: '1W8', attackBonus: 2 } },
      { id: 'mail', category: 'armor', name: 'Kettenhemd', description: 'Im Wasser besonders schwer.', attributes: [{ label: 'Schutz', value: 4 }] }
    ] }
  };
  const weapon = getCharacterCombatInventoryOptions(source, 'weapon')[0];
  const armor = getCharacterCombatInventoryOptions(source, 'armor')[0];
  assert.equal(weapon.inventoryItemId, 'sword');
  assert.equal(weapon.damageFormula, '1d8');
  assert.equal(weapon.attackBonus, 2);
  assert.equal(weapon.notes, 'Geweihtes Familienerbstück.');
  assert.equal(armor.inventoryItemId, 'mail');
  assert.equal(armor.armorClassBonus, 4);
  assert.equal(armor.notes, 'Im Wasser besonders schwer.');
});

test('verlangt Waffe und Schadenswurf, aber keinen Kampfmodus oder Initiativewert', () => {
  const actor = resolveCombatProfile(character('actor'));
  const target = resolveCombatProfile(character('target'));
  assert.equal(validateCombatActorProfile(actor).ready, true);
  assert.equal(validateCombatTargetProfile(target).ready, true);
  assert.equal(validateCombatActorProfile(resolveCombatProfile(character('blank', { weapons: [] }))).ready, false);
  assert.equal(validateCombatTargetProfile(resolveCombatProfile(character('blank', { armorClass: { override: 0 } }))).ready, true);
});

test('wählt Waffe oder vorbereiteten Zauber ausdrücklich aus dem Profil', () => {
  const source = character('actor', {
    attributes: [{ key: 'intelligence', score: 16 }],
    weapons: [
      { id: 'sword', name: 'Langschwert', damageFormula: '1W8', attackAttribute: 'strength', proficient: true, equipped: true },
      { id: 'dagger', name: 'Dolch', damageFormula: '1W4', attackAttribute: 'dexterity', proficient: true, equipped: false }
    ],
    magic: {
      enabled: true,
      castingAttribute: 'intelligence',
      spells: [{ id: 'ember', name: 'Glutlanze', rollFormula: '2W6', level: 1, manaCost: 2, prepared: true }]
    }
  });
  const dagger = resolveCombatProfile(source, { actionId: 'weapon:dagger' });
  const spell = resolveCombatProfile(source, { actionId: 'spell:ember' });
  assert.equal(dagger.weapon.name, 'Dolch');
  assert.equal(dagger.profileActionKind, 'weapon');
  assert.equal(spell.weapon.name, 'Glutlanze');
  assert.equal(spell.weapon.damageFormula, '2d6');
  assert.equal(spell.profileActionKind, 'spell');
  assert.equal(spell.attackModifier, 5);
  assert.deepEqual(spell.actions.map(action => action.kind), ['weapon', 'weapon', 'spell']);
});

test('baut normale, Vorteil- und Nachteilwürfe', () => {
  assert.equal(buildAttackNotation(5, 'normal'), '1d20+5');
  assert.equal(buildAttackNotation(5, 'advantage'), '2d20kh1+5');
  assert.equal(buildAttackNotation(-2, 'disadvantage'), '2d20kl1-2');
});

test('aktive Zustände steuern den Angriffswurf und Vorteil und Nachteil heben sich auf', () => {
  const advantage = sanitizeCharacterCombatProfile({
    conditions: [{ id: 'blessed', active: true, mechanics: { attackRollMode: 'advantage' } }]
  });
  assert.equal(resolveAttackRollMode(advantage, 'normal'), 'advantage');
  assert.equal(resolveAttackRollMode(advantage, 'disadvantage'), 'normal');
});

test('akzeptiert W-Schreibweise und verdoppelt bei kritischem Treffer nur Schadenswürfel', () => {
  assert.deepEqual(parseDamageFormula('1W8+1'), { diceCount: 1, sides: 8, fixedModifier: 1, notation: '1d8+1' });
  assert.equal(buildDamageNotation('1W8+1', 3, true), '2d8+4');
});

test('wertet Gleichstand, natürliche Eins und natürliche Zwanzig korrekt aus', () => {
  assert.equal(evaluateAttackRoll({ natural: 10, total: 14 }, 14).hit, true);
  assert.equal(evaluateAttackRoll({ natural: 1, total: 99 }, 14).hit, false);
  assert.equal(evaluateAttackRoll({ natural: 20, total: 5 }, 99).hit, true);
});

test('erzeugt Treffer und Schaden aus den vollständig abgeleiteten Charakterprofilen', async () => {
  const dice = new FakeDiceAdapter({ natural: 13, total: 19 });
  const phases = [];
  const result = await new CombatResolutionService(dice).resolveAttack({
    actor: resolveCombatProfile(character('actor')),
    target: resolveCombatProfile(character('target')),
    description: 'Alwyn zieht die Klinge in einem flachen Bogen herum.',
    rollMode: 'normal'
  }, { onPhase: phase => phases.push(phase.phase) });
  assert.equal(result.schemaVersion, 3);
  assert.equal(result.attack.hit, true);
  assert.equal(result.attack.modifier, 6);
  assert.equal(result.attack.targetDefense, 14);
  assert.equal(result.damage.total, 9);
  assert.deepEqual(phases, ['attack', 'damage']);
  assert.equal(dice.damageCalls[0].bonus, 5);
});

test('übergibt wirklich alle Kampfbogen-Kategorien als verbindlichen KI-Snapshot', () => {
  const source = character('actor', {
    identity: { background: 'Ehemalige Tempelwache' },
    attributes: [{ key: 'strength', score: 14, shortLabel: 'STÄ' }],
    combat: { attackBonus: 1, damageBonus: 2, passivePerceptionBonus: 0 },
    resources: [{ id: 'mana', name: 'Mana', current: 4, maximum: 9 }],
    quirks: [{ id: 'quirk', name: 'Hitzkopf', description: 'Stürmt vor.', active: true, mechanics: { initiative: 2, savingThrow: 1, spellAttack: 1, spellSaveDc: 1 } }],
    conditions: [{ id: 'condition', name: 'Geblendet', active: true }],
    abilities: [{ id: 'ability', name: 'Falkenauge', active: true }],
    magic: { enabled: true, spells: [{ id: 'spell', name: 'Funkenlanze' }] },
    notes: 'Silber richtet keinen Schaden an.'
  });
  const snapshot = buildCombatProfileAiSnapshot(source);
  assert.equal(snapshot.character.identity.background, 'Ehemalige Tempelwache');
  assert.equal(snapshot.attributes[0].shortLabel, 'STÄ');
  assert.equal(snapshot.combatModifiers.passivePerceptionBonus, 0);
  assert.equal(snapshot.coreResources[0].name, 'Mana');
  assert.equal(snapshot.quirksAndTraits[0].name, 'Hitzkopf');
  assert.equal(snapshot.conditionsAndEffects[0].name, 'Geblendet');
  assert.equal(snapshot.specialAbilities[0].name, 'Falkenauge');
  assert.equal(snapshot.magic.spells[0].name, 'Funkenlanze');
  assert.equal(snapshot.notesAndSpecialRules, 'Silber richtet keinen Schaden an.');
  assert.equal(snapshot.quirksAndTraits[0].mechanics.initiative, 2);
  assert.match(snapshot.instruction, /nicht doppelt addiert/);
});

test('priorisiert beide vollständigen Kampfbögen im KI-Retrieval', () => {
  const enriched = combatNarrationInternals.enrichCombatNarrationRetrieval({
    promptContext: 'Szenenkontext',
    chunks: [{ sourceType: 'character-profile', text: 'Weitere Figurendaten' }],
    stats: {}
  }, {
    actorId: 'actor', targetId: 'target', actor: 'Alwyn',
    actorCombatProfile: { conditionsAndEffects: [{ name: 'Geblendet' }] },
    targetCombatProfile: { armor: [{ name: 'Kettenhemd' }] }
  });
  assert.equal(enriched.chunks[0].sourceType, 'combat-profile-snapshots');
  assert.equal(enriched.stats.requiredCombatProfilesIncluded, true);
  assert.match(enriched.promptContext, /Geblendet/);
  assert.match(enriched.promptContext, /Kettenhemd/);
});

test('hält den Kampferzählauftrag vollständig innerhalb des Backend-Limits', () => {
  const query = combatNarrationInternals.buildCombatNarrationQuery({
    actor: 'Alwyn', target: 'Der Aschenwurm', weapon: 'Langschwert', hit: true,
    critical: false, criticalFailure: false, damage: 9,
    originalDescription: 'Sehr lange Kampfbeschreibung '.repeat(200)
  });
  assert.ok(query.length <= 1180);
  assert.match(query, /Bestätigte Fakten:/);
  assert.doesNotThrow(() => JSON.parse(query.slice(query.indexOf('{'))));
});

test('eine Auswertung verändert Trefferpunkte des Zielprofils nicht still', async () => {
  const targetCharacter = character('target');
  const before = targetCharacter.combatProfile.hitPoints.current;
  const dice = new FakeDiceAdapter({ natural: 15, total: 21 });
  const result = await new CombatResolutionService(dice).resolveAttack({
    actor: resolveCombatProfile(character('actor')),
    target: resolveCombatProfile(targetCharacter),
    description: 'Ein Treffer.',
    rollMode: 'normal'
  });
  assert.equal(targetCharacter.combatProfile.hitPoints.current, before);
  assert.equal(result.targetSnapshot.currentHitPoints, before);
  assert.equal(result.targetSnapshot.hitPointsBefore, before);
  assert.equal(result.targetSnapshot.hitPointsAfter, before - result.damage.total);
  assert.equal(result.targetSnapshot.defeated, false);
});

test('zeigt auch ohne KI-Antwort eine vollstaendige Kampfauswertung', () => {
  assert.equal(combatUiInternals.getEvaluationFallback({ attack: { hit: true } }), 'Der Angriff findet sein Ziel.');
  assert.equal(combatUiInternals.getEvaluationFallback({ attack: { hit: false } }), 'Der Angriff verfehlt sein Ziel.');
  assert.match(
    combatUiInternals.getEvaluationFallback({ attack: { hit: true, criticalSuccess: true } }),
    /voller Wucht/
  );
  assert.equal(combatUiInternals.getNarrationSourceMeta({ source: 'aleria-gpt' }).key, 'aleria-gpt');
  assert.equal(combatUiInternals.getNarrationSourceMeta({ source: 'deterministic' }).key, 'system');
});

test('ruft AleriaGPT fuer eine neue Kampfauswertung tatsaechlich auf', async () => {
  const previousClient = globalThis.AleriaGptClient;
  const previousRetrieval = globalThis.AleriaGptRetrieval;
  let requestedMode = '';
  globalThis.AleriaGptRetrieval = {
    async retrieve() {
      return { promptContext: '', chunks: [], stats: {}, detected: {}, sourceHash: '' };
    }
  };
  globalThis.AleriaGptClient = {
    isConfigured: () => true,
    async sendChat(query, retrieval, options) {
      requestedMode = options.responseMode;
      assert.match(query, /Best/);
      assert.equal(retrieval.stats.requiredCombatProfilesIncluded, true);
      return { ok: true, text: 'Die Klinge zwingt das Ziel einen Schritt zurueck.' };
    }
  };

  try {
    const result = await narrateCombatResolution({
      actorId: 'actor', targetId: 'target', actor: 'Alwyn', target: 'Der Aschenwurm',
      weapon: 'Langschwert', hit: true, critical: false, criticalFailure: false,
      damage: 8, originalDescription: 'Alwyn fuehrt einen kurzen Hieb.',
      actorCombatProfile: {}, targetCombatProfile: {}
    });
    assert.equal(result.source, 'aleria-gpt');
    assert.equal(requestedMode, 'combat-resolution-narration-v2');
  } finally {
    if (previousClient === undefined) delete globalThis.AleriaGptClient;
    else globalThis.AleriaGptClient = previousClient;
    if (previousRetrieval === undefined) delete globalThis.AleriaGptRetrieval;
    else globalThis.AleriaGptRetrieval = previousRetrieval;
  }
});
