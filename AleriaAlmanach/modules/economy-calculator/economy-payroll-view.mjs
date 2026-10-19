import { escape, numberText, money, table, info } from './economy-format.mjs';
const kinds = { owner: 'Inhaber', employee: 'Angestellt', family: 'Familienhilfe', apprentice: 'Ausbildung / Mithilfe', dependent: 'Hauskind', animal: 'Tier', vacancy: 'Unbesetzt' };

export function renderPayroll(result) {
  const renderRow = worker => {
    const editable = ['employee', 'family', 'apprentice'].includes(worker.kind) && worker.days > 0;
    const wage = editable ? `<label class="economy-wage-input"><span class="economy-visually-hidden">${escape(worker.name)} · ${escape(worker.role)} · Fester Geldlohn pro Person und Neuntagewoche in KT</span><input type="number" min="0" max="100000" step="0.01" required value="${worker.perHeadBaseCash / 100}" data-economy-pay="${escape(worker.id)}"></label>${worker.salesShare ? `<small>+ ${money(worker.commissionPerHead)} Erfolgsanteil<br>Gesamt: ${money(worker.perHeadCash)}</small>` : ''}` : money(0);
    return `<tr data-economy-worker="${escape(worker.id)}"><th scope="row">${escape(worker.anonymous ? worker.role : worker.name)}<small>${escape(worker.anonymous ? 'Anonyme bestehende Lohngruppe' : worker.role)}</small><small>${escape(worker.areas.join(' · '))}</small></th><td>${worker.count}</td><td>${escape(kinds[worker.kind])}<small>${numberText(worker.days)} Diensttage</small></td><td>${wage}</td><td>${money(worker.boardPerHead)}</td><td>${money(worker.cash + worker.board)}${worker.count > 1 ? `<small>Alle ${worker.count} Personen zusammen</small>` : ''}</td></tr>`;
  };
  const ordinary = result.workers.filter(worker => worker.kind !== 'vacancy');
  const vacancies = result.workers.filter(worker => worker.kind === 'vacancy');
  const accountOnly = result.owners.length > 0 && result.workers.filter(worker => worker.kind === 'owner').every(worker => worker.count === 0);
  return `<h3>Was jede Person verdient · neun Tage</h3>${info(`${result.activeCount} tätige Personen einschließlich Inhaber und Ausbildung. Gleichzeitige Aufgaben werden nicht mehrfach bezahlt. Geldlohn ist der vereinbarte Bargeldbetrag; Kost und Schlafplatz stehen daneben zu Selbstkosten.`)}
    ${table(['Person / Rolle', 'Anzahl', 'Einordnung', 'Geldlohn je Kopf · KT', 'Kost + Logis je Kopf', 'Aufwand der Gruppe'], ordinary.map(renderRow).join(''), 'Vollständige Lohnliste')}
    <div class="economy-payroll-totals"><strong>Geldlöhne: ${money(result.totals.payroll)}</strong><strong>Kost und Logis: ${money(result.totals.board)}</strong></div>
    ${info('Inhaber erhalten keinen zusätzlichen fiktiven Geldlohn. Ihr privater Unterhalt und ihr Anteil am verbleibenden Überschuss stehen unten. Hauskinder und Tiere erhalten 0 Lohn; Versorgung wird im Haushalts- beziehungsweise Tierposten bezahlt.')}
    <h3>${accountOnly ? 'Betriebskasse und Ergebniszuordnung' : 'Inhaberhaushalte und Gewinnanteile'}</h3>${table([accountOnly ? 'Konto' : 'Inhaber', 'Zuordnung', 'Haushaltsbudget / Woche', 'Anteil an freier Kasse'], result.owners.map(owner => `<tr><th scope="row">${escape(owner.name)}</th><td>${numberText(owner.share * 100)} %</td><td>${money(owner.householdShare)}</td><td>${money(owner.residualShare)}</td></tr>`).join(''), 'Inhaber und private Entnahmen')}
    ${accountOnly ? info('Die Zuordnung bezeichnet verbleibende Betriebsmittel, keinen ausgezahlten Privatlohn und keine automatisch festgelegte Eigentumsquote. Gewinnausschüttungen benötigen eine eigene Vereinbarung.') : ''}
    ${info('Die freie Kasse ist kein garantierter ausgezahlter Privatlohn. Ein negativer Anteil bezeichnet eine Finanzierungslücke, keine negative Gehaltszahlung. Familienlöhne in der oberen Tabelle werden nicht nochmals abgezogen.')}
    ${vacancies.length ? `<details><summary>${vacancies.length} ausdrücklich freie Hierarchieposten · derzeit 0 Lohn</summary>${table(['Posten', 'Anzahl', 'Einordnung', 'Geldlohn je Kopf · KT', 'Kost + Logis je Kopf', 'Aufwand'], vacancies.map(renderRow).join(''), 'Unbesetzte Rollen')}</details>` : ''}`;
}
