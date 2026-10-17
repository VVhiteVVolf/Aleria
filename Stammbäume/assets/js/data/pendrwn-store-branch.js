import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { STORE_FAMILY } from '../../../../AleriaAlmanach/modules/pendrwn-general-store/store-people.mjs';

const MARRIAGE_ID = 'marriage-cadwgan-mabli-pendrwn';
const GRANDPARENTS_MARRIAGE = 'marriage-idwal-bronwen-pendrwn';
const FAMILY_IDS = new Set(STORE_FAMILY.map(p => p.id));

/** Extend only the eldest branch; preserve every existing relationship and identifier. */
export function withPendrwnStoreBranch(family) {
  const records = STORE_FAMILY.map(p => createFamilyPerson({
    id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex, birth: p.birth,
    houseId: p.key === 'mabli' ? '' : 'house-pendrwn',
    familyRole: p.key === 'mabli' ? 'married' : 'core',
    portrait: p.portrait.replace('./assets/', '../AleriaAlmanach/assets/'),
    title: p.role, tags: [`${1740 - Number(p.birth)} Jahre`], notes: p.bio
  }));
  const persons = family.persons.filter(p => !FAMILY_IDS.has(p.id)).map(p => p.id === 'idwal-pendrwn'
    ? { ...p, title: 'Oberhaupt des Hauses Pendrwn · Mitinhaber des Vollen Korbs',
      notes: [p.notes, 'Führt mit seinem ältesten Sohn Cadwgan den Gemischtwarenhandel Zum Vollen Korb; pflegt dessen direkte Lieferbeziehung zum Markt der Fortuna.'].filter(Boolean).join(' '),
      extensions: { ...p.extensions, registryManagedFields: [...new Set([...(p.extensions?.registryManagedFields || []), 'title', 'notes'])] } }
    : p);
  const insertAt = persons.findIndex(p => p.id === 'meilyr-pendrwn');
  persons.splice(insertAt < 0 ? persons.length : insertAt, 0, ...records);
  const parentages = [...family.parentages];
  const siblingIndex = parentages.findIndex(p => p.childId === 'meilyr-pendrwn');
  parentages.splice(siblingIndex < 0 ? parentages.length : siblingIndex, 0,
    ...createParentages(['cadwgan-pendrwn'], ['idwal-pendrwn', 'bronwen-spouse-pendrwn'], GRANDPARENTS_MARRIAGE));
  parentages.push(...createParentages(['rhun-pendrwn', 'tesni-pendrwn'], ['cadwgan-pendrwn', 'mabli-spouse-pendrwn'], MARRIAGE_ID));
  return { ...family,
    description: `${family.description} Der älteste Sohn Cadwgan und sein Vater Idwal führen den Gemischtwarenhandel Zum Vollen Korb.`,
    persons: Object.freeze(persons),
    partnerships: Object.freeze([...family.partnerships, createMarriage(MARRIAGE_ID, 'cadwgan-pendrwn', 'mabli-spouse-pendrwn', { start: '1708' })]),
    parentages: Object.freeze(parentages),
    extensions: { ...family.extensions, sourceRevision: 3,
      sourceNote: `${family.extensions.sourceNote} Ergänzt ist Cadwgans ältester, eigener Händlerzweig. Meilyrs und Gweniths bestehende Linien bleiben inhaltlich unverändert und gehören nicht zum Laden.` }
  };
}
