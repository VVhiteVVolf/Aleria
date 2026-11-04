import test from 'node:test';
import assert from 'node:assert/strict';
import {createModule} from '../modules/templates/catalog.mjs';
import {buildRequestPackage} from '../modules/requests/request-package.mjs';

const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5YQAAAAASUVORK5CYII=';
function wish(type='avatar-request') {
  const module=createModule(type);
  module.title=type==='avatar-request'?'Neues Portrait für eine Figur':'Ein neuer Marktstand';
  module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='text').value='Bitte Mantel und Frisur des Referenzbilds übernehmen.';
  module.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image').value=PNG;
  module.requestMeta.stage='ready';
  return module;
}

test('ausgewählte Wünsche werden als lesbare Beschreibung, JSON und getrennte Bilddateien verpackt',()=>{
  const request=wish(),before=structuredClone(request);
  request.localSecret='Darf nicht übertragen werden';
  request.requestMeta.submission={repository:'patrick/wuensche',branch:'ideenwerk-wuensche',sha:'a'.repeat(40),fingerprint:'b'.repeat(64),sentAt:'2026-11-03T12:00:00.000Z'};
  const packet=buildRequestPackage({workspaceId:'projekt-1',requests:[request]});
  const json=packet.files.find(file=>file.path.endsWith('/wunsch.json'));
  const data=JSON.parse(json.content);
  assert.equal(data.kind,'avatar');assert.equal(data.recipient,'Projektleitung');
  assert.equal(data.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image').value.startsWith('bilder/'),true);
  const image=packet.files.find(file=>file.encoding==='base64');
  assert.equal(image.content,PNG.split(',')[1]);assert.match(image.path,/^wuensche\/projekt-1\/[^/]+\/bilder\/[^/]+\.png$/);
  assert.equal(packet.requests[0].referenceImageCount,1);
  assert.match(packet.files.find(file=>file.path.includes(request.id)&&file.path.endsWith('README.md')).content,/Bitte Mantel und Frisur/);
  assert.ok(!json.content.includes('data:image'));assert.ok(!JSON.stringify(packet).includes('Darf nicht'));
  assert.ok(!JSON.stringify(packet).includes('"submission"'));assert.equal(Object.hasOwn(data,'x'),false);
  assert.deepEqual(request.pages,before.pages);
});

test('Markdown zeigt fremden Text ohne HTML oder fremde Bild-/Linkausführung',()=>{
  const request=wish('module-request');
  request.title='<img src="https://example.org/tracker">';
  request.pages[0].blocks.find(block=>block.kind==='text').value='![Bild](https://example.org/tracker) <script>untrusted()</script>';
  const packet=buildRequestPackage({workspaceId:'projekt-1',requests:[request]});
  const markdown=packet.files.find(file=>file.path.includes(request.id)&&file.path.endsWith('README.md')).content;
  assert.ok(markdown.includes('&lt;img'));assert.ok(markdown.includes('\\!\\[Bild\\]\\(https://'));
  assert.ok(!markdown.includes('<script>'));assert.ok(!markdown.includes('![Bild](https://'));
});

test('gleich benannte Bildblöcke auf verschiedenen Seiten erhalten unterschiedliche Dateien',()=>{
  const request=wish();
  const image=request.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image');
  request.pages.push({id:'zweite-seite',title:'Weitere Referenz',blocks:[structuredClone(image)]});
  const packet=buildRequestPackage({workspaceId:'projekt-1',requests:[request]});
  const paths=packet.files.filter(file=>file.encoding==='base64').map(file=>file.path);
  assert.equal(paths.length,2);assert.equal(new Set(paths).size,2);
});

test('mehrdeutige importierte Seiten-/Blockkennungen überschreiben keine Referenzbilder',()=>{
  const request=wish();
  const image=request.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image');
  request.pages[0].id='seite-teil';image.id='bild';
  request.pages.push({id:'seite',title:'Weitere Referenz',blocks:[{...structuredClone(image),id:'teil-bild'}]});
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[request]}),/dieselbe Dateikennung/);
});

test('unfertige Wünsche, fremde Karten und externe oder kaputte Bilder werden vor einer Übergabe abgewiesen',()=>{
  const empty=createModule('avatar-request');
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[empty]}),/Titel|Referenzbild|Beschreibe/);
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[createModule('note')]}),/nur Modul/);
  const avatar=wish();avatar.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image').value='';
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[avatar]}),/Referenzbild/);
  for(const value of ['https://example.org/private.png','data:image/png;base64,AAAA']){
    const request=wish();request.pages.flatMap(page=>page.blocks).find(block=>block.kind==='image').value=value;
    assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[request]}),/Bild|Format|eingebettete/);
  }
});

test('Paketgrenzen und stabile sichere Pfade verhindern stillen Verlust oder Pfadmanipulationen',()=>{
  const request=wish();
  for(const workspaceId of ['../fremd','foo/bar',''])assert.throws(()=>buildRequestPackage({workspaceId,requests:[request]}),/Projektkennung/);
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[request,request]}),/mehrfach/);
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[]}),/Wünschen/);
  const huge=wish('module-request');huge.unrelatedText='x'.repeat(26*1024*1024);
  assert.throws(()=>buildRequestPackage({workspaceId:'projekt-1',requests:[huge]}),/25 MB/);
});

export {PNG,wish};
