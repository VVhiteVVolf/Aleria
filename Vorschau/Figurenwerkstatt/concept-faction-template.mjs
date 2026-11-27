import {
  abilityList, connections, decisions, decisionTab, field, group, imageVariants, link, list,
  nameFields, notes, prose, reference, sources, tab, timeline, topic
} from './concept-template-sections.mjs';

export const FACTION_TEMPLATE = {
  label: 'Fraktionsentwurf',
  untitled: 'Fraktion ohne Namen',
  name: 'Fraktion',
  art: 'guild',
  summary: 'Ziele, Wappen, Ränge, Aufnahme, Stützpunkte und Rivalen.',
  relationGroups: { allies: 'Verbündete', authorities: 'Auftraggeber & Obrigkeit', rivals: 'Rivalen', other: 'Weitere' },
  decisionTopics: [
    topic('purpose', 'Auftrag & Ziele', 'pitch', 'goals'),
    topic('leader', 'Führung & Nachfolge', 'leader', 'succession'),
    topic('seat', 'Hauptsitz & Einflussgebiet', 'seat', 'region'),
    topic('admission', 'Aufnahme & Verpflichtungen', 'admission', 'obligations')
  ],
  tabs: [
    tab('profile', 'Steckbrief', 'records', [
      group('Identität und Einfluss', [
        ...nameFields, field('kind', 'Art der Fraktion', 'z. B. Gilde, Orden oder Bande'),
        field('region', 'Einflussgebiet'), field('seat', 'Hauptsitz'),
        field('leader', 'Leitung'), field('size', 'Mitgliederzahl oder Größe')
      ]),
      group('Auftrag', [
        prose('pitch', 'Öffentlicher Auftrag und Ruf'),
        prose('goals', 'Eigentliche Ziele und Interessen')
      ])
    ]),
    tab('images', 'Wappen & Banner', 'inquiry', [
      group('Erkennungszeichen', [prose('look', 'Wappen, Farben, Kleidung und Zeichen')])
    ], ['images'], 'Sammle Varianten für Wappen, Siegel oder Banner und lege das Hauptbild fest.'),
    decisionTab,
    tab('structure', 'Führung & Ränge', 'command', [
      group('Entscheidungswege', [
        prose('structure', 'Aufbau, Ortsgruppen und Zuständigkeiten'),
        prose('succession', 'Wahl, Ernennung und Nachfolge')
      ])
    ], ['ranks']),
    tab('membership', 'Aufnahme & Regeln', 'judgment', [
      group('Mitgliedschaft', [
        prose('admission', 'Voraussetzungen und Aufnahme'),
        prose('obligations', 'Eid, Pflichten und Vorteile'),
        prose('rules', 'Kodex, Sanktionen und Austritt')
      ])
    ]),
    tab('operations', 'Stützpunkte & Mittel', 'territory', [
      group('Handlungsspielraum', [
        prose('operations', 'Geschäfte, Aufträge und Vorgehen'),
        prose('funding', 'Finanzierung und verfügbare Mittel')
      ])
    ], ['bases', 'assets']),
    tab('relations', 'Beziehungen', 'diplomacy', [], ['relations']),
    tab('history', 'Geschichte & Konflikte', 'learning', [
      group('Entwicklung', [
        prose('founding', 'Gründung und prägende Ereignisse'),
        prose('hooks', 'Innere Konflikte und Szenenideen')
      ])
    ], ['timeline']),
    notes
  ],
  lists: {
    images: imageVariants('square'), decisions, relations: connections, timeline, sources,
    ranks: list('Ränge und besetzte Posten', 'Rang ergänzen', [
      field('rank', 'Rang oder Amt'), reference('Inhaber oder Entwurf'),
      field('reportsTo', 'Übergeordnete Stelle'), prose('note', 'Aufgaben und Befugnisse')
    ]),
    bases: list('Stützpunkte', 'Stützpunkt ergänzen', [
      reference('Ort oder Entwurf'), field('role', 'Funktion des Stützpunkts'),
      link('source', 'Ortslink'), prose('note', 'Besetzung und örtliche Zuständigkeiten')
    ]),
    assets: abilityList('Mittel und Besonderheiten', 'Mittel ergänzen', {
      network: 'Kontakte', resource: 'Ressource', privilege: 'Recht oder Privileg', knowledge: 'Wissen'
    })
  }
};
