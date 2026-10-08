import { BRANN_SOURCE_PERSONS, BRANN_SOURCE_PARTNERSHIPS, BRANN_SOURCE_HOUSES } from './brann-source-records.js';
import { BRANN_SOURCE_PORTRAITS } from './brann-source-portraits.js';

export const BRANN_SOURCE_CATALOG = Object.freeze({
  persons: BRANN_SOURCE_PERSONS,
  partnerships: BRANN_SOURCE_PARTNERSHIPS,
  houses: BRANN_SOURCE_HOUSES,
  portraits: BRANN_SOURCE_PORTRAITS,
  inventory: 'assets/data/source-inventories/brann-families-2026-10-08.json'
});
