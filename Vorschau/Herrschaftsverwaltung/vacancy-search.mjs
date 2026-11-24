import { normalizePersonName } from '../../js/world-identity/person-identity.js';
import { locateOfficePosts, officePostRoute, preparationHref } from '../../shared/cenyr-administration/office-appointments.mjs';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { needsFilling, postOccupant } from './draft-assignment-references.mjs';
import { officeTitleKey } from './draft-office-titles.mjs';
import { postTitle } from './workbench-view.mjs';

const PAGE_SIZE = 24;
const alphabetical = new Intl.Collator('de', { numeric: true });

export function vacancyEntries(houses, areas, state, people) {
  const names = new Map(areas.map(area => [area.id, area.name]));
  const entries = [];
  for (const house of houses) {
    const scope = { ...house, locations: locateOfficePosts(house.plans) };
    const posts = state.positions(house.id);
    for (const post of posts.values()) {
      if (!needsFilling(post)) continue;
      const { area, department, alternateArea } = officePostRoute(scope, post);
      const areaName = state.title(house.id, officeTitleKey(area), names.get(area));
      const alternateName = alternateArea && state.title(house.id, officeTitleKey(alternateArea), names.get(alternateArea));
      const plan = house.plans[department];
      const head = plan && posts.get(plan.head.key);
      const departmentName = head ? postTitle(head, postOccupant(head, people)) : '';
      const title = postTitle(post, postOccupant(post, people));
      const place = post.locality?.name || post.place || '';
      const context = [house.name, areaName, alternateName, departmentName, place].filter(Boolean).join(' · ');
      entries.push({ title, context, scope: house.id, area, review: post.needsReplacement,
        alternateArea, ...(alternateArea ? { alternateHref: preparationHref(house.id, alternateArea, undefined, post.key) } : {}),
        searchable: normalizePersonName(`${title} ${context} ${house.title}`), href: preparationHref(house.id, area, department, post.key) });
    }
  }
  entries.sort((a, b) => alphabetical.compare(a.title, b.title) || alphabetical.compare(a.context, b.context));
  const counts = new Map();
  for (const row of entries) {
    const key = `${row.title}\n${row.context}`;
    row.ordinal = (counts.get(key) || 0) + 1;
    counts.set(key, row.ordinal);
  }
  for (const row of entries) if (counts.get(`${row.title}\n${row.context}`) === 1) delete row.ordinal;
  return entries;
}

export function filterVacancies(entries, query, house, area) {
  const words = normalizePersonName(query).split(' ').filter(Boolean);
  return entries.filter(row => (!house || row.scope === house) && (!area || row.area === area || row.alternateArea === area)
    && words.every(word => row.searchable.includes(word)))
    .map(row => area && row.alternateArea === area ? { ...row, href: row.alternateHref } : row);
}

export function bindVacancyFinder(panel, { houses, areas, state, people }) {
  const form = panel.querySelector('form');
  const { query, scope, area } = form.elements;
  const results = panel.querySelector('[data-role="vacancy-results"]');
  const count = panel.querySelector('[data-role="vacancy-count"]');
  const more = panel.querySelector('[data-role="vacancy-more"]');
  const addOptions = (select, source) => {
    for (const item of source) select.add(new Option(item.name, item.id));
  };
  addOptions(scope, houses);
  addOptions(area, areas);
  let entries;
  let limit = PAGE_SIZE;

  function show() {
    if (!panel.open) return;
    entries ??= vacancyEntries(houses, areas, state, people);
    const hits = filterVacancies(entries, query.value, scope.value, area.value);
    count.textContent = hits.length ? `${hits.length} offene Stellen` : 'Keine offenen Stellen passen zur Suche.';
    results.innerHTML = hits.slice(0, limit).map(row => `<li><a href="${e(row.href)}" data-action="open-appointment">
      <strong>${e(row.title)}${row.ordinal ? ` · Posten ${row.ordinal}` : ''}</strong>
      <span>${e(row.context)}${row.review ? ' · Nachbesetzung nötig' : ''}</span>
    </a></li>`).join('');
    more.hidden = hits.length <= limit;
  }

  form.addEventListener('input', () => { limit = PAGE_SIZE; show(); });
  form.addEventListener('submit', event => { event.preventDefault(); results.querySelector('a')?.focus(); });
  panel.addEventListener('toggle', show);
  more.addEventListener('click', () => {
    const start = limit;
    limit += PAGE_SIZE;
    show();
    results.children[start]?.querySelector('a').focus();
  });
  return {
    refresh() { entries = undefined; show(); },
    focus(href) {
      const link = [...results.querySelectorAll('a')].find(item => item.getAttribute('href') === href);
      (link || query).focus();
    },
  };
}
