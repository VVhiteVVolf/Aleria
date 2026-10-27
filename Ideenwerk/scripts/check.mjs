import {readdir,readFile} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SourceTextModule} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(directory){const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const files=await walk(root);let checked=0;
for(const file of files){
  if(file.endsWith('.mjs')){
    const parsed=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
    for(const specifier of parsed.dependencySpecifiers){if(specifier.startsWith('.'))await readFile(resolve(dirname(file),specifier));}
    checked++;
  }
}
console.log(`${checked} JavaScript-Module: Syntax und lokale Imports geprüft.`);
