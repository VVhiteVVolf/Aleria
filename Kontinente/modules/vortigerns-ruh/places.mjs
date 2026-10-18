import source from '../../../Karten/Cenyr/vortigerns-ruh/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/vortigerns-ruh/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';

// The map import and the territory registers use the same recorded place names
// and symbols. Territory ownership of each register remains with its page data.
export const placesById = createPlaceRegister(source.markers, describePlace);
