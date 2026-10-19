import markers from '../../../Karten/Cenyr/graue-weite/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/graue-weite/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=graue-weite-20261019';

export const placesById = createPlaceRegister([...markers.markers, ...markers.unpositionedPlaces], describePlace);
