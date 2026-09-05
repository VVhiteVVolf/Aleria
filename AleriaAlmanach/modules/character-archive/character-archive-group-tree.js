import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260905-archive-order-v2';

const labels = { class: 'Klasse', style: 'Kampftechnik', form: 'Form', persons: 'Sammlung', person: 'Person', creature: 'Kreatur', attacks: 'Attacken', weapon: 'Waffe', general: 'Sammlung' };

export function ensureArchiveGroup(groups, type, name, parentEntry = null) {
  const id = `${type}--${normalizeArchiveSearchText(name)}`;
  let group = groups.find(item => item.id === id);
  if (!group) {
    group = { id, type, typeLabel: labels[type] || type, name, parentEntry,
      description: parentEntry?.description || '', symbol: type === 'class' ? '♛' : '⚔', entries: [], children: [] };
    groups.push(group);
  }
  return group;
}

export function addArchiveGroupEntry(group, entry) {
  const key = value => value.key || value.id || `${value.kind}:${value.name}`;
  if (!group.entries.some(item => key(item) === key(entry))) group.entries.push(entry);
}

export function sortArchiveGroups(groups) {
  const rank = { class: 0, style: 1, persons: 2, creature: 3, general: 4 };
  groups.sort((a, b) => (rank[a.type] ?? 0) - (rank[b.type] ?? 0)
    || (a.parentEntry?.data?.sequence ?? a.parentEntry?.data?.number ?? 0)
      - (b.parentEntry?.data?.sequence ?? b.parentEntry?.data?.number ?? 0)
    || a.name.localeCompare(b.name, 'de', { numeric: true, sensitivity: 'base' }));
  groups.forEach(group => sortArchiveGroups(group.children));
  return groups;
}

export function countArchiveGroupEntries(group) {
  return group.entries.length + group.children.reduce((sum, child) => sum + countArchiveGroupEntries(child), 0);
}
