import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "torcall-founder-diuid",
    "rhona-unknown-diuid-127-1",
    "rabhan-founder-haig",
    "banbhin-haigh",
    "nithin-founder-mata",
    "parzifal-ancient-arth",
    "odran-1581-haig",
    "orla-1583-haig",
    "morag-1584-lockart",
    "cathal-1580-lockart",
    "rioghnan-1603-haig",
    "kermena-1606-haig",
    "sulach-1609-haig",
    "oona-1605-diuid",
    "maelduin-1605-dubglais",
    "kenna-1610-fiorghra",
    "torcall-1625-haig",
    "rhona-1630-haig",
    "bardan-1630-haig",
    "keebh-1633-haig",
    "peagan-1629-mata",
    "ronanach-1626-lockart",
    "oighreag-1633-dundas",
    "cathal-1630-airdmhor",
    "aonghus-1649-haig",
    "jorna-1654-haig",
    "colman-1651-haig",
    "teaganach-1654-anbhair",
    "muirgheas-1652-lachlann",
    "latharna-1654-ness",
    "rabhan-1672-haig",
    "maire-1676-haig",
    "suibhne-1672-haig",
    "rogaire-1676-haig",
    "fola-1675-lockart",
    "conall-1670-diuid",
    "peathgho-1677-banlaoch",
    "tadgh-1674-drummond",
    "sulach-1694-haig",
    "senga-haig",
    "odran-1700-haig",
    "colm-1705-haig",
    "fearghas-1697-haig",
    "faolan-1700-haig",
    "rhona-1705-haig",
    "ideog-1698-luachra",
    "idris-mochdaer",
    "duibhseach-1705-carnegie",
    "dechtire-founder-salaig",
    "unbekannter-unknown-haig-173-1",
    "oran-1718-haig",
    "gobaith-1722-haig",
    "torcall-1729-haig",
    "bardan-1724-haig",
    "talitha-1728-haig",
    "goll-1723-haig",
    "fiadh-1727-haig",
    "peadar-1729-haig",
    "zohair-1722-haig"
  ],
  "partnershipIds": [
    "marriage-rhona-unknown-diuid-127-1--torcall-founder-diuid",
    "marriage-nithin-founder-mata--rabhan-founder-haig",
    "marriage-parzifal-banbhin",
    "marriage-morag-1584-lockart--odran-1581-haig",
    "marriage-cathal-1580-lockart--orla-1583-haig",
    "marriage-oona-1605-diuid--rioghnan-1603-haig",
    "marriage-kermena-1606-haig--maelduin-1605-dubglais",
    "marriage-kenna-1610-fiorghra--sulach-1609-haig",
    "marriage-peagan-1629-mata--torcall-1625-haig",
    "marriage-rhona-1630-haig--ronanach-1626-lockart",
    "marriage-bardan-1630-haig--oighreag-1633-dundas",
    "marriage-cathal-1630-airdmhor--keebh-1633-haig",
    "marriage-aonghus-1649-haig--teaganach-1654-anbhair",
    "marriage-jorna-1654-haig--muirgheas-1652-lachlann",
    "marriage-colman-1651-haig--latharna-1654-ness",
    "marriage-fola-1675-lockart--rabhan-1672-haig",
    "marriage-conall-1670-diuid--maire-1676-haig",
    "marriage-peathgho-1677-banlaoch--suibhne-1672-haig",
    "marriage-rogaire-1676-haig--tadgh-1674-drummond",
    "marriage-ideog-1698-luachra--sulach-1694-haig",
    "marriage-idris-senga-mochdaer",
    "marriage-duibhseach-1705-carnegie--odran-1700-haig",
    "marriage-dechtire-founder-salaig--fearghas-1697-haig",
    "forced-rhona-1705-haig--unbekannter-unknown-haig-173-1"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-rhona-unknown-diuid-127-1--torcall-founder-diuid",
      "childIds": [
        "rabhan-founder-haig",
        "banbhin-haigh"
      ],
      "timeJumpId": "gap-mathgham-haig-founders"
    },
    {
      "partnershipId": "marriage-nithin-founder-mata--rabhan-founder-haig",
      "childIds": [
        "odran-1581-haig",
        "orla-1583-haig"
      ],
      "timeJumpId": "gap-mathgham-haig-rabhan"
    },
    {
      "partnershipId": "marriage-morag-1584-lockart--odran-1581-haig",
      "childIds": [
        "rioghnan-1603-haig",
        "kermena-1606-haig",
        "sulach-1609-haig"
      ]
    },
    {
      "partnershipId": "marriage-oona-1605-diuid--rioghnan-1603-haig",
      "childIds": [
        "torcall-1625-haig",
        "rhona-1630-haig"
      ]
    },
    {
      "partnershipId": "marriage-kenna-1610-fiorghra--sulach-1609-haig",
      "childIds": [
        "bardan-1630-haig",
        "keebh-1633-haig"
      ]
    },
    {
      "partnershipId": "marriage-peagan-1629-mata--torcall-1625-haig",
      "childIds": [
        "aonghus-1649-haig",
        "jorna-1654-haig"
      ]
    },
    {
      "partnershipId": "marriage-bardan-1630-haig--oighreag-1633-dundas",
      "childIds": [
        "colman-1651-haig"
      ]
    },
    {
      "partnershipId": "marriage-aonghus-1649-haig--teaganach-1654-anbhair",
      "childIds": [
        "rabhan-1672-haig",
        "maire-1676-haig"
      ]
    },
    {
      "partnershipId": "marriage-colman-1651-haig--latharna-1654-ness",
      "childIds": [
        "suibhne-1672-haig",
        "rogaire-1676-haig"
      ]
    },
    {
      "partnershipId": "marriage-fola-1675-lockart--rabhan-1672-haig",
      "childIds": [
        "sulach-1694-haig",
        "senga-haig",
        "odran-1700-haig",
        "colm-1705-haig"
      ]
    },
    {
      "partnershipId": "marriage-peathgho-1677-banlaoch--suibhne-1672-haig",
      "childIds": [
        "fearghas-1697-haig",
        "faolan-1700-haig",
        "rhona-1705-haig"
      ]
    },
    {
      "partnershipId": "marriage-ideog-1698-luachra--sulach-1694-haig",
      "childIds": [
        "oran-1718-haig",
        "gobaith-1722-haig",
        "torcall-1729-haig"
      ]
    },
    {
      "partnershipId": "marriage-duibhseach-1705-carnegie--odran-1700-haig",
      "childIds": [
        "bardan-1724-haig",
        "talitha-1728-haig"
      ]
    },
    {
      "partnershipId": "marriage-dechtire-founder-salaig--fearghas-1697-haig",
      "childIds": [
        "goll-1723-haig",
        "fiadh-1727-haig",
        "peadar-1729-haig"
      ]
    },
    {
      "partnershipId": "forced-rhona-1705-haig--unbekannter-unknown-haig-173-1",
      "childIds": [
        "zohair-1722-haig"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-parzifal-banbhin",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-cathal-1580-lockart--orla-1583-haig",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-kermena-1606-haig--maelduin-1605-dubglais",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-rhona-1630-haig--ronanach-1626-lockart",
      "targetFamilyId": "haus-lockart",
      "houseId": "house-lockart"
    },
    {
      "partnershipId": "marriage-cathal-1630-airdmhor--keebh-1633-haig",
      "targetFamilyId": "haus-airdmhor",
      "houseId": "house-airdmhor"
    },
    {
      "partnershipId": "marriage-jorna-1654-haig--muirgheas-1652-lachlann",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann"
    },
    {
      "partnershipId": "marriage-conall-1670-diuid--maire-1676-haig",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-rogaire-1676-haig--tadgh-1674-drummond",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond"
    },
    {
      "partnershipId": "marriage-idris-senga-mochdaer",
      "targetFamilyId": "haus-mochdaer-gwyliau",
      "houseId": "house-mochdaer-gwyliau"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "torcall-1729-haig",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "talitha-1728-haig",
      "targetFamilyId": "haus-drummond",
      "houseId": "house-drummond",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "torcall-founder-diuid",
    "rabhan-founder-haig",
    "odran-1581-haig",
    "rioghnan-1603-haig",
    "torcall-1625-haig",
    "aonghus-1649-haig",
    "rabhan-1672-haig"
  ],
  "titles": {
    "torcall-founder-diuid": "Historisches Oberhaupt",
    "rabhan-founder-haig": "Historisches Oberhaupt",
    "odran-1581-haig": "Historisches Oberhaupt",
    "rioghnan-1603-haig": "Historisches Oberhaupt",
    "torcall-1625-haig": "Historisches Oberhaupt",
    "aonghus-1649-haig": "Historisches Oberhaupt",
    "rabhan-1672-haig": "Laird · Oberhaupt seit 1704",
    "sulach-1694-haig": "Erbfolge: 1",
    "oran-1718-haig": "Erbfolge: 2",
    "torcall-1729-haig": "Erbfolge: 3"
  },
  "personRoles": {
    "zohair-1722-haig": "bastard",
    "unbekannter-unknown-haig-173-1": "forced"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Rhonas unbekannter gewalttätiger Partner ist durch die ausdrückliche Elternschaft Zohairs belegt; die anderen anonymen Verlobtenkarten sind reine Vorlagenreste. Torcall geht als Mündel zu Ness, Talitha zu Drummond. Rabhán (*1672) ist im Bezugsjahr 1740 68 Jahre alt; die erzählerische Altersangabe 66 ist überholt.",
  "currentHeadId": "rabhan-1672-haig",
  "heirIds": [
    "sulach-1694-haig",
    "oran-1718-haig",
    "torcall-1729-haig"
  ],
  "description": "Dál Haig von Tur na Fala führt seinen Ursprung auf Torcall Diuid und Rhona zurück. Der Clan unterstützt die Lockart an der Nordgrenze mit schweren Waffen und entschlossenen Gegenangriffen. Bergsiedlungen, Minen und langjähriger Grenzdienst bestimmen das Leben seiner Angehörigen. Torcalls Bärenfell und die Überlieferung einer seltenen Silvanischen Symbiose gehören zur Hauslegende. Rabhán führt Haig seit 1704. Das Motto lautet: Wucht und Stahl. Die alte Herrschaft gilt auch im Register des teilweise besetzten Faelaorn."
});

export const HOUSE_HAIG_FAMILY = createMathghamSourceFamily("haig", SOURCE);
