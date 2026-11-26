import { normalizePersonName } from '../../js/world-identity/person-identity.js';
import { preparationHref } from '../../shared/cenyr-administration/office-appointments.mjs';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { postTitle, portrait } from './workbench-view.mjs';
import { previewAttribute } from './preview-url.mjs';

export function findOfficeHolders(query, people, state) {
  const words = normalizePersonName(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const retinues = state.retinues();
  return [...new Set([...state.appointedPeople(), ...retinues.keys()])].flatMap(id => {
    const person = people.get(id);
    const name = person && normalizePersonName(person.name);
    if (!name || !words.every(word => name.includes(word))) return [];
    return [{ person, appointments: state.appointments(id), retinue: retinues.get(id) || [] }];
  }).sort((a, b) => a.person.name.localeCompare(b.person.name, 'de'));
}

function appointmentLink(entry, person, areaNames, asRetinue = false) {
  const { scopeId, scopeName, area, department, post } = entry;
  const title = postTitle(post, person);
  const place = post.place || post.locality?.name || post.settlement;
  const context = [scopeName, areaNames.get(area), place && !title.includes(place) ? place : ''].filter(Boolean).join(' · ');
  return '<li><a href="' + previewAttribute(preparationHref(scopeId, area, department, post.key)) + '" data-action="open-appointment">' +
    '<strong>' + e(asRetinue ? person.name : title) + '</strong><small>' + e(asRetinue ? `${title} · ${scopeName}` : context) + '</small></a></li>';
}

export function bindPersonOfficeSearch(panel, { people, state, areas }) {
  const query = panel.querySelector('input[type="search"]');
  const list = panel.querySelector('[data-role="office-search-results"]');
  const count = panel.querySelector('[data-role="office-search-count"]');
  const more = panel.querySelector('[data-role="office-search-more"]');
  const areaNames = new Map(areas.map(area => [area.id, area.name]));
  let limit = 12;
  function refresh() {
    if (!panel.open) return;
    const matches = findOfficeHolders(query.value, people, state);
    count.textContent = query.value.trim()
      ? (matches.length === 1 ? '1 Figur gefunden' : matches.length + ' Figuren gefunden')
      : 'Name einer Figur eingeben';
    list.innerHTML = matches.slice(0, limit).map(({ person, appointments, retinue }) =>
      '<li class="office-search-person"><div class="office-search-identity">' + portrait(person, 34) +
      '<strong>' + e(person.name) + '</strong></div>' + (appointments.length ? '<ul aria-label="Ämter">' +
      appointments.map(entry => appointmentLink(entry, person, areaNames)).join('') + '</ul>' : '') +
      (retinue.length ? '<h4>Persönliches Gefolge</h4><ul aria-label="Persönliches Gefolge">' +
        retinue.map(entry => appointmentLink(entry, people.get(entry.personId) || { name: entry.personId }, areaNames, true)).join('') + '</ul>' : '') +
      '</li>').join('');
    more.hidden = matches.length <= limit;
  }
  query.form.addEventListener('submit', event => {
    event.preventDefault();
    list.querySelector('a')?.focus();
  });
  query.addEventListener('input', () => { limit = 12; refresh(); });
  panel.addEventListener('toggle', refresh);
  more.addEventListener('click', () => {
    const firstNew = limit;
    limit += 12;
    refresh();
    list.children[firstNew]?.querySelector('a')?.focus();
  });
  return {
    refresh,
    focus(href) {
      ([...list.querySelectorAll('a')].find(link => link.getAttribute('href') === href) || query).focus();
    },
  };
}
