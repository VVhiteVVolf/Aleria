import { describeEncounterOutcome, ENCOUNTER_REASON_LABELS } from '../combat/combat-encounter-outcome.js';

export function escapeEncounterMarkup(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const escape = escapeEncounterMarkup;
const hp = snapshot => snapshot?.current == null ? 'nicht erfasst' : `${snapshot.current}/${snapshot.maximum ?? '?'}`;

export function renderEncounterSummary(event, { preview = false } = {}) {
  const summary = event.summary;
  const reason = ENCOUNTER_REASON_LABELS[event.endReason] || '';
  const awards = event.experience?.awards || [];
  const rows = (summary?.participants || []).map(participant => `<tr>
    <th scope="row">${escape(participant.name)}</th>
    <td>${hp(participant.before)} → ${hp(participant.after)}</td>
    <td>${participant.actions}</td><td>${participant.damage}</td>
    <td>${participant.costs.map(cost => `${escape(cost.name || cost.id)}: ${cost.amount}`).join(', ') || '–'}</td>
  </tr>`).join('');
  const highlights = (summary?.highlights || []).map(item => `<li>${escape(item.actorName)}: ${escape(item.actionName)}${item.targetName ? ` gegen ${escape(item.targetName)}` : ''} · ${item.type === 'defeat' ? 'Kampfunfähigkeit' : 'kritischer Treffer'}</li>`).join('');
  return `<section class="combat-encounter-summary" aria-label="${preview ? 'Vorschau des Fazits' : 'Kampffazit'}">
    <h3>${preview ? 'Vorschau · ' : ''}${escape(describeEncounterOutcome(event))}</h3>
    ${reason ? `<p>${escape(reason)}</p>` : ''}
    ${summary ? `<p>${summary.actionCount} ausgewertete ${summary.actionCount === 1 ? 'Kampfhandlung' : 'Kampfhandlungen'}</p><div class="combat-encounter-summary-scroll"><table><caption>Trefferpunkte und Verbrauch bis zum Abschluss</caption><thead><tr><th>Figur</th><th>TP Beginn → Ende</th><th>Handlungen</th><th>Schaden verursacht</th><th>Ressourcen verbraucht</th></tr></thead><tbody>${rows}</tbody></table></div>` : ''}
    ${highlights ? `<details><summary>Besondere Momente</summary><ul>${highlights}</ul></details>` : ''}
    ${preview ? `<p><strong>${event.experience?.total || 0} EP werden vergeben.</strong>${awards.length ? ` ${awards.map(award => `${escape(award.name)} +${award.experience} EP`).join(' · ')}` : ''}</p>` : ''}
    <p class="combat-encounter-summary-note">Kampfgebundene Zustände, Konzentration und Kanalisierung der Beteiligten enden. Trefferpunkte und verbrauchte Ressourcen werden nicht aufgefüllt.</p>
  </section>`;
}
