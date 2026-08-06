// AleriaGPT-Gedächtnisstütze für das Fazit-Werkzeug: liest den Szenenverlauf und schlägt die
// wichtigsten Punkte als Stichpunktliste vor. Erstellt bewusst nichts von selbst — der Erzähler
// baut die Symbolzeilen weiterhin von Hand, die Liste ist nur eine Erinnerungshilfe.
function setFazitHintStatus(message = '', type = 'info') {
  const status = document.getElementById('fz-hint-status');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = String(message || '');
}

function renderFazitHintResult(text) {
  const host = document.getElementById('fz-hint-result');
  if (!host) return;
  const items = String(text || '')
    .split(/\r?\n/)
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  host.innerHTML = items.length
    ? `<ul class="fazit-hint-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
}

function fazitTranscriptLine(comment) {
  const speaker = comment.narrator ? 'Erzähler' : String(comment.charName || 'Unbekannt');
  const text = String(comment.text || '').trim();
  return text ? `${speaker}: ${text}` : '';
}

function buildFazitTranscript(comments) {
  const lines = (Array.isArray(comments) ? comments : [])
    .filter(comment => !getCommentFazitItem(comment))
    .map(fazitTranscriptLine)
    .filter(Boolean)
    .slice(-140);
  let text = lines.join('\n');
  if (text.length > 14000) text = text.slice(-14000);
  return text;
}

function buildFazitHintQuery() {
  return [
    'Filtere aus diesem Szenenverlauf ausschließlich verbindliche, folgenreiche Beschlüsse heraus - keine Stimmungsbeschreibung, keine beiläufigen Dialoge, keine Nebensächlichkeiten.',
    'Nimm nur auf: getroffene Entscheidungen und Urteile, Verlobungen/Vermählungen, Personen, die in Dienst genommen, entlassen oder befördert wurden (z.B. als Ritter, Knappe, Vogt), Schulden die beglichen oder erlassen wurden, Besitz/Lehen/Titel die vergeben oder entzogen wurden, sowie Bündnisse oder Eide.',
    'Wenn eine Zeile keinem dieser Fälle eindeutig zuzuordnen ist, lass sie weg - lieber wenige harte Fakten als viele beliebige Details.',
    'Maximal 8 Punkte, je ein knapper Satz mit den handelnden Personen und dem konkreten Ergebnis.',
    'Das ist nur eine Gedächtnisstütze für den Erzähler, der daraus danach selbst ein Fazit mit Symbolen baut - erfinde keine Ereignisse, die nicht im Verlauf stehen.',
    'Antworte ausschließlich als einfache Liste mit "- " am Zeilenanfang, ohne Einleitung und ohne Schlusssatz.'
  ].join(' ');
}

const FAZIT_HINT_STATUS_LABELS = {
  401: 'Anmeldung abgelaufen',
  403: 'Nicht freigeschaltet (Origin-Sperre)',
  413: 'Anfrage zu groß',
  429: 'Rate-Limit erreicht',
  502: 'Modell-Anbieter antwortet nicht',
  503: 'Worker nicht konfiguriert'
};

// Zeigt die tatsächliche Worker-/Provider-Fehlermeldung mit an (nicht nur eine generische
// Kategorie), damit sich Cloudflare-seitige Ursachen (fehlendes Secret, OpenRouter-Guthaben,
// Rate-/Budget-Limit) direkt am Text erkennen lassen, statt raten zu müssen.
function describeFazitHintError(response) {
  if (response?.status === 'not-configured') return 'AleriaGPT ist noch nicht mit dem Worker verbunden.';
  if (response?.status === 'unauthenticated') return 'Nicht angemeldet — bitte neu einloggen und erneut versuchen.';
  const label = FAZIT_HINT_STATUS_LABELS[response?.status];
  const detail = String(response?.raw?.error || '').trim();
  const parts = [label, detail].filter(Boolean);
  return parts.length
    ? `Die KI-Zusammenfassung konnte nicht erstellt werden — ${parts.join(': ')}`
    : 'Die KI-Zusammenfassung konnte nicht erstellt werden (leere Antwort).';
}

async function requestFazitHints() {
  const btn = document.getElementById('fz-hint-btn');
  const threadId = typeof getCurrentCommentThreadId === 'function' ? getCurrentCommentThreadId() : '';
  if (!threadId) {
    setFazitHintStatus('Kein aktiver Szenenverlauf gefunden.', 'error');
    return;
  }
  if (!window.AleriaGptClient?.isConfigured?.()) {
    setFazitHintStatus('AleriaGPT ist noch nicht mit dem Worker verbunden.', 'error');
    return;
  }
  const comments = typeof getCachedCommentsForThread === 'function' ? getCachedCommentsForThread(threadId) : [];
  const transcript = buildFazitTranscript(comments);
  if (!transcript) {
    setFazitHintStatus('Für diese Szene gibt es noch zu wenig Verlauf für eine KI-Zusammenfassung.', 'error');
    return;
  }

  if (btn) btn.disabled = true;
  setFazitHintStatus('AleriaGPT liest den Szenenverlauf …', 'loading');
  renderFazitHintResult('');

  const retrieval = {
    sourceHash: `fazit-hint:${threadId}:${comments.length}`,
    detected: {},
    stats: { commentCount: comments.length },
    promptContext: `Szenenverlauf (chronologisch, Erzähler und Figuren):\n${transcript}`,
    chunks: []
  };

  try {
    const response = await window.AleriaGptClient.sendChat(buildFazitHintQuery(), retrieval, {
      responseMode: 'summary',
      answerStyle: 'deep',
      timeoutMs: 45000
    });
    if (!response?.ok || !response.text) {
      console.warn('fazit hint request not ok:', response);
      setFazitHintStatus(describeFazitHintError(response), 'error');
      return;
    }
    renderFazitHintResult(response.text);
    setFazitHintStatus('Vorschläge erstellt — dienen nur als Erinnerung, das Fazit baust du selbst.', 'ready');
  } catch (error) {
    console.error('fazit hint request failed:', error);
    setFazitHintStatus('Die KI-Zusammenfassung konnte nicht erstellt werden (Netzwerkfehler oder Zeitüberschreitung).', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function resetFazitHintPanel() {
  setFazitHintStatus('');
  renderFazitHintResult('');
  resetFazitChat();
}

// Freier Chat mit AleriaGPT ueber genau diese Szene - ergaenzend zur Stichpunktliste, fuer
// gezielte Nachfragen ("Wer hat sich verlobt?", "Welche Urteile wurden gefaellt?"). Verlauf
// bleibt nur fuer die Dauer des Dialogs im Speicher, wird nirgends gespeichert.
let _fazitChatMessages = [];

function renderFazitChatMessages() {
  const host = document.getElementById('fz-chat-messages');
  if (!host) return;
  if (!_fazitChatMessages.length) {
    host.innerHTML = '<p class="fazit-chat-empty">Frag zum Beispiel: „Wer hat sich in dieser Szene verlobt?" oder „Welche Urteile wurden gefällt?"</p>';
    return;
  }
  host.innerHTML = _fazitChatMessages.map(message => `
    <div class="fazit-chat-message fazit-chat-message-${message.role}">
      <strong>${message.role === 'user' ? 'Du' : 'AleriaGPT'}</strong>
      <p>${escapeHtml(message.text)}</p>
    </div>`).join('');
  host.scrollTop = host.scrollHeight;
}

function toggleFazitChat() {
  const panel = document.getElementById('fz-chat-panel');
  const toggle = document.getElementById('fz-chat-toggle-btn');
  if (!panel) return;
  panel.hidden = !panel.hidden;
  if (toggle) toggle.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) {
    renderFazitChatMessages();
    document.getElementById('fz-chat-input')?.focus();
  }
}

function buildFazitChatHistoryText() {
  return _fazitChatMessages.slice(-8).map(message => `${message.role === 'user' ? 'Nutzer' : 'AleriaGPT'}: ${message.text}`).join('\n');
}

function buildFazitChatQuery(question) {
  return [
    `Beantworte diese Frage zu dieser Szene direkt und konkret: ${question}`,
    'Nutze ausschließlich den gelieferten Szenenverlauf (und den bisherigen Chat in diesem Fenster, falls vorhanden). Erfinde nichts, was dort nicht steht.',
    'Wenn die Antwort im Verlauf nicht eindeutig zu finden ist, sag das klar, statt zu raten.'
  ].join(' ');
}

async function sendFazitChatMessage() {
  const input = document.getElementById('fz-chat-input');
  const sendBtn = document.getElementById('fz-chat-send-btn');
  const question = String(input?.value || '').trim();
  if (!question) return;
  const threadId = typeof getCurrentCommentThreadId === 'function' ? getCurrentCommentThreadId() : '';
  if (!threadId) return;

  _fazitChatMessages.push({ role: 'user', text: question });
  if (input) input.value = '';
  renderFazitChatMessages();

  if (!window.AleriaGptClient?.isConfigured?.()) {
    _fazitChatMessages.push({ role: 'assistant', text: 'AleriaGPT ist noch nicht mit dem Worker verbunden.' });
    renderFazitChatMessages();
    return;
  }

  if (sendBtn) sendBtn.disabled = true;
  if (input) input.disabled = true;

  const comments = typeof getCachedCommentsForThread === 'function' ? getCachedCommentsForThread(threadId) : [];
  const transcript = buildFazitTranscript(comments);
  const history = buildFazitChatHistoryText();
  const retrieval = {
    sourceHash: `fazit-chat:${threadId}:${comments.length}`,
    detected: {},
    stats: { commentCount: comments.length },
    promptContext: [
      'Szenenverlauf (chronologisch, Erzähler und Figuren):',
      transcript || 'Kein Verlauf verfügbar.',
      history ? `\nBisheriger Chat in diesem Fenster:\n${history}` : ''
    ].join('\n')
  };

  try {
    const response = await window.AleriaGptClient.sendChat(buildFazitChatQuery(question), retrieval, {
      responseMode: 'chat',
      answerStyle: 'deep',
      timeoutMs: 45000
    });
    if (!response?.ok || !response.text) {
      console.warn('fazit chat request not ok:', response);
      _fazitChatMessages.push({ role: 'assistant', text: describeFazitHintError(response) });
    } else {
      _fazitChatMessages.push({ role: 'assistant', text: response.text });
    }
  } catch (error) {
    console.error('fazit chat request failed:', error);
    _fazitChatMessages.push({ role: 'assistant', text: 'Die Antwort konnte nicht erstellt werden (Netzwerkfehler oder Zeitüberschreitung).' });
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.disabled = false;
    renderFazitChatMessages();
    input?.focus();
  }
}

function resetFazitChat() {
  _fazitChatMessages = [];
  const panel = document.getElementById('fz-chat-panel');
  if (panel) panel.hidden = true;
  const toggle = document.getElementById('fz-chat-toggle-btn');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  const input = document.getElementById('fz-chat-input');
  if (input) input.value = '';
  renderFazitChatMessages();
}
