import { readdir, readFile } from 'node:fs/promises';
import { HOUSE_DRAIG_FAMILY } from '../../../Stammbäume/assets/js/data/house-draig-family.js';
import { DRAIG_HOUSEHOLDS } from './wing-households.mjs';
import { reviewDraigOccupants } from './wing-layout.mjs';

// Authoring only: select records by world-person identity, never name alone.
export async function loadDraigWingReview() {
  const selected = HOUSE_DRAIG_FAMILY.persons.filter(person => DRAIG_HOUSEHOLDS.some(room => room.personIds.includes(person.id)));
  const worldIds = new Set(selected.map(person => person.worldPersonId));
  const familyIds = new Set(selected.map(person => person.worldPersonId.split('--')[1] === 'haus-eirce' ? 'haus-ua-eirce' : person.worldPersonId.split('--')[1]));
  const characters = [];
  for (const familyId of familyIds) {
    const familyDirectory = new URL(`../../../CharakterDatenbank/records/familien/${familyId}/`, import.meta.url);
    let directories;
    try { directories = await readdir(familyDirectory, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    for (const directory of directories.filter(directory => directory.isDirectory())) {
      const file = new URL(`${directory.name}/character.json`, familyDirectory);
      const record = JSON.parse(await readFile(file, 'utf8'));
      const linkedPerson = selected.find(person => (record.links.familyTree || []).some(link => link.familyId === 'haus-draig' && link.personId === person.id));
      if (!worldIds.has(record.identity.worldPersonId) && !linkedPerson) continue;
      characters.push({ worldPersonId: linkedPerson?.worldPersonId || record.identity.worldPersonId, characterId: record.character.id,
        name: record.identity.name, record: `CharakterDatenbank/records/familien/${familyId}/${directory.name}/character.json` });
    }
  }
  // A similarly named standalone Egon has no genealogy link. Do not merge it
  // by name or fabricate an online character ID for the family-tree person.
  for (const person of selected.filter(person => !characters.some(record => record.worldPersonId === person.worldPersonId))) {
    characters.push({ worldPersonId: person.worldPersonId, characterId: '',
      name: person.name, record: 'Stammbäume/assets/js/data/house-draig-family.js' });
  }
  return reviewDraigOccupants(HOUSE_DRAIG_FAMILY, characters);
}
