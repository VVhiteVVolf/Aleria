import {variants} from './variants.mjs';
import usedNames from './used-names.mjs';
import {previewAsset} from './preview-assets.mjs';
import {createRegionEditor} from './editor.mjs';
import {createClanDetails,renderClanTree} from './clan-hierarchy.mjs';
import {createClanMap} from './clan-map.mjs';
import {renderVariantView} from './variants-view.mjs';
import {clanDesigns} from './clan-designs.mjs';
import {createClanDesignGallery} from './clan-designs-view.mjs';

const drafts=new Map(variants.map(variant=>[variant.id,structuredClone(variant)]));
const root=document.querySelector('main');
let activeId=variants[0].id,selected='laimhe',editing=false,origin='list',noticeTimer;
const current=()=>drafts.get(activeId);
const byId=id=>current().regions.find(region=>region.id===id);
const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[’']/g,'').replace(/\s+/g,' ').trim();
const existingNames=new Set(usedNames.map(normalize));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function notice(message){const box=document.querySelector('#notice');box.textContent=message;box.classList.add('is-visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.classList.remove('is-visible'),3500);}
function validateName(name,id){
 const value=normalize(name);
 if(!/^tir na .+/u.test(value))return 'Bitte das Schema „Tir na …“ verwenden.';
 if(existingNames.has(value))return 'Dieser Regionsname ist im vorhandenen Seitenbestand bereits belegt.';
 if(current().regions.some(region=>region.id!==id&&normalize(region.name)===value))return 'Dieser Name wird in der Vorschau bereits für eine andere Region verwendet.';
 return '';
}
function setEditing(value){editing=value;const button=document.querySelector('[data-action="toggle-edit"]');button.setAttribute('aria-pressed',String(value));button.textContent=value?'Bearbeiten aktiv':'Bearbeiten';}
function card(region,featured=false){
 const index=current().regions.indexOf(region)+1;
 return `<article class="region-card ${featured?'featured ':''}${selected===region.id?'is-selected':''}" data-card="${region.id}"><button class="card-open" data-action="open-region" data-region="${region.id}" data-origin="card" aria-label="${escape(region.name)} – Banner und Entwurf öffnen"><img class="banner-art" src="${previewAsset(region.banner)}" width="1254" height="1254" alt="Bannerentwurf ${escape(region.name)}"><span class="card-copy"><span class="card-kicker">${String(index).padStart(2,'0')} · ${region.kind}</span><h3>${escape(region.name)}</h3><span class="meaning">${escape(region.meaning)}</span><span class="clan-line"><img src="${previewAsset(region.crest)}" alt="Wappen ${escape(region.clan)}"><span><strong>${escape(region.clan)}</strong><span>${escape(region.rank)} · Sitz: ${escape(region.seat)}</span></span></span><span class="card-summary">${escape(region.theme)}</span><span class="card-link">${editing?'Entwurf bearbeiten':'Bedeutung, Banner & Lehen ansehen'} ↗</span></span></button></article>`;
}
function renderRegions(){
 const regions=current().regions;
 document.querySelector('#region-list').innerHTML=regions.map((region,index)=>`<button class="region-nav ${selected===region.id?'is-selected':''}" data-action="open-region" data-origin="list" data-region="${region.id}" style="--region-colour:${region.colour}" aria-current="${selected===region.id?'true':'false'}"><img src="${previewAsset(region.crest)}" width="40" height="40" alt=""><span><strong>${index+1}. ${escape(region.name)}</strong><small>${escape(region.clan)} · ${escape(region.seat)}</small></span><span class="arrow">↗</span></button>`).join('');
 document.querySelector('#featured-region').innerHTML=card(regions[0],true);
 document.querySelector('#region-grid').innerHTML=regions.slice(1).map(region=>card(region)).join('');
}
function render(){renderVariantView({variant:current(),variants,escape});renderRegions();map.render();}
const details=createClanDetails({dialog:document.querySelector('#clan-dialog'),getVariant:current,escape});
const map=createClanMap({root,dialog:document.querySelector('#map-dialog'),getVariant:current,escape,onClan:id=>details.show(id)});
const editor=createRegionEditor({dialog:document.querySelector('#region-dialog'),getRegion:byId,validateName,
 onShow(region){document.querySelector('#dialog-clans').innerHTML=renderClanTree(current(),region.rulerId,{escape,compact:true});},
 onApply(id,patch){Object.assign(byId(id),patch);render();},
 onReset(id){Object.assign(byId(id),structuredClone(variants.find(v=>v.id===activeId).regions.find(region=>region.id===id)));render();},
 onEdit(){setEditing(true);},
 onClose(id){document.querySelector(`[data-region="${id}"][data-origin="${origin}"]`)?.focus({preventScroll:true});},notice});

document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button)return;
 const action=button.dataset.action;
 if(action==='choose-variant'){activeId=button.dataset.variant;if(!byId(selected))selected='laimhe';render();document.querySelector(`[data-variant="${activeId}"]`)?.focus({preventScroll:true});}
 if(action==='open-region'){selected=button.dataset.region;origin=button.dataset.origin;renderRegions();editor.show(selected,editing);}
 if(action==='show-clan'&&!button.closest('[data-role="map-surface"]')&&!button.closest('#clan-dialog'))details.show(button.dataset.clan);
 if(action==='toggle-edit'){setEditing(!editing);renderRegions();notice(editing?'Bearbeiten aktiv: eine Region öffnen.':'Vorschau aktiv.');}
 if(action==='open-map')map.open();
 if(action==='toggle-crests')map.toggleCrests(button);
 if(action==='toggle-names')map.toggleNames(button);
 if(action==='print')window.print();
});
createClanDesignGallery({root:document.querySelector('#clan-designs'),dialog:document.querySelector('#clan-design-dialog'),designs:clanDesigns});
render();
