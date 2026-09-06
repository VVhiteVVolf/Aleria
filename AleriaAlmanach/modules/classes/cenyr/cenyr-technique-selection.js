import { isTechniqueCompatibleWithWeapon } from '../../combat/combat-profile-model.js?v=20260906-effect-rolls-v1';
import {
  DRACHENTANZ_FORM_IDS as FORM_IDS
} from '../../combat-styles/drachentanz/drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { getCenyrClassProgression } from './cenyr-class-progression.js?v=20260905-damage-balance-v1';
import { getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260905-cenyr-character-training-v1';
import {
  ensureCenyrTrainingState,
  getCenyrTechniqueSlots,
  getCenyrTrainingState,
  selectCenyrTrainingOption
} from './cenyr-class-training.js?v=20260905-cenyr-character-training-v1';
import { getCenyrWeaponProfileId } from './cenyr-technique-weapon-rules.js?v=20260905-cenyr-character-training-v1';

const RECOMMENDED_EXPERT_PATHS = Object.freeze({
  teulu: FORM_IDS.ausgeglichener,
  cantref: FORM_IDS.abwartender,
  uchelwyr: FORM_IDS.fliegender,
  helwyr: FORM_IDS.fliegender,
  arthwyr: FORM_IDS.bruellender,
  barddwyr: FORM_IDS.kreischender
});

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function normalizeLevel(value) {
  return Math.max(1, Math.min(20, Math.trunc(Number(value) || 1)));
}

function selectedIds(state, kind) {
  return new Set(state.selections.filter(selection => selection.kind === kind).map(selection => selection.selectionId));
}

function occupiedSlotIds(state) {
  return new Set([
    ...state.selections.map(selection => selection.spentTechniqueSlotId),
    ...state.techniqueSelections.map(selection => selection.slotId)
  ].filter(Boolean));
}

function requiredBarddwyrBranch(technique = {}) {
  if (technique.combatStyleFormId === FORM_IDS.jungdrache) return '';
  if ([FORM_IDS.traellernder, FORM_IDS.kreischender].includes(technique.combatStyleFormId)) return 'barddwyr-rapier';
  return 'barddwyr-sword';
}

function isBranchAvailable(definition, state, technique) {
  if (definition.classId !== 'barddwyr') return true;
  const requiredBranch = requiredBarddwyrBranch(technique);
  return !requiredBranch || selectedIds(state, 'branch').has(requiredBranch);
}

function getCompatibleWeapons(profile, definition, technique) {
  const allowedProfiles = technique.cenyrTraining?.classWeaponProfiles?.[definition.classId] || [];
  return (Array.isArray(profile.weapons) ? profile.weapons : []).filter(weapon => {
    if (!isTechniqueCompatibleWithWeapon(technique, weapon)) return false;
    if (!allowedProfiles.length) return true;
    const weaponProfileId = getCenyrWeaponProfileId(weapon) || String(weapon.weaponType || '');
    return allowedProfiles.includes(weaponProfileId);
  });
}

function getAttackCandidates(profile, definition, state, slot, level, excludedTechniqueIds = new Set()) {
  const progression = getCenyrClassProgression(definition.id, level, { classTraining: state });
  const availableForms = new Set(progression.styles.flatMap(style => style.forms)
    .filter(form => form.available)
    .map(form => form.id));
  return progression.attackCatalog
    .filter(technique => !excludedTechniqueIds.has(technique.id))
    .filter(technique => technique.minimumLevel <= slot.level)
    .filter(technique => technique.cenyrTraining?.slotBands?.includes(slot.band))
    .filter(technique => availableForms.has(technique.combatStyleFormId))
    .filter(technique => isBranchAvailable(definition, state, technique))
    .map(technique => {
      const compatibleWeapons = getCompatibleWeapons(profile, definition, technique);
      return {
        ...technique,
        compatibleWeaponIds: compatibleWeapons.map(weapon => weapon.id),
        compatibleWeaponNames: compatibleWeapons.map(weapon => weapon.name),
        weaponCompatible: compatibleWeapons.length > 0,
        equippedWeaponCompatible: compatibleWeapons.some(weapon => weapon.equipped)
      };
    })
    .sort((first, second) => (
      Number(second.equippedWeaponCompatible) - Number(first.equippedWeaponCompatible)
      || Number(second.weaponCompatible) - Number(first.weaponCompatible)
      || second.minimumLevel - first.minimumLevel
      || first.name.localeCompare(second.name, 'de')
    ));
}

export function getCenyrTechniqueChoiceGroups(profile = {}, targetLevelValue = null, options = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return [];
  const level = normalizeLevel(targetLevelValue ?? profile.progression?.level);
  const state = getCenyrTrainingState(profile, definition);
  const occupied = occupiedSlotIds(state);
  const chosenTechniqueIds = new Set(state.techniqueSelections.map(selection => selection.techniqueId));
  const requestedSlotIds = new Set(Array.isArray(options.slotIds) ? options.slotIds : []);
  return getCenyrTechniqueSlots(definition, level)
    .filter(slot => !occupied.has(slot.id))
    .filter(slot => options.allEarned === true || slot.level === level || requestedSlotIds.has(slot.id))
    .map(slot => ({
      kind: 'technique',
      slotId: slot.id,
      slot,
      label: `Attackenslot · ${slot.band} · Stufe ${slot.level}`,
      required: true,
      options: getAttackCandidates(profile, definition, state, slot, level, chosenTechniqueIds)
    }));
}

function materializeTechnique(technique, selection, existing = null, preserveExisting = true) {
  const sourceStatus = technique.status || 'draft';
  // Class-owned rules always follow the catalog; retain only extra character metadata.
  const base = preserveExisting && existing ? { ...clone(existing), ...clone(technique) } : clone(technique);
  return {
    ...base,
    id: technique.id,
    status: 'confirmed',
    active: true,
    combatStyleId: technique.combatStyleId,
    combatStyleFormId: technique.combatStyleFormId,
    cenyrTraining: {
      ...(preserveExisting ? clone(existing?.cenyrTraining || {}) : {}),
      ...clone(technique.cenyrTraining || {}),
      assignedSlotId: selection.slotId,
      selectedAtLevel: selection.selectedAtLevel,
      sourceStatus
    }
  };
}

export function synchronizeCenyrSelectedTechniques(profile = {}, options = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return clone(profile);
  const level = normalizeLevel(options.targetLevel ?? profile.progression?.level);
  const next = ensureCenyrTrainingState(profile);
  const progression = getCenyrClassProgression(definition.id, level, { classTraining: next.classTraining });
  const catalog = new Map(progression.attackCatalog.map(technique => [technique.id, technique]));
  const selected = next.classTraining.techniqueSelections
    .filter(selection => catalog.has(selection.techniqueId));
  const selectedIdsSet = new Set(selected.map(selection => selection.techniqueId));
  const existing = new Map((Array.isArray(next.techniques) ? next.techniques : []).map(technique => [technique.id, technique]));
  const canonicalIds = new Set(catalog.keys());
  const retained = (Array.isArray(next.techniques) ? next.techniques : []).filter(technique => {
    if (canonicalIds.has(technique.id)) return false;
    if (options.replaceClassTechniques !== true) return true;
    const haystack = `${technique.combatStyleId || ''} ${technique.trainingForm || ''} ${technique.tags || ''}`;
    return !/drachentanz|teulu|helwyr|uchelwyr|cantref|arthwyr|barddwyr|milwr/i.test(haystack);
  });
  const learned = selected.map(selection => materializeTechnique(
    catalog.get(selection.techniqueId),
    selection,
    selectedIdsSet.has(selection.techniqueId) ? existing.get(selection.techniqueId) : null,
    options.preserveExisting !== false
  ));
  next.techniques = [...retained, ...learned];
  return next;
}

export function selectCenyrTechniqueForSlot(profile = {}, selection = {}, options = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return { ok: false, errors: ['Das Profil besitzt keine Cenyr-Klassenausbildung.'], profile: clone(profile) };
  const level = normalizeLevel(selection.selectedAtLevel ?? profile.progression?.level);
  const next = ensureCenyrTrainingState(profile);
  const slotId = String(selection.slotId || '');
  const techniqueId = String(selection.techniqueId || '');
  const slot = getCenyrTechniqueSlots(definition, level).find(candidate => candidate.id === slotId);
  if (!slot) return { ok: false, errors: ['Dieser Attackenslot ist auf der gewählten Stufe nicht verfügbar.'], profile: clone(profile) };
  if (next.classTraining.selections.some(entry => entry.spentTechniqueSlotId === slotId)) {
    return { ok: false, errors: ['Dieser Attackenslot wurde bereits für einen zusätzlichen Ausbildungsweg verwendet.'], profile: clone(profile) };
  }
  const current = next.classTraining.techniqueSelections.find(entry => entry.slotId === slotId);
  const excluded = new Set(next.classTraining.techniqueSelections
    .filter(entry => entry.slotId !== slotId)
    .map(entry => entry.techniqueId));
  const candidate = getAttackCandidates(next, definition, next.classTraining, slot, level, excluded)
    .find(technique => technique.id === techniqueId);
  if (!candidate) return { ok: false, errors: ['Diese Attacke passt nicht zu Slot, Form, Pfad oder Klasse.'], profile: clone(profile) };
  const normalized = { slotId, techniqueId, selectedAtLevel: level };
  next.classTraining.techniqueSelections = [
    ...next.classTraining.techniqueSelections.filter(entry => entry.slotId !== slotId && entry.techniqueId !== techniqueId),
    normalized
  ];
  return {
    ok: true,
    errors: [],
    profile: synchronizeCenyrSelectedTechniques(next, options),
    selection: normalized,
    replaced: current || null,
    technique: candidate
  };
}

function preferredBarddwyrBranch(profile = {}) {
  return (profile.weapons || []).some(weapon => getCenyrWeaponProfileId(weapon) === 'rapier')
    ? 'barddwyr-rapier'
    : 'barddwyr-sword';
}

function recommendedTechnique(profile, definition, candidates) {
  if (definition.classId !== 'helwyr') return candidates[0];
  const knownBranches = new Set((profile.techniques || []).map(technique => technique.cenyrTraining?.branchId).filter(Boolean));
  if (!knownBranches.size) return candidates[0];
  // A Helwyr's smaller pool must still cover their carried melee weapons. The
  // first slot follows the main weapon; later slots close gaps before specializing.
  const priority = ['helwyr-classic-sword', 'helwyr-dual-blades', 'helwyr-longbow', 'helwyr-shortbow'];
  return candidates.filter(technique => technique.weaponCompatible
      && priority.includes(technique.cenyrTraining?.branchId) && !knownBranches.has(technique.cenyrTraining.branchId))
    .sort((a, b) => priority.indexOf(a.cenyrTraining.branchId) - priority.indexOf(b.cenyrTraining.branchId))[0] || candidates[0];
}

function pruneTrainingForLevel(profile, definition, level) {
  const next = ensureCenyrTrainingState(profile);
  const earnedSlots = new Set(getCenyrTechniqueSlots(definition, level).map(slot => slot.id));
  next.classTraining.selections = next.classTraining.selections.filter(selection => (
    selection.selectedAtLevel <= level && (!selection.spentTechniqueSlotId || earnedSlots.has(selection.spentTechniqueSlotId))
  ));
  const spent = new Set(next.classTraining.selections.map(selection => selection.spentTechniqueSlotId).filter(Boolean));
  next.classTraining.techniqueSelections = next.classTraining.techniqueSelections.filter(selection => (
    selection.selectedAtLevel <= level && earnedSlots.has(selection.slotId) && !spent.has(selection.slotId)
  ));
  return next;
}

export function reconcileCenyrTrainingForLevel(profile = {}, targetLevelValue = null, options = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return { profile: clone(profile), added: [], pending: [] };
  const level = normalizeLevel(targetLevelValue ?? profile.progression?.level);
  let next = pruneTrainingForLevel(profile, definition, level);
  const added = [];

  if (options.autoFill === true && definition.classId === 'barddwyr' && level >= 7
    && !next.classTraining.selections.some(selection => selection.kind === 'branch')) {
    const branch = selectCenyrTrainingOption(next, {
      kind: 'branch', selectionId: preferredBarddwyrBranch(next), selectedAtLevel: 7
    });
    if (branch.ok) next = branch.profile;
  }
  if (options.autoFill === true && level >= definition.pathSelection.minimumLevel
    && definition.pathSelection.firstSelectionRequired === true
    && !next.classTraining.selections.some(selection => selection.kind === 'path')) {
    const pathId = RECOMMENDED_EXPERT_PATHS[definition.classId];
    const path = selectCenyrTrainingOption(next, {
      kind: 'path', selectionId: pathId, selectedAtLevel: definition.pathSelection.minimumLevel
    });
    if (path.ok) next = path.profile;
  }

  if (options.autoFill === true) {
    // Rebuild the choices after every pick. Candidate lists exclude techniques
    // selected so far; using one initial snapshot could therefore try to place
    // the same attack into several differently timed slots.
    while (true) {
      const group = getCenyrTechniqueChoiceGroups(next, level, { allEarned: true })
        .find(choice => choice.options.length > 0);
      if (!group) break;
      const candidate = recommendedTechnique(next, definition, group.options);
      const selected = selectCenyrTechniqueForSlot(next, {
        slotId: group.slotId,
        techniqueId: candidate.id,
        selectedAtLevel: Math.max(group.slot.level, candidate.minimumLevel)
      }, { preserveExisting: options.preserveExisting });
      if (!selected.ok) break;
      next = selected.profile;
      added.push({ slotId: group.slotId, technique: selected.technique });
    }
  }

  next = synchronizeCenyrSelectedTechniques(next, {
    targetLevel: level,
    preserveExisting: options.preserveExisting,
    replaceClassTechniques: options.replaceClassTechniques
  });
  const pending = getCenyrTechniqueChoiceGroups(next, level, { allEarned: true });
  return { profile: next, added, pending };
}

export const cenyrTechniqueSelectionInternals = Object.freeze({
  RECOMMENDED_EXPERT_PATHS,
  normalizeLevel,
  occupiedSlotIds,
  requiredBarddwyrBranch,
  getCompatibleWeapons,
  getAttackCandidates,
  pruneTrainingForLevel
});
