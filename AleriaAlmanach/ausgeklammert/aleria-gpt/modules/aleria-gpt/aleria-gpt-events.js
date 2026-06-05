function getAleriaGptPanelScopeOptions() {
  const scope = getAleriaGptPanelState().scope;
  if (scope === 'current-module') {
    const entry = typeof getRenderableEntry === 'function' && currentEntry
      ? getRenderableEntry(currentEntry)
      : currentEntry;
    return {
      scope: entry?.id ? 'module' : 'all',
      moduleId: entry?.id || ''
    };
  }
  return { scope: 'all' };
}

function summarizeAleriaGptRetrieval(retrieval) {
  const chunks = Array.isArray(retrieval?.chunks) ? retrieval.chunks : [];
  const characters = retrieval?.detected?.characters || [];
  const modules = retrieval?.detected?.modules || [];
  const lines = [];

  lines.push('Ich kann gerade keine echte KI-Antwort abrufen.');
  lines.push(`Ich habe aber ${chunks.length} passende Almanach-Quellen gefunden.`);

  if (characters.length) {
    lines.push(`Erkannte Figur: ${characters.map(character => character.name || character.id).join(', ')}.`);
  }
  if (modules.length) {
    lines.push(`Erkanntes Modul: ${modules.map(module => module.title || module.id).join(', ')}.`);
  }

  if (!chunks.length) {
    lines.push('Formuliere die Frage konkreter oder nenne eine Figur, ein Modul oder ein Thema.');
    return lines.join('\n');
  }

  lines.push('Oeffne die eingeklappten Quellen, wenn du sehen willst, worauf sich die spaetere Antwort stuetzen wuerde.');

  return lines.join('\n');
}

async function submitAleriaGptPanelQuestion(form) {
  const input = form?.querySelector?.('.aleria-gpt-input');
  const query = String(input?.value || '').trim();
  if (!query || getAleriaGptPanelState().busy) return;

  if (input) input.value = '';
  addAleriaGptMessage({ role: 'user', text: query });
  setAleriaGptPanelBusy(true);
  renderAleriaGptPanel();

  try {
    if (!window.AleriaGptRetrieval?.retrieve) {
      throw new Error('Retrieval not available');
    }
    const retrieval = await window.AleriaGptRetrieval.retrieve(query, {
      ...getAleriaGptPanelScopeOptions(),
      limit: 18
    });

    if (window.AleriaGptClient?.isConfigured?.()) {
      const response = await window.AleriaGptClient.sendChat(query, retrieval, {
        scope: getAleriaGptPanelScopeOptions(),
        sourceLimit: 18
      });
      if (response.ok && response.text) {
        addAleriaGptMessage({
          role: 'assistant',
          text: response.text,
          sources: retrieval.chunks || []
        });
        return;
      }
      console.warn('AleriaGPT proxy response fallback:', response);
    }

    addAleriaGptMessage({
      role: 'assistant',
      text: summarizeAleriaGptRetrieval(retrieval),
      sources: retrieval.chunks || []
    });
  } catch (error) {
    console.error('AleriaGPT panel query failed:', error);
    addAleriaGptMessage({
      role: 'assistant',
      text: 'Die Quellen konnten nicht ausgewertet werden. Pruefe, ob Kontext- und Retrieval-Modul geladen sind.'
    });
  } finally {
    setAleriaGptPanelBusy(false);
    renderAleriaGptPanel();
  }
}

function handleAleriaGptActionClick(event) {
  const trigger = event.target?.closest?.('[data-aleria-gpt-action]');
  if (!trigger || !trigger.closest('#aleria-gpt-shell')) return;
  const action = trigger.dataset.aleriaGptAction;

  if (action === 'toggle-panel') {
    event.preventDefault();
    refreshAleriaGptPanelScopeOptions();
    setAleriaGptPanelOpen(!getAleriaGptPanelState().open);
    renderAleriaGptPanel();
    return;
  }

  if (action === 'close-panel') {
    event.preventDefault();
    setAleriaGptPanelOpen(false);
    renderAleriaGptPanel();
    return;
  }

  if (action === 'clear-chat') {
    event.preventDefault();
    clearAleriaGptMessages();
    renderAleriaGptPanel();
  }
}

function handleAleriaGptActionChange(event) {
  const trigger = event.target?.closest?.('[data-aleria-gpt-action="set-scope"]');
  if (!trigger || !trigger.closest('#aleria-gpt-shell')) return;
  setAleriaGptPanelScope(trigger.value || 'all');
  renderAleriaGptPanel();
}

function handleAleriaGptFormSubmit(event) {
  const form = event.target?.closest?.('form[data-aleria-gpt-action="submit-form"]');
  if (!form || !form.closest('#aleria-gpt-shell')) return;
  event.preventDefault();
  submitAleriaGptPanelQuestion(form);
}

function handleAleriaGptInputKeydown(event) {
  const input = event.target?.closest?.('.aleria-gpt-input');
  if (!input || !input.closest('#aleria-gpt-shell')) return;
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  submitAleriaGptPanelQuestion(input.closest('form'));
}

document.addEventListener('click', handleAleriaGptActionClick);
document.addEventListener('change', handleAleriaGptActionChange);
document.addEventListener('submit', handleAleriaGptFormSubmit);
document.addEventListener('keydown', handleAleriaGptInputKeydown);
