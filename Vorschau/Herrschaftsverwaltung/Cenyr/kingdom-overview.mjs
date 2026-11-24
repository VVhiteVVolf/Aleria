import { escapeHtml as e } from '../../shared/country-workbench/render.mjs';
import { normalizePersonName } from '../../../js/world-identity/person-identity.js';
import { rankOf } from '../../../shared/cenyr-administration/scopes.mjs';
import { ABERLLAN_PREVIEW, administrationHref } from '../territorial-navigation.mjs';

const contains = (terms, values) => {
  const searchable = normalizePersonName(values.filter(Boolean).join(' '));
  return terms.every(term => searchable.includes(term));
};

function territoryRow(county, scope) {
  return `<li>
    <a class="county-territory" href="${e(administrationHref(county.id, scope.id))}">
      <img src="${e(scope.crest)}" width="32" height="35" alt="" loading="lazy">
      <span><strong>${e(scope.title)}</strong><small>${e(rankOf(scope).label)} · ${e(scope.name)}</small></span>
      <span aria-hidden="true">↗</span>
    </a>
    ${scope.rank === 'diarchy' ? `<a class="county-place-link" href="${ABERLLAN_PREVIEW}">Ortsvorbereitung Aberllan ↗</a>` : ''}
  </li>`;
}

function countyCard(county, list, searching) {
  const [head, ...subordinates] = county.scopes;
  const visible = list.filter(scope => scope !== head);
  const count = subordinates.length;
  const action = count === 1 ? '1 Herrschaft ansehen' : `${count} Herrschaften ansehen`;
  return `<article class="county-card" data-county="${e(county.id)}">
    <header>
      <img src="${e(county.crest)}" width="60" height="68" alt="" loading="lazy">
      <div><h3>${e(county.name)}</h3><p>${e(head.name)} · ${e(county.seat)}</p></div>
    </header>
    ${county.demesne ? `<p class="county-demesne">Direkte Domäne · ${e(county.demesne.replace(/^Gräfische Baronie /u, ''))}</p>` : ''}
    <a class="county-workbench" href="${e(administrationHref(county.id, head.id))}" aria-label="${e(`Grafschaft ${county.name} bearbeiten`)}">Grafschaft bearbeiten <span aria-hidden="true">↗</span></a>
    ${visible.length ? `<details class="county-list"${searching ? ' open' : ''}>
      <summary>${e(searching ? `${visible.length} passende Herrschaften` : action)}</summary>
      <ul>${visible.map(scope => territoryRow(county, scope)).join('')}</ul>
    </details>` : ''}
  </article>`;
}

function init(root, { kingdom, counties }) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  const search = role('county-search');
  const status = role('county-status');
  const grid = role('county-grid');
  const [crown] = kingdom.scopes;
  role('kingdom-record').href = kingdom.href;
  role('crown-holder').textContent = crown.ruler ? `König ${crown.ruler} · ${crown.name}` : crown.name;
  const counts = counties.flatMap(county => county.scopes).reduce((counts, scope) => {
    counts[scope.rank] = (counts[scope.rank] || 0) + 1;
    return counts;
  }, {});
  role('kingdom-totals').textContent = [
    `${counties.length} Grafschaften`, `${counts.barony} Baronien`, `${counts.prince} Ritterfürstentümer`, `${counts.diarchy} Dyarchie`,
  ].join(' · ');
  function render() {
    const terms = normalizePersonName(search.value).split(' ').filter(Boolean);
    const results = counties.map(county => {
      const context = [county.name, county.candidateRegion, county.seat, county.demesne];
      const list = contains(terms, context) ? county.scopes
        : county.scopes.filter(scope => contains(terms, [...context, scope.name, scope.title, scope.ruler, rankOf(scope).label]));
      return { county, list };
    }).filter(({ list }) => list.length);
    grid.innerHTML = results.map(({ county, list }) => countyCard(county, list, terms.length > 0)).join('');
    status.textContent = !terms.length ? '' : results.length ? `${results.length} ${results.length === 1 ? 'Grafschaft' : 'Grafschaften'}`
      : 'Keine Grafschaft oder Herrschaft passt zur Suche.';
  }
  search.disabled = false;
  search.addEventListener('input', render);
  render();
}

const root = document.querySelector('[data-kingdom-overview]');
try {
  const response = await fetch(new URL('../kingdom.generated.json', import.meta.url));
  if (!response.ok) throw new Error('Die Grafschaftsdaten konnten nicht geladen werden.');
  init(root, await response.json());
} catch (error) {
  root.querySelector('[data-role="county-status"]').textContent = 'Die Grafschaftsdaten konnten nicht geladen werden.';
  console.error(error);
}
