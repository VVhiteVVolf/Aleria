import { cp, mkdir, copyFile, readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { validateWeddingEnvelope } from './wedding-schema.mjs';

// Die Registry enthält veränderliche Datenpfade. Diese behalten auch im Build ihre Adresse.
export async function copyWeddingAssets({ workspaceRoot, buildRoot }) {
  const source = resolve(workspaceRoot,'Ereignisse'), target = resolve(buildRoot,'Ereignisse');
  await mkdir(resolve(target,'Hochzeiten'),{recursive:true});
  await Promise.all(['Hochzeiten/data','Hochzeiten/templates','assets/weddings'].map(path => cp(resolve(source,path),resolve(target,path),{recursive:true,force:true})));
  await copyFile(resolve(source,'Hochzeiten/registry.json'),resolve(target,'Hochzeiten/registry.json'));
  const names = (await readdir(resolve(source,'Hochzeiten/data'))).filter(name => name.endsWith('.json'));
  const records = await Promise.all(names.map(async name => validateWeddingEnvelope(JSON.parse(await readFile(resolve(source,'Hochzeiten/data',name),'utf8')))));
  const portraits = new Set(records.flatMap(record => record.wedding.guests.flatMap(guest => guest.portraits.map(person => person.image))).filter(path => path.startsWith('../Stammbäume/assets/images/portraits/')));
  await Promise.all([...portraits].map(async path => {
    // Nur vom gemeinsamen Schema erlaubte Stammbaum-Porträtpfade erreichen diese Stelle.
    const output = resolve(target,path);
    await mkdir(dirname(output),{recursive:true});
    await copyFile(resolve(source,path),output);
  }));
}
