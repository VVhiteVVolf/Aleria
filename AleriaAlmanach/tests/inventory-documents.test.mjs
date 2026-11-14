import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { inventoryDocument } from '../modules/inventory-documents/document-item-model.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';
import { normalizeItemDefinition, itemDefinitionFromTemplate, itemDefinitionKey } from '../modules/item-definitions/item-definition-model.js';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { REPORT_ITEM_ID, REPORT_DOCUMENT_ID } from '../modules/fleischsammler-report/case-records.mjs';
import { planReportGrant, REPORT_RECIPIENT } from '../modules/fleischsammler-report/report-grant-plan.mjs';
import { createLocalDocumentNotes } from '../DokumentenWerkstatt/js/notes/document-notes-controller.js';

const template = AUTHORED_ITEMS.find(item => item.id === REPORT_ITEM_ID);
test('detached HTML copies keep their own browser notes with revision checks and bounded text', async () => {
  const values = new Map(), storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const notes = createLocalDocumentNotes('test-book', 'personal', storage);
  assert.equal((await notes.load()).revision, 0);
  await notes.save({ text: 'Eigene Notiz', expectedRevision: 0 });
  assert.equal((await createLocalDocumentNotes('test-book', 'personal', storage).load()).text, 'Eigene Notiz');
  await assert.rejects(notes.save({ text: 'Veraltet', expectedRevision: 0 }), /anderen Fenster/);
  await assert.rejects(notes.save({ text: 'x'.repeat(10001), expectedRevision: 1 }), /Ungültige Notizfassung/);
});
test('versioned documents keep a safe workshop identity through creation, saving and transfer', async () => {
  const definition = itemDefinitionFromTemplate(template), definitions = new Map([[itemDefinitionKey(definition), definition]]);
  const item = createGrantedItem(template, { id: 'book', characterId: 'a', characterName: 'Prüffigur', now: '2026-11-14T12:00:00Z' });
  const before = structuredClone(item);
  assert.equal(inventoryDocument(item, definitions).id, REPORT_DOCUMENT_ID);
  assert.match(inventoryDocument(item).href, /^\/Dokumente%20aus%20der%20Werkstatt\/dokument.html\?id=/);
  const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-character-inventory.js', import.meta.url), 'utf8'), context);
  context.item = item;
  const saved = JSON.parse(JSON.stringify(vm.runInContext('sanitizeCharacterInventoryItems(sanitizeCharacterInventoryItems([item]))[0]', context)));
  assert.deepEqual(saved.documentRef, item.documentRef);
  const transferred = applySceneInventoryTransfer({ id: 'a', inventory: { items: [item] } }, { id: 'b', name: 'Andere Prüffigur', inventory: { items: [] } }, { kind: 'item', itemId: 'book', quantity: 1 }, { definitions });
  assert.deepEqual(transferred.receiverInventory.items[0].documentRef, item.documentRef);
  assert.equal(transferred.giverInventory.items.length, 0);
  assert.deepEqual(item, before);
  assert.equal(inventoryCardModel(item).kind, 'document');
  assert.equal(inventoryCardModel(item).actions[0].name, 'Dokument lesen');
});
test('a malformed reference cannot redirect the reader or inject markup', () => {
  for (const id of ['../secret', '//example.com', 'javascript:alert(1)', 'bad" onclick="x', '', 'a'.repeat(81)]) {
    assert.equal(inventoryDocument({ documentRef: { id } }), null);
    assert.equal(normalizeItemDefinition({ id: 'test', title: 'Test', documentRef: { id } }).documentRef, undefined);
  }
});
test('the one-time book grant changes only Lefrayes inventory and rejects duplicate or foreign grants', () => {
  const character = { ...REPORT_RECIPIENT, identity: { worldPersonId: REPORT_RECIPIENT.id }, combatProfile: { marker: 'erfundene unveränderte Spielwerte' }, inventory: { revision: 3, moneyState: { copper: 41 }, items: [{ id: 'kept', name: 'Prüfgegenstand', quantity: '1' }], companions: [{ id: 'kept-companion' }] } };
  const before = structuredClone(character), now = '2026-11-14T12:00:00Z';
  const plan = planReportGrant({ character, template, now });
  assert.deepEqual(character, before);
  assert.deepEqual(plan.character.combatProfile, character.combatProfile);
  assert.deepEqual(plan.character.inventory.moneyState, character.inventory.moneyState);
  assert.deepEqual(plan.character.inventory.companions, character.inventory.companions);
  assert.deepEqual(plan.character.inventory.items.slice(0, -1), character.inventory.items);
  assert.equal(plan.character.inventory.revision, 4);
  assert.equal(plan.character.inventory.items.at(-1).category, 'documents');
  assert.equal(plan.character.inventory.items.at(-1).quantity, '1');
  assert.equal(planReportGrant({ character: plan.character, template, claim: plan.claim, now }).changed, false);
  assert.throws(() => planReportGrant({ character: plan.character, template, now }), /bereits vorhanden/);
  assert.throws(() => planReportGrant({ character: { ...character, id: 'other' }, template, now }), /Empfängeridentität/);
  assert.throws(() => planReportGrant({ character, template, claim: { sourceKey: 'foreign' }, now }), /Fremder/);
});
