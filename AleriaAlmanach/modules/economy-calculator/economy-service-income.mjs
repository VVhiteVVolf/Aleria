import { toMinor } from '../item-register/item-register-money.js';
import { calendarFactors } from './economy-model.mjs';
import { WATCH_SERVICE_GROUPS, WATCH_SERVICE_INCOME } from './economy-watch-service.mjs';

// Working scale for well-paying Draig service and solvent Cenyr noble houses.
// Birth, training and office are separate descriptions, not cumulative salaries.
// Fixed reference prevents a military pay revision from raising unrelated
// training allowances, family budgets or civilian watch contracts as a side effect.
const referenceMonthlyCopper = 480;
const martialSalaryMultiplier = 1.3;
const usesMartialSalary = role => role.incomeKind === 'salary'
  && ['ritter', 'waffenknecht'].includes(role.militaryStatus);
const roles = [
  { id: 'page', title: 'Page', incomeKind: 'training', incomeLabel: 'Ausbildungszuwendung', factor: 0.025,
    note: 'Persönliches Geld während der Ausbildung. Kost, Unterkunft, Kleidung und Unterricht werden gesondert getragen.' },
  { id: 'knappe', title: 'Knappe', incomeKind: 'training', incomeLabel: 'Ausbildungszuwendung', factor: 0.125,
    note: 'Fortgeschrittene Ausbildung mit Dienstpflichten. Notwendige Ausbildungswaffen und Versorgung sind zusätzlich zu vereinbaren.' },
  { id: 'hausritter', title: 'Hausritter · gewöhnlicher Dienst', organizationType: 'hausmacht', militaryStatus: 'ritter', incomeKind: 'salary', incomeLabel: 'Geldsold', factor: 1,
    note: 'Referenz: gut zahlendes Haus Draig. Burgwache, militärische Dienste und gelegentliche Führung von Waffenknechten; zusätzlich Hausversorgung und notwendige Dienstausrüstung.' },
  { id: 'fahrender-ritter', title: 'Fahrender oder freigestellter Ritter', incomeKind: 'variable', incomeLabel: 'Kein fester Sold', factor: 0,
    note: 'Lebt von tatsächlich angenommenen Aufträgen, Gastfreundschaft und gegebenenfalls eigenem Besitz. Null fester Sold bedeutet kein garantiertes Monatseinkommen; Auftragserlöse werden separat erfasst.' },
  { id: 'niederes-adelshaus', title: 'Ritter · Angehöriger eines niederen Adelshauses', incomeKind: 'household', incomeLabel: 'Persönliche Hauszuwendung', factor: 1.5, range: [1.25, 2],
    note: 'Erwachsener Familienangehöriger. Persönliches Budget aus einer zahlungsfähigen Hauskasse; eigene Besitz- und Pachteinkünfte werden separat geprüft. Kein automatischer Sold durch den Familiennamen.' },
  { id: 'hoeheres-adelshaus', title: 'Ritter · Angehöriger eines höheren Adelshauses', incomeKind: 'household', incomeLabel: 'Persönliche Hauszuwendung', factor: 3, range: [2.5, 4],
    note: 'Erwachsener Familienangehöriger mit entsprechendem persönlichen Aufwand. Der Ansatz ist kein Anteil am gesamten Umsatz des Hauses und setzt dessen tatsächliche Mittel voraus.' },
  { id: 'grafenhaus', title: 'Erwachsenes Mitglied des Grafenhauses', incomeKind: 'household', incomeLabel: 'Persönliche Hauszuwendung', factor: 5, range: [3.75, 7.5],
    note: 'Persönliches Budget eines erwachsenen Angehörigen ohne zusätzlich vergütetes Sonderamt. Die Grafschaftskasse und die Mittel für Gefolge oder öffentliche Aufgaben sind davon getrennt.' },
  { id: 'amtsritter', title: 'Amtsritter', militaryStatus: 'ritter', incomeKind: 'salary', incomeLabel: 'Gesamte persönliche Amtsbesoldung', factor: 1.5, range: [1.25, 2],
    note: 'Ritterlicher Amtsträger unter Justiziar, Kämmerer oder Marschall. Der Ansatz ersetzt den gewöhnlichen Hausrittersold; er wird nicht zusätzlich vollständig darauf aufgeschlagen.' },
  { id: 'hoher-beamter', title: 'Hoher Beamter · gräflicher Dienst', incomeKind: 'salary', incomeLabel: 'Gesamte persönliche Amtsbesoldung', factor: 4, range: [3, 6],
    note: 'Beispielsweise Kämmerer, Justiziar oder Marschall der Grafschaft. Persönliche Vergütung; Schreiber, Reisen, Wachen und Amtsräume werden aus getrennten Amtsmitteln finanziert.' },
  ...WATCH_SERVICE_INCOME
];

export function createServiceIncomeGuide(calendar) {
  const factors = calendarFactors(calendar);
  return {
    version: 3, date: '2026-10-19', status: 'working-guideline', moneyUnit: 'Eisenpfennig',
    scope: 'Orientierung für Wachdienst in Gwynthor und seinem Umland, gut zahlenden Draig-Dienst und zahlungsfähige cenyrische Adelshäuser. Keine universelle Soldordnung aller Länder und Häuser.',
    referenceMonthly: toMinor(referenceMonthlyCopper),
    baseMonthly: toMinor(referenceMonthlyCopper * martialSalaryMultiplier),
    salaryRevision: { id: '2026-10-19-martial-salary-v1', multiplier: martialSalaryMultiplier,
      incomeKind: 'salary', militaryStatuses: ['ritter', 'waffenknecht'] },
    watchGroups: structuredClone(WATCH_SERVICE_GROUPS),
    rules: [
      'Ausbildung, Familiensitz und Amt bilden keine durchgehende militärische Rangfolge. Ein hoher Beamter kann wirtschaftlich anders stehen als ein Grafenangehöriger.',
      'Die Beträge sind persönliche Geldansätze vor individuellen Abgaben. Versorgung und Dienstausrüstung werden separat vereinbart; gestellte Ausrüstung wird kein persönliches Vermögen.',
      'Die Geldsoldansätze für Ritter und Waffenknechte einschließlich der Amtsritter und beider Gardestufen wurden um 30 % erhöht. Ausbildungs- und Hauszuwendungen, gewöhnliche Wachposten und hohe Beamte werden dadurch nicht automatisch erhöht. Die Revision ist einmal Bestandteil des Ansatzes und wird beim erneuten Lesen nicht nochmals aufgeschlagen.',
      'Bei mehreren Eigenschaften wird für die tatsächliche Tätigkeit eine persönliche Dienstbesoldung angesetzt. Hausrittersold und volle Amtsbesoldung werden nicht automatisch addiert.',
      'Dorfwache, Wachmann und Stadtwache werden nach zugewiesenem Gebiet und Träger unterschieden. Die Hausmacht dient persönlich einem Adelshaus; die Stadtwache gehört zur Stadt.',
      'Die Garde ist eine Auswahl für besonderen Vertrauensdienst. Ritter und Waffenknechte behalten ihren unterschiedlichen Status. Gardesold ersetzt den entsprechenden gewöhnlichen Sold und wird nicht vollständig darauf aufgeschlagen.',
      'Die Wachansätze gelten für gewöhnliche Vollzeitposten. Führung, besondere Verantwortung, Bereitschaft und Versorgungsumfang werden je Dienstvertrag geprüft. Private Türsteher, gewerbliche Wachleute und Gildensöldner erhalten dadurch keine automatische Zuordnung zur Stadtwache oder Hausmacht.',
      'Familienzuwendung, eigener Besitz und Amtseinkommen werden gesondert vereinbart. Es gibt keine automatische Addition aller Statusbeträge; verarmte Häuser können die vorgeschlagenen Zuwendungen unterschreiten.',
      'Für jedes Haus müssen die tatsächlichen verfügbaren Einnahmen die Zuwendungen aller Angehörigen tragen. Die gesamte Haus- oder Grafschaftskasse ist kein privates Einkommen.',
      'Aufträge, Geschenke und Beute sind unregelmäßige Einnahmen und kein garantierter Bestandteil des Grundsoldes. Gekaufte Ausrüstung wird nicht monatlich erneut angeschafft.'
    ],
    roles: roles.map(role => {
      const multiplier = usesMartialSalary(role) ? martialSalaryMultiplier : 1;
      const moneyAt = factor => toMinor(referenceMonthlyCopper * factor * multiplier);
      const monthly = moneyAt(role.factor);
      const [min, max] = role.range || [role.factor, role.factor];
      const { factor, range, ...description } = role;
      return { group: 'training-noble-office', ...description, monthly, monthlyMin: moneyAt(min), monthlyMax: moneyAt(max),
        weekly: Math.round(monthly / factors.weeksPerMonth), annual: monthly * factors.monthsPerYear };
    })
  };
}
