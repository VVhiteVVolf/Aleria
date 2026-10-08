import { createFaernaSourceFamily } from './faerna-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "dubhshlaine-founder-muirgheal",
    "grainneog-unknown-muirgheal-88-0",
    "faithleach-1582-muirgheal",
    "maille-1588-muirgheal",
    "uibhla-1585-cairge",
    "muircheartach-1586-durachd",
    "dubhshlaine-1604-muirgheal",
    "grainneog-1608-muirgheal",
    "tarlachan-1610-muirgheal",
    "mairghread-1608-farraigeach",
    "zachair-1604-buadhtreun",
    "realtin-1613-reannachain",
    "reamonn-1627-muirgheal",
    "oirigh-1634-muirgheal",
    "oirbhealach-1632-muirgheal",
    "searbhi-1634-muirgheal",
    "muireann-1631-muirin",
    "trianach-1631-boyd",
    "jorunn-1636-barrex",
    "diarmait-1634-fiorghra",
    "faithleach-1649-muirgheal",
    "heilbhic-1657-muirgheal",
    "oirbhealach-1655-muirgheal",
    "blathnat-1653-durachd",
    "donal-1655-dobhar",
    "aolbha-1654-dianaomh",
    "dubhshlaine-1671-muirgheal",
    "meabhrog-1674-muirgheal",
    "tarlachan-1676-muirgheal",
    "grainneog-1686-muirgheal",
    "beathag-1675-lasgair",
    "gearoid-1670-buadhtreun",
    "deirdre-unknown-muirgheal-140-2",
    "joriath-1684-boyd",
    "reamonn-1694-muirgheal",
    "vearga-1700-muirgheal",
    "eachaidh-1704-muirgheal",
    "noracha-1700-muirgheal",
    "oirbhealach-1706-muirgheal",
    "keavy-1696-barrex",
    "ultan-1700-dubglais",
    "vaithreach-1695-durachd",
    "tarlach-1715-muirgheal"
  ],
  "partnershipIds": [
    "marriage-dubhshlaine-founder-muirgheal--grainneog-unknown-muirgheal-88-0",
    "marriage-faithleach-1582-muirgheal--uibhla-1585-cairge",
    "marriage-maille-1588-muirgheal--muircheartach-1586-durachd",
    "marriage-dubhshlaine-1604-muirgheal--mairghread-1608-farraigeach",
    "marriage-grainneog-1608-muirgheal--zachair-1604-buadhtreun",
    "marriage-realtin-1613-reannachain--tarlachan-1610-muirgheal",
    "marriage-muireann-1631-muirin--reamonn-1627-muirgheal",
    "marriage-oirigh-1634-muirgheal--trianach-1631-boyd",
    "marriage-jorunn-1636-barrex--oirbhealach-1632-muirgheal",
    "marriage-diarmait-1634-fiorghra--searbhi-1634-muirgheal",
    "marriage-blathnat-1653-durachd--faithleach-1649-muirgheal",
    "marriage-donal-1655-dobhar--heilbhic-1657-muirgheal",
    "marriage-aolbha-1654-dianaomh--oirbhealach-1655-muirgheal",
    "marriage-beathag-1675-lasgair--dubhshlaine-1671-muirgheal",
    "marriage-gearoid-1670-buadhtreun--meabhrog-1674-muirgheal",
    "marriage-deirdre-unknown-muirgheal-140-2--tarlachan-1676-muirgheal",
    "marriage-grainneog-1686-muirgheal--joriath-1684-boyd",
    "marriage-keavy-1696-barrex--reamonn-1694-muirgheal",
    "marriage-ultan-1700-dubglais--vearga-1700-muirgheal",
    "marriage-noracha-1700-muirgheal--vaithreach-1695-durachd"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-dubhshlaine-founder-muirgheal--grainneog-unknown-muirgheal-88-0",
      "childIds": [
        "faithleach-1582-muirgheal",
        "maille-1588-muirgheal"
      ],
      "timeJumpId": "gap-faerna-muirgheal-founders"
    },
    {
      "partnershipId": "marriage-faithleach-1582-muirgheal--uibhla-1585-cairge",
      "childIds": [
        "dubhshlaine-1604-muirgheal",
        "grainneog-1608-muirgheal",
        "tarlachan-1610-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-dubhshlaine-1604-muirgheal--mairghread-1608-farraigeach",
      "childIds": [
        "reamonn-1627-muirgheal",
        "oirigh-1634-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-realtin-1613-reannachain--tarlachan-1610-muirgheal",
      "childIds": [
        "oirbhealach-1632-muirgheal",
        "searbhi-1634-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-muireann-1631-muirin--reamonn-1627-muirgheal",
      "childIds": [
        "faithleach-1649-muirgheal",
        "heilbhic-1657-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-jorunn-1636-barrex--oirbhealach-1632-muirgheal",
      "childIds": [
        "oirbhealach-1655-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-blathnat-1653-durachd--faithleach-1649-muirgheal",
      "childIds": [
        "dubhshlaine-1671-muirgheal",
        "meabhrog-1674-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-aolbha-1654-dianaomh--oirbhealach-1655-muirgheal",
      "childIds": [
        "tarlachan-1676-muirgheal",
        "grainneog-1686-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-beathag-1675-lasgair--dubhshlaine-1671-muirgheal",
      "childIds": [
        "reamonn-1694-muirgheal",
        "vearga-1700-muirgheal",
        "eachaidh-1704-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-deirdre-unknown-muirgheal-140-2--tarlachan-1676-muirgheal",
      "childIds": [
        "noracha-1700-muirgheal",
        "oirbhealach-1706-muirgheal"
      ]
    },
    {
      "partnershipId": "marriage-keavy-1696-barrex--reamonn-1694-muirgheal",
      "childIds": [
        "tarlach-1715-muirgheal"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-maille-1588-muirgheal--muircheartach-1586-durachd",
      "targetFamilyId": "haus-durachd",
      "houseId": "house-durachd"
    },
    {
      "partnershipId": "marriage-grainneog-1608-muirgheal--zachair-1604-buadhtreun",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-oirigh-1634-muirgheal--trianach-1631-boyd",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-diarmait-1634-fiorghra--searbhi-1634-muirgheal",
      "targetFamilyId": "haus-fiorghra",
      "houseId": "house-fiorghra"
    },
    {
      "partnershipId": "marriage-donal-1655-dobhar--heilbhic-1657-muirgheal",
      "targetFamilyId": "haus-dobhar",
      "houseId": "house-dobhar"
    },
    {
      "partnershipId": "marriage-gearoid-1670-buadhtreun--meabhrog-1674-muirgheal",
      "targetFamilyId": "haus-buadhtreun",
      "houseId": "house-buadhtreun"
    },
    {
      "partnershipId": "marriage-grainneog-1686-muirgheal--joriath-1684-boyd",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-ultan-1700-dubglais--vearga-1700-muirgheal",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-noracha-1700-muirgheal--vaithreach-1695-durachd",
      "targetFamilyId": "haus-durachd",
      "houseId": "house-durachd"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "dubhshlaine-founder-muirgheal",
    "faithleach-1582-muirgheal",
    "tarlachan-1610-muirgheal",
    "oirbhealach-1632-muirgheal",
    "faithleach-1649-muirgheal"
  ],
  "titles": {
    "dubhshlaine-founder-muirgheal": "Historisches Oberhaupt",
    "faithleach-1582-muirgheal": "Historisches Oberhaupt",
    "tarlachan-1610-muirgheal": "Historisches Oberhaupt",
    "oirbhealach-1632-muirgheal": "Historisches Oberhaupt",
    "faithleach-1649-muirgheal": "Letzter belegter Dun-Tiarna · 1700–1720"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Die Amtsliste nennt nicht jede biologische Generation. Dun-Tiarna laut Rangtabelle und bestehendem Register; die abweichende Bezeichnung Laird im Erbfolgetext wird nicht übernommen. Letztes belegtes Oberhaupt Fáithleach starb 1720; kein unbelegter Nachfolger.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Tir An Muirgheal von Airdree führt seine Herkunft auf den Seefahrer Dubhshláine zurück. „Aus dem Meer geboren“ beschreibt das Selbstverständnis des Küstenclans: Navigation, Handel und eine starke Flotte tragen seine Macht. Currach, Airig und bewaffnete Seeleute sichern Schiffe und Küsten. Die Nachfolge wird durch eine Umsegelung Faelaorns entschieden, bei der Anwärter die Siegel der Küstenhäuser sammeln; Fianna bezeugen das Ergebnis. Muirenn und Nimue gelten als besondere Patrone. Die Muirgheal dienen den Ard Buadhtreun; Boyd ist ihr eigenes Vasallenhaus. Im Krieg wurde der Clan um 1720 nahezu vernichtet. Fáithleach ist das letzte belegte Oberhaupt. Die alte Herrschaft bleibt im Register erhalten; ein neuer Herrscher ist nicht überliefert."
});

export const HOUSE_MUIRGHEAL_FAMILY = createFaernaSourceFamily("muirgheal", SOURCE);
