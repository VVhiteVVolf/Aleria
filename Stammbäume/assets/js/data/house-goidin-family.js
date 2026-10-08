import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "bairrfhionn-founder-nessa",
    "diorbhail-unknown-nessa-103-1",
    "maoldonaich-1600-goidin",
    "jilbhe-1605-goidin",
    "alasdair-1608-goidin",
    "seonaidan-unknown-goidin-100-0",
    "hiomhar-1602-carnegie",
    "grainneog-1612-marcaigh",
    "malachyin-1675-goidin",
    "duana-1632-goidin",
    "fearghal-1630-goidin",
    "turloughas-1628-nessa",
    "caoimheas-1632-cleirigh",
    "uruisg-1650-goidin",
    "sulach-1652-goidin",
    "amlaibh-goidin",
    "eithne-1650-haeghra",
    "eideard-craobhan",
    "bairrfhionn-1669-goidin",
    "diorbhail-1675-goidin",
    "iomhar-1675-goidin",
    "aisling-1676-goidin",
    "glaodhaich-1673-nessa",
    "praidhri-1672-giolla",
    "gluineach-1670-riangabra",
    "sulach-1696-goidin",
    "duana-goidin",
    "fearghal-1702-goidin",
    "jilbhe-goidin",
    "alasdair-1707-goidin",
    "wairbhin-1700-banlaoch",
    "roderic-aderyn",
    "sorley-airgid",
    "dalara-unknown-goidin-140-3",
    "mathuin-1720-goidin",
    "muna-1723-goidin",
    "donal-1727-goidin",
    "uruisg-1730-goidin",
    "meabh-1734-goidin"
  ],
  "partnershipIds": [
    "marriage-bairrfhionn-founder-nessa--diorbhail-unknown-nessa-103-1",
    "marriage-maoldonaich-1600-goidin--seonaidan-unknown-goidin-100-0",
    "marriage-hiomhar-1602-carnegie--jilbhe-1605-goidin",
    "marriage-alasdair-1608-goidin--grainneog-1612-marcaigh",
    "marriage-duana-1632-goidin--turloughas-1628-nessa",
    "marriage-caoimheas-1632-cleirigh--fearghal-1630-goidin",
    "marriage-eithne-1650-haeghra--uruisg-1650-goidin",
    "marriage-amlaibh-goidin--eideard-craobhan",
    "marriage-bairrfhionn-1669-goidin--glaodhaich-1673-nessa",
    "marriage-diorbhail-1675-goidin--praidhri-1672-giolla",
    "marriage-aisling-1676-goidin--gluineach-1670-riangabra",
    "marriage-sulach-1696-goidin--wairbhin-1700-banlaoch",
    "marriage-roderic-duana",
    "marriage-sorley-jilbhe-airgid",
    "marriage-alasdair-1707-goidin--dalara-unknown-goidin-140-3"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-bairrfhionn-founder-nessa--diorbhail-unknown-nessa-103-1",
      "childIds": [
        "maoldonaich-1600-goidin",
        "jilbhe-1605-goidin",
        "alasdair-1608-goidin"
      ],
      "timeJumpId": "gap-blaithneach-goidin-founders"
    },
    {
      "partnershipId": "marriage-maoldonaich-1600-goidin--seonaidan-unknown-goidin-100-0",
      "childIds": [
        "malachyin-1675-goidin"
      ]
    },
    {
      "partnershipId": "marriage-alasdair-1608-goidin--grainneog-1612-marcaigh",
      "childIds": [
        "duana-1632-goidin",
        "fearghal-1630-goidin"
      ]
    },
    {
      "partnershipId": "marriage-caoimheas-1632-cleirigh--fearghal-1630-goidin",
      "childIds": [
        "uruisg-1650-goidin",
        "sulach-1652-goidin",
        "amlaibh-goidin"
      ]
    },
    {
      "partnershipId": "marriage-eithne-1650-haeghra--uruisg-1650-goidin",
      "childIds": [
        "bairrfhionn-1669-goidin",
        "diorbhail-1675-goidin"
      ]
    },
    {
      "partnershipId": "marriage-amlaibh-goidin--eideard-craobhan",
      "childIds": [
        "iomhar-1675-goidin",
        "aisling-1676-goidin"
      ]
    },
    {
      "partnershipId": "marriage-bairrfhionn-1669-goidin--glaodhaich-1673-nessa",
      "childIds": [
        "sulach-1696-goidin",
        "duana-goidin",
        "fearghal-1702-goidin",
        "jilbhe-goidin",
        "alasdair-1707-goidin"
      ]
    },
    {
      "partnershipId": "marriage-sulach-1696-goidin--wairbhin-1700-banlaoch",
      "childIds": [
        "mathuin-1720-goidin",
        "muna-1723-goidin",
        "donal-1727-goidin"
      ]
    },
    {
      "partnershipId": "marriage-alasdair-1707-goidin--dalara-unknown-goidin-140-3",
      "childIds": [
        "uruisg-1730-goidin",
        "meabh-1734-goidin"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-hiomhar-1602-carnegie--jilbhe-1605-goidin",
      "targetFamilyId": "haus-carnegie",
      "houseId": "house-carnegie"
    },
    {
      "partnershipId": "marriage-duana-1632-goidin--turloughas-1628-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-diorbhail-1675-goidin--praidhri-1672-giolla",
      "targetFamilyId": "haus-giolla",
      "houseId": "house-giolla"
    },
    {
      "partnershipId": "marriage-aisling-1676-goidin--gluineach-1670-riangabra",
      "targetFamilyId": "haus-riangabra",
      "houseId": "house-riangabra"
    },
    {
      "partnershipId": "marriage-roderic-duana",
      "targetFamilyId": "haus-aderyn",
      "houseId": "house-aderyn"
    },
    {
      "partnershipId": "marriage-sorley-jilbhe-airgid",
      "targetFamilyId": "haus-airgid",
      "houseId": "house-airgid"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "bairrfhionn-founder-nessa",
    "alasdair-1608-goidin",
    "fearghal-1630-goidin",
    "uruisg-1650-goidin",
    "bairrfhionn-1669-goidin"
  ],
  "titles": {
    "bairrfhionn-founder-nessa": "Historisches Oberhaupt",
    "alasdair-1608-goidin": "Historisches Oberhaupt",
    "fearghal-1630-goidin": "Historisches Oberhaupt",
    "uruisg-1650-goidin": "Historisches Oberhaupt",
    "bairrfhionn-1669-goidin": "Laird von Sioran · Herold",
    "meabh-1734-goidin": "Von den Weisen bestimmte Erbin",
    "maoldonaich-1600-goidin": "Druide",
    "seonaidan-unknown-goidin-100-0": "Druidin",
    "malachyin-1675-goidin": "Eremit"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Bairrfhionn Nessa begründet Goidin. Eine serielle Überlieferungslücke. Die Druiden bestimmen die Nachfolge; Meabh ist die benannte Erbin. Kopierte Elternüberschriften werden nach Grafik berichtigt: Fearghal–Caoimheas und Amlaibh–Eideard. Súlach (1696) ist in der Tabelle lebend, in der Grafik mit Todeszeichen; das Datum bleibt ungeklärt und die tabellarische Lebensangabe erhalten.",
  "currentHeadId": "bairrfhionn-1669-goidin",
  "heirIds": [
    "meabh-1734-goidin"
  ],
  "description": "Ua’Goidin entstand als Kadettenhaus der Nessa: Bairrfhionn erhielt es für seine Verdienste um Verwaltung und Finanzen des Stammhauses. Der Clan sitzt in Sioran und pflegt eine enge Verbindung zu den Druiden. Seine Nachfolge richtet sich nach deren Empfehlung, der das amtierende Oberhaupt folgen muss. Laird Bairrfhionn dient im Rat des Mor Tiarna; als seine Nachfolgerin wurde die Enkelin Meabh bereits am Tag ihrer Geburt bestimmt."
});

export const HOUSE_GOIDIN_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("goidin", SOURCE));
