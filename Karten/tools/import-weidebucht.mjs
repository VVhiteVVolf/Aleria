import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Cenyr/weidebucht/places.mjs';

importReviewedTerritory({
  folder: new URL('../Cenyr/weidebucht/', import.meta.url),
  region: 'Weidebucht', countyId: 'grafschaft-weidebucht',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
