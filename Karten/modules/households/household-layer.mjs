import { createPlaceRosterLayer } from '../place-roster/place-roster-layer.mjs';
import { familyCrest, createFamilyList, createRegionDirectory } from './household-family-list.mjs';

export function createHouseholdLayer(map, runtime) {
  const layer = createPlaceRosterLayer(map, runtime, {
    namespace: 'household', popupLabel: 'Familien am Ort',
    countLabel: count => count + (count === 1 ? ' Familie am Ort' : ' Familien am Ort'),
    groupLabel: group => `${group.pin.title}: ${group.members.map(family => family.name).join(', ')}${group.region ? `; ${group.region.count} weitere Häuser in ${group.region.name}` : ''}`,
    renderPortrait: familyCrest, renderList: createFamilyList,
    renderExtra: group => group.region ? createRegionDirectory(group.region) : null,
    extraWidth: group => group.region ? 64 : 0,
    badge: group => group.region ? 'Region +' + group.region.count : ''
  });
  return { ...layer, render(groups) { layer.render(groups.map(group => ({ ...group, members: group.families }))); } };
}
