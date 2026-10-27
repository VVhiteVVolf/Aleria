import {renderOccupation} from '../shared/country-workbench/occupation-view.mjs';
import {context} from './realm-context.mjs?v=20261026-1';
import {renderContext,renderCounties} from './proposal-render.mjs?v=20261026-1';
import {createArtDialogs} from './art-dialogs.mjs?v=20261026-1';
import {createHousePlacement} from './house-placement.mjs?v=20261026-1';

const root=document.querySelector('[data-aldingen-proposal]');
let noticeTimer;
function notice(message){const box=root.querySelector('[data-role="status"]');box.textContent=message;box.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.hidden=true,6500);}
root.querySelector('[data-role="introduction"]').textContent=context.introduction;
root.querySelector('[data-role="context"]').innerHTML=renderContext();
root.querySelector('[data-role="occupation"]').innerHTML=renderOccupation('aldingen');
root.querySelector('[data-role="counties"]').innerHTML=renderCounties();
const dialogs=createArtDialogs({dialog:root.querySelector('#art-dialog'),getPlacements:()=>placements.current(),onChoose:id=>placements.choose(id)});
const placements=createHousePlacement({root,onHouse:id=>dialogs.showHouse(id),notice});
root.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;switch(button.dataset.action){case 'show-house':dialogs.showHouse(button.dataset.house);break;case 'show-territory':dialogs.showTerritory(button.dataset.territory);break;case 'print':window.print();break;}});
