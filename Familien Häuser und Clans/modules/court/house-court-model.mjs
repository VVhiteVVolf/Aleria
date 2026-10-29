import { HOUSE_RANKS } from '../house-content/house-ranks.generated.mjs';
import { HOUSE_OFFICES, houseOfficeFor } from './house-office-catalog.mjs?v=20261028-office-body-v2';

// Aldrimar's kingdom source explicitly includes landless Huskarle/Walküren.
const nobleRank = /ritter|freiherr|junker|ministerial|baron|gr[aä]f|fürst|herzog|könig|kaiser|tiarna|laird|jarl|thane|thengr|hesir|hersir|huskarl|walküre|earl|duke|king|lord|adlig|adelig/i;
const unnamed = /^(?:nicht benannt|noch nicht benannt|unbekannt|unbesetzt|amtsinhaber nicht überliefert|offen|folgt\s*…?|\?+|rolle)$/i;
const areaTitles = { militaer: 'Militär', klerus: 'Klerus', gerichtsbarkeit: 'Gerichtsbarkeit', finanzen: 'Finanzen', diplomatie: 'Diplomatie', unterhaltung: 'Unterhaltung' };
export const namedOfficeHolder = name => Boolean(/\p{L}/u.test(String(name || '')) && !unnamed.test(String(name).trim()));

// A few older house sources store family relationships in the "offices" list.
// Keep those visible as relationships, never turn children or heirs into officials.
export function partitionHouseCourtEntries(entries = []) {
  const relationships = [], offices = [];
  for (const entry of entries) {
    const relation = !houseOfficeFor(entry.role) && /mündel|erbe|tochter|sohn|großtante|großmutter|onkel|nebenlinie|verheirat|affäre/i.test(entry.role || '');
    (relation ? relationships : offices).push(entry);
  }
  return { offices, relationships };
}

export function hasNobleCourt(data) {
  const rank = data.profile?.rank || data.profile?.highestTitle || HOUSE_RANKS[data.meta?.id] || '';
  const type = data.classification?.houseType || data.meta?.type || '';
  if (/bürger|buerger|bürgerlich|bürgerhaus/i.test(`${rank} ${type}`)) return false;
  return nobleRank.test(rank) || nobleRank.test(type);
}

export function completeHouseOffices(entries = [], includeVacancies = false) {
  if (!includeVacancies) return entries.map(entry => ({ ...entry }));
  const remaining = [...entries];
  const result = HOUSE_OFFICES.map(office => {
    const index = remaining.findIndex(entry => houseOfficeFor(entry.role)?.id === office.id);
    return index < 0 ? { role: office.title, name: 'Nicht benannt' } : { ...remaining.splice(index, 1)[0] };
  });
  // Nonstandard offices and multiple holders remain intact after the standard set.
  return [...result, ...remaining.map(entry => ({ ...entry }))];
}

export function houseOfficeRole(entry, index, data) {
  const office = houseOfficeFor(entry.role);
  const image = data.images?.[entry.imageKey];
  return {
    id: `house-office-${office?.id || 'custom'}-${index}`,
    title: entry.role,
    areaId: office?.area || 'unterhaltung',
    areaTitle: areaTitles[office?.area] || 'Hausdienst',
    name: namedOfficeHolder(entry.name) ? entry.name : '',
    portrait: image?.src || entry.portrait || entry.image || '',
    description: [entry.description || office?.description || 'Dieses Hofamt übernimmt den benannten Dienst im Auftrag des Hausoberhaupts.', entry.detail].filter(Boolean),
    practice: entry.practice || office?.practice || 'Der konkrete Aufgabenbereich richtet sich nach dem Auftrag des Hauses. Ergebnisse und offene Fragen werden an die zuständige Hausführung zurückgemeldet; weitergehende Vollmachten werden durch die Hofrolle nicht vorausgesetzt.',
    duties: entry.duties || office?.duties || [
      { icon: 'coordination', text: 'Den anvertrauten Hausdienst mit der Hausführung abstimmen.' },
      { icon: 'records', text: 'Erledigte Aufgaben und offenen Bedarf zurückmelden.' },
      { icon: 'judgment', text: 'Die Grenzen der tatsächlich erteilten Vollmacht beachten.' },
    ],
    jurisdiction: data.name,
    reportsTo: entry.reportsTo || 'Hausoberhaupt',
    tier: 'bronze',
    facts: [['Hausrang', data.profile?.rank || data.profile?.highestTitle || HOUSE_RANKS[data.meta?.id]],
      ['Dienstform', 'Hof- und Haushaltsdienst']],
    ...(entry.authority ? { authority: entry.authority } : {}),
    predecessor: entry.predecessor,
    links: [...(entry.links || []), ...(entry.href ? [{ label: `${entry.name} im Stammbaum öffnen ↗`, href: entry.href }] : [])],
  };
}
