import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as model from '../modules/landing/landing-classic-api.js';
import { groupEditorBody, collectGroupEdit } from '../modules/landing/group-landing-editor.js';

const { normalizeLandingData, createLandingPage, migrateGroupLandingEntry } = model;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function editorContext() {
  const context = vm.createContext({ AleriaLandingModel: model, document: { addEventListener() {} },
    sanitizeAleriaDate: value => value || {}, escapeHtml: escape, getRomanPageLabel: () => 'I', inferModulePageType: () => 'landing',
    getTrimmedFormValue: (scope, selector) => String(scope.querySelector(selector)?.value ?? '').trim(),
    collectAleriaDateFromBlock: () => ({}) });
  context.window = context;
  for (const file of ['../modules/module-editor/module-editor-landing.js','../modules/landing/landing-renderer.js']) {
    vm.runInContext(readFileSync(new URL(file,import.meta.url),'utf8'),context,{filename:file});
  }
  return context;
}
const editorRoot = (base, fields = {}) => ({ dataset: { landingBase: JSON.stringify(base) }, querySelector: selector =>
  Object.hasOwn(fields,selector) ? { value: fields[selector] } : null, querySelectorAll: () => [] });

test('old landing pages keep classic presentation and their original banner through repeated JSON round trips', () => {
  const legacy = { title:'Alte Mannschaft',bannerImage:'/original-crest.png',members:[{id:'one',name:'Bote'}],
    group:{threadId:'crew::session:one',treasury:{openingCopper:37}},questJournal:{runIds:['run-one']} };
  const original = structuredClone(legacy), normalized = normalizeLandingData(legacy);
  assert.equal(normalized.presentation,'classic');assert.equal(normalized.coverImage,'');
  assert.equal(normalized.bannerImage,legacy.bannerImage);
  assert.deepEqual(normalizeLandingData(JSON.parse(JSON.stringify(normalized))),normalized);
  assert.deepEqual(legacy,original);
  assert.equal(normalizeLandingData({presentation:'unknown'}).presentation,'classic');
});

test('new normal and group overviews choose folio while existing landing pages remain classic on group conversion', () => {
  assert.equal(createLandingPage().landing.presentation,'folio');
  assert.equal(editorContext().createDefaultLandingPage(0).landing.presentation,'folio');
  const hierarchy = {hierarchyPage:true,hierarchy:{levels:[]}};
  const entry = {id:'crew',title:'Neue Gruppe',symbol:'/group-crest.png',pages:[hierarchy]};
  const fresh = migrateGroupLandingEntry(entry,{tab:'Gruppen'}).pages.find(page=>page.landingPage).landing;
  assert.equal(fresh.presentation,'folio');assert.equal(fresh.coverImage,'');assert.equal(fresh.bannerImage,entry.symbol);
  const existing = {...entry,pages:[hierarchy,{landingPage:true,landing:{title:'Bestehende Seite',bannerImage:'/old-crest.png'}}]};
  const converted = migrateGroupLandingEntry(existing,{tab:'Gruppen'}).pages.find(page=>page.landingPage).landing;
  assert.equal(converted.presentation,'classic');assert.equal(converted.bannerImage,'/old-crest.png');
});

test('full module and page settings editors save presentation and independent cover image, and preserve omitted fields', () => {
  const context = editorContext();
  const base = normalizeLandingData({presentation:'folio',coverImage:'/wide-cover.png',bannerImage:'/round-crest.png',
    group:{threadId:'crew::session:one',treasury:{openingCopper:37}},questJournal:{runIds:['run-one']}});
  const cases = [
    ['collectLandingDataFromBlock','.me-landing-presentation','.me-landing-coverImage','.me-landing-bannerImage'],
    ['collectLandingSettingsData','[data-landing-settings-field="presentation"]','[data-landing-settings-field="coverImage"]','[data-landing-settings-field="bannerImage"]']
  ];
  for (const [collector,presentation,cover,banner] of cases) {
    const preserved = context[collector](editorRoot(base,{[banner]:base.bannerImage}));
    assert.equal(preserved.presentation,'folio');assert.equal(preserved.coverImage,base.coverImage);
    assert.equal(preserved.bannerImage,base.bannerImage);assert.deepEqual(JSON.parse(JSON.stringify(preserved.group)),base.group);
    const changed = context[collector](editorRoot(base,{[presentation]:'classic',[cover]:'  /other-cover.png  ',[banner]:base.bannerImage}));
    assert.equal(changed.presentation,'classic');assert.equal(changed.coverImage,'/other-cover.png');assert.equal(changed.bannerImage,base.bannerImage);
    assert.equal(context[collector](editorRoot(base,{[cover]:'',[banner]:base.bannerImage})).coverImage,'');
  }
  for (const markup of [context.buildLandingModuleEditorFields({landing:base}),context.buildLandingSettingsBody(base),context.buildInlineLandingEditor({landing:base})]) {
    assert.match(markup,/Abenteuerfolio/);assert.match(markup,/Klassisch/);assert.match(markup,/coverImage/);
  }
  const draft = {landing:base};context.getInlineDraftPageForSource = () => draft;
  context.updateInlineLandingField({dataset:{landingField:'title'},value:'Neue Beschreibung'});
  assert.equal(draft.landing.presentation,'folio');assert.equal(draft.landing.coverImage,base.coverImage);assert.equal(draft.landing.bannerImage,base.bannerImage);
});

test('group settings preserve live group references and treat cover and crest as separate editable images', () => {
  const data = normalizeLandingData({presentation:'folio',coverImage:'/group-cover.png',bannerImage:'/group-crest.png',
    group:{threadId:'crew::session:one',treasury:{openingCopper:37}},questJournal:{runIds:['run-one']}});
  const context = {data,members:[],characters:[],scenes:[]};
  const markup = groupEditorBody('settings',context);
  assert.match(markup,/<option value="folio" selected>Abenteuerfolio/);assert.match(markup,/name="coverImage"/);assert.match(markup,/name="bannerImage"/);
  const previous = globalThis.FormData;
  globalThis.FormData = class {
    constructor(form) { this.values=form.values; }
    get(name) { return this.values[name] ?? null; }
    has(name) { return Object.hasOwn(this.values,name); }
  };
  try {
    const fields = Object.fromEntries(['title','subtitle','bannerImage','memberTitle','questTitle','notesTitle','eventsTitle','mapTitle','infoTitle'].map(key=>[key,data[key]]));
    const preserved = collectGroupEdit('settings',{values:fields},context);
    assert.equal(preserved.presentation,'folio');assert.equal(preserved.coverImage,data.coverImage);
    const next = normalizeLandingData(collectGroupEdit('settings',{values:{...fields,presentation:'classic',coverImage:'/changed-cover.png'}},context));
    assert.equal(next.presentation,'classic');assert.equal(next.coverImage,'/changed-cover.png');assert.equal(next.bannerImage,data.bannerImage);
    assert.equal(next.group.threadId,data.group.threadId);assert.deepEqual(next.group.treasury,data.group.treasury);assert.deepEqual(next.questJournal,data.questJournal);
  } finally { globalThis.FormData = previous; }
});
