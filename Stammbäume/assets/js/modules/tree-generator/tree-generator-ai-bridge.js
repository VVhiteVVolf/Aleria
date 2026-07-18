export { isAleriaGptAvailable, requestAleriaGptSuggestion } from '../../services/aleria-gpt-bridge.js';

function buildBaseContext(houseName) {
  return `Du hilfst bei der Ausarbeitung eines Fantasy-Stammbaums für "${houseName || 'ein Adelshaus'}" in der Welt Aleria (walisisch angehauchte Namensgebung).`;
}

export function buildNameSuggestionPrompt({ houseName, sex, usedNames = [] }) {
  const rolle = sex === 'female' ? 'weiblichen' : sex === 'male' ? 'männlichen' : '';
  const gemieden = usedNames.length ? ` Vermeide bereits vergebene Namen: ${usedNames.join(', ')}.` : '';
  return `${buildBaseContext(houseName)} Schlage 3 passende, walisisch klingende ${rolle} Vornamen vor, durch Komma getrennt, ohne weitere Erklärung.${gemieden}`;
}

export function buildBirthYearPrompt({ houseName, anchorLabel, anchorYear }) {
  return `${buildBaseContext(houseName)} ${anchorLabel} wurde im Jahr ${anchorYear} geboren. Schlage ein plausibles Geburtsjahr für die nächste Generation vor. Antworte nur mit der Jahreszahl.`;
}

export function buildDeathYearPrompt({ houseName, personName, birthYear }) {
  return `${buildBaseContext(houseName)} ${personName} wurde ${birthYear} geboren. Schlage ein plausibles Sterbejahr vor. Antworte nur mit der Jahreszahl.`;
}
