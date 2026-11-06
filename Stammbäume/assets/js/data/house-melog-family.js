// Generated only by assets/data/source-inventories/melog-20261105/import-family.mjs --emit.
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';

export const MELOG_EMBLEM = "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Melog/melog-emblem.png";
export const MELOG_HOUSE_PROFILE = Object.freeze(createHouseProfileFromFolderPath(
  ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'],
  { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig', regionEmblems: {
    seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats.Gwynthor,
    barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies['Llamreis Ankunft'],
    county: CELTIGERNS_WACHT_REGION_EMBLEMS.county, kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom
  } }
));

export const HOUSE_MELOG_FAMILY = Object.freeze({
  "schema": "aleria.family-tree",
  "schemaVersion": 1,
  "document": {
    "id": "melog",
    "title": "Familie Melog",
    "motto": "",
    "description": "Alteingesessene Cenyri-Bäcker- und Konditorfamilie aus Gwynthor, Betreiber der Bäckerei und Konditorei „Zum Honigtörtchen“. Die gelieferte Genealogie führt die Familie von einem unbekannten Gründerpaar über eine Überlieferungslücke bis Ithel, Tewdwr und deren Nachkommen.",
    "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Melog/melog-emblem.png",
    "houseProfile": MELOG_HOUSE_PROFILE
  },
  "persons": [
    {
      "id": "melog-gruender",
      "worldPersonId": "person--melog--melog-gruender",
      "name": "Unbekannter Gründer",
      "title": "Gründer des Hauses",
      "sex": "male",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "melog-gruenderin",
      "worldPersonId": "person--melog--melog-gruenderin",
      "name": "Unbekannte Gründerin",
      "title": "Gründerin des Hauses",
      "sex": "female",
      "status": "alive",
      "birth": "",
      "death": "",
      "portrait": "",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "married",
      "lineageRole": "branch",
      "tags": [
        "Gründerfamilie"
      ],
      "notes": "",
      "extensions": {}
    },
    {
      "id": "person-29ef1c22",
      "worldPersonId": "person--melog--person-29ef1c22",
      "name": "Ithel",
      "title": "Konditormeister/Bäckereimeister/Oberhaupt",
      "sex": "male",
      "status": "dead",
      "birth": "1647",
      "death": "1723",
      "portrait": "assets/images/portraits/melog/person-29ef1c22.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "head",
      "tags": [],
      "notes": "Ithel rettete 1690 gemeinsam mit seinem fünfzehnjährigen Sohn Tewdwr in der Hofküche von Castell Draig die Hochzeitstorte für Meurig Draig und Heledd Gwyvern. Als Dank erhielt er das silberne Draig-Tortenmesser, das heute in der Konditorei ausgestellt wird.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/SC1usoA.png"
          ]
        }
      }
    },
    {
      "id": "person-aaae3c9f",
      "worldPersonId": "person--melog--person-aaae3c9f",
      "name": "Tangwystl",
      "title": "",
      "sex": "female",
      "status": "alive",
      "birth": "1648",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-aaae3c9f.png",
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
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/nVbEyeu.png"
          ]
        }
      }
    },
    {
      "id": "person-0c68dade",
      "worldPersonId": "person--melog--person-0c68dade",
      "name": "Tewdwr",
      "title": "Konditormeister/Bäckereimeister/Oberhaupt",
      "sex": "male",
      "status": "alive",
      "birth": "1675",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-0c68dade.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "head",
      "tags": [],
      "notes": "Tewdwr half seinem Vater Ithel 1690 als Fünfzehnjähriger bei der geretteten Hochzeitstorte für Meurig Draig und Heledd Gwyvern. Heute führt er die Bäckerei und Konditorei „Zum Honigtörtchen“ und bewahrt die Rezeptur.",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/aKa4udv.png"
          ]
        },
        "workplaceModuleId": "zum-honigtoertchen"
      }
    },
    {
      "id": "person-30cd0b46",
      "worldPersonId": "person--melog--person-30cd0b46",
      "name": "Morfudd",
      "title": "Buchhaltung/Finanzen",
      "sex": "female",
      "status": "alive",
      "birth": "1679",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-30cd0b46.png",
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
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/LghmPH7.png"
          ]
        }
      }
    },
    {
      "id": "person-a5530d07",
      "worldPersonId": "person--melog--person-a5530d07",
      "name": "Anest",
      "title": "Konditor/Bäckereimeisterin",
      "sex": "female",
      "status": "alive",
      "birth": "1701",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-a5530d07.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/gl3g1rX.png"
          ]
        }
      }
    },
    {
      "id": "person-9ffeda8d",
      "worldPersonId": "person--melog--person-9ffeda8d",
      "name": "Afanen",
      "title": "Verkaufsleitung",
      "sex": "female",
      "status": "alive",
      "birth": "1697",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-9ffeda8d.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait",
          "birth"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2,
          "birth": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/heJvo0O.png"
          ],
          "birth": [
            "1705"
          ]
        },
        "sourceAmendment": {
          "revision": 1,
          "birthBefore": "1705",
          "birthAfter": "1697",
          "reason": "Lleufer bleibt als junger Erwachsener bei 1716. Afanen ist dann bei seiner Geburt etwa 19 statt 11 Jahre alt. Bei Afanens Geburt sind Tewdwr etwa 22 und Morfudd 18 Jahre alt. Afanen steht damit als ältere Schwester neben Anest; die Quellenreihenfolge definiert keine Geburtsrangfolge."
        }
      }
    },
    {
      "id": "person-a24c0d08",
      "worldPersonId": "person--melog--person-a24c0d08",
      "name": "Guto",
      "title": "Bäcker/Naschkatze",
      "sex": "male",
      "status": "alive",
      "birth": "1710",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-a24c0d08.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/wlCNPB3.png"
          ]
        }
      }
    },
    {
      "id": "person-d9df75d6",
      "worldPersonId": "person--melog--person-d9df75d6",
      "name": "Eiffion",
      "title": "Einkauf und Lieferungen",
      "sex": "male",
      "status": "alive",
      "birth": "1698",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-d9df75d6.png",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/YYKDL1Z.png"
          ]
        }
      }
    },
    {
      "id": "person-d32c2160",
      "worldPersonId": "person--melog--person-d32c2160",
      "name": "Llywarch",
      "title": "Verkauf und Gästebetreuung / Mablis Bruder",
      "sex": "male",
      "status": "alive",
      "birth": "1696",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-d32c2160.png",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait",
          "birth"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2,
          "birth": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/WeT2fIK.png"
          ],
          "birth": [
            "1704"
          ]
        },
        "sourceAmendment": {
          "revision": 1,
          "birthBefore": "1704",
          "birthAfter": "1696",
          "reason": "Llywarch ist bei Lleufers Geburt etwa 20 statt 12 Jahre alt. Sein Erwachsenenportrait und die Tätigkeit im Verkauf bleiben stimmig. Die Schwester Mabli behält ihr Jahr 1712."
        }
      }
    },
    {
      "id": "person-d5f1d52b",
      "worldPersonId": "person--melog--person-d5f1d52b",
      "name": "Mabli",
      "title": "Verpackung und Einkauf / Llywarchs Schwester",
      "sex": "female",
      "status": "alive",
      "birth": "1712",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-d5f1d52b.png",
      "portraitPlaceholder": "auto",
      "houseId": "",
      "familyRole": "married",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/1S1nLMo.png"
          ]
        }
      }
    },
    {
      "id": "person-5b669286",
      "worldPersonId": "person--melog--person-5b669286",
      "name": "Nerys",
      "title": "Chaos-Konditorin",
      "sex": "female",
      "status": "alive",
      "birth": "1722",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-5b669286.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/jKdyd4K.png"
          ]
        }
      }
    },
    {
      "id": "person-c6293356",
      "worldPersonId": "person--melog--person-c6293356",
      "name": "Elisedd",
      "title": "Begabtes Allroundtalent",
      "sex": "male",
      "status": "alive",
      "birth": "1725",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-c6293356.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/b3wj8RZ.png"
          ]
        }
      }
    },
    {
      "id": "person-02518ead",
      "worldPersonId": "person--melog--person-02518ead",
      "name": "Teleri",
      "title": "kleine Schauspielerin",
      "sex": "female",
      "status": "alive",
      "birth": "1730",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-02518ead.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/roykT1U.png"
          ]
        }
      }
    },
    {
      "id": "person-9a399999",
      "worldPersonId": "person--melog--person-9a399999",
      "name": "Lleufer",
      "title": "eitler Charmeur",
      "sex": "male",
      "status": "alive",
      "birth": "1716",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-9a399999.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/KfkFWY1.jpeg"
          ]
        }
      }
    },
    {
      "id": "person-4c366307",
      "worldPersonId": "person--melog--person-4c366307",
      "name": "Cerys",
      "title": "eingebildete geschäftstüchtige Händlerin",
      "sex": "female",
      "status": "alive",
      "birth": "1731",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-4c366307.png",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "Cerys übt sich schon als Kind im Rechnen, Feilschen und Aushandeln kleiner Geschäfte. Ihre selbstbewussten Händlerambitionen gehören zum Familienleben; die Verantwortung für den Laden tragen die Erwachsenen.",
      "extensions": {
        "registryManagedFields": [
          "portrait",
          "birth"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2,
          "birth": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/JCDAWof.png"
          ],
          "birth": [
            "1721"
          ]
        },
        "sourceAmendment": {
          "revision": 1,
          "birthBefore": "1721",
          "birthAfter": "1731",
          "reason": "Das gelieferte Portrait zeigt deutlich ein kleines Mädchen am Schreibpult. Cerys ist im Weltjahr 1740 etwa neun. Afanen und Llywarch sind bei ihrer Geburt etwa 34 und 35; ihre geschäftstüchtigen Ambitionen sind ein kindlicher Charakterzug, keine eigenständige berufliche Ladenführung."
        }
      }
    },
    {
      "id": "person-157c1853",
      "worldPersonId": "person--melog--person-157c1853",
      "name": "Iddon",
      "title": "Klein-Guto / Naschkatze",
      "sex": "male",
      "status": "alive",
      "birth": "1732",
      "death": "",
      "portrait": "assets/images/portraits/melog/person-157c1853.jpg",
      "portraitPlaceholder": "auto",
      "houseId": "house-melog",
      "familyRole": "core",
      "lineageRole": "mainline",
      "tags": [],
      "notes": "",
      "extensions": {
        "registryManagedFields": [
          "portrait",
          "birth"
        ],
        "registryManagedFieldRevisions": {
          "portrait": 2,
          "birth": 2
        },
        "registryManagedFieldPreviousValues": {
          "portrait": [
            "https://i.imgur.com/BT8Ng2b.jpeg"
          ],
          "birth": [
            "1722"
          ]
        },
        "sourceAmendment": {
          "revision": 1,
          "birthBefore": "1722",
          "birthAfter": "1732",
          "reason": "Das gelieferte Portrait zeigt einen kleinen Jungen mit Gebäck. Iddon ist im Weltjahr 1740 etwa acht. Guto und Mabli sind bei seiner Geburt etwa 22 und 20 statt 12 und 10 Jahre alt. Seine Bezeichnung Klein-Guto und Naschkatze bleibt erhalten."
        }
      }
    }
  ],
  "partnerships": [
    {
      "id": "marriage-melog-founders",
      "participantIds": [
        "melog-gruender",
        "melog-gruenderin"
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
      "id": "partnership-14ddf9e7",
      "participantIds": [
        "person-29ef1c22",
        "person-aaae3c9f"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignParentPairOverChildPersonId": "person-0c68dade",
        "chartAutomaticSingleChildAlignment": true
      }
    },
    {
      "id": "partnership-e0399a8b",
      "participantIds": [
        "person-0c68dade",
        "person-30cd0b46"
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
      "id": "partnership-0dc76571",
      "participantIds": [
        "person-a5530d07",
        "person-d9df75d6"
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
      "id": "partnership-88fa1c34",
      "participantIds": [
        "person-9ffeda8d",
        "person-d32c2160"
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
      "id": "partnership-db44bb8b",
      "participantIds": [
        "person-a24c0d08",
        "person-d5f1d52b"
      ],
      "type": "marriage",
      "status": "active",
      "start": "",
      "end": "",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {
        "chartAlignParentPairOverChildPersonId": "person-157c1853",
        "chartAutomaticSingleChildAlignment": true
      }
    }
  ],
  "parentages": [
    {
      "id": "parentage-195f7400",
      "childId": "person-29ef1c22",
      "parentIds": [
        "melog-gruender",
        "melog-gruenderin"
      ],
      "partnershipId": "marriage-melog-founders",
      "type": "claimed",
      "legitimacy": "unknown",
      "certainty": "probable",
      "visibility": "public",
      "notes": "Nach einem Zeitsprung wieder belegte Linie.",
      "extensions": {
        "timeJumpId": "time-jump-2a7d8560",
        "timeJumpCreated": true
      }
    },
    {
      "id": "parentage-3cf320c5",
      "childId": "person-0c68dade",
      "parentIds": [
        "person-29ef1c22",
        "person-aaae3c9f"
      ],
      "partnershipId": "partnership-14ddf9e7",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-c0557c42",
      "childId": "person-a5530d07",
      "parentIds": [
        "person-0c68dade",
        "person-30cd0b46"
      ],
      "partnershipId": "partnership-e0399a8b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-457440cc",
      "childId": "person-9ffeda8d",
      "parentIds": [
        "person-0c68dade",
        "person-30cd0b46"
      ],
      "partnershipId": "partnership-e0399a8b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-b4e7ac40",
      "childId": "person-a24c0d08",
      "parentIds": [
        "person-0c68dade",
        "person-30cd0b46"
      ],
      "partnershipId": "partnership-e0399a8b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-bb06ff72",
      "childId": "person-5b669286",
      "parentIds": [
        "person-a5530d07",
        "person-d9df75d6"
      ],
      "partnershipId": "partnership-0dc76571",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-a97a7fd7",
      "childId": "person-c6293356",
      "parentIds": [
        "person-a5530d07",
        "person-d9df75d6"
      ],
      "partnershipId": "partnership-0dc76571",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-acd1bf3b",
      "childId": "person-02518ead",
      "parentIds": [
        "person-a5530d07",
        "person-d9df75d6"
      ],
      "partnershipId": "partnership-0dc76571",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-5030889b",
      "childId": "person-9a399999",
      "parentIds": [
        "person-9ffeda8d",
        "person-d32c2160"
      ],
      "partnershipId": "partnership-88fa1c34",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-b4bfb8b0",
      "childId": "person-4c366307",
      "parentIds": [
        "person-9ffeda8d",
        "person-d32c2160"
      ],
      "partnershipId": "partnership-88fa1c34",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    },
    {
      "id": "parentage-fe58ad59",
      "childId": "person-157c1853",
      "parentIds": [
        "person-a24c0d08",
        "person-d5f1d52b"
      ],
      "partnershipId": "partnership-db44bb8b",
      "type": "biological",
      "legitimacy": "legitimate",
      "certainty": "confirmed",
      "visibility": "public",
      "notes": "",
      "extensions": {}
    }
  ],
  "houses": [
    {
      "id": "house-melog",
      "name": "Melog",
      "motto": "",
      "emblem": "assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Melog/melog-emblem.png",
      "status": "active",
      "extensions": {
        "registryManagedFields": [
          "emblem"
        ],
        "registryManagedFieldRevisions": {
          "emblem": 2
        },
        "registryManagedFieldPreviousValues": {
          "emblem": [
            "https://i.imgur.com/hIUiXnp.jpeg"
          ]
        }
      }
    }
  ],
  "cadetBranches": [],
  "timeJumps": [
    {
      "id": "time-jump-2a7d8560",
      "parentPartnershipId": "marriage-melog-founders",
      "sharedParentPartnershipIds": [],
      "parentPersonId": "",
      "childIds": [
        "person-29ef1c22"
      ],
      "years": 0,
      "fromYear": "",
      "toYear": "1647",
      "label": "",
      "notes": "",
      "extensions": {}
    }
  ],
  "lineage": {
    "founderPartnershipId": "marriage-melog-founders",
    "houseId": "house-melog",
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
    "focusPersonId": "melog-gruender",
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
    "sourceRevision": 2,
    "blankFamily": false,
    "sourceDocumentId": "melog",
    "sourceInventory": "assets/data/source-inventories/melog-20261105/inventory.json",
    "chartLayoutPolicy": "strict-v1",
    "sourceAmendment": "assets/data/source-inventories/melog-20261105/source-amendment.json",
    "sourceAmendmentRevision": 1,
    "registryManagedDocumentFields": [
      "emblem"
    ],
    "registryManagedDocumentFieldRevisions": {
      "emblem": 2
    },
    "registryManagedHouseProfileFields": [
      "rankId",
      "seat",
      "barony",
      "county",
      "kingdom",
      "liegeHouseId",
      "liegeHouseName",
      "regionEmblems"
    ],
    "registryManagedHouseProfileFieldRevisions": {
      "rankId": 2,
      "seat": 2,
      "barony": 2,
      "county": 2,
      "kingdom": 2,
      "liegeHouseId": 2,
      "liegeHouseName": 2,
      "regionEmblems": 2
    },
    "registryManagedExtensionFields": [
      "registry",
      "sourceInventory",
      "sourceDocumentId",
      "sourceAmendment",
      "sourceAmendmentRevision",
      "blankFamily"
    ],
    "registryManagedExtensionFieldRevisions": {
      "registry": 2,
      "sourceInventory": 2,
      "sourceDocumentId": 2,
      "sourceAmendment": 2,
      "sourceAmendmentRevision": 2,
      "blankFamily": 2
    },
    "sourceNote": "Vollständige Nutzer-JSON vom 5.11.2026; alle 18 Personen, Weltpersonen-IDs, Beziehungen, Lebensstatus, Gründer und Zeitsprung erhalten. Vier Geburtsjahre sind nach ausdrücklicher Nutzerfreigabe „korrigiere das logisch“ anhand der Generationenfolge und gelieferten Portraits berichtigt; das separate Quellenamendment erhält Originalwerte und Begründung. Bilder lokal bytegleich übernommen; Ortsprofil und Hausgeschichte aus geliefertem HTML ergänzt. Gelieferte Gründerplatzhalter und ihre Statuswerte werden nicht als neu erfundene Personen umgedeutet."
  }
});
