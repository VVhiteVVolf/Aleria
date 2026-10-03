// One modest consequence per critical weapon attack, enabled by the encounter.
const entry = (name, description, recipient, change) => Object.freeze({ name, description, recipient, ...change });
export const CRITICAL_CONSEQUENCE_DIE = 20;
export const CRITICAL_CONSEQUENCE_VERSION = 2;
export const CRITICAL_HIT_EFFECTS = Object.freeze([
  entry('Aus dem Takt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion.', 'target', { blockedResource: 'reaction' }),
  entry('Zurückgedrängt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.', 'target', { blockedResource: 'bonus-action' }),
  entry('Unsicherer Griff', 'Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken.', 'target', { attack: -1 }),
  entry('Offene Deckung', 'Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung.', 'target', { armorClass: -1 }),
  entry('Tauber Waffenarm', 'Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0.', 'target', { damage: -2 }),
  entry('Kurzer Stolperer', '−1 auf den nächsten eigenen Waffen-/Technikangriff; verfällt spätestens am Ende des nächsten eigenen Beitrags.', 'target', { nextAttackPenalty: true }),
  entry('Die Initiative ergriffen', 'Im nächsten eigenen Beitrag: +1 auf Waffenangriffe und Kampftechniken.', 'actor', { attack: 1 }),
  entry('Günstige Stellung', 'Bis zum Ende des nächsten eigenen Beitrags: +1 Verteidigung.', 'actor', { armorClass: 1 }),
  entry('Lücke erkannt', 'Im nächsten eigenen Beitrag: +1 Waffenschaden.', 'actor', { damage: 1 }),
  entry('Entwaffnet', 'Die geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt.', 'target', { disarm: true }),
  entry('Zu Boden gebracht', 'Liegend: Im nächsten eigenen Beitrag keine Bonusaktion; keine weiteren Bewegungs- oder Angriffsmali.', 'target', { blockedResource: 'bonus-action', prone: true }),
  entry('Nachwirkender Treffer', 'Zu Beginn der nächsten zwei eigenen Beiträge jeweils 1 TP Verlust; höchstens 2 TP, ohne Rüstungsschutz oder Verstärkung.', 'target', { periodicHitPointLoss: 1, duration: 2 }),
  entry('Verunsichert', 'Der nächste eigene Waffen-/Technikangriff hat Nachteil.', 'target', { once: { rollMode: 'disadvantage' } }),
  entry('Angriff gelesen', 'Der nächste eigene Waffen-/Technikangriff gegen dieses Ziel hat Vorteil.', 'actor', { once: { rollMode: 'advantage' }, opponent: true }),
  entry('Präzise nachsetzen', 'Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel verursacht +2 Schaden; nicht nochmals verdoppelt.', 'actor', { once: { damageModifier: 2 }, opponent: true }),
  entry('Abgefangener Schwung', 'Der nächste eingehende Waffen-/Techniktreffer verursacht 2 Schaden weniger, mindestens 0.', 'actor', { once: { damageReduction: 2 }, incoming: true }),
  entry('Schutz umgangen', 'Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel ignoriert 1 Punkt Schadensreduktion; keine RK-Änderung.', 'actor', { once: { damageReductionBypass: 1 }, opponent: true }),
  entry('Angeschlagenes Gleichgewicht', '−2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik.', 'target', { once: { savingThrowModifier: -2 }, save: true }),
  entry('Kampfesmut', '2 temporäre TP, nicht additiv; ein höherer Vorrat bleibt bestehen. Der neue Vorrat verfällt nach dem nächsten eigenen Beitrag.', 'actor', { temporaryHitPoints: 2 }),
  entry('Gefestigter Stand', '+2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik.', 'actor', { once: { savingThrowModifier: 2 }, save: true })
]);
export const CRITICAL_FAILURE_EFFECTS = Object.freeze([
  entry('Überstreckt', 'Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion.', 'actor', { blockedResource: 'reaction' }),
  entry('Verheddert', 'Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.', 'actor', { blockedResource: 'bonus-action' }),
  entry('Griff verrutscht', 'Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken.', 'actor', { attack: -1 }),
  entry('Flanke geöffnet', 'Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung.', 'actor', { armorClass: -1 }),
  entry('Verkrampfter Arm', 'Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0.', 'actor', { damage: -2 }),
  entry('Schlechter Stand', '−1 auf den nächsten eigenen Waffen-/Technikangriff; verfällt spätestens am Ende des nächsten eigenen Beitrags.', 'actor', { nextAttackPenalty: true }),
  entry('Schwung verloren', 'Im nächsten eigenen Beitrag: −1 Waffenschaden.', 'actor', { damage: -1 }),
  entry('Gegner gewarnt', 'Das Ziel erhält bis zum Ende seines nächsten eigenen Beitrags +1 Verteidigung.', 'target', { armorClass: 1 }),
  entry('Konterfenster', 'Das Ziel erhält in seinem nächsten eigenen Beitrag +1 auf Waffenangriffe und Kampftechniken.', 'target', { attack: 1 }),
  entry('Waffe entglitten', 'Die eigene geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt.', 'actor', { disarm: true }),
  entry('Gestürzt', 'Liegend: Im nächsten eigenen Beitrag keine Bonusaktion; keine weiteren Bewegungs- oder Angriffsmali.', 'actor', { blockedResource: 'bonus-action', prone: true }),
  entry('Unglücklich belastet', 'Zu Beginn des nächsten eigenen Beitrags einmalig 1 TP Verlust, ohne Rüstungsschutz oder Verstärkung.', 'actor', { periodicHitPointLoss: 1 }),
  entry('Vorhersehbar geworden', 'Der nächste Waffen-/Technikangriff dieses Gegners gegen dich hat Vorteil.', 'actor', { once: { rollMode: 'advantage' }, incoming: true, opponent: true }),
  entry('Hektischer Anschluss', 'Der nächste eigene Waffen-/Technikangriff kann keinen Vorteil erhalten; vorhandener Nachteil bleibt bestehen.', 'actor', { once: { preventAdvantage: true } }),
  entry('Unsicher auf den Beinen', '−2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik.', 'actor', { once: { savingThrowModifier: -2 }, save: true }),
  entry('Deckung falsch gesetzt', 'Der nächste Waffen-/Technikangriff dieses Gegners gegen dich erhält +2 Angriff.', 'actor', { once: { attackModifier: 2 }, incoming: true, opponent: true }),
  entry('Gut abgefangen', 'Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel verursacht 2 Schaden weniger, mindestens 0.', 'actor', { once: { damageModifier: -2 }, opponent: true }),
  entry('Schwacher Anschluss', 'Der nächste eigene Waffen-/Techniktreffer verursacht 2 Schaden weniger, mindestens 0.', 'actor', { once: { damageModifier: -2 } }),
  entry('Konterchance verspielt', 'Bis zum Ende des nächsten eigenen Beitrags lösen Haltungen keine automatischen Konter aus. Die Reaktion bleibt anderweitig verfügbar.', 'actor', { blockPreparedCounter: true }),
  entry('Absicht durchschaut', 'Das Ziel erhält +2 auf seinen nächsten STÄ-/GES-Rettungswurf gegen eine deiner Waffen-/Kampftechniken.', 'target', { once: { savingThrowModifier: 2 }, save: true, opponent: true })
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
