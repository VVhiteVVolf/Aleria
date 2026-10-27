import {warriors} from './warrior-data.mjs?v=20261027-1';

const byHouse=new Map(warriors.map(warrior=>[warrior.id,warrior]));

export function renderHouseShowcase(house,escape){
 const e=escape,warrior=byHouse.get(house.id);
 return `<div class="house-showcase"><figure class="house-heraldry"><a href="${e(house.fullsize)}" target="_blank" rel="noopener"><img src="${e(house.crest)}" width="480" height="480" alt="Wappen ${e(house.name)}"></a><figcaption><a href="${e(house.fullsize)}" target="_blank" rel="noopener">Wappen in Großansicht ↗</a></figcaption></figure>${warrior?`<figure class="house-warrior"><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener"><img src="${e(warrior.image)}" width="768" height="1152" alt="${e(warrior.className)} ${house.clan?'des Clans':'des Hauses'} ${e(house.name)}, vollständig von Kopf bis Fuß"></a><figcaption>${e(warrior.className)} · Darstellungsentwurf<br><a href="${e(warrior.fullsize)}" target="_blank" rel="noopener">Krieger in Großansicht ↗</a></figcaption></figure>`:''}</div>`;
}

export function renderWarriorDescription(house,escape){
 const e=escape,warrior=byHouse.get(house.id);
 if(!warrior)return '';
 return `<section class="warrior-description" aria-labelledby="warrior-heading"><p class="eyebrow">Kriegerdarstellung · Vorschlag</p><h3 id="warrior-heading">${e(warrior.className)}</h3><p>${e(warrior.reason)}</p><dl><div><dt>Ausrüstung</dt><dd>${e(warrior.equipment)}</dd></div><div><dt>Hausfarben</dt><dd>${e(warrior.palette.join(' · '))}</dd></div></dl><p><a href="../../Klassenordner/Klassenseite.html#klasse-goldmund-${e(warrior.classId)}" target="_blank" rel="noopener">Klasse ansehen ↗</a>${warrior.bestiary?` · <a href="${e(warrior.bestiary)}" target="_blank" rel="noopener">${warrior.horse==='herzogsschimmer'?'Herzogsschimmer':'Goldmähne'} im Bestiarium ↗</a>`:''}</p><p class="subtle">Die Darstellung bestimmt weder Sitz noch Rang oder Ausbildung der Familie.</p></section>`;
}
