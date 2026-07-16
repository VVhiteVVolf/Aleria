export const DEFAULT_PERSON_LINEAGE_ROLE = 'branch';

export const PERSON_LINEAGE_ROLES = Object.freeze({
  branch: Object.freeze({
    id: 'branch',
    label: 'Nebenlinie / nicht markiert',
    isMainLine: false,
    isHouseHead: false
  }),
  mainline: Object.freeze({
    id: 'mainline',
    label: 'Hauptlinie',
    isMainLine: true,
    isHouseHead: false
  }),
  head: Object.freeze({
    id: 'head',
    label: 'Oberhaupt · früher oder gegenwärtig',
    isMainLine: true,
    isHouseHead: true
  })
});

export function getPersonLineageRole(roleId) {
  return PERSON_LINEAGE_ROLES[roleId] || PERSON_LINEAGE_ROLES[DEFAULT_PERSON_LINEAGE_ROLE];
}

export function isPersonLineageRole(roleId) {
  return Object.hasOwn(PERSON_LINEAGE_ROLES, roleId);
}
