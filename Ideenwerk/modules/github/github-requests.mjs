import {createGitHubRepositoryClient,encodeGitHubPath} from './github-repository-client.mjs';
import {buildRequestPackage,REQUEST_PACKAGE_FORMAT} from '../requests/request-package.mjs';

export const REQUEST_BRANCH='ideenwerk-wuensche';
const MARKER='.ideenwerk-wuensche.json';
const MARKER_FORMAT='ideenwerk-request-branch';
const COMMIT_MESSAGE='Ideenwerk: Wünsche zur Umsetzung [skip ci] [skip netlify]';
const supportedFile=path=>path===MARKER||/^wuensche\/[A-Za-z0-9-]+\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:md|json|txt|png|jpe?g|webp)$/.test(path);

function decodeMarker(blob) {
  try {
    if(blob.encoding!=='base64')throw Error();
    const bytes=Uint8Array.from(atob(blob.content.replace(/\s/g,'')),character=>character.charCodeAt(0));
    const marker=JSON.parse(new TextDecoder().decode(bytes));
    return marker.format===MARKER_FORMAT&&marker.version===1;
  }catch{return false;}
}

export function createGitHubRequestClient({token,repository,fetchRef=globalThis.fetch}) {
  const request=createGitHubRepositoryClient({token,repository,fetchRef});
  async function inspect() {
    const repo=await request('');
    if(repo.private!==true)throw new Error('Bitte für Wünsche und Referenzbilder ein privates Repository verwenden.');
    if(repo.archived||repo.disabled)throw new Error('Dieses Repository ist archiviert oder deaktiviert.');
    if(repo.permissions?.push===false)throw new Error('Für dieses Repository besteht kein Schreibzugriff.');
    if(repo.default_branch===REQUEST_BRANCH)throw new Error('Der Wünsche-Branch darf nicht der Standardbranch sein. Bitte ein eigenes, mit README initialisiertes Repository verwenden.');
    const ref=await request(`/git/ref/heads/${REQUEST_BRANCH}`,{allow404:true});
    let treeSha=null;
    if(ref) {
      const commit=await request(`/git/commits/${encodeURIComponent(ref.object.sha)}`);
      treeSha=commit.tree.sha;
      const tree=await request(`/git/trees/${encodeURIComponent(treeSha)}?recursive=1`);
      if(tree.truncated)throw new Error('Der Wünsche-Branch ist zu groß, um ihn vollständig zu prüfen.');
      const files=tree.tree.filter(file=>file.type!=='tree');
      const marker=files.find(file=>file.path===MARKER);
      if(!marker||files.some(file=>file.type!=='blob'||file.mode!=='100644'||!supportedFile(file.path)))throw new Error('Der vorhandene Wünsche-Branch gehört nicht ausschließlich zu dieser Übergabe. Bitte ein anderes Repository verwenden.');
      if(!decodeMarker(await request(`/git/blobs/${encodeURIComponent(marker.sha)}`)))throw new Error('Die Erkennungsdatei des Wünsche-Branches ist ungültig. Es wird nichts überschrieben.');
    }else {
      if(!repo.default_branch||!await request(`/git/ref/heads/${encodeGitHubPath(repo.default_branch)}`,{allow404:true}))throw new Error('Bitte das Repository zuerst mit einer README initialisieren.');
    }
    return {repository:repo.full_name||repository,visibility:'Privat',head:ref?.object.sha||null,treeSha,branch:REQUEST_BRANCH};
  }
  async function push(prepared,plan) {
    if(prepared?.format!==REQUEST_PACKAGE_FORMAT||prepared.version!==1)throw new Error('Die Wünsche müssen vor dem Speichern erneut geprüft werden.');
    // Rebuild from the normalized snapshot: caller-provided file paths or
    // edited package entries cannot introduce code or other local content.
    const packet=buildRequestPackage({workspaceId:prepared.workspaceId,requests:prepared.sourceRequests});
    const latest=await inspect();
    if(!plan||latest.head!==plan.head||latest.repository!==plan.repository||plan.branch!==REQUEST_BRANCH)throw new Error('Der Wünsche-Branch wurde seit der Prüfung verändert. Bitte das Ziel erneut prüfen; es wird nichts überschrieben.');
    const entries=[];
    for(const file of packet.files) {
      if(file.encoding==='base64'){
        const blob=await request('/git/blobs',{method:'POST',body:{encoding:'base64',content:file.content}});
        entries.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});
      }else entries.push({path:file.path,mode:'100644',type:'blob',content:file.content});
    }
    if(!latest.head)entries.push({path:MARKER,mode:'100644',type:'blob',content:JSON.stringify({format:MARKER_FORMAT,version:1})});
    const tree=await request('/git/trees',{method:'POST',body:{...(latest.treeSha?{base_tree:latest.treeSha}:{}),tree:entries}});
    const commit=await request('/git/commits',{method:'POST',body:{message:COMMIT_MESSAGE,tree:tree.sha,parents:latest.head?[latest.head]:[]}});
    const saved=latest.head
      ?await request(`/git/refs/heads/${REQUEST_BRANCH}`,{method:'PATCH',body:{sha:commit.sha,force:false}})
      :await request('/git/refs',{method:'POST',body:{ref:`refs/heads/${REQUEST_BRANCH}`,sha:commit.sha}});
    if(saved?.object?.sha!==commit.sha)throw new Error('GitHub hat den gespeicherten Stand noch nicht bestätigt. Bitte den Wünsche-Branch prüfen, bevor du erneut speicherst.');
    return {sha:commit.sha,url:`https://github.com/${latest.repository}/tree/${REQUEST_BRANCH}/wuensche/${encodeURIComponent(packet.workspaceId)}`,requestIds:packet.requests.map(item=>item.id),repository:latest.repository,branch:REQUEST_BRANCH};
  }
  return {inspect,push};
}
