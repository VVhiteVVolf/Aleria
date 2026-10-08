import { createBrannSourceFamily } from './brann-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "taranach-founder-dubglais",
    "morrigan-founder-dubglais",
    "mael-founder-dubglais",
    "quiseog-founder-dubglais",
    "ceithre-founder-fionnghal",
    "treabhan-founder-eilitard",
    "balor-founder-dubglais",
    "faolan-founder-dubglais",
    "vairbh-founder-grodach",
    "catania-founder-airdmhor",
    "taranach-1558-dubglais",
    "morrigan-1562-dubglais",
    "dubhshlaine-1562-dubglais",
    "maille-1560-lachlann",
    "cainneach-1561-urquhart",
    "eadaoin-1565-cleirigh",
    "donncadh-1580-dubglais",
    "saoirse-ard-dubglais",
    "cathmor-1586-dubglais",
    "cliona-1588-urquhart",
    "eldgrim-varulv",
    "noracha-1590-buadhtreun",
    "maelduin-1605-dubglais",
    "liath-1609-dubglais",
    "torcall-unknown-oglivy-41-1",
    "deirdre-1614-dubglais",
    "kermena-1606-haig",
    "breasal-1606-airdmhor",
    "lannraig-1610-oglivy",
    "cormac-1610-diuid",
    "caorthann-1625-dubglais",
    "rhona-1630-dubglais",
    "kenna-1632-dubglais",
    "lulach-dubglais",
    "peagan-1626-cerneige",
    "gilleasbuig-1627-wemyss",
    "treabhnan-1630-culloch",
    "blodeuwedd-blodyn",
    "cathmor-1650-dubglais",
    "maeve-1652-dubglais",
    "bardan-1655-dubglais",
    "aigneis-dublais",
    "sadhbh-1646-diuid",
    "wighnach-1650-buadhtreun",
    "oirigh-1658-airdmhor",
    "thalen-arfordir",
    "taranach-1665-dubglais",
    "fenella-1670-dubglais",
    "porlach-1677-dubglais",
    "sorcha-1677-dubglais",
    "malachy-1679-dubglais",
    "tuiren-1668-culloch",
    "lagertha-founder-wellenkrone",
    "faithleach-1664-forsyth",
    "alasdair-1674-urquhart",
    "iosnan-founder-duff",
    "vearga-1679-eoghainn",
    "maeldun-1690-dubglais",
    "caorthann-1692-dubglais",
    "deirdre-1694-dubglais",
    "blythe-1697-dubglais",
    "rory-1699-dubglais",
    "balor-1703-dubglais",
    "ultan-1700-dubglais",
    "cairbre-1705-dubglais",
    "quibhna-1694-damona",
    "wrantha-1696-wemyss",
    "outhach-1692-brigantach",
    "sadwrn-1694-blaidd",
    "tavish-1704-airdmhor",
    "unbenannte-unknown-dubglais-91-5",
    "unbenannte-unknown-dubglais-91-6",
    "lagertha-founder-grimr",
    "vearga-1700-muirgheal",
    "torcall-1712-dubglais",
    "cathmor-1714-dubglais",
    "morrigan-1716-dubglais",
    "suibhne-1714-dubglais",
    "lorcan-1716-dubglais",
    "vaelor-1726-dubglais",
    "moirin-1729-dubglais",
    "kaelmor-1722-dubglais",
    "unbenanntes-1730-dubglais",
    "unbenanntes-1734-dubglais",
    "veyran-1732-dubglais"
  ],
  "partnershipIds": [
    "marriage-morrigan-founder-dubglais--taranach-founder-dubglais",
    "marriage-ceithre-founder-fionnghal--mael-founder-dubglais",
    "marriage-quiseog-founder-dubglais--treabhan-founder-eilitard",
    "marriage-balor-founder-dubglais--vairbh-founder-grodach",
    "marriage-catania-founder-airdmhor--faolan-founder-dubglais",
    "marriage-maille-1560-lachlann--taranach-1558-dubglais",
    "marriage-cainneach-1561-urquhart--morrigan-1562-dubglais",
    "marriage-dubhshlaine-1562-dubglais--eadaoin-1565-cleirigh",
    "marriage-cliona-1588-urquhart--donncadh-1580-dubglais",
    "marriage-eldgrim-saoirse-varulv",
    "marriage-cathmor-1586-dubglais--noracha-1590-buadhtreun",
    "marriage-kermena-1606-haig--maelduin-1605-dubglais",
    "marriage-breasal-1606-airdmhor--liath-1609-dubglais",
    "marriage-lannraig-1610-oglivy--torcall-unknown-oglivy-41-1",
    "marriage-cormac-1610-diuid--deirdre-1614-dubglais",
    "marriage-caorthann-1625-dubglais--peagan-1626-cerneige",
    "marriage-gilleasbuig-1627-wemyss--rhona-1630-dubglais",
    "marriage-kenna-1632-dubglais--treabhnan-1630-culloch",
    "marriage-blodeuwedd-lulach",
    "marriage-cathmor-1650-dubglais--sadhbh-1646-diuid",
    "marriage-maeve-1652-dubglais--wighnach-1650-buadhtreun",
    "marriage-bardan-1655-dubglais--oirigh-1658-airdmhor",
    "marriage-thalen-aigneis-arfordir",
    "marriage-taranach-1665-dubglais--tuiren-1668-culloch",
    "marriage-lagertha-founder-wellenkrone--taranach-1665-dubglais",
    "marriage-faithleach-1664-forsyth--fenella-1670-dubglais",
    "marriage-alasdair-1674-urquhart--porlach-1677-dubglais",
    "marriage-iosnan-founder-duff--sorcha-1677-dubglais",
    "marriage-malachy-1679-dubglais--vearga-1679-eoghainn",
    "marriage-maeldun-1690-dubglais--quibhna-1694-damona",
    "marriage-caorthann-1692-dubglais--wrantha-1696-wemyss",
    "marriage-deirdre-1694-dubglais--outhach-1692-brigantach",
    "marriage-blythe-1697-dubglais--sadwrn-1694-blaidd",
    "affair-rory-1699-dubglais--tavish-1704-airdmhor",
    "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-5",
    "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-6",
    "forced-lagertha-founder-grimr--rory-1699-dubglais",
    "marriage-ultan-1700-dubglais--vearga-1700-muirgheal"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-morrigan-founder-dubglais--taranach-founder-dubglais",
      "childIds": [
        "mael-founder-dubglais",
        "quiseog-founder-dubglais"
      ],
      "timeJumpId": "gap-brann-dubglais-founders"
    },
    {
      "partnershipId": "marriage-ceithre-founder-fionnghal--mael-founder-dubglais",
      "childIds": [
        "balor-founder-dubglais",
        "faolan-founder-dubglais"
      ],
      "timeJumpId": "gap-brann-dubglais-mael"
    },
    {
      "partnershipId": "marriage-balor-founder-dubglais--vairbh-founder-grodach",
      "childIds": [
        "taranach-1558-dubglais",
        "morrigan-1562-dubglais",
        "dubhshlaine-1562-dubglais"
      ],
      "timeJumpId": "gap-brann-dubglais-balor"
    },
    {
      "partnershipId": "marriage-maille-1560-lachlann--taranach-1558-dubglais",
      "childIds": [
        "donncadh-1580-dubglais",
        "saoirse-ard-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-dubhshlaine-1562-dubglais--eadaoin-1565-cleirigh",
      "childIds": [
        "cathmor-1586-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-cliona-1588-urquhart--donncadh-1580-dubglais",
      "childIds": [
        "maelduin-1605-dubglais",
        "liath-1609-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-cathmor-1586-dubglais--noracha-1590-buadhtreun",
      "childIds": [
        "torcall-unknown-oglivy-41-1",
        "deirdre-1614-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-kermena-1606-haig--maelduin-1605-dubglais",
      "childIds": [
        "caorthann-1625-dubglais",
        "rhona-1630-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-lannraig-1610-oglivy--torcall-unknown-oglivy-41-1",
      "childIds": [
        "kenna-1632-dubglais",
        "lulach-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-caorthann-1625-dubglais--peagan-1626-cerneige",
      "childIds": [
        "cathmor-1650-dubglais",
        "maeve-1652-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-blodeuwedd-lulach",
      "childIds": [
        "bardan-1655-dubglais",
        "aigneis-dublais"
      ]
    },
    {
      "partnershipId": "marriage-cathmor-1650-dubglais--sadhbh-1646-diuid",
      "childIds": [
        "taranach-1665-dubglais",
        "fenella-1670-dubglais",
        "porlach-1677-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-bardan-1655-dubglais--oirigh-1658-airdmhor",
      "childIds": [
        "sorcha-1677-dubglais",
        "malachy-1679-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-taranach-1665-dubglais--tuiren-1668-culloch",
      "childIds": [
        "maeldun-1690-dubglais",
        "caorthann-1692-dubglais",
        "deirdre-1694-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-lagertha-founder-wellenkrone--taranach-1665-dubglais",
      "childIds": [
        "blythe-1697-dubglais",
        "rory-1699-dubglais",
        "balor-1703-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-malachy-1679-dubglais--vearga-1679-eoghainn",
      "childIds": [
        "ultan-1700-dubglais",
        "cairbre-1705-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-maeldun-1690-dubglais--quibhna-1694-damona",
      "childIds": [
        "torcall-1712-dubglais",
        "cathmor-1714-dubglais",
        "morrigan-1716-dubglais"
      ]
    },
    {
      "partnershipId": "marriage-caorthann-1692-dubglais--wrantha-1696-wemyss",
      "childIds": [
        "suibhne-1714-dubglais",
        "lorcan-1716-dubglais"
      ]
    },
    {
      "partnershipId": "affair-rory-1699-dubglais--tavish-1704-airdmhor",
      "childIds": [
        "vaelor-1726-dubglais",
        "moirin-1729-dubglais"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-5",
      "childIds": [
        "kaelmor-1722-dubglais"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-6",
      "childIds": [
        "unbenanntes-1730-dubglais",
        "unbenanntes-1734-dubglais"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "forced-lagertha-founder-grimr--rory-1699-dubglais",
      "childIds": [
        "veyran-1732-dubglais"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-quiseog-founder-dubglais--treabhan-founder-eilitard",
      "targetFamilyId": "haus-eilitard",
      "houseId": "house-eilitard"
    },
    {
      "partnershipId": "marriage-cainneach-1561-urquhart--morrigan-1562-dubglais",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-eldgrim-saoirse-varulv",
      "targetFamilyId": "haus-varulv",
      "houseId": "house-varulv"
    },
    {
      "partnershipId": "marriage-breasal-1606-airdmhor--liath-1609-dubglais",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    },
    {
      "partnershipId": "marriage-cormac-1610-diuid--deirdre-1614-dubglais",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-gilleasbuig-1627-wemyss--rhona-1630-dubglais",
      "targetFamilyId": "haus-wemyss",
      "houseId": "house-wemyss"
    },
    {
      "partnershipId": "marriage-kenna-1632-dubglais--treabhnan-1630-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-maeve-1652-dubglais--wighnach-1650-buadhtreun",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-thalen-aigneis-arfordir",
      "targetFamilyId": "haus-arfordir",
      "houseId": "house-arfordir"
    },
    {
      "partnershipId": "marriage-faithleach-1664-forsyth--fenella-1670-dubglais",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-alasdair-1674-urquhart--porlach-1677-dubglais",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-iosnan-founder-duff--sorcha-1677-dubglais",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-deirdre-1694-dubglais--outhach-1692-brigantach",
      "targetFamilyId": "haus-brigantach",
      "houseId": "house-brigantach"
    },
    {
      "partnershipId": "marriage-blythe-1697-dubglais--sadwrn-1694-blaidd",
      "targetFamilyId": "haus-blaidd",
      "houseId": "house-blaidd"
    },
    {
      "partnershipId": "marriage-ultan-1700-dubglais--vearga-1700-muirgheal",
      "targetFamilyId": "haus-muirgheal",
      "houseId": "house-muirgheal"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-catania-founder-airdmhor--faolan-founder-dubglais",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    }
  ],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "vaelor-1726-dubglais": "bastard",
    "moirin-1729-dubglais": "bastard",
    "tavish-1704-airdmhor": "affair",
    "kaelmor-1722-dubglais": "bastard",
    "unbenannte-unknown-dubglais-91-5": "affair",
    "unbenanntes-1730-dubglais": "bastard",
    "unbenanntes-1734-dubglais": "bastard",
    "unbenannte-unknown-dubglais-91-6": "affair",
    "veyran-1732-dubglais": "bastard",
    "lagertha-founder-grimr": "forced"
  },
  "personExtensions": {
    "taranach-1665-dubglais": {
      "chartCenterBetweenPartnerPersonIds": [
        "tuiren-1668-culloch",
        "lagertha-founder-wellenkrone"
      ],
      "chartKeepPartnerGroupTogether": true,
      "chartPartnerGroupPersonOrder": [
        "tuiren-1668-culloch",
        "taranach-1665-dubglais",
        "lagertha-founder-wellenkrone"
      ]
    },
    "rory-1699-dubglais": {
      "chartCenterBetweenPartnerPersonIds": [
        "tavish-1704-airdmhor",
        "unbenannte-unknown-dubglais-91-5",
        "unbenannte-unknown-dubglais-91-6",
        "lagertha-founder-grimr"
      ],
      "chartKeepPartnerGroupTogether": true
    }
  },
  "sourceNote": "Drei Überlieferungslücken; Airdmhor entspringt Faolán und Catania. Rorys drei Affären und die erzwungene Verbindung mit Lagertha Grimr wurden vom Nutzer bestätigt. Sechs fehlende Kinderjahre sind mit Zustimmung redaktionell ergänzt (Alter 6–25 im Jahr 1740). Unbenannte Personen bleiben Platzhalter. Die eigenständige Dubhan-Akte wird nicht umgedeutet.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Mac Dubglais von Sgurrfàil ist das historische Mor-Tiarna-Haus von Tir na Brann. Die Überlieferung führt auf Taranach und Morrígan zurück und enthält mehrere frühe Generationenlücken. Aus der Verbindung Faoláns mit Catania geht die Linie Airdmhor hervor. Spätere Ehen verknüpfen Dubglais mit zahlreichen Häusern Faelaorns, darunter Wemyss, Carnegie, Urquhart und Eoghainn. Rorys Nachkommen gehören mehreren unehelichen Linien an, darunter die gemeinsamen Kinder mit Tavish Airdmhor. Trotz Krieg und Teilbesetzung bleibt die historische Herrschaft Grundlage der Einordnung.",
  "warriorReference": "",
  "unknownDataNote": "Nur die sechs undatierten jüngsten Dubglais-Kinder erhalten ausdrücklich genehmigte redaktionelle Geburtsjahre; übrige fehlende Daten bleiben offen.",
  "partnershipExtensions": {
    "marriage-taranach-1665-dubglais--tuiren-1668-culloch": {
      "chartAlignPartnerOverChildrenPersonId": "tuiren-1668-culloch",
      "chartReserveDescendantBranchLane": true
    },
    "marriage-lagertha-founder-wellenkrone--taranach-1665-dubglais": {
      "chartAlignPartnerOverChildrenPersonId": "lagertha-founder-wellenkrone",
      "chartReserveDescendantBranchLane": true
    },
    "affair-rory-1699-dubglais--tavish-1704-airdmhor": {
      "chartAlignPartnerOverChildrenPersonId": "tavish-1704-airdmhor",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true,
      "chartAlignChildGroupBelowParentPair": false,
      "chartAlignParentPairOverChildPersonId": ""
    },
    "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-5": {
      "chartAlignPartnerOverChildrenPersonId": "unbenannte-unknown-dubglais-91-5",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true,
      "chartAlignChildGroupBelowParentPair": false,
      "chartAlignParentPairOverChildPersonId": ""
    },
    "affair-rory-1699-dubglais--unbenannte-unknown-dubglais-91-6": {
      "chartAlignPartnerOverChildrenPersonId": "unbenannte-unknown-dubglais-91-6",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true,
      "chartAlignChildGroupBelowParentPair": false,
      "chartAlignParentPairOverChildPersonId": ""
    },
    "forced-lagertha-founder-grimr--rory-1699-dubglais": {
      "chartAlignPartnerOverChildrenPersonId": "lagertha-founder-grimr",
      "chartReserveLeafChildLane": true,
      "chartArrangeLeafChildrenEvenly": true,
      "chartAlignChildGroupBelowParentPair": false,
      "chartAlignParentPairOverChildPersonId": ""
    }
  }
});

export const HOUSE_DUBGLAIS_FAMILY = createBrannSourceFamily("dubglais", SOURCE);
