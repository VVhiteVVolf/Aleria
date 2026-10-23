import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Aldrimar/ivarsheim/places.mjs';

importReviewedTerritory({
  folder: new URL('../Aldrimar/ivarsheim/', import.meta.url),
  region: 'Ivarsheim', countyId: 'jarltum-ivarsheim',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
