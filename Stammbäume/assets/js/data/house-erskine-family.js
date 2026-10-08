import { createBraighSourceFamily } from './braigh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "fothradh-founder-erskine",
    "jorna-unknown-erskine-88-0",
    "naomhan-1581-erskine",
    "dechtire-1585-erskine",
    "morven-1583-culloch",
    "donnacha-1581-borthwick",
    "laisren-1602-erskine",
    "jorna-1605-erskine",
    "finghin-1609-erskine",
    "beileag-1606-cadhla",
    "pailtear-1602-cleirigh",
    "xardha-1611-barrex",
    "fothradh-1626-erskine",
    "caireann-1630-erskine",
    "hiudai-1630-erskine",
    "nabhi-1628-suilgeach",
    "taran-1628-culloch",
    "loinneog-1634-grannd",
    "naomhan-1646-erskine",
    "julbhach-1648-erskine",
    "uidhir-1652-erskine",
    "polan-1652-erskine",
    "veilleann-1655-erskine",
    "loinneog-1648-boyd",
    "hamish-1648-bhaird",
    "oilean-1655-lachlann",
    "eimhin-1656-reannachain",
    "keir-1655-fiorghra",
    "ylorcan-1667-erskine",
    "talulah-erskine",
    "oisean-1677-erskine",
    "uaine-erskine",
    "judan-1674-erskine",
    "tuanait-1672-farraigeach",
    "uther-drewi",
    "findguala-1680-teudorga",
    "cynfarch-tiwna",
    "yilleach-1678-boyd",
    "laisren-1693-erskine",
    "brigid-1697-erskine",
    "fothradh-1700-erskine",
    "morven-1699-erskine",
    "hiudai-1702-erskine",
    "finghin-1698-erskine",
    "katreen-1702-erskine",
    "kenna-1695-culloch",
    "eideard-1701-borthwick",
    "joaigh-1705-barrex",
    "neassa-1703-cairbre",
    "garrick-1696-grannd",
    "neart-1718-erskine",
    "jorna-1723-erskine",
    "iosan-1723-cadhla",
    "naomhan-1722-erskine",
    "ylorcan-1726-erskine",
    "fainne-1726-erskine",
    "uidhir-1728-erskine",
    "iobu-1731-erskine",
    "polan-1725-erskine"
  ],
  "partnershipIds": [
    "marriage-fothradh-founder-erskine--jorna-unknown-erskine-88-0",
    "marriage-morven-1583-culloch--naomhan-1581-erskine",
    "marriage-dechtire-1585-erskine--donnacha-1581-borthwick",
    "marriage-beileag-1606-cadhla--laisren-1602-erskine",
    "marriage-jorna-1605-erskine--pailtear-1602-cleirigh",
    "marriage-finghin-1609-erskine--xardha-1611-barrex",
    "marriage-fothradh-1626-erskine--nabhi-1628-suilgeach",
    "marriage-caireann-1630-erskine--taran-1628-culloch",
    "marriage-hiudai-1630-erskine--loinneog-1634-grannd",
    "marriage-loinneog-1648-boyd--naomhan-1646-erskine",
    "marriage-hamish-1648-bhaird--julbhach-1648-erskine",
    "marriage-oilean-1655-lachlann--uidhir-1652-erskine",
    "marriage-eimhin-1656-reannachain--polan-1652-erskine",
    "marriage-keir-1655-fiorghra--veilleann-1655-erskine",
    "marriage-tuanait-1672-farraigeach--ylorcan-1667-erskine",
    "marriage-talulah-erskine--uther-drewi",
    "marriage-findguala-1680-teudorga--oisean-1677-erskine",
    "marriage-cynfarch-uaine-tiwna",
    "marriage-judan-1674-erskine--yilleach-1678-boyd",
    "marriage-kenna-1695-culloch--laisren-1693-erskine",
    "marriage-eideard-1701-borthwick--fothradh-1700-erskine",
    "marriage-hiudai-1702-erskine--joaigh-1705-barrex",
    "marriage-finghin-1698-erskine--neassa-1703-cairbre",
    "marriage-garrick-1696-grannd--katreen-1702-erskine"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-fothradh-founder-erskine--jorna-unknown-erskine-88-0",
      "childIds": [
        "naomhan-1581-erskine",
        "dechtire-1585-erskine"
      ],
      "timeJumpId": "gap-braigh-erskine-founders"
    },
    {
      "partnershipId": "marriage-morven-1583-culloch--naomhan-1581-erskine",
      "childIds": [
        "laisren-1602-erskine",
        "jorna-1605-erskine",
        "finghin-1609-erskine"
      ]
    },
    {
      "partnershipId": "marriage-beileag-1606-cadhla--laisren-1602-erskine",
      "childIds": [
        "fothradh-1626-erskine",
        "caireann-1630-erskine"
      ]
    },
    {
      "partnershipId": "marriage-finghin-1609-erskine--xardha-1611-barrex",
      "childIds": [
        "hiudai-1630-erskine"
      ]
    },
    {
      "partnershipId": "marriage-fothradh-1626-erskine--nabhi-1628-suilgeach",
      "childIds": [
        "naomhan-1646-erskine",
        "julbhach-1648-erskine",
        "uidhir-1652-erskine"
      ]
    },
    {
      "partnershipId": "marriage-hiudai-1630-erskine--loinneog-1634-grannd",
      "childIds": [
        "polan-1652-erskine",
        "veilleann-1655-erskine"
      ]
    },
    {
      "partnershipId": "marriage-loinneog-1648-boyd--naomhan-1646-erskine",
      "childIds": [
        "ylorcan-1667-erskine",
        "talulah-erskine"
      ]
    },
    {
      "partnershipId": "marriage-oilean-1655-lachlann--uidhir-1652-erskine",
      "childIds": [
        "oisean-1677-erskine",
        "uaine-erskine"
      ]
    },
    {
      "partnershipId": "marriage-eimhin-1656-reannachain--polan-1652-erskine",
      "childIds": [
        "judan-1674-erskine"
      ]
    },
    {
      "partnershipId": "marriage-tuanait-1672-farraigeach--ylorcan-1667-erskine",
      "childIds": [
        "laisren-1693-erskine",
        "brigid-1697-erskine",
        "fothradh-1700-erskine"
      ]
    },
    {
      "partnershipId": "marriage-findguala-1680-teudorga--oisean-1677-erskine",
      "childIds": [
        "morven-1699-erskine",
        "hiudai-1702-erskine"
      ]
    },
    {
      "partnershipId": "marriage-judan-1674-erskine--yilleach-1678-boyd",
      "childIds": [
        "finghin-1698-erskine",
        "katreen-1702-erskine"
      ]
    },
    {
      "partnershipId": "marriage-kenna-1695-culloch--laisren-1693-erskine",
      "childIds": [
        "neart-1718-erskine",
        "jorna-1723-erskine"
      ]
    },
    {
      "partnershipId": "marriage-eideard-1701-borthwick--fothradh-1700-erskine",
      "childIds": [
        "naomhan-1722-erskine",
        "ylorcan-1726-erskine"
      ]
    },
    {
      "partnershipId": "marriage-hiudai-1702-erskine--joaigh-1705-barrex",
      "childIds": [
        "fainne-1726-erskine",
        "uidhir-1728-erskine",
        "iobu-1731-erskine"
      ]
    },
    {
      "partnershipId": "marriage-finghin-1698-erskine--neassa-1703-cairbre",
      "childIds": [
        "polan-1725-erskine"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-dechtire-1585-erskine--donnacha-1581-borthwick",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-jorna-1605-erskine--pailtear-1602-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-caireann-1630-erskine--taran-1628-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-hamish-1648-bhaird--julbhach-1648-erskine",
      "targetFamilyId": "haus-bhaird",
      "houseId": "house-bhaird"
    },
    {
      "partnershipId": "marriage-keir-1655-fiorghra--veilleann-1655-erskine",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-talulah-erskine--uther-drewi",
      "targetFamilyId": "haus-drewi",
      "houseId": "house-drewi"
    },
    {
      "partnershipId": "marriage-cynfarch-uaine-tiwna",
      "targetFamilyId": "haus-tiwna",
      "houseId": "house-tiwna"
    },
    {
      "partnershipId": "marriage-garrick-1696-grannd--katreen-1702-erskine",
      "targetFamilyId": "haus-grannd",
      "houseId": "house-grannd"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "iosan-1723-cadhla",
      "parentId": "laisren-1693-erskine"
    }
  ],
  "heads": [
    "fothradh-founder-erskine",
    "naomhan-1581-erskine",
    "fothradh-1626-erskine",
    "ylorcan-1667-erskine"
  ],
  "titles": {
    "fothradh-founder-erskine": "Historisches Oberhaupt",
    "naomhan-1581-erskine": "Historisches Oberhaupt",
    "fothradh-1626-erskine": "Historisches Oberhaupt",
    "ylorcan-1667-erskine": "Dun-Tiarna · Oberhaupt seit 1711"
  },
  "personRoles": {
    "iosan-1723-cadhla": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Íosán Cadhla ist Laisréns Mündel. Eindeutige Gegenehen verbinden Culloch, Borthwick und Grannd; zusätzliche Elternschaften werden aus den wegverheirateten Partnerzeilen nicht erfunden. Die Amtsliste nennt nicht jede biologische Generation als Oberhaupt.",
  "currentHeadId": "ylorcan-1667-erskine",
  "heirIds": [],
  "description": "An Erskine von Garadhain verwaltet die westlichen Inseln von Tír na Braigh als Vasallenhaus der Mac Culloch. Die Genealogie beginnt mit Fothradh und Jórna; Ylorcán führt den Clan seit 1711. Seefahrt, Hafenverwaltung und Handel prägen das Haus, dessen Currach und Airig Schiffe und Küsten sichern. Die Grannd dienen ihm als Laird-Clan auf der äußeren Insel. Nach dem Tod des Oberhaupts wählt die Familie aus dessen Kindern einen Nachfolger; bei minderjährigen Erben führt die Ehefrau die Regentschaft. Ordnung, Weitsicht und maritime Bündnisse bestimmen die Politik. Das Register bewahrt die alten Herrschaften im kriegsgezeichneten Faelaorn."
});

export const HOUSE_ERSKINE_FAMILY = createBraighSourceFamily("erskine", SOURCE);
