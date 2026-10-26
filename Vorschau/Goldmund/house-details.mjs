import {settlements,regions,rankLabels} from './realm-data.mjs?v=20261026-7';
import {escapeHtml as e} from './proposal-render.mjs?v=20261026-7';
import {warriors} from './warrior-data.mjs?v=20261026-7';

function warriorFigure(house,warrior) {
 const title=`${house.clan?'Clan':'Haus'} ${house.name} · ${warrior.className}`;
 return `<figure class="house-warrior"><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener" aria-label="${e(title)} in Großansicht"><img src="${e(warrior.image)}" width="768" height="1152" alt="Ganzkörperentwurf: ${e(title)}${warrior.mounted?' zu Pferd':''}"></a><figcaption><span>Kriegerdarstellung · Entwurf</span><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener">Figur in Großansicht ↗</a></figcaption></figure>`;
}

export function renderHouseDetails(house,placements,design) {
 const warrior=warriors.find(item=>item.id===house.id);
 const title=`${house.clan?'Clan':'Haus'} ${house.name}`;
 const seat=settlements.find(item=>item.id===placements[house.id]);
 const region=seat?regions.find(item=>item.id===seat.region):null;
 return `<header class="house-detail-heading"><p class="eyebrow">${e(house.source)}</p><h2 id="house-title">${e(title)}</h2><p class="house-class-label"><a href="../../Klassenordner/Klassenseite.html#klasse-goldmund-${e(warrior.classId)}" target="_blank" rel="noopener">${e(warrior.className)}</a> <span>· Klassenvorschlag</span></p></header>
 <div class="house-detail-layout">${warriorFigure(house,warrior)}<div class="house-profile">
 <a class="detail-art" href="${e(house.fullsize)}" target="_blank" rel="noopener" aria-label="Wappen ${e(title)} vergrößern"><img class="detail-crest" src="assets/${e(house.crest)}" width="200" height="200" alt="Wappen ${e(title)}"></a>
 <p class="house-description">${e(house.description)}</p>
 <section class="warrior-concept" aria-label="Kriegerentwurf"><h3>${e(warrior.className)} · ${warrior.mounted?'Berittener Entwurf':'Entwurf zu Fuß'}</h3><p>${e(warrior.reason)}</p><dl><div><dt>Farben</dt><dd>${e(warrior.palette)}</dd></div><div><dt>Ausrüstung</dt><dd>${e(warrior.equipment)}</dd></div></dl></section>
 <dl class="house-seat-details"><div><dt>Rolle im Entwurf</dt><dd>${e(rankLabels[house.rank])}</dd></div><div><dt>Sitz im Entwurf</dt><dd>${seat?`${e(seat.name)} · ${e(design.regionNames[region.id])}`:'Noch offen'}</dd></div><div><dt>Zuordnung</dt><dd>${house.sourceSeat?'Thronholt ist durch deine Vorgabe fest gesetzt.':'Freie Hauszuordnung; eine Platzierung legt keinen zusätzlichen Rang fest.'}</dd></div></dl>
 <p class="detail-links"><a href="${e(house.fullsize)}" target="_blank" rel="noopener">Wappen in Großansicht ↗</a>${house.original&&!house.revised?`<a href="${e(house.original)}" target="_blank" rel="noopener">Geliefertes Original ↗</a>`:''}</p>
 ${house.sourceSeat?'':`<button class="primary" data-action="select-from-dialog" data-house="${e(house.id)}">Dieses Haus auf der Karte platzieren</button>`}
 </div></div>`;
}
