import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Die unveränderte Quellvorlage ist ein Lesebeleg, kein eigener Vite-Seiteneinstieg.
export async function copyBattleSourceAssets({ workspaceRoot, buildRoot }) {
  const relative='Ereignisse/Schlachten/sources/wellenruh-vorlage.html';
  await mkdir(resolve(buildRoot,'Ereignisse/Schlachten/sources'),{recursive:true});
  await copyFile(resolve(workspaceRoot,relative),resolve(buildRoot,relative));
}
