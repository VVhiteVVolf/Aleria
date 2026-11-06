import { normalizeArchiveSearchText } from './character-archive-model.js?v=20260928-equipment-art-v4';

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
  [/jagerauge|auge des jagers/, 'Hunter'],
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
  [/grosszug|freigebig/, 'Charitable'],
  // Ordinary background notes are also indexed as descriptive archive traits.
  // Exact names keep these suggestions scoped; assigned icons retain priority.
  [/^arbeit unter tage und prufender blick$/, 'Diligent'],
  [/^bestandsfuhrung und organisatorische praxis$/, 'Administrator'],
  [/^botengange und wegekenntnis$/, 'Organizer'],
  [/^burgerlicher alltag und nachbarschaftserfahrung$/, 'Socializer'],
  [/^decksroutine und sichere hand am tau$/, 'Adventurer'],
  [/^fangpraxis und gewasserkenntnis$/, 'Hunter'],
  [/^gastwirtschaft und umgang mit gasten$/, 'Gregarious'],
  [/^gerichtsroutine und sorgfaltige aufnahme von aussagen$/, 'Just'],
  [/^gespannfuhrung und strassenerfahrung$/, 'Cavalry_leader'],
  [/^haushaltsroutine und aufmerksamer dienst$/, 'Administrator'],
  [/^heimlicher warenverkehr$/, 'Deceitful'],
  [/^herdenpflege und wachsamer weideblick$/, 'Patient'],
  [/^kaufmannische erfahrung$/, 'Business_focus'],
  [/^krankenpflege und ruhige untersuchung$/, 'Court_physician'],
  [/^kuchenpraxis und zutatenkenntnis$/, 'Diligent'],
  [/^pflanzenkenntnis und krauterpraxis$/, 'Gardener'],
  [/^politische verantwortung und verhandlungspraxis$/, 'Grey_eminence'],
  [/^routine in korperlicher alltagsarbeit$/, 'Sturdy'],
  [/^schrift und aktenpraxis$/, 'Scholar'],
  [/^truppendienst und verlassliche wachroutine$/, 'Heavy_infantry_leader'],
  [/^vermittlung und gesandtschaftserfahrung$/, 'Grey_eminence'],
  [/^wachdienst und aufmerksamkeit fur unruhe$/, 'Defensive_leader']
];

export function getArchiveTraitIconSource(entry = {}) {
  const name = normalizeArchiveSearchText(entry.name || entry.data?.name);
  const file = rules.find(([pattern]) => pattern.test(name))?.[1];
  return file ? new URL(`../../../IconOrdner/Traits Icon/${file}.png`, import.meta.url).href : '';
}

export const archiveTraitIconFiles = Object.freeze([...new Set(rules.map(([, file]) => `${file}.png`))]);
