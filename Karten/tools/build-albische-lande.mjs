import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createReviewedPins} from '../modules/territory-places/reviewed-pin-import.mjs';
import {validateRegions} from '../modules/regions/region-model.mjs';
import {stateHash,writeGeneratedMap,updateGeneratedMapRegistry} from './generated-map-output.mjs';

const root=new URL('../',import.meta.url),check=process.argv.includes('--check');
const read=async file=>JSON.parse(await fs.readFile(new URL(file,root),'utf8'));
const context=vm.createContext({});
for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(await fs.readFile(new URL('assets/js/pins/'+file,root),'utf8'),context);
const registry=[],outputs=[];
for(const folder of ['Aislearneach','Blaithneach','Ceitheach','Dunkelhain']){
 const [{maps},markerSource,{regions},{territories},catalog]=await Promise.all([
  read(folder+'/maps.source.json'),read(folder+'/markers.source.json'),read(folder+'/regions.source.json'),read(folder+'/territories.import.json'),import('../'+folder+'/places.mjs'),
 ]);
 for(const map of maps){
  const source={coordinateOrigin:'bottom-left',imageSize:map.imageSize,markers:markerSource.markers.filter(m=>m.mapId===map.id)};
  const pins=structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace:catalog.describePlace,region:folder}));
  const ownRegions=regions.filter(r=>r.mapId===map.id).map(({mapId,...r})=>r);
  validateRegions(ownRegions);
  const sourceIds=pins.map(p=>p.sourceRef.markerId).concat(ownRegions.map(r=>r.source.markerId));
  if(new Set(sourceIds).size!==sourceIds.length)throw new Error('Doppelte Quellenkennung: '+map.id);
  for(const src of [map.imageSrc,...pins.flatMap(p=>[p.pinMarker,p.crest,p.banner])].filter(Boolean))await fs.access(new URL('../'+src.replace(/^\//,''),root));
  const base=catalog.territoriesById.get(map.baseTerritoryId);
  const dominions=territories.map(t=>({id:t.id,name:t.name,type:t.type,ruler:t.house,seat:t.seat,parentId:t.parentId,note:t.pending?'Clan-Zuordnung offen':''}));
  const state={pins,...context.KartoCategoryCatalog.upgrade({}),regions:ownRegions,dominions,regionTitle:map.title,regionIcon:base.banner,mapImages:{normal:map.imageSrc,regions:'',pins:''},layerNames:{normal:'Karte',regions:'Regionen',pins:'Markierungen'},dotSize:80,lblSize:50,displaySettingsVersion:1,markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers:true,showPinLabels:false,alwaysShowLettering:false,extraLayers:[],dm:{sessions:[],notes:'',groupStatus:{}}};
  const dataPath=map.folder+'/data.json';
  outputs.push([dataPath,{schemaVersion:1,dataPath,revision:1,updatedAt:'2026-10-22T20:30:00.000Z',generatedStateHash:stateHash(state),state}]);
  registry.push({id:map.id,title:map.title,status:'active',type:'region',markerPresentation:'symbols',hierarchy:[{level:'region',slug:maps[0].id,title:maps[0].title},...(map.parentMapId?[{level:'region',slug:map.id,title:map.title}]:[])],folder:map.folder,images:{normal:map.imageSrc.replace('/Karten/','')},dataPath,link:'karte.html?map='+map.id,...(map.parentMapId?{parentMapId:map.parentMapId}:{})});
 }
}
for(const [file,data] of outputs)await writeGeneratedMap(root,file,data,{check});
await updateGeneratedMapRegistry(root,'ALBISCHE_LANDE',registry,{check});
console.log(`${outputs.length} Karten, ${outputs.reduce((n,[,d])=>n+d.state.pins.length,0)} Ortsmarker und ${outputs.reduce((n,[,d])=>n+d.state.regions.length,0)} Grenzobjekte ${check?'geprüft':'erzeugt'}.`);
