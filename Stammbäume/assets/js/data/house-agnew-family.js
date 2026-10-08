import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "loinneog-founder-eoghainn",
    "padraig-founder-agnew",
    "baoigheall-1580-agnew",
    "jibheann-1585-agnew",
    "nechtan-1584-eoghainn",
    "luibheas-1580-duff",
    "bairrfhionn-1603-agnew",
    "loinneog-1605-agnew",
    "draighean-1601-deaghaide",
    "zachair-1607-kerlaouen",
    "glaodhaich-1631-agnew",
    "seallach-agnew",
    "quighleann-1635-agnew",
    "hearn-1630-banlaoch",
    "kynwrig-crwynog",
    "bairdin-1634-luthsach",
    "hairbhinn-1647-agnew",
    "eilionoir-1654-agnew",
    "uirghlinn-1655-agnew",
    "reathnaigh-1658-agnew",
    "eanbharr-1653-eoghainn",
    "gearoid-1650-tairise",
    "yvor-1658-oglivy",
    "seallach-1667-agnew",
    "baoigheall-1670-agnew",
    "caoilfhionn-1677-agnew",
    "loinneog-1680-agnew",
    "aodhnach-1679-agnew",
    "keiran-founder-deaghaide",
    "iagan-1674-caolan",
    "hurracan-1678-elid",
    "briathach-1680-duff",
    "quinlan-1675-arduinna",
    "quighleann-1692-agnew",
    "vionnadh-1700-agnew",
    "glaodhaich-founder-agnew",
    "bairrfhionn-1701-agnew",
    "jibheann-1704-agnew",
    "earc-unknown-agnew-61-0",
    "beacan-1696-dobhar",
    "brennan-1701-luthsach",
    "meara-1705-banlaoch",
    "kester-1708-agnew",
    "padraig-1714-agnew",
    "eilionoir-1723-agnew",
    "caoilfhionn-1728-agnew",
    "baoigheall-1730-agnew"
  ],
  "partnershipIds": [
    "marriage-loinneog-founder-eoghainn--padraig-founder-agnew",
    "marriage-baoigheall-1580-agnew--nechtan-1584-eoghainn",
    "marriage-jibheann-1585-agnew--luibheas-1580-duff",
    "marriage-bairrfhionn-1603-agnew--draighean-1601-deaghaide",
    "marriage-loinneog-1605-agnew--zachair-1607-kerlaouen",
    "marriage-glaodhaich-1631-agnew--hearn-1630-banlaoch",
    "marriage-kynwrig-crwynog--seallach-agnew",
    "marriage-bairdin-1634-luthsach--quighleann-1635-agnew",
    "marriage-eanbharr-1653-eoghainn--hairbhinn-1647-agnew",
    "marriage-eilionoir-1654-agnew--gearoid-1650-tairise",
    "marriage-reathnaigh-1658-agnew--yvor-1658-oglivy",
    "marriage-keiran-founder-deaghaide--seallach-1667-agnew",
    "marriage-baoigheall-1670-agnew--iagan-1674-caolan",
    "marriage-caoilfhionn-1677-agnew--hurracan-1678-elid",
    "marriage-briathach-1680-duff--loinneog-1680-agnew",
    "marriage-aodhnach-1679-agnew--quinlan-1675-arduinna",
    "affair-earc-unknown-agnew-61-0--quighleann-1692-agnew",
    "marriage-beacan-1696-dobhar--quighleann-1692-agnew",
    "marriage-brennan-1701-luthsach--glaodhaich-founder-agnew",
    "marriage-bairrfhionn-1701-agnew--meara-1705-banlaoch"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-loinneog-founder-eoghainn--padraig-founder-agnew",
      "childIds": [
        "baoigheall-1580-agnew",
        "jibheann-1585-agnew"
      ],
      "timeJumpId": "gap-damh-agnew-founders"
    },
    {
      "partnershipId": "marriage-baoigheall-1580-agnew--nechtan-1584-eoghainn",
      "childIds": [
        "bairrfhionn-1603-agnew",
        "loinneog-1605-agnew"
      ]
    },
    {
      "partnershipId": "marriage-loinneog-1605-agnew--zachair-1607-kerlaouen",
      "childIds": [
        "glaodhaich-1631-agnew",
        "seallach-agnew",
        "quighleann-1635-agnew"
      ]
    },
    {
      "partnershipId": "marriage-glaodhaich-1631-agnew--hearn-1630-banlaoch",
      "childIds": [
        "hairbhinn-1647-agnew",
        "eilionoir-1654-agnew"
      ]
    },
    {
      "partnershipId": "marriage-bairdin-1634-luthsach--quighleann-1635-agnew",
      "childIds": [
        "uirghlinn-1655-agnew",
        "reathnaigh-1658-agnew"
      ]
    },
    {
      "partnershipId": "marriage-eanbharr-1653-eoghainn--hairbhinn-1647-agnew",
      "childIds": [
        "seallach-1667-agnew",
        "baoigheall-1670-agnew"
      ]
    },
    {
      "partnershipId": "marriage-eilionoir-1654-agnew--gearoid-1650-tairise",
      "childIds": [
        "caoilfhionn-1677-agnew",
        "loinneog-1680-agnew"
      ]
    },
    {
      "partnershipId": "marriage-reathnaigh-1658-agnew--yvor-1658-oglivy",
      "childIds": [
        "aodhnach-1679-agnew"
      ]
    },
    {
      "partnershipId": "marriage-baoigheall-1670-agnew--iagan-1674-caolan",
      "childIds": [
        "quighleann-1692-agnew",
        "vionnadh-1700-agnew"
      ]
    },
    {
      "partnershipId": "marriage-caoilfhionn-1677-agnew--hurracan-1678-elid",
      "childIds": [
        "glaodhaich-founder-agnew"
      ]
    },
    {
      "partnershipId": "marriage-aodhnach-1679-agnew--quinlan-1675-arduinna",
      "childIds": [
        "bairrfhionn-1701-agnew",
        "jibheann-1704-agnew"
      ]
    },
    {
      "partnershipId": "affair-earc-unknown-agnew-61-0--quighleann-1692-agnew",
      "childIds": [
        "kester-1708-agnew"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-beacan-1696-dobhar--quighleann-1692-agnew",
      "childIds": [
        "padraig-1714-agnew"
      ]
    },
    {
      "partnershipId": "marriage-brennan-1701-luthsach--glaodhaich-founder-agnew",
      "childIds": [
        "eilionoir-1723-agnew",
        "caoilfhionn-1728-agnew",
        "baoigheall-1730-agnew"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-jibheann-1585-agnew--luibheas-1580-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-bairrfhionn-1603-agnew--draighean-1601-deaghaide",
      "targetFamilyId": "haus-deaghaide",
      "houseId": "house-deaghaide"
    },
    {
      "partnershipId": "marriage-kynwrig-crwynog--seallach-agnew",
      "targetFamilyId": "haus-crwynog",
      "houseId": "house-crwynog"
    },
    {
      "partnershipId": "marriage-keiran-founder-deaghaide--seallach-1667-agnew",
      "targetFamilyId": "haus-deaghaide",
      "houseId": "house-deaghaide"
    },
    {
      "partnershipId": "marriage-briathach-1680-duff--loinneog-1680-agnew",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-bairrfhionn-1701-agnew--meara-1705-banlaoch",
      "targetFamilyId": "haus-banlaoch",
      "houseId": "house-banlaoch"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "eilionoir-1723-agnew",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "caoilfhionn-1728-agnew",
      "targetFamilyId": "haus-kerlaouen",
      "houseId": "house-kerlaouen",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "baoigheall-1730-agnew",
      "targetFamilyId": "haus-marcaigh",
      "houseId": "house-marcaigh",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "kester-1708-agnew": "bastard",
    "earc-unknown-agnew-61-0": "affair"
  },
  "personExtensions": {
    "quighleann-1692-agnew": {
      "chartCenterBetweenPartnerPersonIds": [
        "earc-unknown-agnew-61-0",
        "beacan-1696-dobhar"
      ],
      "chartPartnerGroupPersonOrder": [
        "earc-unknown-agnew-61-0",
        "quighleann-1692-agnew",
        "beacan-1696-dobhar"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine Überlieferungslücke. Die dritte Generation stammt nach den gezeichneten Linien von Loinneog und Zachair ab. Die drei jüngsten Geburtsjahre wurden vom Nutzer auf 1723, 1728 und 1730 berichtigt; Eanbharr Eoghainn wurde 1653 geboren. Kester stammt aus Quíghleanns Affäre mit Earc, Pádraig aus der Ehe mit Beacan.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ó Nic Agnew ist das Dun-Tiarna-Haus von Tighlean in Tir na Damh. Die Stammfolge führt auf Loinneog Eoghainn und Pádraig zurück. Nach einer Überlieferungslücke verzweigt sie sich über Baoigheall und Nechtan Eoghainn. Spätere Verbindungen führen unter anderem zu Banlaoch, Tairise und Luthsach. Glaodhaich und Brennan Luthsachs Kinder Eilionoir, Caoilfhionn und Baoigheall sind als Mündel in anderen Häusern verzeichnet. Die historische Zuordnung zu Tighlean bleibt während des Krieges erhalten.",
  "warriorReference": "",
  "partnershipExtensions": {
    "affair-earc-unknown-agnew-61-0--quighleann-1692-agnew": {
      "chartAlignPartnerOverChildrenPersonId": "earc-unknown-agnew-61-0",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-beacan-1696-dobhar--quighleann-1692-agnew": {
      "chartAlignPartnerOverChildrenPersonId": "beacan-1696-dobhar",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    }
  }
});

export const HOUSE_AGNEW_FAMILY = createDamhSourceFamily("agnew", SOURCE);
