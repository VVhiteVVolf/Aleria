import { buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { normalizeCharacterGenealogy, normalizeCharacterIdentity } from '../character-genealogy/person-identity.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

export const MARKET_CHARACTER_FEATURE = 'gwynthor-markt-haendler';
export const MARKET_CHARACTER_AUTHORED_AT = '2026-11-05T15:00:00.000Z';
export const MARKET_CHARACTERS = Object.freeze([
  { slug: 'cadwal-wernig', id: 'gwynthor-markt-cadwal-wernig', name: 'Cadwal Wernig', age: 42, sex: 'male', origin: 'Cenyri',
    title: 'Tuch- und Kurzwarenhändler', appearance: 'Rothaarig, mit Schnauzer und einem schmierigen Auftreten.',
    bio: 'Cadwal Wernig ist ein 42-jähriger Cenyri und betreibt einen Tuch- und Kurzwarenstand auf dem Marktplatz von Gwynthor. Sein Sortiment umfasst Stoffe und kleine Dinge für das tägliche Nähen und Ausbessern. Der rothaarige Händler mit dem Schnauzer wirkt schmierig und versucht, seine Ware mit geschäftiger Beredsamkeit an die Kundschaft zu bringen.' },
  { slug: 'alrik-tannholt', id: 'gwynthor-markt-alrik-tannholt', name: 'Alrik Tannholt', age: 61, sex: 'male', origin: 'Aldrimar',
    title: 'Haushaltswarenhändler', appearance: 'Ein älterer Mann mit blondem, altersbedingt ergrauendem Haar.',
    bio: 'Alrik Tannholt ist ein 61-jähriger Aldrimar. Auf dem Marktplatz von Gwynthor bietet er Haushaltswaren, Körbe und einfache Holzwaren an. Sein Stand richtet sich an Menschen, die praktische Dinge für Küche, Vorratshaltung und Haushalt suchen. Der ältere blonde Händler kennt den Gebrauch seiner Waren und erklärt ihn ohne großes Aufheben.' },
  { slug: 'mairwen-brennig', id: 'gwynthor-markt-mairwen-brennig', name: 'Mairwen Brennig', age: 59, sex: 'female', origin: '',
    title: 'Gemüse- und Kräuterhändlerin', appearance: 'Eine ältere brünette Frau.',
    bio: 'Mairwen Brennig ist 59 Jahre alt und lebt in Gwynthor. An ihrem Stand auf dem Gwynthorer Marktplatz verkauft sie Gemüse, Kräuter und Trockenwaren für den täglichen Bedarf. Die ältere brünette Händlerin hält die verschiedenen Waren übersichtlich beieinander und berät ihre Kundschaft bei der Auswahl.' }
]);

export function buildMarketCharacterExports(artwork = {}) {
  return MARKET_CHARACTERS.map(person => {
    const portrait = artwork[person.slug]?.url || null;
    if (portrait && (!portrait.startsWith('https://') || /[\s<>]/.test(portrait))) throw Error(`Ungültige öffentliche Bild-URL: ${person.slug}`);
    const character = buildImportedCharacter({
      worldPersonId: '', displayName: person.name, title: person.title, sex: person.sex, status: 'alive',
      birth: '', death: '', houseId: '', houseName: '', familyId: '', personId: '', tags: [], folderPath: [],
      relationships: { parents: [], partners: [], children: [] }
    }, null, MARKET_CHARACTER_AUTHORED_AT);
    // These are independent authored profiles. No family source or invented
    // world-person association is introduced through the shared profile factory.
    character.identity = normalizeCharacterIdentity({});
    character.genealogy = normalizeCharacterGenealogy({ sex: person.sex, status: 'alive' });
    Object.assign(character, { id: person.id, name: person.name, title: person.title, role: person.title,
      race: 'Mensch', age: person.age, origin: person.origin, currentLocation: 'Gwynthor · Marktplatz',
      taxonomyPath: 'Cenyr > Celtigerns Wacht > Llamreis Ankunft > Bannkreis Gwynthor > Gwynthor-Stadt',
      relevance: 'minor', portrait, bio: person.bio,
      biography: sanitizeCharacterBiographyForFirestore({ biography: { schema: 'aleria.biography-module', schemaVersion: 1,
        stats: [['Vollständiger Name', person.name], ['Alter', `${person.age} Jahre`], ['Tätigkeit', person.title], ['Standort des Marktstands', 'Gwynthor · Marktplatz'],
          ...(person.origin ? [['Herkunft', person.origin]] : [])],
        biography: { portrait: portrait || '', biographyTitle: 'Biografie', biographyText: person.bio,
          extraSections: [{ position: 'afterIntro', mode: 'text', title: 'Erscheinung', text: person.appearance }] }
      } }).biography });
    return { type: 'aleria-character', version: 1, exportedAt: MARKET_CHARACTER_AUTHORED_AT,
      mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
      sourcePath: `Charakter Archiv Exporte/Gwynthor Markt Haendler/${person.slug}.json`, character };
  });
}
