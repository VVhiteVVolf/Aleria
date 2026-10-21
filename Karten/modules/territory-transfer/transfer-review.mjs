import { mountTransferMap, mapPositionLabel } from './transfer-map.mjs';

const labels = { placed: 'Nach Vorgabe bearbeitet', candidate: 'Plausibler Vorschlag', review: 'Zuordnung prüfen', unassigned: 'Ohne Gegenstück', context: 'Zusatzmarkierung', route: 'Weg', excluded: 'Entfallen', embedded: 'Im Zonenbild enthalten' };
const kindNames = { area: 'Gebietsfläche', tribe: 'Stammesmarkierung', annotation: 'Zusatzkreis', event: 'Ereignis', context: 'Kontextmarker' };
function node(tag, text = '', className = '') {
  const result=document.createElement(tag); result.textContent=text;
  if (className) result.className=className;
  return result;
}
function fact(list, label, value, href = '') {
  const row=node('div'); const detail=node('dd',href?'':value||'Offen');
  if(href){const link=node('a',value);link.href=href;detail.append(link);}
  row.append(node('dt',label),detail); list.append(row);
}

export function mountTransferReview(root, data) {
  const sources=new Map(data.sources.map(s=>[s.id,s]));
  const pins=new Map(data.pins.map(p=>[p.id,p]));
  const list=root.querySelector('[data-role="results"]');
  const detail=root.querySelector('[data-role="detail"]');
  const search=root.querySelector('[data-role="search"]');
  const mode=root.querySelector('[data-role="mode"]');
  const zone=root.querySelector('[data-role="zone"]');
  const status=root.querySelector('[data-role="status"]');
  const count=root.querySelector('[data-role="count"]');
  const counts=data.counts;
  root.querySelector('[data-role="summary"]').textContent=`${counts.targetPositions} Kartenpositionen · ${counts.placed} nach Vorgabe bearbeitet · ${counts.activePlaces} erhaltene Altorte · 3 Schwarzdorn-Exklaven · ${counts.excludedSources} entfernte und ${counts.embeddedSources} im Zonenbild enthaltene Altmarker`;
  const optionLabels={places:`Erhaltene Altorte (${counts.activePlaces})`,targets:`Neue Kartenpositionen (${counts.targetPositions})`,context:`Wege und Zusatzmarker (${counts.contextEntries})`,archive:`Ausgesonderte Altmarker (${counts.excludedSources+counts.embeddedSources})`};
  for(const option of mode.options)option.textContent=optionLabels[option.value];
  let selected='';
  const map=mountTransferMap(root.querySelector('[data-role="map"]'),{...data,onSelect:id=>select('target:'+id)});
  for (const territory of data.territories) {
    const option=node('option',territory.name); option.value=territory.id; zone.append(option);
  }
  function model(key) {
    const [type,id]=key.split(':');
    const source=type==='source'?sources.get(id):sources.get(pins.get(id)?.sourceId);
    const pin=type==='target'?pins.get(id):pins.get(source?.proposal?.targetId);
    return {source,pin};
  }
  function renderList() {
    const entries=mode.value==='targets'?data.pins.map(p=>['target:'+p.id,p.proposedName||'Name offen',sources.get(p.sourceId),p]):data.sources
      .filter(s=>mode.value==='archive'?['excluded','embedded'].includes(s.status):mode.value==='context'?['context','route'].includes(s.status):s.kind==='place'&&s.status!=='excluded')
      .map(s=>{const pin=pins.get(s.proposal?.targetId);return ['source:'+s.id,pin?.proposedName||s.name,s,pin];});
    const query=search.value.trim().toLocaleLowerCase('de');
    const matches=entries.filter(([,name,source,pin])=>{
      const current=pin?.status||source?.status||'unassigned';
      return (!zone.value||pin?.territoryId===zone.value)&&(!status.value||current===status.value)
        &&(!query||[name,source?.name,source?.text,pin?.description,pin?.decision?.affiliation?.house,pin?.territory.name,pin?.territory.house,pin?.id,source?.id].join(' ').toLocaleLowerCase('de').includes(query));
    });
    const fragment=document.createDocumentFragment();
    for (const [key,name,source,pin] of matches) {
      const item=node('button','','transfer-result'); item.type='button'; item.dataset.action='select';item.dataset.key=key;
      item.setAttribute('aria-pressed',String(key===selected));
      item.append(node('strong',name),node('small',pin?`${mapPositionLabel(pin)} · ${pin.territory.name}`:source?.status==='route'?'Wegeverbindung':kindNames[source?.kind]||'Noch keine neue Position'),
        node('span',labels[pin?.status||source?.status]||'Offen','transfer-status'));
      fragment.append(item);
    }
    list.replaceChildren(fragment); count.textContent=`${matches.length} von ${entries.length} Einträgen`;
    map.setVisible(new Set(matches.map(entry=>entry[3]?.id).filter(Boolean)));
  }
  function select(key) {
    selected=key;
    const {source,pin}=model(key);
    const title=node('h2',pin?.proposedName||source?.name||'Unbenannte neue Kartenposition');
    const note=node('p',pin?`${mapPositionLabel(pin)} · ${labels[pin.status]}`:labels[source?.status]||kindNames[source?.kind]||'Ohne neue Position','transfer-kicker');
    const facts=node('dl','','transfer-facts');
    const affiliation=pin?.decision?.affiliation;
    if(pin)fact(facts,affiliation?'Geografisches Gebiet':'Neue Herrschaft',pin.territory.name);
    if(pin)fact(facts,'Ortsart der neuen Karte',pin.category);
    if(pin&&!affiliation)fact(facts,'Territorialer Clan',pin.territory.house,pin.territory.href);
    if(pin?.decision?.siteType)fact(facts,'Stätte',pin.decision.siteType);
    if(affiliation){
      fact(facts,affiliation.houseLabel||'Historischer Sitz',affiliation.house,affiliation.href);
      if(affiliation.lord)fact(facts,'Herr des Sitzes',affiliation.lord);
      fact(facts,'Unmittelbarer Lehnsherr',affiliation.liege,affiliation.liegeHref);
      fact(facts,'Heutiger Stand',affiliation.tenure);
    }
    if(source?.status==='route')fact(facts,'Einordnung','Weg; kein Orts-Pin');
    if(pin?.exclave){
      fact(facts,'Sonderfall','Bestätigte Schwarzdorn-Exklave');
      fact(facts,'Geografische Lage',data.territories.find(t=>t.id===pin.geographicZoneId)?.name);
    }
    if(source?.coordinates)fact(facts,'Alte Koordinate (ab links unten)',`${source.coordinates.x} : ${source.coordinates.y}`);
    if(pin)fact(facts,'Neue Koordinate (ab links oben)',`${pin.position.x} : ${pin.position.y}`);
    if(pin?.proposal)fact(facts,'Abweichung vom Ansatz',`${pin.proposal.distance} Pixel`);
    if(source)fact(facts,'World-Anvil-ID',source.id);
    detail.replaceChildren(note,title);
    if(pin){
      const crests=node('div','','transfer-heraldry');
      for(const [src,alt] of affiliation?[[affiliation.crest,affiliation.house],[affiliation.liegeCrest,affiliation.liege],[pin.territory.banner,pin.territory.name]]:[[pin.territory.crest,pin.territory.house],[pin.territory.banner,pin.territory.name]]){
        if(!src)continue;const img=node('img');img.src=src;img.alt=alt;img.width=64;img.height=64;crests.append(img);
      }
      detail.append(crests);
    }
    detail.append(facts);
    if(pin?.description)detail.append(node('h3','Beschreibung'),node('p',pin.description,'transfer-source-text'));
    if(pin?.decision)detail.append(node('p',pin.decision.reason,'transfer-evidence'));
    if(source?.transferDecision)detail.append(node('p',source.transferDecision.reason,'transfer-evidence'));
    if(pin?.issues.length&&!pin.confirmed){const issues=node('ul','','transfer-issues');for(const issue of pin.issues)issues.append(node('li',issue));detail.append(issues);}
    if(pin)detail.append(node('p',pin.territoryEvidence,'transfer-evidence'));
    if(!pin?.description&&source)detail.append(node('h3','Überlieferte Beschreibung'),node('p',source.text||'Keine Beschreibung im Altbestand.','transfer-source-text'));
    if(pin&&!source&&!pin.description)detail.append(node('p','Name und Beschreibung bleiben offen.'));
    for(const reference of pin?.decision?.references||[]){const link=node('a',reference.label);link.href=reference.href;detail.append(link);}
    if(source){
      const link=node('a','Originalen Marker bei World Anvil öffnen ↗');link.href=source.url;link.target='_blank';link.rel='noopener';detail.append(link);
      const raw=node('details');raw.append(node('summary','Originalquelle: '+source.name),node('p',source.text||'(keine Beschreibung)','transfer-source-text'),node('h3','Originales Beschreibungsfeld (BBCode)'),node('pre',source.descriptionBBCode||'(leer)'));detail.append(raw);
      if(source.candidates.length&&!pin?.confirmed){
        detail.append(node('h3','Weitere räumliche Kandidaten'));
        for(const candidate of source.candidates){
          const p=pins.get(candidate.targetId);const button=node('button',`${mapPositionLabel(p)} · ${p.territory.name} · ${candidate.distance} px`,'transfer-candidate');
          button.type='button';button.dataset.action='select';button.dataset.key='target:'+p.id;detail.append(button);
        }
      }
    }
    if(pin)map.select(pin.id);
    renderList();
  }
  root.addEventListener('click',event=>{
    const control=event.target.closest('[data-action]');if(!control)return;
    if(control.dataset.action==='select')select(control.dataset.key);
    if(control.dataset.action==='zoom-in')map.zoom(1.5);
    if(control.dataset.action==='zoom-out')map.zoom(1/1.5);
    if(control.dataset.action==='reset-map')map.reset();
  });
  for(const control of [search,mode,zone,status])control.addEventListener(control===search?'input':'change',renderList);
  root.querySelector('[data-role="layer"]').addEventListener('change',event=>map.setLayer(event.target.value));
  renderList();
}
