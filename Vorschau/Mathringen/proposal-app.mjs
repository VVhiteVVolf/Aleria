import {REALM_CONTEXT} from './realm-context.mjs';
import {FAITH_CONTEXT} from './source-context.mjs';
import {HOUSES} from './house-data.mjs';
import {ARTWORKS} from './art-data.mjs';
import {ESTATES,ESTATE_GROUPS} from './estate-data.mjs';
import {CLASS_PROTOTYPES} from './warrior-data.mjs';
import {REGIONS,SETTLEMENTS} from './territory-data.mjs';
import {renderMathringenPage} from './proposal-render.mjs';
import {createArtDialogs} from './art-dialogs.mjs';
import {mountHousePlacement} from './house-placement.mjs';
function mountMathringen(root){
 root.innerHTML=renderMathringenPage({context:REALM_CONTEXT,faith:FAITH_CONTEXT,houses:HOUSES,
  prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,estateGroups:ESTATE_GROUPS,
  settlements:SETTLEMENTS});
 let noticeTimer,placement;
 function notice(message){
  const box=root.querySelector('[data-role="status"]');
  box.textContent=message;box.hidden=false;clearTimeout(noticeTimer);
  noticeTimer=setTimeout(()=>{box.hidden=true;},6500);
 }
 const dialogs=createArtDialogs({dialog:root.querySelector('#art-dialog'),houses:HOUSES,
  prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,settlements:SETTLEMENTS,
  getPlacements:()=>placement?.current()??{},onChoose:id=>placement.choose(id)});
 placement=mountHousePlacement({root,onHouse:id=>dialogs.showHouse(id),notice},
  {houses:HOUSES,settlements:SETTLEMENTS,regions:REGIONS});
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-role="placement-root"]'))return;
  const button=event.target.closest('button[data-action]');
  if(button?.dataset.action==='show-art')dialogs.show(button.dataset.artKind,button.dataset.artId);
 });
}
mountMathringen(document.querySelector('[data-mathringen-workbench]'));
