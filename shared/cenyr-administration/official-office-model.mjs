import { geographicKey } from '../world-directory/geographic-key.mjs';
import { OFFICE_CAST } from './office-cast.generated.mjs';
import { buildCourtPlans, buildOfficePlans } from './office-plans.mjs';
import { LOWER_ROLE_KINDS, ROLE_KINDS } from './office-roles.mjs';
import { scopeForHouse, scopeForTerritory } from './scopes.mjs';
import { indexCourtEntries } from './court-plan.mjs';

const households = new Map(OFFICE_CAST.houses.map(house => [house.id, house]));
const people = new Map(OFFICE_CAST.people.map(person => [person.id, person]));

export function preparationHref(scopeId, area, department) {
  const params = new URLSearchParams({ haus: scopeId, amt: area });
  if (department) params.set('abteilung', department);
  return `/Vorschau/Herrschaftsverwaltung/index.html?${params}`;
}

export function officialRole(slot, source = {}, cast = true) {
  const person = people.get(slot.holder);
  const station = slot.locality?.type === 'station' ? slot.locality.name : '';
  const links = [...(source.links || [])];
  for (const href of [person?.href, person?.almanacHref].filter(Boolean)) {
    const label = href.includes('AleriaAlmanach.html?entry=') ? 'Almanachmodul öffnen'
      : href.includes('AleriaAlmanach.html?character=') ? 'Almanachfigur öffnen' : 'Person im Stammbaum';
    links.push({ label, href });
  }
  return {
    ...source, id: source.id || slot.id || slot.key.replace('/', '-'), title: slot.title,
    name: person?.name || (!cast ? source.name : '') || '',
    portrait: person?.portrait || (person || !cast ? source.portrait : '') || '',
    description: [source.description || slot.description, slot.note].flat().filter(Boolean),
    note: slot.note,
    reportsTo: (station ? '' : slot.locality?.title) || source.reportsTo || slot.reportsTo,
    ...(station ? { station } : {}),
    links: [...new Map(links.map(link => [link.href, link])).values()],
  };
}

export function officialGroups(plan, originalGroups = [], roleFor = officialRole) {
  const originals = new Map(originalGroups.map(group => [group.id, group]));
  const roles = new Map(originalGroups.flatMap(group => group.roles).map(role => [role.id, role]));
  const mapped = plan.sections.filter(section => section.slots.length).map((section, index) => ({
    id: section.id || geographicKey(section.title) || `section-${index + 1}`,
    title: section.title, description: section.description, icon: section.icon,
    kind: section.core ? 'core' : originals.get(section.id)?.kind || (/Adjutant|Kanzlei/u.test(section.title) ? 'adjutant' : 'service'),
    roles: section.slots.map(slot => roleFor(slot, roles.get(slot.id))),
  }));
  const remaining = plan.slots.filter(slot => slot.kind && !slot.placement);
  return mapped.concat(LOWER_ROLE_KINDS.flatMap(kind => {
    const slots = remaining.filter(slot => slot.kind === kind);
    return slots.length ? [{
      id: `repeatable-${kind}`, title: ROLE_KINDS[kind].heading, kind, collapsible: true,
      roles: slots.map(slot => roleFor(slot, roles.get(slot.id))),
    }] : [];
  }));
}

export function officialCouncil(scopeId, areaId, source) {
  const scope = scopeForTerritory(scopeId);
  const house = households.get(scope?.id);
  if (!house?.offices[areaId]) return null;
  const plan = buildOfficePlans(house)[areaId];
  const [originalLead, ...originalGroups] = source?.groups || [];
  const head = officialRole(plan.head, originalLead?.roles[0]);
  head.planningHref = preparationHref(house.id, areaId);
  return { house, scope, groups: [{
    id: originalLead?.id || `${areaId}-leitung`, kind: 'leadership', title: originalLead?.title || 'Amtsleitung',
    description: originalLead?.description, roles: [head],
  }, ...officialGroups(plan, originalGroups)] };
}

export function officialCourt(houseId, entries) {
  const scope = scopeForHouse(houseId);
  const house = households.get(scope?.id);
  const authored = new Map(indexCourtEntries(entries).map(({ id, entry }) => [id, entry]));
  for (const { id, entry } of indexCourtEntries(house?.court || [])) {
    const current = authored.get(id);
    authored.set(id, current ? { ...entry, ...current } : entry);
  }
  const plans = buildCourtPlans({ id: houseId, places: [], ...house, court: [...authored.values()] });
  return { scope, house, plans };
}
