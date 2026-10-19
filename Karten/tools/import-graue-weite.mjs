import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/graue-weite/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/graue-weite/', import.meta.url),
  region: 'Graue Weite', countyId: 'grafschaft-graue-weite',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
