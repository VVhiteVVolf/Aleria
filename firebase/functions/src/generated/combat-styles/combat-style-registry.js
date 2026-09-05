import { DRACHENTANZ_COMBAT_STYLE } from './drachentanz/drachentanz-registry.js?v=20260905-damage-balance-v1';

export const COMBAT_STYLE_REGISTRY_SCHEMA_VERSION = 1;

const STYLES = Object.freeze([DRACHENTANZ_COMBAT_STYLE]);

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function normalizedLevel(value) {
  return Math.max(1, Math.min(30, Math.trunc(Number(value) || 1)));
}

function findStyle(styleId) {
  return STYLES.find(style => style.id === String(styleId || '')) || null;
}

function findForm(style, formId) {
  return style?.forms?.find(form => form.id === String(formId || '')) || null;
}

export function getCombatStyleRegistry() {
  return clone({ schemaVersion: COMBAT_STYLE_REGISTRY_SCHEMA_VERSION, styles: STYLES });
}

export function getCombatStyle(styleId) {
  const style = findStyle(styleId);
  return style ? clone(style) : null;
}

export function getCombatStyleForm(styleId, formId) {
  const form = findForm(findStyle(styleId), formId);
  return form ? clone(form) : null;
}

// null means deliberately unscheduled. An explicit class map never falls back
// to the canonical level for an unlisted attack (including future additions).
export function getCombatStyleTechniqueUnlockLevel(grant, technique) {
  const form = findForm(findStyle(grant?.styleId), grant?.formId);
  if (!form || form.minimumLevel == null || grant?.minimumLevel === null) return null;
  const override = grant?.techniqueUnlockLevels;
  const value = override == null ? technique.minimumLevel : override[technique.id];
  if (value == null || !Number.isInteger(value) || value < 1 || value > 30) return null;
  return Math.max(normalizedLevel(grant.minimumLevel), form.minimumLevel, value);
}

export function getCombatStyleTechniquesForGrants(grants = [], level = 1) {
  const targetLevel = normalizedLevel(level);
  const byId = new Map();
  (Array.isArray(grants) ? grants : []).forEach(grant => {
    if (targetLevel < normalizedLevel(grant?.minimumLevel)) return;
    const style = findStyle(grant?.styleId);
    const form = findForm(style, grant?.formId);
    if (!form || form.minimumLevel == null || targetLevel < form.minimumLevel) return;
    (form.techniques || []).forEach(technique => {
      if (technique.status && technique.status !== 'confirmed') return;
      const minimumLevel = getCombatStyleTechniqueUnlockLevel(grant, technique);
      if (minimumLevel == null || targetLevel < minimumLevel) return;
      const existing = byId.get(technique.id);
      if (!existing || minimumLevel < existing.minimumLevel) byId.set(technique.id, { ...clone(technique), minimumLevel });
    });
  });
  return [...byId.values()];
}

export function addMissingCombatStyleTechniques(existing = [], grants = [], level = 1) {
  const result = clone(Array.isArray(existing) ? existing : []);
  const existingIds = new Set(result.map(technique => String(technique?.id || '')).filter(Boolean));
  const added = getCombatStyleTechniquesForGrants(grants, level).filter(technique => !existingIds.has(technique.id));
  return { techniques: [...result, ...added], added };
}

export const combatStyleRegistryInternals = Object.freeze({ normalizedLevel, findStyle, findForm });
