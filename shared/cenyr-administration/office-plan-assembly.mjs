import { officeIcon, subofficeIcon } from './office-icons.mjs';
import { officeRoleTemplates, repeatableKind } from './office-roles.mjs';

export function prepareOfficePlan(house, area, definition, appointments) {
  function prepareSlot(slot, icon, placement = '') {
    const key = slot.key || `${area}/${slot.id}`;
    const assigned = appointments.get(key);
    const holder = assigned?.holder || slot.holder || null;
    appointments.delete(key);
    const kind = slot.kind || repeatableKind(area, slot.id);
    const image = slot.icon ? officeIcon(slot.icon) : subofficeIcon(area, slot.id, icon);
    const title = key === 'hof/kueche' && house.id === 'wyrm' ? 'Küchenmeisterin' : slot.title;
    return {
      ...slot, title, image, key, holder,
      ...(assigned?.note ? { note: assigned.note } : {}),
      ...(assigned?.site ? { site: assigned.site } : {}),
      ...(assigned?.title ? { title: assigned.title } : {}),
      ...(kind ? { area, kind, placement, templateId: slot.templateId || `r-${slot.id}`, removable: true } : {}),
    };
  }

  function prepareSection(group) {
    return {
      ...group, icon: officeIcon(group.icon),
      slots: group.slots.map(slot => prepareSlot(slot, group.icon, group.repeatableHere || group.staff ? group.id : '')),
    };
  }

  const leadership = definition.leadership ? prepareSection(definition.leadership) : null;
  const head = definition.head ? { ...definition.head, key: definition.head.key || `${area}/leitung`, holder: definition.head.holder || null } : null;
  const lower = (definition.lower || []).map(slot => prepareSlot(slot, 'coordination'));
  const sections = definition.sections.map(prepareSection).map(group => ({
    ...group, slots: group.slots.filter(slot => {
      if (!slot.kind || slot.placement) return true;
      lower.push(slot);
      return false;
    }),
  })).filter(group => group.slots.length || group.repeatableHere || group.staff);
  const slots = [...(leadership?.slots || []), ...(head ? [head] : []), ...sections.flatMap(group => group.slots), ...lower];
  const templates = officeRoleTemplates(area, slots, definition.suggestions);
  const localities = slots.filter(slot => slot.place && !slot.kind).map(slot => ({
    key: slot.key, name: slot.place, title: slot.title, ...(slot.sitePlacements ? { placements: slot.sitePlacements } : {}),
  }));
  localities.push(...(definition.sites || []));
  const byPlace = new Map(localities.map(place => [place.key, place]));
  for (const slot of slots) {
    if (slot.site) slot.locality = byPlace.get(slot.site);
  }
  return { leadership, head, sections, slots, templates, localities, retired: definition.retired || {}, references: definition.references || [] };
}
