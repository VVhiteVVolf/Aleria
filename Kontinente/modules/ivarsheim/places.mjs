import markers from '../../../Karten/Aldrimar/ivarsheim/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Aldrimar/ivarsheim/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';

export const placesById = new Map([...createPlaceRegister(markers.markers, describePlace)].map(([id, place]) => [id, Object.freeze({
  ...place, href: `/Karten/karte.html?map=aldrimar-ivarsheim&pin=${encodeURIComponent(id)}`,
})]));
