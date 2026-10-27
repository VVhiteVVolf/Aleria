import {houses} from './house-data.mjs?v=20261026-1';
import {territoryShields,settlements,counties} from './territory-data.mjs?v=20261026-1';
import {escapeHtml as e,rankLabel} from './proposal-render.mjs?v=20261026-1';
import {renderHouseShowcase,renderWarriorDescription} from './warrior-view.mjs?v=20261027-1';

export function renderHouseDetails(house,placements){
 const seat=settlements.find(s=>s.id===placements[house.id]);
 return `<p class="eyebrow">${e(house.source)}</p><h2 id="art-title">${house.clan?'Clan':'Haus'} ${e(house.name)}</h2>${renderHouseShowcase(house,e)}<div class="house-facts"><section aria-label="Haus und Sitz"><p>${e(house.motif)}</p><dl><div><dt>Farben</dt><dd>${e(house.palette.join(' · '))}</dd></div><div><dt>Rahmen</dt><dd>${e(house.frame)}</dd></div><div><dt>Rolle</dt><dd>${e(rankLabel(house))}</dd></div><div><dt>Sitz im Entwurf</dt><dd>${seat?e(seat.name):'Noch offen'}</dd></div><div><dt>Zuordnung</dt><dd>${house.sourceSeat?'Ausgangszuordnung nach deiner Vorgabe; im Entwurf bearbeitbar.':'Kein Sitz vorgegeben; frei zuordnen.'}</dd></div></dl>${house.bestiary?`<p><a href="${e(house.bestiary)}" target="_blank" rel="noopener">Herzogsschimmer im Bestiarium ↗</a></p>`:''}<button class="primary" data-action="select-from-dialog" data-house="${e(house.id)}">${house.clan?'Clan':'Haus'} auf der Karte zuordnen</button>${house.original?`<p class="original-link"><a href="${e(house.original)}" target="_blank" rel="noopener">Gelieferte Vorlage ansehen ↗</a></p>`:''}</section>${renderWarriorDescription(house,e)}</div>`;
}
export function renderTerritoryDetails(territory){
 const seat=settlements.find(s=>s.id===territory.id),county=seat?counties.find(c=>c.id===seat.county):counties.find(c=>c.shield===territory.id);
 return `<p class="eyebrow">${e(territory.kind)} · Entwurf</p><h2 id="art-title">${e(territory.name)}</h2><div class="art-detail-layout"><figure><a href="assets/production/${e(territory.id)}.png" target="_blank" rel="noopener"><img src="assets/shields/${e(territory.id)}.webp" width="480" height="480" alt="Kite-Schild ${e(territory.name)}"></a><figcaption><a href="assets/production/${e(territory.id)}.png" target="_blank" rel="noopener">Schild in Großansicht ↗</a></figcaption></figure><div><p>${e(territory.motif)}</p><dl><div><dt>Farben</dt><dd>${e(territory.palette.join(' · '))}</dd></div><div><dt>Zugehörigkeit</dt><dd>${e(county?.name??'Herzogliche Domäne')}</dd></div></dl>${seat?`<p>${e(seat.geography)}</p>`:`<p>Zugehörige Orte: ${e(county.seats.map(id=>settlements.find(s=>s.id===id).name).join(', '))}.</p>`}${territory.id==='klingenhagen'?'<p>Dieses eine Schild dient gemeinsam der herzoglichen Grafschaft und Baronie.</p>':''}<p class="subtle">Das Gebietsschild legt keine zusätzliche Haus- oder Lehnsherrenzuordnung fest.</p></div></div>`;
}
export function createArtDialogs({dialog,getPlacements,onChoose}){
 let trigger;
 function show(content){trigger=document.activeElement;dialog.querySelector('[data-role="art-details"]').innerHTML=content;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
 dialog.addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;if(button.dataset.action==='close-art')dialog.close();if(button.dataset.action==='select-from-dialog'){dialog.close();onChoose(button.dataset.house);}});
 return {showHouse(id){const house=houses.find(h=>h.id===id);if(house)show(renderHouseDetails(house,getPlacements()));},showTerritory(id){const territory=territoryShields.find(t=>t.id===id);if(territory)show(renderTerritoryDetails(territory));}};
}
