import { withFaelaornSourceCounterUpgrade } from './faelaorn-source-counter-upgrade.js';
import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "goraidh-founder-ronain",
    "caitriona-unknown-ronain-94-0",
    "artair-founder-ronain",
    "doileag-founder-ronain",
    "eireann-founder-abhrach",
    "fergus-founder-duilb",
    "caitriona-founder-ronain",
    "cailte-founder-ronain",
    "diarmadas-founder-ronain",
    "ossian-founder-urquhart",
    "meadhbh-founder-laga",
    "nighean-unknown-ronain-118-2",
    "muireall-founder-ronain",
    "fergusin-founder-ronain",
    "lucasach-founder-ronain",
    "ruadhan-founder-durthacht",
    "lassarina-founder-magach",
    "earca-unknown-ronain-130-2",
    "caius-founder-ronain",
    "goraidh-founder-ronain-younger",
    "brideag-founder-roth",
    "moiraith-founder-cetchathach",
    "caiden-ronain",
    "simag-founder-gairner",
    "raonaid-founder-rochraide",
    "maeve-founder-suiste",
    "feamainn-1582-ronain",
    "artair-1582-ronain",
    "connla-1578-ui-faill-duibhne",
    "aisling-1583-duilb",
    "goraidh-1600-ronain",
    "feidlim-ronain",
    "goll-1604-ronain",
    "doileag-1606-ronain",
    "beathag-1603-urquhart",
    "oisin-1599-cumhail",
    "lioslaith-1610-cetchathach",
    "yachthar-1604-gairner",
    "fergusin-1621-ronain",
    "cael-1629-ronain",
    "ciara-1626-morna",
    "damhnait-1632-magach",
    "goraidh-1646-ronain",
    "caitriona-1651-ronain",
    "muireall-1651-ronain",
    "naoiseag-1654-ronain",
    "duibhseach-1650-laga",
    "ualang-1648-suiste",
    "lucasach-1645-eala",
    "katreen-1656-nessa",
    "cael-1670-ronain",
    "donna-ronain",
    "tearlag-1676-ronain",
    "traolach-ronain",
    "morag-1677-ronain",
    "cadence-1676-chulainn",
    "griflet-1672-pysgod",
    "domhnall-1678-roth",
    "envor-varangr",
    "raghnallan-1672-cethrenn",
    "caius-1692-ronain",
    "caiden-1693-ronain",
    "cailte-1694-ronain",
    "feidlim-1695-ronain",
    "fionnog-1697-ronain",
    "brogan-1700-ronain",
    "goirtin-1703-ronain",
    "liobhan-1696-eala",
    "nansaidhas-1697-gairner",
    "fabienne-1695-morna",
    "slaughan-1693-suiste",
    "polain-1700-nessa",
    "liusaidh-1705-haeghra",
    "amany-unknown-ronain-222-3",
    "annag-1715-ronain",
    "una-1717-ronain",
    "sarra-1720-ronain",
    "ide-1718-ronain",
    "artair-1721-ronain",
    "cain-1720-ronain",
    "caitriona-1721-ronain",
    "roislaith-1722-cetchathach",
    "iain-1723-ronain",
    "seumas-1727-ronain",
    "eoin-1725-ronain",
    "fintain-1730-ronain",
    "nagib-1730-ronain"
  ],
  "partnershipIds": [
    "marriage-caitriona-unknown-ronain-94-0--goraidh-founder-ronain",
    "marriage-artair-founder-ronain--eireann-founder-abhrach",
    "marriage-doileag-founder-ronain--fergus-founder-duilb",
    "marriage-caitriona-founder-ronain--ossian-founder-urquhart",
    "marriage-cailte-founder-ronain--meadhbh-founder-laga",
    "marriage-diarmadas-founder-ronain--nighean-unknown-ronain-118-2",
    "marriage-muireall-founder-ronain--ruadhan-founder-durthacht",
    "marriage-fergusin-founder-ronain--lassarina-founder-magach",
    "marriage-earca-unknown-ronain-130-2--lucasach-founder-ronain",
    "marriage-brideag-founder-roth--caius-founder-ronain",
    "engagement-goraidh-founder-ronain-younger--moiraith-founder-cetchathach",
    "marriage-caiden-ronain--raonaid-founder-rochraide",
    "marriage-maeve-founder-suiste--simag-founder-gairner",
    "marriage-connla-1578-ui-faill-duibhne--feamainn-1582-ronain",
    "marriage-aisling-1583-duilb--artair-1582-ronain",
    "marriage-beathag-1603-urquhart--goraidh-1600-ronain",
    "marriage-oisin-feidlim",
    "marriage-goll-1604-ronain--lioslaith-1610-cetchathach",
    "marriage-doileag-1606-ronain--yachthar-1604-gairner",
    "marriage-ciara-1626-morna--fergusin-1621-ronain",
    "marriage-cael-1629-ronain--damhnait-1632-magach",
    "marriage-duibhseach-1650-laga--goraidh-1646-ronain",
    "marriage-caitriona-1651-ronain--ualang-1648-suiste",
    "marriage-lucasach-1645-eala--muireall-1651-ronain",
    "marriage-katreen-1656-nessa--naoiseag-1654-ronain",
    "marriage-cadence-1676-chulainn--cael-1670-ronain",
    "marriage-griflet-donna",
    "marriage-domhnall-1678-roth--tearlag-1676-ronain",
    "marriage-envor-traolach-varangr",
    "marriage-morag-1677-ronain--raghnallan-1672-cethrenn",
    "marriage-caius-1692-ronain--liobhan-1696-eala",
    "marriage-caiden-1693-ronain--nansaidhas-1697-gairner",
    "marriage-cailte-1694-ronain--fabienne-1695-morna",
    "marriage-feidlim-1695-ronain--slaughan-1693-suiste",
    "marriage-fionnog-1697-ronain--polain-1700-nessa",
    "marriage-goirtin-1703-ronain--liusaidh-1705-haeghra",
    "affair-amany-unknown-ronain-222-3--goirtin-1703-ronain"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-caitriona-unknown-ronain-94-0--goraidh-founder-ronain",
      "childIds": [
        "artair-founder-ronain",
        "doileag-founder-ronain"
      ],
      "timeJumpId": "gap-blaithneach-ronain-founders"
    },
    {
      "partnershipId": "marriage-artair-founder-ronain--eireann-founder-abhrach",
      "childIds": [
        "caitriona-founder-ronain",
        "cailte-founder-ronain",
        "diarmadas-founder-ronain"
      ],
      "timeJumpId": "gap-blaithneach-ronain-artair"
    },
    {
      "partnershipId": "marriage-cailte-founder-ronain--meadhbh-founder-laga",
      "childIds": [
        "muireall-founder-ronain",
        "fergusin-founder-ronain",
        "lucasach-founder-ronain"
      ],
      "timeJumpId": "gap-blaithneach-ronain-cailte"
    },
    {
      "partnershipId": "marriage-fergusin-founder-ronain--lassarina-founder-magach",
      "childIds": [
        "caius-founder-ronain",
        "goraidh-founder-ronain-younger"
      ],
      "timeJumpId": "gap-blaithneach-ronain-fergusin"
    },
    {
      "partnershipId": "marriage-brideag-founder-roth--caius-founder-ronain",
      "childIds": [
        "caiden-ronain"
      ]
    },
    {
      "partnershipId": "engagement-goraidh-founder-ronain-younger--moiraith-founder-cetchathach",
      "childIds": [
        "simag-founder-gairner"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-caiden-ronain--raonaid-founder-rochraide",
      "childIds": [
        "feamainn-1582-ronain",
        "artair-1582-ronain"
      ],
      "timeJumpId": "gap-blaithneach-ronain-caiden"
    },
    {
      "partnershipId": "marriage-aisling-1583-duilb--artair-1582-ronain",
      "childIds": [
        "goraidh-1600-ronain",
        "feidlim-ronain",
        "goll-1604-ronain",
        "doileag-1606-ronain"
      ]
    },
    {
      "partnershipId": "marriage-beathag-1603-urquhart--goraidh-1600-ronain",
      "childIds": [
        "fergusin-1621-ronain"
      ]
    },
    {
      "partnershipId": "marriage-goll-1604-ronain--lioslaith-1610-cetchathach",
      "childIds": [
        "cael-1629-ronain"
      ]
    },
    {
      "partnershipId": "marriage-ciara-1626-morna--fergusin-1621-ronain",
      "childIds": [
        "goraidh-1646-ronain",
        "caitriona-1651-ronain"
      ]
    },
    {
      "partnershipId": "marriage-cael-1629-ronain--damhnait-1632-magach",
      "childIds": [
        "muireall-1651-ronain",
        "naoiseag-1654-ronain"
      ]
    },
    {
      "partnershipId": "marriage-duibhseach-1650-laga--goraidh-1646-ronain",
      "childIds": [
        "cael-1670-ronain",
        "donna-ronain",
        "tearlag-1676-ronain"
      ]
    },
    {
      "partnershipId": "marriage-katreen-1656-nessa--naoiseag-1654-ronain",
      "childIds": [
        "traolach-ronain",
        "morag-1677-ronain"
      ]
    },
    {
      "partnershipId": "marriage-cadence-1676-chulainn--cael-1670-ronain",
      "childIds": [
        "caius-1692-ronain",
        "caiden-1693-ronain",
        "cailte-1694-ronain"
      ]
    },
    {
      "partnershipId": "marriage-envor-traolach-varangr",
      "childIds": [
        "feidlim-1695-ronain",
        "fionnog-1697-ronain",
        "brogan-1700-ronain",
        "goirtin-1703-ronain"
      ]
    },
    {
      "partnershipId": "marriage-caius-1692-ronain--liobhan-1696-eala",
      "childIds": [
        "annag-1715-ronain",
        "una-1717-ronain",
        "sarra-1720-ronain"
      ]
    },
    {
      "partnershipId": "marriage-caiden-1693-ronain--nansaidhas-1697-gairner",
      "childIds": [
        "ide-1718-ronain",
        "artair-1721-ronain"
      ]
    },
    {
      "partnershipId": "marriage-cailte-1694-ronain--fabienne-1695-morna",
      "childIds": [
        "cain-1720-ronain",
        "caitriona-1721-ronain"
      ]
    },
    {
      "partnershipId": "marriage-fionnog-1697-ronain--polain-1700-nessa",
      "childIds": [
        "iain-1723-ronain",
        "seumas-1727-ronain"
      ]
    },
    {
      "partnershipId": "marriage-goirtin-1703-ronain--liusaidh-1705-haeghra",
      "childIds": [
        "eoin-1725-ronain",
        "fintain-1730-ronain"
      ]
    },
    {
      "partnershipId": "affair-amany-unknown-ronain-222-3--goirtin-1703-ronain",
      "childIds": [
        "nagib-1730-ronain"
      ],
      "legitimacy": "illegitimate"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-doileag-founder-ronain--fergus-founder-duilb",
      "targetFamilyId": "haus-duilb",
      "houseId": "house-duilb"
    },
    {
      "partnershipId": "marriage-caitriona-founder-ronain--ossian-founder-urquhart",
      "targetFamilyId": "haus-urquhart",
      "houseId": "house-urquhart"
    },
    {
      "partnershipId": "marriage-muireall-founder-ronain--ruadhan-founder-durthacht",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-connla-1578-ui-faill-duibhne--feamainn-1582-ronain",
      "targetFamilyId": "haus-ui-faill-duibhne",
      "houseId": "house-ui-faill-duibhne"
    },
    {
      "partnershipId": "marriage-oisin-feidlim",
      "targetFamilyId": "haus-mac-ard-cumhaill",
      "houseId": "house-cumhail"
    },
    {
      "partnershipId": "marriage-doileag-1606-ronain--yachthar-1604-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-caitriona-1651-ronain--ualang-1648-suiste",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    },
    {
      "partnershipId": "marriage-lucasach-1645-eala--muireall-1651-ronain",
      "targetFamilyId": "haus-eala",
      "houseId": "house-eala"
    },
    {
      "partnershipId": "marriage-griflet-donna",
      "targetFamilyId": "haus-pysgod",
      "houseId": "house-pysgod"
    },
    {
      "partnershipId": "marriage-domhnall-1678-roth--tearlag-1676-ronain",
      "targetFamilyId": "haus-roth",
      "houseId": "house-roth"
    },
    {
      "partnershipId": "marriage-morag-1677-ronain--raghnallan-1672-cethrenn",
      "targetFamilyId": "haus-cethrenn",
      "houseId": "house-cethrenn"
    },
    {
      "partnershipId": "marriage-feidlim-1695-ronain--slaughan-1693-suiste",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-diarmadas-founder-ronain--nighean-unknown-ronain-118-2",
      "targetFamilyId": "haus-suiste"
    },
    {
      "partnershipId": "marriage-earca-unknown-ronain-130-2--lucasach-founder-ronain",
      "targetFamilyId": "haus-eala"
    },
    {
      "partnershipId": "marriage-maeve-founder-suiste--simag-founder-gairner",
      "targetFamilyId": "haus-gairner"
    }
  ],
  "wards": [
    {
      "personId": "artair-1721-ronain",
      "targetFamilyId": "haus-laga",
      "houseId": "house-laga",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "roislaith-1722-cetchathach",
      "parentId": "cailte-1694-ronain"
    }
  ],
  "heads": [
    "goraidh-founder-ronain",
    "artair-founder-ronain",
    "cailte-founder-ronain",
    "fergusin-founder-ronain",
    "caius-founder-ronain",
    "caiden-ronain",
    "artair-1582-ronain",
    "goraidh-1600-ronain",
    "fergusin-1621-ronain",
    "goraidh-1646-ronain",
    "cael-1670-ronain",
    "caiden-1693-ronain",
    "cailte-1694-ronain"
  ],
  "titles": {
    "goraidh-founder-ronain": "Historisches Oberhaupt",
    "artair-founder-ronain": "Historisches Oberhaupt",
    "cailte-founder-ronain": "Historisches Oberhaupt",
    "fergusin-founder-ronain": "Historisches Oberhaupt",
    "caius-founder-ronain": "Historisches Oberhaupt",
    "caiden-ronain": "Historisches Oberhaupt",
    "artair-1582-ronain": "Historisches Oberhaupt",
    "goraidh-1600-ronain": "Historisches Oberhaupt",
    "fergusin-1621-ronain": "Historisches Oberhaupt",
    "goraidh-1646-ronain": "Historisches Oberhaupt",
    "cael-1670-ronain": "Historisches Oberhaupt",
    "caiden-1693-ronain": "Historisches Oberhaupt",
    "cailte-1694-ronain": "Fürst von Blaithneach · Fianna",
    "cain-1720-ronain": "Laird · Fürstenerbe",
    "artair-1721-ronain": "Erbfolge: 2",
    "traolach-ronain": "Mor Tiarna von Eorach",
    "fionnog-1697-ronain": "Baron"
  },
  "personRoles": {
    "simag-founder-gairner": "bastard",
    "nagib-1730-ronain": "bastard",
    "amany-unknown-ronain-222-3": "affair",
    "roislaith-1722-cetchathach": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Fünf serielle Überlieferungslücken. Suiste und Eala stammen von Diarmadas und Lùcasach ab. Gáirnér wurde durch Goraidhs unehelichen Sohn Sìmag gegründet; Goraidh und Moiraith waren verlobt. Artair (1721) wurde nach dem Tod seines Vaters Caiden geboren und ist Mündel bei Laga. Ròislaith Cétchathach ist Caíltes aufgenommenes Mündel.",
  "currentHeadId": "cailte-1694-ronain",
  "heirIds": [
    "cain-1720-ronain",
    "artair-1721-ronain"
  ],
  "description": "Mac Ard’Ronain herrscht von Eorach aus über Blaithneach. Aus seiner alten Linie gingen die Kadettenhäuser Suiste, Eala und Gáirnér hervor. Der Krieg gegen Ceitheach kostete Fürst Cael und seine Söhne Caius und Caiden das Leben; danach übernahm der Fianna Caílte die Fürstenwürde. Sein Sohn Cain ist der benannte Erbe. Der nach dem Tod seines Vaters geborene Artair, Caidens Sohn, wächst als Mündel bei Laga auf."
});

export const HOUSE_RONAIN_FAMILY = withFaelaornSourceCounterUpgrade(withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("ronain", SOURCE)));
