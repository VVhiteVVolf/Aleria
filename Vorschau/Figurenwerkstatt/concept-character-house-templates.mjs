import {
  abilityList, decisions, decisionTab, field, group, imageFormat, link, list, nameFields,
  notes, people, prose, reference, relations, sources, tab, timeline, topic, traits, variants
} from './concept-template-sections.mjs';

export const CHARACTER_AND_HOUSE_TEMPLATES = {
  character: {
    label: 'Figurenentwurf',
    untitled: 'Figur ohne Namen',
    name: 'Figur',
    art: 'ancestry',
    summary: 'Aussehen, Persönlichkeit, Beziehungen, Gefährten und Fähigkeiten.',
    relationGroups: { family: 'Familie', allies: 'Freunde & Verbündete', rivals: 'Rivalen', other: 'Weitere' },
    decisionTopics: [
      topic('identity', 'Name & Identität', 'name', 'age', 'culture'),
      topic('origin', 'Herkunft & Zugehörigkeit', 'origin', 'affiliation', 'residence'),
      topic('role', 'Rolle', 'role'), topic('pitch', 'Kernidee', 'pitch'),
      topic('relationships', 'Beziehungen & Gefährten')
    ],
    tabs: [
      tab('profile', 'Steckbrief', 'records', [
        group('Identität', [
          ...nameFields, field('age', 'Alter oder Geburtsjahr'),
          field('origin', 'Herkunft'), field('culture', 'Volk oder Kultur'),
          field('role', 'Beruf, Stand oder Rolle'), field('affiliation', 'Haus oder Zugehörigkeit'),
          field('residence', 'Derzeitiger Aufenthaltsort')
        ]),
        group('Kernidee', [prose('pitch', 'Die Figur in wenigen Sätzen', 'Was macht diese Figur aus und wo kommt sie ins Spiel?')])
      ]),
      tab('images', 'Aussehen', 'inquiry', [
        group('Gestaltung', [prose('look', 'Aussehen, Kleidung und Auftreten', 'Statur, Gesicht, Kleidung, Farben und erkennbare Besonderheiten.')])
      ], ['images'], 'Vergleiche bis zu drei Bildvarianten und lege das Hauptbild für den Entwurf fest.'),
      decisionTab,
      tab('identity', 'Persönlichkeit', 'quill', [
        group('Vier Absätze', [
          prose('impression', 'Wesen und erster Eindruck', 'Wie erleben andere die Figur bei der ersten Begegnung?'),
          prose('values', 'Werte und Beweggründe', 'Wofür setzt sie sich ein und was treibt sie an?'),
          prose('weakness', 'Schwächen und Widersprüche', 'Wo gerät sie mit sich selbst oder mit anderen in Konflikt?'),
          prose('pressure', 'Verhalten unter Druck', 'Was ändert sich, wenn etwas auf dem Spiel steht?')
        ])
      ], ['traits']),
      tab('relations', 'Beziehungen', 'diplomacy', [], ['relations'],
        'Verknüpfe Figuren, Häuser und andere Entwürfe oder halte eine neue Idee unter einem freien Namen fest.'),
      tab('people', 'Gefährten', 'horse', [], ['companions'],
        'Halte tierische Begleiter, Reittiere und andere Gefährten fest.'),
      tab('abilities', 'Fähigkeiten', 'arcane', [], ['abilities'],
        'Beschreibe, was die Figur beherrscht und unter welchen Bedingungen sie es einsetzen kann.'),
      tab('history', 'Geschichte', 'learning', [
        group('Werdegang', [
          prose('past', 'Herkunft und prägende Erlebnisse'),
          prose('present', 'Gegenwärtige Lage'),
          prose('goals', 'Ziele und Aufhänger für Szenen')
        ])
      ], ['timeline']),
      notes
    ],
    lists: {
      images: variants,
      decisions,
      traits: traits('Acht Persönlichkeitsmerkmale'),
      relations,
      companions: list('Gefährten', 'Gefährten ergänzen', [
        reference('Name'), field('kind', 'Art oder Rolle'), link('image', 'Bildlink'), imageFormat,
        prose('note', 'Herkunft, Bindung und Verhalten')
      ], { media: 'image' }),
      abilities: abilityList('Besondere Fähigkeiten', 'Fähigkeit ergänzen', {
        aptitude: 'Begabung', training: 'Ausbildung', magic: 'Magie', style: 'Kampfstil', other: 'Sonstiges'
      }),
      timeline,
      sources
    }
  },
  house: {
    label: 'Hausentwurf',
    untitled: 'Haus ohne Namen',
    name: 'Haus',
    art: 'court',
    summary: 'Wappen, Hausprofil, Familienzweige, Bündnisse, Sitze und Erbe.',
    relationGroups: { allies: 'Bündnisse', family: 'Heiraten & Verwandtschaft', lieges: 'Lehnsbindungen', rivals: 'Rivalitäten', other: 'Weitere' },
    decisionTopics: [
      topic('name', 'Name & Wahlspruch', 'name', 'motto'),
      topic('seat', 'Hauptsitz & Region', 'seat', 'region'),
      topic('rank', 'Rang & Lehnstreue', 'rank'),
      topic('succession', 'Linien & Erbfolge', 'succession'),
      topic('alliances', 'Bündnisse')
    ],
    tabs: [
      tab('profile', 'Steckbrief', 'records', [
        group('Haus und Herkunft', [
          ...nameFields, field('rank', 'Stand oder Rang'),
          field('region', 'Land und Region'), field('seat', 'Hauptsitz'),
          field('motto', 'Wahlspruch'), field('head', 'Hausoberhaupt oder Führung')
        ]),
        group('Kernidee', [prose('pitch', 'Das Haus in wenigen Sätzen', 'Wo steht die Familie in der Welt und was unterscheidet sie von ihren Nachbarn?')])
      ]),
      tab('images', 'Wappen & Bilder', 'inquiry', [
        group('Gestaltung', [prose('look', 'Wappen, Farben und Auftreten', 'Heraldik, Hausfarben, Siegel, Kleidung und Merkmale des Familiensitzes.')])
      ], ['images'], 'Vergleiche drei Wappenentwürfe oder sammle Bilder für Wappen, Sitz und Familie.'),
      decisionTab,
      tab('identity', 'Hausprofil', 'quill', [
        group('Vier Absätze', [
          prose('impression', 'Selbstbild und Ruf'),
          prose('values', 'Werte und Hauskodex'),
          prose('traditions', 'Traditionen und Glaube'),
          prose('tensions', 'Innere Spannungen')
        ])
      ], ['traits']),
      tab('relations', 'Beziehungen', 'diplomacy', [], ['relations'],
        'Plane Bündnisse, Heiraten, Lehnstreue und Rivalitäten. Verknüpfe Registereinträge oder Entwürfe aus der Mappe.'),
      tab('people', 'Familie & Gefolge', 'ancestry', [
        group('Linien und Erbfolge', [prose('succession', 'Hauptlinie, Nebenlinien und Nachfolge')])
      ], ['members', 'retinue']),
      tab('abilities', 'Sitze & Erbe', 'territory', [
        group('Einfluss', [prose('influence', 'Besitz, Einkünfte und politischer Einfluss')])
      ], ['seats', 'abilities']),
      tab('history', 'Geschichte', 'learning', [
        group('Chronik', [
          prose('founding', 'Gründung und Herkunft'),
          prose('present', 'Gegenwart und offene Konflikte'),
          prose('goals', 'Ansprüche, Ziele und Aufhänger für Szenen')
        ])
      ], ['timeline']),
      notes
    ],
    lists: {
      images: { ...variants, defaultMediaFormat: 'square' },
      decisions,
      traits: traits('Acht Merkmale des Hauses'),
      relations,
      members: people('Familienmitglieder', 'Familienmitglied ergänzen', 'Familienrolle oder Amt', 'Verwandtschaft, Stellung und Pläne'),
      retinue: people('Gefolge und Vasallen', 'Gefolgsmitglied ergänzen', 'Dienst oder Amt', 'Bindung, Auftrag und Verpflichtungen'),
      seats: list('Sitze und Besitzungen', 'Sitz ergänzen', [
        field('name', 'Name des Sitzes'), field('region', 'Region'),
        link('image', 'Bildlink'), imageFormat, prose('note', 'Funktion, Leute und Ressourcen')
      ], { media: 'image', defaultMediaFormat: 'landscape' }),
      abilities: abilityList('Besonderheiten des Hauses', 'Besonderheit ergänzen', {
        tradition: 'Hauslehre', bloodline: 'Blutlinie', privilege: 'Amt oder Privileg', holding: 'Ressource', other: 'Sonstiges'
      }),
      timeline,
      sources
    }
  }
};
