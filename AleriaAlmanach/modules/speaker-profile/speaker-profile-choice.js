// Choice between the compact scene metadata profile and the full character profile.
let _speakerProfileChoicePayload = null;

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
    <div><span>Figur ansehen</span><h2 id="speaker-profile-choice-title" data-speaker-choice-name>Charakter</h2><p>Welche Ansicht möchtest du öffnen?</p></div>
    <div class="speaker-profile-choice-actions">
      <button type="button" data-speaker-choice-action="mini"><strong>Mini-Datenprofil</strong><small>Stimmen, Metadaten und Szenenkontext</small></button>
      <button type="button" data-speaker-choice-action="full"><strong>Charakterprofil</strong><small>Vollständige Daten und Biografie</small></button>
      <button type="button" data-speaker-choice-action="inventory"><strong>Inventar öffnen</strong><small>Geld, Ausrüstung und Gegenstände</small></button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function openSpeakerProfileChoice(trigger) {
  _speakerProfileChoicePayload = { trigger, ...getSpeakerProfilePayloadFromTrigger(trigger) };
  if (!_speakerProfileChoicePayload.characterId || !getCharacterById(_speakerProfileChoicePayload.characterId)) {
    return openSpeakerProfileFromTrigger(trigger);
  }
  const overlay = ensureSpeakerProfileChoiceDialog();
  overlay.querySelector('[data-speaker-choice-name]').textContent = _speakerProfileChoicePayload.name || 'Charakter';
  const portrait = overlay.querySelector('[data-speaker-choice-portrait]');
  const src = sanitizeImageSrc(_speakerProfileChoicePayload.portrait || '');
  portrait.innerHTML = src ? `<img src="${src}" alt="">` : `<span>${escapeHtml(getInitialChar(_speakerProfileChoicePayload.name))}</span>`;
  activateDialog('speaker-profile-choice-overlay', { initialFocus: '[data-speaker-choice-action="mini"]' });
}

function closeSpeakerProfileChoice() {
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
