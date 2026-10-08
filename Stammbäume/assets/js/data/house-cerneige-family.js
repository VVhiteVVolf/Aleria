import { createBrannSourceFamily } from './brann-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "hiomhar-founder-cerneige",
    "uisigh-founder-cerneige",
    "cairbre-1579-cerneige",
    "oighreag-1583-cerneige",
    "maeve-1584-airdmhor",
    "gilleasbuig-1580-wemyss",
    "hiomhar-1602-carnegie",
    "eadaoin-carnegie",
    "uisigh-1613-carnegie",
    "tormodh-1615-cerneige",
    "jilbhe-1605-goidin",
    "goraidhas-1605-tordarroch",
    "comgall-1610-ailella",
    "sorcha-1617-cannog",
    "peagan-1626-cerneige",
    "cathbad-1628-cerneige",
    "ruaidhrigh-1635-cerneige",
    "peatharlach-1636-carnegie",
    "caorthann-1625-dubglais",
    "macha-1631-airdmhor",
    "maebh-1638-giolla",
    "tadgh-1632-lockart",
    "cairbre-1651-cerneige",
    "uirghlinn-1655-carnegie",
    "uaithneach-1657-cerneige",
    "haibrhinn-1657-carnegie",
    "iarbhine-1654-wemyss",
    "artan-1655-dianaomh",
    "dervla-1659-rieach",
    "caolan-1655-drummond",
    "tormodh-1673-cerneige",
    "uisigh-1675-carnegie",
    "vadria-1680-carnegie",
    "vaithreach-1678-cerneige",
    "tuiren-1676-giolla",
    "murdoch-1674-fiorghra",
    "garvan-1676-diuid",
    "lorellin-1682-dammerbaum",
    "ruaidhrigh-1694-cerneige",
    "neidin-1699-carnegie",
    "cathbad-1702-cerneige",
    "sluaghan-1701-cerneige",
    "duibhseach-1705-carnegie",
    "uidhir-1708-cerneige",
    "grainne-1696-grodach",
    "fiachra-1696-urquhart",
    "catania-1704-airdmhor",
    "odran-1700-haig",
    "liosa-1712-cannog",
    "uisigh-1716-cerneige",
    "vearan-1726-cerneige",
    "vadria-1730-cerneige",
    "keitha-1729-cerneige",
    "quion-1733-cerneige"
  ],
  "partnershipIds": [
    "marriage-hiomhar-founder-cerneige--uisigh-founder-cerneige",
    "marriage-cairbre-1579-cerneige--maeve-1584-airdmhor",
    "marriage-gilleasbuig-1580-wemyss--oighreag-1583-cerneige",
    "marriage-hiomhar-1602-carnegie--jilbhe-1605-goidin",
    "marriage-eadaoin-carnegie--goraidhas-1605-tordarroch",
    "marriage-comgall-1610-ailella--uisigh-1613-carnegie",
    "marriage-sorcha-1617-cannog--tormodh-1615-cerneige",
    "marriage-caorthann-1625-dubglais--peagan-1626-cerneige",
    "marriage-cathbad-1628-cerneige--macha-1631-airdmhor",
    "marriage-maebh-1638-giolla--ruaidhrigh-1635-cerneige",
    "marriage-peatharlach-1636-carnegie--tadgh-1632-lockart",
    "marriage-cairbre-1651-cerneige--iarbhine-1654-wemyss",
    "marriage-artan-1655-dianaomh--uirghlinn-1655-carnegie",
    "marriage-dervla-1659-rieach--uaithneach-1657-cerneige",
    "marriage-caolan-1655-drummond--haibrhinn-1657-carnegie",
    "marriage-tormodh-1673-cerneige--tuiren-1676-giolla",
    "marriage-murdoch-1674-fiorghra--uisigh-1675-carnegie",
    "marriage-garvan-1676-diuid--vadria-1680-carnegie",
    "marriage-lorellin-1682-dammerbaum--vaithreach-1678-cerneige",
    "marriage-grainne-1696-grodach--ruaidhrigh-1694-cerneige",
    "marriage-fiachra-1696-urquhart--neidin-1699-carnegie",
    "marriage-catania-1704-airdmhor--sluaghan-1701-cerneige",
    "marriage-duibhseach-1705-carnegie--odran-1700-haig",
    "marriage-liosa-1712-cannog--uidhir-1708-cerneige"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-hiomhar-founder-cerneige--uisigh-founder-cerneige",
      "childIds": [
        "cairbre-1579-cerneige",
        "oighreag-1583-cerneige"
      ],
      "timeJumpId": "gap-brann-cerneige-founders"
    },
    {
      "partnershipId": "marriage-cairbre-1579-cerneige--maeve-1584-airdmhor",
      "childIds": [
        "hiomhar-1602-carnegie",
        "eadaoin-carnegie",
        "uisigh-1613-carnegie",
        "tormodh-1615-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-hiomhar-1602-carnegie--jilbhe-1605-goidin",
      "childIds": [
        "peagan-1626-cerneige",
        "cathbad-1628-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-sorcha-1617-cannog--tormodh-1615-cerneige",
      "childIds": [
        "ruaidhrigh-1635-cerneige",
        "peatharlach-1636-carnegie"
      ]
    },
    {
      "partnershipId": "marriage-cathbad-1628-cerneige--macha-1631-airdmhor",
      "childIds": [
        "cairbre-1651-cerneige",
        "uirghlinn-1655-carnegie"
      ]
    },
    {
      "partnershipId": "marriage-maebh-1638-giolla--ruaidhrigh-1635-cerneige",
      "childIds": [
        "uaithneach-1657-cerneige",
        "haibrhinn-1657-carnegie"
      ]
    },
    {
      "partnershipId": "marriage-cairbre-1651-cerneige--iarbhine-1654-wemyss",
      "childIds": [
        "tormodh-1673-cerneige",
        "uisigh-1675-carnegie",
        "vadria-1680-carnegie"
      ]
    },
    {
      "partnershipId": "marriage-dervla-1659-rieach--uaithneach-1657-cerneige",
      "childIds": [
        "vaithreach-1678-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-tormodh-1673-cerneige--tuiren-1676-giolla",
      "childIds": [
        "ruaidhrigh-1694-cerneige",
        "neidin-1699-carnegie",
        "cathbad-1702-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-lorellin-1682-dammerbaum--vaithreach-1678-cerneige",
      "childIds": [
        "sluaghan-1701-cerneige",
        "duibhseach-1705-carnegie",
        "uidhir-1708-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-grainne-1696-grodach--ruaidhrigh-1694-cerneige",
      "childIds": [
        "uisigh-1716-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-catania-1704-airdmhor--sluaghan-1701-cerneige",
      "childIds": [
        "vearan-1726-cerneige",
        "vadria-1730-cerneige"
      ]
    },
    {
      "partnershipId": "marriage-liosa-1712-cannog--uidhir-1708-cerneige",
      "childIds": [
        "keitha-1729-cerneige",
        "quion-1733-cerneige"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-gilleasbuig-1580-wemyss--oighreag-1583-cerneige",
      "targetFamilyId": "haus-wemyss",
      "houseId": "house-wemyss"
    },
    {
      "partnershipId": "marriage-eadaoin-carnegie--goraidhas-1605-tordarroch",
      "targetFamilyId": "haus-tir-an-tordarroch",
      "houseId": "house-tir-an-tordarroch"
    },
    {
      "partnershipId": "marriage-comgall-1610-ailella--uisigh-1613-carnegie",
      "targetFamilyId": "haus-ailella",
      "houseId": "house-ailella"
    },
    {
      "partnershipId": "marriage-caorthann-1625-dubglais--peagan-1626-cerneige",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-peatharlach-1636-carnegie--tadgh-1632-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-artan-1655-dianaomh--uirghlinn-1655-carnegie",
      "targetFamilyId": "haus-dianaomh",
      "houseId": "house-dianaomh"
    },
    {
      "partnershipId": "marriage-caolan-1655-drummond--haibrhinn-1657-carnegie",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-murdoch-1674-fiorghra--uisigh-1675-carnegie",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-garvan-1676-diuid--vadria-1680-carnegie",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-fiachra-1696-urquhart--neidin-1699-carnegie",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-duibhseach-1705-carnegie--odran-1700-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Carnegie ist die Schreibweise der neuen Grafik und der angeheirateten Personen; die vorbereitete Akten-ID Cerneige bleibt als stabile Identität erhalten. Cathbads Geburtsjahr ist laut Nutzer 1702, nicht 1672.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Tair Carnegie, im Herrschaftsregister auch Cerneige geschrieben, ist das historische Dun-Tiarna-Haus von Glenmohr in Tir na Brann. Die Genealogie beginnt mit Híomhar und Uisigh und setzt nach einer Überlieferungslücke bei Cairbre und Oighreag ein. Durch ihre Ehen und die späteren Zweige ist der Clan eng mit Airdmhor, Wemyss und Dubglais verbunden. Zu den jüngsten überlieferten Angehörigen zählen Vearan, Vadria, Keitha und Quion. Die alte Herrschaftsordnung bleibt trotz des Krieges und der teilweisen Besetzung Faelaorns maßgeblich.",
  "warriorReference": ""
});

export const HOUSE_CERNEIGE_FAMILY = createBrannSourceFamily("cerneige", SOURCE);
