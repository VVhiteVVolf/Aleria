import markers from '../../../Karten/Cenyr/tal-der-milane/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/tal-der-milane/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=tal-der-milane-20261019';

export const placesById = createPlaceRegister([...markers.markers, ...markers.unpositionedPlaces], describePlace);
