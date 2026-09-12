// Authored Elemente edition 2. Published revisions remain immutable.
export const BL_SPELLS = [
  {
    "id": "elemente-kontaktfunke",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL03",
    "sourcePage": null,
    "name": "Kontaktfunke",
    "section": "BL",
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
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein kleiner elektrischer Funke springt bei Berührung über und verursacht 1W4 Blitzschaden.",
    "limits": "Bei verfehltem Zauberangriff kein Schaden. Kein zusätzlicher Folgeschaden und keine automatische Entzündung oder zusätzliche Zustandswirkung.",
    "range": "Berührung; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Shocking_Grasp_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-ladungsgriff",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL04",
    "sourcePage": null,
    "name": "Ladungsgriff",
    "section": "BL",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Lädt ein kleines Metallobjekt kurz elektrostatisch auf. Es zieht trockenen Staub und leichte Papierschnipsel aus höchstens 10 cm Entfernung an.",
    "limits": "Kein Schaden, kein Magnetismus, keine Bewegung von Waffen oder Schlössern und keine Energiequelle für Geräte.",
    "range": "Berührung; ein ungetragenes Metallobjekt bis 5 kg",
    "duration": "bis 1 Minute",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-blitzpfeil",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL05",
    "sourcePage": null,
    "name": "Blitzpfeil",
    "section": "BL",
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
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein kurzer Blitzpfeil verursacht 3W6 Blitzschaden an einem einzelnen Wesen.",
    "limits": "Bei verfehltem Zauberangriff kein Schaden. Kein zusätzlicher Folgeschaden und keine automatische Entzündung oder zusätzliche Zustandswirkung.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Lightning_Arrow_Unfaded_Icon.webp",
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
            "damageType": "Blitz"
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
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-blitzbahn",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL06",
    "sourcePage": null,
    "name": "Blitzbahn",
    "section": "BL",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kurze Entladung fährt gerade durch die Luft und verursacht 3W6 Blitzschaden.",
    "limits": "GE-Rettung halbiert. Kein freies Überspringen, keine Verstärkung durch Nässe und keine Verbreitung über Wasserflächen. Ab 8W6 ist die Große Blitzbahn nötig.",
    "range": "Selbst; 9 m lange, 1 m breite Linie",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Lightning_Bolt_Unfaded_Icon.webp",
    "maximumTargets": 20,
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
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
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
            "damageType": "Blitz"
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
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      },
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "7d6",
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elementarismus-blitzfang",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL02",
    "sourcePage": 24,
    "name": "Blitzfang",
    "section": "BL",
    "role": "Schutz",
    "level": 3,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "4d6",
    "effect": "Leitet einen Teil einer eintreffenden elektrischen Entladung in den Boden. Reduziert den Blitzschaden an einem Ziel um 4W6, mindestens auf 0.",
    "limits": "Vor der Schadensabrechnung. Kein Reflektieren, keine Heilung und keine Mana-Erzeugung; schützt nur gegen den auslösenden Treffer.",
    "range": "9 m; ein sichtbares Wesen mit Bodenkontakt",
    "duration": "sofort",
    "requirements": "Geste; leitfähiger Weg zum Boden als magische Ableitung. Bei schwebenden Zielen ohne Erdverbindung nicht wirkbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Vor einem einzelnen Blitztreffer auflösen; gewürfelten Schutz einmal abziehen, mindestens 0. Erdung erforderlich. Kein eigener Schaden; Restschaden trägt die Spielleitung ein.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Energy_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "5d6",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 5,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "6d6",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-funkenkreis",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL07",
    "sourcePage": null,
    "name": "Funkenkreis",
    "section": "BL",
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
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein kurzer Funkenkreis entlädt sich um dich herum und verursacht 4W6 Blitzschaden.",
    "limits": "GE-Rettung halbiert. Trifft auch Verbündete, aber nicht dich. Kein anhaltendes Feld und keine zweite Entladung.",
    "range": "Selbst; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chromatic_Orb_Lightning_Unfaded_Icon.webp",
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
            "damageType": "Blitz"
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
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-rueckentladung",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL08",
    "sourcePage": null,
    "name": "Rückentladung",
    "section": "BL",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Nachdem ein sichtbarer Gegner dich im Nahkampf getroffen hat, springt eine Entladung auf ihn über: 4W6 Blitzschaden.",
    "limits": "GE-Rettung halbiert. Verhindert den auslösenden Treffer nicht. Kein Verlust von Reaktionen und kein Überspringen.",
    "range": "6 m; der auslösende Nahkämpfer",
    "duration": "sofort",
    "requirements": "Reaktionsauslöser: Ein sichtbarer Gegner innerhalb von 6 m hat dich gerade im Nahkampf getroffen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Shocking_Grasp_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-blitzruf",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL09",
    "sourcePage": null,
    "name": "Blitzruf",
    "section": "BL",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d10",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Unter einer vorhandenen Gewitterwolke lenkst du einen kleinen Einschlag auf einen sichtbaren Punkt: 3W10 Blitzschaden.",
    "limits": "GE-Rettung halbiert. Ein einziger Einschlag. Keine kostenlose Folgeauslösung; ein weiterer Einschlag erfordert ein neues Wirken. Größere Einschläge gehören zum Großen Blitzruf.",
    "range": "24 m; 2 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht zum Himmel und eine vorhandene natürliche Gewitterwolke.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Call_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": []
  },
  {
    "id": "elemente-gabelblitz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL10",
    "sourcePage": null,
    "name": "Gabelblitz",
    "section": "BL",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "reaction",
      "bonus-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine geteilte Entladung verursacht an bis zu zwei verschiedenen Wesen jeweils 4W6 Blitzschaden.",
    "limits": "Jedes Ziel legt eine eigene GE-Rettung ab; Erfolg halbiert. Kosten einmal bezahlen. Kein Ziel darf beide Zweige erhalten, keine weiteren Sprünge.",
    "range": "18 m; höchstens zwei Wesen, maximal 3 m voneinander entfernt",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chain_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 2,
    "forms": [
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "5d6",
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 2
      }
    ]
  },
  {
    "id": "elemente-erdungsanker",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL11",
    "sourcePage": null,
    "name": "Erdungsanker",
    "section": "BL",
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
    "effect": "Ein leitender Schutz stellt 18 Punkte gegen Blitzschaden bereit. Er absorbiert höchstens 6 Punkte je Treffer.",
    "limits": "Wirkt nur mit Bodenkontakt. Kein Schutz gegen Donner; nicht mit einem weiteren Erdungsanker stapelbar.",
    "range": "Berührung; ein freiwilliges Wesen mit Bodenkontakt",
    "duration": "bis 3 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Die Spielleitung führt Vorrat und Bodenkontakt und zieht höchstens 6 Punkte je Blitztreffer ab. Kosten werden verbucht; keine automatische Schadensreduktion.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Energy_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-blitzlanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL12",
    "sourcePage": null,
    "name": "Blitzlanze",
    "section": "BL",
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
        "formula": "7d8",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine lang gebündelte Blitzlanze trifft ein einzelnes Wesen für 7W8 Blitzschaden.",
    "limits": "Zauberangriff; bei Verfehlen kein Schaden. Keine Linie, kein Kettensprung und keine Zusatzwirkung auf Metallrüstung.",
    "range": "30 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Lightning_Arrow_Unfaded_Icon.webp",
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
            "formula": "8d8",
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-blitzbahn",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL01",
    "sourcePage": 24,
    "name": "Große Blitzbahn",
    "section": "BL",
    "role": "Schaden",
    "level": 7,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "8d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kontrollierte Entladung durchläuft eine gerade Linie und verursacht 8W6 Blitzschaden an allen erfassten Wesen.",
    "limits": "GES-RW halbiert. Massive Deckung stoppt die Linie. Wasser macht daraus weder automatisch einen Flächenzauber noch eine unbegrenzte Kettenreaktion.",
    "range": "Selbst; 18 m lange, 1 m breite Linie",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Wirkungslinie. Die Entladung wird erzeugt; ein Gewitter ist nicht nötig.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Lightning_Bolt_Unfaded_Icon.webp",
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
            "damageType": "Blitz"
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
            "damageType": "Blitz"
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
    "id": "elemente-kettenblitz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL13",
    "sourcePage": null,
    "name": "Kettenblitz",
    "section": "BL",
    "role": "Schaden",
    "level": 7,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "6d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine Entladung springt über höchstens drei verschiedene Wesen. Jedes erleidet 6W6 Blitzschaden.",
    "limits": "Jedes Ziel legt eine eigene GE-Rettung ab; Erfolg halbiert. Jedes Wesen höchstens einmal. Alle Ziele und Sprünge müssen sichtbar sein. Keine Rücksprünge und keine weiteren Ziele durch Nässe.",
    "range": "24 m zum ersten Ziel; weitere Ziele jeweils höchstens 6 m voneinander entfernt",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chain_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 3,
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
            "formula": "7d6",
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 3
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
            "formula": "8d6",
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 3
      }
    ]
  },
  {
    "id": "elemente-gewittersturz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "BL14",
    "sourcePage": null,
    "name": "Gewittersturz",
    "section": "BL",
    "role": "Schaden",
    "level": 8,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "9d6",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine sichtbare Ladungswolke kündigt einen mächtigen Einschlag an. Nach einem Vorbereitungsbeitrag trifft er die Fläche für 9W6 Blitzschaden.",
    "limits": "GE-Rettung halbiert. Vorbereitung im ersten eigenen Beitrag, bezahlte Entladung im zweiten. Nur einmaliger Schaden; keine bestehende Gewitterwolke nötig und keine Folgeblitze.",
    "range": "36 m; 6 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 2,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Activate_Call_Lightning_Unfaded_Icon.webp",
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
            "damageType": "Blitz"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  }
];
