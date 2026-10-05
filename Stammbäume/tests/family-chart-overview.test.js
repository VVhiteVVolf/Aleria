import test from 'node:test';
import assert from 'node:assert/strict';
import { completeFamilyChartView, createFamilyChartOverview } from '../assets/js/adapters/family-chart-overview-policy.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';

test('Gespeicherter Personenfokus und Generationsgrenzen beschneiden keine Gesamtansicht', () => {
  const previous={focusPersonId:'child',limitGenerations:true,showSiblings:false,orientation:'horizontal'};
  assert.deepEqual(completeFamilyChartView(previous),{focusPersonId:'',limitGenerations:false,showSiblings:true,orientation:'horizontal'});
  assert.equal(previous.focusPersonId,'child');
});

test('Getrennte Zweige sind zusammen sichtbar, ohne genealogische Eltern oder Ursprungsdaten zu verändern', () => {
  const family={document:{id:'test',title:'Testhaus',emblem:''},lineage:{houseId:'house-test'},
    persons:[{id:'father',houseId:'house-test'},{id:'son',houseId:'house-test'},{id:'cousin',houseId:'house-test'}],partnerships:[]};
  const data=[{id:'father',data:{},rels:{parents:[],spouses:[],children:['son']}},{id:'son',data:{},rels:{parents:['father'],spouses:[],children:[]}},
    {id:'cousin',data:{},rels:{parents:[],spouses:[],children:[]}}];
  const before=structuredClone({family,data});
  const overview=createFamilyChartOverview(family,data);
  assert.equal(overview.componentCount,2);
  assert.equal(overview.rootId,'__family-overview-test');
  assert.deepEqual(overview.data.at(-1).rels.children,['father','cousin']);
  assert.equal(overview.data.at(-1).data.aleria.virtualType,'overview-root');
  assert.deepEqual({family,data},before);
});

test('Sämtliche Registerakten liefern eine vom alten Fokus unabhängige erreichbare Gesamtwurzel', () => {
  for(const record of FAMILY_REGISTRY) {
    const converted=toFamilyChartData(record.family);
    if(!converted.data.length)continue;
    const overview=createFamilyChartOverview(record.family,converted.data);
    const nodes=new Map(overview.data.map(node=>[node.id,node]));
    assert.ok(nodes.has(overview.rootId),record.id);
    const reached=new Set([overview.rootId]);
    for(const id of reached)Object.values(nodes.get(id).rels||{}).flat().forEach(other=>{if(nodes.has(other))reached.add(other);});
    assert.equal(reached.size,overview.data.length,record.id);
    const ignored=structuredClone(record.family);ignored.view.focusPersonId='not-a-person';
    assert.equal(createFamilyChartOverview(ignored,converted.data).rootId,overview.rootId,record.id);
  }
});
