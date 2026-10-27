import {TEMPLATES} from './catalog.mjs';
import {escapeHtml as h,closeButton} from '../ui/html.mjs';
import {icon} from '../ui/icons.mjs';
export function mountTemplatePicker(root,onChoose) {
  root.innerHTML=`<div class="modal-top"><div><div class="eyebrow">EIN ANFANG FÜR ALLES</div><h2 id="template-title">Was geht dir durch den Kopf?</h2></div>${closeButton()}</div><p class="modal-intro">Starte mit einer Vorlage. Ergänze eigene Seiten und Inhalte, sobald deine Idee wächst.</p><div class="template-grid">${TEMPLATES.map(template=>`<button data-action="choose-template" data-template="${template.id}" class="template-choice tone-${template.color}"><span class="template-icon">${icon(template.icon)}</span><h3>${h(template.name)}</h3><p>${h(template.description)}</p><small>${h(template.hint)} ↗</small></button>`).join('')}</div>`;
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-action="close"]'))root.close();
    const choice=event.target.closest('[data-template]');if(choice){root.close();onChoose(choice.dataset.template);}
  });
  return ()=>root.showModal();
}
