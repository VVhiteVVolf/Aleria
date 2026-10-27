import {houses} from './house-data.mjs?v=20261026-1';
import {counties,settlements} from './territory-data.mjs?v=20261026-1';
import {context} from './realm-context.mjs?v=20261026-1';

export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHtml;
export const rankLabel=house=>house.clan?'Albischer Laird':'Adelsfamilie · Rang offen';
export function houseCard(house,selected){
 return `<article class="house-card ${selected===house.id?'is-selected':''}" data-drag-house="${e(house.id)}"><button class="house-choice" data-action="choose-house" data-house="${e(house.id)}" aria-pressed="${selected===house.id}" aria-label="${house.clan?'Clan':'Haus'} ${e(house.name)} zum Versetzen auswählen"><img src="${e(house.crest)}" width="80" height="80" alt="Wappen ${e(house.name)}" loading="lazy"><span><strong>${e(house.name)}</strong><small>${e(rankLabel(house))}</small>${house.isNew?'<small>Neuer Namens- und Wappenentwurf</small>':''}</span></button><button class="details-link" data-action="show-house" data-house="${e(house.id)}">Wappen & Krieger öffnen ↗</button></article>`;
}
export function renderContext(){
 return `<div class="history-layout"><figure><a href="../Goldmund/assets/production/orneach.png" target="_blank" rel="noopener"><img src="../Goldmund/assets/history/orneach.webp" width="300" height="300" alt="Antikes Wappen Órneachs: ein goldener Schwan" loading="lazy"></a><figcaption>Órneach · Das gemeinsame albische Erbe</figcaption></figure><div class="history-grid">${context.history.map(item=>`<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div></div><div class="theme-grid">${context.themes.map(item=>`<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div>`;
}
export function renderCounties(){
 return counties.map(county=>`<article class="county-card" style="--county-colour:${county.colour}"><button class="shield-link" data-action="show-territory" data-territory="${county.shield}"><img src="assets/shields/${county.shield}.webp" width="160" height="160" alt="Schildentwurf ${e(county.name)}" loading="lazy"><span>${e(county.name)} ↗</span></button><p>${county.ducal?'Ein gemeinsames Schild für herzogliche Grafschaft und Baronie Klingenhagen. Aldershafen besitzt ein eigenes Herrschaftsschild.':'Gemeinsames Schild der farblich zusammengehörigen Gebiete.'}</p><ul>${county.seats.map(id=>{const s=settlements.find(item=>item.id===id);return `<li>${e(s.name)} · ${e(s.kind)}</li>`;}).join('')}</ul></article>`).join('');
}
export function renderSeats(placements,selected){
 return settlements.map(seat=>`<article class="seat-card" data-seat="${seat.id}" data-drop-seat="${seat.id}"><header><button class="seat-shield" data-action="show-territory" data-territory="${seat.shield}" aria-label="Gebietsschild ${e(seat.name)} öffnen"><img src="assets/shields/${seat.shield}.webp" width="110" height="110" alt="Gebietsschild ${e(seat.name)}" loading="lazy"></button><div><p class="eyebrow">${e(seat.kind)}</p><h3>${e(seat.name)}</h3><p class="seat-county">${e(counties.find(c=>c.id===seat.county).name)}</p></div></header><p class="geography">${e(seat.geography)}</p><div class="house-grid">${houses.filter(h=>placements[h.id]===seat.id).map(h=>houseCard(h,selected)).join('')||'<p class="empty-seat">Hauszuordnung offen</p>'}</div><button class="seat-target" data-action="place-at-seat" data-drop-seat="${seat.id}" ${selected?'':'disabled'}>Gewähltes Wappen hier platzieren</button></article>`).join('');
}
