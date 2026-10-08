import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "finbarr-founder-ailella",
    "athracht-unknown-ailella-88-0",
    "eimear-ailella",
    "padraig-founder-ailella",
    "gobnait-founder-ailella",
    "uryen-marwolaeth",
    "darerca-unknown-ailella-99-1",
    "luibheas-founder-laga",
    "finbarr-1605-ailella",
    "athracht-1608-ailella",
    "comgall-1610-ailella",
    "padhla-1608-cleirigh",
    "malachias-1604-eachtrai",
    "uisigh-1613-carnegie",
    "padraig-1628-ailella",
    "gobnait-1631-ailella",
    "cearbhall-ailella",
    "kessog-1633-ailella",
    "hoiteann-1630-cein",
    "cathalan-1627-duilb",
    "latiaran-1629-ceinselaig",
    "uisigh-unknown-ailella-121-3",
    "quinn-ailella",
    "inghean-1650-ailella",
    "eibhlin-1652-ailella",
    "chuniald-1654-ailella",
    "brigida-1656-ailella",
    "llewella-marwolaeth",
    "finnian-1646-magach",
    "zorman-1648-birn",
    "beileag-unknown-ailella-131-3",
    "fionnchu-1650-duff",
    "comgall-1675-ailella",
    "emer-ailella",
    "mairghread-1684-ailella",
    "natfrech-1677-ailella",
    "athracht-1677-ailella",
    "catania-1676-eachtrai",
    "tarrant-ciarog",
    "fearghas-1683-chulainn",
    "aolbha-unknown-ailella-141-3",
    "keiran-unknown-ailella-141-4",
    "finnegan-1694-ailella",
    "faylin-1696-ailella",
    "finnbar-mac-ailella",
    "mochonna-1696-ailella",
    "faoileann-1696-ailella",
    "kilian-1700-ailella",
    "tuarenn-1703-ailella",
    "aisling-1698-luga",
    "ermeleddin-1698-wylan",
    "irma-helgr",
    "zirdhna-unknown-ailella-155-3",
    "rioghnan-1694-cein",
    "fechin-unknown-ailella-159-0",
    "xioran-1698-birn",
    "gobnait-1719-ailella",
    "aindi-1726-ailella",
    "ruadan-1722-ailella",
    "lasair-1727-ailella",
    "caolan-1727-fiachiontach",
    "kessog-1720-ailella",
    "dabheog-1724-ailella",
    "bega-1727-ailella",
    "eibban-1730-ailella",
    "darerca-1726-ailella"
  ],
  "partnershipIds": [
    "marriage-athracht-unknown-ailella-88-0--finbarr-founder-ailella",
    "marriage-uryen-eimear-marwolaeth",
    "marriage-darerca-unknown-ailella-99-1--padraig-founder-ailella",
    "marriage-gobnait-founder-ailella--luibheas-founder-laga",
    "marriage-finbarr-1605-ailella--padhla-1608-cleirigh",
    "marriage-athracht-1608-ailella--malachias-1604-eachtrai",
    "marriage-comgall-1610-ailella--uisigh-1613-carnegie",
    "marriage-hoiteann-1630-cein--padraig-1628-ailella",
    "marriage-cathalan-1627-duilb--gobnait-1631-ailella",
    "marriage-cearbhall-ailella--latiaran-1629-ceinselaig",
    "marriage-kessog-1633-ailella--uisigh-unknown-ailella-121-3",
    "marriage-llewella-quinn-marwolaeth",
    "marriage-finnian-1646-magach--inghean-1650-ailella",
    "marriage-eibhlin-1652-ailella--zorman-1648-birn",
    "marriage-beileag-unknown-ailella-131-3--chuniald-1654-ailella",
    "marriage-brigida-1656-ailella--fionnchu-1650-duff",
    "marriage-catania-1676-eachtrai--comgall-1675-ailella",
    "marriage-tarrant-emer-ciarog",
    "marriage-fearghas-1683-chulainn--mairghread-1684-ailella",
    "marriage-aolbha-unknown-ailella-141-3--natfrech-1677-ailella",
    "marriage-athracht-1677-ailella--keiran-unknown-ailella-141-4",
    "marriage-aisling-1698-luga--finnegan-1694-ailella",
    "marriage-ermeleddin-1698-wylan--faylin-1696-ailella",
    "marriage-irma-finnbar-mac-ailella",
    "marriage-mochonna-1696-ailella--zirdhna-unknown-ailella-155-3",
    "marriage-faoileann-1696-ailella--rioghnan-1694-cein",
    "marriage-fechin-unknown-ailella-159-0--kilian-1700-ailella",
    "marriage-tuarenn-1703-ailella--xioran-1698-birn"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-athracht-unknown-ailella-88-0--finbarr-founder-ailella",
      "childIds": [
        "eimear-ailella",
        "padraig-founder-ailella",
        "gobnait-founder-ailella"
      ],
      "timeJumpId": "gap-dunfal-ailella-founders"
    },
    {
      "partnershipId": "marriage-darerca-unknown-ailella-99-1--padraig-founder-ailella",
      "childIds": [
        "finbarr-1605-ailella",
        "athracht-1608-ailella",
        "comgall-1610-ailella"
      ],
      "timeJumpId": "gap-dunfal-ailella-padraig"
    },
    {
      "partnershipId": "marriage-finbarr-1605-ailella--padhla-1608-cleirigh",
      "childIds": [
        "padraig-1628-ailella",
        "gobnait-1631-ailella"
      ]
    },
    {
      "partnershipId": "marriage-comgall-1610-ailella--uisigh-1613-carnegie",
      "childIds": [
        "cearbhall-ailella",
        "kessog-1633-ailella"
      ]
    },
    {
      "partnershipId": "marriage-hoiteann-1630-cein--padraig-1628-ailella",
      "childIds": [
        "quinn-ailella",
        "inghean-1650-ailella",
        "eibhlin-1652-ailella"
      ]
    },
    {
      "partnershipId": "marriage-kessog-1633-ailella--uisigh-unknown-ailella-121-3",
      "childIds": [
        "chuniald-1654-ailella",
        "brigida-1656-ailella"
      ]
    },
    {
      "partnershipId": "marriage-llewella-quinn-marwolaeth",
      "childIds": [
        "comgall-1675-ailella",
        "emer-ailella",
        "mairghread-1684-ailella",
        "natfrech-1677-ailella"
      ]
    },
    {
      "partnershipId": "marriage-beileag-unknown-ailella-131-3--chuniald-1654-ailella",
      "childIds": [
        "athracht-1677-ailella"
      ]
    },
    {
      "partnershipId": "marriage-catania-1676-eachtrai--comgall-1675-ailella",
      "childIds": [
        "finnegan-1694-ailella",
        "faylin-1696-ailella",
        "finnbar-mac-ailella"
      ]
    },
    {
      "partnershipId": "marriage-aolbha-unknown-ailella-141-3--natfrech-1677-ailella",
      "childIds": [
        "mochonna-1696-ailella",
        "faoileann-1696-ailella"
      ]
    },
    {
      "partnershipId": "marriage-athracht-1677-ailella--keiran-unknown-ailella-141-4",
      "childIds": [
        "kilian-1700-ailella",
        "tuarenn-1703-ailella"
      ]
    },
    {
      "partnershipId": "marriage-aisling-1698-luga--finnegan-1694-ailella",
      "childIds": [
        "gobnait-1719-ailella",
        "aindi-1726-ailella"
      ]
    },
    {
      "partnershipId": "marriage-irma-finnbar-mac-ailella",
      "childIds": [
        "ruadan-1722-ailella",
        "lasair-1727-ailella"
      ]
    },
    {
      "partnershipId": "marriage-mochonna-1696-ailella--zirdhna-unknown-ailella-155-3",
      "childIds": [
        "kessog-1720-ailella",
        "dabheog-1724-ailella",
        "bega-1727-ailella",
        "eibban-1730-ailella"
      ]
    },
    {
      "partnershipId": "marriage-fechin-unknown-ailella-159-0--kilian-1700-ailella",
      "childIds": [
        "darerca-1726-ailella"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-uryen-eimear-marwolaeth",
      "targetFamilyId": "haus-marwolaeth",
      "houseId": "house-marwolaeth"
    },
    {
      "partnershipId": "marriage-gobnait-founder-ailella--luibheas-founder-laga",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga"
    },
    {
      "partnershipId": "marriage-athracht-1608-ailella--malachias-1604-eachtrai",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-cathalan-1627-duilb--gobnait-1631-ailella",
      "targetFamilyId": "haus-duilb",
      "houseId": "house-duilb"
    },
    {
      "partnershipId": "marriage-cearbhall-ailella--latiaran-1629-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-finnian-1646-magach--inghean-1650-ailella",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-eibhlin-1652-ailella--zorman-1648-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-brigida-1656-ailella--fionnchu-1650-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-tarrant-emer-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-fearghas-1683-chulainn--mairghread-1684-ailella",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-ermeleddin-1698-wylan--faylin-1696-ailella",
      "targetFamilyId": "haus-wylan",
      "houseId": "house-wylan"
    },
    {
      "partnershipId": "marriage-faoileann-1696-ailella--rioghnan-1694-cein",
      "targetFamilyId": "haus-cein",
      "houseId": "house-cein"
    },
    {
      "partnershipId": "marriage-tuarenn-1703-ailella--xioran-1698-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "aindi-1726-ailella",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "caolan-1727-fiachiontach",
      "parentId": "finnbar-mac-ailella"
    }
  ],
  "heads": [
    "finbarr-founder-ailella",
    "padraig-founder-ailella",
    "finbarr-1605-ailella",
    "padraig-1628-ailella",
    "quinn-ailella"
  ],
  "titles": {
    "finbarr-founder-ailella": "Sankt Finbarr · Legendärer Gründer",
    "padraig-founder-ailella": "Historisches Oberhaupt",
    "finbarr-1605-ailella": "Historisches Oberhaupt",
    "padraig-1628-ailella": "Historisches Oberhaupt",
    "quinn-ailella": "Laird seit 1720",
    "comgall-1675-ailella": "Erbfolge: 1"
  },
  "personRoles": {
    "caolan-1727-fiachiontach": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Aindí ist leibliches Kind Finnegans und Aislings und laut blauer Karte als Mündel an Magach vermittelt. Caolán Fiachiontach ist Finnbars aufgenommenes Mündel. Der belegte Helgr-Ehepartner Finnbar Mac Ailella gehört zu dieser Linie; Personen- und Welt-ID bleiben erhalten.",
  "currentHeadId": "quinn-ailella",
  "heirIds": [
    "comgall-1675-ailella"
  ],
  "description": "Mac Sidhe’Ailella ist ein Laird-Clan mit Sitz in Dunfal. Er beruft sich auf Sankt Finbarr, den Lichtfels, dem die Überlieferung das Wunder von Dunfal zuschreibt: Vierzehn Tage soll die Sonne während seines Gebets nicht untergegangen sein. Seine Nachkommen verstehen sich als Gelehrte und Kriegerpriester, die dieses Glaubenserbe weitertragen. Die Wahrhaftigkeit des Wunders bleibt zwischen kirchlichen Stimmen, Fianna und Druiden umstritten. Quinn steht dem Clan seit 1720 vor."
});

export const HOUSE_AILELLA_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("ailella", SOURCE))));
