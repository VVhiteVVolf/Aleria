import { HOF_STAFF, HOF_HOUSING } from '../../../shared/tirfelyn-hof/hof-residents.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

export const HOF_CHARACTER_FEATURE = 'tirfelyn-hof-20261115';
export function buildHofCharacterExports() {
  return HOF_STAFF.map(person => {
    const home = HOF_HOUSING.find(house => house.id === person.residenceId);
    const biography = sanitizeCharacterBiographyForFirestore({ biography: {
      schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: person.name,
      stats: [['Name', person.name], ['Alter 1740', `${person.age} Jahre`], ['Aufgabe', person.role], ['Wohnort', home.label]],
      biography: { portrait: person.portrait, biographyTitle: person.role, biographyText: `<p>${person.bio}</p>`,
        historyTitle: 'Am Tirfelyn-Hof', historyText: '<p>Der Familienhof versorgt Gwynthor mit Vieh, Getreide und Gemüse. Caradog und Eudaf Tirfelyn führen ihn gemeinsam; die Bediensteten ergänzen die Arbeit der Familie.</p>',
        documentsTitle: 'Hof und Arbeitsort', documents: [{ title: 'Tirfelyn-Hof', text: 'Bewohner, Arbeitsbereiche und getrennte interaktive Szenen.', link: '../AleriaAlmanach/AleriaAlmanach.html?entry=tirfelyn-hof' }] }
    } }).biography;
    return { type: 'aleria-character', version: 1, exportedAt: '2026-11-15T20:00:00Z', assignedTab: 'Gwynthor', mergeStrategy: 'replace-exported-fields',
      sourcePath: `Charakter Archiv Exporte/Tirfelyn Hof/${person.key}.json`,
      character: { id: person.id, name: person.name, title: person.role, role: person.role, age: person.age, birth: person.birth,
        gender: person.gender, race: 'Mensch', origin: person.origin, identity: { worldPersonId: person.id },
        genealogy: { worldPersonId: person.id, sources: [] }, fraktion: 'Tirfelyn-Hof', portrait: person.portrait,
        bio: person.bio, biography, currentLocation: `${home.label} · Tirfelyn-Hof · Gwynthor`, archived: false } };
  });
}
