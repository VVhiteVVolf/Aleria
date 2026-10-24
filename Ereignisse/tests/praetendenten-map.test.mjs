import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WAR_EVENTS} from '../modules/praetendenten/praetendenten-data.mjs';
import {WAR_MAP,WAR_MAP_SITES,WAR_MAP_EVENT_PLACES} from '../modules/praetendenten/war-map-data.mjs';
import {warMapEvents,warMapSelection,warMapSiteEvents,warMapPeriod,clampWarMapYear} from '../modules/praetendenten/war-map-model.mjs';
import {warSource,readableSourceBlocks,sourceFact} from '../modules/praetendenten/war-sources.mjs';
import {renderSourceBlocks} from '../modules/praetendenten/war-source-render.mjs';
import {renderWarEventPage} from '../modules/praetendenten/war-event-render.mjs';

test('Die Karte verwendet den unveränderten Reichskartenbeleg; alle Ortszuordnungen bleiben prüfbar',async()=>{
  const bytes=await readFile(new URL('../../Kontinente/assets/images/aldrimar/reichskarte.png',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),WAR_MAP.sha256);
  const ids=new Set(WAR_MAP_SITES.map(site=>site.id));
  assert.equal(ids.size,WAR_MAP_SITES.length);
  for(const site of WAR_MAP_SITES){assert.ok(site.x>0&&site.x<WAR_MAP.width);assert.ok(site.y>0&&site.y<WAR_MAP.height);}
  assert.deepEqual(Object.keys(WAR_MAP_EVENT_PLACES).sort(),WAR_EVENTS.map(event=>event.id).sort());
  for(const place of Object.values(WAR_MAP_EVENT_PLACES))assert.ok(place===null||ids.has(place));
  assert.equal(WAR_MAP_EVENT_PLACES.hurinn,null);
  assert.equal(warMapSiteEvents(warMapEvents(),'wellenruh').length,2);
});

test('Die abgeglichene Datierung von Hurinn und mehrjährige Belagerungen erscheinen in den richtigen Jahren',()=>{
  assert.equal(warMapEvents().length,17);
  assert.ok(warMapEvents({year:1629}).some(event=>event.id==='hurinn'));
  assert.equal(warMapEvents({year:1628}).some(event=>event.id==='hurinn'),false);
  assert.equal(warMapEvents({year:1630}).some(event=>event.id==='hurinn'),false);
  const siege=WAR_EVENTS.find(event=>event.id==='belagerung-heldenwacht');
  assert.deepEqual(warMapPeriod(siege),{firstYear:1631,lastYear:1637});
  assert.match(sourceFact(warSource(siege.source),'Datum'),/1631.*1637/);
  for(let year=1631;year<=1637;year++)assert.ok(warMapEvents({year}).some(event=>event.id===siege.id));
  for(const year of [1630,1638])assert.equal(warMapEvents({year}).some(event=>event.id===siege.id),false);
  assert.equal(warMapEvents({year:1647}).length,0);
});

test('Parteifilter unterstellen unbekannten Angreifern und Ceitheach keine neue Prätendentenfraktion',()=>{
  assert.deepEqual(warMapEvents({parties:[]}).map(event=>event.id),['roger-astrid']);
  const blue=warMapEvents({parties:['blaue']});
  assert.ok(blue.some(event=>event.id==='ermordung-bjoern'));
  assert.equal(blue.some(event=>event.id==='ceitheach-rorikshall'),false);
  assert.equal(warMapEvents({parties:['rote']}).some(event=>event.id==='ceitheach-rorikshall'),false);
  assert.ok(warMapEvents({parties:['gruene']}).some(event=>event.id==='ceitheach-rorikshall'));
});

test('Jahresgrenzen und Auswahl bleiben auch bei leeren Treffermengen konsistent',()=>{
  assert.equal(clampWarMapYear('1633'),1633);assert.equal(clampWarMapYear(1500),1627);
  assert.equal(clampWarMapYear(1800),1647);
  for(const value of [null,undefined,'',NaN,'foo',1633.5])assert.equal(clampWarMapYear(value),null);
  const events=warMapEvents({year:1630});
  assert.equal(warMapSelection(events,'zweite-seeschlacht-wellenruh'),'zweite-seeschlacht-wellenruh');
  assert.equal(warMapSelection(events,'roger-astrid'),events[0].id);
  assert.equal(warMapSelection([],'roger-astrid'),null);
});

test('Quellentabellen und Fließtext lassen sich ohne verlorene oder doppelte Quellblöcke aufteilen',()=>{
  for(const event of WAR_EVENTS.filter(event=>event.file)){
    const source=warSource(event.source);
    const split=renderSourceBlocks(source,{blocks:'tables'})+renderSourceBlocks(source,{blocks:'text'});
    const blockIds=[...split.matchAll(/data-source-block="(\d+)"/g)].map(match=>Number(match[1]));
    assert.deepEqual(blockIds.sort((a,b)=>a-b),readableSourceBlocks(source).map(block=>block.index).sort((a,b)=>a-b));
    const page=renderWarEventPage(event.id),ids=[...page.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,event.id);
  }
  assert.throws(()=>renderSourceBlocks(warSource('source-05'),{blocks:'unknown'}),/Unknown source block selection/);
});
