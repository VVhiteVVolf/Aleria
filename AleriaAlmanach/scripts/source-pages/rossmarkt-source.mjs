import assert from 'node:assert/strict';
import { text, attr } from './source-page-text.mjs';

// Both the goods register and character archive consume these authoritative rows.
export function extractRossmarktEntries(horseHtml) {
  const horses = [];
  for (const match of horseHtml.matchAll(/<tr\b[^>]*class="horse-row"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const html = match[0];
    const image = html.match(/<img\b[^>]*class="horse-img"[^>]*>/)?.[0] || '';
    const section = attr(html, 'data-section');
    horses.push({
      id: attr(html, 'data-name'), name: attr(image, 'alt'), section,
      type: ({ roesser: 'Pferderasse', ponys: 'Ponyrasse', uebrige: 'Weiteres Reittier' })[section] || section,
      region: attr(html, 'data-region'),
      origin: text(html.match(/class="origin-val">([\s\S]*?)<\/div>/)?.[1]),
      description: text(html.match(/class="horse-desc">([\s\S]*?)<\/span>/)?.[1]),
      image: attr(image, 'src'),
      price: text(html.match(/class="price-text">([\s\S]*?)<\/div>/)?.[1]),
      currency: text(html.match(/class="price-currency">([\s\S]*?)<\/div>/)?.[1]),
      uses: [...html.matchAll(/class="use-tag\b[^"]*">([\s\S]*?)<\/span>/g)].map(item => text(item[1])),
      sourcePage: 'Markt/Rossmarkt/Rossmarkt.html'
    });
  }
  assert(horses.length >= 30 && horses.every(entry => entry.id && entry.name && entry.description && entry.origin), 'Rossmarkt-Zeilen sind unvollständig');
  assert.equal(new Set(horses.map(entry => entry.id)).size, horses.length, 'Doppelte Rossmarkt-ID');
  assert.equal(horses.find(entry => entry.id === 'rhyfel')?.section, 'roesser');
  return horses;
}

// The Bestiarium breeding book consumes the five authored matrix names without
// depending on the Rossmarkt page DOM at runtime.
export function extractRossmarktBreedingCrossings(horseHtml) {
  const crossings = [];
  for (const match of horseHtml.matchAll(/<td\b[^>]*class="[^"]*\bzb-cell\b[^"]*"[^>]*>/g)) {
    const html = match[0];
    const name = attr(html, 'data-default').trim();
    if (!name) continue;
    crossings.push({
      mare: attr(html, 'data-mare'),
      sire: attr(html, 'data-stallion'),
      name,
      source: 'Rossmarkt-Kreuzungsmatrix'
    });
  }
  assert.equal(crossings.length, 5, 'Die benannten Rossmarkt-Kreuzungen sind unvollständig');
  assert.equal(new Set(crossings.map(entry => `${entry.mare}|${entry.sire}`)).size, crossings.length, 'Doppelte Rossmarkt-Kreuzung');
  return crossings;
}
