import {
  abilityList, connections, decisions, decisionTab, field, group, imageVariants, icon, list, nameFields,
  notes, prose, sources, tab, timeline, topic
} from './concept-template-sections.mjs';

export const ITEM_TEMPLATE = {
  label: 'Gegenstandsentwurf',
  untitled: 'Gegenstand ohne Namen',
  name: 'Gegenstand',
  art: 'supplies',
  summary: 'Bilder, Material, Herstellung, Einsatz, Wirkung, Wert und Besitz.',
  relationGroups: { owners: 'Besitz & Verwahrung', makers: 'Herstellung', distribution: 'Fund & Handel', other: 'Weitere' },
  decisionTopics: [
    topic('design', 'Material & Gestaltung', 'material', 'look'),
    topic('use', 'Verwendung & Einschränkungen', 'use', 'limits'),
    topic('value', 'Preis & Seltenheit', 'value', 'rarity'),
    topic('owner', 'Hersteller & Besitz', 'maker', 'owner')
  ],
  tabs: [
    tab('profile', 'Steckbrief', 'records', [
      group('Einordnung', [
        ...nameFields, field('kind', 'Gegenstandsart', 'z. B. Werkzeug, Schmuck oder Relikt'),
        field('material', 'Material'), field('dimensions', 'Maße und Gewicht'),
        field('maker', 'Hersteller oder Werkstatt'), field('owner', 'Besitzer oder Aufbewahrungsort')
      ]),
      group('Kernidee', [prose('pitch', 'Was macht den Gegenstand besonders und wozu dient er?')])
    ]),
    tab('images', 'Bilder & Gestaltung', 'inquiry', [
      group('Aussehen', [
        prose('look', 'Form, Farbe und Details'),
        prose('markings', 'Verzierungen, Zeichen und Gebrauchsspuren')
      ])
    ], ['images'], 'Vergleiche bis zu drei quadratische Ansichten im Format 1:1.'),
    decisionTab,
    tab('craft', 'Bau & Ausführungen', 'works', [
      group('Herstellung und Pflege', [
        prose('craft', 'Technik, Bauteile und Ressourcen'),
        prose('care', 'Pflege, Verschleiß und Reparatur')
      ])
    ], ['editions']),
    tab('use', 'Verwendung & Spielwerte', 'arcane', [
      group('Einsatz', [
        prose('use', 'Verwendung und Voraussetzungen'),
        prose('limits', 'Kosten, Häufigkeit und Grenzen'),
        prose('stats', 'Optionale Spielwerte und Wechselwirkungen')
      ])
    ], ['effects']),
    tab('value', 'Wert & Verfügbarkeit', 'money', [
      group('Handel und Beschaffung', [
        field('value', 'Richtpreis mit Währung'), field('rarity', 'Seltenheit'),
        prose('availability', 'Bezugsquellen, Funde und örtliche Unterschiede')
      ])
    ]),
    tab('relations', 'Besitz & Herkunft', 'diplomacy', [], ['relations'],
      'Verknüpfe Besitzer, Hersteller, Fundorte oder Fraktionen über die Entwurfsmappe.'),
    tab('history', 'Geschichte & Einsatzideen', 'learning', [
      group('Überlieferung und Spiel', [
        prose('origin', 'Entstehung und bisherige Besitzer'),
        prose('hooks', 'Gerüchte, Aufträge und Szenenideen')
      ])
    ], ['timeline']),
    notes
  ],
  lists: {
    images: imageVariants('square'), decisions, relations: connections, timeline, sources,
    editions: list('Ausführungen', 'Ausführung ergänzen', [
      field('name', 'Bezeichnung'), field('material', 'Material oder Ausführung'),
      icon('icon', 'Icon'), prose('note', 'Unterschiede und Besonderheiten')
    ]),
    effects: abilityList('Wirkungen und Eigenschaften', 'Wirkung ergänzen', {
      property: 'Eigenschaft', active: 'Aktive Wirkung', passive: 'Passive Wirkung', drawback: 'Nachteil'
    })
  }
};
