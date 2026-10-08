import { createBraighSourceFamily } from './braigh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "muir-founder-culloch",
    "walla-founder-dhomhain",
    "darragh-founder-culloch",
    "aoife-founder-culloch",
    "muirgen-founder-culloch",
    "ideog-founder-roich",
    "reamonn-founder-diuid",
    "jemand-unknown-culloch-110-2",
    "callum-1580-culloch",
    "morven-1583-culloch",
    "quilla-1586-culloch",
    "eoghan-1590-culloch",
    "eilidh-1584-borthwick",
    "naomhan-1581-erskine",
    "jemand-unknown-culloch-122-2",
    "muireann-1592-boyd",
    "muir-1602-culloch",
    "walla-culloch",
    "caomhog-culloch",
    "koarnach-1610-culloch",
    "aibhreann-1604-buadhtreun",
    "fenrir-wellenschild",
    "gallgoid-morlais",
    "gobaith-1610-eoghainn",
    "macraith-1622-culloch",
    "muirgen-1625-culloch",
    "ailsa-1627-culloch",
    "taran-1628-culloch",
    "glaisne-1628-culloch",
    "treabhnan-1630-culloch",
    "iarnach-1626-forsyth",
    "hascan-1622-farraigeach",
    "jarlath-1627-grannd",
    "caireann-1630-erskine",
    "jemand-unknown-culloch-150-0",
    "kenna-1632-dubglais",
    "vionnan-culloch",
    "iarbhine-1648-culloch",
    "hurracan-1649-culloch",
    "haileigh-1654-culloch",
    "jathghal-1651-culloch",
    "morag-culloch",
    "rangrid-blutstahl",
    "goirtin-1646-borthwick",
    "maille-1650-bhaird",
    "donal-1652-roich",
    "seallach-1655-casur",
    "merfyn-gwaedlyd",
    "callum-1664-culloch",
    "tuiren-1668-culloch",
    "murdoch-1672-culloch",
    "beathag-1674-culloch",
    "darragh-culloch",
    "tiernan-1674-culloch",
    "loinneog-1675-culloch",
    "siobhan-1670-lasgair",
    "taranach-1665-dubglais",
    "muirgel-1676-urquhart",
    "jemand-unknown-culloch-182-3",
    "crystin-illygoden",
    "neala-1676-grannd",
    "macmhar-1672-tartarfhuil",
    "muir-1690-culloch",
    "kenna-1695-culloch",
    "breccan-1697-culloch",
    "neasa-1709-culloch",
    "taran-1695-culloch",
    "grainne-1700-culloch",
    "macraith-1705-culloch",
    "wrayne-1694-culloch",
    "catania-1695-buadhtreun",
    "laisren-1693-erskine",
    "dervla-1700-borthwick",
    "wiarnan-1705-morna",
    "jiarla-1699-lasgair",
    "ruairc-1704-diuid",
    "uallach-1698-suilgeach",
    "ragnhild-unknown-culloch-204-3",
    "muirgen-1718-culloch",
    "muiris-1722-culloch",
    "ronnat-1723-lockart",
    "nairn-1722-culloch",
    "quilla-1726-culloch",
    "keir-1720-culloch",
    "barra-1722-culloch",
    "gobaith-1722-haig",
    "yvor-1720-culloch",
    "jara-1725-culloch",
    "hilda-1730-culloch",
    "pol-1735-culloch",
    "yluach-1722-farraigeach"
  ],
  "partnershipIds": [
    "marriage-muir-founder-culloch--walla-founder-dhomhain",
    "marriage-darragh-founder-culloch--ideog-founder-roich",
    "marriage-aoife-founder-culloch--reamonn-founder-diuid",
    "marriage-jemand-unknown-culloch-110-2--muirgen-founder-culloch",
    "marriage-callum-1580-culloch--eilidh-1584-borthwick",
    "marriage-morven-1583-culloch--naomhan-1581-erskine",
    "marriage-jemand-unknown-culloch-122-2--quilla-1586-culloch",
    "marriage-eoghan-1590-culloch--muireann-1592-boyd",
    "marriage-aibhreann-1604-buadhtreun--muir-1602-culloch",
    "marriage-fenrir-walla-wellenschild",
    "marriage-caomhog-culloch--gallgoid-morlais",
    "marriage-gobaith-1610-eoghainn--koarnach-1610-culloch",
    "marriage-iarnach-1626-forsyth--macraith-1622-culloch",
    "marriage-hascan-1622-farraigeach--muirgen-1625-culloch",
    "marriage-ailsa-1627-culloch--jarlath-1627-grannd",
    "marriage-caireann-1630-erskine--taran-1628-culloch",
    "marriage-glaisne-1628-culloch--jemand-unknown-culloch-150-0",
    "marriage-kenna-1632-dubglais--treabhnan-1630-culloch",
    "marriage-rangrid-vionnan-blutstahl",
    "marriage-goirtin-1646-borthwick--iarbhine-1648-culloch",
    "marriage-hurracan-1649-culloch--maille-1650-bhaird",
    "marriage-donal-1652-roich--haileigh-1654-culloch",
    "marriage-jathghal-1651-culloch--seallach-1655-casur",
    "marriage-merfyn-morag-gwaedlyd",
    "marriage-callum-1664-culloch--siobhan-1670-lasgair",
    "marriage-taranach-1665-dubglais--tuiren-1668-culloch",
    "marriage-muirgel-1676-urquhart--murdoch-1672-culloch",
    "marriage-beathag-1674-culloch--jemand-unknown-culloch-182-3",
    "marriage-crystin-darragh-illygoden",
    "marriage-neala-1676-grannd--tiernan-1674-culloch",
    "marriage-loinneog-1675-culloch--macmhar-1672-tartarfhuil",
    "marriage-catania-1695-buadhtreun--muir-1690-culloch",
    "marriage-kenna-1695-culloch--laisren-1693-erskine",
    "marriage-breccan-1697-culloch--dervla-1700-borthwick",
    "marriage-neasa-1709-culloch--wiarnan-1705-morna",
    "marriage-jiarla-1699-lasgair--taran-1695-culloch",
    "marriage-grainne-1700-culloch--ruairc-1704-diuid",
    "marriage-uallach-1698-suilgeach--wrayne-1694-culloch",
    "affair-ragnhild-unknown-culloch-204-3--wrayne-1694-culloch",
    "engagement-nairn-1722-culloch--yluach-1722-farraigeach"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-muir-founder-culloch--walla-founder-dhomhain",
      "childIds": [
        "darragh-founder-culloch",
        "aoife-founder-culloch",
        "muirgen-founder-culloch"
      ],
      "timeJumpId": "gap-braigh-culloch-founders"
    },
    {
      "partnershipId": "marriage-darragh-founder-culloch--ideog-founder-roich",
      "childIds": [
        "callum-1580-culloch",
        "morven-1583-culloch",
        "quilla-1586-culloch",
        "eoghan-1590-culloch"
      ],
      "timeJumpId": "gap-braigh-culloch-darragh"
    },
    {
      "partnershipId": "marriage-callum-1580-culloch--eilidh-1584-borthwick",
      "childIds": [
        "muir-1602-culloch",
        "walla-culloch"
      ]
    },
    {
      "partnershipId": "marriage-eoghan-1590-culloch--muireann-1592-boyd",
      "childIds": [
        "caomhog-culloch",
        "koarnach-1610-culloch"
      ]
    },
    {
      "partnershipId": "marriage-aibhreann-1604-buadhtreun--muir-1602-culloch",
      "childIds": [
        "macraith-1622-culloch",
        "muirgen-1625-culloch",
        "ailsa-1627-culloch",
        "taran-1628-culloch"
      ]
    },
    {
      "partnershipId": "marriage-gobaith-1610-eoghainn--koarnach-1610-culloch",
      "childIds": [
        "glaisne-1628-culloch",
        "treabhnan-1630-culloch"
      ]
    },
    {
      "partnershipId": "marriage-iarnach-1626-forsyth--macraith-1622-culloch",
      "childIds": [
        "vionnan-culloch",
        "iarbhine-1648-culloch"
      ]
    },
    {
      "partnershipId": "marriage-caireann-1630-erskine--taran-1628-culloch",
      "childIds": [
        "hurracan-1649-culloch",
        "haileigh-1654-culloch"
      ]
    },
    {
      "partnershipId": "marriage-kenna-1632-dubglais--treabhnan-1630-culloch",
      "childIds": [
        "jathghal-1651-culloch",
        "morag-culloch"
      ]
    },
    {
      "partnershipId": "marriage-rangrid-vionnan-blutstahl",
      "childIds": [
        "callum-1664-culloch",
        "tuiren-1668-culloch",
        "murdoch-1672-culloch",
        "beathag-1674-culloch"
      ]
    },
    {
      "partnershipId": "marriage-hurracan-1649-culloch--maille-1650-bhaird",
      "childIds": [
        "darragh-culloch"
      ]
    },
    {
      "partnershipId": "marriage-jathghal-1651-culloch--seallach-1655-casur",
      "childIds": [
        "tiernan-1674-culloch",
        "loinneog-1675-culloch"
      ]
    },
    {
      "partnershipId": "marriage-callum-1664-culloch--siobhan-1670-lasgair",
      "childIds": [
        "muir-1690-culloch",
        "kenna-1695-culloch"
      ]
    },
    {
      "partnershipId": "marriage-muirgel-1676-urquhart--murdoch-1672-culloch",
      "childIds": [
        "breccan-1697-culloch",
        "neasa-1709-culloch"
      ]
    },
    {
      "partnershipId": "marriage-crystin-darragh-illygoden",
      "childIds": [
        "taran-1695-culloch",
        "grainne-1700-culloch",
        "macraith-1705-culloch"
      ]
    },
    {
      "partnershipId": "marriage-neala-1676-grannd--tiernan-1674-culloch",
      "childIds": [
        "wrayne-1694-culloch"
      ]
    },
    {
      "partnershipId": "marriage-catania-1695-buadhtreun--muir-1690-culloch",
      "childIds": [
        "muirgen-1718-culloch",
        "muiris-1722-culloch"
      ]
    },
    {
      "partnershipId": "marriage-breccan-1697-culloch--dervla-1700-borthwick",
      "childIds": [
        "nairn-1722-culloch",
        "quilla-1726-culloch"
      ]
    },
    {
      "partnershipId": "marriage-jiarla-1699-lasgair--taran-1695-culloch",
      "childIds": [
        "keir-1720-culloch",
        "barra-1722-culloch"
      ]
    },
    {
      "partnershipId": "marriage-uallach-1698-suilgeach--wrayne-1694-culloch",
      "childIds": [
        "yvor-1720-culloch",
        "jara-1725-culloch"
      ]
    },
    {
      "partnershipId": "affair-ragnhild-unknown-culloch-204-3--wrayne-1694-culloch",
      "childIds": [
        "hilda-1730-culloch",
        "pol-1735-culloch"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aoife-founder-culloch--reamonn-founder-diuid",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-morven-1583-culloch--naomhan-1581-erskine",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-fenrir-walla-wellenschild",
      "targetFamilyId": "haus-wellenschild",
      "houseId": "house-wellenschild"
    },
    {
      "partnershipId": "marriage-caomhog-culloch--gallgoid-morlais",
      "targetFamilyId": "haus-morlais",
      "houseId": "house-morlais"
    },
    {
      "partnershipId": "marriage-hascan-1622-farraigeach--muirgen-1625-culloch",
      "targetFamilyId": "haus-farraigeach",
      "houseId": "house-farraigeach"
    },
    {
      "partnershipId": "marriage-ailsa-1627-culloch--jarlath-1627-grannd",
      "targetFamilyId": "haus-grannd",
      "houseId": "house-grannd"
    },
    {
      "partnershipId": "marriage-goirtin-1646-borthwick--iarbhine-1648-culloch",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-donal-1652-roich--haileigh-1654-culloch",
      "targetFamilyId": "haus-roich",
      "houseId": "house-roich"
    },
    {
      "partnershipId": "marriage-merfyn-morag-gwaedlyd",
      "targetFamilyId": "haus-gwaedlyd",
      "houseId": "house-gwaedlyd"
    },
    {
      "partnershipId": "marriage-taranach-1665-dubglais--tuiren-1668-culloch",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-loinneog-1675-culloch--macmhar-1672-tartarfhuil",
      "targetFamilyId": "haus-tartarfhuil",
      "houseId": "house-tartarfhuil"
    },
    {
      "partnershipId": "marriage-kenna-1695-culloch--laisren-1693-erskine",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-neasa-1709-culloch--wiarnan-1705-morna",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-grainne-1700-culloch--ruairc-1704-diuid",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-jemand-unknown-culloch-110-2--muirgen-founder-culloch",
      "targetFamilyId": "sept-dubhair",
      "houseId": "house-sept-dubhair"
    },
    {
      "partnershipId": "marriage-jemand-unknown-culloch-122-2--quilla-1586-culloch",
      "targetFamilyId": "sept-grein",
      "houseId": "house-sept-grein"
    },
    {
      "partnershipId": "marriage-glaisne-1628-culloch--jemand-unknown-culloch-150-0",
      "targetFamilyId": "sept-gaesa",
      "houseId": "house-sept-gaesa"
    },
    {
      "partnershipId": "marriage-beathag-1674-culloch--jemand-unknown-culloch-182-3",
      "targetFamilyId": "sept-malairt",
      "houseId": "house-sept-malairt"
    }
  ],
  "wards": [],
  "foster": [
    {
      "childId": "ronnat-1723-lockart",
      "parentId": "muir-1690-culloch"
    },
    {
      "childId": "gobaith-1722-haig",
      "parentId": "taran-1695-culloch"
    }
  ],
  "heads": [
    "muir-founder-culloch",
    "darragh-founder-culloch",
    "callum-1580-culloch",
    "muir-1602-culloch",
    "macraith-1622-culloch",
    "vionnan-culloch",
    "callum-1664-culloch"
  ],
  "titles": {
    "muir-founder-culloch": "Historisches Oberhaupt",
    "darragh-founder-culloch": "Historisches Oberhaupt",
    "callum-1580-culloch": "Historisches Oberhaupt",
    "muir-1602-culloch": "Historisches Oberhaupt",
    "macraith-1622-culloch": "Historisches Oberhaupt",
    "vionnan-culloch": "Historisches Oberhaupt",
    "callum-1664-culloch": "Mor-Tiarna · Oberhaupt seit 1712",
    "muir-1690-culloch": "Erbfolge: 1",
    "muirgen-1718-culloch": "Erbfolge: 2"
  },
  "personRoles": {
    "hilda-1730-culloch": "bastard",
    "pol-1735-culloch": "bastard",
    "ragnhild-unknown-culloch-204-3": "affair",
    "ronnat-1723-lockart": "ward",
    "gobaith-1722-haig": "ward"
  },
  "personExtensions": {
    "wrayne-1694-culloch": {
      "chartCenterBetweenPartnerPersonIds": [
        "uallach-1698-suilgeach",
        "ragnhild-unknown-culloch-204-3"
      ],
      "chartPartnerGroupPersonOrder": [
        "uallach-1698-suilgeach",
        "wrayne-1694-culloch",
        "ragnhild-unknown-culloch-204-3"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Zwei serielle Überlieferungslücken. Dubhair, Gréin, Gaesa und Malairt werden als belegte Sept-Gründungen verlinkt; ihre unbenannten Ehepersonen bleiben unbekannt. Rónnat Lockart und Gobaith Haig sind Mündel. Die frühere ausdrückliche Nutzerkorrektur gilt weiter: Gráinne ist mit Rúairc Diuid verbunden, nicht Ronan. Wraynes Affäre und Nairns Verlobung sind eigene Beziehungstypen.",
  "currentHeadId": "callum-1664-culloch",
  "heirIds": [
    "muir-1690-culloch",
    "muirgen-1718-culloch"
  ],
  "description": "Mac Culloch führt von Eldrimuir aus Tír na Braigh, das Land der Brandung. Der Clan geht auf den Seemann und Krieger Muir und Walla Dhomhain zurück. Sein Wappen zeigt einen Killerwal mit Kalb; Zusammenhalt, Seefahrt und die Verbindung seiner Septs prägen das Haus. Currach-Seekrieger und Cateran sichern Häfen, Inseln und die größte Flotte Faelaorns. Borthwick und Erskine dienen als Vasallen. Callum führt den Clan seit 1712; das älteste Kind erbt. Im Krieg mit Skjaerheim trugen die Flotten zur Verteidigung des Südens bei. Die Registergliederung folgt weiterhin den alten Herrschaften.",
  "partnershipExtensions": {
    "marriage-uallach-1698-suilgeach--wrayne-1694-culloch": {
      "chartAlignPartnerOverChildrenPersonId": "uallach-1698-suilgeach",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-ragnhild-unknown-culloch-204-3--wrayne-1694-culloch": {
      "chartAlignPartnerOverChildrenPersonId": "ragnhild-unknown-culloch-204-3",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-neala-1676-grannd--tiernan-1674-culloch": {
      "chartAlignParentPairOverChildPersonId": "wrayne-1694-culloch",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_CULLOCH_FAMILY = createBraighSourceFamily("culloch", SOURCE);
