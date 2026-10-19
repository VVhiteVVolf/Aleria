import { createServiceIncomeGuide } from './economy-service-income.mjs';
import { escape, money, table, info } from './economy-format.mjs';

const incomeHeaders = ['Stellung', 'Art des Geldes', 'Richtwert / Monat', 'Spielraum / Monat', 'Richtwert / Jahr'];
const incomeRows = roles => roles.map(role => `<tr data-economy-income-role="${escape(role.id)}"><th scope="row">${escape(role.title)}</th><td>${escape(role.incomeLabel)}</td>
    <td>${money(role.monthly)}</td><td>${role.monthlyMin === role.monthlyMax ? 'Fester Modellansatz' : `${money(role.monthlyMin)} – ${money(role.monthlyMax)}`}</td><td>${money(role.annual)}</td></tr>`).join('');
const incomeNotes = roles => roles.map(role => `<p class="economy-note"><strong>${escape(role.title)}:</strong> ${escape(role.note)}</p>`).join('');

export function renderServiceIncomeGuide(calendar) {
  const guide = createServiceIncomeGuide(calendar);
  const ordinary = guide.roles.filter(role => role.group !== 'watch-service');
  const watch = guide.roles.filter(role => role.group === 'watch-service');
  const watchGroups = guide.watchGroups.map(group => `<tr data-economy-watch-group="${escape(group.id)}"><th scope="row">${escape(group.title)}</th><td>${escape(group.affiliation)}</td><td>${escape(group.assignment)}</td><td>${escape(group.duty)}</td></tr>`).join('');
  return `<details data-economy-service-income><summary>Dienstsold, Ausbildung und Hauszuwendungen</summary>
    ${info(guide.scope)}${info(`Arbeitsstand: Hausritter-Basis ${money(guide.baseMonthly)} pro 36-Tage-Monat, einschließlich der Erhöhung des Ritter- und Waffenknechtssoldes um 30 %. Die übrigen Beträge sind vorgeschlagene Richtwerte; konkrete Dienst- und Hausvereinbarungen gehen vor.`)}
    ${table(incomeHeaders, incomeRows(ordinary), 'Ausbildung, Ritterdienst, Adelshaus und Amt')}
    <details data-economy-watch-income><summary>Wachen, Hausmacht und Garde</summary>
      ${table(['Gruppe', 'Zugehörigkeit', 'Zuweisung', 'Aufgabe'], watchGroups, 'Zugehörigkeit und Auftrag der fünf Wach- und Gefolgsgruppen')}
      ${table(incomeHeaders, incomeRows(watch), 'Vorgeschlagene Besoldung für Wachen, Waffenknechte und Gardisten')}
      ${incomeNotes(watch)}</details>
    ${guide.rules.map(info).join('')}${incomeNotes(ordinary)}</details>`;
}
