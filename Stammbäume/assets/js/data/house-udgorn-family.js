import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_UDGORN_FAMILY = createVennyrSourceFamily('udgorn', {
  "personIds": [
    "brannock-udgorn",
    "frewi-unknown-udgorn",
    "eywas-udgorn",
    "menna-udgorn",
    "gwladus-balauric",
    "mawr-dyfrgi",
    "sadwyn-udgorn",
    "raewyn-udgorn",
    "cadoc-udgorn",
    "anwen-bochdew",
    "panawr-caerdyn",
    "izobel-serenoc",
    "carnedyr-udgorn",
    "morgana-udgorn",
    "olwyn-udgorn",
    "gwenda-crwynog",
    "gwal-morlais",
    "syvwlch-diafol",
    "tyreke-udgorn",
    "iona-udgorn",
    "frewi-udgorn",
    "meggan-mochdaer",
    "ynyr-dyfrgi",
    "gwryon-balauric",
    "reese-udgorn",
    "oweta-udgorn"
  ],
  "partnershipIds": [
    "marriage-brannock-udgorn--frewi-unknown-udgorn",
    "marriage-eywas-udgorn--gwladus-balauric",
    "marriage-mawr-menna-dyfrgi",
    "marriage-anwen-bochdew--sadwyn-udgorn",
    "marriage-panawr-caerdyn--raewyn-udgorn",
    "marriage-cadoc-udgorn--izobel-serenoc",
    "marriage-carnedyr-udgorn--gwenda-crwynog",
    "marriage-gwal-morlais--morgana-udgorn",
    "marriage-syvwlch-olwyn-diafol",
    "marriage-meggan-tyreke-mochdaer",
    "marriage-ynyr-iona-dyfrgi",
    "marriage-frewi-udgorn--gwryon-balauric"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-brannock-udgorn--frewi-unknown-udgorn",
      "childIds": [
        "eywas-udgorn",
        "menna-udgorn"
      ],
      "timeJumpId": "gap-udgorn-founder"
    },
    {
      "partnershipId": "marriage-eywas-udgorn--gwladus-balauric",
      "childIds": [
        "sadwyn-udgorn",
        "raewyn-udgorn",
        "cadoc-udgorn"
      ]
    },
    {
      "partnershipId": "marriage-anwen-bochdew--sadwyn-udgorn",
      "childIds": [
        "carnedyr-udgorn",
        "morgana-udgorn"
      ]
    },
    {
      "partnershipId": "marriage-cadoc-udgorn--izobel-serenoc",
      "childIds": [
        "olwyn-udgorn"
      ]
    },
    {
      "partnershipId": "marriage-carnedyr-udgorn--gwenda-crwynog",
      "childIds": [
        "tyreke-udgorn",
        "iona-udgorn",
        "frewi-udgorn"
      ]
    },
    {
      "partnershipId": "marriage-meggan-tyreke-mochdaer",
      "childIds": [
        "reese-udgorn",
        "oweta-udgorn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-mawr-menna-dyfrgi",
      "targetFamilyId": "haus-dyfrgi"
    },
    {
      "partnershipId": "marriage-panawr-caerdyn--raewyn-udgorn",
      "targetFamilyId": "haus-caerdyn"
    },
    {
      "partnershipId": "marriage-gwal-morlais--morgana-udgorn",
      "targetFamilyId": "haus-morlais"
    },
    {
      "partnershipId": "marriage-syvwlch-olwyn-diafol",
      "targetFamilyId": "haus-diafol"
    },
    {
      "partnershipId": "marriage-ynyr-iona-dyfrgi",
      "targetFamilyId": "haus-dyfrgi-caer-cryftlawd"
    },
    {
      "partnershipId": "marriage-frewi-udgorn--gwryon-balauric",
      "targetFamilyId": "haus-balauric"
    }
  ],
  "wards": [],
  "heads": [
    "brannock-udgorn",
    "eywas-udgorn",
    "sadwyn-udgorn"
  ],
  "personExtensions": {},
  "sourceNote": "Eywas/Ewyas sind dieselbe Person der beiden neuen Quellen; die Schreibweise der Herkunftskarte Eywas bleibt maßgeblich. Carnedyr/Garnedyr bezeichnen dieselbe Weltperson. Sywlch wird an den bestehenden Syvwlch Diafol angeglichen.",
  "headTerms": {
    "brannock-udgorn": "(????–????)",
    "eywas-udgorn": "(????–1700)",
    "sadwyn-udgorn": "(1700–1718)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
