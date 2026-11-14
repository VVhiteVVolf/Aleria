import { getSkillDefinition, normalizeSkillCheckSettings } from '../skill-checks/skill-check-model.js';

export const SCENE_ELEMENT_TYPES = Object.freeze([
  { id: 'challenge', label: 'Herausforderung', shortLabel: 'Aufgabe', symbol: '◇', description: 'Mehrere Wege, Proben und vorbereitete Folgen.' },
  { id: 'narration', label: 'Erzählelement', shortLabel: 'Erzählung', symbol: '≋', description: 'Bild und Flavortext, ohne erforderliche Reaktion.' },
  { id: 'item', label: 'Gegenstand', symbol: '♧', description: 'Etwas untersuchen, berühren oder damit handeln.' },
  { id: 'puzzle', label: 'Rätsel', symbol: '?', description: 'Hinweise entdecken und eine Lösung aufdecken.' },
  { id: 'danger', label: 'Gefahr', symbol: '!', description: 'Verborgen vorbereiten, entdecken und darauf reagieren.' }
]);
const text = (value, max = 240) => String(value || '').trim().slice(0, max);
const number = (value, fallback, min, max) => Number.isInteger(Number(value))
  ? Math.max(min, Math.min(max, Number(value))) : fallback;
export const getSceneElementType = id => SCENE_ELEMENT_TYPES.find(type => type.id === id) || SCENE_ELEMENT_TYPES[0];

export function normalizeSceneElementActivation(value = {}, elementType = 'challenge') {
  const source = value && typeof value === 'object' ? value : {};
  const enabled = source.enabled === true || (elementType === 'danger' && source.enabled !== false);
  const conditions = (Array.isArray(source.conditions) ? source.conditions : enabled ? [{ type: 'comments', minimum: 6 }] : [])
    .slice(0, 6).map(condition => ({
      type: ['comments', 'passive', 'interaction'].includes(condition?.type) ? condition.type : 'comments',
      ...(condition?.type === 'passive' ? { skillId: text(condition.skillId, 60) || 'perception',
        minimum: number(condition.minimum, 21, -99, 99), requiredSense: normalizeSense(condition.requiredSense) }
        : condition?.type === 'interaction' ? { sourceId: text(condition.sourceId) }
          : { minimum: number(condition?.minimum, 6, 1, 999) })
    }));
  return { enabled, showSignal: source.showSignal === true, mode: source.mode === 'all' ? 'all' : 'any', conditions,
    saveContext: normalizeSkillCheckSettings({ saveContext: source.saveContext }).saveContext,
    target: { mode: source.target?.mode === 'fixed' ? 'fixed' : 'random', actorId: text(source.target?.actorId) },
    detection: { enabled: source.detection?.enabled !== false, skillId: text(source.detection?.skillId, 60) || 'perception',
      difficulty: number(source.detection?.difficulty, 15, 1, 40), requiredSense: normalizeSense(source.detection?.requiredSense),
      detectedText: text(source.detection?.detectedText, 2000), missedText: text(source.detection?.missedText, 2000) }
  };
}

function normalizeSense(value) { return ['vision', 'hearing', 'smell', 'touch', 'taste'].includes(value) ? value : ''; }

export function validateSceneElementConfiguration(event = {}) {
  const issues = [];
  const error = message => issues.push({ field: 'activation', message });
  if (event.elementType != null && !SCENE_ELEMENT_TYPES.some(type => type.id === event.elementType)) {
    issues.push({ field: 'elementType', message: 'Eine gültige Elementart wählen.' });
  }
  if (event.completionMode != null && !['any', 'all'].includes(event.completionMode)) issues.push({ field: 'completionMode', message: 'Eine gültige Abschlussregel wählen.' });
  const activation = event.activation;
  if (activation != null && (typeof activation !== 'object' || Array.isArray(activation))) {
    error('Die Auslösung muss ein Objekt sein.'); return issues;
  }
  if (activation?.enabled != null && typeof activation.enabled !== 'boolean') error('Die verzögerte Auslösung muss true oder false sein.');
  if (activation?.showSignal != null && typeof activation.showSignal !== 'boolean') error('Das Interaktionssymbol muss true oder false sein.');
  for (const key of ['target', 'detection', 'saveContext']) if (activation?.[key] != null && (typeof activation[key] !== 'object' || Array.isArray(activation[key]))) error(`Die Einstellung ${key} muss ein Objekt sein.`);
  if (event.elementType === 'narration' && (event.approaches?.length || activation?.enabled)) error('Ein Erzählelement hat keine Proben oder Auslöser.');
  if (event.elementType === 'danger' && activation?.enabled === false && !event.sceneElementId) error('Eine Gefahr benötigt einen Auslöser.');
  if (!normalizeSceneElementActivation(activation, event.elementType).enabled) return issues;
  if (activation?.mode != null && !['all', 'any'].includes(activation.mode)) error('Bedingungen mit UND oder ODER verknüpfen.');
  if (!Array.isArray(activation?.conditions) || !activation.conditions.length || activation.conditions.length > 6) {
    error('Eine bis sechs Auslösebedingungen vorbereiten.'); return issues;
  }
  for (const condition of activation.conditions) {
    if (!['comments', 'passive', 'interaction'].includes(condition?.type)) error('Unbekannte Auslösebedingung.');
    if (['comments', 'passive'].includes(condition?.type)) {
      const min = condition.type === 'comments' ? 1 : -99, max = condition.type === 'comments' ? 999 : 99;
      if (!Number.isInteger(condition.minimum) || condition.minimum < min || condition.minimum > max) error(`Die Bedingung benötigt eine ganze Schwelle von ${min} bis ${max}.`);
    }
    if (condition?.type === 'passive' && !getSkillDefinition(condition.skillId)) error('Für eine passive Bedingung eine gültige Fertigkeit wählen.');
    if (condition?.type === 'interaction' && condition.sourceId != null && (typeof condition.sourceId !== 'string' || condition.sourceId.length > 240 || condition.sourceId.includes('/'))) error('Die Interaktionsquelle ist ungültig.');
    if (condition?.type === 'interaction' && !condition.sourceId && event.elementType !== 'item' && activation.showSignal !== true) error('Für eine Interaktion mit diesem verborgenen Element vorher das Interaktionssymbol zeigen oder eine vorhandene Quelle wählen.');
    if (condition?.requiredSense && !normalizeSense(condition.requiredSense)) error('Der benötigte Sinn ist ungültig.');
  }
  if (activation?.target?.mode != null && !['fixed', 'random'].includes(activation.target.mode)) error('Die Zielwahl ist ungültig.');
  if (activation?.target?.mode === 'fixed' && !text(activation.target.actorId)) error('Eine feste Zielfigur wählen.');
  const detection = activation?.detection;
  if (detection?.enabled != null && typeof detection.enabled !== 'boolean') error('Die Entdeckungsprobe muss true oder false sein.');
  if (detection?.enabled !== false) {
    if (detection?.skillId && !getSkillDefinition(detection.skillId)) error('Eine gültige Fertigkeit für die Entdeckungsprobe wählen.');
    if (detection?.difficulty != null && (!Number.isInteger(detection.difficulty) || detection.difficulty < 1 || detection.difficulty > 40)) error('Die Entdeckungs-SG muss zwischen 1 und 40 liegen.');
    if (detection?.requiredSense && !normalizeSense(detection.requiredSense)) error('Der benötigte Sinn ist ungültig.');
  }
  return issues;
}

// Authored exports never carry a server-selected reaction or an old reveal receipt.
export function normalizeSceneElementReaction(value) {
  if (!value?.actorId) return null;
  return { actorId: text(value.actorId), actorName: text(value.actorName, 160), detected: value.detected === true,
    rollMode: value.detected === true ? 'advantage' : 'disadvantage',
    saveContext: normalizeSkillCheckSettings({ saveContext: value.saveContext }).saveContext,
    description: text(value.description, 2000), detection: value.detection && typeof value.detection === 'object' ? value.detection : null };
}

export { isSceneElementSignal, isPublicSceneElementComment } from './scene-element-visibility.js';
