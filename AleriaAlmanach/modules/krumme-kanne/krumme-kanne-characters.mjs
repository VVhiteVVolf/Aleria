import { KANNE_PEOPLE } from './krumme-kanne-roster.mjs';
import { KANNE_HOUSE_FAMILIES } from '../../../Stammbäume/assets/js/data/krumme-kanne-families.js';
import { HOUSE_TONNARTH_FAMILY } from '../../../Stammbäume/assets/js/data/house-tonnarth-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup, retiredFamilySources } from '../character-genealogy/character-group-import-plan.mjs';

export const KANNE_CHARACTER_GROUP='Die Krumme Kanne';
const candidates=[...KANNE_HOUSE_FAMILIES,HOUSE_TONNARTH_FAMILY].flatMap(family=>createFamilyCandidates({
  id:family.document.id,title:family.document.title,family,folderPath:['Cenyr','Celtigerns Wacht','Gwynthor','Bürgerliche'],source:'github'
}));
const portrait=p=>p.portrait || './assets/krumme-kanne/'+(['merrik','hrolf','aedan'].includes(p.id)?'references':'portraits')+'/'+p.id+'.png';
export function planKanneCharacters(existingCharacters,config,now=new Date().toISOString()) {
  const members=KANNE_PEOPLE.map(person=>{
    const links=candidates.filter(c=>c.recordedName===person.name);
    const ownFamily=links.find(c=>c.houseId && c.familyId===c.houseId.replace('house-','haus-'));
    const primary=person.id==='mair'?links.find(c=>c.familyId==='haus-dubhdarach'):ownFamily || links[0];
    return {key:person.id,candidates:links,primaryCandidate:primary,subgroup:primary?.familyTitle.replace(/^Haus /,'') || 'Angestellte',
      retiredSources:retiredFamilySources([...KANNE_HOUSE_FAMILIES,HOUSE_TONNARTH_FAMILY],primary?.worldPersonId),
      identityCandidate:{worldPersonId:'person--krumme-kanne--'+person.id,displayName:person.name,title:person.role,sex:person.sex,status:'alive',birth:String(person.birth),death:'',houseId:'',houseName:'',tags:[],relationships:{parents:[],partners:[],children:[]},folderPath:[]},
      profile:{name:person.name,title:person.role,role:person.role,bio:person.biography,fraktion:KANNE_CHARACTER_GROUP,currentLocation:'Gwynthor · Die Krumme Kanne',origin:person.culture,relevance:'minor',portrait:portrait(person)}};
  });
  return planFamilyCharacterGroup({members,existingCharacters,config,group:KANNE_CHARACTER_GROUP,now});
}
