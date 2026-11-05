import {createArtDialogSession} from '../shared/country-workbench/art-dialog-session.mjs';
import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {renderEstateDetails} from '../shared/country-workbench/estate-view.mjs';

const figure=(art,title)=>`<figure><a href="${e(art.fullsize)}" target="_blank" rel="noopener"><img src="${e(art.image??art.crest)}" alt="${e(title)}" loading="eager"></a><figcaption><a href="${e(art.fullsize)}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>`;

export function createKlythesiaArtDialogs({dialog,artworks,houses,prototypes,warriors,realmWarrior,estates,settlements,getPlacements,onChoose}){
  const session=createArtDialogSession({dialog,onSelect:onChoose});
  function showHouse(id){
    const house=houses.find(item=>item.id===id);if(!house)return;
    const seat=settlements.find(city=>city.id===getPlacements()[id]);
    const prototype=prototypes.find(item=>item.id===house.prototypeId);
    const warrior=warriors.find(item=>item.houseId===id);
    session.open(`<p class="eyebrow">Klythesia · Clanvorschlag</p><h2 id="art-title">${e(house.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(house,`Wappen Clan ${house.name}`)}${figure(warrior,`Thorax des Clans ${house.name}`)}</div><div class="house-detail-copy"><p>${e(warrior.description)}</p><p>${e(house.note)}</p><dl class="art-facts"><div><dt>Stand</dt><dd>${e(house.rank)}</dd></div><div><dt>Sitz im Entwurf</dt><dd>${e(seat?.name??'Sitz offen')}</dd></div><div><dt>Klasse</dt><dd>Thorax</dd></div><div><dt>Ausrüstung</dt><dd>${e(warrior.equipment)}</dd></div><div><dt>Farben</dt><dd>${e(house.palette.join(' · '))}</dd></div><div><dt>Rahmen</dt><dd>${e(house.frame)}</dd></div><div><dt>Geographischer Ausgangskontext</dt><dd>${e(warrior.geography)}</dd></div>${house.sourceFile?`<div><dt>Gelieferte Originaldatei</dt><dd>${e(house.sourceFile)}</dd></div>`:''}</dl><div class="class-reference"><p>Alle sieben Hausdarstellungen gehören zur Klasse Thorax.</p><button data-action="show-art" data-art-kind="prototype" data-art-id="${e(prototype.id)}">Klassenprototyp ansehen ↗</button></div><button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Diesen Clan auf der Karte platzieren</button></div>`);
  }
  function show(kind,id){
    if(kind==='house'){showHouse(id);return;}
    if(kind==='realm-warrior'){
      session.open(`<p class="eyebrow">Klythesia · Allgemeine Landesdarstellung</p><h2 id="art-title">${e(realmWarrior.name)}</h2><div class="art-detail-layout prototype-art-detail">${figure(realmWarrior,realmWarrior.name)}<div><p>${e(realmWarrior.description)}</p><dl class="art-facts"><div><dt>Klasse</dt><dd>Thorax</dd></div><div><dt>Ausrüstung</dt><dd>${e(realmWarrior.equipment)}</dd></div></dl></div></div>`);return;
    }
    const collection=kind==='estate'?estates:kind==='prototype'?prototypes:artworks;
    const art=collection.find(item=>item.id===id);if(!art)return;
    if(kind==='estate'){session.open(renderEstateDetails(art,{source:'Klythesia · Gesellschaftlicher Stand'}));return;}
    if(kind==='prototype'){
      session.open(`<p class="eyebrow">Klythesia · Kriegerprototyp</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout prototype-art-detail">${figure(art,art.name)}<div><p>${e(art.description)}</p><dl class="art-facts"><div><dt>Ausrüstung</dt><dd>${e(art.equipment)}</dd></div><div><dt>Helm</dt><dd>${e(art.helmet)}</dd></div></dl></div></div>`);return;
    }
    open(id);
  }
  function open(id){
    const art=artworks.find(item=>item.id===id);
    if(!art)return;
    if(art.kind==='realm'){
      session.open(`<p class="eyebrow">Klythesia · Landeszeichen und Thorax</p><h2 id="art-title">${e(art.name)}</h2><div class="art-detail-layout house-figure-pair">${figure(art,art.name)}${figure(realmWarrior,realmWarrior.name)}</div><p>${e(art.observation)}</p><p>${e(realmWarrior.description)}</p><p class="subtle">Gelieferte Originaldatei: ${e(art.sourceFile)}. Die ergänzte Figur ist eine allgemeine Darstellung der Klasse Thorax.</p>`);return;
    }
    session.open(`<div class="art-detail-layout"><figure><img src="${e(art.image)}" width="${art.dimensions[0]}" height="${art.dimensions[1]}" alt="${e(art.name)}" loading="eager"><figcaption><a href="${e(art.fullsize)}" target="_blank" rel="noopener">Unverändertes PNG-Original öffnen ↗</a></figcaption></figure><div><p class="eyebrow">Geliefertes ${art.kind==='realm'?'Länderzeichen':'Motivwappen'}</p><h2 id="art-title">${e(art.name)}</h2><p>${e(art.observation)}</p><dl><div><dt>Zuordnung</dt><dd>${e(art.assignment)}</dd></div><div><dt>Originaldatei</dt><dd>${e(art.sourceFile)}</dd></div><div><dt>Maße</dt><dd>${art.dimensions.join(' × ')} Pixel</dd></div></dl><p class="subtle">Das Bild bleibt unverändert. Die Vorschau ist eine verkleinerte WebP-Ableitung; Motivname und Original werden erhalten.</p></div></div>`);
  }
  return {open,show,showHouse,destroy:session.destroy};
}
