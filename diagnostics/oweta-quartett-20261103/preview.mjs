// Read-only UI diagnosis. Exact public document IDs only; no full snapshots,
// browser storage, authentication SDK, write gateway or content subscriptions.
import { OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS } from '/AleriaAlmanach/modules/oweta-quartett/oweta-quartett-data.mjs';
import { normalizeLandingData } from '/AleriaAlmanach/modules/landing/landing-model.js';
import { groupMemberSnapshots } from '/AleriaAlmanach/modules/landing/group-landing-data.js';
import { renderGroupBody, renderGroupRosterResults, html } from '/AleriaAlmanach/modules/landing/group-landing-view.js';
import { mountGroupNavigation } from '/AleriaAlmanach/modules/landing/group-landing-navigation.js';
import { mountGroupRosterWindow } from '/AleriaAlmanach/modules/landing/group-roster-window.js';
import { renderGroupAccount, groupAccountItemCard } from '/AleriaAlmanach/modules/landing/group-account-view.js';
import { itemDefinitionRegistry } from '/AleriaAlmanach/modules/item-definitions/item-definition-registry.js';
import { decodeFirestoreFields } from '/firebase/scripts/backup/firestore-value-codec.mjs';

const root=document.querySelector('[data-preview-root]'),status=document.querySelector('[data-preview-status]');
const dialog=document.querySelector('[data-preview-card]');
const base='https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents/';
async function readDocument(path,fields=[]){
  const url=new URL(base+path);fields.forEach(field=>url.searchParams.append('mask.fieldPaths',field));
  const response=await fetch(url,{method:'GET',credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error(`Öffentliche Akte nicht erreichbar (${response.status}): ${path}`);
  const document=await response.json();return {id:document.name.split('/').at(-1),...decodeFirestoreFields(document.fields||{})};
}

let entry,account,characters,creatures,stops=[];
function clear(){stops.forEach(stop=>stop?.());stops=[];}
function render(view='folio'){
  clear();document.querySelectorAll('[data-preview-view]').forEach(button=>button.setAttribute('aria-current',button.dataset.previewView===view?'page':'false'));
  const hierarchyIndex=entry.pages.findIndex(page=>page.hierarchyPage),folioIndex=entry.pages.findIndex(page=>page.landingPage);
  window.currentEntry=entry;
  if(view==='intro'){
    const page=entry.pages[0];
    root.innerHTML=`<article class="preview-intro"><img src="${html(page.image)}" alt="Oweta, Rianna, Lefraye und Caralyn bei ihrer Mittagsrast mit den sechs Tieren"><div><h1>${html(page.pageTitle)}</h1>${sanitizeContentHtml(page.description)}<dl>${page.stats.map(([label,value])=>`<dt>${html(label)}</dt><dd>${html(value)}</dd>`).join('')}</dl></div></article>`;
  }else if(view==='hierarchy'){
    root.innerHTML=buildHierarchyPage(entry.pages[hierarchyIndex],entry,hierarchyIndex,entry.pages.length);
    mountHierarchyPage({root});
  }else{
    const page=entry.pages[folioIndex],data=normalizeLandingData(page.landing);
    window.currentPage=folioIndex;
    const members=groupMemberSnapshots(entry,data.group);
    const fragments={quests:buildLandingQuests(data),journal:'<p class="group-empty">Für dieses Quartett wurde noch kein Auftrag festgelegt.</p>',notes:buildLandingNotes(data),events:'',info:buildLandingInfo(data),map:''};
    root.innerHTML=renderGroupBody(data,entry,folioIndex,members,[],null,fragments);
    const landing=root.querySelector('.group-landing');
    stops.push(mountGroupNavigation(landing,root,entry.id));
    const roster=mountGroupRosterWindow(landing.querySelector('[data-group-region=roster]'),renderGroupRosterResults);
    roster.update(members);stops.push(()=>roster.destroy());
    landing.querySelector('[data-group-quest-account]').innerHTML=renderGroupAccount(account,{preview:true,limit:100});
    if(view==='inventory')landing.querySelector('[data-group-tab=inventory]').click();
  }
  status.textContent=`Veröffentlichter Lesestand · ${characters.length} Figuren · ${creatures.length} Tiere · ${account.inventory.items.length} Vorratspositionen · keine Browserentwürfe gelesen oder verändert`;
}

document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-preview-view]');if(nav&&entry)render(nav.dataset.previewView);
  if(event.target.closest('[data-preview-close]'))dialog.close();
  const card=event.target.closest('[data-group-account-action=card]');
  if(card){const item=account?.inventory?.items.find(row=>row.id===card.dataset.groupAccountItem);if(item){dialog.querySelector('[data-preview-card-content]').innerHTML=groupAccountItemCard(item);dialog.showModal();}}
});

try{
  const [moduleRecord,groupAccount,people,animals]=await Promise.all([
    readDocument('module_store_entries/oweta-quartett',['entryJson','entry']),
    readDocument('group_quest_accounts/oweta-quartett',['inventory','revision','name']),
    Promise.all(OWETA_QUARTET_MEMBERS.map(person=>readDocument(`characters/${person.id}`,['name','portrait','combatProfile']))),
    Promise.all(OWETA_QUARTET_COMPANIONS.map(animal=>readDocument(`creatures/${animal.id}`,['name','portrait','species','combatProfile'])))
  ]);
  entry=moduleRecord.entryJson?JSON.parse(moduleRecord.entryJson):moduleRecord.entry;
  account=groupAccount;characters=people;creatures=animals;
  if(entry?.id!=='oweta-quartett'||account?.id!=='oweta-quartett')throw Error('Unerwartete Gruppe im Lesestand.');
  for(const item of account.inventory.items)if(item.definitionRef&&!itemDefinitionRegistry.get(item.definitionRef))throw Error(`Itemversion nicht im lokalen Register: ${item.definitionRef.id}`);
  Object.assign(window,{sanitizeLandingData:normalizeLandingData,getInitialChar:name=>name?.slice(0,1)||'·',buildNav:()=>'',buildAleriaDateBadge:()=>'',getInlineCommentThreadForPage:()=>'',moduleEntries:[entry],currentPage:0,
    getAvailableCommentCharacters:()=>characters,getAllSections:()=>[{entries:[entry]}],AleriaCreatures:{getAll:()=>creatures}});
  render(new URLSearchParams(location.search).get('view')||'folio');
}catch(error){status.textContent='Die Lesevorschau konnte nicht vollständig geöffnet werden.';root.innerHTML=`<p class="preview-error">${html(error.message)}</p>`;console.error(error);}
