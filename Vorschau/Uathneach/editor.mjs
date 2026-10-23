import {previewAsset} from './preview-assets.mjs';

export function createRegionEditor({dialog,getRegion,validateName,onApply,onReset,onEdit,onClose,onShow,notice}){
  let currentId='';
  const form=dialog.querySelector('form');
  const field=name=>form.elements.namedItem(name);
  const setText=(id,value)=>{dialog.querySelector('#'+id).textContent=value;};
  function show(id,edit=false){
    currentId=id;
    const region=getRegion(id);
    if(!region)return;
    setText('dialog-kind',region.kind);setText('dialog-rank',region.rank);
    setText('dialog-title',region.name);setText('dialog-meaning',region.meaning);
    setText('dialog-clan',region.clan);setText('dialog-seat','Sitz: '+region.seat);
    setText('dialog-geography',region.geography);setText('dialog-theme',region.theme);
    setText('dialog-places',region.places.join(' · '));setText('dialog-note',region.note);
    const banner=dialog.querySelector('#dialog-banner');banner.src=previewAsset(region.banner);banner.alt='Bannerentwurf '+region.name;
    const crest=dialog.querySelector('#dialog-crest');crest.src=previewAsset(region.crest);crest.alt='Vorhandenes Clanwappen '+region.clan;
    dialog.querySelector('#word-source').href=region.source;
    for(const name of ['name','meaning','geography','theme','note'])field(name).value=region[name];
    form.hidden=!edit;dialog.querySelector('#dialog-readonly').hidden=edit;
    dialog.querySelector('#edit-region-button').hidden=edit;
    setText('name-validation','');field('name').setCustomValidity('');
    onShow?.(region);
    if(!dialog.open)dialog.showModal();
  }
  form.addEventListener('input',event=>{
    if(event.target!==field('name'))return;
    const error=validateName(field('name').value,currentId);
    field('name').setCustomValidity(error);setText('name-validation',error);
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const name=field('name').value.trim(),error=validateName(name,currentId);
    field('name').setCustomValidity(error);setText('name-validation',error);
    if(!form.reportValidity())return;
    const patch=Object.fromEntries(['name','meaning','geography','theme','note'].map(key=>[key,field(key).value.trim()]));
    onApply(currentId,patch);dialog.close();notice('Entwurf nur in dieser Vorschau übernommen.');
  });
  dialog.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='close-dialog')dialog.close();
    if(action==='edit-region'){onEdit();show(currentId,true);field('name').focus();}
    if(action==='reset-region'){onReset(currentId);show(currentId,true);notice('Ursprünglicher Vorschlag wiederhergestellt.');}
    if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}
  });
  dialog.addEventListener('close',()=>onClose(currentId));
  return {show};
}
