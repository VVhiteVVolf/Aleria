import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';

// Paar- und Kindergruppen nach der beschrifteten Nutzerquelle, keine Ableitung aus Spaltennähe.
const SOURCE = Object.freeze({
  "personIds": [
    "wuirseach-founder-rochraide",
    "sceolaigh-unknown-ui-rochraide",
    "eadbhard-founder-eldath",
    "deelan-eldath",
    "hadhbh-roich",
    "jodhran-1582-eldath",
    "onora-1586-eldath",
    "xuinchin-seaghdha",
    "neachdainn-tuirseach",
    "keallach-1607-eldath",
    "sceolaigh-eldath",
    "biorna-lachlann",
    "lughaid-1610-rochraide",
    "eoghair-1628-eldath",
    "innogen-1633-eldath",
    "trianne-eldath",
    "ziocha-1632-eldath",
    "garbhan-eldath",
    "eireann-drummond",
    "macraith-mochoe",
    "magdis-varangr",
    "eanraig-bhaird",
    "dervla-bhaird",
    "aonghus-eldath",
    "eilidhan-eldath",
    "graine-eldath",
    "eadbhard-eldath",
    "caireann-ceinselaig",
    "dubshlaine-holloran",
    "manas-1653-eamhra",
    "frida-kaltherz",
    "jodhran-1669-eldath",
    "grainnein-eldath",
    "trianne-1672-eldath",
    "hiarnan-eldath",
    "ethna-eldath",
    "wiomar-eldath",
    "sorcha-1674-rochraide",
    "gaothaire-duibhne",
    "haileigh-mochoe",
    "yairbh-1677-seaghdha",
    "asbjorn-kampfgeborene",
    "wubhna-unknown-eldath",
    "dealan-eldath",
    "onora-eldrath",
    "keallach-1697-eldath",
    "ziocha-1703-eldath",
    "malach-eldath",
    "haolthan-eldath",
    "innogen-eldath",
    "geallan-eldath",
    "kalman-eldath",
    "peadhra-ceinselaig",
    "einion-illysywen",
    "dearbhla-1701-tuirseach",
    "sarraas-leite",
    "onuist-cleirigh",
    "sior-illysywen"
  ],
  "partnershipIds": [
    "marriage-sceolaigh-unknown-ui-rochraide--wuirseach-founder-rochraide",
    "marriage-eadbhard-founder-eldath--hadhbh-roich",
    "marriage-jodhran-1582-eldath--xuinchin-seaghdha",
    "marriage-neachdainn-tuirseach--onora-1586-eldath",
    "marriage-biorna-lachlann--keallach-1607-eldath",
    "marriage-lughaid-1610-rochraide--sceolaigh-eldath",
    "marriage-eireann-drummond--eoghair-1628-eldath",
    "marriage-innogen-1633-eldath--macraith-mochoe",
    "marriage-magdis-trianne-varangr",
    "marriage-eanraig-bhaird--ziocha-1632-eldath",
    "marriage-dervla-bhaird--garbhan-eldath",
    "marriage-aonghus-eldath--caireann-ceinselaig",
    "marriage-dubshlaine-holloran--eilidhan-eldath",
    "marriage-graine-eldath--manas-1653-eamhra",
    "marriage-eadbhard-frida-eldath",
    "marriage-jodhran-1669-eldath--sorcha-1674-rochraide",
    "marriage-gaothaire-duibhne--grainnein-eldath",
    "marriage-haileigh-mochoe--trianne-1672-eldath",
    "marriage-hiarnan-eldath--yairbh-1677-seaghdha",
    "marriage-asbjorn-ethna-kampfgeborene",
    "marriage-wiomar-eldath--wubhna-unknown-eldath",
    "marriage-dealan-eldath--peadhra-ceinselaig",
    "affair-einion-onora",
    "engagement-dearbhla-1701-tuirseach--keallach-1697-eldath",
    "forced-keallach-1697-eldath--sarraas-leite",
    "marriage-onuist-cleirigh--ziocha-1703-eldath",
    "engagement-sior-innogen"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-sceolaigh-unknown-ui-rochraide--wuirseach-founder-rochraide",
      "childIds": [
        "eadbhard-founder-eldath",
        "deelan-eldath"
      ],
      "timeJumpId": "gap-eldath-founder"
    },
    {
      "partnershipId": "marriage-eadbhard-founder-eldath--hadhbh-roich",
      "childIds": [
        "jodhran-1582-eldath",
        "onora-1586-eldath"
      ],
      "timeJumpId": "gap-eldath-eadbhard"
    },
    {
      "partnershipId": "marriage-jodhran-1582-eldath--xuinchin-seaghdha",
      "childIds": [
        "keallach-1607-eldath",
        "sceolaigh-eldath"
      ]
    },
    {
      "partnershipId": "marriage-biorna-lachlann--keallach-1607-eldath",
      "childIds": [
        "eoghair-1628-eldath",
        "innogen-1633-eldath",
        "trianne-eldath",
        "ziocha-1632-eldath",
        "garbhan-eldath"
      ]
    },
    {
      "partnershipId": "marriage-eireann-drummond--eoghair-1628-eldath",
      "childIds": [
        "aonghus-eldath",
        "eilidhan-eldath"
      ]
    },
    {
      "partnershipId": "marriage-magdis-trianne-varangr",
      "childIds": [
        "graine-eldath"
      ]
    },
    {
      "partnershipId": "marriage-dervla-bhaird--garbhan-eldath",
      "childIds": [
        "eadbhard-eldath"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-eldath--caireann-ceinselaig",
      "childIds": [
        "jodhran-1669-eldath",
        "grainnein-eldath",
        "trianne-1672-eldath"
      ]
    },
    {
      "partnershipId": "marriage-eadbhard-frida-eldath",
      "childIds": [
        "hiarnan-eldath",
        "ethna-eldath",
        "wiomar-eldath"
      ]
    },
    {
      "partnershipId": "marriage-jodhran-1669-eldath--sorcha-1674-rochraide",
      "childIds": [
        "dealan-eldath",
        "onora-eldrath",
        "keallach-1697-eldath"
      ]
    },
    {
      "partnershipId": "marriage-haileigh-mochoe--trianne-1672-eldath",
      "childIds": [
        "ziocha-1703-eldath"
      ]
    },
    {
      "partnershipId": "marriage-hiarnan-eldath--yairbh-1677-seaghdha",
      "childIds": [
        "malach-eldath",
        "haolthan-eldath",
        "innogen-eldath"
      ]
    },
    {
      "partnershipId": "marriage-wiomar-eldath--wubhna-unknown-eldath",
      "childIds": [
        "geallan-eldath",
        "kalman-eldath"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-neachdainn-tuirseach--onora-1586-eldath",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-lughaid-1610-rochraide--sceolaigh-eldath",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-innogen-1633-eldath--macraith-mochoe",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-eanraig-bhaird--ziocha-1632-eldath",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-dubshlaine-holloran--eilidhan-eldath",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-graine-eldath--manas-1653-eamhra",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-gaothaire-duibhne--grainnein-eldath",
      "targetFamilyId": "haus-duibhne",
      "houseId": "house-duibhne"
    },
    {
      "partnershipId": "marriage-asbjorn-ethna-kampfgeborene",
      "targetFamilyId": "haus-kampfgeborene",
      "houseId": "house-kampfgeborene"
    },
    {
      "partnershipId": "affair-einion-onora",
      "targetFamilyId": "haus-illysywen",
      "houseId": "house-illysywen"
    },
    {
      "partnershipId": "marriage-onuist-cleirigh--ziocha-1703-eldath",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-sior-innogen",
      "targetFamilyId": "haus-illysywen",
      "houseId": "house-illysywen"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "wuirseach-founder-rochraide",
    "eadbhard-founder-eldath",
    "jodhran-1582-eldath",
    "keallach-1607-eldath",
    "eoghair-1628-eldath",
    "aonghus-eldath"
  ],
  "titles": {
    "wuirseach-founder-rochraide": "Gründer des Kadettenclans Eldath",
    "eadbhard-founder-eldath": "Oberhaupt des Clans",
    "jodhran-1582-eldath": "Oberhaupt · bis 1647",
    "keallach-1607-eldath": "Oberhaupt · 1647–1674",
    "eoghair-1628-eldath": "Oberhaupt · 1674–1701",
    "aonghus-eldath": "Oberhaupt · 1701–1720"
  },
  "personRoles": {
    "einion-illysywen": "affair",
    "sarraas-leite": "forced"
  },
  "sourceNote": "Wuirseach Rochraide und seine Gemahlin sind dieselben Gründerpersonen wie in Rochraide. Zwei Überlieferungslücken. Eadbhard (1656) mit Frida wird von seinem gleichnamigen frühen Vorfahren getrennt. Onoras Einion-Verbindung ist eine Affäre; Keallachs Dearbhla-Verbindung eine Verlobung und die Sàrraas-Verbindung erzwungen. Die kopierte Überschrift Sior bezeichnet Innogen als Siors Partnerin. Eoghair (1651), Eireanns Partner in Eamhra, bleibt ohne erfundene Abstammung von Eoghair (1628) und Aonghus getrennt."
});

export const HOUSE_ELDATH_FAMILY = createCeitheachSourceFamily('eldath', SOURCE);
