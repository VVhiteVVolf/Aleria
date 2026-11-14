import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { RAT_PEOPLE, RAT_SIGN } from './underworld-people.mjs';
export const UNDERWORLD_CHARACTER_FEATURE='gwynthor-underworld-20261114';
export const UNDERWORLD_AUTHORED_AT='2026-11-14T10:00:00Z';
export function buildUnderworldCharacterExports() {
  return RAT_PEOPLE.map(person=>{
    const biography=sanitizeCharacterBiographyForFirestore({biography:{schema:'aleria.biography-module',schemaVersion:1,pageTitle:person.name,
      stats:[['Name',person.name],['Alter 1740',`${person.age} Jahre`],['Herkunft',person.origin],['Aufgabe',person.role]],
      biography:{portrait:person.portrait,biographyTitle:person.role,biographyText:`<p>${person.bio}</p>`,crestImage:RAT_SIGN,
        historyTitle:'Die Reine Ratte am Hafen',historyText:'<p>Das schlichte Zuberhaus dient Seeleuten, Matrosen und Hafenleuten. Die Waschplätze sind günstig, die drei privaten Stuben einfach und der Hausdienst überschaubar. Zwischen Landgang und Abendbetrieb gehen hier Wasser, Leinen und Neuigkeiten von Hand zu Hand.</p>',
        documentsTitle:'Arbeitsort',documents:[{title:'Die Reine Ratte',text:'Haus, Personal, Preise und fünf getrennte Szenen.',link:'../AleriaAlmanach/AleriaAlmanach.html?entry=gwynthor-zuberhaus-reine-ratte'}]}}}).biography;
    return {type:'aleria-character',version:1,exportedAt:UNDERWORLD_AUTHORED_AT,assignedTab:'Gwynthor',mergeStrategy:'replace-exported-fields',
      sourcePath:`Charakter Archiv Exporte/Gwynthor Unterwelt/${person.id}.json`,character:{id:person.worldPersonId,name:person.name,title:person.role,role:person.role,
        age:person.age,birth:person.birth,gender:person.gender,race:person.origin.startsWith('Albe')?'Albe':'Mensch',origin:person.origin,
        identity:{worldPersonId:person.worldPersonId},genealogy:{worldPersonId:person.worldPersonId,sources:[]},
        fraktion:'Die Reine Ratte',portrait:person.portrait,bio:person.bio,biography,currentLocation:'Die Reine Ratte · Hafen · Gwynthor-Stadt',archived:false}};
  });
}
