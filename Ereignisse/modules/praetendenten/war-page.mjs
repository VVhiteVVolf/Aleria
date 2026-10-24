import { createWarMap } from './war-map-controller.mjs';

const normalize=value=>String(value).toLocaleLowerCase('de').normalize('NFD').replace(/\p{M}/gu,'').replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u').replace(/ß/g,'ss');

export function createWarTimeline(root){
  const cleanup=new AbortController(),search=root.querySelector('[data-war-search]');
  const buttons=[...root.querySelectorAll('[data-war-filter]')],entries=[...root.querySelectorAll('[data-war-event]')];
  const acts=[...root.querySelectorAll('[data-war-act]')],count=root.querySelector('[data-war-result-count]'),empty=root.querySelector('[data-war-empty]');
  const params=new URL(location.href).searchParams;
  let filter=buttons.some(button=>button.dataset.warFilter===params.get('fraktion'))?params.get('fraktion'):'all';
  search.value=params.get('suche')||'';
  function render(){
    const terms=normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible=0;
    entries.forEach(entry=>{
      const parties=entry.dataset.parties.split(' '),text=normalize(entry.dataset.search);
      entry.hidden=!(terms.every(term=>text.includes(term))&&(filter==='all'||filter==='ready'&&entry.dataset.ready==='true'||parties.includes(filter)));
      if(!entry.hidden)visible++;
    });
    acts.forEach(act=>act.hidden=![...act.querySelectorAll('[data-war-event]')].some(entry=>!entry.hidden));
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.warFilter===filter)));
    count.textContent=`${visible} von ${entries.length} Ereignissen`;empty.hidden=visible>0;
  }
  function save(){
    const url=new URL(location.href);
    if(filter==='all')url.searchParams.delete('fraktion');else url.searchParams.set('fraktion',filter);
    if(search.value.trim())url.searchParams.set('suche',search.value.trim());else url.searchParams.delete('suche');
    history.replaceState(null,'',url);render();
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-war-filter]');
    if(!button||!root.contains(button))return;
    filter=button.dataset.warFilter;save();
  },{signal:cleanup.signal});
  search.addEventListener('input',save,{signal:cleanup.signal});
  render();
  return Object.freeze({destroy(){cleanup.abort();}});
}

const timeline=document.querySelector('[data-war-timeline]');
if(timeline)createWarTimeline(timeline);
const map=document.querySelector('[data-war-map]');
if(map)createWarMap(map);
function openReadingBook(){
  if(location.hash!=='#lesebuch')return;
  const book=document.querySelector('#lesebuch');
  if(book){book.open=true;book.scrollIntoView({block:'start'});}
}
addEventListener('hashchange',openReadingBook);openReadingBook();
