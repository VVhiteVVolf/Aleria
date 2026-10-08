import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "tomaltach-founder-stwatchn",
    "draighean-unknown-stwatchn-10-3",
    "eanbharr-1585-dundas",
    "eimhear-1590-dundas",
    "aoifeann-1586-dianaomh",
    "sten-1592-oglivy",
    "janneth-1606-dundas",
    "draighean-1609-dundas",
    "wunbhna-1609-stwatchn",
    "murdoch-1604-fiorghra",
    "tomaltach-1629-dundas",
    "oighreag-1633-dundas",
    "feargal-1635-dundas",
    "ceithlenn-1634-gealan",
    "bardan-1630-haig",
    "iosag-1638-cullen",
    "alasdair-dundas",
    "lughna-dundas",
    "eanbharr-1657-dundas",
    "urchrist-laoch",
    "kenehyr-1655-morgant",
    "roisin-1657-luthsach",
    "feargal-1674-dundas",
    "draighean-1678-dundas",
    "veaghan-1678-dundas",
    "eilidh-1683-dundas",
    "etain-1677-airdmhor",
    "maolmorda-1675-lachlann",
    "dairine-1684-boyd",
    "lomhan-1682-buadhtreun",
    "tomaltach-1696-dundas",
    "siofra-1698-dundas",
    "eanbharr-1704-dundas",
    "yanan-1702-dundas",
    "hearnait-1704-dundas",
    "enya-1697-bhaird",
    "whelan-1692-stwatchn",
    "heilbhic-1707-fastaigh",
    "katreen-unknown-dundas-60-8",
    "donndubhan-1700-drummond",
    "iolar-1721-dundas",
    "wunbhna-1725-dundas",
    "cuan-1726-dundas",
    "sile-1730-dundas",
    "nogh-1723-dundas",
    "keela-1728-dundas"
  ],
  "partnershipIds": [
    "marriage-draighean-unknown-stwatchn-10-3--tomaltach-founder-stwatchn",
    "marriage-aoifeann-1586-dianaomh--eanbharr-1585-dundas",
    "marriage-eimhear-1590-dundas--sten-1592-oglivy",
    "marriage-janneth-1606-dundas--wunbhna-1609-stwatchn",
    "marriage-draighean-1609-dundas--murdoch-1604-fiorghra",
    "marriage-ceithlenn-1634-gealan--tomaltach-1629-dundas",
    "marriage-bardan-1630-haig--oighreag-1633-dundas",
    "marriage-feargal-1635-dundas--iosag-1638-cullen",
    "marriage-urchrist-alasdair",
    "marriage-kenehyr-1655-morgant--lughna-dundas",
    "marriage-eanbharr-1657-dundas--roisin-1657-luthsach",
    "marriage-etain-1677-airdmhor--feargal-1674-dundas",
    "marriage-draighean-1678-dundas--maolmorda-1675-lachlann",
    "marriage-dairine-1684-boyd--veaghan-1678-dundas",
    "marriage-eilidh-1683-dundas--lomhan-1682-buadhtreun",
    "marriage-enya-1697-bhaird--tomaltach-1696-dundas",
    "marriage-siofra-1698-dundas--whelan-1692-stwatchn",
    "marriage-eanbharr-1704-dundas--heilbhic-1707-fastaigh",
    "marriage-katreen-unknown-dundas-60-8--yanan-1702-dundas",
    "marriage-donndubhan-1700-drummond--hearnait-1704-dundas"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-draighean-unknown-stwatchn-10-3--tomaltach-founder-stwatchn",
      "childIds": [
        "eanbharr-1585-dundas",
        "eimhear-1590-dundas"
      ],
      "timeJumpId": "gap-faelaorn-dundas-founders"
    },
    {
      "partnershipId": "marriage-aoifeann-1586-dianaomh--eanbharr-1585-dundas",
      "childIds": [
        "janneth-1606-dundas",
        "draighean-1609-dundas"
      ]
    },
    {
      "partnershipId": "marriage-janneth-1606-dundas--wunbhna-1609-stwatchn",
      "childIds": [
        "tomaltach-1629-dundas",
        "oighreag-1633-dundas",
        "feargal-1635-dundas"
      ]
    },
    {
      "partnershipId": "marriage-ceithlenn-1634-gealan--tomaltach-1629-dundas",
      "childIds": [
        "alasdair-dundas",
        "lughna-dundas"
      ]
    },
    {
      "partnershipId": "marriage-feargal-1635-dundas--iosag-1638-cullen",
      "childIds": [
        "eanbharr-1657-dundas"
      ]
    },
    {
      "partnershipId": "marriage-urchrist-alasdair",
      "childIds": [
        "feargal-1674-dundas",
        "draighean-1678-dundas"
      ]
    },
    {
      "partnershipId": "marriage-eanbharr-1657-dundas--roisin-1657-luthsach",
      "childIds": [
        "veaghan-1678-dundas",
        "eilidh-1683-dundas"
      ]
    },
    {
      "partnershipId": "marriage-etain-1677-airdmhor--feargal-1674-dundas",
      "childIds": [
        "tomaltach-1696-dundas",
        "siofra-1698-dundas",
        "eanbharr-1704-dundas"
      ]
    },
    {
      "partnershipId": "marriage-dairine-1684-boyd--veaghan-1678-dundas",
      "childIds": [
        "yanan-1702-dundas",
        "hearnait-1704-dundas"
      ]
    },
    {
      "partnershipId": "marriage-enya-1697-bhaird--tomaltach-1696-dundas",
      "childIds": [
        "iolar-1721-dundas",
        "wunbhna-1725-dundas"
      ]
    },
    {
      "partnershipId": "marriage-eanbharr-1704-dundas--heilbhic-1707-fastaigh",
      "childIds": [
        "cuan-1726-dundas",
        "sile-1730-dundas"
      ]
    },
    {
      "partnershipId": "marriage-katreen-unknown-dundas-60-8--yanan-1702-dundas",
      "childIds": [
        "nogh-1723-dundas",
        "keela-1728-dundas"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-eimhear-1590-dundas--sten-1592-oglivy",
      "targetFamilyId": "haus-oglivy",
      "houseId": "house-oglivy"
    },
    {
      "partnershipId": "marriage-draighean-1609-dundas--murdoch-1604-fiorghra",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-bardan-1630-haig--oighreag-1633-dundas",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-kenehyr-1655-morgant--lughna-dundas",
      "targetFamilyId": "haus-morgant",
      "houseId": "house-morgant"
    },
    {
      "partnershipId": "marriage-draighean-1678-dundas--maolmorda-1675-lachlann",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    },
    {
      "partnershipId": "marriage-eilidh-1683-dundas--lomhan-1682-buadhtreun",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-siofra-1698-dundas--whelan-1692-stwatchn",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-donndubhan-1700-drummond--hearnait-1704-dundas",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Ausschließlich nach der gelieferten Dundas-Grafik, ergänzt um eindeutig gleiche Gegenpersonen. Tomaltach Stwatchn und Draighean begründen die Linie; eine Punktreihe steht für fehlende Zwischengenerationen. Wunbhna, Whelan und Síofra verbinden beide Grafiken; dafür werden dieselben Identitäten verwendet. Katreen besitzt in der Grafik keinen belegten Herkunftsclan.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ó Dundas ist eine aus Tomaltach Stwatchn und Draighean hervorgegangene Linie mit dem alten Laird-Sitz Dun Foirgneamh in Tir na Rann. Nach einer Überlieferungslücke setzt die Grafik mit Eanbharr und Eimhear fort. Ehen mit Stwatchn, Bhaird, Luthsach, Lachlann und Drummond verbinden den Clan mit den übrigen Familien der Region. Ein heutiges Oberhaupt ist nicht ausdrücklich belegt. Krieg und Teilbesetzung Faelaorns werden getrennt von dieser historischen Herrschaftszuordnung geführt.",
  "warriorReference": ""
});

export const HOUSE_DUNDAS_FAMILY = createFaelaornSourceFamily("dundas", SOURCE);
