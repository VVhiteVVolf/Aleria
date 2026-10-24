import { cp,copyFile,mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function copyWarSourceAssets({workspaceRoot,buildRoot}){
  const sourceDirectory='Ereignisse/Kriege/krieg-der-praetendenten/sources';
  await cp(resolve(workspaceRoot,sourceDirectory),resolve(buildRoot,sourceDirectory),{recursive:true,force:true});
  const editorialDirectory='Ereignisse/Kriege/krieg-der-praetendenten/redaktion';
  await cp(resolve(workspaceRoot,editorialDirectory),resolve(buildRoot,editorialDirectory),{recursive:true,force:true});
  const editionFile='Ereignisse/modules/praetendenten/war-source-edition.json';
  await mkdir(resolve(buildRoot,'Ereignisse/modules/praetendenten'),{recursive:true});
  await copyFile(resolve(workspaceRoot,editionFile),resolve(buildRoot,editionFile));
  const artDirectory='Ereignisse/assets/praetendenten';
  await mkdir(resolve(buildRoot,artDirectory),{recursive:true});
  await copyFile(resolve(workspaceRoot,artDirectory,'image-prompts.json'),resolve(buildRoot,artDirectory,'image-prompts.json'));
}
