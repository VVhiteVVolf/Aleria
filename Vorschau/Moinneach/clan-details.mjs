import {escapeHtml as escape} from './proposal-render.mjs?v=20261026-1';
import {warriors} from './warrior-data.mjs?v=20261026-1';
import {renderHouseDossier} from '../shared/house-detail-render.mjs?v=20261026-2';

/** Realm adapter: material proposals and variant-specific seat editing stay local. */
export function renderClanDetails(proposal,clan,editing){
 const warrior=warriors.find(item=>item.id===clan.id);
 const place=proposal.settlements.find(item=>item.id===clan.seat);
 const region=proposal.regions.find(item=>item.seats.includes(place.id));
 const neighbours=proposal.clans.filter(item=>item.seat===place.id&&item.id!==clan.id);
 const dossier=renderHouseDossier({
  title:`Clan ${clan.name}`,source:'Clankrieger von Moinneach',
  warrior:{...warrior,mountedLabel:'auf einem Drúchtán'},
  classHref:`../../Klassenordner/Klassenseite.html#klasse-moinneach-${warrior.classId}`,
  crest:{image:`assets/${clan.crest}`,fullsize:`assets/${clan.crest}`},description:warrior.motif,
  facts:[
   {label:'Sitz im Entwurf',value:place.name},
   {label:'Materialien',value:warrior.materials},
   {label:'Versorgung · Entwurf',value:warrior.resourceBasis},
   {label:'Rang und Lehnsherr',value:'Noch offen'}
  ],canPlace:false,originalLink:clan.id==='brigantex'?'assets/originals/brigantex-supplied.png':null
 },escape);
 return `${dossier}<section class="clan-supplement"><h3>Die Lage</h3><p>${escape(place.geography)}</p>
 <p class="subtle">${escape(proposal.label)} · Gebietsgruppe: ${escape(region.design?.source?region.design.name+' · '+region.design.byname:region.label)}.</p>
 ${warrior.creatureHref?`<p class="clan-creature"><a href="${escape(warrior.creatureHref)}" target="_blank" rel="noopener">Drúchtán · Reit-, Last- und Sumpftier im Bestiarium ↗</a></p>`:''}
 ${place.mapLabel?`<p class="subtle">Die Karte beschriftet diesen Ort als „${escape(place.mapLabel)}“. Die Vorschau verwendet „${escape(place.name)}“.</p>`:''}
 ${neighbours.length?`<h3>Weitere Clans am selben Ort</h3><div class="neighbour-clans">${neighbours.map(other=>`<button data-action="show-clan" data-clan="${escape(other.id)}"><img src="assets/${escape(other.crest)}" width="38" height="38" alt=""><span>${escape(other.name)}</span></button>`).join('')}</div><p class="subtle">Die gemeinsame Stadtzuordnung legt kein Lehnsverhältnis zwischen diesen Clans fest.</p>`:''}
 ${editing?`<form data-role="clan-form"><h3>Zuordnung für diesen Entwurf bearbeiten</h3><label for="clan-seat">Sitz von ${escape(clan.name)}</label><select id="clan-seat" name="seat">${proposal.settlements.map(city=>`<option value="${escape(city.id)}" ${city.id===clan.seat?'selected':''}>${escape(city.name)}</option>`).join('')}</select><label for="clan-note">Notizen zum Vorschlag</label><textarea id="clan-note" name="note" rows="3" maxlength="1200">${escape(proposal.notes[clan.id]||'')}</textarea><button class="primary" type="submit">In dieser Vorschau übernehmen</button><p class="subtle">Änderungen gelten bis zum Neuladen dieser geöffneten Seite.</p></form>`:`${proposal.notes[clan.id]?`<h3>Entwurfsnotiz</h3><p>${escape(proposal.notes[clan.id])}</p>`:''}<button data-action="edit-clan" class="edit-detail">Zuordnung bearbeiten</button>`}</section>`;
}
