import { companionIdentityFromItem, inventoryWithCreatureIdentity } from './item-register-companions.js';
import { detectStaleCharacterFields, stampFreshRevisions } from '../characters/character-save-guard.js?v=20260903-genealogy-portrait-sync-v1';

export async function prepareInventoryCompanionWrites({ transaction, db, doc, characterId, before, after }) {
  if (!after.inventory) return [];
  const oldItems = before?.inventory?.items || [];
  const items = after.inventory.items || [];
  for (const field of ['instanceId', 'creatureId']) {
    const ids = items.map(item => item[field]).filter(Boolean);
    if (new Set(ids).size !== ids.length) throw new Error('Einzelstücke und Begleiter dürfen nicht mehrfach im Inventar verknüpft werden.');
  }
  const creatureIds = [...new Set([...oldItems, ...items].map(item => item.creatureId).filter(Boolean))];
  const writes = [];
  for (const id of creatureIds) {
    const ref = doc(db, 'creatures', id);
    const snap = await transaction.get(ref);
    const current = snap.data();
    if (!current || current.itemOrigin?.ownerCharacterId !== characterId) throw new Error('Eine Begleiterverknüpfung wurde geändert. Bitte den Charakterbogen neu öffnen.');
    const lock = await transaction.get(doc(db, 'combat_profile_locks', 'creatures', 'records', id));
    const item = items.find(entry => entry.creatureId === id);
    const patch = item ? companionIdentityFromItem(item) : {};
    if (item && (item.instanceId || item.id) !== current.itemOrigin.instanceId) throw new Error('Ein Begleiter darf nicht mit einem zweiten Gegenstand verknüpft werden.');
    const changed = !item || Object.entries(patch).some(([key, value]) => String(current[key] || '') !== String(value || ''));
    if (!changed) continue;
    if (lock.data()?.activeEncounterKeys?.length) throw new Error('Ein verknüpfter Begleiter nimmt gerade an einem Kampf teil.');
    writes.push({ ref, data: { ...patch, itemOrigin: { ...current.itemOrigin,
      ownerCharacterId: item ? characterId : '', ownerCharacterName: item ? after.name || before.name || '' : '',
      disposition: item ? 'owned' : 'unassigned' }, updatedAt: new Date().toISOString() } });
  }
  return writes;
}

export async function saveLinkedCreature({ db, doc, runTransaction, id, data, forceOverwrite = false }) {
  return runTransaction(db, async transaction => {
    const ref = doc(db, 'creatures', id);
    const snap = await transaction.get(ref);
    const current = snap.data();
    const lock = await transaction.get(doc(db, 'combat_profile_locks', 'creatures', 'records', id));
    if (lock.data()?.activeEncounterKeys?.length) throw new Error('Der Begleiter nimmt gerade an einem Kampf teil.');
    if (!forceOverwrite && detectStaleCharacterFields(current, data, { combatProfile: 'Kampfprofil', loot: 'Beute' }).length) throw new Error('Der Kreaturenbogen wurde zwischenzeitlich geändert. Bitte neu öffnen.');
    const origin = current?.itemOrigin;
    if (!origin?.ownerCharacterId) throw new Error('Die Besitzerzuordnung wurde geändert. Bitte den Kreaturenbogen neu öffnen.');
    const characterRef = doc(db, 'characters', origin.ownerCharacterId);
    const characterSnapshot = await transaction.get(characterRef);
    const character = characterSnapshot.data();
    const characterLock = await transaction.get(doc(db, 'combat_profile_locks', 'characters', 'records', origin.ownerCharacterId));
    if (characterLock.data()?.activeEncounterKeys?.length) throw new Error('Die Besitzerfigur nimmt gerade an einem Kampf teil.');
    const next = { ...current, ...data, itemOrigin: origin, id };
    const inventory = inventoryWithCreatureIdentity(character || {}, next);
    const revision = Math.max(Date.now(), Number(character.inventory?.revision || 0) + 1);
    transaction.update(characterRef, { inventory: { ...inventory, revision }, updatedAt: new Date().toISOString() });
    transaction.set(ref, { ...stampFreshRevisions(data, ['combatProfile', 'loot']), itemOrigin: origin }, { merge: true });
    return id;
  });
}
