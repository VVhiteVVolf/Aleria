// Authenticated, bounded REST access for explicit editorial publications.
// Tokens remain in memory; backups retain the original REST representation.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { encryptProjectBackup } from '../backup/project-backup-crypto.mjs';
export async function createContentPublicationClient() {
  const require = createRequire(new URL('../../package.json',import.meta.url));
  const auth = require('firebase-tools/lib/auth.js');
  const account = auth.getProjectDefaultAccount(process.cwd());
  if(!account?.tokens?.refresh_token) throw new Error('Keine angemeldete Firebase-Projektverbindung.');
  const token = await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
  const database = 'projects/aleriaprojekt/databases/(default)';
  async function request(path,body) {
    const response = await fetch(`https://firestore.googleapis.com/v1/${database}/documents${path}`,{
      method:body?'POST':'GET',headers:{Authorization:`Bearer ${token.access_token}`,'x-goog-user-project':'aleriaprojekt','Content-Type':'application/json'},
      ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)
    });
    if(response.status===404 && !body) return null;
    if(!response.ok) throw new Error(`Inhaltsveröffentlichung: HTTP ${response.status}`);
    return response.json();
  }
  return {request,documentName:path=>`${database}/documents/${path}`};
}
export async function backupContentPublication(label,documents,newIds,now) {
  const directory=new URL('../../../.private-backups/',import.meta.url);
  await mkdir(directory,{recursive:true});
  await writeFile(new URL(`${label}-${now.replace(/[:.]/g,'-')}.aleria-backup`,directory),
    await encryptProjectBackup({type:'aleria-content-before-publication',capturedAt:now,newIds,documents:documents.filter(Boolean)}),{flag:'wx'});
}
export async function assertPublishedLocalArtwork(paths) {
  for(const path of new Set(paths)) {
    if(!path.startsWith('./assets/')) throw new Error(`Unerwarteter Bildpfad: ${path}`);
    const response=await fetch(`https://dieweltvonaleria.netlify.app/AleriaAlmanach/${path.slice(2)}`,{signal:AbortSignal.timeout(30000)});
    if(!response.ok || !Buffer.from(await response.arrayBuffer()).equals(await readFile(new URL(`../../../AleriaAlmanach/${path.slice(2)}`,import.meta.url)))) throw new Error(`Bild noch nicht veröffentlicht: ${path}`);
  }
}
