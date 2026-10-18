import source from '../../../Karten/Cenyr/sonnenkueste/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/sonnenkueste/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';

export const placesById = createPlaceRegister([...source.markers, ...source.unpositionedPlaces], describePlace);
