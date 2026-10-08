import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "bran-founder-tartarfhuil",
    "maolisa-unknown-tartarfhuil-91-0",
    "fionnloch-1604-tartarfhuil",
    "bran-1607-tartarfhuil",
    "macmhar-1610-tartarfhuil",
    "bridan-1607-muirin",
    "eideard-unknown-tartarfhuil-103-1",
    "gulban-1628-tartarfhuil",
    "loinneog-1634-tartarfhuil",
    "collum-1630-tartarfhuil",
    "mornain-1632-cairge",
    "jathghal-1630-ceallaigh",
    "taraach-unknown-tartarfhuil-113-2",
    "conall-1650-tartarfhuil",
    "aoifean-1653-tartarfhuil",
    "aodthar-1653-tartarfhuil",
    "fionnthar-1653-tartarfhuil",
    "fergus-1655-tartarfhuil",
    "sadhbhan-1654-reannachain",
    "banain-1649-cairbre",
    "yzobel-unknown-tartarfhuil-123-2",
    "unaas-unknown-tartarfhuil-123-3",
    "macmhar-1672-tartarfhuil",
    "maolisa-1675-tartarfhuil",
    "sadhbhach-1675-tartarfhuil",
    "fionnloch-1680-tartarfhuil",
    "dubhan-1678-tartarfhuil",
    "muireann-1679-tartarfhuil",
    "loinneog-1675-culloch",
    "realtin-1675-ceallaigh",
    "macthar-1670-rioga",
    "uisdean-1681-gaisgh",
    "uibhist-1675-birn",
    "bran-1695-tartarfhuil",
    "breandan-1700-tartarfhuil",
    "griana-1706-tartarfhuil",
    "cathalach-1699-tartarfhuil",
    "iseult-tartarfhuil",
    "eubha-1699-cadhla",
    "magan-1704-aonghusa",
    "warin-1705-fiachiontach",
    "bhreac-ciarog",
    "gulban-1720-tartarfhuil",
    "conall-1725-tartarfhuil",
    "collum-1724-tartarfhuil",
    "maolisa-1728-tartarfhuil"
  ],
  "partnershipIds": [
    "marriage-bran-founder-tartarfhuil--maolisa-unknown-tartarfhuil-91-0",
    "marriage-bridan-1607-muirin--fionnloch-1604-tartarfhuil",
    "marriage-eideard-unknown-tartarfhuil-103-1--macmhar-1610-tartarfhuil",
    "marriage-gulban-1628-tartarfhuil--mornain-1632-cairge",
    "marriage-jathghal-1630-ceallaigh--loinneog-1634-tartarfhuil",
    "marriage-collum-1630-tartarfhuil--taraach-unknown-tartarfhuil-113-2",
    "marriage-conall-1650-tartarfhuil--sadhbhan-1654-reannachain",
    "marriage-aoifean-1653-tartarfhuil--banain-1649-cairbre",
    "marriage-aodthar-1653-tartarfhuil--yzobel-unknown-tartarfhuil-123-2",
    "marriage-fergus-1655-tartarfhuil--unaas-unknown-tartarfhuil-123-3",
    "marriage-loinneog-1675-culloch--macmhar-1672-tartarfhuil",
    "marriage-maolisa-1675-tartarfhuil--realtin-1675-ceallaigh",
    "marriage-macthar-1670-rioga--sadhbhach-1675-tartarfhuil",
    "marriage-fionnloch-1680-tartarfhuil--uisdean-1681-gaisgh",
    "marriage-muireann-1679-tartarfhuil--uibhist-1675-birn",
    "marriage-bran-1695-tartarfhuil--eubha-1699-cadhla",
    "marriage-griana-1706-tartarfhuil--magan-1704-aonghusa",
    "marriage-cathalach-1699-tartarfhuil--warin-1705-fiachiontach",
    "marriage-bhreac-iseult-ciarog"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-bran-founder-tartarfhuil--maolisa-unknown-tartarfhuil-91-0",
      "childIds": [
        "fionnloch-1604-tartarfhuil",
        "bran-1607-tartarfhuil",
        "macmhar-1610-tartarfhuil"
      ],
      "timeJumpId": "gap-aislearneach-tartarfhuil-founders"
    },
    {
      "partnershipId": "marriage-bridan-1607-muirin--fionnloch-1604-tartarfhuil",
      "childIds": [
        "gulban-1628-tartarfhuil",
        "loinneog-1634-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-eideard-unknown-tartarfhuil-103-1--macmhar-1610-tartarfhuil",
      "childIds": [
        "collum-1630-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-gulban-1628-tartarfhuil--mornain-1632-cairge",
      "childIds": [
        "conall-1650-tartarfhuil",
        "aoifean-1653-tartarfhuil",
        "aodthar-1653-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-collum-1630-tartarfhuil--taraach-unknown-tartarfhuil-113-2",
      "childIds": [
        "fionnthar-1653-tartarfhuil",
        "fergus-1655-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-conall-1650-tartarfhuil--sadhbhan-1654-reannachain",
      "childIds": [
        "macmhar-1672-tartarfhuil",
        "maolisa-1675-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-aodthar-1653-tartarfhuil--yzobel-unknown-tartarfhuil-123-2",
      "childIds": [
        "sadhbhach-1675-tartarfhuil",
        "fionnloch-1680-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-fergus-1655-tartarfhuil--unaas-unknown-tartarfhuil-123-3",
      "childIds": [
        "dubhan-1678-tartarfhuil",
        "muireann-1679-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-loinneog-1675-culloch--macmhar-1672-tartarfhuil",
      "childIds": [
        "bran-1695-tartarfhuil",
        "breandan-1700-tartarfhuil",
        "griana-1706-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-fionnloch-1680-tartarfhuil--uisdean-1681-gaisgh",
      "childIds": [
        "cathalach-1699-tartarfhuil",
        "iseult-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-bran-1695-tartarfhuil--eubha-1699-cadhla",
      "childIds": [
        "gulban-1720-tartarfhuil",
        "conall-1725-tartarfhuil"
      ]
    },
    {
      "partnershipId": "marriage-cathalach-1699-tartarfhuil--warin-1705-fiachiontach",
      "childIds": [
        "collum-1724-tartarfhuil",
        "maolisa-1728-tartarfhuil"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-jathghal-1630-ceallaigh--loinneog-1634-tartarfhuil",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-aoifean-1653-tartarfhuil--banain-1649-cairbre",
      "targetFamilyId": "haus-cairbre",
      "houseId": "house-cairbre"
    },
    {
      "partnershipId": "marriage-maolisa-1675-tartarfhuil--realtin-1675-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-macthar-1670-rioga--sadhbhach-1675-tartarfhuil",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-muireann-1679-tartarfhuil--uibhist-1675-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-griana-1706-tartarfhuil--magan-1704-aonghusa",
      "targetFamilyId": "haus-aonghusa",
      "houseId": "house-aonghusa"
    },
    {
      "partnershipId": "marriage-bhreac-iseult-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "bran-founder-tartarfhuil",
    "fionnloch-1604-tartarfhuil",
    "bran-1607-tartarfhuil",
    "collum-1630-tartarfhuil",
    "fergus-1655-tartarfhuil",
    "fionnthar-1653-tartarfhuil",
    "aodthar-1653-tartarfhuil",
    "conall-1650-tartarfhuil",
    "macmhar-1672-tartarfhuil"
  ],
  "titles": {
    "bran-founder-tartarfhuil": "Historisches Oberhaupt",
    "fionnloch-1604-tartarfhuil": "Historisches Oberhaupt",
    "bran-1607-tartarfhuil": "Historisches Oberhaupt",
    "collum-1630-tartarfhuil": "Historisches Oberhaupt",
    "fergus-1655-tartarfhuil": "Historisches Oberhaupt",
    "fionnthar-1653-tartarfhuil": "Historisches Oberhaupt",
    "aodthar-1653-tartarfhuil": "Historisches Oberhaupt",
    "conall-1650-tartarfhuil": "Historisches Oberhaupt",
    "macmhar-1672-tartarfhuil": "Laird von Koldair",
    "fionnloch-1680-tartarfhuil": "Erbfolge: 1",
    "dubhan-1678-tartarfhuil": "Erbfolge: 2",
    "bran-1695-tartarfhuil": "Erbfolge: 3",
    "cathalach-1699-tartarfhuil": "Erbfolge: 4",
    "gulban-1720-tartarfhuil": "Erbfolge: 5"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Bran, Breandan und Griana sind Macmhars und Loinneogs Kinder; die Überschrift mit Réaltín ist ein Kopierrest. Die Amtsliste enthält die belegte Nachfolge über mehrere Seitenzweige.",
  "currentHeadId": "macmhar-1672-tartarfhuil",
  "heirIds": [
    "fionnloch-1680-tartarfhuil",
    "dubhan-1678-tartarfhuil",
    "bran-1695-tartarfhuil",
    "cathalach-1699-tartarfhuil",
    "gulban-1720-tartarfhuil"
  ],
  "description": "Tartarfhuil ist ein Laird-Haus aus Koldair mit einer ausgeprägt seefahrerischen Nachfolgetradition. Stirbt das Oberhaupt, treten die Kapitäne der Familie zu einer Wettfahrt nach Dunfal an; ein Fianna überwacht den Entscheid. Heute führt Macmhar den Clan. Seine überlieferte Linie reicht zurück bis zu Bran, dem Gründer des Hauses."
});

export const HOUSE_TARTARFHUIL_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("tartarfhuil", SOURCE));
