import { THEATER_PEOPLE } from './theater-people.mjs';
import { HOUSE_DRAIG_FAMILY } from '../../../Stammbäume/assets/js/data/house-draig-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';
const patronCandidate=createFamilyCandidates({id:'haus-draig',title:'Haus Draig',family:HOUSE_DRAIG_FAMILY,source:'github'}).find(p=>p.personId==='rihanna-ceirwynn');
export function planTheaterCharacters(existingCharacters,config,now=new Date().toISOString()) {
  const members=THEATER_PEOPLE.map(person=>({key:person.key,candidates:person.key==='rhianna'?[patronCandidate]:[],primaryCandidate:person.key==='rhianna'?patronCandidate:undefined,
    identityCandidate:{worldPersonId:person.worldPersonId,displayName:person.name,title:person.role,sex:person.sex,status:'alive',birth:person.birth,death:'',houseId:'',houseName:person.familyOrigin?.name||'',tags:[],relationships:{parents:[],partners:[],children:[]},folderPath:[]},
    subgroup:['rhianna','elenid'].includes(person.key)?'Theaterführung':'Schauspielensemble',
    profile:{name:person.name,title:person.role,role:person.role,bio:person.bio,portrait:person.portrait,origin:person.origin,race:person.race,currentLocation:person.key==='rhianna'?'Gwynthor':'Gwynthor · Gwynthorer Theater',relevance:person.key==='elenid'?'supporting':'minor'}}));
  return planFamilyCharacterGroup({members,existingCharacters,config,group:'Gwynthorer Theater',now});
}
