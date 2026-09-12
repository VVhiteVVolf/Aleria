// School metadata belongs to the catalogue, independently of edition numbers.
const schools = [
  { id: 'elemente', name: 'Elemente', sections: [
    { id: 'F', name: 'Feuer', subtitle: 'Glut, Wärme und verzehrende Flammen' },
    { id: 'W', name: 'Wasser', subtitle: 'Strömung, Quellen und gebundenes Eis' },
    { id: 'L', name: 'Wind', subtitle: 'Atem, Auftrieb und bewegte Luft' },
    { id: 'DN', name: 'Donner', subtitle: 'Schall, Druck und Widerhall' },
    { id: 'BL', name: 'Blitz', subtitle: 'Ladung, Entladung und Erdung' },
    { id: 'E', name: 'Erde', subtitle: 'Boden, Stein und tragende Formen' },
    { id: 'Z', name: 'Sonstiges & Zusammenspiel', subtitle: 'Wo mehrere Elemente einander begegnen' }
  ] },
  { id: 'restitution', name: 'Restitution', sections: [
    { id: 'versorgung', name: 'Notfall & Grundversorgung', subtitle: 'Den Lebensfaden halten, Wunden schließen' },
    { id: 'koerper', name: 'Gewebe & Körperaufbau', subtitle: 'Was verletzt wurde, wieder zusammenfügen' },
    { id: 'reinigung', name: 'Entgiftung & Zustandsbehandlung', subtitle: 'Die Ursache erkennen, die richtige Beeinträchtigung lösen' },
    { id: 'lebenskraft', name: 'Erholung & Lebenskraft', subtitle: 'Den geschwächten Körper zu seiner eigenen Kraft zurückführen' },
    { id: 'wahrung', name: 'Lebenswahrung & heilendes Licht', subtitle: 'Vorsorge, Schutz und ein Licht für den nächsten Atemzug' },
    { id: 'gemeinschaft', name: 'Gemeinschaft & Meisterkunst', subtitle: 'Heilung teilen, größere Wunden versorgen' }
  ] }
];

export function listSpellCatalogSchools() { return structuredClone(schools); }
export function getSpellCatalogSchool(id = 'elemente') {
  const school = schools.find(entry => entry.id === id);
  return school ? structuredClone(school) : null;
}
