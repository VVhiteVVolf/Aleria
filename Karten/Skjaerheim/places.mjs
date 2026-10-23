import source from './territories.import.json' with {type:'json'};
export const territoriesById=new Map(source.territories.map(t=>[t.id,Object.freeze(t)]));
