import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260905-archive-order-v2';

// Existing CK2 assets; explicit archive assignments always take precedence.
const rules = [
  [/frohnatur/, 'Gregarious'],
  [/gutmensch/, 'Kind'],
  [/kunstler|kunstlerin/, 'Poet'],
  [/busenwunder/, 'Attractive'],
  [/arkane ausbildung/, 'Mystic'],
  [/marschall/, 'Strategist'],
  [/waffenmeister|meister vieler formen/, 'Duelist'],
  [/mentor/, 'Scholar'],
  [/in die jahre/, 'Scholar'],
  [/punktlich|pflicht vor/, 'Conscientious'],
  [/standfest/, 'Unyielding_leader'],
  [/zweifel/, 'Cynical'],
  [/trockener humor/, 'Brooding'],
  [/scharfsinnig/, 'Shrewd'],
  [/jagerauge/, 'Hunter'],
  [/gewissen|vorbereitung|fleiss|fleiß|handwerk/, 'Diligent'],
  [/schutzpflicht|beschutzer|gefog|gefolgschaft|treue|loyal/, 'Defensive_leader'],
  [/mutters|familie/, 'Family_focus'],
  [/dufte|duft|eitel|gepflegt/, 'Groomed'],
  [/tapfer|mutig|furchtlos/, 'Brave'],
  [/feige|furchtsam/, 'Craven'],
  [/ritter|standespflicht|cenyri kultur/, 'Cavalry_leader'],
  [/religios|kirchlich|fromm|glaub/, 'Zealous'],
  [/naturverbunden|wald|jagd/, 'Hunter'],
  [/widerstand|zahigkeit|soldnerharte/, 'Sturdy'],
  [/gelehrt|grundwissen|wissbegier|neugier/, 'Scholar'],
  [/zirkel|verschwiegen|geheimnis/, 'Intrigue_focus'],
  [/strassenschlau|listig|verschlagen/, 'Shrewd'],
  [/buhne|publikum|musik|gesang|dicht/, 'Poet'],
  [/ehrlich|aufrichtig/, 'Honest'],
  [/gerecht|ehrenhaft/, 'Just'],
  [/geduldig|besonnen/, 'Patient'],
  [/zorn|wut|reizbar|jahzorn/, 'Wroth'],
  [/stolz|hochmut/, 'Proud'],
  [/bescheiden|demut/, 'Humble'],
  [/gutig|hilfsbereit|mitgefuhl/, 'Kind'],
  [/gesellig|kontaktfreud/, 'Gregarious'],
  [/schuchtern|scheu/, 'Shy'],
  [/ehrgeiz/, 'Ambitious'],
  [/gierig|habgier/, 'Greedy'],
  [/starrsinn|stur|eigensinn/, 'Stubborn'],
  [/trunk|alkohol|trinkt/, 'Drunkard'],
  [/grausam|sadist/, 'Cruel'],
  [/misstrau|paranoi/, 'Paranoid'],
  [/grosszug|freigebig/, 'Charitable']
];

export function getArchiveTraitIconSource(entry = {}) {
  const name = normalizeArchiveSearchText(entry.name || entry.data?.name);
  const file = rules.find(([pattern]) => pattern.test(name))?.[1];
  return file ? new URL(`../../../IconOrdner/Traits Icon/${file}.png`, import.meta.url).href : '';
}

export const archiveTraitIconFiles = Object.freeze([...new Set(rules.map(([, file]) => `${file}.png`))]);
