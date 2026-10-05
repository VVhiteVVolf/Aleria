import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_MORGRYN_FAMILY = createVennyrSourceFamily('morgryn', {
  "personIds": [
    "donncadh-morgryn",
    "wrantha-unknown-morgryn",
    "griflet-morgryn",
    "lunet-morgryn",
    "seithved-1630-morgryn",
    "gwyneth-crwynog",
    "grugyn-arfordir",
    "sadhbh-dobhar",
    "seithved-1650-morgryn",
    "aneira-morgryn",
    "tallwch-morgryn",
    "zara-morgryn",
    "reamha-cairge",
    "cawrdaf-gwaedlyd",
    "selyse-caerdyn",
    "owain-1655-walwrs",
    "merfyn-morgryn",
    "morcant-morgryn",
    "werbenec-morgryn",
    "jinelle-morlais",
    "lorgain-muirin",
    "cerrin-morgant",
    "maldwyn-morgryn",
    "eurona-morgryn",
    "jeston-morgryn",
    "gwenifer-morgryn",
    "teleri-morgryn",
    "malltwyn-arfordir",
    "cynwrig-crwynog",
    "maygann-gwenyen",
    "iltud-gwaedlyd",
    "vaughan-caerdyn",
    "trevyn-morgryn",
    "llwyn-morgryn",
    "cledwyn-morgryn",
    "isotta-morgryn"
  ],
  "partnershipIds": [
    "marriage-donncadh-morgryn--wrantha-unknown-morgryn",
    "marriage-griflet-morgryn--gwyneth-crwynog",
    "marriage-grugyn-lunet-arfordir",
    "marriage-sadhbh-dobhar--seithved-1630-morgryn",
    "marriage-reamha-cairge--seithved-1650-morgryn",
    "marriage-cawrdaf-aneira-gwaedlyd",
    "marriage-selyse-caerdyn--tallwch-morgryn",
    "marriage-zara-owain-walwrs",
    "marriage-jinelle-morlais--merfyn-morgryn",
    "marriage-lorgain-muirin--morcant-morgryn",
    "marriage-cerrin-morgant--werbenec-morgryn",
    "marriage-malltwyn-maldwyn-morgryn",
    "marriage-cynwrig-crwynog--eurona-morgryn",
    "marriage-jeston-morgryn--maygann-gwenyen",
    "marriage-iltud-gwenifer-gwaedlyd",
    "marriage-teleri-morgryn--vaughan-caerdyn"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-donncadh-morgryn--wrantha-unknown-morgryn",
      "childIds": [
        "griflet-morgryn",
        "lunet-morgryn",
        "seithved-1630-morgryn"
      ],
      "timeJumpId": "gap-morgryn-founder"
    },
    {
      "partnershipId": "marriage-griflet-morgryn--gwyneth-crwynog",
      "childIds": [
        "seithved-1650-morgryn",
        "aneira-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-sadhbh-dobhar--seithved-1630-morgryn",
      "childIds": [
        "tallwch-morgryn",
        "zara-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-reamha-cairge--seithved-1650-morgryn",
      "childIds": [
        "merfyn-morgryn",
        "morcant-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-selyse-caerdyn--tallwch-morgryn",
      "childIds": [
        "werbenec-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-jinelle-morlais--merfyn-morgryn",
      "childIds": [
        "maldwyn-morgryn",
        "eurona-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-cerrin-morgant--werbenec-morgryn",
      "childIds": [
        "jeston-morgryn",
        "gwenifer-morgryn",
        "teleri-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-malltwyn-maldwyn-morgryn",
      "childIds": [
        "trevyn-morgryn",
        "llwyn-morgryn"
      ]
    },
    {
      "partnershipId": "marriage-jeston-morgryn--maygann-gwenyen",
      "childIds": [
        "cledwyn-morgryn",
        "isotta-morgryn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-grugyn-lunet-arfordir",
      "targetFamilyId": "haus-arfordir"
    },
    {
      "partnershipId": "marriage-cawrdaf-aneira-gwaedlyd",
      "targetFamilyId": "haus-gwaedlyd"
    },
    {
      "partnershipId": "marriage-zara-owain-walwrs",
      "targetFamilyId": "haus-walwrs"
    },
    {
      "partnershipId": "marriage-lorgain-muirin--morcant-morgryn",
      "targetFamilyId": "haus-muirin"
    },
    {
      "partnershipId": "marriage-cynwrig-crwynog--eurona-morgryn",
      "targetFamilyId": "haus-crwynog"
    },
    {
      "partnershipId": "marriage-iltud-gwenifer-gwaedlyd",
      "targetFamilyId": "haus-gwaedlyd"
    },
    {
      "partnershipId": "marriage-teleri-morgryn--vaughan-caerdyn",
      "targetFamilyId": "haus-caerdyn"
    }
  ],
  "wards": [
    {
      "personId": "isotta-morgryn",
      "targetFamilyId": "haus-wivern"
    }
  ],
  "heads": [
    "donncadh-morgryn",
    "griflet-morgryn",
    "seithved-1650-morgryn"
  ],
  "personExtensions": {},
  "sourceNote": "Die beiden Seithved sind verschiedene Jahrgänge und Weltpersonen. Isotta ist leibliche Tochter Jestons und Maygans und als Mündel an Wivern vermittelt; Brynmors Pflegeelternschaft bleibt getrennt. Die Herkunftstabelle nennt 1720 statt der bisherigen Wivern-Angabe 1719.",
  "headTerms": {
    "donncadh-morgryn": "(????–????)",
    "griflet-morgryn": "(????–1704)",
    "seithved-1650-morgryn": "(1704–1717)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
