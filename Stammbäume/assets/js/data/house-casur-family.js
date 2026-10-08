import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "tolai-founder-nuadat",
    "haibrhinn-unknown-nuadat-103-0",
    "muircheartach-1604-casur",
    "carthach-1608-casur",
    "ruairc-1610-casur",
    "treabha-1608-eoghainn",
    "wiorna-1606-aonghusa",
    "jiarla-unknown-casur-100-2",
    "maire-1626-casur",
    "tolai-1628-casur",
    "peagan-1632-casur",
    "mairead-1634-casur",
    "toirberth-1624-anbhair",
    "neidin-1632-eachtrai",
    "donal-1628-riangabra",
    "zeargan-1627-rowak",
    "ronan-1648-casur",
    "eimhear-casur",
    "zareck-1652-casur",
    "seallach-1655-casur",
    "latharna-1652-morath",
    "ruairne-1647-leite",
    "mebh-1654-nuadat",
    "jathghal-1651-culloch",
    "muircheartach-1670-casur",
    "oona-1676-casur",
    "eimhin-1673-casur",
    "carthach-1675-casur",
    "dairine-1675-anbhair",
    "tarlachan-1670-birn",
    "orthanach-1670-lockart",
    "joaigh-unknown-casur-130-3",
    "rioghnan-1693-casur",
    "hadhbh-1710-casur",
    "noghan-1700-casur",
    "ruaric-1697-casur",
    "biorna-1703-casur",
    "catania-1698-aonghusa",
    "earc-1710-nuadat",
    "eilis-1704-rioga",
    "nithin-unknown-casur-140-3",
    "hectan-1699-clannmhar",
    "laeg-1715-casur",
    "caitria-1722-casur",
    "emer-casur",
    "polan-1724-casur",
    "eimhin-1728-casur",
    "cuan-1722-casur",
    "whelan-1725-casur"
  ],
  "partnershipIds": [
    "marriage-haibrhinn-unknown-nuadat-103-0--tolai-founder-nuadat",
    "marriage-muircheartach-1604-casur--treabha-1608-eoghainn",
    "marriage-carthach-1608-casur--wiorna-1606-aonghusa",
    "marriage-jiarla-unknown-casur-100-2--ruairc-1610-casur",
    "marriage-maire-1626-casur--toirberth-1624-anbhair",
    "marriage-neidin-1632-eachtrai--tolai-1628-casur",
    "marriage-donal-1628-riangabra--peagan-1632-casur",
    "marriage-mairead-1634-casur--zeargan-1627-rowak",
    "marriage-latharna-1652-morath--ronan-1648-casur",
    "marriage-eimhear-casur--ruairne-1647-leite",
    "marriage-mebh-1654-nuadat--zareck-1652-casur",
    "marriage-jathghal-1651-culloch--seallach-1655-casur",
    "marriage-dairine-1675-anbhair--muircheartach-1670-casur",
    "marriage-oona-1676-casur--tarlachan-1670-birn",
    "marriage-eimhin-1673-casur--orthanach-1670-lockart",
    "marriage-carthach-1675-casur--joaigh-unknown-casur-130-3",
    "marriage-catania-1698-aonghusa--rioghnan-1693-casur",
    "marriage-earc-1710-nuadat--hadhbh-1710-casur",
    "marriage-eilis-1704-rioga--noghan-1700-casur",
    "marriage-nithin-unknown-casur-140-3--ruaric-1697-casur",
    "marriage-biorna-1703-casur--hectan-1699-clannmhar"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-haibrhinn-unknown-nuadat-103-0--tolai-founder-nuadat",
      "childIds": [
        "muircheartach-1604-casur",
        "carthach-1608-casur",
        "ruairc-1610-casur"
      ],
      "timeJumpId": "gap-dunfal-casur-founders"
    },
    {
      "partnershipId": "marriage-muircheartach-1604-casur--treabha-1608-eoghainn",
      "childIds": [
        "maire-1626-casur",
        "tolai-1628-casur"
      ]
    },
    {
      "partnershipId": "marriage-jiarla-unknown-casur-100-2--ruairc-1610-casur",
      "childIds": [
        "peagan-1632-casur",
        "mairead-1634-casur"
      ]
    },
    {
      "partnershipId": "marriage-neidin-1632-eachtrai--tolai-1628-casur",
      "childIds": [
        "ronan-1648-casur",
        "eimhear-casur",
        "zareck-1652-casur",
        "seallach-1655-casur"
      ]
    },
    {
      "partnershipId": "marriage-latharna-1652-morath--ronan-1648-casur",
      "childIds": [
        "muircheartach-1670-casur",
        "oona-1676-casur"
      ]
    },
    {
      "partnershipId": "marriage-mebh-1654-nuadat--zareck-1652-casur",
      "childIds": [
        "eimhin-1673-casur",
        "carthach-1675-casur"
      ]
    },
    {
      "partnershipId": "marriage-dairine-1675-anbhair--muircheartach-1670-casur",
      "childIds": [
        "rioghnan-1693-casur",
        "hadhbh-1710-casur",
        "noghan-1700-casur"
      ]
    },
    {
      "partnershipId": "marriage-carthach-1675-casur--joaigh-unknown-casur-130-3",
      "childIds": [
        "ruaric-1697-casur",
        "biorna-1703-casur"
      ]
    },
    {
      "partnershipId": "marriage-catania-1698-aonghusa--rioghnan-1693-casur",
      "childIds": [
        "laeg-1715-casur",
        "caitria-1722-casur",
        "emer-casur"
      ]
    },
    {
      "partnershipId": "marriage-eilis-1704-rioga--noghan-1700-casur",
      "childIds": [
        "polan-1724-casur",
        "eimhin-1728-casur"
      ]
    },
    {
      "partnershipId": "marriage-nithin-unknown-casur-140-3--ruaric-1697-casur",
      "childIds": [
        "cuan-1722-casur",
        "whelan-1725-casur"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-carthach-1608-casur--wiorna-1606-aonghusa",
      "targetFamilyId": "haus-aonghusa",
      "houseId": "house-aonghusa"
    },
    {
      "partnershipId": "marriage-maire-1626-casur--toirberth-1624-anbhair",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-donal-1628-riangabra--peagan-1632-casur",
      "targetFamilyId": "haus-riangabra",
      "houseId": "house-riangabra"
    },
    {
      "partnershipId": "marriage-mairead-1634-casur--zeargan-1627-rowak",
      "targetFamilyId": "haus-rowak",
      "houseId": "house-rowak"
    },
    {
      "partnershipId": "marriage-eimhear-casur--ruairne-1647-leite",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    },
    {
      "partnershipId": "marriage-jathghal-1651-culloch--seallach-1655-casur",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-oona-1676-casur--tarlachan-1670-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-eimhin-1673-casur--orthanach-1670-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-earc-1710-nuadat--hadhbh-1710-casur",
      "targetFamilyId": "haus-nuadat",
      "houseId": "house-nuadat"
    },
    {
      "partnershipId": "marriage-biorna-1703-casur--hectan-1699-clannmhar",
      "targetFamilyId": "haus-clannmhar",
      "houseId": "house-clannmhar"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "emer-casur",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "tolai-founder-nuadat",
    "muircheartach-1604-casur",
    "tolai-1628-casur",
    "ronan-1648-casur",
    "muircheartach-1670-casur"
  ],
  "titles": {
    "tolai-founder-nuadat": "Historisches Oberhaupt",
    "muircheartach-1604-casur": "Historisches Oberhaupt",
    "tolai-1628-casur": "Historisches Oberhaupt",
    "ronan-1648-casur": "Historisches Oberhaupt",
    "muircheartach-1670-casur": "Laird seit 1723",
    "rioghnan-1693-casur": "Erbfolge: 1",
    "laeg-1715-casur": "Erbfolge: 2"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Tólaí Nuadat und Hairbrhinn begründen Casur. Eine serielle Überlieferungslücke. Emer ist Ríoghnáns und Catanias leibliche Tochter und Karanteg Ciarógs Mündel; die bestehende Verlobung mit Loyd Ciaróg bleibt bestehen.",
  "currentHeadId": "muircheartach-1670-casur",
  "heirIds": [
    "rioghnan-1693-casur",
    "laeg-1715-casur"
  ],
  "description": "Ua’Casur ist ein aus der frühen Nuadat-Linie hervorgegangener Laird-Clan. Tólaí Nuadat und Hairbrhinn begründen das Haus, dessen Sitz heute in Cradh na Frinne liegt. Die datierte Linie führt über Muircheartach, Tólaí und Rónán zum heutigen Muircheartach, der seit 1723 Oberhaupt ist. Ríoghnán und dessen Sohn Láeg stehen in der überlieferten Erbfolge; Emer wird als Mündel im Clan Ciaróg aufgenommen."
});

export const HOUSE_CASUR_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(createDunfalSourceFamily("casur", SOURCE)));
