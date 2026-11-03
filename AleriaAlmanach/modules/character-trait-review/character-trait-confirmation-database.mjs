import assert from 'node:assert/strict';
import { planCharacterTraitPublication } from './character-trait-publication-plan.mjs';
import { reviewedCharacterTraits } from './character-trait-review-model.js';
import { confirmCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';

// Apply the reviewed rules to each local draft independently; never import remote
// resource values or replace a local arsenal with an online snapshot.
export function projectConfirmedCharacterTraits({ record, snapshotCharacter, path, assignment, remote, now, sourcePath }) {
  assert.equal(remote.id, assignment.onlineId);
  assert.equal(record.character.id, assignment.id);
  const project = character => {
    assert.deepEqual(character.combatProfile.quirks, reviewedCharacterTraits(assignment), 'Lokale Auswahl wurde seit der Prüfung verändert.');
    const plan = planCharacterTraitPublication({ character, assignment, baseline: character, now });
    const next = plan.character;
    next.combatProfile.revision = Math.max(character.combatProfile.revision || 0, remote.combatProfile.revision);
    next.updatedAt = [character.updatedAt, now].filter(Boolean).sort().at(-1);
    assert.deepEqual(next.inventory, character.inventory);
    for (const key of ['hitPoints', 'resources', 'weapons', 'armorItems', 'attributes', 'progression']) {
      assert.deepEqual(next.combatProfile[key], character.combatProfile[key], `${assignment.name}: ${key}`);
    }
    return next;
  };
  const character = project(record.character), person = project(snapshotCharacter);
  return confirmCharacterRecordProjection({ record, snapshotCharacter, path, character, person, now, sourcePath,
    exportedCharacter: { id: character.id, name: character.name, combatProfile: character.combatProfile,
      ...(character.biography ? { biography: character.biography } : {}), updatedAt: character.updatedAt } });
}
