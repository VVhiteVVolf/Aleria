import {warriors} from './warrior-data.mjs';
import {renderHouseDossier} from '../shared/house-detail-render.mjs';
import {previewAsset} from './preview-assets.mjs';

const byClan=new Map(warriors.map(warrior=>[warrior.id,warrior]));

export function renderClanWarriorGallery(clans,escape){
 return warriors.map(warrior=>{
  const clan=clans.find(candidate=>candidate.id===warrior.id);
  return `<button class="uath-warrior-card" data-action="show-clan" data-clan="${escape(clan.id)}" aria-label="${escape(clan.name)} · ${escape(warrior.className)} ansehen"><img src="${escape(warrior.image)}" width="768" height="1152" loading="lazy" alt="Ganzkörperentwurf ${escape(clan.name)}"><span><strong>${escape(clan.name)}</strong><small>${escape(warrior.className)} · Entwurf ↗</small></span></button>`;
 }).join('');
}

export function renderClanDossier({clan,variant,place,region,path,liege},escape){
 const warrior=byClan.get(clan.id);
 if(!warrior)throw Error(`Missing Uathneach warrior: ${clan.id}`);
 const crest=previewAsset('assets/'+clan.crest);
 return renderHouseDossier({title:clan.name,source:`Clan & Krieger · Variante ${variant.number}`,headingId:'clan-detail-title',
  warrior:{...warrior,palette:warrior.palette.join(' · ')},classHref:`../../Klassenordner/Klassenseite.html#klasse-alben-${warrior.classId}`,
  crest:{image:crest,fullsize:crest},description:'Bild- und Klassenvorschlag. Der Entwurf legt keine verbindliche Ausbildung des Clans fest.',
  facts:[{label:'Rang',value:clan.rank||'Rang offen'},{label:'Sitz dieser Variante',value:place.name},{label:'Unmittelbarer Lehnsherr',value:liege?.name??'Fürst des Landes'},{label:'Kartenfläche des Sitzes',value:region.name},{label:'Lehenskette',value:path.map(c=>c.name).join(' → ')}],canPlace:false
 },escape)+(warrior.bestiary?`<p class="subtle"><a href="${escape(warrior.bestiary)}" target="_blank" rel="noopener">${warrior.horse==='curragh'?'Curragh':'Tirashan'} im Bestiarium ↗</a></p>`:'');
}
