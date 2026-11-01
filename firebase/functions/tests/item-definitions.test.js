import test from 'node:test';
import assert from 'node:assert/strict';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { readItemDefinition } from '../src/items/item-definition-repository.js';
import { database } from './fixtures/combat-transaction-database.js';
const auth = { uid: 'owner', token: { aleriaRole: 'moderator' } };
const record = () => ({ name: 'Owner', ownerUid: auth.uid, inventory: { revision: 1, items: [], moneyState: { totalCopper: 12 } },
  combatProfile: { hitPoints: { current: 4, maximumOverride: 20 }, resources: [{ id: 'mana', current: 2, maximum: 12 }] } });
const save = (kind = 'shared') => ({ action: 'save', operationId: `save-${kind}`, definition: { id: `${kind === 'unique' ? 'unique' : 'item'}:blade`,
  title: 'Blade', kind, category: 'waffen', combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageBonus: kind === 'unique' ? 1 : 0 } } });

test('definition writes retain immutable versions, compare revisions and replay exactly once', async () => {
  const db = database({});
  const first = await commitItemDefinitionOperation(db, auth, save());
  const replay = await commitItemDefinitionOperation(db, auth, save());
  assert.deepEqual(first, replay);
  const next = save(); next.operationId = 'save-next'; next.expectedRevision = first.definition.revision;
  next.definition.combatDefinition.damageFormula = '1d10';
  const second = await commitItemDefinitionOperation(db, auth, next);
  assert.notEqual(second.definition.revision, first.definition.revision);
  const old = await db.runTransaction(tx => readItemDefinition(db, tx, first.definition));
  assert.equal(old.combatDefinition.damageFormula, '1d8');
  await assert.rejects(commitItemDefinitionOperation(db, auth, { ...next, operationId: 'stale' }), /inzwischen bearbeitet/);
});

test('grants store references, project combat rules, preserve resources and enforce one unique instance', async () => {
  const db = database({ 'characters/owner': record(), 'characters/other': record() });
  const created = await commitItemDefinitionOperation(db, auth, save('unique'));
  const grant = { action: 'grant', operationId: 'grant', recordId: 'owner', definitionRef: created.definition, expectedRevision: 1, quantity: 1 };
  await commitItemDefinitionOperation(db, auth, grant);
  const owner = db.data.get('characters/owner');
  assert.equal(owner.inventory.items[0].combatDefinition, undefined);
  assert.equal(owner.combatProfile.weapons[0].damageBonus, 1);
  assert.equal(owner.combatProfile.hitPoints.current, 4);
  assert.equal(owner.combatProfile.resources[0].current, 2);
  assert.equal(owner.inventory.moneyState.totalCopper, 12);
  await assert.rejects(commitItemDefinitionOperation(db, auth, { ...grant, operationId: 'second-grant', recordId: 'other' }), /existiert bereits/);
  assert.equal(db.data.get('characters/other').inventory.items.length, 0);
});
