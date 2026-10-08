import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "raghallach-founder-diuid",
    "rogaire-founder-mhathain",
    "kessog-founder-diuid",
    "rioghbhar-founder-diuid",
    "ruairc-founder-diuid",
    "donal-founder-follmhar",
    "banbhin-founder-eilitard",
    "morag-unknown-diuid-103-2",
    "cormac-founder-diuid",
    "oideach-diuid",
    "beileag-founder-ardmhair",
    "cadfael-ancient-arth",
    "diarmaid-founder-diuid",
    "torcall-founder-diuid",
    "odhbha-founder-mata",
    "rhona-unknown-diuid-127-1",
    "reamonn-founder-diuid",
    "hadhbh-diuid",
    "aoife-founder-culloch",
    "tarrant-ancient-arth",
    "raghallach-1579-diuid",
    "scathach-1584-diuid",
    "sioran-1588-diuid",
    "allanah-1583-urquhart",
    "gadhra-1581-stwatchn",
    "beileag-1590-ness",
    "breccan-1600-diuid",
    "oona-1605-diuid",
    "cormac-1610-diuid",
    "macha-1602-lockart",
    "rioghnan-1603-haig",
    "deirdre-1614-dubglais",
    "reamonn-1620-diuid",
    "orla-1624-diuid",
    "diarmaid-1633-diuid",
    "ailbhe-1636-diuid",
    "quaira-1620-ardmhair",
    "ultach-1624-forsyth",
    "iolanda-1634-durachd",
    "eogair-1628-connchobhair",
    "finnbar-diud",
    "sadhbh-1646-diuid",
    "dubhan-1650-diuid",
    "meabhrog-1654-diuid",
    "jodhran-1657-diuid",
    "ragnfrid-frostauge",
    "cathmor-1650-dubglais",
    "morrigan-1651-banlaoch",
    "jarnan-1656-eoghainn",
    "loinneog-1657-fiorghra",
    "cormac-1663-diuid",
    "donndubhan-1666-diuid",
    "conall-1670-diuid",
    "rabhan-1674-diuid",
    "tamsin-diud",
    "garvan-1676-diuid",
    "maeve-1679-diuid",
    "sharni-1667-nuadat",
    "maire-1676-haig",
    "neidion-unigol",
    "vadria-1680-carnegie",
    "teagan-unknown-diuid-197-1",
    "lorgain-1677-ness",
    "domhnall-1688-diuid",
    "rogaire-1695-diuid",
    "colman-1700-diuid",
    "ruadhan-1706-diuid",
    "torcall-1710-diuid",
    "reamonn-1696-diuid",
    "sadbh-1698-diuid",
    "ruairc-1704-diuid",
    "ronan-1699-diuid",
    "ruairne-1705-diuid",
    "drustan-1724-diuid",
    "mairi-1695-urquhart",
    "eochaid-1690-lockart",
    "peagan-founder-ardmhair",
    "cinnia-1701-eoghainn",
    "uilliam-1695-fiorghra",
    "grainne-1700-culloch",
    "fergus-1716-diuid",
    "cormac-1720-diuid",
    "tamsin-1720-diuid",
    "artan-1724-rowak",
    "alpin-1722-diuid",
    "tara-1726-diuid",
    "keir-1729-diuid",
    "raghallach-1721-diuid",
    "orla-1725-diuid"
  ],
  "partnershipIds": [
    "marriage-raghallach-founder-diuid--rogaire-founder-mhathain",
    "marriage-donal-founder-follmhar--kessog-founder-diuid",
    "marriage-banbhin-founder-eilitard--rioghbhar-founder-diuid",
    "marriage-morag-unknown-diuid-103-2--ruairc-founder-diuid",
    "marriage-beileag-founder-ardmhair--cormac-founder-diuid",
    "marriage-cadfael-oideach",
    "marriage-diarmaid-founder-diuid--odhbha-founder-mata",
    "marriage-rhona-unknown-diuid-127-1--torcall-founder-diuid",
    "marriage-aoife-founder-culloch--reamonn-founder-diuid",
    "marriage-tarrant-hadhbh",
    "marriage-allanah-1583-urquhart--raghallach-1579-diuid",
    "marriage-gadhra-1581-stwatchn--scathach-1584-diuid",
    "marriage-beileag-1590-ness--sioran-1588-diuid",
    "marriage-breccan-1600-diuid--macha-1602-lockart",
    "marriage-oona-1605-diuid--rioghnan-1603-haig",
    "marriage-cormac-1610-diuid--deirdre-1614-dubglais",
    "marriage-quaira-1620-ardmhair--reamonn-1620-diuid",
    "marriage-orla-1624-diuid--ultach-1624-forsyth",
    "marriage-diarmaid-1633-diuid--iolanda-1634-durachd",
    "marriage-ailbhe-1636-diuid--eogair-1628-connchobhair",
    "marriage-finnbar-ragnfrid-frostauge",
    "marriage-cathmor-1650-dubglais--sadhbh-1646-diuid",
    "marriage-dubhan-1650-diuid--morrigan-1651-banlaoch",
    "marriage-jarnan-1656-eoghainn--meabhrog-1654-diuid",
    "marriage-jodhran-1657-diuid--loinneog-1657-fiorghra",
    "marriage-donndubhan-1666-diuid--sharni-1667-nuadat",
    "marriage-conall-1670-diuid--maire-1676-haig",
    "marriage-neidion-tamsin-unigol",
    "marriage-garvan-1676-diuid--vadria-1680-carnegie",
    "affair-garvan-1676-diuid--teagan-unknown-diuid-197-1",
    "marriage-lorgain-1677-ness--maeve-1679-diuid",
    "marriage-domhnall-1688-diuid--mairi-1695-urquhart",
    "marriage-eochaid-1690-lockart--rogaire-1695-diuid",
    "engagement-peagan-founder-ardmhair--torcall-1710-diuid",
    "marriage-cinnia-1701-eoghainn--reamonn-1696-diuid",
    "marriage-sadbh-1698-diuid--uilliam-1695-fiorghra",
    "marriage-grainne-1700-culloch--ruairc-1704-diuid"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-raghallach-founder-diuid--rogaire-founder-mhathain",
      "childIds": [
        "kessog-founder-diuid",
        "rioghbhar-founder-diuid",
        "ruairc-founder-diuid"
      ],
      "timeJumpId": "gap-mathgham-diuid-founders"
    },
    {
      "partnershipId": "marriage-donal-founder-follmhar--kessog-founder-diuid",
      "childIds": [
        "cormac-founder-diuid",
        "oideach-diuid"
      ],
      "timeJumpId": "gap-mathgham-diuid-kessog"
    },
    {
      "partnershipId": "marriage-beileag-founder-ardmhair--cormac-founder-diuid",
      "childIds": [
        "diarmaid-founder-diuid",
        "torcall-founder-diuid"
      ],
      "timeJumpId": "gap-mathgham-diuid-cormac"
    },
    {
      "partnershipId": "marriage-diarmaid-founder-diuid--odhbha-founder-mata",
      "childIds": [
        "reamonn-founder-diuid",
        "hadhbh-diuid"
      ]
    },
    {
      "partnershipId": "marriage-aoife-founder-culloch--reamonn-founder-diuid",
      "childIds": [
        "raghallach-1579-diuid",
        "scathach-1584-diuid",
        "sioran-1588-diuid"
      ],
      "timeJumpId": "gap-mathgham-diuid-reamonn"
    },
    {
      "partnershipId": "marriage-allanah-1583-urquhart--raghallach-1579-diuid",
      "childIds": [
        "breccan-1600-diuid",
        "oona-1605-diuid"
      ]
    },
    {
      "partnershipId": "marriage-beileag-1590-ness--sioran-1588-diuid",
      "childIds": [
        "cormac-1610-diuid"
      ]
    },
    {
      "partnershipId": "marriage-breccan-1600-diuid--macha-1602-lockart",
      "childIds": [
        "reamonn-1620-diuid",
        "orla-1624-diuid"
      ]
    },
    {
      "partnershipId": "marriage-cormac-1610-diuid--deirdre-1614-dubglais",
      "childIds": [
        "diarmaid-1633-diuid",
        "ailbhe-1636-diuid"
      ]
    },
    {
      "partnershipId": "marriage-quaira-1620-ardmhair--reamonn-1620-diuid",
      "childIds": [
        "finnbar-diud",
        "sadhbh-1646-diuid",
        "dubhan-1650-diuid"
      ]
    },
    {
      "partnershipId": "marriage-diarmaid-1633-diuid--iolanda-1634-durachd",
      "childIds": [
        "meabhrog-1654-diuid",
        "jodhran-1657-diuid"
      ]
    },
    {
      "partnershipId": "marriage-finnbar-ragnfrid-frostauge",
      "childIds": [
        "cormac-1663-diuid",
        "donndubhan-1666-diuid",
        "conall-1670-diuid",
        "rabhan-1674-diuid",
        "tamsin-diud"
      ]
    },
    {
      "partnershipId": "marriage-jodhran-1657-diuid--loinneog-1657-fiorghra",
      "childIds": [
        "garvan-1676-diuid",
        "maeve-1679-diuid"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-1666-diuid--sharni-1667-nuadat",
      "childIds": [
        "domhnall-1688-diuid",
        "rogaire-1695-diuid",
        "colman-1700-diuid",
        "ruadhan-1706-diuid",
        "torcall-1710-diuid"
      ]
    },
    {
      "partnershipId": "marriage-conall-1670-diuid--maire-1676-haig",
      "childIds": [
        "reamonn-1696-diuid",
        "sadbh-1698-diuid",
        "ruairc-1704-diuid"
      ]
    },
    {
      "partnershipId": "marriage-garvan-1676-diuid--vadria-1680-carnegie",
      "childIds": [
        "ronan-1699-diuid",
        "ruairne-1705-diuid"
      ]
    },
    {
      "partnershipId": "affair-garvan-1676-diuid--teagan-unknown-diuid-197-1",
      "childIds": [
        "drustan-1724-diuid"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-domhnall-1688-diuid--mairi-1695-urquhart",
      "childIds": [
        "fergus-1716-diuid",
        "cormac-1720-diuid",
        "tamsin-1720-diuid"
      ]
    },
    {
      "partnershipId": "marriage-cinnia-1701-eoghainn--reamonn-1696-diuid",
      "childIds": [
        "alpin-1722-diuid",
        "tara-1726-diuid",
        "keir-1729-diuid"
      ]
    },
    {
      "partnershipId": "marriage-grainne-1700-culloch--ruairc-1704-diuid",
      "childIds": [
        "raghallach-1721-diuid",
        "orla-1725-diuid"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-banbhin-founder-eilitard--rioghbhar-founder-diuid",
      "targetFamilyId": "haus-eilitard",
      "houseId": "house-eilitard"
    },
    {
      "partnershipId": "marriage-cadfael-oideach",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-tarrant-hadhbh",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-gadhra-1581-stwatchn--scathach-1584-diuid",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-oona-1605-diuid--rioghnan-1603-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-orla-1624-diuid--ultach-1624-forsyth",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-ailbhe-1636-diuid--eogair-1628-connchobhair",
      "targetFamilyId": "haus-connchobhair",
      "houseId": "house-connchobhair"
    },
    {
      "partnershipId": "marriage-cathmor-1650-dubglais--sadhbh-1646-diuid",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-dubhan-1650-diuid--morrigan-1651-banlaoch",
      "targetFamilyId": "haus-banlaoch",
      "houseId": "house-banlaoch"
    },
    {
      "partnershipId": "marriage-jarnan-1656-eoghainn--meabhrog-1654-diuid",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-neidion-tamsin-unigol",
      "targetFamilyId": "haus-unigol",
      "houseId": "house-unigol"
    },
    {
      "partnershipId": "marriage-lorgain-1677-ness--maeve-1679-diuid",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-eochaid-1690-lockart--rogaire-1695-diuid",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-sadbh-1698-diuid--uilliam-1695-fiorghra",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-morag-unknown-diuid-103-2--ruairc-founder-diuid",
      "targetFamilyId": "haus-lockart"
    },
    {
      "partnershipId": "marriage-rhona-unknown-diuid-127-1--torcall-founder-diuid",
      "targetFamilyId": "haus-haig"
    }
  ],
  "wards": [],
  "foster": [
    {
      "childId": "artan-1724-rowak",
      "parentId": "domhnall-1688-diuid"
    }
  ],
  "heads": [
    "raghallach-founder-diuid",
    "rioghbhar-founder-diuid",
    "cormac-founder-diuid",
    "diarmaid-founder-diuid",
    "reamonn-founder-diuid",
    "raghallach-1579-diuid",
    "breccan-1600-diuid",
    "reamonn-1620-diuid",
    "finnbar-diud",
    "donndubhan-1666-diuid"
  ],
  "titles": {
    "raghallach-founder-diuid": "Historisches Oberhaupt",
    "rioghbhar-founder-diuid": "Historisches Oberhaupt",
    "cormac-founder-diuid": "Historisches Oberhaupt",
    "diarmaid-founder-diuid": "Historisches Oberhaupt",
    "reamonn-founder-diuid": "Historisches Oberhaupt",
    "raghallach-1579-diuid": "Historisches Oberhaupt",
    "breccan-1600-diuid": "Historisches Oberhaupt",
    "reamonn-1620-diuid": "Historisches Oberhaupt",
    "finnbar-diud": "Historisches Oberhaupt",
    "donndubhan-1666-diuid": "Mor-Tiarna · Oberhaupt seit 1731",
    "domhnall-1688-diuid": "Erbfolge: 1",
    "fergus-1716-diuid": "Erbfolge: 2",
    "cormac-1720-diuid": "Erbfolge: 3"
  },
  "personRoles": {
    "drustan-1724-diuid": "bastard",
    "teagan-unknown-diuid-197-1": "affair",
    "artan-1724-rowak": "ward"
  },
  "personExtensions": {
    "garvan-1676-diuid": {
      "chartCenterBetweenPartnerPersonIds": [
        "vadria-1680-carnegie",
        "teagan-unknown-diuid-197-1"
      ],
      "chartPartnerGroupPersonOrder": [
        "vadria-1680-carnegie",
        "garvan-1676-diuid",
        "teagan-unknown-diuid-197-1"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Vier serielle Überlieferungslücken. Lockart und Haig sind direkte Kadettenhäuser. Garvans Affäre mit Teagan bleibt von seiner Ehe und deren Kindern getrennt. Artán Rowak ist Domhnalls Mündel. Amtszeiten werden nicht als Lebensdaten verwendet.",
  "currentHeadId": "donndubhan-1666-diuid",
  "heirIds": [
    "domhnall-1688-diuid",
    "fergus-1716-diuid",
    "cormac-1720-diuid"
  ],
  "description": "Mac Ard Diuid führt von Balgavrie aus das Land der Bären, Tir na Mathgham. Der Clan geht auf Raghallach Diuid und Rogaire Mhathain zurück und versteht sich als Vermittler und Beschützer der verbündeten Häuser. Seine Krieger verbinden Schildformationen mit koordinierter Führung; Clanversammlungen sichern Versorgung und gemeinsame Verteidigung. Donndubhán führt das Haus seit 1731. Das Motto lautet: Ein Land, ein Banner. Die Registerordnung bewahrt die alten Herrschaften Faelaorns während des Krieges mit Skjaerheim und der Teilbesetzung.",
  "partnershipExtensions": {
    "marriage-garvan-1676-diuid--vadria-1680-carnegie": {
      "chartAlignPartnerOverChildrenPersonId": "vadria-1680-carnegie",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-garvan-1676-diuid--teagan-unknown-diuid-197-1": {
      "chartAlignPartnerOverChildrenPersonId": "teagan-unknown-diuid-197-1",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-jodhran-1657-diuid--loinneog-1657-fiorghra": {
      "chartAlignParentPairOverChildPersonId": "garvan-1676-diuid",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_DIUID_FAMILY = createMathghamSourceFamily("diuid", SOURCE);
