import { renderMiniCombatProfile, escapeCombatMarkup as e, safeCombatImage } from './comments-combat-mini-profile-view.js';
import { refreshCommentStatusStrips, renderCommentStatusStrip } from './comments-combat-status-strip.js';
import { openCombatStatusDialog } from '../combat-status/combat-status-controller.js?v=20260928-equipment-art-v4';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260928-equipment-art-v4';

const ROOT_SELECTOR = '[data-comment-combat-profile]';
const compactViewport = matchMedia('(max-width: 760px)');
let activeRoot = null;
let activeThreadId = '';
let activeScrollTop = 0;
let refreshQueued = false;
const detailStates = new WeakMap();
const safeId = value => String(value || 'figur').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 90);

function context(root) {
  return {
    characterId: root.dataset.combatCharacterId || '', actorId: root.dataset.combatActorId || '',
    threadId: root.dataset.combatThreadId || root.closest('.comments-scroll')?.dataset.commentThreadId || ''
  };
}

function renderPortrait(options = {}) {
  const characterId = String(options.characterId || '').trim();
  if (!characterId || options.secret) return String(options.portraitMarkup || '');
  const displayName = String(options.displayName || 'Figur');
  const panelId = `comment-combat-profile-${safeId(options.commentId)}-${Number(options.renderIndex) || 0}-${Number(options.partIndex) || 0}`;
  return `<div class="comment-combat-profile-shell" data-comment-combat-profile data-combat-character-id="${e(characterId)}" data-combat-actor-id="${e(options.actorId || characterId)}" data-combat-thread-id="${e(options.threadId || '')}" data-combat-timeline-comment-id="${e(options.timelineCommentId || options.commentId || '')}"${Number.isInteger(options.timelineSegmentIndex) ? ` data-combat-timeline-segment-index="${options.timelineSegmentIndex}"` : ''} data-combat-display-name="${e(displayName)}" data-combat-portrait="${e(safeCombatImage(options.portrait))}">
    <div class="comment-combat-profile-portrait">${String(options.portraitMarkup || '')}</div>
    <button type="button" class="comment-combat-profile-toggle" data-action="toggle-comment-combat-profile" aria-controls="${e(panelId)}" aria-expanded="false" aria-label="Kampfdaten von ${e(displayName)} anzeigen" title="Kampfdaten anzeigen"></button>
    <dialog class="comment-combat-profile-sheet" aria-label="Kampfdaten von ${e(displayName)}">
      <button type="button" class="comment-combat-profile-close" data-action="close-comment-combat-profile" aria-label="Kampfprofil schließen" title="Kampfprofil schließen">×</button>
      <button type="button" class="comment-combat-profile-expand" data-action="expand-comment-combat-profile" aria-controls="${e(panelId)}" aria-expanded="false" aria-label="Breitbild öffnen" title="Breitbild öffnen"><span aria-hidden="true">›</span></button>
      <section class="comment-combat-profile-panel" id="${e(panelId)}" data-comment-combat-profile-panel></section>
    </dialog></div>`;
}

function setProfileWidth(root, wide) {
  root.classList.toggle('is-profile-wide', wide);
  const expand = root.querySelector('[data-action="expand-comment-combat-profile"]');
  if (!expand) return;
  const label = wide ? 'Kompaktansicht öffnen' : 'Breitbild öffnen';
  expand.setAttribute('aria-expanded', String(wide));
  expand.setAttribute('aria-label', label);
  expand.title = label;
  expand.firstElementChild.textContent = wide ? '‹' : '›';
}

function rememberDetails(root, panel) {
  const saved = detailStates.get(root) || new Map();
  for (const item of panel?.querySelectorAll('details[data-profile-details-key]') || []) saved.set(item.dataset.profileDetailsKey, item.open);
  detailStates.set(root, saved);
  return saved;
}

function closeProfile(root = activeRoot, { restoreFocus = false } = {}) {
  if (!root) return;
  root.classList.remove('is-profile-open');
  setProfileWidth(root, false);
  root.querySelector('.comment-combat-profile-sheet')?.close();
  const toggle = root.querySelector('[data-action="toggle-comment-combat-profile"]');
  toggle?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) toggle?.focus({ preventScroll: true });
  detailStates.delete(root);
  if (root === activeRoot) { activeRoot = null; activeThreadId = ''; activeScrollTop = 0; }
}

function updateProfile() {
  const root = activeRoot;
  if (!root) return;
  const options = context(root);
  const profile = globalThis.AleriaCombat?.getProfile?.(options.characterId, options);
  const panel = root.querySelector('[data-comment-combat-profile-panel]');
  if (!panel) return;
  const history = globalThis.getCachedCommentsForThread?.(options.threadId) || [];
  const details = rememberDetails(root, panel);
  panel.innerHTML = profile ? renderMiniCombatProfile(profile, root.dataset.combatDisplayName, {
    wide: root.classList.contains('is-profile-wide'), portrait: root.dataset.combatPortrait,
    encounter: getActiveCombatEncounter(history),
    canManage: !!options.threadId && globalThis.getCurrentCommentThread?.()?.kind === 'session'
  }) : '<p class="comment-combat-profile-empty" role="status">Kampfprofil wird geladen. Die Anzeige aktualisiert sich automatisch.</p>';
  for (const item of panel.querySelectorAll('details[data-profile-details-key]')) item.open = details.get(item.dataset.profileDetailsKey) || false;
}

function showProfileSheet(root) {
  const sheet = root.querySelector('.comment-combat-profile-sheet');
  if (sheet.open) sheet.close();
  if (compactViewport.matches) sheet.showModal();
  else sheet.show();
}

function openProfile(root, { wide = false } = {}) {
  if (activeRoot && activeRoot !== root) closeProfile();
  activeRoot = root;
  activeThreadId = context(root).threadId;
  activeScrollTop = 0;
  root.classList.add('is-profile-open');
  setProfileWidth(root, wide);
  updateProfile();
  showProfileSheet(root);
  root.querySelector('[data-action="toggle-comment-combat-profile"]').setAttribute('aria-expanded', 'true');
}

function scheduleRefresh() {
  if (!activeRoot || refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    if (!activeRoot) return;
    const panel = activeRoot.querySelector('[data-comment-combat-profile-panel]');
    const scroll = activeRoot.isConnected ? panel?.scrollTop || 0 : activeScrollTop;
    if (!activeRoot.isConnected) {
      const panelId = activeRoot.querySelector('[data-comment-combat-profile-panel]')?.id;
      const identity = activeRoot.dataset;
      const wide = activeRoot.classList.contains('is-profile-wide');
      const details = rememberDetails(activeRoot, panel);
      const replacement = [...document.querySelectorAll(ROOT_SELECTOR)].find(root =>
        ['combatActorId', 'combatThreadId', 'combatTimelineCommentId', 'combatTimelineSegmentIndex'].every(key => root.dataset[key] === identity[key]))
        || document.getElementById(panelId)?.closest(ROOT_SELECTOR);
      activeRoot = null;
      activeThreadId = '';
      if (replacement) { detailStates.set(replacement, details); openProfile(replacement, { wide }); }
    } else {
      updateProfile();
    }
    const refreshed = activeRoot?.querySelector('[data-comment-combat-profile-panel]');
    if (refreshed) { refreshed.scrollTop = scroll; activeScrollTop = refreshed.scrollTop; }
  });
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-action]');
  const root = trigger?.closest(ROOT_SELECTOR);
  const action = trigger?.dataset.action;
  if (root && action === 'toggle-comment-combat-profile') {
    event.preventDefault();
    if (root === activeRoot) closeProfile(); else openProfile(root);
    return;
  }
  if (activeRoot && root === activeRoot && action === 'close-comment-combat-profile') {
    closeProfile(root, { restoreFocus: true });
    return;
  }
  if (activeRoot && root === activeRoot && action === 'expand-comment-combat-profile') {
    const panel = root.querySelector('[data-comment-combat-profile-panel]');
    const scroll = panel.scrollTop;
    setProfileWidth(root, !root.classList.contains('is-profile-wide'));
    updateProfile();
    panel.scrollTop = scroll;
    return;
  }
  const operations = { 'add-comment-combat-condition': 'add', 'remove-comment-combat-condition': 'remove', 'reset-comment-combat-profile': 'reset' };
  if (root && operations[action]) {
    openCombatStatusDialog(context(root), { operation: operations[action], conditionId: trigger.dataset.conditionId, trigger }); return;
  }
  if (activeRoot && !activeRoot.contains(event.target) && !event.target.closest('.combat-status-dialog')) closeProfile();
});

// Detached nodes lose their layout and scroll offset before the comments-updated
// event arrives. Remember the last visible position while the panel is attached.
document.addEventListener('scroll', event => {
  if (activeRoot?.isConnected && event.target?.matches?.('[data-comment-combat-profile-panel]')
    && activeRoot.contains(event.target)) activeScrollTop = event.target.scrollTop;
}, true);
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.key !== 'Escape' || !activeRoot?.contains(event.target)) return;
  event.preventDefault();
  closeProfile(activeRoot, { restoreFocus: true });
}, true);
compactViewport.addEventListener('change', () => {
  if (!activeRoot?.isConnected) return;
  const panel = activeRoot.querySelector('[data-comment-combat-profile-panel]');
  const scroll = panel.scrollTop;
  showProfileSheet(activeRoot);
  panel.scrollTop = scroll;
});
document.addEventListener('aleria:comment-tools-visibility-changed', event => { if (event.detail?.visible === false) closeProfile(); });
document.addEventListener('aleria:comments-updated', event => {
  if (activeRoot && event.detail?.threadId === activeThreadId) scheduleRefresh();
});
document.addEventListener('aleria:combat-profile-committed', scheduleRefresh);
document.addEventListener('aleria:characters-changed', scheduleRefresh);
document.addEventListener('aleria:creatures-changed', scheduleRefresh);
document.addEventListener('aleria:item-definitions-changed', scheduleRefresh);
document.addEventListener('error', event => {
  const image = event.target;
  if (image?.matches?.('img[data-combat-avatar]') && image.closest(ROOT_SELECTOR)) { image.remove(); return; }
  if (!image?.matches?.('img[data-combat-image-fallback]') || !image.closest(`${ROOT_SELECTOR}, .combat-status-dialog, [data-comment-condition-strip]`)) return;
  const fallback = document.createElement('span');
  fallback.className = 'combat-status-icon-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  fallback.textContent = image.dataset.combatImageFallback || '✦';
  image.replaceWith(fallback);
}, true);

globalThis.AleriaCommentCombatMiniProfile = Object.freeze({ close: closeProfile, renderPortrait,
  renderStatusStrip: renderCommentStatusStrip, refreshStatusStrips: refreshCommentStatusStrips,
  renderStatusComment(comment) {
    return `<div class="comment-combat-status-audit" data-comment-id="${e(comment.id)}"><strong>Zustandsverwaltung</strong><p>${e(comment.text)}</p></div>`;
  }
});
