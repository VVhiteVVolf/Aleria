import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_GWENYEN_FAMILY = createVennyrSourceFamily('gwenyen', {
  "personIds": [
    "lewys-founder-gwenyen",
    "iseult-unknown-gwenyen",
    "colwin-gwenyen",
    "hedd-gwenyen",
    "toirche-gwenyen",
    "yvain-gwenyen-ogwych",
    "arlais-gwenyen",
    "olwyn-blodyn",
    "arglwydd-arfordir",
    "goll-oglivy",
    "estrid-todbrand",
    "kynwas-1632-caerdyn",
    "anarawd-gwenyen",
    "delwen-gwenyen",
    "meriel-gwenyen",
    "heveydd-gwenyen",
    "iseult-gwenyen",
    "taleyth-lyfant",
    "griflet-illygoden",
    "dadweir-serenoc",
    "luned-brithyll",
    "godwyn-trachwyll",
    "owain-gwenyen",
    "blodeuyn-gwenyen",
    "blodwen-gwenyen",
    "rhosyn-gwenyen",
    "eurolwyn-gwenyen",
    "glyndwr-gwenyen",
    "endellion-gwenyen",
    "ffion-lyfant",
    "cadwgawn-gwaedlyd",
    "gwifred-balauric",
    "rheidwn-walwrs",
    "ysgonan-blaidd",
    "peathra-wemyss",
    "garselid-morgant",
    "kimball-gwenyen",
    "yvaine-gwenyen",
    "maygann-gwenyen",
    "llewellyn-gwenyen",
    "ceridwen-mochdaer",
    "charlton-trachwyll",
    "jeston-morgryn",
    "mallt-serenoc",
    "lewys-1717-gwenyen",
    "glenis-gwenyen",
    "glyn-gwenyen"
  ],
  "partnershipIds": [
    "marriage-iseult-unknown-gwenyen--lewys-founder-gwenyen",
    "marriage-olwyn-colwin",
    "marriage-arglwydd-hedd-arfordir",
    "marriage-goll-oglivy--toirche-gwenyen",
    "marriage-estrid-yvain-todbrand",
    "marriage-arlais-gwenyen--kynwas-1632-caerdyn",
    "marriage-anarawd-gwenyen--taleyth-lyfant",
    "marriage-griflet-delwen-illygoden",
    "marriage-dadweir-serenoc--meriel-gwenyen",
    "marriage-heveydd-luned-brithyll",
    "marriage-godwyn-iseult-trachwyll",
    "marriage-ffion-owain-lyfant",
    "marriage-cadwgawn-blodeuyn-gwaedlyd",
    "marriage-blodwen-gwenyen--gwifred-balauric",
    "marriage-rheidwn-rhosyn-walwrs",
    "marriage-ysgonan-eurolwyn-blaidd",
    "marriage-glyndwr-gwenyen--peathra-wemyss",
    "marriage-endellion-gwenyen--garselid-morgant",
    "marriage-ceridwen-kimball-mochdaer",
    "marriage-charlton-yvaine-trachwyll",
    "marriage-jeston-morgryn--maygann-gwenyen",
    "marriage-llewellyn-gwenyen--mallt-serenoc"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-iseult-unknown-gwenyen--lewys-founder-gwenyen",
      "childIds": [
        "colwin-gwenyen",
        "hedd-gwenyen",
        "toirche-gwenyen",
        "yvain-gwenyen-ogwych",
        "arlais-gwenyen"
      ],
      "timeJumpId": "gap-gwenyen-founder"
    },
    {
      "partnershipId": "marriage-olwyn-colwin",
      "childIds": [
        "anarawd-gwenyen",
        "delwen-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-estrid-yvain-todbrand",
      "childIds": [
        "meriel-gwenyen",
        "heveydd-gwenyen",
        "iseult-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-anarawd-gwenyen--taleyth-lyfant",
      "childIds": [
        "owain-gwenyen",
        "blodeuyn-gwenyen",
        "blodwen-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-heveydd-luned-brithyll",
      "childIds": [
        "rhosyn-gwenyen",
        "eurolwyn-gwenyen",
        "glyndwr-gwenyen",
        "endellion-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-ffion-owain-lyfant",
      "childIds": [
        "kimball-gwenyen",
        "yvaine-gwenyen",
        "maygann-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-glyndwr-gwenyen--peathra-wemyss",
      "childIds": [
        "llewellyn-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-ceridwen-kimball-mochdaer",
      "childIds": [
        "lewys-1717-gwenyen",
        "glenis-gwenyen"
      ]
    },
    {
      "partnershipId": "marriage-llewellyn-gwenyen--mallt-serenoc",
      "childIds": [
        "glyn-gwenyen"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-arglwydd-hedd-arfordir",
      "targetFamilyId": "haus-arfordir"
    },
    {
      "partnershipId": "marriage-goll-oglivy--toirche-gwenyen",
      "targetFamilyId": "haus-oglivy"
    },
    {
      "partnershipId": "marriage-arlais-gwenyen--kynwas-1632-caerdyn",
      "targetFamilyId": "haus-caerdyn"
    },
    {
      "partnershipId": "marriage-griflet-delwen-illygoden",
      "targetFamilyId": "haus-illygoden"
    },
    {
      "partnershipId": "marriage-dadweir-serenoc--meriel-gwenyen",
      "targetFamilyId": "haus-serenoc"
    },
    {
      "partnershipId": "marriage-godwyn-iseult-trachwyll",
      "targetFamilyId": "haus-trachwyll-talfronwyn"
    },
    {
      "partnershipId": "marriage-cadwgawn-blodeuyn-gwaedlyd",
      "targetFamilyId": "haus-gwaedlyd"
    },
    {
      "partnershipId": "marriage-blodwen-gwenyen--gwifred-balauric",
      "targetFamilyId": "haus-balauric"
    },
    {
      "partnershipId": "marriage-rheidwn-rhosyn-walwrs",
      "targetFamilyId": "haus-walwrs-caer-deheuol"
    },
    {
      "partnershipId": "marriage-ysgonan-eurolwyn-blaidd",
      "targetFamilyId": "haus-blaidd"
    },
    {
      "partnershipId": "marriage-endellion-gwenyen--garselid-morgant",
      "targetFamilyId": "haus-morgant"
    },
    {
      "partnershipId": "marriage-charlton-yvaine-trachwyll",
      "targetFamilyId": "haus-trachwyll-talfronwyn"
    },
    {
      "partnershipId": "marriage-jeston-morgryn--maygann-gwenyen",
      "targetFamilyId": "haus-morgryn"
    }
  ],
  "wards": [],
  "heads": [
    "lewys-founder-gwenyen",
    "colwin-gwenyen",
    "anarawd-gwenyen"
  ],
  "personExtensions": {},
  "sourceNote": "Kimballs Herkunft nennt 1695 statt 1700 in Mochdaer. Maygann ist dieselbe Maygan der Morgryn-Partnerkarte. Eurolwyn wird an die bereits kanonische Eurolwyn/Eurolwyn-Weltperson angeglichen. Rhosyns lebender Status in Quelle und Grafik widerspricht der alten Walwrs-Todesangabe 1720.",
  "headTerms": {
    "lewys-founder-gwenyen": "(????–????)",
    "colwin-gwenyen": "(????–1672)",
    "anarawd-gwenyen": "(1672–1720)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
