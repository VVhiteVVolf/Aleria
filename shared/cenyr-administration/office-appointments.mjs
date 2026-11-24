import { LEHENSWARTE_AREA } from './office-icons.mjs';

function officeRoute(area, plan) {
  return plan.department ? { area: 'hof', department: area } : { area };
}

export function locateOfficePosts(plans) {
  const locations = new Map();
  for (const [area, plan] of Object.entries(plans)) {
    const route = officeRoute(area, plan);
    for (const post of plan.slots) {
      // A Hofamt can appear in the overview and as the head of its own hierarchy.
      const previous = locations.get(post.key);
      if (plan.department || !previous) locations.set(post.key, { post, ...route });
      else if (previous.area !== route.area) locations.set(post.key, { ...previous, alternateArea: route.area });
    }
  }
  return locations;
}

export function officePostRoute(scope, post) {
  return scope.locations.get(post.key) ?? officeRoute(post.area, scope.plans[post.area]);
}

export function indexAppointments(scopes, postsFor = scope => Array.from(scope.locations.values(), ({ post }) => post)) {
  const appointments = new Map();
  for (const scope of scopes) {
    const { id, name } = scope;
    for (const post of postsFor(scope)) {
      const occupant = Object.hasOwn(post, 'occupant') ? post.occupant : post.holder;
      if (!occupant || post.needsReplacement) continue;
      const { area, department } = officePostRoute(scope, post);
      if (!appointments.has(occupant)) appointments.set(occupant, []);
      appointments.get(occupant).push({ scopeId: id, scopeName: name, area, department, post });
    }
  }
  return appointments;
}

export function preparationHref(scopeId, area, department, postKey) {
  const params = new URLSearchParams({ haus: scopeId, amt: area });
  if (department) params.set('abteilung', department);
  if (postKey) params.set('posten', postKey);
  return `/Vorschau/Herrschaftsverwaltung/index.html?${params}`;
}

export function otherAppointmentLinks(appointments, scopeId, postKey, titleFor) {
  return appointments.filter(entry => entry.scopeId !== scopeId || entry.post.key !== postKey)
    .map(({ scopeId: id, scopeName, area, department, post }) => {
      const title = titleFor(post);
      const place = post.locality?.name;
      const label = [title, place && !title.includes(place) ? place : '',
        area === LEHENSWARTE_AREA.id ? LEHENSWARTE_AREA.name : '', area === 'hof' || id !== scopeId ? scopeName : '']
        .filter(Boolean).join(' · ');
      return { label, href: preparationHref(id, area, department, post.key) };
    });
}
