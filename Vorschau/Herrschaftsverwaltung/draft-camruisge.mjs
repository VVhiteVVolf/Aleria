import { ABERLLAN_COUNTY_POST, ABERLLAN_LEAD, CAMRUISGE_SCOPE } from '../../shared/cenyr-administration/camruisge-plan.mjs';
import { localOfficeLabel, GUILD_LEASE } from '../../shared/cenyr-administration/local-authority.mjs';
import { postTitleKey } from './draft-office-titles.mjs';
import { customKey } from './draft-post-migration.mjs';

export const LEGACY_CAMRUISGE_SOURCE = 'draig';

export function migrateAberllan(houses, current) {
  const old = houses[LEGACY_CAMRUISGE_SOURCE];
  if (!old || !Array.isArray(old.posts) || !old.assignments || typeof old.assignments !== 'object') return houses;
  const from = structuredClone(old);
  const to = structuredClone(current);
  const custom = from.posts.filter(post => post?.site === ABERLLAN_COUNTY_POST);
  const oldAuthority = from.authorities?.[ABERLLAN_COUNTY_POST];
  const keys = new Map([[ABERLLAN_COUNTY_POST, ABERLLAN_LEAD]]);
  const occupied = new Set(to.posts.map(customKey));
  for (const post of custom) {
    let id = post.id;
    let suffix = 1;
    if (typeof id !== 'string') continue;
    const moved = { ...post, area: 'aberllan', site: ABERLLAN_LEAD };
    while (occupied.has(customKey({ ...moved, id }))) id = `${post.id.slice(0, 56)}-alt-${suffix++}`;
    moved.id = id;
    occupied.add(customKey(moved));
    keys.set(customKey(post), customKey(moved));
    to.posts.push(moved);
  }
  from.posts = from.posts.filter(post => !custom.includes(post) || !keys.has(customKey(post)));
  for (const [previous, next] of keys) {
    for (const field of ['assignments', 'previousOccupants']) {
      if (!from[field] || !Object.hasOwn(from[field], previous)) continue;
      const person = from[field][previous];
      to[field][next] = person;
      if (person && from.assignmentNames?.[person]) to.assignmentNames[person] = from.assignmentNames[person];
      if (person && typeof person === 'string' && !to.applicants.includes(person)) to.applicants.push(person);
      delete from[field][previous];
    }
    const titleKey = postTitleKey(previous);
    if (from.titles && Object.hasOwn(from.titles, titleKey)) {
      to.titles[postTitleKey(next)] = from.titles[titleKey];
      delete from.titles[titleKey];
    }
  }
  if (oldAuthority?.role) {
    const title = oldAuthority.role === GUILD_LEASE
      ? oldAuthority.title : `${localOfficeLabel(oldAuthority.role).split(' / ', 1)[0]} von Aberllan`;
    if (title) to.titles[postTitleKey(ABERLLAN_LEAD)] ??= title;
    delete from.authorities[ABERLLAN_COUNTY_POST];
  }
  return { ...houses, [LEGACY_CAMRUISGE_SOURCE]: from, [CAMRUISGE_SCOPE]: to };
}
