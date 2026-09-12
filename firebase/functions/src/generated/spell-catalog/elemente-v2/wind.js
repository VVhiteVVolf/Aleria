// Authored Elemente edition 2. Published revisions remain immutable.
export const L_SPELLS = [
  {
    "id": "elementarismus-windfinger",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
        "formula": "2d6",
        "damageType": "Wucht"
      }
    ],
    "protectionRoll": "",
    "effect": "Verdichtet Luft zu einem harten Stoß. Ein getroffenes Wesen erleidet 2W6 Wuchtschaden, ohne zusätzlich versetzt zu werden.",
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
            "formula": "3d6",
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
            "formula": "4d6",
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
    "id": "elementarismus-boeenabwehr",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elemente-windsichel",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L11",
    "sourcePage": null,
    "name": "Windsichel",
    "section": "L",
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
    "effect": "Eine gekrümmte, aber direkt fliegende Luftkante schlägt für 3W6 Wuchtschaden gegen ein Wesen.",
    "limits": "Zauberangriff; kein Schaden bei Verfehlen. Die Sichel umgeht weder Deckung noch Wirkungslinien.",
    "range": "18 m; ein Ziel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
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
      }
    ]
  },
  {
    "id": "elemente-windtritt",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L14",
    "sourcePage": null,
    "name": "Windtritt",
    "section": "L",
    "role": "Formung & Nutzen",
    "level": 2,
    "actionIds": [
      "action",
      "bonus-action"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "",
    "effect": "Ein einzelner Aufwind unterstützt deinen nächsten Sprung im selben eigenen Beitrag um bis zu 3 m horizontale Weite.",
    "limits": "Verbraucht die gewöhnliche Bewegung. Kein Flug, keine zusätzliche Bewegung und kein Schutz vor einem zu tiefen Fall.",
    "range": "Selbst",
    "duration": "bis Ende des eigenen Beitrags; ein Sprung",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-sturmflug",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
    "id": "elemente-druckstoss",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L12",
    "sourcePage": null,
    "name": "Druckstoß",
    "section": "L",
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
    "effect": "Ein einmaliger Luftdruckstoß verursacht 4W6 Wuchtschaden im Kegel vor dir.",
    "limits": "ST-Rettung halbiert. Keine zusätzliche Verschiebung, kein Niederwerfen und kein Fallschaden.",
    "range": "Selbst; 6-m-Kegel",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Alle betroffenen Wesen einzeln als Ziele wählen; Kosten fallen einmal an. Positionen und Wirkungslinien mit der Spielleitung prüfen. Die Fläche trifft auch Verbündete.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Gust_of_Wind_Unfaded_Icon.webp",
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
    "id": "elemente-luftschirm",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L15",
    "sourcePage": null,
    "name": "Luftschirm",
    "section": "L",
    "role": "Schutz",
    "level": 3,
    "actionIds": [
      "reaction"
    ],
    "resolutionType": "automatic",
    "saveAttribute": "dexterity",
    "damage": [],
    "protectionRoll": "4d6",
    "effect": "Ein kompaktes Luftpolster reduziert einen angekündigten Wuchttreffer um 4W6, mindestens auf 0.",
    "limits": "Nur der Wuchtanteil eines Treffers. Kein Schutz vor Stich, Hieb oder Zaubern anderer Schadenstypen; nicht mit sich selbst stapelbar.",
    "range": "9 m; ein sichtbares Wesen",
    "duration": "sofort",
    "requirements": "Reaktionsauslöser: Ein sichtbares Wesen erleidet gleich Wuchtschaden; freie Wirkungslinie.",
    "concentration": false,
    "channelComments": 0,
    "manualResolution": "Der Schutzwurf wird protokolliert. Die Spielleitung zieht ihn einmal vom passenden eingehenden Schaden ab, mindestens bis 0. Keine Heilung oder temporären Trefferpunkte; keine automatische TP-Änderung durch diesen Zauber.",
    "iconPath": "",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elemente-sturmfront",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L13",
    "sourcePage": null,
    "name": "Sturmfront",
    "section": "L",
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
    "effect": "Eine schmale Sturmfront fährt durch die Luft und verursacht einmalig 5W6 Wuchtschaden.",
    "limits": "GE-Rettung halbiert. Keine Kältekomponente und keine Folgeschäden. Die Große Sturmfront ist ein eigenständiger Zauber des Zusammenspiels.",
    "range": "Selbst; 12 m lange, 3 m breite Linie",
    "duration": "sofort",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
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
    "id": "elemente-luftkorridor",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
    "sourceId": "L16",
    "sourcePage": null,
    "name": "Luftkorridor",
    "section": "L",
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
    "effect": "Hält einen Luftkorridor frei von gewöhnlichem Rauch, Staub und dünnem Nebel.",
    "limits": "Verdrängt keine magischen Zonen, festen Körper oder Flüssigkeiten. Keine Schadensresistenz, Luftversorgung unter Wasser oder Aufhebung eines bereits eingeatmeten Giftes.",
    "range": "18 m; ein 12 m langer, 3 m breiter Streifen",
    "duration": "bis 3 eigene Beiträge; Konzentration",
    "requirements": "Geste und Wort; freie Sicht und Wirkungslinie zum Ziel.",
    "concentration": true,
    "channelComments": 0,
    "manualResolution": "Kosten werden verbucht. Die beschriebene räumliche Wirkung, Voraussetzungen und Dauer werden mit der Spielleitung aufgelöst.",
    "iconPath": "IconOrdner/Zauber Icons/Baldurs Gate/Spell Icons/Gust_of_Wind_Unfaded_Icon.webp",
    "maximumTargets": 1,
    "forms": []
  },
  {
    "id": "elementarismus-windherrschaft",
    "revision": 2,
    "catalog": "elemente",
    "school": "Elemente",
    "pagePath": "Magie/elemente/index.html",
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
  }
];
