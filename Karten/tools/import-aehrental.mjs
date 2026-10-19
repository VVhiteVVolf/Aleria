import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/aehrental/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/aehrental/', import.meta.url),
  region: 'Ährental', countyId: 'grafschaft-aehrental',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
