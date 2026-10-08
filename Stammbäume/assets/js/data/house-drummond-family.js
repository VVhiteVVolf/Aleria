import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "maolmorda-1505-ffearnach",
    "meabhrog-1510-laga",
    "meadhbhan-1530-lachlann",
    "maelbrigte-1530-drummond",
    "uathach-unknown-lachlann-101-0",
    "scathach-unknown-drummond-101-1",
    "donndubhan-1558-drummond",
    "eithne-drummond",
    "una-1560-bhaird",
    "bujold-kampfgeborene",
    "maelmorda-1582-drummond",
    "scathach-1585-drummond",
    "meabhrog-1586-lachlann",
    "muirgheas-1582-lachlann",
    "maelbrigte-1605-drummond",
    "fechin-1606-drummond",
    "maolmorda-1610-drummond",
    "eideard-1608-rieach",
    "faithleach-1604-forsyth",
    "varain-unknown-drummond-131-2",
    "donndubhan-1626-drummond",
    "eireann-drummond",
    "feargal-1631-drummond",
    "sadbh-drummond",
    "dairine-1629-clannmhar",
    "eoghair-1628-eldath",
    "uathach-1635-lachlann",
    "gareth-lyfant",
    "maolmorda-1647-drummond",
    "scathach-1650-drummond",
    "caolan-1655-drummond",
    "meabhrog-1649-lachlann",
    "aonghus-1648-stwatchn",
    "haibrhinn-1657-carnegie",
    "maelbrigte-1667-drummond",
    "earcan-1670-drummond",
    "tadgh-1674-drummond",
    "ailbhe-1678-drummond",
    "hoidhre-1678-drummond",
    "ideog-1673-damona",
    "yachna-1676-anbhair",
    "rogaire-1676-haig",
    "kealtan-1678-lachlann",
    "uathach-1678-lachlann",
    "feargal-1694-drummond",
    "aodh-1698-drummond",
    "braoin-1702-drummond",
    "caolan-1704-drummond",
    "piaras-1697-drummond",
    "jarlath-1700-drummond",
    "donndubhan-1700-drummond",
    "aine-drummond",
    "fainne-1698-gealan",
    "brennan-1699-urquhart",
    "noracha-1704-buadhtreun",
    "hearnait-1704-dundas",
    "goronwy-1698-lyfant",
    "oran-1720-drummond",
    "scathach-1722-drummond",
    "blaine-1725-drummond",
    "fintan-1728-drummond",
    "talitha-1728-haig",
    "earc-1723-drummond",
    "mebh-1725-drummond",
    "bran-1727-drummond",
    "vardon-1724-drummond",
    "oira-1728-drummond"
  ],
  "partnershipIds": [
    "marriage-maolmorda-1505-ffearnach--meabhrog-1510-laga",
    "marriage-meadhbhan-1530-lachlann--uathach-unknown-lachlann-101-0",
    "marriage-maelbrigte-1530-drummond--scathach-unknown-drummond-101-1",
    "marriage-donndubhan-1558-drummond--una-1560-bhaird",
    "marriage-bujold-eithne-kampfgeborene",
    "marriage-maelmorda-1582-drummond--meabhrog-1586-lachlann",
    "marriage-muirgheas-1582-lachlann--scathach-1585-drummond",
    "marriage-eideard-1608-rieach--maelbrigte-1605-drummond",
    "marriage-faithleach-1604-forsyth--fechin-1606-drummond",
    "marriage-maolmorda-1610-drummond--varain-unknown-drummond-131-2",
    "marriage-dairine-1629-clannmhar--donndubhan-1626-drummond",
    "marriage-eireann-drummond--eoghair-1628-eldath",
    "marriage-feargal-1631-drummond--uathach-1635-lachlann",
    "marriage-gareth-sadbh-lyfant",
    "marriage-maolmorda-1647-drummond--meabhrog-1649-lachlann",
    "marriage-aonghus-1648-stwatchn--scathach-1650-drummond",
    "marriage-caolan-1655-drummond--haibrhinn-1657-carnegie",
    "marriage-ideog-1673-damona--maelbrigte-1667-drummond",
    "marriage-earcan-1670-drummond--yachna-1676-anbhair",
    "marriage-rogaire-1676-haig--tadgh-1674-drummond",
    "marriage-ailbhe-1678-drummond--kealtan-1678-lachlann",
    "marriage-hoidhre-1678-drummond--uathach-1678-lachlann",
    "marriage-fainne-1698-gealan--feargal-1694-drummond",
    "marriage-braoin-1702-drummond--brennan-1699-urquhart",
    "marriage-jarlath-1700-drummond--noracha-1704-buadhtreun",
    "marriage-donndubhan-1700-drummond--hearnait-1704-dundas",
    "marriage-aine-drummond--goronwy-1698-lyfant"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-maolmorda-1505-ffearnach--meabhrog-1510-laga",
      "childIds": [
        "meadhbhan-1530-lachlann",
        "maelbrigte-1530-drummond"
      ]
    },
    {
      "partnershipId": "marriage-maelbrigte-1530-drummond--scathach-unknown-drummond-101-1",
      "childIds": [
        "donndubhan-1558-drummond",
        "eithne-drummond"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-1558-drummond--una-1560-bhaird",
      "childIds": [
        "maelmorda-1582-drummond",
        "scathach-1585-drummond"
      ]
    },
    {
      "partnershipId": "marriage-maelmorda-1582-drummond--meabhrog-1586-lachlann",
      "childIds": [
        "maelbrigte-1605-drummond",
        "fechin-1606-drummond",
        "maolmorda-1610-drummond"
      ]
    },
    {
      "partnershipId": "marriage-eideard-1608-rieach--maelbrigte-1605-drummond",
      "childIds": [
        "donndubhan-1626-drummond",
        "eireann-drummond"
      ]
    },
    {
      "partnershipId": "marriage-maolmorda-1610-drummond--varain-unknown-drummond-131-2",
      "childIds": [
        "feargal-1631-drummond",
        "sadbh-drummond"
      ]
    },
    {
      "partnershipId": "marriage-dairine-1629-clannmhar--donndubhan-1626-drummond",
      "childIds": [
        "maolmorda-1647-drummond",
        "scathach-1650-drummond"
      ]
    },
    {
      "partnershipId": "marriage-feargal-1631-drummond--uathach-1635-lachlann",
      "childIds": [
        "caolan-1655-drummond"
      ]
    },
    {
      "partnershipId": "marriage-maolmorda-1647-drummond--meabhrog-1649-lachlann",
      "childIds": [
        "maelbrigte-1667-drummond",
        "earcan-1670-drummond",
        "tadgh-1674-drummond"
      ]
    },
    {
      "partnershipId": "marriage-caolan-1655-drummond--haibrhinn-1657-carnegie",
      "childIds": [
        "ailbhe-1678-drummond",
        "hoidhre-1678-drummond"
      ]
    },
    {
      "partnershipId": "marriage-ideog-1673-damona--maelbrigte-1667-drummond",
      "childIds": [
        "feargal-1694-drummond",
        "aodh-1698-drummond",
        "braoin-1702-drummond",
        "caolan-1704-drummond"
      ]
    },
    {
      "partnershipId": "marriage-rogaire-1676-haig--tadgh-1674-drummond",
      "childIds": [
        "piaras-1697-drummond",
        "jarlath-1700-drummond"
      ]
    },
    {
      "partnershipId": "marriage-hoidhre-1678-drummond--uathach-1678-lachlann",
      "childIds": [
        "donndubhan-1700-drummond",
        "aine-drummond"
      ]
    },
    {
      "partnershipId": "marriage-fainne-1698-gealan--feargal-1694-drummond",
      "childIds": [
        "oran-1720-drummond",
        "scathach-1722-drummond",
        "blaine-1725-drummond",
        "fintan-1728-drummond"
      ]
    },
    {
      "partnershipId": "marriage-jarlath-1700-drummond--noracha-1704-buadhtreun",
      "childIds": [
        "earc-1723-drummond",
        "mebh-1725-drummond",
        "bran-1727-drummond"
      ]
    },
    {
      "partnershipId": "marriage-donndubhan-1700-drummond--hearnait-1704-dundas",
      "childIds": [
        "vardon-1724-drummond",
        "oira-1728-drummond"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-bujold-eithne-kampfgeborene",
      "targetFamilyId": "haus-kampfgeborene",
      "houseId": "house-kampfgeborene"
    },
    {
      "partnershipId": "marriage-muirgheas-1582-lachlann--scathach-1585-drummond",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    },
    {
      "partnershipId": "marriage-faithleach-1604-forsyth--fechin-1606-drummond",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-eireann-drummond--eoghair-1628-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-gareth-sadbh-lyfant",
      "targetFamilyId": "haus-lyfant",
      "houseId": "house-lyfant"
    },
    {
      "partnershipId": "marriage-aonghus-1648-stwatchn--scathach-1650-drummond",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-earcan-1670-drummond--yachna-1676-anbhair",
      "targetFamilyId": "haus-anbhair",
      "houseId": "house-anbhair"
    },
    {
      "partnershipId": "marriage-ailbhe-1678-drummond--kealtan-1678-lachlann",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    },
    {
      "partnershipId": "marriage-braoin-1702-drummond--brennan-1699-urquhart",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-aine-drummond--goronwy-1698-lyfant",
      "targetFamilyId": "haus-lyfant",
      "houseId": "house-lyfant"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-meadhbhan-1530-lachlann--uathach-unknown-lachlann-101-0",
      "targetFamilyId": "haus-lachlann"
    }
  ],
  "wards": [],
  "foster": [
    {
      "childId": "talitha-1728-haig",
      "parentId": "feargal-1694-drummond"
    }
  ],
  "heads": [
    "maelbrigte-1530-drummond",
    "donndubhan-1558-drummond",
    "maelmorda-1582-drummond",
    "maelbrigte-1605-drummond",
    "donndubhan-1626-drummond",
    "maolmorda-1647-drummond",
    "maelbrigte-1667-drummond"
  ],
  "titles": {
    "maelbrigte-1530-drummond": "Hausgründer seit 1570",
    "donndubhan-1558-drummond": "Historisches Oberhaupt",
    "maelmorda-1582-drummond": "Historisches Oberhaupt",
    "maelbrigte-1605-drummond": "Historisches Oberhaupt",
    "donndubhan-1626-drummond": "Historisches Oberhaupt",
    "maolmorda-1647-drummond": "Historisches Oberhaupt",
    "maelbrigte-1667-drummond": "Laird · Oberhaupt seit 1726",
    "feargal-1694-drummond": "Erbfolge: 1",
    "oran-1720-drummond": "Erbfolge: 2",
    "fintan-1728-drummond": "Erbfolge: 3"
  },
  "personRoles": {
    "talitha-1728-haig": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Maelbrigte begründet Drummond, sein Zwillingsbruder Meadhbhán Lachlann. Die kopierte Elternüberschrift bei Donndubhán (1626) und Eireann (1631) wird auf das vorhergehende Paar Maelbrigte–Eideard bezogen, nicht auf Donndubhán selbst. Talitha Haig ist Feargals Mündel. Es gibt keine Überlieferungslücke in der datierten Reihe.",
  "currentHeadId": "maelbrigte-1667-drummond",
  "heirIds": [
    "feargal-1694-drummond",
    "oran-1720-drummond",
    "fintan-1728-drummond"
  ],
  "description": "Breac Drummond entstand 1570 unter Maelbrigte Ffearnach aus derselben Teilung wie Lachlann. Das Haus von Dun Grealach bewahrt die schwere, defensive Kriegstradition des früheren Stammclans: Axt und Schild, geschlossene Formationen und standhafte Garnisonen. Trotz der Trennung arbeiten beide Schwesterlinien zusammen und sind durch zahlreiche Ehen verbunden. Maelbrigte führt Drummond seit 1726; Feargal ist sein benannter Erbe. Das Register folgt auch im teilweise besetzten Faelaorn den alten Herrschaften.",
  "founderPartnershipId": "marriage-maelbrigte-1530-drummond--scathach-unknown-drummond-101-1",
  "founderId": "maelbrigte-1530-drummond"
});

export const HOUSE_DRUMMOND_FAMILY = createFaelaornSourceFamily("drummond", SOURCE);
