import {parseWorkspace} from './modules/workspace/schema.mjs';
import {createWorkspace} from './modules/workspace/seed.mjs';
import {createWorkspaceStore} from './modules/workspace/store.mjs';
import {openWorkspaceStorage,createAutosave} from './modules/workspace/storage.mjs';
import {mountWorkspace} from './modules/workspace/workspace-controller.mjs';

function storageStatus(status,message) {
  const element=document.getElementById('save-state');
  element.dataset.state=status;
  element.textContent={saved:'Lokal gespeichert',saving:'Wird gespeichert …',error:'Nicht gespeichert – bitte exportieren'}[status];
  element.title=message||'Automatisch in diesem Browser gespeichert';
  let banner=document.getElementById('storage-error');
  if(status==='error'){
    if(!banner){banner=document.createElement('div');banner.id='storage-error';banner.className='storage-error';banner.setAttribute('role','alert');document.body.append(banner);}
    banner.textContent=message||'Automatisches Speichern ist nicht verfügbar. Bitte deine Arbeit regelmäßig exportieren.';
  }else if(status==='saved')banner?.remove();
}
async function start() {
  let storage=null,initial=null,loadError=null;
  try{storage=await openWorkspaceStorage();const saved=await storage.load();initial=saved?parseWorkspace(saved):null;}catch(error){loadError=error;storage=null;}
  const store=createWorkspaceStore(initial||createWorkspace());
  const autosave=storage?createAutosave(storage,storageStatus):null;
  mountWorkspace({store,autosave});
  if(loadError)storageStatus('error',`Deine bisherigen Browserdaten wurden nicht überschrieben. ${loadError.message} Du kannst eine Sicherung importieren und als Datei weiterarbeiten.`);
  else if(!initial)autosave.queue(store.get());else storageStatus('saved');
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')autosave?.flush();});
  window.addEventListener('beforeunload',event=>{if(autosave?.isPending()||!storage){event.preventDefault();event.returnValue='';}});
}
// A second tab must not silently overwrite the first tab's local document.
if(navigator.locks){
  let started=false;
  navigator.locks.request('ideenwerk-document-writer',{ifAvailable:true},async lock=>{
    if(!lock){document.getElementById('app').innerHTML='<main style="padding:60px;max-width:600px"><h1>Dein Studio ist schon geöffnet.</h1><p style="margin:20px 0;line-height:1.8">Bitte im anderen Ideenwerk-Tab weiterarbeiten. So bleiben deine lokalen Änderungen zusammen. Schließe den anderen Tab und lade diese Seite neu, um hier weiterzuarbeiten.</p><a href="">Erneut öffnen ↗</a></main>';return;}
    started=true;await start();await new Promise(resolve=>window.addEventListener('pagehide',resolve,{once:true}));
  }).catch(error=>{if(!started)start().catch(cause=>storageStatus('error',cause.message));else storageStatus('error',error.message);});
}else start().catch(error=>storageStatus('error',error.message));
