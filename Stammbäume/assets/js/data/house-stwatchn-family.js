import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "muiredach-founder-stwatchn",
    "tamsin-unknown-stwatchn-0-1",
    "senan-founder-stwatchn",
    "tomaltach-founder-stwatchn",
    "unbekannte-unknown-stwatchn-10-2",
    "draighean-unknown-stwatchn-10-3",
    "gadhra-1581-stwatchn",
    "tamsin-stwatchn",
    "scathach-1584-diuid",
    "galahad-blaidd",
    "muiredach-1605-stwatchn",
    "wunbhna-1609-stwatchn",
    "seumas-1612-stwatchn",
    "fiadh-1608-laga",
    "janneth-1606-dundas",
    "sinead-1614-roich",
    "earcan-1626-stwatchn",
    "hailidhe-1632-stwatchn",
    "gilleasbuig-1632-stwatchn",
    "laoise-1630-fastaigh",
    "dallan-1628-urquhart",
    "mairead-1634-ness",
    "aonghus-1648-stwatchn",
    "niamhasas-1653-stwatchn",
    "laoiseach-stwatchn",
    "lughaidh-1655-stwatchn",
    "scathach-1650-drummond",
    "taraig-1659-ceallaigh",
    "talamhan-laoch",
    "jenadhe-1655-eoghainn",
    "muiredach-1668-stwatchn",
    "niamhe-stwatchn",
    "hiolair-1675-stwatchn",
    "harailt-1677-stwatchn",
    "ciorstaidh-1682-stwatchn",
    "ruaidh-1672-gealan",
    "cardoc-dinefwr",
    "orlaith-1678-urquhart",
    "alannah-1678-luthsach",
    "ruaidhrigh-1680-chulainn",
    "whelan-1692-stwatchn",
    "neidhe-1695-stwatchn",
    "seumas-1700-stwatchn",
    "kenneth-1706-stwatchn",
    "searach-1697-stwatchn",
    "fergus-1700-stwatchn",
    "aine-1704-stwatchn",
    "siofra-1698-dundas",
    "ninnidh-1690-magach",
    "nora-1704-rieach",
    "fiona-1703-fiorghra",
    "unbekannte-unknown-stwatchn-70-11",
    "ysolde-unknown-stwatchn-70-12",
    "murchadh-1703-lachlann",
    "gadhra-1717-stwatchn",
    "tamsin-1720-stwatchn",
    "earcan-1723-stwatchn",
    "nairn-1726-stwatchn",
    "aonghus-1723-stwatchn",
    "catriona-1727-stwatchn",
    "art-1727-lockart",
    "senan-1722-stwatchn",
    "griana-1725-stwatchn",
    "lugh-1724-stwatchn",
    "jiana-1727-stwatchn",
    "voil-1733-stwatchn",
    "brina-1736-stwatchn"
  ],
  "partnershipIds": [
    "marriage-muiredach-founder-stwatchn--tamsin-unknown-stwatchn-0-1",
    "marriage-senan-founder-stwatchn--unbekannte-unknown-stwatchn-10-2",
    "marriage-draighean-unknown-stwatchn-10-3--tomaltach-founder-stwatchn",
    "marriage-gadhra-1581-stwatchn--scathach-1584-diuid",
    "marriage-galahad-tamsin-blaidd",
    "marriage-fiadh-1608-laga--muiredach-1605-stwatchn",
    "marriage-janneth-1606-dundas--wunbhna-1609-stwatchn",
    "marriage-seumas-1612-stwatchn--sinead-1614-roich",
    "marriage-earcan-1626-stwatchn--laoise-1630-fastaigh",
    "marriage-dallan-1628-urquhart--hailidhe-1632-stwatchn",
    "marriage-gilleasbuig-1632-stwatchn--mairead-1634-ness",
    "marriage-aonghus-1648-stwatchn--scathach-1650-drummond",
    "marriage-niamhasas-1653-stwatchn--taraig-1659-ceallaigh",
    "marriage-talamhan-laoiseach",
    "marriage-jenadhe-1655-eoghainn--lughaidh-1655-stwatchn",
    "marriage-muiredach-1668-stwatchn--ruaidh-1672-gealan",
    "marriage-cardoc-niamhe-dinefwr",
    "marriage-hiolair-1675-stwatchn--orlaith-1678-urquhart",
    "marriage-alannah-1678-luthsach--harailt-1677-stwatchn",
    "marriage-ciorstaidh-1682-stwatchn--ruaidhrigh-1680-chulainn",
    "marriage-siofra-1698-dundas--whelan-1692-stwatchn",
    "marriage-neidhe-1695-stwatchn--ninnidh-1690-magach",
    "marriage-nora-1704-rieach--seumas-1700-stwatchn",
    "marriage-fiona-1703-fiorghra--searach-1697-stwatchn",
    "marriage-fergus-1700-stwatchn--unbekannte-unknown-stwatchn-70-11",
    "affair-fergus-1700-stwatchn--ysolde-unknown-stwatchn-70-12",
    "marriage-aine-1704-stwatchn--murchadh-1703-lachlann"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-muiredach-founder-stwatchn--tamsin-unknown-stwatchn-0-1",
      "childIds": [
        "senan-founder-stwatchn",
        "tomaltach-founder-stwatchn"
      ],
      "timeJumpId": "gap-faelaorn-stwatchn-founders"
    },
    {
      "partnershipId": "marriage-senan-founder-stwatchn--unbekannte-unknown-stwatchn-10-2",
      "childIds": [
        "gadhra-1581-stwatchn",
        "tamsin-stwatchn"
      ],
      "timeJumpId": "gap-faelaorn-stwatchn-senan"
    },
    {
      "partnershipId": "marriage-gadhra-1581-stwatchn--scathach-1584-diuid",
      "childIds": [
        "muiredach-1605-stwatchn",
        "wunbhna-1609-stwatchn",
        "seumas-1612-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-fiadh-1608-laga--muiredach-1605-stwatchn",
      "childIds": [
        "earcan-1626-stwatchn",
        "hailidhe-1632-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-seumas-1612-stwatchn--sinead-1614-roich",
      "childIds": [
        "gilleasbuig-1632-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-earcan-1626-stwatchn--laoise-1630-fastaigh",
      "childIds": [
        "aonghus-1648-stwatchn",
        "niamhasas-1653-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-gilleasbuig-1632-stwatchn--mairead-1634-ness",
      "childIds": [
        "laoiseach-stwatchn",
        "lughaidh-1655-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-1648-stwatchn--scathach-1650-drummond",
      "childIds": [
        "muiredach-1668-stwatchn",
        "niamhe-stwatchn",
        "hiolair-1675-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-jenadhe-1655-eoghainn--lughaidh-1655-stwatchn",
      "childIds": [
        "harailt-1677-stwatchn",
        "ciorstaidh-1682-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-muiredach-1668-stwatchn--ruaidh-1672-gealan",
      "childIds": [
        "whelan-1692-stwatchn",
        "neidhe-1695-stwatchn",
        "seumas-1700-stwatchn",
        "kenneth-1706-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-hiolair-1675-stwatchn--orlaith-1678-urquhart",
      "childIds": [
        "searach-1697-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-alannah-1678-luthsach--harailt-1677-stwatchn",
      "childIds": [
        "fergus-1700-stwatchn",
        "aine-1704-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-siofra-1698-dundas--whelan-1692-stwatchn",
      "childIds": [
        "gadhra-1717-stwatchn",
        "tamsin-1720-stwatchn",
        "earcan-1723-stwatchn",
        "nairn-1726-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-nora-1704-rieach--seumas-1700-stwatchn",
      "childIds": [
        "aonghus-1723-stwatchn",
        "catriona-1727-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-fiona-1703-fiorghra--searach-1697-stwatchn",
      "childIds": [
        "senan-1722-stwatchn",
        "griana-1725-stwatchn"
      ]
    },
    {
      "partnershipId": "marriage-fergus-1700-stwatchn--unbekannte-unknown-stwatchn-70-11",
      "childIds": [
        "lugh-1724-stwatchn",
        "jiana-1727-stwatchn"
      ]
    },
    {
      "partnershipId": "affair-fergus-1700-stwatchn--ysolde-unknown-stwatchn-70-12",
      "childIds": [
        "voil-1733-stwatchn",
        "brina-1736-stwatchn"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-galahad-tamsin-blaidd",
      "targetFamilyId": "haus-blaidd",
      "houseId": "house-blaidd"
    },
    {
      "partnershipId": "marriage-janneth-1606-dundas--wunbhna-1609-stwatchn",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-dallan-1628-urquhart--hailidhe-1632-stwatchn",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-niamhasas-1653-stwatchn--taraig-1659-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-talamhan-laoiseach",
      "targetFamilyId": "haus-ruin-ua-laoch",
      "houseId": "house-laoch"
    },
    {
      "partnershipId": "marriage-cardoc-niamhe-dinefwr",
      "targetFamilyId": "haus-dinefwr",
      "houseId": "house-dinefwr"
    },
    {
      "partnershipId": "marriage-ciorstaidh-1682-stwatchn--ruaidhrigh-1680-chulainn",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-neidhe-1695-stwatchn--ninnidh-1690-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-aine-1704-stwatchn--murchadh-1703-lachlann",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-draighean-unknown-stwatchn-10-3--tomaltach-founder-stwatchn",
      "targetFamilyId": "haus-dundas"
    }
  ],
  "wards": [
    {
      "personId": "nairn-1726-stwatchn",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "art-1727-lockart",
      "parentId": "seumas-1700-stwatchn"
    }
  ],
  "heads": [],
  "titles": {},
  "personRoles": {
    "voil-1733-stwatchn": "bastard",
    "brina-1736-stwatchn": "bastard",
    "ysolde-unknown-stwatchn-70-12": "affair",
    "art-1727-lockart": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Ausschließlich nach der gelieferten Stwatchn-Grafik, ergänzt um eindeutig gleiche Gegenpersonen. Zwei Punktreihen markieren Überlieferungslücken. Senans namenlose Eheperson und Fergus’ namenlose Eheperson (*1704) sind tatsächlich mit Paar-/Kinderlinien dargestellt; ihre Namen und Herkunft bleiben offen. Ysolde ist Fergus’ Affäre; Voil und Brina gehören nur zu dieser Verbindung. Art Lockart ist aufgenommenes Mündel, Nairn an Ceallaigh fortgegeben. Fehlende Todesjahre bleiben unbekannt.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ru Stwatchn ist der alte Dun-Tiarna-Clan von Invercalda in Tir na Rann und Vasall der Urquhart. Die überlieferte Grafik führt seinen Ursprung auf Muiredach und Tamsin zurück; mehrere frühe Generationen fehlen. Aus Tomaltach Stwatchn und Draighean ging Dundas hervor. Weitere Ehen verbinden beide Linien bis in die jüngsten Generationen. Ein heutiges Oberhaupt ist in der Grafik nicht ausdrücklich benannt. Die alte Zuordnung bleibt während des Krieges mit Skjaerheim und der Teilbesetzung Faelaorns erhalten.",
  "warriorReference": ""
});

export const HOUSE_STWATCHN_FAMILY = createFaelaornSourceFamily("stwatchn", SOURCE);
