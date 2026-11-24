import { MAX_ROLE_BATCH, ROLE_KINDS } from '../../shared/cenyr-administration/office-roles.mjs';
import { suitableLocalities } from '../../shared/cenyr-administration/local-offices.mjs';
import { customKey, migrateFormerPost, migrateMilitaryPosts } from './draft-post-migration.mjs';

const SCHEMA = 'aleria.herrschaftsplanung';
const VERSION = 5;
export const STORAGE_KEY = 'aleria.herrschaftsverwaltung.v1';
const emptyHouse = () => ({ posts: [], removed: [], applicants: [], assignments: {} });
const plainObject = value => value && typeof value === 'object' && !Array.isArray(value);

function validatePost(post, plans) {
  const plan = post && Object.hasOwn(plans, post.area) ? plans[post.area] : null;
  const template = plan?.templates.find(entry => entry.id === post.templateId);
  if (!plan || !Object.hasOwn(ROLE_KINDS, post.kind)
    || (post.kind === 'staff' && !plan.sections.some(section => section.staff))
    || typeof post.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(post.id)
    || typeof post.title !== 'string' || !post.title.trim() || post.title.length > 90
    || typeof post.description !== 'string' || post.description.length > 2000
    || (post.site && !suitableLocalities(plan, template).some(place => place.key === post.site))
    || (post.templateId !== undefined && (typeof post.templateId !== 'string' || !/^[a-z0-9-]{1,120}$/.test(post.templateId)))) {
    throw new Error('Ein zusätzlicher Posten hat ungültige Angaben.');
  }
  const { id, area, kind, templateId, site } = post;
  return { id, area, kind, title: post.title.trim(), description: post.description.trim(),
    ...(templateId ? { templateId } : {}), ...(site ? { site } : {}) };
}

export function createAssemblyState(houses, free, { storage, treeCandidates = new Map(), makeId = () => crypto.randomUUID() } = {}) {
  const scopes = new Map(houses.map(house => [house.id, {
    plans: house.plans,
    county: house.county,
    newScope: house.preparation,
    posts: new Map(Object.values(house.plans).flatMap(plan => plan.slots).map(post => [post.key, post])),
    direct: new Set(house.candidates.map(candidate => candidate.id)),
    templates: new Map(Object.entries(house.plans).flatMap(([area, plan]) =>
      plan.templates.map(template => [`${area}/${template.id}`, template]))),
    retired: new Map(Object.entries(house.plans).flatMap(([area, plan]) =>
      Object.entries(plan.retired).map(([id, title]) => [`${area}/${id}`, title]))),
  }]));
  const freeIds = new Set(free.map(person => person.id));
  const blank = Object.fromEntries(houses.map(house => [house.id, emptyHouse()]));
  const history = [];
  let draft = blank;
  let loadError = '';
  let persisted = Boolean(storage);

  function allPosts(scope, source) {
    const posts = new Map(scope.posts);
    for (const key of source.removed) posts.delete(key);
    for (const post of source.posts) {
      const key = customKey(post);
      const template = scope.templates.get(`${post.area}/${post.templateId}`);
      const placement = template?.placement || (post.kind === 'staff' ? scope.plans[post.area].sections.find(section => section.staff).id : '');
      const locality = scope.plans[post.area].localities.find(site => site.key === post.site);
      posts.set(key, {
        ...post, key, holder: null, custom: true, removable: true, placement, image: template?.image, reportsTo: template?.reportsTo, locality,
      });
    }
    return posts;
  }

  function positions(scopeId, source = draft[scopeId]) {
    return new Map([...allPosts(scopes.get(scopeId), source)].map(([key, post]) => [
      key, { ...post, occupant: Object.hasOwn(source.assignments, key) ? source.assignments[key] : post.holder },
    ]));
  }
  const sharesCanonicalAppointment = (a, b, id) => a.holder === id && b.holder === id;
  const eligible = (scope, source, id) => scope.direct.has(id) || freeIds.has(id) || source.applicants.includes(id);
  const isFreeElsewhere = (personId, scopeId) => freeIds.has(personId)
    && Object.keys(draft).some(id => id !== scopeId && [...positions(id).values()].some(post => post.occupant === personId));

  function parse(serialized) {
    let data;
    try { data = JSON.parse(serialized); }
    catch { throw new Error('Die Datei enthält keinen lesbaren JSON-Entwurf.'); }
    if (data?.schema !== SCHEMA || ![1, 2, 3, 4, VERSION].includes(data.version) || !plainObject(data.houses)
      || Object.keys(data.houses).some(id => !scopes.has(id))) {
      throw new Error('Die Datei gehört zu keinem unterstützten Entwurf dieser Verwaltung.');
    }
    const assignedFree = new Set();
    return Object.fromEntries([...scopes].map(([scopeId, scope]) => {
      const input = data.houses[scopeId];
      if (input === undefined && data.version === 1 && scope.county) return [scopeId, emptyHouse()];
      if (input === undefined && data.version < VERSION && scope.newScope) return [scopeId, emptyHouse()];
      if (!Array.isArray(input?.posts) || !plainObject(input.assignments)) throw new Error(`Ungültiger Entwurf für ${scopeId}.`);
      const older = data.version < VERSION;
      const { posts: storedPosts, moved } = older ? migrateMilitaryPosts(scope, input.posts) : { posts: input.posts, moved: new Map() };
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
        || additions.some(id => !treeCandidates.has(id))) {
        throw new Error(`Ungültige Ergänzungen aus den Stammbäumen in ${scopeId}.`);
      }
      const applicants = additions.filter(id => !scope.direct.has(id));
      const assignments = [];
      const formerPosts = [];
      for (const [oldKey, id] of Object.entries(input.assignments)) {
        const retired = older && !scope.posts.has(oldKey) && scope.retired.has(oldKey);
        if (retired && id === null) continue;
        const key = retired ? migrateFormerPost(scope, oldKey, formerPosts, customKeys) : moved.get(oldKey) || oldKey;
        if (key) assignments.push([key, id]);
      }
      posts.push(...formerPosts.map(post => validatePost(post, scope.plans)));
      const source = { posts, removed, applicants, assignments: Object.fromEntries(assignments) };
      const available = allPosts(scope, source);
      for (const [key, id] of assignments) {
        if (older && treeCandidates.has(id) && !eligible(scope, source, id)) {
          applicants.push(id);
        }
        if (!available.has(key) || (id !== null && (typeof id !== 'string' || !eligible(scope, source, id)))) {
          throw new Error(`Ungültige Zuordnung in ${scopeId} (${key}).`);
        }
      }
      // Older drafts knew fewer source appointments. Honor an explicit transfer
      // if the person now also has a documented starting post.
      if (older) {
        const planned = new Map(assignments.filter(([, id]) => id !== null).map(([key, id]) => [id, available.get(key)]));
        for (const [key, post] of available) {
          const dest = planned.get(post.holder);
          if (dest && !Object.hasOwn(source.assignments, key) && !sharesCanonicalAppointment(dest, post, post.holder)) {
            source.assignments[key] = null;
          }
        }
      }
      const assigned = new Map();
      for (const post of positions(scopeId, source).values()) {
        const { occupant } = post;
        if (!occupant) continue;
        const previous = assigned.get(occupant);
        if ((previous && !sharesCanonicalAppointment(previous, post, occupant)) || assignedFree.has(occupant)) {
          throw new Error('Eine Figur ist im Entwurf mehrfach besetzt.');
        }
        assigned.set(occupant, post);
        if (freeIds.has(occupant)) assignedFree.add(occupant);
      }
      return [scopeId, source];
    }));
  }

  const serialize = () => JSON.stringify({ schema: SCHEMA, version: VERSION, houses: draft }, null, 2);

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
    || draft[scopeId].applicants.length > 0 || Object.keys(draft[scopeId].assignments).length > 0;

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
    positions, serialize,
    loadError: () => loadError,
    persisted: () => persisted,
    canUndo: () => history.length > 0,
    hasDraft,
    applicants: scopeId => draft[scopeId].applicants.map(id => treeCandidates.get(id)),
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
      if ([...positions(scopeId).values()].some(post => post.occupant === id)) {
        throw new Error('Gib zuerst den Posten dieser Figur frei.');
      }
      changeHouse(scopeId, { ...source, applicants: source.applicants.filter(entry => entry !== id) });
      return true;
    },
    freeFor: scopeId => {
      const occupied = new Set(Object.keys(draft).filter(id => id !== scopeId)
        .flatMap(id => [...positions(id).values()].map(post => post.occupant)));
      return free.filter(person => !occupied.has(person.id));
    },
    assign(scopeId, key, id) {
      const scope = scopes.get(scopeId);
      const local = positions(scopeId);
      const post = local.get(key);
      if (!post || (id !== null && !eligible(scope, draft[scopeId], id))) throw new Error('Figur oder Posten gehört nicht zu dieser Herrschaft.');
      if (post.occupant === id) return null;
      if (id && isFreeElsewhere(id, scopeId)) throw new Error('Die Figur ist bereits in einer anderen Herrschaft eingeplant.');
      const formerPosts = id ? [...local.values()].filter(slot => slot.occupant === id && !sharesCanonicalAppointment(post, slot, id)) : [];
      const assignments = { ...draft[scopeId].assignments };
      function set(slot, person) {
        if (slot.holder === person) delete assignments[slot.key];
        else assignments[slot.key] = person;
      }
      for (const former of formerPosts) set(former, null);
      set(post, id);
      changeHouse(scopeId, { ...draft[scopeId], assignments });
      return { post, former: formerPosts[0] || null, formerPosts };
    },
    addPosts,
    addPost(scopeId, fields) {
      return addPosts(scopeId, fields, 1)[0];
    },
    removePost(scopeId, key) {
      const slot = positions(scopeId).get(key);
      if (!slot?.removable) return false;
      const source = draft[scopeId];
      const posts = source.posts.filter(post => customKey(post) !== key);
      const removed = slot.custom ? source.removed : [...source.removed, key];
      const assignments = { ...source.assignments };
      delete assignments[key];
      changeHouse(scopeId, { ...source, posts, removed, assignments });
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
