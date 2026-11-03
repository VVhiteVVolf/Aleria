import { itemDefinitionRegistry } from '../item-definitions/item-definition-registry.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, normalizeItemDefinition, normalizeItemDefinitionRef } from '../item-definitions/item-definition-model.js';
import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';

const RULE_FIELDS = ['combatDefinition', 'passiveEffects', 'inventoryUseMode', 'useDefinition',
  'mechanicsStatus', 'stackable', 'weight'];
const ANIMAL_KINDS = new Set(['register-pferde', 'register-vieh']);
const TEMPLATE_FIELDS = new Set([...RULE_FIELDS, 'id', 'canonicalKey', 'title', 'category', 'categoryLabel',
  'type', 'description', 'details', 'price', 'currency', 'image', 'icon', 'iconOverride', 'iconAssignmentVersion',
  'tags', 'attributes', 'sourceRefs', 'hiddenMeta', 'updatedAt', 'createdAt', 'aliases', 'section', 'priceRange',
  'stock', 'definitionRef', 'definitionKind', 'definitionSourceId', 'definitionDerived', 'listId', 'listName',
  'moduleId', 'moduleSource', 'templateId', 'sourceRevision', 'archived', 'weightUnit', 'kind', 'houseArmor', 'infoRows']);
const standardTemplates = new Map(STANDARD_ITEMS.map(item => [item.id, item]));
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const clone = value => structuredClone(value);
const ordered = value => Array.isArray(value) ? value.map(ordered)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;

function sourceEntry(entry) {
  const { registerVariants, sourceIds, registerPresentation, ...original } = entry;
  return clone(original);
}

function sourceEntries(entry) {
  return entry.registerPresentation?.kind === 'template' && Array.isArray(entry.registerVariants)
    ? entry.registerVariants.map(sourceEntry) : [sourceEntry(entry)];
}

function protectedKind(entry) {
  const data = entry.data || {};
  if (data.section === 'owned' || data.ownerCharacterId || data.ownerCreatureId
    || data.inventoryItemId || data.instanceId || data.creatureId) return 'owned';
  if (ANIMAL_KINDS.has(entry.kind) || ['pferde', 'vieh'].includes(data.category)) return 'animal';
  if (data.definitionKind === 'unique' || data.kind === 'unique'
    || String(data.id || '').startsWith('unique:')
    || data.definitionOverrides || data.ruleOverrides || data.customMechanics) return 'variant';
  return '';
}

function effectiveRules(data, definition) {
  const overrides = Object.fromEntries(RULE_FIELDS.filter(key => own(data, key)).map(key => [key, data[key]]));
  const effective = normalizeItemDefinition({ ...definition, ...overrides,
    category: data.category || definition.category });
  return JSON.stringify(ordered(Object.fromEntries(RULE_FIELDS.map(key => [key, effective[key] ?? null]))));
}

function extendsRuleShape(value, canonical, path = []) {
  if (!value || typeof value !== 'object') return false;
  if (!canonical || typeof canonical !== 'object') return Object.keys(value).length > 0;
  return Object.keys(value).some(key => {
    if (!path.length && ['proficient', 'equipped'].includes(key)) return false;
    return !own(canonical, key) || extendsRuleShape(value[key], canonical[key], [...path, key]);
  });
}

function templateIdentity(entry) {
  const data = entry.data || {};
  if (protectedKind(entry) || !['standard', 'offer'].includes(data.section)
    || Object.keys(data).some(key => !TEMPLATE_FIELDS.has(key))) return null;
  const reference = normalizeItemDefinitionRef(data.definitionRef);
  if (!reference) return null;
  try {
    const definition = itemDefinitionRegistry.get(reference)
      || (data.definitionDerived === true && data.definitionSourceId === reference.id
        ? itemDefinitionFromTemplate(data) : null);
    if (!definition || definition.kind === 'unique') return null;
    if (data.houseArmor && JSON.stringify(ordered(data.houseArmor))
      !== JSON.stringify(ordered(standardTemplates.get(definition.id)?.houseArmor || null))) return null;
    if (extendsRuleShape(data.combatDefinition, definition.combatDefinition)
      || extendsRuleShape(data.useDefinition, definition.useDefinition)) return null;
    // Do not let a normalizer discard an unfamiliar/custom passive and then
    // accidentally declare the row equivalent to the published definition.
    if (own(data, 'passiveEffects') && JSON.stringify(ordered(data.passiveEffects || []))
      !== JSON.stringify(ordered(definition.passiveEffects || []))) return null;
    const rules = effectiveRules(data, definition);
    if (rules !== effectiveRules({}, definition)) return null;
    return { key: `${entry.kind}::${itemDefinitionKey(reference)}::${rules}`,
      definitionKey: itemDefinitionKey(reference) };
  } catch {
    // Malformed historical/custom rules stay visible as their own variant.
    return null;
  }
}

export function selectRegisterProjectionArtwork(entries = []) {
  const candidates = entries.flatMap(entry => entry.registerPresentation?.kind === 'template' && Array.isArray(entry.registerVariants)
    ? entry.registerVariants : [entry]);
  const assigned = candidates.filter(entry => entry.iconOverride || entry.data?.iconOverride
    || Number(entry.iconAssignmentVersion || entry.data?.iconAssignmentVersion) > 0)
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
      || String(a.id || '').localeCompare(String(b.id || '')))[0];
  if (!assigned) return {};
  const iconOverride = assigned.iconOverride || assigned.data?.iconOverride || '';
  return { icon: iconOverride || assigned.icon || assigned.data?.icon || '', iconOverride,
    iconAssignmentVersion: Number(assigned.iconAssignmentVersion || assigned.data?.iconAssignmentVersion) || 0 };
}

function annotate(entry, kind, definitionKey = '', variantCount = 1) {
  const labels = { owned: 'Besitz', animal: 'Tier / Zuchtvorlage', variant: 'Variante', template: 'Vorlage' };
  return { ...entry, sourceIds: [entry.data?.id || entry.id].filter(Boolean),
    registerPresentation: { kind, label: labels[kind], definitionKey, variantCount } };
}

function mergeTemplateGroup(members, identity) {
  const unique = [...new Map(members.map(entry => [`${entry.data?.id || ''}::${entry.id}::${entry.key}`, entry])).values()];
  const primary = unique.find(entry => entry.data?.section === 'standard') || unique[0];
  const sources = [...new Map(unique.flatMap(entry => entry.sources || [])
    .map(source => [JSON.stringify([source.kind, source.id, source.name]), clone(source)])).values()];
  return { ...annotate(clone(primary), 'template', identity.definitionKey, unique.length),
    ...selectRegisterProjectionArtwork(unique),
    sources, tags: [...new Set(unique.flatMap(entry => entry.tags || []))],
    sourceIds: [...new Set(unique.map(entry => entry.data?.id || entry.id).filter(Boolean))],
    registerVariants: unique.map(sourceEntry) };
}

// View projection only. A register reference identifies a template; offers and
// actual possessions retain their complete original rows below that template.
// No returned grouping authorizes a stock, ownership or inventory mutation.
export function coalesceRegisterArchiveEntries(entries = []) {
  const output = [], groups = new Map();
  for (const raw of entries) {
    if (!String(raw.kind || '').startsWith('register-')) { output.push({ entry: raw }); continue; }
    for (const entry of sourceEntries(raw)) {
      const identity = templateIdentity(entry);
      if (!identity) {
        output.push({ entry: annotate(entry, protectedKind(entry) || 'variant') });
        continue;
      }
      let group = groups.get(identity.key);
      if (!group) {
        group = { identity, members: [] };
        groups.set(identity.key, group);
        output.push({ group });
      }
      group.members.push(entry);
    }
  }
  return output.map(slot => slot.group ? mergeTemplateGroup(slot.group.members, slot.group.identity) : slot.entry);
}
