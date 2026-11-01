import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitQuestOperation } from '../src/quests/commit-quest.js';
import { restoreQuestBackup } from '../src/quests/quest-backup.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { commitItemAwardOperation } from '../src/items/commit-item-award.js';
const auth = { uid: 'tester', token: { aleriaRole: 'moderator' } }, player = { uid: 'tester', token: { aleriaRole: 'player' } };
const stamp = (time = '08:00') => ({ date: { year: 1740, month: 3, day: 9 }, time });
const record = id => ({ id, name: id, ownerUid: 'tester', inventory: { revision: 1, items: [], moneyState: { totalCopper: 0 } }, combatProfile: { revision: 1, hitPoints: { current: 4, maximumOverride: 20 } } });
const setup = async () => {
  const db = database({ 'characters/one': record('one'), 'characters/two': record('two') });
  const request = { action: 'start', id: 'run', operationId: 'start', quest: { id: 'fetch', title: 'Lieferung', links: { scenes: ['scene'], maps: ['map'] }, objectives: [{ id: 'deliver', title: 'Liefern' }] },
    party: [{ kind: 'character', recordId: 'one' }, { kind: 'character', recordId: 'two' }], stamp: stamp() };
  await commitQuestOperation(db, auth, request); return { db, request };
};
test('a group account receives canonical rewards atomically with personal shares, without rewriting the landing page ledger', async () => {
  const { db, request } = await setup();
  const module = { id: 'guild', title: 'Weggefährten', pages: [{ landing: { group: { treasury: { openingCopper: 17, entries: [{ id: 'old', copper: 2, direction: 'income' }] } } } }] };
  const source = { entryJson: JSON.stringify(module), updatedAtClient: 123 };
  db.data.set('module_store_entries/guild', source);
  await commitQuestOperation(db, auth, { ...request, id: 'group-run', operationId: 'group-start', groupModuleId: 'guild' });
  await commitQuestOperation(db, auth, { action: 'finish', id: 'group-run', operationId: 'group-finish', expectedRevision: 1, stamp: stamp(), rewardPlan: [
    { recordId: 'one', rewards: [{ kind: 'money', currency: 'copper', amount: 20 }] },
    { kind: 'group', recordId: 'guild', rewards: [{ kind: 'money', currency: 'copper', amount: 30 }, { kind: 'item', itemId: 'standard:gemischtwarenhandler:notizbuch', quantity: 1 }] }
  ] });
  const claim = { action: 'claim', id: 'group-run', operationId: 'group-claim', expectedRevision: 2 };
  const [first, retry] = await Promise.all([commitQuestOperation(db, auth, claim), commitQuestOperation(db, auth, claim)]);
  assert.deepEqual(first, retry);
  assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper, 20);
  const account = db.data.get('group_quest_accounts/guild');
  assert.equal(account.inventory.moneyState.totalCopper, 30); assert.equal(account.inventory.items.length, 1);
  assert.ok(account.inventory.items[0].definitionRef); assert.equal(account.receipts.length, 1);
  assert.deepEqual(db.data.get('module_store_entries/guild'), source);
  assert.equal(db.data.get('characters/one').combatProfile.hitPoints.current, 4);
  await assert.rejects(commitQuestOperation(db, auth, { ...claim, operationId: 'group-again', expectedRevision: 3 }), /bereits ausgezahlt/);
});
test('an absent group landing page rolls back every recipient and an unrelated group cannot receive the payout', async () => {
  const { db, request } = await setup();
  await commitQuestOperation(db, auth, { ...request, id: 'group-run', operationId: 'group-start', groupModuleId: 'guild' });
  const finish = { action: 'finish', id: 'group-run', operationId: 'group-finish', expectedRevision: 1, stamp: stamp(), rewardPlan: [
    { recordId: 'one', rewards: [{ kind: 'money', currency: 'copper', amount: 20 }] },
    { kind: 'group', recordId: 'other', rewards: [{ kind: 'money', currency: 'copper', amount: 30 }] }
  ] };
  await assert.rejects(commitQuestOperation(db, auth, finish), /Landingpage/);
  finish.rewardPlan[1].recordId = 'guild'; await commitQuestOperation(db, auth, finish);
  await assert.rejects(commitQuestOperation(db, auth, { action: 'claim', id: 'group-run', operationId: 'group-claim', expectedRevision: 2 }), /nicht mehr verfügbar/);
  assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper, 0);
  assert.equal(db.data.get('quest_runs/group-run').rewardStatus, 'ready');
  assert.ok(!db.data.has('group_quest_accounts/guild'));
});
test('starting is idempotent and conflicting payloads cannot reuse operation IDs', async () => {
  const { db, request } = await setup();
  assert.equal((await commitQuestOperation(db, auth, request)).run.id, 'run');
  await assert.rejects(commitQuestOperation(db, auth, { ...request, groupName: 'Changed' }), /Vorgangskennung/);
  assert.equal([...db.data.keys()].filter(key => key.startsWith('quest_runs/')).length, 1);
});
test('players cannot assign another owner, edit quest definitions or confirm a payout', async () => {
  const { db, request } = await setup(); db.data.set('characters/two', { ...record('two'), ownerUid: 'other' });
  await assert.rejects(commitQuestOperation(db, player, { ...request, id: 'other', operationId: 'other' }), /eigenen Figuren/);
  await assert.rejects(commitQuestOperation(db, player, { action: 'save', id: 'q', operationId: 'save', quest: { title: 'q' } }), /Redaktion/);
  await assert.rejects(commitQuestOperation(db, player, { action: 'finish', id: 'run', operationId: 'finish', expectedRevision: 1, stamp: stamp(), actors: ['character:one'] }), /Spielleitung/);
});
test('split parties have independent clocks, and stale or reversed updates are rejected', async () => {
  const { db } = await setup();
  await commitQuestOperation(db, auth, { action: 'log', id: 'run', operationId: 'travel', expectedRevision: 1, kind: 'travel', text: 'Am Fluss', actors: ['character:one'], stamp: stamp('12:00'), place: { name: 'Fluss', mapId: 'map' } });
  await commitQuestOperation(db, auth, { action: 'log', id: 'run', operationId: 'dialogue', expectedRevision: 2, kind: 'dialogue', text: 'Im Gasthaus', actors: ['character:two'], stamp: stamp('09:00') });
  assert.equal(db.data.get('quest_runs/run').partyClocks['character:one'].time, '12:00');
  assert.equal(db.data.get('quest_runs/run').partyClocks['character:two'].time, '09:00');
  await assert.rejects(commitQuestOperation(db, auth, { action: 'log', id: 'run', operationId: 'reverse', expectedRevision: 3, kind: 'note', text: 'Zurück', actors: ['character:one'], stamp: stamp('10:00') }), /zurücklaufen/);
  await assert.rejects(commitQuestOperation(db, auth, { action: 'log', id: 'run', operationId: 'stale', expectedRevision: 1, kind: 'note', text: 'Alt', stamp: stamp() }), /inzwischen/);
});
test('evidence must belong to a linked scene and be server committed', async () => {
  const { db } = await setup(); db.data.set('comments/fake', { entryId: 'scene', text: 'Fake' });
  const input = { action: 'log', id: 'run', operationId: 'evidence', expectedRevision: 1, kind: 'evidence', text: 'Beleg', commentId: 'fake', stamp: stamp() };
  await assert.rejects(commitQuestOperation(db, auth, input), /Beleg/);
  db.data.set('comments/fake', { entryId: 'other', serverValidatedMechanics: true }); await assert.rejects(commitQuestOperation(db, auth, input), /Beleg/);
  db.data.set('comments/fake', { entryId: 'scene', serverValidatedMechanics: true }); await commitQuestOperation(db, auth, input);
  assert.equal([...db.data.values()].find(row => row.evidence)?.evidence.commentId, 'fake');
});
test('one atomic party reward is globally single even for new operation IDs; resources and old history remain intact', async () => {
  const { db } = await setup(); const old = { entryId: 'scene', text: 'Historisch', serverValidatedMechanics: true }; db.data.set('comments/old', old);
  await commitQuestOperation(db, auth, { action: 'finish', id: 'run', operationId: 'finish', expectedRevision: 1, stamp: stamp('14:00'), text: 'Geliefert', rewardPlan: ['one','two'].map(recordId => ({ recordId, rewards: [{ kind: 'money', amount: 1, currency: 'gold' }] })) });
  const input = { action: 'claim', id: 'run', operationId: 'claim', expectedRevision: 2 };
  const [one, two] = await Promise.all([commitQuestOperation(db, auth, input), commitQuestOperation(db, auth, input)]);
  assert.deepEqual(one, two); assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper, 1000);
  assert.equal(db.data.get('characters/two').combatProfile.hitPoints.current, 4); assert.deepEqual(db.data.get('comments/old'), old);
  await assert.rejects(commitQuestOperation(db, auth, { ...input, operationId: 'claim-again', expectedRevision: 3 }), /bereits ausgezahlt/);
});
test('a missing recipient rolls the entire payout back and leaves rewards ready', async () => {
  const { db } = await setup();
  await commitQuestOperation(db, auth, { action: 'finish', id: 'run', operationId: 'finish', expectedRevision: 1, stamp: stamp(), rewardPlan: ['one','two'].map(recordId => ({ recordId, rewards: [{ kind: 'money', currency: 'copper', amount: 5 }] })) });
  db.data.delete('characters/two');
  await assert.rejects(commitQuestOperation(db, auth, { action: 'claim', id: 'run', operationId: 'claim', expectedRevision: 2 }), /empfänger fehlt/);
  assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper, 0); assert.equal(db.data.get('quest_runs/run').rewardStatus, 'ready');
});
test('quest backups fill missing documents and retain later payouts and completed runs', async () => {
  const { db } = await setup();
  const result = await restoreQuestBackup(db, 'quest_runs', [{ id: 'run', data: { status: 'active', revision: 0 } }, { id: 'other', data: { status: 'completed' } }]);
  assert.equal(result.retained, 1); assert.equal(db.data.get('quest_runs/run').revision, 1); assert.ok(db.data.has('quest_runs/other'));
});
test('a fresh shared catalog definition is prepared once for a multi-recipient payout', async () => {
  const {db}=await setup();db.data.set('item_register_offers/offer:test',{id:'offer:test',title:'Testkordel',listName:'Testsortiment',listId:'test',category:'sonstiges',stock:null,priceRange:{minCopper:1,maxCopper:1}});
  await commitQuestOperation(db,auth,{action:'finish',id:'run',operationId:'finish',expectedRevision:1,stamp:stamp(),rewardPlan:['one','two'].map(recordId=>({recordId,rewards:[{kind:'item',itemId:'offer:test',quantity:1}]}))});
  await commitQuestOperation(db,auth,{action:'claim',id:'run',operationId:'claim',expectedRevision:2});
  const one=db.data.get('characters/one').inventory.items[0],two=db.data.get('characters/two').inventory.items[0];
  assert.deepEqual(one.definitionRef,two.definitionRef);assert.notEqual(one.id,two.id);
  assert.equal([...db.data.keys()].filter(key=>key.startsWith('item_definition_versions/')).length,1);
});
test('a unique reward cannot be duplicated across recipients in the same transaction', async () => {
  const {db}=await setup();
  const saved=await commitItemDefinitionOperation(db,auth,{action:'save',operationId:'unique',definition:{id:'unique:quest',title:'Einziges Siegel',kind:'unique',category:'sonstiges'}});
  await commitQuestOperation(db,auth,{action:'finish',id:'run',operationId:'finish',expectedRevision:1,stamp:stamp(),rewardPlan:['one','two'].map(recordId=>({recordId,rewards:[{kind:'item',definitionRef:saved.template.definitionRef,quantity:1}]}))});
  await assert.rejects(commitQuestOperation(db,auth,{action:'claim',id:'run',operationId:'claim',expectedRevision:2}),/Unikat/);
  assert.equal(db.data.get('characters/one').inventory.items.length,0);assert.equal(db.data.get('characters/two').inventory.items.length,0);
  assert.equal(db.data.get('quest_runs/run').rewardStatus,'ready');
});
test('archiving freezes scene boundaries and reward corrections preserve the original completion date', async () => {
  const {db,request}=await setup();db.data.set('comments/old',{entryId:'scene',orderKey:10,serverCommitted:true});
  await commitQuestOperation(db,auth,{...request,id:'bounded',operationId:'bounded-start'});
  assert.equal(db.data.get('quest_runs/bounded').sceneWindows.scene.after,10);
  db.data.set('comments/during',{entryId:'scene',orderKey:20,serverValidatedMechanics:true});
  await commitQuestOperation(db,auth,{action:'finish',id:'bounded',operationId:'bounded-end',expectedRevision:1,stamp:stamp('14:00'),rewardPlan:[]});
  db.data.set('comments/later',{entryId:'scene',orderKey:30,serverValidatedMechanics:true});
  await commitQuestOperation(db,auth,{action:'rewards',id:'bounded',operationId:'bounded-correction',expectedRevision:2,text:'Verteilung ergänzt',rewardPlan:[{recordId:'one',rewards:[{kind:'money',currency:'copper',amount:5}]}]});
  const run=db.data.get('quest_runs/bounded');assert.equal(run.sceneWindows.scene.through,20);assert.equal(run.ended.time,'14:00');assert.equal(run.rewardPlan[0].rewards[0].amount,5);
  await commitQuestOperation(db,auth,{action:'claim',id:'bounded',operationId:'bounded-pay',expectedRevision:3});
  await assert.rejects(commitQuestOperation(db,auth,{action:'rewards',id:'bounded',operationId:'bounded-late-correction',expectedRevision:4,rewardPlan:[]}),/ausstehende Belohnungen/);
});
test('the same notice cannot pay once from the board and once from the adventure journal, in either order', async () => {
  for(const questFirst of [true,false]){
    const {db,request}=await setup(),sourceKey='notice:board:front';
    await commitQuestOperation(db,auth,{...request,id:'notice-run',operationId:'notice-start',quest:{...request.quest,id:sourceKey}});
    await commitQuestOperation(db,auth,{action:'finish',id:'notice-run',operationId:'notice-end',expectedRevision:1,stamp:stamp(),rewardPlan:[{recordId:'one',rewards:[{kind:'money',currency:'copper',amount:5}]}]});
    const quest=()=>commitQuestOperation(db,auth,{action:'claim',id:'notice-run',operationId:'notice-quest-pay',expectedRevision:2});
    const board=()=>commitItemAwardOperation(db,auth,{sourceKey,operationId:'notice-board-pay',recordId:'one',expectedRevision:db.data.get('characters/one').inventory.revision,rewards:[{kind:'money',currency:'copper',amount:5}]});
    if(questFirst){await quest();await assert.rejects(board(),/bereits vergeben/);}else{await board();await assert.rejects(quest(),/bereits.*vergeben/);}
    assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper,5);
  }
});
