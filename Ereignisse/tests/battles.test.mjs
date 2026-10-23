import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { BATTLE_SHIPS, shipAt, advanceBattle, LAST_PHASE, BATTLE_DURATION, phaseAt, battleCamera } from '../modules/battles/battle-simulation.mjs';
import { SHIP_MODELS } from '../modules/battles/battle-fleets.mjs';
import { BATTLE_BEATS, arrowAt } from '../modules/battles/battle-effects.mjs';
import { createBattleAudio } from '../modules/battles/battle-audio.mjs';
import { createBattleMusic, BATTLE_MUSIC_BPM, BATTLE_MUSIC_STEPS } from '../modules/battles/battle-music.mjs';
import { escapeEventText } from '../modules/catalog/events-model.mjs';
import { WELLENRUH } from '../modules/battles/wellenruh-data.mjs';
import { EVENTS } from '../modules/catalog/events-data.mjs';
import { calendarYearHref, calendarChronicleSelection } from '../modules/catalog/events-model.mjs';
import { createCalendarArchiveEvents, CALENDAR_ARCHIVE_EVENTS } from '../../AleriaAlmanach/modules/calendar/calendar-archive-events.mjs';
import { createCalendarStore } from '../../AleriaAlmanach/modules/calendar/calendar-store.mjs';
import { createCalendarEventModel } from '../../AleriaAlmanach/modules/calendar/calendar-events-model.mjs';
import { renderCalendarPreview } from '../../AleriaAlmanach/modules/calendar/calendar-preview.mjs';
import { renderWellenruhPage } from '../modules/battles/battle-render.mjs';

const context = vm.createContext({ console });
vm.runInContext(await readFile(new URL('../../AleriaAlmanach/modules/core/aleria-calendar.js', import.meta.url), 'utf8'), context);
const calendar = context.AleriaCalendar;
const model = createCalendarEventModel(calendar);
const storage = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key,value) => data.set(key,value) }; };

test('Alle 57 Schiffe behalten ihre Identität; die endgültigen Verluste stimmen mit der Quelle überein', () => {
  assert.equal(BATTLE_SHIPS.length, 57);
  assert.equal(new Set(BATTLE_SHIPS.map(ship => ship.id)).size, 57);
  for (const side of WELLENRUH.sides) {
    const ships = BATTLE_SHIPS.filter(ship => ship.side === side.id);
    assert.equal(ships.length, side.ships);
    assert.ok(ships.every(ship => shipAt(ship, 0).loss === 0));
    assert.equal(ships.filter(ship => shipAt(ship, LAST_PHASE).loss === 1).length, side.lostShips);
  }
});

test('Vor- und Zurückspulen sind deterministisch und unabhängig vom bisherigen Ablauf', () => {
  for (let p = 0; p <= LAST_PHASE; p += .025) {
    for (const ship of BATTLE_SHIPS) {
      const point = shipAt(ship, p);
      assert.ok(Object.values(point).every(Number.isFinite));
      assert.ok(point.x > 0 && point.x < 1100 && point.y > 0 && point.y < 670);
      assert.ok(point.loss >= 0 && point.loss <= 1);
    }
  }
  const ship = BATTLE_SHIPS[31], atTwo = shipAt(ship, 2);
  shipAt(ship, 5);
  assert.deepEqual(shipAt(ship, 2), atTwo);
  assert.equal(advanceBattle(0, BATTLE_DURATION), LAST_PHASE);
  assert.equal(advanceBattle(0, BATTLE_DURATION / 2, 2), LAST_PHASE);
  assert.equal(advanceBattle(4.99, 100), LAST_PHASE);
  assert.equal(phaseAt(-50), 0);
  assert.equal(phaseAt(100), LAST_PHASE);
});

test('Der Quellenkalender enthält den einmaligen 11.04.1628 und keine erfundenen Jahrestage', () => {
  const [event] = CALENDAR_ARCHIVE_EVENTS;
  assert.equal(event.id, WELLENRUH.id);
  assert.deepEqual(event.start, WELLENRUH.date);
  assert.equal(event.recurrence, 'none');
  assert.equal(model.occurrences([event], { year:1628,month:4,day:11 }).length, 1);
  for (const date of [{year:1628,month:4,day:10},{year:1628,month:4,day:12},{year:1629,month:4,day:11}]) assert.equal(model.occurrences([event], date).length, 0);
  assert.equal(createCalendarArchiveEvents(EVENTS.filter(entry => !entry.startDate)).length, 0);
  const before = JSON.stringify(calendar.current());
  const url = new URL(calendarYearHref(EVENTS.find(item => item.id === event.id)), 'https://local.test/Ereignisse/index.html');
  assert.deepEqual(calendarChronicleSelection(url.searchParams, calendar.current()).selected, WELLENRUH.date);
  assert.deepEqual(calendarChronicleSelection(new URLSearchParams(`event=${event.id}`), calendar.current()).selected, WELLENRUH.date);
  assert.equal(JSON.stringify(calendar.current()), before);
});

test('Quellenereignisse bleiben von lokalen Entwürfen, Firebase und Veröffentlichung getrennt', async () => {
  let remote;
  const writes = [];
  const backend = { subscribe(callback) { remote = callback; callback([]); return () => {}; }, save: async event => { writes.push(event); return event; } };
  const store = createCalendarStore({ storage:storage(), getBackend:()=>backend, calendar, target:{}, archiveEvents:CALENDAR_ARCHIVE_EVENTS });
  store.initialize();
  assert.equal(store.getState().events.length, 1);
  assert.equal(store.getState().pendingCount, 0);
  await store.publish();
  assert.equal(writes.length, 0);
  remote([{ ...CALENDAR_ARCHIVE_EVENTS[0], title:'Veraltete Dublette' }]);
  assert.equal(store.getState().events.length, 1);
  assert.equal(store.getState().events[0].title, WELLENRUH.title);
  await assert.rejects(store.save({ ...CALENDAR_ARCHIVE_EVENTS[0], title:'Überschrieben' }), /Ereignischronik/);
  remote([]);
  assert.equal(store.getState().events.length, 1);
  store.destroy();
});

test('Schlachtkarte ist im Monats- und Tagesmodell sichtbar und führt zum vorhandenen Dossier', async () => {
  const event = model.occurrences(CALENDAR_ARCHIVE_EVENTS, {year:1628,month:4,day:1}, {year:1628,month:4,day:36})[0];
  const preview = renderCalendarPreview(event, {calendar});
  assert.match(preview, /Schlacht · Vergangenes Ereignis · Chronik · Experimentell/);
  assert.match(preview, /11\. Himmelsbogen 1628/);
  assert.match(preview, /\.\.\/Ereignisse\/Schlachten\/Erste-Seeschlacht-bei-Wellenruh.html/);
  const html = await readFile(new URL('../Schlachten/Erste-Seeschlacht-bei-Wellenruh.html', import.meta.url), 'utf8');
  assert.equal(html, renderWellenruhPage());
  assert.equal((html.match(/data-ship=/g) || []).length, 57);
  assert.doesNotMatch(html, /\son(?:click|change|input)=|https:\/\/i.imgur/);
  for (const name of ['wellenruh-szene-v1.png','wellenruh-szene-v1.webp','image-prompts.json']) await readFile(new URL(`../assets/battles/wellenruh/${name}`, import.meta.url));
});

test('Die vollständige Nutzerüberlieferung einschließlich Strategien und sieben Szenenabsätzen bleibt lesbar', async () => {
  const source=JSON.parse(await readFile(new URL('../modules/battles/wellenruh-source.json',import.meta.url),'utf8'));
  const original=await readFile(new URL('../Schlachten/sources/wellenruh-vorlage.html',import.meta.url));
  assert.equal(createHash('sha256').update(original).digest('hex'),source.sha256);
  assert.deepEqual(source.sections.map(section=>[section.id,section.paragraphs.length]),[
    ['overview',1],['background',4],['green-strategy',4],['red-strategy',4],['course',5],['aftermath',3],['scene',7],['trivia',0]
  ]);
  const html=renderWellenruhPage();
  assert.equal((html.match(/data-source-paragraph=/g)||[]).length,28);
  for(const section of source.sections)for(const text of section.paragraphs)assert.ok(html.includes(escapeEventText(text)),`${section.id}: ${text.slice(0,50)}`);
  for(const name of ['Skeld Gullvig','Egil Ragnulf','Torvald Varangr','Fenrir Wellenschild','Ragnar Silberblut','Sverre Sturmgeborener'])assert.ok(html.includes(name));
  assert.match(html,/Trivia.*keine ausgefüllten Einträge/s);
  assert.doesNotMatch(html,/battle-fleet-seal[^>]*>[GR]</);
});

test('Alle sechs generierten Schiffsmotive sowie beide Widder und die neue Karte sind lokale Assets', async () => {
  assert.equal(new Set(BATTLE_SHIPS.map(ship=>ship.model)).size,6);
  for(const model of Object.values(SHIP_MODELS))assert.ok((await readFile(new URL(`../assets/battles/wellenruh/v2/${model.file}`,import.meta.url))).length>1000);
  for(const file of ['widder-gruen.webp','widder-rot.webp','seekarte-v2.webp','image-prompts.json'])await readFile(new URL(`../assets/battles/wellenruh/v2/${file}`,import.meta.url));
  const html=renderWellenruhPage();
  assert.equal((html.match(/<image data-battle-art/g)||[]).length,58);
  assert.match(html,/alt="Grüner Widder"/);assert.match(html,/alt="Roter Widder"/);
});

test('Bewegung ist nicht starr; Kamerafahrt, Effekte und frühes Fallen Ragnars bleiben nachvollziehbar', () => {
  const a=BATTLE_SHIPS.find(ship=>ship.id==='green-13'),b=BATTLE_SHIPS.find(ship=>ship.id==='green-14');
  const delta=p=>{const x=shipAt(a,p),y=shipAt(b,p);return [x.x-y.x,x.y-y.y];};
  assert.notDeepEqual(delta(0),delta(2));
  const rag=BATTLE_SHIPS.find(ship=>ship.id==='red-15'),rav=BATTLE_SHIPS.find(ship=>ship.id==='red-0');
  assert.ok(rag.lossStart<rav.lossStart);
  assert.ok(BATTLE_SHIPS.some(ship=>ship.lost&&ship.lossMode==='captured'));
  assert.ok(battleCamera(3).zoom>1);assert.equal(battleCamera(3,false).zoom,1);
  assert.equal(battleCamera(5).zoom,1);
  assert.ok(BATTLE_BEATS.find(beat=>beat.text.includes('Ragnar')).at<BATTLE_BEATS.find(beat=>beat.text.includes('Hrolfr entert')).at);
  for(let p=0;p<=5;p+=.05)for(let i=0;i<24;i++)assert.ok(Object.values(arrowAt(i,p)).every(Number.isFinite));
});

test('Rote Verbände reagieren unterschiedlich auf die Zange; die Ausgangsaufstellung ist aufgelockert', () => {
  const ships=BATTLE_SHIPS.filter(ship=>ship.group==='red-center');
  assert.ok(new Set(ships.map(ship=>ship.offsetX.toFixed(2))).size>10);
  assert.ok(new Set(ships.map(ship=>shipAt(ship,2.35).angle.toFixed(1))).size>10);
  const north=BATTLE_SHIPS.find(ship=>ship.id==='red-18'),south=BATTLE_SHIPS.find(ship=>ship.id==='red-24');
  assert.ok(shipAt(north,2.35).angle>270);
  assert.ok(shipAt(south,2.35).angle<270);
  const green=BATTLE_SHIPS.filter(ship=>ship.group==='green-center');
  assert.ok(new Set(green.map(ship=>shipAt(ship,1.2).angle.toFixed(1))).size>6);
});

test('Retro-Ton benötigt ausdrückliches Einschalten und bleibt beim Spulen und Ausschalten still', async () => {
  let contexts=0,voices=0,stops=0,closed=0;
  const musicTimers=new Set();
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
  const node=()=>({gain:param(),frequency:param(),connect(){},disconnect(){},start(){voices++;},stop(){stops++;}});
  class AudioContextStub{
    constructor(){contexts++;this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination={};}
    createGain(){return node();}createOscillator(){return node();}createBufferSource(){return node();}createBiquadFilter(){return node();}
    createBuffer(){return{getChannelData:()=>new Float32Array(5200)};}
    async resume(){}async close(){closed++;}
  }
  const audio=createBattleAudio({AudioContextClass:AudioContextStub,setMusicTimer:callback=>{musicTimers.add(callback);return callback;},clearMusicTimer:callback=>musicTimers.delete(callback)});
  audio.update(1.1,true);assert.equal(contexts,0);assert.equal(voices,0);
  await audio.setEnabled(true);assert.equal(contexts,1);
  audio.sync(1);const before=voices;audio.update(1.2,true);assert.ok(voices>before);
  audio.pause();assert.ok(stops>0);
  audio.sync(3);const afterSeek=voices;audio.update(3,false);assert.equal(voices,afterSeek);
  await audio.setEnabled(false);audio.update(4.99,true);assert.equal(voices,afterSeek);
  await audio.setMusicEnabled(true);assert.equal(musicTimers.size,1);assert.ok(voices>afterSeek);
  const musicVoices=voices;
  await audio.setEnabled(false);assert.equal(musicTimers.size,1);assert.equal(voices,musicVoices);
  audio.sync(2.5);assert.equal(musicTimers.size,0);assert.equal(voices,musicVoices);
  audio.start(2.5);assert.equal(musicTimers.size,1);assert.ok(voices>musicVoices);
  audio.pause();assert.equal(musicTimers.size,0);
  audio.start(0);assert.equal(musicTimers.size,1);
  await audio.setMusicEnabled(false);assert.equal(musicTimers.size,0);
  audio.destroy();assert.equal(closed,1);
});

test('Die eigene Kampfmelodie bleibt bei 76 BPM, plant ohne doppelte Timer und pausiert vollständig', () => {
  let now=0,nextTimer=0;
  const timers=new Map(),notes=[],drums=[];
  const music=createBattleMusic({time:()=>now,playNote:(...note)=>notes.push(note),playDrum:(...drum)=>drums.push(drum),
    setTimer:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearTimer:id=>timers.delete(id)});
  assert.equal(BATTLE_MUSIC_BPM,76);assert.equal(BATTLE_MUSIC_STEPS,64);
  music.start();music.start();assert.equal(timers.size,1);
  assert.equal(notes.find(note=>note[3]==='lead')[0],62);
  for(now=.05;now<25.3;now+=.05)for(const tick of timers.values())tick();
  const lows=drums.filter(drum=>drum[0]==='low');
  for(let i=1;i<lows.length;i++)assert.ok(Math.abs(lows[i][1]-lows[i-1][1]-120/76)<1e-8);
  assert.ok(notes.filter(note=>note[3]==='lead').length>=32);
  music.pause();assert.equal(timers.size,0);
  music.seek(2.5);music.start();
  assert.equal(notes.filter(note=>note[3]==='lead').at(-1)[0],69);
  assert.ok(notes.at(-1)[2]>=now);
  music.destroy();assert.equal(timers.size,0);
});
