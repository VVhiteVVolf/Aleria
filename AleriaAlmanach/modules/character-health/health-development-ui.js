import { getHealthTraitOrigin } from './health-trait-catalog.js';
export const HEALTH_TRAIT_FILTERS = { affliction: 'Dauerhafte Leiden', fever: 'Arkanistenfieber', addiction: 'Abhängigkeiten', tolerance: 'Substanztoleranz' };
export function healthCategoryNote(group) {
  return ({ affliction: 'Diese 30 dauerhaften Leiden werden nicht durch TP-Heilung, Rast oder das Ende eines vorübergehenden Zustands entfernt. Hilfsmittel und alternative Vorgehensweisen werden individuell berücksichtigt. Rein unmögliche Sinnes- oder Handaufgaben benötigen eine geeignete Alternative.',
    fever: 'Die vier Hauptstadien folgen dem Almanach-Modul. Anzeichen und erste Symptome sind vorgeschaltete Spielausprägungen. Nur die stärkste gewählte Stufe wirkt; sie ersetzt frühere Stufen. Die Druidenvariante verläuft ohne Nekrose. Ein Fortschritt wird bewusst eingetragen, niemals allein durch einen Ladevorgang oder eine frei erfundene Frist.',
    addiction: 'Je Stoff gilt nur das höchste Stadium. Nur der passende aktive Rausch unterdrückt Entzugsabzüge; Angetrunkenheit unterhalb der Schwelle und Verkatert genügen nicht. Die Abhängigkeit bleibt erhalten und wird durch Konsum nicht geheilt.',
    tolerance: 'Substanztoleranz verdoppelt die nötige Wirkstoffmenge ausschließlich für den genannten Stoff. Sie gibt keine allgemeine Giftresistenz und mindert weder Nachwirkungen noch das Risiko des Arkanistenfiebers.' })[group] || '';
}
export function healthTraitSourceMarkup(trait) {
  const origin = getHealthTraitOrigin(trait);
  if (!origin) return '';
  return origin.referenceUrl ? '<small><a href="/AleriaAlmanach/AleriaAlmanach.html?entry=arkanistenfieber" target="_blank" rel="noopener">Arkanistenfieber-Modul ↗</a> · Hauptstadien I–IV</small>'
    : '<small>Individuelles dauerhaftes Merkmal · Heilung und Rast entfernen es nicht.</small>';
}
