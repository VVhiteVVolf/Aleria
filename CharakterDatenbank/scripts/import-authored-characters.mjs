import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { buildAuthoredCharacterImport } from '../lib/authored-character-import.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const readJson = async path => JSON.parse(await readFile(new URL(path, new URL('../../', import.meta.url)), 'utf8'));

export async function importAuthoredCharacters({ sources, feature, check = false }) {
  const exports = await Promise.all(sources.map(async sourcePath => ({ ...await readJson(sourcePath), sourcePath })));
  const [registry, snapshot, report] = await Promise.all(['registry.json', 'generated/characters.snapshot.json', 'generated/sync-report.json'].map(p=>readJson(`CharakterDatenbank/${p}`)));
  const result = buildAuthoredCharacterImport({registry,snapshot,report},exports,feature);
  const outputs = result.records.map(item=>[`CharakterDatenbank/${item.path}`,item.record]);
  outputs.push(['CharakterDatenbank/registry.json',result.registry],['CharakterDatenbank/generated/characters.snapshot.json',result.snapshot],['CharakterDatenbank/generated/sync-report.json',result.report]);
  for (const [path,data] of outputs) {
    const url=pathToFileURL(resolve(root,path));
    if (!relative(root,fileURLToPath(url)).startsWith('CharakterDatenbank')) throw Error('Ungültiger Datenbankpfad.');
    const text=JSON.stringify(data,null,2)+'\n';
    if (check) { if (await readFile(url,'utf8')!==text) throw Error(`Veralteter Figurenimport: ${path}`); }
    else { await mkdir(new URL('.',url),{recursive:true});await writeFile(url,text); }
  }
  return { imported: exports.length, feature, existingCharactersPreserved: snapshot.characters.filter(c=>!exports.some(e=>e.character.id===c.id)).length };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  const values = key => process.argv.flatMap((value,i)=>value===key?[process.argv[i+1]]:[]);
  console.log(JSON.stringify(await importAuthoredCharacters({sources:values('--source'),feature:values('--feature')[0],check:process.argv.includes('--check')})));
}
