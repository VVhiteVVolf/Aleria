function cleanNarrationField(value, maxLength = 14000) {
  return String(value || '').trim().slice(0, maxLength);
}

function getPrimaryDiceTerm(roll = {}) {
  return (Array.isArray(roll.terms) ? roll.terms : []).find(term => term?.kind === 'dice') || null;
}

export function getSceneDiceOutcomeProfile(roll = {}) {
  const natural = Number(roll.natural);
  const primaryTerm = getPrimaryDiceTerm(roll);
  const primarySides = Number(primaryTerm?.sides) || 0;
  let ratio = null;
  if (Number.isFinite(natural) && natural > 0 && primarySides > 0) {
    ratio = natural / primarySides;
  } else if (Array.isArray(roll.keptDice) && roll.keptDice.length && primarySides > 0) {
    const keptTotal = roll.keptDice.map(Number).filter(Number.isFinite).reduce((sum, value) => sum + value, 0);
    ratio = keptTotal / (roll.keptDice.length * primarySides);
  }

  const bounded = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0.5;
  const label = bounded <= 0.2
    ? 'sehr niedrig'
    : bounded <= 0.4
      ? 'niedrig'
      : bounded <= 0.6
        ? 'durchwachsen'
        : bounded <= 0.8
          ? 'hoch'
          : 'sehr hoch';
  return {
    ratio: bounded,
    label,
    natural: Number.isFinite(natural) && natural > 0 ? natural : null,
    total: Number(roll.total) || 0,
    primarySides
  };
}

export function buildSceneDiceNarrationQuery({ roll = {}, participant = {}, snapshot = {}, situation = '' } = {}) {
  const outcome = getSceneDiceOutcomeProfile(roll);
  const actorName = cleanNarrationField(participant.name || roll.roller || 'Die Szene', 80);
  const purpose = cleanNarrationField(roll.purpose || 'allgemeine Probe', 140);
  const sceneSituation = cleanNarrationField(situation || roll.situation || '', 900);
  const resultLine = outcome.natural !== null
    ? `${outcome.natural} auf W${outcome.primarySides}; Gesamtergebnis ${outcome.total}`
    : `Gesamtergebnis ${outcome.total} bei ${cleanNarrationField(roll.formula, 100)}`;

  return [
    'Erstelle die kurze erzählerische Auswertung eines Würfelwurfs in einer interaktiven Aleria-Szene.',
    'Schreibe ausschließlich als neutraler Erzähler in der dritten Person, niemals aus Figurenperspektive.',
    `Handelnde Figur: ${actorName}`,
    `Probe/Anlass: ${purpose}`,
    `Würfelergebnis: ${resultLine}`,
    `Ergebnisqualität: ${outcome.label}`,
    sceneSituation ? `Vom Nutzer gesetzter Situationskontext: ${sceneSituation}` : 'Kein zusätzlicher Situationskontext wurde angegeben.',
    snapshot.moduleTitle ? `Aktuelles Modul: ${cleanNarrationField(snapshot.moduleTitle, 160)}` : '',
    snapshot.pageTitle ? `Aktuelle Szene/Seite: ${cleanNarrationField(snapshot.pageTitle, 160)}` : '',
    '',
    'Pflichtkontext – aktuelle Seite:',
    cleanNarrationField(snapshot.pageText, 9000) || 'Kein Seitentext verfügbar.',
    '',
    'Pflichtkontext – bisheriger Szenenverlauf in Reihenfolge:',
    cleanNarrationField(snapshot.transcript, 14000) || 'Noch keine kommentierten Szenenbeiträge.',
    '',
    'Regeln:',
    '- Der gesetzte Situationskontext, das Ergebnis und der bisherige Szenenverlauf haben Vorrang vor allgemeinen Almanach-Treffern.',
    '- Beschreibe nur beobachtbare Folgen, Wahrnehmungen oder ausbleibende Erkenntnisse. Erfinde kein verborgenes Wissen.',
    '- Bei einem niedrigen Ergebnis bleibt Entscheidendes unbemerkt oder unsicher; verrate nicht, was tatsächlich verborgen ist.',
    '- Keine Gedanken, Gefühle, Absichten oder wörtliche Rede der Figur erfinden.',
    '- Keine Ich-Perspektive, kein Rollenspiel aus Sicht der Figur und keine Erklärung der Würfelmechanik.',
    '- Ein kurzer Absatz mit 1 bis 3 Sätzen, höchstens 500 Zeichen.',
    '- Gib ausschließlich den fertigen Erzähltext aus, ohne Überschrift, Quellen oder Vorbemerkung.'
  ].filter(Boolean).join('\n');
}

export function enrichSceneDiceNarrationRetrieval(retrieval = {}, { participant = {}, snapshot = {}, situation = '' } = {}) {
  const promptContext = [
    'Szenenwurf-Pflichtkontext',
    `Handelnde Figur: ${cleanNarrationField(participant.name, 80) || 'Die Szene'}`,
    situation ? `Situationskontext: ${cleanNarrationField(situation, 900)}` : '',
    snapshot.moduleTitle ? `Modul: ${cleanNarrationField(snapshot.moduleTitle, 160)}` : '',
    snapshot.pageTitle ? `Szene/Seite: ${cleanNarrationField(snapshot.pageTitle, 160)}` : '',
    '',
    'Aktuelle Seite:',
    cleanNarrationField(snapshot.pageText, 9000) || 'Kein Seitentext verfügbar.',
    '',
    'Geordneter Szenenverlauf:',
    cleanNarrationField(snapshot.transcript, 14000) || 'Noch keine kommentierten Szenenbeiträge.',
    '',
    'Erzählregel: neutraler Erzähler, dritte Person, keine erfundenen Innenzustände oder verborgenen Fakten.'
  ].filter(Boolean).join('\n');

  const requiredChunks = [
    {
      sourceType: 'current-scene-page',
      sourceRef: `scene-dice:page:${snapshot.moduleId || 'current'}`,
      moduleId: snapshot.moduleId || '',
      moduleTitle: snapshot.moduleTitle || '',
      pageTitle: snapshot.pageTitle || '',
      speakerName: '',
      kind: 'required-current-scene',
      score: 10000,
      text: cleanNarrationField(snapshot.pageText, 9000) || 'Kein Seitentext verfügbar.'
    },
    {
      sourceType: 'current-scene-comments',
      sourceRef: `scene-dice:thread:${snapshot.threadId || 'current'}`,
      moduleId: snapshot.moduleId || '',
      moduleTitle: snapshot.moduleTitle || '',
      pageTitle: snapshot.pageTitle || '',
      speakerName: participant.name || '',
      kind: 'required-ordered-scene-comments',
      score: 9999,
      text: cleanNarrationField(snapshot.transcript, 14000) || 'Noch keine kommentierten Szenenbeiträge.'
    }
  ];

  return {
    ...(retrieval || {}),
    promptContext: [promptContext, retrieval?.promptContext || '']
      .filter(Boolean)
      .join('\n\n--- Weitere Almanach-Treffer ---\n\n'),
    chunks: [
      ...requiredChunks,
      ...((retrieval?.chunks || []).filter(chunk =>
        chunk?.sourceType !== 'current-scene-page'
        && chunk?.sourceType !== 'current-scene-comments'
      ))
    ],
    stats: {
      ...(retrieval?.stats || {}),
      requiredSceneContextIncluded: true
    }
  };
}

export function cleanSceneDiceNarration(value) {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:\w+)?\s*/i, '').replace(/\s*```$/i, '').trim();
  text = text.replace(/^\s*(?:Erzähltext|Beschreibung|Auswertung)\s*:\s*/i, '').trim();
  text = text.replace(/\n{2,}/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 700);
}
