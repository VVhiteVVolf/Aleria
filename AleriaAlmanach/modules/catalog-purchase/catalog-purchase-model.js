import { moneyTotal, toMinor } from '../item-register/item-register-money.js';
import { sceneTradeLinePrice } from '../scene-trade/scene-trade-model.js';

const text = value => String(value ?? '').trim();
const sourceKind = value => value === 'goods-table' ? 'goods-register' : value;
const validIndex = value => ['string', 'number'].includes(typeof value) && text(value) !== ''
  && Number.isSafeInteger(Number(value)) && Number(value) >= 0;
const hasId = value => !!text(value);
const usableCharacter = record => hasId(record?.id) && record.archived !== true && record.mergeIdentity?.status !== 'merged';
const uniqueProduct = product => product?.definitionKind === 'unique' || product?.kind === 'unique' || product?.stockPolicy === 'unique';

/** Match source identities rather than titles, prices, or the rendered row order. */
export function matchCatalogPurchaseOffers(offers = [], sourceRef = {}) {
  const kind = sourceKind(sourceRef.kind);
  if (!['trade-catalog', 'goods-register'].includes(kind) || !validIndex(sourceRef.pageIndex)) return [];
  const hasRow = kind === 'trade-catalog'
    ? hasId(sourceRef.itemId) || validIndex(sourceRef.itemIndex)
    : (hasId(sourceRef.tableId) || validIndex(sourceRef.tableIndex)) && (hasId(sourceRef.rowId) || validIndex(sourceRef.rowIndex));
  if (!hasRow) return [];
  return offers.filter(offer => (offer.sourceRefs || []).some(ref => {
    if (sourceKind(ref.kind) !== kind || !validIndex(ref.pageIndex) || Number(ref.pageIndex) !== Number(sourceRef.pageIndex)) return false;
    if (sourceRef.moduleId && (ref.moduleId || offer.moduleId) && (ref.moduleId || offer.moduleId) !== sourceRef.moduleId) return false;
    if (kind === 'trade-catalog') {
      if (hasId(sourceRef.itemId) ? text(ref.itemId) !== text(sourceRef.itemId) : !validIndex(ref.itemIndex) || Number(ref.itemIndex) !== Number(sourceRef.itemIndex)) return false;
    } else {
      const tableId = hasId(sourceRef.tableId) ? text(sourceRef.tableId) : String(Number(sourceRef.tableIndex));
      if (text(ref.tableId) !== tableId) return false;
      if (hasId(sourceRef.rowId) ? text(ref.rowId) !== text(sourceRef.rowId) : !validIndex(ref.rowIndex) || Number(ref.rowIndex) !== Number(sourceRef.rowIndex)) return false;
    }
    if (sourceRef.priceOption != null && text(ref.priceOption) !== text(sourceRef.priceOption)) return false;
    if (sourceRef.unit != null && text(ref.unit) !== text(sourceRef.unit)) return false;
    return true;
  }));
}

/** Exact module/page projection; the global Standard/Regional register is never stock. */
export function catalogPurchaseOffers(offers = [], { moduleId, pageIndex, sourceRef } = {}) {
  if (!hasId(moduleId) || !validIndex(pageIndex)) return [];
  const selected = offers.filter(offer => offer.listId === `module:${moduleId}` && offer.moduleId === moduleId
    && !offer.archived && !offer.legacy && offer.sourceRefs?.some(ref => validIndex(ref.pageIndex) && Number(ref.pageIndex) === Number(pageIndex)
      && ['trade-catalog', 'goods-register'].includes(sourceKind(ref.kind))));
  return sourceRef ? matchCatalogPurchaseOffers(selected, { ...sourceRef, moduleId, pageIndex }) : selected;
}

function account(record, kind, signedIn) {
  return { key: `${kind}:${record.id}`, id: record.id, kind, name: record.name || record.title || record.id,
    record, canDebit: signedIn, revision: Number(kind === 'group' ? record.revision || 0 : record.inventory?.revision || 0),
    minor: toMinor(moneyTotal(record.inventory?.moneyState || record.inventory?.money || {})) };
}

/** Only roster identities backed by actual character records authorize a group order. */
export function catalogPurchaseGroupMembers(data, group) {
  const characters = new Map((data.characters || []).filter(usableCharacter).map(record => [record.id, record]));
  return [...new Set(group?.tradeContext?.memberCharacterIds || [])].map(id => characters.get(id)).filter(Boolean);
}

/** Payer UI may offer a group before its ordering member has been chosen. */
export function catalogPurchasePayerOptions(data) {
  const signedIn = !!data.access?.uid;
  return [...(data.characters || []).filter(usableCharacter).map(record => account(record, 'character', signedIn)),
    ...(data.groups || []).filter(record => hasId(record.id) && catalogPurchaseGroupMembers(data, record).length)
      .map(record => ({ ...account(record, 'group', signedIn), members: catalogPurchaseGroupMembers(data, record) }))];
}

/** Checkout eligibility uses the explicitly selected ordering member. */
export function catalogPurchaseAccounts(data, actorCharacterId = '') {
  return catalogPurchasePayerOptions(data).filter(option => option.kind === 'character' || option.members.some(member => member.id === actorCharacterId));
}

/** An empty or invalid remembered payer remains empty; opening never chooses a wallet. */
export function resolveCatalogPurchaseSelection(data, saved = {}) {
  const options = catalogPurchasePayerOptions(data), payer = options.find(option => option.key === saved.payerKey && option.canDebit);
  if (!payer) return { payerKey: '', recipientKey: '', actorCharacterId: '' };
  const characters = options.filter(option => option.kind === 'character');
  const recipient = characters.find(option => option.key === saved.recipientKey);
  let actor = characters.find(option => option.id === saved.actorCharacterId);
  if (payer.kind === 'group') {
    actor = payer.members.find(member => member.id === actor?.id)
      || payer.members.find(member => member.id === recipient?.id) || payer.members[0];
  } else actor = payer.record;
  return { payerKey: payer.key, recipientKey: recipient?.key || `character:${payer.kind === 'character' ? payer.id : actor.id}`,
    actorCharacterId: actor.id };
}

export function catalogPurchasePreview(input = {}, data = {}) {
  const errors = [], quantity = Number(input.quantity ?? 1), merchantId = `module:${data.moduleId || ''}`;
  const product = catalogPurchaseOffers(data.offers, data).find(offer => offer.id === input.productId && offer.listId === merchantId);
  const accounts = catalogPurchaseAccounts(data, input.actorCharacterId), payer = accounts.find(option => option.key === input.payerKey && option.canDebit);
  const recipient = accounts.find(option => option.kind === 'character' && option.key === input.recipientKey);
  const actor = accounts.find(option => option.kind === 'character' && option.id === input.actorCharacterId && option.canDebit);
  if (!product || product.available === false || ['planned', 'unavailable'].includes(product.status)
    || ['unknown', 'checking', 'owned', 'sold', 'unavailable'].includes(product.availabilityStatus)) errors.push('Diese Ware ist nicht zum Direktkauf verfügbar.');
  if (uniqueProduct(product) && product.availabilityStatus !== 'available') errors.push('Die Verfügbarkeit dieses Einzelstücks ist noch nicht bestätigt.');
  if (!actor) errors.push('Bitte eine bestellende Figur wählen.');
  if (!payer) errors.push('Bitte einen verfügbaren Geldbeutel wählen.');
  if (!recipient) errors.push('Bitte eine Empfängerfigur wählen.');
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) errors.push('Die Menge muss zwischen 1 und 9.999 liegen.');
  if (uniqueProduct(product) && quantity !== 1) errors.push('Ein Einzelstück kann nur einmal gekauft werden.');
  let unitMinor = null, totalMinor = null;
  if (product) {
    try {
      unitMinor = sceneTradeLinePrice({ direction: 'buy', product }).totalMinor;
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) throw Error('Die Menge ist ungültig.');
      totalMinor = sceneTradeLinePrice({ direction: 'buy', product, quantity }).totalMinor;
    } catch (error) { errors.push(error.message); }
  }
  if (payer && totalMinor != null && payer.minor < totalMinor) errors.push(`${payer.name} besitzt nicht genug Geld.`);
  for (const option of [payer, recipient].filter(Boolean)) if (!Number.isSafeInteger(option.revision) || option.revision < 0) errors.push('Der Inventarstand ist noch nicht bestätigt. Bitte neu laden.');
  return { product, quantity, unitMinor, totalMinor, payer, recipient, actor, errors: [...new Set(errors)] };
}

/** One captured request is submitted/retried by the existing durable submission owner. */
export function buildCatalogPurchaseCheckout(input, data) {
  const preview = catalogPurchasePreview(input, data);
  if (preview.errors.length) throw Error(preview.errors[0]);
  const { product, quantity, totalMinor, payer, recipient } = preview;
  return { action: 'catalog-checkout', entryId: data.moduleId, merchantId: `module:${data.moduleId}`, catalogPageIndex: data.pageIndex,
    actorCharacterId: input.actorCharacterId, ...(input.operationId ? { operationId: input.operationId } : {}),
    expectedRevisions: Object.fromEntries([payer, recipient].map(option => [option.key, option.revision])),
    lines: [{ id: input.lineId || 'purchase', direction: 'buy', productId: product.id, moduleId: data.moduleId,
      sourceRevision: product.sourceRevision || '', offerRevision: Number(product.revision || 0), quantity,
      priceMode: 'standard', expectedTotalMinor: totalMinor, payerKey: payer.key, recipientKey: recipient.key }] };
}
