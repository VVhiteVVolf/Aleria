import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WAR,FACTIONS,WAR_EVENTS } from '../modules/praetendenten/praetendenten-data.mjs';
import { WAR_SOURCES,warSource,readableSourceBlocks,isSourcePlaceholder,hasSourceSectionProse } from '../modules/praetendenten/war-sources.mjs';
import { WAR_PAGES } from '../modules/praetendenten/war-page-registry.mjs';
import { renderWarHub } from '../modules/praetendenten/war-hub-render.mjs';
import { renderFactionPage } from '../modules/praetendenten/war-faction-render.mjs';
import { renderRogerAstridPage } from '../modules/praetendenten/war-event-render.mjs';
import { renderWarEventPage } from '../modules/praetendenten/war-event-render.mjs';
import { renderWarPage } from '../modules/praetendenten/war-page-render.mjs';
import { renderSourceBlocks } from '../modules/praetendenten/war-source-render.mjs';
import { escapeEventText } from '../modules/catalog/events-model.mjs';
import { EVENTS } from '../modules/catalog/events-data.mjs';
import { HOUSE_VAEREN_FAMILY } from '../../Stammbäume/assets/js/data/house-vaeren-family.js';
import { HOUSE_VARULV_FAMILY } from '../../Stammbäume/assets/js/data/house-varulv-family.js';

const workspace=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const sourceRoot=resolve(workspace,WAR.root,'sources');
const pageHtml=renderWarPage;

test('Alle 24 Originale sind unverändert gesichert; die drei Dubletten bleiben als Quellen erhalten',async()=>{
  const manifest=JSON.parse(await readFile(resolve(sourceRoot,'manifest.json'),'utf8'));
  assert.equal(manifest.sources.length,24);assert.equal(WAR_SOURCES.length,24);
  assert.equal(WAR_SOURCES.filter(source=>!source.duplicateOf).length,21);
  assert.deepEqual(WAR_SOURCES.filter(source=>source.duplicateOf).map(source=>[source.id,source.duplicateOf]),[
    ['source-07','source-06'],['source-09','source-08'],['source-17','source-16']
  ]);
  for(const source of manifest.sources){
    const original=await readFile(resolve(sourceRoot,source.file));
    assert.equal(original.length,source.bytes);
    assert.equal(createHash('sha256').update(original).digest('hex'),source.sha256);
    assert.equal(warSource(source.id).sha256,source.sha256);
  }
});

test('Registrierte Dossiers bewahren 17 Ereignisquellen ohne fiktive Tage und verlinken nur fertige Seiten',()=>{
  assert.equal(WAR_EVENTS.length,17);assert.equal(new Set(WAR_EVENTS.map(event=>event.source)).size,17);
  assert.equal(WAR_PAGES.length,20);assert.equal(FACTIONS.length,3);
  assert.throws(()=>renderWarPage({id:'unfinished',kind:'event'}),/No completed renderer/);
  const html=renderWarHub();assert.equal((html.match(/data-war-event /g)||[]).length,17);
  assert.deepEqual(WAR_EVENTS.filter(event=>event.file||event.existingHref).map(event=>event.id),['roger-astrid','uebernahme-heldenwacht','aufruhr-ivarsfels','aufruhr-rorikshall','trauerwald','erste-seeschlacht-wellenruh','flusswall','hurinn','yogrim','belagerung-schwertfall','wolfswacht','zweite-seeschlacht-wellenruh','belagerung-heldenwacht','hinterhalt-rorikshall','ermordung-bjoern','ceitheach-rorikshall','dunkelmoor']);
  assert.equal(WAR_EVENTS.find(event=>event.id==='hurinn').year,1629);
  assert.match(html,/25.06.–01.07.1627/);assert.match(html,/Angreifer sind unbekannt/);
  for(const event of WAR_EVENTS){
    assert.ok(warSource(event.source));
    assert.equal('startDate' in event,false);
    if(!event.file&&!event.existingHref)assert.ok(html.includes('Dossier folgt im nächsten Ausbau'));
  }
  assert.equal(EVENTS.find(event=>event.id===WAR.id).articleHref,'Kriege/krieg-der-praetendenten/index.html');
});

test('Jede fertige Seite enthält die vollständige Textüberlieferung und sämtliche ausgefüllten Tabellenzellen',()=>{
  for(const page of WAR_PAGES){
    const source=warSource(page.kind==='hub'?'source-01':page.kind==='faction'?FACTIONS.find(faction=>faction.id===page.faction).source:WAR_EVENTS.find(event=>event.id===page.id).source);
    const html=pageHtml(page);
    for(const block of readableSourceBlocks(source)){
      if(block.type==='paragraph')assert.ok(html.includes(escapeEventText(block.text)),`${page.id}: ${block.text.slice(0,70)}`);
      if(block.type==='table')for(const row of block.rows)for(const cell of row)if(!isSourcePlaceholder(cell.text))assert.ok(html.includes(escapeEventText(cell.text)),`${page.id}: ${cell.text}`);
    }
    assert.doesNotMatch(html,/\son(?:click|change|input|error)=|https:\/\/(?:i\.imgur|\d+\.media\.tumblr)/);
  }
  assert.match(renderRogerAstridPage(),/keine abschließende Täterzuordnung/);
  assert.match(renderFactionPage('blaue'),/noch nicht ausgefüllt|Ende und Nachwirkungen/);
});

test('Altersangepasste Illustrationen folgen den Stammbaumgeburtsjahren und lassen die Originalporträts unangetastet',async()=>{
  const artRoot=resolve(workspace,'Ereignisse/assets/praetendenten');
  const manifest=JSON.parse(await readFile(resolve(artRoot,'image-prompts.json'),'utf8'));
  assert.equal(manifest.assets.length,21);assert.equal(manifest.assets.filter(asset=>asset.status!=='superseded').length,20);assert.equal(manifest.aspectRatio,'2:3');
  for(const faction of FACTIONS){
    const person=HOUSE_VAEREN_FAMILY.persons.find(person=>person.id===faction.person);
    const asset=manifest.assets.find(asset=>asset.file===faction.image);
    assert.equal(Number(person.birth),faction.birth);assert.equal(1627-faction.birth,faction.age);
    assert.equal(asset.age.approximateAge,faction.age);assert.equal(asset.age.year,1627);
    assert.equal(asset.reference,`Stammbäume/${person.portrait}`);
    await stat(resolve(workspace,asset.reference));
  }
  for(const asset of manifest.assets){
    assert.ok((await stat(resolve(artRoot,asset.file))).size>1000);
    await stat(resolve(artRoot,asset.original));
    if(asset.reference)await stat(resolve(workspace,asset.reference));
    assert.match(asset.prompt,/Tales of Xillia\/Frieren/);
  }
  for(const asset of manifest.assets.filter(asset=>asset.batch==='step-02')){
    const person=HOUSE_VAEREN_FAMILY.persons.find(person=>person.id===asset.age.personId);
    assert.equal(Number(person.birth),asset.age.birthYear);assert.equal(asset.age.approximateAge,1627-Number(person.birth));
    assert.equal(asset.originalPortraitReference,`Stammbäume/${person.portrait}`);
    await stat(resolve(workspace,asset.reference));
  }
  const environmentScenes=manifest.assets.filter(asset=>asset.batch==='step-03');
  assert.equal(environmentScenes.length,2);
  for(const asset of environmentScenes){assert.equal(asset.age,null);assert.equal(asset.reference,null);assert.ok(asset.sourceIds.every(id=>warSource(id)));}
  const outlineScenes=manifest.assets.filter(asset=>asset.batch==='step-05');
  assert.equal(outlineScenes.length,3);
  for(const asset of outlineScenes){assert.equal(asset.age,null);assert.equal(asset.reference,null);assert.ok(asset.sourceIds.every(id=>warSource(id)));}
  for(const [file,family,year]of [['schlacht-yogrim-1629-v1.webp',HOUSE_VARULV_FAMILY,1629],['bjoern-gedenkbild-1633-v1.webp',HOUSE_VAEREN_FAMILY,1633],['dunkelmoor-arn-1639-v2.webp',HOUSE_VAEREN_FAMILY,1639]]){
    const scene=manifest.assets.find(asset=>asset.file===file);
    const person=family.persons.find(person=>person.id===scene.age.personId);
    assert.equal(Number(person.birth),scene.age.birthYear);
    assert.equal(scene.age.year,year);assert.equal(scene.age.approximateAge,year-Number(person.birth));
    assert.equal(scene.reference,`Stammbäume/${person.portrait}`);
    assert.ok(manifest.birthSources.includes(scene.birthSource));
    await stat(resolve(workspace,scene.reference));
  }
});

test('Heldenwacht und Ivarsfels enthalten die ganzen Berichte, offene Zeitangaben und direkte Fraktionsverweise',()=>{
  for(const [id,sourceId,duplicate]of [['uebernahme-heldenwacht','source-06','07'],['aufruhr-ivarsfels','source-08','09']]){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.ok(html.includes(escapeEventText(event.note)));
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,23);
    assert.ok(html.includes(`../sources/${duplicate}.txt`));
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.match(html,/war-source-gap.*Dieser Abschnitt ist in der Vorlage noch nicht ausgefüllt/s);
    assert.match(html,/\.\.\/fraktionen\/die-gruenen.html/);
    for(const block of warSource(sourceId).blocks.filter(block=>block.type==='paragraph'&&block.text.length>120))assert.ok(html.includes(escapeEventText(block.text)));
  }
  assert.match(renderWarEventPage('uebernahme-heldenwacht'),/Tongvar Riesentod, Solvig Eisenbieger/);
  assert.match(renderWarEventPage('aufruhr-ivarsfels'),/Thorgal trat einen Schritt näher/);
  assert.match(renderWarEventPage('aufruhr-ivarsfels'),/belegt keine persönliche Kampfhandlung/);
  assert.match(renderFactionPage('gruene'),/\.\.\/ereignisse\/uebernahme-von-heldenwacht.html/);
  assert.match(renderFactionPage('blaue'),/\.\.\/ereignisse\/aufruhr-in-ivarsfels.html/);
  assert.match(renderRogerAstridPage(),/\.\.\/ereignisse\/uebernahme-von-heldenwacht.html/);
});

test('Trauerwald und Flusswall erhalten vollständige Berichte, ungenaue Tage und die überlieferten Gegenstimmen',()=>{
  for(const [id,paragraphs]of [['trauerwald',20],['flusswall',30]]){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,paragraphs);
    assert.ok(html.includes(escapeEventText(event.note)));
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.match(html,/war-source-gap.*Dieser Abschnitt ist in der Vorlage noch nicht ausgefüllt/s);
    for(const side of event.sides)assert.ok(renderFactionPage(side).includes(`../${event.file}`));
  }
  const siege=renderWarEventPage('trauerwald'),destruction=renderWarEventPage('flusswall');
  assert.match(siege,/Beginn 03.1628; Kapitulation 06.1628; genaue Tage unbekannt/);
  assert.match(siege,/Mein Schwert und meine Stadt/);
  assert.match(destruction,/Thorald Sturmmantel, Einfacher Hirdmann/);
  assert.match(destruction,/Gulda, Einfache Fischerstochter/);
  assert.match(destruction,/Sigurd Sturmgeborener - Berserker/);
  assert.match(destruction,/Guldas Überleben wird nicht durch die pauschale Verlustangabe ausgelöscht/);
  assert.match(siege,/..\/ereignisse\/schaendung-von-flusswall.html/);
  assert.match(destruction,/..\/ereignisse\/belagerung-von-trauerwald.html/);
});

test('Hurinn, Yogrim und Schwertfall bewahren alle Berichte, die offenen Zahlen und den geordneten Burgabzug',()=>{
  for(const [id,paragraphs]of [['hurinn',36],['yogrim',31],['belagerung-schwertfall',36]]){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,paragraphs);
    assert.ok(html.includes(escapeEventText(event.note)));
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.match(html,/war-source-gap.*Dieser Abschnitt ist in der Vorlage noch nicht ausgefüllt/s);
    for(const side of event.sides)assert.ok(renderFactionPage(side).includes(`../${event.file}`));
  }
  const hurinn=renderWarEventPage('hurinn'),yogrim=renderWarEventPage('yogrim'),siege=renderWarEventPage('belagerung-schwertfall');
  for(const witness of ['Jorleif Gullvig','Fodnir Silberblut','Waldmir Eisenbieger'])assert.ok(hurinn.includes(witness));
  assert.match(hurinn,/01.1629; genauer Tag unbekannt/);
  assert.match(yogrim,/Eldar Varulvs, Jarl von Rorikshall - Schlachtrede/);
  assert.match(yogrim,/Arvid Helgr, Erzpatriarch von Aldrimar - Schlachtrede/);
  assert.match(yogrim,/rund 4.300/);assert.match(yogrim,/keine reine Totenzahl/);
  assert.match(siege,/Phase IV\. - Flucht/);
  assert.match(siege,/wurde kampflos aufgegeben/);
  assert.match(siege,/Hjalmar Skaals letzte Worte/);
  assert.ok(siege.includes('../sources/17.txt'));
  assert.ok(yogrim.includes('../ereignisse/belagerung-von-schwertfall.html'));
  assert.ok(siege.includes('../ereignisse/schlacht-am-yogrim.html'));
  assert.ok(renderWarEventPage('flusswall').includes('../ereignisse/schlacht-am-fluss-hurinn.html'));
});

test('Tabellen und Lagebezeichnungen werden nicht mit ausformulierter Prosa verwechselt',()=>{
  const source={id:'outline-test',title:'Test',blocks:[
    {type:'heading',text:'1) Übersicht'},
    {type:'table',rows:[[{text:'850',colspan:1,rowspan:1}]]},
    {type:'heading',text:'2) Status'},{type:'paragraph',text:'Die Lage der Grünen'},
    {type:'paragraph',text:'...'},
    {type:'heading',text:'3) Verlauf'},{type:'paragraph',text:'Die Stadt wechselte die Seite.'}
  ]};
  assert.equal(hasSourceSectionProse(source,'1) Übersicht'),false);
  assert.equal(hasSourceSectionProse(source,'2) Status'),false);
  assert.equal(hasSourceSectionProse(source,'3) Verlauf'),true);
  const html=renderSourceBlocks(source,{markEmptySections:true});
  assert.equal((html.match(/class="war-source-gap"/g)||[]).length,2);
  assert.match(html,/>850</);assert.match(html,/Die Lage der Grünen/);
  assert.match(html,/Die Stadt wechselte die Seite/);
  assert.match(renderRogerAstridPage(),/Den vollständigen Bericht lesen/);
});

test('Rorikshall, Wolfswacht und II. Wellenruh bleiben Eckdaten-Dossiers mit sechs offenen Textabschnitten',()=>{
  for(const [id,paragraphs]of [['aufruhr-rorikshall',0],['wolfswacht',4],['zweite-seeschlacht-wellenruh',4]]){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.equal(event.content,'Eckdaten');
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,paragraphs);
    assert.equal((html.match(/class="war-source-gap"/g)||[]).length,6);
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.match(html,/Die überlieferten Eckdaten lesen/);
    assert.doesNotMatch(html,/Den vollständigen Bericht lesen/);
    for(const side of event.sides)assert.ok(renderFactionPage(side).includes(`../${event.file}`));
  }
  const uprising=renderWarEventPage('aufruhr-rorikshall'),attack=renderWarEventPage('wolfswacht'),sea=renderWarEventPage('zweite-seeschlacht-wellenruh');
  assert.match(uprising,/genauer Tag und Monat unbekannt/);
  assert.match(uprising,/Iormund Schwarzdorn/);assert.match(uprising,/Bujold Kampfgeborener/);
  assert.match(attack,/Bis zu 600, Rest Gefangen/);
  assert.match(attack,/Zenon Avenicci/);
  assert.match(sea,/ergeben 45/);assert.doesNotMatch(renderFactionPage('rote'),/insgesamt 40 Schiffe/);
  assert.match(sea,/† Hrolfr Frostauge †/);assert.match(sea,/† Fenrir Wellenschild †/);assert.match(sea,/† Skeld Gullvig †/);
  assert.ok(sea.includes('Erste-Seeschlacht-bei-Wellenruh.html'));
  assert.ok(renderWarEventPage('yogrim').includes('../ereignisse/aufruhr-in-rorikshall.html'));
  assert.ok(renderWarEventPage('belagerung-schwertfall').includes('../ereignisse/angriff-auf-wolfswacht.html'));
});

test('Heldenwacht, Rorikshalls Hinterhalt und Bjoerns Tod bewahren Lücken, Verluste und die offene Täterfrage',()=>{
  for(const [id,paragraphs]of [['belagerung-heldenwacht',9],['hinterhalt-rorikshall',4],['ermordung-bjoern',1]]){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.equal(event.content,'Eckdaten');
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,paragraphs);
    assert.equal((html.match(/class="war-source-gap"/g)||[]).length,6);
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.match(html,/Die überlieferten Eckdaten lesen/);
    assert.ok(html.includes(escapeEventText(event.note)));
    for(const side of event.sides)assert.ok(renderFactionPage(side).includes(`../${event.file}`));
  }
  const siege=renderWarEventPage('belagerung-heldenwacht'),ambush=renderWarEventPage('hinterhalt-rorikshall'),murder=renderWarEventPage('ermordung-bjoern');
  for(const year of ['Erstes','Zweites','Drittes','Viertes','Fünftes','Sechstes'])assert.ok(siege.includes(`${year} Jahr`));
  assert.equal(hasSourceSectionProse(warSource('source-20'),'4) Die Belagerung'),false);
  assert.match(siege,/sechs Jahre und vier Tage/);
  assert.match(siege,/Gavin &amp; Arthan Trachwyll/);
  for(const name of ['Thorben Schwarzdorn','Aegir Kampfgeborener','Ulfgar Schattenherz','Vidarr Nachtjäger'])assert.ok(ambush.includes(name));
  assert.match(ambush,/Mehr als 1.000/);assert.match(ambush,/Mehr als 2.000/);
  assert.deepEqual(WAR_EVENTS.find(event=>event.id==='ermordung-bjoern').sides,['blaue']);
  assert.match(murder,/Unbekannt; keiner Kriegspartei zugeordnet/);
  assert.match(murder,/Finstermoor, Kathedrale/);assert.match(murder,/Bjoerns Leibwache/);
  assert.match(murder,/Ca. 23 Jahre; geboren 1610 laut Stammbaum/);
  assert.equal(hasSourceSectionProse(warSource('source-22'),'2) Vorgeschichte'),false);
  assert.ok(renderWarEventPage('zweite-seeschlacht-wellenruh').includes('../ereignisse/belagerung-von-heldenwacht.html'));
});

test('Alle 17 Ereignisse sind erschlossen; Ceitheach und Dunkelmoor ergänzen keine erfundenen Abläufe',()=>{
  assert.equal(WAR_EVENTS.filter(event=>event.content==='Eckdaten').length,8);
  for(const id of ['ceitheach-rorikshall','dunkelmoor']){
    const event=WAR_EVENTS.find(event=>event.id===id),html=renderWarEventPage(id);
    assert.equal(event.content,'Eckdaten');
    assert.equal((html.match(/data-war-source-paragraph/g)||[]).length,4);
    assert.equal((html.match(/class="war-source-gap"/g)||[]).length,6);
    assert.equal((html.match(/<a href="#source-\d+-block-/g)||[]).length,6);
    assert.ok(html.includes(escapeEventText(event.note)));
    for(const side of event.sides)assert.ok(renderFactionPage(side).includes(`../${event.file}`));
  }
  const external=renderWarEventPage('ceitheach-rorikshall'),marsh=renderWarEventPage('dunkelmoor'),hub=renderWarHub();
  assert.deepEqual(WAR_EVENTS.find(event=>event.id==='ceitheach-rorikshall').sides,['gruene']);
  assert.match(external,/Diarmait/);assert.match(external,/Cinaed/);assert.doesNotMatch(external,/Turlough/);
  assert.match(external,/auswärtige Macht/);assert.match(external,/dritten Monat 1638/);
  assert.match(marsh,/genauer Tag unbekannt/);assert.match(marsh,/Wolfsklamm gibt auf/);
  assert.match(marsh,/† Tribun - Tiberius Abor †/);
  assert.equal(hasSourceSectionProse(warSource('source-23'),'3) Verlauf'),false);
  assert.equal(hasSourceSectionProse(warSource('source-24'),'3) Verlauf'),false);
  assert.match(hub,/17 von 17 Ereignissen/);assert.match(hub,/9 mit ausführlichem Bericht, 8 mit Eckdaten/);
  assert.doesNotMatch(hub,/Dossier folgt im nächsten Ausbau|Weitere Einzelberichte und ihre Szenenbilder folgen/);
});

test('Generierte Seiten sind aktuell; lokale Bild- und Seitenverweise lösen auf',async()=>{
  for(const page of WAR_PAGES){
    const path=resolve(workspace,WAR.root,page.file),html=pageHtml(page);
    assert.equal(await readFile(path,'utf8'),html);
    for(const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)){
      if(/^[a-z]+:/i.test(match[1]))continue;
      await stat(resolve(dirname(path),decodeURIComponent(match[1])));
    }
  }
});

test('Quellprosa wird als Text gerendert; fremdes HTML wird nicht ausführbar',()=>{
  const html=renderSourceBlocks({id:'source-x',title:'Test',blocks:[{type:'paragraph',text:'<img src=x onerror="alert(1)">'}]});
  assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
});
