import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "goraidhas-founder-tordarroch",
    "ronnat-unknown-tir-an-tordarroch-founder",
    "mairtin-1582-tordarroch",
    "nora-1585-tordarroch",
    "lughna-eoghainn",
    "fergusach-1582-bhaird",
    "goraidhas-1605-tordarroch",
    "carthann-tordarroch",
    "odhran-1610-tordarroch",
    "eadaoin-carnegie",
    "cinnia-unknown-tir-an-tordarroch-1611",
    "peathgho-tordarroch",
    "grainne-tordarroch",
    "fintan-1629-tordarroch",
    "diarmaid-1631-tordarroch",
    "raonaid-1632-rochraide",
    "goll-tuirseach",
    "draighean-fiantorc",
    "goraidhas-1650-tordarroch",
    "ronnat-tordarroch",
    "mairtin-tordarroch",
    "cinead-tordarroch",
    "breanna-tordarroch",
    "iseabail-1653-leite",
    "colum-eachtrai",
    "pallaith-blar",
    "noracha-ceinselaig",
    "eamon-mochoe",
    "eubhog-tordarroch",
    "heulyn-tordarroch",
    "odhran-1676-tordarroch",
    "breasal-tordarroch",
    "beathag-tordarroch",
    "nansaidh-1677-mochoe",
    "lachtna-1671-holloran",
    "etain-coronach",
    "hoibre-1676-craobhan",
    "dairein-1669-eamhra",
    "calum-tordarroch",
    "peathgho-1700-tordarroch",
    "fintan-1699-tordarroch",
    "maol-tordarroch",
    "diarmaid-1700-tordarroch",
    "nora-tordarroch",
    "dervla-1702-bhaird",
    "grian-cleirigh",
    "dechtire-1697-ceinselaig",
    "dallan-1695-rochraide"
  ],
  "partnershipIds": [
    "marriage-goraidhas-founder-tordarroch--ronnat-unknown-tir-an-tordarroch-founder",
    "marriage-lughna-eoghainn--mairtin-1582-tordarroch",
    "marriage-fergusach-1582-bhaird--nora-1585-tordarroch",
    "marriage-eadaoin-carnegie--goraidhas-1605-tordarroch",
    "marriage-cinnia-unknown-tir-an-tordarroch-1611--odhran-1610-tordarroch",
    "marriage-peathgho-tordarroch--raonaid-1632-rochraide",
    "marriage-goll-tuirseach--grainne-tordarroch",
    "marriage-diarmaid-1631-tordarroch--draighean-fiantorc",
    "marriage-goraidhas-1650-tordarroch--iseabail-1653-leite",
    "marriage-colum-eachtrai--ronnat-tordarroch",
    "marriage-pallaith-mairtin-blar",
    "marriage-cinead-tordarroch--noracha-ceinselaig",
    "marriage-breanna-tordarroch--eamon-mochoe",
    "marriage-eubhog-tordarroch--nansaidh-1677-mochoe",
    "marriage-heulyn-tordarroch--lachtna-1671-holloran",
    "marriage-etain-coronach--odhran-1676-tordarroch",
    "marriage-breasal-tordarroch--hoibre-1676-craobhan",
    "marriage-beathag-tordarroch--dairein-1669-eamhra",
    "marriage-calum-tordarroch--dervla-1702-bhaird",
    "engagement-grian-cleirigh--peathgho-1700-tordarroch",
    "marriage-dechtire-1697-ceinselaig--diarmaid-1700-tordarroch",
    "marriage-dallan-1695-rochraide--nora-tordarroch"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-goraidhas-founder-tordarroch--ronnat-unknown-tir-an-tordarroch-founder",
      "childIds": [
        "mairtin-1582-tordarroch",
        "nora-1585-tordarroch"
      ],
      "timeJumpId": "gap-tir-an-tordarroch-founder"
    },
    {
      "partnershipId": "marriage-lughna-eoghainn--mairtin-1582-tordarroch",
      "childIds": [
        "goraidhas-1605-tordarroch",
        "carthann-tordarroch",
        "odhran-1610-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-eadaoin-carnegie--goraidhas-1605-tordarroch",
      "childIds": [
        "peathgho-tordarroch",
        "grainne-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-cinnia-unknown-tir-an-tordarroch-1611--odhran-1610-tordarroch",
      "childIds": [
        "fintan-1629-tordarroch",
        "diarmaid-1631-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-peathgho-tordarroch--raonaid-1632-rochraide",
      "childIds": [
        "goraidhas-1650-tordarroch",
        "ronnat-tordarroch",
        "mairtin-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-diarmaid-1631-tordarroch--draighean-fiantorc",
      "childIds": [
        "cinead-tordarroch",
        "breanna-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-goraidhas-1650-tordarroch--iseabail-1653-leite",
      "childIds": [
        "eubhog-tordarroch",
        "heulyn-tordarroch",
        "odhran-1676-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-cinead-tordarroch--noracha-ceinselaig",
      "childIds": [
        "breasal-tordarroch",
        "beathag-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-eubhog-tordarroch--nansaidh-1677-mochoe",
      "childIds": [
        "calum-tordarroch",
        "peathgho-1700-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-etain-coronach--odhran-1676-tordarroch",
      "childIds": [
        "fintan-1699-tordarroch",
        "maol-tordarroch"
      ]
    },
    {
      "partnershipId": "marriage-breasal-tordarroch--hoibre-1676-craobhan",
      "childIds": [
        "diarmaid-1700-tordarroch",
        "nora-tordarroch"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-fergusach-1582-bhaird--nora-1585-tordarroch",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "marriage-goll-tuirseach--grainne-tordarroch",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-colum-eachtrai--ronnat-tordarroch",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-pallaith-mairtin-blar",
      "targetFamilyId": "haus-nic-blar",
      "houseId": "house-nic-blar"
    },
    {
      "partnershipId": "marriage-breanna-tordarroch--eamon-mochoe",
      "targetFamilyId": "haus-an-morchoe",
      "houseId": "house-an-morchoe"
    },
    {
      "partnershipId": "marriage-heulyn-tordarroch--lachtna-1671-holloran",
      "targetFamilyId": "haus-nic-holloran",
      "houseId": "house-nic-holloran"
    },
    {
      "partnershipId": "marriage-beathag-tordarroch--dairein-1669-eamhra",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-calum-tordarroch--dervla-1702-bhaird",
      "targetFamilyId": "haus-an-bhaird",
      "houseId": "house-an-bhaird"
    },
    {
      "partnershipId": "engagement-grian-cleirigh--peathgho-1700-tordarroch",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-dechtire-1697-ceinselaig--diarmaid-1700-tordarroch",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-dallan-1695-rochraide--nora-tordarroch",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "goraidhas-founder-tordarroch",
    "mairtin-1582-tordarroch",
    "goraidhas-1605-tordarroch",
    "peathgho-tordarroch",
    "goraidhas-1650-tordarroch"
  ],
  "titles": {
    "goraidhas-founder-tordarroch": "Legendärer Gründer des Clans",
    "mairtin-1582-tordarroch": "Oberhaupt bis 1652",
    "goraidhas-1605-tordarroch": "Oberhaupt 1652–1679",
    "peathgho-tordarroch": "Oberhaupt 1679–1697",
    "goraidhas-1650-tordarroch": "Oberhaupt 1697–1720",
    "carthann-tordarroch": "Erbe · Eremit"
  },
  "personRoles": {},
  "sourceNote": "Ein serieller Quellenzeitsprung. Càrthann (1607, Tod offen) ist nicht der Ghaisgh-Partner Càrthann (1608–1667). Verlobungen von Peathgho und Nóra bleiben getrennt von den Ehen Calums und Diarmaids."
});

export const HOUSE_TIR_AN_TORDARROCH_FAMILY = createCeitheachSourceFamily('tir-an-tordarroch', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG);
