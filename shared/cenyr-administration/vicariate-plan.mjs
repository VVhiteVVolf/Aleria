import { geographicKey } from '../world-directory/geographic-key.mjs';
import { deaconSection } from './local-offices.mjs';

const personnel = [
  ['haushofmeister', 'Haushofmeister des Vikariats', 1, 'Ordnet den Haushalt und die Dienste bei Besuchsreisen.', 'coordination'],
  ['siegler', 'Siegler und Registrator', 1, 'Verwahrt das Siegel und die Ausfertigungen des Vikariats.', 'records'],
  ['register', 'Kirchenregisterschreiber', 1, 'Führt die Meldungen zu Weihen, Ehen und Bestattungen.', 'records'],
  ['kanzleischreiber', 'Kanzleischreiber', 2, 'Fertigt Briefe, Berichte und Abschriften für das Vikariat.', 'records'],
  ['bote', 'Kanzleibote', 2, 'Verbindet das Vikariat mit den Diakonen und der Kirchenleitung.', 'courier'],
  ['hauskaplan', 'Hauskaplan', 2, 'Bereitet Gebete und Gottesdienste des persönlichen Stabs vor.', 'faith'],
  ['sakristei', 'Persönlicher Sakristan', 1, 'Hält Gewänder und liturgische Geräte für den Vikar bereit.', 'faith'],
  ['almosen', 'Almosenpfleger', 1, 'Ordnet Hilfsgesuche und die bewilligten Gaben des Vikariats.', 'care'],
  ['akolyth', 'Akolyth', 2, 'Assistiert unter Anleitung bei Gebet und Zeremonien.', 'faith'],
  ['kammerdiener', 'Kammerdiener', 2, 'Betreut die persönlichen Räume und die Kleidung des Vikars.', 'hospitality'],
  ['koch', 'Koch des Vikariats', 1, 'Bereitet Mahlzeiten und Reiseproviant des Stabs vor.', 'supplies'],
  ['reisegehilfe', 'Reise- und Haushaltsgehilfe', 2, 'Hilft bei Gepäck, Vorräten und der Vorbereitung kirchlicher Besuche.', 'courier'],
];
const oldRoles = {
  gemeindedienst: 'Gemeindedienst', kapellen: 'Kapellendienst', fuersorge: 'Fürsorgedienst',
  lehrhaus: 'Kirchlicher Lehrdienst', konvent: 'Konventsdienst', diakon: 'Kirchendienst · Siedlung offen',
  priester: 'Priester', adept: 'Adept', novize: 'Novize', oblat: 'Oblat',
};

const supportSlots = (id, title, count, kind, description, icon, reportsTo) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index + 1}`, title, kind, description, icon, reportsTo, templateId: `r-${id}`,
  }));

const smallGuard = {
  id: 'vikariatsschutz', title: 'Schutzdienst des Vikariats', icon: 'watch', repeatableHere: true,
  description: 'Das kirchliche Aufgebot gehört zu den Ortskirchen. Der Hauptmann der Schwurritter führt den kleinen Schutzdienst im Auftrag des Vikariats.',
  slots: [
    { id: 'hauptmann-schwurritter', title: 'Hauptmann der Schwurritter', icon: 'command',
      description: 'Führt den kleinen Schutzdienst des Vikariats im Auftrag der geistlichen Leitung.' },
    ...supportSlots('schwurritter', 'Schwurritter', 2, 'other', 'Versieht den eidverpflichteten Geleit- und Wachdienst der Ortskirchen.', 'arms', 'dem Hauptmann der Schwurritter'),
    ...supportSlots('schwurknecht', 'Schwurknecht', 3, 'service', 'Unterstützt Schwurritter bei Wache, Geleit und Versorgung.', 'watch', 'dem Hauptmann der Schwurritter'),
  ],
};

const penitents = {
  id: 'vikariatsbusse', title: 'Persönliche Büßer', icon: 'faith', repeatableHere: true,
  description: 'Die geistliche Leitung begleitet die Buße und vereinbart persönliche Dienste und Auflagen.',
  slots: supportSlots('buesser', 'Persönlicher Büßer', 2, 'special', 'Erfüllt die individuell vereinbarte Buße unter persönlicher geistlicher Leitung.', 'faith', 'der Leitung des Vikariats'),
};

export function buildVicariatePlan(house) {
  const staff = personnel.flatMap(([id, title, count, description, icon]) =>
    Array.from({ length: count }, (_, index) => ({
      id: index ? `${id}-${index + 1}` : id, title, description, icon, kind: 'staff', templateId: `staff-${id}`,
    })));
  const retired = {
    ...oldRoles,
    ...Object.fromEntries(house.places.map(({ name }) => [`seelsorge-${geographicKey(name)}`, `Kirchendienst · ${name}`])),
  };
  return {
    sections: [
      { title: 'Vikariatsleitung', icon: 'faith', slots: [
        { id: 'dechant', title: 'Dechant', description: 'Führt im Auftrag des Vikariats die Aufsicht über die Ortsdiakone und koordiniert ihre Berichte.', icon: 'faith' },
        { id: 'vikarsadjunkt', title: 'Adjutant des Vikars · Kurator', description: 'Führt die persönliche Kanzlei und vertritt das Vikariat bei übertragenen Aufgaben.', icon: 'records' },
      ] },
      { id: 'vikariatsstab', title: 'Persönlicher Stab des Vikariats', icon: 'records', staff: true, slots: staff },
      deaconSection(house.places, 'Jede Siedlung hat einen Diakon als Vorsteher der Ortskirche.'),
      smallGuard,
      penitents,
    ],
    lower: [{ id: 'heiler', title: 'Kirchenheiler', description: 'Betreut Kranke und vermittelt weiterführende Hilfe.', icon: 'care', kind: 'other' }],
    retired,
  };
}
