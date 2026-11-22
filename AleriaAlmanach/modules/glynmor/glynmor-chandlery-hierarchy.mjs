import { GLYNMOR_EMBLEM, GLYNMOR_MEERA, GLYNMOR_TUDUR } from '../../../shared/glynmor/glynmor-identity.mjs';
import { buildTradingPostHierarchy, level, office } from '../guild-trading-post/trading-post-hierarchy.mjs';
import { glynmorRolePortrait, glynmorSceneImage } from './glynmor-chandlery-scenes.mjs';

export function buildGlynmorChandleryHierarchy(family) {
  const people = new Map(family.persons.map(person => [person.id, person]));
  const namedOffice = (id, title, personId, name, text) =>
    office(id, title, name, text, `../Stammbäume/${people.get(personId).portrait}`);
  const role = (key, title, text) => office(key, title, '', text, glynmorRolePortrait(key));
  const branch = (id, label, levels) => ({ id, label, parentTreeId: 'leitung', levels });

  return buildTradingPostHierarchy({
    title: 'Betriebsordnung der Kerzenmacherei',
    subtitle: 'Meister, Werkstatt, Ladendienst und Auftragslager',
    emblem: `../Stammbäume/${GLYNMOR_EMBLEM}`,
    sideImage: glynmorSceneImage('ziehwerkstatt'),
    motto: 'Familienbetrieb in Gwynthor-Stadt',
    description: '<p>Tudur führt den Betrieb. An der Theke kommen die Bestellungen herein, in der Ziehwerkstatt und Zierkammer entstehen die Kerzen, und das Lager hält fertige Aufträge zur Übergabe bereit. Meera hilft in ihrer freien Zeit bei besonderen Arrangements.</p>',
    details: [
      { label: 'Meister', value: 'Tudur Glynmor' },
      { label: 'Annahme', value: 'Ladentheke' },
      { label: 'Größere Abholungen', value: 'Rückwärtiger Hof' }
    ],
    chartTitle: 'Aufgaben im Betrieb',
    chartIntro: 'Die vier Arbeitsbereiche berichten an Tudur. Die Silhouetten kennzeichnen Aufgabenplätze ohne namentliche Besetzung.',
    trees: [
      {
        id: 'leitung', label: 'Meister',
        levels: [level('Meister und Familienoberhaupt', [
          namedOffice('tudur', 'Kerzenziehermeister', GLYNMOR_TUDUR.personId, 'Tudur Glynmor',
            'Führt Werkstatt und Laden, teilt größere Aufträge ein und gibt fertige Serien zur Auslieferung frei.')
        ])]
      },
      branch('werkstatt', 'Ziehwerkstatt', [level('Herstellung', [
        role('ziehen', 'Kerzenzieher', 'Richtet die Ziehgestelle ein, fertigt die Kerzen paarweise und prüft nach dem Auskühlen ihre Form.'),
        role('dochte', 'Wachs- und Dochtvorbereitung', 'Sortiert das Wachs, richtet die Dochte nach Maß und hält die Ziehwerkstatt mit vorbereiteten Stäben versorgt.')
      ])]),
      branch('verkauf', 'Ladentheke', [level('Verkauf und Bestellungen', [
        role('theke', 'Ladendienst', 'Berät beim Kauf, nimmt Wünsche und Abholtermine auf und reicht Sonderaufträge an Tudur weiter.')
      ])]),
      branch('verzierung', 'Zierkammer', [
        level('Zierhandwerk', [
          role('zierarbeit', 'Kerzenverzierung', 'Arbeitet nach freigegebenen Entwürfen und versieht Festkerzen mit Reliefs, Farben und Abzeichen.')
        ]),
        level('Gelegentliche Mithilfe', [
          namedOffice('meera', 'Kerzenarrangements', GLYNMOR_MEERA.personId, 'Meera Glynmor',
            'Gestaltet in ihrer freien Zeit Gestecke aus Kerzen, Bändern und Blumen.')
        ])
      ]),
      branch('auftraege', 'Lager und Übergabe', [level('Vorräte und Ausgabe', [
        role('lager', 'Lager und Ausgabe', 'Nimmt Wachs und Dochte an, stellt fertige Aufträge bereit und vermerkt Abholungen im Auftragsbuch.')
      ])])
    ]
  });
}
