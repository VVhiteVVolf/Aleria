import fs from 'node:fs/promises';
import vm from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { convertRenderedRegion, worldAnvilMarkerId } from '../modules/regions/world-anvil-geometry.mjs';
import { validateRegions } from '../modules/regions/region-model.mjs';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from './generated-map-output.mjs';

const base = new URL('../',import.meta.url);
const check = process.argv.includes('--check');
const read = path => fs.readFile(new URL(path,base),'utf8');
const source = JSON.parse(await read('Leitheach/sources/world-anvil.capture.json'));
const images = JSON.parse(await read('Leitheach/sources/images.manifest.json'));
const roots = {
  'e4e40471-6f95-41a7-a54b-bb4500bf1fa6':['leitheach','Fürstentum Leitheach','haus-mac-ard-cumhaill'],
  'bf7d9da0-78df-4051-a138-4b64769e393e':['tir-na-sleagh','Tir na Sleagh','haus-mac-ard-cumhaill'],
  '105fb3c8-0e2d-4490-967b-8c9028717ebe':['tir-na-sinsear','Tir na Sinsear','haus-ua-gaelach'],
  '41225047-cb8f-415f-9f20-a4150053d7ae':['tir-na-gortanna','Tir na Gortanna','haus-dal-cruthin'],
  '49b0dc39-8bf6-4935-9080-ae7f164f1f65':['tir-na-tonn','Tir na Tonn','haus-fir-an-tarvo'],
  '654e2a46-1121-4b26-955b-0040571d40f9':['tir-na-comhchuibhis','Tir an Comhchuibhis','haus-mac-airt'],
  '8bce79f6-0271-4343-90d9-c77f171d4a84':['tir-na-sruth','Tir na Sruth','haus-tir-an-cuinn'],
};
const familyByTitle = [
  [/Cel Leagan/,'haus-airgid'],[/Amrhan/,'haus-amrhan'],[/Lasbun/,'haus-frisealach'],[/Sidhe Somhairle/,'haus-somhairle'],
  [/Ard Trodach/,'haus-ard-trodach'],[/Nic Caoimhe/,'haus-nic-caoimhe'],[/Choinnich/,'haus-choinnich'],[/Nic Blar/,'haus-nic-blar-leitheach'],[/Claisean/,'haus-laidir'],
  [/Coimhth/,'haus-gallchobhair'],[/Ghaisc/,'haus-ghaiscioch'],[/Cleir/,'haus-cleir'],[/Cearda/,'haus-dal-ceardaiocht'],[/Fancha/,'haus-na-mhuir'],
  [/Ruitheach/,'haus-ruitheach'],[/Gortach/,'haus-gortach'],[/Fiachrach/,'haus-fiachrach'],[/Eirce/,'haus-ua-eirce'],
];
const family = id => getRegisteredFamily(id)?.family;
const context={window:{}};
vm.runInNewContext(await read('assets/js/pins/category-catalog.js'),context);
const categories=context.window.KartoCategoryCatalog.upgrade({});
const registryEntries=[];
const prepared=[];
function shorten(name) {
  return name.replace(/^(Fürstliche Herrschaft|Oberherrschaft|Lehnsherrschaft|Lehensherrschaft|Herrschaft)\s*(-|von|der)?\s*/i,'').trim();
}

for (const map of source.maps) {
  const [slug,title,rootFamilyId]=roots[map.mapId];
  const main=slug==='leitheach';
  const mapId=main?'leitheach':'leitheach-'+slug;
  const folder=main?'Leitheach':'Leitheach/'+slug;
  const image=images.find(image=>image.id===slug);
  if (!image || image.width!==map.image.width || image.height!==map.image.height) throw new Error(`Kartenbildgröße passt nicht zur Grenzquelle: ${title}`);
  const regions=map.polygons.map(shape=> {
    const markerId=worldAnvilMarkerId(shape);
    const row=map.rows.find(row=>row.edit?.includes(markerId));
    let name=row?.title || 'Unbenannte Fläche';
    if (markerId===source.decisions.fanchaMarkerId && source.decisions.fanchaConfirmed) name='Herrschaft Tir na Fancha';
    const outer = !main && (/^Oberherrschaft|^Fürstliches Herrschaftsgebiet/.test(name));
    const rootKey=Object.values(roots).find(([,name])=>name===shorten(row?.title||'') || name.replace(' an ',' na ')===shorten(row?.title||''));
    const rulerId=main?rootKey?.[2]:outer?rootFamilyId:/Eigenverwaltung/.test(name)?rootFamilyId:familyByTitle.find(([pattern])=>pattern.test(name))?.[1];
    const geometry=convertRenderedRegion(shape,map.image);
    const contextArea=shape.class.includes('marker-circle')||name==='Grenzgebiet';
    const ruler=rulerId?family(rulerId):null;
    if (rulerId&&!ruler) throw new Error('Fehlende kanonische Familienakte: '+rulerId);
    return {
      id:'wa-'+markerId,name,shortName:outer?title:shorten(name),...geometry,
      color:/^#[0-9a-f]{6}$/i.test(shape.fill||'')?shape.fill:shape.stroke||'#a74732',
      borderColor:shape.stroke||'#ff0000',opacity:geometry.kind==='boundary'?0:shape.opacity,
      parentId:'',dominionId:contextArea?'':'region-'+markerId,
      familyId:rulerId||'',targetMapId:main&&rootKey?'leitheach-'+rootKey[0]:'',
      showLabel:geometry.kind!=='boundary'&&!contextArea,
      note:contextArea?(name==='Grenzgebiet'?'Grenzgebiet · Zugehörigkeit offen':'Örtlicher Bereich'):'',
      source:{type:'world-anvil',mapId:map.mapId,markerId,coordinateSystem:'normalized-top-left',geometryMethod:'visible-svg',url:row?.edit||'',...(markerId===source.decisions.fanchaMarkerId?{userCorrection:'Tir na Fancha; veralteter Buarstrath-Text verworfen'}:{})},
      ...(ruler?{familyName:ruler.document.title}:{}),
    };
  });
  const outer=main?null:regions.find(region=>region.familyId===rootFamilyId&&/^Oberherrschaft|^Fürstliches Herrschaftsgebiet/.test(region.name));
  for(const region of regions){
    if(main||region===outer)continue;
    region.parentId=outer?.id||'';
    const liege=family(region.familyId)?.document.houseProfile?.liegeHouseId;
    const localParent=liege&&liege!==rootFamilyId?regions.find(candidate=>candidate.familyId===liege):null;
    if(localParent)region.parentId=localParent.id;
  }
  validateRegions(regions);
  const dominions=regions.filter(region=>region.dominionId).map(region=>({id:region.dominionId,name:region.name,type:region.name.startsWith('Oberherrschaft')?'Oberherrschaft':'Herrschaft',ruler:region.familyName||'',seat:region.familyId&&!/Eigenverwaltung/.test(region.name)?family(region.familyId).document.houseProfile?.seat||'':'',note:region.note,parentId:regions.find(parent=>parent.id===region.parentId)?.dominionId||''}));
  const crestSlug=main?'leitheach':slug;
  const state={pins:[],...categories,regions,dominions,regionTitle:title,regionIcon:`/Stammbäume/assets/images/regions/Leitheach/${crestSlug}.png`,mapImages:{normal:'/Karten/'+image.output.replace(/^Karten\//,''),regions:'',pins:''},layerNames:{normal:'Karte',regions:'Regionen',pins:'Markierungen'},dotSize:80,lblSize:50,displaySettingsVersion:1,markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers:true,showPinLabels:false,alwaysShowLettering:false,extraLayers:[],dm:{sessions:[],notes:'',groupStatus:{}}};
  const data={schemaVersion:1,dataPath:folder+'/data.json',revision:1,updatedAt:'2026-10-22T16:10:00.000Z',generatedStateHash:stateHash(state),state};
  prepared.push([folder+'/data.json',data]);
  registryEntries.push({id:mapId,title,status:'active',type:'region',markerPresentation:'symbols',hierarchy:[{level:'region',slug:'leitheach',title:'Fürstentum Leitheach'},...main?[]:[{level:'region',slug,title}]],folder,images:{normal:image.output.replace(/^Karten\//,'')},dataPath:folder+'/data.json',link:'karte.html?map='+mapId,...main?{}:{parentMapId:'leitheach'}});
}

for(const [path,data] of prepared) await writeGeneratedMap(base,path,data,{check});
await updateGeneratedMapRegistry(base,'LEITHEACH',registryEntries,{check});
console.log(`${prepared.length} Leitheach-Karten mit ${prepared.reduce((sum,[,data])=>sum+data.state.regions.length,0)} bearbeitbaren Grenzobjekten ${check?'geprüft':'vorbereitet'}.`);
