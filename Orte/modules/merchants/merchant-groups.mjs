const categories = Object.freeze([
  ['handel', 'Handel, Kontore & Lagerhäuser'],
  ['handwerk', 'Läden & Handwerk'],
  ['gastwirtschaft', 'Tavernen, Schänken & Gasthäuser'],
  ['freudenhaus', 'Freudenhäuser & Gesellschaft'],
  ['badehaus', 'Badehäuser & Bader'],
  ['kultur', 'Theater & Kultur'],
  ['landwirtschaft', 'Höfe & Landwirtschaft'],
  ['tierzucht', 'Gestüte & Tierzucht'],
  ['sonstige', 'Weitere Gewerbe & Orte'],
]);
const knownCategories = new Set(categories.map(([key]) => key));
const names = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

// The source records own their primary trade category. Mixed businesses keep
// their full trade text; classification never rewrites or guesses that content.
export function groupMerchants(merchants) {
  const groups = new Map();
  for (const merchant of merchants) {
    const key = knownCategories.has(merchant.category) ? merchant.category : 'sonstige';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(merchant);
  }
  return categories.filter(([key]) => groups.has(key)).map(([key, title]) => ({
    key, title,
    merchants: groups.get(key).sort((a, b) => names.compare(String(a.name || ''), String(b.name || ''))),
  }));
}
