import {BREVANOR_CULTURE} from '../../Klassenordner/Brevanor/kultur.js';
import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {historicalEmblems} from './historical-emblems.mjs';
const shapes=[['region','Einzelherrschaft','Schmaler geschlossener Rahmen; die geschweifte Kontur bleibt klar sichtbar.'],['county','Comteyrat','Breiterer Zierrahmen und eine Grafenkrone.'],['royal','Königliche Domäne','Die reichste Fassung mit Königskrone und Lilienornamenten.']];
export function mountBrevanorCulturalReferences(root){
 const section=root.querySelector('#geschichte');
 const ancient=document.createElement('aside');
 ancient.className='brevanor-ancient-emblems';ancient.setAttribute('aria-label','Das antike Zeichen Brethneachs');
 ancient.innerHTML=historicalEmblems.map(h=>`<div class="brevanor-ancient-emblem"><figure><a href="${e(h.fullsize)}" target="_blank" rel="noopener" aria-label="Antikes Lilienwappen Brethneachs vergrößern"><img src="${e(h.image)}" width="300" height="300" alt="Antikes Wappen Brethneachs mit silberner Lilie"></a><figcaption>${e(h.caption)}</figcaption></figure><div><p class="eyebrow">Vor dem Königreich · Antikes Fürstentum</p><h3>${e(h.name)} · Unter der Lilie</h3><p>${e(h.description)}</p></div></div>`).join('');
 section.querySelector('.history-grid').before(ancient);
 const block=document.createElement('section');
 block.className='brevanor-cultural-references';block.setAttribute('aria-label','Adelsränge und drei Schildformen');
 block.innerHTML=`<div class="brevanor-ranks"><h3>Die elf Adelsränge</h3><p>Die überlieferte Rangfolge des Königreichs. Ein Adelstitel legte keine Kriegerklasse fest.</p><div class="brevanor-rank-table"><table><thead><tr><th>Rang</th><th>Titel</th><th>Entsprechung</th></tr></thead><tbody>${BREVANOR_CULTURE.orderOverview.nobleRanks.map((r,i)=>`<tr><td>${i+1}</td><th scope="row">${e(r.title)}</th><td>${e(r.subtitle)}</td></tr>`).join('')}</tbody></table></div></div><div class="brevanor-shapes"><h3>Drei Formen der Gebietsheraldik</h3><div class="brevanor-shape-grid">${shapes.map(([id,title,text])=>`<figure><a href="assets/shapes/${id}.png" target="_blank" rel="noopener" aria-label="Schildform ${e(title)} vergrößern"><img src="assets/shapes/${id}.png" width="300" height="300" loading="lazy" alt="${e(title)} · Schildform ohne Regionalmotiv"></a><figcaption><strong>${e(title)}</strong><p>${e(text)}</p></figcaption></figure>`).join('')}</div></div>`;
 section.append(block);
}
