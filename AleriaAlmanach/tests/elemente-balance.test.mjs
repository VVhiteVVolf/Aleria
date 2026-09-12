import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { listSpellCatalogEntries, getSpellCatalogEntry, createCatalogSpell, getSpellCatalogPageHref } from '../modules/spell-catalog/spell-catalog.js';
import { buildSpellCatalogArchiveEntries } from '../modules/spell-catalog/spell-catalog-archive.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { getCharacterSpellPresentation } from '../modules/characters/character-spell-presentation.js';
import { getSpellManaCost } from '../modules/combat/combat-resource-progression.js';
import { getRollIconSource } from '../modules/combat/combat-entry-icons.js';
import { mergeCharacterArchiveEntries, normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';

const entries=listSpellCatalogEntries();
function actorFor(id,castLevel,revision,characterLevel=20) {
  const spell=createCatalogSpell(id,{revision});
  const actor=resolveCombatProfile({id:'elemente-caster',name:'Gelehrter',combatProfile:{
    progression:{level:characterLevel},hitPoints:{current:100,maximumOverride:100},
    magic:{enabled:true,casterTier:'full',manaResourceId:'mana-focus',spells:[spell]}
  }},{actionId:`spell:${spell.id}`,castLevel});
  actor.resources=actor.resources.map(r=>({...r,current:r.maximum}));
  return actor;
}
const target=()=>resolveCombatProfile({id:'elemente-target',name:'Ziel',combatProfile:{hitPoints:{current:200,maximumOverride:200},armorClass:{override:10}}});
const dice={
  async rollAttack(){return {natural:15,dice:[15],keptDice:[15],total:999};},
  async rollDamage({damageFormula}){const [,count,sides]=damageFormula.match(/^(\d+)d(\d+)$/);const values=Array(Number(count)).fill(Math.min(4,Number(sides)));return {notation:damageFormula,dice:values,keptDice:values,total:values.reduce((a,b)=>a+b,0),modifier:0};}
};
const pairs=result=>result.actorResourceSnapshot.before.map(before=>[before.id,before.current-result.actorResourceSnapshot.after.find(after=>after.id===before.id).current]).filter(([,spent])=>spent);

test('120 current learned spells include six middle additions per element and expanded lightning/thunder',async()=>{
  assert.equal(entries.length,120);
  assert.equal(new Set(entries.map(s=>s.id)).size,120);
  assert.equal(new Set(entries.map(s=>s.name)).size,120);
  assert.deepEqual(Object.fromEntries(['F','W','L','DN','BL','E','Z'].map(section=>[section,entries.filter(s=>s.section===section).length])),{F:20,W:20,L:16,DN:14,BL:14,E:20,Z:16});
  const oldIds=new Set(listSpellCatalogEntries({revision:1}).map(s=>s.id));
  for(const section of ['F','W','L','DN','BL','E']) {
    const middle=entries.filter(s=>s.section===section&&!oldIds.has(s.id)&&s.level>=2&&s.level<=5);
    assert.ok(middle.length>=6,section);
  }
  const allowedPackages=new Set(['action','action,special-action','action,special-action,reaction','action,special-action,bonus-action','action,reaction','action,bonus-action','action,reaction,bonus-action','reaction','bonus-action','reaction,bonus-action']);
  for(const entry of entries) {
    assert.equal(entry.school,'Elemente');assert.equal(entry.catalog,'elemente');assert.equal(entry.revision,2);
    assert.ok(entry.effect&&entry.limits&&entry.requirements,entry.name);
    assert.match(getSpellCatalogPageHref({id:entry.id,revision:2}),/Magie\/elemente\/index.html#/);
    if(entry.iconPath)await access(new URL(`../../${entry.iconPath}`,import.meta.url));
    let previous=entry.level-1;
    for(const form of [entry,...entry.forms]) {
      assert.ok(form.level>previous&&form.level<=9,entry.name);previous=form.level;
      assert.ok(allowedPackages.has(form.actionIds.join(',')),entry.name);
      const spell=createCatalogSpell(entry.id,{level:form.level});
      assert.equal(spell.manaCost,getSpellManaCost(form.level));
      assert.deepEqual(spell.costs.map(c=>c.resourceId),[...form.actionIds,'mana-focus']);
      assert.equal(spell.costs.at(-1).amount,spell.manaCost);
      for(const part of form.damage)await access(new URL(getRollIconSource(part.formula,part.damageType)));
    }
  }
});

test('Feuerball progresses 3W6 to 7W6; its separately learned greater form starts at grade 7',()=>{
  const small=getSpellCatalogEntry('elemente-feuerball'),large=getSpellCatalogEntry('elementarismus-feuerball');
  assert.deepEqual([small,...small.forms].map(f=>[f.level,f.damage[0].formula]),[[2,'3d6'],[3,'4d6'],[4,'5d6'],[5,'6d6'],[6,'7d6']]);
  assert.equal(createCatalogSpell(small.id,{level:7}),null);
  assert.equal(large.name,'Großer Feuerball');
  assert.deepEqual([large,...large.forms].map(f=>[f.level,f.damage[0].formula]),[[7,'8d6'],[8,'9d6'],[9,'10d6']]);
  assert.equal(getCharacterSpellPresentation(createCatalogSpell(large.id)).costs,'Aktion + Besondere Aktion + Reaktion · 12 Mana');
  for(const id of ['elementarismus-feuerball','elementarismus-blitzbahn','elementarismus-flutstoss','elementarismus-flammenkrone']) {
    const entry=getSpellCatalogEntry(id);assert.ok(entry.level>=7,id);assert.match(entry.name,/Groß/);
  }
  assert.equal(getSpellCatalogEntry('elementarismus-eislanze').level,6);
  assert.equal(getSpellCatalogEntry('elementarismus-hagelsturm').level,6);
});

test('learned edition 1 and current edition 2 coexist without migrating saved rules or IDs',()=>{
  const old=createCatalogSpell('elementarismus-feuerball',{revision:1});
  const current=createCatalogSpell('elementarismus-feuerball');
  const profile=sanitizeCharacterCombatProfile(JSON.parse(JSON.stringify({magic:{spells:[{...old,id:'my-old-spell'},{...current,id:'my-new-spell'},createCatalogSpell('elemente-feuerball')]}})));
  assert.deepEqual(profile.magic.spells.map(s=>[s.name,s.level,s.rollFormula]),[['Feuerball',3,'8d6'],['Großer Feuerball',7,'8d6'],['Feuerball',2,'3d6']]);
  assert.equal(profile.magic.spells[0].id,'my-old-spell');
  assert.match(getSpellCatalogPageHref(old.catalogReference),/elementarismus\/index.html/);
  const archive=buildSpellCatalogArchiveEntries().map(normalizeCharacterArchiveEntry);
  const merged=mergeCharacterArchiveEntries([{kind:'spell',name:old.name,data:old}],archive);
  assert.ok(merged.some(e=>e.data.catalogReference?.id===old.catalogReference.id&&e.data.catalogReference.revision===1));
  assert.ok(merged.some(e=>e.data.catalogReference?.id===old.catalogReference.id&&e.data.catalogReference.revision===2));
  assert.equal(archive.filter(e=>e.data.school==='Elemente'&&e.data.catalogReference.revision===1).length,0);
  assert.equal(getSpellCatalogEntry(old.id,999),null);
});

test('mini combat: small fireball, greater fireball and reactive discharge pay exact packages and halve saves',async()=>{
  for(const [id,grade,formula,costs,damage] of [
    ['elemente-feuerball',2,'3d6',[['action',1],['reaction',1],['mana-focus',4]],6],
    ['elemente-feuerball',6,'7d6',[['action',1],['special-action',1],['mana-focus',11]],14],
    ['elementarismus-feuerball',7,'8d6',[['action',1],['special-action',1],['reaction',1],['mana-focus',12]],16],
    ['elemente-gegenknall',3,'4d6',[['reaction',1],['bonus-action',1],['mana-focus',6]],8],
    ['elemente-rueckentladung',3,'4d6',[['reaction',1],['bonus-action',1],['mana-focus',6]],8]
  ]) {
    const actor=actorFor(id,grade);assert.equal(actor.weapon.damageFormula,formula);
    const result=await new CombatResolutionService(dice).resolveAttack({actor,target:target()});
    assert.deepEqual(new Map(pairs(result)),new Map(costs),id);
    assert.equal(result.targetSnapshot.hitPointsBefore-result.targetSnapshot.hitPointsAfter,damage,id);
    for(const [resourceId] of costs) {
      const blocked={...actor,resources:actor.resources.map(r=>r.id===resourceId?{...r,current:0}:r)};
      await assert.rejects(new CombatResolutionService(dice).resolveAttack({actor:blocked,target:target()}),id);
    }
  }
});

test('greater spells remain gated by character grade and small spells cannot select the greater form',async()=>{
  const locked=actorFor('elementarismus-feuerball',7,2,5);
  await assert.rejects(new CombatResolutionService(dice).resolveAttack({actor:locked,target:target()}));
  // The shared composer clamps requests above the spell's maximum authored grade.
  const small=actorFor('elemente-feuerball',7);
  assert.equal(small.selectedAction.castLevel,6);
  assert.equal(small.weapon.damageFormula,'7d6');
  assert.equal(small.selectedAction.catalogReference.id,'elemente-feuerball');
});

test('new protection spells report a ward roll without damaging or healing creatures',async()=>{
  for(const id of ['elemente-hallabwehr','elemente-luftschirm','elemente-eispanzer']) {
    const actor=actorFor(id);assert.equal(getCombatDamagePreview(actor),null);
    const result=await new CombatResolutionService(dice).resolveAttack({actor,target:target()});
    assert.equal(result.targetSnapshot.hitPointsBefore,result.targetSnapshot.hitPointsAfter);
    assert.equal(result.damage,null);assert.ok(result.effectResults.some(r=>r.effect.type==='narrative'&&r.amount>0));
  }
});
