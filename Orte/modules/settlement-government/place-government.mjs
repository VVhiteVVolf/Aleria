import { escapeHtml as e } from '../../../Vorschau/shared/country-workbench/render.mjs';
import { geographicKey } from '../../../shared/world-directory/geographic-key.mjs';
import { settlementDefinition } from '../../../shared/cenyr-administration/settlement-government.mjs';
import { buildSettlementOfficePlans } from '../../../shared/cenyr-administration/settlement-plans.mjs';
import { officeIcon } from '../../../shared/cenyr-administration/office-icons.mjs';
import { preparationHref } from '../../../shared/cenyr-administration/office-appointments.mjs';
import { LEHENSWARTE_ID } from '../../../shared/cenyr-administration/lehenswarte-plan.mjs';
import { governmentCard, governmentContext, governmentSectionTitle as sectionTitle, handleGovernmentPortraitError } from './place-government-cards.mjs';
import { bindPlaceOfficeDialog } from './place-office-dialog.mjs';

const row = document.querySelector('[data-orte-government-row]');
const section = row?.querySelector('[data-orte-government]');
const types = ['Bauernsiedlung', 'Handelssiedlung', 'Bergbausiedlung', 'Fischersiedlung', 'Hafensiedlung', 'Waldsiedlung',
  'Dorf', 'Kleinstadt', 'Stadt', 'Turm', 'Burg', 'Festung', 'Garnison', 'Kirchensiedlung', 'Klostersiedlung', 'Priorei', 'Abtei', 'Pachtsiedlung'];
const updateOfficeDialog = section && bindPlaceOfficeDialog(section);

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

function render(data, definition, source, typeSelector = '') {
  const { scope, plans = buildSettlementOfficePlans({}, definition), people = new Map() } = source || {};
  const plan = plans[definition.id];
  const head = plan.head;
  const council = plan.sections.find(group => group.id === 'ortsrat');
  const government = plan.sections.filter(group => group.id.startsWith('ortsregierung-'));
  const crest = data?.images?.['icon-png']?.src || scope?.crest;
  const card = (post, destination) => governmentCard(post, people, governmentContext(definition, post), { destination });
  const href = scope && preparationHref(scope.id, LEHENSWARTE_ID, definition.id);
  const councilLink = `<button type="button" class="place-government-open" data-government-office="ortsrat"
    aria-haspopup="dialog"><strong>${e(council.title)}</strong><span aria-hidden="true">›</span></button>`;
  section.innerHTML = '<header class="place-government-heading">' +
    (crest ? '<img class="place-government-crest" src="' + e(crest) + '" alt="" width="48" height="48" loading="lazy">' : '') +
    '<div><h2>' + e(definition.label + ' ' + definition.place) + '</h2>' +
    (scope ? '<p>Untersteht ' + e(scope.name) + '</p>' : '') + '</div>' +
    (href ? '<a class="place-government-link administration-planning-link" href="' + e(href) + '">Ortsrat in der Werkstatt ↗</a>' : '') + '</header>' + typeSelector +
    '<div class="place-government-lead">' + sectionTitle('h3', 'Ortsleitung', definition.head.icon) + '<ul>' +
    card(head, head.department) + '</ul></div>' +
    sectionTitle('h3', 'Regierende Ämter', 'command') + '<div class="place-government-areas">' + government.map(group =>
      '<section>' + sectionTitle('h4', group.title, group.icon) + '<ul>' + group.slots.map(post => card(post, post.department)).join('') + '</ul></section>').join('') + '</div>' +
    `<h3 class="place-government-section-title place-government-council-title"><img src="${e(officeIcon('council'))}"
      alt="" width="26" height="26" loading="lazy">${councilLink}</h3><ul data-government-council>` +
    council.slots.map(post => card(post, 'ortsrat')).join('') + '</ul>';
  updateOfficeDialog({ definition, plan, plans, people, scope });
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
  const plans = buildOfficePlans(scope);
  return plans[definition.id] ? { scope, plans, people: new Map(people.map(person => [person.id, person])) } : null;
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
  section.addEventListener('error', handleGovernmentPortraitError, true);
  document.addEventListener('aleria:orte:data-ready', event => mount(event.detail.entry, event.detail.data));
  if (window.ORT_DATA) mount(window.ORTE_CONFIG?.registryEntry, window.ORT_DATA);
}
