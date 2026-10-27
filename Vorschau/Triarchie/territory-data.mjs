import {occupationCounties,occupiedSettlements} from '../shared/lothir-occupation.mjs';
export const counties=occupationCounties;
export const settlements=occupiedSettlements;
export const territoryArt=Object.freeze([...counties.map(c=>({...c,kind:c.title})),...settlements.map(s=>({...s,name:s.regionName}))].map(t=>Object.freeze({...t,id:t.art,shape:t.originRealm==='iathneach'?'banner':'kite',image:`assets/territories/${t.art}.webp`,fullsize:`assets/production/${t.art}.png`})));
