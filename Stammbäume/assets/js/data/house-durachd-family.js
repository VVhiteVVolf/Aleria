import { createFaernaSourceFamily } from './faerna-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ionnrachtaigh-founder-durachd",
    "blathnat-unknown-durachd-94-0",
    "proinnsias-founder-durachd",
    "orlaith-founder-durachd",
    "moirin-founder-ffearnach",
    "gordan-founder-ceallaigh",
    "fothradh-founder-durachd",
    "blathnat-founder-durchadh",
    "oibhrin-founder-treathai",
    "muiredach-founder-haeghra",
    "ionnrachtaigh-1580-durachd",
    "dubessa-1583-durachd",
    "muircheartach-1586-durachd",
    "tadhaigh-1584-grannd",
    "finlay-1582-fiorghra",
    "maille-1588-muirgheal",
    "cailte-durachd",
    "fionaach-1607-durchadh",
    "fothradh-1608-durachd",
    "blathnaid-1614-durachd",
    "niniel-grawn",
    "seamus-1607-haeghra",
    "uarain-1610-scathain",
    "sinclair-1615-ness",
    "muircheartach-1627-durachd",
    "iolanda-1634-durachd",
    "vaithreach-1630-durachd",
    "searan-1629-treathai",
    "diarmaid-1633-diuid",
    "quiseog-1634-arbhair",
    "ionnrachtaigh-1647-durachd",
    "blathnat-1653-durachd",
    "proinnsias-1653-durachd",
    "muireann-1655-durachd",
    "warin-1651-elid",
    "faithleach-1649-muirgheal",
    "haileigh-1656-buadhtreun",
    "graham-1654-ness",
    "fothradh-durachd",
    "cailte-1674-durachd",
    "hoiteann-1678-durachd",
    "reathnaigh-1675-durachd",
    "wuirseach-1677-durachd",
    "eleyne-grawn",
    "cuilinn-1677-arbhair",
    "luibheas-1678-fiorghra",
    "dubhan-1674-boyd",
    "searbhi-1680-scathain",
    "yestinan-1691-durachd",
    "peigi-1696-durachd",
    "tighearnach-1700-durachd",
    "koarnach-1704-durachd",
    "vaithreach-1695-durachd",
    "blathnat-founder-durachd",
    "gaothaire-1703-durachd",
    "toirche-1700-durachd",
    "quaidin-1704-durachd",
    "grian-1696-torcmhar",
    "vannoch-1692-buadhtreun",
    "noracha-1700-muirgheal",
    "oistin-1692-lockart",
    "uisdean-1697-borthwick",
    "wuirseach-1714-durachd",
    "lisair-1718-durachd",
    "piaras-1723-durachd",
    "quilla-1720-durachd"
  ],
  "partnershipIds": [
    "marriage-blathnat-unknown-durachd-94-0--ionnrachtaigh-founder-durachd",
    "marriage-moirin-founder-ffearnach--proinnsias-founder-durachd",
    "marriage-gordan-founder-ceallaigh--orlaith-founder-durachd",
    "marriage-fothradh-founder-durachd--oibhrin-founder-treathai",
    "marriage-blathnat-founder-durchadh--muiredach-founder-haeghra",
    "marriage-ionnrachtaigh-1580-durachd--tadhaigh-1584-grannd",
    "marriage-dubessa-1583-durachd--finlay-1582-fiorghra",
    "marriage-maille-1588-muirgheal--muircheartach-1586-durachd",
    "marriage-niniel-cailte",
    "marriage-fionaach-1607-durchadh--seamus-1607-haeghra",
    "marriage-fothradh-1608-durachd--uarain-1610-scathain",
    "marriage-blathnaid-1614-durachd--sinclair-1615-ness",
    "marriage-muircheartach-1627-durachd--searan-1629-treathai",
    "marriage-diarmaid-1633-diuid--iolanda-1634-durachd",
    "marriage-quiseog-1634-arbhair--vaithreach-1630-durachd",
    "marriage-ionnrachtaigh-1647-durachd--warin-1651-elid",
    "marriage-blathnat-1653-durachd--faithleach-1649-muirgheal",
    "marriage-haileigh-1656-buadhtreun--proinnsias-1653-durachd",
    "marriage-graham-1654-ness--muireann-1655-durachd",
    "marriage-eleyne-fothradh",
    "marriage-cailte-1674-durachd--cuilinn-1677-arbhair",
    "marriage-hoiteann-1678-durachd--luibheas-1678-fiorghra",
    "marriage-dubhan-1674-boyd--reathnaigh-1675-durachd",
    "marriage-searbhi-1680-scathain--wuirseach-1677-durachd",
    "marriage-grian-1696-torcmhar--yestinan-1691-durachd",
    "marriage-peigi-1696-durachd--vannoch-1692-buadhtreun",
    "marriage-noracha-1700-muirgheal--vaithreach-1695-durachd",
    "marriage-blathnat-founder-durachd--oistin-1692-lockart",
    "marriage-toirche-1700-durachd--uisdean-1697-borthwick"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-blathnat-unknown-durachd-94-0--ionnrachtaigh-founder-durachd",
      "childIds": [
        "proinnsias-founder-durachd",
        "orlaith-founder-durachd"
      ],
      "timeJumpId": "gap-faerna-durachd-founders"
    },
    {
      "partnershipId": "marriage-moirin-founder-ffearnach--proinnsias-founder-durachd",
      "childIds": [
        "fothradh-founder-durachd",
        "blathnat-founder-durchadh"
      ],
      "timeJumpId": "gap-faerna-durachd-proinnsias"
    },
    {
      "partnershipId": "marriage-fothradh-founder-durachd--oibhrin-founder-treathai",
      "childIds": [
        "ionnrachtaigh-1580-durachd",
        "dubessa-1583-durachd",
        "muircheartach-1586-durachd"
      ],
      "timeJumpId": "gap-faerna-durachd-fothradh"
    },
    {
      "partnershipId": "marriage-ionnrachtaigh-1580-durachd--tadhaigh-1584-grannd",
      "childIds": [
        "cailte-durachd",
        "fionaach-1607-durchadh"
      ]
    },
    {
      "partnershipId": "marriage-maille-1588-muirgheal--muircheartach-1586-durachd",
      "childIds": [
        "fothradh-1608-durachd",
        "blathnaid-1614-durachd"
      ]
    },
    {
      "partnershipId": "marriage-niniel-cailte",
      "childIds": [
        "muircheartach-1627-durachd",
        "iolanda-1634-durachd"
      ]
    },
    {
      "partnershipId": "marriage-fothradh-1608-durachd--uarain-1610-scathain",
      "childIds": [
        "vaithreach-1630-durachd"
      ]
    },
    {
      "partnershipId": "marriage-muircheartach-1627-durachd--searan-1629-treathai",
      "childIds": [
        "ionnrachtaigh-1647-durachd",
        "blathnat-1653-durachd"
      ]
    },
    {
      "partnershipId": "marriage-quiseog-1634-arbhair--vaithreach-1630-durachd",
      "childIds": [
        "proinnsias-1653-durachd",
        "muireann-1655-durachd"
      ]
    },
    {
      "partnershipId": "marriage-ionnrachtaigh-1647-durachd--warin-1651-elid",
      "childIds": [
        "fothradh-durachd",
        "cailte-1674-durachd",
        "hoiteann-1678-durachd"
      ]
    },
    {
      "partnershipId": "marriage-haileigh-1656-buadhtreun--proinnsias-1653-durachd",
      "childIds": [
        "reathnaigh-1675-durachd",
        "wuirseach-1677-durachd"
      ]
    },
    {
      "partnershipId": "marriage-eleyne-fothradh",
      "childIds": [
        "yestinan-1691-durachd",
        "peigi-1696-durachd",
        "tighearnach-1700-durachd",
        "koarnach-1704-durachd"
      ]
    },
    {
      "partnershipId": "marriage-cailte-1674-durachd--cuilinn-1677-arbhair",
      "childIds": [
        "vaithreach-1695-durachd",
        "blathnat-founder-durachd",
        "gaothaire-1703-durachd"
      ]
    },
    {
      "partnershipId": "marriage-searbhi-1680-scathain--wuirseach-1677-durachd",
      "childIds": [
        "toirche-1700-durachd",
        "quaidin-1704-durachd"
      ]
    },
    {
      "partnershipId": "marriage-grian-1696-torcmhar--yestinan-1691-durachd",
      "childIds": [
        "wuirseach-1714-durachd",
        "lisair-1718-durachd",
        "piaras-1723-durachd"
      ]
    },
    {
      "partnershipId": "marriage-noracha-1700-muirgheal--vaithreach-1695-durachd",
      "childIds": [
        "quilla-1720-durachd"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-gordan-founder-ceallaigh--orlaith-founder-durachd",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-blathnat-founder-durchadh--muiredach-founder-haeghra",
      "targetFamilyId": "haus-haeghra",
      "houseId": "house-haeghra"
    },
    {
      "partnershipId": "marriage-dubessa-1583-durachd--finlay-1582-fiorghra",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-fionaach-1607-durchadh--seamus-1607-haeghra",
      "targetFamilyId": "haus-haeghra",
      "houseId": "house-haeghra"
    },
    {
      "partnershipId": "marriage-blathnaid-1614-durachd--sinclair-1615-ness",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-diarmaid-1633-diuid--iolanda-1634-durachd",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-blathnat-1653-durachd--faithleach-1649-muirgheal",
      "targetFamilyId": "haus-muirgheal",
      "houseId": "house-muirgheal"
    },
    {
      "partnershipId": "marriage-graham-1654-ness--muireann-1655-durachd",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-hoiteann-1678-durachd--luibheas-1678-fiorghra",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-dubhan-1674-boyd--reathnaigh-1675-durachd",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-peigi-1696-durachd--vannoch-1692-buadhtreun",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-blathnat-founder-durachd--oistin-1692-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-toirche-1700-durachd--uisdean-1697-borthwick",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "ionnrachtaigh-founder-durachd",
    "proinnsias-founder-durachd",
    "fothradh-founder-durachd",
    "ionnrachtaigh-1580-durachd",
    "muircheartach-1586-durachd",
    "cailte-durachd",
    "fothradh-1608-durachd",
    "muircheartach-1627-durachd",
    "vaithreach-1630-durachd",
    "ionnrachtaigh-1647-durachd",
    "proinnsias-1653-durachd",
    "cailte-1674-durachd",
    "yestinan-1691-durachd"
  ],
  "titles": {
    "ionnrachtaigh-founder-durachd": "Historisches Oberhaupt",
    "proinnsias-founder-durachd": "Historisches Oberhaupt",
    "fothradh-founder-durachd": "Historisches Oberhaupt",
    "ionnrachtaigh-1580-durachd": "Historisches Oberhaupt",
    "muircheartach-1586-durachd": "Historisches Oberhaupt",
    "cailte-durachd": "Historisches Oberhaupt",
    "fothradh-1608-durachd": "Historisches Oberhaupt",
    "muircheartach-1627-durachd": "Historisches Oberhaupt",
    "vaithreach-1630-durachd": "Historisches Oberhaupt",
    "ionnrachtaigh-1647-durachd": "Historisches Oberhaupt",
    "proinnsias-1653-durachd": "Historisches Oberhaupt",
    "cailte-1674-durachd": "Historisches Oberhaupt",
    "yestinan-1691-durachd": "Dun-Tiarna · Oberhaupt seit 1725",
    "koarnach-1704-durachd": "Erbfolge: 1",
    "wuirseach-1714-durachd": "Erbfolge: 2"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Drei serielle Überlieferungslücken. Historischer Sitz und Lehensordnung bleiben erhalten; das bestehende Asyl in Tir na Rann ist eine zusätzliche Zuordnung. Quilla ist das Kind von Vaithreach und Nóracha, deren Todesjahr 1720 in dieser Tabelle konkret belegt ist.",
  "currentHeadId": "yestinan-1691-durachd",
  "heirIds": [
    "koarnach-1704-durachd",
    "wuirseach-1714-durachd"
  ],
  "description": "Tir An Durachd von Culrain ist der Viehzüchter- und Versorgerclan in den südlichen Lowlands von Tir na Faerna. Die Genealogie führt auf Ionnrachtaigh und Blàthnat zurück. Große Herden, Weiden, Vorräte und Handel begründen den Wohlstand des Hauses; bezahlte Waffenknechte und organisierte Aufgebote schützen Besitz und Bewohner. Das älteste Mitglied der Linie übernimmt die Führung. Yestinán steht dem Clan seit 1725 vor. Wohlstand und ausgedehnte Feste prägen seinen Ruf stärker als kriegerischer Ruhm oder strenge Frömmigkeit. Trotz hoher Verluste im Krieg mit Skjaerheim besteht der Clan fort. Die historische Herrschaft Culrain unter Buadhtreun bleibt eingetragen; das bereits belegte Asyl in Tir na Rann wird zusätzlich geführt."
});

export const HOUSE_DURACHD_FAMILY = createFaernaSourceFamily("durachd", SOURCE);
