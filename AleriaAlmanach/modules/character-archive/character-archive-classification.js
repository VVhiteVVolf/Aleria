import { ARCHIVE_PAGE_CLASSES, ARCHIVE_PAGE_MOUNTS } from './character-archive-page-data.js?v=20260905-barde-icon-v1';
import { getClassPageIcon } from '../classes/class-icon-registry.js?v=20260905-cenyr-v2';
import { normalizeArchiveSearchText, normalizeCharacterArchiveEntry } from './character-archive-model.js?v=20260905-archive-order-v2';
import { getCultureClassDefinitions } from '../classes/culture-class-definitions.js';

const classByName = new Map(ARCHIVE_PAGE_CLASSES.map(entry => [normalizeArchiveSearchText(entry.name), entry]));
const mountByName = new Map(ARCHIVE_PAGE_MOUNTS.map(entry => [normalizeArchiveSearchText(entry.name), entry]));
const genericHumanNames = new Set(['mensch', 'menschen', 'human']);

export function getArchiveClassDefinition(entry = {}) {
  const pageName = (getClassPageIcon(entry.data?.id) || getClassPageIcon(entry.name))?.pageName;
  return classByName.get(normalizeArchiveSearchText(pageName || entry.name)) || null;
}

export function createArchiveMountEntry(mount) {
  const kind = mount.section === 'uebrige' ? 'register-vieh' : 'register-pferde';
  return normalizeCharacterArchiveEntry({
    id: `rossmarkt--${mount.id}`, kind, name: mount.name, description: mount.description, icon: mount.image,
    tags: [mount.type, mount.origin, ...mount.uses],
    data: { ...mount, category: kind === 'register-pferde' ? 'pferde' : 'vieh', title: mount.name },
    sources: [{ kind: 'item-register', id: `rossmarkt:${mount.id}`, name: 'Rossmarkt' }], builtin: true
  });
}

// Classify both persisted legacy entries and fresh profile/register projections.
// This is an archive projection: character species and combat packages stay intact.
export function classifyCharacterArchiveEntries(entries = []) {
  return entries.flatMap(entry => {
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
    const name = normalizeArchiveSearchText(entry.name);
    const mount = mountByName.get(name);
    if (entry.kind === 'ancestry') {
      if (genericHumanNames.has(name)) return [];
      if (mount) {
        const canonical = createArchiveMountEntry(mount);
        return [{ ...canonical, sources: [...canonical.sources, ...(entry.sources || [])] }];
      }
      const breed = ARCHIVE_PAGE_MOUNTS.find(item => name.startsWith(`${normalizeArchiveSearchText(item.name)} `));
      if (breed && /mischling|kreuzung|halbblut/.test(name)) {
        return [normalizeCharacterArchiveEntry({ ...entry, kind: breed.section === 'uebrige' ? 'register-vieh' : 'register-pferde',
          data: { ...entry.data, section: 'mischlinge', type: 'Mischling', breed: breed.name }
        })];
      }
      const onlyCreatureSources = entry.sources?.length && entry.sources.every(source => source.kind === 'creature');
      return onlyCreatureSources ? [] : [entry];
    }
    if (entry.kind === 'register-pferde' && mount) {
      // The current market page replaces older markdown-table prices and origins.
      const canonical = createArchiveMountEntry(mount);
      return [normalizeCharacterArchiveEntry({ ...entry, kind: canonical.kind,
        description: entry.builtin ? canonical.description : entry.description,
        icon: entry.iconOverride || canonical.icon,
        data: { ...entry.data, ...canonical.data }, tags: [...(entry.tags || []), ...canonical.tags]
      })];
    }
    if (entry.kind === 'register-pferde' && entry.builtin && !entry.data?.section) {
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
    entries: entries.filter(entry => (entry.data?.section || 'weitere') === section)
  })).filter(group => group.entries.length);
}
