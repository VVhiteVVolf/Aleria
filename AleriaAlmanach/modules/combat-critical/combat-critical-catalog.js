// One modest consequence per critical weapon attack, enabled by the encounter.
const entry = (name, description, recipient, change) => Object.freeze({ name, description, recipient, ...change });
export const CRITICAL_HIT_EFFECTS = Object.freeze([
  entry('Aus dem Takt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion.', 'target', { blockedResource: 'reaction' }),
  entry('Zurückgedrängt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.', 'target', { blockedResource: 'bonus-action' }),
  entry('Unsicherer Griff', 'Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken.', 'target', { attack: -1 }),
  entry('Offene Deckung', 'Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung.', 'target', { armorClass: -1 }),
  entry('Tauber Waffenarm', 'Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0.', 'target', { damage: -2 }),
  entry('Kurzer Stolperer', 'Bis zum Ende des nächsten eigenen Beitrags: −3 m Bewegung, mindestens 0.', 'target', { movement: -3 }),
  entry('Die Initiative ergriffen', 'Im nächsten eigenen Beitrag: +1 auf Waffenangriffe und Kampftechniken.', 'actor', { attack: 1 }),
  entry('Günstige Stellung', 'Bis zum Ende des nächsten eigenen Beitrags: +1 Verteidigung.', 'actor', { armorClass: 1 }),
  entry('Lücke erkannt', 'Im nächsten eigenen Beitrag: +1 Waffenschaden.', 'actor', { damage: 1 }),
  entry('Entwaffnet', 'Die geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt.', 'target', { disarm: true })
]);
export const CRITICAL_FAILURE_EFFECTS = Object.freeze([
  entry('Überstreckt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion.', 'actor', { blockedResource: 'reaction' }),
  entry('Verheddert', 'Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.', 'actor', { blockedResource: 'bonus-action' }),
  entry('Griff verrutscht', 'Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken.', 'actor', { attack: -1 }),
  entry('Flanke geöffnet', 'Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung.', 'actor', { armorClass: -1 }),
  entry('Verkrampfter Arm', 'Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0.', 'actor', { damage: -2 }),
  entry('Schlechter Stand', 'Bis zum Ende des nächsten eigenen Beitrags: −3 m Bewegung, mindestens 0.', 'actor', { movement: -3 }),
  entry('Schwung verloren', 'Im nächsten eigenen Beitrag: −1 Waffenschaden.', 'actor', { damage: -1 }),
  entry('Gegner gewarnt', 'Das Ziel erhält bis zum Ende seines nächsten eigenen Beitrags +1 Verteidigung.', 'target', { armorClass: 1 }),
  entry('Konterfenster', 'Das Ziel erhält in seinem nächsten eigenen Beitrag +1 auf Waffenangriffe und Kampftechniken.', 'target', { attack: 1 }),
  entry('Waffe entglitten', 'Die eigene geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt.', 'actor', { disarm: true })
]);

export function isCriticalWeaponResolution(resolution = {}) {
  return Boolean(getCriticalWeaponAttack(resolution));
}

export function getCriticalWeaponAttack(resolution = {}) {
  if (resolution.actionType !== 'attack' || resolution.resolutionMode !== 'weapon-attack'
    || !['weapon', 'technique'].includes(resolution.profileActionKind)) return null;
  return [resolution.attack, ...(resolution.followUpAttacks || []).map(followUp => followUp.attack)]
    .find(attack => attack?.criticalFailure === true || attack?.criticalSuccess === true && attack?.hit === true) || null;
}
