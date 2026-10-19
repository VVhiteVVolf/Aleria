import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/silberinsel/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/silberinsel/', import.meta.url),
  region: 'Silberinsel', countyId: 'grafschaft-silberinsel',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
