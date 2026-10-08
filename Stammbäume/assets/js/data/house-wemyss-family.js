import { createBrannSourceFamily } from './brann-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "puirseil-founder-wemyss",
    "wrantha-founder-wemyss",
    "gilleasbuig-1580-wemyss",
    "eimhear-1584-wemyss",
    "oighreag-1583-cerneige",
    "torcall-founder-airdmhor",
    "puirseil-1605-wemyss",
    "wrantha-1608-wemyss",
    "toirberth-1610-wemyss",
    "dunlaith-1609-conochbhair",
    "ruaidhri-1606-lockart",
    "uallach-1612-brigantach",
    "gilleasbuig-1627-wemyss",
    "doileag-1632-wemyss",
    "uaithear-1630-wemyss",
    "rhona-1630-dubglais",
    "enda-1632-magach",
    "kessog-1635-neill",
    "wiochan-1651-wemyss",
    "iarbhine-1654-wemyss",
    "peadarog-1654-wemyss",
    "seallach-1658-wemyss",
    "paislie-1653-airdmhor",
    "cairbre-1651-cerneige",
    "seallach-1657-salaig",
    "breasal-1656-eoghainn",
    "puirseil-1672-wemyss",
    "pailis-1677-wemyss",
    "kianan-1677-wemyss",
    "peathra-wemyss",
    "mairead-1676-rieach",
    "nuallan-1676-fiorghra",
    "cacht-1680-rowak",
    "glyndwr-gwenyen",
    "toirberth-1694-wemyss",
    "wrantha-1696-wemyss",
    "gilleasbuig-1702-wemyss",
    "slaine-1701-wemyss",
    "kenneth-1706-wemyss",
    "oirigh-1696-grodach",
    "caorthann-1692-dubglais",
    "garvan-1700-airdmhor",
    "unbenannte-unknown-wemyss-61-3",
    "lagertha-founder-grimr",
    "wiochan-1714-wemyss",
    "unbenanntes-1729-wemyss",
    "unbenanntes-1734-wemyss",
    "unbenanntes-1732-wemyss",
    "unbenanntes-1736-wemyss"
  ],
  "partnershipIds": [
    "marriage-puirseil-founder-wemyss--wrantha-founder-wemyss",
    "marriage-gilleasbuig-1580-wemyss--oighreag-1583-cerneige",
    "marriage-eimhear-1584-wemyss--torcall-founder-airdmhor",
    "marriage-dunlaith-1609-conochbhair--puirseil-1605-wemyss",
    "marriage-ruaidhri-1606-lockart--wrantha-1608-wemyss",
    "marriage-toirberth-1610-wemyss--uallach-1612-brigantach",
    "marriage-gilleasbuig-1627-wemyss--rhona-1630-dubglais",
    "marriage-doileag-1632-wemyss--enda-1632-magach",
    "marriage-kessog-1635-neill--uaithear-1630-wemyss",
    "marriage-paislie-1653-airdmhor--wiochan-1651-wemyss",
    "marriage-cairbre-1651-cerneige--iarbhine-1654-wemyss",
    "marriage-peadarog-1654-wemyss--seallach-1657-salaig",
    "marriage-breasal-1656-eoghainn--seallach-1658-wemyss",
    "marriage-mairead-1676-rieach--puirseil-1672-wemyss",
    "marriage-nuallan-1676-fiorghra--pailis-1677-wemyss",
    "marriage-cacht-1680-rowak--kianan-1677-wemyss",
    "marriage-glyndwr-gwenyen--peathra-wemyss",
    "marriage-oirigh-1696-grodach--toirberth-1694-wemyss",
    "marriage-caorthann-1692-dubglais--wrantha-1696-wemyss",
    "marriage-garvan-1700-airdmhor--slaine-1701-wemyss",
    "affair-kenneth-1706-wemyss--unbenannte-unknown-wemyss-61-3",
    "forced-kenneth-1706-wemyss--lagertha-founder-grimr"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-puirseil-founder-wemyss--wrantha-founder-wemyss",
      "childIds": [
        "gilleasbuig-1580-wemyss",
        "eimhear-1584-wemyss"
      ],
      "timeJumpId": "gap-brann-wemyss-founders"
    },
    {
      "partnershipId": "marriage-gilleasbuig-1580-wemyss--oighreag-1583-cerneige",
      "childIds": [
        "puirseil-1605-wemyss",
        "wrantha-1608-wemyss",
        "toirberth-1610-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-dunlaith-1609-conochbhair--puirseil-1605-wemyss",
      "childIds": [
        "gilleasbuig-1627-wemyss",
        "doileag-1632-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-toirberth-1610-wemyss--uallach-1612-brigantach",
      "childIds": [
        "uaithear-1630-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-gilleasbuig-1627-wemyss--rhona-1630-dubglais",
      "childIds": [
        "wiochan-1651-wemyss",
        "iarbhine-1654-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-kessog-1635-neill--uaithear-1630-wemyss",
      "childIds": [
        "peadarog-1654-wemyss",
        "seallach-1658-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-paislie-1653-airdmhor--wiochan-1651-wemyss",
      "childIds": [
        "puirseil-1672-wemyss",
        "pailis-1677-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-peadarog-1654-wemyss--seallach-1657-salaig",
      "childIds": [
        "kianan-1677-wemyss",
        "peathra-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-mairead-1676-rieach--puirseil-1672-wemyss",
      "childIds": [
        "toirberth-1694-wemyss",
        "wrantha-1696-wemyss",
        "gilleasbuig-1702-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-cacht-1680-rowak--kianan-1677-wemyss",
      "childIds": [
        "slaine-1701-wemyss",
        "kenneth-1706-wemyss"
      ]
    },
    {
      "partnershipId": "marriage-oirigh-1696-grodach--toirberth-1694-wemyss",
      "childIds": [
        "wiochan-1714-wemyss"
      ]
    },
    {
      "partnershipId": "affair-kenneth-1706-wemyss--unbenannte-unknown-wemyss-61-3",
      "childIds": [
        "unbenanntes-1729-wemyss",
        "unbenanntes-1734-wemyss"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "forced-kenneth-1706-wemyss--lagertha-founder-grimr",
      "childIds": [
        "unbenanntes-1732-wemyss",
        "unbenanntes-1736-wemyss"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eimhear-1584-wemyss--torcall-founder-airdmhor",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    },
    {
      "partnershipId": "marriage-ruaidhri-1606-lockart--wrantha-1608-wemyss",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-doileag-1632-wemyss--enda-1632-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-cairbre-1651-cerneige--iarbhine-1654-wemyss",
      "targetFamilyId": "haus-cerneige",
      "houseId": "house-cerneige"
    },
    {
      "partnershipId": "marriage-breasal-1656-eoghainn--seallach-1658-wemyss",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    },
    {
      "partnershipId": "marriage-nuallan-1676-fiorghra--pailis-1677-wemyss",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-glyndwr-gwenyen--peathra-wemyss",
      "targetFamilyId": "haus-gwenyen",
      "houseId": "house-gwenyen"
    },
    {
      "partnershipId": "marriage-caorthann-1692-dubglais--wrantha-1696-wemyss",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-garvan-1700-airdmhor--slaine-1701-wemyss",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "unbenanntes-1729-wemyss": "bastard",
    "unbenanntes-1734-wemyss": "bastard",
    "unbenannte-unknown-wemyss-61-3": "affair",
    "unbenanntes-1732-wemyss": "bastard",
    "unbenanntes-1736-wemyss": "bastard",
    "lagertha-founder-grimr": "forced"
  },
  "personExtensions": {
    "kenneth-1706-wemyss": {
      "chartCenterBetweenPartnerPersonIds": [
        "unbenannte-unknown-wemyss-61-3",
        "lagertha-founder-grimr"
      ],
      "chartKeepPartnerGroupTogether": true,
      "chartPartnerGroupPersonOrder": [
        "unbenannte-unknown-wemyss-61-3",
        "kenneth-1706-wemyss",
        "lagertha-founder-grimr"
      ]
    }
  },
  "sourceNote": "Eine Überlieferungslücke. Kenneths vier unbenannte Kinder bleiben eigenständige Platzhalter; zwei stammen aus der violett markierten Affäre, zwei aus der orange markierten erzwungenen Verbindung mit Lagertha Grimr.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Tir An Wemyss ist das historische Dun-Tiarna-Haus von Drumrath in Tir na Brann. Seine Stammfolge beginnt bei Puirséil und Wrantha und setzt nach einer Überlieferungslücke mit Gilleasbuig und Eimhear ein. Ehen verbinden den Clan besonders mit Carnegie, Airdmhor und Dubglais. Die jüngere Genealogie enthält neben den ehelichen Linien Kenneths Kinder aus einer Affäre und aus der erzwungenen Verbindung mit Lagertha Grimr. Die alte Herrschaftszuordnung bleibt während des Krieges mit Skjaerheim bestehen.",
  "warriorReference": "",
  "partnershipExtensions": {
    "affair-kenneth-1706-wemyss--unbenannte-unknown-wemyss-61-3": {
      "chartAlignPartnerOverChildrenPersonId": "unbenannte-unknown-wemyss-61-3",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    },
    "forced-kenneth-1706-wemyss--lagertha-founder-grimr": {
      "chartAlignPartnerOverChildrenPersonId": "lagertha-founder-grimr",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true
    }
  }
});

export const HOUSE_WEMYSS_FAMILY = createBrannSourceFamily("wemyss", SOURCE);
