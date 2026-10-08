import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "adomnan-founder-eachtrai",
    "paislie-unknown-eachtrai-88-0",
    "malachias-1604-eachtrai",
    "faelan-1607-eachtrai",
    "dervorgilla-eachtrai",
    "athracht-1608-ailella",
    "alasdair-trodach",
    "ibar-1627-eachtrai",
    "neidin-1632-eachtrai",
    "gilleasbuig-1634-eachtrai",
    "aibhilin-1631-duilb",
    "tolai-1628-casur",
    "sorcha-1636-riangabra",
    "colum-eachtrai",
    "quilline-1654-eachtrai",
    "aidan-1654-eachtrai",
    "padraigin-1656-eachtrai",
    "ronnat-tordarroch",
    "cet-1650-magach",
    "niamh-1652-caolan",
    "yrosan-unknown-eachtrai-120-3",
    "adomnan-1669-eachtrai",
    "uachall-1671-eachtrai",
    "gaothaire-1675-eachtrai",
    "catania-1676-eachtrai",
    "rhiona-1672-morath",
    "sualtaim-1668-chulainn",
    "eireann-unknown-eachtrai-130-2",
    "comgall-1675-ailella",
    "mirin-1693-eachtrai",
    "vionaigh-eachtrai",
    "kelch-1702-eachtrai",
    "lannan-1705-eachtrai",
    "scathan-1697-eachtrai",
    "eogair-1700-eachtrai",
    "viorica-1704-eachtrai",
    "sluagh-1697-magach",
    "haolthan-trodach",
    "glaisne-1708-fiachiontach",
    "ideog-unknown-eachtrai-144-3",
    "muireadach-1700-luachra",
    "aidan-1717-eachtrai",
    "paislie-1721-eachtrai",
    "ibar-1724-eachtrai",
    "lochin-1726-eachtrai",
    "vairne-1730-eachtrai",
    "iuliana-1723-eachtrai",
    "volla-1725-eachtrai"
  ],
  "partnershipIds": [
    "marriage-adomnan-founder-eachtrai--paislie-unknown-eachtrai-88-0",
    "marriage-athracht-1608-ailella--malachias-1604-eachtrai",
    "marriage-alasdair-dervorgilla",
    "marriage-aibhilin-1631-duilb--ibar-1627-eachtrai",
    "marriage-neidin-1632-eachtrai--tolai-1628-casur",
    "marriage-gilleasbuig-1634-eachtrai--sorcha-1636-riangabra",
    "marriage-colum-eachtrai--ronnat-tordarroch",
    "marriage-cet-1650-magach--quilline-1654-eachtrai",
    "marriage-aidan-1654-eachtrai--niamh-1652-caolan",
    "marriage-padraigin-1656-eachtrai--yrosan-unknown-eachtrai-120-3",
    "marriage-adomnan-1669-eachtrai--rhiona-1672-morath",
    "marriage-sualtaim-1668-chulainn--uachall-1671-eachtrai",
    "marriage-eireann-unknown-eachtrai-130-2--gaothaire-1675-eachtrai",
    "marriage-catania-1676-eachtrai--comgall-1675-ailella",
    "marriage-mirin-1693-eachtrai--sluagh-1697-magach",
    "marriage-haolthan-vionaigh",
    "marriage-glaisne-1708-fiachiontach--lannan-1705-eachtrai",
    "marriage-eogair-1700-eachtrai--ideog-unknown-eachtrai-144-3",
    "marriage-muireadach-1700-luachra--viorica-1704-eachtrai"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-adomnan-founder-eachtrai--paislie-unknown-eachtrai-88-0",
      "childIds": [
        "malachias-1604-eachtrai",
        "faelan-1607-eachtrai",
        "dervorgilla-eachtrai"
      ],
      "timeJumpId": "gap-dunfal-eachtrai-founders"
    },
    {
      "partnershipId": "marriage-athracht-1608-ailella--malachias-1604-eachtrai",
      "childIds": [
        "ibar-1627-eachtrai",
        "neidin-1632-eachtrai",
        "gilleasbuig-1634-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-aibhilin-1631-duilb--ibar-1627-eachtrai",
      "childIds": [
        "colum-eachtrai",
        "quilline-1654-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-gilleasbuig-1634-eachtrai--sorcha-1636-riangabra",
      "childIds": [
        "aidan-1654-eachtrai",
        "padraigin-1656-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-colum-eachtrai--ronnat-tordarroch",
      "childIds": [
        "adomnan-1669-eachtrai",
        "uachall-1671-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-padraigin-1656-eachtrai--yrosan-unknown-eachtrai-120-3",
      "childIds": [
        "gaothaire-1675-eachtrai",
        "catania-1676-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-adomnan-1669-eachtrai--rhiona-1672-morath",
      "childIds": [
        "mirin-1693-eachtrai",
        "vionaigh-eachtrai",
        "kelch-1702-eachtrai",
        "lannan-1705-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-eireann-unknown-eachtrai-130-2--gaothaire-1675-eachtrai",
      "childIds": [
        "scathan-1697-eachtrai",
        "eogair-1700-eachtrai",
        "viorica-1704-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-mirin-1693-eachtrai--sluagh-1697-magach",
      "childIds": [
        "aidan-1717-eachtrai",
        "paislie-1721-eachtrai",
        "ibar-1724-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-glaisne-1708-fiachiontach--lannan-1705-eachtrai",
      "childIds": [
        "lochin-1726-eachtrai",
        "vairne-1730-eachtrai"
      ]
    },
    {
      "partnershipId": "marriage-eogair-1700-eachtrai--ideog-unknown-eachtrai-144-3",
      "childIds": [
        "iuliana-1723-eachtrai",
        "volla-1725-eachtrai"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-alasdair-dervorgilla",
      "targetFamilyId": "haus-ard-trodach",
      "houseId": "house-trodach"
    },
    {
      "partnershipId": "marriage-neidin-1632-eachtrai--tolai-1628-casur",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-cet-1650-magach--quilline-1654-eachtrai",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-aidan-1654-eachtrai--niamh-1652-caolan",
      "targetFamilyId": "haus-caolan",
      "houseId": "house-caolan"
    },
    {
      "partnershipId": "marriage-sualtaim-1668-chulainn--uachall-1671-eachtrai",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-catania-1676-eachtrai--comgall-1675-ailella",
      "targetFamilyId": "haus-ailella",
      "houseId": "house-ailella"
    },
    {
      "partnershipId": "marriage-haolthan-vionaigh",
      "targetFamilyId": "haus-ard-trodach",
      "houseId": "house-trodach"
    },
    {
      "partnershipId": "marriage-muireadach-1700-luachra--viorica-1704-eachtrai",
      "targetFamilyId": "haus-luachra",
      "houseId": "house-luachra"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "adomnan-founder-eachtrai",
    "malachias-1604-eachtrai"
  ],
  "titles": {
    "adomnan-founder-eachtrai": "Historisches Oberhaupt",
    "malachias-1604-eachtrai": "Laird von Athenry",
    "colum-eachtrai": "Erbfolge: 1",
    "adomnan-1669-eachtrai": "Erbfolge: 2",
    "mirin-1693-eachtrai": "Erbfolge: 3",
    "aidan-1717-eachtrai": "Erbfolge: 4",
    "ibar-1724-eachtrai": "Erbfolge: 5"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Malachias bleibt gemäß Quelle lebend; sein hohes Alter allein begründet keinen Todesvermerk. Uachall ist die in Chulainn auch Uallach genannte Eheperson Sualtaims.",
  "currentHeadId": "malachias-1604-eachtrai",
  "heirIds": [
    "colum-eachtrai",
    "adomnan-1669-eachtrai",
    "mirin-1693-eachtrai",
    "aidan-1717-eachtrai",
    "ibar-1724-eachtrai"
  ],
  "description": "Mac’Eachtrai ist ein Laird-Clan von Tir na Fathach mit Sitz in Athenry. Die Überlieferung beginnt mit Adomnan und Paislie; nach unbekannten Zwischengenerationen folgt die Familie Malachias’. Er ist weiterhin als lebendes Oberhaupt belegt. Über seinen Sohn Ibar führt die Erbfolge zu Colum, Adomnan und Mirin. Heiraten mit Ailella, Chulainn, Casur und Morath verbinden den Clan mit weiteren Häusern Dunfals."
});

export const HOUSE_EACHTRAI_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("eachtrai", SOURCE))));
