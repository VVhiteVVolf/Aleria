import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import '../../AleriaAlmanach/modules/biography/biography-card-rendering.js';
const root=new URL('../../',import.meta.url), read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const snapshot=await read('CharakterDatenbank/generated/characters.snapshot.json');
const inventory=await read('diagnostics/biography-redesign-20261102/inventory.json');
const online=await read('diagnostics/biography-redesign-20261102/online-biographies.json');
const candidates=FAMILY_REGISTRY.flatMap(f=>(f.family?.persons||[]).map(p=>({...createFamilyPersonCandidate(f,p),person:p,familyId:f.id})));
const byId=new Map(),rows=[];
function hasText(b){return Boolean(b?.biography && [b.biography.biographyText,b.biography.historyText,...(b.biography.extraSections||[]).map(s=>s.text)].some(x=>x?.trim()));}
function add(c,source){
 if(!hasText(c.biography))return;
 const world=c.identity?.worldPersonId||c.genealogy?.worldPersonId||c.worldPersonId||'';
 const key=world||c.id;
 let row=byId.get(key)||byId.get(c.id);
 if(!row){row={key,name:c.name,characterIds:[],worldPersonIds:[],personIds:[],moduleRefs:[],biography:c.biography,source};rows.push(row);}
 for(const id of [c.id,world].filter(Boolean))byId.set(id,row);
 if(c.id&&!row.characterIds.includes(c.id))row.characterIds.push(c.id);
 if(world&&!row.worldPersonIds.includes(world))row.worldPersonIds.push(world);
 return row;
}
// Local authored character work has priority. Read-only online evidence fills only
// missing biographies, never rolls a newer local biography back to the live version.
for(const c of snapshot.characters)add(c,'CharakterDatenbank/generated/characters.snapshot.json');
for(const c of online.characters) {
 const local=snapshot.characters.find(row=>row.id===c.id);
 add({...c,identity:local?.identity||c.identity,genealogy:local?.genealogy||c.genealogy},'public Firestore characters/'+c.id+' @ '+c.updateTime);
}
for(const {path,data} of inventory.biographies) {
 const local=snapshot.characters.find(c=>c.id===data.personId||(c.identity?.worldPersonId||c.genealogy?.worldPersonId)===data.personId);
 if(local)add({...local,biography:data.biographyModule||data},path);
 else if(data.personId?.startsWith('person--'))add({id:'',worldPersonId:data.personId,name:data.personName,biography:data.biographyModule||data},path);
}
for(const c of candidates){
 let row=byId.get(c.worldPersonId);
 const matches=snapshot.characters.filter(ch=>(ch.identity?.worldPersonId||ch.genealogy?.worldPersonId)===c.worldPersonId);
 if(!row&&c.person.extensions?.biographyModule) row=add({id:matches[0]?.id,worldPersonId:c.worldPersonId,name:c.displayName,biography:c.person.extensions.biographyModule},'Stammbaum '+c.familyId+'/'+c.person.id);
 if(row){if(!row.personIds.includes(c.person.id))row.personIds.push(c.person.id);if(!row.worldPersonIds.includes(c.worldPersonId))row.worldPersonIds.push(c.worldPersonId);}
}
// Character identity links can include a second tree projection (e.g. birth and
// married household). Use recorded links, never an approximate name match.
const registry=await read('CharakterDatenbank/registry.json');
for(const record of registry.records){
 const row=byId.get(record.firestoreDocumentId);if(!row)continue;
 const detail=await read('CharakterDatenbank/'+record.path);
 for(const link of detail.links?.familyPersons||[]){
  const c=candidates.find(c=>c.familyId===link.familyId&&c.person.id===link.personId);if(c&&!row.personIds.includes(c.person.id))row.personIds.push(c.person.id);
 }
}
// Explicit module ownership; family/ensemble biographies stay separate.
const moduleSubjects={
 'idwals-schiffsmannschaft':'person--haus-draig--idwal-draig',
 'modul-1786259308487':'person--haus-beryn--ifor-beryn',
 'lynnes-schiffsmannschaft':'person--haus-arth--lynne-arth',
 'parzifals-schiffsmannschaft':'person--haus-arth--parzifal-arth',
 'rhydians-schiffsmannschaft':'person--haus-arth--rhydian-arth',
 'modul-1782120382311':'person--haus-draig--anaraut-draig',
 'skallis-gefolge':'person--haus-varulv--skalli-varulv'
};
for(const m of inventory.modules){
 const subject=moduleSubjects[m.entry.id];if(!subject)continue;
 const pages=m.entry.pages.filter(p=>p.biographyPage);if(pages.length!==1)throw Error('Ambiguous module '+m.entry.id);
 const p=pages[0],person=candidates.find(c=>c.worldPersonId===subject);
 if(!person)continue;
 let row=byId.get(subject);
 if(!row){
  const char=snapshot.characters.find(c=>(c.identity?.worldPersonId||c.genealogy?.worldPersonId)===subject);
  row=add({id:char?.id,worldPersonId:subject,name:person.displayName,biography:{schema:'aleria.biography-module',schemaVersion:1,stats:p.stats||[],quote:p.quote||'',quoteBy:p.quoteBy||'',biography:{...p.biography,portrait:p.image||p.biography?.portrait||'',biographyText:p.biography?.biographyText||p.description||''}}},m.path);
 }
 if(row)row.moduleRefs.push({moduleId:m.entry.id,pageKey:p.commentThreadKey||p.pageTitle});
}
// Gawain's paired module remains a paired biography, with the same verified
// training portrait. Do not replace its text with the individual biography.
byId.get('person--haus-draig--gawain-draig')?.moduleRefs.push({moduleId:'gawain-duncan',pageKey:'*',mentorsOnly:true});
for(const row of rows){
 row.personIds=row.personIds.filter(id=>rows.filter(other=>other.personIds.includes(id)).length===1);
 const variants=[row.biography,
  ...snapshot.characters.filter(c=>row.characterIds.includes(c.id)).map(c=>c.biography),
  ...online.characters.filter(c=>row.characterIds.includes(c.id)).map(c=>c.biography),
  ...candidates.filter(c=>row.personIds.includes(c.person.id)).map(c=>c.person.extensions?.biographyModule)].filter(hasText);
 row.replacedFingerprints=[...new Set(variants.map(b=>globalThis.AleriaBiographyCards.narrativeFingerprint(b)))];
}
await mkdir(new URL('js/biography/sources/',root),{recursive:true});
await writeFile(new URL('js/biography/sources/public-biographies.json',root),JSON.stringify({schemaVersion:1,entries:rows},null,2)+'\n');
console.log(JSON.stringify({biographies:rows.length,characters:rows.filter(r=>r.characterIds.length).length,tree:rows.filter(r=>r.personIds.length).length,modules:rows.filter(r=>r.moduleRefs.length).map(r=>r.name)}));
