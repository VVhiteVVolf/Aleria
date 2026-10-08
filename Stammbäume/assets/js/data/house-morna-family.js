import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "garbhan-founder-morna",
    "aineinan-founder-tuathanach",
    "keiras-founder-morna",
    "fearghal-founder-morna",
    "maebhin-unknown-morna-103-0",
    "wunbhna-founder-abhrach",
    "sean-1270-morna",
    "aodhnait-morna",
    "brian-1276-morna",
    "quilline-1275-laga",
    "cormac-1270-airt",
    "etain-unknown-morna-115-2",
    "goll-1581-morna",
    "eireann-1589-morna",
    "oonaach-1586-durthacht",
    "jodhran-1587-fintain",
    "fearghal-1600-morna",
    "graine-morna",
    "kelch-morna",
    "sceolaigh-1611-duilb",
    "hywel-ciarog",
    "morrioghan-1618-rochraide",
    "ioma-unknown-morna-137-3",
    "brian-1622-morna",
    "ciara-1626-morna",
    "keir-1680-morna",
    "domhnall-1629-morna",
    "eilidhan-1630-morna",
    "maolmhuire-1626-laga",
    "fergusin-1621-ronain",
    "tailltein-1634-fiachiontach",
    "colmas-1630-ui-faill-duibhne",
    "sean-1648-morna",
    "laoise-1652-morna",
    "unaas-1652-morna",
    "garbhan-1652-morna",
    "dearbhlaas-1652-urquhart",
    "maelachin-1648-roth",
    "maelas-1650-coronach",
    "muadhnait-1654-cetchathach",
    "goll-1668-morna",
    "catan-1674-morna",
    "fearghal-1673-morna",
    "aineinan-1675-morna",
    "liamach-1677-morna",
    "nessa-1672-chulainn",
    "maebhin-1677-muileach",
    "dearbhla-1676-rioga",
    "ruairias-1671-ceallaigh",
    "noracha-1679-morgacht",
    "garbhan-morna",
    "fabienne-1695-morna",
    "ollamh-1699-morna",
    "raena-1698-morna",
    "latrell-1700-morna",
    "ronanach-1698-morna",
    "saorla-1700-morna",
    "tryee-1700-morna",
    "wiarnan-1705-morna",
    "kelch-1710-morna",
    "saorlaith-cumhail",
    "cailte-1694-ronain",
    "saoirseasin-1705-cethrenn",
    "eochaidh-1694-durthacht",
    "caitria-1705-chulainn",
    "teaganach-1701-fintain",
    "maelas-1695-coronach",
    "neasa-1709-culloch",
    "leogan-1715-morna",
    "aodhnait-1720-morna",
    "dairein-1726-morna",
    "fola-1727-roth",
    "nuallan-1722-morna",
    "jainn-1725-morna",
    "ciara-1729-morna",
    "varain-1725-morna",
    "eireann-1730-morna",
    "sulach-1722-morna",
    "cinnia-1725-morna",
    "oighrig-1730-morna",
    "iuliana-1733-morna"
  ],
  "partnershipIds": [
    "marriage-aineinan-founder-tuathanach--garbhan-founder-morna",
    "marriage-keiras-founder-morna--maebhin-unknown-morna-103-0",
    "marriage-fearghal-founder-morna--wunbhna-founder-abhrach",
    "marriage-quilline-1275-laga--sean-1270-morna",
    "marriage-cormac-aodhnait-airt",
    "marriage-brian-1276-morna--etain-unknown-morna-115-2",
    "marriage-goll-1581-morna--oonaach-1586-durthacht",
    "marriage-eireann-1589-morna--jodhran-1587-fintain",
    "marriage-fearghal-1600-morna--sceolaigh-1611-duilb",
    "marriage-hywel-graine-ciarog",
    "marriage-kelch-morna--morrioghan-1618-rochraide",
    "affair-ioma-unknown-morna-137-3--kelch-morna",
    "marriage-brian-1622-morna--maolmhuire-1626-laga",
    "marriage-ciara-1626-morna--fergusin-1621-ronain",
    "marriage-domhnall-1629-morna--tailltein-1634-fiachiontach",
    "marriage-colmas-1630-ui-faill-duibhne--eilidhan-1630-morna",
    "marriage-dearbhlaas-1652-urquhart--sean-1648-morna",
    "marriage-laoise-1652-morna--maelachin-1648-roth",
    "marriage-maelas-1650-coronach--unaas-1652-morna",
    "marriage-garbhan-1652-morna--muadhnait-1654-cetchathach",
    "marriage-goll-1668-morna--nessa-1672-chulainn",
    "marriage-catan-1674-morna--maebhin-1677-muileach",
    "marriage-dearbhla-1676-rioga--fearghal-1673-morna",
    "marriage-aineinan-1675-morna--ruairias-1671-ceallaigh",
    "marriage-liamach-1677-morna--noracha-1679-morgacht",
    "marriage-saorlaith-garbhan",
    "marriage-cailte-1694-ronain--fabienne-1695-morna",
    "marriage-ollamh-1699-morna--saoirseasin-1705-cethrenn",
    "marriage-eochaidh-1694-durthacht--raena-1698-morna",
    "marriage-caitria-1705-chulainn--latrell-1700-morna",
    "marriage-ronanach-1698-morna--teaganach-1701-fintain",
    "marriage-maelas-1695-coronach--saorla-1700-morna",
    "marriage-neasa-1709-culloch--wiarnan-1705-morna"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-aineinan-founder-tuathanach--garbhan-founder-morna",
      "childIds": [
        "keiras-founder-morna",
        "fearghal-founder-morna"
      ],
      "timeJumpId": "gap-aislearneach-morna-founders"
    },
    {
      "partnershipId": "marriage-fearghal-founder-morna--wunbhna-founder-abhrach",
      "childIds": [
        "sean-1270-morna",
        "aodhnait-morna",
        "brian-1276-morna"
      ],
      "timeJumpId": "gap-aislearneach-morna-fearghal"
    },
    {
      "partnershipId": "marriage-quilline-1275-laga--sean-1270-morna",
      "childIds": [
        "goll-1581-morna",
        "eireann-1589-morna"
      ],
      "timeJumpId": "gap-aislearneach-morna-sean"
    },
    {
      "partnershipId": "marriage-goll-1581-morna--oonaach-1586-durthacht",
      "childIds": [
        "fearghal-1600-morna",
        "graine-morna",
        "kelch-morna"
      ]
    },
    {
      "partnershipId": "marriage-fearghal-1600-morna--sceolaigh-1611-duilb",
      "childIds": [
        "brian-1622-morna",
        "ciara-1626-morna"
      ]
    },
    {
      "partnershipId": "marriage-kelch-morna--morrioghan-1618-rochraide",
      "childIds": [
        "domhnall-1629-morna",
        "eilidhan-1630-morna"
      ]
    },
    {
      "partnershipId": "affair-ioma-unknown-morna-137-3--kelch-morna",
      "childIds": [
        "keir-1680-morna"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-brian-1622-morna--maolmhuire-1626-laga",
      "childIds": [
        "sean-1648-morna",
        "laoise-1652-morna"
      ]
    },
    {
      "partnershipId": "marriage-domhnall-1629-morna--tailltein-1634-fiachiontach",
      "childIds": [
        "unaas-1652-morna",
        "garbhan-1652-morna"
      ]
    },
    {
      "partnershipId": "marriage-dearbhlaas-1652-urquhart--sean-1648-morna",
      "childIds": [
        "goll-1668-morna",
        "catan-1674-morna"
      ]
    },
    {
      "partnershipId": "marriage-garbhan-1652-morna--muadhnait-1654-cetchathach",
      "childIds": [
        "fearghal-1673-morna",
        "aineinan-1675-morna",
        "liamach-1677-morna"
      ]
    },
    {
      "partnershipId": "marriage-goll-1668-morna--nessa-1672-chulainn",
      "childIds": [
        "garbhan-morna",
        "fabienne-1695-morna",
        "ollamh-1699-morna"
      ]
    },
    {
      "partnershipId": "marriage-catan-1674-morna--maebhin-1677-muileach",
      "childIds": [
        "raena-1698-morna",
        "latrell-1700-morna"
      ]
    },
    {
      "partnershipId": "marriage-dearbhla-1676-rioga--fearghal-1673-morna",
      "childIds": [
        "ronanach-1698-morna",
        "saorla-1700-morna"
      ]
    },
    {
      "partnershipId": "marriage-liamach-1677-morna--noracha-1679-morgacht",
      "childIds": [
        "tryee-1700-morna",
        "wiarnan-1705-morna",
        "kelch-1710-morna"
      ]
    },
    {
      "partnershipId": "marriage-saorlaith-garbhan",
      "childIds": [
        "leogan-1715-morna",
        "aodhnait-1720-morna",
        "dairein-1726-morna"
      ]
    },
    {
      "partnershipId": "marriage-ollamh-1699-morna--saoirseasin-1705-cethrenn",
      "childIds": [
        "nuallan-1722-morna",
        "jainn-1725-morna",
        "ciara-1729-morna"
      ]
    },
    {
      "partnershipId": "marriage-caitria-1705-chulainn--latrell-1700-morna",
      "childIds": [
        "varain-1725-morna",
        "eireann-1730-morna"
      ]
    },
    {
      "partnershipId": "marriage-ronanach-1698-morna--teaganach-1701-fintain",
      "childIds": [
        "sulach-1722-morna",
        "cinnia-1725-morna"
      ]
    },
    {
      "partnershipId": "marriage-neasa-1709-culloch--wiarnan-1705-morna",
      "childIds": [
        "oighrig-1730-morna",
        "iuliana-1733-morna"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-cormac-aodhnait-airt",
      "targetFamilyId": "haus-mac-airt",
      "houseId": "house-mac-airt"
    },
    {
      "partnershipId": "marriage-eireann-1589-morna--jodhran-1587-fintain",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-hywel-graine-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-ciara-1626-morna--fergusin-1621-ronain",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-colmas-1630-ui-faill-duibhne--eilidhan-1630-morna",
      "targetFamilyId": "haus-ui-faill-duibhne",
      "houseId": "house-ui-faill-duibhne"
    },
    {
      "partnershipId": "marriage-laoise-1652-morna--maelachin-1648-roth",
      "targetFamilyId": "haus-roth",
      "houseId": "house-roth"
    },
    {
      "partnershipId": "marriage-maelas-1650-coronach--unaas-1652-morna",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-aineinan-1675-morna--ruairias-1671-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-cailte-1694-ronain--fabienne-1695-morna",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-eochaidh-1694-durthacht--raena-1698-morna",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-maelas-1695-coronach--saorla-1700-morna",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-keiras-founder-morna--maebhin-unknown-morna-103-0",
      "targetFamilyId": "haus-muileach"
    },
    {
      "partnershipId": "marriage-brian-1276-morna--etain-unknown-morna-115-2",
      "targetFamilyId": "haus-coronach"
    }
  ],
  "wards": [
    {
      "personId": "ciara-1729-morna",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "fola-1727-roth",
      "parentId": "garbhan-morna"
    }
  ],
  "heads": [
    "garbhan-founder-morna",
    "fearghal-founder-morna",
    "sean-1270-morna",
    "goll-1581-morna",
    "fearghal-1600-morna",
    "brian-1622-morna",
    "sean-1648-morna",
    "goll-1668-morna"
  ],
  "titles": {
    "garbhan-founder-morna": "Hausgründer · Begründer der Mormaer",
    "fearghal-founder-morna": "Historisches Oberhaupt",
    "sean-1270-morna": "Historisches Oberhaupt",
    "goll-1581-morna": "Historisches Oberhaupt",
    "fearghal-1600-morna": "Historisches Oberhaupt",
    "brian-1622-morna": "Historisches Oberhaupt",
    "sean-1648-morna": "Historisches Oberhaupt",
    "goll-1668-morna": "Ard Tiarna · Fürst von Aislearneach",
    "garbhan-morna": "Mor Tiarna von Gaelan · Fürstenerbe",
    "leogan-1715-morna": "Baron"
  },
  "personRoles": {
    "keir-1680-morna": "bastard",
    "ioma-unknown-morna-137-3": "affair",
    "fola-1727-roth": "ward"
  },
  "personExtensions": {
    "kelch-morna": {
      "chartCenterBetweenPartnerPersonIds": [
        "morrioghan-1618-rochraide",
        "ioma-unknown-morna-137-3"
      ],
      "chartPartnerGroupPersonOrder": [
        "morrioghan-1618-rochraide",
        "kelch-morna",
        "ioma-unknown-morna-137-3"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Drei Überlieferungslücken. Keiras begründet Muileach, Brian Coronach. Kelchs Verbindung mit Íoma ist eine Affäre. Fóla Roth ist Garbháns Mündel; Ciara ist nach Laga vermittelt. Oighrigs Namenszelle fehlt nur die öffnende Jahresklammer.",
  "currentHeadId": "goll-1668-morna",
  "heirIds": [
    "garbhan-morna",
    "leogan-1715-morna"
  ],
  "description": "Ui’Morna herrscht von Gaelan aus über Aislearneach. Der legendäre Gründer Garbhán begründete die Reiterkaste der Mormaer und erhielt die Hand der Prinzessin Ainéinan. Reitkunst, die Bindung an das gegebene Wort und die Verehrung Tharannis’ prägen das Haus; aus seiner Linie gingen Muileach und Coronach hervor. Heute führt Fürst Goll den Clan, dessen benannte Nachfolge über Garbhán zu Leogán reicht.",
  "partnershipExtensions": {
    "marriage-kelch-morna--morrioghan-1618-rochraide": {
      "chartAlignPartnerOverChildrenPersonId": "morrioghan-1618-rochraide"
    },
    "affair-ioma-unknown-morna-137-3--kelch-morna": {
      "chartAlignPartnerOverChildrenPersonId": "ioma-unknown-morna-137-3"
    }
  }
});

export const HOUSE_MORNA_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("morna", SOURCE));
