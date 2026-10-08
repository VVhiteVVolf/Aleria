import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ruairc-founder-diuid",
    "morag-unknown-diuid-103-2",
    "ronanach-founder-lockart",
    "beileag-lockart",
    "ruairnait-founder-ardmhair",
    "denawal-ancient-arth",
    "ruaidhri-founder-lockart",
    "glaodhach-lockart",
    "fidelma-founder-ffearnach",
    "caradoc-line-arth",
    "cathal-1580-lockart",
    "morag-1584-lockart",
    "orla-1583-haig",
    "odran-1581-haig",
    "ruairc-1600-lockart",
    "macha-1602-lockart",
    "ruaidhri-1606-lockart",
    "catania-1608-airdmhor",
    "breccan-1600-diuid",
    "wrantha-1608-wemyss",
    "ronanach-1626-lockart",
    "kumhn-1629-lockart",
    "bonnie-lockart",
    "tadgh-1632-lockart",
    "rhona-1630-haig",
    "reamha-1626-aonghusa",
    "owain-mochdaer",
    "peatharlach-1636-carnegie",
    "fergus-1648-lockart",
    "fidelma-lockart",
    "aodh-1655-lockart",
    "wrath-1658-lockart",
    "aibhne-1650-dianaomh",
    "glewlwyd-dyngwn",
    "catriona-1655-fiorghra",
    "nalainn-1658-banlaoch",
    "ruairc-1668-lockart",
    "orthanach-1670-lockart",
    "fola-1675-lockart",
    "etain-1676-lockart",
    "cathal-lockart",
    "treabha-1672-conochbhair",
    "eimhin-1673-casur",
    "rabhan-founder-haig",
    "adamnan-1672-ness",
    "olwyn-unigol",
    "eochaid-1690-lockart",
    "aigneis-1692-lockart",
    "tadhg-1698-lockart",
    "ronanach-1704-lockart",
    "oistin-1692-lockart",
    "kessog-1694-lockart",
    "ruaidhri-1700-lockart",
    "bruide-1700-lockart",
    "sluagh-1702-lockart",
    "rogaire-1695-diuid",
    "brodie-1686-nuadat",
    "tomhar-1702-ardmhair",
    "blathnat-founder-durachd",
    "fearghas-1688-forsyth",
    "lannraig-founder-clannmhar",
    "iolanda-1701-neill",
    "leogan-1698-eoghainn",
    "fergus-1715-lockart",
    "morag-1720-lockart",
    "brogan-1724-lockart",
    "barra-lockart",
    "oiric-1730-lockart",
    "blaithin-1722-lockart",
    "aodh-1725-lockart",
    "fergal-1720-lockart",
    "ronnat-1723-lockart",
    "earc-1728-lockart",
    "kester-1724-lockart",
    "kelch-1728-lockart",
    "praithi-1731-lockart",
    "meara-1722-lockart",
    "art-1727-lockart"
  ],
  "partnershipIds": [
    "marriage-morag-unknown-diuid-103-2--ruairc-founder-diuid",
    "marriage-ronanach-founder-lockart--ruairnait-founder-ardmhair",
    "marriage-denawal-beileag",
    "marriage-fidelma-founder-ffearnach--ruaidhri-founder-lockart",
    "marriage-caradoc-glaodhach",
    "marriage-cathal-1580-lockart--orla-1583-haig",
    "marriage-morag-1584-lockart--odran-1581-haig",
    "marriage-catania-1608-airdmhor--ruairc-1600-lockart",
    "marriage-breccan-1600-diuid--macha-1602-lockart",
    "marriage-ruaidhri-1606-lockart--wrantha-1608-wemyss",
    "marriage-rhona-1630-haig--ronanach-1626-lockart",
    "marriage-kumhn-1629-lockart--reamha-1626-aonghusa",
    "marriage-owain-bonnie-mochdaer",
    "marriage-peatharlach-1636-carnegie--tadgh-1632-lockart",
    "marriage-aibhne-1650-dianaomh--fergus-1648-lockart",
    "marriage-glewlwyd-fidelma-dyngwn",
    "marriage-aodh-1655-lockart--catriona-1655-fiorghra",
    "marriage-nalainn-1658-banlaoch--wrath-1658-lockart",
    "marriage-ruairc-1668-lockart--treabha-1672-conochbhair",
    "marriage-eimhin-1673-casur--orthanach-1670-lockart",
    "marriage-fola-1675-lockart--rabhan-founder-haig",
    "marriage-adamnan-1672-ness--etain-1676-lockart",
    "marriage-olwyn-cathal-unigol",
    "marriage-eochaid-1690-lockart--rogaire-1695-diuid",
    "marriage-aigneis-1692-lockart--brodie-1686-nuadat",
    "marriage-tadhg-1698-lockart--tomhar-1702-ardmhair",
    "marriage-blathnat-founder-durachd--oistin-1692-lockart",
    "marriage-fearghas-1688-forsyth--kessog-1694-lockart",
    "marriage-lannraig-founder-clannmhar--ruaidhri-1700-lockart",
    "marriage-bruide-1700-lockart--iolanda-1701-neill",
    "marriage-leogan-1698-eoghainn--sluagh-1702-lockart"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-morag-unknown-diuid-103-2--ruairc-founder-diuid",
      "childIds": [
        "ronanach-founder-lockart",
        "beileag-lockart"
      ],
      "timeJumpId": "gap-mathgham-lockart-founders"
    },
    {
      "partnershipId": "marriage-ronanach-founder-lockart--ruairnait-founder-ardmhair",
      "childIds": [
        "ruaidhri-founder-lockart",
        "glaodhach-lockart"
      ],
      "timeJumpId": "gap-mathgham-lockart-ronanach"
    },
    {
      "partnershipId": "marriage-fidelma-founder-ffearnach--ruaidhri-founder-lockart",
      "childIds": [
        "cathal-1580-lockart",
        "morag-1584-lockart"
      ],
      "timeJumpId": "gap-mathgham-lockart-ruaidhri"
    },
    {
      "partnershipId": "marriage-cathal-1580-lockart--orla-1583-haig",
      "childIds": [
        "ruairc-1600-lockart",
        "macha-1602-lockart",
        "ruaidhri-1606-lockart"
      ]
    },
    {
      "partnershipId": "marriage-catania-1608-airdmhor--ruairc-1600-lockart",
      "childIds": [
        "ronanach-1626-lockart",
        "kumhn-1629-lockart"
      ]
    },
    {
      "partnershipId": "marriage-ruaidhri-1606-lockart--wrantha-1608-wemyss",
      "childIds": [
        "bonnie-lockart",
        "tadgh-1632-lockart"
      ]
    },
    {
      "partnershipId": "marriage-rhona-1630-haig--ronanach-1626-lockart",
      "childIds": [
        "fergus-1648-lockart",
        "fidelma-lockart"
      ]
    },
    {
      "partnershipId": "marriage-peatharlach-1636-carnegie--tadgh-1632-lockart",
      "childIds": [
        "aodh-1655-lockart",
        "wrath-1658-lockart"
      ]
    },
    {
      "partnershipId": "marriage-aibhne-1650-dianaomh--fergus-1648-lockart",
      "childIds": [
        "ruairc-1668-lockart",
        "orthanach-1670-lockart",
        "fola-1675-lockart"
      ]
    },
    {
      "partnershipId": "marriage-aodh-1655-lockart--catriona-1655-fiorghra",
      "childIds": [
        "etain-1676-lockart",
        "cathal-lockart"
      ]
    },
    {
      "partnershipId": "marriage-ruairc-1668-lockart--treabha-1672-conochbhair",
      "childIds": [
        "eochaid-1690-lockart",
        "aigneis-1692-lockart",
        "tadhg-1698-lockart",
        "ronanach-1704-lockart"
      ]
    },
    {
      "partnershipId": "marriage-eimhin-1673-casur--orthanach-1670-lockart",
      "childIds": [
        "oistin-1692-lockart",
        "kessog-1694-lockart",
        "ruaidhri-1700-lockart"
      ]
    },
    {
      "partnershipId": "marriage-olwyn-cathal-unigol",
      "childIds": [
        "bruide-1700-lockart",
        "sluagh-1702-lockart"
      ]
    },
    {
      "partnershipId": "marriage-eochaid-1690-lockart--rogaire-1695-diuid",
      "childIds": [
        "fergus-1715-lockart",
        "morag-1720-lockart",
        "brogan-1724-lockart",
        "barra-lockart",
        "oiric-1730-lockart"
      ]
    },
    {
      "partnershipId": "marriage-tadhg-1698-lockart--tomhar-1702-ardmhair",
      "childIds": [
        "blaithin-1722-lockart",
        "aodh-1725-lockart"
      ]
    },
    {
      "partnershipId": "marriage-blathnat-founder-durachd--oistin-1692-lockart",
      "childIds": [
        "fergal-1720-lockart",
        "ronnat-1723-lockart",
        "earc-1728-lockart"
      ]
    },
    {
      "partnershipId": "marriage-lannraig-founder-clannmhar--ruaidhri-1700-lockart",
      "childIds": [
        "kester-1724-lockart",
        "kelch-1728-lockart",
        "praithi-1731-lockart"
      ]
    },
    {
      "partnershipId": "marriage-bruide-1700-lockart--iolanda-1701-neill",
      "childIds": [
        "meara-1722-lockart",
        "art-1727-lockart"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-denawal-beileag",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-caradoc-glaodhach",
      "targetFamilyId": "haus-arth",
      "houseId": "house-arth"
    },
    {
      "partnershipId": "marriage-morag-1584-lockart--odran-1581-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-breccan-1600-diuid--macha-1602-lockart",
      "targetFamilyId": "haus-diuid",
      "houseId": "house-diuid"
    },
    {
      "partnershipId": "marriage-kumhn-1629-lockart--reamha-1626-aonghusa",
      "targetFamilyId": "haus-aonghusa",
      "houseId": "house-aonghusa"
    },
    {
      "partnershipId": "marriage-owain-bonnie-mochdaer",
      "targetFamilyId": "haus-mochdaer-gwyliau",
      "houseId": "house-mochdaer-gwyliau"
    },
    {
      "partnershipId": "marriage-glewlwyd-fidelma-dyngwn",
      "targetFamilyId": "haus-dyngwn",
      "houseId": "house-dyngwn"
    },
    {
      "partnershipId": "marriage-nalainn-1658-banlaoch--wrath-1658-lockart",
      "targetFamilyId": "haus-banlaoch",
      "houseId": "house-banlaoch"
    },
    {
      "partnershipId": "marriage-fola-1675-lockart--rabhan-founder-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-adamnan-1672-ness--etain-1676-lockart",
      "targetFamilyId": "haus-ness",
      "houseId": "house-ness"
    },
    {
      "partnershipId": "marriage-aigneis-1692-lockart--brodie-1686-nuadat",
      "targetFamilyId": "haus-nuadat",
      "houseId": "house-nuadat"
    },
    {
      "partnershipId": "marriage-fearghas-1688-forsyth--kessog-1694-lockart",
      "targetFamilyId": "haus-forsyth",
      "houseId": "house-forsyth"
    },
    {
      "partnershipId": "marriage-leogan-1698-eoghainn--sluagh-1702-lockart",
      "targetFamilyId": "haus-eoghainn",
      "houseId": "house-eoghainn"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "praithi-1731-lockart",
      "targetFamilyId": "haus-lachlann",
      "houseId": "house-lachlann",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "art-1727-lockart",
      "targetFamilyId": "haus-stwatchn",
      "houseId": "house-stwatchn",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "ruairc-founder-diuid",
    "ronanach-founder-lockart",
    "ruaidhri-founder-lockart",
    "cathal-1580-lockart",
    "ruairc-1600-lockart",
    "ronanach-1626-lockart",
    "fergus-1648-lockart",
    "ruairc-1668-lockart"
  ],
  "titles": {
    "ruairc-founder-diuid": "Historisches Oberhaupt",
    "ronanach-founder-lockart": "Historisches Oberhaupt",
    "ruaidhri-founder-lockart": "Historisches Oberhaupt",
    "cathal-1580-lockart": "Historisches Oberhaupt",
    "ruairc-1600-lockart": "Historisches Oberhaupt",
    "ronanach-1626-lockart": "Historisches Oberhaupt",
    "fergus-1648-lockart": "Historisches Oberhaupt",
    "ruairc-1668-lockart": "Dun-Tiarna · Oberhaupt seit 1737",
    "eochaid-1690-lockart": "Erbfolge: 1",
    "fergus-1715-lockart": "Erbfolge: 2",
    "brogan-1724-lockart": "Erbfolge: 3",
    "oiric-1730-lockart": "Erbfolge: 4"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Drei serielle Überlieferungslücken. Die Haig- und Diuid-Gegenpaare bleiben identisch. Práithí und Art bleiben biologische Lockart-Kinder; ihre bereits belegten Vormundschaften bei Lachlann und Stwatchn werden als auswärtige Mündelverweise geführt.",
  "currentHeadId": "ruairc-1668-lockart",
  "heirIds": [
    "eochaid-1690-lockart",
    "fergus-1715-lockart",
    "brogan-1724-lockart",
    "oiric-1730-lockart"
  ],
  "description": "Ó Lockart stammt von Rúairc Diuid und Morag ab. Von Cnosbubh aus sichert der Clan die nördliche Grenze des Landes der Bären mit Patrouillen, Wachposten und befestigten Übergängen. Schild und Speer sowie disziplinierte Verteidigung prägen seine Kriegstradition. Die Haig unterstützen die gehaltene Linie mit Gegenangriffen. Rúairc führt Lockart seit 1737. Das Motto lautet: Wachsam und Unbeugsam. Die alte Herrschaftszuordnung bleibt trotz Krieg und Teilbesetzung Faelaorns bestehen."
});

export const HOUSE_LOCKART_FAMILY = createMathghamSourceFamily("lockart", SOURCE);
