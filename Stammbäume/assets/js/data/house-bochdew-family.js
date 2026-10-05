import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_BOCHDEW_FAMILY = createVennyrSourceFamily('bochdew', {
  "personIds": [
    "macsen-founder-bochdew",
    "siriol-unknown-bochdew",
    "nodawl-bochdew",
    "jowna-bochdew",
    "ffion-morlais",
    "kimball-drewi",
    "gwindor-1625-bochdew",
    "rhondda-bochdew",
    "mawr-bochdew",
    "casthild-todbrand",
    "orbo-gwanrhyd",
    "kerenza-dianc",
    "dalvin-bochdew",
    "malvina-bochdew",
    "illtud-bochdew",
    "anwen-bochdew",
    "endellion-arfordir",
    "rhydian-blodeuwedd",
    "sulwen-morgant",
    "sadwyn-udgorn",
    "emrys-bochdew",
    "alawen-bochdew",
    "valmai-bochdew",
    "gwindor-bochdew",
    "meuric-bochdew",
    "arianwen-bochdew",
    "eilun-bochdew",
    "gaynor-illygoden",
    "merlion-trachwyll",
    "bleddyn-illygoden",
    "einir-walwrs",
    "isolde-diafol",
    "pedrawd-blaidd",
    "bedros-gwaedlyd",
    "macsen-1695-bochdew",
    "megan-bochdew",
    "afanen-bochdew",
    "prys-bochdew",
    "garith-bochdew",
    "bronwen-bochdew",
    "olwyna-gwanrhyd",
    "taredd-illygoden",
    "gryn-illygoden",
    "werbenec-dianc",
    "marve-caerdyn",
    "oth-dyfrgi",
    "kenyon-bochdew",
    "chrystin-bochdew",
    "klervi-bochdew",
    "erim-bochdew"
  ],
  "partnershipIds": [
    "marriage-macsen-founder-bochdew--siriol-unknown-bochdew",
    "marriage-ffion-morlais--nodawl-bochdew",
    "marriage-jowna-bochdew--kimball-drewi",
    "marriage-casthild-gwindor-todbrand",
    "marriage-orbo-gwanrhyd--rhondda-bochdew",
    "marriage-kerenza-mawr-dianc",
    "marriage-endellion-dalvin-bochdew",
    "marriage-malvina-bochdew--rhydian-blodeuwedd",
    "marriage-illtud-bochdew--sulwen-morgant",
    "marriage-anwen-bochdew--sadwyn-udgorn",
    "marriage-gaynor-emrys-illygoden",
    "marriage-merlion-alawen-trachwyll",
    "marriage-bleddyn-valmai-illygoden",
    "marriage-einir-gwindor-walwrs",
    "marriage-isolde-meuric-diafol",
    "marriage-pedrawd-arianwen-blaidd",
    "marriage-bedros-eilun-gwaedlyd",
    "marriage-macsen-1695-bochdew--olwyna-gwanrhyd",
    "marriage-taredd-megan-illygoden",
    "marriage-gryn-afanen-illygoden",
    "marriage-werbenec-prys-dianc",
    "marriage-garith-bochdew--marve-caerdyn",
    "marriage-oth-bronwen-dyfrgi"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-macsen-founder-bochdew--siriol-unknown-bochdew",
      "childIds": [
        "nodawl-bochdew",
        "jowna-bochdew"
      ],
      "timeJumpId": "gap-bochdew-founder"
    },
    {
      "partnershipId": "marriage-ffion-morlais--nodawl-bochdew",
      "childIds": [
        "gwindor-1625-bochdew",
        "rhondda-bochdew",
        "mawr-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-casthild-gwindor-todbrand",
      "childIds": [
        "dalvin-bochdew",
        "malvina-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-kerenza-mawr-dianc",
      "childIds": [
        "illtud-bochdew",
        "anwen-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-endellion-dalvin-bochdew",
      "childIds": [
        "emrys-bochdew",
        "alawen-bochdew",
        "valmai-bochdew",
        "gwindor-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-illtud-bochdew--sulwen-morgant",
      "childIds": [
        "meuric-bochdew",
        "arianwen-bochdew",
        "eilun-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-gaynor-emrys-illygoden",
      "childIds": [
        "macsen-1695-bochdew",
        "megan-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-einir-gwindor-walwrs",
      "childIds": [
        "afanen-bochdew",
        "prys-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-isolde-meuric-diafol",
      "childIds": [
        "garith-bochdew",
        "bronwen-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-macsen-1695-bochdew--olwyna-gwanrhyd",
      "childIds": [
        "kenyon-bochdew",
        "chrystin-bochdew"
      ]
    },
    {
      "partnershipId": "marriage-garith-bochdew--marve-caerdyn",
      "childIds": [
        "klervi-bochdew",
        "erim-bochdew"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-jowna-bochdew--kimball-drewi",
      "targetFamilyId": "haus-drewi"
    },
    {
      "partnershipId": "marriage-orbo-gwanrhyd--rhondda-bochdew",
      "targetFamilyId": "haus-gwanrhyd"
    },
    {
      "partnershipId": "marriage-malvina-bochdew--rhydian-blodeuwedd",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-anwen-bochdew--sadwyn-udgorn",
      "targetFamilyId": "haus-udgorn"
    },
    {
      "partnershipId": "marriage-merlion-alawen-trachwyll",
      "targetFamilyId": "haus-trachwyll-talfronwyn"
    },
    {
      "partnershipId": "marriage-bleddyn-valmai-illygoden",
      "targetFamilyId": "haus-illygoden"
    },
    {
      "partnershipId": "marriage-pedrawd-arianwen-blaidd",
      "targetFamilyId": "haus-blaidd"
    },
    {
      "partnershipId": "marriage-bedros-eilun-gwaedlyd",
      "targetFamilyId": "haus-gwaedlyd"
    },
    {
      "partnershipId": "marriage-taredd-megan-illygoden",
      "targetFamilyId": "haus-illygoden"
    },
    {
      "partnershipId": "marriage-gryn-afanen-illygoden",
      "targetFamilyId": "haus-illygoden"
    },
    {
      "partnershipId": "marriage-werbenec-prys-dianc",
      "targetFamilyId": "haus-dianc"
    },
    {
      "partnershipId": "marriage-oth-bronwen-dyfrgi",
      "targetFamilyId": "haus-dyfrgi"
    }
  ],
  "wards": [],
  "heads": [
    "macsen-founder-bochdew",
    "nodawl-bochdew",
    "gwindor-1625-bochdew",
    "dalvin-bochdew"
  ],
  "personExtensions": {},
  "sourceNote": "Der erste Gwindor behält seine Todbrand-Weltidentität und seinen belegten Namenszusatz O’Caer Ynys. Dalvins eigener Bochdew-Zweig wird entsprechend der Grafik fortgeführt; das Geschlecht wird mit dem Individualporträt abgeglichen. Quelle und Gegenakten enthalten abweichende Endjahre und werden im Quelleninventar dokumentiert.",
  "headTerms": {
    "macsen-founder-bochdew": "(????–????)",
    "nodawl-bochdew": "(????–1691)",
    "gwindor-1625-bochdew": "(1691–1705)",
    "dalvin-bochdew": "(1705–1717)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
