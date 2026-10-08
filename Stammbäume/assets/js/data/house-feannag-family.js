import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ualraig-founder-feannag",
    "maire-unknown-feannag-91-0",
    "iomhar-1605-feannag",
    "zaorbha-1609-feannag",
    "nairn-feannag",
    "teaganach-1609-gairner",
    "colmach-1602-coronach",
    "duibhseach-tuirseach",
    "saor-1627-feannag",
    "biorna-1634-feannag",
    "danaidh-1634-feannag",
    "maire-1637-feannag",
    "leagha-1630-luchdon",
    "deorsa-1630-gaisgh",
    "mairsaili-1637-cnogan",
    "conall-1632-eamhra",
    "iasgair-1650-feannag",
    "slaine-1653-feannag",
    "aileas-1655-feannag",
    "earca-1656-eala",
    "artair-1650-morgacht",
    "keebh-1658-averanax",
    "danaidh-1674-feannag",
    "wriath-1677-feannag",
    "iainbheag-1676-feannag",
    "saorlaan-1678-feannag",
    "colmin-1678-gaisgh",
    "liamach-1673-luchdon",
    "unaasin-unknown-feannag-133-2",
    "peadaran-1676-coronach",
    "iomhar-1697-feannag",
    "maire-feannag",
    "iasgair-1703-feannag",
    "biorna-feannag",
    "raonaid-1703-uilebheist",
    "lorghus-trodach",
    "oilean-unknown-feannag-143-2",
    "zachrach-1696-seaghdha",
    "saor-1722-feannag",
    "zaorbha-1727-feannag",
    "slaine-1725-feannag",
    "niarn-1729-feannag",
    "zibhhi-seaghdha"
  ],
  "partnershipIds": [
    "marriage-maire-unknown-feannag-91-0--ualraig-founder-feannag",
    "marriage-iomhar-1605-feannag--teaganach-1609-gairner",
    "marriage-colmach-1602-coronach--zaorbha-1609-feannag",
    "marriage-duibhseach-tuirseach--nairn-feannag",
    "marriage-leagha-1630-luchdon--saor-1627-feannag",
    "marriage-biorna-1634-feannag--deorsa-1630-gaisgh",
    "marriage-danaidh-1634-feannag--mairsaili-1637-cnogan",
    "marriage-conall-1632-eamhra--maire-1637-feannag",
    "marriage-earca-1656-eala--iasgair-1650-feannag",
    "marriage-artair-1650-morgacht--slaine-1653-feannag",
    "marriage-aileas-1655-feannag--keebh-1658-averanax",
    "marriage-colmin-1678-gaisgh--danaidh-1674-feannag",
    "marriage-liamach-1673-luchdon--wriath-1677-feannag",
    "marriage-iainbheag-1676-feannag--unaasin-unknown-feannag-133-2",
    "marriage-peadaran-1676-coronach--saorlaan-1678-feannag",
    "marriage-iomhar-1697-feannag--raonaid-1703-uilebheist",
    "marriage-lorghus-maire",
    "marriage-iasgair-1703-feannag--oilean-unknown-feannag-143-2",
    "forced-biorna-feannag--zachrach-1696-seaghdha"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-maire-unknown-feannag-91-0--ualraig-founder-feannag",
      "childIds": [
        "iomhar-1605-feannag",
        "zaorbha-1609-feannag",
        "nairn-feannag"
      ],
      "timeJumpId": "gap-aislearneach-feannag-founders"
    },
    {
      "partnershipId": "marriage-iomhar-1605-feannag--teaganach-1609-gairner",
      "childIds": [
        "saor-1627-feannag",
        "biorna-1634-feannag"
      ]
    },
    {
      "partnershipId": "marriage-duibhseach-tuirseach--nairn-feannag",
      "childIds": [
        "danaidh-1634-feannag",
        "maire-1637-feannag"
      ]
    },
    {
      "partnershipId": "marriage-leagha-1630-luchdon--saor-1627-feannag",
      "childIds": [
        "iasgair-1650-feannag",
        "slaine-1653-feannag"
      ]
    },
    {
      "partnershipId": "marriage-danaidh-1634-feannag--mairsaili-1637-cnogan",
      "childIds": [
        "aileas-1655-feannag"
      ]
    },
    {
      "partnershipId": "marriage-earca-1656-eala--iasgair-1650-feannag",
      "childIds": [
        "danaidh-1674-feannag",
        "wriath-1677-feannag"
      ]
    },
    {
      "partnershipId": "marriage-aileas-1655-feannag--keebh-1658-averanax",
      "childIds": [
        "iainbheag-1676-feannag",
        "saorlaan-1678-feannag"
      ]
    },
    {
      "partnershipId": "marriage-colmin-1678-gaisgh--danaidh-1674-feannag",
      "childIds": [
        "iomhar-1697-feannag",
        "maire-feannag",
        "iasgair-1703-feannag"
      ]
    },
    {
      "partnershipId": "marriage-iainbheag-1676-feannag--unaasin-unknown-feannag-133-2",
      "childIds": [
        "biorna-feannag"
      ]
    },
    {
      "partnershipId": "marriage-iomhar-1697-feannag--raonaid-1703-uilebheist",
      "childIds": [
        "saor-1722-feannag",
        "zaorbha-1727-feannag"
      ]
    },
    {
      "partnershipId": "marriage-iasgair-1703-feannag--oilean-unknown-feannag-143-2",
      "childIds": [
        "slaine-1725-feannag",
        "niarn-1729-feannag"
      ]
    },
    {
      "partnershipId": "forced-biorna-feannag--zachrach-1696-seaghdha",
      "childIds": [
        "zibhhi-seaghdha"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-colmach-1602-coronach--zaorbha-1609-feannag",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-biorna-1634-feannag--deorsa-1630-gaisgh",
      "targetFamilyId": "haus-gaisgh",
      "houseId": "house-gaisgh"
    },
    {
      "partnershipId": "marriage-conall-1632-eamhra--maire-1637-feannag",
      "targetFamilyId": "haus-eamhra",
      "houseId": "house-eamhra"
    },
    {
      "partnershipId": "marriage-artair-1650-morgacht--slaine-1653-feannag",
      "targetFamilyId": "haus-morgacht",
      "houseId": "house-morgacht"
    },
    {
      "partnershipId": "marriage-liamach-1673-luchdon--wriath-1677-feannag",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    },
    {
      "partnershipId": "marriage-peadaran-1676-coronach--saorlaan-1678-feannag",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-lorghus-maire",
      "targetFamilyId": "haus-ard-trodach",
      "houseId": "house-trodach"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "ualraig-founder-feannag",
    "iomhar-1605-feannag",
    "saor-1627-feannag",
    "danaidh-1634-feannag",
    "iasgair-1650-feannag",
    "danaidh-1674-feannag"
  ],
  "titles": {
    "ualraig-founder-feannag": "Historisches Oberhaupt",
    "iomhar-1605-feannag": "Historisches Oberhaupt",
    "saor-1627-feannag": "Historisches Oberhaupt",
    "danaidh-1634-feannag": "Historisches Oberhaupt",
    "iasgair-1650-feannag": "Historisches Oberhaupt",
    "danaidh-1674-feannag": "Dún Tiarna von Caetharlach · Fianna",
    "iainbheag-1676-feannag": "Erbfolge: 1",
    "iomhar-1697-feannag": "Erbfolge: 2",
    "iasgair-1703-feannag": "Erbfolge: 3",
    "saor-1722-feannag": "Erbfolge: 4"
  },
  "personRoles": {
    "zibhhi-seaghdha": "bastard",
    "zachrach-1696-seaghdha": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Ualraig/Máire ist das Gründerpaar. Zibhí stammt aus der ausdrücklich erzwungenen Verbindung Biornas mit Zachrach Séaghdha, nicht aus einer Affäre. Clanpräfix Tir An in der Familienquelle ist als Variante zum vorbereiteten An belegt.",
  "currentHeadId": "danaidh-1674-feannag",
  "heirIds": [
    "iainbheag-1676-feannag",
    "iomhar-1697-feannag",
    "iasgair-1703-feannag",
    "saor-1722-feannag"
  ],
  "description": "Feannag ist in Caetharlach beheimatet und vor allem für Staatskunst, Bauwesen und kluge Verwaltung bekannt. Das älteste Familienmitglied übernimmt die Führung. Gegenwärtig steht Dànaidh an der Spitze, ein gebildeter Edelmann und Fianna, dessen Ruf auf Weitblick und Urteilskraft beruht. Die Familie bewahrt auch die Geschichte Zibhís, der Tochter Biornas aus einer erzwungenen Verbindung während des Krieges."
});

export const HOUSE_FEANNAG_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("feannag", SOURCE));
