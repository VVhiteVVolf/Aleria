import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260905-archive-order-v2';
import { ensureArchiveGroup, addArchiveGroupEntry, sortArchiveGroups } from './character-archive-group-tree.js?v=20260905-cenyr-character-training-v1';

export function isArchiveWeapon(entry = {}) {
  if (entry.kind !== 'attack') return false;
  const type = normalizeArchiveSearchText(entry.data?.weaponType);
  return !['natural', 'unarmed', 'naturlich', 'waffenlos'].includes(type)
    && !/^(biss|klauen|krallen|huftritt|hufschlag|faustschlag|tentakel)( |$)/.test(normalizeArchiveSearchText(entry.name));
}

export function getArchiveWeaponRelation(entry = {}) {
  if (entry.kind === 'attack') {
    if (!isArchiveWeapon(entry)) return '';
    const variant = String(entry.name || '').match(/^(.+?)\s*\(([^)]+)\)$/);
    if (variant && !/^(paar|einhand|zweihand)$/i.test(variant[2])) return variant[1].trim();
    if (normalizeArchiveSearchText(entry.name) === 'schildstoss') return 'Schild';
    return '';
  }
  if (entry.kind !== 'technique' && entry.kind !== 'ability') return '';
  return String(entry.data?.archivePlacement?.weaponName || entry.data?.weaponName || '').trim();
}

export function getCharacterArchiveWeaponGroups(entries = [], allEntries = entries) {
  const groups = [];
  for (const entry of entries) {
    const relation = getArchiveWeaponRelation(entry);
    const weaponName = relation || (isArchiveWeapon(entry) ? entry.name : '');
    if (!weaponName) continue;
    const weapon = allEntries.find(item => isArchiveWeapon(item) && normalizeArchiveSearchText(item.name) === normalizeArchiveSearchText(weaponName));
    const group = ensureArchiveGroup(groups, 'weapon', weapon?.name || weaponName, weapon);
    const displayName = relation && entry.kind === 'attack' ? entry.name.match(/\(([^)]+)\)$/)?.[1] || entry.name : entry.name;
    addArchiveGroupEntry(ensureArchiveGroup(group.children, 'attacks', relation ? 'Waffeneigene Attacken' : 'Waffenprofil & Grundangriff'), { ...entry, archiveDisplayName: displayName });
  }
  return sortArchiveGroups(groups);
}
