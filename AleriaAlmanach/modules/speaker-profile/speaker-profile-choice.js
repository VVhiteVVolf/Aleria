// Choice between the compact scene metadata profile and the full character profile.
let _speakerProfileChoicePayload = null;
let _speakerProfileOpenRequest = 0;

function cancelSpeakerProfileRequest() { _speakerProfileOpenRequest += 1; }
function beginSpeakerProfileRequest(trigger) {
  const request = ++_speakerProfileOpenRequest;
  const entry = typeof currentEntry === 'undefined' ? null : currentEntry;
  const thread = typeof getCurrentCommentThreadId === 'function' ? getCurrentCommentThreadId() : '';
  return { current: () => request === _speakerProfileOpenRequest
    && (typeof currentEntry === 'undefined' ? null : currentEntry) === entry
    && (typeof getCurrentCommentThreadId === 'function' ? getCurrentCommentThreadId() : '') === thread };
}

function ensureSpeakerProfileChoiceDialog() {
  let overlay = document.getElementById('speaker-profile-choice-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'speaker-profile-choice-overlay';
  overlay.className = 'speaker-profile-choice-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'speaker-profile-choice-title');
  overlay.innerHTML = `<div class="speaker-profile-choice-card">
    <button class="speaker-profile-choice-close" type="button" data-speaker-choice-action="close" aria-label="Auswahl schließen">×</button>
    <div class="speaker-profile-choice-portrait" data-speaker-choice-portrait></div>
    <div><span>Figur ansehen</span><h2 id="speaker-profile-choice-title" data-speaker-choice-name>Charakter</h2><p data-speaker-choice-status>Welche Ansicht möchtest du öffnen?</p></div>
    <div class="speaker-profile-choice-actions">
      <button type="button" data-speaker-choice-action="mini"><strong>Mini-Datenprofil</strong><small>Stimmen, Metadaten und Szenenkontext</small></button>
      <button type="button" data-speaker-choice-action="full"><strong>Charakterprofil</strong><small>Vollständige Daten und Biografie</small></button>
      <button type="button" data-speaker-choice-action="inventory"><strong>Inventar öffnen</strong><small>Geld, Ausrüstung und Gegenstände</small></button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

async function openSpeakerProfileChoice(trigger) {
  closeSpeakerProfileOverlay();
  const request = beginSpeakerProfileRequest(trigger);
  const payload = { trigger, ...getSpeakerProfilePayloadFromTrigger(trigger) };
  _speakerProfileChoicePayload = payload;
  const overlay = ensureSpeakerProfileChoiceDialog();
  overlay.querySelector('[data-speaker-choice-name]').textContent = payload.name || 'Charakter';
  const portrait = overlay.querySelector('[data-speaker-choice-portrait]');
  const src = sanitizeImageSrc(payload.portrait || '');
  portrait.innerHTML = src ? `<img src="${src}" alt="">` : `<span>${escapeHtml(getInitialChar(payload.name))}</span>`;
  const status = overlay.querySelector('[data-speaker-choice-status]');
  const actions = [...overlay.querySelectorAll('[data-speaker-choice-action]')].filter(button => button.dataset.speakerChoiceAction !== 'close');
  actions.forEach(button => { button.disabled = true; });
  if (status) status.textContent = 'Figur wird geladen …';
  activateDialog('speaker-profile-choice-overlay', { initialFocus: '[data-speaker-choice-action="close"]' });
  try {
    if (typeof loadSceneActorData === 'function') await loadSceneActorData();
    if (!request.current() || !overlay.classList.contains('active')) return false;
    if (!payload.characterId || !getCharacterById(payload.characterId)) {
      closeSpeakerProfileChoice(); return openSpeakerProfileFromTrigger(trigger);
    }
    actions.forEach(button => { button.disabled = false; });
    if (status) status.textContent = 'Welche Ansicht möchtest du öffnen?';
    return true;
  } catch (error) {
    if (request.current() && overlay.classList.contains('active') && status) status.textContent = error.message || 'Die Figur konnte nicht geladen werden. Bitte erneut öffnen.';
    return false;
  }
}

function closeSpeakerProfileChoice() {
  cancelSpeakerProfileRequest();
  deactivateDialog('speaker-profile-choice-overlay');
  _speakerProfileChoicePayload = null;
}

document.addEventListener('click', event => {
  const action = event.target?.closest?.('[data-speaker-choice-action]')?.dataset.speakerChoiceAction;
  if (!action) return;
  event.preventDefault();
  if (action === 'close') return closeSpeakerProfileChoice();
  const payload = _speakerProfileChoicePayload;
  if (!payload) return;
  closeSpeakerProfileChoice();
  if (action === 'mini') openSpeakerProfileFromTrigger(payload.trigger);
  if (action === 'full' || action === 'inventory') {
    openCharProfile(payload.characterId);
    if (action === 'inventory') switchCharTab('inventory');
  }
});
