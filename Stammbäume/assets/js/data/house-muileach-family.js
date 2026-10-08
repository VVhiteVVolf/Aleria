import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "keiras-founder-morna",
    "maebhin-unknown-morna-103-0",
    "labhruinn-1605-muileach",
    "eimearin-1616-muileach",
    "fearchar-1618-muileach",
    "isibeal-1608-treada",
    "tarlachan-1611-durthacht",
    "ainean-unknown-muileach-100-2",
    "oisean-muileach",
    "aisling-1635-muileach",
    "uruisg-1638-muileach",
    "dechtire-1630-ceinselaig",
    "brian-1635-coronach",
    "vailibh-unknown-muileach-110-2",
    "keiras-1650-muileach",
    "brighdeach-1654-muileach",
    "rogaire-muileach",
    "cailte-1660-muileach",
    "hoireabard-1654-fiantorc",
    "fionn-1650-ui-faill-duibhne",
    "aodhluan-tuirseach",
    "pallaigh-unknown-muileach-120-3",
    "aonghas-1670-muileach",
    "maebhin-1677-muileach",
    "haileigh-muileach",
    "aodhagan-1673-muileach",
    "searan-1680-muileach",
    "eilidh-1673-durthacht",
    "catan-1674-morna",
    "tiarnog-choinnich",
    "taillte-1676-treada",
    "ruadhan-1678-dal-leite",
    "labhruinn-1697-muileach",
    "brighdeach-1700-muileach",
    "fearchar-1703-muileach",
    "maol-1699-muileach",
    "siobhan-muileach",
    "iubhail-1700-nessa",
    "tadhgan-1696-fiantorc",
    "aingeal-1706-rieach",
    "aithne-unknown-muileach-140-3",
    "rhys-dienyddiwr",
    "goll-1720-muileach",
    "maebhin-1722-muileach",
    "cailte-1726-muileach",
    "keiras-1729-muileach",
    "lochin-1724-muileach",
    "rogaire-1728-muileach",
    "iosag-1721-muileach",
    "dalara-1723-muileach"
  ],
  "partnershipIds": [
    "marriage-keiras-founder-morna--maebhin-unknown-morna-103-0",
    "marriage-isibeal-1608-treada--labhruinn-1605-muileach",
    "marriage-eimearin-1616-muileach--tarlachan-1611-durthacht",
    "marriage-ainean-unknown-muileach-100-2--fearchar-1618-muileach",
    "marriage-dechtire-1630-ceinselaig--oisean-muileach",
    "marriage-aisling-1635-muileach--brian-1635-coronach",
    "marriage-uruisg-1638-muileach--vailibh-unknown-muileach-110-2",
    "marriage-hoireabard-1654-fiantorc--keiras-1650-muileach",
    "marriage-brighdeach-1654-muileach--fionn-1650-ui-faill-duibhne",
    "marriage-aodhluan-tuirseach--rogaire-muileach",
    "marriage-cailte-1660-muileach--pallaigh-unknown-muileach-120-3",
    "marriage-aonghas-1670-muileach--eilidh-1673-durthacht",
    "marriage-catan-1674-morna--maebhin-1677-muileach",
    "marriage-tiarnog-haileigh-choinnich",
    "marriage-aodhagan-1673-muileach--taillte-1676-treada",
    "marriage-ruadhan-1678-dal-leite--searan-1680-muileach",
    "marriage-iubhail-1700-nessa--labhruinn-1697-muileach",
    "marriage-brighdeach-1700-muileach--tadhgan-1696-fiantorc",
    "marriage-aingeal-1706-rieach--fearchar-1703-muileach",
    "marriage-aithne-unknown-muileach-140-3--maol-1699-muileach",
    "marriage-rhys-siobhan-dienyddiwr"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-keiras-founder-morna--maebhin-unknown-morna-103-0",
      "childIds": [
        "labhruinn-1605-muileach",
        "eimearin-1616-muileach",
        "fearchar-1618-muileach"
      ],
      "timeJumpId": "gap-aislearneach-muileach-founders"
    },
    {
      "partnershipId": "marriage-isibeal-1608-treada--labhruinn-1605-muileach",
      "childIds": [
        "oisean-muileach",
        "aisling-1635-muileach"
      ]
    },
    {
      "partnershipId": "marriage-ainean-unknown-muileach-100-2--fearchar-1618-muileach",
      "childIds": [
        "uruisg-1638-muileach"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-1630-ceinselaig--oisean-muileach",
      "childIds": [
        "keiras-1650-muileach",
        "brighdeach-1654-muileach"
      ]
    },
    {
      "partnershipId": "marriage-uruisg-1638-muileach--vailibh-unknown-muileach-110-2",
      "childIds": [
        "rogaire-muileach",
        "cailte-1660-muileach"
      ]
    },
    {
      "partnershipId": "marriage-hoireabard-1654-fiantorc--keiras-1650-muileach",
      "childIds": [
        "aonghas-1670-muileach",
        "maebhin-1677-muileach",
        "haileigh-muileach",
        "aodhagan-1673-muileach"
      ]
    },
    {
      "partnershipId": "marriage-cailte-1660-muileach--pallaigh-unknown-muileach-120-3",
      "childIds": [
        "searan-1680-muileach"
      ]
    },
    {
      "partnershipId": "marriage-aonghas-1670-muileach--eilidh-1673-durthacht",
      "childIds": [
        "labhruinn-1697-muileach",
        "brighdeach-1700-muileach",
        "fearchar-1703-muileach"
      ]
    },
    {
      "partnershipId": "marriage-aodhagan-1673-muileach--taillte-1676-treada",
      "childIds": [
        "maol-1699-muileach",
        "siobhan-muileach"
      ]
    },
    {
      "partnershipId": "marriage-iubhail-1700-nessa--labhruinn-1697-muileach",
      "childIds": [
        "goll-1720-muileach",
        "maebhin-1722-muileach",
        "cailte-1726-muileach",
        "keiras-1729-muileach"
      ]
    },
    {
      "partnershipId": "marriage-aingeal-1706-rieach--fearchar-1703-muileach",
      "childIds": [
        "lochin-1724-muileach",
        "rogaire-1728-muileach"
      ]
    },
    {
      "partnershipId": "marriage-aithne-unknown-muileach-140-3--maol-1699-muileach",
      "childIds": [
        "iosag-1721-muileach",
        "dalara-1723-muileach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eimearin-1616-muileach--tarlachan-1611-durthacht",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-aisling-1635-muileach--brian-1635-coronach",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-brighdeach-1654-muileach--fionn-1650-ui-faill-duibhne",
      "targetFamilyId": "haus-ui-faill-duibhne",
      "houseId": "house-ui-faill-duibhne"
    },
    {
      "partnershipId": "marriage-aodhluan-tuirseach--rogaire-muileach",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-catan-1674-morna--maebhin-1677-muileach",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-tiarnog-haileigh-choinnich",
      "targetFamilyId": "haus-choinnich",
      "houseId": "house-choinnich"
    },
    {
      "partnershipId": "marriage-ruadhan-1678-dal-leite--searan-1680-muileach",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-brighdeach-1700-muileach--tadhgan-1696-fiantorc",
      "targetFamilyId": "haus-fiantorc",
      "houseId": "house-fiantorc"
    },
    {
      "partnershipId": "marriage-rhys-siobhan-dienyddiwr",
      "targetFamilyId": "haus-dienyddiwr",
      "houseId": "house-dienyddiwr"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "keiras-founder-morna",
    "labhruinn-1605-muileach",
    "oisean-muileach",
    "keiras-1650-muileach",
    "aonghas-1670-muileach"
  ],
  "titles": {
    "keiras-founder-morna": "Historisches Oberhaupt",
    "labhruinn-1605-muileach": "Historisches Oberhaupt",
    "oisean-muileach": "Historisches Oberhaupt",
    "keiras-1650-muileach": "Historisches Oberhaupt",
    "aonghas-1670-muileach": "Dún Tiarna von Athan",
    "labhruinn-1697-muileach": "Erbfolge: 1",
    "goll-1720-muileach": "Erbfolge: 2",
    "cailte-1726-muileach": "Erbfolge: 3",
    "keiras-1729-muileach": "Erbfolge: 4"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Keiras Morna und Maebhín sind das Gründerpaar; eine Überlieferungslücke. Maol und Siobhan stammen laut Grafik von Aodhagán und Taillte ab. Die Kinderüberschrift nennt irrtümlich die erst folgende Generation Maol/Aithne.",
  "currentHeadId": "aonghas-1670-muileach",
  "heirIds": [
    "labhruinn-1697-muileach",
    "goll-1720-muileach",
    "cailte-1726-muileach",
    "keiras-1729-muileach"
  ],
  "description": "Ua’Muileach ist ein Kadettenhaus der Morna und führt seinen Ursprung auf Keiras Morna und Maebhín zurück. Der Clan sitzt in Athan, wo heute Dún Tiarna Aonghas das Haus leitet. Es gilt die männliche Primogenitur. Die benannte Nachfolge führt über Labhruinn zu Goll, Cailte und Keiras; zahlreiche Ehen verbinden die Linie mit den anderen Häusern Aislearneachs."
});

export const HOUSE_MUILEACH_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("muileach", SOURCE));
