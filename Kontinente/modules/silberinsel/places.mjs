import source from '../../../Karten/Cenyr/silberinsel/markers.source.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Cenyr/silberinsel/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs?v=silberinsel-20261019';

export const placesById = createPlaceRegister([...source.markers, ...source.unpositionedPlaces], describePlace);
