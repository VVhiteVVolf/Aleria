import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "kealtan-founder-durthacht",
    "oighreag-unknown-durthacht-125-1",
    "faelan-1600-treada",
    "isibeal-1608-treada",
    "eimearin-1604-fiantorc",
    "labhruinn-1605-muileach",
    "gearoid-1627-treada",
    "laoise-treada",
    "kealtan-1632-treada",
    "aoife-1630-durthacht",
    "carranog-ciarog",
    "hoireabard-unknown-treada-110-2",
    "colmas-1649-treada",
    "oighreag-1655-treada",
    "peadaran-1654-treada",
    "yelva-1653-fiantorc",
    "lorgain-1650-fiantorc",
    "jorunn-unknown-treada-120-2",
    "kealtan-1673-treada",
    "taillte-1676-treada",
    "faelan-1678-treada",
    "heibhinn-1677-treada",
    "talamh-1676-cuilen",
    "aodhagan-1673-muileach",
    "beathag-unknown-treada-130-2",
    "hectan-1673-salaig",
    "laisren-1699-treada",
    "isibeal-treada",
    "tara-treada",
    "gearoid-1699-treada",
    "hallaith-1703-durthacht",
    "preachan-trodach",
    "jenkin-brithyll",
    "sileach-1700-fiantorc",
    "colmas-1721-treada",
    "laoise-1723-treada",
    "torin-1727-treada",
    "oighreag-1723-treada",
    "piaras-1729-treada"
  ],
  "partnershipIds": [
    "marriage-kealtan-founder-durthacht--oighreag-unknown-durthacht-125-1",
    "marriage-eimearin-1604-fiantorc--faelan-1600-treada",
    "marriage-isibeal-1608-treada--labhruinn-1605-muileach",
    "marriage-aoife-1630-durthacht--gearoid-1627-treada",
    "marriage-carranog-laoise-ciarog",
    "marriage-hoireabard-unknown-treada-110-2--kealtan-1632-treada",
    "marriage-colmas-1649-treada--yelva-1653-fiantorc",
    "marriage-lorgain-1650-fiantorc--oighreag-1655-treada",
    "marriage-jorunn-unknown-treada-120-2--peadaran-1654-treada",
    "marriage-kealtan-1673-treada--talamh-1676-cuilen",
    "marriage-aodhagan-1673-muileach--taillte-1676-treada",
    "marriage-beathag-unknown-treada-130-2--faelan-1678-treada",
    "marriage-hectan-1673-salaig--heibhinn-1677-treada",
    "marriage-hallaith-1703-durthacht--laisren-1699-treada",
    "marriage-preachan-isibeal",
    "marriage-jenkin-tara-brithyll",
    "marriage-gearoid-1699-treada--sileach-1700-fiantorc"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-kealtan-founder-durthacht--oighreag-unknown-durthacht-125-1",
      "childIds": [
        "faelan-1600-treada",
        "isibeal-1608-treada"
      ],
      "timeJumpId": "gap-aislearneach-treada-founders"
    },
    {
      "partnershipId": "marriage-eimearin-1604-fiantorc--faelan-1600-treada",
      "childIds": [
        "gearoid-1627-treada",
        "laoise-treada",
        "kealtan-1632-treada"
      ]
    },
    {
      "partnershipId": "marriage-aoife-1630-durthacht--gearoid-1627-treada",
      "childIds": [
        "colmas-1649-treada",
        "oighreag-1655-treada"
      ]
    },
    {
      "partnershipId": "marriage-hoireabard-unknown-treada-110-2--kealtan-1632-treada",
      "childIds": [
        "peadaran-1654-treada"
      ]
    },
    {
      "partnershipId": "marriage-colmas-1649-treada--yelva-1653-fiantorc",
      "childIds": [
        "kealtan-1673-treada",
        "taillte-1676-treada",
        "faelan-1678-treada"
      ]
    },
    {
      "partnershipId": "marriage-jorunn-unknown-treada-120-2--peadaran-1654-treada",
      "childIds": [
        "heibhinn-1677-treada"
      ]
    },
    {
      "partnershipId": "marriage-kealtan-1673-treada--talamh-1676-cuilen",
      "childIds": [
        "laisren-1699-treada",
        "isibeal-treada"
      ]
    },
    {
      "partnershipId": "marriage-beathag-unknown-treada-130-2--faelan-1678-treada",
      "childIds": [
        "tara-treada",
        "gearoid-1699-treada"
      ]
    },
    {
      "partnershipId": "marriage-hallaith-1703-durthacht--laisren-1699-treada",
      "childIds": [
        "colmas-1721-treada",
        "laoise-1723-treada",
        "torin-1727-treada"
      ]
    },
    {
      "partnershipId": "marriage-gearoid-1699-treada--sileach-1700-fiantorc",
      "childIds": [
        "oighreag-1723-treada",
        "piaras-1729-treada"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-isibeal-1608-treada--labhruinn-1605-muileach",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-carranog-laoise-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-lorgain-1650-fiantorc--oighreag-1655-treada",
      "targetFamilyId": "haus-fiantorc",
      "houseId": "house-fiantorc"
    },
    {
      "partnershipId": "marriage-aodhagan-1673-muileach--taillte-1676-treada",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-hectan-1673-salaig--heibhinn-1677-treada",
      "targetFamilyId": "haus-salaig",
      "houseId": "house-salaig"
    },
    {
      "partnershipId": "marriage-preachan-isibeal",
      "targetFamilyId": "haus-ard-trodach",
      "houseId": "house-trodach"
    },
    {
      "partnershipId": "marriage-jenkin-tara-brithyll",
      "targetFamilyId": "haus-brithyll",
      "houseId": "house-brithyll"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "kealtan-founder-durthacht",
    "faelan-1600-treada",
    "gearoid-1627-treada",
    "colmas-1649-treada",
    "kealtan-1673-treada"
  ],
  "titles": {
    "kealtan-founder-durthacht": "Historisches Oberhaupt",
    "faelan-1600-treada": "Historisches Oberhaupt",
    "gearoid-1627-treada": "Historisches Oberhaupt",
    "colmas-1649-treada": "Historisches Oberhaupt",
    "kealtan-1673-treada": "Laird von Lorai",
    "laisren-1699-treada": "Erbfolge: 1",
    "colmas-1721-treada": "Erbfolge: 2",
    "laoise-1723-treada": "Erbfolge: 3",
    "torin-1727-treada": "Erbfolge: 4"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Kealtán Durthacht begründet den Clan; eine Überlieferungslücke. Gearoids Geburt folgt seiner eigenen Tabelle. Amtsjahre sind keine Geburtsangaben.",
  "currentHeadId": "kealtan-1673-treada",
  "heirIds": [
    "laisren-1699-treada",
    "colmas-1721-treada",
    "laoise-1723-treada",
    "torin-1727-treada"
  ],
  "description": "Ua’Treada ging aus der Linie der Durthacht hervor. Kealtán erhielt von seinem Bruder Ruadhán die Verantwortung für drei Ortschaften und bewies dort sein Verwaltungsgeschick. Das Haus sitzt in Lorai und wird heute wiederum von einem Kealtán geführt. Seine Nachfolge richtet sich nach dem Erstgeburtsrecht unabhängig vom Geschlecht; Laisrén und dessen Kinder sind als Erbfolge verzeichnet."
});

export const HOUSE_TREADA_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("treada", SOURCE));
