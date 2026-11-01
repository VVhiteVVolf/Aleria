// Local QA: actual production views, reviewed public content, one demo emulator.
// The only write gateway is localhost:8879, hard-bound to demo-aleria-group-ui.
import { upgradeEntry } from '/AleriaAlmanach/modules/group-adventures/group-adventures-classic-api.mjs';
import { normalizeLandingData } from '/AleriaAlmanach/modules/landing/landing-model.js';
import { groupMemberSnapshots } from '/AleriaAlmanach/modules/landing/group-landing-data.js';
import { renderGroupBody, renderGroupRosterResults } from '/AleriaAlmanach/modules/landing/group-landing-view.js';
import { mountGroupNavigation } from '/AleriaAlmanach/modules/landing/group-landing-navigation.js';
import { mountGroupRosterWindow } from '/AleriaAlmanach/modules/landing/group-roster-window.js';
import { mountGroupAccount } from '/AleriaAlmanach/modules/landing/group-account-controller.js';
import { getBuiltinCreatureTemplates } from '/AleriaAlmanach/modules/creatures/creature-catalog.js';
import { itemDefinitionRegistry } from '/AleriaAlmanach/modules/item-definitions/item-definition-registry.js';
import { STANDARD_ITEMS } from '/AleriaAlmanach/modules/item-register/item-register-standard.js';
import { mountLandingQuestJournal, unmountLandingQuestJournal } from '/AleriaAlmanach/modules/landing/landing-quest-journal.js';

const root=document.querySelector('[data-preview-root]'),selector=document.querySelector('[data-preview-group]'),status=document.querySelector('[data-preview-status]');
const base='/AleriaAlmanach/modules/group-adventures/source/';
const ids=['skallis-gefolge','idwals-schiffsmannschaft','modul-1782120382311','rhydians-schiffsmannschaft','parzifals-schiffsmannschaft','lynnes-schiffsmannschaft','draig-leibgarde'];
const sources=await Promise.all(ids.map(async id=>(await (await fetch(`${base}${id}-2026-11-01.json`)).json()).entry));
sources.unshift((await (await fetch('/AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json')).json()).entry);
const entries=sources.map(upgradeEntry),snapshot=await (await fetch('/CharakterDatenbank/generated/characters.snapshot.json')).json();
let characters=snapshot.characters,creatures=getBuiltinCreatureTemplates(),stops=[],context=null,bridge=null,accountReceiver,connected=false;
const access={uid:'',role:'viewer'};
Object.assign(window,{sanitizeLandingData:normalizeLandingData,getInitialChar:name=>name?.slice(0,1)||'·',buildNav:()=>'',buildAleriaDateBadge:()=>'',moduleEntries:entries,currentPage:0,
  getAvailableCommentCharacters:()=>characters,getAllSections:()=>[{entries}],AleriaCreatures:{getAll:()=>creatures},
  AleriaItemRegister:{store:{snapshot:()=>({standards:STANDARD_ITEMS,offers:[],definitions:[],items:STANDARD_ITEMS,status:'live'})}}});
async function request(path,input) {
  const response=await fetch(`http://127.0.0.1:8879${path}`,input?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}:{});
  const result=await response.json();if(result.error)throw Object.assign(Error(result.error.message),{code:result.error.code});return result;
}
async function refreshBridge() {
  bridge=await request('/state');
  const merge=(all,rows)=>all.map(record=>rows.find(row=>row.id===record.id)||record);
  characters=merge(characters,bridge.characters);creatures=merge(creatures,bridge.creatures);
  accountReceiver?.(bridge.account);return bridge;
}
try{await refreshBridge();connected=true;Object.assign(access,{uid:'local-group-ui-moderator',role:'moderator'});}
catch{bridge=await (await fetch('/diagnostics/group-system-integration-2026-11-01/browser-stability-after-state.json')).json();status.textContent='Lesemodus: aufgezeichneter lokaler Teststand; keine produktiven Konten.';}
const definitions={
  record:(kind,id)=>connected?request(`/record?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`):Promise.resolve(bridge[kind]?.find(row=>row.id===id)),
  async ensureVersions(records){
    for(const record of records)for(const item of record.inventory?.items||[])if(item.definitionRef&&!itemDefinitionRegistry.get(item.definitionRef)){
      if(connected){const ref=item.definitionRef;itemDefinitionRegistry.add([await request(`/definition?id=${encodeURIComponent(ref.id)}&revision=${encodeURIComponent(ref.revision)}`)],{current:false});}
    }
  }
};
const repository={access:async()=>access,watchAccess(receive){receive(access);return()=>{};},
  groupAccount(_id,receive){accountReceiver=receive;receive(bridge.account);return()=>{accountReceiver=null;};},
  async inventory(input){if(!connected)throw Error('Diese Vorschau zeigt nur einen aufgezeichneten Teststand.');const result=await request('/commit',input);await refreshBridge();status.textContent=`Testübergabe bestätigt · Beleg ${result.receiptId} · nur lokaler Emulator`;return result;}
};
selector.innerHTML=entries.map(entry=>`<option value="${entry.id}">${entry.title}</option>`).join('');
function render(id){
  stops.forEach(stop=>stop?.());stops=[];if(context)unmountLandingQuestJournal(context);
  const entry=entries.find(row=>row.id===id)||entries[0],index=entry.pages.findIndex(page=>page.landingPage),page=entry.pages[index],data=normalizeLandingData(page.landing);
  window.currentEntry=entry;window.currentPage=index;
  const members=groupMemberSnapshots(entry,data.group);
  const fragments={quests:buildLandingQuests(data),journal:AleriaLandingModel.landingQuestJournalShell(entry.id),notes:buildLandingNotes(data),events:'',info:buildLandingInfo(data),map:buildLandingMap(data)};
  root.innerHTML=renderGroupBody(data,entry,index,members,[],null,fragments);
  const landing=root.querySelector('.group-landing');
  stops.push(mountGroupNavigation(landing,root,entry.id));
  const roster=mountGroupRosterWindow(landing.querySelector('[data-group-region=roster]'),renderGroupRosterResults);
  roster.update(members);stops.push(()=>roster.destroy());
  stops.push(mountGroupAccount(landing.querySelector('[data-group-quest-account]'),entry.id,{preview:entry.id!=='gawain-duncan'||!bridge,client:async()=>repository,definitions,getMembers:()=>members,getSceneThread:()=>''}));
  context={root,entry,page,pageIndex:index,preview:false};
  mountLandingQuestJournal(context,{client:async()=>({context(_request,receive){receive({quests:[],runs:[]});return()=>{};}}),catalog:async()=>({quests:[]})});
  if(bridge)status.textContent=entry.id==='gawain-duncan'?(connected?'Übergaben hier testen nur demo-aleria-group-ui. Inventare und Kampfbögen der echten Figuren bleiben unverändert.':'Lesemodus · aufgezeichneter lokaler Teststand der Gruppenkasse, keine produktiven Konten.'):'Öffentlicher Modulstand · Finanzdaten werden in dieser Vorschau nicht aus Firebase geladen.';
}
selector.addEventListener('change',event=>render(event.target.value));
root.addEventListener('click',event=>{
  const action=event.target.closest('[data-group-action]');if(action&&['profile','creature-profile'].includes(action.dataset.groupAction))status.textContent='Der echte Almanach öffnet hier den verknüpften Charakter- oder Kreaturbogen.';
});
render(entries[0].id);
