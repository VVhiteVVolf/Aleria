import { ELEMENTARISMUS_V1 } from './elementarismus-v1.js';
import { ELEMENTE_V2 } from './elemente-v2/index.js';
import { RESTITUTION_V1 } from './restitution-v1/index.js';
import { getSpellCatalogSchool } from './spell-catalog-schools.js';
import { getDefaultActivationCosts } from '../combat/combat-action-economy.js';
import { getSpellManaCost } from '../combat/combat-resource-progression.js';

// Kept for older Elemente consumers. New consumers select a school explicitly.
export const SPELL_CATALOG_SECTIONS = Object.freeze(getSpellCatalogSchool('elemente').sections);

// Revisions are immutable editions, not timestamps. Add a new edition instead
// of silently changing the rules of an already learned character spell.
const catalogs = new Map([
  ['elemente', { current: 2, editions: new Map([[1, ELEMENTARISMUS_V1], [2, ELEMENTE_V2]]) }],
  ['restitution', { current: 1, editions: new Map([[1, RESTITUTION_V1]]) }]
]);
const editions = new Map([...catalogs.values()].flatMap(catalog => [...catalog.editions.values()].flat())
  .map(spell => [`${spell.id}@${spell.revision}`, spell]));
const currentEntries = new Map([...catalogs.values()].flatMap(catalog => catalog.editions.get(catalog.current)).map(spell => [spell.id, spell]));
const clone = value => JSON.parse(JSON.stringify(value));

export function normalizeSpellCatalogReference(value) {
  if (!value || typeof value !== 'object') return null;
  const id = String(value.id || '').trim().slice(0, 120);
  const revision = Number(value.revision);
  return /^[a-z0-9-]+$/.test(id) && Number.isSafeInteger(revision) && revision > 0
    ? { id, revision } : null;
}

export function getSpellCatalogEntry(id, revision) {
  const entry = revision === undefined ? currentEntries.get(id) : editions.get(`${id}@${revision}`);
  return entry ? clone(entry) : null;
}

export function listSpellCatalogEntries({ catalog = 'elemente', revision } = {}) {
  const selected = catalogs.get(catalog);
  return (selected?.editions.get(revision ?? selected.current) || []).map(clone);
}

export function getSpellCatalogForm(entry, level = entry.level) {
  return Number(level) === entry.level ? { ...entry, changes: '' }
    : entry.forms.find(form => form.level === Number(level)) || null;
}

export function getSpellCatalogPageHref(reference, rootPrefix = '../') {
  const entry = getSpellCatalogEntry(reference?.id, reference?.revision);
  return entry ? `${rootPrefix}${entry.pagePath}#${entry.id}` : '';
}

function spellDescription(entry, form) {
  let effect = form.effect || entry.effect;
  entry.damage.forEach((part, index) => {
    const replacement = form.damage[index];
    if (replacement) effect = effect.replace(part.formula.toUpperCase().replaceAll('D', 'W'), replacement.formula.toUpperCase().replaceAll('D', 'W'));
  });
  if (entry.protectionRoll && form.protectionRoll) {
    const pattern = entry.protectionRoll.toUpperCase().replaceAll('D', 'W').split('+').map(part => part.trim()).join('\\s*\\+\\s*');
    effect = effect.replace(new RegExp(pattern), form.protectionRoll.toUpperCase().replaceAll('D', 'W'));
  }
  const changes = form.changes ? `Wirkungsgrad ${form.level}: ${form.changes}. Diese Werte ersetzen die entsprechenden Grundwerte.` : '';
  return [effect, entry.limits, changes].filter(Boolean).join('\n');
}

export function createCatalogSpell(id, { revision, level, manaResourceId = 'mana-focus' } = {}) {
  const entry = getSpellCatalogEntry(id, revision);
  if (!entry) return null;
  const form = getSpellCatalogForm(entry, level ?? entry.level);
  if (!form) return null;
  const damageEffects = form.damage.map((part, index) => ({
    id: `${entry.id}-damage-${index + 1}`, type: 'damage', target: form.maximumTargets > 1 ? 'selected' : 'target',
    ...part, magical: true, on: 'hit'
  }));
  const authoredEffects = (form.effects || []).map((effect, index) => ({
    ...clone(effect), id: `${entry.id}-${effect.type}-${index + 1}`
  }));
  const manualResolution = form.manualResolution ?? entry.manualResolution;
  const procedure = [manualResolution, !damageEffects.length ? spellDescription(entry, form) : '', form.changes].filter(Boolean).join('\n');
  const effects = [...damageEffects, ...authoredEffects];
  // A narrated effect is a real, non-damaging combat action. Protection and
  // structure rolls are reported without applying them to a creature's HP.
  if (procedure || !effects.length) effects.push({
    id: `${entry.id}-procedure`, type: 'narrative', target: form.maximumTargets > 1 ? 'selected' : 'target', on: 'always',
    formula: form.guidedRoll || form.protectionRoll || '', notes: procedure || entry.effect
  });
  return {
    id: entry.id, catalogReference: { id: entry.id, revision: entry.revision },
    name: entry.name, school: entry.school, level: form.level,
    maximumTargets: form.maximumTargets,
    icon: entry.iconPath ? `../${entry.iconPath}` : '',
    manaCost: getSpellManaCost(form.level), activationType: form.actionIds[0],
    costs: [...form.actionIds.flatMap(getDefaultActivationCosts), {
      id: `${entry.id}-mana`, resourceId: manaResourceId,
      name: manaResourceId === 'pact-points' ? 'Paktpunkte' : 'Mana',
      amount: getSpellManaCost(form.level), scope: 'persistent'
    }],
    resolutionType: entry.resolutionType, saveAttribute: entry.saveAttribute,
    halfDamageOnSave: entry.resolutionType === 'saving-throw' && damageEffects.length > 0,
    rollFormula: form.damage[0]?.formula || '', damageType: form.damage[0]?.damageType || '',
    description: spellDescription(entry, form), effects,
    range: form.range || entry.range, duration: form.duration || entry.duration, requirements: entry.requirements,
    tags: `${entry.school}; ${getSpellCatalogSchool(entry.catalog || 'elemente')?.sections.find(section => section.id === entry.section)?.name || ''}; ${entry.role}`,
    concentration: entry.concentration, channelComments: entry.channelComments,
    upcast: { enabled: entry.forms.length > 0, formulaPerLevel: '', amountPerLevel: 0,
      maximumLevel: entry.forms.at(-1)?.level || Math.max(1, entry.level) },
    prepared: true, auraBypass: { allowed: true, resourceId: '', cost: 1 },
    aiInstructions: manualResolution
  };
}

export function resolveCatalogSpellSnapshot(value = {}, manaResourceId = 'mana-focus') {
  const reference = normalizeSpellCatalogReference(value.catalogReference);
  if (!reference) return value;
  const canonical = createCatalogSpell(reference.id, { revision: reference.revision, manaResourceId });
  if (!canonical) return value; // Preserve an unavailable edition's saved snapshot.
  return { ...value, ...canonical, id: value.id || canonical.id,
    prepared: value.prepared ?? true, slotResourceId: value.slotResourceId };
}

export function detachCatalogSpell(value = {}) {
  if (!value.catalogReference) return value;
  const { catalogReference, ...snapshot } = value;
  // An edited copy must not retain authored higher forms it no longer follows.
  return { ...snapshot, catalogOrigin: normalizeSpellCatalogReference(catalogReference),
    upcast: { enabled: false, formulaPerLevel: '', amountPerLevel: 0, maximumLevel: Math.max(1, Number(value.level) || 0) } };
}
