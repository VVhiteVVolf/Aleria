import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCombatStyleRegistry as browserRegistry } from '../../../AleriaAlmanach/modules/combat-styles/combat-style-registry.js';
import { getCombatStyleRegistry as serverRegistry } from '../src/generated/combat-styles/combat-style-registry.js';
import { getCenyrClassDefinition as browserClass } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassDefinition as serverClass } from '../src/generated/classes/cenyr/cenyr-class-registry.js';
import { resolveCombatProfile as browserProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveCombatProfile as serverProfile } from '../src/generated/combat/combat-profile-resolver.js';

test('Duncans Meistertechniken und besondere Angriffe bleiben über 60 Einträge hinaus serverseitig verfügbar', async () => {
  const character=JSON.parse(await readFile(new URL('../../../Charakter%20Archiv%20Exporte/duncan-gafyr.json',import.meta.url),'utf8')).character;
  const client=browserProfile(character),server=serverProfile(character);
  assert.equal(server.techniques.length,80); // Archive fixture includes an additional selected path.
  assert.deepEqual(server.actions,client.actions);
  for(const id of ['combat-style-drachentanz-vollendeter-waffenmeister','class-special-teulu-mastery']) {
    assert.ok(server.actions.some(action=>action.sourceId===id),id);
  }
});

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
    assert.equal(actions.length, 6, foundation);
    assert(server.techniques.every(technique => technique.combatStyleFormId === foundation), foundation);
  }
});
