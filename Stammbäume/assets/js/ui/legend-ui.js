import { FAMILY_ROLES, DEFAULT_RELATIONSHIP_COLORS, PARTNERSHIP_LABELS } from '../config/family-colors.js';
import { escapeHtml } from './dom.js';

export function renderFamilyLegend(container) {
  container.innerHTML = Object.values(FAMILY_ROLES).map(role => `
    <span class="legend-item ${role.cssClass}" title="${escapeHtml(role.description)}">
      <span class="legend-swatch" aria-hidden="true"></span>
      ${escapeHtml(role.label)}
    </span>
  `).join('');
}

export function renderFamilyReadingGuide(container) {
  if (!container) return;
  container.innerHTML = `
    <p><strong>Beziehungen lesen</strong><br>Ein beschrifteter Beziehungsknoten verbindet jedes örtliche Paar mit seinen gemeinsamen Kindern. Er nennt Beziehungstyp und belegte Zeitangaben. Knoten wählen öffnet diese Verbindung in der Beziehungsübersicht. Ein Punkt markiert einen gemeinsamen Abzweig; ein heller Ring eine kreuzende, unabhängige Linie.</p>
    <div class="chart-reading-guide__lines">${['marriage', 'engagement', 'affair', 'forced'].map(type => `
      <span><i class="chart-reading-guide__sample${['affair', 'forced'].includes(type) ? ' chart-reading-guide__sample--dashed' : ''}" style="--sample-color:${DEFAULT_RELATIONSHIP_COLORS[type]}" aria-hidden="true"></i>${escapeHtml(PARTNERSHIP_LABELS[type])}</span>
    `).join('')}</div>
    <p><strong>V1, V2 …</strong> verbinden entfernte Partner: Derselbe Verweis steht mit dem Namen des Gegenübers an beiden Karten. Kinder schließen am Verweis des näheren Elternteils an. Verweis wählen, um die Beziehungen zu öffnen.</p>
    <p>Ziehen verschiebt den Baum, das Mausrad zoomt. Eine Karte mit Maus oder Tastatur hervorheben, um ihre direkten Beziehungen nachzuverfolgen. Karte wählen öffnet die Beziehungsübersicht; das Portrait öffnet die Biographie.</p>
    <div class="chart-reading-guide__roles"></div>`;
  renderFamilyLegend(container.querySelector('.chart-reading-guide__roles'));
}

