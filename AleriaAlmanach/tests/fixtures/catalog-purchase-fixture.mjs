import { buildModuleOffers } from '../../modules/item-register/item-register-module-catalog.js';
import { applySceneTradeOrder } from '../../modules/scene-trade/scene-trade-model.js';

const clone = value => structuredClone(value);
const portrait = '/AleriaAlmanach/public/assets/inventory/coins/kupfertaler.png';

/** Local adapter uses the shared commerce model, never Firestore or production records. */
export function createCatalogPurchaseFixture(saved = null) {
  const entry = { id: 'quickbuy-fixture', title: 'Der außerordentlich ausführlich benannte Arkanistenladen von Gwynthor',
    type: 'Handel', pages: [
      { tradeCatalogPage: true, pageTitle: 'Reisebedarf', tradeCatalog: { title: 'Reisebedarf und persönliche Einzelstücke',
        categories: [{ id: 'sonstiges', label: 'Waren' }], items: [
          { id: 'becher', title: 'Reisebecher mit außergewöhnlich langer Beschriftung', category: 'sonstiges',
            image: portrait, priceMin: '0,9', priceMax: '0,9', currencyLabel: 'KT', description: 'Gewöhnliche, nachlieferbare Ware.' },
          { id: 'sternensiegel', title: 'Sternensiegel der alten Sternwarte', category: 'sonstiges', definitionKind: 'unique',
            image: portrait, priceMin: '1', priceMax: '1', currencyLabel: 'KT', description: 'Dieses persönliche Einzelstück existiert nur einmal.' },
          { title: 'Messingring für Reiseschnüre', category: 'sonstiges',
            image: portrait, priceMin: '0,1', priceMax: '0,1', currencyLabel: 'KT', description: 'Eine zweite gewöhnliche Ware bleibt unabhängig verfügbar.' }
        ] } },
      { goodsTablePage: true, pageTitle: 'Getränkeregister', goodsTable: { title: 'Getränke zum Mitnehmen',
        tables: [{ title: 'Ausschank', categories: [{ id: 'getraenke', label: 'Getränke' }],
          columns: [{ id: 'name', label: 'Ware' }, { id: 'description', label: 'Beschreibung' }, { id: 'price', label: 'Preis' }],
          rows: [{ values: { name: '' } }, { id: 'tee', category: 'getraenke', image: portrait,
            values: { name: 'Kräutertee in der Reiseflasche', description: 'Ein gewöhnlicher Kräuteraufguss.', price: '0,2 KT' } }] }] } }
    ] };
  const initialCharacters = [
    { id: 'gawain-fixture', name: 'Gawain mit einem außergewöhnlich langen Familiennamen', portrait,
      ownerUid: 'a-different-owner', inventory: { revision: 1, moneyState: { copper: 1, totalCopper: 1 }, items: [] } },
    { id: 'ylva-fixture', name: 'Ylva von der entferntesten Küste des Nordens', portrait,
      ownerUid: 'a-different-owner', inventory: { revision: 1, moneyState: { totalCopper: 25 }, items: [] } }
  ];
  const initialGroups = [{ id: 'companions-fixture', name: 'Gemeinsame Reisekasse der Gefährten mit einem langen Gruppennamen',
    managerUids: ['a-different-manager'], revision: 1, inventory: { moneyState: { totalCopper: 100 }, items: [] },
    tradeContext: { moduleId: entry.id, memberCharacterIds: ['gawain-fixture'] } }];
  const offers = buildModuleOffers([entry]);
  const soldUnique = new Set(), operations = new Map(), calls = [], published = [];
  let characters = clone(saved?.characters || initialCharacters), groups = clone(saved?.groups || initialGroups), dropNextReply = false, serial = saved?.serial || 0;
  for (const id of saved?.soldUnique || []) soldUnique.add(id);
  for (const [id, result] of saved?.operations || []) operations.set(id, result);
  calls.push(...clone(saved?.calls || []));
  let held = null;
  const product = itemId => offers.find(offer => offer.sourceRefs.some(ref => ref.itemId === itemId));

  const trade = {
    async load() {
      return { characters: clone(characters), groups: clone(groups), offers: clone(offers),
        access: { uid: 'fixture-player', role: 'player' }, moduleTitle: entry.title };
    },
    async availability() {
      return offers.map(offer => ({ productId: offer.id, unique: offer.definitionKind === 'unique',
        sourceRefs: offer.sourceRefs.map(({ kind, pageIndex, itemId, itemIndex, tableId, rowId, rowIndex }) =>
          ({ kind, pageIndex, itemId, itemIndex, tableId, rowId, rowIndex })),
        available: !soldUnique.has(offer.id), status: soldUnique.has(offer.id) ? 'owned' : 'available' }));
    },
    async ensureAccountsVersions() {},
    async checkout(request) {
      calls.push(clone(request));
      if (operations.has(request.operationId)) return clone(operations.get(request.operationId));
      const selected = request.lines.map(line => {
        const offer = offers.find(value => value.id === line.productId);
        if (!offer || soldUnique.has(offer.id)) throw Object.assign(Error('Die Ware wurde bereits vergeben.'), { code: 'failed-precondition' });
        return { ...line, product: offer };
      });
      const records = [
        ...characters.map(record => ({ ...clone(record), key: `character:${record.id}`, kind: 'character' })),
        ...groups.map(record => ({ ...clone(record), key: `group:${record.id}`, kind: 'group' }))
      ];
      const outcome = applySceneTradeOrder({ records, lines: selected, merchant: { id: request.merchantId, name: entry.title },
        operationId: request.operationId, now: 'fixture-1740' });
      const affected = new Set(request.lines.flatMap(line => [line.payerKey, line.recipientKey]));
      for (const record of outcome.records) if (affected.has(record.key)) {
        if (record.kind === 'character') record.inventory.revision = (record.inventory.revision || 0) + 1;
        else record.revision = (record.revision || 0) + 1;
      }
      const plain = record => { const next = clone(record); delete next.key; delete next.kind; return next; };
      characters = outcome.records.filter(record => record.kind === 'character').map(plain);
      groups = outcome.records.filter(record => record.kind === 'group').map(plain);
      for (const line of selected) if (line.product.definitionKind === 'unique') soldUnique.add(line.productId);
      const result = { characters: clone(characters.filter(record => affected.has(`character:${record.id}`))),
        groups: clone(groups.filter(record => affected.has(`group:${record.id}`))), receipt: outcome.receipt };
      operations.set(request.operationId, clone(result));
      if (dropNextReply) {
        dropNextReply = false;
        throw Object.assign(Error('Die Verbindung ist nach der lokalen Buchung unterbrochen.'), { code: 'unavailable' });
      }
      if (held) { const wait = held.promise; held.waiting = true; await wait; held = null; }
      return result;
    }
  };
  return { entry, offers, trade, calls, published, product,
    makeId: () => `fixture-operation-${++serial}`,
    loseNextReply: () => { dropNextReply = true; },
    holdNextReply() { let release; const promise = new Promise(resolve => { release = resolve; }); held = { promise, release, waiting: false }; },
    releaseReply: () => held?.release(),
    replyWaiting: () => !!held?.waiting,
    exportState: () => ({ characters: clone(characters), groups: clone(groups), calls: clone(calls),
      soldUnique: [...soldUnique], operations: clone([...operations]), serial }),
    snapshot: () => ({ characters: clone(characters), groups: clone(groups), committedOperations: operations.size, calls: clone(calls), soldUnique: [...soldUnique] }),
    reset() { characters = clone(initialCharacters); groups = clone(initialGroups); operations.clear(); calls.length = 0; soldUnique.clear(); published.length = 0; dropNextReply = false; }
  };
}
