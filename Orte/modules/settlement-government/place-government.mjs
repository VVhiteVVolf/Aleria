import { escapeHtml as e } from '../../../Vorschau/shared/country-workbench/render.mjs';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';
import { settlementDefinition, settlementJurisdiction } from '../../../shared/cenyr-administration/settlement-government.mjs';
import { officeIcon } from '../../../shared/cenyr-administration/office-icons.mjs';
import { preparationHref } from '../../../shared/cenyr-administration/office-appointments.mjs';
import { LEHENSWARTE_ID } from '../../../shared/cenyr-administration/lehenswarte-plan.mjs';

const row = document.querySelector('[data-orte-government-row]');
const section = row?.querySelector('[data-orte-government]');
const types = ['Bauernsiedlung', 'Handelssiedlung', 'Bergbausiedlung', 'Fischersiedlung', 'Hafensiedlung', 'Waldsiedlung',
  'Dorf', 'Kleinstadt', 'Stadt', 'Turm', 'Burg', 'Festung', 'Garnison', 'Kirchensiedlung', 'Klostersiedlung', 'Priorei', 'Abtei', 'Pachtsiedlung'];
const portraitFallback = '/Stammbäume/assets/images/placeholders/unknown.png';
const hierarchyLabels = { church: 'Kirche', guild: 'Gilde', place: 'Ort' };

function placeScope(entry, houses) {
  const placeName = geographicKey(entry.name);
  const matches = houses.filter(house => house.places.some(place => geographicKey(place.name) === placeName));
  for (const item of [...entry.hierarchy].reverse()) {
    const key = geographicKey(item.slug);
    const scope = matches.find(house => [house.houseId, house.territoryId, house.id].some(id => geographicKey(id) === key));
    if (scope) return scope;
  }
  return matches.length === 1 ? matches[0] : null;
}

function card(slot, person, owner) {
  const icon = slot.image || officeIcon(slot.icon || 'coordination');
  const identity = person?.name || 'Besetzung offen';
  return '<li class="place-government-card">' +
    '<img class="place-government-icon" src="' + e(icon) + '" alt="" width="31" height="31" loading="lazy">' +
    '<div><strong>' + e(slot.title) + '</strong><small class="place-government-owner">' + e(owner) + '</small>' +
    '<span class="place-government-person"><img src="' + e(person?.portrait || portraitFallback) +
      '" alt="" width="28" height="28" loading="lazy"' + (person?.portrait ? ' data-government-portrait' : '') + '>' + (person?.href
    ? '<a href="' + e(person.href) + '">' + e(identity) + '</a>' : '<span>' + e(identity) + '</span>') + '</span></div></li>';
}

function cards(posts, people, context) {
  return posts.map(post => card(post, people.get(post.holder), context(post))).join('');
}

function sectionTitle(level, title, iconKey = 'coordination') {
  const icon = iconKey.startsWith('/') ? iconKey : officeIcon(iconKey);
  return `<${level} class="place-government-section-title">` +
    `<img src="${e(icon)}" alt="" width="26" height="26" loading="lazy">${e(title)}</${level}>`;
}

function render(data, definition, source, typeSelector = '') {
  const { plan, scope, people = new Map() } = source || {};
  const head = plan?.head || definition.head;
  const council = plan?.sections.find(group => group.id === 'ortsrat');
  const government = plan?.sections.filter(group => group.id.startsWith('ortsregierung-')) || definition.government;
  const crest = data?.images?.['icon-png']?.src || scope?.crest;
  const officeContext = post => hierarchyLabels[settlementJurisdiction(definition.kind, post)] + ' · ' + definition.place;
  const href = scope && preparationHref(scope.id, LEHENSWARTE_ID, definition.id);
  section.innerHTML = '<header class="place-government-heading">' +
    (crest ? '<img class="place-government-crest" src="' + e(crest) + '" alt="" width="48" height="48" loading="lazy">' : '') +
    '<div><h2>' + e(definition.label + ' ' + definition.place) + '</h2>' +
    (scope ? '<p>Untersteht ' + e(scope.name) + '</p>' : '') + '</div>' +
    (href ? '<a class="place-government-link administration-planning-link" href="' + e(href) + '">Ortsrat in der Werkstatt ↗</a>' : '') + '</header>' + typeSelector +
    '<div class="place-government-lead">' + sectionTitle('h3', 'Ortsleitung', definition.head.icon) + '<ul>' +
    card({ icon: definition.head.icon, ...head }, people.get(head.holder), officeContext(head)) + '</ul></div>' +
    sectionTitle('h3', 'Regierende Ämter', 'command') + '<div class="place-government-areas">' + government.map(group =>
      '<section>' + sectionTitle('h4', group.title, group.icon) + '<ul>' + cards(group.slots, people, officeContext) + '</ul></section>').join('') + '</div>' +
    sectionTitle('h3', council?.title || definition.council.title, 'records') + '<ul data-government-council>' +
    cards(council?.slots || definition.council.seats, people, officeContext) + '</ul>';
  row.hidden = false;
}

async function sourceFor(entry, definition) {
  const [{ OFFICE_CAST }, { buildOfficePlans }] = await Promise.all([
    import('../../../shared/cenyr-administration/office-cast.generated.mjs'),
    import('../../../shared/cenyr-administration/office-plans.mjs'),
  ]);
  let scope = placeScope(entry, OFFICE_CAST.houses);
  let people = OFFICE_CAST.people;
  if (!scope) {
    const response = await fetch(new URL('../../../Vorschau/Herrschaftsverwaltung/kingdom.generated.json', import.meta.url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const kingdom = await response.json();
    scope = placeScope(entry, kingdom.houses);
    people = [...people, ...kingdom.people];
  }
  if (!scope) return null;
  if (geographicKey(scope.governmentSeat) === geographicKey(entry.name)) return { administrationSeat: true };
  const plan = buildOfficePlans(scope)[definition.id];
  return plan ? { scope, plan, people: new Map(people.map(person => [person.id, person])) } : null;
}

let renderVersion = 0;
let renderTemplate;
section?.addEventListener('change', event => {
  if (!event.target.matches('[data-government-type]')) return;
  renderTemplate?.(event.target.value);
  section.querySelector('[data-government-type]')?.focus();
});
async function mount(entry, data) {
  const version = ++renderVersion;
  if (!entry || !section) return;
  const template = entry.status === 'template';
  if (template) {
    renderTemplate = type => render(data, settlementDefinition({ name: 'Musterort', type }, { template: true }), null,
      '<label class="place-government-template">Siedlungstyp <select data-government-type>' + types.map(value =>
        '<option' + (value === type ? ' selected' : '') + '>' + e(value) + '</option>').join('') + '</select></label>');
    renderTemplate(types[0]);
    return;
  }
  const definition = settlementDefinition(entry);
  if (!definition || !entry.hierarchy?.some(item => item.slug === 'cenyr')) { row.hidden = true; return; }
  let source;
  try { source = await sourceFor(entry, definition); }
  catch (error) { console.warn('Belegte Ortsbesetzungen konnten nicht geladen werden.', error); }
  if (version !== renderVersion) return;
  if (source?.administrationSeat) { row.hidden = true; return; }
  render(data, definition, source);
}

if (section) {
  section.dataset.codexOwnHeadings = '';
  section.addEventListener('error', event => {
    const image = event.target;
    if (!image.hasAttribute('data-government-portrait')) return;
    image.removeAttribute('data-government-portrait');
    image.src = portraitFallback;
  }, true);
  document.addEventListener('aleria:orte:data-ready', event => mount(event.detail.entry, event.detail.data));
  if (window.ORT_DATA) mount(window.ORTE_CONFIG?.registryEntry, window.ORT_DATA);
}
