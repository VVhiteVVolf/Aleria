/** Shared, stateless presentation for provisional house and clan dossiers. */
export function renderHouseDossier({title,source,warrior,classHref,crest,description,facts,houseId,canPlace,originalLink,headingId='house-title'},escape) {
 const e=escape;
 const figureTitle=`${title} · ${warrior.className}`;
 return `<header class="house-detail-heading"><p class="eyebrow">${e(source)}</p><h2 id="${e(headingId)}">${e(title)}</h2><p class="house-class-label">${classHref?`<a href="${e(classHref)}" target="_blank" rel="noopener">${e(warrior.className)}</a>`:e(warrior.className)} <span>· ${e(warrior.roleLabel??'Klassenvorschlag')}</span></p></header>
 <div class="house-detail-layout"><figure class="house-warrior"><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener" aria-label="${e(figureTitle)} in Großansicht"><img src="${e(warrior.image)}" width="768" height="1152" alt="Ganzkörperentwurf: ${e(figureTitle)}${warrior.mounted?' '+e(warrior.mountedLabel??'zu Pferd'):warrior.withHorse?' neben seinem Ross':''}"></a><figcaption><span>${e(warrior.representationLabel??'Kriegerdarstellung · Entwurf')}</span><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener">Figur in Großansicht ↗</a></figcaption></figure>
 <div class="house-profile"><a class="detail-art" href="${e(crest.fullsize)}" target="_blank" rel="noopener" aria-label="Wappen ${e(title)} vergrößern"><img class="detail-crest" src="${e(crest.image)}" width="200" height="200" alt="Wappen ${e(title)}"></a>
 ${description?`<p class="house-description">${e(description)}</p>`:''}
 <section class="warrior-concept" aria-label="Kriegerentwurf"><h3>${e(warrior.className)} · ${warrior.mounted?'Berittener Entwurf':warrior.withHorse?'Ritter & Ross':'Entwurf zu Fuß'}</h3><p>${e(warrior.reason)}</p><dl><div><dt>Farben</dt><dd>${e(warrior.palette)}</dd></div><div><dt>Ausrüstung</dt><dd>${e(warrior.equipment)}</dd></div></dl></section>
 ${warrior.bestiaryHref?`<p class="bestiary-reference"><a href="${e(warrior.bestiaryHref)}" target="_blank" rel="noopener">${e(warrior.horseName??'Reittier')} · Profil im Bestiarium ↗</a></p>`:''}
 <dl class="house-seat-details">${facts.map(({label,value})=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
 <p class="detail-links"><a href="${e(crest.fullsize)}" target="_blank" rel="noopener">Wappen in Großansicht ↗</a>${originalLink?`<a href="${e(originalLink)}" target="_blank" rel="noopener">Geliefertes Original ↗</a>`:''}</p>
 ${canPlace?`<button class="primary" data-action="select-from-dialog" data-house="${e(houseId)}">Dieses Haus auf der Karte platzieren</button>`:''}</div></div>`;
}
