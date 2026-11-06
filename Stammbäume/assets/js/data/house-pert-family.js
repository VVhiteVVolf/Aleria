// Generated only by assets/data/source-inventories/pert-20261106/import-source.mjs.
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';

export const PERT_EMBLEM = "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pert/pert-emblem.png";
export const PERT_HOUSE_PROFILE = Object.freeze(createHouseProfileFromFolderPath(
  ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
  { rankId: 'commoner', secondarySeats: ['Hof Maesglas'], liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig', regionEmblems: {
    seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor, barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],
    county: CELTIGERNS_WACHT_REGION_EMBLEMS.county, kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom
  } }
));

export const HOUSE_PERT_FAMILY = Object.freeze({
  "schema": "aleria.family-tree",
  "schemaVersion": 1,
  "document": {
    "id": "pert",
    "title": "Familie Pert",
    "motto": "",
    "description": "Bürgerliche Cenyri-Familie aus Gwynthor: Dienst auf Castell Draig und Landwirtschaft auf Hof Maesglas. Die gelieferte Genealogie enthält 19 Personen, einen seriellen Überlieferungssprung und zwei fortgeführte Familienzweige.",
    "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pert/pert-emblem.png",
    "houseProfile": PERT_HOUSE_PROFILE
  },
  "persons": [
    {
      "id": "pert-gruender",
      "worldPersonId": "person--pert--pert-gruender",
      "name": "Unbekannter Gründer",
      "title": "Gründer des Hauses",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "pert-gruenderin",
      "worldPersonId": "person--pert--pert-gruenderin",
      "name": "Unbekannte Gründerin",
      "title": "Gründerin des Hauses",
      "sex": "female",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-cde44b00",
      "worldPersonId": "person--pert--person-cde44b00",
      "name": "Iorwerth",
      "title": "Brotmeister Haus Draig",
      "sex": "male",
      "status": "dead",
      "birth": "1666",
      "death": "1715",
      "portrait": "assets/images/portraits/pert/person-cde44b00.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "head",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/Qurtomy.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-02756f76",
      "worldPersonId": "person--pert--person-02756f76",
      "name": "Idwal",
      "title": "Heiratete die Erbin eines Hofes",
      "sex": "male",
      "status": "alive",
      "birth": "1670",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-02756f76.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/WspFLiD.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-e6511832",
      "worldPersonId": "person--pert--person-e6511832",
      "name": "Gwerfyl",
      "title": "Küchenmeisterin Haus Draig",
      "sex": "female",
      "status": "alive",
      "birth": "1668",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-e6511832.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/Av2LpHt.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-dcc5c8f4",
      "worldPersonId": "person--pert--person-dcc5c8f4",
      "name": "Mared Maesglas",
      "title": "Letzte Überlebende Haus Maesglas",
      "sex": "female",
      "status": "dead",
      "birth": "1672",
      "death": "1724",
      "portrait": "assets/images/portraits/pert/person-dcc5c8f4.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/AdZEWev.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-1f86b441",
      "worldPersonId": "person--pert--person-1f86b441",
      "name": "Goronvy",
      "title": "Draig Leibgarde",
      "sex": "male",
      "status": "dead",
      "birth": "1692",
      "death": "1720",
      "portrait": "assets/images/portraits/pert/person-1f86b441.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "Die Hausprosa schreibt Goronwy; die genealogische JSON nennt dieselbe Person Goronvy. Die genealogische Schreibweise bleibt maßgeblich, Goronwy ist als Quellvariante dokumentiert. Goronvy und Lowri fielen nach der Hausgeschichte 1720 im Krieg gegen Ceitheach.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/JcUIF1G.png"
          ]
        },
        "sourceNameVariants": [
          "Goronwy"
        ]
      }
    },
    {
      "id": "person-ab6f684c",
      "worldPersonId": "person--pert--person-ab6f684c",
      "name": "Lowri",
      "title": "Draig Leibgarde",
      "sex": "female",
      "status": "dead",
      "birth": "1695",
      "death": "1720",
      "portrait": "assets/images/portraits/pert/person-ab6f684c.png",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/vYM0YGc.png"
          ]
        }
      }
    },
    {
      "id": "person-4506547d",
      "worldPersonId": "person--pert--person-4506547d",
      "name": "Geraint",
      "title": "Hofbesitzer",
      "sex": "male",
      "status": "alive",
      "birth": "1697",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-4506547d.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "Geraint und Bethan bewirtschaften Hof Maesglas und nahmen Kevan nach dem Tod seiner Eltern bei sich auf. Diese Betreuung verändert seine belegte biologische Abstammung nicht. Geraint und Donnchadh teilen dasselbe gelieferte Portrait, bleiben aber verschiedene Personen.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/v48lzfy.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-4ee10c57",
      "worldPersonId": "person--pert--person-4ee10c57",
      "name": "Sioned",
      "title": "Kümmert sich ums Vieh",
      "sex": "female",
      "status": "alive",
      "birth": "1705",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-4ee10c57.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/BpF9s6o.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-cada9cd4",
      "worldPersonId": "person--pert--person-cada9cd4",
      "name": "Bethan",
      "title": "Haushalt",
      "sex": "female",
      "status": "alive",
      "birth": "1698",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-cada9cd4.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/tkuEN4M.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-35fdbd7b",
      "worldPersonId": "person--pert--person-35fdbd7b",
      "name": "Donnchadh",
      "title": "Stallmeister Hof",
      "sex": "male",
      "status": "alive",
      "birth": "1705",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-35fdbd7b.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "affair",
      "lineageRole": "branch",
      "tags": [],
      "notes": "Donnchadh ist nach der Hausgeschichte ceitheachischer Herkunft und betreut Pferde und Stallungen auf Hof Maesglas. Er ist Sioneds Lebensgefährte; die JSON führt die Verbindung als affair. Die biologische Vaterschaft von Roísin ist nicht belegt. Dasselbe gelieferte Portrait wie Geraint begründet keine Identitätsgleichheit.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/v48lzfy.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-52becf61",
      "worldPersonId": "person--pert--person-52becf61",
      "name": "Kevan",
      "title": "Waffenknecht Haus Draig",
      "sex": "male",
      "status": "alive",
      "birth": "1716",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-52becf61.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "Kevan ist in der gelieferten JSON Sohn von Goronvy und Lowri, Enkel von Iorwerth und Gwerfyl. Nach dem Tod der Eltern 1720 wuchs er nach der Hausgeschichte bei Geraint und Bethan auf Hof Maesglas auf. Eine ältere gleichnamige Draig-Gardistenakte mit demselben Portrait nennt andere Großeltern; diese nicht genealogisch verknüpfte Laufzeitakte bleibt unverändert und ist im Quelleninventar als Gegenquellenkonflikt festgehalten.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/Sl4ntci.png"
          ]
        }
      }
    },
    {
      "id": "person-3a869794",
      "worldPersonId": "person--pert--person-3a869794",
      "name": "Rhiain",
      "title": "Brotmeister Haus Draig",
      "sex": "female",
      "status": "alive",
      "birth": "1719",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-3a869794.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "Die genealogische JSON setzt sex auf unknown. Die Hausgeschichte verwendet ausdrücklich „Rhiain bei ihrer Großmutter Gwerfyl“; diese weibliche Textreferenz ist als gesonderte Quellenentscheidung dokumentiert. Rhiain wuchs nach dem Tod der Eltern bei Gwerfyl auf Castell Draig auf.",
      "extensions": {
        "registryManagedFields": [
          "portrait",
          "sex"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1,
          "sex": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/JeVgEMi.jpeg"
          ],
          "sex": [
            "unknown"
          ]
        }
      }
    },
    {
      "id": "person-da2c039f",
      "worldPersonId": "person--pert--person-da2c039f",
      "name": "Goleuddydd",
      "title": "Besessen von Kevan",
      "sex": "female",
      "status": "alive",
      "birth": "1722",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-da2c039f.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/naBDQc6.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-f61ee33a",
      "worldPersonId": "person--pert--person-f61ee33a",
      "name": "Lleian",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1725",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-f61ee33a.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/E0yZUaO.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-cf926021",
      "worldPersonId": "person--pert--person-cf926021",
      "name": "Canna",
      "title": "",
      "sex": "unknown",
      "status": "alive",
      "birth": "1729",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-cf926021.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "Geschlecht in der genealogischen JSON unknown und im gelieferten Fließtext nicht eindeutig benannt; keine Festlegung aus Name oder Portrait.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/QKyLPWV.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-96cdce72",
      "worldPersonId": "person--pert--person-96cdce72",
      "name": "Iolo",
      "title": "Hoferbe",
      "sex": "male",
      "status": "alive",
      "birth": "1735",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-96cdce72.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/jCSIngI.png"
          ]
        }
      }
    },
    {
      "id": "person-618119d8",
      "worldPersonId": "person--pert--person-618119d8",
      "name": "Roísin",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1732",
      "death": "",
      "portrait": "assets/images/portraits/pert/person-618119d8.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-pert",
      "familyRole": "bastard",
      "lineageRole": "branch",
      "tags": [],
      "notes": "Die gelieferte biologische Elternschaft nennt ausschließlich Sioned und bleibt legitimized. Donnchadhs Beziehung zu Sioned belegt keine Vaterschaft; es wird kein zweiter Elternteil ergänzt.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 1
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/7dCupHk.png"
          ]
        }
      }
    }
  ],
  "partnerships": [
    {
      "id": "marriage-pert-founders",
      "participantIds": [
        "pert-gruender",
        "pert-gruenderin"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "Gründerehe des Hauses.",
      "extensions": {}
    },
    {
      "id": "partnership-1e3804e3",
      "participantIds": [
        "person-cde44b00",
        "person-e6511832"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignParentPairOverChildPersonId": "person-1f86b441",
        "chartAutomaticSingleChildAlignment": true
      }
    },
    {
      "id": "partnership-136532a8",
      "participantIds": [
        "person-02756f76",
        "person-dcc5c8f4"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "partnership-09698f2f",
      "participantIds": [
        "person-1f86b441",
        "person-ab6f684c"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignChildGroupBelowParentPair": true
      }
    },
    {
      "id": "partnership-92b8bf6b",
      "participantIds": [
        "person-4506547d",
        "person-cada9cd4"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignChildGroupBelowParentPair": true
      }
    },
    {
      "id": "partnership-c9b9af53",
      "participantIds": [
        "person-4ee10c57",
        "person-35fdbd7b"
      ],
      "type": "affair",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    }
  ],
  "parentages": [
    {
      "id": "parentage-e05356b3",
      "childId": "person-cde44b00",
      "parentIds": [
        "pert-gruender",
        "pert-gruenderin"
      ],
      "partnershipId": "marriage-pert-founders",
      "type": "claimed",
      "legitimacy": "unknown",
      "certainty": "probable",
      "visibility": "public",
      "notes": "Nach einem Zeitsprung wieder belegte Linie.",
      "extensions": {
        "timeJumpId": "time-jump-263f82a7",
        "timeJumpCreated": true
      }
    },
    {
      "id": "parentage-3a23333b",
      "childId": "person-02756f76",
      "parentIds": [
        "pert-gruender",
        "pert-gruenderin"
      ],
      "partnershipId": "marriage-pert-founders",
      "type": "claimed",
      "legitimacy": "unknown",
      "certainty": "probable",
      "visibility": "public",
      "notes": "Nach einem Zeitsprung wieder belegte Linie.",
      "extensions": {
        "timeJumpId": "time-jump-263f82a7",
        "timeJumpCreated": true
      }
    },
    {
      "id": "parentage-01f4b83f",
      "childId": "person-1f86b441",
      "parentIds": [
        "person-cde44b00",
        "person-e6511832"
      ],
      "partnershipId": "partnership-1e3804e3",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-2bea3806",
      "childId": "person-4506547d",
      "parentIds": [
        "person-02756f76",
        "person-dcc5c8f4"
      ],
      "partnershipId": "partnership-136532a8",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-c40ba269",
      "childId": "person-4ee10c57",
      "parentIds": [
        "person-02756f76",
        "person-dcc5c8f4"
      ],
      "partnershipId": "partnership-136532a8",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-c4107b9c",
      "childId": "person-52becf61",
      "parentIds": [
        "person-1f86b441",
        "person-ab6f684c"
      ],
      "partnershipId": "partnership-09698f2f",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-dadfe8d9",
      "childId": "person-3a869794",
      "parentIds": [
        "person-1f86b441",
        "person-ab6f684c"
      ],
      "partnershipId": "partnership-09698f2f",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-9496a147",
      "childId": "person-da2c039f",
      "parentIds": [
        "person-4506547d",
        "person-cada9cd4"
      ],
      "partnershipId": "partnership-92b8bf6b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-0e6fc1e8",
      "childId": "person-f61ee33a",
      "parentIds": [
        "person-4506547d",
        "person-cada9cd4"
      ],
      "partnershipId": "partnership-92b8bf6b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-579c9cb5",
      "childId": "person-cf926021",
      "parentIds": [
        "person-4506547d",
        "person-cada9cd4"
      ],
      "partnershipId": "partnership-92b8bf6b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-a18626d1",
      "childId": "person-96cdce72",
      "parentIds": [
        "person-4506547d",
        "person-cada9cd4"
      ],
      "partnershipId": "partnership-92b8bf6b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-61abde43",
      "childId": "person-618119d8",
      "parentIds": [
        "person-4ee10c57"
      ],
      "partnershipId": "",
      "type": "biological",
      "legitimacy": "legitimized",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    }
  ],
  "houses": [
    {
      "id": "house-pert",
      "name": "Pert",
      "motto": "",
      "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pert/pert-emblem.png",
      "status": "active",
      "extensions": {
        "registryManagedFields": [
          "emblem"
        ],
        "registryManagedFieldRevisions": {
          "emblem": 1
        },
        "registryManagedFieldPreviousValues": {
          "emblem": [
            "https://i.imgur.com/sv5YYGS.jpeg"
          ]
        }
      }
    }
  ],
  "cadetBranches": [],
  "timeJumps": [
    {
      "id": "time-jump-263f82a7",
      "parentPartnershipId": "marriage-pert-founders",
      "sharedParentPartnershipIds": [],
      "parentPersonId": "",
      "childIds": [
        "person-cde44b00",
        "person-02756f76"
      ],
      "years": 0,
      "fromYear": "",
      "toYear": "",
      "label": "",
      "notes": "",
      "extensions": {}
    }
  ],
  "lineage": {
    "founderPartnershipId": "marriage-pert-founders",
    "houseId": "house-pert",
    "crestSubtitle": "",
    "crestEmblemScale": 0.86,
    "crestFrame": "gold",
    "crestFrameScale": 1,
    "timeGap": {
      "enabled": false,
      "years": 0,
      "fromYear": "",
      "toYear": "",
      "label": ""
    },
    "originHouse": {
      "enabled": false,
      "id": "lineage-origin-house",
      "houseId": "",
      "name": "Ursprungshaus",
      "subtitle": "",
      "emblem": "",
      "emblemScale": 0.86,
      "crestFrame": "gold",
      "frameScale": 1,
      "childIds": [],
      "targetFamilyId": "",
      "notes": "",
      "timeGap": {
        "enabled": false,
        "years": 0,
        "fromYear": "",
        "toYear": "",
        "label": ""
      }
    }
  },
  "presentation": {
    "relationshipColors": {
      "marriage": "#326c4a",
      "engagement": "#b88b37",
      "union": "#8e2724",
      "affair": "#704485",
      "concubinage": "#704485",
      "political": "#9d7d48",
      "forced": "#c7a974",
      "biological": "#8e2724",
      "adoptive": "#2f75a8",
      "foster": "#2f75a8",
      "step": "#7eb4d7",
      "magical": "#704485",
      "claimed": "#62615e"
    }
  },
  "view": {
    "focusPersonId": "pert-gruender",
    "orientation": "vertical",
    "ancestorDepth": 8,
    "descendantDepth": 8,
    "limitGenerations": false,
    "showSiblings": true
  },
  "extensions": {
    "registry": {
      "folderPath": [
        "Cenyr",
        "Celtigerns Wacht",
        "Llamreis Ankunft",
        "Gwynthor"
      ],
      "unclassified": false
    },
    "generatorProfile": {
      "origin": "Gwynthor",
      "culture": "Cenyri",
      "religion": "Alerische Kirche",
      "governance": "",
      "foundingYear": "",
      "founderHouseName": "",
      "houseColors": "",
      "specialTraits": ""
    },
    "blankFamily": false,
    "sourceRevision": 1,
    "chartLayoutPolicy": "strict-v1",
    "sourceDocumentId": "pert",
    "sourceInventory": "assets/data/source-inventories/pert-20261106/inventory.json",
    "sourceDecisions": "assets/data/source-inventories/pert-20261106/source-decisions.json",
    "sourceNote": "Genealogie aus der vollständig erhaltenen Nutzer-JSON; Hausgeschichte aus separat erhaltener HTML. Alle IDs, Beziehungen, Lebensdaten, Legitimierungen und der Quellenzeitsprung bleiben erhalten. Quellenvarianten, unbestimmte Felder, das geteilte Portrait und die widersprechende ältere Kevan-Laufzeitprosa sind im Inventar dokumentiert.",
    "registryManagedDocumentFields": [
      "emblem"
    ],
    "registryManagedDocumentFieldRevisions": {
      "emblem": 1
    },
    "registryManagedHouseProfileFields": [
      "rankId",
      "seat",
      "barony",
      "county",
      "kingdom",
      "secondarySeats",
      "liegeHouseId",
      "liegeHouseName",
      "regionEmblems"
    ],
    "registryManagedExtensionFields": [
      "registry",
      "sourceDocumentId",
      "sourceInventory",
      "sourceDecisions",
      "blankFamily"
    ]
  }
});
