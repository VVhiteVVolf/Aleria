export const PREDATOR_GROUPS = [
  { id: 'raubkatzen', title: 'Raubkatzen', profileIds: [] },
  { id: 'woelfe', title: 'Wölfe & Warge', profileIds: ['gramnir', 'faerog', 'brychgi', 'lughar', 'ulfr', 'ruadhr', 'rhewddann'] },
  { id: 'baeren', title: 'Bären', profileIds: ['brannoc', 'arth', 'draugrbjorn', 'dubharr', 'gramh', 'broan', 'muine', 'banmor-isbjorn'] }
];

export const PREDATOR_PROFILE_IDS = PREDATOR_GROUPS.flatMap(group => group.profileIds);

export function predatorGroupFor(profileId) {
  return PREDATOR_GROUPS.find(group => group.profileIds.includes(profileId)) || null;
}
