// Versioned authored rules. Keep revision 1 stable for linked character spells.
export const ELEMENTARISMUS_V1 = [
  {
    "id": "elementarismus-glutfunke",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
        "formula": "2d8",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Bündelt Hitze zu einem schmalen Geschoss; ein Treffer verursacht 2W8 Feuerschaden. Alternativ entzündet es einen ungetragenen brennbaren Gegenstand.",
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
            "formula": "3d8",
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
            "formula": "4d8",
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
    "id": "elementarismus-aschenbiss",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-feuerball",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "F09",
    "sourcePage": 11,
    "name": "Feuerball",
    "section": "F",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "special-action"
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
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
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
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
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
      },
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "11d6",
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
    "id": "elementarismus-brandgasse",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "F10",
    "sourcePage": 12,
    "name": "Brandgasse",
    "section": "F",
    "role": "Schaden",
    "level": 3,
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
        "level": 4,
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
        "changes": "Linie 24 × 3 m",
        "maximumTargets": 20,
        "range": "24 m; Streifen 24 × 3 m"
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "8d6",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "Linie 24 × 3 m",
        "maximumTargets": 20,
        "range": "24 m; Streifen 24 × 3 m"
      }
    ]
  },
  {
    "id": "elementarismus-aschenacker",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-flammenwall",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "F12",
    "sourcePage": 12,
    "name": "Flammenwall",
    "section": "F",
    "role": "Schaden",
    "level": 4,
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
        "level": 5,
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
        "level": 6,
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
    "id": "elementarismus-flammenkrone",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "F13",
    "sourcePage": 13,
    "name": "Flammenkrone",
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
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
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
    ]
  },
  {
    "id": "elementarismus-grosser-brandkreis",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "F14",
    "sourcePage": 13,
    "name": "Großer Brandkreis",
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
        "formula": "12d6",
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein weithin sichtbarer Brandkreis kündigt die Entladung an. Nach einem Vorbereitungsbeitrag und beim Abschluss im folgenden eigenen Beitrag verursacht er 12W6 Feuerschaden im Radius von 12 m; GE-Rettung halbiert. Während der Vorbereitung können Ziele den Bereich verlassen. Das Paket aus Aktion, Besonderer Aktion, Reaktion und Mana wird beim Abschluss verbraucht.",
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
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "14d6",
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
            "formula": "16d6",
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
    "id": "elementarismus-tropfengriff",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-eislanze",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "W11",
    "sourcePage": 17,
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
        "level": 4,
        "actionIds": [
          "action",
          "reaction",
          "bonus-action"
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
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
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
    ]
  },
  {
    "id": "elementarismus-eiswall",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-flutstoss",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "W13",
    "sourcePage": 18,
    "name": "Flutstoß",
    "section": "W",
    "role": "Schaden",
    "level": 5,
    "actionIds": [
      "action",
      "special-action"
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
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
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
            "formula": "12d6",
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
    "id": "elementarismus-flussgebot",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-windfinger",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L01",
    "sourcePage": 19,
    "name": "Windfinger",
    "section": "L",
    "role": "Formung & Nutzen",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Versetzt einen ungetragenen Gegenstand bis 1 kg um bis zu 3 m, schlägt eine Buchseite um oder bewegt eine leichte Gardine.",
    "limits": "Kein Angriff, kein Entwaffnen und keine unsichtbare Hand für präzise Schlossarbeit. Der Gegenstand braucht einen freien Weg.",
    "range": "9 m; ein kleines Objekt",
    "duration": "sofort",
    "requirements": "Geste; vorhandene Luft. Nicht unter Wasser und nicht in luftleeren Räumen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Gust_of_Wind_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-windfluestern",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L02",
    "sourcePage": 19,
    "name": "Windflüstern",
    "section": "L",
    "role": "Formung & Nutzen",
    "level": 0,
    "actionIds": [
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Trägt einen kurzen gesprochenen Satz zu einem sichtbaren Punkt. Dort ist er wie ein Flüstern hörbar, ohne dass du die Stimme erheben musst.",
    "limits": "Trägt eine vorhandene Stimme, erzeugt aber keinen schädigenden Schall. Keine Gedankenübertragung oder geheime Antwort; dichte Türen blockieren, am Ziel kann mitgehört werden.",
    "range": "24 m; ein sichtbarer Punkt",
    "duration": "ein Satz",
    "requirements": "Leise Worte und Geste; zusammenhängender Luftweg. Starker Gegenwind kann die Botschaft unverständlich machen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-federfall",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L03",
    "sourcePage": 19,
    "name": "Federfall",
    "section": "L",
    "role": "Schutz",
    "level": 1,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Fängt dich oder ein fallendes Wesen mit einem Luftpolster. Der nächste Aufprall zählt, als wäre die Fallhöhe um 15 m geringer.",
    "limits": "Nur bei beginnendem oder noch andauerndem Sturz; nicht nach dem Aufprall. Keine Seitwärtsbewegung und kein vollständiger Schutz bei beliebiger Fallhöhe.",
    "range": "12 m; ein sichtbares fallendes Wesen",
    "duration": "bis zum nächsten Aufprall, höchstens 1 eigener Beitrag",
    "requirements": "Freie Geste; Luft. Bei freiwilliger Rettung keine Abwehr; das Ziel darf die Hilfe ablehnen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Sturzhöhe und verbleibender Fallschaden werden mit der Spielleitung bestimmt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Feather_Fall_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Mindert die Fallstrecke eines Wesens um 30 m",
        "maximumTargets": 1
      },
      {
        "level": 3,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Mindert die Fallstrecke eines Wesens um 45 m",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-luftlanze",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L04",
    "sourcePage": 20,
    "name": "Luftlanze",
    "section": "L",
    "role": "Schaden",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "spell-attack",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "2d8",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Verdichtet Luft zu einem harten Stoß. Ein getroffenes Wesen erleidet 2W8 Wuchtschaden, ohne zusätzlich versetzt zu werden.",
    "limits": "Zauberangriff; kein Schaden bei Verfehlen. Keine dauerhafte Sauerstoffentziehung und kein Umgehen fester Deckung.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; Luft. Unter Wasser nicht wirkbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
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
            "formula": "3d8",
            "damageType": "Wucht"
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
            "formula": "4d8",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-boeenabwehr",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L05",
    "sourcePage": 20,
    "name": "Böenabwehr",
    "section": "L",
    "role": "Schutz",
    "level": 2,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Ein Seitenwind gewährt einem Ziel +4 RK gegen einen bereits angekündigten Angriff mit Pfeil, Bolzen oder vergleichbarem kleinem Geschoss.",
    "limits": "Vor der Trefferentscheidung einsetzen. Keine Umleitung auf ein anderes Wesen; keine Wirkung gegen Flächenzauber, Strahlen oder Belagerungsmunition.",
    "range": "9 m; ein sichtbares Ziel",
    "duration": "ein auslösender Geschossangriff",
    "requirements": "Geste und Luft; die Flugbahn muss sichtbar sein. Keine Wirkung durch massive Deckung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "RK-Bonus gilt ausschließlich für das angekündigte kleine Geschoss. Vor dessen Wurf vereinbaren und nur in diesem Angriff berücksichtigen; kein dauerhafter RK-Buff.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "+5 RK gegen genau das angekündigte Geschoss",
        "maximumTargets": 1
      },
      {
        "level": 4,
        "actionIds": [
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "+6 RK gegen genau das angekündigte Geschoss",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-sturmstoss",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L06",
    "sourcePage": 20,
    "name": "Sturmstoß",
    "section": "L",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [],
    "protectionRoll": "",
    "effect": "Treibt Luft durch einen 12 × 3 m langen Streifen. Wesen werden bis zu 3 m geschoben; gewöhnlicher Rauch oder dünner Nebel wird aus der Linie verdrängt.",
    "limits": "STÄ-RW verhindert das Schieben. Kein direkter Schaden. Magische Wolken werden nur bei erfolgreicher Gegenprobe und höchstens gleichem Grad verdrängt.",
    "range": "Selbst; 12-m-Linie",
    "duration": "sofort; Gas kann aus Nachbarbereichen wieder einströmen",
    "requirements": "Geste und Wort; Luft und freier Abflussweg. Gas verschwindet nicht, sondern wird verlagert.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Gust_of_Wind_Unfaded_Icon.webp",
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
        "changes": "Linie 18 × 3 m; bis 4,5 m Rückstoß",
        "maximumTargets": 20,
        "range": "18 m; Linie 18 × 3 m"
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Linie 24 × 3 m; bis 4,5 m Rückstoß",
        "maximumTargets": 20,
        "range": "24 m; Linie 24 × 3 m"
      }
    ]
  },
  {
    "id": "elementarismus-tragender-aufwind",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L07",
    "sourcePage": 21,
    "name": "Tragender Aufwind",
    "section": "L",
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
    "effect": "Trägt ein williges Wesen oder eine Last bis 150 kg senkrecht bis 6 m hoch. Keine freie Flugbewegung. Während der Konzentration darf die Höhe höchstens einmal je eigenem Beitrag geändert werden; dies kostet eine Aktion, die im Kampf als eigene Handlung verbucht wird.",
    "limits": "Keine Wirkung auf unwillige Wesen. Eine Last kann nicht als zusätzlicher kostenloser Angriffszauber auf jemanden fallen gelassen werden.",
    "range": "9 m; ein Ziel",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; Luft und ein freier Schacht nach oben. Eine erneute Höhenänderung kostet eine Aktion.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Levitate_Unfaded_Icon.webp",
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
        "changes": "Bis 300 kg; Höhe weiterhin höchstens 6 m",
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
        "changes": "Bis 500 kg; Höhe weiterhin höchstens 6 m",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-atemkugel",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L08",
    "sourcePage": 21,
    "name": "Atemkugel",
    "section": "L",
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
    "effect": "Bindet um den Kopf eines freiwilligen Wesens eine kleine, atembare Luftreserve. Hält gewöhnlichen Rauch, Staub und Spritzwasser vom Gesicht fern.",
    "limits": "Keine Immunität gegen Giftwolken, magische Gase, Hitze oder Druck. Unter Wasser hält die Reserve nur für die angegebene Dauer.",
    "range": "Berührung; ein Wesen",
    "duration": "10 Minuten; ohne Konzentration",
    "requirements": "Geste und Wort; beim Wirken muss saubere Atemluft verfügbar sein. Erzeugt keine endlose neue Luft.",
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
        "changes": "Drei willige Wesen; 10 Minuten",
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
        "changes": "Fünf willige Wesen; 10 Minuten",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-sturmflug",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L09",
    "sourcePage": 22,
    "name": "Sturmflug",
    "section": "L",
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
    "effect": "Trägt dich oder ein freiwilliges Wesen durch die Luft. Das Ziel darf seine gewöhnliche Bewegung durch bis zu 12 m Flug je eigenem Handlungs-Beitrag ersetzen.",
    "limits": "Kein zusätzliches Bewegungspaket und kein kostenloser Ausweichwurf. Engstellen, Hindernisse und Gegenwind bleiben relevant.",
    "range": "Berührung beim Wirken; ein Ziel",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; tragfähige Luft. Das Ziel mitsamt Ausrüstung darf höchstens 200 kg wiegen.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Wind_Walk_Unfaded_Icon.webp",
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
        "changes": "Flugbewegung 18 m; ein williges Wesen",
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
        "changes": "Flugbewegung 24 m; ein williges Wesen",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-windherrschaft",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "L10",
    "sourcePage": 22,
    "name": "Windherrschaft",
    "section": "L",
    "role": "Formung & Nutzen",
    "level": 5,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [],
    "protectionRoll": "",
    "effect": "Legt in 20 m Radius eine starke Windrichtung fest. Gewöhnliche Fernangriffe durch die Zone haben Nachteil; Fliegende müssen gegen Abdriften ankämpfen.",
    "limits": "STÄ-RW bei Eintritt und danach einmal je eigenem Beitrag: bei Fehlschlag 3 m Abdriften oder 6 m kontrolliertes Absinken. Kein automatischer Absturz aus beliebiger Höhe.",
    "range": "36 m; 20 m Radius",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; Luft, im Freien oder in einer großen Halle. Verbündete sind nicht ausgenommen; kein Schaden aus dem Zauber selbst.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Gust_of_Wind_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 30 m",
        "maximumTargets": 20,
        "range": "36 m; Radius 30 m"
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
        "changes": "Radius 40 m",
        "maximumTargets": 20,
        "range": "36 m; Radius 40 m"
      }
    ]
  },
  {
    "id": "elementarismus-donnerstoss",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-donnerkuppel",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "DN02",
    "sourcePage": 23,
    "name": "Donnerkuppel",
    "section": "DN",
    "role": "Schaden",
    "level": 4,
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
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
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
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
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
  },
  {
    "id": "elementarismus-blitzbahn",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "BL01",
    "sourcePage": 24,
    "name": "Blitzbahn",
    "section": "BL",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "special-action"
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
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
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
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
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
      },
      {
        "level": 6,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "11d6",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-erdtasten",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
        "formula": "3d8",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein faustgroßer Stein wächst für einen Schlag zur verdichteten Steinfaust und trifft ein Wesen für 3W8 Wuchtschaden. Danach bleibt nur das Ausgangsmaterial.",
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
            "formula": "5d8",
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
            "formula": "6d8",
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
            "formula": "7d8",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-steinhaut",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-felslanze",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "E11",
    "sourcePage": 28,
    "name": "Felslanze",
    "section": "E",
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
        "level": 4,
        "actionIds": [
          "action",
          "reaction",
          "bonus-action"
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
      },
      {
        "level": 5,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "10d6",
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
    "id": "elementarismus-steinwall",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "id": "elementarismus-erde-bewegen",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
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
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "E14",
    "sourcePage": 29,
    "name": "Erdbeben",
    "section": "E",
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
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Ein angekündigtes Beben wird einen eigenen Beitrag vorbereitet und im folgenden Beitrag ausgelöst. Wesen am Boden erleiden 6W6 Wuchtschaden; GE-Rettung halbiert und verhindert den Sturz. Gewöhnliche Strukturen erleiden gesondert 12W6 Strukturschaden, niemals zusätzlichen Kreaturenschaden. Aktion, Besondere Aktion, Reaktion und Mana werden beim Abschluss verbraucht.",
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
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "8d6",
            "damageType": "Wucht"
          }
        ],
        "protectionRoll": "",
        "changes": "Strukturschaden 14W6",
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
        "changes": "Strukturschaden 16W6",
        "maximumTargets": 20
      }
    ]
  },
  {
    "id": "elementarismus-taunetz",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z01",
    "sourcePage": 30,
    "name": "Taunetz",
    "section": "Z",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Sammelt Feuchtigkeit auf einer Fläche von 3 m Radius oder um bis zu zwei Wesen. Betroffene werden Nass; alternativ werden bis zu 20 m² Saatbeet leicht befeuchtet.",
    "limits": "Unwillige Wesen: GES-RW verhindert Nass. Kein Schaden und keine sofortige Wachstumssteigerung.",
    "range": "12 m; eine Fläche oder zwei Wesen",
    "duration": "Nass für 2 eigene Beiträge; Boden bleibt gewöhnlich feucht",
    "requirements": "Geste und Wort; feuchte Luft oder eine kleine offene Wasserquelle. In völlig trockener Luft ohne Quelle nicht verfügbar.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Create_Water_Unfaded_Icon.webp",
    "maximumTargets": 2,
    "forms": [
      {
        "level": 2,
        "actionIds": [
          "action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Drei Ziele; Gartenfläche weiterhin 20 m²",
        "maximumTargets": 3
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Vier Ziele; Gartenfläche weiterhin 20 m²",
        "maximumTargets": 4
      }
    ]
  },
  {
    "id": "elementarismus-nebelschleier",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z02",
    "sourcePage": 30,
    "name": "Nebelschleier",
    "section": "Z",
    "role": "Formung & Nutzen",
    "level": 1,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Verdichtet Luftfeuchtigkeit zu einem dichten Nebel in 6 m Radius. Sicht über mehr als 3 m wird blockiert; die Zone schützt beide Seiten gleichermaßen.",
    "limits": "Kein RW gegen die Nebelbildung. Sichtabhängiges Zielen durch den dichten Bereich ist nicht möglich; kein magischer Vorteil beim Hindurchsehen.",
    "range": "18 m; 6 m Radius",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; feuchte Luft oder mindestens 10 Liter Wasser. Starker Wind zerstreut den Nebel, ohne ihn in Schaden umzuwandeln.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fog_Cloud_Unfaded_Icon.webp",
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
        "changes": "Radius 9 m",
        "maximumTargets": 1,
        "range": "18 m; Radius 9 m"
      },
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 12 m",
        "maximumTargets": 1,
        "range": "18 m; Radius 12 m"
      }
    ]
  },
  {
    "id": "elementarismus-dampfstoss",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z03",
    "sourcePage": 30,
    "name": "Dampfstoß",
    "section": "Z",
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
        "damageType": "Feuer"
      }
    ],
    "protectionRoll": "",
    "effect": "Verdampft einen Wasserfilm schlagartig zu einem heißen 4,5-m-Kegel. Verursacht 3W6 Feuerschaden, aber keinen zusätzlichen Explosions- oder Sichtschutzschaden.",
    "limits": "GES-RW halbiert. Eine Nässe-Schicht schützt nach der allgemeinen Regel einmalig; Dampf erzeugt keine weitere kostenlose Schadensfläche.",
    "range": "Selbst; 4,5-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und Wort; 2 Liter vorhandenes Wasser. Wärme wird magisch beigesteuert; eine Flamme ist nicht zusätzlich nötig.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Burning_Hands_Unfaded_Icon.webp",
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
            "formula": "5d6",
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
            "formula": "6d6",
            "damageType": "Feuer"
          }
        ],
        "protectionRoll": "",
        "changes": "Kegel 6 m",
        "maximumTargets": 20,
        "range": "Selbst; Kegel 6 m"
      }
    ]
  },
  {
    "id": "elementarismus-schlammfessel",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z04",
    "sourcePage": 31,
    "name": "Schlammfessel",
    "section": "Z",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "strength",
    "damage": [],
    "protectionRoll": "",
    "effect": "Vermischt Erde und Wasser zu zähem Schlamm in 3 m Radius. Die Fläche ist schwieriges Gelände; bodenstehende Wesen können darin festgesetzt werden.",
    "limits": "STÄ-RW bei Entstehung oder erstem Betreten verhindert Festsetzen. Befreien mit eine Aktion und STÄ- Probe; zusätzlich am Ende jedes betroffenen Beiträgen kostenloser neuer RW.",
    "range": "18 m; 3 m Radius",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; lockerer Boden und mindestens 20 Liter Wasser. Kein automatisches Versinken über Hüfthöhe und kein Ertränken.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Rettung wird gewürfelt. Gelände, Bewegung und gegebenenfalls Befreiungsversuche anschließend mit der Spielleitung auflösen. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 4,5 m",
        "maximumTargets": 20,
        "range": "18 m; Radius 4,5 m"
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 6 m",
        "maximumTargets": 20,
        "range": "18 m; Radius 6 m"
      }
    ]
  },
  {
    "id": "elementarismus-frostsprengung",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z05",
    "sourcePage": 31,
    "name": "Frostsprengung",
    "section": "Z",
    "role": "Schaden",
    "level": 2,
    "actionIds": [
      "action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "6d6",
    "effect": "Friert Wasser in einer sichtbaren Gesteinsritze. Ein nichtmagisches Stein- oder Holzobjekt erleidet 6W6 Strukturschaden; eine Öffnung entsteht nur, wenn seine Haltbarkeit überwunden wird.",
    "limits": "Nicht auf getragene Gegenstände, Körper oder massive rissfreie Mauern anwendbar. Kein kostenloser Splitterangriff auf Umstehende.",
    "range": "Berührung; höchstens 0,25 m³ Material",
    "duration": "sofort; physischer Bruch bleibt",
    "requirements": "Geste und Wort; zugänglicher Riss und mindestens 1 Liter Wasser. Sicherer Abstand zum möglichen Abbruch ist Teil der Ausführung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der angezeigte Wurf beschädigt ausschließlich eine geeignete ungetragene Struktur. Keine automatische TP-Änderung eines Wesens.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ice_Knife_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 3,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "8d6",
        "changes": "Betroffene Struktur bis 0,5 m³",
        "maximumTargets": 1
      },
      {
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [],
        "protectionRoll": "10d6",
        "changes": "Betroffene Struktur bis 1 m³",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-blitzruf",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z06",
    "sourcePage": 31,
    "name": "Blitzruf",
    "section": "Z",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "4d10",
        "damageType": "Blitz"
      }
    ],
    "protectionRoll": "",
    "effect": "Ruft unter freiem Himmel einen Blitz in einen Bereich von 3 m Radius. Betroffene erleiden 4W10 Blitzschaden; GE-Rettung halbiert. Jeder weitere Blitz ist ein neuer Zauber mit vollständigen Kosten. Es gibt keine vergünstigten oder kostenlosen Folgeblitze.",
    "limits": "Nur unter freiem Himmel. Keine kostenlose Nässe-Verstärkung oder automatische Folgeentladung.",
    "range": "36 m; 3 m Radius je Einschlag",
    "duration": "sofort",
    "requirements": "Kenntnis Wasser + Blitz; Geste, Wort und freier Himmel. Die Wolke wird gebildet. Unter geschlossenen Dächern nicht einsetzbar; Windkenntnis allein genügt nicht.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Call_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
        ],
        "damage": [
          {
            "formula": "5d10",
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
            "formula": "6d10",
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
    "id": "elementarismus-aschennebel",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z07",
    "sourcePage": 32,
    "name": "Aschennebel",
    "section": "Z",
    "role": "Schaden",
    "level": 3,
    "actionIds": [
      "action",
      "special-action"
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
    "effect": "Trägt glühende Asche in eine 6-m-Zone. Sie blockiert Sicht über 3 m und verursacht 3W6 Feuerschaden bei Entstehung oder Kontakt, höchstens einmal je Ziel und eigenem Beitrag.",
    "limits": "KON-RW halbiert den Schaden. Kein automatisches Ersticken; der Zaubernde sieht nicht hindurch. Wind kann den Nebel verdrängen.",
    "range": "24 m; 6 m Radius",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste, Wort und eine Handvoll Asche als verbrauchte Komponente; Luft. Kein Glut- oder Brandbonus ohne zusätzlichen bezahlten Zauber.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Der erste Schadenswurf wird berechnet. Gebiet und Ziele festlegen; weitere Kontakte höchstens einmal je Wesen zwischen zwei eigenen Beiträgen des Zaubernden gesondert auflösen. Konzentration und maximale Dauer nachhalten; keine zusätzlichen Mana-Erhaltungskosten.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Fog_Cloud_Unfaded_Icon.webp",
    "maximumTargets": 20,
    "forms": [
      {
        "level": 4,
        "actionIds": [
          "action",
          "special-action"
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
        "level": 5,
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
      }
    ]
  },
  {
    "id": "elementarismus-schlammbrand",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z08",
    "sourcePage": 32,
    "name": "Schlammbrand",
    "section": "Z",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "special-action"
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
    "effect": "Erhitzt eine bestehende Schlammfläche von 6 × 6 m. Betroffene erleiden 5W6 Feuerschaden; die Fläche ist schwieriges Gelände, fesselt aber nicht zusätzlich.",
    "limits": "GES-RW halbiert; höchstens ein Schadenstreffer je Ziel und eigenem Beitrag. Wasser allein beendet magische Hitze nicht sofort, geeignete Gegenmagie kann sie aufheben.",
    "range": "24 m; 6 × 6 m",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Geste und Wort; vorhandener Schlamm oder mindestens 50 Liter Wasser auf lockerer Erde. Keine Erzeugung innerhalb eines Körpers.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Der erste Schadenswurf wird berechnet. Gebiet und Ziele festlegen; weitere Kontakte höchstens einmal je Wesen zwischen zwei eigenen Beiträgen des Zaubernden gesondert auflösen. Konzentration und maximale Dauer nachhalten; keine zusätzlichen Mana-Erhaltungskosten.",
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
    "id": "elementarismus-hagelsturm",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z09",
    "sourcePage": 32,
    "name": "Hagelsturm",
    "section": "Z",
    "role": "Schaden",
    "level": 4,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "dexterity",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Wucht"
      },
      {
        "formula": "3d6",
        "damageType": "Kälte"
      }
    ],
    "protectionRoll": "",
    "effect": "Lässt einen dichten Hagelschlag auf 6 m Radius niedergehen: 4W6 Wucht- und 3W6 Kälteschaden. Danach bleibt der Boden für 1 eigener Beitrag schwieriges Gelände.",
    "limits": "GES-RW halbiert beide Schadensanteile. Kein zusätzlicher Sturz ohne eigenen Effekt; Dächer und volle Deckung können den Hagel abfangen.",
    "range": "36 m; 6 m Radius",
    "duration": "Schaden sofort; Eisreste 1 eigener Beitrag",
    "requirements": "Geste und Wort; mindestens 6 m freier Raum über der Fläche. Eis wird magisch gebildet und taut ohne Nachschaden.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Ice_Storm_Unfaded_Icon.webp",
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
            "formula": "5d6",
            "damageType": "Wucht"
          },
          {
            "formula": "4d6",
            "damageType": "Kälte"
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
            "formula": "6d6",
            "damageType": "Wucht"
          },
          {
            "formula": "5d6",
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
    "id": "elementarismus-sturmfront",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z10",
    "sourcePage": 33,
    "name": "Sturmfront",
    "section": "Z",
    "role": "Schaden",
    "level": 5,
    "actionIds": [
      "action",
      "special-action"
    ],
    "resolutionType": "saving-throw",
    "saveAttribute": "constitution",
    "damage": [
      {
        "formula": "4d6",
        "damageType": "Kälte"
      },
      {
        "formula": "4d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Verbindet Wasser und Wind zu einer kalten, vorrückenden Regenfront. Verursacht 4W6 Kälte- und 4W6 Wuchtschaden; bei misslungener Abwehr 3 m Rückstoß. Kein Donnerschaden.",
    "limits": "KON-RW halbiert beide Anteile und verhindert Rückstoß. Der erzeugte Regen macht Ziele nicht vor dem eigenen Schaden kostenlos Nass.",
    "range": "Selbst; 24 m lange, 3 m breite Linie",
    "duration": "sofort",
    "requirements": "Kenntnis Wasser + Wind; Geste, Wort und freier Luftweg. Keine bestehende Wetterlage nötig. Massive Wände stoppen die Front; keine kostenlosen Blitz- oder Donnereffekte.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Zusätzliche Zustände und Bewegung werden entsprechend dem Ergebnis der Rettung bzw. des Angriffs mit der Spielleitung umgesetzt.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Cone_of_Cold_Unfaded_Icon.webp",
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
            "damageType": "Kälte"
          },
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
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "6d6",
            "damageType": "Kälte"
          },
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
    "id": "elementarismus-magmabett",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z11",
    "sourcePage": 33,
    "name": "Magmabett",
    "section": "Z",
    "role": "Schaden",
    "level": 6,
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
    "effect": "Eine glühende Spalte kündigt das Magmabett einen eigenen Beitrag lang an. Beim Abschluss im folgenden Beitrag entsteht auf 6 × 3 m eine Zone mit 8W6 Feuerschaden; GE-Rettung halbiert. Spätere Kontakte höchstens einmal zwischen zwei eigenen Beiträgen des Zaubernden. Die Kosten fallen beim Abschluss an; Folgekontakte werden mit der Spielleitung aufgelöst.",
    "limits": "GES-RW halbiert. Die Fläche kann vor der Freigabe verlassen werden. Kein sofortiges Versinken; außerhalb ihrer Grenzen kein Vulkanausbruch.",
    "range": "30 m; 6 × 3 m",
    "duration": "1 Beitrag Vorbereitung; danach Konzentration, höchstens 2 eigene Beiträge",
    "requirements": "Geste, Wort und sichtbarer nichtmagischer Felsboden. Beim Ende erstarrt die magische Hitze ohne neuen Schaden.",
    "concentration": true,
    "channelComments": 2,
    "manualResolution": "Der erste Schadenswurf wird berechnet. Gebiet und Ziele festlegen; weitere Kontakte höchstens einmal je Wesen zwischen zwei eigenen Beiträgen des Zaubernden gesondert auflösen. Konzentration und maximale Dauer nachhalten; keine zusätzlichen Mana-Erhaltungskosten.",
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
            "formula": "10d6",
            "damageType": "Feuer"
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
            "formula": "12d6",
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
    "id": "elementarismus-auge-des-unwetters",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z12",
    "sourcePage": 33,
    "name": "Auge des Unwetters",
    "section": "Z",
    "role": "Formung & Nutzen",
    "level": 6,
    "actionIds": [
      "action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Schafft einen windarmen, temperierten Bereich von 20 m Radius. Gewöhnlicher Starkregen, Hagel und Sturm werden an dessen Rand umgeleitet.",
    "limits": "Kein Schutz vor Waffen, Feuerbällen, Donner oder Blitzen. Gegen magischen Wind, Regen oder Hagel bis G6: einmalige Gegenprobe beim Wirken.",
    "range": "Selbst; unbeweglicher 20-m-Bereich am Wirkungsort",
    "duration": "Konzentration, höchstens 3 eigene Beiträge",
    "requirements": "Kenntnis Wasser + Wind; Geste, Wort und freier Luftaustausch. Hält kein Meer zurück, fängt keinen Blitz und trägt kein Gebäude gegen seinen Einsturz.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Material, räumliche Wirkung und Dauer werden mit der Spielleitung aufgelöst; keine automatische Änderung fremder Trefferpunkte. Konzentration und maximale Dauer in eigenen Beiträgen gemeinsam nachhalten; kein zusätzlicher Mana-Unterhalt.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 7,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 30 m; Wettermagie weiterhin höchstens Grad 6",
        "maximumTargets": 1,
        "range": "Selbst; ortsfester Radius 30 m"
      },
      {
        "level": 8,
        "actionIds": [
          "action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 40 m; Wettermagie weiterhin höchstens Grad 6",
        "maximumTargets": 1,
        "range": "Selbst; ortsfester Radius 40 m"
      }
    ]
  },
  {
    "id": "elementarismus-wetterruf",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z13",
    "sourcePage": 34,
    "name": "Wetterruf",
    "section": "Z",
    "role": "Ritual",
    "level": 7,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Ein mindestens 30-minütiges Ritual verändert über weitere 30 Minuten das örtliche Wetter um eine plausible Stufe. Radius 1 km, Dauer 4 Stunden. Keine gezielten Blitze, Katastrophen auf Befehl oder Ausweitung außerhalb der Jahreszeit. Die Kosten fallen einmal beim Ritualabschluss an.",
    "limits": "Keine gezielten Donner- oder Blitzangriffe, sofortigen Tornados oder garantierten Fluten. Wetteränderungen setzen allmählich ein; gegnerische Wettermagie verlangt eine Gegenprobe.",
    "range": "Selbst; 1 km Radius",
    "duration": "Ritual mindestens 30 Minuten; Wetterwechsel weitere 30 Minuten; Wirkung 4 Stunden",
    "requirements": "Vier ungestörte Abschnitte unter freiem Himmel; Kenntnis Wasser + Wind und der örtlichen Wetterlage. Wasser und Wind werden regional umverteilt, nicht grenzenlos erzeugt.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 2 km; Dauer weiterhin 4 Stunden",
        "maximumTargets": 1,
        "range": "Ritualort; Radius 2 km"
      },
      {
        "level": 9,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Radius 3 km; Dauer weiterhin 4 Stunden",
        "maximumTargets": 1,
        "range": "Ritualort; Radius 3 km"
      }
    ]
  },
  {
    "id": "elementarismus-sturm-der-vereinten-kraefte",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z14",
    "sourcePage": 34,
    "name": "Sturm der vereinten Kräfte",
    "section": "Z",
    "role": "Schaden",
    "level": 8,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Ein ortsfester Sturm wirkt über höchstens drei eigene Beiträge. Erster Puls: 4W6 Blitz und 4W6 Wucht. Zweiter Puls: 8W6 Kälte. Dritter Puls: 8W6 Feuer. GE-Rettung halbiert jeden Schadensanteil. Das vollständige Paket wird einmal beim Beginn bezahlt. Für jeden weiteren Puls wird eine Aktion als eigene Handlung verbucht; der Sturm erfordert ununterbrochene Konzentration. Die Spielleitung löst die zeitlich getrennten Pulse und alle betroffenen Wesen auf. Kein zusätzlicher Sofortschaden beim Anlegen.",
    "limits": "Der Bereich bleibt ortsfest; jeder Puls kann auch Verbündete treffen. Keine zusätzlichen Nässe-Würfel.",
    "range": "60 m; feststehender 15-m-Bereich",
    "duration": "Konzentration; höchstens 3 eigene Beiträge",
    "requirements": "Geste, Wort, freier Himmel und Bodenkontakt. Getrennte Kenntnisse in Feuer, Wasser, Wind, Erde und Blitz. Kein Donnerschaden. Ein entfallener Puls beendet die Folge; kein Überspringen.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Diese mehrteilige Wirkung wird als ein Zauberbeginn protokolliert. Keine automatische TP-Änderung. Nachfolgende Aktionen separat verbuchen; Konzentrationsabbruch beendet alle verbleibenden Pulse.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chain_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": [
      {
        "level": 9,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [],
        "protectionRoll": "",
        "changes": "Erster Puls 5W6 Blitz + 5W6 Wucht; zweiter 10W6 Kälte; dritter 10W6 Feuer",
        "maximumTargets": 1
      }
    ]
  },
  {
    "id": "elementarismus-landhebung",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z15",
    "sourcePage": 35,
    "name": "Landhebung",
    "section": "Z",
    "role": "Ritual",
    "level": 9,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Hebt oder senkt ein Gebiet von 50 × 50 m in einem mindestens einstündigen Ritual um höchstens 3 m. Erd- und Felsmassen werden versetzt, nicht erschaffen. Kein Einsatz zum unmittelbaren Zerquetschen oder Verschütten von Wesen. Kosten einmal beim Abschluss.",
    "limits": "Kein Sofort-Kampfzauber. Bauwerke, bewohnte Flächen und instabile Hänge erfordern vorherige Folgenklärung; keine gezielte Körperzerquetschung.",
    "range": "100 m; zusammenhängendes Gelände",
    "duration": "Ritual mindestens 1 Stunde; dauerhafte Geländeänderung",
    "requirements": "Sechs ungestörte Abschnitte, sichtbare Begrenzungssteine und Bodenkontakt. Material wird verlagert; benachbarte Senken oder Aushub sind einzuplanen.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-bund-der-jahreszeiten",
    "revision": 1,
    "catalog": "elementarismus",
    "school": "Elementarismus",
    "pagePath": "Magie/elementarismus/index.html",
    "sourceId": "Z16",
    "sourcePage": 35,
    "name": "Bund der Jahreszeiten",
    "section": "Z",
    "role": "Ritual",
    "level": 9,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Stabilisiert in einem mindestens zweistündigen Ritual Wetter und Boden in einem Radius von 200 m für sieben Tage. Vier Ankerpunkte und eine natürliche Wasserquelle sind erforderlich. Keine Heilung, Erschaffung von Nahrung oder Garantie einer Ernte. Kosten einmal beim Abschluss.",
    "limits": "Keine spontane Ernte, Wiederbelebung oder Heilung. Nährstoffe und Wasser müssen vorhanden sein; unfruchtbarer Fels wird nicht automatisch zu Ackerboden.",
    "range": "Vier gesetzte Anker um einen Landstrich; 200 m Radius",
    "duration": "Ritual mindestens 2 Stunden; Wirkung 7 Tage",
    "requirements": "Sechs ungestörte Abschnitte, vier gewöhnliche Ankersteine und eine örtliche Wasserquelle. Entfernen eines Ankers beendet die weitere Stabilisierung.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Erst nach vollständiger Ritualzeit und erfüllten Voraussetzungen als Abschluss verbuchen. Ein Kostenpaket, keine wiederholten Besonderen Aktionen; Zeit und Umweltwirkung bestätigt die Spielleitung.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Harmony_of_Fire_and_Water_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  }
];
