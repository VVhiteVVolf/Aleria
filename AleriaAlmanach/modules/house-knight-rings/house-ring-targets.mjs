import { hasWorkedInventory, resolveHouseSignetMembership } from './house-ring-membership.mjs';
const world = character => character.identity?.worldPersonId || character.genealogy?.worldPersonId || '';

export function selectHouseSignetTargets({ online = [], local = [], families, ranks, excludedIds = [] } = {}) {
  const excluded = new Set(excludedIds), usedLocal = new Set(), targets = [];
  const localById = new Map(local.map(character => [character.id, character]));
  const localWorld = new Map(local.filter(character => world(character)).map(character => [world(character), character]));
  const seenWorld = new Set();
  for (const character of online) {
    if (excluded.has(character.id) || excluded.has(world(character))) continue;
    const knownCharacter = localById.get(character.id) || localWorld.get(world(character));
    // A legacy duplicate with an empty inventory must not become a recipient
    // merely because another document of the same world person owns equipment.
    if (!hasWorkedInventory(character)
      && !(knownCharacter?.id === character.id && hasWorkedInventory(knownCharacter))) continue;
    const membership = resolveHouseSignetMembership(character, {families,ranks,knownCharacter});
    if (!membership) continue;
    if (knownCharacter) usedLocal.add(knownCharacter.id);
    if (!membership.worldPersonId) throw Error(`${character.name}: Weltidentität fehlt.`);
    if (seenWorld.has(membership.worldPersonId)) throw Error(`${character.name}: mehrere Online-Akten derselben Weltperson.`);
    seenWorld.add(membership.worldPersonId);
    targets.push({ character, membership, localId: knownCharacter?.id || '', online: true });
  }
  for (const character of local) {
    if (usedLocal.has(character.id) || !hasWorkedInventory(character)
      || excluded.has(character.id) || excluded.has(world(character))) continue;
    const membership = resolveHouseSignetMembership(character, {families,ranks});
    if (!membership) continue;
    if (!membership.worldPersonId || seenWorld.has(membership.worldPersonId)) throw Error(`${character.name}: mehrdeutige lokale Hausidentität.`);
    seenWorld.add(membership.worldPersonId);
    targets.push({ character, membership, localId: character.id, online: false });
  }
  return targets;
}
