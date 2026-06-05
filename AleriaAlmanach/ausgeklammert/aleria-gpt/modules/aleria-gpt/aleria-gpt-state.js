const ALERIA_GPT_DEFAULT_SCOPE = 'all';

let _aleriaGptPanelState = {
  open: false,
  busy: false,
  scope: ALERIA_GPT_DEFAULT_SCOPE,
  messages: []
};

function getAleriaGptPanelState() {
  return {
    ..._aleriaGptPanelState,
    messages: _aleriaGptPanelState.messages.map(message => ({ ...message }))
  };
}

function updateAleriaGptPanelState(patch = {}) {
  _aleriaGptPanelState = {
    ..._aleriaGptPanelState,
    ...patch,
    messages: Array.isArray(patch.messages)
      ? patch.messages.map(message => ({ ...message }))
      : _aleriaGptPanelState.messages
  };
  return getAleriaGptPanelState();
}

function setAleriaGptPanelOpen(open) {
  return updateAleriaGptPanelState({ open: !!open });
}

function setAleriaGptPanelBusy(busy) {
  return updateAleriaGptPanelState({ busy: !!busy });
}

function setAleriaGptPanelScope(scope) {
  const value = String(scope || ALERIA_GPT_DEFAULT_SCOPE).trim() || ALERIA_GPT_DEFAULT_SCOPE;
  return updateAleriaGptPanelState({ scope: value });
}

function addAleriaGptMessage(message) {
  const next = [
    ..._aleriaGptPanelState.messages,
    {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      role: String(message?.role || 'assistant'),
      text: String(message?.text || ''),
      sources: Array.isArray(message?.sources) ? message.sources : [],
      createdAt: Date.now()
    }
  ];
  return updateAleriaGptPanelState({ messages: next.slice(-30) });
}

function clearAleriaGptMessages() {
  return updateAleriaGptPanelState({ messages: [] });
}

