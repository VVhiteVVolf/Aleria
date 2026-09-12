// Authored Elemente edition 2. Published revisions remain immutable.
export const DN_SPELLS = [
  {
    "id": "elemente-knisterknall",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN03",
    "sourcePage": null,
    "name": "Knisterknall",
    "section": "DN",
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
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein kleiner gerichteter Knall trifft ein Wesen für 1W4 Donnerschaden.",
    "limits": "Bei verfehltem Zauberangriff kein Schaden. Kein zusätzlicher Folgeschaden und keine automatische Entzündung oder zusätzliche Zustandswirkung.",
    "range": "6 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chromatic_Orb_Thunder_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-donnerstoss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN01",
    "sourcePage": 23,
    "name": "Donnerstoß",
    "section": "DN",
    "role": "Schaden",
    "level": 1,
    "actionIds": [
      "action",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "2d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein konzentrierter Schallstoß erfasst einen 3-m-Kegel vor dir: 2W6 Donnerschaden und bis zu 1,5 m Rückstoß. Es entsteht kein anhaltender Luftstrom.",
    "limits": "KON-RW halbiert und verhindert Rückstoß. Trifft auch Verbündete. Das Geräusch verrät den Einsatz; keine lautlose Variante.",
    "range": "Selbst; 3-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und hörbares Wort; Luft. Ein Hindernis beendet die Versetzung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Thunderwave_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [
          {
            "formula": "3d6",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
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
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-resonanzton",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN04",
    "sourcePage": null,
    "name": "Resonanzton",
    "section": "DN",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Bringt einen Gegenstand bis 10 kg zum leisen Schwingen. Du erkennst, ob er hohl ist oder einen offenen sichtnahen Riss hat.",
    "limits": "Keine Erkundung durch Wände, kein Gedankenlesen und kein Struktur- oder Kreaturenschaden.",
    "range": "Berührung; ein ungetragenes Objekt",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-schallbolzen",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN05",
    "sourcePage": null,
    "name": "Schallbolzen",
    "section": "DN",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein gebündelter Schallbolzen trifft für 3W6 Donnerschaden.",
    "limits": "Bei verfehltem Zauberangriff kein Schaden. Kein zusätzlicher Folgeschaden und keine automatische Entzündung oder zusätzliche Zustandswirkung.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chromatic_Orb_Thunder_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "4d6",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      },
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
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-hallabwehr",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN07",
    "sourcePage": null,
    "name": "Hallabwehr",
    "section": "DN",
    "role": "Schutz",
    "level": 2,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "3d6",
    "effect": "Eine Gegenschwingung reduziert einen angekündigten Donnertreffer um 3W6, mindestens auf 0.",
    "limits": "Gilt nur für den Donneranteil eines einzelnen Treffers und ist nicht mit sich selbst stapelbar.",
    "range": "6 m; ein sichtbares Wesen",
    "duration": "sofort",
    "requirements": "Reaktionsauslöser: Ein sichtbares Wesen erleidet gleich Donnerschaden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der Schutzwurf wird protokolliert. Die Spielleitung zieht ihn einmal vom passenden eingehenden Schaden ab, mindestens bis 0. Keine Heilung oder temporären Trefferpunkte; keine automatische TP-Änderung durch diesen Zauber.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Energy_Thunder_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-donnerkuppel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN06",
    "sourcePage": null,
    "name": "Donnerkuppel",
    "section": "DN",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kleine Druckkuppel zerplatzt einmalig für 4W6 Donnerschaden.",
    "limits": "KO-Rettung halbiert. Kein Gebäudeschaden oder Ertauben als Zusatz. Ab 7W6 ist die Große Donnerkuppel nötig.",
    "range": "18 m; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Shatter_Unfaded_Icon.webp",
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
            "damageType": "Donner"
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
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-gegenknall",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN08",
    "sourcePage": null,
    "name": "Gegenknall",
    "section": "DN",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Nachdem ein sichtbarer Gegner dich im Nahkampf getroffen hat, entlädt sich ein Gegenknall zu ihm und verursacht 4W6 Donnerschaden.",
    "limits": "KO-Rettung halbiert. Verhindert den auslösenden Treffer nicht. Kein Zurückstoßen und kein Angriff auf andere Ziele.",
    "range": "6 m; der auslösende Nahkämpfer",
    "duration": "sofort",
    "requirements": "Reaktionsauslöser: Ein sichtbarer Gegner innerhalb von 6 m hat dich gerade mit einem Nahkampfangriff getroffen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-schallbrecher",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN09",
    "sourcePage": null,
    "name": "Schallbrecher",
    "section": "DN",
    "role": "Formung & Nutzen",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Dämpft gewöhnliche Geräusche in einer festen Zone. Sprache über ihre Grenze ist nur bis 3 m Entfernung verständlich.",
    "limits": "Keine vollständige Stille: Zauberworte bleiben möglich. Kein Schutz vor Donnerschaden und kein automatischer Vorteil beim Schleichen.",
    "range": "12 m; 3 m Radius",
    "duration": "bis 2 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Silence_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-resonanzlanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN10",
    "sourcePage": null,
    "name": "Resonanzlanze",
    "section": "DN",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "5d8",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine präzise Schwingungslanze trifft ein einzelnes Wesen für 5W8 Donnerschaden.",
    "limits": "Zauberangriff; kein Schaden bei Verfehlen. Keine besondere Wirkung auf Rüstung oder innere Organe.",
    "range": "24 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "6d8",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "7d8",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-halllinie",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN11",
    "sourcePage": null,
    "name": "Halllinie",
    "section": "DN",
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
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein gerader Schallstoß verursacht 5W6 Donnerschaden entlang seiner schmalen Bahn.",
    "limits": "Rettungswurf halbiert den Schaden. Alle Wesen in der Fläche sind betroffen, auch Verbündete. Keine zusätzlichen Kontakt- oder Folgeschäden.",
    "range": "Selbst; 12 m lange, 1 m breite Linie",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Thunderwave_Unfaded_Icon.webp",
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
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-druckmantel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN12",
    "sourcePage": null,
    "name": "Druckmantel",
    "section": "DN",
    "role": "Schutz",
    "level": 5,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Ein schwingender Mantel stellt 18 Schutzpunkte gegen Donnerschaden bereit. Höchstens 6 Punkte werden je Treffer absorbiert.",
    "limits": "Kein Schutz gegen Wucht, Blitz oder Stille. Nicht mit einem weiteren Druckmantel stapelbar; kein Schutzvorrat als Heilung.",
    "range": "Berührung; ein freiwilliges Wesen",
    "duration": "bis 3 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Die Spielleitung führt den Vorrat und zieht höchstens 6 Punkte pro Donnertreffer ab. Kosten werden verbucht; keine automatische Schadensreduktion.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-donnerkuppel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN02",
    "sourcePage": 23,
    "name": "Große Donnerkuppel",
    "section": "DN",
    "role": "Schaden",
    "level": 6,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "7d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein kuppelförmiges Resonanzfeld bricht mit einem Knall als Schallstoß zusammen. Verursacht 7W6 Donnerschaden in 6 m Radius und kann Betroffene kurz taub machen.",
    "limits": "KON-RW halbiert; bei Fehlschlag taub für 1 eigener Beitrag. Taubheit allein verhindert weder Gestenzauber noch alle Aktionen.",
    "range": "24 m; 6 m Radius",
    "duration": "Schaden sofort; Taubheit 1 eigener Beitrag",
    "requirements": "Geste und Wort; zusammenhängender Luftraum. Volle Deckung schützt; keine lautlose Fassung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chromatic_Orb_Thunder_Unfaded_Icon.webp",
    "maximumTargets": 20,
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
            "formula": "8d6",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
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
            "formula": "9d6",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ],
    "changes": ""
  },
  {
    "id": "elemente-donnerkranz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN13",
    "sourcePage": null,
    "name": "Donnerkranz",
    "section": "DN",
    "role": "Schaden",
    "level": 6,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "7d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein weiter Schallkranz schlägt einmalig nach außen und verursacht 7W6 Donnerschaden.",
    "limits": "KO-Rettung halbiert. Trifft alle anderen Wesen einschließlich Verbündeter, aber nicht den Zaubernden. Kein anhaltender Ring.",
    "range": "Selbst; 6 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "",
    "maximumTargets": 20,
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
            "formula": "8d6",
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-grosser-resonanzbruch",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "DN14",
    "sourcePage": null,
    "name": "Großer Resonanzbruch",
    "section": "DN",
    "role": "Schaden",
    "level": 8,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "9d6",
        "damageType": "Donner"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine sichtbare Druckwelle kündigt einen starken Resonanzbruch an. Nach einem Vorbereitungsbeitrag verursacht die Entladung 9W6 Donnerschaden.",
    "limits": "KO-Rettung halbiert. Erster eigener Beitrag: Vorbereitung ohne Schaden. Zweiter eigener Beitrag: Entladung mit vollständigen Kosten. Wesen können die Fläche vorher verlassen; kein zusätzlicher Gebäudeeinsturz.",
    "range": "36 m; 6 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 2,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Shatter_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
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
            "damageType": "Donner"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  }
];
