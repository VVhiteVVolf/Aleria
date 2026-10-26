import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const targets=await(await fetch('http://127.0.0.1:9449/json/list')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('/Vorschau/Goldmund/'));
assert.ok(target,'Der isolierte Goldmund-QA-Browser muss laufen.');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let sequence=0;
const pending=new Map(),runtimeErrors=[],failedRequests=[],httpErrors=[];
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);
 if(message.method==='Runtime.exceptionThrown')runtimeErrors.push(message.params.exceptionDetails);
 if(message.method==='Network.loadingFailed'&&!message.params.canceled)failedRequests.push(message.params);
 if(message.method==='Network.responseReceived'&&message.params.response.status>=400)httpErrors.push({url:message.params.response.url,status:message.params.response.status});
 if(message.id){const waiter=pending.get(message.id);pending.delete(message.id);message.error?waiter.reject(message.error):waiter.resolve(message.result);}
});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw Error(JSON.stringify(response.exceptionDetails));return response.result.value;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const draft=()=>evaluate('JSON.parse(localStorage.getItem("aleria:proposal:goldmund:draft:v1"))');
async function until(expression){for(let attempt=0;attempt<100;attempt++){if(await evaluate(expression))return;await pause(100);}throw Error('Timed out: '+expression);}
async function point(selector,edge=false){return evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element)throw Error('Missing '+${JSON.stringify(selector)});const r=element.getBoundingClientRect();if(!r.width&&element.classList.contains('placement-target')){const map=element.closest('.map-canvas').getBoundingClientRect();return{x:map.left+parseFloat(element.style.left)*map.width/100,y:map.top+parseFloat(element.style.top)*map.height/100};}return{x:r.left+${edge?'2':'r.width/2'},y:r.top+${edge?'2':'r.height/2'}};})()`);}
async function click(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);const p=await point(selector);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await pause(250);}
async function drag(sourceSelector,targetSelector,{locked=false}={}){
 await evaluate(`document.querySelector(${JSON.stringify(sourceSelector)}).scrollIntoView({block:${JSON.stringify(sourceSelector.includes('.clan-pin')?'center':'end')},behavior:'instant'})`);
 const source=await point(sourceSelector,locked);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...source});
 await send('Input.dispatchMouseEvent',{type:'mousePressed',...source,button:'left',buttons:1,clickCount:1});
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:source.x+12,y:source.y,button:'left',buttons:1});
 const destination=await point(targetSelector);
 assert.ok(destination.y>70&&destination.y<1100,'Das Drop-Ziel ist im sichtbaren Viewport.');
 for(let step=1;step<=12;step++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:source.x+(destination.x-source.x)*step/12,y:source.y+(destination.y-source.y)*step/12,button:'left',buttons:1});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',...destination,button:'left',buttons:0,clickCount:1});
 await pause(300);
}
async function screenshot(name,selector=null){await evaluate('document.querySelector("[data-role=status]").hidden=true');if(selector)await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();window.scrollTo({top:scrollY+r.top-90,behavior:'instant'});})()`);await pause(150);const result=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(directory,name),Buffer.from(result.data,'base64'));}

try{
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
 await send('Page.reload',{ignoreCache:true});
 await until('document.readyState==="complete"&&document.querySelectorAll(".new-house").length===11');
 assert.equal(await evaluate('document.querySelectorAll("[data-role=albic-clans] .new-house").length'),4);
 await click('[data-action="reset"]');
 const images=await evaluate(`(async()=>{const images=[...document.images];images.forEach(image=>image.loading='eager');await Promise.all(images.map(image=>image.decode().catch(()=>{})));return images.map(image=>({src:image.getAttribute('src'),width:image.naturalWidth,height:image.naturalHeight}));})()`);
 assert.ok(images.length>50);assert.deepEqual(images.filter(image=>!image.width||!image.height),[],'Alle sichtbaren Bilder sind dekodierbar.');
 const imageLinks=await evaluate(`(async()=>{const data=await import('/Vorschau/Goldmund/realm-data.mjs?v=20261026-5');const links=[...new Set([...document.querySelectorAll('a[href]')].map(link=>link.getAttribute('href')).filter(href=>/\.(?:png|webp)$/i.test(href)).concat(data.houses.flatMap(house=>[house.fullsize,house.original].filter(Boolean)),data.realmDesigns.map(design=>design.fullsize),data.counties.concat(data.regions).map(area=>'assets/production/'+area.id+'.png')))];return Promise.all(links.map(async href=>({href,status:(await fetch(href,{method:'HEAD'})).status})));})()`);
 assert.deepEqual(imageLinks.filter(link=>link.status!==200),[],'Alle Bildgroßansichten sind erreichbar.');
 await drag('[data-role="unassigned-houses"] [data-drag-house="broeck"]','[data-role="map-section"] .placement-target[data-drop-seat="bramsen"]');
 assert.equal((await draft()).placements.broeck,'bramsen','Echtes Pointer-Drag weist Broeck auf der Karte zu.');
 await drag('[data-role="map-section"] .clan-pin[data-clan="broeck"]','[data-drop-seat="unassigned"] .section-heading');
 assert.equal((await draft()).placements.broeck,null,'Echtes Pointer-Drag gibt den Sitz wieder frei.');
 for(const id of ['roden','goldveld']){
  assert.equal(await evaluate(`document.querySelector('[data-role="map-section"] .clan-pin[data-clan="${id}"]').hasAttribute('data-drag-house')`),false);
  await drag(`[data-role="map-section"] .clan-pin[data-clan="${id}"]`,'[data-role="map-section"] .placement-target[data-drop-seat="bramsen"]',{locked:true});
  assert.equal((await draft()).placements[id],'thronholt');
 }
 await evaluate('document.querySelector("[data-role=house-select]").value="herzau";document.querySelector("[data-role=house-select]").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("[data-role=seat-select]").value="bregen"');
 await click('[data-action="move-selected"]');
 await evaluate('(()=>{const form=document.querySelector("[data-name-scope=county][data-name-id=kronenau]");form.closest("details").open=true;form.querySelector("input").focus();})()');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
 await send('Input.insertText',{text:'Kronenau · Besprechung'});await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal((await draft()).design.countyNames.kronenau,'Kronenau · Besprechung');
 await click('[data-action="choose-realm"][data-design="goldkelch"]');
 const exported=await draft();assert.equal(exported.placements.herzau,'bregen');assert.equal(exported.design.realmCrest,'goldkelch');
 await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:directory});
 await fs.rm(path.join(directory,'goldmund-entwurf.json'),{force:true});
 await click('[data-action="export"]');
 let downloaded;for(let i=0;i<50;i++){try{downloaded=JSON.parse(await fs.readFile(path.join(directory,'goldmund-entwurf.json'),'utf8'));break;}catch{await pause(100);}}
 assert.deepEqual(downloaded,exported,'Der echte Browserdownload enthält den vollständigen Entwurf.');
 await click('[data-action="reset"]');
 const doc=await send('DOM.getDocument');const fileInput=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'[data-role="import-file"]'});
 await send('DOM.setFileInputFiles',{nodeId:fileInput.nodeId,files:[path.join(directory,'goldmund-entwurf.json')]});
 await until('JSON.parse(localStorage.getItem("aleria:proposal:goldmund:draft:v1")).design.realmCrest==="goldkelch"');
 assert.deepEqual(await draft(),exported,'Der echte Dateiupload stellt den exportierten Entwurf wieder her.');
 await send('Page.reload',{ignoreCache:true});await until('document.querySelector("[data-role=hero-crest-name]")?.textContent==="Prunkkelch"');
 assert.deepEqual(await draft(),exported,'Neuladen erhält Namen, Wappenwahl und Sitze.');
 await click('[data-action="choose-realm"][data-design="doppeladler"]');await click('[data-action="undo"]');
 assert.deepEqual(await draft(),exported,'Gemeinsames Undo erhält den importierten Stand.');
 await click('[data-action="open-map"]');assert.equal(await evaluate('document.querySelector("#map-dialog").open'),true);
 await click('#map-dialog [data-action="zoom-in"]');assert.equal(await evaluate('document.querySelector("[data-role=zoom-label]").textContent'),'135 %');
 await click('#map-dialog [data-action="close-map"]');
 await click('[data-action="reset"]');
 await evaluate('window.scrollTo({top:0,behavior:"instant"})');
 await screenshot('desktop-hero.png');await screenshot('desktop-counties.png','[data-role="counties"]');await screenshot('desktop-map.png','.map-shell');
 await screenshot('desktop-realm-designs.png','[data-role="realm-designs"]');await screenshot('desktop-new-houses.png','[data-role="new-houses"]');
 await screenshot('desktop-additional-houses.png','[data-role="new-houses"] .new-house:nth-child(7)');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});await evaluate('window.scrollTo({top:0,behavior:"instant"})');
 await screenshot('mobile-hero.png');await screenshot('mobile-regions.png','[data-role="settlements"]');
 await evaluate('document.querySelector("[data-role=house-select]").value="eitelborn";document.querySelector("[data-role=house-select]").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("[data-role=seat-select]").value="niedenfels"');
 await click('[data-action="move-selected"]');assert.equal((await draft()).placements.eitelborn,'niedenfels');
 await click('[data-action="undo"]');assert.equal((await draft()).placements.eitelborn,null);
 const mobile=await evaluate('({screen:innerWidth,page:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth})');assert.equal(mobile.overflow,false);
 assert.deepEqual(runtimeErrors,[]);assert.deepEqual(httpErrors,[]);assert.deepEqual(failedRequests,[]);
 const result={passed:true,images:images.length,uniqueImageLinks:imageLinks.length,houseCount:20,newHouseCount:11,albicClanCount:4,checks:['Alle Bilder dekodierbar','Alle PNG-/WebP-Großansichten HTTP 200','Echtes Pointer-Drag auf Kartenort und zurück','Roden und Goldveld nicht verschiebbar','Tastatureingabe für Grafschaftsnamen','Wappenwahl','Browserdownload und Dateiupload','Reload und gemeinsames Undo','Mapdialog und Zoom','Mobile Haus-/Ortsauswahl mit Undo','Mobil ohne horizontalen Seitenüberlauf'],mobile,runtimeErrors,httpErrors,failedRequests,screenshots:['desktop-hero.png','desktop-counties.png','desktop-map.png','desktop-realm-designs.png','desktop-new-houses.png','desktop-additional-houses.png','mobile-hero.png','mobile-regions.png']};
 await fs.writeFile(path.join(directory,'browser-checks.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{socket.close();}
