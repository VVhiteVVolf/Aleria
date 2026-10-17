import { VANN_PEOPLE } from './rast-people.mjs';
import { RAST_STAFF } from './rast-staff.mjs';
import { HOUSE_VANN_FAMILY } from '../../../Stammbäume/assets/js/data/vann-family-records.js';
import { HOUSE_RAVES_FAMILY } from '../../../Stammbäume/assets/js/data/eleganz-family-records.js';
import { HOUSE_MAERLLYS_FAMILY } from '../../../Stammbäume/assets/js/data/house-maerllys-family.js';
import { HOUSE_PENDRWN_FAMILY } from '../../../Stammbäume/assets/js/data/house-pendrwn-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';

const candidates=[HOUSE_VANN_FAMILY,HOUSE_RAVES_FAMILY,HOUSE_MAERLLYS_FAMILY,HOUSE_PENDRWN_FAMILY].flatMap(family=>createFamilyCandidates({id:family.document.id,title:family.document.title,family,folderPath:['Cenyr','Celtigerns Wacht','Gwynthor','Bürgerliche'],source:'github'}));
export function planRastCharacters(existingCharacters,config,now=new Date().toISOString()) {
  const family=VANN_PEOPLE.map(person=>{
    const links=candidates.filter(c=>c.worldPersonId===person.worldPersonId);
    const primary=links.find(c=>c.familyId===(person.resident===false&&person.house==='raves'?'haus-raves':'haus-vann'))||links[0];
    return {key:person.key,candidates:links,primaryCandidate:primary,subgroup:person.death?'Vorfahren':person.resident?'Familie Vann':'Verwandtschaft außer Haus',
      profile:{name:person.name,title:person.role,role:person.role,bio:person.bio,portrait:person.portrait,currentLocation:person.resident?'Gwynthor · Celtigerns Letzte Rast':person.house==='raves'?'Gwynthor · Göttliche Eleganz':'',origin:'Cenyri',relevance:'minor'}};
  });
  const staff=RAST_STAFF.map(person=>({key:`staff-${person.key}`,candidates:[],subgroup:'Angestellte',
    identityCandidate:{worldPersonId:`person--letzte-rast--${person.key}`,displayName:person.name,title:person.role,sex:person.sex,status:'alive',birth:person.birth,death:'',houseId:'',houseName:'',tags:[],relationships:{parents:[],partners:[],children:[]},folderPath:[]},
    profile:{name:person.name,title:person.role,role:person.role,bio:person.bio,portrait:person.portrait,currentLocation:'Gwynthor · Celtigerns Letzte Rast',origin:'Cenyri',relevance:'minor'}}));
  return planFamilyCharacterGroup({members:[...family,...staff],existingCharacters,config,group:'Celtigerns Letzte Rast',now});
}
