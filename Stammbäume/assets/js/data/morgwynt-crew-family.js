import { createFamilyPerson, createParentages } from './family-record-builders.js';

// Die Geschwisterbeziehung ist bestätigt; ein struktureller Unbekannter
// verbindet sie, ohne Namen, Ehe oder Lebensdaten ihrer Eltern zu erfinden.
export function extendMorgwyntCrewFamily(base) {
  const parentId = 'unknown-parent-mabli-cadyn-morgwynt';
  const sourceNote = 'Nutzervorgabe vom 05.10.2026: Cadyn Morgwynt ist Mablis 14-jähriger jüngerer Bruder und Rhydian Arths persönlicher Knappe.';
  const parent = createFamilyPerson({
    id: parentId, name: 'Unbekanntes Elternteil', houseId: 'house-morgwynt',
    sex: 'unknown', status: 'unknown',
    notes: 'Struktureller Platzhalter für die bestätigte Geschwisterbeziehung von Mabli und Cadyn. Identität und weitere Elternschaft sind nicht festgelegt.',
    extensions: { structuralPlaceholder: true, sourceNote }
  });
  const cadyn = createFamilyPerson({
    id: 'cadyn-morgwynt', name: 'Cadyn Morgwynt', houseId: 'house-morgwynt',
    sex: 'male', status: 'alive', birth: '1726',
    title: 'Rhydian Arths Knappe zur See',
    portrait: '../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/portraits-2026-10-05/cadyn-morgwynt-v2.png',
    tags: ['Der Seebär', 'Rhydians Schiffsmannschaft'],
    notes: '14 Jahre im Bezugsjahr 1740. Mablis jüngerer Bruder; frech, mit braunem Pferdeschwanz, graublauen Augen und Axt. Persönlicher Knappe Rhydian Arths.',
    extensions: { sourceNote, almanachModuleId: 'rhydians-schiffsmannschaft', registryManagedFields: ['portrait'] }
  });
  return Object.freeze({
    ...base,
    persons: Object.freeze([...base.persons, parent, cadyn]),
    parentages: Object.freeze(createParentages(['mabli-morgwynt', cadyn.id], [parentId], '', {
      legitimacy: 'unknown', notes: 'Bestätigte Geschwister; Eltern nicht namentlich bekannt.'
    })),
    extensions: Object.freeze({
      ...base.extensions, sourceRevision: 4,
      sourceNote: `${base.extensions.sourceNote} ${sourceNote} Der gemeinsame Elternknoten ist ausdrücklich ein unbekannter Platzhalter.`,
      pendingFamilySituation: { openQuestions: ['Identität der Eltern von Mabli und Cadyn', 'Hausoberhaupt', 'Genaue Verwandtschaft zu Helban Morgwynt'] }
    })
  });
}
