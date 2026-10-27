import {occupationCounties,occupiedSettlements} from '../lothir-occupation.mjs';
import {escapeHtml as e} from './render.mjs';
import {houses} from '../lothir-occupation-houses.mjs';

export function renderOccupation(originRealm){
 const groups=occupationCounties.filter(c=>!originRealm||c.originRealm===originRealm);
 return `<p class="eyebrow">Besetzt · Herkunft bleibt erhalten</p><h2>${originRealm?'Verlorene Gebiete. Weiterhin Teil der Geschichte.':'Lothir: Herkunft und gegenwärtige Kontrolle.'}</h2><p>Die Triarchie hält diese Gebiete besetzt. Ihre Clans und Häuser werden dadurch nicht zu freiwilligen Anhängern. Namen und Zuordnungen sind Besprechungsvorschläge.</p><div class="occupation-grid">${groups.map(c=>`<article class="occupied-card"><p class="occupation-status">Unter Herrschaft der Triarchie</p><h3>${e(c.name)}</h3><p>Ursprüngliches Land: ${c.originRealm==='aldingen'?'Aldingen':'Iathneach'}</p><ul>${occupiedSettlements.filter(s=>s.county===c.id).map(s=>`<li><a href="../Triarchie/#seat-${e(s.id)}">${e(s.name)}</a> · ${e(s.kind)}${s.formerHouseId==='farraigeach'?' · ehemaliger Sitz der Mac Farraigeach':''}</li>`).join('')}</ul><div class="occupied-families">${houses.filter(h=>c.seats.includes(h.sourceSeat)).map(h=>`<a href="../Triarchie/#krieger"><img src="../Triarchie/${e(h.crest)}" width="64" height="64" alt="Wappen ${e(h.name)}" loading="lazy"><span>${h.clan?'Clan':'Haus'} ${e(h.name)}<small>Familien- und Sitzvorschlag</small></span></a>`).join('')}</div><p><a href="../Triarchie/">Besatzungsgebiete und Familien ansehen ↗</a></p></article>`).join('')}</div>`;
}
