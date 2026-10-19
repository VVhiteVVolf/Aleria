import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/tal-der-milane/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/tal-der-milane/', import.meta.url),
  region: 'Tal der Milane', countyId: 'grafschaft-tal-der-milane',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
