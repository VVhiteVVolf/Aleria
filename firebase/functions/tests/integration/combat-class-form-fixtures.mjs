import assert from 'node:assert/strict';
import { DRACHENTANZ_FORM_IDS as D } from '../../../../AleriaAlmanach/modules/combat-styles/drachentanz/drachentanz-ids.js';
import { DERWYN_FORM_IDS as W } from '../../../../AleriaAlmanach/modules/combat-styles/sirenentanz/sirenentanz-forms.js';
import { getCenyrFormLabel } from '../../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { selectCenyrTrainingOption } from '../../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-training.js';
import { getCenyrTechniqueChoiceGroups, selectCenyrTechniqueForSlot, reconcileCenyrTrainingForLevel } from '../../../../AleriaAlmanach/modules/classes/cenyr/cenyr-technique-selection.js';
import { sanitizeCharacterCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';

// The expected access is deliberately specified independently of the registry.
const classic = [D.schwertdrache, D.abwartender, D.fliegender, D.aufsteigender, D.bruellender, D.ausgeglichener, D.zwillingsdrache];
const spears = [D.speerdrache, D.peitschender, D.huetender];
const classForms = {
  teulu: classic, cantref: spears, uchelwyr: [...spears, D.stuermender, D.schweifender],
  helwyr: [...classic, D.lauernder, D.jagender], arthwyr: [...classic, D.baerenklaue],
  barddwyr: [D.schwertdrache, D.traellernder, D.kreischender]
};
export const CLASS_FORM_CASES = [
  ...Object.entries(classForms).flatMap(([classId, forms]) => forms.map(formId => ({ classId, formId }))),
  ...[D.jungdrache, W.foundation].flatMap(foundation => [W.flowing, W.breaking, W.rising, W.whipping]
    .map(formId => ({ classId: 'derwyn', formId, foundation })))
].map((entry, index) => ({ ...entry, id: `class-form-${index + 1}`,
  title: `${entry.classId} · ${getCenyrFormLabel(entry.formId)}${entry.foundation ? ` · ${entry.foundation === D.jungdrache ? 'Cenyr' : 'Vennyr'}` : ''}` }));

const weapons = [
  ['sword', 'sword', 'Schwert'], ['spear', 'spear', 'Speer'], ['lance', 'spear', 'Lanze'],
  ['rapier', 'sword', 'Rapier'], ['greatsword', 'sword', 'Großschwert'],
  ['dual-swords', 'sword', 'Schwertpaar'], ['dual-daggers', 'dagger', 'Dolchpaar'],
  ['shortsword', 'sword', 'Kurzschwert'], ['dagger', 'dagger', 'Dolch'],
  ['longbow', 'bow', 'Langbogen'], ['shortbow', 'bow', 'Kurzbogen'],
  ['trident', 'spear', 'Dreizack'], ['staff', 'staff', 'Kampfstab'], ['morningstar', 'mace', 'Morgenstern']
].map(([id, weaponType, name]) => ({ id, weaponProfileId: id, weaponType, name,
  damageFormula: '1d8', attackAttribute: 'strength', damageAttribute: 'strength', damageType: 'physisch',
  range: weaponType === 'bow' ? 'Fernkampf' : 'Nahkampf', equipped: id === 'sword' }));

function choose(profile, kind, selectionId, selectedAtLevel) {
  const result = selectCenyrTrainingOption(profile, { kind, selectionId, selectedAtLevel });
  assert(result.ok, `${kind} ${selectionId}: ${result.errors.join(' ')}`);
  return result.profile;
}

export function createClassFormActor(entry, { techniqueId = '' } = {}) {
  let profile = sanitizeCharacterCombatProfile({
    templateSelections: { classId: entry.classId },
    identity: { ancestry: entry.foundation === W.foundation ? 'Vennyr' : 'Cenyr', archetype: entry.classId },
    progression: { level: 20 }, hitPoints: { current: 80, maximumOverride: 80 }, armorClass: { base: 12 },
    attributes: ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'].map(key => ({ key, score: 14 })),
    combat: { mounted: entry.classId === 'uchelwyr', mainHandWeaponId: 'sword' }, weapons
  });
  if (entry.foundation) profile = choose(profile, 'foundation', entry.foundation, 1);
  if (entry.classId === 'barddwyr') profile = choose(profile, 'branch', entry.formId === D.schwertdrache ? 'barddwyr-sword' : 'barddwyr-rapier', 7);
  if (entry.formId === D.aufsteigender) profile = choose(profile, 'path', D.fliegender, 9);
  profile = choose(profile, 'path', entry.formId === D.traellernder ? D.kreischender : entry.formId, entry.formId === D.aufsteigender ? 20 : 9);
  const groups = getCenyrTechniqueChoiceGroups(profile, 20, { allEarned: true });
  const candidates = groups.flatMap(group => group.options.filter(option => option.combatStyleFormId === entry.formId)
    .map(option => ({ group, option })));
  const selected = techniqueId ? candidates.find(({ option }) => option.id === techniqueId)
    : candidates.find(({ option }) => option.damageModel?.mode === 'weapon-dice' || Boolean(option.damageFormula));
  assert(selected, `${entry.title}: regulär erlernbare Technik ${techniqueId}`);
  const learned = selectCenyrTechniqueForSlot(profile, {
    slotId: selected.group.slotId, techniqueId: selected.option.id, selectedAtLevel: 20
  });
  assert(learned.ok, learned.errors.join(' '));
  profile = reconcileCenyrTrainingForLevel(learned.profile, 20, { autoFill: true }).profile;
  const technique = profile.techniques.find(item => item.id === selected.option.id);
  assert(technique, 'Technik übersteht die reguläre Ausbildungssynchronisierung');
  const equipped = profile.weapons.find(item => selected.option.compatibleWeaponIds.includes(item.id));
  assert(equipped, `${entry.title}: passende Waffe`);
  profile.combat.mainHandWeaponId = equipped.id;
  profile.weapons.forEach(item => { item.equipped = item.id === equipped.id; });
  if (technique.cenyrTraining?.requiresShield) profile.armorItems = [{ id: 'test-shield', name: 'Schild', kind: 'shield', equipped: true }];
  const actor = { id: `${entry.id}-fighter`, name: `Prüffigur ${entry.title}`, combatProfile: sanitizeCharacterCombatProfile(profile), inventory: { items: [] } };
  const actionId = `technique:${technique.id}`;
  const resolved = resolveCombatProfile(actor, { actionId });
  assert.equal(resolved.selectedAction.id, actionId);
  assert.equal(resolved.selectedAction.compatible, true, `${entry.title}: ${resolved.selectedAction.disabledReason}`);
  return { actor, actionId, technique, weapon: equipped,
    weaponGrip: technique.cenyrTraining?.requiresTwoHands ? 'two-handed' : 'one-handed',
    distanceMeters: equipped.weaponType === 'bow' ? 18 : 1.5 };
}

export function createFormOpponent(id = 'form-opponent') {
  return { id, name: 'Prüfgegner', inventory: { items: [] }, combatProfile: sanitizeCharacterCombatProfile({
    progression: { level: 9 }, hitPoints: { current: 60, maximumOverride: 60 }, armorClass: { base: 12 },
    attributes: [{ key: 'strength', score: 14 }, { key: 'constitution', score: 14 }],
    weapons: [{ id: 'practice-sword', name: 'Übungsschwert', weaponType: 'sword', weaponProfileId: 'sword', damageFormula: '1d6', equipped: true }]
  }) };
}

export const COMPLETE_FIGHT_CASES = [
  ['teulu', D.schwertdrache], ['cantref', D.huetender], ['uchelwyr', D.stuermender],
  ['helwyr', D.jagender], ['barddwyr', D.kreischender], ['arthwyr', D.baerenklaue],
  ['derwyn', W.flowing, D.jungdrache], ['derwyn', W.breaking, W.foundation],
  ['derwyn', W.rising, W.foundation], ['derwyn', W.whipping, D.jungdrache]
].map(([classId, formId, foundation]) => CLASS_FORM_CASES.find(entry => entry.classId === classId && entry.formId === formId && entry.foundation === foundation));
