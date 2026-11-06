import {PREPARATION_GROUPS,PREPARATIONS,filterPreparations} from './preparation-catalog.mjs';
import {renderOverview,renderPreparationSections} from './overview-render.mjs';

export function mountPreparationOverview(root){
  root.innerHTML=renderOverview(PREPARATION_GROUPS,PREPARATIONS);
  const search=root.querySelector('[data-role="search"]');
  const clear=root.querySelector('[data-action="clear-search"]');
  const sections=root.querySelector('[data-role="preparation-sections"]');
  const result=root.querySelector('[data-role="result-count"]');
  const empty=root.querySelector('[data-role="empty"]');
  function update(){
    const matches=filterPreparations(PREPARATIONS,search.value);
    sections.innerHTML=renderPreparationSections(PREPARATION_GROUPS,matches);
    result.textContent=`${matches.length} ${matches.length===1?'Vorbereitung':'Vorbereitungen'}`;
    empty.hidden=matches.length>0;
    clear.disabled=search.value.length===0;
  }
  function onInput(event){if(event.target===search)update();}
  function onClick(event){if(event.target.closest('[data-action="clear-search"]')){search.value='';update();search.focus();}}
  root.addEventListener('input',onInput);
  root.addEventListener('click',onClick);
  return {destroy(){root.removeEventListener('input',onInput);root.removeEventListener('click',onClick);}};
}

const root=document.querySelector('[data-preparation-overview]');
if(root)mountPreparationOverview(root);
