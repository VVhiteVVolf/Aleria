import { isDeepStrictEqual } from 'node:util';
import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates, buildImportedCharacter } from '../../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { VARULV_NEW_COMPANIONS } from '../../../AleriaAlmanach/modules/creatures/catalog/varulv-companions.js';
import { SLEIPNIR_VARULV_ID } from '../../../AleriaAlmanach/modules/creatures/catalog/varulv-gamir.js';
import { sanitizeCreature } from '../../../AleriaAlmanach/modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../../../AleriaAlmanach/modules/creatures/creature-companion-link.js';

// One editorial import, independent of network and persistence. Existing creatures
// remain authoritative, including later assignments and all live combat state.
export function planVarulvCompanionImport({ characters = [], creatures = [], now = new Date().toISOString() } = {}) {
  const owners = characters.filter(character => character.id === SLEIPNIR_VARULV_ID
    || (character.identity?.worldPersonId || character.genealogy?.worldPersonId) === SLEIPNIR_VARULV_ID);
  if (owners.length > 1) throw new Error('Sleipnir besitzt mehrere Online-Identitäten.');
  const previousOwner = owners[0];
  if (!previousOwner && characters.some(character => character.name === 'Sleipnir Varulv')) {
    throw new Error('Sleipnirs vorhandene Akte benötigt zuerst eine eindeutige Stammbaum-Verknüpfung.');
  }
  const candidate = createFamilyCandidates(getRegisteredFamily('haus-varulv'))
    .find(person => person.worldPersonId === SLEIPNIR_VARULV_ID);
  if (!candidate) throw new Error('Sleipnirs Stammbaumeintrag fehlt.');
  let owner = previousOwner ? structuredClone(previousOwner)
    : { id: SLEIPNIR_VARULV_ID, ...buildImportedCharacter(candidate, null, now) };

  const entries = VARULV_NEW_COMPANIONS.map(source => {
    const matches = creatures.filter(creature => creature.id === source.id
      || (creature.name === source.name && /(?:Clan|Haus) Varulv/.test(creature.classification?.house || '')));
    if (matches.length > 1) throw new Error(`Mehrdeutige Kreatur: ${source.name}`);
    const prior = matches[0];
    if (prior && (prior.name !== source.name || prior.species !== source.species)) {
      throw new Error(`Abweichende Kreaturenidentität: ${source.name}`);
    }
    const data = prior ? structuredClone(prior) : sanitizeCreature({ ...source,
      ...(source.itemOrigin ? { itemOrigin: { ...source.itemOrigin, ownerCharacterId: owner.id } } : {}),
      createdAt: now, updatedAt: now
    });
    if (source.itemOrigin) {
      if (data.itemOrigin?.ownerCharacterId !== owner.id) throw new Error(`Abweichender Besitzer: ${data.name}`);
      owner.inventory = attachCreatureToInventory(owner, data, now);
    }
    return { id: data.id, create: !prior, data };
  });
  const inventoryChanged = !isDeepStrictEqual(previousOwner?.inventory, owner.inventory);
  if (inventoryChanged) owner.updatedAt = now;
  return { owner, ownerCreate: !previousOwner, inventoryChanged, entries };
}
