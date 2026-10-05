import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_CRWYNOG_FAMILY = createVennyrSourceFamily('crwynog', {
  "personIds": [
    "carthach-crwynog",
    "zirdhna-unknown-crwynog",
    "kynwrig-crwynog",
    "gwyneth-crwynog",
    "penryn-1632-crwynog",
    "seallach-agnew",
    "griflet-morgryn",
    "morwenna-unknown-crwynog",
    "ehangwen-crwynog",
    "arlais-crwynog",
    "wynfor-crwynog",
    "dolena-dianc",
    "eanbharr-muirin",
    "telyn-lyfant",
    "nodawl-crwynog",
    "brynne-crwynog",
    "odawl-crwynog",
    "gwenda-crwynog",
    "oideach-cairge",
    "llwydawg-1672-caerdyn",
    "rhianu-gwanrhyd",
    "carnedyr-udgorn",
    "cynwrig-crwynog",
    "cadi-crwynog",
    "izolde-crwynog",
    "blaun-crwynog",
    "eurona-morgryn",
    "hopcyn-walwrs",
    "meical-blodeuwedd",
    "boudwin-wivern",
    "penryn-1714-crwynog",
    "penllyn-crwynog"
  ],
  "partnershipIds": [
    "marriage-carthach-crwynog--zirdhna-unknown-crwynog",
    "marriage-kynwrig-crwynog--seallach-agnew",
    "marriage-griflet-morgryn--gwyneth-crwynog",
    "marriage-morwenna-unknown-crwynog--penryn-1632-crwynog",
    "marriage-dolena-ehangwen-dianc",
    "marriage-arlais-crwynog--eanbharr-muirin",
    "marriage-telyn-wynfor-lyfant",
    "marriage-nodawl-crwynog--oideach-cairge",
    "marriage-brynne-crwynog--llwydawg-1672-caerdyn",
    "marriage-odawl-crwynog--rhianu-gwanrhyd",
    "marriage-carnedyr-udgorn--gwenda-crwynog",
    "marriage-cynwrig-crwynog--eurona-morgryn",
    "marriage-hopcyn-cadi-walwrs",
    "marriage-izolde-crwynog--meical-blodeuwedd",
    "marriage-boudwin-blaun-wivern"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-carthach-crwynog--zirdhna-unknown-crwynog",
      "childIds": [
        "kynwrig-crwynog",
        "gwyneth-crwynog",
        "penryn-1632-crwynog"
      ],
      "timeJumpId": "gap-crwynog-founder"
    },
    {
      "partnershipId": "marriage-kynwrig-crwynog--seallach-agnew",
      "childIds": [
        "ehangwen-crwynog",
        "arlais-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-morwenna-unknown-crwynog--penryn-1632-crwynog",
      "childIds": [
        "wynfor-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-dolena-ehangwen-dianc",
      "childIds": [
        "nodawl-crwynog",
        "brynne-crwynog",
        "odawl-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-telyn-wynfor-lyfant",
      "childIds": [
        "gwenda-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-nodawl-crwynog--oideach-cairge",
      "childIds": [
        "cynwrig-crwynog",
        "cadi-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-odawl-crwynog--rhianu-gwanrhyd",
      "childIds": [
        "izolde-crwynog",
        "blaun-crwynog"
      ]
    },
    {
      "partnershipId": "marriage-cynwrig-crwynog--eurona-morgryn",
      "childIds": [
        "penryn-1714-crwynog",
        "penllyn-crwynog"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-griflet-morgryn--gwyneth-crwynog",
      "targetFamilyId": "haus-morgryn"
    },
    {
      "partnershipId": "marriage-arlais-crwynog--eanbharr-muirin",
      "targetFamilyId": "haus-muirin"
    },
    {
      "partnershipId": "marriage-brynne-crwynog--llwydawg-1672-caerdyn",
      "targetFamilyId": "haus-caerdyn"
    },
    {
      "partnershipId": "marriage-carnedyr-udgorn--gwenda-crwynog",
      "targetFamilyId": "haus-udgorn"
    },
    {
      "partnershipId": "marriage-hopcyn-cadi-walwrs",
      "targetFamilyId": "haus-walwrs-caer-deheuol"
    },
    {
      "partnershipId": "marriage-izolde-crwynog--meical-blodeuwedd",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-boudwin-blaun-wivern",
      "targetFamilyId": "haus-wivern"
    }
  ],
  "wards": [],
  "heads": [
    "carthach-crwynog",
    "kynwrig-crwynog",
    "ehangwen-crwynog"
  ],
  "personExtensions": {},
  "sourceNote": "Die Crwynog-Herkunft nennt Gwyneths Tod 1711 statt 1714 in Morgryn und Ehangwens Tod 1716 statt 1720 in Dianc. Penryns zwei Jahrgänge bleiben eigene Weltpersonen. Knywrig in der Grafik bezeichnet Kynwrig der Tabelle.",
  "headTerms": {
    "carthach-crwynog": "(????–????)",
    "kynwrig-crwynog": "(????–1698)",
    "ehangwen-crwynog": "(1698–1716)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
