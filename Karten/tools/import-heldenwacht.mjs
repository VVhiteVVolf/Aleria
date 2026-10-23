import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Aldrimar/heldenwacht/places.mjs';

importReviewedTerritory({
  folder: new URL('../Aldrimar/heldenwacht/', import.meta.url),
  region: 'Heldenwacht', countyId: 'jarltum-heldenwacht',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
