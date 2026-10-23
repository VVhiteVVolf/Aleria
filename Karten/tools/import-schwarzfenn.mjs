import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Aldrimar/schwarzfenn/places.mjs';

importReviewedTerritory({
  folder: new URL('../Aldrimar/schwarzfenn/', import.meta.url),
  region: 'Schwarzfenn', countyId: 'jarltum-schwarzfenn',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
