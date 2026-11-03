import { getClassPageIconSource } from '../classes/class-icon-registry.js?v=20260911-venalys-v1';
import { getCombatEntryIconPresentation } from '../combat/combat-entry-icons.js?v=20260810-zauberkarten-icons-v1';
import { normalizeCharacterArchiveEntry } from './character-archive-model.js?v=20260928-equipment-art-v4';
import { getArchiveTraitIconSource } from './character-archive-trait-icons.js?v=20260928-equipment-art-v4';
import { getCulturalOriginTemplate } from '../character-origins/cultural-origin-catalog.js';
import { getSkillIconPresentation } from '../skill-checks/skill-icon-registry.js';
import { getArchiveAbilityIconSource } from './character-archive-ability-icons.js';

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
    if (explicitSource) return { source: explicitSource, fallbackSource: matched, custom: true };
    if (matched) return { source: entry.iconOverride || matched, fallbackSource: matched, custom: Boolean(entry.iconOverride) };
  }
  if (kind === 'ability') {
    const source = getArchiveAbilityIconSource(entry);
    if (source) return { source, fallbackSource: source, custom: Boolean(explicitSource) };
  }

  if (kind === 'class') {
    const classSource = getClassPageIconSource(data.id || data.name || entry.name || entry.id);
    const fallbackSource = classSource || PLACEHOLDER_ICON;
    return { source: explicitSource || fallbackSource, fallbackSource, custom: Boolean(explicitSource) };
  }
  if (kind === 'ancestry') {
    const origin = getCulturalOriginTemplate(data.id) || getCulturalOriginTemplate(entry.name);
    const fallbackSource = origin?.icon || PLACEHOLDER_ICON;
    return { source: explicitSource || fallbackSource, fallbackSource, custom: Boolean(explicitSource) };
  }
  if (kind === 'skill') {
    const fallbackSource = getSkillIconPresentation(entry.name || data.name).src;
    return { source: explicitSource || fallbackSource, fallbackSource, custom: Boolean(explicitSource) };
  }

  const combatKind = COMBAT_ICON_KIND_BY_ARCHIVE_KIND[kind];
  if (combatKind) {
    return getCombatEntryIconPresentation(combatKind, { name: entry.name, ...data, icon: explicitSource });
  }

  return {
    source: explicitSource || PLACEHOLDER_ICON,
    fallbackSource: PLACEHOLDER_ICON,
    custom: Boolean(explicitSource)
  };
}

function abilityOwnerMatches(entry, item, owner = {}) {
  const ownerId = String(owner.id || owner.characterId || item.ownerCharacterId || item.characterId || '');
  const ownerName = normalizeEntryName(owner.name || owner.characterName || item.ownerCharacterName || item.characterName);
  const data = entry.data || {};
  const sources = (entry.sources || []).filter(source => ['character', 'creature', 'character-library'].includes(source.kind));
  if (data.ownerCharacterId || data.ownerCharacterName || data.sourceCharacterId || data.sourceCharacter) {
    sources.push({ id: data.ownerCharacterId || data.sourceCharacterId, name: data.ownerCharacterName || data.sourceCharacter });
  }
  if (!sources.length) return true;
  if (!ownerId && !ownerName) return false;
  if (!sources.some(source => ownerId && source.id === ownerId || ownerName && normalizeEntryName(source.name) === ownerName)) return false;
  const entryId = entry.data?.catalogAbilityId || entry.data?.id;
  const itemId = item.catalogAbilityId || item.id;
  return !entryId || !itemId || entryId === itemId;
}

export function getCharacterSheetEntryIconPresentation(combatKind, item = {}, archiveEntries = null, ownerContext = {}) {
  const fallback = combatKind === 'spell'
    ? { source: '', fallbackSource: '', custom: false }
    : getCombatEntryIconPresentation(combatKind, item, ownerContext);
  const archiveKind = ARCHIVE_KIND_BY_COMBAT_ICON_KIND[String(combatKind || '')];
  const name = normalizeEntryName(item.name);
  if (!archiveKind || !name) return { ...fallback, linked: false };
  const entries = Array.isArray(archiveEntries)
    ? archiveEntries
    : (globalThis.AleriaCharacterArchive?.getEntries?.() || []);
  const itemKey = normalizeCharacterArchiveEntry({ kind: archiveKind, name: item.name, data: item }).key;
  let archiveEntry = entries.find(entry => (
    entry.kind === archiveKind
    && normalizeCharacterArchiveEntry(entry).key === itemKey
    && (combatKind !== 'ability' || abilityOwnerMatches(entry, item, ownerContext))
  ));
  // Older manually saved icon assignments may have only a name and no source
  // identity. Retain a single unambiguous assignment without merging distinct
  // canonical techniques (or borrowing another person's ability picture).
  if (!archiveEntry && combatKind !== 'spell') {
    const legacy = entries.filter(entry => entry.kind === archiveKind
      && !entry.data?.id && !entry.data?.catalogTechniqueId && !entry.data?.developmentTraitId
      && normalizeEntryName(entry.name) === name
      && (combatKind !== 'ability' || abilityOwnerMatches(entry, item, ownerContext)));
    if (legacy.length === 1) archiveEntry = legacy[0];
  }
  return archiveEntry
    ? { ...getCharacterArchiveEntryIconPresentation({ ...archiveEntry, data: { ...item, ...archiveEntry.data } }), linked: true }
    : combatKind === 'spell' && (item.catalogReference || item.catalogOrigin) ? { source: item.icon || '', fallbackSource: '', custom: Boolean(item.icon), linked: Boolean(item.catalogReference) }
      : { ...fallback, linked: false };
}

export const characterArchiveIconInternals = Object.freeze({
  COMBAT_ICON_KIND_BY_ARCHIVE_KIND,
  ARCHIVE_KIND_BY_COMBAT_ICON_KIND,
  normalizeEntryName,
  PLACEHOLDER_ICON
});
