import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "liamach-founder-luchdon",
    "laoise-unknown-luchdon-88-0",
    "lorgain-1603-luchdon",
    "lasairfhiona-1608-luchdon",
    "talullaan-1607-fintain",
    "immram-1602-rioga",
    "latharn-1625-luchdon",
    "leagha-1630-luchdon",
    "lughaid-1632-luchdon",
    "warin-1631-suiste",
    "saor-1627-feannag",
    "cliodhnain-unknown-luchdon-110-2",
    "lorcanach-1649-luchdon",
    "luiseach-1652-luchdon",
    "lochin-1655-luchdon",
    "laoise-luchdon",
    "sorcha-1654-ceallaigh",
    "nechtanas-1651-fiachiontach",
    "quira-unknown-luchdon-120-2",
    "ruaidhri-1648-ruitheach",
    "liamach-1673-luchdon",
    "lasairfhiona-1677-luchdon",
    "liobhan-1676-luchdon",
    "labhruinn-1678-luchdon",
    "wriath-1677-feannag",
    "carthann-1674-gaisgh",
    "colmach-1671-coronach",
    "oonaas-1680-uilebheist",
    "latharn-1696-luchdon",
    "leagha-luchdon",
    "lorgain-1698-luchdon",
    "luiseach-1700-luchdon",
    "sorcha-1703-cnogan",
    "jaralt-frisealach",
    "peigi-unknown-luchdon-140-2",
    "yrosan-1694-morgacht",
    "leoid-1722-luchdon",
    "laoise-1725-luchdon",
    "lugh-1724-luchdon",
    "lisair-1728-luchdon"
  ],
  "partnershipIds": [
    "marriage-laoise-unknown-luchdon-88-0--liamach-founder-luchdon",
    "marriage-lorgain-1603-luchdon--talullaan-1607-fintain",
    "marriage-immram-1602-rioga--lasairfhiona-1608-luchdon",
    "marriage-latharn-1625-luchdon--warin-1631-suiste",
    "marriage-leagha-1630-luchdon--saor-1627-feannag",
    "marriage-cliodhnain-unknown-luchdon-110-2--lughaid-1632-luchdon",
    "marriage-lorcanach-1649-luchdon--sorcha-1654-ceallaigh",
    "marriage-luiseach-1652-luchdon--nechtanas-1651-fiachiontach",
    "marriage-lochin-1655-luchdon--quira-unknown-luchdon-120-2",
    "marriage-ruaidhri-laoise-ruitheach",
    "marriage-liamach-1673-luchdon--wriath-1677-feannag",
    "marriage-carthann-1674-gaisgh--lasairfhiona-1677-luchdon",
    "marriage-colmach-1671-coronach--liobhan-1676-luchdon",
    "marriage-labhruinn-1678-luchdon--oonaas-1680-uilebheist",
    "marriage-latharn-1696-luchdon--sorcha-1703-cnogan",
    "marriage-jaralt-leagha",
    "marriage-lorgain-1698-luchdon--peigi-unknown-luchdon-140-2",
    "marriage-luiseach-1700-luchdon--yrosan-1694-morgacht"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-laoise-unknown-luchdon-88-0--liamach-founder-luchdon",
      "childIds": [
        "lorgain-1603-luchdon",
        "lasairfhiona-1608-luchdon"
      ],
      "timeJumpId": "gap-aislearneach-luchdon-founders"
    },
    {
      "partnershipId": "marriage-lorgain-1603-luchdon--talullaan-1607-fintain",
      "childIds": [
        "latharn-1625-luchdon",
        "leagha-1630-luchdon",
        "lughaid-1632-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-latharn-1625-luchdon--warin-1631-suiste",
      "childIds": [
        "lorcanach-1649-luchdon",
        "luiseach-1652-luchdon",
        "lochin-1655-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-cliodhnain-unknown-luchdon-110-2--lughaid-1632-luchdon",
      "childIds": [
        "laoise-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-lorcanach-1649-luchdon--sorcha-1654-ceallaigh",
      "childIds": [
        "liamach-1673-luchdon",
        "lasairfhiona-1677-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-lochin-1655-luchdon--quira-unknown-luchdon-120-2",
      "childIds": [
        "liobhan-1676-luchdon",
        "labhruinn-1678-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-liamach-1673-luchdon--wriath-1677-feannag",
      "childIds": [
        "latharn-1696-luchdon",
        "leagha-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-labhruinn-1678-luchdon--oonaas-1680-uilebheist",
      "childIds": [
        "lorgain-1698-luchdon",
        "luiseach-1700-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-latharn-1696-luchdon--sorcha-1703-cnogan",
      "childIds": [
        "leoid-1722-luchdon",
        "laoise-1725-luchdon"
      ]
    },
    {
      "partnershipId": "marriage-lorgain-1698-luchdon--peigi-unknown-luchdon-140-2",
      "childIds": [
        "lugh-1724-luchdon",
        "lisair-1728-luchdon"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-immram-1602-rioga--lasairfhiona-1608-luchdon",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-leagha-1630-luchdon--saor-1627-feannag",
      "targetFamilyId": "haus-feannag",
      "houseId": "house-feannag"
    },
    {
      "partnershipId": "marriage-luiseach-1652-luchdon--nechtanas-1651-fiachiontach",
      "targetFamilyId": "haus-fiachiontach",
      "houseId": "house-fiachiontach"
    },
    {
      "partnershipId": "marriage-ruaidhri-laoise-ruitheach",
      "targetFamilyId": "haus-ruitheach",
      "houseId": "house-ruitheach"
    },
    {
      "partnershipId": "marriage-carthann-1674-gaisgh--lasairfhiona-1677-luchdon",
      "targetFamilyId": "haus-gaisgh",
      "houseId": "house-gaisgh"
    },
    {
      "partnershipId": "marriage-colmach-1671-coronach--liobhan-1676-luchdon",
      "targetFamilyId": "haus-coronach",
      "houseId": "house-coronach"
    },
    {
      "partnershipId": "marriage-jaralt-leagha",
      "targetFamilyId": "haus-frisealach",
      "houseId": "house-frisealach"
    },
    {
      "partnershipId": "marriage-luiseach-1700-luchdon--yrosan-1694-morgacht",
      "targetFamilyId": "haus-morgacht",
      "houseId": "house-morgacht"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "liamach-founder-luchdon",
    "lorgain-1603-luchdon",
    "latharn-1625-luchdon",
    "lorcanach-1649-luchdon",
    "liamach-1673-luchdon"
  ],
  "titles": {
    "liamach-founder-luchdon": "Historisches Oberhaupt",
    "lorgain-1603-luchdon": "Historisches Oberhaupt",
    "latharn-1625-luchdon": "Historisches Oberhaupt",
    "lorcanach-1649-luchdon": "Historisches Oberhaupt",
    "liamach-1673-luchdon": "Laird von Broch an Creig",
    "latharn-1696-luchdon": "Erbfolge: 1",
    "leoid-1722-luchdon": "Erbfolge: 2",
    "laoise-1725-luchdon": "Erbfolge: 3"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Nutzerfestlegung: Broch an Creig. Yrosán ist nach Morgacht-Gegenquelle zugeordnet. Jahreszahlen der Herrschaftsfolge sind nicht mit Geburtsjahren gleichzusetzen. Nutzerkorrektur 07.10.2026: Sitz Broch an Creig nach Laird-Tabelle.",
  "currentHeadId": "liamach-1673-luchdon",
  "heirIds": [
    "latharn-1696-luchdon",
    "leoid-1722-luchdon",
    "laoise-1725-luchdon"
  ],
  "description": "Na’Luchdon sitzt in Broch an Creig. Als Gründer gilt Liamach der Kleine, dessen Geschick und Tapferkeit ihm trotz des Spotts über seine geringe Körpergröße die Anerkennung der Ceallaigh einbrachten. Heute führt ein späterer Liamach den Clan. Das erstgeborene Kind erbt unabhängig vom Geschlecht; Latharn, Leòid und Laoise stehen in der benannten Nachfolge."
});

export const HOUSE_LUCHDON_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("luchdon", SOURCE));
