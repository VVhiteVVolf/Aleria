import { postTitleKey } from './draft-office-titles.mjs';

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const isSingleLine = (value, max) => typeof value === 'string' && value.trim() && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value);
export const isPersonReference = value => Boolean(isSingleLine(value, 250) && value === value.trim());

export function readAssignmentNames(input = {}) {
  if (!isObject(input) || Object.entries(input).some(([id, name]) => !isPersonReference(id) || !isSingleLine(name, 180))) {
    throw new Error('Ungültige Angaben zu früheren Amtsinhabern.');
  }
  return input;
}

export function readPreviousOccupants(input = {}, assignments, posts) {
  if (!isObject(input) || Object.entries(input).some(([key, id]) => !posts.get(key)?.previousKey
    || !Object.hasOwn(assignments, key) || id === assignments[key] || (id !== null && !isPersonReference(id)))) {
    throw new Error('Ungültige frühere Besetzung eines zusammengeführten Postens.');
  }
  return input;
}

export function migrateSharedAssignments(input, aliases) {
  if (!aliases.size) return input;
  const assignments = { ...input.assignments };
  const titles = isObject(input.titles) ? { ...input.titles } : input.titles;
  const previous = isObject(input.previousOccupants) ? { ...input.previousOccupants } : input.previousOccupants;
  let previousOccupants = previous;
  for (const [from, into] of aliases) {
    if (Object.hasOwn(assignments, from)) {
      if (!Object.hasOwn(assignments, into)) assignments[into] = assignments[from];
      else if (assignments[into] !== assignments[from] && (previous === undefined || isObject(previous))) {
        previousOccupants ||= {};
        previousOccupants[into] = assignments[from];
      }
      delete assignments[from];
    }
    const oldTitle = postTitleKey(from);
    const title = postTitleKey(into);
    if (titles && Object.hasOwn(titles, oldTitle)) {
      if (!Object.hasOwn(titles, title)) titles[title] = titles[oldTitle];
      delete titles[oldTitle];
    }
  }
  const posts = input.posts.map(post => aliases.has(post?.site) ? { ...post, site: aliases.get(post.site) } : post);
  return { ...input, assignments, titles, previousOccupants, posts };
}

function identityLabel(id) {
  const part = id.startsWith('person--') ? id.split('--').at(-1) : '';
  return part && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/iu.test(part)
    ? part.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
    : id;
}

export function rememberedPerson(id, people, names) {
  return people.get(id)?.name || (Object.hasOwn(names, id) ? names[id] : identityLabel(id));
}

export function serializeAssignmentNames(source, people) {
  const ids = new Set([...Object.values(source.assignments), ...Object.values(source.previousOccupants)].filter(Boolean));
  return Object.fromEntries([...ids].flatMap(id => {
    const name = people.get(id)?.name || (Object.hasOwn(source.assignmentNames, id) && source.assignmentNames[id]);
    return isSingleLine(name, 180) ? [[id, name]] : [];
  }));
}

export const needsFilling = post => !post.occupant || post.needsReplacement;
export const postOccupant = (post, people) => post?.occupant
  ? people.get(post.occupant) || { id: post.occupant, name: post.occupantName || identityLabel(post.occupant) }
  : undefined;
