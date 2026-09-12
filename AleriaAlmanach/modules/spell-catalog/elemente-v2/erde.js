// Authored Elemente edition 2. Published revisions remain immutable.
export const E_SPELLS = [
  {
    "id": "elementarismus-erdtasten",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E01",
    "sourcePage": 25,
    "name": "Erdtasten",
    "section": "E",
    "role": "Formung & Nutzen",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Du spürst, ob sich im Umkreis schwere Schritte oder rollende Lasten über denselben zusammenhängenden Boden bewegen.",
    "limits": "Zeigt grobe Richtung, nicht Identität, Gedanken oder exakte Anzahl. Keine Wahrnehmung fliegender oder regloser Wesen und kein allgemeiner Blick durch Wände.",
    "range": "Berührung des Bodens; 6 m Radius",
    "duration": "ein kurzer Eindruck",
    "requirements": "Ruhige Geste und unmittelbarer Bodenkontakt. Starke Erschütterung oder getrennte Böden stören den Eindruck.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-kieselstoss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E02",
    "sourcePage": 25,
    "name": "Kieselstoß",
    "section": "E",
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
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Beschleunigt einen kleinen Kiesel auf ein sichtbares Wesen: 1W4 Wuchtschaden. Der Stein bleibt nach dem Flug gewöhnlich.",
    "limits": "Zauberangriff; kein Schaden bei Verfehlen. Nicht mit einem normalen Waffenangriff als kostenloser Zusatztreffer kombinierbar.",
    "range": "12 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste; ein loser Kiesel in Griffweite. Er wird verschossen, aber nicht erschaffen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-erdgriff",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E03",
    "sourcePage": 25,
    "name": "Erdgriff",
    "section": "E",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [],
    "protectionRoll": "",
    "effect": "Lockere Erde umklammert die Füße eines bodenstehenden Wesens. Bei misslungener Abwehr ist seine Bewegung bis zum Zauberende 0.",
    "limits": "STÄ-RW verhindert die Fessel. Mit eine Aktion ist eine erneute STÄ-Probe zum Befreien möglich; Verbündete können dieselbe Hilfe leisten. Angriffe und Zauber bleiben möglich.",
    "range": "9 m; ein Wesen bis Größe Groß",
    "duration": "1 eigener Beitrag; ohne Konzentration",
    "requirements": "Geste und Wort; mindestens 20 cm lockere Erde oder Lehm unter dem Ziel. Kein Metallboden und kein Zugriff auf einen fliegenden Gegner.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen.",
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
        "changes": "Zwei Ziele",
        "maximumTargets": 2,
        "range": "9 m; zwei Wesen bis Größe Groß"
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Drei Ziele",
        "maximumTargets": 3,
        "range": "9 m; drei Wesen bis Größe Groß"
      }
    ]
  },
  {
    "id": "elementarismus-lehmform",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E04",
    "sourcePage": 26,
    "name": "Lehmform",
    "section": "E",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Formt bis zu 0,25 m³ lockere Erde, Sand oder Lehm zu einer Mulde, Stufe, Rinne oder groben Abdeckung. Das Volumen wird nur umverteilt.",
    "limits": "Kein Schaden; kein Einschließen eines Wesens und keine präzisen beweglichen Mechanismen. Lockere Formen können ohne Stütze zusammenfallen.",
    "range": "6 m; zusammenhängendes Material",
    "duration": "sofort; physische Form bleibt nach ihrer gewöhnlichen Stabilität",
    "requirements": "Geste und Wort; vorhandenes loses Material. Kein Erz, Metall, Edelstein oder gewachsener Fels.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "1 m³ lockere Erde",
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
        "changes": "2 m³ lockere Erde",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-erdschirm",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E05",
    "sourcePage": 26,
    "name": "Erdschirm",
    "section": "E",
    "role": "Schutz",
    "level": 1,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "2d6+3",
    "effect": "Eine Erdplatte wirft sich vor ein Ziel. Reduziert einen eintreffenden Hieb-, Stich- oder Wuchttreffer um 2W6 + 3, mindestens auf 0.",
    "limits": "Vor der Schadensabrechnung. Kein Schutz gegen Flächenexplosionen, Gift, Hitze oder mentale Effekte. Platte zerfällt nach dem Treffer.",
    "range": "6 m; ein Wesen in Bodennähe",
    "duration": "ein auslösender Treffer",
    "requirements": "Geste; Erde oder loses Gestein unmittelbar beim Ziel. Auf einem freien Schiffsmast nicht verfügbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Vor einem einzelnen Hieb-, Stich- oder Wuchttreffer auflösen. Schutzwurf einmal abziehen, mindestens 0; die Spielleitung trägt den verbleibenden Schaden ein. Kein eigener Schaden.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Stoneskin_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "3d6+3",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 3,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "4d6+3",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-bodenwelle",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E06",
    "sourcePage": 26,
    "name": "Bodenwelle",
    "section": "E",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kurze Erdwelle läuft durch einen 6-m-Kegel: 3W6 Wuchtschaden an bodenstehenden Wesen, die bei misslungener Abwehr zu Boden gehen.",
    "limits": "GES-RW halbiert und verhindert das Hinfallen. Fliegende Wesen bleiben unberührt; keine automatische Gebäudeeinsturzregel.",
    "range": "Selbst; 6-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und Wort; zusammenhängender Boden aus Erde oder Stein. Kein frei schwebender Steg.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "",
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
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "Kegel 9 m",
        "maximumTargets": 20,
        "range": "Selbst; Kegel 9 m"
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
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "Kegel 9 m",
        "maximumTargets": 20,
        "range": "Selbst; Kegel 9 m"
      }
    ]
  },
  {
    "id": "elementarismus-schotterpfad",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E07",
    "sourcePage": 27,
    "name": "Schotterpfad",
    "section": "E",
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
    "effect": "Schichtet vorhandenes Geröll auf einem 9 × 3 m breiten Pfad um. Wähle entweder schwieriges Gelände oder einen begehbaren, von losem Schutt geräumten Weg.",
    "limits": "Kein Schaden und kein automatisches Hinfallen. Eine belegte Fläche darf unwegsam werden, aber keine Person unter Material begraben.",
    "range": "18 m; ein bodengebundener Streifen",
    "duration": "sofort; Material bleibt gewöhnlich liegen",
    "requirements": "Geste und Wort; ausreichend loser Schotter. Der Zauber erzeugt keine Steine und zerbricht kein festes Mauerwerk.",
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
        "changes": "Streifen 15 × 3 m",
        "maximumTargets": 1,
        "range": "18 m; Streifen 15 × 3 m"
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Streifen 18 × 6 m",
        "maximumTargets": 1,
        "range": "18 m; Streifen 18 × 6 m"
      }
    ]
  },
  {
    "id": "elementarismus-steinfaust",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E08",
    "sourcePage": 27,
    "name": "Steinfaust",
    "section": "E",
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
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein faustgroßer Stein wächst für einen Schlag zur verdichteten Steinfaust und trifft ein Wesen für 3W6 Wuchtschaden. Danach bleibt nur das Ausgangsmaterial.",
    "limits": "Zauberangriff. Kein Quetschkäfig, kein Festhalten und kein automatischer zweiter Treffer durch den Rückflug.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; ein faustgroßer loser Stein. Freie Wirkungslinie erforderlich.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
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
            "damageType": "Wucht"
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
            "damageType": "Wucht"
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
            "formula": "6d6",
            "damageType": "Wucht"
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
    "id": "elemente-splitterfaecher",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E16",
    "sourcePage": null,
    "name": "Splitterfächer",
    "section": "E",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "3d6",
        "damageType": "Stich"
      }
    ],
    "protectionRoll": "",
    "effect": "Schleudert lose Steinsplitter in einem engen Fächer für 3W6 Stichschaden.",
    "limits": "Rettungswurf halbiert den Schaden. Alle Wesen in der Fläche sind betroffen, auch Verbündete. Keine zusätzlichen Kontakt- oder Folgeschäden.",
    "range": "Selbst; 4,5-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und Wort; eine Handvoll vorhandener Kies oder Steinsplitter.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "",
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
            "damageType": "Stich"
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
            "damageType": "Stich"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-kieselhaut",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E18",
    "sourcePage": null,
    "name": "Kieselhaut",
    "section": "E",
    "role": "Schutz",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Lose Kiesel bilden einen Schutzvorrat von 9 Punkten. Gegen Hieb, Stich und Wucht absorbieren sie höchstens 3 Punkte je Treffer, bis der Vorrat aufgebraucht ist.",
    "limits": "Mit Steinhaut oder weiterer Kieselhaut ersetzt der höhere verbleibende Vorrat den kleineren. Kein Addieren, keine Heilung und keine temporären Trefferpunkte.",
    "range": "Berührung; ein freiwilliges Wesen",
    "duration": "bis 2 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; eine Handvoll Kies.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die Spielleitung führt den Schutzvorrat, zieht höchstens 3 Punkte je passendem Treffer ab und beendet ihn bei Verbrauch oder Konzentrationsende.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Stoneskin_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-steinhaut",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E09",
    "sourcePage": 27,
    "name": "Steinhaut",
    "section": "E",
    "role": "Schutz",
    "level": 3,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Eine mineralische Haut bildet einen Vorrat von 18 Schutzpunkten. Gegen Hieb-, Stich- und Wuchtschaden absorbiert sie höchstens 6 Punkte je Treffer, bis der Vorrat verbraucht ist.",
    "limits": "Kein RW bei freiwilligem Ziel. Keine Heilung, keine RK-Steigerung und keine Addition mehrerer Steinhäute; es gilt nur die stärkere.",
    "range": "Berührung; ein freiwilliges Wesen",
    "duration": "3 eigene Beiträge oder bis zum Verbrauch; ohne Konzentration",
    "requirements": "Geste, Wort und eine Prise Steinmehl, die verbraucht wird. Keine Wirkung gegen elementaren oder geistigen Schaden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der Schutzvorrat ist kein temporärer TP-Pool: höchstens 6 Schutz gegen Hieb, Stich oder Wucht je Treffer; Vorrat und Restdauer gemeinsam nachführen. Elementarschaden bleibt unverändert.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Stoneskin_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Schutzvorrat 24; höchstens 6 pro Treffer",
        "maximumTargets": 1
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Schutzvorrat 30; höchstens 6 pro Treffer",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-stein-formen",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E10",
    "sourcePage": 28,
    "name": "Stein formen",
    "section": "E",
    "role": "Formung & Nutzen",
    "level": 3,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Formt bis zu 1 m³ vorhandenen nichtmagischen Stein zu einer groben Öffnung, Treppe, Schale oder Stütze. Feinmechanik und sichere Statik entstehen nicht automatisch.",
    "limits": "Kein unmittelbarer Schaden und keine Formung durch lebende Körper. Ein besetzter Durchgang kann nicht als Soforttötung zugedrückt werden.",
    "range": "Berührung; zusammenhängender Stein",
    "duration": "sofort; Form bleibt physisch bestehen",
    "requirements": "Geste, Wort und direkte Berührung. Edelsteine, Metall und magisch geschütztes Mauerwerk sind ausgeschlossen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "2 m³ Stein",
        "maximumTargets": 1
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "4 m³ Stein",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-felslanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E15",
    "sourcePage": null,
    "name": "Felslanze",
    "section": "E",
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
        "formula": "4d6",
        "damageType": "Stich"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein schmaler Steinsplitter schießt aus dem Boden und verursacht 4W6 Stichschaden.",
    "limits": "Zauberangriff; kein Schaden bei Verfehlen. Keine Fixierung und kein Strukturbruch. Größere Geschosse benötigen die Große Felslanze.",
    "range": "18 m; ein bodennahes Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; frei liegender nichtmagischer Stein unter oder neben dem Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
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
            "formula": "5d6",
            "damageType": "Stich"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-steintritt",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E19",
    "sourcePage": null,
    "name": "Steintritt",
    "section": "E",
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
    "effect": "Formt vorhandenen Stein zu einer bis 1 m hohen, groben Stufe oder Rampe; höchstens 0,5 m³ werden umverteilt.",
    "limits": "Kein Anheben von Wesen, kein Katapult und kein Eingriff in tragende Bauwerke. Statik und Traglast entscheidet die Spielleitung.",
    "range": "9 m; eine 3 m lange, 1 m breite Stufe",
    "duration": "sofort; gewöhnlicher Stein bleibt bestehen",
    "requirements": "Geste und Wort; frei zugänglicher, nichtmagischer Stein mit festem Untergrund.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-steinwall",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E12",
    "sourcePage": 28,
    "name": "Steinwall",
    "section": "E",
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
    "effect": "Hebt einen Wall bis 6 m lang, 3 m hoch und 0,3 m dick. Drei Segmente von je 2 m besitzen jeweils RK 15 und 30 Trefferpunkte.",
    "limits": "Kein Entstehungsschaden; nur in freiem Raum und ohne geschlossenen Käfig. Zerstörte Segmente öffnen einen Durchgang.",
    "range": "18 m; Verankerung in Erde oder Fels",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; mindestens 1 m³ zugänglicher Boden oder Stein. Zusätzliche magische Masse verschwindet beim Ende.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Den Wall als Gelände mit einzelnen Segmenten führen. Segment-RK und TP sind keine Werte des gewählten Wesens. Keine automatische Errichtung oder Zerstörung von Gelände; Konzentration und Ablauf gemeinsam nachhalten.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Wall_of_Stone_Unfaded_Icon.webp",
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
        "changes": "Wall 9 × 3 × 0,3 m; fünf Segmente mit je 30 TP",
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
        "changes": "Wall 12 × 3 × 0,3 m; sechs Segmente mit je 30 TP",
        "maximumTargets": 1,
        "range": "18 m; Wall 12 × 3 × 0,3 m"
      }
    ]
  },
  {
    "id": "elemente-geroellsturz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E17",
    "sourcePage": null,
    "name": "Geröllsturz",
    "section": "E",
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
        "formula": "5d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Lose Steine werden kurz angehoben und fallen in einer kleinen Fläche für 5W6 Wuchtschaden zurück.",
    "limits": "GE-Rettung halbiert. Kein Erzeugen von Stein, kein Verschütten und kein anhaltend schwieriges Gelände als Zusatzwirkung.",
    "range": "18 m; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; mindestens 0,5 m³ loses Geröll in der Fläche.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "",
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
            "damageType": "Wucht"
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
    "id": "elemente-felsriegel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E20",
    "sourcePage": null,
    "name": "Felsriegel",
    "section": "E",
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
    "effect": "Zieht eine 10 cm dicke Steinplatte vor eine freie Öffnung. Sie besitzt RK 14 und 18 Struktur-TP.",
    "limits": "Entsteht nur in freiem Raum, nicht in Wesen oder getragenen Objekten. Kein zusätzlicher Einschließungs- oder Quetschschaden. Strukturwerte werden mit der Spielleitung geführt.",
    "range": "12 m; eine freie Öffnung bis 2 × 2 m",
    "duration": "bis 3 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; mindestens 0,4 m³ vorhandener Stein unmittelbar an der Öffnung.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Wall_of_Stone_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-felslanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E11",
    "sourcePage": 28,
    "name": "Große Felslanze",
    "section": "E",
    "role": "Schaden",
    "level": 5,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "7d6",
        "damageType": "Stich"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein steinerner Dorn bricht aus freiem Boden hervor und trifft ein Wesen für 7W6 Stichschaden. Alternativ beschädigt er ein ungetragenes Hindernis.",
    "limits": "GES-RW halbiert; kein zusätzliches Aufspießen oder Festsetzen. Gegen Objekte derselbe Grundschaden, sofern das Material überhaupt durchdringbar ist.",
    "range": "24 m; ein bodennahes Ziel",
    "duration": "sofort; Dorn zerbricht zu ungefährlichem Geröll",
    "requirements": "Geste und Wort; Stein oder dichter Boden unter dem Angriffspunkt. Keine Wirkung aus dem Inneren eines Wesens.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "8d6",
            "damageType": "Stich"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      },
      {
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "9d6",
            "damageType": "Stich"
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
    "id": "elementarismus-erde-bewegen",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E13",
    "sourcePage": 29,
    "name": "Erde bewegen",
    "section": "E",
    "role": "Ritual",
    "level": 5,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Bewegt in einem mindestens einstündigen Ritual lockeren Boden auf einer Fläche von 30 × 30 m um höchstens 1 m in der Höhe. Kein Angriff, kein plötzliches Verschütten und keine Bewegung massiven Felses. Einmalige Kosten beim Ritualabschluss.",
    "limits": "Kein Kampfzauber, keine plötzliche Verschüttung. Fels, Mauerwerk und tiefe Fundamente werden nicht einfach zu Erde.",
    "range": "60 m; zusammenhängendes Gelände",
    "duration": "Ritual mindestens 1 Stunde; dauerhafte Geländeänderung",
    "requirements": "Vier ungestörte Abschnitte, Bodenkontakt und eigenem Beitraglatz für den Aushub. Statik von Dämmen und Böschungen muss gesondert geprüft werden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "50 × 50 m; Höhenänderung bis 1 m",
        "maximumTargets": 1,
        "range": "Ritualfläche 50 × 50 m"
      },
      {
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "70 × 70 m; Höhenänderung bis 1 m",
        "maximumTargets": 1,
        "range": "Ritualfläche 70 × 70 m"
      }
    ]
  },
  {
    "id": "elementarismus-erdbeben",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "E14",
    "sourcePage": 29,
    "name": "Erdbeben",
    "section": "E",
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
        "formula": "7d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein angekündigtes Beben wird einen eigenen Beitrag vorbereitet und im folgenden Beitrag ausgelöst. Wesen am Boden erleiden 7W6 Wuchtschaden; GE-Rettung halbiert und verhindert den Sturz. Gewöhnliche Strukturen erleiden gesondert 12W6 Strukturschaden, niemals zusätzlichen Kreaturenschaden. Aktion, Besondere Aktion, Reaktion und Mana werden beim Abschluss verbraucht.",
    "limits": "GES-RW halbiert Wesen-Schaden und verhindert Hinfallen. Einstürze sind abhängig von Gebäudewerten; kein pauschaler Tod durch Risse oder Verschüttung.",
    "range": "60 m; 18 m Radius",
    "duration": "1 Beitrag Vorbereitung; Abschluss im folgenden eigenen Beitrag",
    "requirements": "Geste, Wort und Bodenkontakt. Konzentration während der Vorbereitung. Die SL kündigt gefährdete Bauten und Fluchtmöglichkeiten an.",
    "concentration": false,
    "channelComments": 2,
    "manualResolution": "Automatischer Wurf betrifft nur Kreaturen. Strukturschaden und Gelände gesondert mit der Spielleitung auflösen.",
    "iconPath": "",
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
            "formula": "9d6",
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
