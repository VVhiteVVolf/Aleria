// Gemeinsame Ortsquelle für Karte und Almanach. Normierte Koordinaten: Ursprung links oben.
export const HOF_MAP_ID = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis-tirfelyn-hof';
export const HOF_MAP_FOLDER = 'Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/tirfelyn-hof';
export const HOF_MAIN_WORKPLACES = ['holzfaellerlager', 'muehle', 'gerberhaus', 'hufschmiede', 'imkerei', 'gestuet', 'raeucherhaus'];
export const HOF_POIS = [
  {
    "key": "holzfaellerlager",
    "title": "Holzfällerlager",
    "position": [
      0.188,
      0.1
    ],
    "responsibleIds": [
      "hallvard",
      "torleif"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/holzfaellerlager-v1.png",
    "imageBrief": "Holzfällerarbeitsplatz mit Stämmen, Holzstapeln und einfachem Unterstand",
    "text": "Die aldrimarischen Brüder Hallvard und Torleif schlagen Nutz- und Brennholz für den Hof. Sie entasten die Stämme, bereiten Bauholz vor und halten den Brennholzvorrat für Haus, Mühle und Räucherhaus bereit."
  },
  {
    "key": "holzfaellerhaus-ost",
    "title": "Hallvards und Rannveigs Haus",
    "position": [
      0.235,
      0.112
    ],
    "responsibleIds": [],
    "residenceId": "holzfaellerhaus-ost",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/holzfaellerhaus-ost-v1.png",
    "imageBrief": "Einfaches Wohnhaus am Waldrand",
    "text": "Hier wohnen Hallvard und seine Frau Rannveig. Torleifs eigener Wohnteil ist direkt an ihr Haus angebaut. Während Hallvard im Holzfällerlager arbeitet, sammelt Rannveig Beeren und Kräuter in den nahen Wäldern und bringt sie in die Vorratshaltung des Hofes ein."
  },
  {
    "key": "holzfaellerhaus-sued",
    "title": "Torleifs Haus",
    "position": [
      0.253,
      0.122
    ],
    "responsibleIds": [],
    "residenceId": "holzfaellerhaus-sued",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/holzfaellerhaus-sued-v1.png",
    "imageBrief": "Kleines schlichtes Wohnhaus beim Holzlager",
    "text": "Torleifs eigener Wohnteil ist unmittelbar an das Haus seines Bruders Hallvard und dessen Frau Rannveig angebaut. Er wohnt mit ihnen am Holzfällerlager; der weiter südlich stehende Schuppen gehört nicht zu seinem Wohnhaus. Sein Wohnteil ist schlicht eingerichtet; Arbeitskleidung und Werkzeug werden trocken beim Eingang verwahrt."
  },
  {
    "key": "bedienstetenhuette-01",
    "title": "Nefydds Hütte",
    "position": [
      0.387,
      0.105
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-01",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-01-v1.png",
    "imageBrief": "Einfache Bedienstetenhütte",
    "text": "Der Feldknecht Nefydd wohnt in der nördlichsten Hütte. Er unterstützt Gwallog beim Bestellen der Äcker und bei der Ernte."
  },
  {
    "key": "bedienstetenhuette-02",
    "title": "Rhufons Hütte",
    "position": [
      0.369,
      0.157
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-02",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-02-v1.png",
    "imageBrief": "Einfache Bedienstetenhütte",
    "text": "Rhufon hilft auf den Feldern und bei den täglich wechselnden Hofarbeiten. Bei Lieferungen unterstützt er die Familie mit Wagen, Säcken und Kisten."
  },
  {
    "key": "bedienstetenhuette-03",
    "title": "Maldwyns Hütte",
    "position": [
      0.398,
      0.183
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-03",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-03-v1.png",
    "imageBrief": "Einfache Bedienstetenhütte",
    "text": "Der Viehknecht Maldwyn wohnt zwischen Hütten und Weidewegen. Unter Eudafs Leitung hilft er bei Fütterung, Viehtrieb und der Pflege der Einfriedungen."
  },
  {
    "key": "bedienstetenhuette-04",
    "title": "Haus der Müllerfamilie",
    "position": [
      0.47,
      0.192
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-04",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-04-v1.png",
    "imageBrief": "Größere schlichte Wohnhütte für eine vierköpfige Familie",
    "text": "Hier wohnen Meirig, seine Frau Gwenneth und ihre Söhne Iorfin und Eifor. Gwenneth führt den eigenen Haushalt; Meirig arbeitet in der Hofmühle."
  },
  {
    "key": "bedienstetenhuette-05",
    "title": "Cynfarchs Hütte",
    "position": [
      0.454,
      0.259
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-05",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-05-v1.png",
    "imageBrief": "Einfache Wohnhütte des jungen Hufschmieds",
    "text": "Cynfarch aus Bronhir bewohnt diese Hütte. Von hier geht er zur Schmiede, wo er die Hofpferde beschlägt und eiserne Gerätschaften instand hält."
  },
  {
    "key": "bedienstetenhuette-06",
    "title": "Eiluneds Hütte",
    "position": [
      0.509,
      0.243
    ],
    "responsibleIds": [],
    "residenceId": "bedienstetenhuette-06",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bedienstetenhuette-06-v1.png",
    "imageBrief": "Einfache Bedienstetenhütte",
    "text": "Eiluned unterstützt Enid und Madrun im gemeinsamen Hofhaushalt. Wäsche, Reinigung und Wasserholen gehören zu ihren wechselnden Aufgaben."
  },
  {
    "key": "muehle",
    "title": "Hofmühle",
    "position": [
      0.5,
      0.372
    ],
    "responsibleIds": [
      "meirig"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/muehle-v1.png",
    "imageBrief": "Windmühle nach der gelieferten Ortskarte",
    "text": "Meirig mahlt das Getreide des Tirfelyn-Hofs zu Mehl und Schrot. Iorfin lernt die Abläufe unter seiner Aufsicht kennen; die beiden Söhne übernehmen keine selbständige Verantwortung an der Mühlentechnik."
  },
  {
    "key": "gerberhaus",
    "title": "Gerberhaus",
    "position": [
      0.718,
      0.445
    ],
    "responsibleIds": [
      "gwion-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/gerberhaus-v1.png",
    "imageBrief": "Kleines Gerberhaus mit Arbeitsbereich für Häute und Leder",
    "text": "Cynddylan übernimmt hier die Häuteaufbereitung und einfache Lederarbeiten für den Hof. Nutzbares Material wird für Riemen und die Instandhaltung der Hofausstattung vorbereitet."
  },
  {
    "key": "bauernherrenhaus",
    "title": "Bauernherrenhaus Tirfelyn",
    "position": [
      0.69,
      0.567
    ],
    "responsibleIds": [
      "caradog-tirfelyn",
      "eudaf-tirfelyn"
    ],
    "residenceId": "bauernherrenhaus",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bauernherrenhaus-v1.png",
    "imageBrief": "Gemeinsames Bauernherrenhaus mit Innenhof entsprechend der Ortskarte",
    "text": "Caradog und Eudaf führen den Hof gemeinsam. Hier wohnen die beiden Familienzweige mit insgesamt sechzehn lebenden Angehörigen; am Familientisch werden Arbeit, Vorräte und Lieferungen abgestimmt."
  },
  {
    "key": "hufschmiede",
    "title": "Hufschmiede",
    "position": [
      0.839,
      0.362
    ],
    "responsibleIds": [
      "cynfarch"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/hufschmiede-v1.png",
    "imageBrief": "Ländliche Hufschmiede mit Esse, Amboss und Beschlagplatz",
    "text": "Der junge Cynfarch aus Bronhir beschlägt die Hofpferde. Außerdem kümmert er sich um eiserne Beschläge und kleine Reparaturen an den landwirtschaftlichen Geräten."
  },
  {
    "key": "imkerei",
    "title": "Imkerei",
    "position": [
      0.923,
      0.188
    ],
    "responsibleIds": [
      "enid-spouse-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/imkerei-v1.png",
    "imageBrief": "Bienenhaus und Bienenstöcke nach der Ortskarte",
    "text": "Enid betreut die Bienen des Hofes. Honig ergänzt die Vorräte der Familie; Wachs wird gesammelt und im Haushalt weiterverwendet."
  },
  {
    "key": "gestuet",
    "title": "Hofgestüt",
    "position": [
      0.963,
      0.565
    ],
    "responsibleIds": [
      "gareth-tirfelyn",
      "gwion-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/gestuet-v1.png",
    "imageBrief": "Kleiner Pferdestall mit eingefriedetem Auslauf nach der Ortskarte",
    "text": "Gareth und Cynddylan versorgen die Hofpferde, halten Stall und Auslauf sauber und stellen Futter bereit. Den nötigen Hufbeschlag übernimmt Cynfarch."
  },
  {
    "key": "raeucherhaus",
    "title": "Räucherhaus",
    "position": [
      0.696,
      0.372
    ],
    "responsibleIds": [
      "glesni-spouse-tirfelyn",
      "eirwen-spouse-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/raeucherhaus-v1.png",
    "imageBrief": "Kleines ländliches Räucherhaus",
    "text": "Madrun und Gwenfyl machen hier einen Teil der Erzeugnisse haltbar. Salz, Rauch und sorgfältige Lagerung helfen, die Vorräte über arbeitsreiche und kalte Wochen zu bewahren."
  },
  {
    "key": "kornspeicher",
    "title": "Kornspeicher",
    "position": [
      0.63,
      0.418
    ],
    "responsibleIds": [
      "cadfan-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/kornspeicher-v1.png",
    "imageBrief": "Gruppe hölzerner Kornspeicher",
    "text": "Gwallog verwahrt hier das eingebrachte Getreide. Saatgut, Mahlgetreide und Futtervorräte werden getrennt und trocken gelagert."
  },
  {
    "key": "lager-west",
    "title": "Westliches Hoflager",
    "position": [
      0.552,
      0.483
    ],
    "responsibleIds": [
      "cadfan-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/lager-west-v1.png",
    "imageBrief": "Einfaches Vorrats- und Gerätegebäude",
    "text": "Werkzeug und Vorräte für Feldarbeit und Lieferungen werden hier untergebracht. Gwallog behält den Überblick über den täglichen Bedarf."
  },
  {
    "key": "geraeteschuppen",
    "title": "Geräteschuppen am Herrenhaus",
    "position": [
      0.708,
      0.643
    ],
    "responsibleIds": [
      "eudaf-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/geraeteschuppen-v1.png",
    "imageBrief": "Kleiner Geräteschuppen",
    "text": "Ein möglicher Platz für Handwerkzeug, Eimer und kleinere Hofgeräte nahe dem Wohnhaus.",
    "sourceNote": "Unbeschriftetes Nebengebäude; Nutzung als Geräteschuppen ist ein Vorschlag"
  },
  {
    "key": "lager-sued",
    "title": "Südliches Vorratslager",
    "position": [
      0.781,
      0.67
    ],
    "responsibleIds": [
      "glesni-spouse-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/lager-sued-v1.png",
    "imageBrief": "Schlichter Vorratsschuppen",
    "text": "Madrun bewahrt hier länger haltbare Vorräte und leere Behälter auf. Der kurze Weg zum Herrenhaus erleichtert die Versorgung des großen Haushalts."
  },
  {
    "key": "lager-ost",
    "title": "Lager beim Gestüt",
    "position": [
      0.915,
      0.629
    ],
    "responsibleIds": [
      "gareth-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/lager-ost-v1.png",
    "imageBrief": "Futter- und Geräteschuppen beim Pferdeauslauf",
    "text": "Futter und Gerätschaften für Pferde und die nahen Weiden liegen hier griffbereit. Gareth stimmt die Vorräte mit Eudaf ab."
  },
  {
    "key": "hausgarten",
    "title": "Hausgärten",
    "position": [
      0.805,
      0.565
    ],
    "responsibleIds": [
      "enid-spouse-tirfelyn",
      "olwen-spouse-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/hausgarten-v1.png",
    "imageBrief": "Eingefasste Gemüse- und Kräutergärten am Wohnhaus",
    "text": "Enid und Gwenfron ziehen Gemüse und Küchenkräuter für den gemeinsamen Haushalt. Jüngere Angehörige helfen bei überschaubaren Handgriffen unter Anleitung."
  },
  {
    "key": "obstgarten",
    "title": "Obstbäume",
    "position": [
      0.929,
      0.431
    ],
    "responsibleIds": [
      "olwen-spouse-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/obstgarten-v1.png",
    "imageBrief": "Obstbäume am Hofrand",
    "text": "Gwenfron kümmert sich um die Obsternte. Frisches Obst kommt auf den Tisch; ein Teil wird getrocknet oder für den Winter eingelagert."
  },
  {
    "key": "acker-mitte",
    "title": "Großer Acker bei der Mühle",
    "position": [
      0.299,
      0.425
    ],
    "responsibleIds": [
      "caradog-tirfelyn",
      "cadfan-tirfelyn",
      "nefydd"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/acker-mitte-v1.png",
    "imageBrief": "Bestelltes Feld mit Hofmühle im Hintergrund",
    "text": "Caradog und Gwallog planen die Feldarbeit. Nefydd hilft bei Bodenbearbeitung, Aussaat und Ernte."
  },
  {
    "key": "acker-west",
    "title": "Westliche Anbaufläche",
    "position": [
      0.066,
      0.565
    ],
    "responsibleIds": [
      "meleri-tirfelyn",
      "rhufon"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/acker-west-v1.png",
    "imageBrief": "Anbaufläche am westlichen Hofrand",
    "text": "Eiliwedd betreut hier einen Teil des Gemüseanbaus. Rhufon hilft bei Pflege, Ernte und dem Abtransport zum Hof."
  },
  {
    "key": "getreide-suedwest",
    "title": "Südwestliches Getreidefeld",
    "position": [
      0.145,
      0.871
    ],
    "responsibleIds": [
      "cadfan-tirfelyn",
      "nefydd"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/getreide-suedwest-v1.png",
    "imageBrief": "Reifes Getreidefeld des Hofes",
    "text": "Das Getreide gelangt nach der Ernte in die Hofspeicher. Gwallog und Nefydd unterstützen die Familie bei Schnitt und Einbringen."
  },
  {
    "key": "acker-sued",
    "title": "Südliche Anbaufläche",
    "position": [
      0.276,
      0.972
    ],
    "responsibleIds": [
      "caradog-tirfelyn",
      "rhufon"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/acker-sued-v1.png",
    "imageBrief": "Südliche Feldfläche mit Hofwegen",
    "text": "Diese Fläche gehört zur gemeinsamen Feldwirtschaft. Welche Kulturen hier stehen, richtet sich nach Caradogs Anbauplanung und der jeweiligen Saison."
  },
  {
    "key": "schafweide",
    "title": "Schafweide",
    "position": [
      0.651,
      0.209
    ],
    "responsibleIds": [
      "eudaf-tirfelyn",
      "maldwyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/schafweide-v1.png",
    "imageBrief": "Eingefriedete Schafweide",
    "text": "Eudaf und Maldwyn kümmern sich um die Schafe und kontrollieren Wasser, Futter und Einfriedung. Die Familie übernimmt die anfallenden Arbeiten gemeinsam."
  },
  {
    "key": "rinderweide-west",
    "title": "Westliche Rinderweide",
    "position": [
      0.452,
      0.672
    ],
    "responsibleIds": [
      "gareth-tirfelyn",
      "maldwyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/rinderweide-west-v1.png",
    "imageBrief": "Weite Rinderweide mit Zäunen und Unterstand",
    "text": "Gareth versorgt das Rindvieh. Maldwyn hilft bei Viehtrieb und Weidepflege; Milch und weitere Erzeugnisse werden von der Familie verarbeitet."
  },
  {
    "key": "rinderweide-suedost",
    "title": "Südöstliche Rinderweide",
    "position": [
      0.74,
      0.789
    ],
    "responsibleIds": [
      "gareth-tirfelyn",
      "maldwyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/rinderweide-suedost-v1.png",
    "imageBrief": "Rinder auf der südöstlichen Weide",
    "text": "Auch diese Weide gehört zur Viehwirtschaft des Familienhofs. Gareth und Maldwyn sehen täglich nach Tieren und Zäunen."
  },
  {
    "key": "bullenweide",
    "title": "Bullenweide",
    "position": [
      0.926,
      0.844
    ],
    "responsibleIds": [
      "eudaf-tirfelyn",
      "maldwyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/bullenweide-v1.png",
    "imageBrief": "Getrennte Bullenweide",
    "text": "Die Bullen stehen in einer eigenen Einfriedung. Den Umgang mit den kräftigen Tieren übernehmen erfahrene Erwachsene unter Eudafs Verantwortung."
  },
  {
    "key": "weide-nordost",
    "title": "Nordöstliche Weide",
    "position": [
      0.877,
      0.057
    ],
    "responsibleIds": [
      "eudaf-tirfelyn",
      "maldwyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/weide-nordost-v1.png",
    "imageBrief": "Weitere eingefriedete Hofweide am nördlichen Rand",
    "text": "Die zusätzliche Weide gibt der Familie Spielraum bei der Einteilung des Viehs. Ihre Nutzung richtet sich nach Futterstand und Bedarf."
  },
  {
    "key": "schweinegehege",
    "title": "Schweinegehege",
    "position": [
      0.763,
      0.392
    ],
    "responsibleIds": [
      "eudaf-tirfelyn",
      "gwion-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/schweinegehege-v1.png",
    "imageBrief": "Kleines Schweinegehege mit einfachem Unterstand",
    "text": "Eudaf und Cynddylan versorgen die Schweine nahe den Wirtschaftsgebäuden. Regelmäßige Fütterung und Reinigung gehören zur täglichen Hofarbeit."
  },
  {
    "key": "hofbrunnen",
    "title": "Brunnen am Herrenhaus",
    "position": [
      0.684,
      0.52
    ],
    "responsibleIds": [
      "eiluned"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/hofbrunnen-v1.png",
    "imageBrief": "Einfacher Hofbrunnen",
    "text": "Hier holt die Familie Wasser für den gemeinsamen Haushalt. Eiluned unterstützt sie bei den täglichen Wegen mit Eimern und Gefäßen."
  },
  {
    "key": "wirtschaftsbrunnen",
    "title": "Brunnen bei den Wirtschaftsgebäuden",
    "position": [
      0.799,
      0.427
    ],
    "responsibleIds": [
      "gwion-tirfelyn"
    ],
    "residenceId": "",
    "image": "/AleriaAlmanach/assets/tirfelyn-hof/scenes/wirtschaftsbrunnen-v1.png",
    "imageBrief": "Brunnen zwischen Arbeitsgebäuden",
    "text": "Der Brunnen versorgt die nahen Arbeitsbereiche mit Wasser. Cynddylan nutzt ihn bei den alltäglichen Stall- und Hofarbeiten."
  }
];

// Latest user choice: map the houses and principal workplaces, not minor farm details.
export const HOF_MAPPED_POIS = HOF_POIS.filter(poi => poi.residenceId || HOF_MAIN_WORKPLACES.includes(poi.key));
