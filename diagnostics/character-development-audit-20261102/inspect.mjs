import { readFile, writeFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { getSkillIdentity } from '../../AleriaAlmanach/modules/skill-checks/skill-definitions.js';
import { getDevelopmentAttackCatalog, isOwnDevelopmentClass } from '../../AleriaAlmanach/modules/character-development/development-purchases.js';
import { sanitizeCharacterCombatProfile, getSkillTotal, getSpellcastingValues, getWeaponAttackModifier, getWeaponDamageModifier, getMaximumHitPoints, getArmorClass, getSavingThrowTotal, getPassivePerception } from '../../AleriaAlmanach/modules/combat/combat-profile-model.js';
const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const after=process.argv.includes('--after');
const characters = snapshot.characters.filter(c=>c.combatProfile);
const meaningful = mechanics => Object.fromEntries(Object.entries(mechanics||{}).filter(([,v])=>Array.isArray(v)?v.length:typeof v==='number'?v!==0:v && v!=='normal'));
const traits = characters.map(c=>({id:c.id,name:c.name,class:c.combatProfile.templateSelections?.classId,level:c.combatProfile.progression,
 quirks:(c.combatProfile.quirks||[]).filter(q=>q.name).map(q=>({...q,mechanics:meaningful(q.mechanics)})),
 passives:(c.combatProfile.abilities||[]).filter(a=>a.name&&a.activationType==='passive').map(a=>({id:a.id,name:a.name,description:a.description,mechanics:meaningful(a.mechanics)}))}));
if(!after)await writeFile(new URL('./existing-character-traits.json',import.meta.url),JSON.stringify(traits,null,2)+'\n');
const matrix=[];
const state=p=>({hp:getMaximumHitPoints(p),ac:getArmorClass(p),passivePerception:getPassivePerception(p),spellAttack:getSpellcastingValues(p).attack,spellDc:getSpellcastingValues(p).saveDc,
 weaponAttack:getWeaponAttackModifier(p,{weaponType:'sword',attackAttribute:'strength',proficient:true}),weaponDamage:getWeaponDamageModifier(p,{weaponType:'sword',attackAttribute:'strength'}),
 skills:Object.fromEntries(p.skills.map(s=>[s.name,getSkillTotal(p,s)])),saves:Object.fromEntries(p.attributes.map(a=>[a.key,getSavingThrowTotal(p,a.key)]))});
for(const level of [1,5,10,20,30]) {
 const base=sanitizeCharacterCombatProfile({progression:{level:Math.min(20,level),specialLevels:Math.max(0,level-20)},hitPoints:{hitDie:10},magic:{enabled:true}});
 const before=state(base);
 for(const trait of DEVELOPMENT_TRAITS){const after=state(sanitizeCharacterCombatProfile({...base,quirks:[trait]}));
  const delta=(a,b)=>Object.fromEntries(Object.keys(b).filter(k=>typeof b[k]==='number'&&b[k]!==a[k]).map(k=>[k,b[k]-a[k]]));
  matrix.push({id:trait.id,name:trait.name,description:trait.description,cost:trait.cost,level,changes:{...delta(before,after),skills:delta(before.skills,after.skills),saves:delta(before.saves,after.saves)}});
 }
}
await writeFile(new URL(`./trait-effects-${after?'after':'before'}.json`,import.meta.url),JSON.stringify(matrix,null,2)+'\n');
const catalogue=getDevelopmentAttackCatalog();
const skillKey=name=>after?getSkillIdentity(name):name.toLowerCase();
const knownSkills=new Set(sanitizeCharacterCombatProfile({}).skills.map(s=>skillKey(s.name)));
const unmatched=DEVELOPMENT_TRAITS.flatMap(t=>[...(t.mechanics.skillModifiers||[]),...(t.mechanics.skillProficiencies||[])].filter(m=>!knownSkills.has(skillKey(m.name))).map(m=>({trait:t.name,skill:m.name})));
const summary={characters:snapshot.characters.length,combatProfiles:characters.length,withTraits:traits.filter(c=>c.quirks.length).length,withPassives:traits.filter(c=>c.passives.length).length,
 skills:[...knownSkills],unmatchedTraitSkills:unmatched,attacks:catalogue.length,unresolvedOwnClasses:traits.filter(c=>c.class&&!catalogue.some(e=>isOwnDevelopmentClass({templateSelections:{classId:c.class}},e))).map(c=>({name:c.name,class:c.class})),
 quirks:traits.filter(c=>c.quirks.length).map(c=>({name:c.name,traits:c.quirks.map(q=>q.name)}))};
await writeFile(new URL(`./${after?'final':'baseline'}-analysis.json`,import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
