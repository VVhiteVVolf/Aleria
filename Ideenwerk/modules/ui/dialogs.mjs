import {escapeHtml as h,closeButton} from './html.mjs';
export function createDialogs({root,toastRoot}) {
  let timer;
  function toast(message) {clearTimeout(timer);toastRoot.textContent=message;toastRoot.hidden=false;timer=setTimeout(()=>{toastRoot.hidden=true;},5000);}
  async function ask({title,label,value='',confirm='Speichern',description='',input=true,maxLength=120,danger=false}) {
    root.innerHTML=`<form method="dialog"><div class="modal-top"><div><div class="eyebrow">IDEENWERK</div><h2 id="text-dialog-title">${h(title)}</h2></div>${closeButton()}</div>${description?`<p class="modal-intro">${h(description)}</p>`:''}${input?`<label class="form-field field-label">${h(label||'Name')}<input class="field-input" name="value" value="${h(value)}" maxlength="${maxLength}" required></label>`:''}<div class="modal-footer"><button value="cancel" type="button" data-action="close" class="button secondary">Abbrechen</button><button value="save" type="submit" class="button ${danger?'danger secondary':'primary'}">${h(confirm)}</button></div></form>`;
    root.returnValue='cancel';root.showModal();
    root.querySelector('input')?.select();
    return new Promise(resolve=>{
      root.addEventListener('close',()=>resolve(root.returnValue==='save'?(input?root.querySelector('input').value.trim():true):null),{once:true});
    });
  }
  root.addEventListener('click',event=>{if(event.target.closest('[data-action="close"]'))root.close('cancel');});
  return {toast,ask};
}
