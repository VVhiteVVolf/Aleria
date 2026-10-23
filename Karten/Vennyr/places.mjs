import source from './territories.import.json' with {type:'json'};
export const territoriesById=new Map(source.territories.map(territory=>[territory.id,Object.freeze(territory)]));
