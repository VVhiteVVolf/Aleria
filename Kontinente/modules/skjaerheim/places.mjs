import source from './places.source.json' with {type:'json'};
export const placesById=new Map(source.places.map(p=>[p.id,Object.freeze(p)]));
