import { renderMiniCombatProfile, escapeCombatMarkup as e } from './comments-combat-mini-profile-view.js?v=20260906-effect-rolls-v1';
import { openCombatStatusDialog } from '../combat-status/combat-status-controller.js?v=20260928-equipment-art-v4';
import { getActiveCombatEncounter } from '../combat/combat-encounter-model.js?v=20260928-equipment-art-v4';

const ROOT_SELECTOR = '[data-comment-combat-profile]';
let activeRoot = null;
let activeScrollTop = 0;
let refreshQueued = false;
const safeId = value => String(value || 'figur').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 90);

function context(root) {
  return { characterId: root.dataset.combatCharacterId || '', actorId: root.dataset.combatActorId || '', threadId: root.dataset.combatThreadId || '' };
}

function renderPortrait(options = {}) {
  const characterId = String(options.characterId || '').trim();
  if (!characterId || options.secret) return String(options.portraitMarkup || '');
  const displayName = String(options.displayName || 'Figur');
  const panelId = `comment-combat-profile-${safeId(options.commentId)}-${Number(options.renderIndex) || 0}-${Number(options.partIndex) || 0}`;
  return `<div class="comment-combat-profile-shell" data-comment-combat-profile data-combat-character-id="${e(characterId)}" data-combat-actor-id="${e(options.actorId || characterId)}" data-combat-thread-id="${e(options.threadId || '')}" data-combat-timeline-comment-id="${e(options.timelineCommentId || options.commentId || '')}"${Number.isInteger(options.timelineSegmentIndex) ? ` data-combat-timeline-segment-index="${options.timelineSegmentIndex}"` : ''} data-combat-display-name="${e(displayName)}">
    <div class="comment-combat-profile-portrait">${String(options.portraitMarkup || '')}</div>
    <section class="comment-combat-profile-panel" id="${e(panelId)}" data-comment-combat-profile-panel aria-label="Kampfdaten von ${e(displayName)}" hidden></section>
    <button type="button" class="comment-combat-profile-toggle" data-action="toggle-comment-combat-profile" aria-controls="${e(panelId)}" aria-expanded="false" title="Kampfdaten anzeigen"><span class="comment-combat-profile-sr">Kampfdaten von ${e(displayName)} anzeigen</span></button></div>`;
}

function closeProfile(root = activeRoot) {
  if (!root) return;
  root.classList.remove('is-profile-open');
  const panel = root.querySelector('[data-comment-combat-profile-panel]');
  const toggle = root.querySelector('[data-action="toggle-comment-combat-profile"]');
  if (panel) panel.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
  if (toggle) toggle.title = 'Kampfdaten anzeigen';
  if (root === activeRoot) { activeRoot = null; activeScrollTop = 0; }
}

function updateProfile() {
  const root = activeRoot;
  if (!root) return;
  const options = context(root);
  const profile = globalThis.AleriaCombat?.getProfile?.(options.characterId, options);
  const panel = root.querySelector('[data-comment-combat-profile-panel]');
  if (!panel) return;
  const history = globalThis.getCachedCommentsForThread?.(options.threadId) || [];
  panel.innerHTML = profile ? renderMiniCombatProfile(profile, root.dataset.combatDisplayName, {
    encounter: getActiveCombatEncounter(history),
    canManage: !!options.threadId && globalThis.getCurrentCommentThread?.()?.kind === 'session'
  }) : '<p class="comment-combat-profile-empty" role="status">Kampfprofil wird geladen. Die Anzeige aktualisiert sich automatisch.</p>';
}

function openProfile(root) {
  if (activeRoot && activeRoot !== root) closeProfile();
  activeRoot = root;
  activeScrollTop = 0;
  updateProfile();
  root.querySelector('[data-comment-combat-profile-panel]').hidden = false;
  root.classList.add('is-profile-open');
  const toggle = root.querySelector('[data-action="toggle-comment-combat-profile"]');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.title = 'Zum Porträt zurückkehren';
}

function scheduleRefresh() {
  if (!activeRoot || refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    if (!activeRoot) return;
    const panel = activeRoot.querySelector('[data-comment-combat-profile-panel]');
    const scroll = activeRoot.isConnected ? panel?.scrollTop || 0 : activeScrollTop;
    const opened = new Set([...(panel?.querySelectorAll('details[open][data-profile-details-key]') || [])].map(details => details.dataset.profileDetailsKey));
    if (!activeRoot.isConnected) {
      const panelId = activeRoot.querySelector('[data-comment-combat-profile-panel]')?.id;
      const identity = activeRoot.dataset;
      const replacement = [...document.querySelectorAll(ROOT_SELECTOR)].find(root =>
        ['combatActorId', 'combatThreadId', 'combatTimelineCommentId', 'combatTimelineSegmentIndex'].every(key => root.dataset[key] === identity[key]))
        || document.getElementById(panelId)?.closest(ROOT_SELECTOR);
      activeRoot = null;
      if (replacement) openProfile(replacement);
    } else {
      updateProfile();
    }
    const refreshed = activeRoot?.querySelector('[data-comment-combat-profile-panel]');
    refreshed?.querySelectorAll('details[data-profile-details-key]').forEach(details => { details.open = opened.has(details.dataset.profileDetailsKey); });
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
  if (event.key !== 'Escape' || !activeRoot || document.querySelector('.combat-status-dialog[open]')) return;
  const toggle = activeRoot.querySelector('[data-action="toggle-comment-combat-profile"]');
  closeProfile(); toggle?.focus();
});
document.addEventListener('aleria:comment-tools-visibility-changed', event => { if (event.detail?.visible === false) closeProfile(); });
document.addEventListener('aleria:comments-updated', event => {
  if (activeRoot && event.detail?.threadId === activeRoot.dataset.combatThreadId) scheduleRefresh();
});
document.addEventListener('aleria:combat-profile-committed', scheduleRefresh);
document.addEventListener('aleria:characters-changed', scheduleRefresh);
document.addEventListener('aleria:creatures-changed', scheduleRefresh);
document.addEventListener('error', event => {
  const image = event.target;
  if (!image?.matches?.('img[data-combat-image-fallback]') || !image.closest(`${ROOT_SELECTOR}, .combat-status-dialog`)) return;
  const fallback = document.createElement('span');
  fallback.className = 'combat-status-icon-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  fallback.textContent = image.dataset.combatImageFallback || '✦';
  image.replaceWith(fallback);
}, true);

globalThis.AleriaCommentCombatMiniProfile = Object.freeze({ close: closeProfile, renderPortrait,
  renderStatusComment(comment) {
    return `<div class="comment-combat-status-audit" data-comment-id="${e(comment.id)}"><strong>Zustandsverwaltung</strong><p>${e(comment.text)}</p></div>`;
  }
});
