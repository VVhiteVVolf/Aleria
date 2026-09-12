// Authored Elemente edition 2. Published revisions remain immutable.
export const Z_SPELLS = [
  {
    "id": "elementarismus-taunetz",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
      }
    ],
    "changes": ""
  },
  {
    "id": "elementarismus-schlammfessel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elementarismus-aschennebel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elementarismus-blitzruf",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z06",
    "sourcePage": 31,
    "name": "Großer Blitzruf",
    "section": "Z",
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
        "level": 6,
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
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
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
    ],
    "changes": ""
  },
  {
    "id": "elementarismus-hagelsturm",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z09",
    "sourcePage": 32,
    "name": "Großer Hagelsturm",
    "section": "Z",
    "role": "Schaden",
    "level": 6,
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
        "level": 7,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "4d6",
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
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
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
      }
    ],
    "changes": ""
  },
  {
    "id": "elementarismus-auge-des-unwetters",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elementarismus-sturmfront",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z10",
    "sourcePage": 33,
    "name": "Große Sturmfront",
    "section": "Z",
    "role": "Schaden",
    "level": 7,
    "actionIds": [
      "action",
      "special-action",
      "reaction"
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
        "level": 8,
        "actionIds": [
          "action",
          "special-action",
          "reaction"
        ],
        "damage": [
          {
            "formula": "5d6",
            "damageType": "Kälte"
          },
          {
            "formula": "4d6",
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
      }
    ],
    "changes": ""
  },
  {
    "id": "elementarismus-wetterruf",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elementarismus-magmabett",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z11",
    "sourcePage": 33,
    "name": "Magmabett",
    "section": "Z",
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
        "level": 9,
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
    "id": "elementarismus-sturm-der-vereinten-kraefte",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z14",
    "sourcePage": 34,
    "name": "Sturm der vereinten Kräfte",
    "section": "Z",
    "role": "Schaden",
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
    "effect": "Ein ortsfester Sturm wirkt über höchstens drei eigene Beiträge. Erster Puls: 3W6 Blitz und 2W6 Wucht. Zweiter Puls: 5W6 Kälte. Dritter Puls: 5W6 Feuer. GE-Rettung halbiert jeden Schadensanteil. Das vollständige Paket wird einmal beim Beginn bezahlt. Für jeden weiteren Puls wird eine Aktion als eigene Handlung verbucht; der Sturm erfordert ununterbrochene Konzentration. Die Spielleitung löst die zeitlich getrennten Pulse und alle betroffenen Wesen auf. Kein zusätzlicher Sofortschaden beim Anlegen.",
    "limits": "Der Bereich bleibt ortsfest; jeder Puls kann auch Verbündete treffen. Keine zusätzlichen Nässe-Würfel.",
    "range": "60 m; feststehender 15-m-Bereich",
    "duration": "Konzentration; höchstens 3 eigene Beiträge",
    "requirements": "Geste, Wort, freier Himmel und Bodenkontakt. Getrennte Kenntnisse in Feuer, Wasser, Wind, Erde und Blitz. Kein Donnerschaden. Ein entfallener Puls beendet die Folge; kein Überspringen.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Diese mehrteilige Wirkung wird als ein Zauberbeginn protokolliert. Keine automatische TP-Änderung. Nachfolgende Aktionen separat verbuchen; Konzentrationsabbruch beendet alle verbleibenden Pulse.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Chain_Lightning_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-landhebung",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "Z16",
    "sourcePage": 35,
    "name": "Klimatischer Gleichklang",
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
