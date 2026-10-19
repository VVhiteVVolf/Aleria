import source from '../../../Karten/Cenyr/aehrental/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/aehrental/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';

export const placesById = createPlaceRegister([...source.markers, ...source.unpositionedPlaces], describePlace);
