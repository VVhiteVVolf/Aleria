/* Run with node source/test_demo.cjs. Tests logic without a browser. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const elements = new Map();
function element() {
  return {value:'',textContent:'',className:'',style:{},children:[],listeners:{},
    addEventListener(event,fn){this.listeners[event]=fn;},
    setAttribute(){},append(...children){this.children.push(...children);}};
}
const document = {
  getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},
  createElement:element,
  fonts:{load:()=>Promise.resolve([{}])}
};
const context = vm.createContext({document,console});
context.window = context;
vm.runInContext(fs.readFileSync(path.join(root,'rheunwaith.js'),'utf8'),context);
const api = context.Rheunwaith;
assert.equal(api.alphabet.length,30);
assert.equal(api.coverage.length,473);
assert.equal(api.findUnsupported(api.coverage.map(r=>r.character).join('')).length,0);
assert.equal(api.findUnsupported('König Kök: Q ÄÖÜ äöü ßẞ & 25 €\n\t').length,0);
assert.equal(api.findUnsupported('🐉🐉').length,1);
assert.equal(api.encodeTokens(['T','TH','th']),api.encodeTokens(['Th','Th','Th']));
assert.equal(api.encodeTokens(['NG','Ll','cH','rH']),api.encodeTokens(['Ng','Ll','Ch','Rh']));
assert.throws(()=>api.encodeTokens(['Q']));
assert.equal(api.toPrivateUse(api.alphabet.map(r=>r.legacyCharacter).join('')),api.alphabet.map(r=>r.char).join(''));
assert.equal(api.toPrivateUse('Deutsch: Q, K, ß!'),'Deutsch: Q, K, ß!');
const html = fs.readFileSync(path.join(root,'demo.html'),'utf8');
document.getElementById('input').value='Kök Q ÄÖÜ ßẞ';
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],context);
assert.equal(document.getElementById('preview').textContent,'Kök Q ÄÖÜ ßẞ');
assert.equal(document.getElementById('coverage').children.length,473);
assert.equal((html.match(/class="card"/g)||[]).length,30);
function trigger(id,event,target){document.getElementById(id).listeners[event]({target});}
trigger('size','input',{value:'72'});
assert.equal(document.getElementById('preview').style.fontSize,'72px');
trigger('color','input',{value:'#123456'});
assert.equal(document.getElementById('preview').style.color,'#123456');
trigger('ligatures','change',{checked:false});
assert.equal(document.getElementById('preview').className,'rheunwaith-text preview');
trigger('ligatures','change',{checked:true});
assert.equal(document.getElementById('preview').className,'rheunwaith preview');
trigger('special','click',{});
assert.equal(api.findUnsupported(document.getElementById('input').value).length,0);
document.getElementById('input').value='<img src=x onerror=alert(1)>🐉';
trigger('input','input',{});
assert.equal(document.getElementById('preview').textContent,'<img src=x onerror=alert(1)>🐉');
assert.match(document.getElementById('status').textContent,/1F409/);
for(const filename of ['demo.html','Handbuch.html','rheunwaith.css']){
  const s=fs.readFileSync(path.join(root,filename),'utf8');
  const refs=[...s.matchAll(/(?:href|src)="([^"]+)"|url\("([^"]+)"\)/g)].map(m=>m[1]||m[2]);
  for(const ref of refs)if(!/^(https?:|#)/.test(ref))assert.ok(fs.existsSync(path.join(root,ref.split('?')[0])),ref);
}
setImmediate(()=>{
  assert.equal(document.getElementById('fontStatus').textContent,'Rheunwaith wurde geladen.');
  console.log('API, 473 coverage cells, 30 rune cards, controls, literal input and local file references PASS. DOM mock, no browser rasterization.');
});
