import { createBraighSourceFamily } from './braigh-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "jarlath-founder-grannd",
    "caireann-unknown-grannd-91-0",
    "tiernan-1582-grannd",
    "tadhaigh-1584-grannd",
    "hoimin-1589-grannd",
    "grainneog-1584-boyd",
    "ionnrachtaigh-1580-durachd",
    "tadhaigh-1590-dobhar",
    "garrick-1605-grannd",
    "hoireabard-1609-grannd",
    "bearnard-1609-grannd",
    "tethra-1608-lasgair",
    "nechtan-1605-borthwick",
    "muirenn-1612-suilgeach",
    "jarlath-1627-grannd",
    "keebh-grannd",
    "gadhra-1630-grannd",
    "loinneog-1634-grannd",
    "ailsa-1627-culloch",
    "eivyonydd-balauric",
    "lirielle-1633-barrex",
    "hiudai-1630-erskine",
    "tiernan-1649-grannd",
    "brighde-1655-grannd",
    "hoimin-1652-grannd",
    "tuarann-1653-cairge",
    "ardan-1653-boyd",
    "elvara-1656-muirin",
    "jarlath-1672-grannd",
    "caireann-1675-grannd",
    "callum-1675-grannd",
    "neala-1676-grannd",
    "ornat-1676-gaoithe",
    "whelan-1675-borthwick",
    "nualain-1677-keravel",
    "tiernan-1674-culloch",
    "garrick-1696-grannd",
    "aoife-grannd",
    "tiernan-1708-grannd",
    "bearnard-1699-grannd",
    "katreen-1702-erskine",
    "grimnir-sturmgeborener",
    "seonaid-1702-farraigeach",
    "svanhild-unknown-grannd-153-3",
    "laeg-1722-grannd",
    "gadhra-1725-grannd",
    "oriain-1728-grannd",
    "isbeil-1722-grannd",
    "banba-1729-grannd",
    "ylva-1724-grannd",
    "yvor-1726-grannd",
    "hrafnkel-1728-grannd",
    "astyr-1731-grannd",
    "runi-1734-grannd"
  ],
  "partnershipIds": [
    "marriage-caireann-unknown-grannd-91-0--jarlath-founder-grannd",
    "marriage-grainneog-1584-boyd--tiernan-1582-grannd",
    "marriage-ionnrachtaigh-1580-durachd--tadhaigh-1584-grannd",
    "marriage-hoimin-1589-grannd--tadhaigh-1590-dobhar",
    "marriage-garrick-1605-grannd--tethra-1608-lasgair",
    "marriage-hoireabard-1609-grannd--nechtan-1605-borthwick",
    "marriage-bearnard-1609-grannd--muirenn-1612-suilgeach",
    "marriage-ailsa-1627-culloch--jarlath-1627-grannd",
    "marriage-eivyonydd-balauric--keebh-grannd",
    "marriage-gadhra-1630-grannd--lirielle-1633-barrex",
    "marriage-hiudai-1630-erskine--loinneog-1634-grannd",
    "marriage-tiernan-1649-grannd--tuarann-1653-cairge",
    "marriage-ardan-1653-boyd--brighde-1655-grannd",
    "marriage-elvara-1656-muirin--hoimin-1652-grannd",
    "marriage-jarlath-1672-grannd--ornat-1676-gaoithe",
    "marriage-caireann-1675-grannd--whelan-1675-borthwick",
    "marriage-callum-1675-grannd--nualain-1677-keravel",
    "marriage-neala-1676-grannd--tiernan-1674-culloch",
    "marriage-garrick-1696-grannd--katreen-1702-erskine",
    "marriage-grimnir-aoife-sturmgeborene",
    "marriage-bearnard-1699-grannd--seonaid-1702-farraigeach",
    "affair-bearnard-1699-grannd--svanhild-unknown-grannd-153-3"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-caireann-unknown-grannd-91-0--jarlath-founder-grannd",
      "childIds": [
        "tiernan-1582-grannd",
        "tadhaigh-1584-grannd",
        "hoimin-1589-grannd"
      ],
      "timeJumpId": "gap-braigh-grannd-founders"
    },
    {
      "partnershipId": "marriage-grainneog-1584-boyd--tiernan-1582-grannd",
      "childIds": [
        "garrick-1605-grannd",
        "hoireabard-1609-grannd"
      ]
    },
    {
      "partnershipId": "marriage-hoimin-1589-grannd--tadhaigh-1590-dobhar",
      "childIds": [
        "bearnard-1609-grannd"
      ]
    },
    {
      "partnershipId": "marriage-garrick-1605-grannd--tethra-1608-lasgair",
      "childIds": [
        "jarlath-1627-grannd",
        "keebh-grannd"
      ]
    },
    {
      "partnershipId": "marriage-bearnard-1609-grannd--muirenn-1612-suilgeach",
      "childIds": [
        "gadhra-1630-grannd",
        "loinneog-1634-grannd"
      ]
    },
    {
      "partnershipId": "marriage-ailsa-1627-culloch--jarlath-1627-grannd",
      "childIds": [
        "tiernan-1649-grannd",
        "brighde-1655-grannd"
      ]
    },
    {
      "partnershipId": "marriage-gadhra-1630-grannd--lirielle-1633-barrex",
      "childIds": [
        "hoimin-1652-grannd"
      ]
    },
    {
      "partnershipId": "marriage-tiernan-1649-grannd--tuarann-1653-cairge",
      "childIds": [
        "jarlath-1672-grannd",
        "caireann-1675-grannd"
      ]
    },
    {
      "partnershipId": "marriage-elvara-1656-muirin--hoimin-1652-grannd",
      "childIds": [
        "callum-1675-grannd",
        "neala-1676-grannd"
      ]
    },
    {
      "partnershipId": "marriage-jarlath-1672-grannd--ornat-1676-gaoithe",
      "childIds": [
        "garrick-1696-grannd",
        "aoife-grannd",
        "tiernan-1708-grannd"
      ]
    },
    {
      "partnershipId": "marriage-callum-1675-grannd--nualain-1677-keravel",
      "childIds": [
        "bearnard-1699-grannd"
      ]
    },
    {
      "partnershipId": "marriage-garrick-1696-grannd--katreen-1702-erskine",
      "childIds": [
        "laeg-1722-grannd",
        "gadhra-1725-grannd",
        "oriain-1728-grannd"
      ]
    },
    {
      "partnershipId": "marriage-bearnard-1699-grannd--seonaid-1702-farraigeach",
      "childIds": [
        "isbeil-1722-grannd",
        "banba-1729-grannd"
      ]
    },
    {
      "partnershipId": "affair-bearnard-1699-grannd--svanhild-unknown-grannd-153-3",
      "childIds": [
        "ylva-1724-grannd",
        "yvor-1726-grannd",
        "hrafnkel-1728-grannd",
        "astyr-1731-grannd",
        "runi-1734-grannd"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-ionnrachtaigh-1580-durachd--tadhaigh-1584-grannd",
      "targetFamilyId": "haus-durachd",
      "houseId": "house-durachd"
    },
    {
      "partnershipId": "marriage-hoireabard-1609-grannd--nechtan-1605-borthwick",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-eivyonydd-balauric--keebh-grannd",
      "targetFamilyId": "haus-balauric",
      "houseId": "house-balauric"
    },
    {
      "partnershipId": "marriage-hiudai-1630-erskine--loinneog-1634-grannd",
      "targetFamilyId": "haus-erskine",
      "houseId": "house-erskine"
    },
    {
      "partnershipId": "marriage-ardan-1653-boyd--brighde-1655-grannd",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-caireann-1675-grannd--whelan-1675-borthwick",
      "targetFamilyId": "haus-borthwick",
      "houseId": "house-borthwick"
    },
    {
      "partnershipId": "marriage-neala-1676-grannd--tiernan-1674-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-grimnir-aoife-sturmgeborene",
      "targetFamilyId": "haus-sturmgeborene",
      "houseId": "house-sturmgeborene"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "jarlath-founder-grannd",
    "tiernan-1582-grannd",
    "garrick-1605-grannd",
    "jarlath-1627-grannd",
    "tiernan-1649-grannd",
    "jarlath-1672-grannd"
  ],
  "titles": {
    "jarlath-founder-grannd": "Historisches Oberhaupt",
    "tiernan-1582-grannd": "Historisches Oberhaupt",
    "garrick-1605-grannd": "Historisches Oberhaupt",
    "jarlath-1627-grannd": "Historisches Oberhaupt",
    "tiernan-1649-grannd": "Historisches Oberhaupt",
    "jarlath-1672-grannd": "Laird · Oberhaupt seit 1729",
    "garrick-1696-grannd": "Erbfolge: 1",
    "laeg-1722-grannd": "Erbfolge: 2",
    "gadhra-1725-grannd": "Erbfolge: 3",
    "oriain-1728-grannd": "Erbfolge: 4"
  },
  "personRoles": {
    "ylva-1724-grannd": "bastard",
    "yvor-1726-grannd": "bastard",
    "hrafnkel-1728-grannd": "bastard",
    "astyr-1731-grannd": "bastard",
    "runi-1734-grannd": "bastard",
    "svanhild-unknown-grannd-153-3": "affair"
  },
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Bearnárd und Seonaid sind trotz der gegen seinen Willen arrangierten Ehe ein Ehepaar; deren Kinder sind ehelich. Svanhilds fünf Kinder gehören zur Affäre. Seonaids frühere Rolle als Mündel des damaligen Oberhauptes bleibt als Quellenhinweis erhalten; die unbenannte frühere Vormundsperson wird nicht geraten.",
  "currentHeadId": "jarlath-1672-grannd",
  "heirIds": [
    "garrick-1696-grannd",
    "laeg-1722-grannd",
    "gadhra-1725-grannd",
    "oriain-1728-grannd"
  ],
  "description": "Na Grannd von Dun Uisge bewacht die äußere Insel im Nordwesten von Tír na Braigh. Der Clan führt seinen Namen auf den als hart und unbeugsam bekannten Gründer Jarlath zurück. Als Vasallen der Erskine sichern die Grannd Küsten und Seewege mit Wachposten, Signalfeuern und erfahrenen Seekriegern. Handel und Seefahrt gehören ebenso zum Alltag wie Entern und die Verteidigung enger Decks. Jarlath führt das Haus seit 1729. Bis zu einer eigenen bestätigten Regelung erbt nach Verfügung der Fianna das älteste nicht wegverheiratete Kind des Oberhaupts. Pflicht und Verlässlichkeit prägen den kleinen Inselclan; seine historische Zuordnung bleibt trotz des Krieges bestehen."
});

export const HOUSE_GRANND_FAMILY = createBraighSourceFamily("grannd", SOURCE);
