import { createBraighSourceFamily } from './braigh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "goirtin-founder-borthwick",
    "sorcha-unknown-borthwick-91-0",
    "donnacha-1581-borthwick",
    "eilidh-1584-borthwick",
    "dechtire-1585-erskine",
    "callum-1580-culloch",
    "nechtan-1605-borthwick",
    "doirind-1608-borthwick",
    "gearoid-1610-borthwick",
    "hoireabard-1609-grannd",
    "diarmuid-1610-boyd",
    "uallach-1611-lasgair",
    "donnacha-1627-borthwick",
    "sorcha-borthwick",
    "vannoch-1629-borthwick",
    "noracha-1628-roich",
    "jowaneth-wivern",
    "kalia-1633-cairbre",
    "goirtin-1646-borthwick",
    "nasuada-borthwick",
    "gabhan-borthwick",
    "keitha-1660-borthwick",
    "iarbhine-1648-culloch",
    "conway-trachwyll",
    "oideach-mochoe",
    "murchadh-1657-lachlann",
    "gearoid-1668-borthwick",
    "ciara-macborthwick",
    "deaglan-1677-borthwick",
    "keilon-1675-borthwick",
    "whelan-1675-borthwick",
    "peadhra-1669-boyd",
    "tjelvar-wellenschild",
    "treabha-1678-muirin",
    "caireann-1675-grannd",
    "donnacha-1691-borthwick",
    "kelch-1696-borthwick",
    "dervla-1700-borthwick",
    "nechtan-1696-borthwick",
    "uisdean-1697-borthwick",
    "eideard-1701-borthwick",
    "jilleen-1697-cairge",
    "breccan-1697-culloch",
    "dechtire-1700-reannachain",
    "kunigunde-1710-falkert",
    "toirche-1700-durachd",
    "fothradh-1700-erskine",
    "sorcha-1718-borthwick",
    "torin-1723-borthwick",
    "fiadh-1727-haig",
    "haelan-1722-borthwick",
    "eann-1726-borthwick",
    "gundula-1728-borthwick",
    "ivo-1734-borthwick",
    "vannoch-1723-borthwick",
    "vaila-1724-borthwick",
    "vear-1729-borthwick"
  ],
  "partnershipIds": [
    "marriage-goirtin-founder-borthwick--sorcha-unknown-borthwick-91-0",
    "marriage-dechtire-1585-erskine--donnacha-1581-borthwick",
    "marriage-callum-1580-culloch--eilidh-1584-borthwick",
    "marriage-hoireabard-1609-grannd--nechtan-1605-borthwick",
    "marriage-diarmuid-1610-boyd--doirind-1608-borthwick",
    "marriage-gearoid-1610-borthwick--uallach-1611-lasgair",
    "marriage-donnacha-1627-borthwick--noracha-1628-roich",
    "marriage-jowaneth-sorcha-wivern",
    "marriage-kalia-1633-cairbre--vannoch-1629-borthwick",
    "marriage-goirtin-1646-borthwick--iarbhine-1648-culloch",
    "marriage-conway-nasuada-trachwyll",
    "marriage-gabhan-borthwick--oideach-mochoe",
    "marriage-keitha-1660-borthwick--murchadh-1657-lachlann",
    "marriage-gearoid-1668-borthwick--peadhra-1669-boyd",
    "marriage-tjelvar-ciara-wellenschild",
    "marriage-deaglan-1677-borthwick--treabha-1678-muirin",
    "marriage-caireann-1675-grannd--whelan-1675-borthwick",
    "marriage-donnacha-1691-borthwick--jilleen-1697-cairge",
    "marriage-breccan-1697-culloch--dervla-1700-borthwick",
    "marriage-dechtire-1700-reannachain--nechtan-1696-borthwick",
    "affair-kunigunde-1710-falkert--nechtan-1696-borthwick",
    "marriage-toirche-1700-durachd--uisdean-1697-borthwick",
    "marriage-eideard-1701-borthwick--fothradh-1700-erskine"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-goirtin-founder-borthwick--sorcha-unknown-borthwick-91-0",
      "childIds": [
        "donnacha-1581-borthwick",
        "eilidh-1584-borthwick"
      ],
      "timeJumpId": "gap-braigh-borthwick-founders"
    },
    {
      "partnershipId": "marriage-dechtire-1585-erskine--donnacha-1581-borthwick",
      "childIds": [
        "nechtan-1605-borthwick",
        "doirind-1608-borthwick",
        "gearoid-1610-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-hoireabard-1609-grannd--nechtan-1605-borthwick",
      "childIds": [
        "donnacha-1627-borthwick",
        "sorcha-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-gearoid-1610-borthwick--uallach-1611-lasgair",
      "childIds": [
        "vannoch-1629-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-donnacha-1627-borthwick--noracha-1628-roich",
      "childIds": [
        "goirtin-1646-borthwick",
        "nasuada-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-kalia-1633-cairbre--vannoch-1629-borthwick",
      "childIds": [
        "gabhan-borthwick",
        "keitha-1660-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-goirtin-1646-borthwick--iarbhine-1648-culloch",
      "childIds": [
        "gearoid-1668-borthwick",
        "ciara-macborthwick",
        "deaglan-1677-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-gabhan-borthwick--oideach-mochoe",
      "childIds": [
        "keilon-1675-borthwick",
        "whelan-1675-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-gearoid-1668-borthwick--peadhra-1669-boyd",
      "childIds": [
        "donnacha-1691-borthwick",
        "kelch-1696-borthwick",
        "dervla-1700-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-deaglan-1677-borthwick--treabha-1678-muirin",
      "childIds": [
        "nechtan-1696-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-caireann-1675-grannd--whelan-1675-borthwick",
      "childIds": [
        "uisdean-1697-borthwick",
        "eideard-1701-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-donnacha-1691-borthwick--jilleen-1697-cairge",
      "childIds": [
        "sorcha-1718-borthwick",
        "torin-1723-borthwick"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-1700-reannachain--nechtan-1696-borthwick",
      "childIds": [
        "haelan-1722-borthwick",
        "eann-1726-borthwick"
      ]
    },
    {
      "partnershipId": "affair-kunigunde-1710-falkert--nechtan-1696-borthwick",
      "childIds": [
        "gundula-1728-borthwick",
        "ivo-1734-borthwick"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-toirche-1700-durachd--uisdean-1697-borthwick",
      "childIds": [
        "vannoch-1723-borthwick",
        "vaila-1724-borthwick",
        "vear-1729-borthwick"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-callum-1580-culloch--eilidh-1584-borthwick",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-diarmuid-1610-boyd--doirind-1608-borthwick",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-jowaneth-sorcha-wivern",
      "targetFamilyId": "haus-wivern",
      "houseId": "house-wivern"
    },
    {
      "partnershipId": "marriage-conway-nasuada-trachwyll",
      "targetFamilyId": "haus-trachwyll-talfronwyn",
      "houseId": "house-trachwyll-talfronwyn"
    },
    {
      "partnershipId": "marriage-keitha-1660-borthwick--murchadh-1657-lachlann",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    },
    {
      "partnershipId": "marriage-tjelvar-ciara-wellenschild",
      "targetFamilyId": "haus-wellenschild",
      "houseId": "house-wellenschild"
    },
    {
      "partnershipId": "marriage-breccan-1697-culloch--dervla-1700-borthwick",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-eideard-1701-borthwick--fothradh-1700-erskine",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "fiadh-1727-haig",
      "parentId": "donnacha-1691-borthwick"
    }
  ],
  "heads": [
    "goirtin-founder-borthwick",
    "donnacha-1581-borthwick",
    "nechtan-1605-borthwick",
    "gearoid-1610-borthwick",
    "donnacha-1627-borthwick",
    "vannoch-1629-borthwick",
    "goirtin-1646-borthwick"
  ],
  "titles": {
    "goirtin-founder-borthwick": "Historisches Oberhaupt",
    "donnacha-1581-borthwick": "Historisches Oberhaupt",
    "nechtan-1605-borthwick": "Historisches Oberhaupt",
    "gearoid-1610-borthwick": "Historisches Oberhaupt",
    "donnacha-1627-borthwick": "Historisches Oberhaupt",
    "vannoch-1629-borthwick": "Historisches Oberhaupt",
    "goirtin-1646-borthwick": "Dun-Tiarna · Oberhaupt seit 1700",
    "gearoid-1668-borthwick": "Erbfolge: 1",
    "whelan-1675-borthwick": "Erbfolge: 2",
    "deaglan-1677-borthwick": "Erbfolge: 3"
  },
  "personRoles": {
    "gundula-1728-borthwick": "bastard",
    "ivo-1734-borthwick": "bastard",
    "kunigunde-1710-falkert": "affair",
    "fiadh-1727-haig": "ward"
  },
  "personExtensions": {
    "nechtan-1696-borthwick": {
      "chartCenterBetweenPartnerPersonIds": [
        "dechtire-1700-reannachain",
        "kunigunde-1710-falkert"
      ],
      "chartPartnerGroupPersonOrder": [
        "dechtire-1700-reannachain",
        "nechtan-1696-borthwick",
        "kunigunde-1710-falkert"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine serielle Überlieferungslücke. Die unbeschriftete zweite Kinderüberschrift gehört zur fortgeführten Donnacha/Dechtire-Linie; die Gegenakte belegt Eilidhs Ehe bei Culloch. Keilons unbenannte Partnerkarte bleibt offen. Fiadh Haig ist Donnachas Mündel. Nechtans Affäre mit Kunigunde Falkert und deren Kinder bleiben von seiner Ehe getrennt. Amtszeiten werden nicht als Geburtsdaten verwendet.",
  "currentHeadId": "goirtin-1646-borthwick",
  "heirIds": [
    "gearoid-1668-borthwick",
    "whelan-1675-borthwick",
    "deaglan-1677-borthwick"
  ],
  "description": "Tir An Borthwick ist der Handels- und Hafenclan von Morvay unter der Oberherrschaft der Mac Culloch. Sein Name bezeichnet das Land der befestigten Siedlung an der Bucht; Goirtín gilt als früher Gründer. Handel, Zölle, Verträge und Küstenbefestigungen tragen die Macht des Hauses. Currach und Cateran schützen Schiffe, Häfen und Handelswege. Der älteste Mann des Hauses übernimmt die Führung; gegenwärtig ist dies Goirtín, der seit 1700 amtiert. Erfahrung und Verlässlichkeit zählen mehr als Eroberung. Die historische Lehensordnung bleibt während Krieg und Teilbesetzung Faelaorns erhalten.",
  "partnershipExtensions": {
    "marriage-dechtire-1700-reannachain--nechtan-1696-borthwick": {
      "chartAlignPartnerOverChildrenPersonId": "dechtire-1700-reannachain",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-kunigunde-1710-falkert--nechtan-1696-borthwick": {
      "chartAlignPartnerOverChildrenPersonId": "kunigunde-1710-falkert",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-deaglan-1677-borthwick--treabha-1678-muirin": {
      "chartAlignParentPairOverChildPersonId": "nechtan-1696-borthwick",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_BORTHWICK_FAMILY = createBraighSourceFamily("borthwick", SOURCE);
