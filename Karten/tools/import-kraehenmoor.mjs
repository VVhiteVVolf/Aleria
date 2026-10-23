import { importReviewedTerritory } from './reviewed-territory-import.mjs';
import { describePlace, territoriesById } from '../Aldrimar/kraehenmoor/places.mjs';

importReviewedTerritory({
  folder: new URL('../Aldrimar/kraehenmoor/', import.meta.url),
  region: 'Krähenmoor', countyId: 'jarltum-kraehenmoor',
  describePlace, territoriesById, write: process.argv.includes('--write'),
});
