import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const storageKey = 'aleria-comment-bubble-art-enabled-v1';
function runtime({ stored, blockedStorage = false } = {}) {
  const storage = new Map(stored === undefined ? [] : [[storageKey, stored]]);
  const events = {}, scenes = [{ dataset: {} }, { dataset: {} }];
  const toggles = [false, false].map(checked => ({ checked, matches: selector => selector === 'input[data-comment-bubble-toggle]' }));
  const listen = (name, callback) => (events[name] ||= []).push(callback);
  const context = vm.createContext({ console,
    document: { addEventListener: listen, querySelectorAll: selector => selector === '.session-page' ? scenes : toggles },
    addEventListener: listen,
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error('Storage unavailable'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blockedStorage) throw Error('Storage unavailable'); storage.set(key, value); }
    }, sanitizeAleriaDate:value=>value||{}, escapeHtml:value=>String(value||''),
    sanitizeModulePageImagePosition:()=>'', sanitizeModuleCastDetails:()=>[],
    sanitizeImageSrc:value=>String(value||''), sanitizeContentHtml:value=>String(value||''),
    buildTextFormatToolbar:()=>'', inferModulePageType:()=> 'session', buildAleriaDateField:()=>'',
    normalizeSessionStatusParticipants:value=>Array.isArray(value)?value:[],
    getTrimmedFormValue:(card,selector)=>card.querySelector(selector)?.value||'', collectAleriaDateFromBlock:()=>({}),
    buildNav:()=>'', isSessionFocusModeEnabled:()=>false, getPageCommentThreadKey:()=> 'scene', getSessionThreadId:()=> 'fixture-scene',
    buildSceneClockControl:()=>'', buildSceneInventoryControl:()=>'', buildSceneDiceControl:()=>'<button data-dice>Würfel</button>', buildSessionStatusControl:()=>'',
    buildCommentViewControls:()=>'', buildCommentQuickTools:()=>'', buildCommentTurnBar:()=>''
  }); context.window=context;
  for (const path of ['core/app-core.js','module-editor/module-editor-session.js','comments/comment-bubble-preference.js','comments/comments-page.js']) vm.runInContext(read('AleriaAlmanach/modules/'+path),context);
  return { context, events, scenes, toggles, storage, change(checked) {
    toggles[0].checked = checked;
    events.change.forEach(callback => callback({ target: toggles[0] }));
  } };
}
const sceneHtml = context => context.buildSessionPage({ sessionPage: true, pageTitle: 'Test' }, { id: 'test', title: 'Test' }, 0, 1);
test('Szenen starten ohne persönliche Auswahl ausgeschaltet; frühere Modulflags verändern die Ansicht nicht',()=>{
  const { context:c }=runtime();
  for(const flag of [undefined,false,'true',1,true]) {
    const page={sessionPage:true,sessionAnimatedBubbles:flag,sessionIntro:'Bleibt erhalten',pageTitle:'Test'};
    const before=JSON.stringify(page),clean=c.sanitizeModulePage(page);
    assert.equal(clean.sessionAnimatedBubbles===true,flag===true);
    assert.equal(clean.sessionIntro,page.sessionIntro);assert.equal(JSON.stringify(page),before);
    const html=c.buildSessionPage(clean,{id:'test',title:'Test'},0,1);
    assert.match(html,/data-animated-bubbles="false"/);
    assert.match(html,/data-dice[\s\S]*?scene-bubble-preference/);
    assert.doesNotMatch(html,/data-comment-bubble-toggle[^>]* checked/);
    assert.doesNotMatch(html,/<details class="session-intro" open/);
  }
});
test('der direkte Haken schaltet alle sichtbaren und nachfolgende Szenen sofort um und merkt die Wahl',()=>{
  const r=runtime();r.change(true);
  assert(r.scenes.every(scene=>scene.dataset.animatedBubbles==='true'));
  assert(r.toggles.every(toggle=>toggle.checked));assert.equal(r.storage.get(storageKey),'1');
  assert.match(sceneHtml(r.context),/data-animated-bubbles="true"/);
  assert.match(r.context.AleriaCommentBubbles.renderControl(),/ checked/);
  r.change(false);
  assert(r.scenes.every(scene=>scene.dataset.animatedBubbles==='false'));
  assert(r.toggles.every(toggle=>!toggle.checked));assert.equal(r.storage.get(storageKey),'0');
});
test('Neuladen übernimmt nur den ausdrücklich gespeicherten Einschaltwert',()=>{
  for(const stored of [undefined,'0','true','','broken','1']) {
    const r=runtime({stored});
    assert.equal(r.context.AleriaCommentBubbles.isEnabled(),stored==='1');
    assert.equal(sceneHtml(r.context).includes('data-animated-bubbles="true"'),stored==='1');
  }
  const r=runtime();r.change(true);
  assert.equal(runtime({stored:r.storage.get(storageKey)}).context.AleriaCommentBubbles.isEnabled(),true);
});

test('gesperrter Browserspeicher verhindert das Umschalten in der aktuellen Ansicht nicht',()=>{
  const r=runtime({blockedStorage:true});assert.equal(r.context.AleriaCommentBubbles.isEnabled(),false);
  r.change(true);assert.equal(r.context.AleriaCommentBubbles.isEnabled(),true);
  r.change(false);assert.equal(r.context.AleriaCommentBubbles.isEnabled(),false);
});

test('andere Tabs und das Leeren der Einstellungen synchronisieren die Ansicht',()=>{
  const r=runtime(),dispatch=(key,newValue)=>r.events.storage.forEach(callback=>callback({key,newValue}));
  dispatch(storageKey,'1');assert(r.toggles.every(toggle=>toggle.checked));
  dispatch('unrelated','0');assert.equal(r.context.AleriaCommentBubbles.isEnabled(),true);
  dispatch(null,null);assert(r.scenes.every(scene=>scene.dataset.animatedBubbles==='false'));
  assert(r.toggles.every(toggle=>!toggle.checked));assert.equal(r.storage.size,0);
});

test('beide Moduleditoren enthalten keinen Darstellungshaken und behalten gespeicherte Altfelder',()=>{
  const {context:c}=runtime();
  assert.doesNotMatch(c.buildSessionModuleEditorFields({sessionAnimatedBubbles:true}),/animated-bubbles|Animierte Sprechblasen/);
  const page=c.collectSessionModuleEditorPage({querySelector:()=>({value:''})},{sessionAnimatedBubbles:true});
  assert.equal(page.sessionAnimatedBubbles,true);
  assert.doesNotMatch(read('AleriaAlmanach/modules/inline-editor/inline-module-editor.js'),/data-page-field="sessionAnimatedBubbles"/);
});
test('sechs Rahmen sind transparente bytegleiche Generatororiginale mit gebundenem Manifest',()=>{
  const manifest=JSON.parse(read('AleriaAlmanach/assets/speech-frame-lab/manifest.json'));
  assert.equal(manifest.frames.length,6);
  for(const item of manifest.frames){const bytes=readFileSync(new URL(item.path,root)),source=readFileSync(new URL(item.sourcePath,root));
    assert(bytes.equals(source));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.equal(bytes.readUInt32BE(16),2172);assert.equal(bytes.readUInt32BE(20),724);assert.equal(bytes[25],6);
  }
});
