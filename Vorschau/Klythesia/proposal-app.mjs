import {ARTWORKS} from './art-data.mjs';
import {MAP,MAP_OBSERVATIONS,MAP_QUESTIONS} from './map-data.mjs';
import {RELIGION,CROSS_SOURCES} from './evidence-data.mjs';
import {renderKlythesiaPage} from './proposal-render.mjs';
import {createKlythesiaArtDialogs} from './art-dialogs.mjs';
import {REALM_CONTEXT} from './realm-context.mjs';
import {ESTATES,ESTATE_CONTEXT} from './estate-data.mjs';
import {CLASS_PROTOTYPES,HOUSE_WARRIORS} from './warrior-data.mjs';
import {HOUSES} from './house-data.mjs';
import {REGIONS,SETTLEMENTS} from './territory-data.mjs';
import {mountHousePlacement} from './house-placement.mjs';
import {REALM_WARRIOR} from './realm-warrior-data.mjs';

function mountKlythesiaPreparation(root){
  root.innerHTML=renderKlythesiaPage({religion:RELIGION,cross:CROSS_SOURCES,map:MAP,
    observations:MAP_OBSERVATIONS,mapQuestions:MAP_QUESTIONS,artworks:ARTWORKS,
    context:REALM_CONTEXT,estates:ESTATES,estateContext:ESTATE_CONTEXT,prototypes:CLASS_PROTOTYPES,houses:HOUSES,realmWarrior:REALM_WARRIOR});
  let placement,noticeTimer;
  function notice(message){
    const box=root.querySelector('[data-role="status"]');
    box.textContent=message;box.hidden=false;clearTimeout(noticeTimer);
    noticeTimer=setTimeout(()=>{box.hidden=true;},6500);
  }
  const arts=createKlythesiaArtDialogs({dialog:root.querySelector('#art-dialog'),artworks:ARTWORKS,
    houses:HOUSES,prototypes:CLASS_PROTOTYPES,warriors:HOUSE_WARRIORS,realmWarrior:REALM_WARRIOR,estates:ESTATES,settlements:SETTLEMENTS,
    getPlacements:()=>placement?.current()??{},onChoose:id=>placement.choose(id)});
  placement=mountHousePlacement({root,onHouse:id=>arts.showHouse(id),notice},
    {houses:HOUSES,settlements:SETTLEMENTS,regions:REGIONS});
  root.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if(!button)return;
    if(button.closest('[data-role="placement-root"]'))return;
    if(button.dataset.action==='show-art')arts.show(button.dataset.artKind,button.dataset.artId);
    if(button.dataset.action==='show-house')arts.showHouse(button.dataset.house);
  });
}
mountKlythesiaPreparation(document.querySelector('[data-klythesia-preparation]'));
