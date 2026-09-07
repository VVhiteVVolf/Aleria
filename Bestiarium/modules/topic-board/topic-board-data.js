const topic = (id, title, description, note = '') => ({ id, title, description, note, href: null });

export const BESTIARY_TOPIC_GROUPS = [
  {
    id: 'sphaerenkunde', title: 'Infernale & celestiale Themen', number: '01', kind: 'Themenblatt',
    description: 'Über die Grenzen der bekannten Welt.',
    entries: [
      topic('kalpa-morgath', 'Kalpa – Morgath', 'Ein Themenblatt zu Kalpa und Morgath.'),
      topic('risse-manat', 'Risse – Manat', 'Ein Themenblatt zu Rissen und Manat.'),
      topic('geweihte', 'Geweihte', 'Ein Themenblatt über Geweihte.'),
      topic('gefallene', 'Gefallene', 'Ein Themenblatt über Gefallene.'),
      topic('lichtalben', 'Lichtalben – Celestialer', 'Ein Themenblatt zur Verbindung der Lichtalben mit dem Celestialen.'),
      topic('dunkelalben', 'Dunkelalben – Infernaler', 'Ein Themenblatt zur Verbindung der Dunkelalben mit dem Infernalen.')
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
