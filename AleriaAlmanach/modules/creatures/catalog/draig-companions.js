// Persönliche Gefährten, Stand 25.09.2026. Texte und Bilder aus den vorhandenen Online-Karten.
// Kampfwerte sind individuelle Stufenprofile; die 1–10-Eigenschaften bleiben im Gefährten-Diagramm.
export const DRAIG_COMPANION_SOURCES = [
  {
    "id": "companion-idwal-distry",
    "name": "Distry",
    "type": "Tier",
    "species": "Rabe",
    "level": 1,
    "challengeRating": 1,
    "size": "Winzig",
    "habitat": "Bei Idwal Draig, an Bord und an Land",
    "portrait": "https://i.imgur.com/HN7olKF.png",
    "portraitCaption": "Distry, Rabe von Idwal Draig.",
    "itemOrigin": {
      "instanceId": "idwal-distry",
      "inventoryItemId": "idwal-distry",
      "templateId": "",
      "ownerCharacterId": "kJss0DGF1RLuVrrVCBQT",
      "ownerCharacterName": "Idwal Draig",
      "disposition": "owned"
    },
    "biography": {
      "schemaVersion": 1,
      "summary": "Idwals frecher, ungewöhnlich kluger und eifersüchtiger Rabe.",
      "appearance": "Schwarzer Rabe mit wachem Blick; legt beim Beobachten den Kopf schief.",
      "personality": "Distry ist der ebenso freche wie ungewöhnlich kluge Rabe des Piraten Idwal und weicht seinem Herrn kaum jemals von der Seite. Mit schiefgelegtem Kopf, funkelnden Augen und einem geradezu spöttischen Krächzen beobachtet er jede Unterhaltung aufmerksam. Wer Idwals Missfallen auf sich zieht, muss jederzeit damit rechnen, von Distry unvermittelt in Ohr, Finger oder Hinterkopf gepickt zu werden, als hätte der Vogel jedes beleidigte Wort persönlich genommen. Besonders eifersüchtig reagiert er auf Menschen, die Idwal zu viel Aufmerksamkeit schenken oder ihm zu nahe kommen, sodass selbst Verbündete gelegentlich Opfer seiner kleinen Angriffe werden. Trotz seines respektlosen Wesens ist Distry seinem Herrn bedingungslos ergeben und scheint dessen Stimmung oft zu erkennen, noch bevor Idwal selbst ein Wort sagt.",
      "history": "",
      "bonds": "Weicht Idwal Draig kaum von der Seite und reagiert aufmerksam auf dessen Stimmung.",
      "habits": "",
      "facts": [
        {
          "label": "Rolle",
          "value": "Haustier"
        }
      ],
      "sections": []
    },
    "combatProfile": {
      "attributes": [
        {
          "key": "strength",
          "score": 3
        },
        {
          "key": "dexterity",
          "score": 14
        },
        {
          "key": "constitution",
          "score": 10
        },
        {
          "key": "intelligence",
          "score": 5
        },
        {
          "key": "wisdom",
          "score": 14
        },
        {
          "key": "charisma",
          "score": 8
        }
      ],
      "hitPoints": {
        "current": 5,
        "maximumOverride": 5,
        "temporary": 0,
        "hitDie": 4
      },
      "armorClass": {
        "base": 11,
        "dexterityMode": "full",
        "override": null
      },
      "combat": {
        "movement": 18
      },
      "skills": [
        {
          "id": "distry-wahrnehmung",
          "name": "Wahrnehmung",
          "attributeKey": "wisdom",
          "proficiency": "trained"
        }
      ],
      "weapons": [
        {
          "id": "distry-naturwaffe",
          "name": "Schnabelhieb",
          "weaponType": "natural",
          "damageFormula": "1d4",
          "damageType": "Stich",
          "attackAttribute": "dexterity",
          "damageBonus": -2,
          "proficient": true,
          "equipped": true,
          "activationType": "action",
          "range": "Nahkampf · 0,5 m",
          "properties": "Naturwaffe",
          "notes": "Kleiner Schnabel: −2 Schaden als Größenabzug."
        }
      ],
      "armorItems": [],
      "resources": [],
      "techniques": [],
      "quirks": [],
      "conditions": [],
      "abilities": [
        {
          "id": "distry-eigenschaft-1",
          "name": "Flug",
          "description": "Fliegt bis zu 18 m, am Boden bis zu 3 m. Flug setzt freien Raum und nutzbare Flügel voraus; keine zusätzliche Bewegungsaktion.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        },
        {
          "id": "distry-eigenschaft-2",
          "name": "Aufmerksamer Beobachter",
          "description": "Beobachtet Gespräche und vertraute Gesten. Seine Klugheit ersetzt keine Sprache und kein Wissen, das er nicht wahrgenommen hat.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        }
      ],
      "magic": {
        "enabled": false,
        "spells": []
      }
    },
    "loot": {
      "currency": "",
      "notes": "Persönlicher Gefährte; kein festgelegter Handelswert.",
      "items": []
    },
    "notes": "Distry ist der ebenso freche wie ungewöhnlich kluge Rabe des Piraten Idwal und weicht seinem Herrn kaum jemals von der Seite. Mit schiefgelegtem Kopf, funkelnden Augen und einem geradezu spöttischen Krächzen beobachtet er jede Unterhaltung aufmerksam. Wer Idwals Missfallen auf sich zieht, muss jederzeit damit rechnen, von Distry unvermittelt in Ohr, Finger oder Hinterkopf gepickt zu werden, als hätte der Vogel jedes beleidigte Wort persönlich genommen. Besonders eifersüchtig reagiert er auf Menschen, die Idwal zu viel Aufmerksamkeit schenken oder ihm zu nahe kommen, sodass selbst Verbündete gelegentlich Opfer seiner kleinen Angriffe werden. Trotz seines respektlosen Wesens ist Distry seinem Herrn bedingungslos ergeben und scheint dessen Stimmung oft zu erkennen, noch bevor Idwal selbst ein Wort sagt."
  },
  {
    "id": "companion-idwal-drecksack",
    "name": "Drecksack",
    "type": "Tier",
    "species": "Equo Pferd",
    "level": 2,
    "challengeRating": 2,
    "size": "Groß",
    "habitat": "Stallungen von Burg Draig",
    "portrait": "https://i.imgur.com/ilnbcSh.png",
    "portraitCaption": "Drecksack, Equo Pferd von Idwal Draig.",
    "itemOrigin": {
      "instanceId": "idwal-drecksack",
      "inventoryItemId": "idwal-drecksack",
      "templateId": "",
      "ownerCharacterId": "kJss0DGF1RLuVrrVCBQT",
      "ownerCharacterName": "Idwal Draig",
      "disposition": "owned"
    },
    "biography": {
      "schemaVersion": 1,
      "summary": "Idwals schwarzer Equo-Hengst: kräftig, aufbrausend und schwer zu führen.",
      "appearance": "Mächtiger schwarzer Equo-Hengst.",
      "personality": "Drecksack ist ein mächtiger schwarzer Equo-Hengst und Idwals bevorzugtes Reittier, auch wenn sein Herr ihn nur selten sattelt, da er die meiste Zeit auf seinem eigenen Schiff verbringt. Wann immer Idwal jedoch an Land kämpft, wartet Drecksack bereits ungeduldig auf ihn, als wolle er nichts lieber, als durch die Reihen der Gefallenen zu pflügen und auf den Leichen seiner Feinde herumzutrampeln. Anders als die meisten Equos, die mit eiserner Disziplin für den Krieg erzogen werden, blieb Drecksack aufgrund der seltenen Anwesenheit seines Reiters vergleichsweise unzureichend geführt. Aus dieser Vernachlässigung entwickelte sich ein aufbrausendes, dominantes Wesen, das er vor allem an anderen Pferden auslässt. Mehrfach geriet der Hengst außer Kontrolle, deckte Stuten gegen den Willen ihrer Besitzer und sorgte so für unerwünschte Fohlen oder schwere Verletzungen, die einzelne Tiere dauerhaft unfruchtbar machten. Da Idwal nur selten auf der Burg weilt und der Stallmeister mit zahllosen anderen Aufgaben ausgelastet ist, gilt Drecksack gemeinsam mit Tanor, dem arroganten Rhyfel des Prinzen Gawain, als das größte Ärgernis der Stallungen von Burg Draig.",
      "history": "",
      "bonds": "Idwal Draigs bevorzugtes Reittier an Land; in den Stallungen von Burg Draig untergebracht.",
      "habits": "",
      "facts": [
        {
          "label": "Rolle",
          "value": "Reittier"
        }
      ],
      "sections": []
    },
    "combatProfile": {
      "attributes": [
        {
          "key": "strength",
          "score": 16
        },
        {
          "key": "dexterity",
          "score": 12
        },
        {
          "key": "constitution",
          "score": 14
        },
        {
          "key": "intelligence",
          "score": 2
        },
        {
          "key": "wisdom",
          "score": 11
        },
        {
          "key": "charisma",
          "score": 7
        }
      ],
      "hitPoints": {
        "current": 25,
        "maximumOverride": 25,
        "temporary": 0,
        "hitDie": 10
      },
      "armorClass": {
        "base": 11,
        "dexterityMode": "full",
        "override": null
      },
      "combat": {
        "movement": 15
      },
      "skills": [
        {
          "id": "drecksack-wahrnehmung",
          "name": "Wahrnehmung",
          "attributeKey": "wisdom",
          "proficiency": "trained"
        }
      ],
      "weapons": [
        {
          "id": "drecksack-naturwaffe",
          "name": "Hufschlag",
          "weaponType": "natural",
          "damageFormula": "1d6",
          "damageType": "Wucht",
          "attackAttribute": "strength",
          "damageBonus": 0,
          "proficient": true,
          "equipped": true,
          "activationType": "action",
          "range": "Nahkampf · 1,5 m",
          "properties": "Naturwaffe",
          "notes": "Ein einzelner Angriff; keine kostenlose Zusatzattacke."
        }
      ],
      "armorItems": [],
      "resources": [],
      "techniques": [],
      "quirks": [],
      "conditions": [],
      "abilities": [
        {
          "id": "drecksack-eigenschaft-1",
          "name": "Reittier",
          "description": "Kann einen geeigneten Reiter tragen. Auf- und Absitzen sowie berittene Manöver verwenden die gemeinsame Reittier- und Aktionslogik.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        },
        {
          "id": "drecksack-eigenschaft-2",
          "name": "Ungestümer Hengst",
          "description": "Braucht klare Führung, besonders in der Nähe anderer Pferde. Sein Temperament gewährt weder kostenlose Angriffe noch automatisches Niedertrampeln.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        }
      ],
      "magic": {
        "enabled": false,
        "spells": []
      }
    },
    "loot": {
      "currency": "",
      "notes": "Persönlicher Gefährte; kein festgelegter Handelswert.",
      "items": []
    },
    "notes": "Drecksack ist ein mächtiger schwarzer Equo-Hengst und Idwals bevorzugtes Reittier, auch wenn sein Herr ihn nur selten sattelt, da er die meiste Zeit auf seinem eigenen Schiff verbringt. Wann immer Idwal jedoch an Land kämpft, wartet Drecksack bereits ungeduldig auf ihn, als wolle er nichts lieber, als durch die Reihen der Gefallenen zu pflügen und auf den Leichen seiner Feinde herumzutrampeln. Anders als die meisten Equos, die mit eiserner Disziplin für den Krieg erzogen werden, blieb Drecksack aufgrund der seltenen Anwesenheit seines Reiters vergleichsweise unzureichend geführt. Aus dieser Vernachlässigung entwickelte sich ein aufbrausendes, dominantes Wesen, das er vor allem an anderen Pferden auslässt. Mehrfach geriet der Hengst außer Kontrolle, deckte Stuten gegen den Willen ihrer Besitzer und sorgte so für unerwünschte Fohlen oder schwere Verletzungen, die einzelne Tiere dauerhaft unfruchtbar machten. Da Idwal nur selten auf der Burg weilt und der Stallmeister mit zahllosen anderen Aufgaben ausgelastet ist, gilt Drecksack gemeinsam mit Tanor, dem arroganten Rhyfel des Prinzen Gawain, als das größte Ärgernis der Stallungen von Burg Draig."
  },
  {
    "id": "companion-anaraut-merfyn",
    "name": "Merfyn",
    "type": "Tier",
    "species": "Ceffyl Hengst",
    "level": 4,
    "challengeRating": 4,
    "size": "Groß",
    "habitat": "Bei Anaraut Draig",
    "portrait": "https://i.imgur.com/f5WHZkS.png",
    "portraitCaption": "Merfyn, Ceffyl Hengst von Anaraut Draig.",
    "itemOrigin": {
      "instanceId": "anaraut-merfyn",
      "inventoryItemId": "anaraut-merfyn",
      "templateId": "",
      "ownerCharacterId": "fq586i4k2gj5Lg30dUwW",
      "ownerCharacterName": "Anaraut Draig",
      "disposition": "owned"
    },
    "biography": {
      "schemaVersion": 1,
      "summary": "Das edle Pferd von Anaraut Draig.",
      "appearance": "Ceffyl-Hengst.",
      "personality": "Umgänglich und sehr sozial.",
      "history": "",
      "bonds": "Anaraut Draigs Reittier.",
      "habits": "",
      "facts": [
        {
          "label": "Rolle",
          "value": "Anarauts Reittier"
        }
      ],
      "sections": []
    },
    "combatProfile": {
      "attributes": [
        {
          "key": "strength",
          "score": 18
        },
        {
          "key": "dexterity",
          "score": 14
        },
        {
          "key": "constitution",
          "score": 16
        },
        {
          "key": "intelligence",
          "score": 3
        },
        {
          "key": "wisdom",
          "score": 13
        },
        {
          "key": "charisma",
          "score": 12
        }
      ],
      "hitPoints": {
        "current": 50,
        "maximumOverride": 50,
        "temporary": 0,
        "hitDie": 10
      },
      "armorClass": {
        "base": 11,
        "dexterityMode": "full",
        "override": null
      },
      "combat": {
        "movement": 18
      },
      "skills": [
        {
          "id": "merfyn-wahrnehmung",
          "name": "Wahrnehmung",
          "attributeKey": "wisdom",
          "proficiency": "trained"
        }
      ],
      "weapons": [
        {
          "id": "merfyn-naturwaffe",
          "name": "Hufschlag",
          "weaponType": "natural",
          "damageFormula": "1d8",
          "damageType": "Wucht",
          "attackAttribute": "strength",
          "damageBonus": 0,
          "proficient": true,
          "equipped": true,
          "activationType": "action",
          "range": "Nahkampf · 1,5 m",
          "properties": "Naturwaffe",
          "notes": "Ein einzelner Angriff; keine kostenlose Zusatzattacke."
        }
      ],
      "armorItems": [],
      "resources": [],
      "techniques": [],
      "quirks": [],
      "conditions": [],
      "abilities": [
        {
          "id": "merfyn-eigenschaft-1",
          "name": "Reittier",
          "description": "Trägt Anaraut als Reittier. Reiter und Pferd verwenden die gemeinsame Reit- und Aktionslogik; keine kostenlosen Zusatzangriffe.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        },
        {
          "id": "merfyn-eigenschaft-2",
          "name": "Ausdauernder Läufer",
          "description": "Die vorhandene Gefährtenkarte beschreibt ein schnelles, ausdauerndes und sehr agiles Pferd. Lange Belastung und schwieriges Gelände erfordern weiterhin passende Proben.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        }
      ],
      "magic": {
        "enabled": false,
        "spells": []
      }
    },
    "loot": {
      "currency": "",
      "notes": "Persönlicher Gefährte; kein festgelegter Handelswert.",
      "items": []
    },
    "notes": "Das edle Pferd von Anaraut Draig."
  },
  {
    "id": "companion-anaraut-gwrgi",
    "name": "Gwrgi",
    "type": "Tier",
    "species": "Pontar Wachhund",
    "level": 3,
    "challengeRating": 3,
    "size": "Mittel",
    "habitat": "Bei Anaraut Draig",
    "portrait": "https://i.imgur.com/vLuaqiC.png",
    "portraitCaption": "Gwrgi, Pontar Wachhund von Anaraut Draig.",
    "itemOrigin": {
      "instanceId": "anaraut-gwrgi",
      "inventoryItemId": "anaraut-gwrgi",
      "templateId": "",
      "ownerCharacterId": "fq586i4k2gj5Lg30dUwW",
      "ownerCharacterName": "Anaraut Draig",
      "disposition": "owned"
    },
    "biography": {
      "schemaVersion": 1,
      "summary": "Anarauts treuer Haushund.",
      "appearance": "Pontar-Wachhund.",
      "personality": "Anarauts treuer, sehr sozialer Haushund.",
      "history": "",
      "bonds": "Treuer Haushund und Gefährte Anaraut Draigs.",
      "habits": "",
      "facts": [
        {
          "label": "Rolle",
          "value": "Gefährte"
        }
      ],
      "sections": []
    },
    "combatProfile": {
      "attributes": [
        {
          "key": "strength",
          "score": 14
        },
        {
          "key": "dexterity",
          "score": 14
        },
        {
          "key": "constitution",
          "score": 14
        },
        {
          "key": "intelligence",
          "score": 3
        },
        {
          "key": "wisdom",
          "score": 14
        },
        {
          "key": "charisma",
          "score": 12
        }
      ],
      "hitPoints": {
        "current": 30,
        "maximumOverride": 30,
        "temporary": 0,
        "hitDie": 8
      },
      "armorClass": {
        "base": 11,
        "dexterityMode": "full",
        "override": null
      },
      "combat": {
        "movement": 12
      },
      "skills": [
        {
          "id": "gwrgi-wahrnehmung",
          "name": "Wahrnehmung",
          "attributeKey": "wisdom",
          "proficiency": "trained"
        },
        {
          "id": "gwrgi-spur",
          "name": "Überleben",
          "attributeKey": "wisdom",
          "proficiency": "trained"
        }
      ],
      "weapons": [
        {
          "id": "gwrgi-naturwaffe",
          "name": "Biss",
          "weaponType": "natural",
          "damageFormula": "1d6",
          "damageType": "Stich",
          "attackAttribute": "strength",
          "damageBonus": 0,
          "proficient": true,
          "equipped": true,
          "activationType": "action",
          "range": "Nahkampf · 1,5 m",
          "properties": "Naturwaffe",
          "notes": "Ein einzelner Angriff; keine kostenlose Zusatzattacke."
        }
      ],
      "armorItems": [],
      "resources": [],
      "techniques": [],
      "quirks": [],
      "conditions": [],
      "abilities": [
        {
          "id": "gwrgi-eigenschaft-1",
          "name": "Wachhund",
          "description": "Achtet auf unbekannte Geräusche und Annäherungen. Bei unklaren Wahrnehmungen wird gewürfelt; sein Bellen ist ein Warnsignal, kein automatischer Kampfeffekt.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        },
        {
          "id": "gwrgi-eigenschaft-2",
          "name": "Spürnase",
          "description": "Kann bekannte Gerüche aufnehmen und einer Fährte folgen. Wind, Regen, Entfernung und fremde Gerüche beeinflussen die Spur.",
          "activationType": "passive",
          "active": true,
          "combatUsable": false
        }
      ],
      "magic": {
        "enabled": false,
        "spells": []
      }
    },
    "loot": {
      "currency": "",
      "notes": "Persönlicher Gefährte; kein festgelegter Handelswert.",
      "items": []
    },
    "notes": "Anarauts treuer Haushund."
  }
];
