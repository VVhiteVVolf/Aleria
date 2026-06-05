function getAleriaGptContextFilename(payload) {
  const date = new Date().toISOString().slice(0, 10);
  const scope = payload?.scope?.kind && payload.scope.kind !== 'all'
    ? `-${payload.scope.kind}`
    : '';
  const hash = payload?.sourceHash ? `-${payload.sourceHash}` : '';
  return `aleria-gpt-context${scope}-${date}${hash}.json`;
}

function getAleriaGptRetrievalFilename(payload) {
  const date = new Date().toISOString().slice(0, 10);
  const hash = payload?.sourceHash ? `-${payload.sourceHash}` : '';
  return `aleria-gpt-retrieval-${date}${hash}.json`;
}

function downloadAleriaGptJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function getAleriaGptScopeFromTrigger(trigger) {
  const scope = String(trigger?.dataset?.aleriaGptScope || 'all').trim() || 'all';
  if (scope === 'current-module') {
    const entry = typeof getRenderableEntry === 'function' && currentEntry
      ? getRenderableEntry(currentEntry)
      : currentEntry;
    return {
      scope: entry?.id ? 'module' : 'all',
      moduleId: entry?.id || ''
    };
  }
  return { scope };
}

async function exportAleriaGptContextFromTrigger(trigger) {
  if (!window.AleriaGptContext?.buildContext) {
    if (typeof showAppStatus === 'function') showAppStatus('AleriaGPT-Kontextmodul ist nicht geladen.', 'error');
    return;
  }

  const previousText = trigger?.textContent || '';
  if (trigger) {
    trigger.disabled = true;
    trigger.textContent = 'AleriaGPT-Kontext wird erstellt...';
  }

  try {
    const payload = await window.AleriaGptContext.buildContext(getAleriaGptScopeFromTrigger(trigger));
    downloadAleriaGptJson(payload, getAleriaGptContextFilename(payload));
    if (typeof showAppStatus === 'function') {
      showAppStatus(
        `AleriaGPT-Kontext exportiert: ${payload.stats.characterCount} Figuren, ${payload.stats.moduleCount} Module, ${payload.stats.storedCommentCount} Kommentare.`,
        'success'
      );
    }
  } catch (error) {
    console.error('AleriaGPT context export failed:', error);
    if (typeof showAppStatus === 'function') showAppStatus('AleriaGPT-Kontext konnte nicht exportiert werden.', 'error');
  } finally {
    if (trigger) {
      trigger.disabled = false;
      trigger.textContent = previousText;
    }
  }
}

async function exportAleriaGptRetrievalFromTrigger(trigger) {
  if (!window.AleriaGptRetrieval?.retrieve) {
    if (typeof showAppStatus === 'function') showAppStatus('AleriaGPT-Retrieval ist nicht geladen.', 'error');
    return;
  }

  const query = prompt('AleriaGPT-Frage fuer Quellen-Test:', 'Analysiere Gwendolyn Draig');
  if (!query || !query.trim()) return;

  const previousText = trigger?.textContent || '';
  if (trigger) {
    trigger.disabled = true;
    trigger.textContent = 'AleriaGPT-Treffer werden gesucht...';
  }

  try {
    const payload = await window.AleriaGptRetrieval.retrieve(query.trim(), {
      ...getAleriaGptScopeFromTrigger(trigger),
      limit: Number(trigger?.dataset?.aleriaGptLimit || 28)
    });
    downloadAleriaGptJson(payload, getAleriaGptRetrievalFilename(payload));
    if (typeof showAppStatus === 'function') {
      showAppStatus(
        `AleriaGPT-Treffer exportiert: ${payload.stats.returnedChunks} von ${payload.stats.totalChunks} Quellen.`,
        'success'
      );
    }
  } catch (error) {
    console.error('AleriaGPT retrieval export failed:', error);
    if (typeof showAppStatus === 'function') showAppStatus('AleriaGPT-Treffer konnten nicht exportiert werden.', 'error');
  } finally {
    if (trigger) {
      trigger.disabled = false;
      trigger.textContent = previousText;
    }
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-aleria-gpt-action]');
  if (!trigger) return;
  const action = trigger.dataset.aleriaGptAction;
  if (action !== 'export-context' && action !== 'export-retrieval') return;
  event.preventDefault();
  if (action === 'export-context') {
    exportAleriaGptContextFromTrigger(trigger);
    return;
  }
  exportAleriaGptRetrievalFromTrigger(trigger);
});

window.exportAleriaGptContext = async function exportAleriaGptContext(options = {}) {
  const payload = await window.AleriaGptContext.buildContext(options);
  downloadAleriaGptJson(payload, getAleriaGptContextFilename(payload));
  return payload;
};

window.exportAleriaGptRetrieval = async function exportAleriaGptRetrieval(query, options = {}) {
  const payload = await window.AleriaGptRetrieval.retrieve(query, options);
  downloadAleriaGptJson(payload, getAleriaGptRetrievalFilename(payload));
  return payload;
};
