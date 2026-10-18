import source from '../../../Karten/Cenyr/vortigerns-ruh/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/vortigerns-ruh/places.mjs';

// The map import and the territory registers use the same recorded place names
// and symbols. Territory ownership of each register remains with its page data.
export const placesById = new Map(source.markers.map(marker => {
  const details = describePlace(marker);
  return [marker.id, Object.freeze({
    id: marker.id,
    name: marker.title,
    type: marker.category,
    iconSrc: marker.icon,
    iconAlt: `${marker.category}: ${marker.title}`,
    house: details.house,
    houseHref: details.houseHref,
    description: details.text,
  })];
}));
