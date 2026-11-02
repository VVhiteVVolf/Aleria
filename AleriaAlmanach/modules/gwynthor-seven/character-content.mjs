import { normalizePersonBiographyModule } from '../../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { createFamilyCandidates, createFamilyPersonCandidate, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { getCharacterCreationTemplate } from '../combat/character-creation-templates.js';
import { sanitizeCharacterCombatProfile } from '../combat/combat-profile-model.js';
import { normalizeDevelopment } from '../character-development/development-state.js';
import { createGrantedItem } from '../item-register/item-register-model.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { GWYNTHOR_SEVEN_LOADOUTS } from './equipment.mjs';
import { enrichGwynthorBiography } from './biography-enrichment.mjs';

const appearance = {
 'rhosyn-awenydd':'Braunes, langes Haar, braune Augen, weinrotes Kleid und ein kleiner Anhänger.',
 'briallen-awenor':'Langes goldblondes Haar, blaue Augen und silberne Rüstung mit blauem Wappenrock und hellem Schwertzeichen.',
 'rianna-wyrm':'Rotes Haar in zwei hohen Zöpfen, bernsteinbraune Augen und schwarze Rüstung mit goldenen Kanten und schwarzem Drachen auf gelbem Grund.',
 'evie-rhyddid':'Langes rotes Haar, braune Augen und dunkle Rüstung mit grünem Wappenrock und goldenem Hauszeichen.',
 'lefraye-gafyr':'Langes rotes Haar in hohem Pferdeschwanz, bernsteinfarbene Augen, schwarzer Schal und schwarz-goldene Rüstung mit dem Ziegenpaar des Hauses Gafyr.',
 'saerwyn-gwyllach':'Langes rotbraunes Haar, graugrüne Augen und ein pflaumenfarbenes Kleid mit goldenen Borten.',
 'caralyn-chwedlonol':'Langes rotes Haar, grüne Augen und grün-goldener Wappenrock mit Meerjungfrau über dunkler Rüstung.'
};
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = values => values.filter(Boolean).map(s=>`<p>${escape(s)}</p>`).join('');
export function buildGwynthorCharacter({ spec, family, content, existing, items, now }) {
 const person=family.family.persons.find(p=>p.id===spec.personId);
 const candidate=createFamilyPersonCandidate(family,person);
 const prior=existing || {};
 const id=prior.id || spec.existingId || candidate.worldPersonId;
 const siblings=createFamilyCandidates(family).filter(p=>p.personId!==person.id && p.relationships.parents.length
   && p.relationships.parents.every(parent=>candidate.relationships.parents.some(other=>other.personId===parent.personId)));
 const parents=candidate.relationships.parents.map(p=>p.name).filter(n=>!/^Unbekannt/.test(n));
 const summary=content.biographySummary || {};
 const namedMother=candidate.relationships.parents.some(p=>!/^Unbekannt/.test(p.name)&&family.family.persons.find(x=>x.id===p.personId)?.sex==='female');
 const parentText=parents.length ? `${candidate.displayName} ist die Tochter von ${parents.join(' und ')}.${!namedMother?' Der Name ihrer Mutter ist nicht überliefert.':''}` : '';
 const known=[`${candidate.displayName} gehört zu ${candidate.houseName}. Sie wurde ${candidate.birth} geboren und ist im Weltjahr 1740 etwa ${1740-Number(candidate.birth)} Jahre alt.`,
  parentText, siblings.length?`Ihre belegten Geschwister sind ${siblings.map(s=>s.displayName).join(', ')}.`:'',
  spec.className?`Ihre Klasse ist ${spec.className}; ihr Kampfprofil bleibt vorerst auf Stufe 1.`:'',
  spec.personId==='saerwyn-gwyllach'?'Ihr Geburtsjahr 1721 folgt der Autorenkorrektur vom 2. November 2026.':''];
 const houseProfile=family.family.document.houseProfile;
 const biography=normalizePersonBiographyModule({
  stats:[['Name',candidate.displayName],['Geboren',candidate.birth],['Alter im Weltjahr 1740',`etwa ${1740-Number(candidate.birth)} Jahre`],['Haus',candidate.houseName],['Sitz des Hauses',houseProfile.seat],['Klasse',spec.className||'Nicht festgelegt'],['Stufe','1']],
  biography:{portrait:candidate.portrait,biographyTitle:candidate.displayName,biographyText:paragraphs(known),
   historyTitle:'Belegter Familienhintergrund',historyText:paragraphs([summary.overview,summary.holdings]),
   extraSections:[{title:'Erscheinung',text:paragraphs([appearance[spec.personId]]),position:'afterIntro',mode:'text'}],
   connectionsTitle:'Familie und Herkunft',connections:[
    ...[...candidate.relationships.parents.filter(p=>!/^Unbekannt/.test(p.name)),...siblings.map(p=>({personId:p.personId,name:p.displayName}))].map(p=>({type:'connection',name:p.name,
      detail:candidate.relationships.parents.some(x=>x.personId===p.personId)?'Elternteil':'Geschwister',image:createFamilyPersonCandidate(family,family.family.persons.find(x=>x.id===p.personId)).portrait,imageFormat:'portrait'})),
    {type:'connection',name:candidate.houseName,detail:houseProfile.seat,image:`../Stammbäume/${family.emblem||family.family.document.emblem}`,imageFormat:'square'},
    ...(houseProfile.liegeHouseName?[{type:'connection',name:houseProfile.liegeHouseName,detail:'Dienst- beziehungsweise Lehnsbindung des Hauses; keine zusätzliche Wohnortzuordnung.'}]:[])],
   documentsTitle:'Quellen',documents:[{title:`${candidate.houseName} · Stammbaum`,link:`/Stammbäume/Stammbaum.html?family=${spec.familyId}&mode=view&person=${spec.personId}`,text:'Person, Geburtsjahr, Eltern, Geschwister, Haus und Originalporträt.'},
    {title:'Hausakte',link:`/Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_${spec.houseFolder}/haus.data.js`,text:'Überlieferter Hauskontext. Klassen und Ausrüstung folgen zusätzlich dem Autorenauftrag vom 02.11.2026.'}],footer:'Belegte Personenakte · Weltjahr 1740'}
 });
 let profile=sanitizeCharacterCombatProfile(prior.combatProfile || {});
 profile.progression={...profile.progression,level:1,specialLevels:0,development:normalizeDevelopment(profile.progression.development)};
 if(spec.classId) {
  const template=getCharacterCreationTemplate('class',spec.classId);
  profile.templateSelections.classId=spec.classId;
  profile.identity.archetype=spec.className;
  profile.proficiencies={...profile.proficiencies,...template.proficiencies};
  profile.hitPoints.hitDie=template.hitDie;
  for(const save of profile.savingThrows) save.proficient=template.savingThrowProficiencies?.includes(save.attributeKey)||save.proficient;
 }
 const inventory={...(prior.inventory||{}),items:[...(prior.inventory?.items||[])]};
 // Only blank starter cards are replaced; real possessions retain their IDs.
 inventory.items=inventory.items.filter(i=>!isInventoryPlaceholder(i));
 const loadout=GWYNTHOR_SEVEN_LOADOUTS[spec.personId].flatMap(row=>row[0]==='chwedonol-harpune'?Array.from({length:row[1]},()=>[row[0],1,row[2]]):[row]);
 loadout.forEach(([key,quantity,equipped],index)=>{
  const template=items.find(i=>i.id===`gwynthor-seven:${key}`);
  if(!template)throw Error(`Itemdefinition fehlt: ${key}`);
  const itemId=`${spec.personId}-${key}-${index+1}`;
  if(inventory.items.some(i=>i.id===itemId))return;
  const item=createGrantedItem(template,{id:itemId,characterId:id,characterName:candidate.displayName,quantity,now});
  inventory.items.push({...item,equipped});
 });
 const arrows=inventory.items.find(i=>i.templateId==='gwynthor-seven:standardpfeil');
 if(arrows)for(const bow of inventory.items.filter(i=>['gwynthor-seven:helwyr-langbogen','gwynthor-seven:helwyr-kurzbogen'].includes(i.templateId)))bow.itemState={...bow.itemState,ammunitionItemId:arrows.id};
 const synced=synchronizeEquipmentFromInventory({inventory,combatProfile:profile,addMissingEquipment:true});
 profile=sanitizeCharacterCombatProfile(synced.combatProfile);
 if(profile.weapons.some(w=>w.weaponType!=='unarmed'&&w.equipped))for(const w of profile.weapons.filter(w=>w.weaponType==='unarmed'))w.equipped=false;
 return enrichGwynthorBiography({...prior,...buildImportedCharacter(candidate,prior.id?prior:null,now),id,name:candidate.displayName,
  title:spec.className?`${spec.className} · ${candidate.houseName}`:candidate.houseName,
  bio:known.filter(Boolean).join('\n\n'),biography,combatProfile:profile,inventory:synced.inventory,
  genealogy:{...buildImportedCharacter(candidate,null,now).genealogy,birth:candidate.birth},
  portrait:prior.portrait||candidate.portrait,updatedAt:now}, now);
}
