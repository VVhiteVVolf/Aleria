import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
function runtime() {
  const context = vm.createContext({ console, document:{addEventListener(){}}, addEventListener(){},
    localStorage:{getItem(){return null;}}, sanitizeAleriaDate:value=>value||{}, escapeHtml:value=>String(value||''),
    sanitizeModulePageImagePosition:()=>'', sanitizeModuleCastDetails:()=>[],
    sanitizeImageSrc:value=>String(value||''), sanitizeContentHtml:value=>String(value||''),
    buildTextFormatToolbar:()=>'', inferModulePageType:()=> 'session', buildAleriaDateField:()=>'',
    normalizeSessionStatusParticipants:value=>Array.isArray(value)?value:[],
    getTrimmedFormValue:(card,selector)=>card.querySelector(selector)?.value||'', collectAleriaDateFromBlock:()=>({}),
    buildNav:()=>'', isSessionFocusModeEnabled:()=>false, getPageCommentThreadKey:()=> 'scene', getSessionThreadId:()=> 'fixture-scene',
    buildSceneClockControl:()=>'', buildSceneInventoryControl:()=>'', buildSceneDiceControl:()=>'', buildSessionStatusControl:()=>'',
    buildCommentViewControls:()=>'', buildCommentQuickTools:()=>'', buildCommentTurnBar:()=>''
  }); context.window=context;
  for (const path of ['core/app-core.js','module-editor/module-editor-session.js','comments/comments-page.js']) vm.runInContext(read('AleriaAlmanach/modules/'+path),context);
  return context;
}
test('bestehende und neue Szenen aktivieren experimentelle Sprechblasen nur bei ausdrücklichem true',()=>{
  const c=runtime();
  for(const flag of [undefined,false,'true',1,true]) {
    const page={sessionPage:true,sessionAnimatedBubbles:flag,sessionIntro:'Bleibt erhalten',pageTitle:'Test'};
    const before=JSON.stringify(page),clean=c.sanitizeModulePage(page);
    assert.equal(clean.sessionAnimatedBubbles===true,flag===true);
    assert.equal(clean.sessionIntro,page.sessionIntro);assert.equal(JSON.stringify(page),before);
    const html=c.buildSessionPage(clean,{id:'test',title:'Test'},0,1);
    assert.equal(html.includes('data-animated-bubbles="true"'),flag===true);
    assert.doesNotMatch(html,/<details class="session-intro" open/);
  }
});
test('Szeneneditor zeigt den Haken standardmäßig leer und speichert bewusstes Ein- und Ausschalten',()=>{
  const c=runtime();
  assert.doesNotMatch(c.buildSessionModuleEditorFields({}),/animated-bubbles" checked/);
  assert.match(c.buildSessionModuleEditorFields({sessionAnimatedBubbles:true}),/animated-bubbles" checked/);
  for(const checked of [true,false]) {
    const page=c.collectSessionModuleEditorPage({querySelector:selector=>selector==='.me-page-session-animated-bubbles'?{checked}:{value:''}},{});
    assert.equal(page.sessionAnimatedBubbles,checked);
    assert.equal(c.sanitizeModulePage(page).sessionAnimatedBubbles===true,checked);
  }
});
test('Inline-Szenenbearbeitung übernimmt den Haken als Boolean und behält andere Seitenfelder',()=>{
  const c=runtime(),page={sessionPage:true,sessionIntro:'Erhalten'};let refreshes=0;
  Object.assign(c,{getInlineDraftPage:()=>page,getInlineDraftPageForSource:()=>page,renderPage:()=>refreshes++,currentPage:0});
  vm.runInContext(read('AleriaAlmanach/modules/inline-editor/inline-module-editor.js'),c);
  for(const checked of [true,false]){c.syncInlinePageField({dataset:{pageField:'sessionAnimatedBubbles'},checked,value:'on'});assert.equal(page.sessionAnimatedBubbles,checked);}
  assert.equal(page.sessionIntro,'Erhalten');assert.equal(refreshes,2);
});
test('sechs Rahmen sind transparente bytegleiche Generatororiginale mit gebundenem Manifest',()=>{
  const manifest=JSON.parse(read('AleriaAlmanach/assets/speech-frame-lab/manifest.json'));
  assert.equal(manifest.frames.length,6);
  for(const item of manifest.frames){const bytes=readFileSync(new URL(item.path,root)),source=readFileSync(new URL(item.sourcePath,root));
    assert(bytes.equals(source));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.equal(bytes.readUInt32BE(16),2172);assert.equal(bytes.readUInt32BE(20),724);assert.equal(bytes[25],6);
  }
});
