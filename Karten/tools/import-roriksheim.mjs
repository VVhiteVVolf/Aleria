import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Aldrimar/roriksheim/places.mjs';

importReviewedTerritory({
  folder: new URL('../Aldrimar/roriksheim/', import.meta.url),
  region: 'Roriksheim', countyId: 'jarltum-roriksheim',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
