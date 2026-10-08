import { withFaelaornSourceCounterUpgrade } from './faelaorn-source-counter-upgrade.js';
import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "colman-1480-chulainn",
    "tiarnait-unknown-chulainn-88-0",
    "finnchaem-1507-chulainn",
    "cu-1509-chulainn",
    "amairgin-1512-chulainn",
    "emer-unknown-chulainn-98-0",
    "connla-1660-chulainn",
    "damhnait-1664-chulainn",
    "faoiltiama-chulainn",
    "sualtaim-1668-chulainn",
    "meridia-chulainn",
    "nessa-1672-chulainn",
    "setanta-1674-chulainn",
    "cadence-1676-chulainn",
    "ruaidhrigh-1680-chulainn",
    "quarnait-1665-urquhart",
    "tadg-1663-nuadat",
    "cormac-1664-airt",
    "uachall-1671-eachtrai",
    "faolan-gallchobhair",
    "goll-1668-morna",
    "aleyna-unknown-chulainn-115-1",
    "cael-1670-ronain",
    "ciorstaidh-1682-stwatchn",
    "fearghas-1683-chulainn",
    "grainne-chuulain",
    "fothradh-1694-chulainn",
    "koarnach-1700-chulainn",
    "tomaltach-1689-chulainn",
    "lughaidh-1694-chulainn",
    "ronan-1694-chulainn",
    "blathnath-1695-chulainn",
    "shurkan-1700-chulainn",
    "avissa-1704-chulainn",
    "lorgain-1700-chulainn",
    "lianan-1705-chulainn",
    "mairghread-1684-ailella",
    "fionn-1686-cumhail",
    "banbhin-1697-cein",
    "tiobraide-1695-magach",
    "talitha-1690-cetchathach",
    "vailibh-1698-roich",
    "lugaid-1690-laga",
    "beathag-1703-birn",
    "dervla-1702-cethrenn",
    "raghallach-1699-conochbhair",
    "tiarnog-1703-chulainn",
    "caitria-1705-chulainn",
    "conleach-1708-chulainn",
    "artair-founder-roth",
    "rabhan-1718-chulainn",
    "gobaith-1723-chulainn",
    "lugh-1715-chulainn",
    "tiarnait-1720-chulainn",
    "yllana-1723-chulainn",
    "abhan-1716-chulainn",
    "macraith-1720-chulainn",
    "praithi-1724-chulainn",
    "karrach-1723-chulainn",
    "aibhne-1727-chulainn",
    "hiomhar-1723-chulainn",
    "keitha-1730-chulainn",
    "noghan-1730-chulainn",
    "hailaigh-1705-morath",
    "latrell-1700-morna",
    "harailt-1716-riangabra",
    "junaidh-1718-mata",
    "colman-1728-chulainn",
    "tadg-1732-chulainn",
    "lorcan-1736-chulainn"
  ],
  "partnershipIds": [
    "marriage-colman-1480-chulainn--tiarnait-unknown-chulainn-88-0",
    "marriage-cu-1509-chulainn--emer-unknown-chulainn-98-0",
    "marriage-connla-1660-chulainn--quarnait-1665-urquhart",
    "marriage-damhnait-1664-chulainn--tadg-1663-nuadat",
    "marriage-cormac-faoiltiama-airt",
    "marriage-sualtaim-1668-chulainn--uachall-1671-eachtrai",
    "marriage-faolan-meridia",
    "marriage-goll-1668-morna--nessa-1672-chulainn",
    "marriage-aleyna-unknown-chulainn-115-1--setanta-1674-chulainn",
    "marriage-cadence-1676-chulainn--cael-1670-ronain",
    "marriage-ciorstaidh-1682-stwatchn--ruaidhrigh-1680-chulainn",
    "marriage-fearghas-1683-chulainn--mairghread-1684-ailella",
    "marriage-fionn-grainne",
    "marriage-banbhin-1697-cein--fothradh-1694-chulainn",
    "marriage-tiobraide-1695-magach--tomaltach-1689-chulainn",
    "marriage-lughaidh-1694-chulainn--talitha-1690-cetchathach",
    "marriage-ronan-1694-chulainn--vailibh-1698-roich",
    "marriage-blathnath-1695-chulainn--lugaid-1690-laga",
    "marriage-beathag-1703-birn--shurkan-1700-chulainn",
    "marriage-dervla-1702-cethrenn--lorgain-1700-chulainn",
    "marriage-lianan-1705-chulainn--raghallach-1699-conochbhair",
    "marriage-hailaigh-1705-morath--tiarnog-1703-chulainn",
    "marriage-caitria-1705-chulainn--latrell-1700-morna",
    "engagement-harailt-1716-riangabra--yllana-1723-chulainn",
    "marriage-abhan-1716-chulainn--junaidh-1718-mata"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-colman-1480-chulainn--tiarnait-unknown-chulainn-88-0",
      "childIds": [
        "finnchaem-1507-chulainn",
        "cu-1509-chulainn",
        "amairgin-1512-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-cu-1509-chulainn--emer-unknown-chulainn-98-0",
      "childIds": [
        "connla-1660-chulainn",
        "damhnait-1664-chulainn",
        "faoiltiama-chulainn",
        "sualtaim-1668-chulainn",
        "meridia-chulainn",
        "nessa-1672-chulainn",
        "setanta-1674-chulainn",
        "cadence-1676-chulainn",
        "ruaidhrigh-1680-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-connla-1660-chulainn--quarnait-1665-urquhart",
      "childIds": [
        "fearghas-1683-chulainn",
        "grainne-chuulain",
        "fothradh-1694-chulainn",
        "koarnach-1700-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-sualtaim-1668-chulainn--uachall-1671-eachtrai",
      "childIds": [
        "tomaltach-1689-chulainn",
        "lughaidh-1694-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-aleyna-unknown-chulainn-115-1--setanta-1674-chulainn",
      "childIds": [
        "shurkan-1700-chulainn",
        "avissa-1704-chulainn"
      ],
      "type": "adoptive",
      "certainty": "confirmed",
      "notes": "Adoption vom Nutzer am 07.10.2026 bestätigt."
    },
    {
      "partnershipId": "marriage-aleyna-unknown-chulainn-115-1--setanta-1674-chulainn",
      "childIds": [
        "ronan-1694-chulainn",
        "blathnath-1695-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-ciorstaidh-1682-stwatchn--ruaidhrigh-1680-chulainn",
      "childIds": [
        "lorgain-1700-chulainn",
        "lianan-1705-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-fearghas-1683-chulainn--mairghread-1684-ailella",
      "childIds": [
        "tiarnog-1703-chulainn",
        "caitria-1705-chulainn",
        "conleach-1708-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-banbhin-1697-cein--fothradh-1694-chulainn",
      "childIds": [
        "rabhan-1718-chulainn",
        "gobaith-1723-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-tiobraide-1695-magach--tomaltach-1689-chulainn",
      "childIds": [
        "lugh-1715-chulainn",
        "tiarnait-1720-chulainn",
        "yllana-1723-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-ronan-1694-chulainn--vailibh-1698-roich",
      "childIds": [
        "abhan-1716-chulainn",
        "macraith-1720-chulainn",
        "praithi-1724-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-beathag-1703-birn--shurkan-1700-chulainn",
      "childIds": [
        "karrach-1723-chulainn",
        "aibhne-1727-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-dervla-1702-cethrenn--lorgain-1700-chulainn",
      "childIds": [
        "hiomhar-1723-chulainn",
        "keitha-1730-chulainn",
        "noghan-1730-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-hailaigh-1705-morath--tiarnog-1703-chulainn",
      "childIds": [
        "colman-1728-chulainn",
        "tadg-1732-chulainn"
      ]
    },
    {
      "partnershipId": "marriage-abhan-1716-chulainn--junaidh-1718-mata",
      "childIds": [
        "lorcan-1736-chulainn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-damhnait-1664-chulainn--tadg-1663-nuadat",
      "targetFamilyId": "haus-nuadat",
      "houseId": "house-nuadat"
    },
    {
      "partnershipId": "marriage-cormac-faoiltiama-airt",
      "targetFamilyId": "haus-mac-airt",
      "houseId": "house-mac-airt"
    },
    {
      "partnershipId": "marriage-faolan-meridia",
      "targetFamilyId": "haus-gallchobhair",
      "houseId": "house-gallchobhair"
    },
    {
      "partnershipId": "marriage-goll-1668-morna--nessa-1672-chulainn",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-cadence-1676-chulainn--cael-1670-ronain",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-fionn-grainne",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-lughaidh-1694-chulainn--talitha-1690-cetchathach",
      "targetFamilyId": "haus-cetchathach",
      "houseId": "house-cetchathach"
    },
    {
      "partnershipId": "marriage-blathnath-1695-chulainn--lugaid-1690-laga",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga"
    },
    {
      "partnershipId": "marriage-lianan-1705-chulainn--raghallach-1699-conochbhair",
      "targetFamilyId": "haus-conochbhair",
      "houseId": "house-conochbhair"
    },
    {
      "partnershipId": "marriage-caitria-1705-chulainn--latrell-1700-morna",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "tiarnait-1720-chulainn",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "artair-founder-roth",
      "parentId": "fearghas-1683-chulainn"
    }
  ],
  "heads": [
    "cu-1509-chulainn"
  ],
  "titles": {
    "cu-1509-chulainn": "Ard Tiarna von Dunfal · Gründer",
    "connla-1660-chulainn": "Mor Tiarna von Dunfal · Erster Erbe",
    "fearghas-1683-chulainn": "Erbfolge: 2",
    "tiarnog-1703-chulainn": "Erbfolge: 3",
    "colman-1728-chulainn": "Erbfolge: 4",
    "tadg-1732-chulainn": "Erbfolge: 5"
  },
  "personRoles": {
    "shurkan-1700-chulainn": "adopted",
    "avissa-1704-chulainn": "adopted",
    "artair-founder-roth": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Colmán und Tiarnait stehen als leibliche Eltern vor dem Hausgründer Cú. Keine Überlieferungslücke. Artair Roth ist Fearghas’ Mündel; Tiarnait (1720) wird laut Grafik als Mündel an Ronain vermittelt. Yllána und Harailt sind verlobt.",
  "currentHeadId": "cu-1509-chulainn",
  "heirIds": [
    "connla-1660-chulainn",
    "fearghas-1683-chulainn",
    "tiarnog-1703-chulainn",
    "colman-1728-chulainn",
    "tadg-1732-chulainn"
  ],
  "description": "Ard’Chulainn ist der Fürstenclan Dunfals und herrscht über Tir na Rithe, das Land der Könige. Sein Gründer Cú entstammt der Familie des Holzfällers Colmán und der langlebigen Tiarnait. Wo einst Colmáns Hütte stand, befindet sich heute ein Anwesen des Clans. Cús Verbindung mit der berühmten Bardin Emer begründet die weit verzweigte heutige Linie; Connla führt die Erbfolge an.",
  "founderPartnershipId": "marriage-cu-1509-chulainn--emer-unknown-chulainn-98-0",
  "founderId": "cu-1509-chulainn"
});

export const HOUSE_CHULAINN_FAMILY = withFaelaornSourceCounterUpgrade(withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("chulainn", SOURCE)))));
