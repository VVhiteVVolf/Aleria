const guides = new Map([
  ['bSYZYAEOwiRgy44f6OmO', 'ylva'],
  ['person--haus-wolfshorn--ylva-wolfshorn', 'ylva'],
  ['person--haus-wyrm--gais-wyrm', 'gais']
]);

export function getCharacterGameplayGuide(character = {}) {
  const slug = guides.get(character.id) || guides.get(character.genealogy?.worldPersonId);
  return slug ? `/Gameplay%20Guide/${slug}.html` : '';
}

export function renderCharacterGameplayGuideLink(character) {
  const href = getCharacterGameplayGuide(character);
  return href ? `<a class="cp-gameplay-guide-link" href="${href}" target="_blank" rel="noopener" title="Gameplay Guide öffnen" aria-label="Gameplay Guide öffnen – Taktik, Techniken und Gefährten (neuer Tab)"><img src="/Gameplay%20Guide/assets/gameplay-guide-icon-ui-v2.png" width="96" height="96" alt="" decoding="async"></a>` : '';
}
