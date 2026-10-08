import { withFaelaornSourceCounterUpgrade } from './faelaorn-source-counter-upgrade.js';
import { withVennyrSourceCounterUpgrade } from './vennyr-source-counter-upgrade.js';
import { createVennyrSourceFamily } from './vennyr-source-family-builder.js';

// Belegte Kindergruppen, Ehen und Endknoten aus Tabelle und Stammbaumgrafik.
export const HOUSE_MORGANT_FAMILY = withFaelaornSourceCounterUpgrade(withVennyrSourceCounterUpgrade(createVennyrSourceFamily('morgant', {
  "personIds": [
    "kenehyr-founder-morgant",
    "meredith-unknown-morgant-founder",
    "heveydd-morgant",
    "sgarlad-tylwyth",
    "eniana-morgant",
    "fotor-morlais",
    "ehangwen-morgant",
    "caitrin-serenoc",
    "hetwn-morgant",
    "telyn-blodyn",
    "meredith-morgant",
    "gawain-blodeuwedd",
    "kenehyr-1655-morgant",
    "lughna-dundas",
    "sulwen-morgant",
    "illtud-bochdew",
    "garselid-morgant",
    "endellion-gwenyen",
    "nadya-morgant",
    "kynwrig-serenoc",
    "cerrin-morgant",
    "werbenec-morgryn",
    "islwyn-morgant",
    "sluagh-suilgeach",
    "griffin-morgant",
    "klervi-morlais",
    "taranis-morgant",
    "gwawr-diafol",
    "tanwen-morgant",
    "loyde-blodeuwedd",
    "jeston-morgant",
    "olwyn-morgant",
    "tegin-morgant",
    "march-morgant"
  ],
  "partnershipIds": [
    "marriage-kenehyr-founder-morgant--meredith-unknown-morgant-founder",
    "marriage-heveydd-morgant--sgarlad-tylwyth",
    "marriage-eniana-morgant--fotor-morlais",
    "marriage-caitrin-serenoc--ehangwen-morgant",
    "marriage-telyn-hetwn",
    "marriage-gawain-blodeuwedd--meredith-morgant",
    "marriage-kenehyr-1655-morgant--lughna-dundas",
    "marriage-illtud-bochdew--sulwen-morgant",
    "marriage-endellion-gwenyen--garselid-morgant",
    "marriage-kynwrig-serenoc--nadya-morgant",
    "marriage-cerrin-morgant--werbenec-morgryn",
    "marriage-islwyn-morgant--sluagh-suilgeach",
    "marriage-griffin-morgant--klervi-morlais",
    "marriage-gwawr-taranis-diafol",
    "marriage-loyde-blodeuwedd--tanwen-morgant"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-kenehyr-founder-morgant--meredith-unknown-morgant-founder",
      "childIds": [
        "heveydd-morgant",
        "eniana-morgant",
        "ehangwen-morgant"
      ],
      "timeJumpId": "gap-morgant-founders"
    },
    {
      "partnershipId": "marriage-heveydd-morgant--sgarlad-tylwyth",
      "childIds": [
        "hetwn-morgant",
        "meredith-morgant"
      ]
    },
    {
      "partnershipId": "marriage-caitrin-serenoc--ehangwen-morgant",
      "childIds": [
        "kenehyr-1655-morgant",
        "sulwen-morgant"
      ]
    },
    {
      "partnershipId": "marriage-telyn-hetwn",
      "childIds": [
        "garselid-morgant",
        "nadya-morgant"
      ]
    },
    {
      "partnershipId": "marriage-kenehyr-1655-morgant--lughna-dundas",
      "childIds": [
        "cerrin-morgant",
        "islwyn-morgant"
      ]
    },
    {
      "partnershipId": "marriage-endellion-gwenyen--garselid-morgant",
      "childIds": [
        "griffin-morgant"
      ]
    },
    {
      "partnershipId": "marriage-islwyn-morgant--sluagh-suilgeach",
      "childIds": [
        "taranis-morgant",
        "tanwen-morgant"
      ]
    },
    {
      "partnershipId": "marriage-griffin-morgant--klervi-morlais",
      "childIds": [
        "jeston-morgant",
        "olwyn-morgant"
      ]
    },
    {
      "partnershipId": "marriage-gwawr-taranis-diafol",
      "childIds": [
        "tegin-morgant",
        "march-morgant"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eniana-morgant--fotor-morlais",
      "targetFamilyId": "haus-morlais"
    },
    {
      "partnershipId": "marriage-gawain-blodeuwedd--meredith-morgant",
      "targetFamilyId": "haus-blodeuwedd"
    },
    {
      "partnershipId": "marriage-illtud-bochdew--sulwen-morgant",
      "targetFamilyId": "haus-bochdew"
    },
    {
      "partnershipId": "marriage-kynwrig-serenoc--nadya-morgant",
      "targetFamilyId": "haus-serenoc"
    },
    {
      "partnershipId": "marriage-cerrin-morgant--werbenec-morgryn",
      "targetFamilyId": "haus-morgryn"
    },
    {
      "partnershipId": "marriage-loyde-blodeuwedd--tanwen-morgant",
      "targetFamilyId": "haus-blodeuwedd"
    }
  ],
  "wards": [
    {
      "personId": "march-morgant",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn",
      "name": "Haus Stwatchn",
      "notes": "Haus Stwatchn aus Faelaorn; Nutzerkorrektur vom 05.10.2026. Noch keine eigene Hausakte vorhanden."
    }
  ],
  "heads": [
    "kenehyr-founder-morgant",
    "heveydd-morgant",
    "hetwn-morgant"
  ],
  "headTerms": { "heveydd-morgant": "bis 1700", "hetwn-morgant": "1700–1720" },
  "sourceNote": "Tegins unmögliches Geburtsjahr 1618 wird wegen der 1697/1700 geborenen Eltern zu 1718 korrigiert. Hetwns Individualporträt zeigt einen Mann; Telyns als wegverheirateter Blodyn-Zweig geführte Ehe wird in Morgant fortgesetzt. Marchs Vermittlung an Haus Stwatchn aus Faelaorn ist ausdrücklich vom Nutzer bestätigt; die noch fehlende Hausakte wird nur notiert. Sluach wird nach Partnerkarte als Sluagh geführt."
})));
