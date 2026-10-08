import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "adaman-founder-ness",
    "mairead-unknown-ness-91-0",
    "malcolm-1586-ness",
    "beileag-1590-ness",
    "graham-1595-ness",
    "volla-1586-fiorghra",
    "sioran-1588-diuid",
    "goibhniu-1597-gealan",
    "michan-ness",
    "mairghread-1613-ness",
    "sinclair-1615-ness",
    "evaine-dienyddiwr",
    "harailt-1612-eoghainn",
    "blathnaid-1614-durachd",
    "adamnan-1629-ness",
    "lannraig-1632-ness",
    "murray-1635-ness",
    "conor-1633-ness",
    "mairead-1634-ness",
    "fainne-1630-luachra",
    "cathal-1632-urquhart",
    "caitria-1635-briccne",
    "leagha-1636-farraigeach",
    "gilleasbuig-1632-stwatchn",
    "turlough-ness",
    "latharna-1654-ness",
    "graham-1654-ness",
    "jiarla-1655-ness",
    "arianwen-draig",
    "colman-1651-haig",
    "muireann-1655-durachd",
    "giollan-1650-fiorghra",
    "adamnan-1672-ness",
    "lindsey-ness",
    "latharna-1677-ness",
    "lorgain-1677-ness",
    "etain-1676-lockart",
    "slavi-mochdaer",
    "maithnu-1676-eoghainn",
    "maeve-1679-diuid",
    "malcolm-1696-ness",
    "jilbhe-1709-ness",
    "fintan-1700-ness",
    "sinclair-1696-ness",
    "angus-1704-ness",
    "fenella-1700-fiorghra",
    "fingin-1705-fintain",
    "scathan-1705-buadhtreun",
    "quaira-1700-neill",
    "yvainne-unknown-ness-153-4",
    "graham-1719-ness",
    "clara-1723-ness",
    "murray-1726-ness",
    "uaithe-1729-ness",
    "torcall-1729-haig",
    "conor-1724-ness",
    "mairead-1728-ness",
    "sionna-1722-ness",
    "seamus-1726-ness",
    "sean-1738-ness"
  ],
  "partnershipIds": [
    "marriage-adaman-founder-ness--mairead-unknown-ness-91-0",
    "marriage-malcolm-1586-ness--volla-1586-fiorghra",
    "marriage-beileag-1590-ness--sioran-1588-diuid",
    "marriage-goibhniu-1597-gealan--graham-1595-ness",
    "marriage-evaine-michan-dienyddiwr",
    "marriage-harailt-1612-eoghainn--mairghread-1613-ness",
    "marriage-blathnaid-1614-durachd--sinclair-1615-ness",
    "marriage-adamnan-1629-ness--fainne-1630-luachra",
    "marriage-cathal-1632-urquhart--lannraig-1632-ness",
    "marriage-caitria-1635-briccne--murray-1635-ness",
    "marriage-conor-1633-ness--leagha-1636-farraigeach",
    "marriage-gilleasbuig-1632-stwatchn--mairead-1634-ness",
    "marriage-arianwen-turlough",
    "marriage-colman-1651-haig--latharna-1654-ness",
    "marriage-graham-1654-ness--muireann-1655-durachd",
    "marriage-giollan-1650-fiorghra--jiarla-1655-ness",
    "marriage-adamnan-1672-ness--etain-1676-lockart",
    "marriage-slavi-lindsey-mochdaer",
    "marriage-latharna-1677-ness--maithnu-1676-eoghainn",
    "marriage-lorgain-1677-ness--maeve-1679-diuid",
    "marriage-fenella-1700-fiorghra--malcolm-1696-ness",
    "marriage-fingin-1705-fintain--jilbhe-1709-ness",
    "marriage-fintan-1700-ness--scathan-1705-buadhtreun",
    "marriage-quaira-1700-neill--sinclair-1696-ness",
    "affair-sinclair-1696-ness--yvainne-unknown-ness-153-4"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-adaman-founder-ness--mairead-unknown-ness-91-0",
      "childIds": [
        "malcolm-1586-ness",
        "beileag-1590-ness",
        "graham-1595-ness"
      ],
      "timeJumpId": "gap-mathgham-ness-founders"
    },
    {
      "partnershipId": "marriage-malcolm-1586-ness--volla-1586-fiorghra",
      "childIds": [
        "michan-ness",
        "mairghread-1613-ness"
      ]
    },
    {
      "partnershipId": "marriage-goibhniu-1597-gealan--graham-1595-ness",
      "childIds": [
        "sinclair-1615-ness"
      ]
    },
    {
      "partnershipId": "marriage-evaine-michan-dienyddiwr",
      "childIds": [
        "adamnan-1629-ness",
        "lannraig-1632-ness",
        "murray-1635-ness"
      ]
    },
    {
      "partnershipId": "marriage-blathnaid-1614-durachd--sinclair-1615-ness",
      "childIds": [
        "conor-1633-ness",
        "mairead-1634-ness"
      ]
    },
    {
      "partnershipId": "marriage-adamnan-1629-ness--fainne-1630-luachra",
      "childIds": [
        "turlough-ness",
        "latharna-1654-ness"
      ]
    },
    {
      "partnershipId": "marriage-caitria-1635-briccne--murray-1635-ness",
      "childIds": [
        "graham-1654-ness"
      ]
    },
    {
      "partnershipId": "marriage-conor-1633-ness--leagha-1636-farraigeach",
      "childIds": [
        "jiarla-1655-ness"
      ]
    },
    {
      "partnershipId": "marriage-arianwen-turlough",
      "childIds": [
        "adamnan-1672-ness",
        "lindsey-ness"
      ]
    },
    {
      "partnershipId": "marriage-graham-1654-ness--muireann-1655-durachd",
      "childIds": [
        "latharna-1677-ness",
        "lorgain-1677-ness"
      ]
    },
    {
      "partnershipId": "marriage-adamnan-1672-ness--etain-1676-lockart",
      "childIds": [
        "malcolm-1696-ness",
        "jilbhe-1709-ness",
        "fintan-1700-ness"
      ]
    },
    {
      "partnershipId": "marriage-lorgain-1677-ness--maeve-1679-diuid",
      "childIds": [
        "sinclair-1696-ness",
        "angus-1704-ness"
      ]
    },
    {
      "partnershipId": "marriage-fenella-1700-fiorghra--malcolm-1696-ness",
      "childIds": [
        "graham-1719-ness",
        "clara-1723-ness",
        "murray-1726-ness",
        "uaithe-1729-ness"
      ]
    },
    {
      "partnershipId": "marriage-fintan-1700-ness--scathan-1705-buadhtreun",
      "childIds": [
        "conor-1724-ness",
        "mairead-1728-ness"
      ]
    },
    {
      "partnershipId": "marriage-quaira-1700-neill--sinclair-1696-ness",
      "childIds": [
        "sionna-1722-ness",
        "seamus-1726-ness"
      ]
    },
    {
      "partnershipId": "affair-sinclair-1696-ness--yvainne-unknown-ness-153-4",
      "childIds": [
        "sean-1738-ness"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-beileag-1590-ness--sioran-1588-diuid",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-harailt-1612-eoghainn--mairghread-1613-ness",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-cathal-1632-urquhart--lannraig-1632-ness",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-gilleasbuig-1632-stwatchn--mairead-1634-ness",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-colman-1651-haig--latharna-1654-ness",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-giollan-1650-fiorghra--jiarla-1655-ness",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-slavi-lindsey-mochdaer",
      "targetFamilyId": "haus-mochdaer-gwyliau",
      "houseId": "house-mochdaer-gwyliau"
    },
    {
      "partnershipId": "marriage-latharna-1677-ness--maithnu-1676-eoghainn",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-fingin-1705-fintain--jilbhe-1709-ness",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "torcall-1729-haig",
      "parentId": "malcolm-1696-ness"
    }
  ],
  "heads": [
    "adaman-founder-ness",
    "malcolm-1586-ness",
    "graham-1595-ness",
    "michan-ness",
    "sinclair-1615-ness",
    "adamnan-1629-ness",
    "turlough-ness",
    "graham-1654-ness",
    "malcolm-1696-ness"
  ],
  "titles": {
    "adaman-founder-ness": "Historisches Oberhaupt",
    "malcolm-1586-ness": "Historisches Oberhaupt",
    "graham-1595-ness": "Historisches Oberhaupt",
    "michan-ness": "Historisches Oberhaupt",
    "sinclair-1615-ness": "Historisches Oberhaupt",
    "adamnan-1629-ness": "Historisches Oberhaupt",
    "turlough-ness": "Historisches Oberhaupt",
    "graham-1654-ness": "Historisches Oberhaupt",
    "malcolm-1696-ness": "Dun-Tiarna · Oberhaupt seit 1731",
    "lorgain-1677-ness": "Erbfolge: 1",
    "sinclair-1696-ness": "Erbfolge: 2",
    "fintan-1700-ness": "Erbfolge: 3"
  },
  "personRoles": {
    "sean-1738-ness": "bastard",
    "yvainne-unknown-ness-153-4": "affair",
    "torcall-1729-haig": "ward"
  },
  "personExtensions": {
    "sinclair-1696-ness": {
      "chartCenterBetweenPartnerPersonIds": [
        "quaira-1700-neill",
        "yvainne-unknown-ness-153-4"
      ],
      "chartPartnerGroupPersonOrder": [
        "quaira-1700-neill",
        "sinclair-1696-ness",
        "yvainne-unknown-ness-153-4"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Eine serielle Überlieferungslücke. An Ness aus Faelaorn bleibt von Ard’Nessa in Blaithneach getrennt. Die kopierte Partnerüberschrift Scáthán statt Fintan wird durch die eindeutige Kinderüberschrift aufgelöst. Sinclair und Yvainne haben den unehelichen Sohn Sean. Torcall Haig ist Malcolms Mündel. Die Erbfolgezeile nennt den amtierenden Malcolm nochmals; die Hausbio zeigt nur die übrigen ausdrücklich aufgeführten Nachfolger. Die Amtsliste umfasst auch die Seitenlinien Graham und Sinclair.",
  "currentHeadId": "malcolm-1696-ness",
  "heirIds": [
    "lorgain-1677-ness",
    "sinclair-1696-ness",
    "fintan-1700-ness"
  ],
  "description": "An Ness von Glenshear ist ein Handels- und Seefahrerclan des Landes der Bären. Häfen, Märkte und Lagerhäuser tragen seinen Wohlstand; Diplomatie und Handelsausbildung prägen das Haus. Seine Krieger sind auf kontrollierten Nahkampf an Bord und in Hafenanlagen vorbereitet. Malcolm führt den Clan seit 1731. Das Motto lautet: Wohlstand verbindet. An Ness bleibt eine eigene Linie neben Ard’Nessa in Blaithneach. Krieg und Teilbesetzung Faelaorns ändern die historische Registerzuordnung nicht.",
  "partnershipExtensions": {
    "marriage-quaira-1700-neill--sinclair-1696-ness": {
      "chartAlignPartnerOverChildrenPersonId": "quaira-1700-neill",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "affair-sinclair-1696-ness--yvainne-unknown-ness-153-4": {
      "chartAlignPartnerOverChildrenPersonId": "yvainne-unknown-ness-153-4",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "marriage-lorgain-1677-ness--maeve-1679-diuid": {
      "chartAlignParentPairOverChildPersonId": "sinclair-1696-ness",
      "chartPackLeafSiblingBranchesBesideAlignedChild": true
    }
  }
});

export const HOUSE_NESS_FAMILY = createMathghamSourceFamily("ness", SOURCE);
