import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getAutofilledCenyrCombatProfile } from '../modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { getCenyrTechniqueChoiceGroups } from '../modules/classes/cenyr/cenyr-technique-selection.js';

test('eine geänderte Attackenwahl im bestehenden Profil ersetzt sofort die zwischengespeicherte Ausbildung', async () => {
  const { character } = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/duncan-gafyr.json', import.meta.url), 'utf8'));
  const profile = character.combatProfile;
  const first = getAutofilledCenyrCombatProfile(profile);
  const previous = profile.classTraining.techniqueSelections.at(-1);
  const remaining = profile.classTraining.techniqueSelections.filter(selection => selection.slotId !== previous.slotId);
  const group = getCenyrTechniqueChoiceGroups({ ...profile, classTraining: { ...profile.classTraining, techniqueSelections: remaining } }, 20, { allEarned: true })
    .find(entry => entry.slotId === previous.slotId);
  const alternative = group.options.find(technique => technique.id !== previous.techniqueId);
  assert.ok(alternative, 'Duncans verdienter Slot bietet eine andere passende Attacke');

  // Only the selection changes; the profile object and old materialized attacks remain.
  profile.classTraining.techniqueSelections = [...remaining, {
    slotId: previous.slotId, techniqueId: alternative.id, selectedAtLevel: previous.selectedAtLevel
  }];
  const refreshed = getAutofilledCenyrCombatProfile(profile);
  assert.ok(first.techniques.some(technique => technique.id === previous.techniqueId));
  assert.ok(refreshed.techniques.some(technique => technique.id === alternative.id));
  assert.ok(!refreshed.techniques.some(technique => technique.id === previous.techniqueId));
  assert.equal(refreshed.techniques.length, first.techniques.length);
  assert.deepEqual(refreshed.classTraining.techniqueSelections, profile.classTraining.techniqueSelections);
});
