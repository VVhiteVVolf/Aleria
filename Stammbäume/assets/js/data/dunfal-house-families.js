import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { DUNFAL_HOUSE_DEFINITIONS } from './dunfal-territorial-catalog.js';
import { DUNFAL_HOUSE_PROFILES } from './dunfal-house-profiles.js';

function createDunfalFamily(definition) {
  const houseProfile = DUNFAL_HOUSE_PROFILES[definition.familyId];
  const family = createBlankHouseFamily({
    id: definition.familyId, title: definition.title, emblem: definition.emblem, houseProfile,
    description: `${definition.title} · ${definition.seat}, ${houseProfile.county}, Dunfal. ${definition.extinct ? 'Ausgestorbener Clan. ' : ''}Vorbereitete Familienakte; Personen und Verwandtschaften folgen mit der genealogischen Quelle.`
  });
  return Object.freeze({
    ...family,
    houses: Object.freeze(family.houses.map(house => Object.freeze({
      ...house, id: definition.houseId, status: definition.extinct ? 'extinct' : 'active'
    }))),
    lineage: Object.freeze({
      ...family.lineage, houseId: definition.houseId,
      crestSubtitle: `${definition.seat} · ${houseProfile.county} · Fürstentum Dunfal`,
      crestFrame: definition.kind === 'sept' ? 'iron' : definition.rankId === 'laird' ? 'silver' : 'gold'
    }),
    extensions: Object.freeze({
      ...family.extensions,
      sourceRevision: 1,
      principality: 'Dunfal',
      territorialSource: definition.source,
      sourceInventory: 'assets/data/source-inventories/dunfal-2026-10-07.json',
      sourceNote: `${definition.sourceNote} Die Ratstabellen belegen Ämter, keine Elternschaften oder Ehen. Alle Personendaten bleiben bis zur gesonderten Familienquelle leer.`,
      ...(definition.administrativeRole ? { administrativeRole: definition.administrativeRole } : {}),
      ...(definition.extinct ? { extinctHouse: true } : {})
    })
  });
}

export const DUNFAL_HOUSE_FAMILIES = Object.freeze(DUNFAL_HOUSE_DEFINITIONS.map(createDunfalFamily));
