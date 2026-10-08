import { createDamhSourceFamily } from './damh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "giollan-founder-abhrach",
    "tuarenn-unknown-eoghainn-0-1",
    "muiredach-founder-eoghainn",
    "luibheas-founder-eoghainn",
    "heilbhic-founder-eilitard",
    "quiseog-founder-duff",
    "loinneog-founder-eoghainn",
    "kadhghan-founder-eoghainn",
    "padraig-founder-agnew",
    "garmania-founder-duach",
    "ronan-founder-eoghainn",
    "vardan-founder-eoghainn",
    "muiridhe-founder-fiachraoin",
    "zaorbha-founder-elid",
    "raghallach-eoghainn",
    "nechtan-1584-eoghainn",
    "lughna-eoghainn",
    "muiredach-1590-eoghainn",
    "peathgho-1592-eoghainn",
    "dervla-rochraide",
    "baoigheall-1580-agnew",
    "mairtin-1582-tordarroch",
    "rhianu-1590-illysywen",
    "zachrach-1590-elid",
    "kadhghan-1603-eoghainn",
    "treabha-1608-eoghainn",
    "pailtear-1610-eoghainn",
    "gobaith-1610-eoghainn",
    "harailt-1612-eoghainn",
    "wunbhna-1603-duff",
    "muircheartach-1604-casur",
    "nithin-1611-dobhar",
    "koarnach-1610-culloch",
    "mairghread-1613-ness",
    "giollan-1628-eoghainn",
    "iarnait-eoghainn",
    "cailte-1635-eoghainn",
    "aoghan-1634-eoghainn",
    "tadhaigh-1636-eoghainn",
    "peatharlach-1631-fiorghra",
    "caedmon-morlais",
    "siofra-1637-salaig",
    "valaigh-1636-elid",
    "amhlaoibh-1630-dianaomh",
    "briathach-1649-eoghainn",
    "eanbharr-1653-eoghainn",
    "jarnan-1656-eoghainn",
    "meabhrog-1664-eoghainn",
    "jenadhe-1655-eoghainn",
    "breasal-1656-eoghainn",
    "wihalgh-1653-oglivy",
    "hairbhinn-1647-agnew",
    "meabhrog-1654-diuid",
    "lughaidh-1655-stwatchn",
    "seallach-1658-wemyss",
    "kealagh-1671-eoghainn",
    "fionnchu-1674-eoghainn",
    "lochan-1678-eoghainn",
    "oighreag-1680-eoghainn",
    "maithnu-1676-eoghainn",
    "vearga-1679-eoghainn",
    "haodh-1681-eoghainn",
    "aodhan-1667-urquhart",
    "nalainn-1678-forsyth",
    "iarbhine-1680-cadaigh",
    "diarmait-1676-buadhtreun",
    "latharna-1677-ness",
    "malachy-1679-dubglais",
    "leagha-1681-dobhar",
    "kester-1695-eoghainn",
    "tuarenn-1698-eoghainn",
    "cailte-1702-eoghainn",
    "cinnia-1701-eoghainn",
    "leogan-1698-eoghainn",
    "unbenanntes-1702-eoghainn",
    "harailt-1707-eoghainn",
    "unbenanntes-1704-eoghainn",
    "breasal-1708-eoghainn",
    "aibhilin-1695-dianaomh",
    "greagoir-1694-elid",
    "ealar-1706-duff",
    "reamonn-1696-diuid",
    "sluagh-1702-lockart",
    "meara-1710-midgna",
    "heulyn-1711-duach",
    "giollan-1714-eoghainn",
    "fola-1721-eoghainn",
    "aoghan-1725-eoghainn",
    "ronan-1729-eoghainn",
    "hearn-1728-eoghainn",
    "neart-1733-eoghainn",
    "nechtan-1730-eoghainn",
    "sionna-1734-eoghainn"
  ],
  "partnershipIds": [
    "marriage-giollan-founder-abhrach--tuarenn-unknown-eoghainn-0-1",
    "marriage-heilbhic-founder-eilitard--muiredach-founder-eoghainn",
    "marriage-luibheas-founder-eoghainn--quiseog-founder-duff",
    "marriage-loinneog-founder-eoghainn--padraig-founder-agnew",
    "marriage-garmania-founder-duach--kadhghan-founder-eoghainn",
    "marriage-muiridhe-founder-fiachraoin--ronan-founder-eoghainn",
    "marriage-vardan-founder-eoghainn--zaorbha-founder-elid",
    "marriage-dervla-rochraide--raghallach-eoghainn",
    "marriage-baoigheall-1580-agnew--nechtan-1584-eoghainn",
    "marriage-lughna-eoghainn--mairtin-1582-tordarroch",
    "marriage-muiredach-1590-eoghainn--rhianu-1590-illysywen",
    "marriage-peathgho-1592-eoghainn--zachrach-1590-elid",
    "marriage-kadhghan-1603-eoghainn--wunbhna-1603-duff",
    "marriage-muircheartach-1604-casur--treabha-1608-eoghainn",
    "marriage-nithin-1611-dobhar--pailtear-1610-eoghainn",
    "marriage-gobaith-1610-eoghainn--koarnach-1610-culloch",
    "marriage-harailt-1612-eoghainn--mairghread-1613-ness",
    "marriage-giollan-1628-eoghainn--peatharlach-1631-fiorghra",
    "marriage-caedmon-morlais--iarnait-eoghainn",
    "marriage-cailte-1635-eoghainn--siofra-1637-salaig",
    "marriage-aoghan-1634-eoghainn--valaigh-1636-elid",
    "marriage-amhlaoibh-1630-dianaomh--tadhaigh-1636-eoghainn",
    "marriage-briathach-1649-eoghainn--wihalgh-1653-oglivy",
    "marriage-eanbharr-1653-eoghainn--hairbhinn-1647-agnew",
    "marriage-jarnan-1656-eoghainn--meabhrog-1654-diuid",
    "marriage-jenadhe-1655-eoghainn--lughaidh-1655-stwatchn",
    "marriage-breasal-1656-eoghainn--seallach-1658-wemyss",
    "marriage-aodhan-1667-urquhart--kealagh-1671-eoghainn",
    "marriage-fionnchu-1674-eoghainn--nalainn-1678-forsyth",
    "marriage-iarbhine-1680-cadaigh--lochan-1678-eoghainn",
    "marriage-diarmait-1676-buadhtreun--oighreag-1680-eoghainn",
    "marriage-latharna-1677-ness--maithnu-1676-eoghainn",
    "marriage-malachy-1679-dubglais--vearga-1679-eoghainn",
    "marriage-haodh-1681-eoghainn--leagha-1681-dobhar",
    "marriage-aibhilin-1695-dianaomh--kester-1695-eoghainn",
    "marriage-greagoir-1694-elid--tuarenn-1698-eoghainn",
    "forced-cailte-1702-eoghainn--ealar-1706-duff",
    "marriage-cinnia-1701-eoghainn--reamonn-1696-diuid",
    "marriage-leogan-1698-eoghainn--sluagh-1702-lockart",
    "marriage-harailt-1707-eoghainn--meara-1710-midgna",
    "marriage-breasal-1708-eoghainn--heulyn-1711-duach"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-giollan-founder-abhrach--tuarenn-unknown-eoghainn-0-1",
      "childIds": [
        "muiredach-founder-eoghainn",
        "luibheas-founder-eoghainn"
      ],
      "timeJumpId": "gap-damh-eoghainn-founders"
    },
    {
      "partnershipId": "marriage-heilbhic-founder-eilitard--muiredach-founder-eoghainn",
      "childIds": [
        "loinneog-founder-eoghainn",
        "kadhghan-founder-eoghainn"
      ],
      "timeJumpId": "gap-damh-eoghainn-muiredach"
    },
    {
      "partnershipId": "marriage-garmania-founder-duach--kadhghan-founder-eoghainn",
      "childIds": [
        "ronan-founder-eoghainn",
        "vardan-founder-eoghainn"
      ],
      "timeJumpId": "gap-damh-eoghainn-kadhghan"
    },
    {
      "partnershipId": "marriage-muiridhe-founder-fiachraoin--ronan-founder-eoghainn",
      "childIds": [
        "raghallach-eoghainn",
        "nechtan-1584-eoghainn",
        "lughna-eoghainn",
        "muiredach-1590-eoghainn",
        "peathgho-1592-eoghainn"
      ],
      "timeJumpId": "gap-damh-eoghainn-ronan"
    },
    {
      "partnershipId": "marriage-dervla-rochraide--raghallach-eoghainn",
      "childIds": [
        "kadhghan-1603-eoghainn",
        "treabha-1608-eoghainn",
        "pailtear-1610-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-muiredach-1590-eoghainn--rhianu-1590-illysywen",
      "childIds": [
        "gobaith-1610-eoghainn",
        "harailt-1612-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-kadhghan-1603-eoghainn--wunbhna-1603-duff",
      "childIds": [
        "giollan-1628-eoghainn",
        "iarnait-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-nithin-1611-dobhar--pailtear-1610-eoghainn",
      "childIds": [
        "cailte-1635-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-harailt-1612-eoghainn--mairghread-1613-ness",
      "childIds": [
        "aoghan-1634-eoghainn",
        "tadhaigh-1636-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-giollan-1628-eoghainn--peatharlach-1631-fiorghra",
      "childIds": [
        "briathach-1649-eoghainn",
        "eanbharr-1653-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-cailte-1635-eoghainn--siofra-1637-salaig",
      "childIds": [
        "jarnan-1656-eoghainn",
        "meabhrog-1664-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-aoghan-1634-eoghainn--valaigh-1636-elid",
      "childIds": [
        "jenadhe-1655-eoghainn",
        "breasal-1656-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-briathach-1649-eoghainn--wihalgh-1653-oglivy",
      "childIds": [
        "kealagh-1671-eoghainn",
        "fionnchu-1674-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-jarnan-1656-eoghainn--meabhrog-1654-diuid",
      "childIds": [
        "lochan-1678-eoghainn",
        "oighreag-1680-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-breasal-1656-eoghainn--seallach-1658-wemyss",
      "childIds": [
        "maithnu-1676-eoghainn",
        "vearga-1679-eoghainn",
        "haodh-1681-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-fionnchu-1674-eoghainn--nalainn-1678-forsyth",
      "childIds": [
        "kester-1695-eoghainn",
        "tuarenn-1698-eoghainn",
        "cailte-1702-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-iarbhine-1680-cadaigh--lochan-1678-eoghainn",
      "childIds": [
        "cinnia-1701-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-latharna-1677-ness--maithnu-1676-eoghainn",
      "childIds": [
        "leogan-1698-eoghainn",
        "unbenanntes-1702-eoghainn",
        "harailt-1707-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-haodh-1681-eoghainn--leagha-1681-dobhar",
      "childIds": [
        "unbenanntes-1704-eoghainn",
        "breasal-1708-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-aibhilin-1695-dianaomh--kester-1695-eoghainn",
      "childIds": [
        "giollan-1714-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-leogan-1698-eoghainn--sluagh-1702-lockart",
      "childIds": [
        "fola-1721-eoghainn",
        "aoghan-1725-eoghainn",
        "ronan-1729-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-harailt-1707-eoghainn--meara-1710-midgna",
      "childIds": [
        "hearn-1728-eoghainn",
        "neart-1733-eoghainn"
      ]
    },
    {
      "partnershipId": "marriage-breasal-1708-eoghainn--heulyn-1711-duach",
      "childIds": [
        "nechtan-1730-eoghainn",
        "sionna-1734-eoghainn"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-luibheas-founder-eoghainn--quiseog-founder-duff",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-baoigheall-1580-agnew--nechtan-1584-eoghainn",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-lughna-eoghainn--mairtin-1582-tordarroch",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-peathgho-1592-eoghainn--zachrach-1590-elid",
      "targetFamilyId": "haus-elid",
      "houseId": "house-elid"
    },
    {
      "partnershipId": "marriage-muircheartach-1604-casur--treabha-1608-eoghainn",
      "targetFamilyId": "haus-casur",
      "houseId": "house-casur"
    },
    {
      "partnershipId": "marriage-gobaith-1610-eoghainn--koarnach-1610-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-caedmon-morlais--iarnait-eoghainn",
      "targetFamilyId": "haus-morlais",
      "houseId": "house-morlais"
    },
    {
      "partnershipId": "marriage-amhlaoibh-1630-dianaomh--tadhaigh-1636-eoghainn",
      "targetFamilyId": "haus-dianaomh",
      "houseId": "house-dianaomh"
    },
    {
      "partnershipId": "marriage-eanbharr-1653-eoghainn--hairbhinn-1647-agnew",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-jenadhe-1655-eoghainn--lughaidh-1655-stwatchn",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-aodhan-1667-urquhart--kealagh-1671-eoghainn",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-diarmait-1676-buadhtreun--oighreag-1680-eoghainn",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-malachy-1679-dubglais--vearga-1679-eoghainn",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-greagoir-1694-elid--tuarenn-1698-eoghainn",
      "targetFamilyId": "haus-elid",
      "houseId": "house-elid"
    },
    {
      "partnershipId": "marriage-cinnia-1701-eoghainn--reamonn-1696-diuid",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-loinneog-founder-eoghainn--padraig-founder-agnew",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-vardan-founder-eoghainn--zaorbha-founder-elid",
      "targetFamilyId": "haus-elid",
      "houseId": "house-elid"
    }
  ],
  "wards": [
    {
      "personId": "ronan-1729-eoghainn",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "sionna-1734-eoghainn",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "ealar-1706-duff": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Vier serielle Überlieferungslücken. Agnew und Elid gehen in den Grafiken aus Eoghainn-Verbindungen hervor; dies ändert keine territoriale Lehensordnung. Cailte–Ealar ist laut Nutzer erzwungen. Zwei unbenannte Kinder und zwei fortgegebene Mündel bleiben erkennbar.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Tir An Ó Eoghainn von Càrn Bruach ist das historische Mor-Tiarna-Haus von Tir na Damh, dem Land der Haine. Seine Überlieferung beginnt mit Giollán Abhrach und Tuarenn; mehrere nicht einzeln überlieferte Generationen verbinden die frühen Stammeltern mit den späteren Zweigen. Die Gründerpaare der Agnew und Elid gehören ebenfalls zu dieser Genealogie. Zahlreiche Ehen verbinden Eoghainn mit den Häusern Faelaorns und darüber hinaus. Trotz Krieg und Teilbesetzung durch Skjaerheim bleibt die alte Herrschaft Grundlage des Registers; das bereits belegte Asyl in Tir na Rann wird zusätzlich geführt.",
  "warriorReference": ""
});

export const HOUSE_EOGHAINN_FAMILY = createDamhSourceFamily("eoghainn", SOURCE);
