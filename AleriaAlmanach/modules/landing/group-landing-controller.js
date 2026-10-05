import { normalizeLandingData } from './landing-model.js';
import { applyGroupPreset } from './group-landing-model.js';
import { groupCharacters, groupScenes, groupMemberSnapshots, groupSceneSnapshot, observeGroupScene } from './group-landing-data.js';
import { renderGroupBody, renderGroupRoster, renderGroupSummary, renderGroupScenePanel, renderGroupHeaderClock } from './group-landing-view.js';
import { createGroupEditor } from './group-landing-editor.js';
import { mountGroupSceneControls, unmountGroupSceneControls } from './group-landing-scene-controls.js';
import { mountGroupNavigation } from './group-landing-navigation.js';
import { renderGroupInventory } from './group-landing-inventory-view.js';
import { mountGroupMap } from './group-landing-map.js';

const mounts = new WeakMap();
const canEdit = () => globalThis.canEditModuleContent?.() === true;
const readonlyActions = new Set(['profile', 'open-scene', 'refresh', 'register', 'hierarchy']);
const charactersEvents = ['aleria:characters-changed', 'aleria:character-saved', 'aleria:combat-profile-committed', 'almanach-world-date-state'];

function sceneSnapshots(group, comments = []) {
  return groupScenes().map(scene => groupSceneSnapshot(scene, scene.threadId === group.threadId ? comments : globalThis.getCachedCommentsForThread?.(scene.threadId) || []));
}

function fragments(data) {
  return { quests: globalThis.buildLandingQuests?.(data) || '', notes: globalThis.buildLandingNotes?.(data) || '',
    events: data.events.length ? globalThis.buildLandingEvents?.(data) || '' : '',
    map: data.mapKartenId || data.mapImage || data.mapLink ? globalThis.buildLandingMap?.(data) || '' : '',
    info: data.info.length ? globalThis.buildLandingInfo?.(data) || '' : '', configure: globalThis.buildLandingConfigureButton?.() || '' };
}

function renderBody(data, entry, pageIndex) {
  const members = groupMemberSnapshots(entry, data.group);
  const scenes = sceneSnapshots(data.group);
  const active = scenes.find(scene => scene.threadId === data.group.threadId);
  // Supply current hierarchy names to task owners and note author selection.
  const displayData = { ...data, members };
  return renderGroupBody(data, entry, pageIndex, members, scenes, active, fragments(displayData));
}

function mount(context) {
  const root = context.root?.matches?.('.group-landing') ? context.root : context.root?.querySelector?.('.group-landing');
  if (!root) return;
  unmount(context);
  const { entry, page, preview } = context;
  const data = normalizeLandingData(page.landing);
  const group = data.group;
  const abort = new AbortController();
  let comments = [], members = [], scenes = [], connection = group.threadId ? 'Szenenstand wird geladen …' : 'Noch keine Sitzung ausgewählt.';
  let stopScene = null, stopped = false;
  const regionContent = new Map();
  const editor = createGroupEditor({ onSave: save });
  const stopNavigation = mountGroupNavigation(root, context.root, `${entry.id}:${context.pageIndex}`);
  const stopMap = mountGroupMap(root);

  function save(next) {
    if (preview || !canEdit()) throw new Error('Bitte zuerst die Bearbeitung freischalten.');
    if (globalThis.replaceGroupLandingData?.(root, entry.id, next) !== true) throw new Error('Die Gruppenseite ist nicht mehr geöffnet.');
  }
  function setRegion(name, content) {
    const target = root.querySelector(`[data-group-region="${name}"]`);
    if (target && regionContent.get(name) !== content) { target.innerHTML = content; regionContent.set(name, content); }
  }
  function refresh() {
    if (stopped) return;
    members = groupMemberSnapshots(entry, group, comments);
    scenes = sceneSnapshots(group, comments);
    setRegion('summary', renderGroupSummary(members));
    setRegion('roster', renderGroupRoster(members));
    setRegion('inventory', renderGroupInventory(group, members));
    const active = scenes.find(scene => scene.threadId === group.threadId);
    setRegion('scene', renderGroupScenePanel(group, scenes, active, connection));
    setRegion('clock', renderGroupHeaderClock(active));
    root.querySelectorAll('[data-group-action]').forEach(button => {
      button.hidden = button.hasAttribute('data-group-edit-entry') ? !!preview : (preview || !canEdit()) && !readonlyActions.has(button.dataset.groupAction);
    });
    root.querySelectorAll('[data-group-field="preset"], .landing-config-button, [data-landing-action="edit-settings"], [data-landing-action="edit-quest"], [data-landing-action="edit-note"], .landing-menu-toggle').forEach(element => { element.hidden = preview || !canEdit(); });
  }
  function connect() {
    stopScene?.(); stopScene = null;
    if (preview || !group.threadId) return;
    stopScene = observeGroupScene(group.threadId, (next, mode) => {
      comments = next;
      connection = mode === 'cached' ? 'Zuletzt geladener Szenenstand · Verbindung wird hergestellt …' : mode === 'live' ? 'Mit der aktiven Sitzung verbunden' : 'Szenenstand geladen';
      refresh();
    }, () => { connection = 'Szenenverbindung unterbrochen · letzter verfügbarer Stand'; refresh(); });
  }
  function editContext(memberId = '', itemId = '') {
    return { data, members, characters: groupCharacters(), scenes, memberId, itemId, maps: globalThis.KartoMapRegistry?.all?.() || [],
      makeId: prefix => `${prefix}-${crypto.randomUUID()}`,
      dateLabel: globalThis.AleriaCalendar?.format(globalThis.AleriaCalendar.current(), { withPlayDay: true }) || '' };
  }
  function handleClick(event) {
    const trigger = event.target.closest?.('[data-group-action]');
    if (!trigger || !root.contains(trigger)) return;
    const action = trigger.dataset.groupAction;
    if (action === 'profile') { globalThis.openCharProfile?.(trigger.dataset.characterId); return; }
    if (action === 'register') { globalThis.AleriaItemRegister?.open?.(trigger.dataset.itemKey || ''); return; }
    if (action === 'hierarchy') {
      const pageIndex = entry.pages.findIndex(page => page.hierarchyPage);
      if (pageIndex >= 0) globalThis.openModal?.(entry, { pageIndex });
      return;
    }
    if (action === 'open-scene') {
      const scene = groupScenes().find(item => item.threadId === trigger.dataset.threadId);
      const target = globalThis.getAllSections?.().flatMap(section => section.entries || []).find(item => item.id === scene?.entryId);
      if (scene && target) globalThis.openModal?.(target, { pageIndex: scene.pageIndex });
      return;
    }
    if (action === 'refresh') { connect(); return; }
    if (preview) return;
    if (trigger.hasAttribute('data-group-edit-entry') && !canEdit()) {
      globalThis.requestModuleEditorAccess?.(() => { if (!stopped) editor.open('settings', editContext()); });
      return;
    }
    if (!canEdit()) return;
    try {
      const presetId = root.querySelector('[data-group-field="preset"]')?.value;
      if (action === 'apply-preset') {
        if (!presetId) return;
        save({ ...data, group: applyGroupPreset(group, presetId, members.filter(member => member.source === 'hierarchy').map(member => member.id)) });
      } else if (action === 'delete-preset') {
        if (presetId) save({ ...data, group: { ...group, presets: group.presets.filter(preset => preset.id !== presetId) } });
      } else editor.open(action, editContext(trigger.dataset.memberId, trigger.dataset.itemId));
    } catch (error) { setRegion('error', ''); root.querySelector('[data-group-region="error"]').textContent = error.message; }
  }
  root.addEventListener('click', handleClick, { signal: abort.signal });
  root.addEventListener('aleria:group-edit-request', event => {
    if (!preview && canEdit()) editor.open(event.detail.kind, editContext());
  }, { signal: abort.signal });
  root.addEventListener('error', event => {
    const target = event.target;
    if (target.tagName !== 'IMG' || !target.matches('.group-member-portrait, .group-crest')) return;
    const fallback = document.createElement('span');
    fallback.className = `${target.className} group-initial`;
    fallback.textContent = target.alt?.slice(0, 1) || '·';
    fallback.setAttribute('aria-label', target.alt || 'Portrait nicht verfügbar');
    target.replaceWith(fallback);
  }, { capture: true, signal: abort.signal });
  for (const name of charactersEvents) document.addEventListener(name, refresh, { signal: abort.signal });
  globalThis.addEventListener('aleria:auth-state-changed', refresh, { signal: abort.signal });
  globalThis.addEventListener('aleria:module-editor-access-changed', refresh, { signal: abort.signal });
  globalThis.addEventListener('fb-ready', refresh, { signal: abort.signal });
  globalThis.addEventListener('item-db-store-updated', refresh, { signal: abort.signal });
  document.addEventListener('aleria:comments-updated', event => {
    if (event.detail?.threadId !== group.threadId || !Array.isArray(event.detail.comments)) return;
    comments = event.detail.comments; refresh();
  }, { signal: abort.signal });
  mounts.set(context.root, { destroy() { stopped = true; abort.abort(); stopScene?.(); stopNavigation(); stopMap(); editor.close(); } });
  refresh(); connect();
}

function unmount({ root }) { mounts.get(root)?.destroy(); mounts.delete(root); }

// The classic template registry needs only this small lifecycle bridge.
globalThis.AleriaGroupLanding = Object.freeze({ renderBody, mount, unmount, mountScene: mountGroupSceneControls, unmountScene: unmountGroupSceneControls,
  edit(element, kind = 'select') { element?.dispatchEvent(new CustomEvent('aleria:group-edit-request', { detail: { kind } })); } });
