import {createServer} from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {spawn} from 'node:child_process';
const root=await realpath(fileURLToPath(new URL('../',import.meta.url)));
export const DEFAULT_PORT=4177;
const port=Number(process.env.IDEENWERK_PORT||DEFAULT_PORT);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('IDEENWERK_PORT muss zwischen 1024 und 65535 liegen.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(request,response)=>{
  try{
    if(!['GET','HEAD'].includes(request.method)){response.writeHead(405).end();return;}
    if(request.headers.host!==`127.0.0.1:${port}`&&request.headers.host!==`localhost:${port}`){response.writeHead(403).end();return;}
    const path=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    const candidate=resolve(root,`.${path==='/'?'/index.html':path}`);
    if(!candidate.startsWith(root+sep)||path.split('/').some(part=>part.startsWith('.'))||/\.(cmd|md)$/i.test(path)||path.startsWith('/tests/')||path.startsWith('/scripts/')){response.writeHead(403).end();return;}
    const file=await realpath(candidate);
    if(!file.startsWith(root+sep)||!(await stat(file)).isFile()){response.writeHead(404).end();return;}
    response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"});
    response.end(request.method==='HEAD'?undefined:await readFile(file));
  }catch{response.writeHead(404).end('Nicht gefunden');}
});
server.on('error',error=>{if(error.code==='EADDRINUSE'){console.error(`Port ${port} ist belegt. Ein vorhandenes Ideenwerk kannst du unter http://127.0.0.1:${port} öffnen. Alternativ IDEENWERK_PORT setzen (anderer Port = eigener Browserspeicher).`);}else console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${port}`;
  console.log(`Ideenwerk läuft lokal: ${url}\nZum Beenden: Strg+C`);
  if(process.argv.includes('--open')){
    if(process.platform==='win32')spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,detached:true,stdio:'ignore'}).unref();
    else spawn(process.platform==='darwin'?'open':'xdg-open',[url],{detached:true,stdio:'ignore'}).unref();
  }
});
