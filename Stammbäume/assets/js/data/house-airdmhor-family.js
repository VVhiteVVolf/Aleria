import { createBrannSourceFamily } from './brann-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "faolan-founder-dubglais",
    "catania-founder-airdmhor",
    "noghan-airdmhor",
    "medb-1125-airdmhor",
    "hafren-hebog",
    "rothniam-1118-gealan",
    "torcall-1581-airdmhor",
    "maeve-1584-airdmhor",
    "eimhear-1584-wemyss",
    "cairbre-1579-cerneige",
    "breasal-1606-airdmhor",
    "catania-1608-airdmhor",
    "garvan-1610-airdmhor",
    "liath-1609-dubglais",
    "ruairc-1600-lockart",
    "eilidh-1612-cullen",
    "faolan-1627-airdmhor",
    "macha-1631-airdmhor",
    "cathal-1630-airdmhor",
    "haileigh-1630-rieach",
    "cathbad-1628-cerneige",
    "keebh-1633-haig",
    "noghan-1648-airdmhor",
    "paislie-1653-airdmhor",
    "conall-1653-airdmhor",
    "oirigh-1658-airdmhor",
    "nabhan-1653-conochbhair",
    "wiochan-1651-wemyss",
    "yluach-1658-damona",
    "bardan-1655-dubglais",
    "etain-1677-airdmhor",
    "torcall-1674-airdmhor",
    "eoghan-1678-airdmhor",
    "feargal-1674-dundas",
    "dechtire-1677-ardmhair",
    "nymriel-1681-bhodhrain",
    "faolan-founder-airdmhor",
    "tavish-1704-airdmhor",
    "breasal-1706-airdmhor",
    "garvan-1700-airdmhor",
    "catania-1704-airdmhor",
    "ailis-1698-dianaomh",
    "rory-1699-dubglais",
    "slaine-1701-wemyss",
    "sluaghan-1701-cerneige",
    "cathal-1719-airdmhor",
    "vaelor-1726-dubglais",
    "moirin-1729-dubglais"
  ],
  "partnershipIds": [
    "marriage-catania-founder-airdmhor--faolan-founder-dubglais",
    "marriage-hafren-noghan-hebog",
    "marriage-medb-1125-airdmhor--rothniam-1118-gealan",
    "marriage-eimhear-1584-wemyss--torcall-1581-airdmhor",
    "marriage-cairbre-1579-cerneige--maeve-1584-airdmhor",
    "marriage-breasal-1606-airdmhor--liath-1609-dubglais",
    "marriage-catania-1608-airdmhor--ruairc-1600-lockart",
    "marriage-eilidh-1612-cullen--garvan-1610-airdmhor",
    "marriage-faolan-1627-airdmhor--haileigh-1630-rieach",
    "marriage-cathbad-1628-cerneige--macha-1631-airdmhor",
    "marriage-cathal-1630-airdmhor--keebh-1633-haig",
    "marriage-nabhan-1653-conochbhair--noghan-1648-airdmhor",
    "marriage-paislie-1653-airdmhor--wiochan-1651-wemyss",
    "marriage-conall-1653-airdmhor--yluach-1658-damona",
    "marriage-bardan-1655-dubglais--oirigh-1658-airdmhor",
    "marriage-etain-1677-airdmhor--feargal-1674-dundas",
    "marriage-dechtire-1677-ardmhair--torcall-1674-airdmhor",
    "marriage-eoghan-1678-airdmhor--nymriel-1681-bhodhrain",
    "marriage-ailis-1698-dianaomh--faolan-founder-airdmhor",
    "affair-rory-1699-dubglais--tavish-1704-airdmhor",
    "marriage-garvan-1700-airdmhor--slaine-1701-wemyss",
    "marriage-catania-1704-airdmhor--sluaghan-1701-cerneige"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-catania-founder-airdmhor--faolan-founder-dubglais",
      "childIds": [
        "noghan-airdmhor",
        "medb-1125-airdmhor"
      ],
      "timeJumpId": "gap-brann-airdmhor-founders"
    },
    {
      "partnershipId": "marriage-hafren-noghan-hebog",
      "childIds": [
        "torcall-1581-airdmhor",
        "maeve-1584-airdmhor"
      ],
      "timeJumpId": "gap-brann-airdmhor-noghan"
    },
    {
      "partnershipId": "marriage-eimhear-1584-wemyss--torcall-1581-airdmhor",
      "childIds": [
        "breasal-1606-airdmhor",
        "catania-1608-airdmhor",
        "garvan-1610-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-breasal-1606-airdmhor--liath-1609-dubglais",
      "childIds": [
        "faolan-1627-airdmhor",
        "macha-1631-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-eilidh-1612-cullen--garvan-1610-airdmhor",
      "childIds": [
        "cathal-1630-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-faolan-1627-airdmhor--haileigh-1630-rieach",
      "childIds": [
        "noghan-1648-airdmhor",
        "paislie-1653-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-cathal-1630-airdmhor--keebh-1633-haig",
      "childIds": [
        "conall-1653-airdmhor",
        "oirigh-1658-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-nabhan-1653-conochbhair--noghan-1648-airdmhor",
      "childIds": [
        "etain-1677-airdmhor",
        "torcall-1674-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-conall-1653-airdmhor--yluach-1658-damona",
      "childIds": [
        "eoghan-1678-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-1677-ardmhair--torcall-1674-airdmhor",
      "childIds": [
        "faolan-founder-airdmhor",
        "tavish-1704-airdmhor",
        "breasal-1706-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-eoghan-1678-airdmhor--nymriel-1681-bhodhrain",
      "childIds": [
        "garvan-1700-airdmhor",
        "catania-1704-airdmhor"
      ]
    },
    {
      "partnershipId": "marriage-ailis-1698-dianaomh--faolan-founder-airdmhor",
      "childIds": [
        "cathal-1719-airdmhor"
      ]
    },
    {
      "partnershipId": "affair-rory-1699-dubglais--tavish-1704-airdmhor",
      "childIds": [
        "vaelor-1726-dubglais",
        "moirin-1729-dubglais"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-medb-1125-airdmhor--rothniam-1118-gealan",
      "targetFamilyId": "haus-gealan",
      "houseId": "house-gealan"
    },
    {
      "partnershipId": "marriage-cairbre-1579-cerneige--maeve-1584-airdmhor",
      "targetFamilyId": "haus-cerneige",
      "houseId": "house-cerneige"
    },
    {
      "partnershipId": "marriage-catania-1608-airdmhor--ruairc-1600-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-cathbad-1628-cerneige--macha-1631-airdmhor",
      "targetFamilyId": "haus-cerneige",
      "houseId": "house-cerneige"
    },
    {
      "partnershipId": "marriage-paislie-1653-airdmhor--wiochan-1651-wemyss",
      "targetFamilyId": "haus-wemyss",
      "houseId": "house-wemyss"
    },
    {
      "partnershipId": "marriage-bardan-1655-dubglais--oirigh-1658-airdmhor",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-etain-1677-airdmhor--feargal-1674-dundas",
      "targetFamilyId": "haus-dundas",
      "houseId": "house-dundas"
    },
    {
      "partnershipId": "marriage-garvan-1700-airdmhor--slaine-1701-wemyss",
      "targetFamilyId": "haus-wemyss",
      "houseId": "house-wemyss"
    },
    {
      "partnershipId": "marriage-catania-1704-airdmhor--sluaghan-1701-cerneige",
      "targetFamilyId": "haus-cerneige",
      "houseId": "house-cerneige"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {
    "vaelor-1726-dubglais": "bastard",
    "moirin-1729-dubglais": "bastard",
    "rory-1699-dubglais": "affair"
  },
  "personExtensions": {},
  "sourceNote": "Zwei Überlieferungslücken; die Daten 1118–1125 liegen vor der langen Lücke und werden nicht zu unmittelbarer Elternschaft im 16. Jahrhundert umgedeutet. Tavish und Rory teilen dieselben beiden Kinder wie die Dubglais-Akte. Rothniams Lebensstatus bleibt mangels Todesmarkierung offen.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Dál Airdmhor ist das historische Dun-Tiarna-Haus von Carnascal in Tir na Brann. Seine Stammeltern sind Faolán Dubglais und Catania. Die frühen Vorfahren Noghán und Medb sind vor dem großen Überlieferungssprung datiert; die spätere Stammfolge setzt bei Torcall und Maeve ein. Zahlreiche Verbindungen führen zu Wemyss, Carnegie und Dubglais. Tavish und Rory Dubglais sind die Eltern Vaelors und Móiríns. Carnascal bleibt als alte Herrschaft verzeichnet; der bereits belegte Zufluchtsort Caisteal Gorm wird zusätzlich geführt.",
  "warriorReference": "",
  "unknownDataNote": "Nur die sechs undatierten jüngsten Dubglais-Kinder erhalten ausdrücklich genehmigte redaktionelle Geburtsjahre; übrige fehlende Daten bleiben offen."
});

export const HOUSE_AIRDMHOR_FAMILY = createBrannSourceFamily("airdmhor", SOURCE);
