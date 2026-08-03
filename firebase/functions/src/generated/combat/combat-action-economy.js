// Shared action-economy rules for character sheets, creature sheets and scene comments.
// Comment-scoped resources reset for every complete comment; persistent resources do not.

export const COMBAT_ACTION_RESOURCE_DEFINITIONS = Object.freeze([
  { id: 'action', name: 'Aktion', current: 1, maximum: 1, scope: 'comment', category: 'action', recovery: 'scene', icon: './public/assets/combat-profile-icons/action.png' },
  { id: 'bonus-action', name: 'Bonusaktion', current: 1, maximum: 1, scope: 'comment', category: 'action', recovery: 'scene', icon: './public/assets/combat-profile-icons/bonus-action.png' },
  { id: 'reaction', name: 'Reaktion', current: 1, maximum: 1, scope: 'comment', category: 'action', recovery: 'scene', icon: './public/assets/combat-profile-icons/reaction.png' },
  { id: 'special-action', name: 'Besondere Aktion', current: 2, maximum: 2, scope: 'persistent', category: 'action', recovery: 'day', icon: './public/assets/combat-profile-icons/special-action.png' },
  { id: 'aura-focus', name: 'Aura-Fokuspunkt', current: 0, maximum: 0, scope: 'persistent', category: 'action', paymentRole: 'universal-substitute', recovery: 'day', icon: './public/assets/combat-profile-icons/aura-focus.png' }
]);

export const COMBAT_ACTIVATION_TYPES = Object.freeze([
  { id: 'action', label: 'Aktion', resourceId: 'action' },
  { id: 'bonus-action', label: 'Bonusaktion', resourceId: 'bonus-action' },
  { id: 'reaction', label: 'Reaktion', resourceId: 'reaction' },
  { id: 'special-action', label: 'Besondere Aktion', resourceId: 'special-action' },
  { id: 'passive', label: 'Passiv', resourceId: '' }
]);

const ACTION_RESOURCE_NAMES = new Map(COMBAT_ACTION_RESOURCE_DEFINITIONS.map(item => [item.id, item.name]));
const ACTION_RESOURCE_IDS = new Set(COMBAT_ACTION_RESOURCE_DEFINITIONS.slice(0, 4).map(item => item.id));
const COMMENT_SCOPED_ACTION_RESOURCE_IDS = new Set(COMBAT_ACTION_RESOURCE_DEFINITIONS.filter(item => item.scope === 'comment').map(item => item.id));

function normalizeAmount(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(9999, Math.trunc(number)));
}

export function normalizeCombatResourceCost(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const resourceId = String(source.resourceId || source.id || '').trim().slice(0, 120);
  const fixedDefinition = COMBAT_ACTION_RESOURCE_DEFINITIONS.find(item => item.id === resourceId);
  return {
    id: String(source.id || `cost-${index + 1}`).trim().slice(0, 120),
    resourceId,
    name: String(source.name || ACTION_RESOURCE_NAMES.get(resourceId) || 'Ressource').trim().slice(0, 100),
    amount: normalizeAmount(source.amount, 0),
    scope: fixedDefinition?.scope || (source.scope === 'comment' ? 'comment' : 'persistent')
  };
}

export function normalizeCombatResourceCosts(value = []) {
  return (Array.isArray(value) ? value : [])
    .slice(0, 30)
    .map(normalizeCombatResourceCost)
    .filter(cost => cost.resourceId && cost.amount > 0);
}

export function getDefaultActivationCosts(activationType = 'action') {
  const definition = COMBAT_ACTIVATION_TYPES.find(item => item.id === activationType)
    || COMBAT_ACTIVATION_TYPES[0];
  return definition.resourceId ? [{
    id: `activation-${definition.resourceId}`,
    resourceId: definition.resourceId,
    name: definition.label,
    amount: 1,
    scope: COMBAT_ACTION_RESOURCE_DEFINITIONS.find(item => item.id === definition.resourceId)?.scope || 'persistent'
  }] : [];
}

export function ensureCombatActionResources(resources = []) {
  const result = (Array.isArray(resources) ? resources : []).map(resource => ({ ...resource }));
  COMBAT_ACTION_RESOURCE_DEFINITIONS.forEach(definition => {
    const existing = result.find(resource => resource.id === definition.id)
      || result.find(resource => String(resource.name || '').trim().toLocaleLowerCase('de') === definition.name.toLocaleLowerCase('de'));
    if (existing) {
      const migratedLegacySpecialAction = definition.id === 'special-action' && existing.scope !== 'persistent';
      existing.id = definition.id;
      existing.name ||= definition.name;
      existing.scope = definition.scope;
      existing.category = definition.id === 'aura-focus' ? definition.category : (existing.category || definition.category);
      if (definition.paymentRole) existing.paymentRole = definition.paymentRole;
      existing.icon ||= definition.icon;
      if (definition.scope === 'comment') {
        existing.maximum = definition.maximum;
        existing.current = definition.current;
      } else if (migratedLegacySpecialAction) {
        existing.maximum = definition.maximum;
        existing.current = definition.current;
      } else {
        if (existing.maximum == null) existing.maximum = definition.maximum;
        if (existing.current == null) existing.current = definition.current;
      }
      if (definition.recovery) existing.recovery = definition.recovery;
      else if (!existing.recovery) existing.recovery = definition.scope === 'comment' ? 'scene' : 'manual';
      return;
    }
    result.push({
      ...definition,
      recovery: definition.recovery || (definition.scope === 'comment' ? 'scene' : 'manual'),
      notes: definition.scope === 'comment' ? 'Wird für jeden neuen Gesamtkommentar aufgefüllt.' : ''
    });
  });
  return result;
}

export function resetCommentScopedResources(resources = []) {
  return (Array.isArray(resources) ? resources : []).map(resource => (
    resource?.scope === 'comment' || COMMENT_SCOPED_ACTION_RESOURCE_IDS.has(String(resource?.id || ''))
      ? { ...resource, current: Math.max(0, Number(resource.maximum) || 0), scope: 'comment' }
      : { ...resource }
  ));
}

export function recoverDailyCombatResources(resources = [], recoveryDayKey = '') {
  const dayKey = String(recoveryDayKey || '').trim().slice(0, 160);
  if (!dayKey) return (Array.isArray(resources) ? resources : []).map(resource => ({ ...resource }));
  return (Array.isArray(resources) ? resources : []).map(resource => {
    if (resource?.recovery !== 'day') return { ...resource };
    const previousDayKey = String(resource.recoveryDayKey || '');
    if (!previousDayKey) return {
      ...resource,
      current: Math.max(0, Number(resource.maximum) || 0),
      recoveryDayKey: dayKey
    };
    if (previousDayKey === dayKey) return { ...resource };
    return {
      ...resource,
      current: Math.max(0, Number(resource.maximum) || 0),
      recoveryDayKey: dayKey
    };
  });
}

export function getPersistentCombatResources(before = [], after = []) {
  const original = Array.isArray(before) ? before : [];
  const updated = Array.isArray(after) ? after : [];
  const persisted = original.map(resource => {
    const next = updated.find(candidate => String(candidate?.id || '') === String(resource?.id || ''));
    if (!next) return { ...resource };
    if (resource.scope === 'comment' || COMMENT_SCOPED_ACTION_RESOURCE_IDS.has(String(resource.id || ''))) {
      return { ...resource, current: Number(resource.current) || 0 };
    }
    return {
      ...resource,
      current: Number(next.current) || 0,
      maximum: Math.max(0, Number(next.maximum) || 0),
      recoveryDayKey: String(next.recoveryDayKey || resource.recoveryDayKey || '')
    };
  });
  const knownIds = new Set(persisted.map(resource => String(resource?.id || '')));
  updated.forEach(resource => {
    const resourceId = String(resource?.id || '');
    if (!resourceId || knownIds.has(resourceId)) return;
    if (resource?.scope === 'comment' || COMMENT_SCOPED_ACTION_RESOURCE_IDS.has(resourceId)) return;
    persisted.push({
      ...resource,
      current: Number(resource.current) || 0,
      maximum: Math.max(0, Number(resource.maximum) || 0),
      scope: 'persistent',
      recoveryDayKey: String(resource.recoveryDayKey || '')
    });
    knownIds.add(resourceId);
  });
  return persisted;
}

export function getActionPaymentCosts(action = {}, paymentMode = 'standard', profile = {}) {
  if (profile?.cheats?.enabled) return [];
  if (paymentMode === 'cheat') {
    return [{
      id: 'invalid-cheat-payment',
      resourceId: '__invalid-cheat-payment__',
      name: 'nicht aktivierter Cheatmodus',
      amount: 1,
      scope: 'persistent'
    }];
  }
  if (paymentMode === 'aura') {
    if (action?.auraBypass?.allowed === false || profile?.aura?.enabled !== true) {
      return [{
        id: 'invalid-aura-payment',
        resourceId: '__invalid-aura-payment__',
        name: 'nicht verfügbare Aura-Zahlung',
        amount: 1,
        scope: 'persistent'
      }];
    }
    const resourceId = String(action?.auraBypass?.resourceId || profile?.aura?.focusResourceId || 'aura-focus');
    const amount = normalizeAmount(action?.auraBypass?.cost ?? profile?.aura?.focusBypassCost, 1) || 1;
    const resource = (profile?.resources || []).find(item => item.id === resourceId);
    return [{
      id: `aura-${resourceId}`,
      resourceId,
      name: resource?.name || 'Aura-Fokuspunkt',
      amount,
      scope: resource?.scope === 'comment' ? 'comment' : 'persistent'
    }];
  }
  const explicit = normalizeCombatResourceCosts(action?.costs);
  return explicit.length ? explicit : getDefaultActivationCosts(action?.activationType || 'action');
}

export function canUseAuraPayment(action = {}, profile = {}) {
  if (!profile?.aura?.enabled || action?.auraBypass?.allowed === false) return false;
  const resourceId = String(action?.auraBypass?.resourceId || profile?.aura?.focusResourceId || 'aura-focus');
  return (profile.resources || []).some(resource => resource.id === resourceId && Number(resource.maximum) > 0);
}

export const combatActionEconomyInternals = Object.freeze({ ACTION_RESOURCE_IDS, COMMENT_SCOPED_ACTION_RESOURCE_IDS, normalizeAmount });
