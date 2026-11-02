import { SUBSTANCE_ITEM_CATALOG } from './substance-item-catalog.js';
import { normalizeSubstanceExposure } from './substance-profiles.js';

const catalog = new Map(SUBSTANCE_ITEM_CATALOG.flatMap(record => [record.definitionId, ...record.offerIds].map(id => [id, record])));
export function getItemSubstanceProfile(item = {}, definition = null) {
  if (definition?.useDefinition?.substance) return normalizeSubstanceExposure(definition.useDefinition.substance);
  const referenceId = definition?.id || item.definitionRef?.id;
  const entry = catalog.get(referenceId) || (!referenceId ? [item.templateId, item.originItemDbKey, item.itemDbKey, item.id].map(id => catalog.get(id)).find(Boolean) : null);
  return entry ? { ...entry.exposure, ...(entry.volumeMl ? { volumeMl: entry.volumeMl, abv: entry.abv } : {}) } : null;
}
export function getConsumedSubstanceExposure(item, definition, quantity = 1) {
  const exposure = getItemSubstanceProfile(item, definition);
  return exposure ? { ...exposure, amount: exposure.amount * quantity } : null;
}
export function formatSubstanceExposure(item, definition = null) {
  const profile = getItemSubstanceProfile(item, definition);
  return profile ? `${profile.kind === 'alcohol' ? 'Alkoholbelastung' : 'Wirkdosen'} je ganzem Exemplar: ${Number(profile.amount.toFixed(2))}. Größe und Inhalt zählen; Flaschen und Fässer sind keine Einzelgläser.` : '';
}
