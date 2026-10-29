import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
/** Fixed urban premises are independent from the editable outer seat draft. */
export function mountCivicResidences(root,houses){
 const section=root.ownerDocument.createElement('section');
 section.className='section civic-residences';section.id='haeuser';
 section.innerHTML=`<p class="eyebrow">Die fünf Aristokraten · Stadtresidenzen</p><h2>In der Stadt verwurzelt.</h2><p class="section-intro">Diese Residenznamen sind Vorschläge für die bereits vorgegebenen Stadtsitze. Die äußeren Herrschaftsgebiete bleiben vollständig zur gemeinsamen Verteilung frei.</p><div class="residence-grid">${houses.filter(h=>h.cityHome).map(h=>`<article><button data-action="show-house" data-house="${e(h.id)}"><img src="${e(h.crest)}" width="92" height="92" alt="Wappen ${e(h.name)}"><span><strong>Haus ${e(h.name)}</strong><small>${e(h.cityHome)} ↗</small></span></button><p>${e(h.focus)}</p><small>${h.seatRequirement==='castle'?'Äußerer Sitz: eine Burg; Zuordnung offen.':'Äußerer Hauptsitz: Zuordnung offen.'}</small></article>`).join('')}</div>`;
 root.querySelector('#gebiete').before(section);
}
