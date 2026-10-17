import { RETINUE_PEOPLE, RETINUE_EXISTING_IDS } from './retinue-people.mjs';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';

export function retinueBiography(person) {
  return { schema: 'aleria.biography-module', schemaVersion: 1,
    stats: [{ label: 'Name', value: person.name }, { label: 'Geboren / Alter', value: `${person.birth} · ${person.age} Jahre (1740)` }, { label: 'Gefolge', value: 'Skallis Gefolge' }, { label: 'Aufgabe', value: person.role }],
    biography: { biographyTitle: person.name, biographyText: `<p>${person.bio}</p>`, portrait: person.portrait,
      documentsTitle: 'Familie', documents: [{ title: 'Familienakte', text: 'Herkunft und Verwandtschaft.', link: person.link }], footer: 'Skallis Gefolge · Roriksheim' } };
}

export function planRetinueCharacters(existingCharacters, config, now = new Date().toISOString()) {
  // Fenrir's older online profile predates the family link. Its established ID
  // is authoritative; supply the known match to the pure planner without
  // mutating the caller's data or creating another Fenrir.
  const existingForPlan = existingCharacters.map(character => {
    const person = RETINUE_PEOPLE.find(person => RETINUE_EXISTING_IDS[person.key] === character.id);
    if (!person) return character;
    const identity = character.identity?.worldPersonId || character.genealogy?.worldPersonId;
    if (identity && identity !== person.worldPersonId) throw Error(`Widersprüchliche bekannte Identität: ${person.name}`);
    return { ...character, identity: { ...character.identity, worldPersonId: person.worldPersonId } };
  });
  const members = RETINUE_PEOPLE.map(person => ({ key: person.key, candidates: [person.candidate], primaryCandidate: person.candidate,
    subgroup: ['skalli-varulv', 'ragna-baerenherz', 'torben-rotstahl'].includes(person.key) ? 'Führung' : person.division === 'Nachwuchs' ? 'Maer & Drengr' : person.division === 'Huskarl' ? 'Huskarle' : 'Walküren',
    profile: { name: person.name, title: person.role, role: person.role, bio: person.bio,
      biography: retinueBiography(person), portrait: person.portrait, origin: person.candidate.folderPath.join(' · '),
      fraktion: 'Skallis Gefolge · Roriksheim', relevance: 'supporting' } }));
  return planFamilyCharacterGroup({ members, existingCharacters: existingForPlan, config, group: 'Skallis Gefolge', now });
}
