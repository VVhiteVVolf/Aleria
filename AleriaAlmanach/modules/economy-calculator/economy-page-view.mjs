import { escape, input, info } from './economy-format.mjs';
import { sanitizePageData } from './economy-model.mjs';
import { ECONOMY_RESEARCH } from './economy-research.mjs';
import { renderHouseholdSelector } from './economy-household-view.mjs';
import { renderPurchasingControls } from './economy-purchasing-view.mjs';
let viewSequence = 0;

export function renderPageBody(page, calendar) {
  const data = sanitizePageData(page.economyCalculation), s = data.scenario;
  const prefix = `economy-view-${++viewSequence}`;
  const tabs = [['ledger', 'Bilanz & Kasse'], ['payroll', 'Personal'], ['revenue', 'Absatz & Waren'], ['purchasing', 'Preis- & Lohnprüfung'], ...(data.showHouseholds ? [['households', 'Vermögen & Stände']] : []), ['assumptions', 'Annahmen']];
  return `<article class="economy-calculation" data-economy-root>
    <header class="economy-header"><span class="economy-kicker">Wirtschaft · Testrechnung · ${escape(s.tier)}</span><h2>${escape(s.title || 'Betriebskalkulation')}</h2>
      <p class="economy-calendar">${calendar.daysPerWeek} Tage / Woche · ${calendar.daysPerMonth / calendar.daysPerWeek} Wochen / Monat · ${calendar.monthsPerYear} Monate / Jahr</p>
      ${info('Preise und Löhne sind vorläufig. Der Bereich Preis- & Lohnprüfung vergleicht die Rechnung mit einem veränderbaren Familienbudget; die Ergebnisse sind keine festgelegte Wirtschaftsordnung.')}
      <details><summary>Rechenrahmen und Währung</summary><p>${escape(s.introduction)}</p><p>${calendar.daysPerMonth} Tage / Monat · 1 KT = 100 Eisenpfennig · 1 ST = 100 KT · 1 GT = 1.000 KT</p></details>
    </header>
    <details class="economy-controls"><summary>Auslastung und Kosten verändern</summary><div class="economy-fields">
      ${input('occupancy', 'Schank- / Speisesaalauslastung', s.occupancy * 100, { max: 100, step: 1, suffix: '%' })}
      ${input('openDays', 'Öffnungstage je Woche', s.openDays, { max: calendar.daysPerWeek, step: 1 })}
      ${input('priceFactor', 'Verkaufspreise · Modellfaktor', 1, { max: 10, step: 0.05 })}
      ${input('materialFactor', 'Einkaufspreise · Modellfaktor', 1, { max: 10, step: 0.05 })}
      ${input('wageFactor', 'Feste Geldlöhne · Modellfaktor', 1, { max: 10, step: 0.05 })}
      <label class="economy-check"><input type="checkbox" data-economy-field="churchEnabled"${s.churchEnabled ? ' checked' : ''}>Kirchenbeitrag einrechnen</label>
    </div>${info('Änderungen gelten nur in dieser Ansicht und verändern weder Warenpreise noch Charaktergeld. Sozialer Richtwert: sechs Diensttage und drei freie Tage. Die bisherigen Lohnannahmen können davon abweichen; betriebliche Öffnung und persönliche Diensttage bleiben getrennt.')}
    <details><summary>Pacht, Abgaben und Finanzierung</summary><div class="economy-fields">
      ${input('rentWeekly', 'Pacht / Woche', s.rentWeekly, { suffix: 'KT' })}${input('levyRate', 'Betriebliche Geldabgabe · Test auf Einnahmen', s.levyRate * 100, { max: 100, suffix: '%' })}
      ${input('badDebtRate', 'Nicht eingehende Zechen', s.badDebtRate * 100, { max: 100, suffix: '%' })}${input('churchRate', 'Optionaler Kirchenbeitrag', s.churchRate * 100, { max: 100, suffix: '%' })}
      <label class="economy-field"><span>Grundlage des Kirchenbeitrags</span><select data-economy-field="churchBasis"><option value="surplus"${s.churchBasis === 'surplus' ? ' selected' : ''}>Positiver Überschuss vor Privatentnahmen</option><option value="receipts"${s.churchBasis === 'receipts' ? ' selected' : ''}>Tatsächliche Einnahmen</option></select></label>
      ${input('debt', 'Restschuld', s.debt, { suffix: 'KT' })}${input('annualInterestRate', 'Jahreszins', s.annualInterestRate * 100, { max: 100, suffix: '%' })}
      ${input('principalWeekly', 'Tilgung / Woche', s.principalWeekly, { suffix: 'KT' })}${input('replacementWeekly', 'Erneuerungsrücklage / Woche', s.replacementWeekly, { suffix: 'KT' })}
      ${input('householdWeekly', 'Privater Familienunterhalt / Woche', s.householdWeekly, { suffix: 'KT' })}
    </div></details></details>
    <div class="economy-toolbar"><p data-economy-status role="status">Ausgangsrechnung · alle Beträge in Kupfertalern</p><button type="button" data-economy-action="reset">Zurücksetzen</button><button type="button" data-economy-action="export">Rechnung exportieren</button></div>
    <div class="economy-tabs" role="tablist" aria-label="Kalkulationsbereiche">${tabs.map(([key, label], i) => `<button type="button" role="tab" id="${prefix}-tab-${key}" aria-controls="${prefix}-panel-${key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-economy-tab="${key}">${label}</button>`).join('')}</div>
    ${tabs.map(([key, label], i) => `<section class="economy-panel" role="tabpanel" id="${prefix}-panel-${key}" aria-labelledby="${prefix}-tab-${key}" data-economy-panel="${key}"${i ? ' hidden' : ''}>
      ${key === 'households' ? renderHouseholdSelector() : key === 'purchasing' ? renderPurchasingControls() : key === 'assumptions' ? renderAssumptions(s) : `<div data-economy-output="${key}"></div>`}</section>`).join('')}
  </article>`;
}

export function renderAssumptions(scenario) {
  return `<h3>Was belegt ist und was angenommen wird</h3>${info('Die Hauskarten und die tatsächlichen Hierarchien liefern die bisherigen Preise und Personen. Auch diese Preise stehen zur Überarbeitung offen. Dies sind die Ausgangsannahmen; aktuelle Änderungen stehen in den Eingabefeldern und im Export. Die Zahlen schreiben kein bestehendes Einkommen oder Steuerrecht fest.')}
    <ol class="economy-assumptions">${scenario.assumptions.map(note => `<li>${escape(note)}</li>`).join('')}</ol>
    <h3>Historische Anregungen</h3>${info('Historische Rechnungsarten dienen als Plausibilitätsgerüst. Cenyrs freie Bürger und faire Pachtverträge bleiben die maßgebliche Weltvorgabe; englische Währungen, Leibeigenschaft und Steuerquoten werden nicht übertragen.')}
    <ul class="economy-sources">${ECONOMY_RESEARCH.map(source => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a><small>${escape(source.note)}</small></li>`).join('')}</ul>
    <p>Formeln: Besuche = Plätze × Belegungen × Auslastung × Öffnungstage. Umsatz = Absatz × Kartenpreis. Freie Kasse = vereinnahmter Umsatz − laufende Zahlungen − Kirchenbeitrag − Tilgung − Rücklage − Familienunterhalt.</p>
    <p>Der wirtschaftliche Gewinn zieht zusätzlich den fehlenden marktüblichen Lohn für Inhaber- und Familienarbeit ab. Das zeigt, welche Betriebe ihre Arbeitskraft nur durch private Einschränkungen tragen.</p>`;
}
