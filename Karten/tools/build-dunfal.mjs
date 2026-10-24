import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createReviewedPins} from '../modules/territory-places/reviewed-pin-import.mjs';
import {validateRegions} from '../modules/regions/region-model.mjs';
import {territoriesById,describePlace} from '../Dunfal/places.mjs';
import {stateHash,writeGeneratedMap,updateGeneratedMapRegistry} from './generated-map-output.mjs';

const root=new URL('../',import.meta.url),check=process.argv.includes('--check');
const read=async path=>JSON.parse(await fs.readFile(new URL('Dunfal/'+path,root),'utf8'));
const context=vm.createContext({});
for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js']) {
  vm.runInContext(await fs.readFile(new URL('assets/js/pins/'+file,root),'utf8'),context);
}
const source=await read('markers.source.json');
const pins=structuredClone(createReviewedPins(source,{catalog:context.KartoCategoryCatalog,presets:context.KartoPinTablePresets,describePlace,region:'Dunfal'}));
const {regions}=await read('regions.source.json');
validateRegions(regions);
for(const pin of pins)for(const asset of [pin.pinMarker,pin.crest,pin.banner].filter(Boolean)) {
  await fs.access(new URL('../'+asset.replace(/^\//,''),root));
}
const dominions=[...territoriesById.values()].map(t=>({id:t.id,name:t.name,type:t.type,ruler:t.house,seat:t.seat,parentId:t.parentId,note:t.pending?'Zuordnung offen':''}));
const state={pins,...context.KartoCategoryCatalog.upgrade({}),regions,dominions,regionTitle:'Fürstentum Dunfal',regionIcon:'/Stammbäume/assets/images/regions/Dunfal/dunfal.png',
  mapImages:{normal:'/Karten/Dunfal/Kartenbilder/normal.webp',regions:'',pins:''},layerNames:{normal:'Karte',regions:'Regionen',pins:'Markierungen'},
  dotSize:80,lblSize:50,displaySettingsVersion:1,markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers:true,showPinLabels:false,alwaysShowLettering:false,extraLayers:[],dm:{sessions:[],notes:'',groupStatus:{}}};
await writeGeneratedMap(root,'Dunfal/data.json',{schemaVersion:1,dataPath:'Dunfal/data.json',revision:2,updatedAt:'2026-10-24T18:20:00.000Z',generatedStateHash:stateHash(state),state},{check});
await updateGeneratedMapRegistry(root,'DUNFAL',[{id:'dunfal',title:'Fürstentum Dunfal',status:'active',type:'region',markerPresentation:'symbols',hierarchy:[{level:'region',slug:'dunfal',title:'Fürstentum Dunfal'}],folder:'Dunfal',images:{normal:'Dunfal/Kartenbilder/normal.webp'},dataPath:'Dunfal/data.json',link:'karte.html?map=dunfal'}],{check});
console.log(`Dunfal: ${pins.length} Ortsmarker, ${regions.length} Grenzobjekte und ${dominions.length} Zuordnungen ${check?'geprüft':'vorbereitet'}.`);
