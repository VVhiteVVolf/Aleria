// Presentation only: select released story text and describe confirmed combat
// receipts. Stored outcomes, rolls, costs and consequences remain untouched.
import { getResolutionSceneItemEvents } from '../combat/combat-resolution-tree.js';
const ruleLanguage = [
  /\b(?:SG|RK|TP|W20|Waffenwürfel|Schadenswürfel|Würfelpool|Würfelwurf|Würfel|Würfeln|Rettungswurf|Rettung|Bonusaktion|Reaktion|Aktionsressource|Aktionspunkt|Interagieren)\b/iu,
  /\b(?:Angriffsbonus|Angriffswurf|Kritschadensregel|Kritschaden|Schadenspool|Schadensbonus|Waffenschaden|Vorteil|Nachteil|Fehlschlagsstufen|Faktor|verdoppelt|doppelten|verbraucht|Aktionskosten)\b/iu,
  /\b\d+\s*[wWdD]\s*\d+\b|[+−–-]\s*\d|\b\d+(?:[.,]\d+)?\s*(?:Punkte?\s*)?(?:Schaden|Kupfertaler|Gold|Taler|KT)\b/iu,
  /\b(?:automatisch|regulär|zusätzlich)\w*\b.*\b(?:Angriff|Waffe|Schaden|Aufnahme)\b|\bBei (?:Erfolg|Misslingen|Fehlschlag|einem Treffer)\b/iu
];
const sentences = new Intl.Segmenter('de', { granularity: 'sentence' });
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

export function isChallengeResolution(resolution = {}) {
  return String(resolution.targetChallengeId || '').startsWith('herausforderung:') || !!resolution.herausforderungTier;
}

export function challengeSceneText(value = '') {
  return [...sentences.segment(clean(value))].map(part => part.segment.trim())
    .filter(sentence => !ruleLanguage.some(pattern => pattern.test(sentence))).join(' ').slice(0, 1200);
}

function maneuverNarration(result) {
  if (result.pending) return '';
  const actor = clean(result.actorName) || 'Die angreifende Figur';
  if (result.save?.succeeded) return `${clean(result.save.actorName) || 'Die bedrohte Figur'} erkennt die Gefahr rechtzeitig und entzieht sich der gefährlichen Nähe.`;
  const resolution = result.resolution;
  if (!resolution?.attack) return '';
  const target = clean(resolution.targetName) || 'das Gegenüber';
  const pickup = result.pickup ? `${actor} bekommt die eigene Waffe wieder zu fassen und geht aus der Bewegung heraus zum Angriff über. ` : '';
  const strike = !resolution.attack.hit
    ? `${target} entgeht dem Angriff im letzten Augenblick. Die Waffe von ${actor} streicht vorbei.`
    : Number(resolution.damage?.total) === 0
      ? `${actor} trifft ${target}, doch die Wucht verliert sich an der Abwehr.`
      : `${actor} nutzt die offene Deckung und trifft ${target}.`;
  const events = getResolutionSceneItemEvents(resolution);
  const dropped = events.some(event => event.operation === 'drop' && event.sourceActorId === result.actorId);
  return pickup + strike + (dropped ? ' Im Nachsetzen entgleitet die Waffe wieder dem Griff.' : '');
}

function fallbackNarration(resolution) {
  const actor = clean(resolution.actorName || resolution.actor) || 'Die Figur';
  if (resolution.herausforderungTier === 'knapp') return `${actor} findet einen ersten Anhaltspunkt, doch das Bild bleibt unvollständig.`;
  if (resolution.outcome === 'critical-success') return `${actor} erfasst den entscheidenden Augenblick und setzt den Versuch mit außergewöhnlicher Sicherheit um.`;
  if (resolution.outcome === 'critical-failure') return `${actor} verpasst den entscheidenden Augenblick und gerät in eine gefährliche Lage.`;
  if (resolution.herausforderungSolved || resolution.outcome === 'success') return `${actor} setzt den Versuch sicher um. Die Situation entwickelt sich wie erhofft.`;
  return `${actor} findet diesmal keinen sicheren Zugang. Der entscheidende Augenblick verstreicht.`;
}

export function getChallengeNarration(resolution = {}) {
  const receipts = resolution.herausforderungCombatResults || resolution.herausforderungReward?.combatEffects || [];
  const maneuvers = receipts.filter(result => result.type === 'weapon-maneuver').map(maneuverNarration).filter(Boolean);
  if (maneuvers.length) return maneuvers.join(' ');
  return challengeSceneText(resolution.revealedText)
    || challengeSceneText(resolution.narration?.text)
    || fallbackNarration(resolution);
}
