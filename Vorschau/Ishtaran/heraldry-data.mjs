const sourceDetails = {
  'source-01': ['Rotes Steppenross', 'Rot · Weiß · Schwarz', 'Schwarzer Ring mit weißem Pflanzenornament', 'Steigendes rotes Pferd auf weißem Feld'],
  'source-02': ['Die brennende Lampe', 'Rot · Gold · Dunkelgrün', 'Gold mit schmalem Pflanzenband', 'Brennende goldene Öllampe auf Rot'],
  'source-03': ['Dahakid', 'Purpur · Gold · Blau', 'Reich ornamentierter Goldring', 'Goldener geflügelter Drache auf Purpur'],
  'source-04': ['Rotes Ross auf Gold', 'Rot · Gold', 'Rotes und goldenes Blütenband', 'Rotes schreitendes Pferd auf Goldgelb'],
  'source-05': ['Gekreuzte Klingen', 'Elfenbein · Blau · Silber', 'Silber mit blauen Ornamenten', 'Zwei gekreuzte dunkle Säbel unter einer Sonnenscheibe'],
  'source-06': ['Weißes Schaf', 'Grün · Weiß · Gold', 'Goldener Ring mit geometrischem Band', 'Weißes Schaf unter einer goldenen Krone auf Grün'],
  'source-07': ['Das Wappen Ishtarans', 'Dunkelblau · Gold · Orange', 'Blau-goldener Blütenring', 'Goldene Sonne mit geschwungenem Strahlenkranz auf Blau'],
  'source-08': ['Fisch und Klinge', 'Blau · Weiß · Silber', 'Blau-weißes Pflanzenband', 'Weißer Fisch um ein senkrechtes Schwert auf Blau'],
  'source-09': ['Grünes Krokodil', 'Grün · Ocker · Gold', 'Goldener Ring mit grünen Schmuckfeldern', 'Grünes Krokodil auf goldenem Feld'],
  'source-10': ['Weißer Skorpion', 'Dunkelgrün · Elfenbein · Bronze', 'Verzierter bronzefarbener Rand', 'Heller Skorpion auf Dunkelgrün'],
  'source-11': ['Weißer Adler', 'Grün · Weiß · Silber', 'Dichter grün-weißer Blütenring', 'Weißer Adler mit ausgebreiteten Schwingen auf Grün'],
};

export const EMBLEMS = [
  ...Object.entries(sourceDetails).map(([id, [name, colors, frame, motif]]) => {
    return {
      id, name, status: 'source',
      image: `assets/emblems/previews/${id}.webp`, original: `assets/source/${id}.png`,
      motif, colors, frame,
      note: id === 'source-07' ? 'Geliefertes Landeswappen. Unverändert übernommen.'
        : id === 'source-03' ? 'Geliefertes Wappen von Haus Dahakid. Rang und Sitz bleiben offen.'
        : 'Geliefertes Original. Noch keinem Haus oder Ort zugeordnet.',
      group: id === 'source-07' ? 'realm' : 'pool',
    };
  }),
  {
    id: 'maghneach', name: 'Maghneach', status: 'proposal', group: 'ancient',
    image: 'assets/emblems/previews/maghneach.webp', original: 'assets/emblems/production/maghneach.png',
    motif: 'Weißer Steppenadler mit ausgebreiteten Flügeln auf Blau',
    colors: 'Blau · Weiß · mattes Silber', frame: 'Archaischer Silberring mit sparsamem keltischem Flechtband',
    note: 'Neuer Wappenentwurf für das Urvolk der Maghath und das antike Fürstentum Maghneach. Motiv und Hauptfarben nach Nutzerauftrag.',
  },
  ...[
    ['Der silberne Steppenwolf', 'Silberner Steppenwolf auf Dunkelblau', 'Dunkelblau · Silber', 'Eisenring mit geometrischem Flechtband'],
    ['Der schwarze Schneeleopard', 'Schwarzer Schneeleopard auf Ocker', 'Schwarz · Ocker · Bronze', 'Dunkler Bronzerahmen'],
    ['Der weiße Steinbock', 'Weißer Steinbock auf Weinrot', 'Weiß · Weinrot · Silber', 'Schlichter Silberring mit kleinen Rauten'],
    ['Die dunkle Zypresse', 'Dunkle Zypresse auf Elfenbein', 'Grün · Elfenbein · Bronze', 'Oxidierte Bronze mit grünen floralen Einsätzen'],
    ['Die rote Tulpe', 'Rote Tulpe auf Elfenbein und Dunkelgrün', 'Rot · Elfenbein · Dunkelgrün', 'Messingring mit schmalem Pflanzenornament'],
    ['Der weiße Jagdfalke', 'Weißer Jagdfalke auf Rostrot', 'Weiß · Rostrot · Blau', 'Silberner Ring mit blauen Einsätzen'],
    ['Der goldene Adler', 'Goldener Adler in Seitenansicht mit gehobenem Flügel auf Nachtgrün', 'Gold · Nachtgrün · Schwarz', 'Schwarzer Eisenring mit geometrischen Ornamenten'],
    ['Mond und Sterne', 'Silberne Mondsichel mit drei kleinen Sternen auf Dunkelviolett', 'Silber · Dunkelviolett · Bronze', 'Geschlossener bronzener Schmuckring'],
    ['Das weiße Zelt', 'Weißes Steppenzelt auf Blaugrün', 'Weiß · Blaugrün · Silber', 'Dunkler Holzrahmen mit Silberbeschlägen'],
    ['Der ruhende Löwe', 'Goldener liegender Löwe auf Dunkelrot', 'Gold · Dunkelrot · Bronze', 'Bronzering mit schmalem Ornamentband'],
    ['Der schwarze Stier', 'Schwarzer Stier auf Elfenbein', 'Schwarz · Elfenbein · Eisen', 'Dunkler Eisenring'],
    ['Der weiße Kranich', 'Weißer Kranich auf Olivgrün', 'Weiß · Olivgrün · Silber', 'Silberner Ring mit Pflanzenornament'],
    ['Die goldenen Karpfen', 'Zwei goldene Karpfen im Kreis auf Dunkelblau', 'Gold · Dunkelblau · Bronze', 'Bronzering mit blauen Schmuckfeldern'],
    ['Der silberne Anker', 'Silberner Anker auf Dunkelrot', 'Silber · Dunkelrot · Eisen', 'Dunkler Eisenring mit Tauornament'],
    ['Die goldenen Ähren', 'Goldene Ähren auf Braungrün', 'Gold · Braungrün · Holz', 'Holzring mit schmalen Messingbeschlägen'],
    ['Die weiße Brücke', 'Weiße Karawanenbrücke mit einem Bogen auf Dunkelblau', 'Weiß · Dunkelblau · Silber', 'Silberner Ring mit geometrischem Schmuck'],
    ['Das rote Rad', 'Rotes Rad mit acht Speichen auf Elfenbein', 'Rot · Elfenbein · Bronze', 'Geschlossener bronzener Rand'],
    ['Die goldene Feuerschale', 'Goldene Feuerschale auf Schwarzblau', 'Gold · Schwarzblau · Dunkelrot', 'Dunkelroter Bronzerahmen mit Pflanzenornament'],
    ['Der silberne Hirsch', 'Silberner Hirsch auf Blaugrün', 'Silber · Blaugrün · Rot', 'Bronzering mit roten Schmuckfeldern'],
    ['Der weiße Widder', 'Weißer Widderkopf frontal auf Schwarzrot', 'Weiß · Schwarzrot · Eisen', 'Matter Eisenring'],
    ['Der achtzackige Stern', 'Goldener achtzackiger Stern auf Dunkelblau', 'Gold · Dunkelblau · Silber', 'Schmaler geschlossener Silberring'],
    ['Klinge und Fluss', 'Weißer gesenkter Säbel über rotem Flussband auf Grün', 'Weiß · Rot · Grün', 'Dunkler Holzrahmen mit Silberbeschlägen'],
    ['Die rote Festung', 'Rote Festung mit zwei Türmen auf Elfenbein', 'Rot · Elfenbein · Blau', 'Bronzering mit blauem Flechtband'],
    ['Der goldene Windhund', 'Goldener Windhund auf Schwarzgrün', 'Gold · Schwarzgrün · Eisen', 'Matter Eisenring'],
    ['Das weiße Segelschiff', 'Weißer Segler mit einem Dreieckssegel auf Blau', 'Weiß · Blau · Bronze', 'Bronzering mit Tauornament'],
    ['Der geöffnete Granatapfel', 'Dunkler Granatapfel mit offenem rotem Kern auf Elfenbein', 'Dunkelrot · Elfenbein · Grün', 'Grün patinierter Messingring mit Pflanzenornament'],
  ].map(([name, motif, colors, frame], index) => ({
    id: `pool-${String(index + 1).padStart(2, '0')}`, name, motif, colors, frame,
    status: 'proposal', group: 'pool',
    image: `assets/emblems/previews/pool-${String(index + 1).padStart(2, '0')}.webp`,
    original: `assets/emblems/production/pool-${String(index + 1).padStart(2, '0')}.png`,
    note: 'Neuer freier Wappenvorschlag. Keine Stadt, Familie oder Rangstufe zugeordnet.',
  })),
];
