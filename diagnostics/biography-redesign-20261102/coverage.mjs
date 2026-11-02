import { readFile, writeFile } from 'node:fs/promises';
const entries=JSON.parse(await readFile(new URL('../../js/biography/sources/public-biographies.json',import.meta.url),'utf8')).entries;
const inventory=JSON.parse(await readFile(new URL('inventory.json',import.meta.url),'utf8'));
const summary={
 scope:'Öffentliche Personenbiografien; Quellen und Historie bleiben erhalten. Keine Firebase-Schreibzugriffe.',
 persons:entries.length,
 linkedCharacterSheets:entries.filter(e=>e.characterIds.length).length,
 linkedFamilyTreePeople:entries.filter(e=>e.personIds.length).length,
 associatedModules:entries.filter(e=>e.moduleRefs.length).length,
 inspectedModuleBiographyPages:inventory.modules.reduce((n,m)=>n+m.entry.pages.filter(p=>p.biographyPage).length,0),
 knownTraining:entries.filter(e=>e.biography.biography.knightMentors?.length).length,
 trainingPortraits:entries.reduce((n,e)=>n+(e.biography.biography.knightMentors?.length||0),0),
 idwal:'Zuerst Mervyn Gwyvern, danach Parzifal Arth; ausdrückliche Nutzerkorrektur vom 2. November 2026.',
 characterSheetsNotRecorded:entries.filter(e=>!e.characterIds.length).map(e=>e.name),
 noFamilyTreeIdentity:entries.filter(e=>!e.personIds.length).map(e=>e.name),
 entries:entries.map(e=>({name:e.name,key:e.key,characterIds:e.characterIds,worldPersonIds:e.worldPersonIds,treePersonIds:e.personIds,moduleRefs:e.moduleRefs,source:e.source,
   training:(e.biography.biography.knightMentors||[]).map(m=>({name:m.name,role:m.role})),
   paragraphs:[e.biography.biography.biographyText,e.biography.biography.historyText,...(e.biography.biography.extraSections||[]).filter(s=>s.mode!=='list').map(s=>s.text)].join('').match(/<p>/g)?.length||0}))
};
await writeFile(new URL('coverage.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(summary).filter(([key])=>!['entries','characterSheetsNotRecorded','noFamilyTreeIdentity'].includes(key)))));
