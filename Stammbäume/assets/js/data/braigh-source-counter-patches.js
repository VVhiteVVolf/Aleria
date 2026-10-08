// Nur ausdrücklich abgeglichene Gegenfelder; bestehende lokale Genealogie bleibt erhalten.
export const BRAIGH_SOURCE_COUNTER_PATCHES = Object.freeze({
  "haus-sturmgeborene": {
    "revision": 3,
    "collections": {
      "persons": {
        "aoife-grannd": {
          "houseId": "house-grannd",
          "portrait": "assets/images/portraits/haus-grannd/aoife-grannd.png"
        }
      }
    },
    "additionalHouses": [
      {
        "id": "house-grannd",
        "name": "Clan Na Grannd",
        "motto": "",
        "emblem": "assets/images/houses/Faelaorn/clan-grannd.png",
        "status": "active"
      }
    ]
  },
  "haus-wellenschild": {
    "revision": 3,
    "collections": {
      "persons": {
        "ciara-macborthwick": {
          "name": "Ciara Borthwick",
          "houseId": "house-borthwick",
          "portrait": "assets/images/portraits/haus-borthwick/ciara-macborthwick.png"
        }
      }
    },
    "additionalHouses": [
      {
        "id": "house-borthwick",
        "name": "Haus Borthwick",
        "motto": "",
        "emblem": "",
        "status": "active"
      }
    ]
  },
  "haus-blutstahl": {
    "revision": 4,
    "collections": {
      "persons": {
        "rangrid-blutstahl": {
          "death": "1700"
        },
        "vionnan-culloch": {
          "birth": "1644",
          "death": "1712",
          "portrait": "assets/images/portraits/haus-culloch/vionnan-culloch.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-an-morchoe": {
    "revision": 4,
    "collections": {
      "persons": {
        "gabhan-borthwick": {
          "birth": "1652",
          "death": "1734",
          "portrait": "assets/images/portraits/haus-borthwick/gabhan-borthwick.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-casur": {
    "revision": 6,
    "collections": {
      "persons": {
        "jathghal-1651-culloch": {
          "portrait": "assets/images/portraits/haus-culloch/jathghal-1651-culloch.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-morna": {
    "revision": 4,
    "collections": {
      "persons": {
        "neasa-1709-culloch": {
          "portrait": "assets/images/portraits/haus-culloch/neasa-1709-culloch.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-tartarfhuil": {
    "revision": 4,
    "collections": {
      "persons": {
        "loinneog-1675-culloch": {
          "portrait": "assets/images/portraits/haus-culloch/loinneog-1675-culloch.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-bhaird": {
    "revision": 3,
    "collections": {
      "persons": {
        "julbhach-1648-erskine": {
          "death": "1724"
        },
        "hurracan-1649-culloch": {
          "death": "1715"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-lachlann": {
    "revision": 4,
    "collections": {
      "persons": {
        "uidhir-1652-erskine": {
          "death": "1724",
          "portrait": "assets/images/portraits/haus-erskine/uidhir-1652-erskine.png"
        },
        "keitha-1660-borthwick": {
          "death": "1735"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-lockart": {
    "revision": 3,
    "collections": {
      "persons": {
        "ronnat-1723-lockart": {
          "familyRole": "ward-away"
        }
      }
    },
    "additionalHouses": [
      {
        "id": "house-culloch",
        "name": "Mac Culloch",
        "motto": "",
        "emblem": "assets/images/houses/Faelaorn/clan-culloch.png",
        "status": "active"
      }
    ],
    "wardLinks": [
      {
        "personId": "ronnat-1723-lockart",
        "familyId": "haus-culloch",
        "houseId": "house-culloch",
        "name": "Mac Culloch",
        "emblem": "assets/images/houses/Faelaorn/clan-culloch.png"
      }
    ]
  },
  "haus-haig": {
    "revision": 3,
    "collections": {
      "persons": {
        "gobaith-1722-haig": {
          "familyRole": "ward-away"
        },
        "fiadh-1727-haig": {
          "familyRole": "ward-away"
        }
      }
    },
    "additionalHouses": [
      {
        "id": "house-culloch",
        "name": "Mac Culloch",
        "motto": "",
        "emblem": "assets/images/houses/Faelaorn/clan-culloch.png",
        "status": "active"
      },
      {
        "id": "house-borthwick",
        "name": "Tir An Borthwick",
        "motto": "",
        "emblem": "assets/images/houses/Faelaorn/clan-borthwick.png",
        "status": "active"
      }
    ],
    "wardLinks": [
      {
        "personId": "gobaith-1722-haig",
        "familyId": "haus-culloch",
        "houseId": "house-culloch",
        "name": "Mac Culloch",
        "emblem": "assets/images/houses/Faelaorn/clan-culloch.png"
      },
      {
        "personId": "fiadh-1727-haig",
        "familyId": "haus-borthwick",
        "houseId": "house-borthwick",
        "name": "Tir An Borthwick",
        "emblem": "assets/images/houses/Faelaorn/clan-borthwick.png"
      }
    ]
  },
  "haus-illygoden": {
    "revision": 6,
    "collections": {
      "persons": {
        "darragh-culloch": {
          "portrait": "assets/images/portraits/haus-culloch/darragh-culloch.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-drewi": {
    "revision": 3,
    "collections": {
      "persons": {
        "talulah-erskine": {
          "portrait": "assets/images/portraits/haus-erskine/talulah-erskine.png"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-balauric": {
    "revision": 3,
    "collections": {
      "partnerships": {
        "marriage-eivyonydd-balauric--keebh-grannd": {
          "status": "ended"
        }
      }
    },
    "additionalHouses": []
  },
  "haus-morlais": {
    "revision": 4,
    "collections": {
      "partnerships": {
        "marriage-caomhog-culloch--gallgoid-morlais": {
          "status": "ended"
        }
      }
    },
    "additionalHouses": []
  }
});
