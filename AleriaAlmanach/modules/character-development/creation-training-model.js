import { getCharacterCreationTemplate } from '../combat/character-creation-templates.js';
import { getSkillIdentity } from '../skill-checks/skill-definitions.js';
import { getCharacterClassIds } from './character-training-state.js';
import { CREATION_CLASS_SKILL_SUGGESTIONS } from './creation-class-suggestions.js';

const unique=values=>[...new Set(values.filter(Boolean))];
export function updateCreationTrainingChoice(draft,target) {
  const data=target.dataset;
  if(data.creationSkill||data.creationSkillCheck){
    const key=data.creationSkill||data.creationSkillCheck;
    if(!Object.hasOwn(draft.skillChoices,key))return false;
    draft.skillChoices[key]=data.creationSkill?target.value:target.checked?(draft.skillChoices[key]==='expertise'?'expertise':'trained'):'none';
  } else if(data.creationClass){
    const id=data.creationClass;
    if(!getCharacterCreationTemplate('class',id))return false;
    if(target.checked&&!draft.selections.classId)draft.selections.classId=id;
    else draft.additionalClassIds=unique([...draft.additionalClassIds.filter(value=>value!==id),...(target.checked?[id]:[])]);
  } else if(data.creationCustom&&['name','description'].includes(data.creationCustom))draft.customClass[data.creationCustom]=target.value;
  else if(data.creationTraining&&Object.hasOwn(draft.trainingChoices,data.creationTraining))draft.trainingChoices[data.creationTraining]=data.creationTraining==='hitDieOverride'?(Number(target.value)||null):target.value;
  else if(data.creationSave)draft.trainingChoices.savingThrows=unique([...draft.trainingChoices.savingThrows.filter(key=>key!==data.creationSave),...(target.checked?[data.creationSave]:[])]);
  else if(['weapons','armor'].includes(data.creationProficiency)){
    const kind=data.creationProficiency,value=data.creationProficiencyValue;
    draft.trainingChoices.proficiencies[kind]=unique([...draft.trainingChoices.proficiencies[kind].filter(key=>key!==value),...(target.checked?[value]:[])]);
  } else if(['tools','languages'].includes(data.creationTrainingList))draft.trainingChoices.proficiencies[data.creationTrainingList]=unique(target.value.split('\n').map(value=>value.trim()));
  else return false;
  return true;
}
export function createCreationTrainingChoices(profile,existingBuild=false) {
  return {
    existingClassLabel:profile.identity.archetype,
    additionalClassIds:getCharacterClassIds(profile).filter(id=>id!==profile.templateSelections.classId&&id!=='custom'),
    customClass:{name:profile.templateSelections.customClass?.name||'',description:profile.templateSelections.customClass?.description||''},
    includeCustomClass:Boolean(profile.templateSelections.customClass?.name),
    skillChoices:Object.fromEntries(profile.skills.map(skill=>[getSkillIdentity(skill.name),skill.proficiency])),
    trainingChoices:{hitDieOverride:existingBuild?profile.hitPoints.hitDie:null,
      savingThrows:profile.savingThrows.filter(save=>save.proficient||save.expertise).map(save=>save.attributeKey),
      proficiencies:structuredClone(profile.proficiencies),magicMode:existingBuild?'preserve':'class',castingAttribute:profile.magic.castingAttribute}
  };
}

export function getSelectedCreationClasses(draft) {
  const classes=unique([draft.selections?.classId,...(draft.additionalClassIds||[])])
    .filter(id=>id!=='custom').map(id=>getCharacterCreationTemplate('class',id)||{id,label:id===draft.selections?.classId?(draft.existingClassLabel||id):id,proficiencies:{}});
  if((draft.includeCustomClass||draft.selections?.classId==='custom')&&draft.customClass?.name?.trim())classes.push({id:'custom',label:draft.customClass.name.trim(),description:draft.customClass.description||'',proficiencies:{}});
  return classes;
}

export function getCreationSkillSuggestions(draft) {
  const sources=[getCharacterCreationTemplate('ancestry',draft.selections?.ancestryId),getCharacterCreationTemplate('background',draft.selections?.backgroundId),...getSelectedCreationClasses(draft)].filter(Boolean);
  const skills=new Map();
  for(const source of sources)for(const name of source.skillProficiencies?.length?source.skillProficiencies:CREATION_CLASS_SKILL_SUGGESTIONS[source.id]||[]){
    const key=getSkillIdentity(name);
    if(!skills.has(key))skills.set(key,{key,name,sources:[]});
    skills.get(key).sources.push(source.label);
  }
  return [...skills.values()];
}

export function getCreationClassSuggestions(draft) {
  const classes=getSelectedCreationClasses(draft);
  const primary=classes.find(c=>c.id===draft.selections?.classId);
  return {hitDie:primary?.hitDie,savingThrows:unique(classes.flatMap(c=>c.savingThrowProficiencies||[])),
    proficiencies:Object.fromEntries(['weapons','armor','tools','languages'].map(kind=>[kind,unique(classes.flatMap(c=>c.proficiencies?.[kind]||[]))]))};
}

export function acceptCreationSkillSuggestions(draft) {
  for(const skill of getCreationSkillSuggestions(draft))if(!draft.skillChoices[skill.key]||draft.skillChoices[skill.key]==='none')draft.skillChoices[skill.key]='trained';
}
export function acceptCreationClassSuggestions(draft) {
  const suggested=getCreationClassSuggestions(draft);
  draft.trainingChoices.hitDieOverride=suggested.hitDie||draft.trainingChoices.hitDieOverride;
  draft.trainingChoices.savingThrows=unique([...draft.trainingChoices.savingThrows,...suggested.savingThrows]);
  for(const kind of ['weapons','armor','tools','languages'])draft.trainingChoices.proficiencies[kind]=unique([...draft.trainingChoices.proficiencies[kind],...suggested.proficiencies[kind]]);
  draft.trainingChoices.magicMode='class';
}

export function applyCreationMagicChoice(profile,draft,primary) {
  const choice=draft.trainingChoices||{},mode=['class','none','full','half','focus','pact','celestial','infernal'].includes(choice.magicMode)?choice.magicMode:'preserve';
  const fields=['enabled','casterTier','castingAttribute','manaResourceId','bypassResourceId','focusEnabled','focusResourceId','notes'];
  if(mode==='class')profile.magic={...profile.magic,...Object.fromEntries(fields.filter(key=>Object.hasOwn(primary?.magic||{},key)).map(key=>[key,primary.magic[key]]))};
  else if(mode!=='preserve'){
    const enabled=!['none','focus'].includes(mode);
    profile.magic={...profile.magic,enabled,casterTier:mode==='half'?'half':enabled?'full':'none',
      focusEnabled:mode==='focus',focusResourceId:'focus',manaResourceId:mode==='pact'?'pact-points':'mana-focus',
      bypassResourceId:mode==='celestial'?'celestial-points':mode==='infernal'?'infernal-points':'',castingAttribute:choice.castingAttribute||profile.magic.castingAttribute};
  }
}
