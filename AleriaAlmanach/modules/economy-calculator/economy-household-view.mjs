import { HOUSEHOLD_PROFILES, calculateHousehold } from './economy-households.mjs';
import { escape, numberText, money, signedClass, table, info } from './economy-format.mjs';
import { renderServiceIncomeGuide } from './economy-service-income-view.mjs';

export function renderHouseholdSelector() {
  return `<div class="economy-household-controls"><label class="economy-field"><span>Beispielhaushalt</span><select data-economy-household="profile">${HOUSEHOLD_PROFILES.map(p => `<option value="${p.id}">${escape(p.title)}</option>`).join('')}</select></label>
    <label class="economy-field"><span>Ertragsfaktor</span><input type="number" min="0" max="10" step="0.05" value="1" data-economy-household="incomeFactor"></label>
    <label class="economy-field"><span>Kostenfaktor</span><input type="number" min="0" max="10" step="0.05" value="1" data-economy-household="costFactor"></label>
    <label class="economy-check"><input type="checkbox" data-economy-household="churchEnabled">10 % Kirchenbeitrag auf positiven Rest nach Unterhalt</label></div><div data-economy-household-result></div>`;
}

export function renderHousehold(profile, calendar, controls) {
  const r = calculateHousehold(profile, calendar, controls);
  const assetRows = profile.assets.map(row => `<tr><th scope="row">${escape(row.label)}</th><td>${money(Math.round(row.cash * 100))}</td></tr>`).join('');
  const lines = (rows, factor) => rows.map(row => `<tr><th scope="row">${escape(row.label)}</th><td>${money(Math.round(row.cash * factor * 100))}</td><td>${money(Math.round(row.inKind * factor * 100))}</td></tr>`).join('');
  const comparisons = HOUSEHOLD_PROFILES.map(p => {
    const c = calculateHousehold(p, calendar);
    return `<tr><th scope="row">${escape(p.title)}</th><td>${money(c.incomeCash)}</td><td class="${signedClass(c.netCashWeek)}">${money(c.netCashWeek)}</td><td>${money(c.cash)}</td><td>${money(c.netWorth)}</td></tr>`;
  }).join('');
  return `<h3>${escape(profile.title)}</h3><p>${escape(profile.household)}</p>${info('Alle Haushalte sind ausdrücklich erfundene Rechenbeispiele für Cenyr, keine allgemeinen Einkommensgesetze und keine Zuordnung zu bestehenden Familien.')}
    <div class="economy-metrics">${[['Geldeinnahmen pro Jahr', r.incomeCash], ['Restgeld pro Neuntagewoche', r.netCashWeek], ['Geld in der Truhe', r.cash], ['Nettovermögen · Rechenwert', r.netWorth]].map(([label, value]) => `<div class="economy-metric"><span>${label}</span><strong class="${signedClass(value)}">${money(value)}</strong></div>`).join('')}</div>
    <div class="economy-ledger-columns"><section><h4>Jährliche Einnahmen</h4>${table(['Herkunft', 'Geld', 'Naturalienwert'], lines(profile.income, Number(controls.incomeFactor ?? 1)), 'Haushaltseinnahmen')}</section>
      <section><h4>Jährliche Ausgaben und Unterhalt</h4>${table(['Verwendung', 'Geld', 'Naturalienwert'], lines(profile.costs, Number(controls.costFactor ?? 1)), 'Haushaltskosten')}</section></div>
    ${info(profile.note)}${info(r.note)}
    <p class="economy-note">Naturalien-Zukauf bei Unterdeckung: <strong>${money(r.naturalShortfall)}</strong> pro Jahr · verbleibende Naturalreserve: <strong>${money(r.netKindYear)}</strong> · optionaler Kirchenbeitrag: <strong>${money(r.church)}</strong>.</p>
    <details><summary>Angenommener Besitz und Schulden</summary>${table(['Besitz', 'Rechenwert'], assetRows + `<tr><th scope="row">Schulden</th><td>−${money(r.debt)}</td></tr><tr class="economy-total-row"><th scope="row">Nettovermögen</th><td>${money(r.netWorth)}</td></tr>`, 'Vermögensrechnung')}${info('Vermögenswerte sind Schätzansätze. Der Rang allein erzeugt kein Vermögen; Landpacht ist beim Bauern kein eigener Landbesitz. Schulden, politische Rechte und schwer veräußerliche Ausrüstung sind von Bargeld zu unterscheiden.')}</details>
    ${renderServiceIncomeGuide(calendar)}
    <details><summary>Alle sechs Ausgangsprofile vergleichen</summary>${table(['Haushalt', 'Geldeinnahmen / Jahr', 'Restgeld / Woche', 'Bargeld', 'Nettovermögen'], comparisons, 'Vergleich von Bauern, Bürgern und Adel')}${info(`Ein Jahr hat ${r.factors.daysPerYear} Tage und ${numberText(r.factors.weeksPerYear)} Neuntagewochen. Die Wochenwerte glätten Ernten, Soldtermine und unregelmäßige Abgaben.`)}</details>`;
}
