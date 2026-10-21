import markers from '../../../Karten/Aldrimar/roriksheim/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Aldrimar/roriksheim/places.mjs?v=roriksheim-20261020';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=roriksheim-20261020';

const positionedIds = new Set(markers.markers.map(marker => marker.id));
const register = createPlaceRegister([...markers.markers, ...markers.unpositionedPlaces], describePlace);

// Both the territory card and its map detail use the same description and owner.
export const placesById = new Map([...register].map(([id, place]) => [id, Object.freeze({
  ...place,
  href: positionedIds.has(id) ? `/Karten/karte.html?map=aldrimar-roriksheim&pin=${encodeURIComponent(id)}` : '',
})]));
