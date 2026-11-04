import test from 'node:test';
import assert from 'node:assert/strict';
import { planOwetaQuartetPublication, buildOwetaQuartetPlacement, assertOwetaQuartetOwnership,
  OWETA_QUARTET_NODE_ID } from '../modules/oweta-quartett/oweta-quartett-publication.mjs';
import { OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS } from '../modules/oweta-quartett/oweta-quartett-data.mjs';
import { itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';
import { materializeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';
import { commitGroupInventoryOperation } from '../../firebase/functions/src/groups/commit-group-inventory.js';

const config = () => ({ tabs: ['Figuren'], unrelated: { retained: true }, moduleNodeAssignments: { existing: 'elsewhere' },
  moduleStoreManifest: { updatedAtClient: 10, hiddenModuleIds: { secret: true }, entryOverrideIds: ['gawain-duncan'],
    moduleNodeAssignments: { existing: 'elsewhere' }, moduleSectionNodes: [{ id: 'unchanged' }],
    customSections: [{ nodeId: OWETA_QUARTET_NODE_ID, key: 'Haus Draig', tab: 'Gruppen',
      path: ['Cenyr', 'Celtigerns Wacht', 'Haus Draig'], entryIds: ['gawain-duncan'] }, { nodeId: 'elsewhere', entryIds: ['existing'] }] } });
const initial = () => planOwetaQuartetPublication({ config: config(), image: 'https://example.com/camp.png', now: '2026-11-03T12:00:00.000Z' });

test('starter stock becomes one versioned common account without personal property or duplicate manual stock', () => {
  const before = config(), copy = structuredClone(before), plan = planOwetaQuartetPublication({ config: before,
    image: 'https://example.com/camp.png', now: '2026-11-03T12:00:00.000Z' });
  assert.deepEqual(before, copy);
  assert.equal(plan.account.inventory.items.length, 16);
  assert.equal(plan.account.inventory.items.find(item => item.id.endsWith('-rationen')).quantity, '12');
  assert.equal(plan.account.inventory.moneyState.totalCopper, 0);
  assert.equal(plan.account.revision, 1);
  assert.equal(plan.account.inventory.revision, 1);
  assert(plan.account.inventory.items.every(item => item.definitionRef && !item.creatureId && !item.equipped));
  assert.deepEqual(plan.entry.pages.find(page => page.landingPage).landing.group.inventory, []);
  const manifest = structuredClone(plan.configPatch.moduleStoreManifest);
  manifest.customSections[0].entryIds.pop(); manifest.entryOverrideIds.pop();
  delete manifest.moduleNodeAssignments['oweta-quartett']; manifest.updatedAtClient = copy.moduleStoreManifest.updatedAtClient;
  assert.deepEqual(manifest, copy.moduleStoreManifest);
  assert.deepEqual(plan.configPatch.moduleNodeAssignments, { ...copy.moduleNodeAssignments, 'oweta-quartett': OWETA_QUARTET_NODE_ID });
});

test('a saved grant never recreates consumed supplies or overwrites a subsequently edited folio', () => {
  const first = initial(), account = structuredClone(first.account), module = structuredClone(first.entry);
  account.inventory.items = []; account.revision = 90; account.inventory.revision = 90;
  account.inventory.moneyState = { totalCopper: 18 }; module.title = 'Unser späterer Gruppenname';
  const next = planOwetaQuartetPublication({ config: config(), module, account, claim: first.claim });
  assert.equal(next.alreadyPublished, true);
  assert.equal(next.configPatch, null); assert.deepEqual(next.definitions, []);
  assert.deepEqual(next.account, account); assert.deepEqual(next.entry, module);
});

test('unclaimed ID collisions and inconsistent grants abort before preparing any replacement', () => {
  const first = initial();
  for (const collision of [{ module: first.entry }, { account: first.account },
    { module: first.entry, account: first.account, claim: { ...first.claim, sourceKey: 'another-source' } },
    { account: first.account, claim: first.claim }]) {
    assert.throws(() => planOwetaQuartetPublication({ config: config(), now: '2026-11-03T12:00:00Z', ...collision }));
  }
  const hidden = config(); hidden.moduleStoreManifest.hiddenModuleIds['oweta-quartett'] = true;
  assert.throws(() => buildOwetaQuartetPlacement(hidden, 20), /ausgeblendet/);
});

function ownership() {
  const characters = OWETA_QUARTET_MEMBERS.map(member => ({ id: member.id, name: member.name, inventory: { items: [] } }));
  const creatures = OWETA_QUARTET_COMPANIONS.map((animal, index) => {
    const item = { id: `animal-${index}`, instanceId: `instance-${index}`, creatureId: animal.id, ownerCharacterId: animal.ownerId, quantity: '1' };
    characters.find(character => character.id === animal.ownerId).inventory.items.push(item);
    return { id: animal.id, itemOrigin: { ownerCharacterId: animal.ownerId, inventoryItemId: item.id, instanceId: item.instanceId, disposition: 'owned' } };
  });
  return { characters, creatures };
}

test('animal links require exactly one surviving possession and its actual owner/instance origin', () => {
  const valid = ownership(); assert.doesNotThrow(() => assertOwetaQuartetOwnership(valid.characters, valid.creatures));
  for (const edit of [
    state => { state.creatures[0].itemOrigin.ownerCharacterId = 'someone-else'; },
    state => { state.creatures[0].itemOrigin.instanceId = 'a-different-instance'; },
    state => { state.characters[0].inventory.items[0].ownerCharacterId = 'another-owner'; },
    state => { state.characters[0].inventory.items[0].quantity = '0'; },
    state => { state.characters[0].inventory.items.push({ ...state.characters[0].inventory.items[0], id: 'duplicate' }); }
  ]) {
    const state = ownership(); edit(state);
    assert.throws(() => assertOwetaQuartetOwnership(state.characters, state.creatures));
  }
});

test('the seeded authoritative supplies can be withdrawn through the existing server operation without changing live combat values', async () => {
  const plan = initial(), member = OWETA_QUARTET_MEMBERS[0];
  const ration = plan.account.inventory.items.find(item => item.id.endsWith('-rationen'));
  const rationArt = '/AleriaAlmanach/assets/pendrwn-general-store/goods/rationen.png';
  const definitions = new Map(plan.definitions.map(definition => [itemDefinitionKey(definition), definition]));
  assert.equal(ration.image, rationArt);
  assert.equal(materializeInventoryItem(ration, definitions).image, rationArt);
  const character = { id: member.id, name: member.name, inventory: { revision: 1, items: [] },
    combatProfile: { revision: 1, hitPoints: { current: 9, maximum: 32 }, resources: [{ id: 'mana', current: 2, maximum: 8 }] } };
  const db = database({ 'module_store_entries/oweta-quartett': { entryJson: JSON.stringify(plan.entry) },
    'group_quest_accounts/oweta-quartett': plan.account, [`characters/${member.id}`]: character,
    ...Object.fromEntries(plan.definitions.map(definition => [`item_definition_versions/${itemDefinitionKey(definition)}`, definition])) });
  const combat = structuredClone(character.combatProfile);
  await commitGroupInventoryOperation(db, { uid: 'gm', token: { aleriaRole: 'moderator' } }, {
    operationId: 'oweta-starter-withdrawal-test', groupId: 'oweta-quartett', action: 'withdraw', expectedGroupRevision: 1,
    member: { kind: 'character', recordId: member.id }, expectedMemberRevision: 1,
    object: { kind: 'item', itemId: 'oweta-quartett-start-rationen', quantity: 2 }
  });
  const afterGroup = db.data.get('group_quest_accounts/oweta-quartett'), afterMember = db.data.get(`characters/${member.id}`);
  const remaining = afterGroup.inventory.items.find(item => item.id.endsWith('-rationen'));
  assert.equal(remaining.quantity, '10');
  assert.equal(afterMember.inventory.items[0].quantity, '2');
  assert.equal(remaining.image, rationArt);
  assert.equal(afterMember.inventory.items[0].image, rationArt);
  assert.deepEqual(afterMember.inventory.items[0].definitionRef, ration.definitionRef);
  assert.deepEqual(remaining.definitionRef, ration.definitionRef);
  assert.deepEqual(afterMember.combatProfile, combat);
  assert.equal(afterGroup.revision, 2);
});
