import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "treasa-founder-nuadat",
    "hurracan-unknown-nuadat-115-1",
    "wiorna-1606-aonghusa",
    "naemhan-1606-aonghusa",
    "carthach-1608-casur",
    "vionnadh-1604-anbhair",
    "reamha-1626-aonghusa",
    "fechin-1630-aonghusa",
    "hurracan-1632-aonghusa",
    "kumhn-1629-lockart",
    "eachaidh-1630-caddach",
    "geirlaug-unknown-aonghusa-110-2",
    "banbhin-1648-aonghusa",
    "odhbha-1653-aonghusa",
    "searan-1652-aonghusa",
    "neart-1654-aonghusa",
    "vaithreach-1651-riangabra",
    "kadghghan-1650-nessa",
    "orthanach-1649-luachra",
    "laoise-unknown-aonghusa-120-3",
    "treasa-1669-aonghusa",
    "cuan-1677-aonghusa",
    "hurracan-1679-aonghusa",
    "neidhe-1674-aonghusa",
    "hearn-1677-aonghusa",
    "ultan-1672-nuadat",
    "vathna-1678-anbhair",
    "agatha-unknown-aonghusa-130-2",
    "searach-1670-treathai",
    "wrantha-unknown-aonghusa-130-4",
    "wiorna-1694-aonghusa",
    "catania-1698-aonghusa",
    "magan-1704-aonghusa",
    "aine-aonghusa",
    "keebh-1710-aonghusa",
    "judan-1713-aonghusa",
    "mael-1697-caddach",
    "rioghnan-1693-casur",
    "griana-1706-tartarfhuil",
    "karanteg-ciarog",
    "eann-unknown-aonghusa-144-4",
    "kumhn-1720-aonghusa",
    "reamha-1725-aonghusa",
    "banbhin-1724-aonghusa",
    "wicche-1728-aonghusa",
    "carthach-1731-aonghusa",
    "neart-1735-aonghusa"
  ],
  "partnershipIds": [
    "marriage-hurracan-unknown-nuadat-115-1--treasa-founder-nuadat",
    "marriage-carthach-1608-casur--wiorna-1606-aonghusa",
    "marriage-naemhan-1606-aonghusa--vionnadh-1604-anbhair",
    "marriage-kumhn-1629-lockart--reamha-1626-aonghusa",
    "marriage-eachaidh-1630-caddach--fechin-1630-aonghusa",
    "marriage-geirlaug-unknown-aonghusa-110-2--hurracan-1632-aonghusa",
    "marriage-banbhin-1648-aonghusa--vaithreach-1651-riangabra",
    "marriage-kadghghan-1650-nessa--odhbha-1653-aonghusa",
    "marriage-orthanach-1649-luachra--searan-1652-aonghusa",
    "marriage-laoise-unknown-aonghusa-120-3--neart-1654-aonghusa",
    "marriage-treasa-1669-aonghusa--ultan-1672-nuadat",
    "marriage-cuan-1677-aonghusa--vathna-1678-anbhair",
    "marriage-agatha-unknown-aonghusa-130-2--hurracan-1679-aonghusa",
    "marriage-neidhe-1674-aonghusa--searach-1670-treathai",
    "marriage-hearn-1677-aonghusa--wrantha-unknown-aonghusa-130-4",
    "marriage-mael-1697-caddach--wiorna-1694-aonghusa",
    "marriage-catania-1698-aonghusa--rioghnan-1693-casur",
    "marriage-griana-1706-tartarfhuil--magan-1704-aonghusa",
    "marriage-karanteg-aine-ciarog",
    "marriage-eann-unknown-aonghusa-144-4--keebh-1710-aonghusa"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-hurracan-unknown-nuadat-115-1--treasa-founder-nuadat",
      "childIds": [
        "wiorna-1606-aonghusa",
        "naemhan-1606-aonghusa"
      ],
      "timeJumpId": "gap-dunfal-aonghusa-founders"
    },
    {
      "partnershipId": "marriage-carthach-1608-casur--wiorna-1606-aonghusa",
      "childIds": [
        "reamha-1626-aonghusa",
        "fechin-1630-aonghusa",
        "hurracan-1632-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-kumhn-1629-lockart--reamha-1626-aonghusa",
      "childIds": [
        "banbhin-1648-aonghusa",
        "odhbha-1653-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-geirlaug-unknown-aonghusa-110-2--hurracan-1632-aonghusa",
      "childIds": [
        "searan-1652-aonghusa",
        "neart-1654-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-banbhin-1648-aonghusa--vaithreach-1651-riangabra",
      "childIds": [
        "treasa-1669-aonghusa",
        "cuan-1677-aonghusa",
        "hurracan-1679-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-laoise-unknown-aonghusa-120-3--neart-1654-aonghusa",
      "childIds": [
        "neidhe-1674-aonghusa",
        "hearn-1677-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-treasa-1669-aonghusa--ultan-1672-nuadat",
      "childIds": [
        "wiorna-1694-aonghusa",
        "catania-1698-aonghusa",
        "magan-1704-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-agatha-unknown-aonghusa-130-2--hurracan-1679-aonghusa",
      "childIds": [
        "aine-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-hearn-1677-aonghusa--wrantha-unknown-aonghusa-130-4",
      "childIds": [
        "keebh-1710-aonghusa",
        "judan-1713-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-mael-1697-caddach--wiorna-1694-aonghusa",
      "childIds": [
        "kumhn-1720-aonghusa",
        "reamha-1725-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-griana-1706-tartarfhuil--magan-1704-aonghusa",
      "childIds": [
        "banbhin-1724-aonghusa",
        "wicche-1728-aonghusa"
      ]
    },
    {
      "partnershipId": "marriage-eann-unknown-aonghusa-144-4--keebh-1710-aonghusa",
      "childIds": [
        "carthach-1731-aonghusa",
        "neart-1735-aonghusa"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-naemhan-1606-aonghusa--vionnadh-1604-anbhair",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-eachaidh-1630-caddach--fechin-1630-aonghusa",
      "targetFamilyId": "haus-caddach",
      "houseId": "house-caddach"
    },
    {
      "partnershipId": "marriage-kadghghan-1650-nessa--odhbha-1653-aonghusa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-orthanach-1649-luachra--searan-1652-aonghusa",
      "targetFamilyId": "haus-luachra",
      "houseId": "house-luachra"
    },
    {
      "partnershipId": "marriage-cuan-1677-aonghusa--vathna-1678-anbhair",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-neidhe-1674-aonghusa--searach-1670-treathai",
      "targetFamilyId": "haus-treathai",
      "houseId": "house-treathai"
    },
    {
      "partnershipId": "marriage-catania-1698-aonghusa--rioghnan-1693-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-karanteg-aine-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "treasa-founder-nuadat",
    "wiorna-1606-aonghusa",
    "reamha-1626-aonghusa",
    "banbhin-1648-aonghusa",
    "treasa-1669-aonghusa"
  ],
  "titles": {
    "treasa-founder-nuadat": "Historisches Oberhaupt",
    "wiorna-1606-aonghusa": "Historisches Oberhaupt",
    "reamha-1626-aonghusa": "Historisches Oberhaupt",
    "banbhin-1648-aonghusa": "Historisches Oberhaupt",
    "treasa-1669-aonghusa": "Oberhaupt seit 1720",
    "wiorna-1694-aonghusa": "Erbfolge: 1",
    "reamha-1725-aonghusa": "Erbfolge: 2"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Treasa Nuadat und Hurracan begründen Aonghusa. Eine serielle Überlieferungslücke. Die kopierte Kinderüberschrift Wiórna/Naemhan wird anhand der Grafik und Casur-Gegenbeziehung zu Wiórna/Carthach berichtigt; Naemhan ist Wiórnas Geschwister und mit Vionnadh Anbhair verheiratet.",
  "currentHeadId": "treasa-1669-aonghusa",
  "heirIds": [
    "wiorna-1694-aonghusa",
    "reamha-1725-aonghusa"
  ],
  "description": "Dál’Aonghusa ist ein Laird-Clan mit Sitz in Cradh na Frinne im Land der Riesen. Seine Gründerin Treasa stammt aus der frühen Nuadat-Linie und begründet mit Hurracan den eigenen Clan. Die spätere Oberhauptfolge führt über Wiórna, Réamha und Banbhin zur heutigen Treasa, die den Clan seit 1720 leitet. Verbindungen zu Casur, Anbhair und Nuadat verknüpfen die Familien des Gebietes über viele Generationen."
});

export const HOUSE_AONGHUSA_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("aonghusa", SOURCE))));
