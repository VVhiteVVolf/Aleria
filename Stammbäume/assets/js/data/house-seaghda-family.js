import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "zachrach-founder-seaghdha",
    "yairbh-unknown-seaghda-founder",
    "niallach-seaghdha",
    "xuinchin-seaghdha",
    "vallaigh-1584-eamhra",
    "jodhran-1582-eldath",
    "tadgh-seaghdha",
    "xarobh-1610-seaghdha",
    "peigi-seaghdha",
    "ulrikka-kampfgeborene",
    "eideard-anbhair",
    "fearghal-rochraide",
    "manus-1627-seaghdha",
    "etain-seaghdha",
    "malachy-1628-seaghdha",
    "oirigh-1632-tuirseach",
    "koarnach-1628-eamhra",
    "jenifrydd-illysywen",
    "balor-seaghdha",
    "doirind-seaghdha",
    "kermena-seaghdha",
    "valinach-seaghdha",
    "ruadh-nuadat",
    "kester-bhaird",
    "reamonn-1650-mochoe",
    "eimhin-unknown-seaghda-1661",
    "eairdsidh-holloran",
    "zeargan-seaghdha",
    "xuinchin-1669-seaghdha",
    "niallach-1669-seaghdha",
    "fionnag-seaghdha",
    "peadar-seaghdha",
    "xubhnan-seaghdha",
    "yairbh-1677-seaghdha",
    "moira-1678-rochraide",
    "macthar-mochoe",
    "caoimheas-cleirigh",
    "iosolda-unknown-seaghda-1684",
    "uachall-unknown-seaghda-1686",
    "catania-unknown-seaghda-1677",
    "hiarnan-eldath",
    "zachrach-1696-seaghdha",
    "manus-1701-seaghdha",
    "xarobh-1693-seaghdha",
    "tadgh-1699-seaghdha",
    "oiric-seaghdha",
    "quarlach-seaghdha",
    "keir-seaghdha",
    "malachy-1699-seaghdha",
    "urlar-seaghdha",
    "eireann-tuirseach",
    "biorna-feannag",
    "zorman-seaghdha",
    "zibhhi-seaghdha"
  ],
  "partnershipIds": [
    "marriage-yairbh-unknown-seaghda-founder--zachrach-founder-seaghdha",
    "marriage-niallach-seaghdha--vallaigh-1584-eamhra",
    "marriage-jodhran-1582-eldath--xuinchin-seaghdha",
    "marriage-tadgh-ulrikka-kampfgeborene",
    "marriage-eideard-anbhair--xarobh-1610-seaghdha",
    "marriage-fearghal-rochraide--peigi-seaghdha",
    "marriage-manus-1627-seaghdha--oirigh-1632-tuirseach",
    "marriage-etain-seaghdha--koarnach-1628-eamhra",
    "marriage-jenifrydd-illysywen--malachy-1628-seaghdha",
    "marriage-balor-seaghdha--ruadh-nuadat",
    "marriage-doirind-seaghdha--kester-bhaird",
    "marriage-kermena-seaghdha--reamonn-1650-mochoe",
    "affair-eimhin-unknown-seaghda-1661--valinach-seaghdha",
    "marriage-eairdsidh-holloran--valinach-seaghdha",
    "marriage-moira-1678-rochraide--zeargan-seaghdha",
    "marriage-macthar-mochoe--xuinchin-1669-seaghdha",
    "marriage-caoimheas-cleirigh--niallach-1669-seaghdha",
    "affair-fionnag-seaghdha--iosolda-unknown-seaghda-1684",
    "affair-peadar-seaghdha--uachall-unknown-seaghda-1686",
    "marriage-catania-unknown-seaghda-1677--xubhnan-seaghdha",
    "marriage-hiarnan-eldath--yairbh-1677-seaghdha",
    "marriage-eireann-tuirseach--zachrach-1696-seaghdha",
    "forced-biorna-feannag--zachrach-1696-seaghdha"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-yairbh-unknown-seaghda-founder--zachrach-founder-seaghdha",
      "childIds": [
        "niallach-seaghdha",
        "xuinchin-seaghdha"
      ],
      "timeJumpId": "gap-seaghda-founder"
    },
    {
      "partnershipId": "marriage-niallach-seaghdha--vallaigh-1584-eamhra",
      "childIds": [
        "tadgh-seaghdha",
        "xarobh-1610-seaghdha",
        "peigi-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-tadgh-ulrikka-kampfgeborene",
      "childIds": [
        "manus-1627-seaghdha",
        "etain-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-eideard-anbhair--xarobh-1610-seaghdha",
      "childIds": [
        "malachy-1628-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-manus-1627-seaghdha--oirigh-1632-tuirseach",
      "childIds": [
        "balor-seaghdha",
        "doirind-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-jenifrydd-illysywen--malachy-1628-seaghdha",
      "childIds": [
        "kermena-seaghdha",
        "valinach-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-balor-seaghdha--ruadh-nuadat",
      "childIds": [
        "zeargan-seaghdha",
        "xuinchin-1669-seaghdha",
        "niallach-1669-seaghdha"
      ]
    },
    {
      "partnershipId": "affair-eimhin-unknown-seaghda-1661--valinach-seaghdha",
      "childIds": [
        "fionnag-seaghdha",
        "peadar-seaghdha"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-eairdsidh-holloran--valinach-seaghdha",
      "childIds": [
        "xubhnan-seaghdha",
        "yairbh-1677-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-moira-1678-rochraide--zeargan-seaghdha",
      "childIds": [
        "zachrach-1696-seaghdha",
        "manus-1701-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-caoimheas-cleirigh--niallach-1669-seaghdha",
      "childIds": [
        "xarobh-1693-seaghdha",
        "tadgh-1699-seaghdha"
      ]
    },
    {
      "partnershipId": "affair-fionnag-seaghdha--iosolda-unknown-seaghda-1684",
      "childIds": [
        "oiric-seaghdha"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-peadar-seaghdha--uachall-unknown-seaghda-1686",
      "childIds": [
        "quarlach-seaghdha",
        "keir-seaghdha"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-catania-unknown-seaghda-1677--xubhnan-seaghdha",
      "childIds": [
        "malachy-1699-seaghdha",
        "urlar-seaghdha"
      ]
    },
    {
      "partnershipId": "marriage-eireann-tuirseach--zachrach-1696-seaghdha",
      "childIds": [
        "zorman-seaghdha"
      ]
    },
    {
      "partnershipId": "forced-biorna-feannag--zachrach-1696-seaghdha",
      "childIds": [
        "zibhhi-seaghdha"
      ],
      "legitimacy": "bastard"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-jodhran-1582-eldath--xuinchin-seaghdha",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-fearghal-rochraide--peigi-seaghdha",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-etain-seaghdha--koarnach-1628-eamhra",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-doirind-seaghdha--kester-bhaird",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-kermena-seaghdha--reamonn-1650-mochoe",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-macthar-mochoe--xuinchin-1669-seaghdha",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-hiarnan-eldath--yairbh-1677-seaghdha",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "zachrach-founder-seaghdha",
    "niallach-seaghdha",
    "tadgh-seaghdha",
    "manus-1627-seaghdha",
    "balor-seaghdha"
  ],
  "titles": {
    "zachrach-founder-seaghdha": "Legendärer Gründer des Clans",
    "niallach-seaghdha": "Oberhaupt bis 1651",
    "tadgh-seaghdha": "Oberhaupt 1651–1654",
    "manus-1627-seaghdha": "Oberhaupt 1654–1691",
    "balor-seaghdha": "Oberhaupt 1691–1720",
    "zachrach-1696-seaghdha": "Mönch in Dunfal"
  },
  "personRoles": {
    "eimhin-unknown-seaghda-1661": "affair",
    "iosolda-unknown-seaghda-1684": "affair",
    "uachall-unknown-seaghda-1686": "affair",
    "biorna-feannag": "forced"
  },
  "sourceNote": "Ein Quellenzeitsprung. Valínachs Ehe und Affäre sowie die Bastardlinien bleiben getrennt. Zachrachs Verbindung zu Biorna ist erzwungen. Die bereits bestätigte Geburt Zeargáns 1675 bleibt erhalten; 1669 ist eine abweichende Tabellenangabe."
});

export const HOUSE_SEAGHDA_FAMILY = createCeitheachSourceFamily('seaghda', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG);
