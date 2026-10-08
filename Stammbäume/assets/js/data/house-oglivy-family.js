import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "conchobar-founder-oglivy",
    "hedda-unknown-oglivy-0-1",
    "eadbhard-founder-oglivy",
    "fonnait-oglivy",
    "gormfhlaith-founder-eilitard",
    "kimball-aderyn",
    "iobhar-1556-oglivy",
    "eithne-1559-oglivy",
    "latharna-1560-roich",
    "bujold-kampfgeborene",
    "conchobar-1582-oglivy",
    "hedda-1589-oglivy",
    "sten-1592-oglivy",
    "quiseog-1585-duff",
    "donnacha-1585-dobhar",
    "eimhear-1590-dundas",
    "hearn-1606-oglivy",
    "lannraig-1610-oglivy",
    "jowan-1611-oglivy",
    "aodhnach-1607-dianaomh",
    "torcall-unknown-oglivy-41-1",
    "solveig-unknown-oglivy-41-2",
    "eadbhard-1627-oglivy",
    "wendra-1631-oglivy",
    "goll-oglivy",
    "jorunn-1635-oglivy",
    "litrielle-1632-lasgair",
    "iosnan-1628-dobhar",
    "toirche-gwenyen",
    "goirtin-1631-forsyth",
    "conchobar-1651-oglivy",
    "wihalgh-1653-oglivy",
    "sten-1655-oglivy",
    "yvor-1658-oglivy",
    "xardia-1654-avernax",
    "briathach-1649-eoghainn",
    "leagha-unknown-oglivy-61-2",
    "reathnaigh-1658-agnew",
    "eadbhard-1673-oglivy",
    "brigh-1676-oglivy",
    "hearn-1676-oglivy",
    "uibhla-1682-oglivy",
    "jilleen-1674-buadhtreun",
    "tadhghan-1674-elid",
    "luiseach-1678-duff",
    "aodhluan-1680-dianaomh",
    "iobhar-1693-oglivy",
    "sten-1697-oglivy",
    "heulyn-1702-oglivy",
    "jowan-1697-oglivy",
    "dervla-1700-oglivy",
    "herdis-1694-tauwind",
    "eadgyth-1700-estmere",
    "kjartan-unknown-oglivy-81-2",
    "pallaigh-1700-dobhar",
    "inga-unknown-oglivy-81-4",
    "goirtin-1700-forsyth",
    "conchobar-1714-oglivy",
    "hedda-1719-oglivy",
    "skjell-1721-oglivy",
    "goll-1718-oglivy",
    "ingemar-1720-oglivy"
  ],
  "partnershipIds": [
    "marriage-conchobar-founder-oglivy--hedda-unknown-oglivy-0-1",
    "marriage-eadbhard-founder-oglivy--gormfhlaith-founder-eilitard",
    "marriage-kimball-fonnait",
    "marriage-iobhar-1556-oglivy--latharna-1560-roich",
    "marriage-bujold-kampfgeborene--eithne-1559-oglivy",
    "marriage-conchobar-1582-oglivy--quiseog-1585-duff",
    "marriage-donnacha-1585-dobhar--hedda-1589-oglivy",
    "marriage-eimhear-1590-dundas--sten-1592-oglivy",
    "marriage-aodhnach-1607-dianaomh--hearn-1606-oglivy",
    "marriage-lannraig-1610-oglivy--torcall-unknown-oglivy-41-1",
    "marriage-jowan-1611-oglivy--solveig-unknown-oglivy-41-2",
    "marriage-eadbhard-1627-oglivy--litrielle-1632-lasgair",
    "marriage-iosnan-1628-dobhar--wendra-1631-oglivy",
    "marriage-goll-oglivy--toirche-gwenyen",
    "marriage-goirtin-1631-forsyth--jorunn-1635-oglivy",
    "marriage-conchobar-1651-oglivy--xardia-1654-avernax",
    "marriage-briathach-1649-eoghainn--wihalgh-1653-oglivy",
    "marriage-leagha-unknown-oglivy-61-2--sten-1655-oglivy",
    "marriage-reathnaigh-1658-agnew--yvor-1658-oglivy",
    "marriage-eadbhard-1673-oglivy--jilleen-1674-buadhtreun",
    "marriage-brigh-1676-oglivy--tadhghan-1674-elid",
    "marriage-hearn-1676-oglivy--luiseach-1678-duff",
    "marriage-aodhluan-1680-dianaomh--uibhla-1682-oglivy",
    "marriage-herdis-1694-tauwind--iobhar-1693-oglivy",
    "marriage-eadgyth-1700-estmere--sten-1697-oglivy",
    "forced-heulyn-1702-oglivy--kjartan-unknown-oglivy-81-2",
    "marriage-jowan-1697-oglivy--pallaigh-1700-dobhar",
    "affair-inga-unknown-oglivy-81-4--jowan-1697-oglivy",
    "marriage-dervla-1700-oglivy--goirtin-1700-forsyth"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-conchobar-founder-oglivy--hedda-unknown-oglivy-0-1",
      "childIds": [
        "eadbhard-founder-oglivy",
        "fonnait-oglivy"
      ],
      "timeJumpId": "gap-damh-oglivy-founders"
    },
    {
      "partnershipId": "marriage-eadbhard-founder-oglivy--gormfhlaith-founder-eilitard",
      "childIds": [
        "iobhar-1556-oglivy",
        "eithne-1559-oglivy"
      ],
      "timeJumpId": "gap-damh-oglivy-eadbhard"
    },
    {
      "partnershipId": "marriage-iobhar-1556-oglivy--latharna-1560-roich",
      "childIds": [
        "conchobar-1582-oglivy",
        "hedda-1589-oglivy",
        "sten-1592-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-conchobar-1582-oglivy--quiseog-1585-duff",
      "childIds": [
        "hearn-1606-oglivy",
        "lannraig-1610-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-eimhear-1590-dundas--sten-1592-oglivy",
      "childIds": [
        "jowan-1611-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-aodhnach-1607-dianaomh--hearn-1606-oglivy",
      "childIds": [
        "eadbhard-1627-oglivy",
        "wendra-1631-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-jowan-1611-oglivy--solveig-unknown-oglivy-41-2",
      "childIds": [
        "goll-oglivy",
        "jorunn-1635-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-eadbhard-1627-oglivy--litrielle-1632-lasgair",
      "childIds": [
        "conchobar-1651-oglivy",
        "wihalgh-1653-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-goll-oglivy--toirche-gwenyen",
      "childIds": [
        "sten-1655-oglivy",
        "yvor-1658-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-conchobar-1651-oglivy--xardia-1654-avernax",
      "childIds": [
        "eadbhard-1673-oglivy",
        "brigh-1676-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-leagha-unknown-oglivy-61-2--sten-1655-oglivy",
      "childIds": [
        "hearn-1676-oglivy",
        "uibhla-1682-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-eadbhard-1673-oglivy--jilleen-1674-buadhtreun",
      "childIds": [
        "iobhar-1693-oglivy",
        "sten-1697-oglivy",
        "heulyn-1702-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-hearn-1676-oglivy--luiseach-1678-duff",
      "childIds": [
        "jowan-1697-oglivy",
        "dervla-1700-oglivy"
      ]
    },
    {
      "partnershipId": "marriage-herdis-1694-tauwind--iobhar-1693-oglivy",
      "childIds": [
        "conchobar-1714-oglivy",
        "hedda-1719-oglivy"
      ]
    },
    {
      "partnershipId": "forced-heulyn-1702-oglivy--kjartan-unknown-oglivy-81-2",
      "childIds": [
        "skjell-1721-oglivy"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-jowan-1697-oglivy--pallaigh-1700-dobhar",
      "childIds": [
        "goll-1718-oglivy"
      ]
    },
    {
      "partnershipId": "affair-inga-unknown-oglivy-81-4--jowan-1697-oglivy",
      "childIds": [
        "ingemar-1720-oglivy"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-kimball-fonnait",
      "targetFamilyId": "haus-aderyn",
      "houseId": "house-aderyn"
    },
    {
      "partnershipId": "marriage-bujold-kampfgeborene--eithne-1559-oglivy",
      "targetFamilyId": "haus-kampfgeborene",
      "houseId": "house-kampfgeborene"
    },
    {
      "partnershipId": "marriage-donnacha-1585-dobhar--hedda-1589-oglivy",
      "targetFamilyId": "haus-dobhar",
      "houseId": "house-dobhar"
    },
    {
      "partnershipId": "marriage-iosnan-1628-dobhar--wendra-1631-oglivy",
      "targetFamilyId": "haus-dobhar",
      "houseId": "house-dobhar"
    },
    {
      "partnershipId": "marriage-goirtin-1631-forsyth--jorunn-1635-oglivy",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-briathach-1649-eoghainn--wihalgh-1653-oglivy",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-reathnaigh-1658-agnew--yvor-1658-oglivy",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-brigh-1676-oglivy--tadhghan-1674-elid",
      "targetFamilyId": "haus-elid",
      "houseId": "house-elid"
    },
    {
      "partnershipId": "marriage-aodhluan-1680-dianaomh--uibhla-1682-oglivy",
      "targetFamilyId": "haus-dianaomh",
      "houseId": "house-dianaomh"
    },
    {
      "partnershipId": "marriage-eadgyth-1700-estmere--sten-1697-oglivy",
      "targetFamilyId": "haus-estmere",
      "houseId": "house-estmere"
    },
    {
      "partnershipId": "marriage-dervla-1700-oglivy--goirtin-1700-forsyth",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "hedda-1719-oglivy",
      "targetFamilyId": "haus-tauwind",
      "houseId": "house-tauwind",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "skjell-1721-oglivy": "bastard",
    "kjartan-unknown-oglivy-81-2": "forced",
    "ingemar-1720-oglivy": "bastard",
    "inga-unknown-oglivy-81-4": "affair"
  },
  "personExtensions": {
    "jowan-1697-oglivy": {
      "chartCenterBetweenPartnerPersonIds": [
        "pallaigh-1700-dobhar",
        "inga-unknown-oglivy-81-4"
      ],
      "chartPartnerGroupPersonOrder": [
        "pallaigh-1700-dobhar",
        "jowan-1697-oglivy",
        "inga-unknown-oglivy-81-4"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Zwei serielle Überlieferungslücken. Heulyn–Kjartan ist laut Nutzer erzwungen; Skjell stammt aus dieser Verbindung. Jowans Ehe mit Pallaigh und Affäre mit Inga bleiben getrennt. Hedda ist als Mündel an Tauwind gegeben. Herkunft unbekannter Partner und nicht angegebene Jahre werden nicht erfunden.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Fir An Oglivy ist das historische Laird-Haus von Inniscaer in Tir na Damh. Die Genealogie führt auf Conchobar und Hedda zurück und enthält zwei frühe Überlieferungslücken. Ihre späteren Zweige sind durch Ehen unter anderem mit Dobhar, Dundas, Dianaomh, Eoghainn und Forsyth verbunden. Neben ehelichen Linien sind Skjell aus der erzwungenen Verbindung Heulyns mit Kjartan und Ingemar aus Jowans Affäre mit Inga verzeichnet. Die jüngere Hedda wurde als Mündel an Tauwind gegeben. Die alte Herrschaftsordnung bleibt während Krieg und Teilbesetzung bestehen.",
  "warriorReference": "",
  "partnershipExtensions": {
    "marriage-jowan-1697-oglivy--pallaigh-1700-dobhar": {
      "chartAlignPartnerOverChildrenPersonId": "pallaigh-1700-dobhar",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-inga-unknown-oglivy-81-4--jowan-1697-oglivy": {
      "chartAlignPartnerOverChildrenPersonId": "inga-unknown-oglivy-81-4",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    }
  }
});

export const HOUSE_OGLIVY_FAMILY = createDamhSourceFamily("oglivy", SOURCE);
