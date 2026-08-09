import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260810-character-archive-register-v1';

const GROUP_TYPE_ORDER = Object.freeze({
  'combat-form': 0,
  class: 1,
  special: 2,
  general: 3
});

function uniqueStrings(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function hasDamageEffect(value) {
  if (Array.isArray(value)) return value.some(hasDamageEffect);
  if (!value || typeof value !== 'object') return false;
  if (String(value.type || '').toLocaleLowerCase('de').includes('damage')) return true;
  return Object.values(value).some(hasDamageEffect);
}

export function isCharacterArchiveCombatAbility(entry = {}) {
  if (entry.kind !== 'ability') return false;
  const data = entry.data || {};
  return data.combatUsable === true
    || Boolean(String(data.damageFormula || data.rollFormula || '').trim())
    || String(data.delivery || '').toLocaleLowerCase('de') === 'attack'
    || hasDamageEffect(data.effects)
    || hasDamageEffect(data.mechanics);
}

export function matchesCharacterArchiveKind(entry = {}, kind = '') {
  if (kind === 'all' || !kind) return true;
  if (kind === 'technique') return entry.kind === 'technique' || isCharacterArchiveCombatAbility(entry);
  return entry.kind === kind;
}

function getParentLookup(entries, kind) {
  const byId = new Map();
  const byName = new Map();
  entries.filter(entry => entry.kind === kind).forEach(entry => {
    const ids = uniqueStrings([
      entry.id,
      entry.data?.id,
      ...(entry.sources || []).map(source => source.id)
    ]);
    ids.forEach(id => byId.set(normalizeArchiveSearchText(id), entry));
    byName.set(normalizeArchiveSearchText(entry.name), entry);
  });
  return { byId, byName };
}

function findParent(lookup, ids = [], names = []) {
  for (const id of uniqueStrings(ids)) {
    const parent = lookup.byId.get(normalizeArchiveSearchText(id));
    if (parent) return parent;
  }
  for (const name of uniqueStrings(names)) {
    const parent = lookup.byName.get(normalizeArchiveSearchText(name));
    if (parent) return parent;
  }
  return null;
}

function humanizeReference(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text
    .replace(/^builtin--[^-]+--/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toLocaleUpperCase('de'));
}

function getCombatFormRelation(entry, lookup) {
  const data = entry.data || {};
  const formSources = (entry.sources || []).filter(source => source.kind === 'combat-style');
  const ids = uniqueStrings([
    data.combatStyleFormId,
    data.combatStyleId,
    ...formSources.map(source => source.id)
  ]);
  const names = uniqueStrings([
    data.trainingForm,
    data.combatFormName,
    ...formSources.map(source => source.name)
  ]);
  if (!ids.length && !names.length) return null;
  const parentEntry = findParent(lookup, ids, names);
  const name = String(data.trainingForm || parentEntry?.name || names[0] || humanizeReference(ids[0])).trim();
  if (!name) return null;
  return {
    id: normalizeArchiveSearchText(parentEntry?.data?.id || ids[0] || name),
    name,
    parentEntry
  };
}

function getClassRelations(entry, lookup) {
  const data = entry.data || {};
  const classSources = (entry.sources || []).filter(source => source.kind === 'class' || source.kind === 'character-library');
  const ids = uniqueStrings([
    data.sourceClassId,
    data.classId,
    ...classSources.map(source => source.id)
  ]);
  const names = uniqueStrings([
    data.sourceClassName,
    data.className,
    ...(entry.sources || []).filter(source => source.kind === 'class').map(source => source.name)
  ]);
  const relations = [];
  ids.forEach(id => {
    const parentEntry = findParent(lookup, [id], []);
    relations.push({
      id: normalizeArchiveSearchText(parentEntry?.data?.id || id),
      name: parentEntry?.name || humanizeReference(id),
      parentEntry
    });
  });
  names.forEach(name => {
    const parentEntry = findParent(lookup, [], [name]);
    relations.push({
      id: normalizeArchiveSearchText(parentEntry?.data?.id || name),
      name: parentEntry?.name || name,
      parentEntry
    });
  });
  const unique = new Map();
  relations.filter(relation => relation.id && relation.name).forEach(relation => unique.set(relation.id, relation));
  return [...unique.values()];
}

function hasPersonalSource(entry) {
  const sources = entry.sources || [];
  return entry.builtin !== true
    || Boolean(entry.data?.sourceCharacter)
    || sources.some(source => source.kind === 'character' || source.kind === 'creature');
}

function getEntryKey(entry) {
  return String(entry.key || entry.id || `${entry.kind}:${entry.name}`);
}

function createGroup(type, relation = {}) {
  relation = relation || {};
  const presets = {
    special: {
      name: 'Besondere & einzigartige Attacken',
      description: 'Charaktereigene, kreaturenspezifische und andere besondere Attacken ohne feste Kampfform.',
      symbol: '✦'
    },
    general: {
      name: 'Allgemeine Attacken',
      description: 'Gemeinsame Angriffe und Techniken ohne feste Kampfform oder Klassenzuordnung.',
      symbol: '⚔'
    }
  };
  const preset = presets[type] || {};
  const name = relation.name || preset.name || 'Attacken';
  const parentEntry = relation.parentEntry || null;
  return {
    id: `${type}--${relation.id || normalizeArchiveSearchText(name)}`,
    type,
    typeLabel: type === 'combat-form' ? 'Kampfform' : (type === 'class' ? 'Klasse' : 'Sammlung'),
    name,
    description: parentEntry?.description || preset.description || '',
    symbol: type === 'combat-form' ? '♜' : (type === 'class' ? '♛' : preset.symbol),
    parentEntry,
    entryMap: new Map()
  };
}

function addToGroup(groups, type, relation, entry) {
  const id = `${type}--${relation?.id || type}`;
  if (!groups.has(id)) groups.set(id, createGroup(type, relation));
  groups.get(id).entryMap.set(getEntryKey(entry), entry);
}

export function getCharacterArchiveAttackGroups(entries = [], allEntries = entries) {
  const visible = Array.isArray(entries) ? entries : [];
  const parents = Array.isArray(allEntries) ? allEntries : [];
  const combatForms = getParentLookup(parents, 'combat-style');
  const classes = getParentLookup(parents, 'class');
  const groups = new Map();

  visible.forEach(entry => {
    const formRelation = getCombatFormRelation(entry, combatForms);
    if (formRelation) {
      addToGroup(groups, 'combat-form', formRelation, entry);
      return;
    }

    if (isCharacterArchiveCombatAbility(entry)) {
      addToGroup(groups, 'special', null, entry);
      return;
    }

    const classRelations = getClassRelations(entry, classes);
    if (classRelations.length) {
      classRelations.forEach(relation => addToGroup(groups, 'class', relation, entry));
      return;
    }

    addToGroup(groups, hasPersonalSource(entry) ? 'special' : 'general', null, entry);
  });

  return [...groups.values()]
    .map(group => ({ ...group, entries: [...group.entryMap.values()], entryMap: undefined }))
    .sort((left, right) => (
      GROUP_TYPE_ORDER[left.type] - GROUP_TYPE_ORDER[right.type]
      || left.name.localeCompare(right.name, 'de', { sensitivity: 'base', numeric: true })
    ));
}

export const characterArchiveAttackGroupInternals = Object.freeze({
  getCombatFormRelation,
  getClassRelations,
  hasPersonalSource,
  humanizeReference
});
