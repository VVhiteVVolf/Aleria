import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { withAislearneachSourceCounterUpgrade } from './aislearneach-source-counter-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "maelrubha-founder-magach",
    "samthann-unknown-magach-91-0",
    "lassarina-founder-magach",
    "iainbheag-founder-magach",
    "ite-founder-magach",
    "fergusin-founder-ronain",
    "talamh-founder-luga",
    "kadhghan-founder-nessa",
    "ninnidh-1580-magach",
    "mairin-magach",
    "innogen-1585-cleirigh",
    "asmund-skaal",
    "maelrubha-1603-magach",
    "taran-1606-magach",
    "samthann-1610-magach",
    "ronan-1612-magach",
    "saighir-1614-magach",
    "muirne-1609-luga",
    "conchobhar-1606-nessa",
    "liobhan-1614-eala",
    "iainbheag-1627-magach",
    "bridachach-1630-magach",
    "enda-1632-magach",
    "damhnait-1632-magach",
    "ibar-1635-magach",
    "cinnfhlaith-1630-ceallaigh",
    "colmach-1628-fiachiontach",
    "doileag-1632-wemyss",
    "cael-1629-ronain",
    "aoife-unknown-magach-134-4",
    "finnian-1646-magach",
    "eabha-1650-magach",
    "cet-1650-magach",
    "tigride-1656-magach",
    "uainide-1654-magach",
    "ciaran-1657-magach",
    "inghean-1650-ailella",
    "cillian-1646-durthacht",
    "quilline-1654-eachtrai",
    "gaothaire-1651-cleirigh",
    "peigas-1658-eala",
    "maelrubha-1667-magach",
    "lassarina-1670-magach",
    "saighir-1672-magach",
    "moninne-1677-magach",
    "enda-1677-magach",
    "bridachach-1679-magach",
    "dubessa-1672-haeghra",
    "keitha-1669-luga",
    "luighseach-1675-gairner",
    "gearoidas-1671-eala",
    "quiva-unknown-magach-166-0",
    "quinnan-1675-suiste",
    "ninnidh-1690-magach",
    "tiobraide-1695-magach",
    "talitha-1696-magach",
    "sluagh-1697-magach",
    "samthann-magach",
    "iainbheag-1695-magach",
    "vencha-mac-magach",
    "damhnait-1700-magach",
    "saoithin-1703-magach",
    "neidhe-1695-stwatchn",
    "tomaltach-1689-chulainn",
    "mirin-1693-eachtrai",
    "fergus-1700-nessa",
    "ionnrachtaigh-1692-tuirseach",
    "jilleen-unknown-magach-184-1",
    "peder-helgr",
    "kealtan-1700-durthacht",
    "canna-1717-magach",
    "dallan-1720-magach",
    "gallgo-1723-magach",
    "ite-1726-magach",
    "raithin-gealach",
    "dympna-1721-magach",
    "ibar-1722-magach",
    "uainide-1726-magach",
    "mairin-1729-magach",
    "ciaran-1732-magach",
    "bridelaith-1722-cetchathach"
  ],
  "partnershipIds": [
    "marriage-maelrubha-founder-magach--samthann-unknown-magach-91-0",
    "marriage-fergusin-founder-ronain--lassarina-founder-magach",
    "marriage-iainbheag-founder-magach--talamh-founder-luga",
    "marriage-ite-founder-magach--kadhghan-founder-nessa",
    "marriage-innogen-1585-cleirigh--ninnidh-1580-magach",
    "marriage-asmund-mairin-skaal",
    "marriage-maelrubha-1603-magach--muirne-1609-luga",
    "marriage-conchobhar-1606-nessa--samthann-1610-magach",
    "marriage-liobhan-1614-eala--saighir-1614-magach",
    "marriage-cinnfhlaith-1630-ceallaigh--iainbheag-1627-magach",
    "marriage-bridachach-1630-magach--colmach-1628-fiachiontach",
    "marriage-doileag-1632-wemyss--enda-1632-magach",
    "marriage-cael-1629-ronain--damhnait-1632-magach",
    "marriage-aoife-unknown-magach-134-4--ibar-1635-magach",
    "marriage-finnian-1646-magach--inghean-1650-ailella",
    "marriage-cillian-1646-durthacht--eabha-1650-magach",
    "marriage-cet-1650-magach--quilline-1654-eachtrai",
    "marriage-gaothaire-1651-cleirigh--uainide-1654-magach",
    "marriage-ciaran-1657-magach--peigas-1658-eala",
    "marriage-dubessa-1672-haeghra--maelrubha-1667-magach",
    "marriage-keitha-1669-luga--lassarina-1670-magach",
    "marriage-luighseach-1675-gairner--saighir-1672-magach",
    "marriage-gearoidas-1671-eala--moninne-1677-magach",
    "marriage-enda-1677-magach--quiva-unknown-magach-166-0",
    "marriage-bridachach-1679-magach--quinnan-1675-suiste",
    "marriage-neidhe-1695-stwatchn--ninnidh-1690-magach",
    "marriage-tiobraide-1695-magach--tomaltach-1689-chulainn",
    "marriage-mirin-1693-eachtrai--sluagh-1697-magach",
    "engagement-fergus-1700-nessa--samthann-magach",
    "forced-ionnrachtaigh-1692-tuirseach--samthann-magach",
    "marriage-iainbheag-1695-magach--jilleen-unknown-magach-184-1",
    "marriage-peder-helgr--vencha-mac-magach",
    "marriage-kealtan-1700-durthacht--saoithin-1703-magach",
    "engagement-bridelaith-1722-cetchathach--ibar-1722-magach"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-maelrubha-founder-magach--samthann-unknown-magach-91-0",
      "childIds": [
        "lassarina-founder-magach",
        "iainbheag-founder-magach",
        "ite-founder-magach"
      ],
      "timeJumpId": "gap-blaithneach-magach-founders"
    },
    {
      "partnershipId": "marriage-iainbheag-founder-magach--talamh-founder-luga",
      "childIds": [
        "ninnidh-1580-magach",
        "mairin-magach"
      ],
      "timeJumpId": "gap-blaithneach-magach-iainbheag"
    },
    {
      "partnershipId": "marriage-innogen-1585-cleirigh--ninnidh-1580-magach",
      "childIds": [
        "maelrubha-1603-magach",
        "taran-1606-magach",
        "samthann-1610-magach",
        "ronan-1612-magach",
        "saighir-1614-magach"
      ]
    },
    {
      "partnershipId": "marriage-maelrubha-1603-magach--muirne-1609-luga",
      "childIds": [
        "iainbheag-1627-magach",
        "bridachach-1630-magach",
        "enda-1632-magach"
      ]
    },
    {
      "partnershipId": "marriage-liobhan-1614-eala--saighir-1614-magach",
      "childIds": [
        "damhnait-1632-magach",
        "ibar-1635-magach"
      ]
    },
    {
      "partnershipId": "marriage-cinnfhlaith-1630-ceallaigh--iainbheag-1627-magach",
      "childIds": [
        "finnian-1646-magach",
        "eabha-1650-magach"
      ]
    },
    {
      "partnershipId": "marriage-doileag-1632-wemyss--enda-1632-magach",
      "childIds": [
        "cet-1650-magach",
        "tigride-1656-magach"
      ]
    },
    {
      "partnershipId": "marriage-aoife-unknown-magach-134-4--ibar-1635-magach",
      "childIds": [
        "uainide-1654-magach",
        "ciaran-1657-magach"
      ]
    },
    {
      "partnershipId": "marriage-finnian-1646-magach--inghean-1650-ailella",
      "childIds": [
        "maelrubha-1667-magach",
        "lassarina-1670-magach"
      ]
    },
    {
      "partnershipId": "marriage-cet-1650-magach--quilline-1654-eachtrai",
      "childIds": [
        "saighir-1672-magach",
        "moninne-1677-magach"
      ]
    },
    {
      "partnershipId": "marriage-ciaran-1657-magach--peigas-1658-eala",
      "childIds": [
        "enda-1677-magach",
        "bridachach-1679-magach"
      ]
    },
    {
      "partnershipId": "marriage-dubessa-1672-haeghra--maelrubha-1667-magach",
      "childIds": [
        "ninnidh-1690-magach",
        "tiobraide-1695-magach",
        "talitha-1696-magach"
      ]
    },
    {
      "partnershipId": "marriage-luighseach-1675-gairner--saighir-1672-magach",
      "childIds": [
        "sluagh-1697-magach",
        "samthann-magach"
      ]
    },
    {
      "partnershipId": "marriage-enda-1677-magach--quiva-unknown-magach-166-0",
      "childIds": [
        "iainbheag-1695-magach",
        "vencha-mac-magach",
        "damhnait-1700-magach",
        "saoithin-1703-magach"
      ]
    },
    {
      "partnershipId": "marriage-neidhe-1695-stwatchn--ninnidh-1690-magach",
      "childIds": [
        "canna-1717-magach",
        "dallan-1720-magach",
        "gallgo-1723-magach",
        "ite-1726-magach"
      ]
    },
    {
      "partnershipId": "engagement-fergus-1700-nessa--samthann-magach",
      "childIds": [
        "dympna-1721-magach"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-iainbheag-1695-magach--jilleen-unknown-magach-184-1",
      "childIds": [
        "ibar-1722-magach",
        "uainide-1726-magach",
        "mairin-1729-magach",
        "ciaran-1732-magach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-fergusin-founder-ronain--lassarina-founder-magach",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-ite-founder-magach--kadhghan-founder-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-asmund-mairin-skaal",
      "targetFamilyId": "haus-skaal",
      "houseId": "house-skaal"
    },
    {
      "partnershipId": "marriage-conchobhar-1606-nessa--samthann-1610-magach",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-bridachach-1630-magach--colmach-1628-fiachiontach",
      "targetFamilyId": "haus-fiachiontach",
      "houseId": "house-fiachiontach"
    },
    {
      "partnershipId": "marriage-cael-1629-ronain--damhnait-1632-magach",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-cillian-1646-durthacht--eabha-1650-magach",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "marriage-gaothaire-1651-cleirigh--uainide-1654-magach",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-keitha-1669-luga--lassarina-1670-magach",
      "targetFamilyId": "haus-luga",
      "houseId": "house-luga"
    },
    {
      "partnershipId": "marriage-gearoidas-1671-eala--moninne-1677-magach",
      "targetFamilyId": "haus-eala",
      "houseId": "house-eala"
    },
    {
      "partnershipId": "marriage-bridachach-1679-magach--quinnan-1675-suiste",
      "targetFamilyId": "haus-suiste",
      "houseId": "house-suiste"
    },
    {
      "partnershipId": "marriage-tiobraide-1695-magach--tomaltach-1689-chulainn",
      "targetFamilyId": "haus-chulainn",
      "houseId": "house-chulainn"
    },
    {
      "partnershipId": "marriage-mirin-1693-eachtrai--sluagh-1697-magach",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-peder-helgr--vencha-mac-magach",
      "targetFamilyId": "haus-helgr",
      "houseId": "house-helgr"
    },
    {
      "partnershipId": "marriage-kealtan-1700-durthacht--saoithin-1703-magach",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "mairin-1729-magach",
      "targetFamilyId": "haus-luga",
      "houseId": "house-luga",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "raithin-gealach",
      "parentId": "ninnidh-1690-magach"
    }
  ],
  "heads": [
    "maelrubha-founder-magach",
    "iainbheag-founder-magach",
    "ninnidh-1580-magach",
    "maelrubha-1603-magach",
    "iainbheag-1627-magach",
    "finnian-1646-magach"
  ],
  "titles": {
    "maelrubha-founder-magach": "Historisches Oberhaupt",
    "iainbheag-founder-magach": "Historisches Oberhaupt",
    "ninnidh-1580-magach": "Historisches Oberhaupt",
    "maelrubha-1603-magach": "Historisches Oberhaupt",
    "iainbheag-1627-magach": "Historisches Oberhaupt",
    "finnian-1646-magach": "Mor Tiarna von Tir na Méinnear · Kleriker",
    "maelrubha-1667-magach": "Baron",
    "ninnidh-1690-magach": "Laird",
    "taran-1606-magach": "Fianna · Paladin",
    "ronan-1612-magach": "Kleriker Tharims · Fürstenrat"
  },
  "personRoles": {
    "dympna-1721-magach": "bastard",
    "ionnrachtaigh-1692-tuirseach": "forced",
    "raithin-gealach": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Dympna ist laut Grafik und Biografie Samthanns und Fergus Nessas uneheliches Kind. Ionnrachtaighs erzwungene Verbindung ist davon getrennt und begründet keine Elternschaft. Ráithín Gaelach ist Ninnidhs Mündel; Máirín ist an Luga vermittelt. Für Aindí Ailella ist bislang nur die abgebende Akte belegt; kein bestimmter Magach-Vormund wird erfunden.",
  "currentHeadId": "finnian-1646-magach",
  "heirIds": [
    "maelrubha-1667-magach",
    "ninnidh-1690-magach"
  ],
  "description": "Sidhe’Magach regiert von Cairmor aus das Land der Erze, Tir na Méinnear. Der Clan führt sich auf den Tharim-Kleriker Maelrubha und die Bergarbeiterin Samthann zurück, deren Beiname in der Gilde der pickenden Spechte fortlebt. Geistlicher Dienst, Bergbau und die Tradition der Paladine prägen das Haus. Nach Iainbheags Tod im Krieg gegen Ceitheach übernahm Finnian die Führung als Mor Tiarna; Ronan vertritt den Clan als Kleriker im Rat des Fürsten."
});

export const HOUSE_MAGACH_FAMILY = withAlbenSourcePortraitUpgrade(withAislearneachSourceCounterUpgrade(createBlaithneachSourceFamily("magach", SOURCE)));
