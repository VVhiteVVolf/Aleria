import { layoutPlaceRosters } from '../place-roster/place-roster-layout.mjs';
export function layoutHouseholds(groups, options) {
  return layoutPlaceRosters(groups, { ...options, memberCount: group => group.families.length, extraWidth: group => group.region ? 64 : 0 });
}
