function fallbackSkillNarration(facts = {}) {
  const actor = facts.actor || 'Die Figur';
  const skill = facts.skill || 'Fertigkeit';
  if (facts.outcome === 'critical-success') return `${actor} setzt ${skill} außergewöhnlich sicher ein und durchschaut die Situation vollständig.`;
  if (facts.outcome === 'success') return `${actor} setzt ${skill} erfolgreich ein und gewinnt einen verlässlichen Vorteil.`;
  if (facts.outcome === 'critical-failure') return `${actor} scheitert mit ${skill} auf besonders deutliche Weise und zieht einen falschen Schluss.`;
  return `${actor} findet mit ${skill} diesmal keinen sicheren Zugang zur Situation.`;
}

function cleanNarration(value) {
  return String(value || '')
    .replace(/^```(?:\w+)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^\s*(?:Erzähltext|Beschreibung|Auswertung)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 700);
}

function buildQuery(facts = {}) {
  return [
    'Schreibe 1–2 kurze, immersive Sätze als neutrale Fertigkeitsauswertung.',
    'Das bestätigte Ergebnis ist unveränderlich. Nenne keine Würfel, Formeln oder Zahlen.',
    'Erfinde keine zusätzlichen Handlungen. Bei Fehlschlag bleibt eine mögliche Täuschung ausdrücklich unbestätigt.',
    `Fakten: ${JSON.stringify({
      actor: facts.actor,
      skill: facts.skill,
      outcome: facts.outcome,
      attempt: String(facts.attempt || '').slice(0, 500),
      targetActor: facts.targetActor || '',
      targetContribution: String(facts.targetContribution || '').slice(0, 800)
    })}`
  ].join('\n');
}

function enrichRetrieval(retrieval = {}, facts = {}) {
  const profileContext = ['VERBINDLICHER FIGURENBOGEN', JSON.stringify(facts.actorProfileSnapshot || null, null, 2)].join('\n');
  return {
    ...(retrieval || {}),
    promptContext: [profileContext, retrieval?.promptContext || ''].filter(Boolean).join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [{
      sourceType: 'skill-profile-snapshot',
      sourceRef: `skill-resolution:${facts.actorId || 'actor'}`,
      characterId: facts.actorId || '',
      speakerName: facts.actor || '',
      kind: 'required-skill-profile-snapshot',
      score: 10002,
      text: profileContext
    }, ...(retrieval?.chunks || []).filter(chunk => chunk?.sourceType !== 'skill-profile-snapshot')],
    stats: { ...(retrieval?.stats || {}), requiredSkillProfileIncluded: true }
  };
}

export async function narrateSkillResolution(facts = {}) {
  const fallback = fallbackSkillNarration(facts);
  if (!globalThis.AleriaGptClient?.isConfigured?.() || !globalThis.AleriaGptRetrieval?.retrieve) {
    return { text: fallback, source: 'deterministic', reason: 'aleria-gpt-unavailable' };
  }
  try {
    const query = buildQuery(facts);
    const retrieval = await globalThis.AleriaGptRetrieval.retrieve(query, {
      scope: 'module',
      characterId: facts.actorId || '',
      limit: 12
    });
    const response = await globalThis.AleriaGptClient.sendChat(query, enrichRetrieval(retrieval, facts), {
      responseMode: 'skill-resolution-narration-v1',
      answerStyle: 'short',
      sourceLimit: 12,
      timeoutMs: 45000
    });
    const text = cleanNarration(response?.text);
    return response?.ok && text
      ? { text, source: 'aleria-gpt' }
      : { text: fallback, source: 'deterministic', reason: response?.ok ? 'empty-response' : 'request-rejected' };
  } catch (error) {
    return { text: fallback, source: 'deterministic', reason: error?.name === 'AbortError' ? 'request-timeout' : 'request-failed' };
  }
}

export const skillNarrationInternals = Object.freeze({ fallbackSkillNarration, cleanNarration, buildQuery, enrichRetrieval });
