import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { RESALE_PEOPLE, RESALE_FAMILY_ID } from '../../../Stammbäume/assets/js/data/gwynthor-horse-resale/resale-family.mjs';
import { RESALE_MODULE_ID } from './resale-module.mjs';
export const RESALE_CHARACTER_FEATURE = 'gwynthor-horse-resale-20261113';
export function buildResaleCharacterExports(record, authoredAt) {
  if (record.id !== RESALE_FAMILY_ID) throw Error('Falscher Familienkandidat.');
  const candidates = createFamilyCandidates(record);
  return RESALE_PEOPLE.map(p => {
    const candidate = candidates.find(c => c.worldPersonId === p.worldPersonId); if (!candidate) throw Error(p.id);
    const base = buildImportedCharacter(candidate, null, authoredAt);
    const biography = sanitizeCharacterBiographyForFirestore({ biography: { schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: p.name,
      stats: [['Name', p.name], ['Alter 1740', `${1740 - Number(p.birth)} Jahre`], ['Geburt', p.birth], ['Aufgabe', p.title]],
      biography: { portrait: p.portrait, biographyTitle: 'Person und Familienbetrieb', biographyText: `<p>${p.notes}</p>`,
        historyTitle: 'Die Ruddgraen', historyText: '<p>Der Gwynthorer Haushalt führt den kleinen Pferdehandel Zum Schiefen Nagel. Er kauft Gebrauchsmischlinge von Bauern, Söldnern und Reisenden und verkauft sie nach Beobachtung weiter. Eigene Pferdezucht, Landgestüt und Sattlerei gehören nicht zum Betrieb.</p>',
        documentsTitle: 'Familie und Ort', documents: [
          { title: 'Familie Ruddgraen', text: 'Eltern und vier Kinder.', link: `../Stammbäume/Stammbaum.html?family=${RESALE_FAMILY_ID}&mode=view&person=${p.id}` },
          { title: 'Zum Schiefen Nagel', text: 'Der kleine Pferdehandel in Gwynthor-Stadt.', link: `../AleriaAlmanach/AleriaAlmanach.html?entry=${RESALE_MODULE_ID}` }
        ] } } }).biography;
    return { type: 'aleria-character', version: 1, exportedAt: authoredAt, assignedTab: 'Gwynthor', mergeStrategy: 'replace-exported-fields',
      sourcePath: `Charakter Archiv Exporte/Zum Schiefen Nagel/${p.id}.json`, character: { ...base, id: p.worldPersonId,
        name: p.name, title: p.title, role: p.title, age: 1740 - Number(p.birth), race: 'Mensch', origin: 'Gwynthor · Cenyr', fraktion: 'Familie Ruddgraen',
        portrait: p.portrait, bio: p.notes, biography, currentLocation: 'Zum Schiefen Nagel · Gwynthor-Stadt', archived: false } };
  });
}
