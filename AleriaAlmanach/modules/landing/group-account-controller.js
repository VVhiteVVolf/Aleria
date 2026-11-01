import { getQuestClient } from '../quests/quest-client.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { renderGroupAccount } from './group-account-view.js';
import { createGroupAccountDialog } from './group-account-dialog.js';
import { createGroupAccountOperations } from './group-account-operations.js';

const mounts = new WeakMap();
export function mountGroupAccount(host, groupId, { preview=false, client=getQuestClient, definitions=itemDefinitionStore,
  getMembers=()=>[], getSceneThread=()=>'', dialogFactory=createGroupAccountDialog } = {}) {
  mounts.get(host)?.();
  const abort=new AbortController(),content=document.createElement('div');content.className='group-account';host.replaceChildren(content);
  let stopped=false,repository,account=null,access=null,status=preview?'':'Der gemeinsame Vorrat wird aufgeschlagen …',error=false,limit=12,version=0;
  const stops=[];
  const operations=createGroupAccountOperations(input=>{
    if(!repository)throw Error('Die gemeinsame Kasse ist noch nicht verbunden.');
    return repository.inventory(input);
  });
  function render() { if(!stopped)content.innerHTML=renderGroupAccount(account,{preview,access,status,error,limit,pending:!!operations.pending()}); }
  function notice(message,failed=false) {status=message;error=failed;render();}
  async function applyAccount(next) {
    if(stopped || Number(next?.revision || 0)<Number(account?.revision || 0))return;
    account=next;const token=++version;render();
    try {await definitions.ensureVersions(next?[next]:[]);if(!stopped && token===version)render();}
    catch(failure){if(!stopped && token===version)notice(`Einige Gegenstände warten noch auf ihre Beschreibung: ${failure.message}`,true);}
  }
  async function accept(result) {
    if(stopped)return;
    await applyAccount({...account,id:groupId,inventory:result.groupInventory,revision:result.groupRevision});
    notice('Die Übergabe ist bestätigt. Euer Vorrat ist auf dem aktuellen Stand.');
  }
  const dialog=dialogFactory({root:host,definitions,async onSubmit(input) {
    try {const result=await operations.submit(input);await accept(result);return result;}
    catch(failure){notice(operations.pending()?'Die Übergabe ist noch nicht bestätigt. Ihr könnt sie unverändert erneut prüfen.':failure.message,true);throw failure;}
  }});
  content.addEventListener('click',async event=>{
    const trigger=event.target.closest?.('[data-group-account-action]');if(!trigger || stopped)return;
    const action=trigger.dataset.groupAccountAction;
    if(action==='more'){limit+=12;render();return;}
    if(action==='card') {const item=account?.inventory?.items?.find(row=>row.id===trigger.dataset.groupAccountItem);if(item)dialog.openCard(item);return;}
    if(preview)return;
    trigger.disabled=true;
    try {
      if(action==='retry'){const result=await operations.retry();await accept(result);return;}
      if(!repository)throw Error('Der gemeinsame Vorrat wird noch aufgeschlagen. Bitte einen Augenblick warten.');
      access=await repository.access();if(stopped)return;
      const editorial=['admin','moderator','editor'].includes(access.role),manager=account?.managerUids?.includes(access.uid);
      if((action==='withdraw'||action==='give-item') && !editorial && !manager)throw Error('Diese Übergabe kann die Spielleitung oder eine beauftragte Person vornehmen.');
      if(action==='grant' && !editorial)throw Error('Neue gemeinsame Ausrüstung ergänzt die Redaktion oder Spielleitung.');
      if(!['deposit','withdraw','give-item','grant'].includes(action))return;
      if(operations.pending())throw Error('Bitte zuerst die noch offene Übergabe erneut prüfen.');
      dialog.open({action:action==='give-item'?'withdraw':action,groupId,account,members:getMembers(),access,
        itemId:trigger.dataset.groupAccountItem || '',sceneThread:getSceneThread()});
    } catch(failure){if(!stopped)notice(failure.message,true);}
    finally {if(trigger.isConnected)trigger.disabled=false;}
  },{signal:abort.signal});
  render();
  if(!preview)client().then(adapter=>{
    if(stopped)return;repository=adapter;
    const stopAccount=adapter.groupAccount(groupId,next=>{if(stopped)return;status='';error=false;void applyAccount(next);},()=>notice('Die gemeinsame Kasse ist derzeit nicht verbunden. Der letzte Stand bleibt aufgeschlagen.',true));stops.push(stopAccount);
    if(adapter.watchAccess)stops.push(adapter.watchAccess(next=>{access=next;render();}));
    if(definitions.subscribe)stops.push(definitions.subscribe(render));
  }).catch(failure=>{if(!stopped)notice(`Die gemeinsame Kasse ist gerade nicht erreichbar: ${failure.message}`,true);});
  function destroy(){if(stopped)return;stopped=true;version++;abort.abort();stops.forEach(stop=>stop?.());dialog.destroy();mounts.delete(host);}
  mounts.set(host,destroy);return destroy;
}
