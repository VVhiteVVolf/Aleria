const topic = (id, title, description, note = '', href = null) => ({ id, title, description, note, href });

export const BESTIARY_TOPIC_GROUPS = [
  {
    id: 'sphaerenkunde', title: 'Infernale & celestiale Themen', number: '01', kind: 'Themenblatt',
    description: 'Über die Grenzen der bekannten Welt.',
    entries: [
      topic('kalpa-morgath', 'Kalpa – Morgath', 'Morgath, Götterdämmerung und der kosmische Zyklus von Schöpfung und Untergang.', '', './themen/kalpa-morgath/index.html'),
      topic('risse-manat', 'Risse – Manât', 'Der Große Spalt, Manât-Risse und die Fragmente verlorener göttlicher Essenz.', '', './themen/risse-manat/index.html'),
      topic('geweihte', 'Geweihte', 'Göttliche Inkarnationen, ihre Mission, Entstehung und Wiedergeburt.', '', './themen/geweihte/index.html'),
      topic('gefallene', 'Gefallene', 'Verbannte Inkarnationen zwischen göttlicher Herkunft, Sterblichkeit und Wiedergeburt.', '', './themen/gefallene/index.html'),
      topic('lichtalben', 'Lichtalben – Celestiale', 'Diener der Göttlichen, ihre Tugenden, Fähigkeiten und weltlichen Einflüsse.', '', './themen/lichtalben/index.html'),
      topic('dunkelalben', 'Dunkelalben – Infernale', 'Diener der Infernalen, geprägt von Verderbnis, Chaos und dunkler göttlicher Herkunft.', '', './themen/dunkelalben/index.html')
    ]
  },
  {
    id: 'feldnotizen', title: 'Sonstige Themen', number: '02', kind: 'Forschungsnotiz',
    description: 'Beobachtungen, Querverweise und praktische Tierkunde.',
    entries: [topic('pferdekreuzungsmatrix', 'Pferdekreuzungsmatrix', 'Hier entsteht eine Übersicht zur Kreuzung der Pferdelinien Alerias.', 'Zucht & Abstammung')]
  },
  {
    id: 'literatur', title: 'Literatur & Quellen', number: '03', kind: 'Literaturverweis',
    description: 'Die Bibliothek hinter dem Bestiarium.',
    entries: [
      topic('wesen-des-infernalen', 'Das Wesen des Infernalen', 'Vorgemerktes Werk aus dem Literaturverzeichnis der bisherigen Sammlung.'),
      topic('daemonologie', 'Dämonologie', 'Die Bände I bis X der Dämonologie sind für die Bibliothek vorgemerkt.', 'Band I–X'),
      topic('nekrophagen-baende', 'Nekrophagen', 'Die Bände I bis V über Nekrophagen sind für die Bibliothek vorgemerkt.', 'Band I–V'),
      topic('bestienkunde', 'Bestienkunde der Alten Reiche', 'Vorgemerktes Werk aus dem Literaturverzeichnis der bisherigen Sammlung.'),
      topic('hoellenpakte', 'Über Höllenpakte', 'Vorgemerktes Werk aus dem Literaturverzeichnis der bisherigen Sammlung.'),
      topic('chroniken-celestialen', 'Chroniken der Celestialen', 'Vorgemerktes Werk aus dem Literaturverzeichnis der bisherigen Sammlung.')
    ]
  }
];

export const BESTIARY_TOPICS = BESTIARY_TOPIC_GROUPS.flatMap(group =>
  group.entries.map(item => ({ ...item, chapter: group.title, group: group.kind }))
);
