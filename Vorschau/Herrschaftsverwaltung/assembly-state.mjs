import { MAX_ROLE_BATCH, ROLE_KINDS } from '../../shared/cenyr-administration/office-roles.mjs';
import { suitableLocalities } from '../../shared/cenyr-administration/local-offices.mjs';
import { indexAppointments, locateOfficePosts } from '../../shared/cenyr-administration/office-appointments.mjs';
import { customKey, migrateFormerPost, migrateStoredPosts } from './draft-post-migration.mjs';
import { applyPostTitles, importTitleOverrides, MAX_TITLE_LENGTH, updateTitleOverrides, validTitleKeys } from './draft-office-titles.mjs';
import { applyDraftAuthority, importAuthorityChoices, validateAuthorityChoice } from './draft-local-authority.mjs';
import { isPersonReference, migrateSharedAssignments, readAssignmentNames, readPreviousOccupants, rememberedPerson, serializeAssignmentNames } from './draft-assignment-references.mjs';

const SCHEMA = 'aleria.herrschaftsplanung';
const VERSION = 9;
const LOCAL_AUTHORITIES_VERSION = 7;
const MILITARY_VERSION = 5;
export const STORAGE_KEY = 'aleria.herrschaftsverwaltung.v1';
const emptyHouse = () => ({ posts: [], removed: [], applicants: [], assignments: {}, titles: {}, authorities: {}, previousOccupants: {}, assignmentNames: {} });
const plainObject = value => value && typeof value === 'object' && !Array.isArray(value);

function validatePost(post, plans) {
  const plan = post && Object.hasOwn(plans, post.area) ? plans[post.area] : null;
  const template = plan?.templates.find(entry => entry.id === post.templateId);
  if (!plan || !Object.hasOwn(ROLE_KINDS, post.kind)
    || (post.kind === 'staff' && !plan.sections.some(section => section.staff))
    || typeof post.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(post.id)
    || typeof post.title !== 'string' || !post.title.trim() || post.title.length > MAX_TITLE_LENGTH
    || typeof post.description !== 'string' || post.description.length > 2000
    || (post.site && !suitableLocalities(plan, template).some(place => place.key === post.site))
    || (post.templateId !== undefined && (typeof post.templateId !== 'string' || !/^[a-z0-9-]{1,120}$/.test(post.templateId)))) {
    throw new Error('Ein zusätzlicher Posten hat ungültige Angaben.');
  }
  const { id, area, kind, templateId, site } = post;
  return { id, area, kind, title: post.title.trim(), description: post.description.trim(),
    ...(templateId ? { templateId } : {}), ...(site ? { site } : {}) };
}

export function createAssemblyState(houses, free, { storage, treeCandidates = new Map(), people = new Map(), makeId = () => crypto.randomUUID() } = {}) {
  const scopes = new Map(houses.map(house => {
    const locations = locateOfficePosts(house.plans);
    return [house.id, {
      id: house.id, name: house.name, plans: house.plans,
      county: house.county,
      newScope: house.preparation,
      locations,
      aliases: new Map([...locations.values()].flatMap(({ post }) => post.previousKey ? [[post.previousKey, post.key]] : [])),
      posts: new Map([...locations].map(([key, { post }]) => [key, post])),
      direct: new Set(house.candidates.map(candidate => candidate.id)),
      templates: new Map(Object.entries(house.plans).flatMap(([area, plan]) =>
        plan.templates.map(template => [`${area}/${template.id}`, template]))),
      retired: new Map(Object.entries(house.plans).flatMap(([area, plan]) =>
        Object.entries(plan.retired).map(([id, title]) => [`${area}/${id}`, title]))),
    }];
  }));
  const freeIds = new Set(free.map(person => person.id));
  const blank = Object.fromEntries(houses.map(house => [house.id, emptyHouse()]));
  const history = [];
  let draft = blank;
  let indexedDraft;
  let appointmentIndex;
  let loadError = '';
  let persisted = Boolean(storage);

  function allPosts(scope, source) {
    const posts = new Map(scope.posts);
    for (const key of source.removed) posts.delete(key);
    for (const post of source.posts) {
      const key = customKey(post);
      const template = scope.templates.get(`${post.area}/${post.templateId}`);
      const placement = template?.placement || (post.kind === 'staff' ? scope.plans[post.area].sections.find(section => section.staff).id : '');
      const site = scope.plans[post.area].localities.find(locality => locality.key === post.site);
      const locality = site && template?.stationed ? { key: site.key, name: site.name, type: 'station' } : site;
      posts.set(key, {
        ...post, key, holder: null, custom: true, removable: true, placement, image: template?.image, reportsTo: template?.reportsTo, locality,
      });
    }
    return posts;
  }

  function positions(scopeId, source = draft[scopeId]) {
    const scope = scopes.get(scopeId);
    const posts = allPosts(scope, source);
    return new Map([...posts].map(([key, post]) => {
      const draftAssignment = Object.hasOwn(source.assignments, key);
      const occupant = draftAssignment ? source.assignments[key] : post.holder;
      const hasPrevious = Object.hasOwn(source.previousOccupants, key);
      const needsReplacement = hasPrevious || Boolean(draftAssignment && occupant && !eligible(scope, source, occupant));
      const personName = id => rememberedPerson(id, people, source.assignmentNames);
      const previous = source.previousOccupants[key];
      return [key, { ...applyPostTitles(applyDraftAuthority(post, source.authorities, posts), source.titles), occupant,
        ...(needsReplacement ? { needsReplacement, occupantName: occupant && personName(occupant) } : {}),
        ...(hasPrevious ? { previousOccupantName: previous === null ? 'Freigabe' : personName(previous) } : {}),
      }];
    }));
  }
  function appointments(personId) {
    if (indexedDraft !== draft) {
      appointmentIndex = indexAppointments(scopes.values(), ({ id }) => positions(id).values());
      indexedDraft = draft;
    }
    return appointmentIndex.get(personId) || [];
  }

  const eligible = (scope, source, id) => scope.direct.has(id) || freeIds.has(id)
    || (treeCandidates.has(id) && source.applicants.includes(id));
  const isFreeElsewhere = (personId, scopeId) => freeIds.has(personId)
    && appointments(personId).some(entry => entry.scopeId !== scopeId);

  function parse(serialized) {
    let data;
    try { data = JSON.parse(serialized); }
    catch { throw new Error('Die Datei enthält keinen lesbaren JSON-Entwurf.'); }
    if (data?.schema !== SCHEMA || !Number.isInteger(data.version) || data.version < 1 || data.version > VERSION || !plainObject(data.houses)
      || Object.keys(data.houses).some(id => !scopes.has(id))) {
      throw new Error('Die Datei gehört zu keinem unterstützten Entwurf dieser Verwaltung.');
    }
    const assignedFree = new Set();
    return Object.fromEntries([...scopes].map(([scopeId, scope]) => {
      let input = data.houses[scopeId];
      if (input === undefined && data.version === 1 && scope.county) return [scopeId, emptyHouse()];
      if (input === undefined && data.version < MILITARY_VERSION && scope.newScope) return [scopeId, emptyHouse()];
      if (!Array.isArray(input?.posts) || !plainObject(input.assignments)) throw new Error(`Ungültiger Entwurf für ${scopeId}.`);
      input = migrateSharedAssignments(input, scope.aliases);
      const older = data.version < LOCAL_AUTHORITIES_VERSION;
      const olderMilitary = data.version < MILITARY_VERSION;
      const { posts: storedPosts, moved, obsolete } = older ? migrateStoredPosts(scope, input.posts, olderMilitary)
        : { posts: input.posts, moved: new Map(), obsolete: new Set() };
      const posts = storedPosts.map(post => validatePost(post, scope.plans));
      const customKeys = new Set(posts.map(customKey));
      if (customKeys.size !== posts.length) throw new Error('Ein zusätzlicher Posten kommt doppelt vor.');
      const discarded = input.removed ?? [];
      if (!Array.isArray(discarded) || new Set(discarded).size !== discarded.length) {
        throw new Error(`Ungültige entfernte Posten in ${scopeId}.`);
      }
      const removed = discarded.filter(key => !older || !scope.retired.has(key) || scope.posts.has(key));
      if (removed.some(key => !scope.posts.get(key)?.removable)) throw new Error(`Ungültige entfernte Posten in ${scopeId}.`);
      const additions = input.applicants ?? [];
      if (!Array.isArray(additions) || new Set(additions).size !== additions.length
        || additions.some(id => !isPersonReference(id))) {
        throw new Error(`Ungültige Ergänzungen aus den Stammbäumen in ${scopeId}.`);
      }
      const applicants = additions.filter(id => !scope.direct.has(id));
      const assignments = [];
      const formerPosts = [];
      for (const [oldKey, id] of Object.entries(input.assignments)) {
        if (obsolete.has(oldKey)) continue;
        const retired = older && !scope.posts.has(oldKey) && scope.retired.has(oldKey);
        if (retired && id === null) continue;
        const key = retired ? migrateFormerPost(scope, oldKey, formerPosts, customKeys) : moved.get(oldKey) || oldKey;
        if (key) assignments.push([key, id]);
      }
      posts.push(...formerPosts.map(post => validatePost(post, scope.plans)));
      const source = { ...emptyHouse(), posts, removed, applicants, assignments: Object.fromEntries(assignments) };
      const available = allPosts(scope, source);
      source.assignmentNames = readAssignmentNames(input.assignmentNames);
      source.previousOccupants = readPreviousOccupants(input.previousOccupants, source.assignments, available);
      source.authorities = importAuthorityChoices(input.authorities, available);
      if (input.titles !== undefined) source.titles = importTitleOverrides(input.titles, validTitleKeys(scope.plans, available));
      for (const [key, id] of assignments) {
        if (older && treeCandidates.has(id) && !eligible(scope, source, id)) {
          applicants.push(id);
        }
        if (!available.has(key) || (id !== null && !isPersonReference(id))) {
          throw new Error(`Ungültige Zuordnung in ${scopeId} (${key}).`);
        }
      }
      // Older drafts knew fewer source appointments. Honor an explicit transfer
      // if the person now also has a documented starting post.
      if (older) {
        const planned = new Map(assignments.filter(([, id]) => id !== null).map(([key, id]) => [id, available.get(key)]));
        for (const [key, post] of available) {
          const dest = planned.get(post.holder);
          if (dest && !Object.hasOwn(source.assignments, key) && dest.holder !== post.holder) {
            source.assignments[key] = null;
          }
        }
      }
      const localFree = new Set([...positions(scopeId, source).values()].map(post => post.occupant).filter(id => freeIds.has(id)));
      for (const occupant of localFree) {
        if (assignedFree.has(occupant)) throw new Error('Eine freie Figur ist in mehreren Herrschaften eingeplant.');
        assignedFree.add(occupant);
      }
      return [scopeId, source];
    }));
  }

  const serialize = () => JSON.stringify({ schema: SCHEMA, version: VERSION,
    houses: Object.fromEntries(Object.entries(draft).map(([id, source]) => [id, {
      ...source, assignmentNames: serializeAssignmentNames(source, people),
    }])),
  }, null, 2);

  function save() {
    if (!storage) return;
    try { storage.setItem(STORAGE_KEY, serialize()); persisted = true; }
    catch { persisted = false; }
  }

  try {
    const stored = storage?.getItem(STORAGE_KEY);
    if (stored) draft = parse(stored);
  } catch (error) {
    loadError = error.message;
    persisted = false;
  }

  function commit(next) {
    history.push(draft);
    draft = next;
    loadError = '';
    save();
  }

  function changeHouse(scopeId, data) {
    commit({ ...draft, [scopeId]: data });
  }
  const hasDraft = scopeId => draft[scopeId].posts.length > 0 || draft[scopeId].removed.length > 0
    || draft[scopeId].applicants.length > 0 || Object.keys(draft[scopeId].assignments).length > 0
    || Object.keys(draft[scopeId].titles).length > 0 || Object.keys(draft[scopeId].authorities).length > 0;

  function addPosts(scopeId, fields, count) {
    if (!Number.isInteger(count) || count < 1 || count > MAX_ROLE_BATCH) {
      throw new Error(`Wähle pro Vorgang eine Anzahl von 1 bis ${MAX_ROLE_BATCH}.`);
    }
    const scope = scopes.get(scopeId);
    const source = draft[scopeId];
    const occupied = new Set(source.posts.map(customKey));
    const additions = Array.from({ length: count }, () => {
      const post = validatePost({ ...fields, id: makeId() }, scope.plans);
      const key = customKey(post);
      if (occupied.has(key) || scope.posts.has(key)) throw new Error('Dieser zusätzliche Posten existiert bereits.');
      occupied.add(key);
      return post;
    });
    changeHouse(scopeId, { ...source, posts: [...source.posts, ...additions] });
    return additions.map(customKey);
  }

  return {
    positions, appointments, serialize,
    postKey: (scopeId, key) => scopes.get(scopeId).aliases.get(key) ?? key,
    title: (scopeId, key, fallback) => draft[scopeId].titles[key] ?? fallback,
    loadError: () => loadError,
    persisted: () => persisted,
    canUndo: () => history.length > 0,
    hasDraft,
    setAuthority(scopeId, key, choice) {
      const source = draft[scopeId];
      const post = scopes.get(scopeId).posts.get(key);
      if (!post?.authority) throw new Error('Dieser Posten ist kein Ortsamt.');
      const next = choice === null ? undefined : validateAuthorityChoice(post, choice);
      const previous = source.authorities[key];
      if (next?.role === previous?.role && next?.guild === previous?.guild && next?.title === previous?.title) return false;
      const authorities = { ...source.authorities };
      if (next) authorities[key] = next;
      else delete authorities[key];
      changeHouse(scopeId, { ...source, authorities });
      return true;
    },
    renameTitle(scopeId, key, title) {
      const scope = scopes.get(scopeId);
      const source = draft[scopeId];
      const titles = updateTitleOverrides(source.titles, validTitleKeys(scope.plans, allPosts(scope, source)), key, title);
      if (titles === source.titles) return false;
      changeHouse(scopeId, { ...source, titles });
      return true;
    },
    applicants: scopeId => draft[scopeId].applicants.map(id => treeCandidates.get(id)).filter(Boolean),
    addApplicant(scopeId, id) {
      const scope = scopes.get(scopeId);
      const source = draft[scopeId];
      if (!scope || !treeCandidates.has(id)) throw new Error('Diese Figur ist in keinem verfügbaren Stammbaum verzeichnet.');
      if (scope.direct.has(id) || source.applicants.includes(id)) return false;
      changeHouse(scopeId, { ...source, applicants: [...source.applicants, id] });
      return true;
    },
    removeApplicant(scopeId, id) {
      const source = draft[scopeId];
      if (!source.applicants.includes(id)) return false;
      if (appointments(id).some(entry => entry.scopeId === scopeId)) {
        throw new Error('Gib zuerst alle Posten dieser Figur in dieser Herrschaft frei.');
      }
      changeHouse(scopeId, { ...source, applicants: source.applicants.filter(entry => entry !== id) });
      return true;
    },
    freeFor: scopeId => free.filter(person => !isFreeElsewhere(person.id, scopeId)),
    assign(scopeId, key, id) {
      const scope = scopes.get(scopeId);
      key = scope.aliases.get(key) ?? key;
      const post = positions(scopeId).get(key);
      if (!post || (id !== null && !eligible(scope, draft[scopeId], id))) throw new Error('Figur oder Posten gehört nicht zu dieser Herrschaft.');
      if (post.occupant === id && !post.previousOccupantName) return null;
      if (id && isFreeElsewhere(id, scopeId)) throw new Error('Die Figur ist bereits in einer anderen Herrschaft eingeplant.');
      const assignments = { ...draft[scopeId].assignments };
      const previousOccupants = { ...draft[scopeId].previousOccupants };
      delete previousOccupants[key];
      if (post.holder === id) delete assignments[key];
      else assignments[key] = id;
      changeHouse(scopeId, { ...draft[scopeId], assignments, previousOccupants });
      return post;
    },
    addPosts,
    addPost(scopeId, fields) {
      return addPosts(scopeId, fields, 1)[0];
    },
    removePost(scopeId, key) {
      const scope = scopes.get(scopeId);
      const source = draft[scopeId];
      const slot = allPosts(scope, source).get(key);
      if (!slot?.removable) return false;
      const posts = source.posts.filter(post => customKey(post) !== key);
      const removed = slot.custom ? source.removed : [...source.removed, key];
      const assignments = { ...source.assignments };
      delete assignments[key];
      const next = { ...source, posts, removed, assignments };
      if (Object.keys(source.titles).length) {
        const keys = validTitleKeys(scope.plans, allPosts(scope, next));
        next.titles = Object.fromEntries(Object.entries(source.titles).filter(([target]) => keys.has(target)));
      }
      changeHouse(scopeId, next);
      return true;
    },
    importDraft(serialized) {
      commit(parse(serialized));
    },
    undo() {
      if (!history.length) return false;
      draft = history.pop();
      save();
      return true;
    },
    reset(scopeId) {
      if (!hasDraft(scopeId)) return false;
      changeHouse(scopeId, emptyHouse());
      return true;
    },
  };
}
