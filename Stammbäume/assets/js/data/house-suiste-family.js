import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createBlaithneachSourceFamily } from './blaithneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "diarmadas-founder-ronain",
    "nighean-unknown-ronain-118-2",
    "fachtna-founder-suiste",
    "maeve-founder-suiste",
    "blathnaid-founder-mata",
    "simag-founder-gairner",
    "conchenn-suiste",
    "maoldonaich-1583-suiste",
    "roibeard-laoch",
    "paislie-1586-briccne",
    "dubhshlaine-1604-suiste",
    "nighean-1607-suiste",
    "nechtanas-1610-suiste",
    "sorcha-1608-caolan",
    "uilleam-1605-cleirigh",
    "mairghread-unknown-suiste-125-2",
    "giorsailan-1629-suiste",
    "fachtna-suiste",
    "warin-1631-suiste",
    "tormodog-1635-suiste",
    "setantaas-1628-gairner",
    "adda-mwyalchen",
    "latharn-1625-luchdon",
    "ualang-1648-suiste",
    "clodagh-suiste",
    "diarmadas-1654-suiste",
    "caitriona-1651-ronain",
    "amaethon-ciarog",
    "ideas-1657-haeghra",
    "maoldonaich-1670-suiste",
    "maeve-suiste",
    "quinnan-1675-suiste",
    "giorsailan-1678-suiste",
    "sileach-1675-eala",
    "traherne-coedwig",
    "bridachach-1679-magach",
    "dughall-1674-nessa",
    "slaughan-1693-suiste",
    "aingeal-1696-suiste",
    "seoc-1699-suiste",
    "oiric-suiste",
    "simeon-1701-suiste",
    "feidlim-1695-ronain",
    "yachthar-1692-gairner",
    "deoiridh-1705-leite",
    "keara-unknown-suiste-165-3",
    "fachtna-1720-suiste",
    "nighean-1727-suiste",
    "tomas-1728-gaisgh",
    "clodagh-1723-suiste",
    "vethan-1726-suiste",
    "oona-1725-suiste",
    "warin-1730-suiste"
  ],
  "partnershipIds": [
    "marriage-diarmadas-founder-ronain--nighean-unknown-ronain-118-2",
    "marriage-blathnaid-founder-mata--fachtna-founder-suiste",
    "marriage-maeve-founder-suiste--simag-founder-gairner",
    "marriage-roibeard-conchenn",
    "marriage-maoldonaich-1583-suiste--paislie-1586-briccne",
    "marriage-dubhshlaine-1604-suiste--sorcha-1608-caolan",
    "marriage-nighean-1607-suiste--uilleam-1605-cleirigh",
    "marriage-mairghread-unknown-suiste-125-2--nechtanas-1610-suiste",
    "marriage-giorsailan-1629-suiste--setantaas-1628-gairner",
    "marriage-adda-fachtna-mwyalchen",
    "marriage-latharn-1625-luchdon--warin-1631-suiste",
    "marriage-caitriona-1651-ronain--ualang-1648-suiste",
    "marriage-amaethon-clodagh-ciarog",
    "marriage-diarmadas-1654-suiste--ideas-1657-haeghra",
    "marriage-maoldonaich-1670-suiste--sileach-1675-eala",
    "marriage-traherne-maeve-coedwig",
    "marriage-bridachach-1679-magach--quinnan-1675-suiste",
    "marriage-dughall-1674-nessa--giorsailan-1678-suiste",
    "marriage-feidlim-1695-ronain--slaughan-1693-suiste",
    "marriage-aingeal-1696-suiste--yachthar-1692-gairner",
    "marriage-deoiridh-1705-leite--oiric-suiste",
    "marriage-keara-unknown-suiste-165-3--simeon-1701-suiste"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-diarmadas-founder-ronain--nighean-unknown-ronain-118-2",
      "childIds": [
        "fachtna-founder-suiste",
        "maeve-founder-suiste"
      ],
      "timeJumpId": "gap-blaithneach-suiste-founders"
    },
    {
      "partnershipId": "marriage-blathnaid-founder-mata--fachtna-founder-suiste",
      "childIds": [
        "conchenn-suiste",
        "maoldonaich-1583-suiste"
      ],
      "timeJumpId": "gap-blaithneach-suiste-fachtna"
    },
    {
      "partnershipId": "marriage-maoldonaich-1583-suiste--paislie-1586-briccne",
      "childIds": [
        "dubhshlaine-1604-suiste",
        "nighean-1607-suiste",
        "nechtanas-1610-suiste"
      ]
    },
    {
      "partnershipId": "marriage-dubhshlaine-1604-suiste--sorcha-1608-caolan",
      "childIds": [
        "giorsailan-1629-suiste",
        "fachtna-suiste",
        "warin-1631-suiste"
      ]
    },
    {
      "partnershipId": "marriage-mairghread-unknown-suiste-125-2--nechtanas-1610-suiste",
      "childIds": [
        "tormodog-1635-suiste"
      ]
    },
    {
      "partnershipId": "marriage-adda-fachtna-mwyalchen",
      "childIds": [
        "ualang-1648-suiste",
        "clodagh-suiste",
        "diarmadas-1654-suiste"
      ]
    },
    {
      "partnershipId": "marriage-caitriona-1651-ronain--ualang-1648-suiste",
      "childIds": [
        "maoldonaich-1670-suiste",
        "maeve-suiste"
      ]
    },
    {
      "partnershipId": "marriage-diarmadas-1654-suiste--ideas-1657-haeghra",
      "childIds": [
        "quinnan-1675-suiste",
        "giorsailan-1678-suiste"
      ]
    },
    {
      "partnershipId": "marriage-maoldonaich-1670-suiste--sileach-1675-eala",
      "childIds": [
        "slaughan-1693-suiste",
        "aingeal-1696-suiste",
        "seoc-1699-suiste",
        "oiric-suiste"
      ]
    },
    {
      "partnershipId": "marriage-bridachach-1679-magach--quinnan-1675-suiste",
      "childIds": [
        "simeon-1701-suiste"
      ]
    },
    {
      "partnershipId": "marriage-feidlim-1695-ronain--slaughan-1693-suiste",
      "childIds": [
        "fachtna-1720-suiste",
        "nighean-1727-suiste"
      ]
    },
    {
      "partnershipId": "marriage-deoiridh-1705-leite--oiric-suiste",
      "childIds": [
        "clodagh-1723-suiste",
        "vethan-1726-suiste"
      ]
    },
    {
      "partnershipId": "marriage-keara-unknown-suiste-165-3--simeon-1701-suiste",
      "childIds": [
        "oona-1725-suiste",
        "warin-1730-suiste"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-maeve-founder-suiste--simag-founder-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-roibeard-conchenn",
      "targetFamilyId": "haus-ruin-ua-laoch",
      "houseId": "house-laoch"
    },
    {
      "partnershipId": "marriage-nighean-1607-suiste--uilleam-1605-cleirigh",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "marriage-giorsailan-1629-suiste--setantaas-1628-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    },
    {
      "partnershipId": "marriage-latharn-1625-luchdon--warin-1631-suiste",
      "targetFamilyId": "haus-luchdon",
      "houseId": "house-luchdon"
    },
    {
      "partnershipId": "marriage-amaethon-clodagh-ciarog",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog"
    },
    {
      "partnershipId": "marriage-traherne-maeve-coedwig",
      "targetFamilyId": "haus-coedwig",
      "houseId": "house-coedwig"
    },
    {
      "partnershipId": "marriage-dughall-1674-nessa--giorsailan-1678-suiste",
      "targetFamilyId": "haus-nessa",
      "houseId": "house-nessa"
    },
    {
      "partnershipId": "marriage-aingeal-1696-suiste--yachthar-1692-gairner",
      "targetFamilyId": "haus-gairner",
      "houseId": "house-gairner"
    }
  ],
  "cadets": [],
  "wards": [],
  "foster": [
    {
      "childId": "tomas-1728-gaisgh",
      "parentId": "slaughan-1693-suiste"
    }
  ],
  "heads": [
    "diarmadas-founder-ronain",
    "fachtna-founder-suiste",
    "maoldonaich-1583-suiste",
    "dubhshlaine-1604-suiste",
    "fachtna-suiste",
    "ualang-1648-suiste",
    "maoldonaich-1670-suiste"
  ],
  "titles": {
    "diarmadas-founder-ronain": "Historisches Oberhaupt",
    "fachtna-founder-suiste": "Historisches Oberhaupt",
    "maoldonaich-1583-suiste": "Historisches Oberhaupt",
    "dubhshlaine-1604-suiste": "Historisches Oberhaupt",
    "fachtna-suiste": "Historisches Oberhaupt",
    "ualang-1648-suiste": "Historisches Oberhaupt",
    "maoldonaich-1670-suiste": "Laird von Eorach",
    "slaughan-1693-suiste": "Erbfolge: 1",
    "fachtna-1720-suiste": "Erbfolge: 2",
    "seoc-1699-suiste": "Anführer einer Bande der Jagdklingen"
  },
  "personRoles": {
    "tomas-1728-gaisgh": "ward"
  },
  "personExtensions": {},
  "sourceNote": "Diarmadas Ronain begründet Suiste. Zwei serielle Überlieferungslücken. Oiric ist laut vier Spalten breiter Elternüberschrift und Grafik Maoldònaichs und Sileachs Kind; Simeon ist Quinnans und Bridachachs Kind. Tòmas Gaisgh ist Slaugháns Mündel.",
  "currentHeadId": "maoldonaich-1670-suiste",
  "heirIds": [
    "slaughan-1693-suiste",
    "fachtna-1720-suiste"
  ],
  "description": "Ua’Suiste ist ein Kadettenhaus der Ronain, begründet von Diarmadas. Der Clan sitzt in Eorach und steht unter seinem Laird Maoldònaich; als Nachfolger sind Slaughán und Fachtna benannt. Zu seinen bekannten Kriegern zählt Seoc, ein Bogenschütze der Jagdklingen. Seine im Krieg erbeutete Unhold-Trophäe erinnert in der Hauptburg an den Kampf gegen die Mächte des Waldes."
});

export const HOUSE_SUISTE_FAMILY = withAlbenSourcePortraitUpgrade(createBlaithneachSourceFamily("suiste", SOURCE));
