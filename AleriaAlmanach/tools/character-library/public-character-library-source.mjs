import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { REVIEWED_CHARACTER_TRAITS } from '../../modules/character-trait-review/reviewed-character-traits.js';
import { getAutofilledCenyrCombatProfile } from '../../modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { getCharacterCreationTemplate } from '../../modules/combat/character-creation-templates.js';

const workspaceRoot = new URL('../../../', import.meta.url);

// The reviewed public characters are an explicit allowlist. A mixed local
// database must never turn private dossiers into an automatic archive source.
export async function loadPublicCharacterLibrarySources({ root = workspaceRoot,
  readJson = async url => JSON.parse(await readFile(url, 'utf8')) } = {}) {
  const snapshot = await readJson(new URL('CharakterDatenbank/generated/characters.snapshot.json', root));
  const sources = [];
  for (const assignment of REVIEWED_CHARACTER_TRAITS) {
    const person = snapshot.characters.find(character => [assignment.id, assignment.onlineId].includes(character.id));
    assert(person?.localRecord?.path, `Öffentliche Archivquelle fehlt: ${assignment.name}`);
    const path = String(person.localRecord.path).replaceAll('\\', '/');
    assert(path.startsWith('records/') && !path.split('/').includes('..'), 'Archivquelle außerhalb des Datensatzverzeichnisses');
    const record = await readJson(new URL(`CharakterDatenbank/${path}`, root));
    const character = record.character;
    assert([assignment.id, assignment.onlineId].includes(character?.id) && character.name === assignment.name,
      `Öffentliche Archividentität stimmt nicht: ${assignment.name}`);
    const combatProfile = getAutofilledCenyrCombatProfile(character.combatProfile || {});
    const classId = String(combatProfile.templateSelections?.classId || combatProfile.identity?.archetype || 'weitere').trim().toLowerCase();
    const template = getCharacterCreationTemplate('class', classId);
    sources.push({ character: { ...character, combatProfile }, classId,
      className: template?.label || combatProfile.identity?.archetype || 'Weitere Ausbildung',
      sourceRecord: `CharakterDatenbank/${path}` });
  }
  return sources;
}
