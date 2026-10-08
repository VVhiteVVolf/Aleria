import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "lugh-founder-nuadat",
    "teaganach-unknown-nuadat-103-2",
    "vionnadh-1604-anbhair",
    "eideard-anbhair",
    "naemhan-1606-aonghusa",
    "xarobh-1610-seaghdha",
    "toirberth-1624-anbhair",
    "neassa-1626-anbhair",
    "lugh-1630-anbhair",
    "maire-1626-casur",
    "wiarnan-1622-roich",
    "kenna-unknown-anbhair-110-2",
    "barra-1650-anbhair",
    "teaganach-1654-anbhair",
    "iolanda-1654-anbhair",
    "vadria-1656-anbhair",
    "fionnuala-1654-birn",
    "aonghus-1649-haig",
    "eogair-unknown-anbhair-120-2",
    "kester-1650-farraigeach",
    "iagan-1675-anbhair",
    "dairine-1675-anbhair",
    "vathna-1678-anbhair",
    "yachna-1676-anbhair",
    "quona-1678-nuadat",
    "muircheartach-1670-casur",
    "cuan-1677-aonghusa",
    "earcan-1670-drummond",
    "vionnadh-1697-anbhair",
    "banain-1705-anbhair",
    "haodh-1696-anbhair",
    "fionola-1698-anbhair",
    "parthas-1698-lasgair",
    "peagan-unknown-anbhair-140-1",
    "gwrgi-1696-gwialen",
    "goirtin-1719-anbhair",
    "toirberth-1723-anbhair",
    "shan-ciarog",
    "barra-1724-anbhair",
    "teaganach-1727-anbhair"
  ],
  "partnershipIds": [
    "marriage-lugh-founder-nuadat--teaganach-unknown-nuadat-103-2",
    "marriage-naemhan-1606-aonghusa--vionnadh-1604-anbhair",
    "marriage-eideard-anbhair--xarobh-1610-seaghdha",
    "marriage-maire-1626-casur--toirberth-1624-anbhair",
    "marriage-neassa-1626-anbhair--wiarnan-1622-roich",
    "marriage-kenna-unknown-anbhair-110-2--lugh-1630-anbhair",
    "marriage-barra-1650-anbhair--fionnuala-1654-birn",
    "marriage-aonghus-1649-haig--teaganach-1654-anbhair",
    "marriage-eogair-unknown-anbhair-120-2--iolanda-1654-anbhair",
    "marriage-kester-1650-farraigeach--vadria-1656-anbhair",
    "marriage-iagan-1675-anbhair--quona-1678-nuadat",
    "marriage-dairine-1675-anbhair--muircheartach-1670-casur",
    "marriage-cuan-1677-aonghusa--vathna-1678-anbhair",
    "marriage-earcan-1670-drummond--yachna-1676-anbhair",
    "marriage-parthas-1698-lasgair--vionnadh-1697-anbhair",
    "marriage-haodh-1696-anbhair--peagan-unknown-anbhair-140-1",
    "marriage-fionola-1698-anbhair--gwrgi-1696-gwialen"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-lugh-founder-nuadat--teaganach-unknown-nuadat-103-2",
      "childIds": [
        "vionnadh-1604-anbhair",
        "eideard-anbhair"
      ],
      "timeJumpId": "gap-dunfal-anbhair-founders"
    },
    {
      "partnershipId": "marriage-naemhan-1606-aonghusa--vionnadh-1604-anbhair",
      "childIds": [
        "toirberth-1624-anbhair",
        "neassa-1626-anbhair",
        "lugh-1630-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-maire-1626-casur--toirberth-1624-anbhair",
      "childIds": [
        "barra-1650-anbhair",
        "teaganach-1654-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-kenna-unknown-anbhair-110-2--lugh-1630-anbhair",
      "childIds": [
        "iolanda-1654-anbhair",
        "vadria-1656-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-barra-1650-anbhair--fionnuala-1654-birn",
      "childIds": [
        "iagan-1675-anbhair",
        "dairine-1675-anbhair",
        "vathna-1678-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-eogair-unknown-anbhair-120-2--iolanda-1654-anbhair",
      "childIds": [
        "yachna-1676-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-iagan-1675-anbhair--quona-1678-nuadat",
      "childIds": [
        "vionnadh-1697-anbhair",
        "banain-1705-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-cuan-1677-aonghusa--vathna-1678-anbhair",
      "childIds": [
        "haodh-1696-anbhair",
        "fionola-1698-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-parthas-1698-lasgair--vionnadh-1697-anbhair",
      "childIds": [
        "goirtin-1719-anbhair",
        "toirberth-1723-anbhair"
      ]
    },
    {
      "partnershipId": "marriage-haodh-1696-anbhair--peagan-unknown-anbhair-140-1",
      "childIds": [
        "barra-1724-anbhair",
        "teaganach-1727-anbhair"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eideard-anbhair--xarobh-1610-seaghdha",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-neassa-1626-anbhair--wiarnan-1622-roich",
      "targetFamilyId": "haus-roich",
      "houseId": "house-roich"
    },
    {
      "partnershipId": "marriage-aonghus-1649-haig--teaganach-1654-anbhair",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-kester-1650-farraigeach--vadria-1656-anbhair",
      "targetFamilyId": "haus-farraigeach",
      "houseId": "house-farraigeach"
    },
    {
      "partnershipId": "marriage-dairine-1675-anbhair--muircheartach-1670-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-earcan-1670-drummond--yachna-1676-anbhair",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-fionola-1698-anbhair--gwrgi-1696-gwialen",
      "targetFamilyId": "haus-gwialen",
      "houseId": "house-gwialen"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "shan-ciarog",
      "parentId": "vionnadh-1697-anbhair"
    }
  ],
  "heads": [
    "lugh-founder-nuadat",
    "vionnadh-1604-anbhair",
    "toirberth-1624-anbhair",
    "barra-1650-anbhair",
    "iagan-1675-anbhair"
  ],
  "titles": {
    "lugh-founder-nuadat": "Historisches Oberhaupt",
    "vionnadh-1604-anbhair": "Historisches Oberhaupt",
    "toirberth-1624-anbhair": "Historisches Oberhaupt",
    "barra-1650-anbhair": "Historisches Oberhaupt",
    "iagan-1675-anbhair": "Laird seit 1721",
    "vionnadh-1697-anbhair": "Erbfolge: 1",
    "goirtin-1719-anbhair": "Erbfolge: 2",
    "toirberth-1723-anbhair": "Erbfolge: 3"
  },
  "personRoles": {
    "shan-ciarog": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Lugh Nuadat und Teaganach begründen Anbhair. Eine serielle Überlieferungslücke. Shan Ciaróg ist Vionnadhs aufgenommenes Mündel; die leiblichen Eltern Yale und Aoife bleiben in Ciaróg erhalten.",
  "currentHeadId": "iagan-1675-anbhair",
  "heirIds": [
    "vionnadh-1697-anbhair",
    "goirtin-1719-anbhair",
    "toirberth-1723-anbhair"
  ],
  "description": "Ua’Anbhair gehört zu den Laird-Clans von Tir na Fathach und sitzt in Cradh na Frinne. Lugh Nuadat und Teaganach stehen als Gründerpaar am Ursprung des Clans. Nach einer Lücke in der frühen Überlieferung beginnt die datierte Linie mit Vionnadh und Eideard. Iagan führt den Clan seit 1721. Sein Zweig und der seiner Schwester Vathna setzen die Familie fort; sein Sohn Vionnadh steht an erster Stelle der Erbfolge."
});

export const HOUSE_ANBHAIR_FAMILY = withAlbenSourcePortraitUpgrade(createDunfalSourceFamily("anbhair", SOURCE));
