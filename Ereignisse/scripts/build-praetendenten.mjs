import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WAR } from '../modules/praetendenten/praetendenten-data.mjs';
import { WAR_PAGES } from '../modules/praetendenten/war-page-registry.mjs';
import { renderWarPage } from '../modules/praetendenten/war-page-render.mjs';

const workspace=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const check=process.argv.includes('--check');
let differences=0;
for(const page of WAR_PAGES){
  const target=resolve(workspace,WAR.root,page.file);
  const html=renderWarPage(page);
  const current=await readFile(target,'utf8').catch(error=>{if(error.code==='ENOENT')return null;throw error;});
  if(current===html)continue;
  differences++;
  if(check){process.stderr.write(`Nicht aktuell: ${WAR.root}${page.file}\n`);continue;}
  await mkdir(dirname(target),{recursive:true});await writeFile(target,html,'utf8');
}
if(check&&differences)process.exitCode=1;
process.stdout.write(`${WAR_PAGES.length} Prätendenten-Seiten ${check?'geprüft':'bereit'}; ${differences} ${check?'Abweichungen':'aktualisiert'}.\n`);
