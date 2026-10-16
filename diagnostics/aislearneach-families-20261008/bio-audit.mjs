import fs from 'node:fs';
const dir = new URL('./', import.meta.url);
const targets = await (await fetch('http://127.0.0.1:9237/json/list')).json();
const socket = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let sequence=0; const pending=new Map();
socket.addEventListener('message', e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
const sources=JSON.parse(fs.readFileSync(new URL('../../Stammbäume/scripts/aislearneach-source-import/sources.json',import.meta.url),'utf8'));
const results=[];
for(const slug of sources.map(s=>s.slug)) {
 const familyId=(slug==='techtmar'?'sept-':'haus-')+slug;
 await send('Page.navigate',{url:'http://127.0.0.1:4175/Stammb%C3%A4ume/Stammbaum.html?family='+familyId+'&mode=view'});
 await wait(450);
 for(let n=0;n<40;n++){if(await evaluate("document.readyState==='complete' && document.querySelectorAll('.card_cont').length>0"))break;await wait(100);}
 await evaluate("document.querySelector('#family-emblem-button').click()");
 await wait(200);
 const value=await evaluate(`(async()=>{const d=document.querySelector('#house-biography-dialog');const images=[...d.querySelectorAll('img')];await Promise.all(images.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true});setTimeout(r,4000);})));return {open:d.open,text:d.innerText,images:images.map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))};})()`);
 results.push({familyId,...value});
 if(slug==='morna'){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(new URL('morna-bio.png',dir),Buffer.from(shot.data,'base64'));}
}
fs.writeFileSync(new URL('bios.json',dir),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({families:results.length,images:results.reduce((n,x)=>n+x.images.length,0),failures:results.filter(x=>!x.open||x.images.some(i=>!i.loaded)).map(x=>x.familyId)}));
socket.close();
