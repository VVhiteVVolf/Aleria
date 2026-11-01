import { html } from './group-landing-markup.js';
import { groupAccountCurrencies, groupAccountCurrencyArt, groupAccountItemCard } from './group-account-view.js';
import { collectRegisterTemplates } from '../item-register/item-register-templates.js';
import { mountRegisterTemplatePicker, refreshRegisterTemplatePicker } from '../item-register/item-register-template-picker.js';
import { groupRegisterSnapshot } from './group-landing-register.js';
import { groupAccountMemberId as memberId, groupAccountMemberKey as memberKey, canContributeGroupInventory, buildGroupAccountRequest } from './group-account-operations.js';

export function createGroupAccountDialog({ root, definitions, readCatalog = groupRegisterSnapshot, onSubmit }) {
  let dialog, abort, cleanup=[], generation=0, returnFocus;
  function close() {
    generation++;cleanup.forEach(stop=>stop());cleanup=[];abort?.abort();
    if (dialog) { const node=dialog;dialog=null;node.close();node.remove(); }
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }
  function openCard(item) {
    close();returnFocus=document.activeElement;dialog=document.createElement('dialog');dialog.className='group-account-dialog group-account-card-dialog';
    dialog.setAttribute('aria-label',item.name || 'Gegenstand');dialog.innerHTML=`<button type="button" class="group-account-close" data-account-close aria-label="Schließen">×</button>${groupAccountItemCard(item)}`;
    root.append(dialog);bind();dialog.showModal();dialog.querySelector('button')?.focus();
  }
  function bind() {
    abort=new AbortController();
    dialog.addEventListener('click',event=>{if(event.target.closest('[data-account-close]') || event.target===dialog) close();},{signal:abort.signal});
    dialog.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();close();},{signal:abort.signal});
    dialog.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape') {event.preventDefault();close();}},{signal:abort.signal});
    dialog.addEventListener('close',close,{signal:abort.signal});
  }
  function open({ action, groupId, account, members, access, itemId = '', sceneThread = '' }) {
    close();returnFocus=document.activeElement;
    const token=++generation, candidates=members.filter(row=>memberId(row)), groupRevision=Number(account?.revision || 0);
    let record=null, selectedTemplate=null, memberGeneration=0;
    dialog=document.createElement('dialog');dialog.className='group-account-dialog';
    const grant=action==='grant';
    dialog.setAttribute('aria-label',grant?'Den Vorrat ergänzen':action==='deposit'?'Etwas beisteuern':'Eine Übergabe');
    dialog.innerHTML=`<form><header><div><small>Am gemeinsamen Reisegepäck</small><h3>${grant?'Den Vorrat ergänzen':action==='deposit'?'Etwas beisteuern':'Etwas weitergeben'}</h3></div><button type="button" data-account-close aria-label="Schließen">×</button></header>
      ${grant ? '<div data-account-picker></div>' : `<label>${action==='deposit'?'Wer steuert etwas bei?':'Für wen ist die Übergabe?'}<select name="member">${candidates.map(row=>`<option value="${html(memberKey(row))}">${html(row.name)}${row.kind==='creature'?' · Gefährte':''}</option>`).join('')}</select></label><p data-account-member-status role="status"></p><label>Was möchtet Ihr übergeben?<select name="kind"><option value="money"${!itemId?' selected':''}>Geld</option><option value="item"${itemId?' selected':''}>Einen Gegenstand</option></select></label>
      <div data-account-money><div class="group-account-currency-choice">${groupAccountCurrencies().map(currency=>`<label><input type="radio" name="currency" value="${currency.id}"${currency.id==='copper'?' checked':''}>${groupAccountCurrencyArt(currency)}${html(currency.label)}</label>`).join('')}</div><label>Anzahl der Münzen<input name="moneyQuantity" type="number" min="1" step="1" value="1" required></label></div>
      <div data-account-item><label>Gegenstand<select name="itemId"></select></label><div data-account-item-preview></div></div>`}
      <label${!grant?' data-account-item-quantity':''}>${grant?'Menge für den gemeinsamen Vorrat':'Menge'}<input name="quantity" type="number" min="1" step="1" value="1" required></label>
      ${sceneThread?'<label class="group-account-scene"><input type="checkbox" name="scene"> Im aktuellen Spiel vermerken</label>':''}
      <p class="group-account-dialog-error" data-account-error role="alert"></p><footer><button type="button" data-account-close>Zurück</button><button type="submit">${grant?'In den Vorrat legen':action==='deposit'?'Beisteuern':'Übergeben'}</button></footer></form>`;
    root.append(dialog);bind();
    const node=dialog, form=node.querySelector('form'),submit=form.querySelector('[type="submit"]'),message=node.querySelector('[data-account-error]');
    const valid = () => token===generation && dialog===node;
    function updateSections() {
      const money=form.elements.kind?.value==='money';
      node.querySelector('[data-account-money]')?.toggleAttribute('hidden',!money);
      node.querySelector('[data-account-item]')?.toggleAttribute('hidden',money);
      node.querySelector('[data-account-item-quantity]')?.toggleAttribute('hidden',money);
      if(form.elements.moneyQuantity) form.elements.moneyQuantity.required=money;
      if(form.elements.moneyQuantity) form.elements.moneyQuantity.disabled=!money;
      form.elements.quantity.required=grant || !money;
      form.elements.quantity.disabled=!grant && money;
      if(form.elements.itemId) form.elements.itemId.disabled=money;
      for(const radio of form.querySelectorAll('[name="currency"]'))radio.disabled=!money;
    }
    function fillItems() {
      if (!valid() || grant) return;
      const select=form.elements.itemId, chosen=select.value || itemId;
      const items=(action==='deposit'?record?.inventory:account?.inventory)?.items || [];
      const member=candidates.find(row=>memberKey(row)===form.elements.member.value);
      select.innerHTML='<option value="">Gegenstand wählen …</option>'+items.filter(item=>Number(item.quantity ?? 1)>0 && (!item.creatureId || member?.kind!=='creature')).map(item=>`<option value="${html(item.id)}"${item.id===chosen?' selected':''}>${html(item.name)} · ${html(item.quantity ?? 1)} vorhanden</option>`).join('');
      previewItem();
    }
    function previewItem() {
      const items=(action==='deposit'?record?.inventory:account?.inventory)?.items || [];
      const selected=items.find(item=>item.id===form.elements.itemId?.value);
      node.querySelector('[data-account-item-preview]').innerHTML=selected?groupAccountItemCard(selected):'';
      form.elements.quantity.max=selected?String(selected.quantity ?? 1):'';
    }
    async function loadMember() {
      const sequence=++memberGeneration;record=null;submit.disabled=true;
      const member=candidates.find(row=>memberKey(row)===form.elements.member.value),status=node.querySelector('[data-account-member-status]');
      if(!member) {status.textContent='Hier fehlt noch ein verknüpfter Bogen.';return;}
      status.textContent='Der persönliche Vorrat wird aufgeschlagen …';
      try {
        const current=await definitions.record(member.kind==='creature'?'creatures':'characters',memberId(member));
        if (!current) throw Error('Dieser Bogen ist zurzeit nicht verfügbar.');
        await definitions.ensureVersions([current]);
        if(!valid() || sequence!==memberGeneration) return;
        record=current;status.textContent='';fillItems();
        submit.disabled=action==='deposit' && !canContributeGroupInventory(record,access);
        if(submit.disabled) status.textContent='Aus diesem persönlichen Vorrat können seine Besitzerin, sein Besitzer oder die Spielleitung beisteuern.';
      } catch(error) {if(valid() && sequence===memberGeneration) status.textContent=error.message;}
    }
    if(grant) {
      const picker=node.querySelector('[data-account-picker]');
      const refresh=()=>{if(valid())refreshRegisterTemplatePicker(picker,collectRegisterTemplates(readCatalog()));};
      mountRegisterTemplatePicker(picker,{items:collectRegisterTemplates(readCatalog()),onSelect:item=>{selectedTemplate=item;submit.disabled=!item || form.getAttribute('aria-busy')==='true';}});
      const stop=globalThis.AleriaItemRegister?.store?.subscribe?.(refresh);if(stop)cleanup.push(stop);
      document.addEventListener('aleria:item-definitions-changed',refresh,{signal:abort.signal});
    } else { updateSections();void loadMember(); }
    form.addEventListener('change',event=>{
      if(event.target.name==='member')void loadMember();
      if(event.target.name==='kind')updateSections();
      if(event.target.name==='itemId')previewItem();
    },{signal:abort.signal});
    form.addEventListener('submit',async event=>{
      event.preventDefault();message.textContent='';submit.disabled=true;form.setAttribute('aria-busy','true');
      try {
        const fields=new FormData(form),member=candidates.find(row=>memberKey(row)===fields.get('member'));
        const input=buildGroupAccountRequest({groupId,action,groupRevision,member,record,access,template:selectedTemplate,fields,sceneThread});
        await onSubmit(input);if(valid())close();
      } catch(error) {if(valid())message.textContent=error.message;}
      finally {if(valid()) {form.removeAttribute('aria-busy');submit.disabled=grant?!selectedTemplate:!record || action==='deposit' && !canContributeGroupInventory(record,access);}}
    },{signal:abort.signal});
    node.showModal();node.querySelector('select,input,button')?.focus();
  }
  return {open,openCard,destroy:close};
}
