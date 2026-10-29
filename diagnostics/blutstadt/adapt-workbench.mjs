import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const updates={
 'Vorschau/shared/country-workbench/render.mjs':[
  ['Wappen & Krieger öffnen ↗','${e(h.detailsLabel??\'Wappen & Krieger öffnen ↗\')}'],
  ['${e(counties.find(c=>c.id===s.county).name)}','${e(counties.find(c=>c.id===s.county)?.name??s.administrationLabel??\'\')}'],
  [' const related=c.relatedPages', ' const labels=c.labels??{};\n const related=c.relatedPages'],
  ['<a href="#krieger">Krieger</a>','<a href="#krieger">${e(labels.warriors??\'Krieger\')}</a>'],
  ['<h2>Große Räume. Eigene Zeichen.</h2>','<h2>${e(labels.regionHeading??\'Große Räume. Eigene Zeichen.\')}</h2>'],
  ['Regionalnamen und Zeichen sind Vorschläge zur Besprechung. Die farbigen Großregionen und alle benannten Ortsgebiete erhalten eigene Darstellungen.','${e(labels.regionIntro??\'Regionalnamen und Zeichen sind Vorschläge zur Besprechung. Die farbigen Großregionen und alle benannten Ortsgebiete erhalten eigene Darstellungen.\')}'],
  ['<h3>Familien ohne Sitz</h3>','<h3>${e(labels.unassigned??\'Familien ohne Sitz\')}</h3>'],
  ['Wappen hierher zurückziehen, um einen Sitz wieder offenzulassen. Alternativ Familie und Sitz oben auswählen.','${e(labels.unassignedIntro??\'Wappen hierher zurückziehen, um einen Sitz wieder offenzulassen. Alternativ Familie und Sitz oben auswählen.\')}'],
  ['<h2>Ort, Landschaft und Familien.</h2>','<h2>${e(labels.seatsHeading??\'Ort, Landschaft und Familien.\')}</h2>'],
  ['<h2>Die Krieger der Familien.</h2>','<h2>${e(labels.warriorHeading??\'Die Krieger der Familien.\')}</h2>'],
  ['Die Klassen dienen dem Bildentwurf. Sitz, Rang und tatsächliche Ausbildung werden dadurch nicht festgelegt.','${e(labels.warriorIntro??\'Die Klassen dienen dem Bildentwurf. Sitz, Rang und tatsächliche Ausbildung werden dadurch nicht festgelegt.\')}']
 ],
 'Vorschau/shared/house-detail-render.mjs':[
  ['<a href="${e(classHref)}" target="_blank" rel="noopener">${e(warrior.className)}</a> <span>· Klassenvorschlag</span>','${classHref?`<a href="${e(classHref)}" target="_blank" rel="noopener">${e(warrior.className)}</a>`:e(warrior.className)} <span>· ${e(warrior.roleLabel??\'Klassenvorschlag\')}</span>'],
  ['<span>Kriegerdarstellung · Entwurf</span>','<span>${e(warrior.representationLabel??\'Kriegerdarstellung · Entwurf\')}</span>']
 ]
};
for(const [path,replacements]of Object.entries(updates)){
 let text=await readFile(new URL(path,root),'utf8');
 for(const [from,to]of replacements){if(text.split(from).length!==2)throw Error(`Expected one match: ${path} ${from}`);text=text.replace(from,to);}
 await writeFile(new URL(path,root),text);
}
