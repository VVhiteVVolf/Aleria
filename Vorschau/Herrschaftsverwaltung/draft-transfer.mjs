import { customKey } from './draft-post-migration.mjs';

const mapFields = ['assignments', 'authorities', 'previousOccupants', 'serviceRecipients', 'titles'];
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);

function departmentAreas(plans, area) {
  if (!Object.hasOwn(plans, area)) throw new Error('Dieser Amtsbereich ist in der Werkstatt nicht verfügbar.');
  const result = new Set([area]);
  for (const parent of result) {
    for (const [id, plan] of Object.entries(plans)) {
      if (plan.department && (plan.parentArea || 'hof') === parent) result.add(id);
    }
  }
  return result;
}

export function draftCoverage(scopes, selection) {
  if (!selection) return new Map([...scopes.keys()].map(id => [id, null]));
  if (!isRecord(selection) || typeof selection.id !== 'string') throw new Error('Ungültiger Entwurfsbereich.');
  const { type, id, area } = selection;
  if (type === 'county') {
    const members = [...scopes.values()].filter(scope => scope.countyId === id).map(scope => [scope.id, null]);
    if (members.length) return new Map(members);
  } else if (type === 'house' && scopes.has(id)) {
    return new Map([[id, null]]);
  } else if (type === 'office' && scopes.has(id) && typeof area === 'string') {
    return new Map([[id, departmentAreas(scopes.get(id).plans, area)]]);
  }
  throw new Error('Der Entwurfsbereich ist in der Werkstatt nicht verfügbar.');
}

function contains(outer, inner) {
  return [...inner].every(([id, areas]) => outer.has(id) && (!outer.get(id)
    || (areas && [...areas].every(area => outer.get(id).has(area)))));
}

export function importCoverage(scopes, declared, requested, houses) {
  const file = draftCoverage(scopes, declared);
  const target = draftCoverage(scopes, requested);
  if (declared && (file.size !== Object.keys(houses).length || [...file.keys()].some(id => !Object.hasOwn(houses, id)))) {
    throw new Error('Die Datei enthält nicht den angegebenen Entwurfsbereich.');
  }
  if (contains(file, target)) return target;
  if (contains(target, file)) return file;
  throw new Error('Die Datei gehört zu einem anderen Entwurfsbereich.');
}

function takeEntries(object, keep) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => keep(key)));
}

function postKeys(plans, areas, extra) {
  return new Set([...areas].flatMap(area => plans[area].slots.map(slot => slot.key)).concat(extra.map(customKey)));
}

function includesField(field, key, keys, areas) {
  if (field !== 'titles') return keys.has(key);
  if (key.startsWith('posten/')) return keys.has(key.slice('posten/'.length));
  const [kind, area] = key.split('/');
  return ['amt', 'rolle'].includes(kind) && areas.has(area);
}

function assertPart(source) {
  if (!isRecord(source) || !Array.isArray(source.posts)
    || source.posts.some(post => !isRecord(post) || typeof post.area !== 'string' || typeof post.id !== 'string')
    || !Array.isArray(source.removed) || !Array.isArray(source.applicants)
    || !mapFields.every(field => isRecord(source[field])) || !isRecord(source.assignmentNames)) {
    throw new Error('Der Teilentwurf ist unvollständig oder beschädigt.');
  }
}

export function projectHouseDraft(source, areas, plans) {
  if (!areas) return source;
  assertPart(source);
  const posts = source.posts.filter(post => areas.has(post.area));
  const keys = postKeys(plans, areas, posts);
  const selected = Object.fromEntries(mapFields.map(field => [field,
    takeEntries(source[field], key => includesField(field, key, keys, areas)),
  ]));
  const people = new Set([...Object.values(selected.assignments), ...Object.values(selected.previousOccupants)]);
  return { ...selected, posts,
    removed: source.removed.filter(key => keys.has(key)),
    applicants: source.applicants.filter(id => people.has(id)),
    assignmentNames: takeEntries(source.assignmentNames, id => people.has(id)),
  };
}

export function replaceHouseDraft(current, incoming, areas, plans) {
  if (!areas) return incoming;
  const part = projectHouseDraft(incoming, areas, plans);
  const outside = current.posts.filter(post => !areas.has(post.area));
  const keys = postKeys(plans, areas, current.posts.filter(post => areas.has(post.area)));
  const maps = Object.fromEntries(mapFields.map(field => [field, {
    ...takeEntries(current[field], key => !includesField(field, key, keys, areas)), ...part[field],
  }]));
  return { ...maps, posts: [...outside, ...part.posts],
    removed: [...current.removed.filter(key => !keys.has(key)), ...part.removed],
    applicants: [...new Set([...current.applicants, ...part.applicants])],
    assignmentNames: { ...current.assignmentNames, ...part.assignmentNames },
  };
}

export function describeHouseDraft(scope, areas, positions, personName) {
  const describe = key => {
    const post = positions.get(key);
    return { key, title: post.title, occupant: post.occupant ? { id: post.occupant, name: personName(post) } : null,
      ...(post.needsReplacement ? { needsReplacement: true } : {}) };
  };
  const offices = Object.entries(scope.plans).filter(([area]) => !areas || areas.has(area)).map(([id, plan]) => {
    const sections = [plan.leadership, ...plan.sections].filter(Boolean).map(group => ({
      title: group.title, posts: group.slots.filter(slot => positions.has(slot.key)).map(slot => slot.key),
    }));
    const keys = new Set(plan.slots.filter(slot => positions.has(slot.key)).map(slot => slot.key));
    for (const post of positions.values()) if (post.custom && post.area === id) keys.add(post.key);
    return { id, ...(plan.department ? { name: plan.department.name } : {}), head: plan.head?.key,
      sections, posts: [...keys].map(describe) };
  });
  return { name: scope.name, offices };
}
