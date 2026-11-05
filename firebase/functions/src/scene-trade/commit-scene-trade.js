import { createHash } from 'node:crypto';
import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { applySceneTradeOrder } from '../generated/scene-trade/scene-trade-model.js';
import { describeSceneTrade } from '../generated/scene-trade/scene-trade-summary.js';
import { readItemDefinitionIndex, prepareUniqueItemClaims } from '../items/item-definition-repository.js';
import { selectiveItemInventoryUpdate } from '../items/item-inventory-update.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';
import { readTradeMerchant, readTradeScene, tradeId, tradeMerchantId } from './scene-trade-context.js';
import { readTradeAccounts, tradeAccountKey } from './scene-trade-accounts.js';
import { prepareTradeProducts } from './scene-trade-products.js';
import { normalizeItemDefinitionRef } from '../generated/item-definitions/item-definition-model.js';

const hash = value => createHash('sha256').update(value).digest('hex');
function publicSoldSnapshot(value = {}) {
  const item = {};
  const fields = { id: 220, instanceId: 220, name: 180, image: 4000, type: 180, quantity: 40, registerCategory: 50, category: 50, templateName: 180 };
  for (const [key, limit] of Object.entries(fields)) {
    if (typeof value[key] === 'string') item[key] = value[key].slice(0, limit);
    else if (key === 'quantity' && Number.isFinite(value[key])) item[key] = value[key];
  }
  const definitionRef = normalizeItemDefinitionRef(value.definitionRef);
  if (definitionRef) item.definitionRef = definitionRef;
  if (['unique', 'shared'].includes(value.definitionKind)) item.definitionKind = value.definitionKind;
  return item;
}
const accountReply = records => ({ characters: records.filter(record => record.kind === 'character').map(publicReplyRecord), groups: records.filter(record => record.kind === 'group').map(publicReplyRecord) });
function publicReplyRecord(record) {
  const { key, kind, _itemHolderKind, ...data } = record;
  return data;
}
function validateInput(input) {
  if (JSON.stringify(input).length > 40000 || !Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 20) {
    throw new HttpsError('invalid-argument', 'Eine Bestellung benötigt eine bis zwanzig Warenzeilen.');
  }
  tradeId(input.operationId); tradeMerchantId(input.merchantId);
  const ids = new Set();
  for (const line of input.lines) {
    tradeId(line.id);
    if (ids.has(line.id)) throw new HttpsError('invalid-argument', 'Warenzeilen benötigen unterschiedliche Kennungen.');
    ids.add(line.id);
    if (!['buy', 'sell'].includes(line.direction) || !['standard', 'agreed'].includes(line.priceMode)) throw new HttpsError('invalid-argument', 'Handelsrichtung oder Preisart fehlt.');
    if (line.priceMode === 'standard' && (!Number.isSafeInteger(line.expectedTotalMinor) || line.expectedTotalMinor < 0)) throw new HttpsError('invalid-argument', 'Die Bestellung benötigt den zuletzt angezeigten Gesamtpreis jeder Standardpreiszeile.');
    if (line.direction === 'sell') tradeAccountKey(line.sellerKey);
    else { tradeAccountKey(line.payerKey); tradeAccountKey(line.recipientKey); }
  }
}
async function currentRecords(database, transaction, keys) {
  const records = [];
  for (const key of keys) {
    const account = tradeAccountKey(key);
    const reference = database.doc(`${account.kind === 'group' ? 'group_quest_accounts' : 'characters'}/${account.id}`);
    const snapshot = await transaction.get(reference);
    if (snapshot.exists) records.push({ ...snapshot.data(), ...account });
  }
  return records;
}
function recordChanges(target, next, lines, receipt, now) {
  if (JSON.stringify(target.record.inventory) === JSON.stringify(next.inventory)
    && JSON.stringify(target.record.combatProfile) === JSON.stringify(next.combatProfile)) return null;
  const itemIds = new Set(lines.filter(line => line.direction === 'sell' && line.sellerKey === next.key).map(line => line.itemId));
  for (const line of receipt.lines || []) if (line.recipientKey === next.key) for (const id of line.itemIds || []) itemIds.add(id);
  const updates = selectiveItemInventoryUpdate(target.record, next, [...itemIds], { preserveExisting: true });
  if (next.kind === 'group') {
    const revision = Number(target.record.revision || 0) + 1;
    if (!Number.isSafeInteger(revision)) throw new HttpsError('failed-precondition', 'Die Gruppenrevision ist zu groß.');
    return { ...updates, inventory: { ...updates.inventory, revision }, revision, updatedAt: now };
  }
  return withProtectedRecordRevisions(target.record, { ...updates, updatedAt: now }, ['inventory', ...(updates.combatProfile ? ['combatProfile'] : [])]);
}

export async function commitSceneTradeOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  validateInput(input);
  const operationId = tradeId(input.operationId), fingerprint = hash(JSON.stringify(input));
  const receiptRef = database.doc(`scene_trade_transactions/${auth.uid}-${operationId}`);
  const identity = `trade:${hash(receiptRef.path).slice(0, 32)}`, now = new Date().toISOString();
  const commentRef = database.collection('comments').doc();
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangskennung wurde bereits für eine andere Bestellung verwendet.');
      return { receipt: prior.data().receipt, commentId: prior.data().commentId, ...accountReply(await currentRecords(database, transaction, prior.data().accountKeys)) };
    }
    const manifest = (await transaction.get(database.doc('char_tabs/config'))).data()?.moduleStoreManifest;
    const scene = await readTradeScene(database, transaction, input.entryId, manifest);
    const merchant = await readTradeMerchant(database, transaction, input.merchantId, manifest);
    const accounts = await readTradeAccounts(database, transaction, input, scene);
    const definitions = await readItemDefinitionIndex(database, transaction, accounts.records);
    const prepared = await prepareTradeProducts(database, transaction, input.lines, merchant, accounts.records, definitions, identity, { actorUid: auth.uid, now, publishHead: true });
    const result = applySceneTradeOrder({ records: accounts.records, lines: prepared.lines, merchant: { id: merchant.id, name: merchant.name, kind: 'merchant' }, operationId, now });
    for (const line of result.receipt.lines) {
      const submitted = input.lines.find(candidate => candidate.id === line.id);
      if (line.priceMode === 'standard' && submitted.expectedTotalMinor !== line.totalMinor) throw new HttpsError('aborted', 'Ein Standardpreis wurde inzwischen geändert. Bitte die Bestellung neu prüfen.');
    }
    const claim = await prepareUniqueItemClaims(database, transaction, result.claims || [], { actorUid: auth.uid, now });
    const walletRef = database.doc(`item_vendor_wallets/${hash(merchant.id)}`), wallet = await transaction.get(walletRef);
    const delta = result.receipt.totals.netMinor;
    const netMinor = Number(wallet.data()?.netMinor || 0) + delta;
    if (!Number.isSafeInteger(netMinor)) throw new HttpsError('failed-precondition', 'Das Händlerjournal überschreitet den unterstützten Zahlenbereich.');
    const receipt = { ...result.receipt, actor: { id: accounts.actor.id, key: `character:${accounts.actor.id}`, name: accounts.actor.name || '', portrait: accounts.actor.portrait || '' },
      merchant: { ...result.receipt.merchant, kind: 'merchant', portrait: merchant.portrait || '' },
      participants: accounts.records.map(record => ({ key: record.key, id: record.id, kind: record.kind, name: record.name || '', portrait: record.portrait || '' })), createdAt: now };
    const changes = result.records.map(record => ({ record, target: accounts.targets.get(record.key), changes: recordChanges(accounts.targets.get(record.key), record, prepared.lines, receipt, now) }));
    // Every authoritative read and validation precedes this single write phase.
    prepared.write(); claim();
    transaction.set(walletRef, { vendorId: merchant.id, name: merchant.name, mode: 'unlimited', netMinor, updatedAt: now });
    for (const entry of changes) if (entry.changes) {
      if (entry.target.exists) transaction.update(entry.target.reference, entry.changes);
      else transaction.create(entry.target.reference, { ...publicReplyRecord(entry.target.record), ...entry.changes });
    }
    for (const sold of result.soldItems || []) {
      const reference = database.doc(`item_merchant_sold/${hash(`${receiptRef.path}:${sold.lineId}`)}`);
      transaction.create(reference, { merchantId: merchant.id, item: sold.item, quantity: sold.quantity, totalMinor: sold.totalMinor,
        status: 'sold', at: now, operationId, lineId: sold.lineId, sourceKey: sold.sellerKey });
    }
    for (const creature of prepared.creatures) transaction.update(creature.reference, { itemOrigin: { ...creature.origin,
      ownerCharacterId: '', ownerCharacterName: '', ownerGroupId: '', ownerMerchantId: merchant.id, disposition: 'sold', soldAt: now }, updatedAt: now });
    const text = describeSceneTrade(receipt);
    transaction.create(commentRef, { entryId: input.entryId, text, charName: 'Erzähler', narrator: true, characterId: '', avatarKind: 'narrator',
      commentMode: 'scene-inventory-transfer', commentKind: 'scene-inventory-transfer-event', sceneTrade: receipt,
      inventoryTransaction: { schemaVersion: 3, validatedBy: 'commitItemTrade', trade: true, operations: receipt.lines.length },
      serverValidatedMechanics: true, serverCommitted: true, createdBy: auth.uid, createdByRole: String(auth.token?.aleriaRole || 'player'),
      schemaVersion: 3, orderKey: Date.now(), createdAtClient: Date.now(), ts: FieldValue.serverTimestamp(), activityAt: FieldValue.serverTimestamp() });
    transaction.create(receiptRef, { actorUid: auth.uid, operationId, fingerprint, receipt, commentId: commentRef.id, accountKeys: accounts.records.map(record => record.key), at: now });
    return { receipt, commentId: commentRef.id, ...accountReply(changes.map(entry => ({ ...entry.record, ...(entry.changes || {}) }))) };
  });
}

export async function readMerchantSoldOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const cursor = input.cursor;
  if (cursor != null && (!cursor || typeof cursor !== 'object' || typeof cursor.at !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(cursor.at) || !Number.isFinite(Date.parse(cursor.at))
    || new Date(cursor.at).toISOString() !== cursor.at || typeof cursor.id !== 'string' || !/^[\w:.-]{1,220}$/.test(cursor.id))) {
    throw new HttpsError('invalid-argument', 'Der Seitenzeiger der Verkaufsablage ist ungültig.');
  }
  return database.runTransaction(async transaction => {
    const manifest = (await transaction.get(database.doc('char_tabs/config'))).data()?.moduleStoreManifest;
    await readTradeMerchant(database, transaction, input.merchantId, manifest);
    if (cursor) {
      const anchor = await transaction.get(database.doc(`item_merchant_sold/${cursor.id}`));
      if (!anchor.exists || anchor.data()?.merchantId !== input.merchantId || anchor.data()?.at !== cursor.at) throw new HttpsError('invalid-argument', 'Der Seitenzeiger gehört nicht zu dieser Händlerablage.');
    }
    let query = database.collection('item_merchant_sold').where('merchantId', '==', input.merchantId).orderBy('at', 'desc').orderBy(FieldPath.documentId(), 'desc');
    if (cursor) query = query.startAfter(cursor.at, cursor.id);
    const snapshot = await transaction.get(query.limit(101));
    const items = snapshot.docs.map(row => ({ id: row.id, ...row.data() })).filter(row => row.status === 'sold').map(row => ({
      id: row.id, merchantId: row.merchantId, item: publicSoldSnapshot(row.item), quantity: row.quantity, totalMinor: row.totalMinor, at: row.at, status: row.status
    }));
    const page = items.slice(0, 100), limited = snapshot.size > 100;
    return { items: page, limited, nextCursor: limited && page.length ? { at: page.at(-1).at, id: page.at(-1).id } : null };
  });
}
