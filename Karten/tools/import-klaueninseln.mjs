import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/klaueninseln/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/klaueninseln/', import.meta.url),
  region: 'Klaueninsel', countyId: 'grafschaft-klaueninsel',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
