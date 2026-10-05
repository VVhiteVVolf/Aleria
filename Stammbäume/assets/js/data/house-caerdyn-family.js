import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_CAERDYN_FAMILY = createVennyrSourceFamily('caerdyn', {
  "personIds": [
    "llwydawg-founder-caerdyn",
    "cariad-unknown-caerdyn",
    "kynwas-1632-caerdyn",
    "gwladys-caerdyn",
    "limwris-caerdyn",
    "arlais-gwenyen",
    "ercwlff-diafol",
    "iarnach-salaig",
    "kynddilig-caerdyn",
    "selyse-caerdyn",
    "panawr-caerdyn",
    "dajena-morlais",
    "tallwch-morgryn",
    "raewyn-udgorn",
    "llwydawg-1672-caerdyn",
    "rhondda-caerdyn",
    "merrion-caerdyn",
    "cariad-caerdyn",
    "brynne-crwynog",
    "hopcyn-gwanrhyd",
    "beileag-lachlan",
    "kibddar-drewi",
    "garith-caerdyn",
    "maygan-caerdyn",
    "vaughan-caerdyn",
    "marve-caerdyn",
    "elus-drewi",
    "tarawg-diafol",
    "teleri-morgryn",
    "garith-bochdew",
    "kynwas-1715-caerdyn",
    "ysee-caerdyn",
    "orbo-caerdyn",
    "vanora-caerdyn"
  ],
  "partnershipIds": [
    "marriage-cariad-unknown-caerdyn--llwydawg-founder-caerdyn",
    "marriage-arlais-gwenyen--kynwas-1632-caerdyn",
    "marriage-ercwlff-gwladys-diafol",
    "marriage-iarnach-salaig--limwris-caerdyn",
    "marriage-dajena-morlais--kynddilig-caerdyn",
    "marriage-selyse-caerdyn--tallwch-morgryn",
    "marriage-panawr-caerdyn--raewyn-udgorn",
    "marriage-brynne-crwynog--llwydawg-1672-caerdyn",
    "marriage-hopcyn-gwanrhyd--rhondda-caerdyn",
    "marriage-beileag-lachlan--merrion-caerdyn",
    "marriage-cariad-caerdyn--kibddar-drewi",
    "marriage-elus-drewi--garith-caerdyn",
    "marriage-tarawg-maygan-diafol",
    "marriage-teleri-morgryn--vaughan-caerdyn",
    "marriage-garith-bochdew--marve-caerdyn"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-cariad-unknown-caerdyn--llwydawg-founder-caerdyn",
      "childIds": [
        "kynwas-1632-caerdyn",
        "gwladys-caerdyn",
        "limwris-caerdyn"
      ],
      "timeJumpId": "gap-caerdyn-founder"
    },
    {
      "partnershipId": "marriage-arlais-gwenyen--kynwas-1632-caerdyn",
      "childIds": [
        "kynddilig-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-iarnach-salaig--limwris-caerdyn",
      "childIds": [
        "selyse-caerdyn",
        "panawr-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-dajena-morlais--kynddilig-caerdyn",
      "childIds": [
        "llwydawg-1672-caerdyn",
        "rhondda-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-panawr-caerdyn--raewyn-udgorn",
      "childIds": [
        "merrion-caerdyn",
        "cariad-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-brynne-crwynog--llwydawg-1672-caerdyn",
      "childIds": [
        "garith-caerdyn",
        "maygan-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-beileag-lachlan--merrion-caerdyn",
      "childIds": [
        "vaughan-caerdyn",
        "marve-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-elus-drewi--garith-caerdyn",
      "childIds": [
        "kynwas-1715-caerdyn",
        "ysee-caerdyn"
      ]
    },
    {
      "partnershipId": "marriage-teleri-morgryn--vaughan-caerdyn",
      "childIds": [
        "orbo-caerdyn",
        "vanora-caerdyn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-ercwlff-gwladys-diafol",
      "targetFamilyId": "haus-diafol"
    },
    {
      "partnershipId": "marriage-selyse-caerdyn--tallwch-morgryn",
      "targetFamilyId": "haus-morgryn"
    },
    {
      "partnershipId": "marriage-hopcyn-gwanrhyd--rhondda-caerdyn",
      "targetFamilyId": "haus-gwanrhyd"
    },
    {
      "partnershipId": "marriage-cariad-caerdyn--kibddar-drewi",
      "targetFamilyId": "haus-drewi"
    },
    {
      "partnershipId": "marriage-tarawg-maygan-diafol",
      "targetFamilyId": "haus-diafol"
    },
    {
      "partnershipId": "marriage-garith-bochdew--marve-caerdyn",
      "targetFamilyId": "haus-bochdew"
    }
  ],
  "wards": [],
  "heads": [
    "llwydawg-founder-caerdyn",
    "kynwas-1632-caerdyn",
    "kynddilig-caerdyn",
    "llwydawg-1672-caerdyn"
  ],
  "personExtensions": {},
  "sourceNote": "Die kopierten Überschriften Kynddilig an Kynwas/Arlais wurden anhand der Grafik berichtigt. Vier unter 16 verstorbene Kinder erhalten Kindersilhouetten.",
  "headTerms": {
    "llwydawg-founder-caerdyn": "(????–????)",
    "kynwas-1632-caerdyn": "(????–1699)",
    "kynddilig-caerdyn": "(1699–1719)",
    "llwydawg-1672-caerdyn": "(1719–1720)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
