import { getSceneElementType } from './scene-element-model.js';
import { isPublicSceneElementComment } from './scene-element-visibility.js';
import { collectSceneElementParticipants } from './scene-element-conditions.js';
import { sceneElementEscape as escape } from './scene-element-markup.js';
import { collectPublicSceneElements, renderSceneElementRail, renderSceneElementSignal, renderSceneElementSelection } from './scene-element-view.js';
import { collectHerausforderungProgress } from '../herausforderung/herausforderung-progress.js';
import { getSceneElementRailExpanded, saveSceneElementRailExpanded, SCENE_ELEMENT_RAIL_PREFERENCE } from './scene-element-preference.js';

export function createSceneElementsController({ renderChallenge }) {
  let threadId = '', history = [], generation = 0, busy = false, activeId = '', management = [];
  let overlay = null, dialogView = '';
  let pendingInteraction = null;
  let layout = null;
  let railExpanded = getSceneElementRailExpanded();
  function positionRail() {
    if (!layout?.host.isConnected || layout.rail.hidden) return;
    const { host, scroll, rail, dock, accessory } = layout;
    const parent = host.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
    const offset = Math.min(64, Math.max(8, viewport.height * .12));
    const availableHeight = viewport.height - offset - 8;
    const elementControls = rail.querySelector('[data-scene-elements-rail-content]');
    const panelHeight = accessory.hidden ? 0 : Math.ceil(accessory.getBoundingClientRect().height);
    const minimumHeight = accessory.hidden ? 56 : panelHeight + (elementControls.hidden ? 16 : 61);
    const docked = !!dock && availableHeight < minimumHeight;
    const compact = docked || availableHeight < 144;
    if (layout.docked !== docked) {
      layout.docked = docked;
      host.dataset.sceneElementsDocked = String(docked);
      rail.dataset.docked = String(docked);
      (docked ? dock : host).append(rail);
    }
    if (layout.compact !== compact) {
      layout.compact = compact;
      updateRail(rail, host, elements());
    }
    rail.style.top = docked ? '' : `${Math.round(viewport.top - parent.top + offset)}px`;
    rail.style.right = docked ? '' : `${Math.max(4, Math.round(parent.right - viewport.right + 6))}px`;
    rail.style.maxHeight = docked ? '' : `${Math.max(48, Math.floor(availableHeight))}px`;
    // Keep the companion controls visible while only the scene-element list
    // scrolls. A grid with just max-height can still lay out overflowing rows.
    if (docked || accessory.hidden) elementControls.style.maxHeight = '';
    else {
      const style = getComputedStyle(rail);
      const insets = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'rowGap']
        .reduce((total, key) => total + (parseFloat(style[key]) || 0), 0);
      elementControls.style.maxHeight = `${Math.max(0, Math.floor(availableHeight - panelHeight - insets))}px`;
      rail.scrollTop = 0;
    }
    rail.style.visibility = 'visible';
  }
  const resizeObserver = new ResizeObserver(positionRail);
  const status = message => {
    const output = overlay?.querySelector('[data-scene-element-status]');
    if (output) output.textContent = message;
  };
  function ensureDialog() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'scene-elements-overlay'; overlay.className = 'scene-time-event-overlay scene-elements-overlay';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-labelledby', 'scene-elements-title');
    overlay.innerHTML = `<div class="scene-elements-dialog"><header><div><small data-scene-element-subtitle>In dieser Szene</small><h2 id="scene-elements-title">Szenenelement</h2></div><button type="button" data-scene-element-action="close" aria-label="Schließen">×</button></header>
      <div class="scene-elements-content" data-scene-element-content></div><footer><p role="status" aria-live="polite" data-scene-element-status></p><button type="button" class="herausforderung-button" data-scene-element-action="close">Zur Szene</button></footer></div>`;
    document.body.append(overlay);
    return overlay;
  }
  function close() {
    if (busy) return;
    if (overlay) globalThis.deactivateDialog?.('scene-elements-overlay');
    activeId = ''; dialogView = '';
  }
  const elements = () => collectPublicSceneElements(history, collectHerausforderungProgress(history));
  function updateRail(rail, host, available) {
    const compact = layout?.host === host && layout.compact === true;
    host.dataset.sceneElementsExpanded = String(railExpanded && !compact);
    rail.dataset.compact = String(compact);
    rail.dataset.expanded = String(railExpanded);
    rail.dataset.controlsId ||= 'scene-element-rail-' + crypto.randomUUID();
    const html = renderSceneElementRail(available, { expanded: railExpanded, compact, controlsId: rail.dataset.controlsId });
    const content = rail.querySelector('[data-scene-elements-rail-content]');
    if (content.__markup !== html) { content.innerHTML = available.length ? html : ''; content.__markup = html; }
    content.hidden = !available.length;
  }
  function setRailExpanded(value, { persist = true, focus = false } = {}) {
    railExpanded = value === true;
    if (persist) saveSceneElementRailExpanded(railExpanded);
    if (!layout) return;
    updateRail(layout.rail, layout.host, elements());
    if (focus) layout.rail.querySelector('[data-scene-element-action="toggle-rail"]')?.focus({ preventScroll: true });
    requestAnimationFrame(positionRail);
  }
  globalThis.addEventListener('storage', event => {
    if (event.key === SCENE_ELEMENT_RAIL_PREFERENCE || event.key === null) setRailExpanded(getSceneElementRailExpanded(), { persist: false });
  });
  function interactionControls(sourceId) {
    const actors = globalThis.getAvailableCommentCharacters?.() || [];
    const participants = collectSceneElementParticipants(history);
    return `<section class="scene-element-interaction"><h3>Bewusst interagieren</h3><p>Untersuchen, berühren oder benutzen kann eine vorbereitete Reaktion auslösen.</p><label>Handelnde Figur<select data-scene-element-actor><option value="">Figur wählen …</option>${participants.map(actor => `<option value="${escape(actor.actorId)}">${escape(actors.find(candidate => candidate.id === actor.actorId)?.name || actor.actorId)}</option>`).join('')}</select></label>
      <button type="button" class="herausforderung-button primary" data-scene-element-action="interact" data-scene-element-source="${escape(sourceId)}"${participants.length ? '' : ' disabled'}>Jetzt interagieren</button>${participants.length ? '' : '<p>Die handelnde Figur muss zuerst in dieser Szene kommentieren.</p>'}</section>`;
  }
  function open(id) {
    const element = elements().find(candidate => candidate.id === id);
    if (!element || busy) return;
    activeId = id; dialogView = 'element';
    const root = ensureDialog();
    root.querySelector('#scene-elements-title').textContent = element.title;
    root.querySelector('[data-scene-element-subtitle]').textContent = getSceneElementType(element.elementType).label;
    const card = element.comment.herausforderung ? renderChallenge(element.comment)
      : element.elementType === 'item' ? renderSceneElementSignal(element.comment)
        : '<p class="scene-element-mystery">Etwas an diesem Ort erregt eure Aufmerksamkeit. Eine bewusste Untersuchung kann weitere Vorgänge auslösen.</p>';
    root.querySelector('[data-scene-element-content]').innerHTML = `<div data-scene-element-card>${card}</div>`
      + ((!element.comment.herausforderung || ['item', 'puzzle'].includes(element.elementType)) && !element.closed ? interactionControls(element.sourceId) : '');
    status(element.closed ? 'Die gespeicherte Auswertung bleibt erhalten.' : 'Wähle einen Lösungsweg oder eine bewusste Interaktion.');
    globalThis.activateDialog?.('scene-elements-overlay', { initialFocus: '[data-scene-element-action="close"]' });
  }
  function openList() {
    if (busy) return;
    const root = ensureDialog(); activeId = ''; dialogView = 'list';
    root.querySelector('#scene-elements-title').textContent = 'Szenenelemente';
    root.querySelector('[data-scene-element-subtitle]').textContent = 'In dieser Szene';
    root.querySelector('[data-scene-element-content]').innerHTML = renderSceneElementSelection(elements());
    status('Wähle einen Gegenstand, ein Rätsel oder eine freigegebene Gefahr.');
    globalThis.activateDialog?.('scene-elements-overlay', { initialFocus: '[data-scene-element-action="close"]' });
  }
  async function call(payload) {
    const entryId = threadId;
    const backend = await globalThis.getCommentBackend?.({ timeoutMs: 1200 });
    if (!backend?.sceneElements) throw new Error('Der Online-Speicher unterstützt Szenenelemente noch nicht.');
    return backend.sceneElements({ entryId, ...payload });
  }
  async function run(action) {
    if (busy) return;
    if (!threadId) { status('Die Szene wird noch geladen. Bitte anschließend erneut versuchen.'); return; }
    busy = true;
    const currentGeneration = generation;
    overlay?.setAttribute('aria-busy', 'true');
    overlay?.querySelectorAll('button, select').forEach(node => { node.dataset.wasDisabled = String(node.disabled); node.disabled = true; });
    try { await action(() => currentGeneration === generation); }
    catch (error) { if (currentGeneration === generation) status(error.message || 'Der Auftrag konnte nicht abgeschlossen werden.'); }
    finally {
      if (currentGeneration === generation) {
        busy = false; overlay?.setAttribute('aria-busy', 'false');
        overlay?.querySelectorAll('[data-was-disabled]').forEach(node => { node.disabled = node.dataset.wasDisabled === 'true'; delete node.dataset.wasDisabled; });
      }
    }
  }
  function renderManagement() {
    ensureDialog().querySelector('#scene-elements-title').textContent = 'Vorbereitete Elemente';
    overlay.querySelector('[data-scene-element-subtitle]').textContent = 'Gemeinsame Erzählerwerkstatt';
    const labels = { armed: 'Scharfgeschaltet', disabled: 'Deaktiviert', revealed: 'Ausgelöst', expired: 'Kampf beendet' };
    overlay.querySelector('[data-scene-element-content]').innerHTML = `<p class="scene-element-management-note">Diese Autorenansicht zeigt auch verborgene Vorbereitungen. Im Szenenverlauf bleiben sie bis zur Freigabe verborgen.</p>${management.length ? `<ul class="scene-element-management">${management.map(element => `<li><div><small>${escape(getSceneElementType(element.elementType).label)} · ${labels[element.state] || escape(element.state)}</small><strong>${escape(element.title)}</strong></div><div>${['armed', 'disabled'].includes(element.state) ? `<button type="button" class="herausforderung-button" data-scene-element-action="edit-prepared" data-scene-element-id="${escape(element.id)}">Bearbeiten</button><button type="button" class="herausforderung-button" data-scene-element-action="${element.state === 'armed' ? 'disable' : 'arm'}" data-scene-element-id="${escape(element.id)}">${element.state === 'armed' ? 'Deaktivieren' : 'Scharfschalten'}</button>` : element.challengeId ? `<button type="button" class="herausforderung-button" data-scene-element-action="open" data-scene-element-id="${escape(element.challengeId)}">Ereignis ansehen</button>` : ''}</div></li>`).join('')}</ul>` : '<p>Noch keine verzögerten Elemente in dieser Szene vorbereitet.</p>'}`;
  }
  async function manage() {
    if (busy) return;
    ensureDialog(); activeId = ''; dialogView = 'management';
    overlay.querySelector('[data-scene-element-content]').innerHTML = '<p>Vorbereitungen werden geladen …</p>';
    globalThis.activateDialog?.('scene-elements-overlay', { initialFocus: '[data-scene-element-action="close"]' });
    await run(async current => {
      const result = await call({ action: 'list' });
      if (!current()) return;
      management = result.elements || []; renderManagement(); status('Ausgelöste Elemente können nicht erneut ausgelöst werden.');
    });
  }
  async function refresh(expectedThread) { await globalThis.loadCommentsIntoPage?.(expectedThread, true); }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-scene-element-action]');
    if (!button) return;
    const action = button.dataset.sceneElementAction;
    if (action === 'toggle-rail') { setRailExpanded(!railExpanded, { focus: true }); return; }
    if (action === 'close') { close(); return; }
    if (busy) return;
    if (action === 'open-list') { openList(); return; }
    if (action === 'open') { open(button.dataset.sceneElementId); return; }
    if (action === 'manage') { void manage(); return; }
    if (action === 'interact') {
      const actorId = overlay?.querySelector('[data-scene-element-actor]')?.value;
      if (!actorId) { status('Wähle zuerst die handelnde Figur.'); overlay?.querySelector('[data-scene-element-actor]')?.focus(); return; }
      const expectedThread = threadId;
      const sourceId = button.dataset.sceneElementSource;
      if (!pendingInteraction || pendingInteraction.sourceId !== sourceId || pendingInteraction.actorId !== actorId) pendingInteraction = { sourceId, actorId, operationId: crypto.randomUUID() };
      void run(async current => {
        const result = await call({ action: 'interact', ...pendingInteraction });
        if (!current()) return;
        pendingInteraction = null;
        await refresh(expectedThread);
        if (!current()) return;
        const reveal = result.elements?.find(element => element.state === 'revealed');
        status(reveal ? 'Die Interaktion hat ein Ereignis ausgelöst. Die Gefahr steht jetzt in der Szene.' : 'Interaktion gespeichert. Weitere vorbereitete Bedingungen sind noch nicht erfüllt.');
      });
      return;
    }
    const item = management.find(element => element.id === button.dataset.sceneElementId);
    if (!item) return;
    if (action === 'edit-prepared') {
      void run(async current => {
        const prepared = await call({ action: 'read', id: item.id });
        if (!current()) return;
        // The authoring dialog owns the draft; this view only transfers its definition.
        globalThis.deactivateDialog?.('scene-elements-overlay');
        globalThis.AleriaHerausforderung?.openPrepared?.(prepared);
      });
    } else if (action === 'disable' || action === 'arm') {
      const expectedThread = threadId;
      void run(async current => {
        const changed = await call({ action, id: item.id, expectedRevision: item.revision });
        if (!current()) return;
        Object.assign(item, changed); renderManagement();
        status(changed.state === 'revealed' ? 'Eine bereits erfüllte Bedingung hat das Element sofort ausgelöst.'
          : action === 'arm' ? item.phase ? `Für Phase ${item.phase} scharfgeschaltet.`
            : 'Scharfgeschaltet. Die Beitragszählung beginnt jetzt neu.' : 'Deaktiviert. Die Vorbereitung bleibt erhalten.');
        await refresh(expectedThread);
      });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !event.target.closest?.('#scene-elements-overlay')) return;
    event.preventDefault(); close();
  });

  const api = Object.freeze({
    close, manage, renderSignal: renderSceneElementSignal, filterTimeline: comments => comments.filter(isPublicSceneElementComment),
    sync(comments, context) {
      if (threadId !== context.threadId) { generation++; busy = false; pendingInteraction = null; close(); }
      threadId = context.threadId; history = comments;
      const host = context.host;
      if (!host) return;
      host.classList.add('scene-elements-host');
      let rail = host.querySelector('[data-scene-elements-rail]');
      if (!rail) {
        rail = document.createElement('aside');
        rail.dataset.sceneElementsRail = '';
        rail.className = 'scene-elements-rail';
        rail.innerHTML = '<nav data-scene-elements-rail-content aria-label="Rätsel, Gefahren und Gegenstände"></nav><div data-scene-rail-accessory hidden></div>';
        host.append(rail);
      }
      const available = elements();
      const accessory = rail.querySelector('[data-scene-rail-accessory]');
      if (accessory.firstChild !== (context.railAccessory || null)) accessory.replaceChildren(...(context.railAccessory ? [context.railAccessory] : []));
      accessory.hidden = !context.railAccessory;
      host.classList.toggle('has-scene-elements', available.length > 0 || !accessory.hidden);
      host.classList.toggle('has-scene-rail-accessory', !accessory.hidden);
      rail.hidden = available.length === 0 && accessory.hidden;
      updateRail(rail, host, available);
      const scroll = context.scroll || host.querySelector('.comments-scroll');
      if (scroll) {
        if (layout?.host !== host || layout?.scroll !== scroll) {
          resizeObserver.disconnect(); layout = { host, scroll, rail, accessory, dock: host.querySelector('[data-scene-elements-dock]') };
          resizeObserver.observe(host); resizeObserver.observe(scroll); resizeObserver.observe(accessory);
        }
        requestAnimationFrame(positionRail);
      }
      const active = activeId && available.find(element => element.id === activeId);
      const card = overlay?.querySelector('[data-scene-element-card]');
      if (active?.comment?.herausforderung && card && overlay.classList.contains('active')) {
        const latestHtml = renderChallenge(active.comment);
        if (card.innerHTML !== latestHtml) card.innerHTML = latestHtml;
        const interaction = overlay.querySelector('.scene-element-interaction');
        if (interaction) interaction.hidden = active.closed;
      }
      if (dialogView === 'list' && overlay?.classList.contains('active')) {
        overlay.querySelector('[data-scene-element-content]').innerHTML = renderSceneElementSelection(available);
      }
    }
  });
  globalThis.AleriaSceneElements = api;
  return api;
}
