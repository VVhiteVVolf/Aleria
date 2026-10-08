import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ninian-founder-cleirigh",
    "noreen-unknown-cleirigh-88-0",
    "gaothaire-1560-cleirigh",
    "eadaoin-1565-cleirigh",
    "banbhin-1562-arduine",
    "dubhshlaine-1562-dubglais",
    "orthanach-1580-cleirigh",
    "caoimheas-1590-cleirigh",
    "morrigan-1582-cleirigh",
    "innogen-1585-cleirigh",
    "onuist-1587-cleirigh",
    "liosaas-1584-tuirseach",
    "murchadh-1587-nessa",
    "ninnidh-1580-magach",
    "eimhin-1587-salaig",
    "pailtear-1602-cleirigh",
    "padhla-1608-cleirigh",
    "ninian-1610-cleirigh",
    "eithne-1610-cleirigh",
    "uilleam-1605-cleirigh",
    "jorna-1605-erskine",
    "finbarr-1605-ailella",
    "peathra-unknown-cleirigh-120-2",
    "ultanach-1603-fiachiontach",
    "nighean-1607-suiste",
    "padraig-1625-cleirigh",
    "eadaoin-1636-cleirigh",
    "quairan-1630-cleirigh",
    "xoran-1624-cleirigh",
    "caoimheas-1632-cleirigh",
    "draighean-1628-brigantach",
    "fingin-1634-fintain",
    "wicche-unknown-cleirigh-130-2",
    "feamainn-1626-eala",
    "fearghal-1630-goidin",
    "dearbhail-1648-cleirigh",
    "ybhainn-1650-cleirigh",
    "innogen-cleirigh",
    "noreen-cleirigh",
    "gaothaire-1651-cleirigh",
    "beileag-1651-cleirigh",
    "trianach-1652-torcmhar",
    "neasaog-1649-eldath",
    "bryce-ciarog",
    "glyndwr-eryr",
    "uainide-1654-magach",
    "simag-1647-gairner",
    "uilleam-cleirigh",
    "caoimheas-cleirigh",
    "hascan-cleirigh",
    "eithne-1675-cleirigh",
    "orthanach-1677-cleirigh",
    "vallaigh-1672-eamhra",
    "niallach-1669-seaghdha",
    "eubhach-tuirseach",
    "uidhir-1673-neill",
    "ailis-1680-bhaird",
    "gaothaire-cleirigh",
    "onuist-cleirigh",
    "pailtear-cleirigh",
    "grian-cleirigh",
    "padraig-cleirigh",
    "cuilinn-cleirigh",
    "grian-1700-rochraide",
    "ziocha-1703-eldath",
    "doileag-1699-ceinselaig",
    "peathgho-1700-tordarroch",
    "quibhna-1698-holloran",
    "saoirseas-1702-mochoe"
  ],
  "partnershipIds": [
    "marriage-ninian-founder-cleirigh--noreen-unknown-cleirigh-88-0",
    "marriage-banbhin-1562-arduine--gaothaire-1560-cleirigh",
    "marriage-dubhshlaine-1562-dubglais--eadaoin-1565-cleirigh",
    "marriage-liosaas-1584-tuirseach--orthanach-1580-cleirigh",
    "marriage-caoimheas-1590-cleirigh--murchadh-1587-nessa",
    "marriage-innogen-1585-cleirigh--ninnidh-1580-magach",
    "marriage-eimhin-1587-salaig--onuist-1587-cleirigh",
    "marriage-jorna-1605-erskine--pailtear-1602-cleirigh",
    "marriage-finbarr-1605-ailella--padhla-1608-cleirigh",
    "marriage-ninian-1610-cleirigh--peathra-unknown-cleirigh-120-2",
    "marriage-eithne-1610-cleirigh--ultanach-1603-fiachiontach",
    "marriage-nighean-1607-suiste--uilleam-1605-cleirigh",
    "marriage-draighean-1628-brigantach--padraig-1625-cleirigh",
    "marriage-eadaoin-1636-cleirigh--fingin-1634-fintain",
    "marriage-quairan-1630-cleirigh--wicche-unknown-cleirigh-130-2",
    "marriage-feamainn-1626-eala--xoran-1624-cleirigh",
    "marriage-caoimheas-1632-cleirigh--fearghal-1630-goidin",
    "marriage-dearbhail-1648-cleirigh--trianach-1652-torcmhar",
    "marriage-neasaog-1649-eldath--ybhainn-1650-cleirigh",
    "marriage-bryce-innogen-ciarog",
    "marriage-glyndwr-noreen-eryr",
    "marriage-gaothaire-1651-cleirigh--uainide-1654-magach",
    "marriage-beileag-1651-cleirigh--simag-1647-gairner",
    "marriage-uilleam-cleirigh--vallaigh-1672-eamhra",
    "marriage-caoimheas-cleirigh--niallach-1669-seaghdha",
    "marriage-eubhach-tuirseach--hascan-cleirigh",
    "marriage-eithne-1675-cleirigh--uidhir-1673-neill",
    "marriage-ailis-1680-bhaird--orthanach-1677-cleirigh",
    "marriage-gaothaire-cleirigh--grian-1700-rochraide",
    "marriage-onuist-cleirigh--ziocha-1703-eldath",
    "marriage-doileag-1699-ceinselaig--pailtear-cleirigh",
    "engagement-grian-cleirigh--peathgho-1700-tordarroch",
    "engagement-padraig-cleirigh--quibhna-1698-holloran",
    "engagement-cuilinn-cleirigh--saoirseas-1702-mochoe"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-ninian-founder-cleirigh--noreen-unknown-cleirigh-88-0",
      "childIds": [
        "gaothaire-1560-cleirigh",
        "eadaoin-1565-cleirigh"
      ],
      "timeJumpId": "gap-blaithneach-cleirigh-founders"
    },
    {
      "partnershipId": "marriage-banbhin-1562-arduine--gaothaire-1560-cleirigh",
      "childIds": [
        "orthanach-1580-cleirigh",
        "caoimheas-1590-cleirigh",
        "morrigan-1582-cleirigh",
        "innogen-1585-cleirigh",
        "onuist-1587-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-liosaas-1584-tuirseach--orthanach-1580-cleirigh",
      "childIds": [
        "pailtear-1602-cleirigh",
        "padhla-1608-cleirigh",
        "ninian-1610-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-eimhin-1587-salaig--onuist-1587-cleirigh",
      "childIds": [
        "eithne-1610-cleirigh",
        "uilleam-1605-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-jorna-1605-erskine--pailtear-1602-cleirigh",
      "childIds": [
        "padraig-1625-cleirigh",
        "eadaoin-1636-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-ninian-1610-cleirigh--peathra-unknown-cleirigh-120-2",
      "childIds": [
        "quairan-1630-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-nighean-1607-suiste--uilleam-1605-cleirigh",
      "childIds": [
        "xoran-1624-cleirigh",
        "caoimheas-1632-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-draighean-1628-brigantach--padraig-1625-cleirigh",
      "childIds": [
        "dearbhail-1648-cleirigh",
        "ybhainn-1650-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-quairan-1630-cleirigh--wicche-unknown-cleirigh-130-2",
      "childIds": [
        "innogen-cleirigh",
        "noreen-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-feamainn-1626-eala--xoran-1624-cleirigh",
      "childIds": [
        "gaothaire-1651-cleirigh",
        "beileag-1651-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-neasaog-1649-eldath--ybhainn-1650-cleirigh",
      "childIds": [
        "uilleam-cleirigh",
        "caoimheas-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-gaothaire-1651-cleirigh--uainide-1654-magach",
      "childIds": [
        "hascan-cleirigh",
        "eithne-1675-cleirigh",
        "orthanach-1677-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-uilleam-cleirigh--vallaigh-1672-eamhra",
      "childIds": [
        "gaothaire-cleirigh",
        "onuist-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-eubhach-tuirseach--hascan-cleirigh",
      "childIds": [
        "pailtear-cleirigh",
        "grian-cleirigh"
      ]
    },
    {
      "partnershipId": "marriage-ailis-1680-bhaird--orthanach-1677-cleirigh",
      "childIds": [
        "padraig-cleirigh",
        "cuilinn-cleirigh"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-dubhshlaine-1562-dubglais--eadaoin-1565-cleirigh",
      "targetFamilyId": "haus-dubglais",
      "houseId": "house-dubglais"
    },
    {
      "partnershipId": "marriage-caoimheas-1590-cleirigh--murchadh-1587-nessa",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-innogen-1585-cleirigh--ninnidh-1580-magach",
      "targetFamilyId": "haus-magach",
      "houseId": "house-magach"
    },
    {
      "partnershipId": "marriage-finbarr-1605-ailella--padhla-1608-cleirigh",
      "targetFamilyId": "haus-ailella",
      "houseId": "house-ailella"
    },
    {
      "partnershipId": "marriage-eithne-1610-cleirigh--ultanach-1603-fiachiontach",
      "targetFamilyId": "haus-fiachiontach",
      "houseId": "house-fiachiontach"
    },
    {
      "partnershipId": "marriage-eadaoin-1636-cleirigh--fingin-1634-fintain",
      "targetFamilyId": "haus-fintain",
      "houseId": "house-fintain"
    },
    {
      "partnershipId": "marriage-caoimheas-1632-cleirigh--fearghal-1630-goidin",
      "targetFamilyId": "haus-goidin",
      "houseId": "house-goidin"
    },
    {
      "partnershipId": "marriage-dearbhail-1648-cleirigh--trianach-1652-torcmhar",
      "targetFamilyId": "haus-torcmhar",
      "houseId": "house-torcmhar"
    },
    {
      "partnershipId": "marriage-bryce-innogen-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-glyndwr-noreen-eryr",
      "targetFamilyId": "haus-eryr",
      "houseId": "house-eryr"
    },
    {
      "partnershipId": "marriage-beileag-1651-cleirigh--simag-1647-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-caoimheas-cleirigh--niallach-1669-seaghdha",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-eithne-1675-cleirigh--uidhir-1673-neill",
      "targetFamilyId": "haus-neill",
      "houseId": "house-neill"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [],
  "heads": [
    "ninian-founder-cleirigh",
    "gaothaire-1560-cleirigh",
    "orthanach-1580-cleirigh",
    "padraig-1625-cleirigh",
    "morrigan-1582-cleirigh"
  ],
  "titles": {
    "ninian-founder-cleirigh": "Historisches Oberhaupt",
    "gaothaire-1560-cleirigh": "Historisches Oberhaupt",
    "orthanach-1580-cleirigh": "Historisches Oberhaupt",
    "padraig-1625-cleirigh": "Historisches Oberhaupt",
    "morrigan-1582-cleirigh": "Morrigan · frühere Matriarchin",
    "pailtear-cleirigh": "Überlebender Erbe · Bandenführer des Blutbundes"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine serielle Überlieferungslücke. Cléirigh bleibt nach Nutzerfestlegung ausgestoßen, nicht ausgestorben. Xorán und Caoimheas sind laut Tabelle und Grafik Kinder Uilleams und Nigheans. Caoimheas’ Partner heißt in Tabelle und Goidin-Akte Fearghal, nicht Amlaibh wie in der Cléirigh-Grafik. Xorán wird laut Biografie nur für tot gehalten; das tabellarische Todesjahr 1720 ist keine Gewissheit über seinen Verbleib. Pailtéar und Morrigan werden weiterhin lebend geführt.",
  "currentHeadId": "",
  "heirIds": [
    "pailtear-cleirigh"
  ],
  "description": "Cléirigh, in älteren Überlieferungen Sidhe’Cléirigh, wird heute als ausgestoßener Clan geführt. Morrigans Bündnis mit einem Hexenkult und ihr gewaltsamer Griff nach der Macht zerrissen das Haus während des Krieges gegen Ceitheach. Háscan ermöglichte seinem Sohn Pailtéar die Flucht. Pailtéar überlebte, kämpfte zunächst an der Seite der Ronain und schloss sich später als Bandenführer dem Blutbund an. Auch Morrigan ist weiterhin lebend überliefert; der Clan gilt daher nicht als ausgestorben."
});

export const HOUSE_CLEIRIGH_FAMILY = createBlaithneachSourceFamily("cleirigh", SOURCE);
