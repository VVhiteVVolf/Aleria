import source from '../../../Karten/Cenyr/klaueninseln/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/klaueninseln/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=klaueninseln-20261019';

export const placesById = createPlaceRegister([...source.markers, ...source.unpositionedPlaces], describePlace);
