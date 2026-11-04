import { PATRICK_BIOGRAPHY_SOURCE } from './biography-source.generated.mjs';
import * as PatrickBiographyArtwork from './biography-assets.mjs';
import { planPatrickBiographyIcons } from './biography-icon-plan.mjs';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from './biography-identities.mjs';
import { buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';

const { PATRICK_BIOGRAPHY_ASSETS }=PatrickBiographyArtwork;
export function resolvePatrickBiographyAsset(value){
  return (PatrickBiographyArtwork.PATRICK_BIOGRAPHY_ASSET_ALIASES||{})[value]||PATRICK_BIOGRAPHY_SOURCE.assetRewrites[value]||value;
}

export const PATRICK_BIOGRAPHY_ENTRIES = Object.freeze(PATRICK_BIOGRAPHY_SOURCE.entries);
export function getPatrickBiographySource(identity) {
  return PATRICK_BIOGRAPHY_ENTRIES.find(row=>[row.key,row.characterId,row.worldPersonId,row.personId].includes(identity))||null;
}

export function getPatrickBiographyPersonFields(identity){
  const source=getPatrickBiographySource(identity);
  if(!source)throw Error('Unbekannte geprüfte Biografieperson.');
  const fields=structuredClone(source.personFields);
  if(fields.portrait)fields.portrait=resolvePatrickBiographyAsset(fields.portrait);
  return fields;
}

// The profile's short introduction is separate from its complete authored
// biography. Rhiannon's former service role predates her reviewed heraldic
// office; derive both current values from that same approved source.
export function getPatrickBiographyCharacterMetadata(identity){
  const source=getPatrickBiographySource(identity);
  if(source?.characterId!==RHIANNON_CHARACTER_ID)return {};
  const opening=source.biographyModule.biography.biographyText.match(/^<p>([^<>]+)<\/p>/);
  if(!opening||!source.personFields.title)throw Error('Die belegte Rollen-Kurzfassung fehlt.');
  return {role:source.personFields.title,bio:opening[1]};
}

// This standalone function is also emitted into the existing classic-script
// biography bridge. One implementation owns the exact approved table repairs.
export function applyPatrickBiographyStatCorrections(stats=[],corrections=[]) {
  const result=stats.map(row=>Array.isArray(row)?{label:String(row[0]??''),value:String(row[1]??'')}:{...row});
  for(const correction of corrections){
    const matches=result.filter(row=>row.label===correction.label);
    if(matches.length>1)continue;
    const row=matches[0];
    if(!row){if(correction.previous===undefined)result.push({label:correction.label,value:correction.value});continue;}
    if(row.value===correction.value)continue;
    if((correction.previous!==undefined&&row.value===correction.previous)||(!row.value&&correction.previous===undefined))row.value=correction.value;
  }
  return result;
}

export function preparePatrickBiographyModule(module,identity,{assetMap=PATRICK_BIOGRAPHY_ASSETS}={}) {
  const source=getPatrickBiographySource(identity);
  if(!source)throw Error('Unbekannte Identität außerhalb der geprüften Biografien.');
  if(module===null||module?.disabled===true)return module;
  const result=structuredClone(module===undefined?source.biographyModule:module);
  if(!result.biography)throw Error('Die aktuelle Biografie fehlt.');
  result.stats=applyPatrickBiographyStatCorrections(result.stats||[],source.statCorrections);
  const icons=planPatrickBiographyIcons(source.characterId,result.biography.abilities||[],assetMap);
  if(icons.pending.length)throw Error('Die gemeinsame Biografiequelle hat noch nicht zugeordnete Icons.');
  if(icons.assignments.length)result.biography.abilities=icons.abilities;
  const rewrite=(value,field='')=>{
    if(Array.isArray(value))return value.map(child=>rewrite(child,field));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,rewrite(child,key)]));
    return ['portrait','portraitStages','image','icon'].includes(field)&&typeof value==='string'
      ? resolvePatrickBiographyAsset(value):value;
  };
  result.biography=rewrite(result.biography);
  for(const supplement of source.connectionImageSupplements||[]){
    const matches=(result.biography.connections||[]).filter(row=>row.type!=='heading'&&row.name===supplement.name);
    if(matches.length===1&&!matches[0].image)matches[0].image=supplement.image;
  }
  return result;
}

export const buildPatrickBiographyModule=(identity,options)=>preparePatrickBiographyModule(undefined,identity,options);

export function buildPatrickBiographyCatalogEntries() {
  return PATRICK_BIOGRAPHY_ENTRIES.map(row=>({key:row.key,name:row.name,characterIds:[row.characterId],worldPersonIds:[row.worldPersonId],personIds:[row.personId],moduleRefs:[],
    biography:buildPatrickBiographyModule(row.key),source:'AleriaAlmanach/modules/patrick-biographies/source/biographies-2026-11-03.json',
    replacedFingerprints:[...row.narrativeFingerprints],statCorrections:row.statCorrections}));
}

// Current online records own every unrelated field and all of their authored
// prose. Only the reviewed person metadata, missing icons and exact table
// corrections are applied. No inventory, creature or combat data are created.
export function preparePatrickBiographyCharacters(currentCharacters,{now,assetMap=PATRICK_BIOGRAPHY_ASSETS}={}) {
  if(!Array.isArray(currentCharacters)||!Number.isFinite(Date.parse(now)))throw Error('Aktuelle Personen und gültiger Prüfzeitpunkt erforderlich.');
  const allowed=new Set([CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID,GWEN_CHARACTER_ID]),byId=new Map();
  for(const character of currentCharacters){
    if(!allowed.has(character.id)||byId.has(character.id))throw Error('Unbekannte oder doppelte Biografieperson.');
    const source=getPatrickBiographySource(character.id),world=character.identity?.worldPersonId||character.genealogy?.worldPersonId;
    if(world&&world!==source.worldPersonId)throw Error('Abweichende explizite Weltperson.');
    byId.set(character.id,character);
  }
  for(const id of [CADOGAN_CHARACTER_ID,RHIANNON_CHARACTER_ID])if(!byId.has(id))throw Error('Eine bestehende Hauptakte wurde nicht aktuell eingelesen.');
  return PATRICK_BIOGRAPHY_ENTRIES.map(source=>{
    const current=byId.get(source.characterId),character=current?structuredClone(current):{
      ...buildImportedCharacter(source.genealogyCandidate,null,now),id:source.characterId,taxonomyPath:source.residenceFolderPath.join(' > ')
    };
    if(current?.biography===null||current?.biography?.disabled===true)throw Error('Eine ausdrücklich gelöschte Biografie benötigt erneute Freigabe.');
    character.name=source.name;
    character.title=source.personFields.title;
    character.currentLocation=source.residence;
    Object.assign(character,getPatrickBiographyCharacterMetadata(source.key));
    if(source.personFields.portrait&&!character.portrait)character.portrait=source.personFields.portrait;
    if(character.portrait)character.portrait=resolvePatrickBiographyAsset(character.portrait);
    character.identity={...(character.identity||{}),worldPersonId:source.worldPersonId};
    const genealogy=character.genealogy||{};
    const sources=[...(genealogy.sources||[])];
    for(const link of source.familySources||[])if(!sources.some(row=>row.familyId===link.familyId&&row.personId===link.personId))sources.push({...link,importedAt:now,lastSyncedAt:now});
    character.genealogy={...genealogy,sources};
    const relations=character.genealogy.relationships;
    if(relations){
      character.genealogy.relationships=Object.fromEntries(Object.entries(relations).map(([kind,rows])=>[kind,Array.isArray(rows)?rows.map(relation=>
        relation.worldPersonId===GWEN_CHARACTER_ID||relation.personId==='unknown-cadogan-spouse'?{...relation,name:'Gwen Hamnett'}:relation):rows]));
    }
    if(source.characterId===GWEN_CHARACTER_ID){
      character.aliases=[...new Set([...(character.aliases||[]),...source.aliases])];
      character.genealogy={...(character.genealogy||{}),worldPersonId:source.worldPersonId,houseId:'house-hamnett',houseName:'Haus Hamnett'};
    }
    character.biography=preparePatrickBiographyModule(current?.biography,source.key,{assetMap});
    return character;
  });
}
