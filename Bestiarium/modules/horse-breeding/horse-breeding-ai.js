const AI_ENDPOINT = 'https://proxy-production-3a62.up.railway.app/generate';
const AI_MODEL = 'google/gemini-2.0-flash-001';
const STAT_LABELS = ['Schnelligkeit', 'Ausdauer', 'Stärke', 'Agilität', 'Sozialverhalten', 'Robustheit'];

function strongestStats(stats) {
  return stats
    .map((value, index) => ({ value, label: STAT_LABELS[index] }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 2)
    .map(entry => entry.label.toLowerCase());
}

export function localBreedingInterpretation(data) {
  const [firstStrength, secondStrength] = strongestStats(data.result.stats);
  const crossName = data.crossName ? `Die Zuchtbücher könnten es als ${data.crossName} führen. ` : '';
  const talent = data.result.talentIndex >= 0
    ? `Dazu zeigt es ein seltenes Talent für ${STAT_LABELS[data.result.talentIndex].toLowerCase()}. `
    : '';
  return `Owain betrachtet das junge Tier lange, prüft Fessel, Brust und Blick und nickt schließlich. „Aus ${data.mare.name} und ${data.sire.name} kommt hier kein bloßer Mittelweg, Bursche. Vor allem ${firstStrength} und ${secondStrength} tragen ein klares Versprechen in sich. ${crossName}${talent}Gebt ihm Zeit, eine ruhige Hand und Arbeit, die zu seinem Blut passt; dann zeigt das Fohlen selbst, welcher Elternteil in ihm lauter spricht.“`;
}

export function createBreedingPrompt(data) {
  const statLine = STAT_LABELS.map((label, index) => `${label}: ${data.result.stats[index]}/10`).join(', ');
  const traits = data.result.traits.map(trait => trait.label).join(', ');
  return [
    'Du bist Owain Draig, ein direkter, herzlicher cenyrischer Ritter und erfahrener Pferdezüchter in der mittelalterlichen Fantasywelt Aleria.',
    'Deute dieses errechnete Fohlen in zwei kurzen, immersiven Absätzen auf Deutsch.',
    'Sprich wie ein Pferdekenner aus der Welt, verwende keine moderne Fachsprache und keine Aufzählung.',
    'Nenne keine Zahlen. Beschreibe stattdessen Körper, Wesen, mögliche Ausbildung und die Spannung zwischen beiden Blutlinien.',
    `Stute: ${data.mare.name}. ${data.mare.summary}`,
    `Hengst: ${data.sire.name}. ${data.sire.summary}`,
    data.crossName ? `Kreuzungsname: ${data.crossName}.` : 'Die Kreuzung ist noch unbenannt.',
    `Errechnete Werte: ${statLine}.`,
    `Erkannte Merkmale: ${traits}.`,
    `Geschätzte Lebensspanne: ${data.result.lifespan.label}.`
  ].join('\n');
}

export async function requestBreedingInterpretation(data, { fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 450,
      messages: [{ role: 'user', content: createBreedingPrompt(data) }]
    }),
    signal
  });
  if (!response.ok) throw new Error(`KI-Dienst antwortet mit HTTP ${response.status}`);
  const payload = await response.json();
  const interpretation = payload?.choices?.[0]?.message?.content?.trim();
  if (!interpretation) throw new Error('Die KI-Antwort enthält keinen Text.');
  return interpretation;
}
