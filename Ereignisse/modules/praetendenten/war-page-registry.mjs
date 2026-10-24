import { FACTIONS,WAR_EVENTS } from './praetendenten-data.mjs';

// Only completed, illustrated pages are registered. Prepared source entries are not links.
export const WAR_PAGES=Object.freeze([
  {id:'krieg',file:'index.html',kind:'hub'},
  ...FACTIONS.map(faction=>({id:faction.id,file:faction.file,kind:'faction',faction:faction.id})),
  ...WAR_EVENTS.filter(event=>event.file).map(event=>({id:event.id,file:event.file,kind:'event'}))
].map(Object.freeze));
