export function createClanMap({root,dialog,tooltip,getVariant,escape,onClan,
 assetUrl=path=>path,rankLabel=clan=>clan.rank||'Rang offen',imageSize=[4096,3365],
 hasBakedNames=variant=>Boolean(variant.bakedNames),rootClanLabel='Lehnsherr noch offen',
 caption=variant=>`Variante ${variant.number} · ${variant.file} · Wappen öffnen die Lehensdetails. Auf schmalen Bildschirmen die Karte seitlich verschieben.`}){
 const surfaces=[...root.querySelectorAll('[data-role="map-surface"]'),dialog.querySelector('[data-role="map-surface"]')];
 let showCrests=true,showNames=true,zoom=1;
 function sizeOverview(){
  const [imageWidth,imageHeight]=getVariant().imageSize??imageSize;
  const width=Math.min(window.innerWidth*.92,(window.innerHeight*.93-115)*imageWidth/imageHeight);
  const surface=dialog.querySelector('[data-role="map-surface"]');
  surface.style.width=Math.max(240,width*zoom)+'px';
  dialog.querySelector('[data-role="zoom-label"]').textContent=zoom===1?'Ganze Karte':Math.round(zoom*100)+' %';
 }
 function hideTooltip(){tooltip.hidden=true;}
 function surfaceMarkup(variant){
  const groups=variant.settlements.filter(place=>variant.clans.some(c=>c.seat===place.id));
  const lines=groups.map(p=>`<line x1="${p.point[0]}" y1="${p.point[1]}" x2="${p.pin[0]}" y2="${p.pin[1]}"/>`).join('');
  const pins=groups.map(place=>`<div class="crest-group" style="left:${place.pin[0]}%;top:${place.pin[1]}%" data-city="${place.id}">${variant.clans.filter(c=>c.seat===place.id).map(clan=>`<button class="clan-pin" data-action="show-clan" data-clan="${clan.id}" aria-label="${escape(clan.name)} · ${escape(place.name)} · ${escape(rankLabel(clan))}"><img src="${assetUrl('assets/'+clan.crest)}" width="40" height="40" alt="Wappen ${escape(clan.name)}"></button>`).join('')}</div>`).join('');
  const names=variant.settlements.map(place=>{const position=place.label??[place.point[0],place.point[1]+3.6];return `<span class="city-name" style="left:${position[0]}%;top:${position[1]}%">${escape(place.name)}</span>`;}).join('');
  const [width,height]=variant.imageSize??imageSize;
  return `<img src="${assetUrl(variant.map)}" alt="${escape(variant.file)} – Karte der Variante ${variant.number}" width="${width}" height="${height}"><div class="crest-layer" ${showCrests?'':'hidden'}><svg class="crest-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${pins}</div><div class="city-names" ${showNames&&!hasBakedNames(variant)?'':'hidden'}>${names}</div>`;
 }
 function render(){
  hideTooltip();
  const variant=getVariant();
  for(const surface of surfaces)surface.innerHTML=surfaceMarkup(variant);
  root.querySelector('#map-caption').textContent=caption(variant);
  dialog.querySelector('[data-role="map-title"]').textContent=`Variante ${variant.number} · ${variant.short}`;
  const namesButton=root.querySelector('[data-action="toggle-names"]');
  namesButton.disabled=hasBakedNames(variant);
  namesButton.textContent=hasBakedNames(variant)?'Ortsnamen im Kartenbild':'Ortsnamen';
  namesButton.setAttribute('aria-pressed',String(hasBakedNames(variant)||showNames));
  sizeOverview();
 }
 function tip(button){
  const variant=getVariant(),clan=variant.clans.find(c=>c.id===button.dataset.clan);
  const place=variant.settlements.find(p=>p.id===clan.seat),liege=variant.clans.find(c=>c.id===clan.liege);
  (button.closest('dialog')??document.body).append(tooltip);
  tooltip.innerHTML=`<strong>${escape(clan.name)}</strong><span>${escape(rankLabel(clan))} · ${escape(place.name)}</span><span>${liege?'Dient '+escape(liege.name):escape(rootClanLabel)}</span>`;
  tooltip.hidden=false;
  const rect=button.getBoundingClientRect();
  tooltip.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-tooltip.offsetWidth-8))+'px';
  tooltip.style.top=Math.max(8,rect.top-tooltip.offsetHeight-9)+'px';
 }
 for(const surface of surfaces){
  surface.addEventListener('pointerover',event=>{const button=event.target.closest('.clan-pin');if(button)tip(button);});
  surface.addEventListener('focusin',event=>{const button=event.target.closest('.clan-pin');if(button)tip(button);});
  surface.addEventListener('pointerout',event=>{if(!event.relatedTarget?.closest?.('.clan-pin'))hideTooltip();});
  surface.addEventListener('focusout',hideTooltip);
  surface.addEventListener('click',event=>{const button=event.target.closest('.clan-pin');if(button){hideTooltip();onClan(button.dataset.clan);}});
 }
 let mapTrigger;
 dialog.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='close-map')dialog.close();
  if(action==='zoom-in'){zoom=Math.min(3.5,zoom+.35);sizeOverview();}
  if(action==='zoom-out'){zoom=Math.max(1,zoom-.35);sizeOverview();}
  if(action==='fit-map'){zoom=1;sizeOverview();}
 });
 dialog.addEventListener('close',()=>{hideTooltip();mapTrigger?.focus({preventScroll:true});});
 window.addEventListener('scroll',hideTooltip,true);
 window.addEventListener('resize',()=>{hideTooltip();sizeOverview();});
 return {render,open(){mapTrigger=document.activeElement;zoom=1;dialog.showModal();sizeOverview();},toggleCrests(button){showCrests=!showCrests;button.setAttribute('aria-pressed',String(showCrests));render();},toggleNames(button){showNames=!showNames;button.setAttribute('aria-pressed',String(showNames));render();}};
}
