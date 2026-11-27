import { safeConceptUrl } from './concept-media.mjs';
import { conceptTitle, CONCEPT_TYPES } from './concept-schema.mjs';
import { isConceptId } from './concept-drafts.mjs';

const site = new URL('../../', import.meta.url);
const personalities = {
  ambitious: 'Ehrgeizig', arbitrary: 'Willkürlich', arrogant: 'Überheblich',
  brave: 'Mutig', callous: 'Gefühlskalt', calm: 'Gelassen', chaste: 'Keusch',
  compassionate: 'Mitfühlend', content: 'Zufrieden', craven: 'Furchtsam',
  cynical: 'Zynisch', deceitful: 'Hinterlistig', diligent: 'Fleißig',
  eccentric: 'Exzentrisch', fickle: 'Sprunghaft', forgiving: 'Nachsichtig',
  generous: 'Großzügig', gluttonous: 'Gefräßig', greedy: 'Habgierig',
  gregarious: 'Gesellig', honest: 'Ehrlich', humble: 'Bescheiden',
  impatient: 'Ungeduldig', just: 'Gerecht', lazy: 'Faul', lustful: 'Wollüstig',
  paranoid: 'Misstrauisch', patient: 'Geduldig', sadistic: 'Grausam',
  shy: 'Schüchtern', stubborn: 'Stur', temperate: 'Maßvoll', trusting: 'Vertrauensvoll',
  vengeful: 'Rachsüchtig', wrathful: 'Jähzornig', zealous: 'Glaubenseifrig'
};

export const personalityIcons = Object.entries(personalities).map(([id, name]) => ({
  id, name, description: 'Persönlichkeit', src: `/IconOrdner/Big Traits/Trait_${id}.png`
}));

const byName = (a, b) => a.name.localeCompare(b.name, 'de');
const normalize = value => String(value ?? '').toLocaleLowerCase('de')
  .normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/ß/g, 'ss');

export function filterCatalog(entries, query) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    const haystack = normalize([entry.name, entry.description, entry.keywords, entry.id].join(' '));
    return terms.every(term => haystack.includes(term));
  });
}

export function conceptReferenceHref(target) {
  if (!isConceptId(target.id)) return '';
  const id = encodeURIComponent(target.id);
  if (target.type === 'character') return `../../AleriaAlmanach/AleriaAlmanach.html?character=${id}`;
  if (target.type === 'house') {
    if (target.page === 'house') return `../../Familien Häuser und Clans/haus.html?haus=${id}`;
    if (target.page === 'small-house') return `../../Familien Häuser und Clans/kleinehaeuser.html?haus=${id}`;
    return `../../Stammbäume/Stammbaum.html?family=${id}&mode=view`;
  }
  return '';
}

export function draftReferences(drafts, currentId) {
  return drafts.filter(draft => draft.id !== currentId).map(draft => ({
    id: draft.id, name: conceptTitle(draft), description: CONCEPT_TYPES[draft.kind].label, type: 'draft'
  })).sort(byName);
}

function projectHouse(house) {
  const id = house?.familyId || house?.id;
  if (!isConceptId(id) || !house.name) return null;
  const entry = { id, type: 'house', name: house.name, description: house.seat || house.rank || '' };
  const paths = { 'haus.html': 'house', 'kleinehaeuser.html': 'small-house' };
  if (typeof house.href === 'string' && house.href.startsWith('/Familien%20H%C3%A4user%20und%20Clans/')) {
    const [filename, query] = house.href.split('/').at(-1).split('?');
    if (Object.hasOwn(paths, filename) && new URLSearchParams(query).get('haus') === id) entry.page = paths[filename];
  }
  return entry;
}

export function createConceptCatalogs(read = globalThis.fetch) {
  const pending = new Map();

  async function json(path) {
    const response = await read(new URL(path, site));
    if (!response.ok) throw new Error('Register nicht verfügbar.');
    return response.json();
  }

  const loaders = {
    personality: () => [...personalityIcons],
    async development() {
      const { DEVELOPMENT_TRAITS } = await import('../../AleriaAlmanach/modules/character-development/development-traits.js');
      return DEVELOPMENT_TRAITS.filter(trait => safeConceptUrl(trait.icon)).map(trait => ({
        id: trait.id, name: trait.name, description: trait.tags, src: trait.icon
      }));
    },
    async character() {
      const { records } = await json('CharakterDatenbank/registry.json');
      const entries = new Map();
      for (const record of records) {
        const id = record.firestoreDocumentId;
        if (!isConceptId(id) || !record.name) continue;
        entries.set(id, {
          id, type: 'character', name: record.name, description: record.primary?.label || '',
          keywords: record.aliases?.join(' ')
        });
      }
      return [...entries.values()];
    },
    async house() {
      const [directories, published] = await Promise.allSettled([
        json('shared/world-directory/house-directories.generated.json'),
        json('Stammbäume/assets/data/published-families/registry.json')
      ]);
      if (directories.status === 'rejected' && published.status === 'rejected') throw directories.reason;
      const entries = new Map();
      const places = Object.values(directories.value?.places || {}).flat();
      const territories = Object.values(directories.value?.territories || {}).flat();
      const houses = [...places.flatMap(group => group.items || []), ...territories.flatMap(group => group.cards || [])];
      for (const house of houses) {
        const entry = projectHouse(house);
        if (entry && !entries.has(entry.id)) entries.set(entry.id, entry);
      }
      for (const family of published.value?.families || []) {
        const id = family.familyId || family.id;
        if (!isConceptId(id) || !family.title || entries.has(id)) continue;
        entries.set(id, { id, type: 'house', name: family.title, description: family.folderPath?.join(' · ') || '' });
      }
      return [...entries.values()];
    }
  };

  return function load(category) {
    if (!pending.has(category)) {
      const request = Promise.resolve().then(loaders[category]).then(entries => entries.sort(byName));
      pending.set(category, request);
      request.catch(() => pending.delete(category));
    }
    return pending.get(category);
  };
}
