import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';
import { VENNYR_REMAINING_SOURCE_CATALOG } from './vennyr-remaining-source-catalog.js';

// Kindergruppen und Ehen wurden mit der beschrifteten Stammbaumgrafik abgeglichen.
export const HOUSE_GWANRHYD_FAMILY = createVennyrSourceFamily('gwanrhyd', {
  "personIds": [
    "kethtrwm-gwanrhyd",
    "freijya-unknown-gwanrhyd",
    "orbo-gwanrhyd",
    "gwales-gwanrhyd",
    "rhondda-bochdew",
    "hildegard-unknown-gwanrhyd",
    "blaun-gwanrhyd",
    "gwyron-gwanrhyd",
    "lilifer-gwanrhyd",
    "igraine-gwanrhyd",
    "tomos-lyfant",
    "traharyan-diafol",
    "hopcyn-gwanrhyd",
    "rhianu-gwanrhyd",
    "dafydd-gwanrhyd",
    "rhondda-caerdyn",
    "odawl-crwynog",
    "leulu-unknown-gwanrhyd",
    "maddox-gwanrhyd",
    "olwyna-gwanrhyd",
    "kenyon-gwanrhyd",
    "kyndra-gwanrhyd",
    "gwenifer-morlais",
    "macsen-1695-bochdew",
    "lughna-duff",
    "kynwas-drewi",
    "powys-gwanrhyd",
    "morin-gwanrhyd",
    "siors-gwanrhyd",
    "nerys-gwanrhyd"
  ],
  "partnershipIds": [
    "marriage-freijya-unknown-gwanrhyd--kethtrwm-gwanrhyd",
    "marriage-orbo-gwanrhyd--rhondda-bochdew",
    "marriage-gwales-gwanrhyd--hildegard-unknown-gwanrhyd",
    "marriage-tomos-blaun-lyfant",
    "marriage-gwyron-gwanrhyd--lilifer-gwanrhyd",
    "marriage-traharyan-igraine-diafol",
    "marriage-hopcyn-gwanrhyd--rhondda-caerdyn",
    "marriage-odawl-crwynog--rhianu-gwanrhyd",
    "marriage-dafydd-gwanrhyd--leulu-unknown-gwanrhyd",
    "marriage-gwenifer-morlais--maddox-gwanrhyd",
    "marriage-macsen-1695-bochdew--olwyna-gwanrhyd",
    "marriage-kenyon-gwanrhyd--lughna-duff",
    "marriage-kyndra-gwanrhyd--kynwas-drewi"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-freijya-unknown-gwanrhyd--kethtrwm-gwanrhyd",
      "childIds": [
        "orbo-gwanrhyd",
        "gwales-gwanrhyd"
      ],
      "timeJumpId": "gap-gwanrhyd-founder"
    },
    {
      "partnershipId": "marriage-orbo-gwanrhyd--rhondda-bochdew",
      "childIds": [
        "blaun-gwanrhyd",
        "gwyron-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-gwales-gwanrhyd--hildegard-unknown-gwanrhyd",
      "childIds": [
        "lilifer-gwanrhyd",
        "igraine-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-gwyron-gwanrhyd--lilifer-gwanrhyd",
      "childIds": [
        "hopcyn-gwanrhyd",
        "rhianu-gwanrhyd",
        "dafydd-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-hopcyn-gwanrhyd--rhondda-caerdyn",
      "childIds": [
        "maddox-gwanrhyd",
        "olwyna-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-dafydd-gwanrhyd--leulu-unknown-gwanrhyd",
      "childIds": [
        "kenyon-gwanrhyd",
        "kyndra-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-gwenifer-morlais--maddox-gwanrhyd",
      "childIds": [
        "powys-gwanrhyd",
        "morin-gwanrhyd"
      ]
    },
    {
      "partnershipId": "marriage-kenyon-gwanrhyd--lughna-duff",
      "childIds": [
        "siors-gwanrhyd",
        "nerys-gwanrhyd"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-tomos-blaun-lyfant",
      "targetFamilyId": "haus-lyfant"
    },
    {
      "partnershipId": "marriage-traharyan-igraine-diafol",
      "targetFamilyId": "haus-diafol"
    },
    {
      "partnershipId": "marriage-odawl-crwynog--rhianu-gwanrhyd",
      "targetFamilyId": "haus-crwynog"
    },
    {
      "partnershipId": "marriage-macsen-1695-bochdew--olwyna-gwanrhyd",
      "targetFamilyId": "haus-bochdew"
    },
    {
      "partnershipId": "marriage-kyndra-gwanrhyd--kynwas-drewi",
      "targetFamilyId": "haus-drewi"
    }
  ],
  "wards": [],
  "heads": [
    "kethtrwm-gwanrhyd",
    "orbo-gwanrhyd",
    "gwyron-gwanrhyd",
    "hopcyn-gwanrhyd"
  ],
  "personExtensions": {
    "lilifer-gwanrhyd": {
      "chartRepeatForPartnershipIds": [
        "marriage-gwyron-gwanrhyd--lilifer-gwanrhyd"
      ]
    },
    "gwyron-gwanrhyd": {
      "chartPartnerMirrorForPartnershipIds": [
        "marriage-gwyron-gwanrhyd--lilifer-gwanrhyd"
      ]
    }
  },
  "sourceNote": "Gwyron und Lilifer sind zwei getrennt abstammende Angehörige desselben Hauses und jeweils nur eine Weltperson. Die gegenseitig wiederholten Partnerkarten der Tabelle begründen eine einzige Ehe; ihre drei Kinder werden ausschließlich am Gwyron-Zweig fortgeführt. Daffydd/Leulu/Lleulu wurden an die beschrifteten Karten Dafydd/Leulu angeglichen.",
  "headTerms": {
    "kethtrwm-gwanrhyd": "(????–????)",
    "orbo-gwanrhyd": "(????–1697)",
    "gwyron-gwanrhyd": "(1697–1718)",
    "hopcyn-gwanrhyd": "(1718–1720)"
  }
}, VENNYR_REMAINING_SOURCE_CATALOG);
