export const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderSettlements(proposal){
 return proposal.settlements.map(place=>{
  const clans=proposal.clans.filter(clan=>clan.seat===place.id);
  return `<article class="seat-card" data-seat="${place.id}" style="--seat-colour:${place.colour}">
   <div class="seat-heading"><span class="seat-count">${clans.length} ${clans.length===1?'Clan':'Clans'}</span><h3>${escapeHtml(place.name)}</h3></div>
   <div class="seat-clans">${clans.map(clan=>`<button class="clan-entry" data-action="show-clan" data-clan="${clan.id}" aria-label="${escapeHtml(clan.name)} · ${escapeHtml(place.name)} · Details öffnen"><img src="assets/${clan.crest}" width="52" height="52" alt="Wappen ${escapeHtml(clan.name)}"><span><strong>${escapeHtml(clan.name)}</strong><small>Clan in ${escapeHtml(place.name)}</small></span><span class="entry-arrow" aria-hidden="true">↗</span></button>`).join('')||'<p class="empty-seat">Noch kein Clan zugeordnet.</p>'}</div>
   <p>${escapeHtml(place.geography)}</p>
   ${place.mapLabel?`<p class="map-spelling">Kartenbeschriftung: ${escapeHtml(place.mapLabel)}</p>`:''}
  </article>`;
 }).join('');
}

export function renderVariants(variants,activeId){
 return variants.map(variant=>`<button class="variant-card ${variant.id===activeId?'is-current':''}" data-action="choose-variant" data-variant="${variant.id}" aria-pressed="${variant.id===activeId}"><span>0${variant.number}</span><span><strong>${escapeHtml(variant.label)}</strong><small>${variant.regionCount} Gebiete · 10 Städte · 11 Clans</small></span><span class="variant-status">${variant.id===activeId?'Aktiv':'Ansehen'}</span></button>`).join('');
}

export function renderRegions(proposal){
 return proposal.regions.map(region=>{
  const places=region.seats.map(id=>proposal.settlements.find(place=>place.id===id));
  const clans=proposal.clans.filter(clan=>region.seats.includes(clan.seat));
  const design=region.design;
  return `<article class="region-group ${design?'has-design':''}" style="--region-colour:${region.colour}">
   ${design?`<button class="region-banner-button" data-action="show-region" data-region="${region.id}" aria-label="${escapeHtml(design.name)} · ${design.source?'Banner und Namensentwurf':'Bannerentwurf'} öffnen"><img src="${design.banner}" width="1254" height="1254" alt="Bannerentwurf ${escapeHtml(design.name)}"><span>${design.source?'Banner & Namensentwurf':'Banner groß'} öffnen ↗</span></button>`:''}
   <div class="region-heading"><h3>${escapeHtml(design?.name||region.label)}</h3>
    ${design?`<p class="region-byname">${escapeHtml(design.byname)}</p>${design.meaning?`<p class="region-meaning">${escapeHtml(design.meaning)}</p>`:''}`:''}
    <span>${places.length} ${places.length===1?'Stadt':'Städte'} · ${clans.length} ${clans.length===1?'Clan':'Clans'}</span></div>
   ${design?`<p class="region-places">${places.map(place=>escapeHtml(place.name)).join(' · ')}</p><p class="region-landscape">${escapeHtml(design.landscape)}</p>`:''}
   <div class="region-clans">${clans.map(clan=>`<button data-action="show-clan" data-clan="${clan.id}"><img src="assets/${clan.crest}" width="34" height="34" alt=""><span>${escapeHtml(clan.name)}</span></button>`).join('')||'<p>Noch kein Clan zugeordnet.</p>'}</div></article>`;
 }).join('');
}
