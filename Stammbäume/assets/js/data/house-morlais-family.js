import { withVennyrSourceCounterUpgrade } from './vennyr-source-counter-upgrade.js';
import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';

// Belegte Kindergruppen, Ehen und Endknoten aus Tabelle und Stammbaumgrafik.
export const HOUSE_MORLAIS_FAMILY = withVennyrSourceCounterUpgrade(createVennyrSourceFamily('morlais', {
  "personIds": [
    "kynwas-founder-morlais",
    "tegin-unknown-morlais-founder",
    "maygan-morlais",
    "uryen-blodyn",
    "kibddar-founder-morlais",
    "quendolin-unknown-morlais-kibddar",
    "gallgoid-morlais",
    "caomhog-culloch",
    "ffion-morlais",
    "nodawl-bochdew",
    "caedmon-morlais",
    "iarnait-eoghainn",
    "eirlys-morlais",
    "llywarch-blodeuwedd",
    "fotor-morlais",
    "eniana-morgant",
    "meuric-morlais",
    "myf-dyfrgi",
    "tegin-morlais",
    "cadfan-arfordir",
    "sayres-morlais",
    "blodwen-serenoc",
    "dajena-morlais",
    "kynddilig-caerdyn",
    "kynwas-morlais",
    "tanwen-blodyn",
    "jinelle-morlais",
    "merfyn-morgryn",
    "gwal-morlais",
    "morgana-udgorn",
    "traherne-morlais",
    "cariad-blodeuwedd",
    "gwenifer-morlais",
    "maddox-gwanrhyd",
    "kibddar-1692-morlais",
    "lunet-serenoc",
    "klervi-morlais",
    "griffin-morgant",
    "pebin-morlais",
    "hetwn-morlais",
    "ianto-morlais",
    "hedd-morlais"
  ],
  "partnershipIds": [
    "marriage-kynwas-founder-morlais--tegin-unknown-morlais-founder",
    "marriage-uryen-maygan",
    "marriage-kibddar-founder-morlais--quendolin-unknown-morlais-kibddar",
    "marriage-caomhog-culloch--gallgoid-morlais",
    "marriage-ffion-morlais--nodawl-bochdew",
    "marriage-caedmon-morlais--iarnait-eoghainn",
    "marriage-eirlys-morlais--llywarch-blodeuwedd",
    "marriage-eniana-morgant--fotor-morlais",
    "marriage-myf-meuric-dyfrgi",
    "marriage-cadfan-tegin-arfordir",
    "marriage-blodwen-serenoc--sayres-morlais",
    "marriage-dajena-morlais--kynddilig-caerdyn",
    "marriage-tanwen-kynwas",
    "marriage-jinelle-morlais--merfyn-morgryn",
    "marriage-gwal-morlais--morgana-udgorn",
    "marriage-cariad-blodeuwedd--traherne-morlais",
    "marriage-gwenifer-morlais--maddox-gwanrhyd",
    "marriage-kibddar-1692-morlais--lunet-serenoc",
    "marriage-griffin-morgant--klervi-morlais"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-kynwas-founder-morlais--tegin-unknown-morlais-founder",
      "childIds": [
        "maygan-morlais",
        "kibddar-founder-morlais"
      ],
      "timeJumpId": "gap-morlais-founders"
    },
    {
      "partnershipId": "marriage-kibddar-founder-morlais--quendolin-unknown-morlais-kibddar",
      "childIds": [
        "gallgoid-morlais",
        "ffion-morlais"
      ],
      "timeJumpId": "gap-morlais-kibddar"
    },
    {
      "partnershipId": "marriage-caomhog-culloch--gallgoid-morlais",
      "childIds": [
        "caedmon-morlais",
        "eirlys-morlais",
        "fotor-morlais"
      ]
    },
    {
      "partnershipId": "marriage-caedmon-morlais--iarnait-eoghainn",
      "childIds": [
        "meuric-morlais",
        "tegin-morlais"
      ]
    },
    {
      "partnershipId": "marriage-eniana-morgant--fotor-morlais",
      "childIds": [
        "sayres-morlais",
        "dajena-morlais"
      ]
    },
    {
      "partnershipId": "marriage-myf-meuric-dyfrgi",
      "childIds": [
        "kynwas-morlais",
        "jinelle-morlais"
      ]
    },
    {
      "partnershipId": "marriage-blodwen-serenoc--sayres-morlais",
      "childIds": [
        "gwal-morlais"
      ]
    },
    {
      "partnershipId": "marriage-tanwen-kynwas",
      "childIds": [
        "traherne-morlais",
        "gwenifer-morlais"
      ]
    },
    {
      "partnershipId": "marriage-gwal-morlais--morgana-udgorn",
      "childIds": [
        "kibddar-1692-morlais",
        "klervi-morlais"
      ]
    },
    {
      "partnershipId": "marriage-cariad-blodeuwedd--traherne-morlais",
      "childIds": [
        "pebin-morlais",
        "hetwn-morlais"
      ]
    },
    {
      "partnershipId": "marriage-kibddar-1692-morlais--lunet-serenoc",
      "childIds": [
        "ianto-morlais",
        "hedd-morlais"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-uryen-maygan",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-ffion-morlais--nodawl-bochdew",
      "targetFamilyId": "haus-bochdew"
    },
    {
      "partnershipId": "marriage-eirlys-morlais--llywarch-blodeuwedd",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-cadfan-tegin-arfordir",
      "targetFamilyId": "haus-arfordir"
    },
    {
      "partnershipId": "marriage-dajena-morlais--kynddilig-caerdyn",
      "targetFamilyId": "haus-caerdyn"
    },
    {
      "partnershipId": "marriage-jinelle-morlais--merfyn-morgryn",
      "targetFamilyId": "haus-morgryn"
    },
    {
      "partnershipId": "marriage-gwenifer-morlais--maddox-gwanrhyd",
      "targetFamilyId": "haus-gwanrhyd"
    },
    {
      "partnershipId": "marriage-griffin-morgant--klervi-morlais",
      "targetFamilyId": "haus-morgant"
    }
  ],
  "wards": [
    {
      "personId": "hedd-morlais",
      "targetFamilyId": "haus-cwningod"
    }
  ],
  "heads": [
    "kynwas-founder-morlais",
    "kibddar-founder-morlais",
    "gallgoid-morlais",
    "caedmon-morlais",
    "kynwas-morlais"
  ],
  "headTerms": { "gallgoid-morlais": "bis 1667", "caedmon-morlais": "1667–1697" },
  "sourceNote": "Die zwei Punktreihen werden als getrennte serielle Überlieferungslücken geführt. Maygans Zweig endet am gegründeten Haus Blodeuwedd vor der zweiten Lücke. Kopierte Partnerüberschriften werden nach Kindergruppen und Grafik aufgelöst: Gallgoid/Caomhóg und Caedmon/Iarnait. Die Amtsangabe 1667 bei Kynwas widerspricht seiner Geburt 1671; sein Amtsbeginn bleibt offen. Hedd ist leiblicher Sohn von Kibddar (1692) und Lunet Serenoc und wird als Mündel bei Cwingod fortgeführt. Pebins, Hetwns und Iantos Lebensjahre bleiben unbekannt."
}));
