/* Execute with Node. DOM logic checks; no browser rasterization. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),elements=new Map();
function element(){return {value:'',textContent:'',className:'',style:{},children:[],listeners:{},
 addEventListener(e,fn){this.listeners[e]=fn;},setAttribute(){},append(...c){this.children.push(...c);},replaceChildren(...c){this.children=c;}};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,fonts:{load:()=>Promise.resolve([{}])}};
const context=vm.createContext({document,console});context.window=context;
vm.runInContext(fs.readFileSync(path.join(root,'karnrith.js'),'utf8'),context);
const api=context.Karnrith;
assert.equal(api.alphabet.length,30);assert.equal(api.coverage.length,473);assert.equal(api.words.length,100);
assert.equal(api.findUnsupported(api.coverage.map(r=>r.character).join('')).length,0);
assert.equal(api.findUnsupported('Kök CJX ßẞ ÁÉÍÓÚÝ áéíóúý\n\t').length,0);
assert.equal(api.findUnsupported('🐉🐉').length,1);
assert.equal(api.encodeTokens(['NG','TH','kH','Gh','sh','CH','dh']),api.encodeTokens(['ng','th','kh','gh','sh','ch','dh']));
assert.notEqual(api.encodeTokens(['T']),api.encodeTokens(['TH']));
for(const c of ['C','J','X','ß'])assert.throws(()=>api.encodeTokens([c]));
assert.equal(api.fromLegacy(api.alphabet.map(r=>r.legacyCharacter).join('')),api.alphabet.map(r=>r.char).join(''));
assert.equal(api.fromLegacy('Kök & Q!'),'Kök & Q!');
const html=fs.readFileSync(path.join(root,'demo.html'),'utf8');
document.getElementById('input').value='Úrortharn Faurgor Kök';
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],context);
assert.equal(document.getElementById('preview').textContent,'Úrortharn Faurgor Kök');
assert.equal(document.getElementById('coverage').children.length,473);
assert.equal(document.getElementById('words').children.length,100);
assert.equal((html.match(/class="card"/g)||[]).length,30);
function trigger(id,event,target={}){document.getElementById(id).listeners[event]({target});}
trigger('size','input',{value:'72'});assert.equal(document.getElementById('preview').style.fontSize,'72px');
trigger('color','input',{value:'#123456'});assert.equal(document.getElementById('preview').style.color,'#123456');
trigger('ligatures','change',{checked:false});assert.equal(document.getElementById('preview').className,'karnrith-text preview');
trigger('ligatures','change',{checked:true});assert.equal(document.getElementById('preview').className,'karnrith preview');
trigger('special','click');assert.equal(api.findUnsupported(document.getElementById('input').value).length,0);
document.getElementById('input').value=api.alphabet[0].legacyCharacter;trigger('input','input');
assert.equal(document.getElementById('preview').textContent,api.alphabet[0].legacyCharacter);
trigger('legacy','click');assert.equal(document.getElementById('input').value,api.alphabet[0].char);
for(const query of ['Schmied','Faurpargor','Faurgor']){
 document.getElementById('search').value=query;trigger('search','input');
 const matches=document.getElementById('words').children.map(row=>row.children[0].textContent);
 assert.equal(matches.length,query==='Schmied'?2:1);
 assert.ok(matches.includes('Faurgor'));
 if(query==='Schmied')assert.ok(matches.includes('Faurath'));
}
document.getElementById('search').value='kein-treffer';trigger('search','input');assert.equal(document.getElementById('words').children.length,0);
document.getElementById('input').value='<img src=x onerror=alert(1)>🐉';trigger('input','input');
assert.equal(document.getElementById('preview').textContent,'<img src=x onerror=alert(1)>🐉');assert.match(document.getElementById('status').textContent,/1F409/);
for(const filename of ['demo.html','Sprache/Sprachbibel-Morgar-1.1.html','karnrith.css']){
 const s=fs.readFileSync(path.join(root,filename),'utf8');
 for(const m of s.matchAll(/(?:href|src)="([^"]+)"|url\("([^"]+)"\)/g)){
  const ref=m[1]||m[2];if(!/^(https?:|#)/.test(ref))assert.ok(fs.existsSync(path.resolve(root,path.dirname(filename),ref.split('?')[0])),ref);
 }
}
setImmediate(()=>{assert.equal(document.getElementById('fontStatus').textContent,'Karnrith Tiefenrunen wurde geladen.');console.log('Coverage, canonical tokens, explicit legacy conversion, 30 cards, 100-word dictionary, search, controls and local references PASS. DOM mock.');});
