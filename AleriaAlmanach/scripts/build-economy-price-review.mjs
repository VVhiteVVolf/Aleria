import { readFile, writeFile } from 'node:fs/promises';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { readEconomyModuleSources } from '../modules/economy-calculator/economy-source-venues.mjs';
import { readVenueServices } from '../modules/economy-calculator/economy-venue-offers.mjs';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { MARKET_PRICE_REVIEW, VENUE_PRICE_REVIEW, PRICE_REVIEW_VERSION } from '../modules/economy-pricing/price-review-rules.mjs';
import { renderPriceReview } from '../modules/economy-pricing/price-review-report.mjs';
const root = new URL('../', import.meta.url), check = process.argv.includes('--check');
const baseline = JSON.parse(await readFile(new URL('modules/economy-pricing/sources/prices-before-2026-10-19.json', root), 'utf8'));
const keyOf = row => [row.moduleId || row.source, row.pageIndex ?? '', row.id, row.optionIndex ?? ''].join('::');
const before = new Map(baseline.filter(row => row.price).map(row => [keyOf(row), row]));
const rows = STANDARD_ITEMS.map(item => ({ source: item.sourceRefs?.[0]?.market || item.section, id: item.id, name: item.title,
  unit: item.hiddenMeta?.unit || '', price: item.priceRange, category: item.category }));
const scope = [];
for (const section of await readEconomyModuleSources()) for (const entry of section.entries) {
  scope.push({ id: entry.id, title: entry.title, tab: section.tab, path: section.path, ...evaluateVenueScope(entry, section) });
  for (const [pi, page] of entry.pages.entries()) {
    for (const [ii, item] of (page.tradeCatalog?.items || []).entries()) {
      if (item.status === 'planned') continue;
      const options = item.priceOptions?.length ? item.priceOptions : [{ price: item.priceMax ? `${item.priceMin} - ${item.priceMax}` : item.priceMin, unit: item.unit }];
      for (const [oi, option] of options.entries()) rows.push({ source: entry.title, moduleId: entry.id, pageIndex: pi, itemIndex: ii, id: item.id, optionIndex: oi,
        name: item.title, unit: option.unit || item.unit || '', price: parsePrice(option.price, item.currencyCode || item.currencyLabel), category: item.category, status: item.status });
    }
    for (const table of page.goodsTable?.tables || []) for (const [ri, row] of table.rows.entries()) {
      const value = row.values || row;
      if (value.name) rows.push({ source: entry.title, moduleId: entry.id, pageIndex: pi, id: `${table.id}:${ri}`, name: value.name,
        unit: value.portion || '', price: parsePrice(value.price), category: row.category });
    }
  }
  for (const service of readVenueServices(entry)) rows.push({ source: entry.title, moduleId: entry.id, id: service.id, name: service.title,
    unit: service.unit, price: service.range, category: 'Dienstleistung', unchangedService: true });
}
const knownRules = [...Object.values(MARKET_PRICE_REVIEW).flat(), ...Object.values(VENUE_PRICE_REVIEW).flat()];
const records = rows.map(row => {
  const old = before.get(keyOf(row))?.price || (row.unchangedService ? row.price : null), pair = range => range ? [range.minCopper, range.maxCopper] : null;
  const changed = old && row.price && JSON.stringify(pair(old)) !== JSON.stringify(pair(row.price));
  const animal = ['Viehmarkt', 'Rossmarkt'].includes(row.source), placeholder = /^(?:neues handelsgut|freier sortimentsplatz)/i.test(row.name);
  const rule = knownRules.find(rule => row.id === rule.id || row.id.endsWith(`:${rule.id}`));
  const decision = row.status === 'unavailable' ? 'nicht erhältlich' : !row.price || placeholder ? 'kein bepreistes Angebot' : changed ? 'angepasst' : 'beibehalten';
  const reason = changed ? rule?.reason || 'Alten Preisbeleg mit dem aktuellen Standard- oder Markenangebot abgeglichen; keine pauschale Teuerung.'
    : animal ? 'Preisspanne als bestehender Bezugspunkt erhalten. Alter, Ausbildung, Zuchtwert und Qualität unterscheiden Anschaffungen; Unterhalt ist gesondert zu tragen.'
    : row.status === 'unavailable' ? 'Bewusst nicht erhältlich; kein Absatz in der Kalkulation.'
    : !row.price || placeholder ? 'Vorlage, nicht ausgearbeiteter Sortimentsplatz oder Ausrüstung ohne Verkaufspreis; kein erfundener Nullpreis.'
    : row.source === 'Alchemist' || row.source === 'Arkanist' || row.source === 'Schwarzmarkt' ? 'Seltene Wirkung, Material, Beschaffung oder Rechtslage begründen starke Abstände. Mengen und Qualität müssen für direkte Vergleiche übereinstimmen.'
    : row.unchangedService ? 'Dienstleistung bleibt erhalten; Umfang, enthaltene Kammer, Zeit und mögliche Anrechnung werden in der Betriebskalkulation getrennt behandelt.'
    : 'Im Verhältnis zu einfachen Waren, gelernter Arbeit, Qualität und Luxusangeboten vertretbar. Nachfrage und Einkaufsverträge bleiben Modellannahmen.';
  return { ...row, before: pair(old), after: pair(row.price), decision, reason };
});
const report = { version: PRICE_REVIEW_VERSION, date: '2026-10-19', moneyUnit: 'Kupfertaler',
  method: 'Interne Konsistenzprüfung einer fiktiven Wirtschaft. Vergleichsskala: 24 KT sparsamer Vierpersonenbedarf + 3 KT freie Mittel; 27 KT Hafenlohn bei sechs Diensttagen. Keine historische Preisstatistik.',
  summary: { rows: records.length, adjusted: records.filter(row => row.decision === 'angepasst').length,
    retained: records.filter(row => row.decision === 'beibehalten').length, notOffered: records.filter(row => row.decision === 'kein bepreistes Angebot').length,
    unavailable: records.filter(row => row.decision === 'nicht erhältlich').length, eligibleVenues: scope.filter(row => row.eligible).length,
    horseAndLivestockPriceChanges: records.filter(row => ['Rossmarkt', 'Viehmarkt'].includes(row.source) && row.decision === 'angepasst').length },
  limitations: ['Breite Rasse- und Qualitätsbänder ersetzen keine konkreten Tiere oder bestätigten Verkaufspreise.',
    'Traumkorn-Dutzend und kleiner Schwarzmarktbeutel haben keine gemeinsame belegte Gewichtsmenge; daraus wird kein automatischer Preisvergleich konstruiert.',
    'Mythische Einzelartefakte sind keine regelmäßig verfügbaren Alltagswaren. Ihr hoher angesetzter Verhandlungswert belegt keine tatsächlich zahlungsfähige Nachfrage.',
    'Champagnia wird glasweise teurer je Liter als als geschlossene Flasche angeboten; der bestehende Flaschenvorteil bleibt erhalten.',
    'Immobilienwerte, Kredite, Absatz und Lohnverträge sind von dieser Preisprüfung getrennte Annahmen.'], scope, records };
for (const [name, content] of [['price-review-2026-10-19.json', JSON.stringify(report, null, 2) + '\n'], ['price-review-2026-10-19.html', renderPriceReview(report)]]) {
  const url = new URL(`docs/economy/${name}`, root);
  if (check) { if (await readFile(url, 'utf8') !== content) throw Error(`Veralteter Preisprüfbericht: ${name}`); }
  else await writeFile(url, content);
}
console.log(JSON.stringify(report.summary));
