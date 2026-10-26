import {houses,counties,regions,settlements,rankLabels,realmDesigns} from './realm-data.mjs?v=20261026-7';

export const escapeHtml = value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e=escapeHtml;
const houseById=id=>houses.find(house=>house.id===id);
const familyTitle=house=>`${house.clan?'Clan':'Haus'} ${house.name}`;
const imageLink=(path,alt,className='',fullsize=path)=>`<a class="art-link ${className}" href="${e(fullsize)}" target="_blank" rel="noopener" aria-label="${e(alt)} vergrößern"><img src="${e(path)}" alt="${e(alt)}" width="480" height="640" loading="lazy"></a>`;

function nameEditor(scope,id,name,label) {
 return `<details class="name-editor"><summary>Namen ändern</summary><form data-name-scope="${scope}" data-name-id="${id}"><label>${e(label)}<input name="name" value="${e(name)}" minlength="2" maxlength="80" required autocomplete="off"></label><button type="submit">Übernehmen</button></form></details>`;
}

export function houseCard(house,selected=null) {
 const locked=Boolean(house.sourceSeat);
 return `<article class="house-card ${selected===house.id?'is-selected':''} ${locked?'is-locked':''}" ${locked?'':`data-drag-house="${house.id}"`}><button class="house-choice" data-action="${locked?'show-house':'choose-house'}" data-house="${house.id}" ${locked?'':`aria-pressed="${selected===house.id}"`} aria-label="${e(house.name)} ${locked?'– Hausdetails öffnen':'zum Versetzen auswählen'}"><img src="assets/${house.crest}" alt="Wappen ${e(house.name)}" width="76" height="76" loading="lazy"><span><strong>${e(house.name)}</strong><small>${e(rankLabels[house.rank])}</small><small>${locked?'Fest in Thronholt':e(house.source)}</small></span></button><button class="details-link" data-action="show-house" data-house="${house.id}">Haus & Krieger ↗</button></article>`;
}

export function renderCollectiveName(design) {
 return `<p class="eyebrow">Gemeinsamer Landschaftsname · Vorschlag</p><h3>${e(design.collectiveName)}</h3><p>Ein gemeinsamer Name für die drei Grafschaften, die Goldmund auf dieser Karte gliedern.</p>${nameEditor('collective','',design.collectiveName,'Gemeinsamer Name')}`;
}

export function renderCounties(design) {
 return counties.map(county=>{
  const places=settlements.filter(seat=>seat.county===county.id);
  return `<article class="county-card" style="--county-colour:${county.colour}">${imageLink(`assets/banners/${county.id}.webp`,`Banner der Grafschaft ${design.countyNames[county.id]}`,'county-banner',`assets/production/${county.id}.png`)}<div class="county-copy"><p class="eyebrow">${e(county.kind)} · Namensvorschlag</p><h3>${e(design.countyNames[county.id])}</h3><p>${e(county.description)}</p><dl><div><dt>Orte</dt><dd>${places.map(seat=>e(seat.name)).join(' · ')}</dd></div><div><dt>Regionen</dt><dd>${regions.filter(region=>region.county===county.id).map(region=>e(design.regionNames[region.id])).join(' · ')}</dd></div></dl>${nameEditor('county',county.id,design.countyNames[county.id],'Name der Grafschaft')}</div></article>`;
 }).join('');
}

export function renderSettlements(placements,selected,design) {
 return regions.map(region=>{
  const seat=settlements.find(item=>item.id===region.seat),county=counties.find(item=>item.id===region.county);
  const assigned=houses.filter(house=>placements[house.id]===seat.id);
  return `<article class="seat-card" data-seat="${seat.id}" data-drop-seat="${seat.id}" style="--county-colour:${county.colour}"><div class="region-top">${imageLink(`assets/banners/${region.id}.webp`,`Regionsbanner ${design.regionNames[region.id]}`,'region-banner',`assets/production/${region.id}.png`)}<header><p class="eyebrow">${e(region.kind)} · Vorschlag</p><h3>${e(design.regionNames[region.id])}</h3><p class="seat-name">Sitz: <strong>${e(seat.name)}</strong></p><p class="county-label">${e(county.kind)} ${e(design.countyNames[county.id])}</p><p class="name-idea">${e(region.idea)}</p>${nameEditor('region',region.id,design.regionNames[region.id],'Name der Region')}</header></div><div class="house-grid">${assigned.map(house=>houseCard(house,selected)).join('')||'<p class="empty-seat">Hauszuordnung offen</p>'}</div><button class="seat-target" data-action="place-at-seat" data-drop-seat="${seat.id}" ${selected?'':'disabled'}>Gewähltes Haus in ${e(seat.name)} platzieren</button></article>`;
 }).join('');
}

export function renderFixedHouses() {
 return ['goldveld','roden'].map(id=>{const house=houseById(id);return `<article class="fixed-house"><img src="assets/${house.crest}" width="160" height="160" alt="Wappen ${e(familyTitle(house))}"><div><p class="eyebrow">${e(rankLabels[house.rank])}</p><h3>Haus ${e(house.name)}</h3><p>Fest gesetzter Sitz: <strong>Thronholt</strong></p><button class="text-button" data-action="show-house" data-house="${house.id}">Haus & Krieger ansehen ↗</button></div></article>`;}).join('');
}

export function renderRealmDesigns(selected) {
 return realmDesigns.map((design,index)=>`<article class="realm-design ${selected===design.id?'is-chosen':''}"><button data-action="choose-realm" data-design="${design.id}" aria-pressed="${selected===design.id}"><span class="design-number">0${index+1} · ${selected===design.id?'Aktuell im Entwurf':'Wappenentwurf'}</span><img src="assets/realm/${design.id}.webp" width="400" height="400" alt="Fürstentumsentwurf ${e(design.name)}"><strong>${e(design.name)}</strong><span class="design-motif">${e(design.motif)}</span><span class="design-description">${e(design.description)}</span><span class="design-select">${selected===design.id?'Ausgewählt ✓':'Für den Entwurf auswählen'}</span></button><a class="art-download" href="${design.fullsize}" target="_blank" rel="noopener">Wappen vergrößern ↗</a></article>`).join('');
}

export function renderNewHouses() {
 return renderHouseGallery(houses.filter(house=>house.proposed&&!house.clan));
}

export function renderAlbicClans() {
 return renderHouseGallery(houses.filter(house=>house.clan));
}

function renderHouseGallery(collection) {
 return collection.map(house=>`<article class="new-house"><button class="crest-button" data-action="show-house" data-house="${house.id}"><img src="assets/${house.crest}" width="300" height="300" alt="Wappenentwurf ${e(familyTitle(house))}" loading="lazy"></button><p class="eyebrow">${e(house.theme)}</p><h3>${e(familyTitle(house))}</h3><p>${e(house.description)}</p><button class="text-button" data-action="choose-and-scroll" data-house="${house.id}">Sitz im Entwurf zuweisen →</button></article>`).join('');
}

export function renderRevisedHouses() {
 return ['roden','goldveld','lanette'].map(id=>{const house=houseById(id);return `<article class="revision-card"><p class="eyebrow">Überarbeiteter Hausentwurf</p><h3>${e(house.name)}</h3><button class="crest-button revision-art" data-action="show-house" data-house="${id}"><img src="assets/${house.crest}" alt="Wappen ${e(familyTitle(house))}" width="300" height="300" loading="lazy"></button><p>${e(house.description)}</p></article>`;}).join('');
}
