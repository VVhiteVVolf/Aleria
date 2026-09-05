import { CENYR_FORM_LABELS, getCenyrClassDefinitionForProfile } from './cenyr-class-registry.js?v=20260905-cenyr-character-training-v1';

const SELECTION_KINDS = new Set(['path', 'branch']);

function normalizeLevel(value) {
  return Math.max(1, Math.min(20, Math.trunc(Number(value) || 1)));
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export function getCenyrTechniqueSlots(definition, level = 20, options = {}) {
  const maximumLevel = normalizeLevel(level);
  const band = String(options.band || '');
  return (definition?.techniqueBudget?.slots || [])
    .filter(slot => slot.level <= maximumLevel && (!band || slot.band === band))
    .map(slot => ({ ...slot }));
}

export function getCenyrTrainingState(profile = {}, definitionValue = null) {
  const definition = definitionValue || getCenyrClassDefinitionForProfile(profile);
  const source = profile.classTraining || {};
  if (!definition) return null;
  const sameCurriculum = !source.curriculumId || source.curriculumId === definition.id;
  const selections = (Array.isArray(source.selections) ? source.selections : [])
    .filter(() => sameCurriculum)
    .filter(selection => SELECTION_KINDS.has(selection.kind))
    .filter(selection => selection.selectionId)
    .map(selection => ({
      kind: selection.kind,
      selectionId: String(selection.selectionId),
      selectedAtLevel: normalizeLevel(selection.selectedAtLevel),
      spentTechniqueSlotId: String(selection.spentTechniqueSlotId || '')
    }));
  const techniqueSelections = (Array.isArray(source.techniqueSelections) ? source.techniqueSelections : [])
    .filter(() => sameCurriculum)
    .filter(selection => selection?.slotId && selection?.techniqueId)
    .map(selection => ({
      slotId: String(selection.slotId),
      techniqueId: String(selection.techniqueId),
      selectedAtLevel: normalizeLevel(selection.selectedAtLevel)
    }));
  return {
    schemaVersion: 2,
    curriculumId: definition.id,
    selections: selections.filter((selection, index) => selections.findIndex(candidate => (
      candidate.kind === selection.kind && candidate.selectionId === selection.selectionId
    )) === index),
    techniqueSelections: techniqueSelections.filter((selection, index) => techniqueSelections.findIndex(candidate => (
      candidate.slotId === selection.slotId || candidate.techniqueId === selection.techniqueId
    )) === index)
  };
}

export function ensureCenyrTrainingState(profile = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return clone(profile);
  return { ...clone(profile), classTraining: getCenyrTrainingState(profile, definition) };
}

export function getCenyrLevelUpTrainingChoices(profile = {}, targetLevelValue = null) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return [];
  const targetLevel = normalizeLevel(targetLevelValue ?? ((Number(profile.progression?.level) || 1) + 1));
  const state = getCenyrTrainingState(profile, definition);
  const selectedPaths = new Set(state.selections.filter(item => item.kind === 'path').map(item => item.selectionId));
  const selectedBranches = new Set(state.selections.filter(item => item.kind === 'branch').map(item => item.selectionId));
  const groups = [];

  if (definition.classId === 'barddwyr' && targetLevel >= 7) {
    const options = definition.trainingBranches
      .filter(branch => ['barddwyr-sword', 'barddwyr-rapier'].includes(branch.id) && !selectedBranches.has(branch.id))
      .map(branch => ({ id: branch.id, name: branch.name }));
    if (options.length) groups.push({
      kind: 'branch',
      label: selectedBranches.size ? 'Zusätzlicher Waffenweg' : 'Hauptwaffenweg',
      required: selectedBranches.size === 0,
      options
    });
  }

  if (definition.pathSelection?.multiplePathsAllowed && targetLevel >= definition.pathSelection.minimumLevel) {
    const options = (definition.pathSelection.allowedFormIds || [])
      .filter(formId => !selectedPaths.has(formId))
      .map(formId => ({ id: formId, name: CENYR_FORM_LABELS[formId] || formId }));
    if (options.length) groups.push({
      kind: 'path',
      label: selectedPaths.size ? 'Weiterer Expertenpfad' : 'Erster Expertenpfad',
      required: selectedPaths.size === 0 && definition.pathSelection.firstSelectionRequired === true,
      options
    });
  }

  return groups;
}

function getSelectionRule(definition, kind, selectionId) {
  if (kind === 'path') {
    const access = definition.formAccess.find(entry => entry.formId === selectionId);
    const allowed = definition.pathSelection?.allowedFormIds || [];
    if (!access || access.status === 'blocked' || !allowed.includes(selectionId)) return null;
    return { minimumLevel: Math.max(access.minimumLevel, definition.pathSelection.minimumLevel), band: 'expert' };
  }
  const branch = definition.trainingBranches.find(entry => entry.id === selectionId);
  if (!branch) return null;
  if (definition.classId === 'barddwyr' && ['barddwyr-sword', 'barddwyr-rapier'].includes(selectionId)) {
    return { minimumLevel: 7, band: 'duelist' };
  }
  return { minimumLevel: branch.minimumLevel, band: branch.minimumLevel >= 9 ? 'expert' : (branch.minimumLevel >= 7 ? 'duelist' : 'foundation') };
}

function getFreeSelectionCount(definition, kind, minimumLevel) {
  if (kind === 'path') return definition.pathSelection?.firstSelectionCost === 0 ? 1 : 0;
  if (kind === 'branch' && definition.classId === 'barddwyr' && minimumLevel <= 7) return 1;
  return 0;
}

// This is the persistence boundary for later path/branch pickers. Opening a second
// path (or the Barddwyr's second weapon branch) reserves a real attack slot.
export function selectCenyrTrainingOption(profile = {}, selection = {}) {
  const definition = getCenyrClassDefinitionForProfile(profile);
  if (!definition) return { ok: false, errors: ['Das Profil besitzt keine Cenyr-Klassenausbildung.'], profile: clone(profile) };
  const kind = SELECTION_KINDS.has(selection.kind) ? selection.kind : '';
  const selectionId = String(selection.selectionId || '');
  const level = normalizeLevel(selection.selectedAtLevel ?? profile.progression?.level);
  const rule = getSelectionRule(definition, kind, selectionId);
  if (!rule) return { ok: false, errors: ['Diese Ausbildung steht der Klasse nicht zur Verfügung.'], profile: clone(profile) };
  if (level < rule.minimumLevel) return { ok: false, errors: [`Diese Ausbildung beginnt erst auf Stufe ${rule.minimumLevel}.`], profile: clone(profile) };

  const next = ensureCenyrTrainingState(profile);
  const existing = next.classTraining.selections.find(entry => entry.kind === kind && entry.selectionId === selectionId);
  if (existing) return { ok: true, errors: [], profile: next, selection: existing, spentSlot: null };
  const sameKindSelections = next.classTraining.selections.filter(entry => entry.kind === kind);
  const freeCount = getFreeSelectionCount(definition, kind, rule.minimumLevel);
  let spentSlot = null;
  if (sameKindSelections.length >= freeCount) {
    const occupied = new Set(next.classTraining.selections.map(entry => entry.spentTechniqueSlotId).filter(Boolean));
    next.classTraining.techniqueSelections.forEach(entry => occupied.add(entry.slotId));
    spentSlot = getCenyrTechniqueSlots(definition, level, { band: rule.band })
      .filter(slot => !occupied.has(slot.id))
      .sort((first, second) => second.level - first.level)[0] || null;
    if (!spentSlot) return { ok: false, errors: ['Für diese zusätzliche Ausbildung ist noch kein freier Attackenslot verfügbar.'], profile: clone(profile) };
  }
  const normalizedSelection = {
    kind,
    selectionId,
    selectedAtLevel: level,
    spentTechniqueSlotId: spentSlot?.id || ''
  };
  next.classTraining.selections.push(normalizedSelection);
  return { ok: true, errors: [], profile: next, selection: normalizedSelection, spentSlot };
}

export const cenyrClassTrainingInternals = Object.freeze({
  SELECTION_KINDS,
  normalizeLevel,
  getSelectionRule,
  getFreeSelectionCount
});
