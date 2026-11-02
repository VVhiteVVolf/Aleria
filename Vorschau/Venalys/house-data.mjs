import source from './house-catalog.json' with { type: 'json' };
export const houses = Object.freeze(source.houses.map(h => Object.freeze(h)));
