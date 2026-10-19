import { escape, money, numberText, table, info } from './economy-format.mjs';
import { createPurchasingReference, calculatePurchasingPower } from './economy-purchasing-power.mjs';
import { getEconomyContext, ECONOMY_PRICE_LAYERS } from './economy-world-context.mjs';

export function renderPurchasingControls() {
  const reference = createPurchasingReference();
  const field = (key, label, value) => `<label class="economy-field"><span>${escape(label)}</span><span class="economy-input"><input type="number" min="0" max="100000000" step="0.01" required data-economy-reference="${escape(key)}" value="${value}"><span>KT</span></span></label>`;
  return `<h3>Lebenshaltung als Bezugspunkt</h3>${info('Frei gewählte Testskala: 24 KT Grundbedarf plus 3 KT frei verfügbare Mittel ergeben 27 KT Hafenlohn je Neuntagewoche. Diese Beträge sind noch keine festgelegten Preise oder Löhne. Die gesellschaftliche Vorgabe ist, dass ein Hafenlohn eine sparsame vierköpfige Familie trägt.')}
    <details><summary>Familienbudget verändern · zwei Erwachsene und zwei Kinder</summary><div class="economy-fields">
      ${reference.costs.map(row => field(row.id, row.label, row.weeklyCopper)).join('')}${field('leisureWeekly', 'Zusätzlich frei für Besuche oder Sparziele', reference.leisureWeekly)}
    </div>${info('Wöchentliche Anteile aus Wohnung, Kleidung und Ersatzbedarf. Haushaltsarbeit wird selbst geleistet. Die kleine persönliche Abgabe ist ein veränderbarer Geldbetrag, keine festgelegte Steuerquote. Ein Betrieb zahlt sie nicht nochmals für jeden Angehörigen.')}</details>
    <div data-economy-output="purchasing"></div>`;
}

export function renderPurchasingPower(scenario, result, raw) {
  const p = calculatePurchasingPower(result, raw), context = getEconomyContext(scenario.contextId);
  const comparison = value => value == null ? 'Nicht bestimmbar' : numberText(value, 2);
  return `<div class="economy-metrics">
      <div class="economy-metric"><span>Familiengrundbedarf / Woche</span><strong>${money(p.householdWeekly)}</strong><small>einschließlich anteiliger Vorsorge</small></div>
      <div class="economy-metric"><span>Abgeleiteter Hafenlohn / Woche</span><strong>${money(p.wageWeekly)}</strong><small>${p.dutyDays} Diensttage · veränderbare Testskala</small></div>
      <div class="economy-metric"><span>Mittlerer Umsatz je Besuch</span><strong>${p.meanBill == null ? 'Besuchswert offen' : money(p.meanBill)}</strong><small>${p.wageWeeksPerVisit == null ? 'Lohnvergleich offen' : `${comparison(p.wageWeeksPerVisit)} Hafenwochenlöhne`}</small></div>
      <div class="economy-metric"><span>Sparen auf einen Besuch</span><strong>${p.savingWeeksPerVisit == null ? 'Nicht bestimmbar' : `${comparison(p.savingWeeksPerVisit)} Wochen`}</strong><small>alle freien Mittel eingesetzt · ein Besuch, keine Familienfeier</small></div>
    </div>
    ${info('Der Besuchspreis ist der mittlere verkaufte Warenkorb dieser Rechnung, kein festes Menü. Die Sparzeit nutzt nur das Geld nach dem Grundbedarf. Bei null freien Mitteln ist sie nicht bestimmbar. Eine andere Lohnskala verändert die Betriebsrechnung erst, wenn die Geldlöhne im Personalbereich angepasst werden.')}
    <details><summary>Bestehende Lohnannahmen mit dem Hafenlohn vergleichen</summary>
      ${table(['Person / Rolle', 'Diensttage', 'Geldlohn je Kopf', 'Anteil am Hafenlohn', 'Kost + Logis je Kopf'], p.workers.map(row => `<tr><th scope="row">${escape(row.name)}<small>${escape(row.role)}${row.count > 1 ? ` · ${row.count} Personen` : ''}</small></th><td>${numberText(row.days)}${row.dutyAboveReference ? '<small>über dem sozialen Richtwert</small>' : ''}</td><td>${money(row.cash)}</td><td>${row.wageRatio == null ? 'Offen' : `${numberText(row.wageRatio * 100)} %`}</td><td>${money(row.boardAtCost)}<small>Aufwand des Betriebs</small></td></tr>`).join(''), 'Lohnvergleich mit einer veränderbaren Bezugsgröße')}
      ${info('Die Zeilen sind keine automatische Lohneinstufung. Rolle, Ausbildung, Teilzeit, Lehrverhältnis und konkrete Versorgung zählen mit. Kost und ein einzelner Schlafplatz sind kein frei verfügbares Geld für eine ganze Familie; ihre Selbstkosten werden nicht zum Familienlohn addiert.')}
    </details>
    <h3>${escape(context?.title || 'Örtlicher Wirtschaftsrahmen noch offen')}</h3>
    ${context ? `${info(context.scope)}<details><summary>Festgelegte Weltgrundlagen</summary><ul class="economy-assumptions">${context.principles.map(note => `<li>${escape(note)}</li>`).join('')}</ul></details>`
      : info('Für diesen Betrieb ist kein Ortsprofil ausgewählt. Das Familienbudget ist eine frei veränderbare Vergleichsskala; Gwynthors Wohlstand, Versorgung und Abgaben gelten dadurch nicht automatisch für andere Orte.')}
    ${table(['Ebene', 'Einfluss auf den Preis'], ECONOMY_PRICE_LAYERS.map(([label, note]) => `<tr><th scope="row">${escape(label)}</th><td class="economy-context-text">${escape(note)}</td></tr>`).join(''), 'Warenwert, Ort und Betrieb')}
    ${info('Die frühere Auslastung, Lohnliste, Einkaufskostenanteile, Immobilienwerte und Abgabensätze sind weiterhin ungeprüfte Szenarioannahmen. Gute Auslastung und Luxuspreise dürfen Gewinn ermöglichen; ein gewünschter Gewinn oder Familienrang ist kein Kalibrierungsziel.')}`;
}
