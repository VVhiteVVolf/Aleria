import { searchText } from './item-register-model.js?v=20260919-shop-v1';
import { parsePrice } from './item-register-money.js?v=20260919-shop-v1';

const text = value => String(value ?? '').replace(/[\u200b-\u200d\ufeff]/g, '').trim();
const key = value => searchText(text(value)).replace(/\s+/g, ' ');
const unique = values => [...new Set(values.filter(Boolean))];
const prose = values => unique(values.map(text)).join('\n\n');
// Stable local identities, not a security signature. The server rebuilds offers
// from their source module and validates prices and revisions independently.
function fingerprint(value) {
  let first = 2166136261, second = 5381;
  for (const char of JSON.stringify(value)) {
    first = Math.imul(first ^ char.charCodeAt(0), 16777619);
    second = Math.imul(second, 33) ^ char.charCodeAt(0);
  }
  return (first >>> 0).toString(16).padStart(8, '0') + (second >>> 0).toString(16).padStart(8, '0');
}

export function isShopModule(entry) {
  return !!entry?.id && entry.hidden !== true && entry.archived !== true && entry.isTemplate !== true
    && !/^vorlage(?:\b|[-_])/i.test(text(entry.id)) && !/^vorlage\b/i.test(text(entry.title));
}

const nameAliases = new Map([
  [key('Dünnes gewä. Bier'), key('Dünnes gewässertes Bier')],
  [key('Kräuteraufguss (Tee)'), key('Kräuteraufguss')]
]);
function standardFor(row, standards) {
  const name = nameAliases.get(key(row.title)) || key(row.title);
  const matches = standards.filter(item => key(item.title) === name);
  // Ambiguous variants are deliberately not collapsed into a guessed template.
  return matches.length === 1 ? matches[0] : null;
}
function categoryFor(row, standard) {
  if (standard) return standard.category;
  const category = key([row.category, row.type].join(' '));
  if (/getrank|ausschank|bier|wein|met\b|tee\b/.test(category)) return 'getraenke';
  if (/speis|menu|gericht|mahl|vorspeis|nachspeis/.test(category)) return 'speisen';
  if (/pferd|ross|zucht|gestut/.test(category)) return 'pferde';
  if (/rustung|schild/.test(category)) return 'ruestungen';
  if (/waffe|schwert|bogen/.test(category)) return 'waffen';
  if (/alchem|trank|krauter/.test(category)) return 'alchemie';
  if (/arkan|magie|artefakt/.test(category)) return 'arkanes';
  if (/werkzeug|ausrustung/.test(category)) return 'werkzeuge';
  if (/vieh|tier/.test(category)) return 'vieh';
  return 'sonstiges';
}

function goodsRows(page, pageIndex) {
  const goods = page.goodsTable || {};
  const context = text(goods.noteText);
  const rows = (goods.tables || []).flatMap((table, tableIndex) => (table.rows || []).map((row, rowIndex) => {
    const cell = id => text(row.values?.[id] ?? row[id]);
    const category = (table.categories || []).find(value => value.id === row.category)?.label || row.category;
    const columns = table.columns || [];
    const known = new Set(['name', 'kind', 'description', 'price']);
    const facts = columns.filter(column => !known.has(column.id)).map(column => ({ label: column.label || column.id, value: cell(column.id) })).filter(fact => fact.value);
    if (context) facts.push({ label: goods.noteTitle || 'Hinweis des Hauses', value: context });
    return { title: cell('name'), type: cell('kind'), category, description: cell('description'), details: text(row.details),
      image: text(row.image), unit: cell('portion') || cell('unit') || cell('pro'), availability: cell('availability'),
      price: cell('price'), currency: '', tags: [category, cell('kind')].filter(Boolean), attributes: [], facts,
      source: { kind: 'goods-register', pageIndex, pageTitle: text(page.pageTitle || page.title), tableId: table.id || String(tableIndex), tableTitle: text(table.title), rowIndex }
    };
  }));
  for (const [index, offer] of (goods.offers || []).entries()) {
    const name = text(offer.name);
    if (!name || /^tages angebot$/i.test(name)) continue;
    const offerPrice = parsePrice(offer.price);
    const matches = rows.filter(row => (key(row.title) === key(name) || key(row.description) === key(name)
      || (key(name) === key('Lammkeule mit Lauch') && key(row.title) === key('Lammkeule mit Lauch und Minze')))
      && JSON.stringify(parsePrice(row.price)) === JSON.stringify(offerPrice));
    if (matches.length === 1) {
      matches[0].facts.push({ label: goods.offerTitle || 'Empfehlung des Hauses', value: `${name} · ${text(offer.price)}` });
    } else rows.push({ title:name, type:'Angebot', category:'',description:text(offer.description), details:context, image:text(offer.image),
      unit:'',availability:'',price:text(offer.price),currency:'',tags:[],attributes:[],facts:[],
      source:{kind:'goods-register',pageIndex,pageTitle:text(page.pageTitle || page.title),tableId:'sidebar-offers',tableTitle:goods.offerTitle || 'Angebote',rowIndex:index} });
  }
  return rows;
}
function tradeRows(page, pageIndex) {
  const catalog = page.tradeCatalog || {};
  return (catalog.items || []).map((item, itemIndex) => {
    const category = (catalog.categories || []).find(value => value.id === item.category)?.label || item.category;
    const facts = [
      { label: item.originTitle || 'Herkunft', value: text(item.origin) },
      { label: item.featuresTitle || 'Eigenschaften', value: (item.features || []).map(feature => text(feature.text)).filter(value => value && value !== 'Neue Eigenschaft').join(' · ') },
      { label: item.usageTitle || 'Verwendung', value: (item.usageTags || []).join(', ') },
      { label: item.conditionsTitle || 'Kaufbedingungen', value: text(item.conditions) },
      { label: 'Preishinweis', value: text(item.priceNote) }
    ].filter(fact => fact.value);
    return { title: text(item.title), type: text(item.subtitle), category, description: text(item.description), details: '',
      image: text(item.image), unit: '', availability: '', price: unique([text(item.priceMin), text(item.priceMax)]).join(' - '),
      currency: text(item.currencyLabel || item.currencyCode), tags: unique([...(item.tags || []), ...(item.usageTags || [])]),
      attributes: item.attributes || [], facts, source: { kind: 'trade-catalog', pageIndex, pageTitle: text(page.pageTitle || page.title), itemId: text(item.id), itemIndex }
    };
  });
}

/** Read-only projection of all actual register rows. No copies are uploaded. */
export function buildModuleOffers(entries = [], standards = []) {
  const offers = new Map();
  for (const entry of entries.filter(isShopModule)) {
    const rows = (entry.pages || []).flatMap((page, index) => [
      ...(page.goodsTablePage ? goodsRows(page, index) : []),
      ...(page.tradeCatalogPage ? tradeRows(page, index) : [])
    ]);
    for (const row of rows) {
      if (!row.title || /^(?:neues handelsgut|neue ware|neuer eintrag)$/i.test(row.title)) continue;
      const standard = standardFor(row, standards);
      const priceRange = parsePrice(row.price, row.currency);
      const identity = [key(row.title), key(row.type), key(row.unit), priceRange || key(row.price)];
      const id = `module:${fingerprint(entry.id)}:${fingerprint(identity)}`;
      const source = { ...row.source, moduleId: entry.id, moduleTitle: text(entry.title), moduleType: text(entry.type) };
      const details = prose([row.details, ...row.facts.map(fact => `${fact.label}: ${fact.value}`)]);
      const existing = offers.get(id);
      if (existing) {
        existing.description = prose([existing.description, row.description]);
        existing.details = prose([existing.details, details]);
        existing.sourceRefs.push(source);
        continue;
      }
      const category = categoryFor(row, standard);
      offers.set(id, { id, canonicalKey: id, section: 'offer', aliases: [],
        listId: `module:${entry.id}`, listName: text(entry.title), moduleId: entry.id, moduleSource: true,
        templateId: standard?.id || '', title: row.title, type: row.type || standard?.type || '', category,
        description: row.description || standard?.description || row.details || `${row.title} aus dem Angebot von ${text(entry.title)}${row.type ? ` (${row.type})` : ''}.`,
        details: details || standard?.details || '', image: row.image || standard?.image || '',
        price: row.price, currency: row.currency, priceRange, stock: /^(?:ausverkauft|nicht verfugbar|nicht erhaltlich)$/i.test(key(row.availability)) ? 0 : null,
        tags: unique([...row.tags, ...(standard?.tags || [])]), attributes: row.attributes,
        combatDefinition: standard?.combatDefinition || null, sourceRefs: [source],
        hiddenMeta: { unit: row.unit, availability: row.availability, facts: row.facts }, archived: false
      });
    }
  }
  return [...offers.values()].map(offer => ({ ...offer, sourceRevision: fingerprint(offer) }));
}

/** Suppress old scan copies only when the same authoritative source is present. */
export function isModuleScanDuplicate(item, offers) {
  return item.moduleScan === true && offers.some(offer => key(offer.title) === key(item.title)
    && item.sourceRefs?.some(ref => ref.moduleId === offer.moduleId));
}
