import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/sonnenkueste/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/sonnenkueste/', import.meta.url),
  region: 'Sonnenküste', countyId: 'grafschaft-sonnenkueste',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
