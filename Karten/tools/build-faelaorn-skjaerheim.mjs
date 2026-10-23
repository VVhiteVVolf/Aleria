import fs from 'node:fs/promises';
import vm from 'node:vm';
import {stateHash,writeGeneratedMap,updateGeneratedMapRegistry} from './generated-map-output.mjs';

// Image-only atlas preparation. Reviewed coloured maps remain raster layers;
// no marker coordinates, marker layer or vector boundaries are inferred.
const root=new URL('../',import.meta.url),check=process.argv.includes('--check');
const read=async p=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'));
const context=vm.createContext({});
vm.runInContext(await fs.readFile(new URL('assets/js/pins/category-catalog.js',root),'utf8'),context);
const registry=[];
for(const realm of ['Faelaorn','Skjaerheim']){
  const [{maps},{territories}]=await Promise.all([read(realm+'/maps.source.json'),read(realm+'/territories.import.json')]);
  const {pages}=JSON.parse(await fs.readFile(new URL(`../Kontinente/modules/${realm.toLowerCase()}/pages.source.json`,root),'utf8'));
  for(const map of maps){
    for(const src of [map.imageSrc,map.regionsSrc])await fs.access(new URL('../'+src.replace(/^\//,''),root));
    const base=territories.find(t=>t.id===map.baseTerritoryId);
    if(!base)throw new Error('Fehlendes Hauptgebiet: '+map.id);
    const ids=new Set(pages.filter(p=>p.map?.href.endsWith('map='+map.id)).map(p=>p.id));
    for(const id of [...ids]){
      let parent=territories.find(t=>t.id===id)?.parentId;
      while(parent&&!ids.has(parent)){ids.add(parent);parent=territories.find(t=>t.id===parent)?.parentId;}
    }
    const dominions=territories.filter(t=>ids.has(t.id)).map(t=>({id:t.id,name:t.name,type:t.type,ruler:t.house,seat:t.seat,parentId:t.parentId,note:t.pending?'Zuordnung offen':''}));
    const state={pins:[],...context.KartoCategoryCatalog.upgrade({}),regions:[],dominions,
      regionTitle:map.title,regionIcon:base.banner,mapImages:{normal:map.imageSrc,regions:map.regionsSrc,pins:''},
      layerNames:{normal:'Karte',regions:'Regionen',pins:'Markierungen'},dotSize:80,lblSize:50,displaySettingsVersion:1,
      showMarkers:false,showPinLabels:false,alwaysShowLettering:false,extraLayers:[],dm:{sessions:[],notes:'',groupStatus:{}}};
    const dataPath=map.folder+'/data.json';
    await writeGeneratedMap(root,dataPath,{schemaVersion:1,dataPath,revision:1,updatedAt:'2026-10-22T21:00:00.000Z',generatedStateHash:stateHash(state),state},{check});
    registry.push({id:map.id,title:map.title,status:'active',type:'region',
      hierarchy:[{level:'kingdom',slug:realm.toLowerCase(),title:realm},{level:'region',slug:map.id,title:map.title}],
      folder:map.folder,images:{normal:map.imageSrc.replace('/Karten/',''),regions:map.regionsSrc.replace('/Karten/','')},
      dataPath,link:'karte.html?map='+map.id});
  }
}
await updateGeneratedMapRegistry(root,'FAELAORN_SKJAERHEIM',registry,{check});
console.log(`${registry.length} Karten mit Normal-/Regionsbild ${check?'geprüft':'angelegt'}; keine Pins, Markerbilder oder Vektorgrenzen.`);
