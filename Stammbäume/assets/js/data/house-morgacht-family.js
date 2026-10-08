import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "cathalin-1602-morgacht",
    "braoin-unknown-morgacht-88-0",
    "branin-1627-morgacht",
    "aoife-1630-morgacht",
    "breasalan-1635-morgacht",
    "hiolair-unknown-morgacht-98-0",
    "fergus-1626-rioga",
    "ealar-unknown-morgacht-98-2",
    "artair-1650-morgacht",
    "glaodhach-1657-morgacht",
    "iuliana-1655-morgacht",
    "slaine-1653-feannag",
    "lorcanach-1655-coronach",
    "feargal-1652-gaisgh",
    "brianach-1671-morgacht",
    "noracha-1679-morgacht",
    "cathalin-1676-morgacht",
    "etainin-1675-ceallaigh",
    "liamach-1677-morna",
    "bridin-1676-fiachiontach",
    "yrosan-1694-morgacht",
    "hiolair-morgacht",
    "quirjin-1694-morgacht",
    "ealar-morgacht",
    "luiseach-1700-luchdon",
    "aled-arth",
    "beitidh-unknown-morgacht-128-2",
    "koarnach-frisealach",
    "branin-1720-morgacht",
    "braoin-1723-morgacht",
    "aoife-1722-morgacht",
    "artair-1725-morgacht"
  ],
  "partnershipIds": [
    "marriage-braoin-unknown-morgacht-88-0--cathalin-1602-morgacht",
    "marriage-branin-1627-morgacht--hiolair-unknown-morgacht-98-0",
    "marriage-aoife-1630-morgacht--fergus-1626-rioga",
    "marriage-breasalan-1635-morgacht--ealar-unknown-morgacht-98-2",
    "marriage-artair-1650-morgacht--slaine-1653-feannag",
    "marriage-glaodhach-1657-morgacht--lorcanach-1655-coronach",
    "marriage-feargal-1652-gaisgh--iuliana-1655-morgacht",
    "marriage-brianach-1671-morgacht--etainin-1675-ceallaigh",
    "marriage-liamach-1677-morna--noracha-1679-morgacht",
    "marriage-bridin-1676-fiachiontach--cathalin-1676-morgacht",
    "marriage-luiseach-1700-luchdon--yrosan-1694-morgacht",
    "marriage-aled-hiolair",
    "marriage-beitidh-unknown-morgacht-128-2--quirjin-1694-morgacht",
    "marriage-koarnach-ealar"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-braoin-unknown-morgacht-88-0--cathalin-1602-morgacht",
      "childIds": [
        "branin-1627-morgacht",
        "aoife-1630-morgacht",
        "breasalan-1635-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-branin-1627-morgacht--hiolair-unknown-morgacht-98-0",
      "childIds": [
        "artair-1650-morgacht",
        "glaodhach-1657-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-breasalan-1635-morgacht--ealar-unknown-morgacht-98-2",
      "childIds": [
        "iuliana-1655-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-artair-1650-morgacht--slaine-1653-feannag",
      "childIds": [
        "brianach-1671-morgacht",
        "noracha-1679-morgacht",
        "cathalin-1676-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-brianach-1671-morgacht--etainin-1675-ceallaigh",
      "childIds": [
        "yrosan-1694-morgacht",
        "hiolair-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-bridin-1676-fiachiontach--cathalin-1676-morgacht",
      "childIds": [
        "quirjin-1694-morgacht",
        "ealar-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-luiseach-1700-luchdon--yrosan-1694-morgacht",
      "childIds": [
        "branin-1720-morgacht",
        "braoin-1723-morgacht"
      ]
    },
    {
      "partnershipId": "marriage-beitidh-unknown-morgacht-128-2--quirjin-1694-morgacht",
      "childIds": [
        "aoife-1722-morgacht",
        "artair-1725-morgacht"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-aoife-1630-morgacht--fergus-1626-rioga",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-glaodhach-1657-morgacht--lorcanach-1655-coronach",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-feargal-1652-gaisgh--iuliana-1655-morgacht",
      "targetFamilyId": "haus-gaisgh",
      "houseId": "house-gaisgh"
    },
    {
      "partnershipId": "marriage-liamach-1677-morna--noracha-1679-morgacht",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-aled-hiolair",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-koarnach-ealar",
      "targetFamilyId": "haus-frisealach",
      "houseId": "house-frisealach"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "cathalin-1602-morgacht",
    "branin-1627-morgacht",
    "artair-1650-morgacht",
    "brianach-1671-morgacht"
  ],
  "titles": {
    "cathalin-1602-morgacht": "Historisches Oberhaupt",
    "branin-1627-morgacht": "Historisches Oberhaupt",
    "artair-1650-morgacht": "Historisches Oberhaupt",
    "brianach-1671-morgacht": "Laird von Gaelan",
    "yrosan-1694-morgacht": "Erbfolge: 1",
    "branin-1720-morgacht": "Erbfolge: 2",
    "cathalin-1676-morgacht": "Kommandant am Hof der Morna"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Keine Überlieferungslücke in der beschrifteten Grafik. Brianach folgt Artair als Oberhaupt. Verbindungen zu Rioga, Coronach, Gaisgh und Ceallaigh bleiben hausübergreifend dieselben Personen.",
  "currentHeadId": "brianach-1671-morgacht",
  "heirIds": [
    "yrosan-1694-morgacht",
    "branin-1720-morgacht"
  ],
  "description": "Na’Morgacht entstand aus der Freundschaft des Ritters Cathalín mit Fearghal Morna. Cathalín nahm dessen Sohn Brian als Knappen auf und wurde später zum Laird erhoben. Der in Gaelan ansässige Clan wird heute von Brianach geführt. Die benannte männliche Nachfolge führt über Yrosán zu Branín; Cathalín Morgacht dient als Kommandant am Hof der Morna."
});

export const HOUSE_MORGACHT_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("morgacht", SOURCE));
