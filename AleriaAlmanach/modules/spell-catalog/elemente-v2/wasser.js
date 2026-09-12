// Authored Elemente edition 2. Published revisions remain immutable.
export const W_SPELLS = [
  {
    "id": "elementarismus-tropfengriff",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W01",
    "sourcePage": 14,
    "name": "Tropfengriff",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Bewegt bis zu 5 Liter frei zugängliches Wasser um höchstens 3 m, füllt ein Gefäß oder zeichnet eine kurzlebige Wasserfigur.",
    "limits": "Kein Schaden und kein Festhalten. Kein Zugriff auf Blut, Körperflüssigkeiten oder Inhalt geschlossener Behälter.",
    "range": "6 m; ein kleines Wasservolumen",
    "duration": "sofort; gehaltene Formen bis zum Ende deines Beiträgen",
    "requirements": "Geste; vorhandenes Wasser. Die Flüssigkeit wird nur versetzt, nicht vermehrt.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Create_Water_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-reiffinger",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W02",
    "sourcePage": 14,
    "name": "Reiffinger",
    "section": "W",
    "role": "Schaden",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "1d4",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Bedeckt eine handgroße Oberfläche mit Reif oder trifft ein Wesen mit einem Kältestich für 1W4 Kälteschaden.",
    "limits": "Gegen Wesen: Zauberangriff. Kein Einfrieren, keine Verlangsamung und kein Durchfrieren einer Tür oder eines Körpers.",
    "range": "9 m; ein Ziel",
    "duration": "sofort; Reif taut gewöhnlich",
    "requirements": "Geste; keine Eisquelle erforderlich. Eine dünne Feuchtigkeitsschicht genügt für das Reifzeichen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ray_of_Frost_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-quellwasser",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W03",
    "sourcePage": 14,
    "name": "Quellwasser",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Erzeugt bis zu 20 Liter gewöhnliches Süßwasser in einem offenen Gefäß oder auf einer sichtbaren freien Fläche. Alternativ durchnässt es ein einzelnes Wesen.",
    "limits": "Unwilliges Ziel: GES-RW verhindert den Zustand Nass. Kein Druckstrahl, kein Schaden und keine Erzeugung innerhalb eines Körpers.",
    "range": "9 m; ein Gefäß, 2 m Radius oder ein Wesen",
    "duration": "sofort; Wasser bleibt; Nass höchstens 2 eigene Beiträge",
    "requirements": "Geste und Wort; ein Gefäß nur zum Auffangen. Keine vorhandene Quelle erforderlich.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Wassererschaffung ist automatisch. Nur gegen unfreiwilliges Benetzen GE-Rettung separat würfeln; Nässe verleiht hier keinen zusätzlichen Schadenswürfel.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Create_Water_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "60 Liter Wasser; Benetzen weiterhin Radius 2 m",
        "maximumTargets": 1
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "150 Liter Wasser; Benetzen weiterhin Radius 2 m",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-klarwasser",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W04",
    "sourcePage": 15,
    "name": "Klarwasser",
    "section": "W",
    "role": "Ritual",
    "level": 1,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Reinigt bis zu 50 Liter Wasser in einem mindestens fünfminütigen Ritual von gewöhnlicher Verschmutzung und alltäglichen Keimen. Keine Wirkung in Körpern, gegen magische Gifte oder auf bereits vergiftete Wesen. Einmalige Kosten beim Ritualabschluss.",
    "limits": "Kein Entgiften eines Körpers, keine Heilung und keine Aufhebung magischer Verseuchung. Abgetrennte Rückstände bleiben gefährlich.",
    "range": "Berührung; ein Gefäß oder kleines Becken",
    "duration": "Ritual mindestens 5 Minuten; danach gewöhnliches Wasser",
    "requirements": "Zwei offene Gefäße und ein gewöhnliches Tuch als Fokus; wiederverwendbar. Zugriff auf die gesamte Wassermenge.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "200 Liter; Ritual mindestens 10 Minuten",
        "maximumTargets": 1,
        "duration": "Ritual mindestens 10 Minuten; danach gewöhnliches Wasser"
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "500 Liter; Ritual mindestens 20 Minuten",
        "maximumTargets": 1,
        "duration": "Ritual mindestens 20 Minuten; danach gewöhnliches Wasser"
      }
    ]
  },
  {
    "id": "elementarismus-wasserpeitsche",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W05",
    "sourcePage": 15,
    "name": "Wasserpeitsche",
    "section": "W",
    "role": "Schaden",
    "level": 1,
    "actionIds": [
      "action",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [
      {
        "formula": "2d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein Wasserband schlägt ein Wesen für 2W6 Wuchtschaden und zieht es bei misslungener Abwehr bis zu 1,5 m zu dir.",
    "limits": "STÄ-RW halbiert Schaden und verhindert das Ziehen. Kein Ziehen durch massive Hindernisse; riesige Wesen werden nicht bewegt.",
    "range": "9 m; ein Wesen",
    "duration": "sofort",
    "requirements": "Geste und Wort; mindestens 5 Liter zugängliches Wasser. Das Wasser fällt anschließend zu Boden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Heranziehen nur bei misslungener Rettung; die Position wird gemeinsam umgesetzt.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [
          {
            "formula": "3d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "Heranziehen bis 3 m",
        "maximumTargets": 1
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "4d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "Heranziehen bis 3 m",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-eisgleit",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W06",
    "sourcePage": 15,
    "name": "Eisgleit",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Friert eine nasse Bodenfläche bis 6 × 3 m zu glattem Eis. Wer dort steht oder sie erstmals betritt, kann ausrutschen; kein unmittelbarer Schaden.",
    "limits": "GES-RW oder liegend. Höchstens eine Ausrutschprobe je Wesen und eigenem Beitrag. Schwieriges Gelände; die Fläche friert keine Füße fest.",
    "range": "18 m; eine bodengebundene Fläche",
    "duration": "3 eigene Beiträge; danach taut das magische Eis, ohne neuen Schaden",
    "requirements": "Geste und Wort; nasser Boden oder mindestens 20 Liter verteiltes Wasser. Auf trockenem Stein nicht wirkbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Sleet_Storm_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Fläche 9 × 3 m",
        "maximumTargets": 20,
        "range": "18 m; Fläche 9 × 3 m"
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Fläche 12 × 3 m",
        "maximumTargets": 20,
        "range": "18 m; Fläche 12 × 3 m"
      }
    ]
  },
  {
    "id": "elementarismus-wasseratmung",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W07",
    "sourcePage": 16,
    "name": "Wasseratmung",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Erlaubt bis zu zwei freiwilligen, berührten Wesen, unter Wasser zu atmen. Ihre gewöhnliche Luftatmung bleibt erhalten.",
    "limits": "Keine Abwehr bei Zustimmung. Kein Schutz vor Druck, Kälte, Gift oder Strömung; keine Atmung im Vakuum oder in Giftgas.",
    "range": "Berührung bei jedem Ziel",
    "duration": "1 Stunde; ohne Konzentration",
    "requirements": "Geste, Wort und ein Tropfen Wasser je Ziel; verbraucht. Ziele dürfen danach die Berührungsreichweite verlassen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Vier willige Wesen; 1 Stunde",
        "maximumTargets": 1
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Sechs willige Wesen; 1 Stunde",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-wellenritt",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W08",
    "sourcePage": 16,
    "name": "Wellenritt",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Verdichtet die Wasseroberfläche unter deinen Schritten. Bis zu deinem nächsten Beitrag kannst du mit gewöhnlicher Bewegung auf ruhigem Wasser laufen.",
    "limits": "Keine Extra-Bewegung und keine Flugfähigkeit. Sturmwellen können dich weiterhin umwerfen; beim Ende sinkst du, falls kein fester Grund erreicht ist.",
    "range": "Selbst; ausschließlich Wasseroberflächen",
    "duration": "1 eigener Beitrag; ohne Konzentration",
    "requirements": "Geste; Wasser unter deinen Füßen. Lava, Öl, Säure und lockerer Schnee sind keine gültigen Ersatzflächen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "bonus-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "2 eigene Beiträge",
        "maximumTargets": 1,
        "duration": "2 eigene Beiträge; ohne Konzentration"
      }
    ]
  },
  {
    "id": "elementarismus-brandungswehr",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W09",
    "sourcePage": 16,
    "name": "Brandungswehr",
    "section": "W",
    "role": "Schutz",
    "level": 2,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "3d6",
    "effect": "Ein Wasserschwall fängt einen bevorstehenden Treffer auf. Reduziert entweder dessen Feuer- oder Wuchtschaden um 3W6, mindestens auf 0.",
    "limits": "Vor der Schadensabrechnung erklären. Bei gemischtem Schaden nur eine gewählte Schadensart; kein Schutz gegen Stich, Blitz oder reine Geisteswirkung.",
    "range": "9 m; ein sichtbares Wesen",
    "duration": "ein auslösender Treffer",
    "requirements": "Geste; mindestens 5 Liter Wasser höchstens 3 m vom geschützten Ziel entfernt. Wasser bleibt danach am Boden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Vor einem einzelnen Feuer- oder Wuchttreffer auflösen; gewürfelten Schutz einmal abziehen, mindestens 0. Kein eigener Schaden. Die Spielleitung trägt den Restschaden ein.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Energy_Cold_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "4d6",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 4,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "5d6",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-stroemungsgriff",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W10",
    "sourcePage": 17,
    "name": "Strömungsgriff",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [],
    "protectionRoll": "",
    "effect": "Lenkt die Strömung auf einer Wasserfläche von 12 × 6 m einmalig um: Ein williges Wesen wird bis 6 m, ein unwilliges bei misslungener ST-Rettung bis 3 m versetzt. Kein Ertränken und keine zusätzliche Bewegung an Land. Jede weitere gezielte Versetzung erfordert ein erneutes Wirken mit vollständigen Kosten.",
    "limits": "Nur vorhandenes, zusammenhängendes Wasser; keine Flüssigkeiten in lebenden Körpern.",
    "range": "24 m; ein Gewässerabschnitt und ein bewegtes Wesen je Impuls",
    "duration": "sofort",
    "requirements": "Geste und Wort; zusammenhängendes Gewässer von mindestens Knietiefe. Ein Eimer ist keine Strömungsquelle.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Wasserfläche 18 × 9 m; bis zwei Ziele",
        "maximumTargets": 2,
        "range": "24 m; Wasserfläche 18 × 9 m; bis zwei Ziele"
      }
    ]
  },
  {
    "id": "elemente-eislanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W15",
    "sourcePage": null,
    "name": "Eislanze",
    "section": "W",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d8",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine schmale Eislanze zerbricht an einem Wesen und verursacht 3W8 Kälteschaden.",
    "limits": "Zauberangriff; bei Verfehlen kein Schaden. Keine Splitterexplosion. Ab 6W8 ist die separat zu erlernende Große Eislanze nötig.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ice_Knife_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction",
          "bonus-action"
        ],
        "damage": [
          {
            "formula": "4d8",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "5d8",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-flutstoss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W16",
    "sourcePage": null,
    "name": "Flutstoß",
    "section": "W",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kleine Welle wirft sich nach vorn und verursacht 4W6 Wuchtschaden.",
    "limits": "ST-Rettung halbiert. Keine zusätzliche Versetzung und kein Ertränken. Das Wasser verteilt sich anschließend gewöhnlich.",
    "range": "Selbst; 6 m langer, 3 m breiter Streifen",
    "duration": "sofort",
    "requirements": "Geste und Wort; mindestens 100 Liter frei zugängliches Wasser in höchstens 3 m Entfernung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction",
          "bonus-action"
        ],
        "damage": [
          {
            "formula": "5d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "6d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-hagelschauer",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W17",
    "sourcePage": null,
    "name": "Hagelschauer",
    "section": "W",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Kleine Eiskörner prasseln einmalig in einer eng begrenzten Fläche nieder und verursachen 4W6 Kälteschaden.",
    "limits": "Rettungswurf halbiert den Schaden. Alle Wesen in der Fläche sind betroffen, auch Verbündete. Keine zusätzlichen Kontakt- oder Folgeschäden.",
    "range": "18 m; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ice_Storm_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction",
          "bonus-action"
        ],
        "damage": [
          {
            "formula": "5d6",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "6d6",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-eispanzer",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W19",
    "sourcePage": null,
    "name": "Eispanzer",
    "section": "W",
    "role": "Schutz",
    "level": 3,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "4d6",
    "effect": "Eine kurzlebige Eisschicht fängt einen angekündigten Hieb-, Stich- oder Wuchttreffer ab. Reduziert genau diesen Schadensanteil um 4W6, mindestens auf 0.",
    "limits": "Nur ein Treffer; danach zerbricht die Schicht. Kein zusätzlicher Kälteschaden. Nicht mit einem weiteren Eispanzer auf denselben Treffer stapelbar.",
    "range": "6 m; ein sichtbares Wesen",
    "duration": "sofort",
    "requirements": "Reaktionsauslöser: Ein sichtbares Wesen erleidet gleich physischen Schaden. Mindestens 1 Liter frei zugängliches Wasser am Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der Schutzwurf wird protokolliert. Die Spielleitung zieht ihn einmal vom passenden eingehenden Schaden ab, mindestens bis 0. Keine Heilung oder temporären Trefferpunkte; keine automatische TP-Änderung durch diesen Zauber.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fire_Shield_Chill_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-eiswall",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W12",
    "sourcePage": 17,
    "name": "Eiswall",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 4,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Errichtet einen Eiswall bis 6 m lang, 3 m hoch und 0,3 m dick. Drei Segmente von je 2 m besitzen jeweils RK 13 und 20 Trefferpunkte.",
    "limits": "Kein Entstehungsschaden. Nicht in belegtem Raum platzierbar; kein geschlossener Käfig. Feuer verursacht doppelten Schaden an den Segmenten.",
    "range": "18 m; bodengebundener Wall",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; mindestens 50 Liter Wasser oder 50 kg Eis. Das zusätzliche Volumen besteht nur während der Magie.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Den Wall als Gelände mit einzelnen Segmenten führen. Segment-RK und TP sind keine Werte des gewählten Wesens. Keine automatische Errichtung oder Zerstörung von Gelände; Konzentration und Ablauf gemeinsam nachhalten.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Wall_of_Ice_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Wall 9 × 3 × 0,3 m; fünf Segmente mit je 20 TP",
        "maximumTargets": 1,
        "range": "18 m; Wall 9 × 3 × 0,3 m"
      },
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Wall 12 × 3 × 0,3 m; sechs Segmente mit je 20 TP",
        "maximumTargets": 1,
        "range": "18 m; Wall 12 × 3 × 0,3 m"
      }
    ]
  },
  {
    "id": "elemente-frostfaecher",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W18",
    "sourcePage": null,
    "name": "Frostfächer",
    "section": "W",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "5d6",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein fächerförmiger Froststoß trifft die Wesen vor dir für 5W6 Kälteschaden.",
    "limits": "KO-Rettung halbiert. Keine Eisfläche, keine Verlangsamung und kein Einfrieren von Körpern.",
    "range": "Selbst; 6-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Cone_of_Cold_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "6d6",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-wassersteg",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W20",
    "sourcePage": null,
    "name": "Wassersteg",
    "section": "W",
    "role": "Formung & Nutzen",
    "level": 4,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Verdichtet eine vorhandene ruhige Wasseroberfläche zu einem begehbaren Steg. Er trägt insgesamt höchstens 300 kg.",
    "limits": "Kein Weg durch Luft, reißende Strömung oder über Lava. Bei Ende wird die Fläche sofort wieder gewöhnliches Wasser; kein Schutz vor einem folgenden Sturz.",
    "range": "12 m; ein 6 m langer, 1 m breiter Steg",
    "duration": "bis 3 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; ruhiges Wasser unter der gesamten Strecke.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-eislanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W11",
    "sourcePage": 17,
    "name": "Große Eislanze",
    "section": "W",
    "role": "Schaden",
    "level": 6,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "6d8",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Formt einen langgezogenen Eisdorn und schleudert ihn auf ein Wesen: 6W8 Kälteschaden. Der Dorn zerbricht beim Einschlag.",
    "limits": "Zauberangriff; bei Treffer verliert das Ziel bis zum nächsten eigenen Beitrag des Zaubernden 3 m Bewegung. Keine vollständige Vereisung.",
    "range": "24 m; ein Ziel",
    "duration": "sofort; Verlangsamung 1 eigener Beitrag",
    "requirements": "Geste und Wort; mindestens 1 Liter Wasser oder ein faustgroßes Eisstück, das im Geschoss aufgeht.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ice_Knife_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "7d8",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "8d8",
            "damageType": "Kälte"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ],
    "changes": ""
  },
  {
    "id": "elementarismus-flussgebot",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W14",
    "sourcePage": 18,
    "name": "Flussgebot",
    "section": "W",
    "role": "Ritual",
    "level": 6,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Lenkt nach einem mindestens zehnminütigen Ritual einen Gewässerabschnitt von 60 × 12 m und hebt oder senkt dessen Wasserstand um höchstens 2 m. Keine Wassererschaffung, Flutwelle oder direkte Schadenswirkung. Konzentration bis 30 Minuten; einmalige Kosten beim Abschluss.",
    "limits": "Kein Sofortschaden und kein magischer Unterdruck. Schiffe können aufsetzen; Auswirkungen auf Ufer und Bauwerke werden angekündigt und von der SL beurteilt.",
    "range": "60 m; ein sichtbarer Abschnitt",
    "duration": "Ritual mindestens 10 Minuten; Konzentration bis 30 Minuten",
    "requirements": "Zugang zum Ufer, drei ungestörte Abschnitte und ein offener Abflussraum. Kein Einsatz in Körpern oder versiegelten Behältern.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 7,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Gewässerabschnitt 120 × 12 m; Wasserstand um höchstens 2 m",
        "maximumTargets": 1,
        "range": "Gewässerabschnitt 120 × 12 m"
      },
      {
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Gewässerabschnitt 180 × 18 m; Wasserstand um höchstens 2 m",
        "maximumTargets": 1,
        "range": "Gewässerabschnitt 180 × 18 m"
      }
    ]
  },
  {
    "id": "elementarismus-flutstoss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "W13",
    "sourcePage": 18,
    "name": "Großer Flutstoß",
    "section": "W",
    "role": "Schaden",
    "level": 7,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [
      {
        "formula": "8d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Hebt eine breite Welle aus einem Gewässer. Wesen in einem 12 m langen, 6 m breiten Streifen erleiden 8W6 Wuchtschaden und werden bis zu 3 m fortgespült.",
    "limits": "STÄ-RW halbiert und verhindert das Fortspülen. Massive Deckung stoppt die Welle. Niemand wird ohne weiteren Vorgang dauerhaft unter Wasser gehalten.",
    "range": "30 m bis zur Quelle; Streifen beginnt dort",
    "duration": "sofort; verschobenes Wasser fließt gewöhnlich ab",
    "requirements": "Geste und Wort; zusammenhängend mindestens 3 m³ Wasser. Quellwasser allein liefert auf niedrigem Grad keine solche Menge.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "9d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      },
      {
        "level": 9,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "10d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ],
    "changes": ""
  }
];
