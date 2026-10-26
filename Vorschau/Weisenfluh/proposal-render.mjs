import {houses,provinces,settlements,rankLabels} from './realm-data.mjs?v=20261026-3';

export const escapeHtml = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHtml;
const namedHouse=id=>houses.find(h=>h.id===id);
export function houseCard(house,selected=null){
 const province=provinces.find(p=>p.id===house.province);
 return `<article class="house-card ${selected===house.id?'is-selected':''}" data-drag-house="${house.id}"><button class="house-choice" data-action="choose-house" data-house="${house.id}" aria-pressed="${selected===house.id}" aria-label="Haus ${e(house.name)} zum Versetzen auswählen"><img src="assets/${house.crest}" alt="Wappen ${e(house.name)}" width="76" height="76" loading="lazy"><span><strong>${e(house.name)}</strong><small>${e(rankLabels[house.rank])}</small>${province?`<small>Herkunft: ${e(province.name)}</small>`:''}</span></button><button class="details-link" data-action="show-house" data-house="${house.id}">Haus & Krieger ↗</button></article>`;
}
export function renderRoyalHouse(){
 const house=namedHouse('goldkranz');
 return `<img src="assets/${house.crest}" width="120" height="120" alt="Wappen Haus Goldkranz"><div><p class="eyebrow">Das königliche Haus</p><h3>Haus Goldkranz</h3><p>Erlenkönig · Königliche Provinz Ewigensee</p></div>`;
}
export function renderProvinces(){
 return provinces.map(province=>{
  const ruler=namedHouse(province.ruler),seats=settlements.filter(s=>s.province===province.id&&s.id!==province.id);
  const locals=houses.filter(h=>h.province===province.id&&h.rank==='landmann'&&h.sourceSeat===province.id);
  return `<article class="province-card" style="--province-colour:${province.colour}"><header><img src="assets/${ruler.crest}" width="84" height="84" alt="Wappen ${e(ruler.name)}"><div><p class="eyebrow">${province.royal?'Königliche Provinz':'Freiherrentum'}</p><h3>${e(province.name)}</h3><p>Haus ${e(ruler.name)}</p></div></header><p>${e(province.description)}</p><dl><div><dt>Landmannssitze</dt><dd>${seats.map(s=>e(s.name)).join(', ')||'Offen'}</dd></div><div><dt>Weitere Landmänner am Hauptsitz</dt><dd>${locals.map(h=>e(h.name)).join(', ')||'Keine benannt'}</dd></div></dl></article>`;
 }).join('');
}
export function renderSettlements(placements,selected){
 return settlements.map(seat=>{
  const assigned=houses.filter(h=>placements[h.id]===seat.id);
  return `<article class="seat-card" data-seat="${seat.id}" data-drop-seat="${seat.id}"><header><p class="eyebrow">${e(seat.kind)}</p><h3>${e(seat.name)}</h3>${seat.sourceName?`<p class="source-name">Auf der Karte: ${e(seat.sourceName)}</p>`:''}</header><div class="house-grid">${assigned.map(h=>houseCard(h,selected)).join('')||'<p class="empty-seat">Hauszuordnung offen</p>'}</div><button class="seat-target" data-action="place-at-seat" data-drop-seat="${seat.id}" ${selected?'':'disabled'}>Gewähltes Wappen hier platzieren</button></article>`;
 }).join('');
}
