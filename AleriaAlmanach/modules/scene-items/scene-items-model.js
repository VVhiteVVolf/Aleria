// Scene circulation is an append-only projection, never a second stock ledger.
export const PICKUP_RESOURCES = Object.freeze(['bonus-action', 'action', 'reaction', 'special-action', 'aura-focus']);
const copy = value => JSON.parse(JSON.stringify(value));
export function sceneItemEvents(comment = {}) {
  return [comment.sceneItemEvent, ...(comment.commentSegments || []).flatMap(segment => [
    segment.sceneItemEvent,
    segment.inventoryUse?.sceneItemEvent,
    ...(segment.combatResolutions || [segment.combatResolution]).map(result => result?.criticalConsequence?.sceneItemEvent)
  ])].filter(Boolean);
}
export function applySceneItemEvent(items, event) {
  if (!event?.sceneItemId) return items;
  if (event.operation === 'place' || event.operation === 'drop') {
    if (event.operation === 'drop' && [...items.values()].some(item => item.operation === 'drop' && item.available
      && item.sourceActorId === event.sourceActorId && item.weaponId === event.weaponId)) return items;
    if (!items.has(event.sceneItemId)) items.set(event.sceneItemId, { ...copy(event), available: true });
  } else if (event.operation === 'pickup' || event.operation === 'consume') {
    const item = items.get(event.sceneItemId);
    if (item) items.set(event.sceneItemId, { ...item, available: false, claimedBy: event.actorId, lastEvent: copy(event) });
  }
  return items;
}
export function deriveSceneItems(comments = []) {
  const items = new Map();
  for (const comment of comments) for (const event of sceneItemEvents(comment)) applySceneItemEvent(items, event);
  return items;
}
export function applyDroppedWeaponsToStates(states, items) {
  const owners = new Set([...items.values()].map(item => item.sourceActorId).filter(Boolean));
  for (const actorId of owners) {
    const state = states.get(actorId) || {};
    states.set(actorId, { ...state, droppedWeapons: [...items.values()].filter(item =>
      item.operation === 'drop' && item.sourceActorId === actorId && (item.available || item.claimedBy && item.claimedBy !== actorId)) });
  }
}
export function getDroppedWeapon(items, actorId, weapon = {}) {
  return [...items.values()].find(entry => entry.available && entry.operation === 'drop' && entry.sourceActorId === actorId
    && (entry.weaponId === weapon.id || (weapon.inventoryItemId && entry.item?.id === weapon.inventoryItemId)));
}
export function disarmNarration(actorName, weapon = {}, reason = 'hit') {
  const name = weapon.name || 'Die Waffe';
  const kind = String(weapon.weaponType || '').toLowerCase();
  if (['unarmed', 'natural'].includes(kind) || /unbewaffnet|faust|fäuste|klauen|biss|nahkampf$/i.test(name)) {
    return `${actorName} gerät aus dem Gleichgewicht. Körperwaffen lassen sich nicht entreißen; der unsichere Stand erschwert die nächste Gegenwehr.`;
  }
  const verb = reason === 'failure' ? 'entgleitet' : 'wird aus der Hand geschlagen';
  if (/bow|crossbow/.test(kind)) return `${name} ${verb}. Der Bogenkörper schlägt neben ${actorName} auf dem Boden auf; die Waffe liegt in Reichweite.`;
  if (/spear|staff|polearm/.test(kind)) return `${name} ${verb}, kippt zur Seite und bleibt vor ${actorName} liegen.`;
  if (/whip|chain/.test(kind)) return `${name} ${verb} und fällt in einer losen Windung zu ${actorName}s Füßen.`;
  return reason === 'failure' ? `${actorName}s Griff rutscht ab. ${name} fällt zu Boden und kommt in Reichweite zum Liegen.`
    : `${name} wird ${actorName} aus dem Griff geschlagen. Die Waffe fällt klirrend zu Boden und bleibt in Reichweite liegen.`;
}
export function createWeaponDrop(profile, { id, encounterId, reason }) {
  const weapon = profile.weapon;
  if (!weapon || ['unarmed', 'natural'].includes(weapon.weaponType)
    || /unbewaffnet|faust|fäuste|klauen|biss|nahkampf$/i.test(weapon.name || '')) return null;
  const canonical = (profile.weapons || []).find(entry => entry.inventoryItemId && entry.inventoryItemId === weapon.inventoryItemId)
    || (profile.weapons || []).find(entry => entry.id === weapon.id) || weapon;
  const item = (profile.inventory?.items || []).find(item => item.id === canonical.inventoryItemId)
    || { id: canonical.inventoryItemId || `weapon:${canonical.id}`, name: canonical.name, image: canonical.image || '',
      category: 'weapon', quantity: '1', combatDefinition: { ...canonical, kind: 'weapon' }, equipmentLink: { kind: 'weapon', combatEntryId: canonical.id } };
  return { operation: 'drop', sceneItemId: `dropped:${id}`, encounterId, sourceActorId: profile.characterId,
    sourcePersistence: copy(profile.persistence || {}), sourceActorName: profile.name, weaponId: canonical.id,
    item: { ...copy(item), quantity: '1' }, text: disarmNarration(profile.name, canonical, reason) };
}

export function choosePickupResource(resources = [], requested = '') {
  const chosen = requested || PICKUP_RESOURCES.find(id => resources.some(resource => resource.id === id && resource.current >= 1));
  if (!PICKUP_RESOURCES.includes(chosen) || !resources.some(resource => resource.id === chosen && resource.current >= 1)) {
    throw new Error('Zum Aufheben fehlt ein verfügbarer Aktionspunkt.');
  }
  return chosen;
}
