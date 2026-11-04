import {createGitHubRepositoryClient,encodeGitHubPath as encodePath} from './github-repository-client.mjs';
export const BACKUP_BRANCH='ideenwerk-backup';
const MARKER='.ideenwerk-backup.json';
const COMMIT_MESSAGE='Ideenwerk: Projektsicherung [skip ci] [skip netlify]';
export function createGitHubBackupClient({token,repository,fetchRef=globalThis.fetch}) {
  const request=createGitHubRepositoryClient({token,repository,fetchRef});
  async function inspect() {
    const repo=await request('');
    if(repo.default_branch===BACKUP_BRANCH)throw new Error('Der Backup-Branch darf nicht der Standardbranch sein. Bitte ein eigenes, initialisiertes Backup-Repository verwenden.');
    if(repo.archived||repo.disabled)throw new Error('Dieses Repository ist archiviert oder deaktiviert.');
    if(repo.permissions?.push===false)throw new Error('Für dieses Repository besteht kein Schreibzugriff.');
    const ref=await request(`/git/ref/heads/${BACKUP_BRANCH}`,{allow404:true});
    let treeSha=null;
    if(ref){
      const commit=await request(`/git/commits/${encodeURIComponent(ref.object.sha)}`);treeSha=commit.tree.sha;
      const tree=await request(`/git/trees/${encodeURIComponent(treeSha)}?recursive=1`);
      if(tree.truncated)throw new Error('Der Backup-Branch ist zu groß, um ihn sicher zu prüfen.');
      const files=tree.tree.filter(item=>item.type!=='tree');
      if(!files.some(item=>item.path===MARKER)||files.some(item=>item.type!=='blob'||item.mode!=='100644'||!(item.path===MARKER||/^projects\/[A-Za-z0-9-]+\.json$/.test(item.path))))throw new Error('Der vorhandene Branch „ideenwerk-backup“ gehört nicht ausschließlich zu Ideenwerk. Bitte ein anderes Repository wählen.');
    }else{
      const baseRef=await request(`/git/ref/heads/${encodePath(repo.default_branch)}`,{allow404:true});
      if(!baseRef)throw new Error('Bitte das Repository zuerst mit einer README initialisieren.');
    }
    return {repository:repo.full_name||repository,visibility:repo.private?'Privat':'Öffentlich',head:ref?.object.sha||null,treeSha,branch:BACKUP_BRANCH};
  }
  async function push(document,plan) {
    if(!/^[A-Za-z0-9-]+$/.test(document.id))throw new Error('Die Projektkennung ist für eine GitHub-Sicherung ungeeignet. Bitte einen normalen Dateiexport verwenden.');
    const text=JSON.stringify(document,null,2);
    if(new TextEncoder().encode(text).length>25*1024*1024)throw new Error('Die GitHub-Sicherung ist auf 25 MB begrenzt. Bitte einen Dateiexport verwenden oder Bilder verkleinern.');
    const latest=await inspect();
    if(latest.head!==plan.head)throw new Error('Der Backup-Branch wurde seit der Prüfung verändert. Bitte das Ziel erneut prüfen; es wird nichts überschrieben.');
    const entries=[{path:`projects/${document.id}.json`,mode:'100644',type:'blob',content:text}];
    if(!plan.head)entries.push({path:MARKER,mode:'100644',type:'blob',content:JSON.stringify({format:'ideenwerk-backup-branch',version:1})});
    const tree=await request('/git/trees',{method:'POST',body:{...(plan.treeSha?{base_tree:plan.treeSha}:{}),tree:entries}});
    const commit=await request('/git/commits',{method:'POST',body:{message:COMMIT_MESSAGE,tree:tree.sha,parents:plan.head?[plan.head]:[]}});
    if(plan.head)await request(`/git/refs/heads/${BACKUP_BRANCH}`,{method:'PATCH',body:{sha:commit.sha,force:false}});
    else await request('/git/refs',{method:'POST',body:{ref:`refs/heads/${BACKUP_BRANCH}`,sha:commit.sha}});
    return {sha:commit.sha,url:`https://github.com/${repository}/blob/${BACKUP_BRANCH}/${encodePath(`projects/${document.id}.json`)}`};
  }
  return {inspect,push};
}
