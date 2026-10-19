import { createMerchantRating } from './merchant-ratings.mjs?v=20260918b';
import { groupMerchants } from './merchant-groups.mjs?v=merchant-directory-20261019';

// Native details own expansion and keyboard behavior; the place adapter only
// supplies data. Repeated data events preserve the reader's open entries.
export function renderMerchantDirectory(root, merchants = []) {
  const doc = root.ownerDocument;
  const open = new Set([...root.querySelectorAll('.merchant-entry[open]')].map(entry => entry.dataset.merchantKey));
  const focused = root.contains(doc.activeElement) ? doc.activeElement?.closest('.merchant-entry')?.dataset.merchantKey : undefined;
  const groups = groupMerchants(merchants).map(group => {
    const section = element(doc, 'section', 'merchant-directory__group');
    section.dataset.merchantCategory = group.key;
    section.append(element(doc, 'h3', 'merchant-directory__heading', group.title));
    const list = element(doc, 'ul', 'merchant-directory__list');
    for (const [index, merchant] of group.merchants.entries()) {
      const item = doc.createElement('li');
      const entry = createEntry(merchant, index, doc);
      entry.open = open.has(entry.dataset.merchantKey);
      item.append(entry);
      list.append(item);
    }
    section.append(list);
    return section;
  });
  if (merchants.length) root.replaceChildren(...groups);
  else root.replaceChildren(element(doc, 'p', 'merchant-directory__empty', 'Für diesen Ort sind noch keine Händler oder Etablissements eingetragen.'));
  if (focused) {
    const entry = [...root.querySelectorAll('.merchant-entry')].find(entry => entry.dataset.merchantKey === focused);
    entry?.querySelector('summary').focus({ preventScroll: true });
  }
}

function createEntry(merchant, index, doc) {
  const name = String(merchant.name || 'Unbenannter Eintrag');
  const trade = String(merchant.trade || merchant.gewerbe || merchant.type || '—');
  const entry = element(doc, 'details', 'merchant-entry');
  entry.dataset.merchantKey = String(merchant.id || merchant.name || index);
  const summary = element(doc, 'summary', 'merchant-entry__summary');
  const title = element(doc, 'span', 'merchant-entry__name', name);
  title.title = name;
  const preview = element(doc, 'span', 'merchant-entry__trade', trade);
  preview.title = trade;
  const toggle = element(doc, 'span', 'merchant-entry__toggle', 'Details');
  toggle.setAttribute('aria-hidden', 'true');
  summary.append(createSymbol(merchant, doc), title, preview, toggle);

  const body = element(doc, 'div', 'merchant-entry__body');
  body.append(element(doc, 'h4', 'merchant-entry__title', name));
  const facts = element(doc, 'dl', 'merchant-entry__facts');
  const fields = [
    ['Besitzer', merchant.owner || merchant.besitzer],
    ['Gewerbe', trade],
    ['Wohlstand', merchant.wealth ?? merchant.wohlstand, 'wealth'],
    ['Ruf', merchant.reputation ?? merchant.ruf, 'reputation'],
    ['Einfluss', merchant.influence ?? merchant.einfluss, 'influence'],
  ];
  for (const [label, value, kind] of fields) {
    const fact = element(doc, 'div', 'merchant-entry__fact');
    const description = element(doc, 'dd');
    if (kind) description.append(createMerchantRating(value, kind, doc));
    else description.textContent = String(value || '—');
    fact.append(element(doc, 'dt', '', label), description);
    facts.append(fact);
  }
  body.append(facts);
  const description = merchant.description || merchant.beschreibung;
  if (description) body.append(element(doc, 'p', 'merchant-entry__description', String(description)));
  entry.append(summary, body);
  return entry;
}

function createSymbol(merchant, doc) {
  const frame = element(doc, 'span', 'merchant-entry__symbol');
  const source = merchant.icon || merchant.image
    || (merchant.symbol ? '' : '/IconOrdner/Neutrale Wappen/Neutrales Bürgerwappen.png');
  if (source) {
    const image = doc.createElement('img');
    image.src = String(source);
    image.alt = merchant.symbolAlt || `Symbol ${merchant.name || 'des Eintrags'}`;
    image.width = 48;
    image.height = 48;
    image.loading = 'lazy';
    image.decoding = 'async';
    frame.append(image);
  } else frame.textContent = String(merchant.symbol || '—');
  return frame;
}

function element(doc, tag, className = '', text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
