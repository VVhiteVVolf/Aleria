/** Rebuild only the amended Zirkel page and its existing Almanach module. */
import {writeFile} from 'node:fs/promises';
import {readReligionCatalog,entryPagePath} from '../../../Religionen/modules/content/content-repository.mjs';
import {renderReligionEntry} from '../../../Religionen/modules/content/page-template.mjs';
import {religionModuleFiles} from '../../../Religionen/modules/almanach/religion-module-build.mjs';

const workspace=new URL('../../../',import.meta.url);
const catalog=readReligionCatalog();
const entry=catalog.entries.find(item=>item.id==='zirkel-des-ewigen-waldes');
const output=entryPagePath(entry);
if(output!=='Religionen/religionen/zirkel-des-ewigen-waldes/index.html')throw Error('Unexpected religion output');
const files=[[output,renderReligionEntry(catalog,entry)],...religionModuleFiles(catalog).filter(([path])=>path===entry.almanach?.output)];
if(files.length!==1+Number(Boolean(entry.almanach)))throw Error('Unexpected religion output count');
for(const [path,content]of files)await writeFile(new URL(path,workspace),content,'utf8');
console.log(JSON.stringify({rebuilt:files.map(([path])=>path)}));
