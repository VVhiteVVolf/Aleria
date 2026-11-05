// Generated from reviewed local source inventories; run scripts/build-catalogues.mjs.
export const RELIGION = {
  "categories": [
    {
      "id": "religion",
      "title": "Religion"
    },
    {
      "id": "kultur",
      "title": "Kultur"
    },
    {
      "id": "organisation",
      "title": "Organisation"
    },
    {
      "id": "geschichte",
      "title": "Geschichte"
    },
    {
      "id": "konflikte",
      "title": "Konflikte"
    }
  ],
  "perspectives": {
    "source-statement": "Eine bestehende Quelle beschreibt eine gesellschaftliche, organisatorische oder historische Angabe; keine zusätzliche Bestätigung behauptet.",
    "klythesian-belief": "Glaubensaussage, Kultpraxis oder religiöse Wertung des Zirkels; nicht als neutrale Aussage über fremde Völker, Geschlechter oder Krankheit lesen.",
    "phalantian-external-view": "Religiöse Fremdsicht aus dem Phalantischen Bund; keine neutrale klythesische Selbstauskunft."
  },
  "sources": [
    {
      "id": "waldzirkel-lore",
      "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
      "sha256": "542ab0e368779569d85234e9b8bd3dcb3973296a844f635e775e6cf27afe3502",
      "role": "primary-religion-lore",
      "note": "Bestehende aus Nutzerlore übernommene Religionsbeschreibung."
    },
    {
      "id": "waldzirkel-catalogue",
      "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
      "sha256": "a4e0a4e4a4cc8609e58a47cce62b7cc099cf15bc50c9c89a7767ae1f2c108dc2",
      "role": "primary-structured-catalogue",
      "note": "Bestehender Katalog von 14 Gestalteneinträgen und zwölf religiösen Bezeichnungen."
    },
    {
      "id": "waldzirkel-rendered-page",
      "path": "Religionen/religionen/zirkel-des-ewigen-waldes/index.html",
      "sha256": "96bc3416de8835970828c7f88a44a464eb8167d3c09667851a1f6cb39af19a26",
      "role": "derived-render",
      "note": "Gerenderte Religionsseite; kein zusätzlicher unabhängiger Beleg."
    },
    {
      "id": "phalantian-external-view",
      "path": "Religionen/religionen/phalantischer-bund/eintrag.json",
      "sha256": "c0b7090bb255161837c43416f0eafd43affdae3b25e455b6e777d73e6e9de4d9",
      "role": "external-religious-perspective",
      "note": "Ausschließlich als phalantische Fremdsicht verwendet."
    },
    {
      "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
      "note": "Aktuelle Nutzerfestlegung; frühere Rechercheberichte bleiben als historischer Stand erhalten.",
      "sha256": "d84a5a80aaf6b24a20ca37463885b6c4c0f2cdb5e1b2ab18294ba2731f8fd905"
    }
  ],
  "counts": {
    "facts": 35,
    "catalogueEntries": 14,
    "ancestorGods": 1,
    "namedGoddesses": 7,
    "patronGods": 1,
    "enemyImageEntries": 5,
    "religiousLabels": 12,
    "openItems": 6
  },
  "facts": [
    {
      "id": "religion-name",
      "category": "religion",
      "title": "Zirkel des Ewigen Waldes",
      "text": "Die für Klythesia dokumentierte Religion heißt Der Zirkel des Ewigen Waldes.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/title",
        "section": "Titel"
      }
    },
    {
      "id": "southern-tirnara-amazons",
      "category": "geschichte",
      "title": "Amazonenreich im Süden Tirnaras",
      "text": "Klythesia und Phalantia gehen auf das albische Südvolk der Aechanath und das Fürstentum Aechneach zurück. Nach Nord-Süd-Wanderung, Zarakhuls Knechtschaft und phalantischer Eroberung trennten sich die westlichen Städte als Amazonenreich Klythesia ab.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      }
    },
    {
      "id": "religious-origin",
      "category": "geschichte",
      "title": "Religiöse Umbruchszeit",
      "text": "Kyreon begründete den Zirkel im Zusammenhang mit dem Befreiungsaufstand nach dem Zerfall des Alerischen Kaiserreiches. Die Bezüge zu älteren Pantheons sind religiöse Neuinterpretationen und keine frühere politische Gründungszeit Klythesias.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/1/blocks/0",
          "section": "Hintergrund"
        }
      ]
    },
    {
      "id": "prophet-journey",
      "category": "geschichte",
      "title": "Überlieferung des Propheten",
      "text": "Mit dem Zerfall des Alerischen Kaiserreiches erhoben sich die Unterdrückten, besonders die versklavten Frauen. Kyreon predigte ihnen eine neue Religion und erklärte sich zum fleischgewordenen Gott und Befreier. Unter seiner Führung zerbrach Phalantias Macht über die westlichen Städte.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/1/blocks/1",
          "section": "Hintergrund"
        }
      ]
    },
    {
      "id": "kyreon-founder",
      "category": "geschichte",
      "title": "Kyreon und die Reichsgründung",
      "text": "Unter Kyreons Führung zerbrach Phalantias Macht über die westlichen Städte. Seitdem ist Klythesia unabhängig und dient ihm als Gottkönig.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      }
    },
    {
      "id": "forest-nature",
      "category": "kultur",
      "title": "Wälder und Natur",
      "text": "Kyreons Lehre und der Zirkel sind eng mit den Wäldern und der Natur verbunden. Ein konkretes staatliches Landnutzungsrecht wird daraus nicht beschrieben.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/1/blocks/2",
        "section": "Hintergrund"
      }
    },
    {
      "id": "related-faiths",
      "category": "religion",
      "title": "Verwandte Glaubenssysteme",
      "text": "Die Quelle beschreibt Ähnlichkeiten und Neuinterpretationen des Alten Pantheons, der Hohen Drei, der Celestischen Synode und der Alerischen Kirche. Ihre Wertung bestimmter Formen als rein ist eine Glaubensposition.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/0/blocks/0",
        "section": "Einführung"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/0/blocks/1",
          "section": "Einführung"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/1/blocks/3",
          "section": "Hintergrund"
        }
      ]
    },
    {
      "id": "klytharios-highest",
      "category": "religion",
      "title": "Höchster Ahnengott",
      "text": "Klytharios gilt als einziger höchster Gott und Herrscher. Er wacht als Ahnengott über die Welt und führt das amazonische Volk durch Kyreon.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/2/blocks/1",
        "section": "Doktrine"
      }
    },
    {
      "id": "klytharios-aspects",
      "category": "religion",
      "title": "Göttliche Aspekte",
      "text": "Die Doktrin verbindet Klytharios mit Aspekten Zatrachs und Ordans. Der strukturierte Katalog führt zusätzlich eine Querverbindung zu Zarakhul. Diese Verknüpfungen sind keine zusätzlichen eigenständigen Mitglieder des lokalen Pantheons.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/2/blocks/2",
        "section": "Doktrine"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/groups/0/entries/0",
          "section": "Götterkatalog"
        }
      ]
    },
    {
      "id": "kyreon-divine-office",
      "category": "organisation",
      "title": "Patrongott und Gottkönig",
      "text": "Kyreon ist der gegenwärtige Gottkönig Klythesias und wird als fleischgewordener Gott, Befreier und religiöser Mittler verehrt. Die matriarchale Herrscherfamilie dient ihm; ihre oberste Matriarchin ist seine Gemahlin und Hohepriesterin.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/0",
          "section": "Matriarchat"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/groups/2/entries/0",
          "section": "Götterkatalog"
        }
      ]
    },
    {
      "id": "seven-named-goddesses",
      "category": "religion",
      "title": "Sieben namentlich geführte Göttinnen",
      "text": "Übersicht und Katalog nennen Aristhea, Artemisra, Elythra, Kallistra, Klythara, Nekara und Alethea. Die abweichende Angabe von neun Nebengöttern in der Prosa bleibt ungeklärt.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1",
        "section": "Die Göttinnen"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/summary",
          "section": "Übersicht"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/3",
          "section": "Doktrine"
        }
      ]
    },
    {
      "id": "temples-society",
      "category": "organisation",
      "title": "Tempel und Gesellschaft",
      "text": "Die Tempel bilden eine religiöse und gesellschaftliche Struktur, die von Priesterinnen geführt wird. Die Quelle verbindet diese Frauenämter mit dem Dienst an Kyreon.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/5/blocks/0",
        "section": "Matriarchat"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/5",
          "section": "Matriarchat"
        }
      ]
    },
    {
      "id": "clan-matriarchs",
      "category": "organisation",
      "title": "Matriarchin als Clanoberhaupt",
      "text": "Die Anássai bilden die matriarchale Herrscherfamilie der Hauptstadt. Die Polemístriai sind die städtischen Frauenclans; kleinere Hiéreiai-Matronenhäuser bilden den niedrigsten Adel. Sie dürfen kleinere Städte, Siedlungen und Festungen halten und eigene Clans führen.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      }
    },
    {
      "id": "temple-hierarchy",
      "category": "organisation",
      "title": "Dokumentierte Tempelränge",
      "text": "Der strukturierte Glaubenskatalog enthält zwölf Bezeichnungen von Hohe Matriarchin bis Laie. Diese religiöse Reihenfolge ist kein belegtes weltliches Stände- oder Lehnssystem.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries",
        "section": "Hierarchie"
      }
    },
    {
      "id": "high-matriarch",
      "category": "organisation",
      "title": "Hohe Matriarchin",
      "text": "Die oberste Matriarchin aus der Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin. Sie verbindet die weibliche Landesführung und das höchste Priesterinnenamt im Dienst des Gottkönigs.",
      "perspective": "user-canon",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Nutzerfestlegung vom 4. November 2026"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/1",
          "section": "Matriarchat"
        }
      ]
    },
    {
      "id": "arch-matriarch",
      "category": "organisation",
      "title": "Erz-Matriarchin",
      "text": "Die Erz-Matriarchin wird als symbolische Konkubine Kyreons beschrieben. Sie unterstützt die Hohe Matriarchin und übernimmt Tempelverwaltung und Führungsaufgaben.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/1",
        "section": "Hierarchie"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/2",
          "section": "Matriarchat"
        }
      ]
    },
    {
      "id": "oracles-mantis",
      "category": "organisation",
      "title": "Orakel und Mantis",
      "text": "Orakel leiten Tempel und Heiligtümer und vermitteln göttliche Botschaften. Mantis führen Zeremonien durch, bewahren Lehren und bilden Priesterinnen aus.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/2",
        "section": "Hierarchie"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/hierarchy/entries/3",
          "section": "Hierarchie"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/3",
          "section": "Matriarchat"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/4",
          "section": "Matriarchat"
        }
      ]
    },
    {
      "id": "aristhea-women-authority",
      "category": "kultur",
      "title": "Weibliche Autorität",
      "text": "Aristhea verkörpert im Kult weibliche Weisheit, Stärke und Autorität. Die Quelle bezeichnet sie als Matriarchin aller Frauen und als Vorbild für Führungs- und Entscheidungsaufgaben.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/3",
        "section": "Aristhea"
      }
    },
    {
      "id": "aristhea-maritime",
      "category": "kultur",
      "title": "Seefahrt, Fischfang und Wetter",
      "text": "Seeleute und Fischer wenden sich an Aristhea für sichere Fahrten; auch für Landwirtschaft und Wetter werden ihre Segnungen erbeten. Küstentempel und Altäre verwenden Muschel- und Wellenmotive, teils Krone oder Zepter.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/2",
        "section": "Aristhea"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/4",
          "section": "Aristhea"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/5",
          "section": "Aristhea"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/6",
          "section": "Aristhea"
        }
      ]
    },
    {
      "id": "artemisra-hunting",
      "category": "kultur",
      "title": "Heilige Jagd",
      "text": "Die Artemisra-Überlieferung verbindet Nahrungserwerb und Schutz der Gemeinschaft mit heiliger Jagd. Jagdtrophäen werden als Dankopfer am Altar verbrannt; Wald und Natur sollen mit Respekt behandelt werden.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/9",
        "section": "Artemisra"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/8",
          "section": "Artemisra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/10",
          "section": "Artemisra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/11",
          "section": "Artemisra"
        }
      ]
    },
    {
      "id": "elythra-festivals",
      "category": "kultur",
      "title": "Kunst und Fruchtbarkeitsfeste",
      "text": "Elythras Kult umfasst Fruchtbarkeit, Liebe, Kunst und Ästhetik. Beschrieben sind gemeinschaftliche Feste, Musik, Tanz, künstlerische Opfergaben und sexuelle Kultrituale.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/14",
        "section": "Elythra"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/15",
          "section": "Elythra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/16",
          "section": "Elythra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/17",
          "section": "Elythra"
        }
      ]
    },
    {
      "id": "kallistra-craft-war",
      "category": "kultur",
      "title": "Krieg, Arbeit und Handwerk",
      "text": "Kallistra schützt der Glaubensquelle zufolge Krieger, Arbeiter und Handwerker. Schaukampf, militärische Wettkämpfe und die Ehrung handwerklicher Leistung gehören zu ihrem Kult.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/19",
        "section": "Kallistra"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/20",
          "section": "Kallistra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/21",
          "section": "Kallistra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/23",
          "section": "Kallistra"
        }
      ]
    },
    {
      "id": "kallistra-sacrifices",
      "category": "religion",
      "title": "Überlieferte Menschenopfer",
      "text": "Der Kallistra-Abschnitt erwähnt Menschenopfer an ihren Altären. Zeitliche Einordnung, heutige Verbreitung und rechtlicher Status sind nicht festgelegt.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/22",
        "section": "Kallistra"
      }
    },
    {
      "id": "klythara-politics",
      "category": "kultur",
      "title": "List, Rache und Politik",
      "text": "Klythara steht für Rache, strategische Klugheit und politische Machtspiele. Masken und Spiegel begleiten ihre Symbolik; Anhänger suchen ihren Rat bei politischen und gesellschaftlichen Fragen.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/25",
        "section": "Klythara"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/26",
          "section": "Klythara"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/28",
          "section": "Klythara"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/29",
          "section": "Klythara"
        }
      ]
    },
    {
      "id": "klythara-killings",
      "category": "religion",
      "title": "Ritualisierte Rachetötung",
      "text": "Die Quelle bezeichnet bestimmte Rachetötungen als Ehrenmorde und ordnet sie Klytharas Kult zu. Daraus lässt sich ohne weitere Festlegung kein heutiges allgemeines Straf- oder Familienrecht ableiten.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/27",
        "section": "Klythara"
      }
    },
    {
      "id": "nekara-crypts",
      "category": "kultur",
      "title": "Versiegelte Ahnengrüfte",
      "text": "Nekaras Kult kennt versiegelte, heilige Ahnengrüfte. Ausschließlich ihre Priesterinnen dürfen diese betreten und die Bestattungsriten sowie die Pflege der Gräber und Wächter übernehmen.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/32",
        "section": "Nekara"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/34",
          "section": "Nekara"
        }
      ]
    },
    {
      "id": "nekara-undead-guardians",
      "category": "religion",
      "title": "Untote Grabwächterinnen",
      "text": "Untote Kriegerinnen oder Mumien werden als Wächterinnen der heiligen Grüfte beschrieben. Dies ist eine überlieferte Besonderheit von Nekaras Kult.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/33",
        "section": "Nekara"
      }
    },
    {
      "id": "alethea-education",
      "category": "organisation",
      "title": "Schulen, Tempel und Magieorden",
      "text": "Aletheas Kult unterhält Schulen und Tempel für praktische und geistige Bildung. Magische Orden lehren, erforschen und praktizieren Magie; konkrete Ordensnamen oder Zahlen fehlen.",
      "perspective": "source-statement",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/3/blocks/38",
        "section": "Alethea"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/39",
          "section": "Alethea"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/40",
          "section": "Alethea"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/41",
          "section": "Alethea"
        }
      ]
    },
    {
      "id": "enemy-images",
      "category": "religion",
      "title": "Göttliche Feindbilder",
      "text": "Als Feindbilder führt der Katalog Tethron, Baalzor, Lyrion, Gryloth sowie Aurion und Noxus. Die Texte schildern deren Ablehnung; sie sind von den positiv verehrten Göttinnen zu unterscheiden.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3",
        "section": "Die Feindbilder"
      }
    },
    {
      "id": "male-oppression-image",
      "category": "kultur",
      "title": "Religiöses Gegenbild männlicher Herrschaft",
      "text": "Die Feindbilder werden mit Unterdrückung, Gewalt und einer als unrein bewerteten männlichen Welt verbunden. Das ist die ausdrücklich wertende Glaubenssicht der Quelle, keine neutrale Aussage über Männer oder andere Völker.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/4/blocks/1",
        "section": "Tethron"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/2",
          "section": "Tethron"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/3",
          "section": "Tethron"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/18",
          "section": "Gryloth"
        }
      ]
    },
    {
      "id": "lyrion-trade-suspicion",
      "category": "kultur",
      "title": "Religiöses Misstrauen gegen Handel",
      "text": "Der Lyrion-Kulttext warnt vor Betrug, Ausbeutung und Manipulation im Handel. Ein pauschales staatliches Handelsverbot ist nicht dokumentiert.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/4/blocks/11",
        "section": "Lyrion"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/12",
          "section": "Lyrion"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/14",
          "section": "Lyrion"
        }
      ]
    },
    {
      "id": "gryloth-purity",
      "category": "religion",
      "title": "Reinheit und Krankheit",
      "text": "Gryloth dient als religiöses Feindbild für Krankheit, Verfall und Unreinheit. Die Verbindung mit Männern ist eine kultische Wertung; der Text nennt Schutzrituale und Wachsamkeit.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/4/blocks/16",
        "section": "Gryloth"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/17",
          "section": "Gryloth"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/18",
          "section": "Gryloth"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/19",
          "section": "Gryloth"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/20",
          "section": "Gryloth"
        }
      ]
    },
    {
      "id": "aurion-noxus-aspects",
      "category": "religion",
      "title": "Aurion und Noxus als zwei Gesichter",
      "text": "Aurion und Noxus werden ausdrücklich als zwei Gesichter einer Gottheit beschrieben: verführerische Täuschung und zerstörerisches Chaos. Die Zuschreibung psychischer Leiden an sie ist eine religiöse Deutung der Quelle.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
        "pointer": "/sections/4/blocks/22",
        "section": "Aurion und Noxus"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/23",
          "section": "Aurion und Noxus"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/24",
          "section": "Aurion und Noxus"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/25",
          "section": "Aurion und Noxus"
        }
      ]
    },
    {
      "id": "phalantia-heresy",
      "category": "konflikte",
      "title": "Phalantische Fremdsicht",
      "text": "Der Phalantische Bund betrachtet den Zirkel als Ketzerei und als Umkehr seiner patriarchalen Glaubensordnung. Die Quelle berichtet auch, dass Klythesias Anhänger diese Beurteilung zurückweisen.",
      "perspective": "phalantian-external-view",
      "source": {
        "path": "Religionen/religionen/phalantischer-bund/eintrag.json",
        "pointer": "/sections/1/blocks/3",
        "section": "Hintergrund"
      }
    },
    {
      "id": "phalantia-no-crusade",
      "category": "konflikte",
      "title": "Keine belegte offene Glaubenskriegsführung",
      "text": "Die phalantische Quelle schildert bewussten Verzicht auf offene Kreuzzüge: Klythesias Gläubige gelten dort als irregeleitet und nicht als erklärte Glaubensfeinde. Ein aktueller Krieg oder ein konkretes Abkommen ist damit nicht belegt.",
      "perspective": "phalantian-external-view",
      "source": {
        "path": "Religionen/religionen/phalantischer-bund/eintrag.json",
        "pointer": "/sections/5/blocks/5",
        "section": "Gegenüber dem Zirkel des Ewigen Waldes"
      }
    }
  ],
  "deities": [
    {
      "id": "klytharios",
      "name": "Klytharios",
      "group": "ahnengott",
      "epithet": "Der Jäger / Vater / Tyrann",
      "domains": [
        "Ahnengott",
        "höchste göttliche Herrschaft"
      ],
      "text": "Höchster Ahnengott; Kyreon gilt als sein Mittler.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/0/entries/0",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/1",
          "section": "Doktrine"
        }
      ]
    },
    {
      "id": "aristhea",
      "name": "Aristhea",
      "group": "goettin",
      "epithet": "Göttin der See · Mutter / Witwe / Seemaid",
      "domains": [
        "Meer",
        "Autorität",
        "Wetter"
      ],
      "text": "Gemahlin Klytharios und weibliches Autoritätsideal.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/0",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/1",
          "section": "Aristhea"
        }
      ]
    },
    {
      "id": "artemisra",
      "name": "Artemisra",
      "group": "goettin",
      "epithet": "Göttin der Natur · Hirtin / Jäger",
      "domains": [
        "Natur",
        "Jagd"
      ],
      "text": "Schwester Klytharios; heiliger Natur- und Jagdbezug.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/1",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/8",
          "section": "Artemisra"
        }
      ]
    },
    {
      "id": "elythra",
      "name": "Elythra",
      "group": "goettin",
      "epithet": "Göttin der Liebe · Maid / Hedonist",
      "domains": [
        "Fruchtbarkeit",
        "Liebe",
        "Kunst",
        "Ästhetik"
      ],
      "text": "Tochter Klytharios; gemeinschaftliche Feste und Künste.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/2",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/13",
          "section": "Elythra"
        }
      ]
    },
    {
      "id": "kallistra",
      "name": "Kallistra",
      "group": "goettin",
      "epithet": "Göttin des Krieges · Streiter / Knecht",
      "domains": [
        "Krieg",
        "Arbeit",
        "Handwerk"
      ],
      "text": "Tochter Klytharios; Schutz von Kriegern, Arbeitern und Handwerkern.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/3",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/19",
          "section": "Kallistra"
        }
      ]
    },
    {
      "id": "klythara",
      "name": "Klythara",
      "group": "goettin",
      "epithet": "Göttin der List · Rächerin / Nachtmaid",
      "domains": [
        "List",
        "Rache",
        "Strategie"
      ],
      "text": "Schwester Klytharios; Rache, politische Strategie und Maskensymbolik.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/4",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/25",
          "section": "Klythara"
        }
      ]
    },
    {
      "id": "nekara",
      "name": "Nekara",
      "group": "goettin",
      "epithet": "Göttin des Todes · Hüter / Schicksalsweberin",
      "domains": [
        "Tod",
        "Übergang",
        "Totenruhe"
      ],
      "text": "Gemahlin Klytharios; heilige Grüfte und priesterliche Totenfürsorge.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/5",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/31",
          "section": "Nekara"
        }
      ]
    },
    {
      "id": "alethea",
      "name": "Alethea",
      "group": "goettin",
      "epithet": "Göttin des Wissens · Mentor / Intrigant",
      "domains": [
        "Wissen",
        "Magie",
        "Astrologie"
      ],
      "text": "Tochter Klytharios; Bildung, Forschung und magische Orden.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/1/entries/6",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/37",
          "section": "Alethea"
        }
      ]
    },
    {
      "id": "kyreon",
      "name": "Kyreon",
      "group": "patrongott",
      "epithet": "Der Häscher",
      "domains": [
        "Prophetie",
        "göttliche Vermittlung",
        "Gottkönigtum"
      ],
      "text": "Als Prophet, geweihter Patrongott und Gottkönig überliefert; heutige Staatsform bleibt zu klären.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/2/entries/0",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/6",
          "section": "Doktrine"
        }
      ]
    },
    {
      "id": "tethron",
      "name": "Tethron",
      "group": "feindbild",
      "epithet": "Der Verschlinger",
      "domains": [
        "Meer",
        "Unterwelt",
        "Unterdrückung"
      ],
      "text": "Religiöses Feindbild, verbunden mit Piraterie und Unterdrückung; keine positive Kultverehrung daraus ableiten.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3/entries/0",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/1",
          "section": "Tethron"
        }
      ]
    },
    {
      "id": "baalzor",
      "name": "Baalzor",
      "group": "feindbild",
      "epithet": "Der Schänder",
      "domains": [
        "Verderben",
        "Gewalt",
        "Unreinheit"
      ],
      "text": "Als Vater Tethrons und Symbol für Verderben, Missbrauch und unheilige Wesen abgelehnt.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3/entries/1",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/6",
          "section": "Baalzor"
        }
      ]
    },
    {
      "id": "lyrion",
      "name": "Lyrion",
      "group": "feindbild",
      "epithet": "Der Trickser",
      "domains": [
        "Betrug",
        "Handel"
      ],
      "text": "Feindbild ausbeuterischen und täuschenden Handels.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3/entries/2",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/11",
          "section": "Lyrion"
        }
      ]
    },
    {
      "id": "gryloth",
      "name": "Gryloth",
      "group": "feindbild",
      "epithet": "Der Verseucher",
      "domains": [
        "Pestilenz",
        "Unreinheit"
      ],
      "text": "Religiöses Feindbild von Krankheit, Verfall und Unreinheit.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3/entries/3",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/16",
          "section": "Gryloth"
        }
      ]
    },
    {
      "id": "aurion-noxus",
      "name": "Aurion & Noxus",
      "group": "feindbild",
      "epithet": "Der Zweigesichtige",
      "domains": [
        "Täuschung",
        "Wahnsinn",
        "Chaos"
      ],
      "text": "Zwei Gesichter einer Gottheit und ein gemeinsamer Katalogeintrag; Zuschreibungen psychischer Leiden sind kultische Deutung.",
      "perspective": "klythesian-belief",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/groups/3/entries/4",
        "section": "Götterkatalog"
      },
      "additionalSources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/22",
          "section": "Aurion und Noxus"
        }
      ]
    }
  ],
  "ranks": [
    {
      "id": "hohe-matriarchin",
      "title": "Hohe Matriarchin",
      "position": 1,
      "text": "Die oberste Matriarchin der Anássai-Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin. Sie führt die weibliche Tempelhierarchie und verbindet Landesführung und religiöse Praxis im Dienst des Gottkönigs.",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Herrscherfamilie und Hohepriesterin"
      }
    },
    {
      "id": "erz-matriarchin",
      "title": "Erz-Matriarchin",
      "position": 2,
      "text": "Symbolische Konkubine Kyreons; unterstützt die Hohe Matriarchin und führt Tempelangelegenheiten.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/1",
        "section": "Hierarchie"
      }
    },
    {
      "id": "orakel",
      "title": "Orakel",
      "position": 3,
      "text": "Hochrangige Priesterin; leitet Tempel und Heiligtümer und übermittelt göttliche Botschaften.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/2",
        "section": "Hierarchie"
      }
    },
    {
      "id": "mantis",
      "title": "Mantis",
      "position": 4,
      "text": "Religiöse Führerin; bildet Priesterinnen aus, wahrt Lehren, führt Zeremonien durch und unterstützt Orakel.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/3",
        "section": "Hierarchie"
      }
    },
    {
      "id": "sybilla",
      "title": "Sybilla",
      "position": 5,
      "text": "Prophetisch begabte weise Frau und geistliche Ratgeberin.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/4",
        "section": "Hierarchie"
      }
    },
    {
      "id": "seherin",
      "title": "Seherin",
      "position": 6,
      "text": "Empfängt und deutet Visionen und göttliche Botschaften.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/5",
        "section": "Hierarchie"
      }
    },
    {
      "id": "hohe-priesterin",
      "title": "Hohe Priesterin",
      "position": 7,
      "text": "Beaufsichtigt die rituellen Abläufe und religiöse Disziplin eines Tempels.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/6",
        "section": "Hierarchie"
      }
    },
    {
      "id": "priesterin",
      "title": "Priesterin",
      "position": 8,
      "text": "Führt tägliche Riten und Gebete durch und ist Ansprechpartnerin der Gläubigen.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/7",
        "section": "Hierarchie"
      }
    },
    {
      "id": "adept",
      "title": "Adept",
      "position": 9,
      "text": "Angehende Priesterin mit theoretischer und praktischer Ausbildung; die Quellenbezeichnung bleibt erhalten.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/8",
        "section": "Hierarchie"
      }
    },
    {
      "id": "novize",
      "title": "Novize",
      "position": 10,
      "text": "Beginnende Tempelausbildung in Glaubenslehre und Ritualen; die Quellenbezeichnung bleibt erhalten.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/9",
        "section": "Hierarchie"
      }
    },
    {
      "id": "schuelerin",
      "title": "Schülerin",
      "position": 11,
      "text": "Jüngstes Tempelmitglied in grundlegender geistlicher Erziehung.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/10",
        "section": "Hierarchie"
      }
    },
    {
      "id": "laie",
      "title": "Laie",
      "position": 12,
      "text": "Gläubiges Gemeindemitglied außerhalb der Tempelhierarchie; nimmt an Zeremonien teil und unterstützt den Tempel.",
      "source": {
        "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
        "pointer": "/hierarchy/entries/11",
        "section": "Hierarchie"
      }
    }
  ],
  "additionalRoles": [
    {
      "id": "clan-matriarch",
      "title": "Matriarchin",
      "text": "Oberhaupt eines Frauenclans. Die oberste Matriarchin der Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin; städtische Polemístriai und kleinere Hiéreiai bilden die weiteren adligen Clangruppen.",
      "source": {
        "path": "Vorschau/Klythesia/sources/lore-amendment-20261104.json",
        "section": "Weltliche Clanordnung"
      }
    }
  ],
  "conflicts": [
    {
      "id": "goddess-count",
      "type": "source-contradiction",
      "title": "Sieben benannte Göttinnen oder neun Nebengötter",
      "text": "Zusammenfassung und Katalog führen sieben Göttinnen; die Doktrin nennt an zwei Stellen neun Nebengötter. Zwei weitere Namen sind nicht belegt.",
      "sources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/summary",
          "section": "Übersicht"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/3",
          "section": "Doktrine"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/5",
          "section": "Doktrine"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/groups/1/entries",
          "section": "Die Göttinnen"
        }
      ],
      "handling": "Alle sieben belegten Namen erhalten; keine fehlenden Gottheiten ergänzen und keine bestehende Quelle still korrigieren."
    },
    {
      "id": "ancestor-name",
      "type": "name-variant",
      "title": "Ältere Schreibvariante Klytharion",
      "text": "Die ältere Bestandsaufnahme verzeichnete einmal Klytharion. Die aktuelle überarbeitete Matriarchatspassage verwendet Klytharios; die alte Variante bleibt als redaktioneller Herkunftsbeleg dokumentiert.",
      "sources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/groups/0/entries/0",
          "section": "Götterkatalog"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/5/blocks/0",
          "section": "Matriarchat"
        }
      ],
      "handling": "Keine zusätzliche Gottheit daraus machen."
    },
    {
      "id": "founder-current-status",
      "type": "open-chronology",
      "title": "Kyreons Lebenschronologie",
      "text": "Seine gegenwärtige Herrschaft ist festgelegt. Geburtsjahr, Alter und genaue Jahreszahlen des Aufstands wurden noch nicht bestimmt.",
      "sources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/1/blocks/2",
          "section": "Hintergrund"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/2/blocks/6",
          "section": "Doktrine"
        }
      ],
      "handling": "Keine Lebensdaten erfinden."
    },
    {
      "id": "enemy-veneration-language",
      "type": "wording-ambiguity",
      "title": "Tethron als Feindbild",
      "text": "Der Tethron-Abschnitt verwendet einmal das Wort verehrt, beschreibt aber unmittelbar seine Ablehnung. Der Katalog ordnet ihn ausdrücklich den Feindbildern zu.",
      "sources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/1",
          "section": "Tethron"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/4/blocks/4",
          "section": "Tethron"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/glaube.json",
          "pointer": "/groups/3",
          "section": "Die Feindbilder"
        }
      ],
      "handling": "Als abgelehntes göttliches Feindbild darstellen; daraus keinen positiv verehrten Kult ableiten."
    },
    {
      "id": "ritual-current-status",
      "type": "open-chronology",
      "title": "Zeitlicher und rechtlicher Stand überlieferter Tötungsrituale",
      "text": "Die Texte erwähnen Menschenopfer und ritualisierte Rachetötungen. Heutige Häufigkeit, rechtliche Geltung und zeitliche Grenzen sind nicht erläutert.",
      "sources": [
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/22",
          "section": "Kallistra"
        },
        {
          "path": "Religionen/religionen/zirkel-des-ewigen-waldes/eintrag.json",
          "pointer": "/sections/3/blocks/27",
          "section": "Klythara"
        }
      ],
      "handling": "Die vorhandenen Angaben weder verschweigen noch zu einem ausgearbeiteten heutigen Straf-, Opfer- oder Familienrecht erweitern."
    },
    {
      "id": "external-view",
      "type": "perspective-boundary",
      "title": "Phalantische Wertung ist Fremdsicht",
      "text": "Die Beurteilung als Ketzerei und als Umkehr patriarchaler Ordnung stammt aus der phalantischen Religionsquelle. Dort wird zugleich auf offene Kreuzzüge verzichtet.",
      "sources": [
        {
          "path": "Religionen/religionen/phalantischer-bund/eintrag.json",
          "pointer": "/sections/1/blocks/3",
          "section": "Hintergrund"
        },
        {
          "path": "Religionen/religionen/phalantischer-bund/eintrag.json",
          "pointer": "/sections/5/blocks/5",
          "section": "Gegenüber dem Zirkel des Ewigen Waldes"
        }
      ],
      "handling": "Als phalantische Position kennzeichnen; keine objektive Minderwertigkeit, heutige Kriegslage oder gemeinsame Staatsordnung daraus ableiten."
    }
  ]
};
export const CROSS_SOURCES = {
  "sources": [
    {
      "id": "stoicheia-current",
      "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
      "type": "Aktuelles öffentliches Spracharchiv",
      "section": "createStoicheiaModuleEntry()",
      "sha256": "66c4b6a08311d2a65e09bcc13634523b4401a7a95627d5dfaf31af029cc9cc02"
    },
    {
      "id": "stoicheia-data",
      "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
      "type": "Strukturierte Sprachquelle",
      "sha256": "885d547fc43b739b60faba29718bfdcff87d19eb4adca5e9e6efe0bf1a33aa6a"
    },
    {
      "id": "stoicheia-original",
      "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Quellen/Originalvorlage_Stoicheia.txt",
      "type": "Ursprüngliche Sprachvorlage; HTML-Inhalt in einer Textdatei",
      "sha256": "a23915bab61d934103b7e7a14fc70f21a8570848c8b8ed433c0c6f3dee663bf9"
    },
    {
      "id": "stoicheia-readme",
      "path": "Fonts/Stoicheia-Gesamtpaket-1.000/README.txt",
      "type": "Paketbeschreibung",
      "sha256": "945fd584f98527e91fd37d2f4b9bb8b77f10fa0ceb69480a69c4f5bc2782b82b"
    },
    {
      "id": "stoicheia-names",
      "path": "AleriaAlmanach/modules/name-list/name-list-data.js",
      "type": "Aktuelle Namensliste mit ausdrücklich dokumentierter Erweiterung",
      "section": "createStoicheiaNameListData()",
      "sha256": "e38fe1821ac0660b9f866021e318c0040ce39a88792edbbf7c6174a56358196e"
    },
    {
      "id": "xanathos-profile",
      "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
      "type": "Ausführliches öffentliches Bestiariumprofil",
      "sha256": "e403af999628541cc91240e57c074a013cfc14867acc8c3107bce30cd824913c"
    },
    {
      "id": "xanathos-market",
      "path": "Markt/Rossmarkt/Rossmarkt.html",
      "type": "Öffentliche Marktübersicht",
      "section": "horse-row[data-name=xanathos]",
      "sha256": "9decb5281d686b31ad6b202b9d2ba806dcfc9f9dd89a185bed92f587dbd46475"
    },
    {
      "id": "xanathos-context",
      "path": "Markt/Rossmarkt/kontext_pferde.md",
      "type": "Pferdekundliche Kontextquelle",
      "section": "TIRNARA / XANATHOS",
      "sha256": "c90f377f0348a01a65396ab3df52153c228f944d6c333cc3f9b56883937dd523"
    },
    {
      "id": "xanathos-list-card",
      "path": "Bestiarium/tiere/pferde/art.json",
      "type": "Kurze Bestiarium-Listenkarte",
      "pointer": "/atlas/groups/1/entries/3",
      "sha256": "f9eea9ee03810eb4431fb90c1e2d91cfa3100da8ea9f1c18238e6c0b23e280f9"
    },
    {
      "id": "phalantia-religion-comparison",
      "path": "Religionen/religionen/phalantischer-bund/index.html",
      "type": "Religionsarchiv; nur zur Abgrenzung ähnlicher Sprachüberlieferungen",
      "section": "gestalt-logara und Überlieferung / Logara – Gemahlin des Wissens",
      "sha256": "163e0e6251733a9f3cc6ebe880eca316d1909221d5a5468ace4bdee00a7dae9d"
    },
    {
      "path": "AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md",
      "note": "Neu abgeglichene Sprachgeschichte nach der Nutzerfestlegung.",
      "sha256": "fe395a4486e415011d28a75bac51440aa3d5231494fd9e5b8b862ef4d84a3c8f"
    }
  ],
  "facts": [
    {
      "id": "shared-language",
      "category": "Sprache",
      "title": "Stoicheia ist eine gemeinsame Sprache und Schrift",
      "text": "Stoicheia ist weiterhin die gemeinsame Sprache und Schrift Phalantias und Klythesias. Ihre Sprecher gehen auf die Aechanath zurück. Nach Zarakhuls aufgezwungener dunkler Sprache zerstreute Orin die Zungen der Unterjochten; deshalb ist die heutige Sprache kein ungebrochener albischer oder nordischer Dialekt. Die gemeinsame Sprache überdauerte Kyreons Befreiung der westlichen Städte.",
      "kind": "Sprachüberlieferung",
      "scope": "Gemeinsamer phalantisch-klythesischer Sprachraum",
      "source": {
        "path": "AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md",
        "section": "Stoicheia und Orins Zungenverwirrung"
      },
      "relatedSources": [
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/kulturen"
        }
      ],
      "limits": "Die Überlieferung der gesprochenen Sprache ist von der weitergegebenen Schriftlinie zu unterscheiden."
    },
    {
      "id": "script-lineage",
      "category": "Sprache",
      "title": "Tirnarische Schrifttradition",
      "text": "Stoicheia wird als vollalphabetischer Nachfolger des Kana’anith Süd-Tirnaras beschrieben. Das Kana’anith führt das Archiv auf die proto-albische Ogham-Tradition zurück. Die Ergänzung der Vokalzeichen und Neuordnung des Alphabets wird in dieser Quelle den Phalantiern zugeschrieben.",
      "kind": "Sprachüberlieferung",
      "scope": "Geschichte der gemeinsamen Schrift",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / Vom Kana’anith zum Stoicheia"
      },
      "limits": "Die Schriftabstammung belegt keine ausgearbeitete ethnische Abstammung, Gründungschronik oder frühere Staatsform Klythesias."
    },
    {
      "id": "script-form",
      "category": "Sprache",
      "title": "24 Zeichen, von links nach rechts",
      "text": "Das Vollalphabet umfasst 24 Zeichen von Alpha bis Omega und läuft horizontal von links nach rechts. Monumentale Formen werden auf Stelen, Toren und Waffen beschrieben; eine schnellere Schreibhand dient Verwaltung, Feldbefehlen und Unterricht.",
      "kind": "Sprachüberlieferung",
      "scope": "Gemeinsame Schriftpraxis",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / Die 24 Grundzeichen und writingDirection"
      },
      "relatedSources": [
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/alphabet"
        }
      ]
    },
    {
      "id": "sign-levels",
      "category": "Sprache",
      "title": "Körper, Geist und Polis",
      "text": "Ein Stoicheion besitzt Laut, Zeichenname und eine dreifache Bedeutung für Körper, Geist und Polis. Die Bedeutung hängt nach dem Archiv von Nachbarzeichen, Träger und Anlass ab. Alpha steht etwa für Ursprung, Kappa für Herrschaft, Pi für Stadt und Schutzwall und Omega für den bindenden Eid.",
      "kind": "Sprachüberlieferung",
      "scope": "Bedeutungslehre des Spracharchivs",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / Die 24 Grundzeichen; Körper, Geist & Polis"
      },
      "limits": "Dies beschreibt die überlieferte Zeichendeutung; daraus folgt keine eigenständig bewiesene magische Wirkung."
    },
    {
      "id": "rhemata",
      "category": "Sprache",
      "title": "Rhemata und Bedeutungsfelder",
      "text": "Das Sprachpaket enthält 37 bedeutungstragende Rhemata, zwölf Präfixe und zwölf Suffixe. Die Rhemata werden den fünf Sphären Ares, Polis, Kosmos, Physis und Demos zugeordnet; sie umfassen unter anderem Kampf, Gemeinschaft, Gesetz, Schicksal, Erde, Wasser, Abstammung und Wort.",
      "kind": "Sprachüberlieferung",
      "scope": "Gemeinsame Wortbildung",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / Die 37 Rhemata und Formenlehre & Wortbildung"
      },
      "relatedSources": [
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/rhemata"
        },
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/praefixe"
        },
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/suffixe"
        }
      ],
      "limits": "Ares, Polis und die übrigen Sphärennamen sind an dieser Stelle sprachliche Ordnungskategorien, keine zusätzlich festgelegten Gottheiten Klythesias."
    },
    {
      "id": "morphology",
      "category": "Sprache",
      "title": "Belegte Namens- und Wortendungen",
      "text": "Dokumentierte Formen sind unter anderem -os für einen männlichen Träger, -ia für eine weibliche Trägerin, -ides für Sohn oder Nachkomme, -ios für die Zugehörigkeit zu einer Linie, -ion für Institution oder Handlung und -archos für einen führenden Amtsträger. Präfixbeispiele sind amphi-, anti-, dia-, hyper-, hypo- und meta-.",
      "kind": "Sprachüberlieferung",
      "scope": "Sprachliche Formen, keine Landesverfassung",
      "source": {
        "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
        "pointer": "/suffixe",
        "section": "Ergänzend /praefixe"
      },
      "limits": "Diese Formen bestimmen weder die tatsächlichen Adelsränge noch Erbfolge, Geschlechterrollen oder offizielle Amtstitel Klythesias."
    },
    {
      "id": "names-corpus",
      "category": "Namen",
      "title": "Vorhandener gemeinsamer Namensvorrat",
      "text": "Das Originalpaket enthält hundert männliche und hundert weibliche Namensformen. Die aktuelle Almanachliste erweitert diesen Bestand auf insgesamt 400 Namen und kennzeichnet die Erweiterung ausdrücklich als Kombination dokumentierter Rhemata, Präfixe und Endungen. Beispielsweise sind Aros, Arion, Arides, Aria, Areia und Arandra bereits im strukturierten Originalpaket enthalten.",
      "kind": "Sprachüberlieferung",
      "scope": "Phalantisch-klythesische Namenbeispiele",
      "source": {
        "path": "AleriaAlmanach/modules/name-list/name-list-data.js",
        "section": "createStoicheiaNameListData() / introduction, groups und footer"
      },
      "relatedSources": [
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/namen_maennlich"
        },
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
          "pointer": "/namen_weiblich"
        },
        {
          "path": "Fonts/Stoicheia-Gesamtpaket-1.000/README.txt",
          "section": "Umfang des Gesamtpakets"
        }
      ],
      "limits": "Diese Beispiele sind keine belegten historischen Personen, Adelshäuser oder exklusiv klythesischen Geschlechter. Auch Alkathon, Nyktheos und Polysthen im aktuellen Spracharchiv bleiben Sprachbeispiele."
    },
    {
      "id": "naming-tradition",
      "category": "Sprache",
      "title": "Namen als Bindung an eine Bestimmung",
      "text": "Das Spracharchiv beschreibt Namen als Aussagen über eine mögliche Bestimmung. Viele Krieger wählen darin später selbst einen Namen; die Namens- und Zeichenregeln erscheinen außerdem in Gebeten, Eiden und Warnungen auf Waffen und Feldzeichen.",
      "kind": "Sprachüberlieferung",
      "scope": "Gemeinsame Sprach- und Kriegstradition",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / Namen, Krieg & gebundene Zukunft"
      },
      "limits": "Eine allgemeine Praxis aller Klythesier, konkrete Einführungsriten, Kriegerklassen oder eine klythesische Agoge werden hierdurch nicht festgelegt."
    },
    {
      "id": "athara-language-legend",
      "category": "Überlieferung",
      "title": "Die Athara-Legende des Spracharchivs",
      "text": "Die sprachliche Gründungslegende nennt Athara als Göttin von Weisheit, Krieg und gerechter Ordnung. Sie soll dem ersten Nomophylax auf einem Schlachtfeld die wahren Zeichenbedeutungen offenbart haben. Nomophylakes bewahren darin Recht und Ritual; Grammateis deuten Namen, schreiben Eide und prüfen Zeichenfolgen.",
      "kind": "Sprachüberlieferung",
      "scope": "Ausdrücklich als Legende formulierte Sprachüberlieferung",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite I / description; Seite II / Athara & der erste Nomophylax"
      },
      "limits": "Nicht stillschweigend in die aktuelle Landesreligion einfügen oder Athara mit Logara beziehungsweise Grammateis mit Grammatici gleichsetzen."
    },
    {
      "id": "lexical-examples",
      "category": "Sprache",
      "title": "Vorhandene Begriffe für das spätere Sprachmodul",
      "text": "Das hundert Wörter umfassende Originallexikon führt beispielsweise Polis = Stadtstaat, Nomos = Gesetz, Bouleion = Ratshaus, Demosia = Bürgerschaft, Kriterion = Gericht, Nomophylax = Gesetzeshüter und Omegion = Eidesurkunde. Archon steht im Lexikon für Amtsherr und Strategos für Heerführer.",
      "kind": "Sprachüberlieferung",
      "scope": "Gemeinsames Lexikon",
      "source": {
        "path": "Fonts/Stoicheia-Gesamtpaket-1.000/Daten/Stoicheia_Daten_1.0.json",
        "pointer": "/lexikon",
        "section": "Einträge 0–10"
      },
      "limits": "Wörter für Institutionen sind kein Beleg, dass genau diese Ämter, Gerichte oder Verwaltungsstufen derzeit in Klythesia bestehen."
    },
    {
      "id": "language-region-context",
      "category": "Geografie",
      "title": "Südliche Stadtstaaten und Küstenpoleis",
      "text": "Als Sprachräume nennt das Archiv südliche Stadtstaaten, Küstenpoleis sowie klythesische Herrschaftsräume und Kolonien.",
      "kind": "Sprachüberlieferung",
      "scope": "Breite geografische Einordnung aus dem Spracharchiv",
      "source": {
        "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
        "section": "createStoicheiaModuleEntry() / Seite II / language.regions"
      },
      "limits": "Keine Kolonie ist hier benannt oder datiert. Daraus keine genaue Kolonialgeschichte, Grenzverläufe, Stadtverfassung oder konkreten Besitzungen ergänzen."
    },
    {
      "id": "tirnara-region",
      "category": "Geografie",
      "title": "Klythesia im südwestlichen Tirnara-Kontext",
      "text": "Die Rossmarktübersicht nennt Galadorn, Klythesia und Phalantia gemeinsam als Heimat des Xanathos und ordnet diese Herkunft Südwest-Tirnara zu. Das ausführliche Bestiariumprofil nennt Tirnara als Kontinent.",
      "kind": "Weltwissen",
      "scope": "Regionaler pferdekundlicher Herkunftshinweis",
      "source": {
        "path": "Markt/Rossmarkt/Rossmarkt.html",
        "section": "horse-row[data-name=xanathos] / col-origin"
      },
      "relatedSources": [
        {
          "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
          "pointer": "/continent"
        },
        {
          "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
          "pointer": "/region"
        }
      ],
      "limits": "Gemeinsame Herkunftsräume einer Pferderasse beweisen keine konkrete gemeinsame Grenze oder politische Bindung zwischen diesen Ländern."
    },
    {
      "id": "warm-dry-landstrips",
      "category": "Land",
      "title": "Warme, trockene Herkunftsgebiete des Xanathos",
      "text": "Das Bestiarium beschreibt die Heimat des Xanathos als warme, trockene Landstriche Galadorns, Klythesias und Phalantias. Die Zucht wird mit Feldarbeit, Wagenzügen und Steinbrüchen verbunden.",
      "kind": "Weltwissen",
      "scope": "Bestimmte Herkunftslandstriche und regionale Arbeitsnutzung",
      "source": {
        "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
        "pointer": "/sections/1/blocks/0/text",
        "section": "ursprung"
      },
      "limits": "Nicht das gesamte Land als trockenes Agrar- oder Steinbruchland beschreiben. Die Quelle enthält keine landesweite Klima-, Vegetations- oder Rohstoffkarte."
    },
    {
      "id": "xanathos-workhorse",
      "category": "Alltag und Wirtschaft",
      "title": "Ein belegtes Arbeits- und Zugpferd",
      "text": "Der Xanathos ist ein kräftiges, ausdauerndes Arbeitspferd mit hoher Zugleistung und geringer Geschwindigkeit und Wendigkeit. Sein Detailprofil beschreibt ihn als ruhig, geduldig, arbeitswillig und zuverlässig. In den südwestlichen Regionen Tirnaras ist er eng mit der arbeitenden Bevölkerung verbunden.",
      "kind": "Weltwissen",
      "scope": "Rassebeschreibung und regionaler Alltag",
      "source": {
        "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
        "pointer": "/summary",
        "section": "Ergänzend sections / koerperbau und temperament"
      },
      "relatedSources": [
        {
          "path": "Markt/Rossmarkt/Rossmarkt.html",
          "section": "horse-row[data-name=xanathos] / horse-desc"
        }
      ],
      "limits": "Der Xanathos ist kein exklusiv klythesisches Nationaltier und seine Zucht ist keinem belegten klythesischen Haus zugeordnet."
    },
    {
      "id": "regional-transport",
      "category": "Alltag und Wirtschaft",
      "title": "Landwirtschaft, Wagen und Lastentransport",
      "text": "Als Einsatz des Xanathos sind schwere Wagen, Pflügen sowie der Transport von Stein, Erz und Handelswaren belegt. Das Profil nennt Bauern, Händler und Fuhrleute als typische Nutzer und beschreibt die Rasse als Rückgrat von Landwirtschaft, Handel und Transport im Südwesten Tirnaras.",
      "kind": "Weltwissen",
      "scope": "Regionale Transport- und Arbeitskultur",
      "source": {
        "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
        "section": "summary; sections / nutzung-einsatz und haltung-pflege",
        "pointer": "/sections/4"
      },
      "relatedSources": [
        {
          "path": "Markt/Rossmarkt/kontext_pferde.md",
          "section": "XANATHOS / Haupteinsatz und Lore"
        }
      ],
      "limits": "Keine konkreten Exportmengen, Zünfte, Besitzrechte, Steuern, Minen oder Handelsrouten Klythesias sind hier festgelegt."
    },
    {
      "id": "horse-cavalry-limit",
      "category": "Militärischer Quellenkontext",
      "title": "Begrenzte Aussage zur Reiterei",
      "text": "Das Xanathos-Profil erwähnt gelegentliche pragmatische Kavallerienutzung dort, wo andere Pferde fehlen. Wegen geringer Geschwindigkeit und Wendigkeit ist die Rasse ausdrücklich nicht für Elitekavallerie geeignet. Der Rossmarkt beschreibt Sarkal als bevorzugte Alternative erfahrener Reiter.",
      "kind": "Weltwissen",
      "scope": "Allgemeine Rasseneignung",
      "source": {
        "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
        "section": "sections / nutzung-einsatz und staerken-schwaechen",
        "pointer": "/sections/4"
      },
      "relatedSources": [
        {
          "path": "Markt/Rossmarkt/Rossmarkt.html",
          "section": "horse-row[data-name=xanathos] / horse-desc"
        }
      ],
      "limits": "Keine klythesische Kriegerklasse, reguläre Kavallerieordnung oder verbindliche Landespräferenz für Sarkal oder Shahzad daraus ableiten."
    }
  ],
  "conflicts": [
    {
      "id": "athara-logara-and-scribes",
      "title": "Athara / Logara und Grammateis / Grammatici nicht glätten",
      "text": "Das gemeinsame Spracharchiv überliefert Athara, den ersten Nomophylax, Nomophylakes und Grammateis. Das Religionsarchiv des Phalantischen Bundes nennt dagegen Logara und Grammatici als Schreiber-Priester. Die Texte bieten verwandte Motive von Gesetz, Namen und Schrift, dokumentieren aber keine Gleichsetzung dieser Namen oder Institutionen.",
      "sources": [
        {
          "path": "AleriaAlmanach/modules/language/language-reference-entries.js",
          "section": "createStoicheiaModuleEntry() / Athara & der erste Nomophylax"
        },
        {
          "path": "Religionen/religionen/phalantischer-bund/index.html",
          "section": "Überlieferung / Logara – Gemahlin des Wissens"
        }
      ],
      "handling": "Als verschiedene vorhandene Überlieferungen kennzeichnen. Keine neue Gleichsetzung, religiöse Reform oder historische Erklärung erfinden; nicht ungeprüft auf den Zirkel des Ewigen Waldes übertragen."
    },
    {
      "id": "xanathos-card-versus-profile",
      "title": "Abweichende Xanathos-Kurzbeschreibung",
      "text": "Die kurze Pferde-Listenkarte nennt ein stolzes, muskulöses Reit- und Wagenpferd mit goldenen Fellfarben und eindrucksvoller Haltung. Das ausführliche Profil und der Rossmarkt schildern dagegen vor allem ein langsames, wenig prestigeträchtiges Arbeits- und Zugpferd. Eine goldene Fellfarbe wird im ausführlichen Text nicht eigens bestätigt.",
      "sources": [
        {
          "path": "Bestiarium/tiere/pferde/art.json",
          "pointer": "/atlas/groups/1/entries/3/description"
        },
        {
          "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
          "section": "summary; sections / staerken-schwaechen und haltung-pflege"
        },
        {
          "path": "Markt/Rossmarkt/Rossmarkt.html",
          "section": "horse-row[data-name=xanathos] / horse-desc"
        }
      ],
      "handling": "Für den knappen Landesüberblick nur die von Detailprofil und Markt gemeinsam gestützte Arbeitsnutzung verwenden. Die abweichende Listenkarte bleibt als offene redaktionelle Quellenabweichung erhalten."
    },
    {
      "id": "horse-context-spelling-and-currency",
      "title": "Älterer Pferdekontext weicht bei Schreibweise und Preiswährung ab",
      "text": "Der Kontexttext nennt Galadom und 500–4.000 Taler. Detailprofil und Marktübersicht nennen Galadorn; das Detailprofil setzt denselben Zahlenbereich in Kupferstücken an. Diese Abweichung ist keine Grundlage für eine klythesische Landeswährung.",
      "sources": [
        {
          "path": "Markt/Rossmarkt/kontext_pferde.md",
          "section": "XANATHOS / Herkunft und Kosten"
        },
        {
          "path": "Bestiarium/tiere/pferde/xanathos/profil.json",
          "pointer": "/market/price"
        },
        {
          "path": "Markt/Rossmarkt/Rossmarkt.html",
          "section": "horse-row[data-name=xanathos]"
        }
      ],
      "handling": "Keine Landeswährung aus diesen Pferdepreisen bestimmen; den Preis für die Landesvorbereitung auslassen."
    }
  ],
  "openQuestions": [
    {
      "id": "named-people-and-houses",
      "title": "Clanvorschläge und persönliche Oberhäupter",
      "text": "Sieben neue Clannamen mit Wappen und Stadtsitzen sind vorgeschlagen. Persönliche Matriarchinnen, Stammbäume und weitere kleine Häuser sind noch nicht ausgearbeitet."
    },
    {
      "id": "borders-and-colonies",
      "title": "Grenzen und Kolonien",
      "text": "Die gemeinsame Vergangenheit mit Phalantia und die Abspaltung der westlichen Städte sind festgelegt. Konkrete innere Grenzen und die früher nur allgemein erwähnten Kolonien bleiben unbenannt und undatiert."
    },
    {
      "id": "tradition-versus-history",
      "title": "Überlieferung und Landesgeschichte getrennt halten",
      "text": "Die Athara-Erzählung, die beispielhafte Namensgebung eines Strategen und der Eid vor der Polis sind religiös-sprachliche beziehungsweise illustrative Erzählungen. Sie ergeben keine datierte klythesische Landesgeschichte."
    }
  ],
  "sourceNotes": [
    "Das ursprüngliche Stoicheia-Paket enthält 200 Namen; die aktuelle 400er-Liste dokumentiert ihre Erweiterung ausdrücklich. Dies ist eine nachvollziehbare Erweiterung und kein ungeklärter Zahlenwiderspruch.",
    "Vier Tetrades und fünf Rhemata-Sphären sind unterschiedliche Ordnungen im aktuellen Archiv; sie werden nicht als identische Zahlensysteme dargestellt. Die ältere Bezeichnung der Tetrades als Vierergruppen wird hier nicht zur künstlichen Neugruppierung der 24 Zeichen verwendet.",
    "Der Xanathos-Eintrag im Charakterarchiv ist eine Pferderasse im Bereich roesser, keine namensgleiche menschliche Person.",
    "Zuchtbuch, erzeugte Gegenstandsdefinitionen, Marktregister und Charakterarchiv wiederholen die Pferdeinformationen überwiegend. Solche technischen Duplikate zählen nicht als unabhängige weitere Überlieferungen.",
    "Die regionale Herkunft einer Pferderasse belegt keine konkrete klythesische Handelsroute, Grenznachbarschaft oder Zuchtfamilie.",
    "Das Stoicheia-Zitat über Name, Schicksal und Krieg ist im Archiv ausdrücklich phalantischer Überlieferung zugeschrieben. Auch der Xanathos-Fuhrmannsspruch wird als phalantisch bezeichnet; beide werden nicht zu exklusiv klythesischen Sprichwörtern umetikettiert.",
    "Religion, mitgelieferte Landkarte und sieben Bilddateien werden durch andere Teile der Vorbereitung ausgewertet. Aus Dateinamen wie Hydra, Mantikor, Phönix, Satyr oder Sphinx wird in dieser Evidenzdatei kein Haus oder Ort erschaffen.",
    "Laerelis_Vorschau_Einzeldatei.html lieferte nur einen technischen Rohtexttreffer, aber keinen sichtbaren Klythesia-Loretext. Dieser Treffer wird nicht als Weltquelle verwendet."
  ]
};
