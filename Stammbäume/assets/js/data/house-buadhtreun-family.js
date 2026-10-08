import { createFaernaSourceFamily } from './faerna-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "zachair-founder-buadhtreun",
    "noracha-unknown-buadhtreun-91-0",
    "lomhan-founder-buadhtreun",
    "orflaith-buadhtreun",
    "joaigh-founder-neill",
    "trahayarn-blaidd",
    "hectan-buadhtreun",
    "noracha-1590-buadhtreun",
    "keara-rochraide",
    "cathmor-1586-dubglais",
    "zachair-1604-buadhtreun",
    "aibhreann-1604-buadhtreun",
    "grainneog-1608-muirgheal",
    "muir-1602-culloch",
    "cathalan-1627-buadhtreun",
    "grainneog-1630-buadhtreun",
    "donncadh-1634-buadhtreun",
    "doireann-1629-lachlann",
    "hamish-1626-urquhart",
    "heilbhic-1635-boyd",
    "wighnach-1650-buadhtreun",
    "haileigh-1656-buadhtreun",
    "kealagh-1657-buadhtreun",
    "macraith-1660-buadhtreun",
    "maeve-1652-dubglais",
    "proinnsias-1653-durachd",
    "uinseann-1655-forsyth",
    "sinead-1662-grodach",
    "gearoid-1670-buadhtreun",
    "jilleen-1674-buadhtreun",
    "diarmait-1676-buadhtreun",
    "dechtire-1680-buadhtreun",
    "lomhan-1682-buadhtreun",
    "peagan-1685-buadhtreun",
    "meabhrog-1674-muirgheal",
    "eadbhard-1673-oglivy",
    "oighreag-1680-eoghainn",
    "ruairidh-1677-urquhart",
    "eilidh-1683-dundas",
    "hiomhar-1681-duff",
    "vannoch-1692-buadhtreun",
    "catania-1695-buadhtreun",
    "hectan-1702-buadhtreun",
    "naodhan-1699-buadhtreun",
    "noracha-1704-buadhtreun",
    "zachair-1703-buadhtreun",
    "scathan-1705-buadhtreun",
    "donncadh-1709-buadhtreun",
    "peigi-1696-durachd",
    "muir-1690-culloch",
    "uachall-1704-boyd",
    "jarlath-1700-drummond",
    "fintan-1700-ness",
    "banan-1714-buadhtreun"
  ],
  "partnershipIds": [
    "marriage-noracha-unknown-buadhtreun-91-0--zachair-founder-buadhtreun",
    "marriage-joaigh-founder-neill--lomhan-founder-buadhtreun",
    "marriage-trahayarn-orflaith-blaidd",
    "marriage-hectan-buadhtreun--keara-rochraide",
    "marriage-cathmor-1586-dubglais--noracha-1590-buadhtreun",
    "marriage-grainneog-1608-muirgheal--zachair-1604-buadhtreun",
    "marriage-aibhreann-1604-buadhtreun--muir-1602-culloch",
    "marriage-cathalan-1627-buadhtreun--doireann-1629-lachlann",
    "marriage-grainneog-1630-buadhtreun--hamish-1626-urquhart",
    "marriage-donncadh-1634-buadhtreun--heilbhic-1635-boyd",
    "marriage-maeve-1652-dubglais--wighnach-1650-buadhtreun",
    "marriage-haileigh-1656-buadhtreun--proinnsias-1653-durachd",
    "marriage-kealagh-1657-buadhtreun--uinseann-1655-forsyth",
    "marriage-macraith-1660-buadhtreun--sinead-1662-grodach",
    "marriage-gearoid-1670-buadhtreun--meabhrog-1674-muirgheal",
    "marriage-eadbhard-1673-oglivy--jilleen-1674-buadhtreun",
    "marriage-diarmait-1676-buadhtreun--oighreag-1680-eoghainn",
    "marriage-dechtire-1680-buadhtreun--ruairidh-1677-urquhart",
    "marriage-eilidh-1683-dundas--lomhan-1682-buadhtreun",
    "marriage-hiomhar-1681-duff--peagan-1685-buadhtreun",
    "marriage-peigi-1696-durachd--vannoch-1692-buadhtreun",
    "marriage-catania-1695-buadhtreun--muir-1690-culloch",
    "marriage-naodhan-1699-buadhtreun--uachall-1704-boyd",
    "marriage-jarlath-1700-drummond--noracha-1704-buadhtreun",
    "marriage-fintan-1700-ness--scathan-1705-buadhtreun"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-noracha-unknown-buadhtreun-91-0--zachair-founder-buadhtreun",
      "childIds": [
        "lomhan-founder-buadhtreun",
        "orflaith-buadhtreun"
      ],
      "timeJumpId": "gap-faerna-buadhtreun-founders"
    },
    {
      "partnershipId": "marriage-joaigh-founder-neill--lomhan-founder-buadhtreun",
      "childIds": [
        "hectan-buadhtreun",
        "noracha-1590-buadhtreun"
      ],
      "timeJumpId": "gap-faerna-buadhtreun-lomhan"
    },
    {
      "partnershipId": "marriage-hectan-buadhtreun--keara-rochraide",
      "childIds": [
        "zachair-1604-buadhtreun",
        "aibhreann-1604-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-grainneog-1608-muirgheal--zachair-1604-buadhtreun",
      "childIds": [
        "cathalan-1627-buadhtreun",
        "grainneog-1630-buadhtreun",
        "donncadh-1634-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-cathalan-1627-buadhtreun--doireann-1629-lachlann",
      "childIds": [
        "wighnach-1650-buadhtreun",
        "haileigh-1656-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-donncadh-1634-buadhtreun--heilbhic-1635-boyd",
      "childIds": [
        "kealagh-1657-buadhtreun",
        "macraith-1660-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-maeve-1652-dubglais--wighnach-1650-buadhtreun",
      "childIds": [
        "gearoid-1670-buadhtreun",
        "jilleen-1674-buadhtreun",
        "diarmait-1676-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-macraith-1660-buadhtreun--sinead-1662-grodach",
      "childIds": [
        "dechtire-1680-buadhtreun",
        "lomhan-1682-buadhtreun",
        "peagan-1685-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-gearoid-1670-buadhtreun--meabhrog-1674-muirgheal",
      "childIds": [
        "vannoch-1692-buadhtreun",
        "catania-1695-buadhtreun",
        "hectan-1702-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-diarmait-1676-buadhtreun--oighreag-1680-eoghainn",
      "childIds": [
        "naodhan-1699-buadhtreun",
        "noracha-1704-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-eilidh-1683-dundas--lomhan-1682-buadhtreun",
      "childIds": [
        "zachair-1703-buadhtreun",
        "scathan-1705-buadhtreun",
        "donncadh-1709-buadhtreun"
      ]
    },
    {
      "partnershipId": "marriage-peigi-1696-durachd--vannoch-1692-buadhtreun",
      "childIds": [
        "banan-1714-buadhtreun"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-trahayarn-orflaith-blaidd",
      "targetFamilyId": "haus-blaidd",
      "houseId": "house-blaidd"
    },
    {
      "partnershipId": "marriage-cathmor-1586-dubglais--noracha-1590-buadhtreun",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-aibhreann-1604-buadhtreun--muir-1602-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-grainneog-1630-buadhtreun--hamish-1626-urquhart",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-haileigh-1656-buadhtreun--proinnsias-1653-durachd",
      "targetFamilyId": "haus-durachd",
      "houseId": "house-durachd"
    },
    {
      "partnershipId": "marriage-kealagh-1657-buadhtreun--uinseann-1655-forsyth",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-eadbhard-1673-oglivy--jilleen-1674-buadhtreun",
      "targetFamilyId": "haus-oglivy",
      "houseId": "house-oglivy"
    },
    {
      "partnershipId": "marriage-dechtire-1680-buadhtreun--ruairidh-1677-urquhart",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-hiomhar-1681-duff--peagan-1685-buadhtreun",
      "targetFamilyId": "haus-duff",
      "houseId": "house-duff"
    },
    {
      "partnershipId": "marriage-catania-1695-buadhtreun--muir-1690-culloch",
      "targetFamilyId": "haus-culloch",
      "houseId": "house-culloch"
    },
    {
      "partnershipId": "marriage-naodhan-1699-buadhtreun--uachall-1704-boyd",
      "targetFamilyId": "haus-boyd",
      "houseId": "house-boyd"
    },
    {
      "partnershipId": "marriage-jarlath-1700-drummond--noracha-1704-buadhtreun",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-fintan-1700-ness--scathan-1705-buadhtreun",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "zachair-founder-buadhtreun",
    "lomhan-founder-buadhtreun",
    "hectan-buadhtreun",
    "zachair-1604-buadhtreun",
    "donncadh-1634-buadhtreun",
    "wighnach-1650-buadhtreun",
    "diarmait-1676-buadhtreun",
    "hectan-1702-buadhtreun"
  ],
  "titles": {
    "zachair-founder-buadhtreun": "Historisches Oberhaupt",
    "lomhan-founder-buadhtreun": "Historisches Oberhaupt",
    "hectan-buadhtreun": "Historisches Oberhaupt",
    "zachair-1604-buadhtreun": "Historisches Oberhaupt",
    "donncadh-1634-buadhtreun": "Historisches Oberhaupt",
    "wighnach-1650-buadhtreun": "Historisches Oberhaupt",
    "diarmait-1676-buadhtreun": "Historisches Oberhaupt",
    "hectan-1702-buadhtreun": "Letzter belegter Mor-Tiarna · 1720–1721"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken; der Bochdew-Hinweis an der ersten Lücke benennt keine konkrete Elternschaft. Kriegsverluste werden nur nach Personenbelegen erfasst. Verheiratete Überlebende bleiben lebend; der letzte belegte Mor-Tiarna Hectan starb 1721.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Ard Buadhtreun von Beinnstir führt historisch Tir na Faerna. Gründer Zachair, der Rote Krieger, erhielt die Herrschaft nach dem Sieg über einen Ogerherrn. Der Clan steht für Mut, Jagd und ungestüme Kampfkraft; seine leicht gerüsteten Riada tragen Trophäen und beherrschen verschiedenste Waffen. Ein Fianna beurteilt die Nachfolge nach Zweikämpfen der Anwärter. Das Motto lautet: „Wer hier Ärger sucht, hat ihn gefunden!“ Im Krieg mit Skjaerheim wurde das Haus um 1720 beinahe vernichtet. Hectan, sein letzter belegter Mor-Tiarna, starb 1721. Catania, Nóracha und Scáthán leben in angeheirateten Linien fort. Die alte Herrschaft mit Durachd und Muirgheal als Vasallen bleibt Grundlage des Registers."
});

export const HOUSE_BUADHTREUN_FAMILY = createFaernaSourceFamily("buadhtreun", SOURCE);
