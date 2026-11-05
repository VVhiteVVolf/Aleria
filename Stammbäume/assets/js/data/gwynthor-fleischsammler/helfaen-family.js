import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createGwynthorRuralFamily } from './family-foundation.js';

const houseId = 'house-helfaen';
const parents = ['cadwgan-helfaen', 'dilys-spouse-helfaen'];
const marriage = createMarriage('marriage-cadwgan-dilys-helfaen', ...parents);
const child = 'owain-helfaen';

export const HELFAEN_FAMILY = createGwynthorRuralFamily({
  slug: 'helfaen', householdMarriageId: marriage.id, focusPersonId: parents[0],
  description: 'Sehr kleine Rheunwaith-Jägerfamilie im Jagdhaus Helfaen. Ihr bescheidener Betrieb widmet sich vor allem dem Kleinwild.',
  people: [
    createFamilyPerson({ id: parents[0], name: 'Cadwgan Helfaen', sex: 'male', birth: '1705', houseId,
      lineageRole: 'head', title: 'Kleinwildjäger', notes: '35 Jahre. Führt den kleinen Jagdbetrieb; keine besondere Großwildjagd oder adelige Jagdherrschaft.' }),
    createFamilyPerson({ id: parents[1], name: 'Dilys', sex: 'female', birth: '1708', houseId: '', familyRole: 'married',
      title: 'Jägerin und Wildverarbeiterin', notes: '32 Jahre. Cadwgans Ehefrau; arbeitet bei Jagd, Verarbeitung und örtlichem Verkauf mit. Ihre Herkunftsfamilie ist offen.' }),
    createFamilyPerson({ id: child, name: 'Owain Helfaen', sex: 'male', birth: '1730', houseId,
      title: 'Kind im Jagdhaus', notes: '10 Jahre. Hilft bei einfachen Arbeiten; kein selbständiger Jäger.' })
  ],
  partnerships: [marriage], parentages: createParentages([child], parents, marriage.id),
  biographyText: '<p>Im Jagdhaus Helfaen lebt eine sehr kleine Familie. Cadwgan und Dilys erlegen vor allem Kleinwild, verarbeiten den Fang und verkaufen geringe Überschüsse in der Umgebung. Der Betrieb ernährt den Haushalt, ohne ein großes Jagdunternehmen zu bilden.</p>',
  historyText: '<p>Cadwgan, Dilys und ihr Sohn Owain teilen sich Haus und tägliche Arbeit. Ihr Leben richtet sich nach den kleinen Fängen und den bescheidenen Bedürfnissen des Haushalts.</p>',
  works: ['Jagd auf Kleinwild für den eigenen Haushalt und örtlichen Verkauf.', 'Verarbeitung und Haltbarmachen der kleinen Fänge.', 'Pflege des Jagdhauses und seiner einfachen Gerätschaften.']
});
