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
  if (typeof setSpeakerProfileAiContext === 'function') {
    setSpeakerProfileAiContext({ character, fallbackName, stats });
  }
}

document.addEventListener('click', event => {
  const closeTrigger = event.target?.closest?.('[data-speaker-profile-action="close"]');
  if (closeTrigger) {
    event.preventDefault();
    closeSpeakerProfileOverlay();
    return;
  }

  const aiSummaryTrigger = event.target?.closest?.('[data-speaker-profile-action="generate-ai-summary"]');
  if (aiSummaryTrigger) {
    event.preventDefault();
    if (typeof generateSpeakerProfileAiSummary === 'function') {
      generateSpeakerProfileAiSummary().catch(error => {
        console.warn('speaker profile ai summary failed:', error);
        if (typeof updateSpeakerProfileAiBox === 'function') {
          updateSpeakerProfileAiBox('error', 'Die KI-Analyse konnte nicht erstellt werden.');
        }
      });
    }
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

document.addEventListener('submit', event => {
  const form = event.target?.closest?.('form[data-speaker-profile-action="submit-ai-chat"]');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('.speaker-profile-ai-input');
  const question = String(input?.value || '').trim();
  if (!question) return;
  if (input) input.value = '';
  if (typeof submitSpeakerProfileAiChat === 'function') {
    submitSpeakerProfileAiChat(question).catch(error => {
      console.warn('speaker profile ai chat failed:', error);
      if (typeof updateSpeakerProfileAiBox === 'function') {
        updateSpeakerProfileAiBox('error', 'Die KI-Frage konnte nicht beantwortet werden.');
      }
    });
  }
});

document.addEventListener('change', event => {
  const styleSelect = event.target?.closest?.('[data-speaker-profile-ai-style]');
  if (!styleSelect) return;
  if (typeof setSpeakerProfileAiAnswerStyle === 'function') {
    setSpeakerProfileAiAnswerStyle(styleSelect.value);
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const overlay = document.getElementById('speaker-profile-overlay');
  if (!overlay?.classList.contains('active')) return;
  closeSpeakerProfileOverlay();
});
