function getSpeakerProfilePayloadFromTrigger(trigger) {
  return {
    characterId: String(trigger?.dataset?.speakerCharacterId || '').trim(),
    name: String(trigger?.dataset?.speakerName || trigger?.dataset?.charName || '').trim(),
    title: String(trigger?.dataset?.speakerTitle || '').trim(),
    portrait: String(trigger?.dataset?.speakerPortrait || '').trim()
  };
}

function getCurrentSpeakerProfileThreadIds() {
  if (!currentEntry) return [];
  try {
    const entry = getRenderableEntry(currentEntry);
    if (entry && typeof getModuleCommentThreadIds === 'function') return getModuleCommentThreadIds(entry);
  } catch (error) {
    console.warn('speaker profile thread id resolve failed:', error);
  }
  const currentThreadId = typeof getCurrentCommentThreadId === 'function' ? getCurrentCommentThreadId() : '';
  return currentThreadId ? [currentThreadId] : [];
}

async function openSpeakerProfileFromTrigger(trigger) {
  const payload = getSpeakerProfilePayloadFromTrigger(trigger);
  const fallbackName = payload.name || 'Sprecher';
  showSpeakerProfileOverlay(renderSpeakerProfileLoading(fallbackName));

  const character = resolveSpeakerProfileCharacter(payload);
  const comments = await loadSpeakerProfileComments(false);
  const stats = buildSpeakerProfileStats(character, fallbackName, comments, getCurrentSpeakerProfileThreadIds());
  showSpeakerProfileOverlay(renderSpeakerProfileContent(character, fallbackName, stats, payload));
}

document.addEventListener('click', event => {
  const closeTrigger = event.target?.closest?.('[data-speaker-profile-action="close"]');
  if (closeTrigger) {
    event.preventDefault();
    closeSpeakerProfileOverlay();
    return;
  }

  const overlay = document.getElementById('speaker-profile-overlay');
  if (overlay?.classList.contains('active') && event.target === overlay) {
    closeSpeakerProfileOverlay();
    return;
  }

  const trigger = event.target?.closest?.('[data-action="open-speaker-profile"]');
  if (!trigger) return;
  event.preventDefault();
  openSpeakerProfileFromTrigger(trigger).catch(error => {
    console.warn('speaker profile open failed:', error);
    showSpeakerProfileOverlay(`
      <div class="speaker-profile-empty">
        Sprecherprofil konnte nicht geladen werden.
      </div>`);
  });
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const overlay = document.getElementById('speaker-profile-overlay');
  if (!overlay?.classList.contains('active')) return;
  closeSpeakerProfileOverlay();
});
