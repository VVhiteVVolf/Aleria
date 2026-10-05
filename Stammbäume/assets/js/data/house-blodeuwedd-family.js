import { withVennyrSourceCounterUpgrade } from './vennyr-source-counter-upgrade.js';
import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';

// Belegte Kindergruppen, Ehen und Endknoten aus Tabelle und Stammbaumgrafik.
export const HOUSE_BLODEUWEDD_FAMILY = withVennyrSourceCounterUpgrade(createVennyrSourceFamily('blodeuwedd', {
  "personIds": [
    "uryen-blodyn",
    "maygan-morlais",
    "llywarch-blodeuwedd",
    "eirlys-morlais",
    "rhenawedd-blodeuwedd",
    "ysgonan-serenoc",
    "rhydian-blodeuwedd",
    "malvina-bochdew",
    "lynfa-blodeuwedd",
    "voreyn-blodyn",
    "gawain-blodeuwedd",
    "meredith-morgant",
    "edlym-blodeuwedd",
    "lanette-lyfant",
    "jenita-blodeuwedd",
    "eiddon-arfordir",
    "eilir-blodeuwedd",
    "rhydderch-gwialen",
    "mervin-blodeuwedd",
    "gwladus-serenoc",
    "loyde-blodeuwedd",
    "tanwen-morgant",
    "cariad-blodeuwedd",
    "traherne-morlais",
    "meical-blodeuwedd",
    "izolde-crwynog",
    "maygan-blodeuwedd",
    "efan-brithyll",
    "link-blodeuwedd",
    "gwydion-blodeuwedd",
    "rheidwn-blodeuwedd",
    "sianna-blodeuwedd"
  ],
  "partnershipIds": [
    "marriage-uryen-maygan",
    "marriage-eirlys-morlais--llywarch-blodeuwedd",
    "marriage-rhenawedd-blodeuwedd--ysgonan-serenoc",
    "marriage-malvina-bochdew--rhydian-blodeuwedd",
    "marriage-voreyn-lynfa",
    "marriage-gawain-blodeuwedd--meredith-morgant",
    "marriage-lanette-edlym-lyfant",
    "marriage-eiddon-jenita-arfordir",
    "marriage-eilir-rhydderch-gwialen",
    "marriage-gwladus-serenoc--mervin-blodeuwedd",
    "marriage-loyde-blodeuwedd--tanwen-morgant",
    "marriage-cariad-blodeuwedd--traherne-morlais",
    "marriage-izolde-crwynog--meical-blodeuwedd",
    "marriage-efan-maygan-brithyll"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-uryen-maygan",
      "childIds": [
        "llywarch-blodeuwedd",
        "rhenawedd-blodeuwedd"
      ],
      "timeJumpId": "gap-blodeuwedd-founders"
    },
    {
      "partnershipId": "marriage-eirlys-morlais--llywarch-blodeuwedd",
      "childIds": [
        "rhydian-blodeuwedd",
        "lynfa-blodeuwedd",
        "gawain-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-malvina-bochdew--rhydian-blodeuwedd",
      "childIds": [
        "edlym-blodeuwedd",
        "jenita-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-gawain-blodeuwedd--meredith-morgant",
      "childIds": [
        "eilir-blodeuwedd",
        "mervin-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-lanette-edlym-lyfant",
      "childIds": [
        "loyde-blodeuwedd",
        "cariad-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-gwladus-serenoc--mervin-blodeuwedd",
      "childIds": [
        "meical-blodeuwedd",
        "maygan-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-loyde-blodeuwedd--tanwen-morgant",
      "childIds": [
        "link-blodeuwedd",
        "gwydion-blodeuwedd"
      ]
    },
    {
      "partnershipId": "marriage-izolde-crwynog--meical-blodeuwedd",
      "childIds": [
        "rheidwn-blodeuwedd",
        "sianna-blodeuwedd"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-rhenawedd-blodeuwedd--ysgonan-serenoc",
      "targetFamilyId": "haus-serenoc"
    },
    {
      "partnershipId": "marriage-voreyn-lynfa",
      "targetFamilyId": "haus-blodyn"
    },
    {
      "partnershipId": "marriage-eiddon-jenita-arfordir",
      "targetFamilyId": "haus-arfordir"
    },
    {
      "partnershipId": "marriage-eilir-rhydderch-gwialen",
      "targetFamilyId": "haus-gwialen"
    },
    {
      "partnershipId": "marriage-cariad-blodeuwedd--traherne-morlais",
      "targetFamilyId": "haus-morlais"
    },
    {
      "partnershipId": "marriage-efan-maygan-brithyll",
      "targetFamilyId": "haus-brithyll"
    }
  ],
  "wards": [],
  "heads": [
    "uryen-blodyn",
    "llywarch-blodeuwedd",
    "rhydian-blodeuwedd"
  ],
  "headTerms": { "llywarch-blodeuwedd": "bis 1700", "rhydian-blodeuwedd": "1700–1720" },
  "sourceNote": "Die Amtsjahre Rhydians 1700–1720 sind keine Lebensdaten. Ciarad wird nach Personenkarte und Grafik als Cariad geführt; Llyfant wird mit der bestehenden Lyfant-Akte vereinheitlicht."
}));
