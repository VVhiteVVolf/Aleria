import { createSceneTradeService } from '../scene-trade/scene-trade-service.js';
import { catalogPurchaseOffers } from './catalog-purchase-model.js';

function moduleContext({ moduleId, pageIndex = 0 } = {}) {
  if (typeof moduleId !== 'string' || !moduleId.trim() || moduleId !== moduleId.trim() || moduleId.includes('::')) throw Error('Das Warenregister besitzt keine eindeutige Modulkennung.');
  if (!['string', 'number'].includes(typeof pageIndex) || String(pageIndex).trim() === ''
    || !Number.isSafeInteger(Number(pageIndex)) || Number(pageIndex) < 0) throw Error('Die Warenregisterseite ist ungültig.');
  return { moduleId, pageIndex: Number(pageIndex), merchantId: `module:${moduleId}` };
}

function mergeRecords(current = [], updates = []) {
  const pending = new Map(updates.filter(record => record?.id).map(record => [record.id, record]));
  const result = current.map(record => {
    const update = pending.get(record.id); pending.delete(record.id);
    return update ? { ...record, ...update } : record;
  });
  return [...result, ...pending.values()];
}

function publishCharacters(characters) {
  if (typeof document === 'undefined') return;
  for (const record of characters) document.dispatchEvent(new CustomEvent('aleria:character-saved', { detail: { record } }));
}

/** Direct module purchases share the light register connection and callable owner. */
export function createCatalogPurchaseService({ createTradeService = createSceneTradeService, publish = publishCharacters } = {}) {
  const utilityTrade = createTradeService();
  let loaded = null, loadedTrade = null, loadGeneration = 0;
  function applyResult(data, result) {
    if (!data || !result) return data;
    data.characters = mergeRecords(data.characters, result.characters);
    data.groups = mergeRecords(data.groups, result.groups);
    publish(result.characters || []);
    return data;
  }
  return {
    async load(options) {
      const context = moduleContext(options), generation = ++loadGeneration, trade = createTradeService();
      const source = await trade.load({ moduleId: context.moduleId });
      const offers = catalogPurchaseOffers(source.offers, context);
      const data = { ...source, ...context, offers, moduleTitle: offers[0]?.listName || context.moduleId };
      // The existing client binds checkout to the UID read by its load. Keep
      // that client together with its own snapshot even when loads overlap.
      if (generation === loadGeneration) { loaded = data; loadedTrade = trade; }
      return data;
    },
    // This path deliberately does not call load(): decorating visible unique
    // cards must not subscribe to all characters or query group wallets.
    availability(options) { return utilityTrade.availability(moduleContext(options).merchantId); },
    ensureAccountsVersions(records = []) { return utilityTrade.ensureAccountsVersions(records); },
    applyResult,
    async checkout(input) {
      if (!loaded) throw Error('Bitte das Warenregister vor dem Kauf laden.');
      const data = loaded, trade = loadedTrade;
      if (input?.action !== 'catalog-checkout' || input.entryId !== data.moduleId || input.merchantId !== data.merchantId) throw Error('Der Direktkauf gehört nicht zum geöffneten Warenregister.');
      const result = await trade.checkout(input);
      applyResult(data, result);
      return result;
    }
  };
}
