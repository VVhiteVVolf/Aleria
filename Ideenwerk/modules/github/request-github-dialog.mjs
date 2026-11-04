import {closeButton,escapeHtml as h} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {buildRequestSummary} from '../requests/request-model.mjs';
import {buildRequestPackage} from '../requests/request-package.mjs';
import {createGitHubRequestClient,REQUEST_BRANCH} from './github-requests.mjs';

export function mountRequestGitHubDialog(root,{toast}) {
  let snapshot=null,client=null,plan=null,packet=null,busy=false,onSaved=null;
  const find=selector=>root.querySelector(selector);
  function resetReview(){client=null;plan=null;packet=null;find('[data-request-github-review]').hidden=true;const button=find('[data-request-github-submit]');button.hidden=false;button.textContent='Auswahl und Ziel prüfen';}
  function render() {
    const rows=snapshot.requests.map(module=>{
      const summary=buildRequestSummary(module);
      return `<label class="request-share-choice"><input type="checkbox" name="request" value="${h(module.id)}"${summary.ready?' checked':''}${summary.problems.length?' disabled':''}><span><strong>${h(summary.title)}</strong><small>${h(summary.kindLabel)} · ${summary.referenceImageCount} Referenzbild${summary.referenceImageCount===1?'':'er'} · ${summary.ready?'Bereit zur Übergabe':'Entwurf'}${summary.problems.length?`<br>${h(summary.problems.join(' '))}`:''}</small></span></label>`;
    }).join('');
    root.innerHTML=`<div class="modal-top"><div><div class="eyebrow">WÜNSCHE WEITERGEBEN</div><h2 id="request-github-title">Auf GitHub speichern</h2></div>${closeButton()}</div><p class="modal-intro">Wähle die Wünsche aus, die zur Umsetzung weitergegeben werden sollen. Beschreibung und Referenzbilder werden gemeinsam gespeichert.</p><form><fieldset class="request-share-list"><legend>Diese Wünsche übergeben</legend>${rows||'<p>Lege zuerst einen Modul- oder Avatarwunsch an.</p>'}</fieldset><div class="form-field"><label class="field-label" for="request-github-repo">Privates Repository</label><input class="field-input" id="request-github-repo" placeholder="patrick/aleria-wuensche" required autocomplete="off"><p class="form-help">Ein gemeinsames privates Repository verwenden, auf das Patrick und die Projektleitung Zugriff haben. Für den ersten Start braucht es eine README.</p></div><div class="form-field"><label class="field-label" for="request-github-token">GitHub-Zugriffstoken</label><input class="field-input" id="request-github-token" type="password" required autocomplete="off" spellcheck="false" placeholder="Fine-grained Personal Access Token"><p class="form-help">Nur dieses Repository mit „Contents: Read and write“ freigeben. Der Token gilt nur für diesen geöffneten Dialog und wird nicht gespeichert. <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noreferrer">Token bei GitHub verwalten ↗</a></p></div><p class="form-help">Beim Schreiben wird weiterhin automatisch lokal gespeichert. Erst der abschließende GitHub-Knopf überträgt die ausgewählten Wünsche.</p><div class="error-box" data-request-github-error role="alert" hidden></div><div data-request-github-review hidden></div><div class="modal-footer"><button type="button" class="button secondary" data-action="close">Schließen</button><button type="submit" class="button primary" data-request-github-submit>Auswahl und Ziel prüfen</button></div></form>`;
  }
  root.addEventListener('click',event=>{if(event.target.closest('[data-action="close"]')&&!busy)root.close();});
  root.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
  root.addEventListener('close',()=>{snapshot=null;client=null;plan=null;packet=null;onSaved=null;root.innerHTML='';});
  root.addEventListener('input',()=>{if(!busy)resetReview();});
  root.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!snapshot)return;
    const button=find('[data-request-github-submit]');find('[data-request-github-error]').hidden=true;
    busy=true;root.querySelectorAll('input,button').forEach(control=>{control.disabled=true;});
    try {
      if(!plan) {
        const selected=new Set([...root.querySelectorAll('input[name="request"]:checked')].map(input=>input.value));
        packet=buildRequestPackage({workspaceId:snapshot.workspaceId,requests:snapshot.requests.filter(module=>selected.has(module.id))});
        client=createGitHubRequestClient({repository:find('#request-github-repo').value.trim(),token:find('#request-github-token').value});
        plan=await client.inspect();
        const review=find('[data-request-github-review]');review.hidden=false;
        review.innerHTML=`<div class="github-banner"><strong>${h(plan.repository)}</strong> · Privat<br>${packet.requests.length} ${packet.requests.length===1?'Wunsch':'Wünsche'} · ${packet.requests.reduce((sum,item)=>sum+item.referenceImageCount,0)} Referenzbilder · ${(packet.byteLength/1024/1024).toFixed(2)} MB<br>${packet.requests.map(item=>h(item.title)).join('<br>')}</div><p class="form-help">Diese Auswahl wird als Beschreibung und Bilddateien auf GitHub gespeichert. Sie lässt sich danach im Branch <strong>${REQUEST_BRANCH}</strong> mit VS Code abrufen.</p>`;
        button.textContent='Ausgewählte Wünsche auf GitHub speichern';
      }else {
        button.textContent='Wünsche werden übertragen …';
        const result=await client.push(packet,plan);
        const callback=onSaved;
        find('#request-github-token').value='';client=null;plan=null;packet=null;
        find('[data-request-github-review]').innerHTML=`<div class="github-banner">${icon('check')} <strong>Auf GitHub gespeichert.</strong><br>Commit ${h(result.sha.slice(0,8))}<br><a href="${h(result.url)}" target="_blank" rel="noreferrer">Wünsche und Bilder ansehen ↗</a></div><p class="form-help">Die Projektleitung kann diesen Stand jetzt in VS Code mit „Pull“ holen.</p>`;
        button.hidden=true;
        let marked=true;
        try{await callback?.(result);}catch{marked=false;}
        toast?.(marked?'Ausgewählte Wünsche auf GitHub gespeichert.':'Die Wünsche sind auf GitHub gespeichert. Die lokale Versandmarkierung konnte nicht aktualisiert werden.');
      }
    }catch(error) {
      const box=find('[data-request-github-error]');box.textContent=error.message||'Die Wünsche konnten nicht übertragen werden.';box.hidden=false;
      resetReview();
    }finally {
      busy=false;root.querySelectorAll('input,button').forEach(control=>{control.disabled=false;});
      // Incomplete wishes stay unavailable after a network error, too.
      snapshot?.requests.forEach(module=>{if(buildRequestSummary(module).problems.length){const input=[...root.querySelectorAll('input[name="request"]')].find(item=>item.value===module.id);if(input)input.disabled=true;}});
    }
  });
  return ({requests,workspaceId,onSaved:callback}={})=>{
    if(busy)return;
    snapshot={requests:structuredClone(requests||[]),workspaceId};onSaved=callback;client=null;plan=null;packet=null;
    render();root.showModal();
  };
}
