import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombatStyleRegistry as browserRegistry } from '../../../AleriaAlmanach/modules/combat-styles/combat-style-registry.js';
import { getCombatStyleRegistry as serverRegistry } from '../src/generated/combat-styles/combat-style-registry.js';
import { getCenyrClassDefinition as browserClass } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassDefinition as serverClass } from '../src/generated/classes/cenyr/cenyr-class-registry.js';
import { resolveCombatProfile as browserProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveCombatProfile as serverProfile } from '../src/generated/combat/combat-profile-resolver.js';

test('deployed mechanics retain the exact browser form catalog and all seven class access rules', () => {
  assert.deepEqual(serverRegistry(), browserRegistry());
  for (const classId of ['teulu', 'cantref', 'uchelwyr', 'helwyr', 'barddwyr', 'arthwyr', 'derwyn']) {
    assert.deepEqual(serverClass(classId), browserClass(classId), classId);
  }
});

test('both Derwyn foundations materialize the same legal scene actions on browser and server', () => {
  for (const foundation of ['drachentanz-form-i-jungdrache', 'sirenentanz-junge-welle']) {
    const character = { id: 'deployment-derwyn', name: 'Derwyn', combatProfile: {
      templateSelections: { classId: 'derwyn' }, identity: { ancestry: 'Cenyr', archetype: 'Derwyn' },
      progression: { level: 6 },
      classTraining: { curriculumId: 'vennyr-derwyn', selections: [{ kind: 'foundation', selectionId: foundation, selectedAtLevel: 1 }], techniqueSelections: [] },
      weapons: [
        { id: 'test-sword', name: 'Schwert', weaponType: 'sword', weaponProfileId: 'sword', damageFormula: '1d8', equipped: true },
        { id: 'test-staff', name: 'Kampfstab', weaponType: 'staff', weaponProfileId: 'staff', damageFormula: '1d8', equipped: false },
        { id: 'test-trident', name: 'Dreizack', weaponType: 'spear', weaponProfileId: 'trident', damageFormula: '1d8', equipped: false }
      ]
    } };
    const client = browserProfile(character);
    const server = serverProfile(character);
    assert.deepEqual(server.actions, client.actions, foundation);
    const actions = server.actions.filter(action => action.kind === 'technique');
    assert.equal(actions.length, 3, foundation);
    assert(server.techniques.every(technique => technique.combatStyleFormId === foundation), foundation);
  }
});
