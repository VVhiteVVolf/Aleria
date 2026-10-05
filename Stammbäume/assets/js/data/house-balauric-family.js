import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_BALAURIC_FAMILY = createVennyrSourceFamily('balauric', {
  "personIds": [
    "gwlgawd-balauric",
    "ywen-unknown-balauric",
    "eivyonydd-balauric",
    "gwladus-balauric",
    "keebh-grannd",
    "eywas-udgorn",
    "heveydd-balauric",
    "wenna-balauric",
    "iorwerth-balauric",
    "jinell-mochdaer",
    "gwayne-dyfrgi",
    "ginebra-unknown-balauric",
    "gwifred-balauric",
    "pedrawd-balauric",
    "meinir-balauric",
    "blodwen-gwenyen",
    "eniana-unknown-balauric",
    "dyngannon-serenoc",
    "gwryon-balauric",
    "ywen-balauric",
    "frewi-udgorn",
    "gwydion-1694-drewi",
    "siors-balauric",
    "ysolt-balauric"
  ],
  "partnershipIds": [
    "marriage-gwlgawd-balauric--ywen-unknown-balauric",
    "marriage-eivyonydd-balauric--keebh-grannd",
    "marriage-eywas-udgorn--gwladus-balauric",
    "marriage-jinell-heveydd-mochdaer",
    "marriage-gwayne-wenna-dyfrgi",
    "marriage-ginebra-unknown-balauric--iorwerth-balauric",
    "marriage-blodwen-gwenyen--gwifred-balauric",
    "marriage-eniana-unknown-balauric--pedrawd-balauric",
    "marriage-dyngannon-serenoc--meinir-balauric",
    "marriage-frewi-udgorn--gwryon-balauric",
    "marriage-gwydion-1694-drewi--ywen-balauric"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-gwlgawd-balauric--ywen-unknown-balauric",
      "childIds": [
        "eivyonydd-balauric",
        "gwladus-balauric"
      ],
      "timeJumpId": "gap-balauric-founder"
    },
    {
      "partnershipId": "marriage-eivyonydd-balauric--keebh-grannd",
      "childIds": [
        "heveydd-balauric",
        "wenna-balauric",
        "iorwerth-balauric"
      ]
    },
    {
      "partnershipId": "marriage-jinell-heveydd-mochdaer",
      "childIds": [
        "gwifred-balauric",
        "pedrawd-balauric"
      ]
    },
    {
      "partnershipId": "marriage-ginebra-unknown-balauric--iorwerth-balauric",
      "childIds": [
        "meinir-balauric"
      ]
    },
    {
      "partnershipId": "marriage-blodwen-gwenyen--gwifred-balauric",
      "childIds": [
        "gwryon-balauric"
      ]
    },
    {
      "partnershipId": "marriage-eniana-unknown-balauric--pedrawd-balauric",
      "childIds": [
        "ywen-balauric"
      ]
    },
    {
      "partnershipId": "marriage-frewi-udgorn--gwryon-balauric",
      "childIds": [
        "siors-balauric",
        "ysolt-balauric"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eywas-udgorn--gwladus-balauric",
      "targetFamilyId": "haus-udgorn"
    },
    {
      "partnershipId": "marriage-gwayne-wenna-dyfrgi",
      "targetFamilyId": "haus-dyfrgi"
    },
    {
      "partnershipId": "marriage-dyngannon-serenoc--meinir-balauric",
      "targetFamilyId": "haus-serenoc"
    },
    {
      "partnershipId": "marriage-gwydion-1694-drewi--ywen-balauric",
      "targetFamilyId": "haus-drewi"
    }
  ],
  "wards": [],
  "heads": [
    "gwlgawd-balauric",
    "eivyonydd-balauric",
    "heveydd-balauric",
    "gwifred-balauric"
  ],
  "personExtensions": {},
  "sourceNote": "Die unbeschriftete Kindergruppe Meinir wurde anhand der Grafik Iorwerth/Ginebra zugeordnet. Ywens kopierte Partnerüberschrift Pedrawd wurde berichtigt. Ysolts Quelljahr 175 ist unvollständig; ein genaues Geburtsjahr wird nicht erfunden.",
  "headTerms": {
    "gwlgawd-balauric": "(????–????)",
    "eivyonydd-balauric": "(????–1686)",
    "heveydd-balauric": "(1686–1700)",
    "gwifred-balauric": "(1700–1720)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
