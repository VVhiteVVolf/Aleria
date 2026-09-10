import { escapeClassHtml as escape } from '../pages/class-page-content.js';

const REQUIRED_TEXT_FIELDS = Object.freeze([
  'title',
  'introduction',
  'nobleTitle',
  'castesTitle',
  'castesIntroduction',
  'foundationTitle',
  'foundation',
  'selfImageTitle',
  'selfImage',
  'quote',
  'quoteAttribution'
]);

function assertText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Kulturordnung: ${label} fehlt`);
}

export function validateCultureOrderOverview(overview) {
  if (!overview) return null;
  REQUIRED_TEXT_FIELDS.forEach(field => assertText(overview[field], field));
  if (!Array.isArray(overview.nobleRanks) || overview.nobleRanks.length < 2) {
    throw new Error('Kulturordnung: Adelsränge fehlen');
  }
  if (!Array.isArray(overview.castes) || overview.castes.length < 1) {
    throw new Error('Kulturordnung: Kriegerkasten fehlen');
  }
  if (!Array.isArray(overview.hierarchy) || overview.hierarchy.length !== overview.nobleRanks.length) {
    throw new Error('Kulturordnung: Rangfolge ist unvollständig');
  }
  for (const rank of overview.nobleRanks) {
    ['title', 'subtitle', 'scope', 'description'].forEach(field => assertText(rank[field], `Adelsrang ${field}`));
  }
  const casteIds = new Set();
  for (const caste of overview.castes) {
    ['id', 'name', 'designation', 'function'].forEach(field => assertText(caste[field], `Kaste ${field}`));
    if (!/^[a-z][a-z-]+$/.test(caste.id) || casteIds.has(caste.id)) {
      throw new Error(`Kulturordnung: ungültige oder doppelte Kasten-ID ${caste.id}`);
    }
    casteIds.add(caste.id);
  }
  return overview;
}

export function getCultureOrderContentsEntry(culture) {
  const overview = validateCultureOrderOverview(culture.orderOverview);
  return overview ? { id: 'gesellschaftsordnung', title: overview.navigationTitle || 'Gesellschaftsordnung' } : null;
}

export function renderCultureOrderOverview(culture, { currentClassId = '', classHref = () => '#' } = {}) {
  const overview = validateCultureOrderOverview(culture.orderOverview);
  if (!overview) return '';
  const ranks = overview.nobleRanks.map((rank, index) => `<li>
    <span class="culture-rank-index">${String(index + 1).padStart(2, '0')}</span>
    <div><p>${escape(rank.scope)}</p><h3>${escape(rank.title)}</h3><strong>${escape(rank.subtitle)}</strong><span>${escape(rank.description)}</span></div>
  </li>`).join('');
  const castes = overview.castes.map(caste => `<a class="culture-caste-card" href="${escape(classHref(caste.id))}"${caste.id === currentClassId ? ' aria-current="page"' : ''}>
    <span>${escape(caste.name)}</span><strong>${escape(caste.designation)}</strong><p>${escape(caste.function)}</p>
  </a>`).join('');
  return `<section class="culture-order-overview" id="gesellschaftsordnung" aria-labelledby="heading-gesellschaftsordnung" data-culture-order>
    <header><p class="eyebrow">${escape(overview.eyebrow || 'Adel, Kriegerkasten & gesellschaftliche Ordnung')}</p><h2 id="heading-gesellschaftsordnung">${escape(overview.title)}</h2><p>${escape(overview.introduction)}</p></header>
    <div class="culture-order-columns">
      <section class="culture-noble-order"><h3>${escape(overview.nobleTitle)}</h3><ol>${ranks}</ol><p class="culture-rank-chain" aria-label="Rangfolge">${overview.hierarchy.map(rank => `<span>${escape(rank)}</span>`).join('<b aria-hidden="true">↓</b>')}</p></section>
      <section class="culture-caste-order"><h3>${escape(overview.castesTitle)}</h3><p>${escape(overview.castesIntroduction)}</p><div>${castes}</div></section>
    </div>
    <div class="culture-order-foundation"><article><h3>${escape(overview.foundationTitle)}</h3><p>${escape(overview.foundation)}</p></article><article><h3>${escape(overview.selfImageTitle)}</h3><p>${escape(overview.selfImage)}</p></article></div>
    <blockquote><p>„${escape(overview.quote)}“</p><cite>${escape(overview.quoteAttribution)}</cite></blockquote>
  </section>`;
}
