import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { charactersFromRecords } from '../assets/js/media/notice-character-catalog.mjs';

function feature() {
  const events = [];
  const context = vm.createContext({
    window: { dispatchEvent: event => events.push(event.type), setTimeout, _fb: {saveAll: async () => true} },
    document: { baseURI: 'https://aleria.test/Anzeigetafeln/tafel.html' }, URL, URLSearchParams,
    setTimeout, clearTimeout, CustomEvent: class { constructor(type) { this.type = type; } },
  });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  context.window.TafelRuntime = { esc, state: () => ({zettel:[]}) };
  context.window.TafelZettelRichText = { renderHtml: value => String(value || '') };
  for (const file of ['media/notice-media-model.js', 'notes/zettel-config.js', 'notes/zettel-document-views.js', 'notes/zettel-scroll-views.js', 'core/tafel-state.js']) {
    vm.runInContext(readFileSync(new URL(`../assets/js/${file}`, import.meta.url), 'utf8'), context);
  }
  return { ...context.window, events };
}

test('all nine templates render entered facts, text and six media slots without changing the saved notice', () => {
  const app = feature();
  assert.equal(app.ZETTEL_TYPES.length, 9);
  for (const type of app.ZETTEL_TYPES) {
    const notice = app.TafelZettelConfig.createDraft(type.id, {x:.3,y:.5}, () => 'notice');
    notice.text = '<p>Ein vorhandener Text</p>';
    notice.table = [{k:'Ort',v:'Ein entlegener Hof'}];
    notice.artikel = [{titel:'Aktuelle Nachrichten', text:notice.text}];
    notice.personen = [];
    for (const field of ['bild','portrait','verfasser','emblem','siegel','unterschrift']) notice[field] = `https://images.test/${field}.png`;
    const before = JSON.stringify(notice);
    const html = app.TafelZettelViews.renderByType(notice);
    assert.match(html, /Ein vorhandener Text/, type.id);
    assert.match(html, /Ein entlegener Hof/, type.id);
    for (const field of ['bild','portrait','verfasser','emblem','siegel','unterschrift']) assert.ok(html.includes(`https://images.test/${field}.png`), `${type.id}: ${field}`);
    assert.equal(JSON.stringify(notice), before, type.id);
  }
});

test('empty facts do not create empty rows; star values are bounded and labels escaped', () => {
  const {TafelZettelDocuments: docs} = feature();
  assert.equal(docs.facts([{k:'Datum',v:''}]), '');
  const html = docs.facts([{k:'<script>', v:'900', type:'stars'},{k:'<img>',v:'<unsafe>'}]);
  assert.match(html, /5 von 5/);
  assert.match(html, /&lt;unsafe&gt;/);
  assert.doesNotMatch(html, /<script>|<img>/);
});

test('media sources normalize Imgur single links and reject executable URLs and albums', () => {
  const {TafelNoticeMediaModel: media} = feature();
  assert.equal(media.imageUrl('https://imgur.com/Abc123'), 'https://i.imgur.com/Abc123.png');
  assert.equal(media.imageUrl('https://imgur.com/a/Abc123'), '');
  assert.equal(media.imageUrl('javascript:alert(1)'), '');
  assert.equal(media.imageUrl('data:text/html,test'), '');
  assert.equal(media.imageUrl('../IconOrdner/Feder.PNG'), '../IconOrdner/Feder.PNG');
});

test('character references persist with their picture, detach when replaced, and reconstruct local links', () => {
  const {TafelNoticeMediaModel: media} = feature();
  const notice = {};
  media.apply(notice, 'portrait', {kind:'character',src:'https://images.test/gais.png',name:'Gais',familyId:'haus-wyrm',personId:'gais',href:'javascript:bad()'});
  const saved = JSON.parse(JSON.stringify(notice));
  assert.match(media.render(saved, 'portrait'), /Stammb%C3%A4ume\/Stammbaum.html\?family=haus-wyrm&amp;mode=view&amp;person=gais/);
  assert.doesNotMatch(media.render(saved, 'portrait'), /javascript:/);
  saved.portrait = 'https://images.test/other.png';
  assert.doesNotMatch(media.render(saved, 'portrait'), /href=/);
  media.apply(notice, 'portrait', {kind:'upload',src:'data:image/webp;base64,YQ==',name:'Bild'});
  assert.equal(JSON.stringify(notice).match(/data:image/g).length, 1, 'uploaded data stored only once');
  assert.doesNotMatch(media.render(notice, 'portrait'), /href=/);
  media.apply(notice, 'portrait', null);
  assert.doesNotMatch(media.render(notice, 'portrait'), /<img|href=/);
});

test('characters without portraits still receive a person link and a placeholder', () => {
  const {TafelNoticeMediaModel: media} = feature();
  const notice = {};
  media.apply(notice, 'portrait', {kind:'character',src:'',name:'Efa',familyId:'morddyn',personId:'efa'});
  const html = media.render(notice, 'portrait');
  assert.match(html, /person=efa/);
  assert.match(html, /notice-media-placeholder/);
  assert.doesNotMatch(html, /<img/);
});

test('family selection is alphabetical, deduplicates world identities and resolves tree-relative portraits', () => {
  const records = [{id:'first',title:'Haus Test',family:{houses:[{id:'test',name:'Haus Test'}],persons:[
    {id:'z',worldPersonId:'same',name:'Zeno',houseId:'test',portrait:''},
    {id:'a',name:'Anna',portrait:'assets/images/anna.png'},
  ]}}, {id:'second',title:'Weitere Familie',family:{persons:[{id:'z2',worldPersonId:'same',name:'Zeno Test',portrait:'assets/images/zeno.png'}]}}];
  const items = charactersFromRecords(records);
  assert.deepEqual(items.map(item => item.name), ['Anna','Zeno Test']);
  assert.match(items[0].src, /Stammb%C3%A4ume\/assets\/images\/anna.png/);
  assert.equal(items[1].familyId, 'second');
});

test('media metadata and comments survive state normalization and JSON roundtrip', () => {
  const {TafelState: state, TafelNoticeMediaModel: media} = feature();
  const notice = {id:'legacy',x:.2,y:.4,typ:'notiz',text:'Alter Text',comments:[{id:'c1',text:'Bestehender Kommentar'}]};
  media.apply(notice, 'siegel', {kind:'icon',src:'../IconOrdner/Feder.PNG',name:'Feder'});
  state.apply({zettel:[notice]});
  const exported = state.snapshot();
  state.apply(JSON.parse(JSON.stringify(exported)));
  assert.equal(JSON.stringify(state.snapshot()), JSON.stringify(exported));
  assert.equal(state.get().zettel[0].comments[0].text, 'Bestehender Kommentar');
});

test('a failed storage write never emits a successful save event', async () => {
  const app = feature();
  app._fb.saveAll = async () => false;
  assert.equal(await app.TafelState.saveNow(), false);
  assert.deepEqual(app.events, []);
  app._fb.saveAll = async () => true;
  assert.equal(await app.TafelState.saveNow(), true);
  assert.deepEqual(app.events, ['aleria:tafel:state-saved']);
});
