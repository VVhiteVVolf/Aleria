import { KANNE_PEOPLE } from '../../../../AleriaAlmanach/modules/krumme-kanne/krumme-kanne-roster.mjs';
import { createFamilyPerson } from './family-record-builders.js';

const MEMBERS = {
  trevoryn: ['merrik', 'eirian', 'elidyr', 'nestwen', 'celyn', 'cadri', 'enlli'],
  svathamar: ['hrolf', 'ketil', 'runa', 'styr', 'heledd'],
  dubhdarach: ['aedan', 'neifion', 'eirlys']
};
const MARRIED = new Set(['nestwen', 'celyn', 'mair']);
const EXISTING = {
  mair: { id: 'mair-affair-tonnarth', worldPersonId: 'person--family-tree--mair-affair-tonnarth', houseId: '' },
  caradog: { id: 'caradog-bastard-tonnarth', worldPersonId: 'person--haus-tonnarth--caradog-bastard-tonnarth', houseId: 'house-tonnarth' }
};

export function kanneFamilyPerson(key, options = {}) {
  const p = KANNE_PEOPLE.find(person => person.id === key);
  if (!p) throw new Error(`Unbekanntes Familienmitglied: ${key}`);
  const surname = Object.keys(MEMBERS).find(name => MEMBERS[name].includes(key));
  const id = `${key}-${surname}-kanne`;
  return createFamilyPerson({
    id, worldPersonId: `person--krumme-kanne--${id}`, houseId: surname ? `house-${surname}` : '',
    ...EXISTING[key], name: p.name, birth: String(p.birth), sex: p.sex,
    familyRole: MARRIED.has(key) ? 'married' : 'core', title: p.role,
    notes: p.biography,
    portrait: p.portrait || `../AleriaAlmanach/assets/krumme-kanne/${['merrik', 'hrolf', 'aedan'].includes(key) ? 'references' : 'portraits'}/${key}.png`,
    extensions: { registryManagedFields: ['title', 'notes', 'portrait'] }, ...options
  });
}

export const KANNE_MARRIAGES = Object.freeze({
  merrik: { id: 'marriage-merrik-celyn-kanne', people: ['merrik', 'celyn'], children: ['cadri', 'enlli'], start: '1725' },
  hrolf: { id: 'marriage-hrolf-eirian-kanne', people: ['hrolf', 'eirian'], children: ['styr', 'heledd'], start: '1723' },
  aedan: { id: 'marriage-aedan-mair-kanne', people: ['aedan', 'mair'], children: ['neifion', 'eirlys'], start: '1724' }
});

export const KANNE_FAMILY_DEFINITIONS = Object.freeze([
  { slug: 'trevoryn', title: 'Trevoryn', file: 'Trevoryn.png' },
  { slug: 'svathamar', title: 'Svathamar', file: 'Svathamar.png' },
  { slug: 'dubhdarach', title: 'Dubhdarach', file: 'Dubhdarach.png' }
]);
