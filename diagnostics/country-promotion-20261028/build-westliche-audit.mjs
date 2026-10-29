import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve, relative} from 'node:path';
import {houses as aldingenHouses} from '../../Vorschau/Aldingen/house-data.mjs';
import {counties as aldingenCounties, settlements as aldingenSeats} from '../../Vorschau/Aldingen/territory-data.mjs';
import {houses as goldmundHouses, counties as goldmundCounties, regions as goldmundRegions, settlements as goldmundSeats} from '../../Vorschau/Goldmund/realm-data.mjs';
import {houses as weisenfluhHouses, provinces as weisenfluhProvinces, settlements as weisenfluhSeats} from '../../Vorschau/Weisenfluh/realm-data.mjs';
import {FAMILY_REGISTRY} from '../../Stammb%C3%A4ume/assets/js/data/families.registry.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = fileURLToPath(new URL('./westliche-zuordnungen.audit.json', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const normalizeName = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/^(haus |clan |sept )/, '');
const sources = [
 'AGENTS.md', 'Kontinente/AGENTS.md', 'Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md',
 'Stammbäume/DATENPFLEGE.md', 'Stammbäume/assets/js/data/families.registry.js',
 'Stammbäume/assets/js/data/house-hochreuth-family.js', 'Stammbäume/assets/js/data/goldmund-house-profiles.js',
 'Stammbäume/assets/js/data/house-sonnenfels-family.js', 'Stammbäume/assets/js/data/house-weinlaub-family.js',
 'Stammbäume/assets/js/data/weisenfluh-house-profiles.js', 'Stammbäume/assets/js/data/house-helgr-family.js',
 'Stammbäume/assets/js/data/house-aderyn-family.js', 'Stammbäume/assets/js/data/house-marwolaeth-family.js',
 'Stammbäume/assets/js/data/house-morfil-family.js',
 'Vorschau/Aldingen/house-data.mjs', 'Vorschau/Aldingen/territory-data.mjs', 'Vorschau/Aldingen/assets/map.webp',
 'Vorschau/Goldmund/source-houses.mjs', 'Vorschau/Goldmund/realm-data.mjs', 'Vorschau/Goldmund/albic-clans.mjs', 'Vorschau/Goldmund/assets/map.webp',
 'Vorschau/Weisenfluh/source-houses.mjs', 'Vorschau/Weisenfluh/realm-data.mjs', 'Vorschau/Weisenfluh/assets/map.webp'
].map(path => ({path, sha256:digest(readFileSync(resolve(root, path)))}));

const exportPaths = Object.fromEntries(['aldingen','goldmund','weisenfluh'].map(id => [id, `C:/Users/fhg_r/Downloads/${id}-entwurf.json`]));
const exports = Object.fromEntries(Object.entries(exportPaths).map(([id, path]) => [id, JSON.parse(readFileSync(path, 'utf8'))]));
const registryHouseRefs = FAMILY_REGISTRY.flatMap(record => record.family.houses.map(house => ({record,house})));
const publishedDir = resolve(root, 'Stammbäume/assets/data/published-families');
const published = readdirSync(publishedDir).filter(name => name.endsWith('.json') && name !== 'registry.json').map(name => {
 const value = JSON.parse(readFileSync(resolve(publishedDir, name), 'utf8'));
 return {path:relative(root,resolve(publishedDir,name)).replaceAll('\\','/'), value};
});
function publicFamily(value) {
 if (value?.schema === 'aleria.family-tree') return value;
 if (value?.family?.schema === 'aleria.family-tree') return value.family;
 if (value?.document?.family?.schema === 'aleria.family-tree') return value.document.family;
 return null;
}
function counterpartMatches(name) {
 return registryHouseRefs.filter(item => normalizeName(item.house.name) === normalizeName(name)).map(({record,house}) => ({
  familyId:record.id, familyTitle:record.title, houseId:house.id, houseName:house.name,
  ownFamily:record.family.lineage.houseId===house.id,
  persons:record.family.persons.filter(person=>person.houseId===house.id).map(person=>({id:person.id,worldPersonId:person.worldPersonId??null,name:person.name})),
  publishedCounterparts:published.flatMap(item=>{
   const family=publicFamily(item.value);
   if (!family?.houses?.some(h=>h.id===house.id)) return [];
   return [{path:item.path,familyId:family.document.id,personIds:family.persons.filter(p=>p.houseId===house.id).map(p=>p.id)}];
  })
 }));
}
const sourceNameOverrides = {
 aldingen:{rothmann:'Rothman'},
 goldmund:{broeck:'Broek'},
 weisenfluh:{honigfeld:'Honigblüt',weissmann:'Weißmann'}
};
const rankLabels={duke:'Herzog',count:'Graf',freiherr:'Freiherr',junker:'Junker',ministerialer:'Ministerialer',king:'Erlenkönig',order:'Geistlicher Ritterorden'};
const rulers = {
 aldingen:{barenstadt:['ritten','count'],welden:['rosswarth','junker'],borgeln:['rothmann','count'],hasselt:['velten','count'],grimberg:['hohenmund','count'],sassel:['ronnach','junker'],zollern:['truchsen','count'],bruchen:['rebhart','freiherr'],dreiken:['ankerhold','junker'],aldershafen:['adharcan','junker'],klingenhagen:['klingen','duke']},
 goldmund:{thronholt:['goldveld','duke'],brakenstein:['broeck','freiherr'],bregen:['aurelshain','freiherr'],haarlen:['lanette','freiherr'],aldermoor:['herzau','junker'],bramsen:['seidenwarth','freiherr'],niedenfels:['silberhorst','freiherr'],hartenstein:['falkengold','junker']},
 weisenfluh:{ewigensee:['goldkranz','king'],ewiggruen:['rosenbluth','freiherr'],weisshort:['sommerfeld','freiherr'],seeblick:['silberthal','freiherr'],weisslauf:['weissmann','freiherr'],wolfrieden:['wolfenstein','junker'],brueckenwacht:['bruggemann','junker'],silbermundt:['edelweiss','junker'],weissklippe:['sgaireag','junker'],weissthal:['thalmann','junker'],ottersburg:['otterberg','junker'],hohenklamm:['damhcallan','junker'],maehrenfeld:['honigfeld','junker'],aehrensass:['die-ritter-der-kornahre','order']}
};
const realms = {
 aldingen:{name:'Großherzogtum Aldingen',houses:aldingenHouses,seats:aldingenSeats,overlord:'klingen',counties:aldingenCounties},
 goldmund:{name:'Herzogtum Goldmund',houses:goldmundHouses,seats:goldmundSeats,overlord:'goldveld',counties:goldmundCounties,regions:goldmundRegions},
 weisenfluh:{name:'Königreich Weisenfluh',houses:weisenfluhHouses,seats:weisenfluhSeats,overlord:'goldkranz',provinces:weisenfluhProvinces}
};
function rankFor(realm,house,seat) {
 const ruler=rulers[realm][seat];
 if (house.id===ruler[0]) return {id:ruler[1],basis:realm==='aldingen' && ['welden','sassel','dreiken','aldershafen'].includes(seat) || realm==='goldmund' && house.id!=='goldveld' || realm==='weisenfluh' && ['wolfrieden','brueckenwacht','silbermundt','weissklippe','weissthal','ottersburg','hohenklamm'].includes(seat)?'map/location inference as authorized':'latest user instruction'};
 if (realm==='weisenfluh' && ['maehrenfeld','hohenklamm'].includes(seat)) return {id:'ministerialer',basis:'latest user instruction'};
 if (realm==='weisenfluh' && ['ewiggruen','weisslauf','ewigensee'].includes(seat)) return {id:'junker',basis:'inference from corresponding main-seat pattern; user explicitly named ruler only',needsConfirmation:true};
 return {id:'junker',basis:'latest user instruction'};
}
function liegeFor(realm,house,seat) {
 const config=realms[realm], ruler=rulers[realm][seat][0];
 if (house.id!==ruler) return {previewId:ruler,basis:'co-located local ruler specified by user',confidence:'high'};
 if (house.id===config.overlord) return {previewId:null,basis:'sovereign house',confidence:'high'};
 const location=config.seats.find(item=>item.id===seat);
 if (realm==='aldingen') {
  const county=config.counties.find(item=>item.id===location.county);
  const liege=rulers[realm][county.capital][0];
  return {previewId:liege===house.id?config.overlord:liege,basis:'source-map county hierarchy',confidence:house.id==='velten'?'medium':'high',...(house.id==='velten'?{note:'User explicitly grants Graf rank although Hasselt remains inside Grafschaft Borgeln on the map; equal-rank subordination is an inference, not an express user statement.'}:{})};
 }
 if (realm==='weisenfluh') {
  if (seat==='aehrensass') return {previewId:null,basis:'leased order territory; lessor not explicitly named',confidence:'open'};
  const province=config.provinces.find(item=>item.id===location.province);
  const liege=rulers[realm][province.id][0];
  return {previewId:liege===house.id?config.overlord:liege,basis:'source province/folder hierarchy, with user-corrected Ewiggrün ruler',confidence:'high'};
 }
 if (seat==='aldermoor') return {previewId:null,realmOverlord:'goldveld',basis:'Aurelmark county ruler not named; immediate lord not proven',confidence:'open'};
 if (location.county==='kronenau') return {previewId:config.overlord,basis:'ducal county on source map after user correction',confidence:'high'};
 return {previewId:null,realmOverlord:'goldveld',basis:'county exists but no gräflicher Hauptsitz or Grafenhaus is named on supplied map',confidence:'open'};
}
const realmReports = Object.entries(realms).map(([realm,config])=>{
 const draft=exports[realm];
 const houses=config.houses.map(house=>{
  const seatId=draft.placements[house.id];
  const location=config.seats.find(item=>item.id===seatId);
  const rank=rankFor(realm,house,seatId);
  const matches=counterpartMatches(house.name);
  const displayName=sourceNameOverrides[realm][house.id]??house.name;
  const ownFamily=matches.find(match=>match.ownFamily);
  const knownHouseIds=[...new Set(matches.map(match=>match.houseId))];
  return {previewId:house.id,sourceName:house.name,displayName,clan:Boolean(house.clan||house.rank==='laird'),
   ...(house.rank==='laird'?{culturalTitle:'Laird',culturalTitleStatus:realm==='aldingen'&&house.id==='sgiathan'?'unofficial by express user instruction':'cultural/source title; formal rank follows new hierarchy'}:{}),
   canonicalFamilyId:ownFamily?.familyId??null,canonicalHouseId:knownHouseIds.length===1?knownHouseIds[0]:null,
   canonicalIdentityStatus:ownFamily?'reuse existing family':matches.length?'reuse existing counterpart house identity; own family not registered':'new house; no matching canonical registry identity',
   seatId,seatName:realm==='goldmund'&&seatId==='hartenstein'?'Hartenfels':realm==='weisenfluh'&&seatId==='weisshort'?'Weishort':realm==='weisenfluh'&&seatId==='weisslauf'?'Weislauf':location.name,
   sourceSeatName:location.name,sourceSeatKind:location.kind,sourceAdministrativeGroup:location.county??location.province??null,
   rulerAtSeat:rulers[realm][seatId][0],isSeatRuler:rulers[realm][seatId][0]===house.id,
   rank:{...rank,label:rankLabels[rank.id]},liege:liegeFor(realm,house,seatId),
   sourcePlacement:house.sourceSeat??null,placementChanged:(house.sourceSeat??null)!==seatId,
   crest:house.crest,fullsize:house.fullsize??null,counterpartMatches:matches};
 });
 return {id:realm,name:config.name,export:{path:exportPaths[realm],sha256:digest(readFileSync(exportPaths[realm])),schemaVersion:draft.schemaVersion,placementCount:Object.keys(draft.placements).length,houseCount:config.houses.length,complete:config.houses.every(h=>draft.placements[h.id]&&config.seats.some(s=>s.id===draft.placements[h.id])),unknownIds:Object.keys(draft.placements).filter(id=>!config.houses.some(h=>h.id===id)),design:draft.design??null},
  administrativeGroups:config.counties??config.provinces,regions:config.regions??null,houses};
});
const specialFamilies=['haus-von-hochreuth','haus-weinlaub','haus-sonnenfels'].map(id=>{
 const record=FAMILY_REGISTRY.find(item=>item.id===id), family=record.family;
 return {familyId:id,title:family.document.title,houseId:family.lineage.houseId,existingProfile:family.document.houseProfile,existingSourceRevision:family.extensions.sourceRevision??null,
  persons:family.persons.map(p=>({id:p.id,worldPersonId:p.worldPersonId??null,houseId:p.houseId,name:p.name})),
  partnershipIds:family.partnerships.map(pair=>pair.id),parentageIds:family.parentages.map(link=>link.id),
  promotion:id==='haus-weinlaub'?{rank:'Ministerialer',seat:'Burg Rebenwacht nahe Ewigensee',seatId:'ewigensee',liegePreviewId:'goldkranz',basis:'Existing profile explicitly locates Rebenwacht near Ewigensee; current user specifies Ministerialer'}:
   id==='haus-sonnenfels'?{rank:'Ministerialer',seat:'Burg Sonnenfels',seatId:null,liegePreviewId:null,basis:'Existing family and public biography establish southern Weisenfluh only; no source establishes province or liege'}:
   {rank:'Ministerialer',seat:'Burg Hochreuth',seatId:null,liegeHouseId:'house-roden',liegeFamilyId:'haus-roden',basis:'Existing Goldmund family belongs to Roden; exact castle not on supplied map. Preserve 1736 succession and all identities.'}};
});
const audit={schema:'aleria.country-promotion.source-audit',schemaVersion:1,date:'2026-10-28',scope:['aldingen','goldmund','weisenfluh'],kind:'bounded research; no production or Firebase changes',
 sourcePriority:['latest explicit user correction','exported seat placements','existing canonical identities and counterpart people','supplied map and folder source','previous preview labels'],
 mapsActuallyViewed:['Vorschau/Aldingen/assets/map.webp','Vorschau/Goldmund/assets/map.webp','Vorschau/Weisenfluh/assets/map.webp'],sources,
 registry:{familyCount:FAMILY_REGISTRY.length,publishedTopLevelFilesChecked:published.length,privateSourcesRead:false},realms:realmReports,specialFamilies,
 namingDecisions:[
  {realm:'aldingen',previewId:'rothmann',sourceName:'Rothmann',displayName:'Rothman',basis:'latest user spelling; preserve source key'},
  {realm:'goldmund',previewId:'broeck',sourceName:'Broeck',displayName:'Broek',basis:'latest user spelling; earlier source/README explicitly used Broeck'},
  {realm:'weisenfluh',previewId:'honigfeld',sourceName:'Honigfeld',displayName:'Honigblüt',basis:'latest user spelling; every previous source and original file uses Honigfeld'},
  {realm:'weisenfluh',previewId:'weissmann',sourceName:'Weissmann',displayName:'Weißmann',basis:'latest user spelling; preserve house-weissmann counterpart identity'},
  {realm:'goldmund',seatId:'hartenstein',regionId:'hartenfels',sourceName:'Hartenstein',displayName:'Hartenfels',basis:'latest repeated user naming, as clarified by parent; preserve hartenstein seat key and Hartenstein map alias'},
  {realm:'weisenfluh',seatId:'weisshort',sourceName:'Weisshort / Weißhort',displayName:'Weishort',basis:'latest user spelling; preserve stable key'},
  {realm:'weisenfluh',seatId:'weisslauf',sourceName:'Weisslauf / Weißlauf',displayName:'Weislauf',basis:'latest user spelling; preserve stable key'}
 ],
 collisions:[
  {name:'Velten',items:[{realm:'aldingen',previewId:'velten',motif:'purpurfarbenes Segelschiff',rank:'Graf',seatId:'hasselt'},{realm:'goldmund',previewId:'gueldenfels',motif:'goldener Steinbock',rank:'Junker',seatId:'brakenstein'}],canonicalRegistryMatches:counterpartMatches('Velten'),decision:'distinct supplied houses; never merge by surname. Use distinct realm-qualified canonical IDs if allocating new identities.'},
  {name:'Rosenblüth',previewId:'rosenbluth',canonicalHouseId:'house-rosenblueth',decision:'reuse canonical ue spelling in identity; retain preview source ID for assets/export'},
  {name:'Halbrecht',canonicalHouseId:'house-halbrecht',counterpartFamily:'haus-helgr',personId:'ludmilla-halbrecht'},
  {name:'Weißmann',canonicalHouseId:'house-weissmann',counterpartFamilies:['haus-helgr','haus-marwolaeth'],personIds:['gideon-weissmann','josephine-weissmann']},
  {name:'Rosenstolz',canonicalHouseId:'house-rosenstolz',counterpartFamily:'haus-aderyn',personId:'nurit-rosenstolz'},
  {name:'Roden',canonicalHouseId:'house-roden',counterpartFamily:'haus-von-hochreuth',personId:'charlotte-roden-spouse'}
 ],
 ambiguities:[
  {id:'sonnenfels-location',severity:'unresolved exact geography',detail:'Burg Sonnenfels is not a named point on this supplied map. Only southern Weisenfluh and its existing family are proven. Preserve castle seat and leave specific province/liege open; no invented relocation.'},
  {id:'goldmund-county-lieges',severity:'unresolved immediate lord',detail:'Aurelmark and Edelstrom are labelled Grafschaft, but no source labels one of their seats gräflich and user names no Graf. Main Baronien imply Freiherren, Hartenfels/Aldermoor imply Junker; immediate Grafenhaus remains unknown. Do not silently promote Arenberg/Lanvier/Berden to Graf or assert direct sovereign vassalage.'},
  {id:'hasselt-count',severity:'explicit rank with inferred hierarchy',detail:'User makes Velten Graf at Hasselt. Map shows Hasselt as Baronie within Borgeln; provisional liege Rothman comes from map hierarchy only and should remain separately qualified.'},
  {id:'weisenfluh-remaining-main-seat-ranks',severity:'inference',detail:'Non-ruling residents of Ewiggrün, Weislauf and Ewigensee are marked Junker by analogous specified main-seat pattern. The task text expressly stated others Junker at Weishort/Seeblick only; these remaining ranks are not individually express statements.'},
  {id:'aehrensass-lord',severity:'unresolved lessor',detail:'Order territory is explicitly leased; source does not name lessor. Preserve order identity and leave liege open.'},
  {id:'historical-titles',severity:'scope boundary',detail:'Current country-specific rank terms change to Freiherr/Junker/Ministerialer. Historical 1736 accounts and foreign Cenyr ranks must not be globally search-replaced.'}
 ]};
writeFileSync(output,JSON.stringify(audit,null,2)+'\n','utf8');
console.log(JSON.stringify({output,realms:realmReports.map(r=>({id:r.id,houses:r.houses.length,complete:r.export.complete})),specialFamilies:specialFamilies.map(f=>({id:f.familyId,persons:f.persons.length})),published:published.length},null,2));
