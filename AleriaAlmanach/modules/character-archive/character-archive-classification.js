import { ARCHIVE_PAGE_CLASSES, ARCHIVE_PAGE_MOUNTS } from './character-archive-page-data.js?v=20260913-morgorn-names-v1';
import { getClassPageIcon } from '../classes/class-icon-registry.js?v=20260911-venalys-v1';
import { normalizeArchiveSearchText, normalizeCharacterArchiveEntry } from './character-archive-model.js?v=20260928-equipment-art-v4';
import { getCultureClassDefinitions } from '../classes/culture-class-definitions.js?v=20260913-morgorn-names-v1';
import { getCulturalOriginTemplate } from '../character-origins/cultural-origin-catalog.js';
import { getSkillIdentity, SKILL_DEFINITIONS } from '../skill-checks/skill-definitions.js';
import { isExplicitCharacterArchiveVariant } from './character-archive-entry-equivalence.js';

const classByName = new Map(ARCHIVE_PAGE_CLASSES.map(entry => [normalizeArchiveSearchText(entry.name), entry]));
const classById = new Map(ARCHIVE_PAGE_CLASSES.flatMap(entry => [
  [entry.id, entry],
  ...entry.cultures.map(culture => [normalizeArchiveSearchText(`${culture}-${entry.id}`), entry])
]));
const mountByName = new Map(ARCHIVE_PAGE_MOUNTS.map(entry => [normalizeArchiveSearchText(entry.name), entry]));
const mountById = new Map(ARCHIVE_PAGE_MOUNTS.map(entry => [entry.id, entry]));
const genericHumanNames = new Set(['mensch', 'menschen', 'human']);
const legacyMountFields = new Set(['id', 'name', 'title', 'section', 'type', 'region', 'origin',
  'description', 'image', 'price', 'currency', 'uses', 'sourcePage', 'archiveMountId', 'category']);

function hasOnlyLegacyMountFields(entry) {
  return Object.keys(entry.data || {}).every(key => legacyMountFields.has(key));
}

function isMinimalBreedIdentity(entry) {
  return !entry.description && !entry.icon && !entry.iconOverride && !entry.createdAt && !entry.updatedAt
    && !(entry.tags || []).length && Object.keys(entry.data || {}).every(key => key === 'name')
    && (entry.builtin || entry.archivedFromProfile
      || (entry.sources || []).some(source => source.kind === 'creature'));
}

function isLegacyMountProjection(entry, mount) {
  const data = entry.data || {};
  // A breed name is not evidence that an individual animal or an edited
  // bestiary/archive profile should inherit the current market's stats.
  if (entry.iconOverride || !hasOnlyLegacyMountFields(entry)
    || data.id && data.id !== mount.id || data.archiveMountId && data.archiveMountId !== mount.id) return false;
  const rossmarktSource = entry.id === `rossmarkt--${mount.id}` || data.archiveMountId === mount.id
    || (entry.sources || []).some(source => source.kind === 'item-register'
      && (source.id === `rossmarkt:${mount.id}` || source.id === mount.id));
  if (!entry.builtin && (entry.createdAt || entry.updatedAt || entry.description || entry.icon)
    && !(rossmarktSource && entry.archivedFromProfile === true && !isExplicitCharacterArchiveVariant(entry))) return false;
  return Boolean(entry.builtin || isMinimalBreedIdentity(entry) || rossmarktSource);
}

function standardMountProjection(entry, mount) {
  return normalizeCharacterArchiveEntry({ ...entry, data: { ...mount, ...entry.data,
    origin: entry.data.origin || mount.origin } });
}

function projectKnownSkill(entry, skill) {
  const data = { ...entry.data };
  // Artwork authorship is independent of rules. An assigned icon must not turn
  // a character's training notes or chosen check attribute into a new template.
  const authoredRules = isExplicitCharacterArchiveVariant({ ...entry,
    iconOverride: '', iconAssignmentVersion: 0,
    data: { ...data, iconOverride: '', iconAssignmentVersion: 0 } });
  const profileSource = entry.archivedFromProfile
    || (entry.sources || []).some(source => ['character', 'creature'].includes(source.kind));
  const notes = String(data.notes || '').trim();
  const derivedProfileNotes = profileSource && !authoredRules && !data.description
    && (!entry.description || entry.description.trim() === notes);
  return normalizeCharacterArchiveEntry({ ...entry, name: skill.label,
    description: derivedProfileNotes ? '' : entry.description,
    data: { ...data, id: skill.id, name: skill.label,
      attributeKey: authoredRules ? data.attributeKey || skill.attributeKey : skill.attributeKey,
      // These are the figure's current check values, not the skill's rules.
      proficiency: 'none', bonus: 0, notes: derivedProfileNotes ? '' : notes }
  });
}

export function getArchiveClassDefinition(entry = {}) {
  const pageName = (getClassPageIcon(entry.data?.id) || getClassPageIcon(entry.name))?.pageName;
  return classById.get(normalizeArchiveSearchText(entry.data?.id))
    || classByName.get(normalizeArchiveSearchText(pageName || entry.name))
    || classById.get(normalizeArchiveSearchText(entry.name)) || null;
}

export function createArchiveMountEntry(mount) {
  const kind = mount.section === 'uebrige' ? 'register-vieh' : 'register-pferde';
  return normalizeCharacterArchiveEntry({
    id: `rossmarkt--${mount.id}`, kind, name: mount.name, description: mount.description, icon: mount.image,
    tags: [mount.type, mount.origin, ...mount.uses],
    data: { ...mount, archiveMountId: mount.id, category: kind === 'register-pferde' ? 'pferde' : 'vieh', title: mount.name },
    sources: [{ kind: 'item-register', id: `rossmarkt:${mount.id}`, name: 'Rossmarkt' }], builtin: true
  });
}

// Classify both persisted legacy entries and fresh profile/register projections.
// This is an archive projection: character species and combat packages stay intact.
export function classifyCharacterArchiveEntries(entries = []) {
  const registeredMounts = new Map(entries.filter(entry => entry.data?.section === 'standard' && entry.data?.mountId)
    .map(entry => [entry.data.mountId, mountById.has(entry.data.mountId)
      ? standardMountProjection(entry, mountById.get(entry.data.mountId)) : entry]));
  const mountEntry = mount => registeredMounts.get(mount.id) || createArchiveMountEntry(mount);
  return entries.flatMap(entry => {
    // Register variants and individual possessions own their identity and imagery.
    // A matching breed name must never replace their stable ID or custom fields.
    if (['standard', 'offer', 'owned'].includes(entry.data?.section)) {
      const mount = entry.data.section === 'standard' && mountById.get(entry.data.mountId);
      return [mount ? registeredMounts.get(mount.id) : entry];
    }
    if (entry.kind === 'combat-style' && entry.archivedFromProfile
      && !entry.data?.id && !entry.data?.archivePlacement) return [];
    if (entry.kind === 'class') {
      const page = getArchiveClassDefinition(entry);
      if (!page) return entry.sources?.length && entry.sources.every(source => source.kind === 'creature') ? [] : [entry];
      const cultureClassProfiles = getCultureClassDefinitions(page.id, page.cultures);
      return [normalizeCharacterArchiveEntry({ ...entry, name: page.name,
        icon: entry.iconOverride || page.icon,
        data: { ...entry.data, baseClass: page.baseClass, cultures: page.cultures, pageOrder: page.order,
          pageLinks: page.pageLinks, ...(cultureClassProfiles.length ? { cultureClassProfiles } : {}) }
      })];
    }
    if (entry.kind === 'skill') {
      const skill = SKILL_DEFINITIONS.find(skill => skill.id === getSkillIdentity(entry.name));
      return [skill ? projectKnownSkill(entry, skill) : entry];
    }
    const name = normalizeArchiveSearchText(entry.name);
    const mount = mountByName.get(name);
    if (entry.kind === 'ancestry') {
      if (genericHumanNames.has(name)) return [];
      const origin = getCulturalOriginTemplate(entry.data?.id) || getCulturalOriginTemplate(entry.name);
      if (origin) return [normalizeCharacterArchiveEntry({ ...entry, name: origin.label,
        icon: entry.iconOverride || origin.icon, data: { ...origin, ...entry.data, id: origin.id, name: origin.label, icon: entry.iconOverride || origin.icon } })];
      if (mount && isLegacyMountProjection(entry, mount)) {
        const canonical = mountEntry(mount);
        return [{ ...canonical, sources: [...canonical.sources, ...(entry.sources || [])] }];
      }
      if (mount) return [entry];
      const breed = ARCHIVE_PAGE_MOUNTS.find(item => name.startsWith(`${normalizeArchiveSearchText(item.name)} `));
      if (breed && /mischling|kreuzung|halbblut/.test(name) && isMinimalBreedIdentity(entry)) {
        return [normalizeCharacterArchiveEntry({ ...entry, kind: breed.section === 'uebrige' ? 'register-vieh' : 'register-pferde',
          data: { ...entry.data, section: 'mischlinge', type: 'Mischling', breed: breed.name }
        })];
      }
      if (breed) return [entry];
      const onlyCreatureSources = entry.sources?.length && entry.sources.every(source => source.kind === 'creature');
      return onlyCreatureSources ? [] : [entry];
    }
    if (['register-pferde', 'register-vieh'].includes(entry.kind) && mount) {
      // Older archive saves lost `builtin`, but kept their Rossmarkt provenance.
      // Give these breed projections the current register identity as well; a
      // name-only merge would swallow independent offers and individual horses.
      const legacyBreed = isLegacyMountProjection(entry, mount);
      if (!legacyBreed) return [entry];
      // Only a confirmed automatic projection reaches this branch. Its current
      // Rossmarkt source owns the complete breed rules and description; manual
      // entries have already returned unchanged above.
      const canonical = mountEntry(mount);
      return [{ ...canonical,
        archivedFromProfile: entry.archivedFromProfile,
        updatedAt: entry.updatedAt,
        tags: [...(canonical.tags || []), ...(entry.tags || [])],
        sources: [...canonical.sources, ...(entry.sources || [])]
      }];
    }
    if (entry.kind === 'register-pferde' && entry.builtin && !entry.data?.section
      && !entry.data?.id && !entry.iconOverride && hasOnlyLegacyMountFields(entry)) {
      // Legacy prose tables contain coats, breeding rules and equipment as well as
      // breeds. Only the actual Rossmarkt rows belong to its automatic catalogue.
      return [];
    }
    return [entry];
  });
}

export function getCharacterArchiveClassGroups(entries = []) {
  const groups = new Map();
  for (const entry of entries) {
    const page = getArchiveClassDefinition(entry);
    const names = page?.baseClass ? ['Standardklassen'] : (page?.cultures || entry.data?.cultures || ['Weitere Klassen']);
    for (const name of names.length ? names : ['Weitere Klassen']) {
      if (!groups.has(name)) groups.set(name, { id: `classes-${name}`, type: 'culture', typeLabel: name === 'Standardklassen' ? 'Grundausbildung' : 'Kultur', name, entries: [], children: [], symbol: '♛' });
      groups.get(name).entries.push(entry);
    }
  }
  return [...groups.values()].sort((a, b) => (a.name === 'Standardklassen' ? -1 : b.name === 'Standardklassen' ? 1 : a.name === 'Weitere Klassen' ? 1 : b.name === 'Weitere Klassen' ? -1 : a.name.localeCompare(b.name, 'de')));
}

export function getCharacterArchiveHorseGroups(entries = []) {
  const labels = { roesser: 'Rösser', ponys: 'Ponys', mischlinge: 'Mischlinge', weitere: 'Weitere Pferde' };
  return Object.entries(labels).map(([section, name]) => ({
    id: `horses-${section}`, type: 'mount', typeLabel: 'Rossmarkt', name, symbol: '♞', children: [],
    entries: entries.filter(entry => (entry.data?.mountSection || (['roesser', 'ponys', 'mischlinge'].includes(entry.data?.section) ? entry.data.section : 'weitere')) === section)
  })).filter(group => group.entries.length);
}
