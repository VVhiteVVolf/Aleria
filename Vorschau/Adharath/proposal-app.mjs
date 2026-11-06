import {HOUSES} from './house-data.mjs';
import {REALM_CONTEXT} from './realm-context.mjs';
import {ESTATES} from './estate-data.mjs';
import {WARRIOR_PROTOTYPES} from './warrior-data.mjs';
import {REALM_ARTWORK,displayArtwork} from './artwork-data.mjs';
import {renderPreparation,renderClanCards,filterClans} from './proposal-render.mjs';
import {createArtDialogs} from './art-dialogs.mjs';

const root=document.querySelector('[data-adharath-workbench]');
if(root){
  const houses=HOUSES.map(displayArtwork),prototypes=WARRIOR_PROTOTYPES.map(displayArtwork),estates=ESTATES.map(displayArtwork);
  root.innerHTML=renderPreparation({context:REALM_CONTEXT,houses,prototypes,estates,realmArtwork:REALM_ARTWORK});
  const dialogs=createArtDialogs({dialog:root.querySelector('[data-role="art-dialog"]'),houses,prototypes,estates,realmArtwork:REALM_ARTWORK});
  const input=root.querySelector('[data-role="clan-filter"]'),gallery=root.querySelector('[data-role="clan-gallery"]'),count=root.querySelector('[data-role="clan-count"]');
  function updateGallery(){
    const visible=filterClans(houses,input.value);
    gallery.innerHTML=renderClanCards(visible);
    count.textContent=`${visible.length} von ${houses.length} Stämmen`;
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    if(button.dataset.action==='show-art')dialogs.show(button.dataset.artKind,button.dataset.artId);
    if(button.dataset.action==='clear-search'){input.value='';updateGallery();input.focus();}
  });
  root.addEventListener('input',event=>{if(event.target===input)updateGallery();});
  root.querySelector('.clan-search').addEventListener('submit',event=>event.preventDefault());
}
