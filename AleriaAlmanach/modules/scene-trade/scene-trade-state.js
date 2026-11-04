import { moneyTotal, toMinor } from '../item-register/item-register-money.js';
import { materializeInventoryItem, resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';
import { sceneTradeLinePrice } from './scene-trade-model.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';

export const MAX_TRADE_LINES = 20;
export const isUniqueTradeItem = item => item.definitionKind === 'unique' || item.kind === 'unique' || item.stockPolicy === 'unique';
export const availableTradeProduct = product => product.available !== false && !product.archived && !['planned', 'unavailable'].includes(product.status);
function referencePrice(direction, product, item = null) {
  return sceneTradeLinePrice({ direction, product, item, quantity: 1, priceMode: 'agreed', agreedTotalMinor: 0 }).baselineTotalMinor;
}
export function createSceneTradeState(threadId) {
  return { threadId, merchantId: '', actorCharacterId: '', payerKey: '', recipientKey: '', sellerKey: '',
    mode: 'buy', mobile: 'catalog', search: '', limit: 24, stage: 'edit', lines: [], openLine: '', status: '', error: false };
}
export function sceneTradeGroupAvailability(data) {
  const access = data.access || {}, editorial = ['admin', 'moderator', 'editor'].includes(access.role);
  return (data.groups || []).filter(record => editorial || record.managerUids?.includes(access.uid)).map(record => {
    const context = record.tradeContext;
    const linked = context && (context.moduleId === String(data.tradeThreadId || '').split('::')[0] || context.sceneThreads?.includes(data.tradeThreadId));
    const member = context?.memberCharacterIds?.includes(data.tradeActorCharacterId);
    const reason = !context ? 'Die Szenenverknüpfung ist nicht bestätigt.' : !linked ? 'Die Gruppe ist mit dieser Szene nicht verknüpft.' : !member ? 'Die bestellende Figur gehört nicht zur Gruppe.' : '';
    return { record, eligible: !reason, reason };
  });
}
export function sceneTradeAccounts(data) {
  const access = data.access || {}, moderator = ['admin', 'moderator'].includes(access.role);
  const groupEditor = moderator || access.role === 'editor';
  const account = (record, kind, canDebit) => ({ key: `${kind}:${record.id}`, id: record.id, kind,
    name: record.name || record.title || record.id, record, canDebit,
    revision: Number(kind === 'group' ? record.revision || 0 : record.inventory?.revision || 0),
    minor: toMinor(moneyTotal(record.inventory?.moneyState || record.inventory?.money || {})) });
  return [
    ...(data.characters || []).map(record => account(record, 'character', !!access.uid && (moderator || record.ownerUid === access.uid))),
    ...sceneTradeGroupAvailability(data).filter(group => group.eligible).map(group => group.record)
      .map(record => account(record, 'group', !!access.uid && (groupEditor || record.managerUids?.includes(access.uid))))
  ];
}
export function initializeSceneTradeDefaults(state, data, actorId = '') {
  data.tradeThreadId = state.threadId; data.tradeActorCharacterId = state.actorCharacterId || actorId;
  const accounts = sceneTradeAccounts(data), managed = accounts.filter(account => account.canDebit);
  const actor = managed.find(account => account.kind === 'character' && account.id === actorId)
    || managed.find(account => account.kind === 'character');
  if (!accounts.some(account => account.key === state.payerKey && account.canDebit)) state.payerKey = actor?.key || managed[0]?.key || '';
  if (!accounts.some(account => account.key === state.recipientKey)) state.recipientKey = actor?.key || managed[0]?.key || accounts[0]?.key || '';
  if (!accounts.some(account => account.key === state.sellerKey && account.canDebit)) state.sellerKey = state.payerKey;
  if (!managed.some(account => account.kind === 'character' && account.id === state.actorCharacterId)) state.actorCharacterId = actor?.id || '';
  data.tradeActorCharacterId = state.actorCharacterId;
}
export function refreshSceneTradeLines(state, data) {
  for (const line of state.lines.filter(line => line.direction === 'buy')) {
    const product = data.offers.find(product => product.id === line.productId && product.listId === state.merchantId);
    if (!product) continue;
    line.unique = isUniqueTradeItem(product);
    line.sourceRevision = product.sourceRevision || ''; line.offerRevision = Number(product.revision || 0);
    line.referenceUnitMinor = referencePrice('buy', product);
    line.maxQuantity = line.unique ? 1 : 9999;
  }
  const accounts = sceneTradeAccounts(data);
  for (const line of state.lines.filter(line => line.direction === 'sell')) {
    const item = accounts.find(account => account.key === line.sellerKey)?.record.inventory?.items?.find(item => item.id === line.itemId);
    if (!item) continue;
    const product = data.offers.find(offer => offer.listId === state.merchantId && offer.id === item.offerId) || {};
    line.referenceUnitMinor = referencePrice('sell', product, item);
    line.maxQuantity = line.unique ? 1 : Math.min(9999, Math.max(1, Number(item.quantity ?? 1)));
  }
}
export function lineTotalMinor(line) {
  return line.priceMode === 'agreed' ? line.agreedTotalMinor : line.referenceUnitMinor == null ? null : line.referenceUnitMinor * line.quantity;
}
export function addSceneTradeBuy(state, product, makeId = () => crypto.randomUUID()) {
  if (!state.merchantId || product.listId !== state.merchantId || !availableTradeProduct(product)) throw Error('Diese Ware ist bei diesem Händler nicht verfügbar.');
  const definition = resolveItemDefinition(product) || product;
  const unique = isUniqueTradeItem({ ...product, ...definition });
  if (unique && state.lines.some(line => line.productId === product.id)) throw Error('Dieses Einzelstück liegt bereits in der Bestellung.');
  const referenceUnitMinor = referencePrice('buy', product);
  const matching = state.lines.find(line => line.direction === 'buy' && line.productId === product.id
    && line.payerKey === state.payerKey && line.recipientKey === state.recipientKey && line.priceMode === 'standard');
  if (matching && !unique && matching.quantity < matching.maxQuantity) { matching.quantity += 1; return; }
  if (state.lines.length >= MAX_TRADE_LINES) throw Error(`Eine Bestellung kann höchstens ${MAX_TRADE_LINES} Positionen enthalten.`);
  state.lines.push({ id: makeId(), direction: 'buy', productId: product.id, moduleId: product.moduleId || '',
    sourceRevision: product.sourceRevision || '', offerRevision: Number(product.revision || 0),
    title: product.title || product.name, image: product.image || '', unique,
    quantity: 1, maxQuantity: unique ? 1 : 9999,
    payerKey: state.payerKey, recipientKey: state.recipientKey, referenceUnitMinor,
    priceMode: referenceUnitMinor == null ? 'agreed' : 'standard', agreedTotalMinor: null, priceNeedsReview: false });
}
export function addSceneTradeSell(state, item, account, offers, makeId = () => crypto.randomUUID()) {
  if (!account?.canDebit) throw Error('Aus diesem Inventar darfst du nichts verkaufen.');
  if (isInventoryPlaceholder(item)) throw Error('Dieser unveränderte Editor-Platzhalter ist noch kein verkäuflicher Gegenstand.');
  if (state.lines.some(line => line.direction === 'sell' && line.sellerKey === account.key && line.itemId === item.id)) throw Error('Dieser Gegenstand liegt bereits in der Bestellung.');
  if (state.lines.length >= MAX_TRADE_LINES) throw Error(`Eine Bestellung kann höchstens ${MAX_TRADE_LINES} Positionen enthalten.`);
  const resolved = materializeInventoryItem(item);
  const product = offers.find(offer => offer.listId === state.merchantId && offer.id === item.offerId) || {};
  const reference = referencePrice('sell', product, item), unique = isUniqueTradeItem(resolved);
  state.lines.push({ id: makeId(), direction: 'sell', itemId: item.id, sellerKey: account.key, recipientKey: account.key,
    title: resolved.name || resolved.title || 'Gegenstand', image: resolved.image || '', unique,
    quantity: 1, maxQuantity: unique ? 1 : Math.min(9999, Math.max(1, Number(item.quantity ?? 1))),
    referenceUnitMinor: reference, priceMode: reference == null ? 'agreed' : 'standard',
    agreedTotalMinor: null, priceNeedsReview: false });
}
export function updateSceneTradeLine(line, field, value, accounts) {
  if (field === 'quantity') {
    const quantity = Number(value);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > line.maxQuantity) throw Error('Bitte eine verfügbare ganze Menge wählen.');
    if (line.priceMode === 'agreed' && quantity !== line.quantity) line.priceNeedsReview = true;
    line.quantity = quantity;
  } else if (field === 'agreedTotalMinor') {
    if (value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) throw Error('Bitte einen vereinbarten Positionspreis eingeben.');
    if (Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) > 1e-7) throw Error('Der Preis darf höchstens zwei Nachkommastellen haben: ein Eisenpfennig entspricht 0,01 KT.');
    line.agreedTotalMinor = toMinor(Number(value)); line.priceMode = 'agreed'; line.priceNeedsReview = false;
  } else if (field === 'priceMode') {
    if (!['standard', 'agreed'].includes(value) || value === 'standard' && line.referenceUnitMinor == null) throw Error('Für diese Position fehlt ein Normalpreis.');
    if (value === 'agreed' && line.agreedTotalMinor == null) line.agreedTotalMinor = lineTotalMinor(line);
    line.priceMode = value; line.priceNeedsReview = false;
  } else if (['payerKey', 'recipientKey'].includes(field) && line.direction === 'buy') {
    if (!accounts.some(account => account.key === value && (field !== 'payerKey' || account.canDebit))) throw Error('Diese Zuordnung ist nicht berechtigt.');
    line[field] = value;
  }
}
export function sceneTradeSummary(state, data) {
  const accounts = new Map(sceneTradeAccounts(data).map(account => [account.key, { ...account, pays: 0, receives: 0, goods: [] }]));
  const errors = [], touched = new Set(); let buys = 0, sells = 0;
  for (const line of state.lines) {
    const total = lineTotalMinor(line);
    if (!Number.isSafeInteger(total) || total < 0) errors.push(`Für „${line.title}“ fehlt der vereinbarte Preis.`);
    if (line.priceNeedsReview) errors.push(`Menge von „${line.title}“ geändert: vereinbarten Preis erneut prüfen.`);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > line.maxQuantity) errors.push(`Die Menge von „${line.title}“ ist ungültig.`);
    const sourceKey = line.direction === 'buy' ? line.payerKey : line.sellerKey;
    const source = accounts.get(sourceKey), recipient = accounts.get(line.recipientKey);
    if (line.direction === 'buy') {
      const product = data.offers.find(product => product.id === line.productId && product.listId === state.merchantId && !product.archived);
      if (!product || !availableTradeProduct(product)) errors.push(`„${line.title}“ ist nicht mehr verfügbar.`);
    } else {
      const item = source?.record.inventory?.items?.find(item => item.id === line.itemId);
      if (!item || Number(item.quantity ?? 1) < line.quantity) errors.push(`„${line.title}“ ist nicht mehr in dieser Menge im Inventar.`);
    }
    if (!source?.canDebit) errors.push('Für einen gewählten Geldbeutel oder Bestand fehlt die Berechtigung.');
    if (!recipient) errors.push('Ein Empfänger ist nicht mehr verfügbar.');
    touched.add(sourceKey); touched.add(line.recipientKey);
    if (Number.isSafeInteger(total) && source) {
      if (line.direction === 'buy') { source.pays += total; buys += total; }
      else { source.receives += total; sells += total; }
    }
    if (recipient) recipient.goods.push({ name: line.title, quantity: line.quantity, direction: line.direction });
  }
  const rows = [...accounts.values()].filter(account => touched.has(account.key));
  if (![buys, sells, ...rows.flatMap(account => [account.pays, account.receives, account.minor + account.receives - account.pays])].every(Number.isSafeInteger)) errors.push('Der Gesamtbetrag ist zu groß. Bitte die Bestellung verkleinern.');
  for (const account of rows) if (account.minor + account.receives - account.pays < 0) errors.push(`${account.name} besitzt nicht genug Geld.`);
  if (!state.lines.length) errors.push('Die Bestellung enthält noch keine Waren.');
  if (!sceneTradeAccounts(data).some(account => account.kind === 'character' && account.id === state.actorCharacterId && account.canDebit)) errors.push('Bitte eine berechtigte bestellende Figur wählen.');
  return { rows, buys, sells, errors: [...new Set(errors)] };
}
export function buildSceneTradeCheckout(state, data) {
  const summary = sceneTradeSummary(state, data);
  if (summary.errors.length) throw Error(summary.errors[0]);
  return { action: 'checkout', entryId: state.threadId, merchantId: state.merchantId, actorCharacterId: state.actorCharacterId,
    expectedRevisions: Object.fromEntries(summary.rows.map(account => [account.key, account.revision])),
    lines: state.lines.map(line => ({ id: line.id, direction: line.direction, quantity: line.quantity, expectedTotalMinor: lineTotalMinor(line),
      ...(line.direction === 'buy' ? { productId: line.productId, moduleId: line.moduleId, sourceRevision: line.sourceRevision,
        offerRevision: line.offerRevision, payerKey: line.payerKey, recipientKey: line.recipientKey }
        : { itemId: line.itemId, sellerKey: line.sellerKey, recipientKey: line.recipientKey }),
      priceMode: line.priceMode, ...(line.priceMode === 'agreed' ? { agreedTotalMinor: line.agreedTotalMinor } : {}) })) };
}
