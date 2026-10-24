import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {WAR_SOURCES,WAR_READING_SOURCES,warSource,originalWarSource,sourceFact} from '../modules/praetendenten/war-sources.mjs';
import {WAR_EDITION,WAR_EDITION_CHANGES,applyWarSourceEdition} from '../modules/praetendenten/war-source-edition.mjs';
import {WAR_EVENTS} from '../modules/praetendenten/praetendenten-data.mjs';
import {SOURCE_SECTIONS} from '../modules/battles/battle-chronicle-render.mjs';
import {WELLENRUH} from '../modules/battles/wellenruh-data.mjs';
import {HOUSE_VAEREN_FAMILY as vaeren} from '../../Stammbäume/assets/js/data/house-vaeren-family.js';
import {HOUSE_WARGH_FAMILY as wargh} from '../../Stammbäume/assets/js/data/house-wargh-family.js';
import {HOUSE_UI_ROCHRAIDE_FAMILY as ceitheach} from '../../Stammbäume/assets/js/data/house-ui-rochraide-family.js';
import {succession} from '../../Kontinente/modules/aldrimar/succession-data.mjs';

const prose=id=>warSource(id).blocks.filter(block=>block.text).map(block=>block.text).join('\n');
const cells=(id,b)=>warSource(id).blocks[b].rows.map(row=>row.map(cell=>cell.text));

test('Alle 33 Entscheidungen sind angewendet, ohne die archivierte Datenbasis oder Dubletten zu verändern',()=>{
  const before=JSON.stringify(WAR_SOURCES);
  assert.equal(WAR_EDITION.decisions.length,33);
  assert.deepEqual([...new Set(WAR_EDITION_CHANGES.map(change=>change.decision))].sort(),WAR_EDITION.decisions.map(decision=>decision.id).sort());
  const edition=applyWarSourceEdition(WAR_SOURCES);
  assert.equal(JSON.stringify(WAR_SOURCES),before);
  assert.notEqual(edition[0],WAR_SOURCES[0]);
  for(const source of edition.filter(source=>source.duplicateOf))assert.deepEqual(source.blocks,warSource(source.duplicateOf).blocks);
  const changed=structuredClone(WAR_SOURCES);
  changed[0].blocks[27].text+=' Neu bearbeitete Ausgangsfassung.';
  assert.throws(()=>applyWarSourceEdition(changed),/Stale war edition passage/);
  assert.throws(()=>applyWarSourceEdition(WAR_SOURCES,[{...WAR_EDITION_CHANGES[0],decision:'unknown'}]),/Invalid war edition decision/);
  assert.match(originalWarSource('source-04').blocks[48].text,/Mutter Arns/);
  assert.match(warSource('source-04').blocks[48].text,/Schwägerin Arns/);
});

test('Geburt, Tod und Erbfolge folgen der aktuellen Genealogie, einschließlich Ceitheachs damaligem Fürsten',()=>{
  const birth=(family,id)=>Number(family.persons.find(person=>person.id===id).birth);
  assert.equal(vaeren.persons.find(person=>person.id==='eola-sturmgeborene').death,'1608');
  assert.deepEqual(['arn-vaeren','bjoern-vaeren','sinding-vaeren','galmar-vaeren'].map(id=>birth(vaeren,id)),[1608,1610,1611,1613]);
  assert.equal(1627-birth(wargh,'asger-wargh'),22);assert.equal(1638-birth(wargh,'asger-wargh'),33);
  assert.match(prose('source-02'),/etwa 22 Jahre alt/);assert.match(prose('source-02'),/mit etwa 33 Jahren/);
  assert.match(prose('source-02'),/vor seinem jüngeren Bruder Sinding/);
  const ruler=ceitheach.persons.find(person=>person.id==='diarmait-rochraide');
  assert.match(ruler.title,/1625–1651/);assert.match(cells('source-23',6)[12][1],/Diarmait/);
  assert.doesNotMatch(JSON.stringify(WAR_READING_SOURCES.map(source=>source.blocks)),/Turlough|Asger Varulv|Arn Varulv|Mutter Arns|Kalthherz/);
});

test('Die Chronologie verwendet Alerias Monatslänge und ordnet die Reaktionen hinter den Giftmord',async()=>{
  const context={};vm.runInNewContext(await readFile(new URL('../../AleriaAlmanach/modules/core/aleria-calendar.js',import.meta.url),'utf8'),context);
  const calendar=context.AleriaCalendar;
  const ordinal=(y,m,d)=>calendar.ordinal({year:y,month:m,day:d});
  assert.equal(ordinal(1627,6,25)-ordinal(1627,6,4),21);
  assert.equal(ordinal(1627,7,1)-ordinal(1627,6,25),12);
  assert.equal(ordinal(1637,12,7)-ordinal(1631,12,3),6*calendar.daysPerYear+4);
  assert.equal((1647-1646)*calendar.monthsPerYear+2-6,9);
  assert.equal(sourceFact(warSource('source-06'),'Datum'),'25.06.1627 – 01.07.1627');
  assert.equal(sourceFact(warSource('source-08'),'Datum'),'06.07.1627 – 18.07.1627');
  assert.equal(sourceFact(warSource('source-14'),'Datum'),'??.01.1629');
  assert.equal(WAR_EVENTS.find(event=>event.id==='hurinn').year,1629);
  assert.match(cells('source-01',96)[19][0],/Nach dem 30.03.1647/);
  assert.match(cells('source-01',96)[13][0],/24.02.1647/);
});

test('Truppenrechnung und Übergang von Yogrim zur späteren Belagerung passen zusammen',()=>{
  const yogrim=cells('source-15',11),siege=cells('source-16',12),navy=cells('source-19',6);
  const number=value=>Number(value.match(/[\d.]+/)[0].replaceAll('.',''));
  assert.equal(number(yogrim[26][0])+number(yogrim[26][1]),4300);
  assert.equal(number(yogrim[20][1])-number(yogrim[26][1]),1500);
  assert.ok(number(siege[20][1])<1500);
  for(const side of [0,1])assert.equal(siege.slice(21,24).reduce((sum,row)=>sum+number(row[side]),0),number(siege[20][side]));
  assert.match(prose('source-16'),/weitere Abgänge/);assert.match(prose('source-16'),/11\.12\.1629/);
  assert.match(prose('source-15'),/12.08.1629/);assert.match(prose('source-15'),/keine Zahl ausschließlich Gefallener/);
  assert.match(prose('source-03'),/45 Schiffe \(25 Heckenritter und 20 Aldrimarer\)/);
  assert.match(prose('source-04'),/Landaufgebot.*2.700 Seeleute/s);
  assert.ok(navy.flat().some(value=>value.includes('25')));
});

test('Das animierte Wellenruh-Dossier verwendet dieselbe Korrektur und behält seinen festen Kalendertag',()=>{
  assert.deepEqual(WELLENRUH.date,{year:1628,month:4,day:11});
  assert.equal(SOURCE_SECTIONS.reduce((sum,section)=>sum+section.paragraphs.length,0),28);
  assert.equal(SOURCE_SECTIONS.find(section=>section.id==='aftermath').paragraphs[2],warSource('source-12').blocks[33].text);
  assert.match(SOURCE_SECTIONS.find(section=>section.id==='red-strategy').paragraphs[3],/Zentrum der Grünen/);
  assert.match(sourceFact(warSource('source-24'),'Resultat'),/Grünen/);
  assert.match(cells('source-24',6)[13][0],/seit 1636 bettlägerig/);
  assert.match(cells('source-01',94)[11][0],/Heer der Roten/);
});

test('Die verknüpften Biografien widersprechen der gemeinsamen Chronologie nicht mehr',()=>{
  const person=id=>succession.monarchs.find(person=>person.id===id);
  const story=id=>JSON.stringify(person(id).sections);
  assert.equal(person('roger-vaeren').reign,'04.06.–25.06.1627 · 21 Tage');
  assert.match(story('roger-vaeren'),/zweite Sohn/);assert.doesNotMatch(story('roger-vaeren'),/zwei Wochen|drittgeborener Sohn/);
  assert.match(story('asger-wargh'),/22 Jahre alt/);assert.match(story('asger-wargh'),/1638/);
  assert.doesNotMatch(story('asger-wargh'),/14 Jahre alt|Geboren in die Wirren/);
  assert.match(story('galmar-vaeren'),/10.12.1627/);assert.doesNotMatch(story('galmar-vaeren'),/einziger Überlebender seiner Familie/);
});
