import { HOUSE_MELOG_FAMILY } from '../../../Stammbäume/assets/js/data/house-melog-family.js';
import { createFamilyCandidates, buildFamilyPersonViewUrl } from '../character-genealogy/genealogy-mapping.js';

// Build-time projection: the family owns identities, dates and relationships.
export const MELOG_FAMILY_CANDIDATES = Object.freeze(createFamilyCandidates({
  id: 'melog', title: 'Familie Melog', family: HOUSE_MELOG_FAMILY,
  folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
  source: 'Stammbäume/assets/data/source-inventories/melog-20261105/melog-original.json'
}).map(candidate => Object.freeze({ ...candidate, url: buildFamilyPersonViewUrl(candidate) })));

const shopRoles = Object.freeze({
  Ithel: { role: 'Früherer Konditor- und Bäckermeister' },
  Tangwystl: { role: 'Ithels Gemahlin · Tewdwrs Mutter' },
  Tewdwr: { role: 'Konditor- und Bäckermeister · Oberhaupt', area: 'leitung' },
  Morfudd: { role: 'Buchhaltung und Finanzen', area: 'leitung' },
  Anest: { role: 'Konditor- und Bäckermeisterin', area: 'backstube' },
  Afanen: { role: 'Verkaufsleitung', area: 'verkauf' },
  Guto: { role: 'Bäcker · Naschkatze', area: 'backstube' },
  Eiffion: { role: 'Einkauf und Lieferungen', area: 'verkauf' },
  Llywarch: { role: 'Verkauf und Gästebetreuung', area: 'verkauf' },
  Mabli: { role: 'Verpackung und Einkauf', area: 'verkauf' },
  Nerys: { role: 'Chaos-Konditorin', area: 'backstube' },
  Elisedd: { role: 'Begabtes Allroundtalent' }, Teleri: { role: 'Kleine Schauspielerin' },
  Lleufer: { role: 'Eitler Charmeur' }, Cerys: { role: 'Geschäftstüchtiges, etwas eingebildetes Kind' },
  Iddon: { role: 'Klein-Guto · Naschkatze' }
});

export const MELOG_PEOPLE = Object.freeze(MELOG_FAMILY_CANDIDATES.filter(candidate => shopRoles[candidate.recordedName])
  .map(candidate => Object.freeze({ id: candidate.personId, worldPersonId: candidate.worldPersonId,
    name: candidate.recordedName, displayName: candidate.displayName, birth: candidate.birth,
    death: candidate.death, status: candidate.status, portrait: candidate.portrait,
    candidate, ...shopRoles[candidate.recordedName] })));

if (MELOG_PEOPLE.length !== 16) throw new Error('Die Melog-Besetzung benötigt die 16 benannten Personen der geprüften Familienquelle.');

export function melogPerson(name) {
  const result = MELOG_PEOPLE.find(person => person.name === name);
  if (!result) throw new Error(`Unbekannte Melog-Person: ${name}`);
  return result;
}

export const melogConnection = name => {
  const person = melogPerson(name);
  return { name: person.displayName, detail: person.role, image: person.portrait, imageFormat: 'portrait' };
};
