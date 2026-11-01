// Disposable end-to-end adventure with original test figures. Never uses live Firebase.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitQuestOperation } from '../../src/quests/commit-quest.js';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { commitItemRegisterOperation } from '../../src/mechanics/commit-item-register.js';
import { placeSceneItem } from '../../src/mechanics/commit-scene-item.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitLootClaim } from '../../src/mechanics/commit-loot-claim.js';
import { commitSceneRest } from '../../src/mechanics/commit-scene-rest.js';
import { commitInventoryTransferOperation } from '../../src/mechanics/commit-inventory-transfer.js';
import { commitNarrativeCommentOperation } from '../../src/comments/commit-narrative-comment.js';
import { sanitizeCharacterCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { projectQuestJournal } from '../../../../AleriaAlmanach/modules/quests/quest-journal.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../src/generated/item-register/item-register-standard.js';
import { prepareTestAction } from './combat-test-actions.mjs';
import { itemSegment } from './combat-test-inventory-actions.mjs';
import { readFirebaseModuleEntry } from '../../../../AleriaAlmanach/modules/module-store/module-entry-serialization.js';

const projectId = 'demo-aleria-quests';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only the disposable quest emulator at 127.0.0.1:8187 is allowed.');
initializeApp({ projectId }); const db = getFirestore();
const auth = { uid: 'local-quest-tester', token: { aleriaRole: 'moderator' } };
const scene = 'test-mill-delivery::session:journey', tavern = 'test-mill-delivery::session:tavern', runId = 'test-mill-delivery-run';
const stamp = (time, day = 9) => ({ date: { year: 1740, month: 3, day }, time });
const get = async (kind, id) => ({ ...(await db.doc(`${kind}/${id}`).get()).data(), id });
const history = async (entryId = scene) => sortSceneHistory((await db.collection('comments').where('entryId', '==', entryId).get()).docs.map(row => ({ ...row.data(), id: row.id })));
const hero = (id, name, hp = 8) => ({ id, name, ownerUid: auth.uid, ancestry: 'Mensch', inventory: { revision: 1, items: [], moneyState: { totalCopper: 0 } },
  combatProfile: sanitizeCharacterCombatProfile({ attributes: [{ key: 'strength', score: 14 }], hitPoints: { current: hp, maximumOverride: 12 } }) });
const summary = { scope: { projectId, host: '127.0.0.1:8187', liveWrites: false, originalTestFiguresOnly: true }, checkpoints: [] };
const checkpoint = (name, evidence) => summary.checkpoints.push({ name, ...evidence });
async function log(kind, text, time, actors, extra = {}) {
  const run = await get('quest_runs', runId);
  return commitQuestOperation(db, auth, { action: 'log', id: runId, operationId: `log-${summary.checkpoints.length}-${run.revision}`, expectedRevision: run.revision, kind, text, actors, stamp: stamp(time), ...extra });
}
after(async () => { await db.terminate(); });
test('Die verlorene Mühlenkiste: split party, time jumps, real short fight, loot, item use, rest, delivery and once-only party rewards', async () => {
  const reset = await fetch(`http://127.0.0.1:8187/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' }); assert.ok(reset.ok);
  const module = { id: 'test-mill-delivery', title: 'Mühlenpfad · Testmodul', pages: [
    { pageTitle: 'Unterwegs zur Mühle', sessionPage: true, commentThreadKey: 'journey' },
    { pageTitle: 'Im Weggasthaus', sessionPage: true, commentThreadKey: 'tavern' },
    { pageTitle: 'Testgemeinschaft', landing: { group: { treasury: { openingCopper: 7, entries: [] } } } }
  ] };
  await db.doc(`module_store_entries/${module.id}`).set({ entryId: module.id, moduleKind: 'custom', entryJson: JSON.stringify(module) });
  await db.doc('char_tabs/config').set({ moduleStoreManifest: { format: 'split-v1', customSections: [{ key: 'Testabenteuer', tab: 'Orte', entryIds: [module.id] }], entryOverrideIds: [] } });
  assert.equal(readFirebaseModuleEntry((await db.doc(`module_store_entries/${module.id}`).get()).data()).pages[1].commentThreadKey, 'tavern');
  const figures = [hero('test-mara', 'Mara Weglein · Prüffigur'), hero('test-jorin', 'Jorin Feder · Prüffigur'), hero('test-miller', 'Müllerin Elske · Prüfauftraggeberin')];
  for (const figure of figures) await db.doc(`characters/${figure.id}`).set(figure);
  const porter = { ...hero('test-hanno', 'Hanno · Testbegleiter'), entityType: 'creature', race: 'Mensch' };
  const thief = { ...hero('test-thief', 'Stolpernder Kistendieb · Testgegner', 1), entityType: 'creature', race: 'Mensch', loot: { items: [{ id: 'loot-cord', name: 'Bindfaden', quantity: 1, notes: 'Beute des Testgegners' }] } };
  await db.doc('creatures/test-hanno').set(porter); await db.doc('creatures/test-thief').set(thief);
  const parcel = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: 'define-parcel', definition: { id: 'test:mill-crate', title: 'Versiegelte Mühlenkiste', category: 'sonstiges', mechanicsStatus: 'provisional' } });
  const focus = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: 'define-flask', definition: { id: 'test:trail-flask', title: 'Wanderflasche', category: 'alchemie',
    useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest', effects: [{ type: 'healing', amount: 2 }] } } });
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-flask', recordId: 'test-mara', expectedRevision: 1, definitionRef: focus.template.definitionRef });
  const party = [{ kind: 'character', recordId: 'test-mara' }, { kind: 'character', recordId: 'test-jorin' }, { kind: 'creature', recordId: 'test-hanno' }];
  const quest = { id: 'test:mill-delivery', title: 'Die verlorene Mühlenkiste', summary: 'Eine versiegelte Kiste aus dem alten Lager zur Mühle bringen.', patron: 'Müllerin Elske · Prüffigur',
    links: { modules: ['test-mill-delivery'], scenes: [scene, tavern], maps: ['cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis'], boards: ['cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel'] },
    objectives: [{ id: 'recover', title: 'Kiste bergen' }, { id: 'deliver', title: 'Kiste an Elske übergeben' }] };
  await commitQuestOperation(db, auth, { action: 'save', id: quest.id, operationId: 'quest-save', expectedRevision: 0, quest });
  const started = await commitQuestOperation(db, auth, { action: 'start', id: runId, operationId: 'start', questId: quest.id, party, groupName: 'Die Mühlenboten · Testgruppe', stamp: stamp('08:00') });
  assert.equal(started.run.party.length, 3); checkpoint('Aufbruch', { at: '08:00', party: started.run.party.map(row => row.name) });
  const clock = await commitNarrativeCommentOperation({ auth, data: { entryId: scene, narrator: true, text: 'Nach einem Zeitsprung von zwei Stunden erreichen Mara und Hanno das alte Lager.', metadata: {
    sceneTimeEvent: { kind: 'scene-time-event', preset: 'time-skip', anchorDay: 1, anchorSeconds: 10 * 3600, calendarDate: stamp('10:00').date } } } }, { database: db });
  await log('travel', 'Zwei Stunden Reise zum alten Lager.', '10:00', ['character:test-mara','creature:test-hanno'], { place: { name: 'Altes Lager · Testort', mapId: quest.links.maps[0] } });
  const talk = await commitNarrativeCommentOperation({ auth, data: { entryId: tavern, charName: 'Jorin Feder', text: 'Jorin fragt im Weggasthaus nach dem Weg zur Mühle.', metadata: { characterId: 'test-jorin' } } }, { database: db });
  await log('dialogue', 'Jorin erkundigt sich währenddessen im Weggasthaus nach dem Mühlenpfad.', '08:30', ['character:test-jorin']);
  assert.equal((await get('quest_runs', runId)).partyClocks['character:test-mara'].time, '10:00'); checkpoint('Getrennte Wege und Szenen', { clockCommentId: clock.id, dialogueCommentId: talk.id, independentClocks: true });
  const encounterId = 'test-tiny-fight';
  const participants = [{ actorId: 'test-mara', name: figures[0].name, partyId: 'couriers', persistence: { kind: 'character', recordId: 'test-mara' } },
    { actorId: 'test-thief', name: thief.name, partyId: 'thieves', persistence: { kind: 'creature', recordId: 'test-thief' } }];
  await commitCombatEncounter.run({ auth, data: { entryId: scene, text: 'Ein schwacher Kistendieb stellt sich in den Weg.', metadata: { combatEncounter: { encounterId, operation: 'start', title: 'Der stolpernde Kistendieb', participants } } } });
  const attack = await prepareTestAction({ entryId: scene, actorRecord: await get('characters', 'test-mara'), targetRecords: [await get('creatures','test-thief')], comments: await history(), natural: 15, text: 'Mara überwältigt den Kistendieb mit einem kurzen Fausthieb.' });
  const hit = await commitCombatCommentOperation({ auth, data: attack.payload }, { database: db });
  assert.equal(hit.mechanics.commentSegments[0].combatResolution.defeat.occurred, true);
  await commitCombatEncounter.run({ auth, data: { entryId: scene, text: 'Der Testgegner ist überwältigt.', metadata: { combatEncounter: { encounterId, operation: 'end', outcome: 'victory', winningPartyId: 'couriers', awardExperience: false } } } });
  const immutableHit = await get('comments', hit.id);
  const loot = await commitLootClaim.run({ auth, data: { entryId: scene, encounterId, actorId: 'test-thief', receiverId: 'test-mara', items: [{ id: 'loot-cord', quantity: 1 }] } });
  assert.ok((await get('characters','test-mara')).inventory.items.some(row => row.name === 'Bindfaden' && row.definitionRef));
  await log('evidence', 'Kistendieb besiegt, Bindfaden als Beute geborgen.', '10:05', ['character:test-mara'], { commentId: hit.id }); checkpoint('Echter kurzer Kampf und Beute', { attackCommentId: hit.id, lootCommentId: loot.id, attacks: 1 });
  const placed = await placeSceneItem({ database: db, auth, input: { entryId: scene, operationId: 'place-crate', commentSegments: [{ kind: 'sceneitem', sceneItemDraft: { definitionChoice: 'existing', definitionRef: parcel.template.definitionRef, template: parcel.template.id, name: 'Versiegelte Mühlenkiste', description: 'Ungeöffnet zur Mühle bringen.' } }] } });
  await commitCombatCommentOperation({ auth, data: { entryId: scene, text: 'Mara hebt die Kiste auf.', metadata: { characterId: 'test-mara', operationId: 'pickup-crate', commentSegments: [itemSegment('test-mara', placed.sceneItemEvent)] } } }, { database: db });
  await log('objective', 'Die versiegelte Mühlenkiste ist geborgen.', '10:10', ['character:test-mara','creature:test-hanno'], { objectiveId: 'recover' });
  const flask = (await get('characters','test-mara')).inventory.items.find(row => row.definitionRef?.id === 'test:trail-flask');
  await commitCombatCommentOperation({ auth, data: { entryId: scene, text: 'Mara trinkt aus der Wanderflasche.', metadata: { characterId: 'test-mara', operationId: 'flask-use', commentSegments: [{ kind: 'interact', characterId: 'test-mara', inventoryUse: {
    actorId: 'test-mara', actorPersistence: { kind: 'character', recordId: 'test-mara' }, item: { id: flask.id }, mode: 'use' } }] } } }, { database: db });
  const used = await get('characters','test-mara'); assert.equal(used.inventory.items.find(row => row.id === flask.id).itemState.chargesCurrent, 1);
  const rested = await commitSceneRest.run({ auth, data: { entryId: scene, text: 'Mara und Hanno rasten eine Stunde am Lager.', metadata: { sceneRest: { type: 'short', durationSeconds: 3600, participants: [
    { actorId: 'test-mara', name: figures[0].name, persistence: { kind: 'character', recordId: 'test-mara' } }, { actorId: 'test-hanno', name: porter.name, persistence: { kind: 'creature', recordId: 'test-hanno' } }
  ] }, sceneTimeEvent: { anchorDay: 1, anchorSeconds: 11 * 3600 + 10 * 60 } } } });
  assert.equal((await get('characters','test-mara')).inventory.items.find(row => row.id === flask.id).itemState.chargesCurrent, 2);
  assert.ok((await get('characters','test-mara')).combatProfile.hitPoints.current >= used.combatProfile.hitPoints.current);
  assert.ok((await get('characters','test-mara')).combatProfile.hitPoints.current <= 12);
  await log('evidence', 'Eine Stunde Rast; die Wanderflasche erholt ihre Ladung. Hanno rastet mit.', '11:10', ['character:test-mara','creature:test-hanno'], { commentId: rested.id }); checkpoint('Itemwirkung und echte Rast', { restCommentId: rested.id, flaskChargesBefore: 1, flaskChargesAfter: 2, healingApplied: true });
  await log('travel', 'Am Mühlenpfad trifft die Gruppe wieder zusammen. Der Rückweg wird als Zeitsprung erzählt.', '12:00', party.map(row => `${row.kind}:${row.recordId}`), { place: { name: 'Mühlenpfad · Testort', mapId: quest.links.maps[0] } });
  const crate = (await get('characters','test-mara')).inventory.items.find(row => row.definitionRef?.id === parcel.template.definitionRef.id);
  const transfer = (giverId, receiverId, itemId, transferId) => commitInventoryTransferOperation(db, auth, { entryId: scene, giverId, receiverId, operationId: transferId,
    sceneEvent: { transfer: { transferId, object: { kind: 'item', itemId, quantity: 1 } } } });
  await transfer('test-mara','test-jorin',crate.id,'hand-to-jorin');
  const carried = (await get('characters','test-jorin')).inventory.items.find(row => row.definitionRef?.id === parcel.template.definitionRef.id);
  assert.deepEqual(carried.definitionRef, parcel.template.definitionRef);
  await transfer('test-jorin','test-miller',carried.id,'deliver-crate');
  assert.ok((await get('characters','test-miller')).inventory.items.some(row => row.definitionRef?.id === parcel.template.definitionRef.id));
  assert.ok(!(await get('characters','test-mara')).inventory.items.some(row => row.definitionRef?.id === parcel.template.definitionRef.id));
  await log('objective', 'Jorin übergibt Elske die ungeöffnete Kiste. Der Auftrag ist erfüllt.', '12:30', party.map(row => `${row.kind}:${row.recordId}`), { objectiveId: 'deliver', place: { name: 'Mühle · Testort', mapId: quest.links.maps[0] } }); checkpoint('Itemerkennung und zwei echte Übergaben', { definitionRef: carried.definitionRef, finalOwner: 'test-miller' });
  const dagger = STANDARD_ITEMS.find(row => row.id === 'standard:waffen-rustungen:rattenpruegel'); assert.ok(dagger);
  const run = await get('quest_runs',runId);
  const rewardPlan = ['test-mara','test-jorin'].map(recordId => ({ recordId, rewards: [{ kind: 'money', currency: 'copper', amount: 12 }, { kind: 'item', itemId: dagger.id, definitionRef: dagger.definitionRef, title: dagger.title, quantity: 1 }] }));
  await commitQuestOperation(db, auth, { action: 'finish', id: runId, operationId: 'complete', expectedRevision: run.revision, stamp: stamp('12:35'), text: 'Die Mühlenkiste ist angekommen. Elske bestätigt den Auftrag.', rewardPlan });
  const beforeAward = await get('characters','test-mara');
  const claim = { action: 'claim', id: runId, operationId: 'award', expectedRevision: run.revision + 1 };
  const [rewardOne,rewardRetry] = await Promise.all([commitQuestOperation(db,auth,claim),commitQuestOperation(db,auth,claim)]); assert.deepEqual(rewardOne,rewardRetry);
  const afterAward = await get('characters','test-mara'), jorin = await get('characters','test-jorin');
  assert.equal(afterAward.inventory.moneyState.totalCopper, 12); assert.equal(jorin.inventory.moneyState.totalCopper, 12);
  const daggers = [afterAward,jorin].map(row => row.inventory.items.find(item => item.definitionRef?.id === dagger.definitionRef.id));
  assert.ok(daggers.every(Boolean)); assert.deepEqual(daggers[0].definitionRef,daggers[1].definitionRef); assert.notEqual(daggers[0].id,daggers[1].id);
  assert.deepEqual(afterAward.combatProfile.hitPoints, beforeAward.combatProfile.hitPoints); assert.deepEqual(await get('comments',hit.id),immutableHit);
  await assert.rejects(commitQuestOperation(db,auth,{...claim,operationId:'award-again',expectedRevision:run.revision+2}),/bereits ausgezahlt/);
  assert.equal((await db.collection('quest_reward_claims').get()).size,1);
  const meal = STANDARD_ITEMS.find(row => row.category === 'speisen' && row.priceRange?.minCopper > 0 && row.priceRange.minCopper <= 10); assert.ok(meal);
  const offerId = 'offer:quest-mill-provisions';
  const savedOffer = await commitItemRegisterOperation(db,auth,{action:'save-offer',operationId:'mill-provisions-offer',expectedRevision:0,offer:{id:offerId,templateId:meal.id,definitionRef:meal.definitionRef,
    sellerCharacterId:'test-miller',title:meal.title,listId:'test-mill-delivery',listName:'Testmühle · Proviant',category:meal.category,priceRange:meal.priceRange,stock:2}});
  const purchase = { action: 'buy', operationId: 'buy-road-meal', entryId: scene, characterId: 'test-mara', expectedRevision: afterAward.inventory.revision,
    productId: offerId, offerRevision: savedOffer.offer.revision, standardVersion: STANDARD_VERSION, quantity: 1, unitCopper: meal.priceRange.minCopper };
  const purchased = await commitItemRegisterOperation(db,auth,purchase);
  const bought = await get('characters','test-mara'); assert.equal(bought.inventory.moneyState.totalCopper, 12-meal.priceRange.minCopper);
  assert.ok(bought.inventory.items.some(item => item.definitionRef?.id === meal.definitionRef.id));
  assert.equal((await db.collection('item_vendor_wallets').get()).docs[0].data().netMinor, meal.priceRange.minCopper*100);
  assert.equal((await get('characters','test-miller')).inventory.moneyState.totalCopper,meal.priceRange.minCopper);
  assert.equal((await db.doc(`item_register_offers/${offerId}`).get()).data().stock,1);
  const money = await commitInventoryTransferOperation(db,auth,{entryId:scene,giverId:'test-jorin',receiverId:'test-mara',operationId:'share-copper',
    sceneEvent:{transfer:{transferId:'share-copper',object:{kind:'money',currency:'copper',quantity:1}}}});
  assert.equal((await get('characters','test-jorin')).inventory.moneyState.totalCopper,11);
  checkpoint('Kauf und Geldtransfer über das interaktive Gameplay', { meal: meal.title, priceCopper: meal.priceRange.minCopper, purchaseCommentId: purchased.commentId, moneyTransferCommentId: money.id, sellerCharacterId:'test-miller',sellerCredited:true,stockAfter:1 });
  const archived = await get('quest_runs',runId); assert.equal(archived.status,'completed'); assert.equal(archived.ended.time,'12:35');
  const comments = [...await history(),...await history(tavern)], journal = projectQuestJournal(archived,comments);
  assert.ok(!journal.activities.some(row => row.id === purchased.commentId), 'A later purchase in the same scene does not rewrite the archived adventure.');
  assert.ok(journal.foes.some(foe => foe.actorId === 'test-thief' && foe.status === 'defeated')); assert.ok(journal.activities.some(row => row.kinds.includes('Rast')));
  checkpoint('Abschluss, Archiv und atomare Gruppenbelohnung', { ended: archived.ended, rewardClaims: 1, distinctWeaponsWithSharedStats: true, rewardCopperTotal: 24, historicalCombatUnchanged: true });
  const groupRunId = 'test-group-account-run';
  await commitQuestOperation(db, auth, { action: 'start', id: groupRunId, operationId: 'group-account-start', quest: { id: 'test:group-account', title: 'Gemeinsame Versorgung', links: {} }, groupModuleId: module.id, party, stamp: stamp('14:00') });
  await commitQuestOperation(db, auth, { action: 'finish', id: groupRunId, operationId: 'group-account-end', expectedRevision: 1, stamp: stamp('14:05'), rewardPlan: [
    { kind: 'group', recordId: module.id, rewards: [{ kind: 'money', currency: 'copper', amount: 50 }, { kind: 'item', itemId: 'standard:gemischtwarenhandler:notizbuch', quantity: 1 }] }
  ] });
  const groupClaim = { action: 'claim', id: groupRunId, operationId: 'group-account-claim', expectedRevision: 2 };
  await Promise.all([commitQuestOperation(db, auth, groupClaim), commitQuestOperation(db, auth, groupClaim)]);
  const groupAccount = await get('group_quest_accounts', module.id);
  assert.equal(groupAccount.inventory.moneyState.totalCopper, 50); assert.equal(groupAccount.inventory.items.length, 1);
  assert.equal(groupAccount.receipts.length, 1); assert.ok(groupAccount.inventory.items[0].definitionRef);
  assert.deepEqual(JSON.parse((await db.doc(`module_store_entries/${module.id}`).get()).data().entryJson), module);
  checkpoint('Einmalige Belohnung ins Konto der Gruppen-Landingpage', { groupModuleId: module.id, copper: 50, sharedItemDefinition: groupAccount.inventory.items[0].definitionRef, manualLedgerUnchanged: true });
  const events = (await db.collection('quest_events').where('runId','==',runId).get()).docs.map(row=>row.data()).sort((a,b)=>a.sequence-b.sequence);
  await writeFile(new URL('../../../../diagnostics/quest-system-2026-11-01/adventure-result.json',import.meta.url),JSON.stringify({ ...summary, completed: true, module, run: archived, events, comments, figures: [...figures,porter] },null,2));
});
