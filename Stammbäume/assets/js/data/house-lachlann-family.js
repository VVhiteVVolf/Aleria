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
    "magan-1557-lachlann",
    "maille-1560-lachlann",
    "yairbh-1560-clannmhar",
    "taranach-1558-dubglais",
    "muirgheas-1582-lachlann",
    "meabhrog-1586-lachlann",
    "murchadh-1590-lachlann",
    "scathach-1585-drummond",
    "maelmorda-1582-drummond",
    "jiblhe-unknown-lachlann-121-2",
    "maolmorda-1604-lachlann",
    "biorna-lachlann",
    "kealtan-1613-lachlann",
    "saoirse-1608-mata",
    "keallach-1607-eldath",
    "peagan-1616-grodach",
    "meadhbhan-1628-lachlann",
    "doireann-1629-lachlann",
    "greagoir-1634-lachlann",
    "uathach-1635-lachlann",
    "lianan-1630-briccne",
    "cathalan-1627-buadhtreun",
    "kelleigh-1636-treathai",
    "feargal-1631-drummond",
    "meabhrog-1649-lachlann",
    "muirgheas-1652-lachlann",
    "moirin-1658-lachlann",
    "oilean-1655-lachlann",
    "murchadh-1657-lachlann",
    "maolmorda-1647-drummond",
    "jorna-1654-haig",
    "macraith-1657-duff",
    "uidhir-1652-erskine",
    "keitha-1660-borthwick",
    "maolmorda-1675-lachlann",
    "beileag-1677-lachlann",
    "kealtan-1678-lachlann",
    "uathach-1678-lachlann",
    "draighean-1678-dundas",
    "merrion-caerdyn",
    "ailbhe-1678-drummond",
    "hoidhre-1678-drummond",
    "meadhbhan-1696-lachlann",
    "maithnu-1700-lachlann",
    "murchadh-1703-lachlann",
    "faelan-1702-lachlann",
    "uthbhla-1705-lachlann",
    "greagoir-1707-lachlann",
    "uaithe-1699-clannmhar",
    "aine-1704-stwatchn",
    "tomhar-1705-arduinna",
    "conchobhair-1705-urquhart",
    "aileen-unknown-lachlann-179-2",
    "muiris-1720-lachlann",
    "magan-1724-lachlann",
    "mael-1727-lachlann",
    "meabh-1730-lachlann",
    "praithi-1731-lockart",
    "jarnan-1724-lachlann",
    "uath-1728-lachlann",
    "voilche-1729-lachlann",
    "moirin-1733-lachlann",
    "neala-1722-fastaigh"
  ],
  "partnershipIds": [
    "marriage-maolmorda-1505-ffearnach--meabhrog-1510-laga",
    "marriage-meadhbhan-1530-lachlann--uathach-unknown-lachlann-101-0",
    "marriage-maelbrigte-1530-drummond--scathach-unknown-drummond-101-1",
    "marriage-magan-1557-lachlann--yairbh-1560-clannmhar",
    "marriage-maille-1560-lachlann--taranach-1558-dubglais",
    "marriage-muirgheas-1582-lachlann--scathach-1585-drummond",
    "marriage-maelmorda-1582-drummond--meabhrog-1586-lachlann",
    "marriage-jiblhe-unknown-lachlann-121-2--murchadh-1590-lachlann",
    "marriage-maolmorda-1604-lachlann--saoirse-1608-mata",
    "marriage-biorna-lachlann--keallach-1607-eldath",
    "marriage-kealtan-1613-lachlann--peagan-1616-grodach",
    "marriage-lianan-1630-briccne--meadhbhan-1628-lachlann",
    "marriage-cathalan-1627-buadhtreun--doireann-1629-lachlann",
    "marriage-greagoir-1634-lachlann--kelleigh-1636-treathai",
    "marriage-feargal-1631-drummond--uathach-1635-lachlann",
    "marriage-maolmorda-1647-drummond--meabhrog-1649-lachlann",
    "marriage-jorna-1654-haig--muirgheas-1652-lachlann",
    "marriage-macraith-1657-duff--moirin-1658-lachlann",
    "marriage-oilean-1655-lachlann--uidhir-1652-erskine",
    "marriage-keitha-1660-borthwick--murchadh-1657-lachlann",
    "marriage-draighean-1678-dundas--maolmorda-1675-lachlann",
    "marriage-beileag-1677-lachlann--merrion-caerdyn",
    "marriage-ailbhe-1678-drummond--kealtan-1678-lachlann",
    "marriage-hoidhre-1678-drummond--uathach-1678-lachlann",
    "marriage-meadhbhan-1696-lachlann--uaithe-1699-clannmhar",
    "marriage-aine-1704-stwatchn--murchadh-1703-lachlann",
    "marriage-faelan-1702-lachlann--tomhar-1705-arduinna",
    "marriage-conchobhair-1705-urquhart--uthbhla-1705-lachlann",
    "marriage-aileen-unknown-lachlann-179-2--greagoir-1707-lachlann",
    "engagement-muiris-1720-lachlann--neala-1722-fastaigh"
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
      "partnershipId": "marriage-meadhbhan-1530-lachlann--uathach-unknown-lachlann-101-0",
      "childIds": [
        "magan-1557-lachlann",
        "maille-1560-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-magan-1557-lachlann--yairbh-1560-clannmhar",
      "childIds": [
        "muirgheas-1582-lachlann",
        "meabhrog-1586-lachlann",
        "murchadh-1590-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-muirgheas-1582-lachlann--scathach-1585-drummond",
      "childIds": [
        "maolmorda-1604-lachlann",
        "biorna-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-jiblhe-unknown-lachlann-121-2--murchadh-1590-lachlann",
      "childIds": [
        "kealtan-1613-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-maolmorda-1604-lachlann--saoirse-1608-mata",
      "childIds": [
        "meadhbhan-1628-lachlann",
        "doireann-1629-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-kealtan-1613-lachlann--peagan-1616-grodach",
      "childIds": [
        "greagoir-1634-lachlann",
        "uathach-1635-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-lianan-1630-briccne--meadhbhan-1628-lachlann",
      "childIds": [
        "meabhrog-1649-lachlann",
        "muirgheas-1652-lachlann",
        "moirin-1658-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-greagoir-1634-lachlann--kelleigh-1636-treathai",
      "childIds": [
        "oilean-1655-lachlann",
        "murchadh-1657-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-jorna-1654-haig--muirgheas-1652-lachlann",
      "childIds": [
        "maolmorda-1675-lachlann",
        "beileag-1677-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-keitha-1660-borthwick--murchadh-1657-lachlann",
      "childIds": [
        "kealtan-1678-lachlann",
        "uathach-1678-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-draighean-1678-dundas--maolmorda-1675-lachlann",
      "childIds": [
        "meadhbhan-1696-lachlann",
        "maithnu-1700-lachlann",
        "murchadh-1703-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-ailbhe-1678-drummond--kealtan-1678-lachlann",
      "childIds": [
        "faelan-1702-lachlann",
        "uthbhla-1705-lachlann",
        "greagoir-1707-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-meadhbhan-1696-lachlann--uaithe-1699-clannmhar",
      "childIds": [
        "muiris-1720-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-aine-1704-stwatchn--murchadh-1703-lachlann",
      "childIds": [
        "magan-1724-lachlann",
        "mael-1727-lachlann",
        "meabh-1730-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-faelan-1702-lachlann--tomhar-1705-arduinna",
      "childIds": [
        "jarnan-1724-lachlann",
        "uath-1728-lachlann"
      ]
    },
    {
      "partnershipId": "marriage-aileen-unknown-lachlann-179-2--greagoir-1707-lachlann",
      "childIds": [
        "voilche-1729-lachlann",
        "moirin-1733-lachlann"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-maille-1560-lachlann--taranach-1558-dubglais",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-maelmorda-1582-drummond--meabhrog-1586-lachlann",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-biorna-lachlann--keallach-1607-eldath",
      "targetFamilyId": "haus-eldath",
      "houseId": "house-eldath"
    },
    {
      "partnershipId": "marriage-cathalan-1627-buadhtreun--doireann-1629-lachlann",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-feargal-1631-drummond--uathach-1635-lachlann",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-maolmorda-1647-drummond--meabhrog-1649-lachlann",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-macraith-1657-duff--moirin-1658-lachlann",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-oilean-1655-lachlann--uidhir-1652-erskine",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-beileag-1677-lachlann--merrion-caerdyn",
      "targetFamilyId": "haus-caerdyn",
      "houseId": "house-caerdyn"
    },
    {
      "partnershipId": "marriage-hoidhre-1678-drummond--uathach-1678-lachlann",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-conchobhair-1705-urquhart--uthbhla-1705-lachlann",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-maelbrigte-1530-drummond--scathach-unknown-drummond-101-1",
      "targetFamilyId": "haus-drummond"
    }
  ],
  "wards": [],
  "foster": [
    {
      "childId": "praithi-1731-lockart",
      "parentId": "murchadh-1703-lachlann"
    }
  ],
  "heads": [
    "meadhbhan-1530-lachlann",
    "magan-1557-lachlann",
    "muirgheas-1582-lachlann",
    "maolmorda-1604-lachlann",
    "meadhbhan-1628-lachlann",
    "muirgheas-1652-lachlann"
  ],
  "titles": {
    "meadhbhan-1530-lachlann": "Hausgründer seit 1570",
    "magan-1557-lachlann": "Historisches Oberhaupt",
    "muirgheas-1582-lachlann": "Historisches Oberhaupt",
    "maolmorda-1604-lachlann": "Historisches Oberhaupt",
    "meadhbhan-1628-lachlann": "Historisches Oberhaupt",
    "muirgheas-1652-lachlann": "Laird · Oberhaupt seit 1703",
    "maolmorda-1675-lachlann": "Erbfolge: 1",
    "maithnu-1700-lachlann": "Erbfolge: 2",
    "murchadh-1703-lachlann": "Erbfolge: 3"
  },
  "personRoles": {
    "praithi-1731-lockart": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Die beiden Brüder begründen 1570 Lachlann und Drummond nach der Aufspaltung Ffearnachs. Beide Ursprünge und ihre wechselseitigen Ehen bleiben erhalten. Práithí Lockart ist Murchadhs aufgenommenes Mündel; Muiris und Neala Fastaigh sind verlobt.",
  "currentHeadId": "muirgheas-1652-lachlann",
  "heirIds": [
    "maolmorda-1675-lachlann",
    "maithnu-1700-lachlann",
    "murchadh-1703-lachlann"
  ],
  "description": "Breac Lachlann entstand 1570 unter Meadhbhán Ffearnach aus der Teilung des alten Ffearnach-Clans. Von Dun Liath aus pflegt das Haus eine bewegliche Kampfweise mit Speer, Schild und begleitenden Hunden. Wachsamkeit, Patrouillen und die Sicherung von Wegen bestimmen seine Überlieferung. Die verwandten Drummond bilden das Gegenstück mit schwerer Verteidigung; zahlreiche Ehen verbinden beide Linien. Muirgheas führt Lachlann seit 1703. Die alte Herrschaft bleibt trotz des Krieges mit Skjaerheim maßgeblich.",
  "founderPartnershipId": "marriage-meadhbhan-1530-lachlann--uathach-unknown-lachlann-101-0",
  "founderId": "meadhbhan-1530-lachlann"
});

export const HOUSE_LACHLANN_FAMILY = createFaelaornSourceFamily("lachlann", SOURCE);
