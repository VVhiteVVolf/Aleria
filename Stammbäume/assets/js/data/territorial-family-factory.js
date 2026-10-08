import { createBlankHouseFamily } from './blank-house-family-factory.js';

// Gemeinsame Quellenhülle für territoriale Vorbereitungen ohne Genealogie.
export function createTerritorialBlankFamily({ definition, houseProfile, principality, sourceInventory }) {
  const family = createBlankHouseFamily({
    id: definition.familyId, title: definition.title, emblem: definition.emblem, houseProfile,
    description: `${definition.title} · ${[definition.seat, houseProfile.county, principality].filter(Boolean).join(', ')}. ${definition.extinct ? 'Ausgestorbener Clan. ' : ''}${definition.preparationNote ? `${definition.preparationNote} ` : ''}Vorbereitete Familienakte; Personen und Verwandtschaften folgen mit der genealogischen Quelle.`
  });
  return Object.freeze({
    ...family,
    houses: Object.freeze(family.houses.map(house => Object.freeze({
      ...house, id: definition.houseId, status: definition.houseStatus || (definition.extinct ? 'extinct' : 'active')
    }))),
    lineage: Object.freeze({
      ...family.lineage, houseId: definition.houseId,
      crestSubtitle: [...[definition.seat, houseProfile.county].filter(Boolean), `Fürstentum ${principality}`].join(' · '),
      crestFrame: definition.kind === 'sept' ? 'iron' : definition.rankId === 'laird' ? 'silver' : 'gold'
    }),
    extensions: Object.freeze({
      ...family.extensions,
      sourceRevision: 1,
      principality,
      territorialSource: definition.source,
      sourceInventory,
      sourceNote: `${definition.sourceNote} Die Ratstabellen belegen Ämter, keine Elternschaften oder Ehen. Alle Personendaten bleiben bis zur gesonderten Familienquelle leer.`,
      ...(definition.administrativeRole ? { administrativeRole: definition.administrativeRole } : {}),
      ...(definition.extinct ? { extinctHouse: true } : {})
    })
  });
}
