// Definition data is immutable once referenced. Possession and live state never
// belong here. This contract is shared by the builder, catalogues and server.
export const ITEM_DEFINITION_SCHEMA = 1;
import { normalizeEquipmentPreparationCosts } from '../character-equipment/equipment-preparation-costs.js';
import { normalizeSubstanceExposure } from '../character-health/substance-profiles.js';
import { normalizeEquipmentPassiveEffects } from '../character-equipment/equipment-passive-effects.js';
export const ITEM_CATEGORIES = Object.freeze(['waffen', 'ruestungen', 'speisen', 'getraenke', 'alchemie', 'arkanes', 'werkzeuge', 'sonstiges', 'pferde', 'vieh']);
const clean = (value, limit = 180) => String(value ?? '').trim().slice(0, limit);
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));

export function normalizeItemDefinitionRef(value) {
  if (!value || typeof value !== 'object') return null;
  const id = clean(value.id, 220), revision = clean(value.revision, 64);
  return /^[\w:.-]{1,220}$/.test(id) && /^[\w.-]{1,64}$/.test(revision) ? { id, revision } : null;
}
export function itemDefinitionKey(value) {
  const ref = normalizeItemDefinitionRef(value);
  return ref ? `${ref.id}@${ref.revision}` : '';
}
// Charges belong to one physical object. A charged stack cannot be split or
// consumed safely without an individual charge state for each member. Keep this
// constraint outside normalization so existing immutable versions stay intact.
export function isItemDefinitionStackable(definition = {}) {
  return definition.kind !== 'unique' && definition.stackable !== false
    && !['waffen', 'ruestungen', 'pferde', 'vieh'].includes(definition.category)
    && !(Number(definition.useDefinition?.chargesMaximum) > 0);
}
export function assertItemQuantity(definition, value = 1, { allowEmpty = false } = {}) {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < (allowEmpty ? 0 : 1) || quantity > 9999
    || (!isItemDefinitionStackable(definition) && quantity > 1)) {
    throw Error('Die Menge passt nicht zur Itemdefinition. Nicht stapelbare Gegenstände und Gegenstände mit Ladungen werden als einzelne Besitztümer geführt.');
  }
  return quantity;
}
export function itemDefinitionContent(value) {
  const { revision, ...content } = normalizeItemDefinition(value);
  const ordered = input => Array.isArray(input) ? input.map(ordered) : input && typeof input === 'object'
    ? Object.fromEntries(Object.keys(input).sort().map(key => [key, ordered(input[key])])) : input;
  return JSON.stringify(ordered(content));
}
function number(value, minimum, maximum, fallback = 0) {
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) throw Error('Ein Itemwert liegt außerhalb des erlaubten Bereichs.');
  return parsed;
}
function jsonData(value, fallback, maximum) {
  if (value == null) return copy(fallback);
  const text = JSON.stringify(value);
  if (text.length > maximum) throw Error('Die Itemregeln sind zu umfangreich.');
  return JSON.parse(text);
}
function integer(value, minimum, maximum, fallback = 0) {
  const result = number(value, minimum, maximum, fallback);
  if (!Number.isSafeInteger(result)) throw Error('Mengen und Ladungen müssen ganze Zahlen sein.');
  return result;
}
function imagePath(value) {
  const result = clean(value, 4000);
  if (/^[a-z][a-z\d+.-]*:/i.test(result) && !/^https?:\/\//i.test(result) || result.startsWith('//')) throw Error('Das Itembild benötigt einen lokalen Bildpfad oder eine HTTP-Adresse.');
  return result;
}
function dice(value, fallback = '') {
  const text = clean(value || fallback, 80).replace(/w/gi, 'd');
  if (text && !/^\d{1,2}d\d{1,3}(?:\s*[+-]\s*\d{1,3})?$/.test(text)) throw Error('Schaden bitte als Würfelformel angeben, z. B. 1W8.');
  if (text && (/^0d|d0(?:\D|$)/.test(text) || Number(text.match(/d(\d+)/)?.[1]) > 100)) throw Error('Der Schadenswürfel ist ungültig.');
  return text;
}
export function normalizeItemCombatDefinition(value, category) {
  if (!value && !['waffen', 'ruestungen'].includes(category)) return null;
  const source = value && typeof value === 'object' ? value : {};
  const kind = category === 'waffen' ? 'weapon' : category === 'ruestungen' ? 'armor' : source.kind;
  if (!['weapon', 'armor'].includes(kind)) return null;
  const common = { kind, properties: clean(source.properties, 800), notes: clean(source.notes, 1600),
    triggerRules: jsonData(source.triggerRules, [], 16000) };
  if (kind === 'weapon') return { ...common,
    weaponType: clean(source.weaponType || 'other', 40), weaponProfileId: clean(source.weaponProfileId, 80),
    training: clean(source.training || 'simple', 40), damageFormula: dice(source.damageFormula, '1d4'),
    versatileDamageFormula: dice(source.versatileDamageFormula), damageType: clean(source.damageType || 'physisch', 80),
    attackAttribute: clean(source.attackAttribute || 'strength', 80),
    attackBonus: number(source.attackBonus, -99, 99), damageBonus: number(source.damageBonus, -99, 99),
    range: clean(source.range || 'Nahkampf', 100), requirements: clean(source.requirements, 1200),
    aiInstructions: clean(source.aiInstructions, 1600),
    effects: jsonData(source.effects, [], 16000),
    activationType: clean(source.activationType || 'action', 40), costs: jsonData(source.costs, [], 4000),
    auraBypass: jsonData(source.auraBypass, { allowed: true, resourceId: '', cost: 1 }, 2000),
    spendAllRegularActions: source.spendAllRegularActions === true,
    ammunition: source.ammunition ? { amountPerUse: integer(source.ammunition.amountPerUse, 1, 99, 1),
      reloadAfter: integer(source.ammunition.reloadAfter, 0, 999), required: source.ammunition.required === true } : null };
  const shield = source.armorKind === 'shield';
  return { ...common, armorKind: shield ? 'shield' : 'armor',
    ...(Number(source.armorRuleVersion) === 2 ? { armorRuleVersion: 2 } : {}),
    ...(source.equipCosts?.length ? { equipCosts: normalizeEquipmentPreparationCosts(source.equipCosts) } : {}),
    armorCategory: ['light', 'medium', 'heavy'].includes(source.armorCategory) ? source.armorCategory : '',
    baseArmorClass: shield ? null : number(source.baseArmorClass, 0, 40, 10),
    armorClassBonus: number(source.armorClassBonus, -20, 20, shield ? 2 : 0),
    dexterityMode: ['full', 'capped', 'none'].includes(source.dexterityMode) ? source.dexterityMode : 'full',
    dexterityCap: number(source.dexterityCap, 0, 20, 2), dexterityUnlockLevel: number(source.dexterityUnlockLevel, 0, 30),
    damageProtection: jsonData(source.damageProtection, null, 4000), mechanics: jsonData(source.mechanics, {}, 12000) };
}
export function normalizeItemUseDefinition(value = {}, fallbackMode = 'use') {
  value = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const mode = ['use', 'consume'].includes(value.mode) ? value.mode : fallbackMode;
  const effects = (Array.isArray(value.effects) ? value.effects : []).map(effect => {
    if (!['healing', 'temporary-hit-points', 'restore-resource'].includes(effect?.type)) throw Error('Diese automatische Itemwirkung wird noch nicht unterstützt.');
    const resourceId = clean(effect.resourceId, 120);
    if (effect.type === 'restore-resource' && !resourceId) throw Error('Für die Ressourcenwirkung fehlt die Ressource.');
    return { type: effect.type, amount: number(effect.amount, 0, 10000), ...(resourceId ? { resourceId } : {}) };
  });
  if (effects.length > 12) throw Error('Ein Gegenstand darf höchstens zwölf automatische Wirkungen besitzen.');
  const chargesMaximum = integer(value.chargesMaximum, 0, 9999);
  const chargesPerUse = integer(value.chargesPerUse, 0, chargesMaximum, chargesMaximum ? 1 : 0);
  const costs = (Array.isArray(value.costs) ? value.costs : []).map(cost => ({ resourceId: clean(cost.resourceId, 120), amount: integer(cost.amount, 1, 10000, 1) }));
  if (costs.length > 12 || costs.some(cost => !cost.resourceId) || new Set(costs.map(cost => cost.resourceId)).size !== costs.length) throw Error('Itemkosten benötigen eindeutige Ressourcenkennungen.');
  return { mode, quantity: integer(value.quantity, 1, 9999, 1), target: 'self', effects,
    chargesMaximum, chargesPerUse, costs,
    ...(value.substance ? { substance: normalizeSubstanceExposure(value.substance) } : {}),
    recovery: ['none', 'day', 'short-rest', 'long-rest'].includes(value.recovery) ? value.recovery : 'none',
    narrative: clean(value.narrative, 2400) };
}
export function normalizeItemDefinition(input = {}, { id = input.id, revision = input.revision || 'draft' } = {}) {
  const ref = normalizeItemDefinitionRef({ id, revision });
  if (!ref) throw Error('Die Itemdefinition benötigt eine gültige ID und Version.');
  const category = ITEM_CATEGORIES.includes(input.category) ? input.category : 'sonstiges';
  const title = clean(input.title || input.name);
  if (!title) throw Error('Die Itemdefinition benötigt einen Namen.');
  const inventoryUseMode = ['use', 'consume'].includes(input.inventoryUseMode) ? input.inventoryUseMode
    : ['speisen', 'getraenke', 'alchemie'].includes(category) ? 'consume' : 'use';
  const useDefinition = normalizeItemUseDefinition(input.useDefinition, inventoryUseMode);
  const kind = input.kind === 'unique' ? 'unique' : 'shared';
  const passiveEffects = normalizeEquipmentPassiveEffects(input.passiveEffects);
  return { schemaVersion: ITEM_DEFINITION_SCHEMA, ...ref, kind,
    baseRef: normalizeItemDefinitionRef(input.baseRef), title, category,
    type: clean(input.type), image: imagePath(input.image), description: clean(input.description, 12000),
    mechanicsStatus: ['provisional', 'defined', 'narrative'].includes(input.mechanicsStatus) ? input.mechanicsStatus : 'provisional',
    combatDefinition: normalizeItemCombatDefinition(input.combatDefinition, category),
    ...(passiveEffects.length ? { passiveEffects } : {}),
    inventoryUseMode: useDefinition.mode, useDefinition,
    stackable: kind !== 'unique' && !['waffen', 'ruestungen', 'pferde', 'vieh'].includes(category) && input.stackable !== false,
    weight: input.weight == null || input.weight === '' ? null : number(input.weight, 0, 100000),
    weightUnit: 'kg', sourceRefs: jsonData(input.sourceRefs, [], 12000) };
}

export function itemDefinitionFromTemplate(template = {}) {
  const reference = normalizeItemDefinitionRef(template.definitionRef);
  if (template.schemaVersion === ITEM_DEFINITION_SCHEMA && template.revision && template.kind && template.id) return copy(template);
  if (!reference) return null;
  return normalizeItemDefinition({ ...template, kind: template.definitionKind || 'shared',
    description: [template.description, template.details].filter(Boolean).join('\n\n'),
    weight: /^\d+(?:[.,]\d+)?$/.test(String(template.weight ?? '')) ? Number(String(template.weight).replace(',', '.')) : null }, reference);
}

export function definitionTemplate(definition) {
  return { ...copy(definition), definitionRef: { id: definition.id, revision: definition.revision },
    definitionKind: definition.kind, templateId: definition.id, section: 'definition', aliases: [] };
}
