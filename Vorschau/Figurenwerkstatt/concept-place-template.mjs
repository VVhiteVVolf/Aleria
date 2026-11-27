import {
  connections, decisions, decisionTab, field, group, imageFormat, imageVariants, link, list,
  nameFields, notes, prose, reference, sources, tab, timeline, topic
} from './concept-template-sections.mjs';

export const PLACE_TEMPLATE = {
  label: 'Ortsentwurf',
  untitled: 'Ort ohne Namen',
  name: 'Ort',
  art: 'territory',
  summary: 'Lage, Karten, Bewohner, Versorgung und Schauplätze.',
  relationGroups: { neighbors: 'Nachbarorte', authority: 'Herrschaft', trade: 'Handel & Wege', other: 'Weitere' },
  decisionTopics: [
    topic('location', 'Lage & Ortstyp', 'region', 'kind', 'location'),
    topic('authority', 'Herrschaft & Zuständigkeit', 'authority'),
    topic('access', 'Zugänge & Wege', 'access'),
    topic('landmark', 'Zentraler Schauplatz')
  ],
  tabs: [
    tab('profile', 'Steckbrief', 'records', [
      group('Identität und Lage', [
        ...nameFields, field('kind', 'Ortstyp', 'z. B. Weiler, Burg oder Hafen'),
        field('region', 'Land und Region'), field('population', 'Größe oder Einwohnerzahl'),
        field('authority', 'Herrschaft oder Verwaltung')
      ]),
      group('Bedeutung', [
        prose('pitch', 'Der Ort in wenigen Sätzen'),
        prose('location', 'Lage und Umgebung', 'Welche Landschaft, Gewässer oder Grenzen bestimmen den Ort?')
      ])
    ]),
    tab('images', 'Karte & Ansichten', 'inquiry', [
      group('Ortsbild', [
        link('map', 'Kartenlink'),
        prose('look', 'Bauweise und Atmosphäre', 'Was sieht, hört oder riecht man bei der Ankunft?')
      ])
    ], ['images', 'landmarks'], 'Vergleiche Karten oder Ortsansichten. Halte wichtige Gebäude und Schauplätze einzeln fest.'),
    decisionTab,
    tab('people', 'Bewohner & Alltag', 'ancestry', [
      group('Leben am Ort', [
        prose('customs', 'Alltag, Bräuche und Treffpunkte'),
        prose('community', 'Bevölkerungsgruppen und Zuständigkeiten')
      ])
    ], ['residents']),
    tab('supply', 'Wege & Versorgung', 'supplies', [
      group('Erreichbarkeit und Versorgung', [
        prose('access', 'Zugänge und Reisezeiten', 'Straßen, Fähren, Winterwege oder gesperrte Übergänge.'),
        prose('supply', 'Wasser, Nahrung, Handel und Einkünfte'),
        prose('services', 'Unterkünfte, Dienste und örtliche Gefahren')
      ])
    ]),
    tab('relations', 'Beziehungen', 'diplomacy', [], ['relations']),
    tab('history', 'Geschichte & Szenen', 'learning', [
      group('Chronik und Spiel', [
        prose('founding', 'Entstehung und einschneidende Ereignisse'),
        prose('hooks', 'Konflikte, Geheimnisse und Szenenideen')
      ])
    ], ['timeline']),
    notes
  ],
  lists: {
    images: imageVariants('landscape'), decisions, relations: connections, timeline, sources,
    landmarks: list('Ortspunkte', 'Ortspunkt ergänzen', [
      field('name', 'Name des Ortspunkts'), field('location', 'Lage oder Koordinate'),
      link('image', 'Bildlink'), imageFormat, prose('note', 'Funktion und Szenenidee')
    ], { media: 'image', defaultMediaFormat: 'landscape' }),
    residents: list('Bewohner und Gruppen', 'Eintrag ergänzen', [
      reference('Name oder Entwurf'), field('role', 'Aufgabe oder Stellung am Ort'),
      link('source', 'Figurenakte oder Stammbaum'), link('image', 'Bildlink'), imageFormat,
      prose('note', 'Wohnort, Alltag und Anliegen')
    ], { media: 'image', defaultMediaFormat: 'portrait' })
  }
};
