import source from '../../../Karten/Cenyr/vortigerns-ruh/markers.source.json' with { type: 'json' };

// The map import and the territory registers use the same recorded place names
// and symbols. Territory ownership of each register remains with its page data.
export const placesById = new Map(source.markers.map(marker => [marker.id, Object.freeze({
  id: marker.id,
  name: marker.title,
  type: marker.category,
  iconSrc: marker.icon,
  iconAlt: `${marker.category}: ${marker.title}`,
})]));