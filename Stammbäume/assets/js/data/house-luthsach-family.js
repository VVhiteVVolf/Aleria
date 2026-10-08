import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "liadan-1270-urquhart",
    "lorcan-unknown-urquhart-166-2",
    "gormlaith-1586-luthsach",
    "daire-1589-luthsach",
    "filidh-1586-urquhart",
    "morag-1588-banlaoch",
    "filidh-1614-luthsach",
    "fionnghuala-1614-luthsach",
    "wrantha-1610-arduinna",
    "colgu-1616-muiredaigh",
    "eilidh-1630-luthsach",
    "bairdin-1634-luthsach",
    "fionn-1632-banlaoch",
    "quighleann-1635-agnew",
    "cliona-1655-luthsach",
    "roisin-1657-luthsach",
    "moira-1660-luthsach",
    "liadan-1660-luthsach",
    "flannacan-1654-muiredaigh",
    "eanbharr-1657-dundas",
    "eibhear-1661-bhodhrain",
    "artair-1654-bhaird",
    "gormlaith-1674-luthsach",
    "alannah-1678-luthsach",
    "fionnlagh-1679-luthsach",
    "sorcha-1682-luthsach",
    "lorcan-1676-banlaoch",
    "harailt-1677-stwatchn",
    "maonait-1675-cetchathach",
    "fothadan-1679-gaoithe",
    "ailisande-1696-luthsach",
    "roisin-1699-luthsach",
    "caralyn-1702-luthsach",
    "turlough-1704-luthsach",
    "fionnghuala-1706-luthsach",
    "brennan-1701-luthsach",
    "eilidh-1703-luthsach",
    "dermod-1700-urquhart",
    "seamus-1700-bhaird",
    "ailillan-1706-teudorga",
    "glaodhaich-founder-agnew",
    "riagan-1700-ceolmhior",
    "sadhbh-1718-luthsach",
    "hamish-1722-luthsach",
    "ailis-1725-luthsach",
    "ewan-1728-luthsach",
    "aine-1732-luthsach",
    "moira-1722-luthsach",
    "ramsay-1725-luthsach",
    "una-1729-luthsach",
    "ardith-1721-luthsach",
    "sean-1726-luthsach"
  ],
  "partnershipIds": [
    "marriage-liadan-1270-urquhart--lorcan-unknown-urquhart-166-2",
    "marriage-filidh-1586-urquhart--gormlaith-1586-luthsach",
    "marriage-daire-1589-luthsach--morag-1588-banlaoch",
    "marriage-filidh-1614-luthsach--wrantha-1610-arduinna",
    "marriage-colgu-1616-muiredaigh--fionnghuala-1614-luthsach",
    "marriage-eilidh-1630-luthsach--fionn-1632-banlaoch",
    "marriage-bairdin-1634-luthsach--quighleann-1635-agnew",
    "marriage-cliona-1655-luthsach--flannacan-1654-muiredaigh",
    "marriage-eanbharr-1657-dundas--roisin-1657-luthsach",
    "marriage-eibhear-1661-bhodhrain--moira-1660-luthsach",
    "marriage-artair-1654-bhaird--liadan-1660-luthsach",
    "marriage-gormlaith-1674-luthsach--lorcan-1676-banlaoch",
    "marriage-alannah-1678-luthsach--harailt-1677-stwatchn",
    "marriage-fionnlagh-1679-luthsach--maonait-1675-cetchathach",
    "marriage-fothadan-1679-gaoithe--sorcha-1682-luthsach",
    "marriage-ailisande-1696-luthsach--dermod-1700-urquhart",
    "marriage-caralyn-1702-luthsach--seamus-1700-bhaird",
    "marriage-ailillan-1706-teudorga--fionnghuala-1706-luthsach",
    "marriage-brennan-1701-luthsach--glaodhaich-founder-agnew",
    "marriage-eilidh-1703-luthsach--riagan-1700-ceolmhior"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-liadan-1270-urquhart--lorcan-unknown-urquhart-166-2",
      "childIds": [
        "gormlaith-1586-luthsach",
        "daire-1589-luthsach"
      ],
      "timeJumpId": "gap-faelaorn-luthsach-founders"
    },
    {
      "partnershipId": "marriage-filidh-1586-urquhart--gormlaith-1586-luthsach",
      "childIds": [
        "filidh-1614-luthsach",
        "fionnghuala-1614-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-colgu-1616-muiredaigh--fionnghuala-1614-luthsach",
      "childIds": [
        "eilidh-1630-luthsach",
        "bairdin-1634-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-eilidh-1630-luthsach--fionn-1632-banlaoch",
      "childIds": [
        "cliona-1655-luthsach",
        "roisin-1657-luthsach",
        "moira-1660-luthsach",
        "liadan-1660-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-cliona-1655-luthsach--flannacan-1654-muiredaigh",
      "childIds": [
        "gormlaith-1674-luthsach",
        "alannah-1678-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-eibhear-1661-bhodhrain--moira-1660-luthsach",
      "childIds": [
        "fionnlagh-1679-luthsach",
        "sorcha-1682-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-gormlaith-1674-luthsach--lorcan-1676-banlaoch",
      "childIds": [
        "ailisande-1696-luthsach",
        "roisin-1699-luthsach",
        "caralyn-1702-luthsach",
        "turlough-1704-luthsach",
        "fionnghuala-1706-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-fothadan-1679-gaoithe--sorcha-1682-luthsach",
      "childIds": [
        "brennan-1701-luthsach",
        "eilidh-1703-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-ailisande-1696-luthsach--dermod-1700-urquhart",
      "childIds": [
        "sadhbh-1718-luthsach",
        "hamish-1722-luthsach",
        "ailis-1725-luthsach",
        "ewan-1728-luthsach",
        "aine-1732-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-ailillan-1706-teudorga--fionnghuala-1706-luthsach",
      "childIds": [
        "moira-1722-luthsach",
        "ramsay-1725-luthsach",
        "una-1729-luthsach"
      ]
    },
    {
      "partnershipId": "marriage-eilidh-1703-luthsach--riagan-1700-ceolmhior",
      "childIds": [
        "ardith-1721-luthsach",
        "sean-1726-luthsach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-daire-1589-luthsach--morag-1588-banlaoch",
      "targetFamilyId": "haus-banlaoch",
      "houseId": "house-banlaoch"
    },
    {
      "partnershipId": "marriage-filidh-1614-luthsach--wrantha-1610-arduinna",
      "targetFamilyId": "haus-arduinna",
      "houseId": "house-arduinna"
    },
    {
      "partnershipId": "marriage-bairdin-1634-luthsach--quighleann-1635-agnew",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-eanbharr-1657-dundas--roisin-1657-luthsach",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-artair-1654-bhaird--liadan-1660-luthsach",
      "targetFamilyId": "haus-bhaird",
      "houseId": "house-bhaird"
    },
    {
      "partnershipId": "marriage-alannah-1678-luthsach--harailt-1677-stwatchn",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn"
    },
    {
      "partnershipId": "marriage-fionnlagh-1679-luthsach--maonait-1675-cetchathach",
      "targetFamilyId": "haus-cetchathach",
      "houseId": "house-cetchathach"
    },
    {
      "partnershipId": "marriage-caralyn-1702-luthsach--seamus-1700-bhaird",
      "targetFamilyId": "haus-bhaird",
      "houseId": "house-bhaird"
    },
    {
      "partnershipId": "marriage-brennan-1701-luthsach--glaodhaich-founder-agnew",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "liadan-1270-urquhart",
    "gormlaith-1586-luthsach",
    "cliona-1655-luthsach"
  ],
  "titles": {
    "liadan-1270-urquhart": "Gründerin · Bardenkünstlerin",
    "gormlaith-1586-luthsach": "Historisches Oberhaupt",
    "cliona-1655-luthsach": "Laird · Oberhaupt seit 1720",
    "gormlaith-1674-luthsach": "Erbfolge: 1",
    "ailisande-1696-luthsach": "Erbfolge: 2",
    "sadhbh-1718-luthsach": "Erbfolge: 3",
    "ailis-1725-luthsach": "Erbfolge: 4",
    "aine-1732-luthsach": "Erbfolge: 5"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Die Linie setzt sich ausdrücklich über Gormlaith, Fionnghuala, Eilidh, Clíona und Gormlaith fort; aus dem Geschlecht wird keine andere Nachfolge abgeleitet. Alle zehn benannten Kinder der letzten Generation bleiben erhalten.",
  "currentHeadId": "cliona-1655-luthsach",
  "heirIds": [
    "gormlaith-1674-luthsach",
    "ailisande-1696-luthsach",
    "sadhbh-1718-luthsach",
    "ailis-1725-luthsach",
    "aine-1732-luthsach"
  ],
  "description": "Ó Nic Luthsach geht auf Líadan Urquhart zurück und pflegt die künstlerische Seite der Bardenkunst. Der Clan fördert Musik, Dichtung, Theater und bildende Kunst sowie eine bedeutende Bardenakademie. Seine Linie wird in der Quelle über mehrere Frauen fortgeführt; Clíona führt das Haus seit 1720. Der alte Sitz liegt in Piobarach. Krieg und Teilbesetzung Faelaorns ändern diese historische Registerzuordnung nicht."
});

export const HOUSE_LUTHSACH_FAMILY = createFaelaornSourceFamily("luthsach", SOURCE);
