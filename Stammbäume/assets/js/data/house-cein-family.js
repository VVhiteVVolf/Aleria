import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { withBlaithneachSourceCounterUpgrade } from './blaithneach-source-counter-upgrade.js';
import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "gorman-founder-cein",
    "eilionoir-unknown-cein-91-0",
    "wairbhin-founder-cein",
    "damhan-founder-cein",
    "unbekannte-unknown-cein-103-0",
    "unbekannte-unknown-cein-103-1",
    "gearoid-cein",
    "hoiteann-1584-cein",
    "rhianon-wylan",
    "tiarnan-1580-ceallaigh",
    "gorman-1600-cein",
    "mairghread-cein",
    "proinnsias-1608-cein",
    "nearthflaith-1605-duilb",
    "naodhan-fiachrach",
    "dubessa-unknown-cein-125-2",
    "gearoid-1625-cein",
    "rabhla-1627-cein",
    "hoiteann-1630-cein",
    "uinseann-1632-cein",
    "heulyn-1628-torcmhar",
    "wiochan-1624-birn",
    "padraig-1628-ailella",
    "aoife-unknown-cein-135-3",
    "damhan-1648-cein",
    "elionoir-1650-cein",
    "fanbharr-1654-cein",
    "donnacha-1654-cein",
    "wairbhin-1657-cein",
    "viorica-1652-midgna",
    "malach-1647-mata",
    "griana-1656-cuilen",
    "helga-unknown-cein-145-3",
    "heilbhic-unknown-cein-145-4",
    "gorman-1670-cein",
    "maighread-1673-cein",
    "vannoch-1676-cein",
    "keallach-1680-cein",
    "ulfrik-1714-cein",
    "joriath-1678-cein",
    "hoireabard-1680-cein",
    "uillean-1674-treathai",
    "eachan-1669-fintain",
    "teleri-unknown-cein-159-2",
    "julbhach-unknown-cein-159-3",
    "feargal-1675-haeghra",
    "rioghnan-1694-cein",
    "banbhin-1697-cein",
    "eadbhard-1699-cein",
    "sorcha-cein",
    "proinnsias-1697-cein",
    "beathag-cein",
    "faoileann-1696-ailella",
    "fothradh-1694-chulainn",
    "yvanna-1704-birn",
    "padrig-wyrm",
    "oirigh-unknown-cein-177-0",
    "seamus-fiachrach",
    "gearoid-1717-cein",
    "heulyn-1722-cein",
    "neartfhlaith-cein",
    "pol-1730-cein",
    "eoghan-1723-cein",
    "liosa-cein",
    "zareck-1729-cein",
    "donnacha-1722-cein",
    "naomhan-1728-cein",
    "oideach-1729-fintain",
    "quilla-1722-treathai",
    "gudrun-unknown-cein-195-1"
  ],
  "partnershipIds": [
    "marriage-eilionoir-unknown-cein-91-0--gorman-founder-cein",
    "marriage-unbekannte-unknown-cein-103-0--wairbhin-founder-cein",
    "marriage-damhan-founder-cein--unbekannte-unknown-cein-103-1",
    "marriage-rhianon-gearoid",
    "marriage-hoiteann-1584-cein--tiarnan-1580-ceallaigh",
    "marriage-gorman-1600-cein--nearthflaith-1605-duilb",
    "marriage-naodhan-mairghread",
    "marriage-dubessa-unknown-cein-125-2--proinnsias-1608-cein",
    "marriage-gearoid-1625-cein--heulyn-1628-torcmhar",
    "marriage-rabhla-1627-cein--wiochan-1624-birn",
    "marriage-hoiteann-1630-cein--padraig-1628-ailella",
    "marriage-aoife-unknown-cein-135-3--uinseann-1632-cein",
    "marriage-damhan-1648-cein--viorica-1652-midgna",
    "marriage-elionoir-1650-cein--malach-1647-mata",
    "marriage-fanbharr-1654-cein--griana-1656-cuilen",
    "affair-fanbharr-1654-cein--helga-unknown-cein-145-3",
    "marriage-donnacha-1654-cein--heilbhic-unknown-cein-145-4",
    "marriage-gorman-1670-cein--uillean-1674-treathai",
    "marriage-eachan-1669-fintain--maighread-1673-cein",
    "marriage-teleri-unknown-cein-159-2--vannoch-1676-cein",
    "marriage-joriath-1678-cein--julbhach-unknown-cein-159-3",
    "marriage-feargal-1675-haeghra--hoireabard-1680-cein",
    "marriage-faoileann-1696-ailella--rioghnan-1694-cein",
    "marriage-banbhin-1697-cein--fothradh-1694-chulainn",
    "marriage-eadbhard-1699-cein--yvanna-1704-birn",
    "marriage-padrig-sorcha",
    "marriage-oirigh-unknown-cein-177-0--proinnsias-1697-cein",
    "marriage-seamus-beathag",
    "engagement-donnacha-1722-cein--quilla-1722-treathai",
    "affair-donnacha-1722-cein--gudrun-unknown-cein-195-1"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-eilionoir-unknown-cein-91-0--gorman-founder-cein",
      "childIds": [
        "wairbhin-founder-cein",
        "damhan-founder-cein"
      ],
      "timeJumpId": "gap-dunfal-cein-founders"
    },
    {
      "partnershipId": "marriage-damhan-founder-cein--unbekannte-unknown-cein-103-1",
      "childIds": [
        "gearoid-cein",
        "hoiteann-1584-cein"
      ],
      "timeJumpId": "gap-dunfal-cein-damhan"
    },
    {
      "partnershipId": "marriage-rhianon-gearoid",
      "childIds": [
        "gorman-1600-cein",
        "mairghread-cein",
        "proinnsias-1608-cein"
      ]
    },
    {
      "partnershipId": "marriage-gorman-1600-cein--nearthflaith-1605-duilb",
      "childIds": [
        "gearoid-1625-cein",
        "rabhla-1627-cein"
      ]
    },
    {
      "partnershipId": "marriage-dubessa-unknown-cein-125-2--proinnsias-1608-cein",
      "childIds": [
        "hoiteann-1630-cein",
        "uinseann-1632-cein"
      ]
    },
    {
      "partnershipId": "marriage-gearoid-1625-cein--heulyn-1628-torcmhar",
      "childIds": [
        "damhan-1648-cein",
        "elionoir-1650-cein",
        "fanbharr-1654-cein"
      ]
    },
    {
      "partnershipId": "marriage-aoife-unknown-cein-135-3--uinseann-1632-cein",
      "childIds": [
        "donnacha-1654-cein",
        "wairbhin-1657-cein"
      ]
    },
    {
      "partnershipId": "marriage-damhan-1648-cein--viorica-1652-midgna",
      "childIds": [
        "gorman-1670-cein",
        "maighread-1673-cein",
        "vannoch-1676-cein"
      ]
    },
    {
      "partnershipId": "marriage-fanbharr-1654-cein--griana-1656-cuilen",
      "childIds": [
        "keallach-1680-cein"
      ]
    },
    {
      "partnershipId": "affair-fanbharr-1654-cein--helga-unknown-cein-145-3",
      "childIds": [
        "ulfrik-1714-cein"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-donnacha-1654-cein--heilbhic-unknown-cein-145-4",
      "childIds": [
        "joriath-1678-cein",
        "hoireabard-1680-cein"
      ]
    },
    {
      "partnershipId": "marriage-gorman-1670-cein--uillean-1674-treathai",
      "childIds": [
        "rioghnan-1694-cein",
        "banbhin-1697-cein"
      ]
    },
    {
      "partnershipId": "marriage-teleri-unknown-cein-159-2--vannoch-1676-cein",
      "childIds": [
        "eadbhard-1699-cein",
        "sorcha-cein"
      ]
    },
    {
      "partnershipId": "marriage-joriath-1678-cein--julbhach-unknown-cein-159-3",
      "childIds": [
        "proinnsias-1697-cein",
        "beathag-cein"
      ]
    },
    {
      "partnershipId": "marriage-faoileann-1696-ailella--rioghnan-1694-cein",
      "childIds": [
        "gearoid-1717-cein",
        "heulyn-1722-cein",
        "neartfhlaith-cein",
        "pol-1730-cein"
      ]
    },
    {
      "partnershipId": "marriage-eadbhard-1699-cein--yvanna-1704-birn",
      "childIds": [
        "eoghan-1723-cein",
        "liosa-cein",
        "zareck-1729-cein"
      ]
    },
    {
      "partnershipId": "marriage-oirigh-unknown-cein-177-0--proinnsias-1697-cein",
      "childIds": [
        "donnacha-1722-cein",
        "naomhan-1728-cein"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-hoiteann-1584-cein--tiarnan-1580-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-naodhan-mairghread",
      "targetFamilyId": "haus-fiachrach",
      "houseId": "house-fiachrach"
    },
    {
      "partnershipId": "marriage-rabhla-1627-cein--wiochan-1624-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-hoiteann-1630-cein--padraig-1628-ailella",
      "targetFamilyId": "haus-ailella",
      "houseId": "house-ailella"
    },
    {
      "partnershipId": "marriage-elionoir-1650-cein--malach-1647-mata",
      "targetFamilyId": "haus-mata",
      "houseId": "house-mata"
    },
    {
      "partnershipId": "marriage-eachan-1669-fintain--maighread-1673-cein",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-feargal-1675-haeghra--hoireabard-1680-cein",
      "targetFamilyId": "haus-haeghra",
      "houseId": "house-haeghra"
    },
    {
      "partnershipId": "marriage-banbhin-1697-cein--fothradh-1694-chulainn",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-padrig-sorcha",
      "targetFamilyId": "haus-wyrm",
      "houseId": "house-wyrm"
    },
    {
      "partnershipId": "marriage-seamus-beathag",
      "targetFamilyId": "haus-fiachrach",
      "houseId": "house-fiachrach"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "neartfhlaith-cein",
      "targetFamilyId": "haus-dal-cruthin",
      "houseId": "house-dal-cruthin",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "liosa-cein",
      "targetFamilyId": "haus-fiachrach",
      "houseId": "house-fiachrach",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "oideach-1729-fintain",
      "parentId": "proinnsias-1697-cein"
    }
  ],
  "heads": [
    "gorman-founder-cein",
    "damhan-founder-cein",
    "gearoid-cein",
    "gorman-1600-cein",
    "gearoid-1625-cein",
    "damhan-1648-cein",
    "gorman-1670-cein"
  ],
  "titles": {
    "gorman-founder-cein": "Historisches Oberhaupt",
    "damhan-founder-cein": "Historisches Oberhaupt",
    "gearoid-cein": "Historisches Oberhaupt",
    "gorman-1600-cein": "Historisches Oberhaupt",
    "gearoid-1625-cein": "Historisches Oberhaupt",
    "damhan-1648-cein": "Historisches Oberhaupt",
    "gorman-1670-cein": "Laird seit 1719",
    "rioghnan-1694-cein": "Erbfolge: 1",
    "gearoid-1717-cein": "Erbfolge: 2",
    "pol-1730-cein": "Erbfolge: 3"
  },
  "personRoles": {
    "ulfrik-1714-cein": "bastard",
    "helga-unknown-cein-145-3": "affair",
    "gudrun-unknown-cein-195-1": "affair",
    "oideach-1729-fintain": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Die unbenannten Ehepersonen Wairbhíns und Damháns sind ausdrücklich in Tabelle und Grafik belegt. Ulfrik ist Fanbharrs und Helgas uneheliches Kind. Neartfhlaith und Liosa werden als Mündel an Cruthin und Fiachrach vermittelt; Oideach Fintain ist Proinnsias’ Mündel.",
  "currentHeadId": "gorman-1670-cein",
  "heirIds": [
    "rioghnan-1694-cein",
    "gearoid-1717-cein",
    "pol-1730-cein"
  ],
  "description": "Mac’Céin gehört zu den Laird-Clans von Tir na Rithe und hat seinen Sitz in Dunfal. Die frühe Überlieferung beginnt mit Gormán und Eilionoir; über Damháns Linie führt sie zur datierten Familie Gearoids und Rhianon Wylans. Seit 1719 leitet Górman den Clan. Die folgenden Generationen verbinden Céin unter anderem mit Ailella, Chulainn und Birn. Ríoghnán steht an erster Stelle der überlieferten Erbfolge."
});

export const HOUSE_CEIN_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(withBlaithneachSourceCounterUpgrade(createDunfalSourceFamily("cein", SOURCE))));
