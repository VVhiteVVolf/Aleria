import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withCeitheachSourceCounterUpgrade } from './ceitheach-source-counter-upgrade.js';
import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';

// Paar- und Kindergruppen nach der beschrifteten Nutzerquelle, keine Ableitung aus Spaltennähe.
const SOURCE = Object.freeze({
  "personIds": [
    "ronan-founder-craobhan",
    "valibh-unknown-craobhan",
    "fothradh-1585-craobhan",
    "orlaith-1588-craobhan",
    "kessog-luachra",
    "wuirseach-1588-rochraide",
    "xibhne-craobhan",
    "dughall-1609-craobhan",
    "hoibre-craobhan",
    "tormodh-fiachrach",
    "caitriona-fintain",
    "hiarnan-gallchobhair",
    "faelan-1630-craobhan",
    "nansaidh-craobhan",
    "eimhear-duff",
    "peadarog-leite",
    "aonghas-craobhan",
    "orlaith-craobhan",
    "rualainn-craobhan",
    "eideard-craobhan",
    "ronan-craobhan",
    "tordis-kampfgeborene",
    "rioghnan-laidir",
    "baldvin-varangr",
    "amlaibh-goidin",
    "hurralaith-blar",
    "yachara-craobhan",
    "fionn-craobhan",
    "fothradh-1671-craobhan",
    "hoibre-1676-craobhan",
    "lorcanas-tuirseach",
    "deirdre-ceinselaig",
    "cairisti-duibhne",
    "breasal-tordarroch",
    "faolan-craobhan",
    "vailibh-craobhan",
    "keebh-craobhan",
    "cormac-craobhan",
    "dughall-1698-craobhan",
    "grainneog-connchobhair",
    "oisean-somhairle",
    "kelch-rochraide",
    "catania-unknown-craobhan",
    "tallulah-unknown-craobhan",
    "aonghas-1716-craobhan",
    "ronan-1718-craobhan",
    "yibhne-craobhan",
    "conan-craobhan",
    "faelan-1719-craobhan"
  ],
  "partnershipIds": [
    "marriage-ronan-founder-craobhan--valibh-unknown-craobhan",
    "marriage-fothradh-1585-craobhan--kessog-luachra",
    "marriage-orlaith-1588-craobhan--wuirseach-1588-rochraide",
    "marriage-tormodh-xibhne",
    "marriage-caitriona-fintain--dughall-1609-craobhan",
    "marriage-hiarnan-hoibre",
    "marriage-eimhear-duff--faelan-1630-craobhan",
    "marriage-nansaidh-craobhan--peadarog-leite",
    "marriage-aonghas-tordis-kampfgeborene",
    "marriage-rioghnan-orlaith-laidir",
    "marriage-baldvin-rualainn-varangr",
    "marriage-amlaibh-goidin--eideard-craobhan",
    "marriage-hurralaith-ronan-blar",
    "marriage-lorcanas-tuirseach--yachara-craobhan",
    "marriage-deirdre-ceinselaig--fionn-craobhan",
    "marriage-cairisti-duibhne--fothradh-1671-craobhan",
    "marriage-breasal-tordarroch--hoibre-1676-craobhan",
    "marriage-faolan-craobhan--grainneog-connchobhair",
    "marriage-oisean-vailibh",
    "engagement-keebh-craobhan--kelch-rochraide",
    "marriage-catania-unknown-craobhan--cormac-craobhan",
    "marriage-dughall-1698-craobhan--tallulah-unknown-craobhan"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-ronan-founder-craobhan--valibh-unknown-craobhan",
      "childIds": [
        "fothradh-1585-craobhan",
        "orlaith-1588-craobhan"
      ],
      "timeJumpId": "gap-craobhan-founder"
    },
    {
      "partnershipId": "marriage-fothradh-1585-craobhan--kessog-luachra",
      "childIds": [
        "xibhne-craobhan",
        "dughall-1609-craobhan",
        "hoibre-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-caitriona-fintain--dughall-1609-craobhan",
      "childIds": [
        "faelan-1630-craobhan",
        "nansaidh-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-eimhear-duff--faelan-1630-craobhan",
      "childIds": [
        "aonghas-craobhan",
        "orlaith-craobhan",
        "rualainn-craobhan",
        "eideard-craobhan",
        "ronan-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-aonghas-tordis-kampfgeborene",
      "childIds": [
        "yachara-craobhan",
        "fionn-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-hurralaith-ronan-blar",
      "childIds": [
        "fothradh-1671-craobhan",
        "hoibre-1676-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-deirdre-ceinselaig--fionn-craobhan",
      "childIds": [
        "faolan-craobhan",
        "vailibh-craobhan",
        "keebh-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-cairisti-duibhne--fothradh-1671-craobhan",
      "childIds": [
        "cormac-craobhan",
        "dughall-1698-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-faolan-craobhan--grainneog-connchobhair",
      "childIds": [
        "aonghas-1716-craobhan",
        "ronan-1718-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-catania-unknown-craobhan--cormac-craobhan",
      "childIds": [
        "yibhne-craobhan",
        "conan-craobhan"
      ]
    },
    {
      "partnershipId": "marriage-dughall-1698-craobhan--tallulah-unknown-craobhan",
      "childIds": [
        "faelan-1719-craobhan"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-orlaith-1588-craobhan--wuirseach-1588-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    },
    {
      "partnershipId": "marriage-tormodh-xibhne",
      "targetFamilyId": "haus-fiachrach",
      "houseId": "house-fiachrach"
    },
    {
      "partnershipId": "marriage-hiarnan-hoibre",
      "targetFamilyId": "haus-gallchobhair",
      "houseId": "house-gallchobhair"
    },
    {
      "partnershipId": "marriage-nansaidh-craobhan--peadarog-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-rioghnan-orlaith-laidir",
      "targetFamilyId": "haus-laidir",
      "houseId": "house-laidir"
    },
    {
      "partnershipId": "marriage-baldvin-rualainn-varangr",
      "targetFamilyId": "haus-varangr",
      "houseId": "house-varangr"
    },
    {
      "partnershipId": "marriage-amlaibh-goidin--eideard-craobhan",
      "targetFamilyId": "haus-goidin",
      "houseId": "house-goidin"
    },
    {
      "partnershipId": "marriage-lorcanas-tuirseach--yachara-craobhan",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-breasal-tordarroch--hoibre-1676-craobhan",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-oisean-vailibh",
      "targetFamilyId": "haus-somhairle",
      "houseId": "house-somhairle"
    },
    {
      "partnershipId": "engagement-keebh-craobhan--kelch-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "ronan-founder-craobhan",
    "fothradh-1585-craobhan",
    "dughall-1609-craobhan",
    "faelan-1630-craobhan",
    "aonghas-craobhan"
  ],
  "titles": {
    "ronan-founder-craobhan": "Legendärer Gründer des Clans",
    "fothradh-1585-craobhan": "Oberhaupt · bis 1649",
    "dughall-1609-craobhan": "Oberhaupt · 1649–1666",
    "faelan-1630-craobhan": "Oberhaupt · 1666–1704",
    "aonghas-craobhan": "Oberhaupt · 1704–1720",
    "faelan-1719-craobhan": "In der Quelle genannter Erbe des Clans"
  },
  "personRoles": {},
  "sourceNote": "Die Grafik bestätigt die fortgeführte Linie über Dùghall und Faelan sowie Faelan (1719) als überlebenden Erben. Kessogs Geburtsjahr wurde auf Nutzerwunsch 1692→1592, Deirdres 1775→1675 korrigiert. Vier 1720 unter 16 verstorbene Kinder sowie Keebh und Kelch erhalten Kindersilhouetten; anonyme Verlobungsvorlagen werden nicht angelegt."
});

export const HOUSE_CRAOBHAN_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withCeitheachSourceCounterUpgrade(createCeitheachSourceFamily('craobhan', SOURCE))));
