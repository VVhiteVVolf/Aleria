import { withVennyrSourceCounterUpgrade } from './vennyr-source-counter-upgrade.js';
import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';

// Belegte Kindergruppen, Ehen und Endknoten aus Tabelle und Stammbaumgrafik.
export const HOUSE_SERENOC_FAMILY = withVennyrSourceCounterUpgrade(createVennyrSourceFamily('serenoc', {
  "personIds": [
    "mordred-founder-serenoc",
    "mervyne-unknown-serenoc-founder",
    "ysgonan-serenoc",
    "rhenawedd-blodeuwedd",
    "caitrin-serenoc",
    "ehangwen-morgant",
    "gwifred-serenoc",
    "gwendolen-tylwyth",
    "dadweir-serenoc",
    "meriel-gwenyen",
    "blodwen-serenoc",
    "sayres-morlais",
    "arawn-serenoc",
    "celyn-1652-diafol",
    "izobel-serenoc",
    "cadoc-udgorn",
    "kynwrig-serenoc",
    "nadya-morgant",
    "gwladus-serenoc",
    "mervin-blodeuwedd",
    "dyngannon-serenoc",
    "meinir-balauric",
    "neila-serenoc",
    "cadwgan-lyfant",
    "trachmyr-serenoc",
    "siriol-blodyn",
    "lunet-serenoc",
    "kibddar-1692-morlais",
    "mallt-serenoc",
    "llewellyn-gwenyen",
    "mervyn-serenoc",
    "riderch-cwingod",
    "mordred-1712-serenoc",
    "land-serenoc"
  ],
  "partnershipIds": [
    "marriage-mervyne-unknown-serenoc-founder--mordred-founder-serenoc",
    "marriage-rhenawedd-blodeuwedd--ysgonan-serenoc",
    "marriage-caitrin-serenoc--ehangwen-morgant",
    "marriage-gwendolen-tylwyth--gwifred-serenoc",
    "marriage-dadweir-serenoc--meriel-gwenyen",
    "marriage-blodwen-serenoc--sayres-morlais",
    "marriage-celyn-arawn-diafol",
    "marriage-cadoc-udgorn--izobel-serenoc",
    "marriage-kynwrig-serenoc--nadya-morgant",
    "marriage-gwladus-serenoc--mervin-blodeuwedd",
    "marriage-dyngannon-serenoc--meinir-balauric",
    "marriage-cadwgan-neila-lyfant",
    "marriage-siriol-trachmyr",
    "marriage-kibddar-1692-morlais--lunet-serenoc",
    "marriage-llewellyn-gwenyen--mallt-serenoc",
    "marriage-riderch-mervyn-cwingod"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-mervyne-unknown-serenoc-founder--mordred-founder-serenoc",
      "childIds": [
        "ysgonan-serenoc",
        "caitrin-serenoc",
        "gwifred-serenoc"
      ],
      "timeJumpId": "gap-serenoc-founders"
    },
    {
      "partnershipId": "marriage-rhenawedd-blodeuwedd--ysgonan-serenoc",
      "childIds": [
        "dadweir-serenoc",
        "blodwen-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-gwendolen-tylwyth--gwifred-serenoc",
      "childIds": [
        "arawn-serenoc",
        "izobel-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-dadweir-serenoc--meriel-gwenyen",
      "childIds": [
        "kynwrig-serenoc",
        "gwladus-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-celyn-arawn-diafol",
      "childIds": [
        "dyngannon-serenoc",
        "neila-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-kynwrig-serenoc--nadya-morgant",
      "childIds": [
        "trachmyr-serenoc",
        "lunet-serenoc",
        "mallt-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-dyngannon-serenoc--meinir-balauric",
      "childIds": [
        "mervyn-serenoc"
      ]
    },
    {
      "partnershipId": "marriage-siriol-trachmyr",
      "childIds": [
        "mordred-1712-serenoc",
        "land-serenoc"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-caitrin-serenoc--ehangwen-morgant",
      "targetFamilyId": "haus-morgant"
    },
    {
      "partnershipId": "marriage-blodwen-serenoc--sayres-morlais",
      "targetFamilyId": "haus-morlais"
    },
    {
      "partnershipId": "marriage-cadoc-udgorn--izobel-serenoc",
      "targetFamilyId": "haus-udgorn"
    },
    {
      "partnershipId": "marriage-gwladus-serenoc--mervin-blodeuwedd",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-cadwgan-neila-lyfant",
      "targetFamilyId": "haus-lyfant-caer-asgwrn"
    },
    {
      "partnershipId": "marriage-kibddar-1692-morlais--lunet-serenoc",
      "targetFamilyId": "haus-morlais"
    },
    {
      "partnershipId": "marriage-llewellyn-gwenyen--mallt-serenoc",
      "targetFamilyId": "haus-gwenyen"
    },
    {
      "partnershipId": "marriage-riderch-mervyn-cwingod",
      "targetFamilyId": "haus-cwningod"
    }
  ],
  "wards": [],
  "heads": [
    "mordred-founder-serenoc",
    "ysgonan-serenoc",
    "dadweir-serenoc",
    "kynwrig-serenoc"
  ],
  "headTerms": { "ysgonan-serenoc": "bis 1712", "dadweir-serenoc": "1712–1719", "kynwrig-serenoc": "1719–1720" },
  "sourceNote": "Knywrig wird nach Partnerkarte und Morgant-Gegenquelle als Kynwrig geführt. Mervyne (1700) ist dieselbe Weltperson wie die bisherige Mervyn der Cwingod-Akte; deren technische IDs bleiben stabil. Die neue Quelle bestätigt Name und Ehe mit Riderch; eine zusätzliche Engla wird nicht angelegt. Amtsjahre 1712–1719 und 1719–1720 sind keine Geburtsdaten."
}));
