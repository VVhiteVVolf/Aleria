import { toMinor } from '../item-register/item-register-money.js';
import { calendarFactors } from './economy-model.mjs';
const line = (label, cash, inKind = 0) => ({ label, cash, inKind });

// Illustrative Cenyr households, not assignments to living named characters.
// A leased field never enters the farmer's owned land valuation.
export const HOUSEHOLD_PROFILES = [
  { id: 'paechter', title: 'Freie Pächterfamilie', household: 'Zwei Erwachsene und drei Kinder · kleiner gemischter Hof',
    income: [line('Ernteverkauf', 720, 900), line('Milch, Eier und kleine Viehverkäufe', 280), line('Saisonale Lohnarbeit', 120)],
    costs: [line('Saat, Futter, Geräte und Tierverluste', 370, 180), line('Vertragliche Landpacht und Naturalabgabe', 120, 40), line('Gemeinde- und Marktlasten', 30), line('Familienunterhalt, Kleidung und Winterfeuer', 320, 650)],
    assets: [line('Eigene Tiere, Geräte und Vorräte', 640), line('Eigenes Hofgebäude auf gepachtetem Grund', 900), line('Bargeld', 45)], debt: 100,
    note: 'Das Land ist gepachtet und kein verkäufliches Familienvermögen. Ein großer Teil der Ernährung kommt aus eigener Erzeugung. Einnahmen fallen vor allem nach Ernte und Verkauf an.' },
  { id: 'handwerk', title: 'Selbstständige Handwerkerfamilie', household: 'Vier Angehörige · Werkstatt mit einer bezahlten Hilfe',
    income: [line('Handwerksaufträge und Ladenverkauf', 6000)],
    costs: [line('Rohstoffe und Fremdarbeiten', 1900), line('Hilfe: Geldlohn, Kost und Schlafplatz', 620), line('Werkstattpacht, Zunft, Feuer und Werkzeugersatz', 650), line('Abgaben und Gebühren', 120), line('Familienunterhalt', 1250)],
    assets: [line('Eigene Werkstatt und Einrichtung', 4500), line('Waren, Material und Forderungen', 850), line('Bargeld', 260)], debt: 750,
    note: 'Der Umsatz ist nicht der Lohn des Meisters. Material, Hilfe und Werkstatt werden vor dem Familienunterhalt bezahlt.' },
  { id: 'handel', title: 'Gut gestellte Händlerfamilie', household: 'Fünf Angehörige · mehrere Hilfen und angemieteter Lagerraum',
    income: [line('Erlöse aus Warenverkauf', 52000)],
    costs: [line('Einkauf, Fracht, Zoll und Warenverluste', 37000), line('Personal und Lager', 5200), line('Abgaben, Gebühren und Zinsen', 1900), line('Familienunterhalt und Repräsentation', 3400)],
    assets: [line('Eigene Geschäftsausstattung und Lageranteile', 11000), line('Waren und Außenstände', 10000), line('Bargeld', 1800)], debt: 6500,
    note: 'Viel Vermögen steckt in Waren und noch nicht bezahlten Rechnungen. Eine verspätete Schiffsladung kann trotz positivem Jahresergebnis die Kasse leeren.' },
  { id: 'dienstritter', title: 'Dienstritter mit eigenem Ritterhaushalt', household: 'Ritterhaushalt · Pferd, Ausrüstung und ein Helfer',
    income: [line('Dienst- und Auftragseinnahmen · Haushaltsannahme', 12000)],
    costs: [line('Helfer, Stall und Versorgung', 2000), line('Pferdepflege und Ersatz von Ausrüstung', 1700), line('Reisen, Turnier- und Dienstkosten', 1800), line('Haushalt und standesgemäße Kleidung', 2500), line('Abgaben und feste Verpflichtungen', 500)],
    assets: [line('Eigene Pferde, Waffen und Rüstung', 18000), line('Eigener Hausrat', 1400), line('Bargeld', 650)], debt: 2500,
    note: 'Eigenständig wirtschaftender Beispielhaushalt mit selbst bezahltem Helfer, Stall und Ausrüstung. Die Einnahme ist kein allgemeiner Rittersold und kein Ansatz für den vollständig versorgten Hausritter der Draigs. Kein automatisches Einkommen aus Land. Ausrüstung ist gebundenes Kapital; Unterkunft im Dienst darf nicht zusätzlich als eigener Besitz zählen.' },
  { id: 'lehensritter', title: 'Ritter mit kleinem Lehen', household: 'Haushalt, Dienstleute und etwa dreißig freie Pächterfamilien',
    income: [line('Vertragliche Pacht von dreißig Höfen', 4200, 700), line('Eigenwirtschaft und Mühlenanteil', 2800, 1400), line('Amt und vereinbarte Dienste', 1200)],
    costs: [line('Bewirtschaftung, Wege und Verwaltung', 1700, 500), line('Dienstleute und Wachen', 2100, 600), line('Pflichten an den Lehensherrn', 700, 200), line('Pferde, Waffen und Felddienstreserve', 1100), line('Hausgemeinschaft und Repräsentation', 1900, 700)],
    assets: [line('Erblich gesicherte Nutzungs- und Einnahmerechte · Rechenwert', 60000), line('Eigene Gebäude, Tiere und Ausrüstung', 24000), line('Bargeld', 900)], debt: 7000,
    note: 'Kein Besitz an den Bauern. Pachten sind vereinbarte Leistungen; derselbe Hofertrag wird nicht noch einmal als persönliche Einnahme des Ritters verbucht. Rechte und Gebäude sind kaum kurzfristig zu Geld zu machen.' },
  { id: 'hoher-adel', title: 'Hoher Edelmann mit großer Herrschaft', household: 'Beispielherrschaft mit etwa tausend freien Pachtfamilien und einem bedeutenden Marktort',
    income: [line('Vertragliche Landpachten', 160000, 50000), line('Eigenwirtschaft', 60000, 60000), line('Markt-, Mühlen-, Hafen- und Handelsrechte', 220000)],
    costs: [line('Bewirtschaftung und Verwaltung', 55000, 25000), line('Dienstleute, Wachen und militärische Bereitschaft', 125000, 25000), line('Burg, Wege, Brücken und Lager', 60000),
      line('Lehenspflichten und königliche Leistungen', 40000, 10000), line('Hofhaltung, Geschenke und Patronage', 65000, 45000)],
    assets: [line('Herrschaftliche Rechte · gebundener Rechenwert', 1800000), line('Eigene Gebäude, Ausstattung und Tiere', 450000), line('Bargeld', 30000)], debt: 200000,
    note: 'Bruttoabgaben sind keine private Geldbörse: Verwaltung, Schutz und Infrastruktur werden daraus getragen. Der Rechenwert von Herrschaftsrechten ist kein frei verkäuflicher Landpreis.' }
];

export function calculateHousehold(profile, calendar, controls = {}) {
  const factors = calendarFactors(calendar), incomeFactor = Math.max(0, Number(controls.incomeFactor ?? 1)), costFactor = Math.max(0, Number(controls.costFactor ?? 1));
  const total = (rows, key, factor) => rows.reduce((amount, row) => amount + toMinor(row[key] * factor), 0);
  const incomeCash = total(profile.income, 'cash', incomeFactor), incomeKind = total(profile.income, 'inKind', incomeFactor);
  const costsCash = total(profile.costs, 'cash', costFactor), costsKind = total(profile.costs, 'inKind', costFactor);
  const naturalShortfall = Math.max(0, costsKind - incomeKind);
  const beforeChurch = incomeCash - costsCash - naturalShortfall;
  const church = controls.churchEnabled ? Math.round(Math.max(0, beforeChurch) * 0.1) : 0;
  const netCashYear = beforeChurch - church;
  const netKindYear = Math.max(0, incomeKind - costsKind);
  const debt = toMinor(Math.max(0, Number(controls.debt ?? profile.debt)));
  const assetValue = profile.assets.reduce((total, row) => total + toMinor(row.cash), 0);
  return { factors, incomeCash, incomeKind, costsCash, costsKind, naturalShortfall, church, netCashYear, netKindYear,
    netCashWeek: Math.round(netCashYear / factors.weeksPerYear), netWorth: assetValue - debt,
    cash: toMinor(profile.assets.find(row => row.label === 'Bargeld')?.cash || 0), debt,
    note: 'Naturalien sind mit vorsichtigem Ersatzwert angesetzt. Eigenverbrauch ist kein zusätzlicher Geldverkauf; fehlende Naturalversorgung muss zugekauft werden. Keine fiktive automatische Veräußerung übriger Naturalien.' };
}
