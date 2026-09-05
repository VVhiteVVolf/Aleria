import { getClassPageIconSource } from '../classes/class-icon-registry.js?v=20260810-character-archive-icons-v2';
import { getCombatEntryIconPresentation } from '../combat/combat-entry-icons.js?v=20260810-zauberkarten-icons-v1';
import { normalizeCharacterArchiveEntry } from './character-archive-model.js?v=20260905-archive-order-v2';
import { getArchiveTraitIconSource } from './character-archive-trait-icons.js';

const PLACEHOLDER_ICON = new URL('../../../IconOrdner/ReiterIcons/Platzhalter.png', import.meta.url).href;
const COMBAT_ICON_KIND_BY_ARCHIVE_KIND = Object.freeze({
  spell: 'spell',
  trait: 'quirk',
  ability: 'ability',
  technique: 'technique',
  attack: 'weapon',
  condition: 'condition'
});
const ARCHIVE_KIND_BY_COMBAT_ICON_KIND = Object.freeze(Object.fromEntries(
  Object.entries(COMBAT_ICON_KIND_BY_ARCHIVE_KIND).map(([archiveKind, combatKind]) => [combatKind, archiveKind])
));

function normalizeEntryName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getCharacterArchiveEntryIconPresentation(entry = {}) {
  if (entry.kind === 'spell') {
    const normalized = normalizeCharacterArchiveEntry(entry);
    return { source: normalized.icon, fallbackSource: '', custom: Boolean(normalized.icon) };
  }
  const kind = String(entry.kind || '').trim();
  const data = entry.data && typeof entry.data === 'object' ? entry.data : {};
  const explicitSource = String(entry.iconOverride || entry.icon || data.icon || '').trim();
  if (kind === 'trait') {
    const matched = getArchiveTraitIconSource(entry);
    if (matched) return { source: entry.iconOverride || matched, fallbackSource: matched, custom: Boolean(entry.iconOverride) };
  }

  if (kind === 'class') {
    const classSource = getClassPageIconSource(data.id || data.name || entry.name || entry.id);
    const fallbackSource = classSource || PLACEHOLDER_ICON;
    return { source: explicitSource || fallbackSource, fallbackSource, custom: Boolean(explicitSource) };
  }

  const combatKind = COMBAT_ICON_KIND_BY_ARCHIVE_KIND[kind];
  if (combatKind) {
    return getCombatEntryIconPresentation(combatKind, { ...data, icon: explicitSource });
  }

  return {
    source: explicitSource || PLACEHOLDER_ICON,
    fallbackSource: PLACEHOLDER_ICON,
    custom: Boolean(explicitSource)
  };
}

export function getCharacterSheetEntryIconPresentation(combatKind, item = {}, archiveEntries = null) {
  const fallback = combatKind === 'spell'
    ? { source: '', fallbackSource: '', custom: false }
    : getCombatEntryIconPresentation(combatKind, item);
  const archiveKind = ARCHIVE_KIND_BY_COMBAT_ICON_KIND[String(combatKind || '')];
  const name = normalizeEntryName(item.name);
  if (!archiveKind || !name) return { ...fallback, linked: false };
  const entries = Array.isArray(archiveEntries)
    ? archiveEntries
    : (globalThis.AleriaCharacterArchive?.getEntries?.() || []);
  const archiveEntry = entries.find(entry => (
    entry.kind === archiveKind
    && normalizeEntryName(entry.name) === name
  ));
  return archiveEntry
    ? { ...getCharacterArchiveEntryIconPresentation(archiveEntry), linked: true }
    : { ...fallback, linked: false };
}

export const characterArchiveIconInternals = Object.freeze({
  COMBAT_ICON_KIND_BY_ARCHIVE_KIND,
  ARCHIVE_KIND_BY_COMBAT_ICON_KIND,
  normalizeEntryName,
  PLACEHOLDER_ICON
});
