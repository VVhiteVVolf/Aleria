import { calculateBusiness, demandCases, projectBusiness } from './economy-engine.mjs';
import { escape, numberText, money, denominations, signedClass, table, info } from './economy-format.mjs';

const row = (label, value, note = '', strong = false) => `<tr${strong ? ' class="economy-total-row"' : ''}><th scope="row">${escape(label)}${note ? `<small>${escape(note)}</small>` : ''}</th><td class="economy-money ${strong ? signedClass(value) : ''}">${money(value)}</td></tr>`;
const metric = (label, value, note = '') => `<div class="economy-metric"><span>${escape(label)}</span><strong class="${signedClass(value)}" title="${escape(denominations(value))}">${money(value)}</strong>${note ? `<small>${escape(note)}</small>` : ''}</div>`;

export function renderBusinessLedger(scenario, result, examples, calendar, controls) {
  const t = result.totals;
  const costRows = [row('Wareneinsatz einschließlich Verlusten', t.materials), row('Geldlöhne', t.payroll), row('Verpflegung und Schlafplätze', t.board, 'Zusätzlich zum Geldlohn; zu Selbstkosten.')].join('')
    + result.overheads.map(item => row(item.label, item.amount, item.note)).join('')
    + row('Boden- oder Raumpacht', t.rent) + row('Fester Gildenbeitrag', t.guild) + row('Schank- und Marktabgabe', t.levy, 'Auf tatsächlich vereinnahmten Umsatz.')
    + row('Kreditzinsen', t.interest) + row('Kirchlicher Beitrag', t.church, controls.churchEnabled ?? scenario.churchEnabled ? 'Frei wählbare Modellannahme; Bemessungsgrundlage steht bei den Annahmen.' : 'Ausgeschaltet.')
    + row('Laufende Zahlungen insgesamt', t.expenses + t.church, '', true);
  const max = Math.max(t.gross, 1);
  const segments = [['Wareneinsatz', t.materials, 'materials'], ['Löhne und Kost', t.payroll + t.board, 'staff'], ['Übriger Aufwand', t.expenses - t.materials - t.payroll - t.board + t.badDebt + t.church, 'overhead']];
  const chart = `<figure class="economy-flow"><figcaption>Wohin der Umsatz fließt</figcaption><div class="economy-flow-track" role="img" aria-label="${escape(segments.map(([label, amount]) => `${label}: ${money(amount)}`).join('; '))}">${segments.map(([label, amount, key]) => `<span class="economy-flow-${key}" style="width:${Math.max(0, Math.min(100, amount / max * 100)).toFixed(2)}%" title="${escape(label)}: ${money(amount)}"></span>`).join('')}</div><ul>${segments.map(([label, amount, key]) => `<li><i class="economy-flow-${key}"></i>${escape(label)} <strong>${money(amount)}</strong></li>`).join('')}</ul></figure>`;
  const cases = demandCases(scenario, calendar, controls);
  const comparison = examples.map(example => {
    const r = calculateBusiness(example, calendar, {}, { breakEven: false });
    return `<tr><th scope="row">${escape(example.title)}</th><td>${r.activeCount}</td><td>${money(r.totals.gross)}</td><td>${money(r.totals.payroll + r.totals.board)}</td><td class="${signedClass(r.totals.freeCash)}">${money(r.totals.freeCash)}</td></tr>`;
  }).join('');
  const projections = [['Neuntagewoche', 1], ['Hausmonat · vier Wochen', result.factors.weeksPerMonth], ['Jahr · 13 Monate', result.factors.weeksPerYear]]
    .map(([label, weeks]) => ({ label, ...projectBusiness(scenario, calendar, weeks, controls) }));
  return `<div class="economy-metrics">${metric('Kartenumsatz / Woche', t.gross, result.visits ? `${numberText(result.visits)} Besuche / Kundenkontakte` : 'Aufträge und Lieferungen gesondert angesetzt')}${metric('Betriebsgewinn / Woche', t.profit, 'Nach laufenden Kosten und Wertverzehr')}${metric('Frei bleibendes Geld / Woche', t.freeCash, 'Nach Tilgung, Rücklage und Haushaltsbudget')}${scenario.assetValuesKnown ? metric('Angenommenes Nettovermögen', t.netWorth, 'Besitzwerte minus Schulden; kein Wochenverdienst') : '<div class="economy-metric"><span>Nettovermögen</span><strong>Noch nicht erhoben</strong><small>Fehlende Besitz- und Schuldenwerte sind kein tatsächliches Nullvermögen.</small></div>'}</div>
    ${result.warnings.length ? `<ul class="economy-warnings">${result.warnings.map(warning => `<li>${escape(warning)}</li>`).join('')}</ul>` : ''}
    ${chart}
    <div class="economy-ledger-columns"><section><h3>Laufende Ausgaben · neun Tage</h3>${table(['Posten', 'Betrag'], costRows, 'Betriebliche Ausgaben')}</section>
      <section><h3>Vom Umsatz zur freien Kasse</h3>${table(['Rechenschritt', 'Betrag'], row('Verkaufte Leistungen', t.gross) + row('Nicht eingegangene Zechen', -t.badDebt) + row('Tatsächliche Einnahmen', t.receipts, '', true)
        + row('Laufende Zahlungen samt Kirche', -(t.expenses + t.church)) + row('Kasse vor Tilgung und Entnahmen', t.operatingCash - t.church, '', true)
        + row('Schuldentilgung', -t.principal, 'Vermindert Schulden; keine Betriebsausgabe.') + row('Erneuerungsrücklage', -t.replacement, 'Gebundenes Geld für künftigen Ersatz, einmal abgezogen.')
        + row('Privater Familienunterhalt', -t.household, 'Entnahme der Inhaber; keine zweite Personalzahlung.') + row('Verbleibende Kasse', t.freeCash, '', true), 'Zahlungsfluss')}
        <p class="economy-note">Bei marktüblicher Vergütung auch der bisher un- oder unterbezahlten Inhaber- und Familienarbeit: <strong class="${signedClass(t.economicProfit)}">${money(t.economicProfit)}</strong> Betriebsgewinn pro Woche.</p>
        ${result.demandBreakEven == null ? info('Bei bis zu dreifacher Modellnachfrage wird kein ausgeglichener Geldfluss erreicht; Kapazitätsgrenzen bleiben wirksam.') : info(`Schwelle für einen ausgeglichenen Geldfluss: etwa ${numberText(result.demandBreakEven * 100)} % der gewöhnlichen Modellnachfrage, bei unveränderten Preisen und Verträgen.`)}
        ${result.cashRunwayMonths != null ? info(`Die angenommene Anfangskasse deckt dieses Defizit etwa ${numberText(result.cashRunwayMonths)} Monate; neue Kredite sind nicht unterstellt.`) : ''}
      </section></div>
    <section><h3>Schwache und gute Wochen</h3>${table(['Nachfrage', 'Besuche', 'Umsatz', 'Frei bleibendes Geld'], cases.map(c => `<tr><th scope="row">${escape(c.label)}</th><td>${numberText(c.visits)}</td><td>${money(c.totals.gross)}</td><td class="${signedClass(c.totals.freeCash)}">${money(c.totals.freeCash)}</td></tr>`).join(''), 'Nachfrageszenarien')}${info('Die Nachfrage verändert auch Zimmer und Zusatzbuchungen. Kapazitäten und seltene Angebote bleiben begrenzt. Das sind keine garantierten Jahreseinnahmen.')}</section>
    <section><h3>Kalenderhochrechnung</h3>${table(['Zeitraum', 'Umsatz', 'Betriebsgewinn', 'Freie Kasse', 'Restschuld'], projections.map(p => `<tr><th scope="row">${p.label}</th><td>${money(p.totals.gross)}</td><td>${money(p.totals.profit)}</td><td class="${signedClass(p.totals.freeCash)}">${money(p.totals.freeCash)}</td><td>${money(p.debtEnd)}</td></tr>`).join(''), 'Monats- und Jahresdurchschnitt')}${info('Gleichmäßiger Durchschnitt, keine Umsatzgarantie. Restschuld und Zinsen sinken mit der Tilgung; nach Abzahlung endet der Schuldendienst. Wetter, Ausfälle, Festtage und zusätzliche Ruhetage verändern den wirklichen Verlauf.')}</section>
    ${examples.length ? `<details><summary>Die drei Häuser im Vergleich · unveränderte Ausgangsannahmen</summary>${table(['Betrieb', 'Tätige', 'Umsatz / Woche', 'Geldlohn + Kost', 'Freie Kasse'], comparison, 'Vergleich der drei Tavernen')}</details>` : ''}`;
}

export function renderRevenueLedger(scenario, result) {
  return `<h3>Absatz, Preise und Einkauf</h3>${info('Kartenpreise sind belegt; Mengen, Einkaufsanteile und Verlustquoten sind Annahmen. Die Eingangsrechnung des Lieferanten ist in der Welt noch nicht festgelegt.')}
    ${table(['Leistung', 'Absatz / Woche', 'Kartenpreis je Einheit', 'Umsatz', 'Einkauf samt Verlust'], result.channels.map(channel => `<tr><th scope="row">${escape(channel.label)}<small>${escape(channel.unit)} · ${escape(channel.source)}</small>${channel.note ? `<small>${escape(channel.note)}</small>` : ''}</th><td>${numberText(channel.quantity, 2)}</td><td>${money(Math.round(channel.unitCopper * 100))}</td><td>${money(channel.sales)}</td><td>${money(channel.materials)}<small>${numberText(channel.materialRatio * 100)} % Einkauf · ${numberText(channel.lossRate * 100)} % Verlust</small></td></tr>`).join(''), 'Verkäufe und direkter Wareneinsatz')}
    ${info('Verlustquote: Einkauf = verkaufte Menge × Einkaufspreis ÷ (1 − Verlustquote). Endliche gerettete Altbestände werden über den Projektionszeitraum verbraucht und nicht jede Woche neu aufgefüllt.')}`;
}
