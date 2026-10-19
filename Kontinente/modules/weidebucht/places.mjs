import source from '../../../Karten/Cenyr/weidebucht/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/weidebucht/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=weidebucht-20261019';

export const placesById = createPlaceRegister([...source.markers, ...source.unpositionedPlaces], describePlace);
