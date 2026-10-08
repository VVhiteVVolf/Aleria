import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "conchobhar-founder-nessa",
    "ruadh-unknown-nessa-91-0",
    "kadhghan-founder-nessa",
    "bairrfhionn-founder-nessa",
    "ite-founder-magach",
    "diorbhail-unknown-nessa-103-1",
    "tighearnach-nessa",
    "polain-nessa",
    "murchadh-1587-nessa",
    "deirdre-1585-ceinselaig",
    "rorik-gallchobhair",
    "caoimheas-1590-cleirigh",
    "glaodhaich-1606-nessa",
    "conchobhar-1606-nessa",
    "eilidhan-1608-nessa",
    "rioghbhar-1610-nessa",
    "earc-1600-nuadat",
    "samthann-1610-magach",
    "urramach-1607-fintain",
    "mona-1612-haeghra",
    "turloughas-1628-nessa",
    "ruadh-nessa",
    "wuirseach-1636-nessa",
    "amhlaoibh-nessa",
    "duana-1632-goidin",
    "donndubhan-airgid",
    "ailisag-1637-ardmhair",
    "deoiridh-1631-leite",
    "kadghghan-1650-nessa",
    "katreen-1656-nessa",
    "rabhla-1648-nessa",
    "murchadh-1648-nessa",
    "odhbha-1653-aonghusa",
    "naoiseag-1654-ronain",
    "cathalag-1646-eala",
    "nighean-1649-gairner",
    "rioghbhar-1671-nessa",
    "laragh-nessa",
    "briathach-1680-nessa",
    "dughall-1674-nessa",
    "glaodhaich-1673-nessa",
    "wuirseach-1676-nessa",
    "sorcha-1672-roich",
    "gwalchgwyn-mwyalchen",
    "giorsailan-1678-suiste",
    "bairrfhionn-1669-goidin",
    "doireann-unknown-nessa-159-4",
    "conchobhar-1690-nessa",
    "nechtan-1695-nessa",
    "polain-1700-nessa",
    "ylorcan-1705-nessa",
    "iubhail-1700-nessa",
    "fergus-1700-nessa",
    "aingeal-nessa",
    "aodhin-1698-nessa",
    "tadhgag-1703-nessa",
    "eilidhan-nessa",
    "clothru-1696-ceallaigh",
    "fionnog-1697-ronain",
    "righna-1705-rowak",
    "labhruinn-1697-muileach",
    "samthann-magach",
    "koarnach-1690-eamhra",
    "eamhair-1703-haeghra",
    "donndubhan-1698-leite",
    "bhaltos-1716-nessa",
    "beitidh-1720-nessa",
    "barabal-1723-nessa",
    "ruadh-1725-nessa",
    "jathan-1728-nessa",
    "ainean-1726-durthacht",
    "parthas-1725-nessa",
    "odhran-1727-nessa",
    "rabhla-nessa",
    "cailean-1729-conchobhair",
    "anndra-1721-nessa",
    "fergus-1721-nessa",
    "annag-1722-nessa",
    "aifric-1725-nessa"
  ],
  "partnershipIds": [
    "marriage-conchobhar-founder-nessa--ruadh-unknown-nessa-91-0",
    "marriage-ite-founder-magach--kadhghan-founder-nessa",
    "marriage-bairrfhionn-founder-nessa--diorbhail-unknown-nessa-103-1",
    "marriage-deirdre-1585-ceinselaig--tighearnach-nessa",
    "marriage-rorik-polain",
    "marriage-caoimheas-1590-cleirigh--murchadh-1587-nessa",
    "marriage-earc-1600-nuadat--glaodhaich-1606-nessa",
    "marriage-conchobhar-1606-nessa--samthann-1610-magach",
    "marriage-eilidhan-1608-nessa--urramach-1607-fintain",
    "marriage-mona-1612-haeghra--rioghbhar-1610-nessa",
    "marriage-duana-1632-goidin--turloughas-1628-nessa",
    "marriage-donndubhan-ruadh-airgid",
    "engagement-ailisag-1637-ardmhair--wuirseach-1636-nessa",
    "marriage-amhlaoibh-nessa--deoiridh-1631-leite",
    "marriage-kadghghan-1650-nessa--odhbha-1653-aonghusa",
    "marriage-katreen-1656-nessa--naoiseag-1654-ronain",
    "marriage-cathalag-1646-eala--rabhla-1648-nessa",
    "marriage-murchadh-1648-nessa--nighean-1649-gairner",
    "marriage-rioghbhar-1671-nessa--sorcha-1672-roich",
    "marriage-gwalchgwyn-laragh-mwyalchen",
    "marriage-dughall-1674-nessa--giorsailan-1678-suiste",
    "marriage-bairrfhionn-1669-goidin--glaodhaich-1673-nessa",
    "marriage-doireann-unknown-nessa-159-4--wuirseach-1676-nessa",
    "marriage-clothru-1696-ceallaigh--conchobhar-1690-nessa",
    "marriage-fionnog-1697-ronain--polain-1700-nessa",
    "marriage-righna-1705-rowak--ylorcan-1705-nessa",
    "marriage-iubhail-1700-nessa--labhruinn-1697-muileach",
    "engagement-fergus-1700-nessa--samthann-magach",
    "forced-aingeal-nessa--koarnach-1690-eamhra",
    "marriage-aodhin-1698-nessa--eamhair-1703-haeghra",
    "marriage-donndubhan-1698-leite--eilidhan-nessa"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-conchobhar-founder-nessa--ruadh-unknown-nessa-91-0",
      "childIds": [
        "kadhghan-founder-nessa",
        "bairrfhionn-founder-nessa"
      ],
      "timeJumpId": "gap-blaithneach-nessa-founders"
    },
    {
      "partnershipId": "marriage-ite-founder-magach--kadhghan-founder-nessa",
      "childIds": [
        "tighearnach-nessa",
        "polain-nessa",
        "murchadh-1587-nessa"
      ],
      "timeJumpId": "gap-blaithneach-nessa-kadhghan"
    },
    {
      "partnershipId": "marriage-deirdre-1585-ceinselaig--tighearnach-nessa",
      "childIds": [
        "glaodhaich-1606-nessa",
        "conchobhar-1606-nessa"
      ]
    },
    {
      "partnershipId": "marriage-caoimheas-1590-cleirigh--murchadh-1587-nessa",
      "childIds": [
        "eilidhan-1608-nessa",
        "rioghbhar-1610-nessa"
      ]
    },
    {
      "partnershipId": "marriage-conchobhar-1606-nessa--samthann-1610-magach",
      "childIds": [
        "turloughas-1628-nessa",
        "ruadh-nessa",
        "wuirseach-1636-nessa"
      ]
    },
    {
      "partnershipId": "marriage-mona-1612-haeghra--rioghbhar-1610-nessa",
      "childIds": [
        "amhlaoibh-nessa"
      ]
    },
    {
      "partnershipId": "marriage-duana-1632-goidin--turloughas-1628-nessa",
      "childIds": [
        "kadghghan-1650-nessa",
        "katreen-1656-nessa"
      ]
    },
    {
      "partnershipId": "marriage-amhlaoibh-nessa--deoiridh-1631-leite",
      "childIds": [
        "rabhla-1648-nessa",
        "murchadh-1648-nessa"
      ]
    },
    {
      "partnershipId": "marriage-kadghghan-1650-nessa--odhbha-1653-aonghusa",
      "childIds": [
        "rioghbhar-1671-nessa",
        "laragh-nessa",
        "briathach-1680-nessa",
        "dughall-1674-nessa"
      ]
    },
    {
      "partnershipId": "marriage-murchadh-1648-nessa--nighean-1649-gairner",
      "childIds": [
        "glaodhaich-1673-nessa",
        "wuirseach-1676-nessa"
      ]
    },
    {
      "partnershipId": "marriage-rioghbhar-1671-nessa--sorcha-1672-roich",
      "childIds": [
        "conchobhar-1690-nessa",
        "nechtan-1695-nessa",
        "polain-1700-nessa",
        "ylorcan-1705-nessa",
        "iubhail-1700-nessa"
      ]
    },
    {
      "partnershipId": "marriage-dughall-1674-nessa--giorsailan-1678-suiste",
      "childIds": [
        "fergus-1700-nessa",
        "aingeal-nessa"
      ]
    },
    {
      "partnershipId": "marriage-doireann-unknown-nessa-159-4--wuirseach-1676-nessa",
      "childIds": [
        "aodhin-1698-nessa",
        "tadhgag-1703-nessa",
        "eilidhan-nessa"
      ]
    },
    {
      "partnershipId": "marriage-clothru-1696-ceallaigh--conchobhar-1690-nessa",
      "childIds": [
        "bhaltos-1716-nessa",
        "beitidh-1720-nessa",
        "barabal-1723-nessa",
        "ruadh-1725-nessa",
        "jathan-1728-nessa"
      ]
    },
    {
      "partnershipId": "marriage-righna-1705-rowak--ylorcan-1705-nessa",
      "childIds": [
        "parthas-1725-nessa",
        "odhran-1727-nessa",
        "rabhla-nessa"
      ]
    },
    {
      "partnershipId": "forced-aingeal-nessa--koarnach-1690-eamhra",
      "childIds": [
        "anndra-1721-nessa",
        "fergus-1721-nessa"
      ],
      "legitimacy": "illegitimate"
    },
    {
      "partnershipId": "marriage-aodhin-1698-nessa--eamhair-1703-haeghra",
      "childIds": [
        "annag-1722-nessa",
        "aifric-1725-nessa"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-rorik-polain",
      "targetFamilyId": "haus-gallchobhair",
      "houseId": "house-gallchobhair"
    },
    {
      "partnershipId": "marriage-earc-1600-nuadat--glaodhaich-1606-nessa",
      "targetFamilyId": "haus-nuadat",
      "houseId": "house-nuadat"
    },
    {
      "partnershipId": "marriage-eilidhan-1608-nessa--urramach-1607-fintain",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-donndubhan-ruadh-airgid",
      "targetFamilyId": "haus-airgid",
      "houseId": "house-airgid"
    },
    {
      "partnershipId": "marriage-katreen-1656-nessa--naoiseag-1654-ronain",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-cathalag-1646-eala--rabhla-1648-nessa",
      "targetFamilyId": "haus-eala",
      "houseId": "house-eala"
    },
    {
      "partnershipId": "marriage-gwalchgwyn-laragh-mwyalchen",
      "targetFamilyId": "haus-mwyalchen",
      "houseId": "house-mwyalchen"
    },
    {
      "partnershipId": "marriage-bairrfhionn-1669-goidin--glaodhaich-1673-nessa",
      "targetFamilyId": "haus-goidin",
      "houseId": "house-goidin"
    },
    {
      "partnershipId": "marriage-fionnog-1697-ronain--polain-1700-nessa",
      "targetFamilyId": "haus-ronain",
      "houseId": "house-ronain"
    },
    {
      "partnershipId": "marriage-iubhail-1700-nessa--labhruinn-1697-muileach",
      "targetFamilyId": "haus-muileach",
      "houseId": "house-muileach"
    },
    {
      "partnershipId": "marriage-donndubhan-1698-leite--eilidhan-nessa",
      "targetFamilyId": "haus-dal-leite",
      "houseId": "house-dal-leite"
    }
  ],
  "cadets": [
    {
      "partnershipId": "marriage-bairrfhionn-founder-nessa--diorbhail-unknown-nessa-103-1",
      "targetFamilyId": "haus-goidin"
    }
  ],
  "wards": [
    {
      "personId": "jathan-1728-nessa",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "rabhla-nessa",
      "targetFamilyId": "haus-airgid",
      "houseId": "house-airgid",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [
    {
      "childId": "ainean-1726-durthacht",
      "parentId": "conchobhar-1690-nessa"
    },
    {
      "childId": "cailean-1729-conchobhair",
      "parentId": "ylorcan-1705-nessa"
    }
  ],
  "heads": [
    "conchobhar-founder-nessa",
    "kadhghan-founder-nessa",
    "tighearnach-nessa",
    "conchobhar-1606-nessa",
    "turloughas-1628-nessa",
    "kadghghan-1650-nessa",
    "rioghbhar-1671-nessa"
  ],
  "titles": {
    "conchobhar-founder-nessa": "Historisches Oberhaupt",
    "kadhghan-founder-nessa": "Historisches Oberhaupt",
    "tighearnach-nessa": "Historisches Oberhaupt",
    "conchobhar-1606-nessa": "Historisches Oberhaupt",
    "turloughas-1628-nessa": "Historisches Oberhaupt",
    "kadghghan-1650-nessa": "Historisches Oberhaupt",
    "rioghbhar-1671-nessa": "Mor Tiarna von Tir na Beatha",
    "conchobhar-1690-nessa": "Baron · Fianna",
    "nechtan-1695-nessa": "Erbfolge: 2",
    "ylorcan-1705-nessa": "Erbfolge: 3",
    "aodhin-1698-nessa": "Erbfolge: 4",
    "tadhgag-1703-nessa": "Erbfolge: 5",
    "dughall-1674-nessa": "Marschall",
    "bhaltos-1716-nessa": "Laird"
  },
  "personRoles": {
    "anndra-1721-nessa": "bastard",
    "fergus-1721-nessa": "bastard",
    "koarnach-1690-eamhra": "forced",
    "ainean-1726-durthacht": "ward",
    "cailean-1729-conchobhair": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Zwei serielle Überlieferungslücken. Goidin ist Bairrfhionns Kadettenhaus. Jathán und Rabhla sind an Ceallaigh und Airgid vermittelte Mündel. Ainean Durthacht und Cailean Conchobhair sind aufgenommene Mündel. Aingeals Zwillinge stammen aus der ausdrücklich erzwungenen Verbindung mit Koarnach; keine Affäre. Murchadhs Todesjahr folgt seiner Herkunftstabelle (1671 statt 1644 in Cléirigh).",
  "currentHeadId": "rioghbhar-1671-nessa",
  "heirIds": [
    "conchobhar-1690-nessa",
    "nechtan-1695-nessa",
    "ylorcan-1705-nessa",
    "aodhin-1698-nessa",
    "tadhgag-1703-nessa"
  ],
  "description": "Ard’Nessa führt das Land des Lebens, Tir na Beatha, von Sioran aus. Der legendäre Gründer Conchobhar, der Schwarze Falke, verkörpert bis heute den kriegerischen Anspruch des Hauses. Unter seinen Nachfahren verband der Clan seine Turnier- und Kämpfertradition mit neuer Verwaltung; Bairrfhionn wurde dafür mit dem Kadettenhaus Goidin belohnt. Heute hält Mor Tiarna Rioghbhár den Clan angesichts der Folgen des Ceitheach-Krieges und der Bedrohung durch den Dunkelhain zusammen."
});

export const HOUSE_NESSA_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("nessa", SOURCE));
