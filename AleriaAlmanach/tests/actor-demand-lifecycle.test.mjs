import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = path => readFileSync(new URL(`../modules/${path}`, import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function elementsFixture() {
  const elements = new Map();
  const make = () => ({ value: '', style: {}, dataset: {}, disabled: false, hidden: false, inert: false,
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    setAttribute() {}, removeAttribute() {}, replaceChildren() {}, focus() {}, querySelectorAll: () => [], querySelector: () => null });
  const get = id => { if (!elements.has(id)) elements.set(id, make()); return elements.get(id); };
  return { elements, get, make, document: { getElementById: get, createElement: make, querySelector: () => make(), querySelectorAll: () => [] } };
}
function composeFixture() {
  const dom = elementsFixture(), demands = [], restorations = [], saves = [];
  const overlay = dom.get('comment-form-overlay'), layout = dom.make(), modes = dom.make(); let loadingNode, open = false, threadId = 'scene:one';
  overlay.querySelectorAll = () => [layout, modes];
  overlay.querySelector = selector => selector === '.comment-compose-layout' ? layout : loadingNode || null;
  layout.before = node => { loadingNode = node; };
  const context = vm.createContext({ ...dom, console, CHARACTER_IMAGE_SET_DEFAULT_ID: 'default',
    SCENE_TIME_DEFAULT_SEGMENT_SECONDS: 20, COMMENT_LANGUAGE_DEFAULT: 'common',
    requestAnimationFrame: callback => callback(), setTimeout: callback => callback(),
    getCurrentCommentThread: () => ({ formTitle: 'Scene' }), getCurrentCommentThreadId: () => threadId,
    loadSceneActorData() { const demand = deferred(); demands.push(demand); return demand.promise.then(() => { context.actorsReady = true; }); },
    isCommentFormOpen: () => open, activateDialog() { open = true; }, deactivateDialog() { open = false; },
    makeCommentSegment: (kind, text = '', ...rest) => ({ kind, text, mechanicMode: rest.at(-1)?.mechanicMode || 'normal' }),
    setRichEditorContent(id, value) { dom.get(id).value = value; }, setCommentPlayerFilter() {},
    showCommentDraftNote(message) { dom.get('cf-draft-note').textContent = message; },
    setCommentMode(mode) { context._commentMode = mode; }, setCommentKind() {}, setCommentFormCounter() {},
    renderCharPickerInForm() {}, renderCommentSegmentList() {}, updateCommentFormPreview() {},
    restoreCommentDraft() {
      assert.equal(context.actorsReady, true, 'saved actor lookup must happen after repository readiness');
      restorations.push(threadId); context._selectedCharId = 'database-actor'; context._selectedEmoteIdx = 3;
      context._commentSegments = [{ kind: 'speech', text: 'Saved draft', imageSetId: 'saved-image-set', mechanicMode: 'normal' }];
    }, persistCommentDraft() { saves.push(context._commentSegments.map(segment => ({ ...segment }))); },
    AleriaSkillChecks: { getChallengeAttemptSettings: () => ({ kind: 'interact', skillId: 'insight' }) }
  });
  context.window = context;
  vm.runInContext(source('comments/comments-form.js'), context);
  return { context, dom, demands, restorations, saves, layout, setThread: value => { threadId = value; }, isOpen: () => open };
}

test('comment dialog restores saved actor, emote and text only after actor demand completes', async () => {
  const { context, dom, demands, restorations, layout } = composeFixture();
  const pending = context.openCommentForm();
  assert.equal(restorations.length, 0); assert.equal(layout.inert, true); assert.equal(dom.get('cf-submit').disabled, true);
  demands[0].resolve(); assert.equal(await pending, true);
  assert.deepEqual(restorations, ['scene:one']); assert.equal(context._selectedCharId, 'database-actor');
  assert.equal(context._selectedEmoteIdx, 3); assert.equal(context._commentSegments[0].text, 'Saved draft');
  assert.equal(layout.inert, false); assert.equal(dom.get('cf-submit').disabled, false);
});

test('closed or superseded comment opening cannot restore over a newer dialog', async () => {
  const { context, demands, restorations } = composeFixture();
  const first = context.openCommentForm(); context.closeCommentForm();
  const second = context.openCommentForm();
  demands[0].resolve(); assert.equal(await first, false); assert.equal(restorations.length, 0);
  demands[1].resolve(); assert.equal(await second, true); assert.equal(restorations.length, 1);
});

test('thread changes and actor-load errors never hydrate a draft into the wrong scene', async () => {
  const first = composeFixture(), pending = first.context.openCommentForm();
  first.setThread('scene:two'); first.demands[0].resolve(); assert.equal(await pending, false); assert.equal(first.restorations.length, 0);
  const failed = composeFixture(), failing = failed.context.openCommentForm();
  failed.demands[0].reject(Error('Actor repository unavailable')); assert.equal(await failing, false);
  assert.equal(failed.dom.get('cf-error').textContent, 'Actor repository unavailable');
  assert.equal(failed.dom.get('cf-submit').disabled, true); assert.equal(failed.restorations.length, 0); assert.equal(failed.saves.length, 0);
});

test('challenge handoff augments the restored draft instead of being overwritten by late hydration', async () => {
  const { context, demands, saves } = composeFixture();
  const pending = context.openCommentFormForSkillChallenge({ id: 'challenge' });
  assert.equal(saves.length, 0); demands[0].resolve(); await pending;
  assert.equal(context._commentSegments.length, 2); assert.equal(context._commentSegments[0].text, 'Saved draft');
  assert.equal(context._commentSegments[0].imageSetId, 'saved-image-set'); assert.equal(context._commentSegments[1].kind, 'interact');
  assert.equal(saves.length, 1);
});

test('scheduled draft persistence does not erase the saved draft while actors are still loading', () => {
  let ready = true, storageCalls = 0, scheduled;
  const context = vm.createContext({ console, isCommentFormOpen: () => true, isCommentFormActorsReady: () => ready,
    setTimeout: callback => { scheduled = callback; return 1; }, clearTimeout() {}, _commentDraftTimer: null,
    getCommentDraftKey: () => { storageCalls++; return 'key'; },
    localStorage: { removeItem() { storageCalls++; }, setItem() { storageCalls++; } } }); context.window = context;
  vm.runInContext(source('comments/comments-draft.js'), context);
  context.persistCommentDraft(); ready = false; scheduled(); context.persistCommentDraft(true);
  assert.equal(storageCalls, 0);
});

function editFixture() {
  const dom = elementsFixture(), demands = [], picks = [];
  const actor = { id: 'stored', name: 'Stored actor', entityType: 'character', portrait: 'portrait' };
  const context = vm.createContext({ ...dom, console, _editTargetId: 'comment:one', _editManualMode: false,
    CHARACTER_IMAGE_SET_DEFAULT_ID: 'default', setTimeout: callback => callback(),
    getCommentBackend: async () => ({ verifyCommentCode: async id => ({ id, characterId: actor.id, charName: actor.name, text: 'Text' }) }),
    loadSceneActorData() { const demand = deferred(); demands.push(demand); return demand.promise.then(() => { context.actorsReady = true; }); },
    getAvailableCommentCharacterById: () => context.actorsReady ? actor : null,
    getAvailableCommentCharacterByName: () => context.actorsReady ? actor : null,
    normalizeImageUrlForStorage: value => value, setRichEditorContent() {}, setEditCommentKind() {},
    makeCommentSegment: (kind, text = '') => ({ kind, text }), setEditMode() {},
    commentActorMatchesComposerMode: () => true, applyCharacterImageSetPresentation: () => ({ selectedImageSetId: 'default' }),
    renderEditCharPicker() { picks.push(context._editSelectedCharId); }, renderEditCommentSegmentList() {},
    applyEditCharacterFilter() {}, setEditFormCounter() {}, updateEditFormPreview() {}, focusRichEditor() {},
    getFriendlyErrorMessage: error => error.message, activateDialog() {}, deactivateDialog() {},
    AleriaCommentSceneCast: { setEditActorsFromSegments() {} } }); context.window = context;
  dom.get('ec-code').value = 'CODE'; vm.runInContext(source('comments/comments-edit.js'), context);
  return { context, dom, demands, picks };
}
test('edit code preselection waits for actors instead of turning a stored actor into manual text', async () => {
  const { context, demands, picks } = editFixture();
  const pending = context.verifyEditCode(); await settle();
  assert.equal(demands.length, 1); assert.equal(picks.length, 0);
  demands[0].resolve(); await pending;
  assert.equal(context._editSelectedCharId, 'stored'); assert.equal(context._editManualMode, false); assert.deepEqual(picks, ['stored']);
});

test('edit close/reopen and late failures cannot populate or show errors in a different comment', async () => {
  const { context, demands, picks, dom } = editFixture();
  const pending = context.verifyEditCode(); await settle(); context.closeEditComment(); context.openEditComment('comment:two');
  demands[0].reject(Error('late failure')); await pending;
  assert.equal(context._editTargetId, 'comment:two'); assert.equal(context._editSelectedCharId, null);
  assert.equal(picks.length, 0, 'an obsolete request cannot render the edit picker');
  assert.equal(dom.get('ec-code-error').style.display, 'none');
});

function inlineFixture() {
  const demand = deferred(), rendered = [], statuses = [];
  const original = { id: 'original' }, payload = { section: { key: 'world', tab: 'World' }, entry: { id: 'edit-target', pages: [{}], sessionCastDetails: [{ id: 'stored', role: 'Original role' }] } };
  const context = vm.createContext({ console, currentEntry: original, currentPage: 0, _activeTab: 'World', _modalRenderToken: 1, _entryOverrides: {},
    document: { body: { style: {} } }, loadSceneActorData: () => demand.promise,
    getPreferredEditorSection: () => ({ key: 'world', tab: 'World', signature: 'World' }),
    createModuleTemplateDraft: () => ({ id: 'new', pages: [{}] }), getSectionPathParts: () => ['world'], ensureModuleNodeForSection: () => 'node',
    buildModuleExportPayload: () => structuredClone(payload), findCustomSectionByEntryId: () => false,
    sanitizeModuleEntry: entry => structuredClone(entry), getPages: entry => entry.pages,
    renderPage(index) { rendered.push({ index, entry: vm.runInContext('_inlineModuleEdit.draft', context) }); context._modalRenderToken++; },
    activateDialog() {}, showAppStatus: (message, tone) => statuses.push({ message, tone }) }); context.window = context;
  vm.runInContext(source('inline-editor/inline-editor-state.js'), context);
  context.setInlineModuleEditCleanBaseline = () => {};
  return { context, demand, rendered, statuses, original };
}
test('inline new and existing editors wait for actors and preserve source cast roles', async () => {
  for (const method of ['openModuleEditorForNew', 'openModuleEditorForEntry']) {
    const { context, demand, rendered } = inlineFixture();
    const pending = context[method]('edit-target'); assert.equal(rendered.length, 0);
    demand.resolve(); assert.equal(await pending, true); assert.equal(rendered.length, 1);
    if (method === 'openModuleEditorForEntry') assert.equal(rendered[0].entry.sessionCastDetails[0].role, 'Original role');
  }
});

test('a newer inline request wins; closing or navigating while waiting cannot reopen stale editing', async () => {
  const first = inlineFixture(), old = first.context.openModuleEditorForNew(), next = first.context.openModuleEditorForEntry('edit-target');
  first.demand.resolve(); assert.equal(await old, false); assert.equal(await next, true); assert.equal(first.rendered.length, 1);
  for (const cancel of [context => context.cancelInlineModuleEdit(), context => { context.currentEntry = null; }, context => { context._activeTab = 'Other'; }]) {
    const current = inlineFixture(), pending = current.context.openModuleEditorForNew(); cancel(current.context);
    current.demand.resolve(); assert.equal(await pending, false); assert.equal(current.rendered.length, 0);
  }
});

test('inline actor-load errors leave source data untouched and report only the active request', async () => {
  const { context, demand, rendered, statuses, original } = inlineFixture(); const pending = context.openModuleEditorForEntry('edit-target');
  demand.reject(Error('Actors unavailable')); assert.equal(await pending, false); assert.equal(context.currentEntry, original);
  assert.equal(rendered.length, 0); assert.deepEqual(statuses, [{ message: 'Actors unavailable', tone: 'error' }]);
});

function genealogyFixture() {
  const dom = elementsFixture(), demands = [], snapshots = [];
  const context = vm.createContext({ ...dom, console, CustomEvent,
    document: { ...dom.document, dispatchEvent() {}, addEventListener() {} },
    normalizeCharacterGenealogy() {}, normalizeCharacterIdentity() {}, findBestCharacterMatch() {}, getDefaultCharacterFamilyMemberships() {},
    getAllCharacterRecords: () => context.actorsReady ? [{ id: 'already-existing' }] : [],
    createCharacterMatchResolver(records) { snapshots.push(records.map(record => record.id)); return candidate => records.some(record => record.id === candidate.worldPersonId) ? { kind: 'linked' } : null; },
    loadSceneActorData() { const demand = deferred(); demands.push(demand); return demand.promise.then(() => { context.actorsReady = true; }); },
    listGenealogyFamilies: () => [{ id: 'family', family: {} }], loadGenealogyFamily: record => record,
    createFamilyCandidates: () => [{ familyId: 'family', worldPersonId: 'already-existing' }],
    deduplicateGenealogyCandidates: candidates => candidates, filterGenealogyCandidates: candidates => candidates,
    getGenealogyCandidateKey: candidate => candidate.worldPersonId,
    refreshGenealogyRegistry: async () => null, activateDialog() {}, deactivateDialog() {} }); context.window = context;
  vm.runInContext(source('character-genealogy/genealogy-import-controller.js').replace(/import[\s\S]*?from\s+['"][^'"]+['"];\s*/g, '').replace(/^export\s+/gm, ''), context);
  context.ensureDialog = () => dom.get('genealogy'); context.getDialogRole = role => dom.get(role);
  context.render = () => {}; context.renderFamilyOptions = () => {}; context.waitForDialogPaint = async () => {};
  context.refreshSelectedCandidateFamily = () => {};
  return { context, demands, snapshots, read: expression => vm.runInContext(expression, context) };
}

test('genealogy duplicate matching snapshots real existing actors after readiness', async () => {
  const { context, demands, snapshots, read } = genealogyFixture();
  const pending = context.openImportDialog(); assert.equal(snapshots.length, 0);
  demands[0].resolve(); await pending;
  assert.deepEqual(snapshots, [['already-existing']]);
  assert.equal(read("state.matchResolver({worldPersonId:'already-existing'}).kind"), 'linked');
  assert.equal(read('state.loading'), false);
});

test('genealogy close/reopen invalidates older actor demands and failed matching exposes no stale candidates', async () => {
  const first = genealogyFixture(), old = first.context.openImportDialog(); first.context.closeImportDialog();
  const next = first.context.openImportDialog(); first.demands[0].resolve(); await old;
  assert.equal(first.snapshots.length, 0); first.demands[1].resolve(); await next; assert.equal(first.snapshots.length, 1);
  const failed = genealogyFixture(), pending = failed.context.openImportDialog();
  failed.demands[0].reject(Error('Existing actors unavailable')); await pending;
  assert.equal(failed.read('state.error'), 'Existing actors unavailable');
  assert.equal(failed.read('state.candidates.length'), 0); assert.equal(failed.snapshots.length, 0);
});

function speakerFixture() {
  const dom = elementsFixture(), demands = [], displayed = [], actor = { id: 'stored', name: 'Stored actor' };
  let thread = 'scene:one';
  const choice = dom.get('speaker-profile-choice-overlay'), mini = dom.get('speaker-profile-overlay');
  for (const overlay of [choice, mini]) {
    let active = false;
    overlay.classList = { add() { active = true; }, remove() { active = false; }, contains: () => active };
  }
  const actions = ['close', 'mini', 'full', 'inventory'].map(action => ({ dataset: { speakerChoiceAction: action }, disabled: false }));
  const fields = new Map(); choice.querySelector = selector => { if (!fields.has(selector)) fields.set(selector, dom.make()); return fields.get(selector); };
  choice.querySelectorAll = () => actions;
  const context = vm.createContext({ ...dom, console, currentEntry: { id: 'entry' },
    document: { ...dom.document, addEventListener() {} },
    getCurrentCommentThreadId: () => thread, getRenderableEntry: entry => entry,
    loadSceneActorData() { const demand = deferred(); demands.push(demand); return demand.promise.then(() => { context.actorsReady = true; }); },
    getCharacterById: () => context.actorsReady ? actor : null,
    resolveSpeakerProfileCharacter: () => { assert.equal(context.actorsReady, true); return actor; },
    loadSpeakerProfileComments: () => context.commentsGate?.promise || Promise.resolve([]),
    buildSpeakerProfileStats: () => ({}), renderSpeakerProfileLoading: name => `loading:${name}`,
    renderSpeakerProfileContent: character => `profile:${character.id}`,
    sanitizeImageSrc: value => value, escapeHtml: value => String(value).replace(/</g, '&lt;'), getInitialChar: value => value[0],
    activateDialog(id) { dom.get(id).classList.add('active'); }, deactivateDialog(id) { dom.get(id).classList.remove('active'); }
  }); context.window = context;
  vm.runInContext(source('speaker-profile/speaker-profile-render.js'), context);
  vm.runInContext(source('speaker-profile/speaker-profile-choice.js'), context);
  vm.runInContext(source('speaker-profile/speaker-profile-events.js'), context);
  context.showSpeakerProfileOverlay = markup => { displayed.push(markup); mini.classList.add('active'); mini.hidden = false; };
  context.renderSpeakerProfileLoading = name => `loading:${name}`; context.renderSpeakerProfileContent = character => `profile:${character.id}`;
  return { context, demands, displayed, actions, fields, choice, mini, setThread: value => { thread = value; },
    trigger: { dataset: { speakerCharacterId: 'stored', speakerName: 'Stored actor' } } };
}

test('portrait choice waits for deferred actor before offering full profile and inventory', async () => {
  const { context, demands, actions, trigger } = speakerFixture(); const pending = context.openSpeakerProfileChoice(trigger);
  assert.ok(actions.filter(action => action.dataset.speakerChoiceAction !== 'close').every(action => action.disabled));
  demands[0].resolve(); assert.equal(await pending, true);
  assert.ok(actions.every(action => !action.disabled));
});

test('closing a pending portrait choice or changing its scene cannot reopen a profile', async () => {
  for (const cancel of [fixture => fixture.context.closeSpeakerProfileChoice(), fixture => fixture.setThread('scene:two'), fixture => fixture.choice.classList.remove('active')]) {
    const fixture = speakerFixture(), pending = fixture.context.openSpeakerProfileChoice(fixture.trigger); cancel(fixture);
    fixture.demands[0].resolve(); assert.equal(await pending, false); assert.equal(fixture.displayed.length, 0);
  }
});

test('mini profile waits for actors and suppresses late comment responses after closing', async () => {
  const fixture = speakerFixture(); fixture.context.commentsGate = deferred();
  const pending = fixture.context.openSpeakerProfileFromTrigger(fixture.trigger);
  assert.equal(fixture.displayed.length, 1); fixture.demands[0].resolve(); await settle();
  fixture.context.closeSpeakerProfileOverlay(); fixture.context.commentsGate.resolve([]);
  assert.equal(await pending, false); assert.equal(fixture.displayed.length, 1);
  assert.equal(fixture.mini.classList.contains('active'), false);
});
