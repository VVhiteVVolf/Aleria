import fs from 'node:fs';
const [target]= (await (await fetch('http://127.0.0.1:9237/json/list')).json()).filter(t=>t.type==='page');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let baseline=JSON.parse(fs.readFileSync(new URL('../../Stammbäume/scripts/aislearneach-source-import/.baseline-full.json',import.meta.url),'utf8')).filter(r=>['haus-nic-holloran','haus-eamhra'].includes(r.id));
for(const r of baseline) r.family.extensions.sourceRevision=999;
const expression=process.argv.includes('--clear')?"localStorage.removeItem('aleria.family-tree.saved-families.v1')":`localStorage.setItem('aleria.family-tree.saved-families.v1',${JSON.stringify(JSON.stringify(baseline))})`;
socket.addEventListener('message',e=>{if(JSON.parse(e.data).id)socket.close();});
socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression}}));
