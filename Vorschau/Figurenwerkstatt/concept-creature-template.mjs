import {
  abilityList, connections, decisions, decisionTab, field, group, imageVariants, list, nameFields,
  notes, prose, sources, tab, timeline, topic, traits
} from './concept-template-sections.mjs';

export const CREATURE_TEMPLATE = {
  label: 'Kreaturenentwurf',
  untitled: 'Kreatur ohne Namen',
  name: 'Kreatur',
  art: 'horse',
  summary: 'Art, Erscheinung, Verhalten, Lebensraum, Bindungen und Fähigkeiten.',
  relationGroups: { keepers: 'Haltung & Bindung', habitat: 'Revier & Vorkommen', companions: 'Artgenossen', other: 'Weitere' },
  decisionTopics: [
    topic('species', 'Art & Einordnung', 'species', 'kind', 'size'),
    topic('habitat', 'Lebensraum & Revier', 'range', 'habitat'),
    topic('temperament', 'Verhalten & Umgang', 'temperament', 'handling'),
    topic('ability', 'Besondere Fähigkeit & Grenze')
  ],
  tabs: [
    tab('profile', 'Steckbrief', 'records', [
      group('Identität und Einordnung', [
        ...nameFields, field('species', 'Art oder Rasse'),
        field('kind', 'Kategorie', 'z. B. Wildtier, Begleiter oder Fabelwesen'),
        field('age', 'Alter oder Lebensphase'), field('size', 'Größe und Gewicht'),
        field('range', 'Herkunft oder Verbreitung')
      ]),
      group('Kernidee', [prose('pitch', 'Was zeichnet dieses Tier, Wesen oder diese Art aus?')])
    ]),
    tab('images', 'Porträts & Merkmale', 'inquiry', [
      group('Erscheinung', [
        prose('look', 'Körperbau, Farbe und besondere Kennzeichen'),
        prose('tracks', 'Stimme, Geruch und erkennbare Spuren')
      ])
    ], ['images'], 'Vergleiche bis zu drei Porträts im Hochformat 2:3.'),
    decisionTab,
    tab('behavior', 'Verhalten & Haltung', 'care', [
      group('Verhalten und Bedürfnisse', [
        prose('temperament', 'Temperament und Sozialverhalten'),
        prose('habitat', 'Lebensraum, Revier und Bewegung'),
        prose('diet', 'Nahrung, Pflege und Bedürfnisse'),
        prose('handling', 'Annäherung, Vertrauen und Gewöhnung')
      ])
    ], ['traits']),
    tab('abilities', 'Fähigkeiten & Grenzen', 'arcane', [
      group('Spielwerte', [prose('stats', 'Optionale Spielwerte und Regeln', 'z. B. Bewegung, Ausdauer, Wahrnehmung oder Verhalten in einer Probe.')])
    ], ['abilities']),
    tab('relations', 'Bindungen & Vorkommen', 'diplomacy', [], ['relations'],
      'Ordne die Kreatur Haltern, Figuren, Rudeln oder Ortsentwürfen zu.'),
    tab('history', 'Herkunft & Begegnungen', 'learning', [
      group('Entwicklung und Spiel', [
        prose('origin', 'Aufzucht, Ursprung oder bisheriger Weg'),
        prose('hooks', 'Begegnungen und Szenenideen')
      ])
    ], ['encounters', 'timeline']),
    notes
  ],
  lists: {
    images: imageVariants('portrait'), decisions, relations: connections, timeline, sources,
    traits: traits('Acht Verhaltensmerkmale'),
    abilities: abilityList('Fähigkeiten der Kreatur', 'Fähigkeit ergänzen', {
      instinct: 'Instinkt', sense: 'Sinn', training: 'Training', magic: 'Magie', other: 'Sonstiges'
    }),
    encounters: list('Begegnungen', 'Begegnung ergänzen', [
      field('name', 'Titel'), field('trigger', 'Ort, Anlass oder Auslöser'),
      prose('note', 'Verhalten der Kreatur und mögliche Reaktionen')
    ])
  }
};
