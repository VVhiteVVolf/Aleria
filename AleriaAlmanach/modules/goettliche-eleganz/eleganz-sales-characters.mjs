import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { buildImportedCharacter, createFamilyCandidates, buildFamilyPersonViewUrl } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { ELEGANZ_SALES_STAFF } from './eleganz-sales-staff.mjs';
import { buildEleganzStaffImageLibrary, ELEGANZ_EFA_AVATARS_AUTHORED_AT } from './eleganz-sales-artwork.mjs';

export const ELEGANZ_STAFF_CHARACTER_FEATURE = 'goettliche-eleganz-sales-staff';
export const ELEGANZ_STAFF_CHARACTER_AUTHORED_AT = '2026-11-06T19:30:00.000Z';
export const ELEGANZ_STAFF_FAMILY_CANDIDATES = Object.freeze(['haus-maerllys', 'haus-gwernant'].flatMap(id => {
  const record = FAMILY_REGISTRY.find(record => record.id === id);
  if (!record) throw Error(`Familienquelle fehlt: ${id}`);
  return createFamilyCandidates(record).map(candidate => Object.freeze({ ...candidate, url: buildFamilyPersonViewUrl(candidate) }));
}));
export const ELEGANZ_STAFF_CHARACTERS = Object.freeze(ELEGANZ_SALES_STAFF.map(staff => {
  const candidate = ELEGANZ_STAFF_FAMILY_CANDIDATES.find(candidate => candidate.worldPersonId === staff.worldPersonId);
  if (!candidate) throw Error(`Genealogische Identität fehlt: ${staff.name}`);
  return Object.freeze({ ...staff, id: staff.worldPersonId, slug: staff.personId, candidate });
}));

function familyBiography(person) {
  if (person.personId === 'rhys-maerllys') return 'Rhys gehört zur bürgerlichen Familie Maerllys aus Gwynthor und ist der jüngere Bruder Nia Maerllys’. Er ist unverheiratet und nicht verlobt.';
  const sister = person.personId === 'catrin-gwernant' ? 'Efa' : 'Catrin';
  return `${person.name} ist die Tochter Idwal Gwernants und Gwenllians und die Schwester von ${sister} Gwernant. Die Familie betreibt einen kleinen Leinen- und Kurzwarenladen in Gwynthor. Sie ist unverheiratet und nicht verlobt.`;
}

/** New, bounded authored records; family identity remains sourced from the trees. */
export function buildEleganzStaffCharacterExports(artwork, { published = false } = {}) {
  return ELEGANZ_STAFF_CHARACTERS.map(person => {
    const character = buildImportedCharacter(person.candidate, null, ELEGANZ_STAFF_CHARACTER_AUTHORED_AT);
    const images = buildEleganzStaffImageLibrary(person, artwork, ELEGANZ_STAFF_CHARACTER_AUTHORED_AT, { published });
    const updatedAt = person.personId === 'efa-gwernant' ? ELEGANZ_EFA_AVATARS_AUTHORED_AT : ELEGANZ_STAFF_CHARACTER_AUTHORED_AT;
    const familyText = familyBiography(person);
    const bio = `${person.name} ist ${person.age} Jahre alt und arbeitet in der Göttlichen Eleganz in Gwynthor. ${person.bio}`;
    Object.assign(character, images, {
      id: person.id, name: person.name, title: person.role, role: person.role, fraktion: 'Göttliche Eleganz', updatedAt,
      age: person.age, origin: `Gwynthor · ${person.candidate.houseName}`, currentLocation: 'Gwynthor · Göttliche Eleganz',
      relevance: 'minor', profileLink: buildFamilyPersonViewUrl(person.candidate), bio,
      biography: sanitizeCharacterBiographyForFirestore({ biography: {
        schema: 'aleria.biography-module', schemaVersion: 1,
        stats: [['Vollständiger Name', person.name], ['Alter', `${person.age} Jahre`], ['Tätigkeit', person.role],
          ['Familie', person.candidate.houseName], ['Arbeitsort', 'Gwynthor · Göttliche Eleganz'], ['Vorgesetzte', 'Maelwen Coeddu'], ['Familienstand', 'Unverheiratet']],
        biography: { portrait: images.portrait, biographyTitle: 'Biografie', biographyText: bio,
          extraSections: [{ position: 'afterIntro', mode: 'text', title: 'Familie und Herkunft', text: familyText }] }
      } }).biography
    });
    return { type: 'aleria-character', version: 1, exportedAt: updatedAt,
      mergeStrategy: 'replace-exported-fields', assignedTab: 'Göttliche Eleganz',
      sourcePath: `Charakter Archiv Exporte/Göttliche Eleganz Personal/${person.slug}.json`, character };
  });
}
