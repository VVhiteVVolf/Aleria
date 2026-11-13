import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { STUD_PEOPLE } from './stud-people.mjs';
export const STUD_CHARACTER_FEATURE = 'gwynthor-horse-studs-20261113';
export const KYRIA_CHARACTER_FEATURE = 'aurdden-hofjuwelier-20261109';
export const KYRIA_WORLD_ID = 'person--haus-aurdden--kyria-aurdden';
export function studCharacterCandidates(records) {
  return ['haus-halenrhyd', 'haus-caeffyn', 'haus-aurdden'].flatMap(id => {
    const record = records.find(r => r.id === id); if (!record) throw Error(`Gestütsfamilie fehlt: ${id}`);
    return createFamilyCandidates(record).filter(p => STUD_PEOPLE.some(s => s.worldPersonId === p.worldPersonId && (s.id === 'kyria-aurdden' ? id === 'haus-aurdden' : s.familyId === id)));
  });
}
export function buildStudCharacterExports(records, { authoredAt, existingKyria }) {
  if (existingKyria?.id !== KYRIA_WORLD_ID || existingKyria.identity?.worldPersonId !== KYRIA_WORLD_ID) throw Error('Bestehende Kyria-Identität fehlt.');
  const candidates = studCharacterCandidates(records);
  return STUD_PEOPLE.map(person => {
    const candidate = candidates.find(c => c.worldPersonId === person.worldPersonId); if (!candidate) throw Error(`Figurenkandidat fehlt: ${person.id}`);
    const existing = person.worldPersonId === KYRIA_WORLD_ID ? existingKyria : null;
    const { localRecord, ...prior } = existing || {};
    const base = { ...prior, ...buildImportedCharacter(candidate, existing, authoredAt) };
    const familyId = person.id === 'kyria-aurdden' ? 'haus-aurdden' : person.familyId;
    const location = person.id === 'maelrig-caeffyn' || person.id === 'kyria-aurdden' ? 'Rhosmeres Rösser – Gwynthor' :
      person.branch === 'zucht' ? 'Halenrhyd-Landgestüt · östlicher Bannkreis Gwynthor' : person.branch === 'hof' ? 'Halenrhyd-Futterhof · Bannkreis Gwynthor' : 'Zum Silberhalm · Gwynthor';
    const biography = sanitizeCharacterBiographyForFirestore({ biography: { schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: person.name,
      stats: [['Name', person.name], ['Geburt', person.birth], [person.death ? 'Tod' : 'Alter 1740', person.death || `${person.age} Jahre`], ['Aufgabe', person.title]],
      biography: { portrait: person.portrait, biographyTitle: 'Familie und Lebensweg', biographyText: `<p>${person.notes}</p>`,
        historyTitle: 'Herkunft und Verbindungen', historyText: `<p>${person.id === 'kyria-aurdden' ? 'Kyria bleibt die Tochter Pereth Aurddens und Uffyrias. Ihre Ausbildung im Schriftverkehr des Bankzweigs ging der neuen Aufgabe voraus. Die Ehe mit Maelrig Caeffyn und ihre Verwaltung des Gildenstandorts ersetzen diese Herkunft nicht.' : person.id === 'maelrig-caeffyn' ? 'Aus dem Ährental führte sein Weg über die Ausbildung und kleinere Niederlassungen der Gilde nach Gwynthor. Weitere Verwandte werden zunächst nicht einzeln dargestellt.' : 'Die Halenrhyd sind eine bürgerliche Familie im Dienst Haus Wyrms. Stadtgestüt, Landzucht und eigener Futterhof werden von drei verwandten Haushalten getragen.'}</p>`,
        documentsTitle: 'Familie und Betrieb', documents: [{ title: 'Familienstammbaum', text: 'Bestehende Weltidentität und familiäre Verbindungen.', link: `../Stammbäume/Stammbaum.html?family=${familyId}&mode=view&person=${person.id}` },
          { title: 'Der zugehörige Betrieb', text: location, link: `../AleriaAlmanach/AleriaAlmanach.html?entry=${person.id === 'kyria-aurdden' || person.id === 'maelrig-caeffyn' ? 'rhosmeres-roesser-gwynthor' : 'zum-silberhalm-halenrhyd'}` }] } } }).biography;
    return { type: 'aleria-character', version: 1, exportedAt: authoredAt, mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
      sourcePath: `Charakter Archiv Exporte/Gwynthorer Gestuete/${person.id}.json`, character: { ...base, id: person.worldPersonId,
        identity: { ...existing?.identity, ...base.identity }, name: person.name, title: person.title, role: person.title, age: person.age, race: 'Mensch',
        portrait: person.portrait || null, bio: person.notes, biography, currentLocation: location,
        origin: person.id === 'maelrig-caeffyn' ? 'Ährental · Cenyr' : existing?.origin || 'Cenyr',
        fraktion: person.id === 'maelrig-caeffyn' || person.id === 'kyria-aurdden' ? 'Rhosmeres Rösser · Gwynthor' : 'Familie Halenrhyd', archived: false } };
  });
}
