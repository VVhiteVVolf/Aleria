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
    'Fasse die wichtigsten Ereignisse, Entscheidungen und Ergebnisse dieses Szenenverlaufs als kurze Stichpunktliste zusammen (maximal 8 Punkte, je ein Satz).',
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
      answerStyle: 'short',
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
}
