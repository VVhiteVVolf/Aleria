import {closeButton,escapeHtml as h} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
import {BACKUP_BRANCH,createGitHubBackupClient} from './github-backup.mjs';
export function mountGitHubDialog(root,{getWorkspace,toast}) {
  let client=null,plan=null,snapshot=null,busy=false;
  function error(message){const box=root.querySelector('[data-github-error]');box.textContent=message;box.hidden=false;}
  function render() {
    root.innerHTML=`<div class="modal-top"><div><div class="eyebrow">EINE SICHERUNG FÜR DEINE IDEEN</div><h2 id="github-title">Ab ins GitHub-Regal.</h2></div>${closeButton()}</div><p class="modal-intro">Sichere dein gesamtes Projekt einschließlich Bildern in einem Repository deiner Wahl.</p><div class="github-banner">Eigener Branch: <strong>${BACKUP_BRANCH}</strong><br>Enthält ausschließlich Projektsicherungen. Dein Standardbranch bleibt unberührt. Der Editor ruft kein Deployment auf.</div><form id="github-form"><div class="form-field"><label class="field-label" for="github-repo">REPOSITORY</label><input class="field-input" id="github-repo" placeholder="patrick/meine-ideen" required autocomplete="off"><p class="form-help">Ein eigenes, mit README initialisiertes Backup-Repository ohne angebundenes Hosting verwenden. Bei einem öffentlichen Repository sind auch deine Ideen öffentlich.</p></div><div class="form-field"><label class="field-label" for="github-token">GITHUB-ZUGRIFFSTOKEN</label><input class="field-input" id="github-token" type="password" required autocomplete="off" spellcheck="false" placeholder="Fine-grained Personal Access Token"><p class="form-help">Nur das gewählte Repository freigeben, mit „Contents: Read and write“. Der Token wird beim Schließen verworfen und niemals gespeichert oder exportiert. <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noreferrer">Token bei GitHub verwalten ↗</a></p></div><div class="error-box" data-github-error hidden></div><div data-github-review hidden></div><div class="modal-footer"><button class="button secondary" type="button" data-action="close">Schließen</button><button class="button primary" type="submit" data-github-submit>${icon('github')} Ziel prüfen</button></div></form>`;
  }
  root.addEventListener('click',event=>{if(event.target.closest('[data-action="close"]')&&!busy)root.close();});
  root.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
  root.addEventListener('close',()=>{client=null;plan=null;snapshot=null;root.innerHTML='';});
  root.addEventListener('input',()=>{plan=null;client=null;snapshot=null;root.querySelector('[data-github-review]').hidden=true;root.querySelector('[data-github-submit]').innerHTML=`${icon('github')} Ziel prüfen`;});
  root.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const button=root.querySelector('[data-github-submit]');root.querySelector('[data-github-error]').hidden=true;
    busy=true;button.disabled=true;root.querySelectorAll('input,[data-action="close"]').forEach(element=>{element.disabled=true;});
    try{
      if(!plan){
        client=createGitHubBackupClient({token:root.querySelector('#github-token').value,repository:root.querySelector('#github-repo').value.trim()});
        plan=await client.inspect();snapshot=structuredClone(getWorkspace());
        const review=root.querySelector('[data-github-review]');review.hidden=false;review.innerHTML=`<div class="github-banner"><strong>${h(plan.repository)}</strong> · ${h(plan.visibility)}<br>${snapshot.boards.length} Pinnwände · ${snapshot.boards.reduce((sum,board)=>sum+board.modules.length,0)} Module · ${(new Blob([JSON.stringify(snapshot)]).size/1024/1024).toFixed(2)} MB<br>${plan.head?'Neuer Sicherungsstand auf dem vorhandenen Backup-Branch.':'Neuer, unabhängiger Backup-Branch ohne Anwendungscode.'}</div><p class="form-help">„Jetzt sichern“ überträgt dieses Projekt an GitHub. Externe Automationen deines Repositorys werden durch den Editor nicht verwaltet.</p>`;button.innerHTML=`${icon('export')} Jetzt sichern`;
      }else{
        button.textContent='Sicherung läuft …';const result=await client.push(snapshot,plan);
        root.querySelector('[data-github-review]').innerHTML=`<div class="github-banner">${icon('check')} <strong>Sicherung gespeichert.</strong><br>Commit ${h(result.sha.slice(0,8))}<br><a href="${h(result.url)}" target="_blank" rel="noreferrer">Projektdatei bei GitHub ansehen ↗</a></div>`;
        root.querySelector('#github-token').value='';client=null;plan=null;snapshot=null;button.hidden=true;toast('Dein Projekt wurde auf GitHub gesichert.');
      }
    }catch(cause){error(cause.message);plan=null;client=null;snapshot=null;button.innerHTML=`${icon('github')} Ziel erneut prüfen`;}finally{busy=false;button.disabled=false;root.querySelectorAll('input,[data-action="close"]').forEach(element=>{element.disabled=false;});}
  });
  return ()=>{render();root.showModal();};
}
