import {escapeHtml as h,closeButton} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {collectWorkspaceRequests,buildRequestSummary,fingerprintRequest,REQUEST_PRIORITIES,REQUEST_STAGES} from './request-model.mjs';

export function mountRequests(root,{store,onCreate,onOpen,onShare,toast}) {
  let mode='overview',renderVersion=0;
  async function render(){
    const version=++renderVersion;
    if(mode==='create'){
      root.innerHTML=`<div class="modal-top"><div><div class="eyebrow">WUNSCH FÜR DIE UMSETZUNG</div><h2 id="requests-title">Was möchtest du anfragen?</h2></div>${closeButton()}</div><p class="modal-intro">Du kannst erst in Ruhe schreiben. Beschreibung und Bilder werden automatisch lokal gespeichert.</p><div class="request-choices"><button type="button" class="request-choice" data-request-action="create" data-type="module-request">${icon('story')}<strong>Modulwunsch</strong><span>Ein neues Aleria-Modul, eine Szene, ein Ort oder eine Erweiterung.</span></button><button type="button" class="request-choice" data-request-action="create" data-type="avatar-request">${icon('character')}<strong>Avatarwunsch</strong><span>Ein neues Charakterbild mit Referenzbild, Pose, Kleidung und deinen Änderungswünschen.</span></button></div><div class="modal-footer"><button type="button" class="button secondary" data-action="close">Schließen</button></div>`;
      return;
    }
    const requests=collectWorkspaceRequests(store.get());
    const rows=await Promise.all(requests.map(async entry=>{
      const summary=buildRequestSummary(entry.module),proof=entry.module.requestMeta.submission;
      let saved='Nur lokal gespeichert';
      if(proof){
        const identical=proof.fingerprint===await fingerprintRequest(entry.module);
        saved=identical?'Dieser Stand liegt auf GitHub':'Seit der GitHub-Übergabe geändert';
      }
      return `<article class="request-overview-item"><div><small>${h(summary.kindLabel)} · ${h(entry.boardName)}</small><h3>${h(summary.title)}</h3><p>${h(summary.text.slice(0,180)||'Die Beschreibung ist noch leer.')}</p><p>${h(REQUEST_STAGES[summary.stage])} · ${h(REQUEST_PRIORITIES[summary.priority])} · ${summary.referenceImageCount} Bild${summary.referenceImageCount===1?'':'er'}</p><strong class="request-save-label">${h(saved)}</strong></div><button type="button" class="button secondary" data-request-action="open" data-board="${h(entry.boardId)}" data-id="${h(summary.id)}">Bearbeiten</button></article>`;
    }));
    if(version!==renderVersion||mode!=='overview')return;
    root.innerHTML=`<div class="modal-top"><div><div class="eyebrow">ALLE PINNWÄNDE</div><h2 id="requests-title">Deine Wünsche</h2></div>${closeButton()}</div><p class="modal-intro">Hier stehen nur Modul- und Avatarwünsche. Beim Speichern auf GitHub wählst du aus, welche Wünsche du weitergeben möchtest.</p><div class="request-overview">${rows.join('')||'<p>Noch keine Wünsche. Erstelle einen Modul- oder Avatarwunsch und ergänze deine Beschreibung.</p>'}</div><div class="modal-footer"><button type="button" class="button secondary" data-request-action="new">Wunsch erstellen</button><button type="button" class="button primary" data-request-action="share" ${requests.length?'':'disabled'}>Auf GitHub speichern</button></div>`;
  }
  function open(nextMode='overview'){mode=nextMode;render().catch(error=>toast(error.message));if(!root.open)root.showModal();}
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.action==='close'){root.close();return;}
    const action=button.dataset.requestAction;
    if(action==='new')open('create');
    if(action==='create'){root.close();onCreate(button.dataset.type);}
    if(action==='open'){root.close();onOpen(button.dataset.board,button.dataset.id);}
    if(action==='share'){root.close();onShare(collectWorkspaceRequests(store.get()).map(entry=>entry.module));}
  });
  store.subscribe(()=>{if(root.open&&mode==='overview')render().catch(error=>toast(error.message));});
  return {open,create:()=>open('create')};
}
