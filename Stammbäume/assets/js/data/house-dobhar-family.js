import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "donnacha-founder-dobhar",
    "pallaigh-unknown-dobhar-0-1",
    "donnacha-1585-dobhar",
    "tadhaigh-1590-dobhar",
    "donal-1595-dobhar",
    "hedda-1589-oglivy",
    "hoimin-1589-grannd",
    "neidhe-1598-elid",
    "giollan-1607-dobhar",
    "nithin-1611-dobhar",
    "janneth-1619-dobhar",
    "tuarenn-1610-cairge",
    "pailtear-1610-eoghainn",
    "ingeborg-unknown-dobhar-21-2",
    "iosag-unknown-dobhar-21-3",
    "iosnan-1628-dobhar",
    "sadhbh-dobhar",
    "nuallan-1635-dobhar",
    "steinar-1640-dobhar",
    "pallaigh-1645-dobhar",
    "wendra-1631-oglivy",
    "seithved-1630-morgryn",
    "oilean-1636-reannachain",
    "fuirseach-1645-forsyth",
    "donnacha-dobhar",
    "laoise-1657-dobhar",
    "donal-1655-dobhar",
    "marvine-mochdaer",
    "luibheas-1655-duff",
    "heilbhic-1657-muirgheal",
    "giollan-1672-dobhar",
    "hailidhe-1678-dobhar",
    "ollamh-1678-dobhar",
    "leagha-1681-dobhar",
    "wicche-1675-clannmhar",
    "gordanach-1675-fintain",
    "aodhnach-1677-dianaomh",
    "haodh-1681-eoghainn",
    "hectan-1693-dobhar",
    "beacan-1696-dobhar",
    "nuallan-1697-dobhar",
    "pallaigh-1700-dobhar",
    "liara-1695-cairbre",
    "quighleann-1692-agnew",
    "ealar-unknown-dobhar-61-2",
    "jowan-1697-oglivy",
    "donal-1713-dobhar",
    "iosnan-1714-dobhar",
    "uidhir-1716-dobhar"
  ],
  "partnershipIds": [
    "marriage-donnacha-founder-dobhar--pallaigh-unknown-dobhar-0-1",
    "marriage-donnacha-1585-dobhar--hedda-1589-oglivy",
    "marriage-hoimin-1589-grannd--tadhaigh-1590-dobhar",
    "marriage-donal-1595-dobhar--neidhe-1598-elid",
    "marriage-giollan-1607-dobhar--tuarenn-1610-cairge",
    "marriage-nithin-1611-dobhar--pailtear-1610-eoghainn",
    "affair-ingeborg-unknown-dobhar-21-2--janneth-1619-dobhar",
    "marriage-iosag-unknown-dobhar-21-3--janneth-1619-dobhar",
    "marriage-iosnan-1628-dobhar--wendra-1631-oglivy",
    "marriage-sadhbh-dobhar--seithved-1630-morgryn",
    "marriage-nuallan-1635-dobhar--oilean-1636-reannachain",
    "marriage-fuirseach-1645-forsyth--pallaigh-1645-dobhar",
    "marriage-marvine-donnacha-mochdaer",
    "marriage-laoise-1657-dobhar--luibheas-1655-duff",
    "marriage-donal-1655-dobhar--heilbhic-1657-muirgheal",
    "marriage-giollan-1672-dobhar--wicche-1675-clannmhar",
    "marriage-gordanach-1675-fintain--hailidhe-1678-dobhar",
    "marriage-aodhnach-1677-dianaomh--ollamh-1678-dobhar",
    "marriage-haodh-1681-eoghainn--leagha-1681-dobhar",
    "marriage-hectan-1693-dobhar--liara-1695-cairbre",
    "marriage-beacan-1696-dobhar--quighleann-1692-agnew",
    "marriage-ealar-unknown-dobhar-61-2--nuallan-1697-dobhar",
    "marriage-jowan-1697-oglivy--pallaigh-1700-dobhar"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-donnacha-founder-dobhar--pallaigh-unknown-dobhar-0-1",
      "childIds": [
        "donnacha-1585-dobhar",
        "tadhaigh-1590-dobhar",
        "donal-1595-dobhar"
      ],
      "timeJumpId": "gap-damh-dobhar-founders"
    },
    {
      "partnershipId": "marriage-donnacha-1585-dobhar--hedda-1589-oglivy",
      "childIds": [
        "giollan-1607-dobhar",
        "nithin-1611-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-donal-1595-dobhar--neidhe-1598-elid",
      "childIds": [
        "janneth-1619-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-giollan-1607-dobhar--tuarenn-1610-cairge",
      "childIds": [
        "iosnan-1628-dobhar",
        "sadhbh-dobhar",
        "nuallan-1635-dobhar"
      ]
    },
    {
      "partnershipId": "affair-ingeborg-unknown-dobhar-21-2--janneth-1619-dobhar",
      "childIds": [
        "steinar-1640-dobhar"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-iosag-unknown-dobhar-21-3--janneth-1619-dobhar",
      "childIds": [
        "pallaigh-1645-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-iosnan-1628-dobhar--wendra-1631-oglivy",
      "childIds": [
        "donnacha-dobhar",
        "laoise-1657-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-nuallan-1635-dobhar--oilean-1636-reannachain",
      "childIds": [
        "donal-1655-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-marvine-donnacha-mochdaer",
      "childIds": [
        "giollan-1672-dobhar",
        "hailidhe-1678-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-donal-1655-dobhar--heilbhic-1657-muirgheal",
      "childIds": [
        "ollamh-1678-dobhar",
        "leagha-1681-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-giollan-1672-dobhar--wicche-1675-clannmhar",
      "childIds": [
        "hectan-1693-dobhar",
        "beacan-1696-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-aodhnach-1677-dianaomh--ollamh-1678-dobhar",
      "childIds": [
        "nuallan-1697-dobhar",
        "pallaigh-1700-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-hectan-1693-dobhar--liara-1695-cairbre",
      "childIds": [
        "donal-1713-dobhar",
        "iosnan-1714-dobhar"
      ]
    },
    {
      "partnershipId": "marriage-ealar-unknown-dobhar-61-2--nuallan-1697-dobhar",
      "childIds": [
        "uidhir-1716-dobhar"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-hoimin-1589-grannd--tadhaigh-1590-dobhar",
      "targetFamilyId": "haus-grannd",
      "houseId": "house-grannd"
    },
    {
      "partnershipId": "marriage-nithin-1611-dobhar--pailtear-1610-eoghainn",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-sadhbh-dobhar--seithved-1630-morgryn",
      "targetFamilyId": "haus-morgryn",
      "houseId": "house-morgryn"
    },
    {
      "partnershipId": "marriage-fuirseach-1645-forsyth--pallaigh-1645-dobhar",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-laoise-1657-dobhar--luibheas-1655-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-gordanach-1675-fintain--hailidhe-1678-dobhar",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-haodh-1681-eoghainn--leagha-1681-dobhar",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-beacan-1696-dobhar--quighleann-1692-agnew",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-jowan-1697-oglivy--pallaigh-1700-dobhar",
      "targetFamilyId": "haus-oglivy",
      "houseId": "house-oglivy"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "steinar-1640-dobhar": "bastard",
    "ingeborg-unknown-dobhar-21-2": "affair"
  },
  "personExtensions": {
    "janneth-1619-dobhar": {
      "chartCenterBetweenPartnerPersonIds": [
        "ingeborg-unknown-dobhar-21-2",
        "iosag-unknown-dobhar-21-3"
      ],
      "chartPartnerGroupPersonOrder": [
        "ingeborg-unknown-dobhar-21-2",
        "janneth-1619-dobhar",
        "iosag-unknown-dobhar-21-3"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine Überlieferungslücke. Steinar ist Kind der Affäre Janneth–Ingebörg; Pallaigh stammt aus Janneths Ehe mit Íosag. Die unbenannten Herkunftshäuser von Ingebörg, Íosag und Ealar bleiben offen. Todeskreuze allein belegen kein Aussterben des Hauses.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "An Dobhar ist das historische Dun-Tiarna-Haus von Maolnair in Tir na Damh. Die Genealogie beginnt mit Donnacha und Pallaigh und setzt nach einer Überlieferungslücke bei den Zweigen Donnachas, Tadhaighs und Dónals ein. Ehen mit Oglivy, Elid, Eoghainn und Dianaomh verbinden den Clan eng mit den übrigen Häusern der Haine. Janneths ehelicher Zweig und die uneheliche Linie Steinars werden getrennt geführt. Auch lebende Angehörige in angeheirateten Linien bleiben erfasst; aus den Todeskreuzen wird kein vollständiges Aussterben abgeleitet.",
  "warriorReference": "",
  "partnershipExtensions": {
    "affair-ingeborg-unknown-dobhar-21-2--janneth-1619-dobhar": {
      "chartAlignPartnerOverChildrenPersonId": "ingeborg-unknown-dobhar-21-2",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-iosag-unknown-dobhar-21-3--janneth-1619-dobhar": {
      "chartAlignPartnerOverChildrenPersonId": "iosag-unknown-dobhar-21-3",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    }
  }
});

export const HOUSE_DOBHAR_FAMILY = createDamhSourceFamily("dobhar", SOURCE);
