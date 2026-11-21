import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { reconcileFenrirWeaponTechnique } from '../modules/classes/aldrimar/fenrir-weapon-techniques.js';
import { getCombatPassiveClassId, getEarnedClassPassiveFeatures } from '../modules/classes/combat-passives/class-passive-curriculum.js';
import { withClassPassivePeriods } from '../modules/classes/combat-passives/class-passive-periods.js';
import { DRACHENTANZ_FORM_IDS as D } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { JUNGDRACHE_SHARED_TECHNIQUES } from '../modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';
import { SIRENENTANZ_FORM_IDS as W, DERWYN_FORM_IDS as WYRM } from '../modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getTechniqueDamageScaling, resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { deriveCombatRuleFrequencyKeys } from '../modules/combat/combat-trigger-rules.js';

const ids = ['teulu', 'cantref', 'helwyr', 'uchelwyr', 'arthwyr', 'barddwyr', 'cenyr-milwr', 'vennyr-milwr',
  'morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn'];
const stages = [5, 7, 8, 10, 14, 16, 18, 20];

test('the eight milestones are earned from old class fields and regular level alone', () => {
  for (const id of ids) for (let level = 1; level <= 20; level++) {
    const old = { identity: { archetype: id }, progression: { level, specialLevels: 10 } };
    assert.equal(getCombatPassiveClassId(old), id);
    assert.deepEqual(getEarnedClassPassiveFeatures(old).map(feature => feature.minimumLevel), stages.filter(stage => stage <= level));
  }
  for (const [saved, expected] of [['Hewlyr', 'helwyr'], ['Ceidwynr', 'ceidwyn'], ['Rhiddwyrr', 'rhiddwyr'], ['Skjaldr', '']]) {
    assert.equal(getCombatPassiveClassId({ identity: { archetype: saved } }), expected);
  }
  assert.equal(getCombatPassiveClassId({ identity: { ancestry: 'Cenyr', archetype: 'Milwr' } }), 'cenyr-milwr');
});

test('all classes, old fixed damage and Gawain’s existing weapon use the total-level ladder', async () => {
  const base = { id: 'old-technique', minimumLevel: 1, damageFormula: '1d8+3' };
  const expectations = [[1, 0, '1d8+3'], [7, 0, '1d8+1d4+3'], [9, 0, '1d8+1d6+3'], [13, 0, '2d8+3'],
    [20, 0, '1d8+1d10+3'], [20, 4, '1d8+1d10+3'], [20, 5, '1d8+1d10+4'], [20, 10, '1d8+1d10+1d6+3']];
  for (const archetype of [...ids, 'skjaldr', '']) for (const [level, specialLevels, formula] of expectations) {
    assert.equal(resolveTechniqueDamageFormula(base, {}, { identity: { archetype }, progression: { level, specialLevels } }), formula);
  }
  const rank30 = { progression: { level: 20, specialLevels: 10 } };
  assert.equal(resolveTechniqueDamageFormula({ ...base, damageModel: { mode: 'none' } }, {}, rank30), '');
  assert.equal(getTechniqueDamageScaling({ ...base, effects: [{ type: 'damage', target: 'selected' }] }, rank30), null);
  assert.equal(resolveTechniqueDamageFormula({ id: 'old-amount', effects: [{ type: 'damage', target: 'target', amount: 4 }] }, {}, rank30), '1d10+1d6+4');
  const { character } = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8'));
  const snapshot = structuredClone(character);
  for (const [specialLevels, formula] of [[0, '1d8+1d10'], [5, '1d8+1d10+1'], [10, '1d8+1d10+1d6']]) {
    const preview = resolveCombatProfile({ ...character, combatProfile: { ...character.combatProfile,
      progression: { ...character.combatProfile.progression, level: 20, specialLevels } } }, {
      actionId: 'technique:combat-style-drachentanz-jungdrache-sicherer-drachenhieb', includeAiSnapshot: false });
    assert.equal(preview.weapon.damageFormula, formula);
    assert.equal(preview.selectedAction.compatible, true);
  }
  assert.deepEqual(character, snapshot);
});

test('Fenrir’s persisted weapon correction keeps normal training and resolves special ranks at runtime', () => {
  const technique = reconcileFenrirWeaponTechnique({ id: 'fenrir-crushing-blow', minimumLevel: 1 });
  assert.deepEqual(technique.damageModel.scalingSteps, [
    { level: 7, formula: '1d4' }, { level: 9, formula: '1d6' },
    { level: 13, formula: '1d8' }, { level: 17, formula: '1d10' }
  ]);
  for (const [specialLevels, formula] of [[5, '1d10+1'], [10, '1d10+1d6']]) {
    assert.equal(getTechniqueDamageScaling(technique, { progression: { level: 20, specialLevels } }).formula, formula);
  }
});

test('die vier Jungdrachen-Kontrollen verwenden ihre kleine Sonderstufenstaffel auch in älteren Kopien', () => {
  const controls = ['staubende-schwinge', 'gebundene-klaue', 'unruhiger-griff', 'drachenklammer'];
  for (const slug of controls) {
    const entry = JUNGDRACHE_SHARED_TECHNIQUES.find(technique => technique.id === `combat-style-drachentanz-jungdrache-${slug}`);
    assert(entry?.secondarySave.enabled);
    const saved = { ...entry, id: `gespeichert-${slug}`, catalogTechniqueId: entry.id };
    for (const technique of [entry, saved]) {
      for (const [specialLevels, expected] of [[4, '1d8'], [5, '1d8+1'], [9, '1d8+1'], [10, '1d8+1d6']]) {
        assert.equal(resolveTechniqueDamageFormula(technique, { damageFormula: '1d8' }, { progression: { level: 20, specialLevels } }), expected);
      }
    }
  }
});

const cost = { resourceId: 'action', amount: 1 };
const guard = { id: 'test-guard', type: 'buff', target: 'self', on: 'always',
  condition: { id: 'test-guard', name: 'Deckung', mechanics: { armorClass: 1 } } };

function participant(id, classId = '', level = 20, weaponType = 'sword', weaponProfileId = weaponType) {
  const weapon = { id: `${id}-weapon`, name: 'Waffe', weaponType, weaponProfileId,
    damageType: 'stich', damageFormula: '1d8', range: weaponType === 'bow' ? 'Fernkampf' : 'Nahkampf 2 m' };
  return { characterId: id, name: id, progression: { level }, identity: { archetype: classId }, weapon,
    weapons: [{ ...weapon, equipped: true }], activeWeaponId: weapon.id, currentHitPoints: 100, maximumHitPoints: 100,
    totalDefense: 12, attackModifier: 4, damageModifier: 3, profileActionKind: 'weapon', actionResolutionMode: 'weapon-attack',
    resources: [{ id: 'action', name: 'Aktion', scope: 'comment', current: 3, maximum: 3 }], temporaryConditions: [] };
}

function technique(profile, options = {}) {
  const { name = 'Technik', form = D.jungdrache, style = 'drachentanz', effects = [], nonDamaging = false, ...extras } = options;
  const selectedAction = { id: `technique:${name}`, sourceId: name, name, kind: 'technique', costs: [cost], compatible: true,
    effects, nonDamaging, combatStyleId: style, combatStyleFormId: form, maximumTargets: 1, ...extras };
  return { ...profile, profileActionKind: 'technique', profileActionId: selectedAction.id, selectedAction,
    actionResolutionMode: nonDamaging ? 'automatic' : 'weapon-attack', resourceCosts: [cost] };
}

class FixedDice {
  constructor(natural, damage, save) { Object.assign(this, { natural, damage, save }); }
  async rollAttack(request) { return { natural: this.natural, dice: [this.natural], total: this.natural + request.modifier }; }
  async rollDamage(request) { return { total: this.damage + (request.bonus || 0), notation: request.damageFormula }; }
  async rollSavingThrow(request) { return { natural: this.save, dice: [this.save], total: this.save + request.modifier }; }
}

function scenario() {
  const history = [];
  const state = profile => overlayCombatHitPointState(profile, deriveCombatStateFromComments(history).get(profile.characterId));
  const resolve = (actor, target, options = {}) => {
    const { comment = `post-${history.length + 1}`, natural = 15, damage = 6, save = 12, ...remaining } = options;
    return new CombatResolutionService(new FixedDice(natural, damage, save)).resolveAttack({ actor, target }, {
      rulePeriods: withClassPassivePeriods({ comment, scene: 'test-scene' }, history, { characterId: actor.characterId }),
      usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys(history), ...remaining });
  };
  const post = result => history.push({ id: `post-${history.length + 1}`, characterId: result.actorId, commentSegments: [{ combatResolution: result }] });
  return { state, resolve, post, history };
}

const passive = (result, group) => result.ruleApplications.find(entry => entry.entryKind === 'class-passive' && entry.ruleId.startsWith(`${group}:`));

test('a Teulu reply reads the actual challenger, spends one paid response and closes the sword guard', async () => {
  const teulu = participant('teulu', 'teulu', 14);
  const enemy = participant('enemy');
  const other = participant('other');
  const scene = scenario();
  const guardAction = technique(teulu, { nonDamaging: true, effects: [guard] });
  const opening = await scene.resolve(guardAction, guardAction);
  assert.equal(opening.resourceCosts[0].amount, 1);
  scene.post(opening);
  const incoming = await scene.resolve(enemy, scene.state(teulu));
  assert.equal(passive(incoming, 'blade-guard').effects.damageReduction, 1);
  scene.post(incoming);
  const response = technique(scene.state(teulu));
  assert.ok(response.temporaryConditions.some(condition => condition.sourceConditionId === 'cp-teulu-reply'));
  assert.equal(passive(await scene.resolve(response, other), 'answer'), undefined);
  assert.equal(passive(await scene.resolve(technique(scene.state(teulu), { form: D.aufsteigender }), enemy), 'answer'), undefined);
  const strike = await scene.resolve(response, scene.state(enemy));
  assert.equal(passive(strike, 'answer').effects.attackModifier, 1);
  assert.equal(passive(strike, 'answer-damage').effects.damageModifier, 2);
  assert.ok(passive(strike, 'closed-guard'));
  scene.post(strike);
  const riposte = await scene.resolve(scene.state(enemy), scene.state(teulu));
  assert.equal(riposte.ruleApplications.find(entry => entry.ruleId === 'cp-teulu-closed-attack').effects.attackModifier, -1);
  assert.equal(passive(await scene.resolve(technique(scene.state(teulu)), enemy), 'answer'), undefined);
});

test('Schwertantwort schließt bei Schildablenkung erst ab Stufe 18 und Cantref behält die eigene RK', async () => {
  const scene = scenario();
  const enemy = participant('gegner');
  const shield = { id: 'schild', name: 'Magischer Schild', ward: { enabled: true, charges: 1, deflectChance: 100 } };
  const target = { ...enemy, temporaryConditions: [shield] };
  for (const level of [10, 18]) {
    const actor = participant('teulu', 'teulu', level);
    actor.temporaryConditions = [{ id: 'cp-teulu-reply', name: 'Schwertantwort', trainingOpponentId: enemy.characterId, trainingFormId: D.jungdrache }];
    const result = await scene.resolve(technique(actor), target);
    assert.equal(result.wardResolution?.deflected, true);
    assert.equal(result.attack.hit, false);
    assert.equal(Boolean(passive(result, 'closed-guard')), level === 18);
    assert.equal(passive(result, 'answer-damage'), undefined);
  }
  const cantref = technique(participant('cantref', 'cantref', 8, 'spear'), { effects: [guard] });
  cantref.selectedAction.effects.push({ type: 'damage', formula: '1d8', on: 'hit', target: 'target' });
  const thrust = await scene.resolve(cantref, target);
  assert.equal(thrust.wardResolution?.deflected, true);
  assert.equal(Boolean(passive(thrust, 'guard')), false);
  assert(thrust.actorConditionSnapshot.after.some(condition => condition.mechanics.armorClass === 1));
});

function coverSource(profile, distanceMeters, ruleId = 'class-passive-position') {
  return { actorId: profile.characterId, actorName: profile.name, profile, sourceRole: 'support',
    relationToActor: 'enemy', relationToTarget: 'ally', ruleSelections: [{ ruleId, distanceMeters }] };
}

test('Cantref guards cap at two separate attackers, require measured ally cover and expire at the next own post', async () => {
  const cantref = participant('cantref', 'cantref', 20, 'spear');
  const attackers = ['a', 'b', 'c'].map(id => participant(id));
  const [ally, otherAlly] = ['ally-one', 'ally-two'].map(id => participant(id));
  const scene = scenario();
  const guardAction = technique(cantref, { nonDamaging: true, effects: [guard] });
  scene.post(await scene.resolve(guardAction, guardAction));
  const support = () => coverSource(scene.state(cantref), 0.8);
  const covered = (enemy, target, distanceMeters = 1) => scene.resolve(enemy, target, { distanceMeters, ruleSources: [support()] });
  assert.equal(passive(await covered(attackers[0], ally, null), 'line'), undefined);
  assert.equal(passive(await covered(attackers[0], ally, 2), 'line'), undefined);
  const fallen = { ...scene.state(cantref), currentHitPoints: 0 };
  assert.equal(passive(await scene.resolve(attackers[0], ally, { distanceMeters: 1,
    ruleSources: [coverSource(fallen, 0.8)] }), 'line'), undefined);
  const one = await covered(attackers[0], ally);
  assert.equal(passive(one, 'line').effects.damageReduction, 2);
  scene.post(one);
  assert.equal(passive(await covered(attackers[0], otherAlly), 'line'), undefined);
  assert.equal(passive(await covered(attackers[1], ally), 'line'), undefined);
  const two = await covered(attackers[1], otherAlly);
  assert.equal(passive(two, 'line').effects.damageReduction, 2);
  scene.post(two);
  assert.equal(passive(await scene.resolve(attackers[2], scene.state(cantref)), 'line'), undefined);
  scene.history.push({ id: 'owner-next', characterId: cantref.characterId });
  assert.equal(passive(await covered(attackers[2], otherAlly), 'line'), undefined);
});

test('Aldrimari light and area techniques use the same one-point limit per contribution', async () => {
  const actor = participant('skjaldr', 'skjaldr');
  actor.progression.specialLevels = 10;
  const scene = scenario();
  const target = participant('target');
  const light = await scene.resolve(technique(actor, { lightAttack: true }), target, { comment: 'same' });
  assert.equal(passive(light, 'small-damage').effects.damageModifier, 1);
  const area = technique(actor, { maximumTargets: 3 });
  const next = await scene.resolve(area, target, { comment: 'same', usedRuleFrequencyKeys: new Set(light.usedRuleFrequencyKeys) });
  assert.equal(passive(next, 'small-damage'), undefined);
  assert.equal(passive(await scene.resolve(area, target, { comment: 'next' }), 'small-damage').effects.damageModifier, 1);
});

test('Rhyfelwyr depth protection is one real, expiring temporary HP pool', async () => {
  const actor = technique(participant('rhyfelwyr', 'rhyfelwyr'), { nonDamaging: true, effects: [guard], style: 'sirenentanz', form: W.depths });
  const scene = scenario();
  const result = await scene.resolve(actor, actor);
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter, 3);
  scene.post(result);
  assert.equal(scene.state(actor).temporaryHitPoints, 3);
  scene.history.push({ id: 'ally-post', characterId: 'ally' });
  assert.equal(scene.state(actor).temporaryHitPoints, 3);
  scene.history.push({ id: 'owner-next', characterId: actor.characterId });
  assert.equal(scene.state(actor).temporaryHitPoints, 0);
});

test('direkte Furcht- und Zusatzrettung teilen die einmalige Fassung des Rhyfelwyr', async () => {
  const scene = scenario();
  const enemy = participant('feind');
  const veteran = participant('rhyfelwyr', 'rhyfelwyr', 14);
  const fear = { id: 'furcht', name: 'Furcht', tags: 'fear' };
  const curse = { ...enemy, profileActionKind: 'spell', actionResolutionMode: 'saving-throw', actionSaveAttribute: 'willpower',
    actionSpellSaveDc: 12, selectedAction: { kind: 'spell', name: 'Prüfzauber', effects: [
      { type: 'debuff', target: 'target', on: 'save-failure', condition: fear }
    ] } };
  const unrelated = { ...curse, selectedAction: { ...curse.selectedAction, effects: [{ ...curse.selectedAction.effects[0], on: 'always' }] } };
  assert.equal(passive(await scene.resolve(unrelated, veteran, { natural: 10 }), 'steadfast'), undefined);
  const direct = await scene.resolve(curse, veteran, { natural: 10 });
  assert.equal(direct.attack.saveSucceeded, true);
  assert.equal(passive(direct, 'steadfast').effects.savingThrowModifier, 2);
  scene.post(direct);
  const strike = technique(enemy, { secondarySave: { enabled: true, attributeKey: 'willpower', dc: 12, fixedDc: 12, failureCondition: fear } });
  const secondary = await scene.resolve(strike, scene.state(veteran), { save: 10 });
  assert.equal(passive(secondary, 'steadfast'), undefined);
  assert.equal(secondary.secondarySaves[0].succeeded, false);
});

test('Derwyn concentration uses the same linked, still-held focus and preserves old spell records', async () => {
  const stored = sanitizeCharacterCombatProfile({ magic: { channelingFocusWeaponId: 'linked' } });
  assert.equal(stored.magic.channelingFocusWeaponId, 'linked');
  const derwyn = participant('derwyn', 'derwyn', 20, 'staff');
  const enemy = participant('enemy');
  const scene = scenario();
  const guardAction = technique(derwyn, { nonDamaging: true, effects: [guard], style: 'sirenentanz', form: WYRM.rising });
  scene.post(await scene.resolve(guardAction, guardAction));
  const trained = { ...scene.state(derwyn), concentration: { focusWeaponId: derwyn.activeWeaponId } };
  const received = await scene.resolve(enemy, trained);
  assert.equal(passive(received, 'focus').effects.savingThrowModifier, 3);
  assert.equal(passive(received, 'focus-guard').effects.damageReduction, 2);
  const other = { ...trained, concentration: { focusWeaponId: 'other-weapon' } };
  assert.equal(passive(await scene.resolve(enemy, other), 'focus'), undefined);
  assert.equal(passive(await scene.resolve(enemy, { ...trained, concentration: { spellId: 'old' } }), 'focus'), undefined);
});

test('Uchelwyr sit checks and Rhiddwyr landings use different bonuses and never activate on foot', async () => {
  const enemy = participant('enemy');
  const uche = { ...participant('uche', 'uchelwyr'), combat: { mounted: true, mountId: 'horse' } };
  const rhidd = { ...participant('rhidd', 'rhiddwyr'), combat: { mounted: true, mountId: 'horse' } };
  const scene = scenario();
  const seat = await scene.resolve(enemy, uche, { damage: 19 });
  assert.equal(passive(seat, 'seat').effects.savingThrowModifier, 1);
  assert.equal(seat.mountedHitChecks[0].outcome, 'seated');
  const landing = await scene.resolve(enemy, rhidd, { damage: 23, save: 12 });
  assert.equal(passive(landing, 'landing').effects.savingThrowModifier, 2);
  assert.equal(landing.mountedHitChecks[0].outcome, 'landed');
  assert.ok(passive(landing, 'landed'));
  assert.equal(passive(await scene.resolve(enemy, { ...rhidd, combat: {} }, { damage: 23 }), 'landing'), undefined);
});

test('Rhiddwyr saddle protection covers only the named inventory mount', async () => {
  const actor = { ...participant('rider', 'rhiddwyr'), combat: { mounted: true, mountId: 'owned' },
    inventory: { items: [{ id: 'owned', category: 'horse', creatureId: 'horse' }] } };
  const enemy = participant('enemy');
  const scene = scenario();
  const guardAction = technique(actor, { name: 'wyrmtanz-rhiddwyr-sattelwacht', style: 'sirenentanz', form: W.foundation,
    nonDamaging: true, effects: [guard] });
  scene.post(await scene.resolve(guardAction, guardAction));
  const ruleSources = [coverSource(scene.state(actor), null, 'class-passive-mount-position')];
  const guardHit = await scene.resolve(enemy, participant('horse'), { ruleSources });
  assert.equal(passive(guardHit, 'mount-cover').effects.damageReduction, 1);
  assert.equal(passive(await scene.resolve(enemy, participant('other-horse'), { ruleSources }), 'mount-cover'), undefined);
});

test('Helwyr and Barddwyr use a prepared bow shot and a rapier critical in their own forms', async () => {
  const enemy = participant('enemy');
  const helwyr = participant('helwyr', 'helwyr', 20, 'bow', 'shortbow');
  const scene = scenario();
  const aim = technique(helwyr, { form: D.lauernder, nonDamaging: true, effects: [{ ...guard,
    condition: { ...guard.condition, mechanics: { attack: 1 } } }] });
  scene.post(await scene.resolve(aim, aim));
  const shooter = technique(scene.state(helwyr), { form: D.lauernder });
  assert.equal(passive(await scene.resolve(shooter, enemy), 'shot-defense').effects.defenseModifier, -1);
  assert.equal(passive(await scene.resolve(technique(scene.state(helwyr), { form: D.jungdrache }), enemy), 'shot-defense'), undefined);

  const bard = technique(participant('bard', 'barddwyr', 20, 'sword', 'rapier'), { form: D.kreischender, criticalThreshold: 18 });
  const critical = await scene.resolve(bard, enemy, { natural: 18 });
  const tempo = passive(critical, 'rapier-critical');
  assert.equal(tempo.resultEffects[0].condition.triggerRules[0].effects.attackModifier, -2);
  assert.equal(tempo.resultEffects[0].condition.triggerRules[0].requiredTargetId, bard.characterId);
  assert.equal(passive(await scene.resolve(bard, enemy, { natural: 17 }), 'rapier-critical'), undefined);
});

test('Arthwyr pressure uses wounded heavy-form attacks and a paid special action', async () => {
  const source = participant('arthwyr', 'arthwyr', 20, 'axe', 'battleaxe');
  const actor = technique({ ...source, currentHitPoints: 40 }, { form: D.baerenklaue });
  actor.resources.push({ id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 1, scope: 'comment' });
  const noSpecial = await scenario().resolve(actor, participant('enemy'));
  assert.equal(passive(noSpecial, 'wound-damage'), undefined);
  const cost = { resourceId: 'special-action', amount: 1 };
  actor.resourceCosts = actor.resourceCosts.concat(cost);
  actor.selectedAction.costs = actor.selectedAction.costs.concat(cost);
  const result = await scenario().resolve(actor, participant('enemy'));
  assert.equal(passive(result, 'wound-damage').effects.damageModifier, 2);
  assert.ok(result.resourceCosts.some(cost => cost.resourceId === 'special-action'));
});

test('a paid Ceidwyn change enables the Wyrmtanz response and an opening change does not', async () => {
  const source = participant('ceidwyn', 'ceidwyn', 20, 'spear', 'trident');
  source.weapons.push({ id: 'bow', name: 'Kurzbogen', weaponProfileId: 'shortbow', weaponType: 'bow', damageFormula: '1d6' });
  const preparation = { before: { rightWeaponId: 'bow' }, after: { rightWeaponId: source.activeWeaponId }, costs: [{ resourceId: 'bonus-action', amount: 1 }] };
  const actor = technique({ ...source, equipmentPreparation: preparation }, { form: W.current, style: 'sirenentanz', effects: [guard] });
  const target = participant('enemy');
  const result = await scenario().resolve(actor, target);
  assert.equal(passive(result, 'transition-roll').effects.attackModifier, 1);
  const free = await scenario().resolve({ ...actor, equipmentPreparation: { ...preparation, free: true } }, target);
  assert.equal(passive(free, 'transition-roll'), undefined);
});

test('Morwyr records the existing failed line throw and Milwr cover respects both cultural curricula', async () => {
  const enemy = participant('enemy');
  const harpoon = technique(participant('morwyr', 'morwyr', 16, 'spear', 'harpoon'), {
    name: 'wyrmtanz-morwyr-leinenwurf', style: 'sirenentanz', form: W.foundation,
    secondarySave: { enabled: true, dc: 15, attributeKey: 'strength',
      failureCondition: { id: 'martial-position-penalty', name: 'Unsicherer Stand', stanceGroup: 'martial-position-penalty' } }
  });
  const failure = await scenario().resolve(harpoon, enemy, { save: 4 });
  assert.match(passive(failure, 'line-length').resultEffects[0].notes, /intakter, befestigter Leine.*3 m/);
  assert.equal(passive(await scenario().resolve(harpoon, enemy, { save: 20 }), 'line-length'), undefined);

  for (const [classId, style, form] of [['cenyr-milwr', 'drachentanz', D.drachling], ['vennyr-milwr', 'sirenentanz', W.militia]]) {
    const militia = { ...participant(classId, classId, 20, 'spear'), armorItems: [{ kind: 'shield', equipped: true }] };
    const guarded = technique(militia, { style, form, nonDamaging: true, effects: [guard] });
    const scene = scenario();
    scene.post(await scene.resolve(guarded, guarded));
    const support = coverSource(scene.state(militia), 1);
    const ally = participant('ally');
    const supported = await scene.resolve(enemy, ally, { ruleSources: [support] });
    assert.equal(passive(supported, 'formation').effects.damageReduction, 1);
    assert.equal(passive(await scene.resolve(enemy, ally, { ruleSources: [coverSource(scene.state(militia), null)] }), 'formation'), undefined);
  }
});
