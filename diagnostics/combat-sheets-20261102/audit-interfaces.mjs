import { readFile, writeFile, access } from 'node:fs/promises';
import { resolveCombatProfile } from '../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { COMBAT_PROFILE_SCHEMA_VERSION } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { reconcileClassDamageRevisions } from '../../AleriaAlmanach/modules/classes/class-damage-revisions.js';
import { getAutofilledCenyrCombatProfile } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { resolveCreatureBestiaryReference, isHumanCreature } from '../../AleriaAlmanach/modules/creatures/creature-bestiary-reference.js';
import { REVIEWED_CHARACTER_TRAITS } from '../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { isDeepStrictEqual } from 'node:util';
const after=process.argv.includes('--after');
const snapshot=JSON.parse(await readFile(new URL(after?'./online-after.json':'./online-before.json',import.meta.url),'utf8'));
const report={capturedAt:snapshot.capturedAt,schemaVersion:COMBAT_PROFILE_SCHEMA_VERSION,characters:[],creatures:[]};
for(const collection of ['characters','creatures'])for(const record of snapshot.collections[collection].records){
 const level=Number(record.level||record.combatProfile.progression?.level||1);if(level<=1)continue;
 const profile=record.combatProfile,resolved=resolveCombatProfile(record),issues=[];
 if(profile.schemaVersion!==COMBAT_PROFILE_SCHEMA_VERSION)issues.push({kind:'schema',stored:profile.schemaVersion,current:COMBAT_PROFILE_SCHEMA_VERSION});
 for(const field of ['weapons','armorItems','techniques','quirks','abilities','resources','conditions']){
  const entries=profile[field]||[],ids=entries.map(entry=>entry.id);
  if(new Set(ids).size!==ids.length)issues.push({kind:'duplicate-ids',field});
 }
 const owned=new Set((record.inventory?.items||[]).map(item=>item.id));
 const missingBindings=[...(profile.weapons||[]),...(profile.armorItems||[])].filter(entry=>entry.inventoryItemId&&!owned.has(entry.inventoryItemId)).map(entry=>({id:entry.id,inventoryItemId:entry.inventoryItemId}));
 if(missingBindings.length)issues.push({kind:'missing-inventory-binding',entries:missingBindings});
 const damageRevisions=reconcileClassDamageRevisions(profile);
 const changedDamage=['techniques','abilities','conditions','magic'].filter(field=>!isDeepStrictEqual(profile[field],damageRevisions[field]));
 if(changedDamage.length)issues.push({kind:'historical-damage-revision',fields:changedDamage});
 const auto=getAutofilledCenyrCombatProfile(profile),known=new Set((profile.techniques||[]).map(entry=>entry.id));
 const missingTraining=(auto.techniques||[]).filter(entry=>!known.has(entry.id)).map(entry=>({id:entry.id,name:entry.name}));
 if(missingTraining.length)issues.push({kind:'missing-earned-techniques',entries:missingTraining});
 let bestiary;
 if(collection==='creatures'){
  bestiary=resolveCreatureBestiaryReference(record);
  if(bestiary){try{await access(new URL('../../'+bestiary.url.replace(/^\//,''),import.meta.url));}catch{issues.push({kind:'broken-bestiary-link',id:bestiary.id});}}
  else if(!isHumanCreature(record))issues.push({kind:'no-exact-bestiary-profile',species:record.species});
  if(profile.progression?.level!==Math.min(20,level))issues.push({kind:'level-mismatch',record:level,profile:profile.progression?.level});
 }
 const selected=REVIEWED_CHARACTER_TRAITS.find(assignment=>assignment.onlineId===record.id);
 report[collection].push({id:record.id,name:record.name,level,revision:profile.revision||0,legacyDevelopment:profile.progression?.development?.mode!=='purchase',
  reviewedTraitAssignment:!!selected,quirks:(profile.quirks||[]).map(entry=>({id:entry.id,name:entry.name,icon:entry.icon||''})),
  ...(bestiary?{bestiary}:{}),statistics:{hp:resolved.currentHitPoints,maximumHp:resolved.maximumHitPoints,armorClass:resolved.totalDefense,
   resources:resolved.resources.length,weapons:profile.weapons?.length||0,techniques:profile.techniques?.length||0,spells:profile.magic?.spells?.length||0},issues});
}
report.summary={characters:report.characters.length,creatures:report.creatures.length,issues:[...report.characters,...report.creatures].flatMap(record=>record.issues.map(issue=>({id:record.id,name:record.name,...issue})))};
await writeFile(new URL(after?'./interface-audit-after.json':'./interface-audit-before.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2));
