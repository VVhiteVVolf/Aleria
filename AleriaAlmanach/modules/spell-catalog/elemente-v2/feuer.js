// Authored Elemente edition 2. Published revisions remain immutable.
export const F_SPELLS = [
  {
    "id": "elementarismus-glutfunke",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F01",
    "sourcePage": 9,
    "name": "Glutfunke",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein Funke entzündet frei liegenden Zunder oder trifft ein Wesen für 1W4 Feuerschaden. Wähle genau eine Verwendung.",
    "limits": "Gegen Wesen: Zauberangriff. Keine Entzündung getragener Kleidung und kein zusätzlicher Brandschaden.",
    "range": "9 m; ein Ziel",
    "duration": "sofort; entzündeter Zunder brennt anschließend gewöhnlich",
    "requirements": "Geste; zum Entzünden trockenes, ungetragenes Brennmaterial. Der Funke selbst braucht keine Feuerquelle.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Im Kampf wird nur der Angriff gewürfelt. Die alternative Zündung betrifft ungetragenen Zunder, kein Wesen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Produce_Flame_Hurl_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-herdhauch",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F02",
    "sourcePage": 9,
    "name": "Herdhauch",
    "section": "F",
    "role": "Formung & Nutzen",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Erwärmt bis zu 5 Liter Wasser oder ein handliches, ungetragenes Objekt auf angenehme Wärme; trocknet alternativ ein Kleidungsstück.",
    "limits": "Kein Schaden, kein Kochen, kein Schmelzen und kein Schutz vor einem Feuerangriff.",
    "range": "Berührung",
    "duration": "sofortige Erwärmung; danach gewöhnliche Abkühlung",
    "requirements": "Geste; berührbarer Gegenstand oder Behälter. Kein Verbrauchsmaterial.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-flammenlenkung",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F03",
    "sourcePage": 9,
    "name": "Flammenlenkung",
    "section": "F",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Verkleinert, teilt oder verschiebt ein bestehendes gewöhnliches Feuer von höchstens 1 m³ um bis zu 3 m. Ohne neuen Brennstoff erlischt der abgetrennte Teil.",
    "limits": "Kein direkter Angriff auf Wesen. Ein bereits gewirkter Feuerball lässt sich damit weder umlenken noch kostenlos kopieren.",
    "range": "12 m; ein zusammenhängender Brandherd",
    "duration": "sofort; Ergebnis folgt danach gewöhnlicher Verbrennung",
    "requirements": "Geste und Wort; vorhandenes Feuer. Eine neue Brandstelle benötigt dort Brennstoff.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Produce_Flame_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "3 m³ Feuer",
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
        "changes": "6 m³ Feuer",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-funkenlanze",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F04",
    "sourcePage": 10,
    "name": "Funkenlanze",
    "section": "F",
    "role": "Schaden",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "2d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Bündelt Hitze zu einem schmalen Geschoss; ein Treffer verursacht 2W6 Feuerschaden. Alternativ entzündet es einen ungetragenen brennbaren Gegenstand.",
    "limits": "Zauberangriff; bei Verfehlen kein Schaden. Keine Explosion und keine zweite Zielperson.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; keine vorhandene Flamme erforderlich.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fire_Bolt_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
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
            "damageType": "Feuer"
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
    "id": "elementarismus-aschenbiss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F05",
    "sourcePage": 10,
    "name": "Aschenbiss",
    "section": "F",
    "role": "Schaden",
    "level": 1,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "2d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Nachdem dich ein sichtbarer Gegner im Nahkampf getroffen hat, schlägt ein Glutsaum zu ihm zurück: 2W6 Feuerschaden.",
    "limits": "GES-RW halbiert. Der ursprüngliche Treffer bleibt bestehen. Nur gegen den auslösenden Angreifer, nicht gegen beliebige Zuschauer.",
    "range": "3 m; auslösender Angreifer",
    "duration": "sofort",
    "requirements": "Freie Geste; du musst den Treffer bewusst wahrnehmen und noch eine Reaktion besitzen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Reaktion nach einem tatsächlich erlittenen Nahkampftreffer; zuerst den ursprünglichen Treffer abschließen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fire_Shield_Warm_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "reaction"
        ],
        "damage": [
          {
            "formula": "3d6",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-glutsiegel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F06",
    "sourcePage": 10,
    "name": "Glutsiegel",
    "section": "F",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Legt ein sichtbares, einmaliges Glutsiegel auf einer Fläche an. Das erste Wesen, das den Bereich berührt, löst 3W6 Feuerschaden im Radius von 2 m aus; GE-Rettung halbiert. Höchstens ein eigenes Siegel gleichzeitig. Beim Legen entsteht noch kein Schaden; Auslöser und spätere Schadensverteilung werden mit der Spielleitung aufgelöst.",
    "limits": "GES-RW halbiert. Keine Freund-Feind-Erkennung. Eine erkennbare Falle darf umgangen oder mit geeigneter Magie entschärft werden.",
    "range": "Berührung; Auslösung innerhalb 2 m",
    "duration": "höchstens 10 Minuten; genau eine Auslösung",
    "requirements": "Geste, Wort und eine Prise Asche, die verbraucht wird. Höchstens ein eigenes Glutsiegel gleichzeitig.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Beim Legen nur Kosten und Siegel protokollieren. Den späteren Auslöser, Rettungen und Schaden gesondert auflösen; keine erneuten Zauberkosten.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Glyph_of_Warding_Fire_Unfaded_Icon.webp",
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
        "changes": "4W6 Feuer; Radius 3 m",
        "maximumTargets": 1,
        "range": "Berührung beim Legen; Auslöser im Radius von 3 m"
      }
    ]
  },
  {
    "id": "elementarismus-feuerdaempfung",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F07",
    "sourcePage": 11,
    "name": "Feuerdämpfung",
    "section": "F",
    "role": "Schutz",
    "level": 2,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "3d6",
    "effect": "Entzieht einem unmittelbar eintreffenden Feuertreffer einen Teil seiner Hitze; reduziert den Feuerschaden an einem Ziel um 3W6, mindestens auf 0.",
    "limits": "Kein RW; muss vor der Schadensabrechnung erklärt werden. Löscht nicht den gesamten Flächenzauber und schützt keine weiteren Ziele.",
    "range": "9 m; du oder ein sichtbares Wesen",
    "duration": "ein auslösender Feuertreffer",
    "requirements": "Freie Geste; wahrnehmbarer Feuerangriff. Kein Material. Keine Mana-Rückgewinnung aus der abgefangenen Hitze.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der Schutzwurf zieht selbst keine Trefferpunkte ab. Vor dem eingehenden Feuer-Schaden würfeln und den Betrag einmal davon abziehen, mindestens 0; Spielleitung trägt den verbleibenden Schaden ein.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Protection_from_Energy_Fire_Unfaded_Icon.webp",
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
    "id": "elementarismus-schmiedeglut",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F08",
    "sourcePage": 11,
    "name": "Schmiedeglut",
    "section": "F",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "3d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Erhitzt bis zu 10 kg sichtbares Metall und verursacht beim Träger einmalig 3W6 Feuerschaden; KO-Rettung halbiert. Bei misslungener Rettung hat sein nächster Angriff mit diesem Gegenstand innerhalb eines eigenen Beitrags Nachteil. Weitere Hitzestöße erfordern ein erneutes Wirken mit den vollständigen Kosten.",
    "limits": "Keine automatische Entwaffnung. Der Angriffsnachteil endet nach dem nächsten eigenen Beitrag des Betroffenen.",
    "range": "12 m; ein Gegenstand",
    "duration": "sofort; Angriffsnachteil bis zum nächsten eigenen Beitrag des Betroffenen",
    "requirements": "Geste und Wort; geeignetes Metall. Keine Erzeugung von Erz und keine automatische Zerstörung verzauberter Ausrüstung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Heat_Metal_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-feuerball",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F15",
    "sourcePage": null,
    "name": "Feuerball",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kleine Feuerkugel platzt an einem sichtbaren Punkt und verursacht 3W6 Feuerschaden. Der begrenzte Flammenstoß bleibt in seinem Radius.",
    "limits": "GE-Rettung halbiert. Keine bleibende Brandfläche. Die Größe bleibt auch bei Verstärkung gleich. Ab 8W6 ist der separat zu erlernende Große Feuerball nötig.",
    "range": "18 m; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chromatic_Orb_Fire_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
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
            "damageType": "Feuer"
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
            "damageType": "Feuer"
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
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-waermemantel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F19",
    "sourcePage": null,
    "name": "Wärmemantel",
    "section": "F",
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
    "effect": "Hält die Körperumgebung angenehm warm und trocknet oberflächliche Nässe. Das Ziel verträgt gewöhnliche winterliche Kälte bis −10 °C.",
    "limits": "Keine Resistenz gegen Kälteschaden, kein Auftauen eingefrorener Wesen und kein Schutz gegen Eiszauber.",
    "range": "Berührung; ein freiwilliges Wesen",
    "duration": "bis 10 Minuten; Konzentration",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-aschenacker",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F11",
    "sourcePage": 12,
    "name": "Aschenacker",
    "section": "F",
    "role": "Ritual",
    "level": 3,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Verbrennt in einem mindestens 15-minütigen Ritual abgestorbenes Pflanzenmaterial auf höchstens 100 m² kontrolliert zu Asche. Kein Kampfzauber, keine Verbrennung lebender Wesen und keine sofortige Bodenheilung. Die Kosten werden einmal beim Abschluss des Rituals entrichtet.",
    "limits": "Kein Kampfzauber. Keine Heilung lebender Pflanzen, keine Erzeugung von Nährstoffen und keine Garantie guter Ernte.",
    "range": "Berührung des Bodens; zusammenhängende Fläche",
    "duration": "Ritual mindestens 15 Minuten; danach gewöhnliche Asche",
    "requirements": "Drei ungestörte Abschnitte; vorhandene trockene Biomasse, abgegrenzte Brandsäume und ein Funkenherd. Material wird verbrannt.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
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
        "changes": "300 m²; Ritual mindestens 30 Minuten",
        "maximumTargets": 1,
        "range": "Berührung des Ritualortes; 300 m²",
        "duration": "Ritual mindestens 30 Minuten; danach gewöhnliche Asche"
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "600 m²; Ritual mindestens 1 Stunde",
        "maximumTargets": 1,
        "range": "Berührung des Ritualortes; 600 m²",
        "duration": "Ritual mindestens 1 Stunde; danach gewöhnliche Asche"
      }
    ]
  },
  {
    "id": "elemente-brandgasse",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F16",
    "sourcePage": null,
    "name": "Brandgasse",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein schmaler Feuerstoß streicht gerade über den Boden und verursacht 4W6 Feuerschaden.",
    "limits": "Rettungswurf halbiert den Schaden. Alle Wesen in der Fläche sind betroffen, auch Verbündete. Keine zusätzlichen Kontakt- oder Folgeschäden.",
    "range": "Selbst; 9 m lange, 1 m breite Linie",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie gerade Wirkungslinie entlang des Bodens.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Burning_Hands_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-glutpfeil",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F17",
    "sourcePage": null,
    "name": "Glutpfeil",
    "section": "F",
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
        "formula": "4d8",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein langsam gebündelter Glutpfeil trifft ein einzelnes Wesen für 4W8 Feuerschaden.",
    "limits": "Bei verfehltem Zauberangriff kein Schaden. Kein zusätzlicher Folgeschaden und keine automatische Entzündung oder zusätzliche Zustandswirkung.",
    "range": "24 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Scorching_Ray_Unfaded_Icon.webp",
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
            "formula": "5d8",
            "damageType": "Feuer"
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
            "formula": "6d8",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elemente-flammenkrone",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F18",
    "sourcePage": null,
    "name": "Flammenkrone",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine kurze Flammenkrone schlägt von dir nach außen. Alle anderen Wesen im Radius erleiden 5W6 Feuerschaden.",
    "limits": "GE-Rettung halbiert. Betrifft auch Verbündete, aber nicht den Zaubernden. Ein einmaliger Impuls; kein Schutz und keine Folgeauslösung.",
    "range": "Selbst; 3 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fire_Shield_Warm_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elemente-glutbruecke",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F20",
    "sourcePage": null,
    "name": "Glutbrücke",
    "section": "F",
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
    "effect": "Drängt gewöhnliche Bodenflammen seitlich auseinander und hält einen schmalen Durchgang durch einen Brand frei.",
    "limits": "Keine Wirkung auf magische Feuerflächen, Lava, Rauch oder einstürzende Bauteile. Verursacht keinen Schaden und bewegt keine Wesen.",
    "range": "12 m; bis 6 m langer, 1 m breiter Streifen",
    "duration": "bis 2 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; gewöhnlicher bodengebundener Brand, dessen Flammen höchstens 2 m hoch stehen.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-brandgasse",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F10",
    "sourcePage": 12,
    "name": "Große Brandgasse",
    "section": "F",
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
        "formula": "6d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein bodennaher Feuerstrom zieht durch eine gerade Gasse und verursacht 6W6 Feuerschaden. Er eignet sich zum Freihalten eines Durchgangs, nicht zum Kurvenschießen.",
    "limits": "GE-Rettung halbiert. Trifft alle Wesen im Streifen; massive Hindernisse stoppen die einmalige Entladung.",
    "range": "18 m lange, 3 m breite Linie ab dir",
    "duration": "sofort; natürliche Brände bleiben möglich",
    "requirements": "Geste und Wort; durchgehende freie Linie. Unter Wasser nicht wirkbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Burning_Hands_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "7d6",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
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
            "formula": "8d6",
            "damageType": "Feuer"
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
    "id": "elementarismus-flammenwall",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F12",
    "sourcePage": 12,
    "name": "Flammenwall",
    "section": "F",
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
        "formula": "4d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Errichtet einen 12 m langen und 3 m hohen Flammenwall. Beim Erscheinen und später bei Kontakt entstehen 4W6 Feuerschaden; GE-Rettung halbiert. Ein Wesen erleidet dadurch höchstens einmal zwischen zwei eigenen Beiträgen des Zaubernden Schaden. Der Wall blockiert keine Körper. Die Erstwirkung wird gewürfelt; spätere Kontakte werden mit der Spielleitung aufgelöst.",
    "limits": "GES-RW halbiert. Keine feste Mauer: Hindurchgehen ist möglich. Feuer trifft beide Seiten und unterscheidet keine Verbündeten.",
    "range": "24 m; zusammenhängender Verlauf ohne geschlossenen Käfig",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; feste Verankerung am Boden. Einmal festgelegter Verlauf bleibt stehen.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Der erste Schadenswurf wird berechnet. Gebiet und Ziele festlegen; weitere Kontakte höchstens einmal je Wesen zwischen zwei eigenen Beiträgen des Zaubernden gesondert auflösen. Konzentration und maximale Dauer nachhalten; keine zusätzlichen Mana-Erhaltungskosten.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Wall_of_Fire_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "5d6",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 20
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
            "formula": "6d6",
            "damageType": "Feuer"
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
    "id": "elementarismus-feuerball",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F09",
    "sourcePage": 11,
    "name": "Großer Feuerball",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein gebündelter Feuerkern detoniert am gewählten sichtbaren Punkt. Alle Wesen im Radius erleiden 8W6 Feuerschaden; frei liegendes Brennbares kann sich entzünden.",
    "limits": "GES-RW halbiert. Volle Deckung blockiert die Wirkung. Verbündete sind nicht automatisch ausgenommen; kein garantierter Folgeschaden.",
    "range": "24 m; 4 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Wirkungslinie. Kein Brennstoff nötig, der Feuerkern wird mit Mana erzeugt.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fireball_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
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
            "damageType": "Feuer"
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
    "id": "elementarismus-flammenkrone",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F13",
    "sourcePage": 13,
    "name": "Große Flammenkrone",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Eine Feuerkrone entlädt sich einmalig um den Zaubernden. Alle anderen Wesen im Radius von 6 m erleiden 8W6 Feuerschaden; GE-Rettung halbiert. Eine weitere Entladung ist ein erneutes Wirken mit vollständigen Kosten, kein kostenloser Folgepuls.",
    "limits": "Die Explosion schützt weder Verbündete noch Ausrüstung im Wirkungsbereich.",
    "range": "Selbst; 6 m Radius",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Luft. Weiterer Schaden entsteht nur durch einen ausdrücklich bezahlten Ausbruch.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Flame_Strike_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
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
    "id": "elementarismus-grosser-brandkreis",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "F14",
    "sourcePage": 13,
    "name": "Großer Brandkreis",
    "section": "F",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein weithin sichtbarer Brandkreis kündigt die Entladung an. Nach einem Vorbereitungsbeitrag und beim Abschluss im folgenden eigenen Beitrag verursacht er 9W6 Feuerschaden im Radius von 12 m; GE-Rettung halbiert. Während der Vorbereitung können Ziele den Bereich verlassen. Das Paket aus Aktion, Besonderer Aktion, Reaktion und Mana wird beim Abschluss verbraucht.",
    "limits": "Vorwarnung, freie Wirkungslinie und ein ununterbrochener Vorbereitungsbeitrag sind erforderlich.",
    "range": "60 m; 12 m Radius",
    "duration": "1 Beitrag Vorbereitung; Abschluss im folgenden eigenen Beitrag",
    "requirements": "Geste und Wort in beiden Beiträgen; freie Wirkungslinie und offener Raum. Keine Fluchbrechung, Seelenreinigung oder Sonderwirkung gegen Untote.",
    "concentration": false,
    "channelComments": 2,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fireball_Unfaded_Icon.webp",
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
            "damageType": "Feuer"
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
