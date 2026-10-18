import source from './places.source.json' with { type: 'json' };
import territorySource from './territories.source.json' with { type: 'json' };

export const territoriesById = new Map(territorySource.territories.map(territory => [territory.id, Object.freeze(territory)]));
export const descriptionsById = new Map(source.descriptions.map(place => [place.id, Object.freeze(place)]));

// Shared by the reviewed map snapshot and the territory-page register.
export function describePlace(marker) {
  const territory = territoriesById.get(marker.territoryId);
  if (!territory) throw new Error(`Unbekannte Herrschaft für ${marker.id}`);
  const description = descriptionsById.get(marker.id);
  return {
    territory,
    house: territory.house,
    houseHref: `/Stammbäume/Stammbaum.html?family=${territory.familyId}&mode=view`,
    crest: territory.crest,
    banner: territory.banner,
    text: description?.text || '',
    trade: description?.trade || '',
    faction: description?.faction || '',
    fields: description?.fields || {},
  };
}
