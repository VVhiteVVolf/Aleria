import { deriveCombatStateFromComments } from '../combat/combat-state-model.js';

// Only branches consumed by combat replay are visited. Item ledgers and dropped
// objects are intentionally absent: group readiness uses the current records,
// and must not deep-clone historical inventory snapshots on every live update.
const children = new Set([
  'commentSegments', 'combatResolution', 'combatResolutions', 'skillResolution', 'inventoryUse',
  'combatEncounter', 'combatStatus', 'sceneRest', 'combatRulesRelease', 'participants', 'auraApplications',
  'actorConditionSnapshot', 'targetConditionSnapshot', 'conditionSnapshot',
  'actorConcentrationSnapshot', 'targetConcentrationSnapshot', 'actorChannelingSnapshot', 'targetChannelingSnapshot',
  'ruleResourceSnapshots', 'ruleAbilitySnapshots', 'herausforderungCombatSnapshots', 'herausforderungCombatResults',
  'resolution', 'counterAttacks', 'followUpAttacks', 'criticalConsequences', 'criticalConsequence',
  'condition', 'durationModel', 'before', 'after', 'conditions', 'temporaryConditions', 'concentration', 'channeling',
  'encounterAuraTemporaryHitPoints', 'sources'
]);
const omitted = new Set(['inventory', 'actorInventorySnapshot', 'targetInventorySnapshot', 'inventorySnapshot',
  'equipmentSnapshots', 'sceneItemEvent', 'sceneItemEvents']);
const referenceFields = ['actorId', 'targetId', 'sourceActorId', 'targetActorId', 'ownerActorId',
  'concentrationOwnerId', 'channelOwnerId', 'auraSourceActorId'];
const conditionBranches = new Set(['condition', 'conditions', 'temporaryConditions',
  'actorConditionSnapshot', 'targetConditionSnapshot', 'conditionSnapshot']);
const conditionSnapshots = new Set(['actorConditionSnapshot', 'targetConditionSnapshot', 'conditionSnapshot']);
const castingBranches = new Set(['combatResolution', 'combatResolutions', 'skillResolution', 'resolution', 'inventoryUse']);
const header = kind => kind === 'comment' || kind === 'commentSegments';

function persistenceKey(id, persistence) {
  if (!id || !persistence) return null;
  if (persistence.persistent === false || persistence.kind === 'template') return `scene:${id}`;
  return persistence.recordId && ['character', 'creature'].includes(persistence.kind)
    ? `${persistence.kind}:${persistence.recordId}` : null;
}

function narrativeActor(value) {
  const id = value.sceneActorId || value.actorId || value.characterId;
  if (!id) return null;
  if (persistenceKey(id, value.actorPersistence)) return { id, persistence: value.actorPersistence };
  // Cast aliases may be temporary copies of a creature template. Only an
  // authoritative persistence descriptor may link such an alias to its sheet.
  if (value.sceneActorId) return { id, scene: true };
  if (value.actorType === 'creature' || value.creatureId) return { id,
    persistence: { kind: 'creature', recordId: value.creatureId || value.sceneActorSourceId || value.characterId || id } };
  return value.characterId ? { id, persistence: { kind: 'character', recordId: value.characterId } } : null;
}

function walk(value, visit, kind = 'comment') {
  if (Array.isArray(value)) { for (const entry of value) walk(entry, visit, kind); return; }
  if (!value || typeof value !== 'object') return;
  visit(value, kind);
  for (const field of children) if (value[field]) walk(value[field], visit, field);
}

function buildActorIndex(comments) {
  const links = new Map();
  function remember(id, persistence) {
    const key = persistenceKey(id, persistence);
    if (!key) return;
    const previous = links.get(id);
    links.set(id, previous === undefined || previous === key ? key : null);
    if (persistence.persistent !== false && ['character', 'creature'].includes(persistence.kind)
      && persistence.recordId && persistence.recordId !== id) remember(persistence.recordId, persistence);
  }
  walk(comments, (value, kind) => {
    remember(value.actorId || (kind === 'participants' ? value.id : ''), value.actorPersistence || value.persistence || value.condition?.criticalPersistence);
    remember(value.targetId || value.targetActorId, value.targetPersistence);
    remember(value.sourceActorId, value.sourcePersistence);
    if (header(kind)) { const actor = narrativeActor(value); if (actor) remember(actor.id, actor.persistence); }
  });
  return links;
}

function createProjection(links) {
  // A later full status/rest snapshot may carry another actor's older effect.
  // Remember the original condition instance instead of attributing it to the
  // actor who happens to own the next snapshot.
  const conditionSources = new Map();
  function key(id, persistence, scope = {}, preferred, scene = false) {
    if (!id) return id;
    const explicit = persistenceKey(id, persistence);
    if (explicit) return explicit;
    if (preferred?.id === id) return preferred.key;
    if (scene) {
      const known = links.get(id);
      return known && /^(?:creature|scene):/.test(known) ? known : `scene:${id}`;
    }
    if (links.has(id) && links.get(id) === null) return `scene:${id}`;
    if (scope.bindings?.has(id)) return scope.bindings.get(id) || `scene:${id}`;
    if (links.has(id)) return links.get(id) || `scene:${id}`;
    return `${scene ? 'scene' : 'character'}:${id}`;
  }
  function project(value, inherited = {}, kind = 'comment') {
    if (Array.isArray(value)) return value.map(entry => project(entry, inherited, kind));
    if (!value || typeof value !== 'object') return value;
    const narrative = header(kind) ? narrativeActor(value) : null;
    const actorId = value.actorId || (kind === 'participants' ? value.id : '') || narrative?.id;
    const actorPersistence = narrative?.persistence || value.actorPersistence || value.persistence || value.condition?.criticalPersistence;
    const actor = actorId ? { id: actorId, key: key(actorId, actorPersistence, inherited, null, narrative?.scene) } : inherited.actor;
    const target = value.targetId ? { id: value.targetId, key: key(value.targetId, value.targetPersistence, inherited) } : inherited.target;
    const bindings = new Map(inherited.bindings), local = new Map();
    for (const identity of [actor, target]) if (identity) {
      const previous = local.get(identity.id);
      local.set(identity.id, previous === undefined || previous === identity.key ? identity.key : null);
    }
    for (const [id, mapped] of local) bindings.set(id, mapped);
    const sourceActor = castingBranches.has(kind) ? actor : inherited.sourceActor;
    const criticalCondition = inherited.criticalCondition || ['criticalConsequence', 'criticalConsequences'].includes(kind);
    const scope = { ...inherited, actor, target, sourceActor, criticalCondition, bindings, owner: actorId ? actor : inherited.owner };
    if (inherited.condition && value.id && (value.sourceActorId || value.concentrationOwnerId || value.durationModel)) {
      const sourceId = value.sourceActorId || value.concentrationOwnerId || value.durationModel?.concentrationOwnerId;
      const created = criticalCondition || inherited.newConditions?.has(value.id);
      const instance = `${scope.owner?.key || 'unbound'}:${value.id}`;
      const original = conditionSources.get(instance) || (created ? sourceActor : null);
      const explicit = persistenceKey(sourceId, value.sourcePersistence);
      const mapped = explicit || (original && original.id === sourceId ? original.key : links.get(sourceId));
      scope.conditionSource = sourceId && mapped ? { id: sourceId, key: mapped } : null;
      if (scope.conditionSource && !conditionSources.has(instance)) conditionSources.set(instance, scope.conditionSource);
    }
    const out = {};
    for (const [field, content] of Object.entries(value)) {
      if (omitted.has(field)) continue;
      if (referenceFields.includes(field) && content) {
        const persistence = field === 'actorId' ? actorPersistence : field === 'targetId' || field === 'targetActorId'
          ? value.targetPersistence : field === 'sourceActorId' ? value.sourcePersistence : null;
        const preferred = field === 'ownerActorId' ? inherited.owner
          : inherited.condition && ['sourceActorId', 'concentrationOwnerId', 'channelOwnerId'].includes(field) ? scope.conditionSource : null;
        out[field] = field === 'actorId' && actor ? actor.key : key(content, persistence, scope, preferred);
      } else if (header(kind) && ['characterId', 'sceneActorId'].includes(field) && content) {
        out[field] = narrative ? key(narrative.id, narrative.persistence, scope, null, narrative.scene)
          : key(content, field === 'characterId' ? { kind: 'character', recordId: content } : null, scope);
      } else if (children.has(field)) {
        if (['ruleResourceSnapshots', 'ruleAbilitySnapshots'].includes(kind) && ['before', 'after'].includes(field)) { out[field] = content; continue; }
        const owner = field.startsWith('target') ? target : field.startsWith('actor') ? actor : scope.owner || actor;
        let newConditions = scope.newConditions;
        if (conditionSnapshots.has(field)) {
          const existing = new Set((content?.before || []).map(condition => condition.id));
          newConditions = new Set((content?.after || []).filter(condition => !existing.has(condition.id)).map(condition => condition.id));
        }
        out[field] = project(content, { ...scope, owner, newConditions, condition: scope.condition || conditionBranches.has(field) }, field);
      } else out[field] = content;
    }
    if (kind === 'participants' && !value.actorId && actor) out.actorId = actor.key;
    return out;
  }
  return comments => project(comments);
}

// Collection-local IDs are not scene identities. This projection changes only
// references needed by the shared replay, never a stored receipt or record ID.
// Ambiguous untyped historical references stay scene-local instead of leaking
// a creature's condition, HP or contribution clock into a character's sheet.
export function deriveGroupSceneStates(comments = []) {
  const source = Array.isArray(comments) ? comments : [];
  return deriveCombatStateFromComments(createProjection(buildActorIndex(source))(source));
}
