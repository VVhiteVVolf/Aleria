function fallbackNarration(facts = {}) {
  if (facts.criticalFailure) return `${facts.actor} setzt zum Angriff an, doch ${facts.target} entgeht dem Versuch vollständig.`;
  if (!facts.hit) return `${facts.target} entzieht sich dem Angriff von ${facts.actor}, bevor ${facts.weapon || 'die Waffe'} Wirkung entfalten kann.`;
  if (facts.critical) return `${facts.actor} findet eine seltene Öffnung. Der Angriff mit ${facts.weapon || 'der Waffe'} trifft ${facts.target} mit außergewöhnlicher Präzision.`;
  return `${facts.actor} überwindet die Verteidigung von ${facts.target}; ${facts.weapon || 'der Angriff'} trifft wirksam.`;
}

function cleanNarration(value) {
  return String(value || '')
    .replace(/^```(?:\w+)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^\s*(?:Erzähltext|Beschreibung)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 700);
}

function enrichCombatNarrationRetrieval(retrieval = {}, facts = {}) {
  const combatContext = [
    'VERBINDLICHE KAMPFPROFIL-SNAPSHOTS',
    JSON.stringify({
      actorCombatProfile: facts.actorCombatProfile || null,
      targetCombatProfile: facts.targetCombatProfile || null
    }, null, 2)
  ].join('\n');
  return {
    ...(retrieval || {}),
    promptContext: [combatContext, retrieval?.promptContext || ''].filter(Boolean).join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [{
      sourceType: 'combat-profile-snapshots',
      sourceRef: `combat-resolution:${facts.actorId || 'actor'}:${facts.targetId || 'target'}`,
      moduleId: '',
      moduleTitle: '',
      pageTitle: '',
      speakerName: facts.actor || '',
      kind: 'required-combat-profile-snapshots',
      score: 10002,
      text: combatContext
    }, ...(retrieval?.chunks || []).filter(chunk => chunk?.sourceType !== 'combat-profile-snapshots')],
    stats: { ...(retrieval?.stats || {}), requiredCombatProfilesIncluded: true }
  };
}

function buildCombatNarrationQuery(facts = {}) {
  const instructions = [
    'Schreibe 1–3 kurze, immersive Sätze als neutraler Erzähler über die bestätigte Folge dieser Kampfhandlung.',
    'Die Fakten sind unveränderlich. Erfinde keinen weiteren Angriff, keine Flucht, Verstümmelung, Bewusstlosigkeit, dauerhafte Verletzung oder Tod.',
    'Berücksichtige relevante Attribute, Zustände, Marotten, Ausrüstung, Ressourcen, Fähigkeiten, Magie und Notizen aus dem Pflichtkontext. Strukturierte Modifikatoren sind bereits verrechnet und dürfen nicht doppelt zählen.',
    'Greife Stil und Absicht der Kampfbeschreibung auf, ohne deren behauptetes Ergebnis zu übernehmen. Nenne keine Würfel, Formeln oder Zahlen. Ausgabe nur als Erzählertext.'
  ].join('\n');
  const payload = {
    actor: facts.actor,
    target: facts.target,
    weapon: facts.weapon,
    hit: facts.hit,
    critical: facts.critical,
    criticalFailure: facts.criticalFailure,
    damage: facts.damage,
    originalDescription: ''
  };
  const prefix = `${instructions}\nBestätigte Fakten: `;
  const emptyPayload = JSON.stringify(payload);
  const availableDescriptionLength = Math.max(0, 1180 - prefix.length - emptyPayload.length);
  payload.originalDescription = String(facts.originalDescription || '').slice(0, availableDescriptionLength);
  let query = `${prefix}${JSON.stringify(payload)}`;
  while (query.length > 1180 && payload.originalDescription) {
    payload.originalDescription = payload.originalDescription.slice(0, Math.max(0, payload.originalDescription.length - (query.length - 1180) - 1));
    query = `${prefix}${JSON.stringify(payload)}`;
  }
  return query;
}

export async function narrateCombatResolution(facts = {}) {
  const fallback = fallbackNarration(facts);
  if (!globalThis.AleriaGptClient?.isConfigured?.() || !globalThis.AleriaGptRetrieval?.retrieve) {
    return { text: fallback, source: 'deterministic', reason: 'aleria-gpt-unavailable' };
  }
  try {
    const query = buildCombatNarrationQuery(facts);
    const retrieval = await globalThis.AleriaGptRetrieval.retrieve(query, {
      scope: 'module',
      characterId: facts.actorId || '',
      limit: 20
    });
    const enrichedRetrieval = enrichCombatNarrationRetrieval(retrieval, facts);
    const response = await globalThis.AleriaGptClient.sendChat(query, enrichedRetrieval, {
      responseMode: 'combat-resolution-narration-v2',
      answerStyle: 'short',
      sourceLimit: 20,
      timeoutMs: 45000
    });
    const text = cleanNarration(response?.text);
    return response?.ok && text
      ? { text, source: 'aleria-gpt' }
      : { text: fallback, source: 'deterministic', reason: response?.ok ? 'empty-response' : 'request-rejected' };
  } catch (error) {
    return {
      text: fallback,
      source: 'deterministic',
      reason: error?.name === 'AbortError' ? 'request-timeout' : 'request-failed'
    };
  }
}

export const combatNarrationInternals = Object.freeze({
  fallbackNarration,
  cleanNarration,
  enrichCombatNarrationRetrieval,
  buildCombatNarrationQuery
});
