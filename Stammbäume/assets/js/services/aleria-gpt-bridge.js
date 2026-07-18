// Dünner, immer optionaler Wrapper um window.AleriaGptClient (aus
// ../../../../AleriaAlmanach/modules/aleria-gpt/). Wird das Skript nicht geladen,
// ist der Endpunkt nicht konfiguriert oder schlägt der Aufruf fehl (Netzwerk/CORS),
// liefert diese Funktion einfach {ok:false}, statt einen Fehler zu werfen — Aufrufer
// fallen in diesem Fall lautlos auf eine lokale Alternative zurück.

export function isAleriaGptAvailable(runtime = globalThis) {
  return typeof runtime.AleriaGptClient?.sendChat === 'function'
    && runtime.AleriaGptClient.isConfigured?.() !== false;
}

export async function requestAleriaGptSuggestion(promptText, { runtime = globalThis, timeoutMs = 20000 } = {}) {
  if (!isAleriaGptAvailable(runtime)) return { ok: false, text: '' };
  try {
    const result = await runtime.AleriaGptClient.sendChat(
      promptText,
      { promptContext: promptText },
      { responseMode: 'suggestion', answerStyle: 'short', timeoutMs }
    );
    const text = String(result?.text || '').trim();
    return { ok: !!result?.ok && !!text, text };
  } catch {
    return { ok: false, text: '' };
  }
}
