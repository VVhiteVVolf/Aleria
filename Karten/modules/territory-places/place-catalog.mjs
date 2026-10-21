// Reviewed map snapshots and territory registers share the same regional catalog.
export function createPlaceCatalog(territorySource, placeSource) {
  const territoriesById = new Map(territorySource.territories.map(territory => [territory.id, Object.freeze(territory)]));
  const descriptionsById = new Map(placeSource.descriptions.map(place => [place.id, Object.freeze(place)]));
  function describePlace(marker) {
    const territory = territoriesById.get(marker.territoryId);
    if (!territory) throw new Error(`Unbekannte Herrschaft für ${marker.id}`);
    const description = descriptionsById.get(marker.id);
    const ruler = description?.ruler || territory;
    return {
      territory, house: ruler.house,
      houseHref: ruler.familyId ? `/Stammbäume/Stammbaum.html?family=${ruler.familyId}&mode=view` : '',
      crest: ruler.crest, banner: ruler.banner,
      bannerHref: ruler.bannerHref || territory.bannerHref || territory.href,
      ...(territory.coRulers?.length ? { coRulers: territory.coRulers } : {}),
      text: description?.text || '', trade: description?.trade || '',
      faction: description?.faction || '', fields: description?.fields || {},
    };
  }
  return Object.freeze({ territoriesById, descriptionsById, describePlace });
}

export function createPlaceRegister(markers, describePlace) {
  return new Map(markers.map(marker => {
    const details = describePlace(marker);
    return [marker.id, Object.freeze({
      id: marker.id, name: marker.title, type: marker.category,
      iconSrc: marker.icon, iconAlt: `${marker.category}: ${marker.title}`,
      house: details.house, houseHref: details.houseHref, description: details.text,
      ...(details.coRulers?.length ? { coRulers: details.coRulers } : {}),
    })];
  }));
}
