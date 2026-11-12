import { AURDDEN_FAMILY_PEOPLE, AURDDEN_GUARDS } from '../../../Stammbäume/assets/js/data/aurdden-people.js';
import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

export const AURDDEN_CHARACTER_FEATURE = 'aurdden-hofjuwelier-20261109';
// Actual first bounded local import receipt; never a future review timestamp.
export const AURDDEN_CHARACTERS_AUTHORED_AT = '2026-11-09T17:19:15.387Z';
const portraitPath = person => person.portrait ? `../Stammbäume/${person.portrait}` : '';

export function buildAurddenCharacterCandidates(records) {
  const record = records.find(record => record.id === 'haus-aurdden');
  if (!record) throw new Error('Registrierte Aurdden-Familie fehlt.');
  const owned = new Set(AURDDEN_FAMILY_PEOPLE.map(person => person.id));
  return createFamilyCandidates(record).filter(candidate => owned.has(candidate.personId));
}

function biography(person) {
  const isGuard = person.branch === 'wache';
  const documents = isGuard ? [] : [{ title: 'Familie Aurdden im Stammbaum', text: 'Eltern, Verbindungen und Nachkommen der Familienakte.',
    link: `../Stammbäume/Stammbaum.html?family=haus-aurdden&mode=view&person=${person.id}` }];
  if (person.shopEmployee) documents.push({ title: 'Der Sternenfang', text: 'Goldschmiede und Juwelier der Aurdden in der Klingenden Münze.',
    link: '../AleriaAlmanach/AleriaAlmanach.html?entry=der-sternenfang-aurdden' });
  return sanitizeCharacterBiographyForFirestore({ biography: {
    schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: person.name,
    stats: [['Name', person.name], ['Geburt', person.birth], ...(person.death ? [['Tod', person.death]] : [['Alter 1740', `${person.age} Jahre`]]),
      ['Herkunft oder Familie', isGuard ? 'Aldrimar · eigenständiger Söldner' : 'Familie Aurdden · Gwynthor'], ['Aufgabe', person.title]],
    biography: { portrait: portraitPath(person), biographyTitle: 'Familie und bisheriger Lebensweg', biographyText: `<p>${person.notes}</p>`,
      documentsTitle: 'Verknüpfte Quellen', documents }
  } }).biography;
}

/** Explicit identities avoid name-only inference for married-in given names. */
export function buildAurddenCharacterExports(records) {
  const candidates = buildAurddenCharacterCandidates(records);
  return [...AURDDEN_FAMILY_PEOPLE, ...AURDDEN_GUARDS].map(person => {
    const candidate = candidates.find(candidate => candidate.personId === person.id);
    if (person.branch !== 'wache' && candidate?.worldPersonId !== person.worldPersonId) throw new Error(`Abweichende Aurdden-Weltperson: ${person.id}`);
    const base = candidate ? buildImportedCharacter(candidate, null, AURDDEN_CHARACTERS_AUTHORED_AT) : {
      identity: { worldPersonId: person.worldPersonId },
      genealogy: { worldPersonId: person.worldPersonId, sex: person.sex, status: 'alive', birth: person.birth, death: '', sources: [], relationships: {} },
      status: 'active', createdAt: AURDDEN_CHARACTERS_AUTHORED_AT, updatedAt: AURDDEN_CHARACTERS_AUTHORED_AT,
      emotes: [], imageSets: [], activeImageSetId: '', inventory: null, playerOwner: ''
    };
    return {
      type: 'aleria-character', version: 1, exportedAt: AURDDEN_CHARACTERS_AUTHORED_AT,
      mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
      sourcePath: `Charakter Archiv Exporte/Aurdden Sternenfang/${person.id}.json`,
      character: { ...base, id: person.worldPersonId, name: person.name, title: person.title, role: person.title,
        race: 'Mensch', age: person.age, origin: person.branch === 'wache' ? 'Aldrimar' : 'Rheunwaith · Cenyr',
        currentLocation: person.marriedAway || person.bastard ? '' : person.branch === 'bank' ? 'Gwynthor · Bankzweig' : 'Gwynthor',
        fraktion: person.branch === 'wache' ? 'Der Sternenfang · angeworbene Ladenwache' : 'Familie Aurdden',
        portrait: portraitPath(person) || null, bio: person.notes, biography: biography(person), archived: false }
    };
  });
}
