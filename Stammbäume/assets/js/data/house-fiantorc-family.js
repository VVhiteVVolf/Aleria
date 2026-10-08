import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "lorgain-founder-durthacht",
    "draighean-unknown-durthacht-113-1",
    "tadhgan-1602-fiantorc",
    "eimearin-1604-fiantorc",
    "cael-1606-fiantorc",
    "righna-1608-midgna",
    "faelan-1600-treada",
    "muireall-1610-uilebheist",
    "fionn-fiantorc",
    "sileach-1628-fiantorc",
    "ruairias-1630-fiantorc",
    "draighean-fiantorc",
    "alys-ciarog",
    "padraig-1625-durthacht",
    "mairghread-unknown-fiantorc-110-2",
    "diarmaid-1631-tordarroch",
    "lorgain-1650-fiantorc",
    "hoireabard-1654-fiantorc",
    "yelva-1653-fiantorc",
    "ronan-1655-fiantorc",
    "oighreag-1655-treada",
    "keiras-1650-muileach",
    "colmas-1649-treada",
    "iseabailin-unknown-fiantorc-120-3",
    "cael-1673-fiantorc",
    "finnbar-fiantorc",
    "harailt-1677-fiantorc",
    "beileag-fiantorc",
    "grainne-1677-durthacht",
    "einhild-todbrand",
    "orfhlaith-unknown-fiantorc-130-2",
    "tomaltach-1676-leite",
    "tadhgan-1696-fiantorc",
    "sileach-1700-fiantorc",
    "ruairias-1699-fiantorc",
    "draighean-1704-fiantorc",
    "oranach-1702-fiantorc",
    "brighdeach-1700-muileach",
    "gearoid-1699-treada",
    "keavy-unknown-fiantorc-140-2",
    "jowan-1698-cuilen",
    "quiva-unknown-fiantorc-140-4",
    "lorgain-1722-fiantorc",
    "wray-1726-fiantorc",
    "fionn-1725-fiantorc",
    "yelva-1729-fiantorc",
    "eimear-1726-fiantorc"
  ],
  "partnershipIds": [
    "marriage-draighean-unknown-durthacht-113-1--lorgain-founder-durthacht",
    "marriage-righna-1608-midgna--tadhgan-1602-fiantorc",
    "marriage-eimearin-1604-fiantorc--faelan-1600-treada",
    "marriage-cael-1606-fiantorc--muireall-1610-uilebheist",
    "marriage-alys-fionn-ciarog",
    "marriage-padraig-1625-durthacht--sileach-1628-fiantorc",
    "marriage-mairghread-unknown-fiantorc-110-2--ruairias-1630-fiantorc",
    "marriage-diarmaid-1631-tordarroch--draighean-fiantorc",
    "marriage-lorgain-1650-fiantorc--oighreag-1655-treada",
    "marriage-hoireabard-1654-fiantorc--keiras-1650-muileach",
    "marriage-colmas-1649-treada--yelva-1653-fiantorc",
    "marriage-iseabailin-unknown-fiantorc-120-3--ronan-1655-fiantorc",
    "marriage-cael-1673-fiantorc--grainne-1677-durthacht",
    "marriage-einhild-finnbar-todbrand",
    "marriage-harailt-1677-fiantorc--orfhlaith-unknown-fiantorc-130-2",
    "marriage-beileag-fiantorc--tomaltach-1676-leite",
    "marriage-brighdeach-1700-muileach--tadhgan-1696-fiantorc",
    "marriage-gearoid-1699-treada--sileach-1700-fiantorc",
    "marriage-keavy-unknown-fiantorc-140-2--ruairias-1699-fiantorc",
    "marriage-draighean-1704-fiantorc--jowan-1698-cuilen",
    "marriage-oranach-1702-fiantorc--quiva-unknown-fiantorc-140-4"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-draighean-unknown-durthacht-113-1--lorgain-founder-durthacht",
      "childIds": [
        "tadhgan-1602-fiantorc",
        "eimearin-1604-fiantorc",
        "cael-1606-fiantorc"
      ],
      "timeJumpId": "gap-aislearneach-fiantorc-founders"
    },
    {
      "partnershipId": "marriage-righna-1608-midgna--tadhgan-1602-fiantorc",
      "childIds": [
        "fionn-fiantorc",
        "sileach-1628-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-cael-1606-fiantorc--muireall-1610-uilebheist",
      "childIds": [
        "ruairias-1630-fiantorc",
        "draighean-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-alys-fionn-ciarog",
      "childIds": [
        "lorgain-1650-fiantorc",
        "hoireabard-1654-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-mairghread-unknown-fiantorc-110-2--ruairias-1630-fiantorc",
      "childIds": [
        "yelva-1653-fiantorc",
        "ronan-1655-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-lorgain-1650-fiantorc--oighreag-1655-treada",
      "childIds": [
        "cael-1673-fiantorc",
        "finnbar-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-iseabailin-unknown-fiantorc-120-3--ronan-1655-fiantorc",
      "childIds": [
        "harailt-1677-fiantorc",
        "beileag-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-cael-1673-fiantorc--grainne-1677-durthacht",
      "childIds": [
        "tadhgan-1696-fiantorc",
        "sileach-1700-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-einhild-finnbar-todbrand",
      "childIds": [
        "ruairias-1699-fiantorc",
        "draighean-1704-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-harailt-1677-fiantorc--orfhlaith-unknown-fiantorc-130-2",
      "childIds": [
        "oranach-1702-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-brighdeach-1700-muileach--tadhgan-1696-fiantorc",
      "childIds": [
        "lorgain-1722-fiantorc",
        "wray-1726-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-keavy-unknown-fiantorc-140-2--ruairias-1699-fiantorc",
      "childIds": [
        "fionn-1725-fiantorc",
        "yelva-1729-fiantorc"
      ]
    },
    {
      "partnershipId": "marriage-oranach-1702-fiantorc--quiva-unknown-fiantorc-140-4",
      "childIds": [
        "eimear-1726-fiantorc"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eimearin-1604-fiantorc--faelan-1600-treada",
      "targetFamilyId": "haus-treada",
      "houseId": "house-treada"
    },
    {
      "partnershipId": "marriage-padraig-1625-durthacht--sileach-1628-fiantorc",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-diarmaid-1631-tordarroch--draighean-fiantorc",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-hoireabard-1654-fiantorc--keiras-1650-muileach",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-colmas-1649-treada--yelva-1653-fiantorc",
      "targetFamilyId": "haus-treada",
      "houseId": "house-treada"
    },
    {
      "partnershipId": "marriage-beileag-fiantorc--tomaltach-1676-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-gearoid-1699-treada--sileach-1700-fiantorc",
      "targetFamilyId": "haus-treada",
      "houseId": "house-treada"
    },
    {
      "partnershipId": "marriage-draighean-1704-fiantorc--jowan-1698-cuilen",
      "targetFamilyId": "haus-cuilen",
      "houseId": "house-cuilen"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "lorgain-founder-durthacht",
    "tadhgan-1602-fiantorc",
    "fionn-fiantorc",
    "lorgain-1650-fiantorc",
    "cael-1673-fiantorc"
  ],
  "titles": {
    "lorgain-founder-durthacht": "Historisches Oberhaupt",
    "tadhgan-1602-fiantorc": "Historisches Oberhaupt",
    "fionn-fiantorc": "Historisches Oberhaupt",
    "lorgain-1650-fiantorc": "Historisches Oberhaupt",
    "cael-1673-fiantorc": "Laird von Lorai",
    "tadhgan-1696-fiantorc": "Erbfolge: 1",
    "lorgain-1722-fiantorc": "Erbfolge: 2",
    "wray-1726-fiantorc": "Erbfolge: 3"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Lorgain Durthacht begründet den Clan. Eine Überlieferungslücke. Die beiden historischen Ehen mit Treada sind unterschiedliche Personenpaare; keine Namenszusammenführung ohne Lebensdaten.",
  "currentHeadId": "cael-1673-fiantorc",
  "heirIds": [
    "tadhgan-1696-fiantorc",
    "lorgain-1722-fiantorc",
    "wray-1726-fiantorc"
  ],
  "description": "Ua’Fiantorc ist ein Kadettenhaus der Durthacht mit Sitz in Lorai. Diarmait belohnte die treue Unterstützung seines Bruders Lorgain mit einem eigenen Lehen und der Lairdwürde. Heute führt Cael den Clan. Das erstgeborene Kind erbt unabhängig vom Geschlecht; die benannte Nachfolge umfasst Tadhgan, Lorgain und Wray."
});

export const HOUSE_FIANTORC_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("fiantorc", SOURCE));
