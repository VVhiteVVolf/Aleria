import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "muirgheas-founder-gaisgh",
    "lannraig-unknown-gaisgh-91-0",
    "carthann-ghaisgh",
    "oilibhear-1611-gaisgh",
    "aoifean-1612-bhaird",
    "peathra-unknown-gaisgh-103-1",
    "deorsa-1630-gaisgh",
    "muirgheas-1632-gaisgh",
    "biorna-1634-feannag",
    "sim-unknown-gaisgh-113-1",
    "feargal-1652-gaisgh",
    "mornaachan-1660-gaisgh",
    "neart-1654-gaisgh",
    "iuliana-1655-morgacht",
    "fiachraas-1658-fiachiontach",
    "vairbh-1657-goidin",
    "carthann-1674-gaisgh",
    "uisdean-1681-gaisgh",
    "seumas-1676-gaisgh",
    "colmin-1678-gaisgh",
    "lasairfhiona-1677-luchdon",
    "fionnloch-1680-tartarfhuil",
    "muireall-1678-uilebheist",
    "danaidh-1674-feannag",
    "muirgheas-1696-gaisgh",
    "yluach-1698-gaisgh",
    "oilibhear-1704-gaisgh",
    "fibhidh-1697-gaisgh",
    "lannraig-gaisgh",
    "kalia-1700-briccne",
    "gadhra-1693-rioga",
    "searan-unknown-gaisgh-143-2",
    "noghan-tsaoir",
    "deorsa-1719-gaisgh",
    "neidin-1724-gaisgh",
    "tomas-1728-gaisgh",
    "eunan-1721-gaisgh",
    "sim-1725-gaisgh"
  ],
  "partnershipIds": [
    "marriage-lannraig-unknown-gaisgh-91-0--muirgheas-founder-gaisgh",
    "marriage-aoifean-1612-bhaird--carthann-ghaisgh",
    "marriage-oilibhear-1611-gaisgh--peathra-unknown-gaisgh-103-1",
    "marriage-biorna-1634-feannag--deorsa-1630-gaisgh",
    "marriage-muirgheas-1632-gaisgh--sim-unknown-gaisgh-113-1",
    "marriage-feargal-1652-gaisgh--iuliana-1655-morgacht",
    "marriage-fiachraas-1658-fiachiontach--mornaachan-1660-gaisgh",
    "marriage-neart-1654-gaisgh--vairbh-1657-goidin",
    "marriage-carthann-1674-gaisgh--lasairfhiona-1677-luchdon",
    "marriage-fionnloch-1680-tartarfhuil--uisdean-1681-gaisgh",
    "marriage-muireall-1678-uilebheist--seumas-1676-gaisgh",
    "marriage-colmin-1678-gaisgh--danaidh-1674-feannag",
    "marriage-kalia-1700-briccne--muirgheas-1696-gaisgh",
    "marriage-gadhra-1693-rioga--yluach-1698-gaisgh",
    "marriage-fibhidh-1697-gaisgh--searan-unknown-gaisgh-143-2",
    "marriage-noghan-lannraig-tsaoir"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-lannraig-unknown-gaisgh-91-0--muirgheas-founder-gaisgh",
      "childIds": [
        "carthann-ghaisgh",
        "oilibhear-1611-gaisgh"
      ],
      "timeJumpId": "gap-aislearneach-gaisgh-founders"
    },
    {
      "partnershipId": "marriage-aoifean-1612-bhaird--carthann-ghaisgh",
      "childIds": [
        "deorsa-1630-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-oilibhear-1611-gaisgh--peathra-unknown-gaisgh-103-1",
      "childIds": [
        "muirgheas-1632-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-biorna-1634-feannag--deorsa-1630-gaisgh",
      "childIds": [
        "feargal-1652-gaisgh",
        "mornaachan-1660-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-muirgheas-1632-gaisgh--sim-unknown-gaisgh-113-1",
      "childIds": [
        "neart-1654-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-feargal-1652-gaisgh--iuliana-1655-morgacht",
      "childIds": [
        "carthann-1674-gaisgh",
        "uisdean-1681-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-neart-1654-gaisgh--vairbh-1657-goidin",
      "childIds": [
        "seumas-1676-gaisgh",
        "colmin-1678-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-carthann-1674-gaisgh--lasairfhiona-1677-luchdon",
      "childIds": [
        "muirgheas-1696-gaisgh",
        "yluach-1698-gaisgh",
        "oilibhear-1704-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-muireall-1678-uilebheist--seumas-1676-gaisgh",
      "childIds": [
        "fibhidh-1697-gaisgh",
        "lannraig-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-kalia-1700-briccne--muirgheas-1696-gaisgh",
      "childIds": [
        "deorsa-1719-gaisgh",
        "neidin-1724-gaisgh",
        "tomas-1728-gaisgh"
      ]
    },
    {
      "partnershipId": "marriage-fibhidh-1697-gaisgh--searan-unknown-gaisgh-143-2",
      "childIds": [
        "eunan-1721-gaisgh",
        "sim-1725-gaisgh"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-fiachraas-1658-fiachiontach--mornaachan-1660-gaisgh",
      "targetFamilyId": "haus-fiachiontach",
      "houseId": "house-fiachiontach"
    },
    {
      "partnershipId": "marriage-fionnloch-1680-tartarfhuil--uisdean-1681-gaisgh",
      "targetFamilyId": "haus-tartarfhuil",
      "houseId": "house-tartarfhuil"
    },
    {
      "partnershipId": "marriage-colmin-1678-gaisgh--danaidh-1674-feannag",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-gadhra-1693-rioga--yluach-1698-gaisgh",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-noghan-lannraig-tsaoir",
      "targetFamilyId": "haus-dal-t-saor",
      "houseId": "house-dal-t-saor"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "tomas-1728-gaisgh",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "muirgheas-founder-gaisgh",
    "carthann-ghaisgh",
    "oilibhear-1611-gaisgh",
    "muirgheas-1632-gaisgh",
    "neart-1654-gaisgh",
    "feargal-1652-gaisgh",
    "seumas-1676-gaisgh"
  ],
  "titles": {
    "muirgheas-founder-gaisgh": "Historisches Oberhaupt",
    "carthann-ghaisgh": "Historisches Oberhaupt",
    "oilibhear-1611-gaisgh": "Historisches Oberhaupt",
    "muirgheas-1632-gaisgh": "Historisches Oberhaupt",
    "neart-1654-gaisgh": "Historisches Oberhaupt",
    "feargal-1652-gaisgh": "Historisches Oberhaupt",
    "seumas-1676-gaisgh": "Laird von Broch an Traigh",
    "carthann-1674-gaisgh": "Erbfolge: 1",
    "muirgheas-1696-gaisgh": "Erbfolge: 2",
    "oilibhear-1704-gaisgh": "Erbfolge: 3",
    "fibhidh-1697-gaisgh": "Erbfolge: 4",
    "deorsa-1719-gaisgh": "Erbfolge: 5"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Nutzerfestlegung: Broch an Traigh. Nearts Frau ist laut Grafik Vairbh Goidin; ihre Zelle und die Eheüberschrift wiederholen versehentlich Sìm/Muirgheas aus der Vorgeneration. Fìbhidh und Searán sind Eunan/Sìms Eltern. Tòmas ist nach Suiste vermittelt. Nutzerkorrektur 07.10.2026: Sitz Broch an Traigh nach Laird-Tabelle.",
  "currentHeadId": "seumas-1676-gaisgh",
  "heirIds": [
    "carthann-1674-gaisgh",
    "muirgheas-1696-gaisgh",
    "oilibhear-1704-gaisgh",
    "fibhidh-1697-gaisgh",
    "deorsa-1719-gaisgh"
  ],
  "description": "An’Gaisgh sitzt in Broch an Traigh und geht auf Muirgheas zurück. Der Clan entscheidet seine Nachfolge durch einen Schießwettbewerb; heute ist Seumas das Oberhaupt. Seine Verbindungen reichen besonders zu Luchdon, Feannag, Rioga und Tartarfhuil. Tòmas wurde als Mündel nach Suiste gegeben."
});

export const HOUSE_GAISGH_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("gaisgh", SOURCE));
