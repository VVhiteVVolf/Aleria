export const PREDATOR_GROUPS = [
  { id: 'raubkatzen', title: 'Raubkatzen', profileIds: [] },
  { id: 'woelfe', title: 'Wölfe & Warge', profileIds: ['gramnir', 'faerog', 'brychgi', 'lughar', 'ulfr', 'ruadhr', 'rhewddann'] },
  { id: 'baeren', title: 'Bären', profileIds: ['brannoc', 'arth', 'draugrbjorn', 'dubharr', 'gramh', 'broan', 'muine', 'banmor-isbjorn', 'madruach'] }
];

export const PREDATOR_SUBGROUPS = [
  { id: 'urgren', parentId: 'baeren', directory: 'baeren/urgren', profileIds: ['madruach'], navigation: {
    rootHref: '../../../../', parentHref: '../index.html', parentLabel: 'Bärenkunde',
    ancestors: [{ title: 'Raubtiere', href: '../../index.html' }, { title: 'Bären', href: '../index.html' }]
  } }
];

export const PREDATOR_PROFILE_IDS = PREDATOR_GROUPS.flatMap(group => group.profileIds);

export function predatorGroupFor(profileId) {
  return PREDATOR_GROUPS.find(group => group.profileIds.includes(profileId)) || null;
}
