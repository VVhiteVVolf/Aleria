import {houses} from './house-data.mjs';
import {counties,settlements,territoryArt} from './territory-data.mjs';
import {warriors} from './warrior-data.mjs';
import {context} from './realm-context.mjs';
import {createPlacementState,createMapProposal} from './placement-state.mjs';
import {mountCountryWorkbench} from '../shared/country-workbench/mount.mjs';
mountCountryWorkbench({houses,counties,settlements,territoryArt,warriors,context,createPlacementState,createMapProposal});
