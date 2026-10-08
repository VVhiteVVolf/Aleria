import { withAlbenSourcePortraitUpgrade } from './alben-source-portrait-upgrade.js';
import { createAislearneachSourceFamily } from './aislearneach-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "ultan-founder-fiachiontach",
    "sile-unknown-fiachiontach-88-0",
    "ultanach-1603-fiachiontach",
    "turloughas-1605-fiachiontach",
    "padraigas-1609-fiachiontach",
    "eithne-1610-cleirigh",
    "isibealach-unknown-fiachiontach-100-1",
    "colmach-1628-fiachiontach",
    "tailltein-1634-fiachiontach",
    "eamonan-1630-fiachiontach",
    "eunan-1634-fiachiontach",
    "bridachach-1630-magach",
    "domhnall-1629-morna",
    "neasaach-unknown-fiachiontach-110-2",
    "dairine-1657-fiachiontach",
    "nechtanas-1651-fiachiontach",
    "fionaas-1655-fiachiontach",
    "fiachraas-1658-fiachiontach",
    "eanbharr-1655-ceallaigh",
    "luiseach-1652-luchdon",
    "haodh-1653-rioga",
    "mornaachan-1660-gaisgh",
    "padraigas-1669-fiachiontach",
    "bridin-1676-fiachiontach",
    "jaimhin-1678-fiachiontach",
    "gavinas-1680-fiachiontach",
    "heilbhic-1673-ceallaigh",
    "cathalin-1676-morgacht",
    "ziocha-unknown-fiachiontach-130-2",
    "raonaid-1684-giolla",
    "cathal-1691-fiachiontach",
    "glaisne-1708-fiachiontach",
    "breasal-1700-fiachiontach",
    "bruide-1703-fiachiontach",
    "warin-1705-fiachiontach",
    "ibhail-1695-marcaigh",
    "lannan-1705-eachtrai",
    "wicche-unknown-fiachiontach-140-2",
    "gundula-unknown-fiachiontach-140-3",
    "cathalach-1699-tartarfhuil",
    "peadar-1715-fiachiontach",
    "ultan-tir-fiachiontach",
    "padhla-1727-fiachiontach",
    "jiarla-1730-fiachiontach",
    "eunan-1722-fiachiontach",
    "sile-1724-fiachiontach",
    "caolan-1727-fiachiontach",
    "nithin-1728-fiachiontach",
    "ealar-1732-fiachiontach"
  ],
  "partnershipIds": [
    "marriage-sile-unknown-fiachiontach-88-0--ultan-founder-fiachiontach",
    "marriage-eithne-1610-cleirigh--ultanach-1603-fiachiontach",
    "marriage-isibealach-unknown-fiachiontach-100-1--padraigas-1609-fiachiontach",
    "marriage-bridachach-1630-magach--colmach-1628-fiachiontach",
    "marriage-domhnall-1629-morna--tailltein-1634-fiachiontach",
    "marriage-eunan-1634-fiachiontach--neasaach-unknown-fiachiontach-110-2",
    "marriage-dairine-1657-fiachiontach--eanbharr-1655-ceallaigh",
    "marriage-luiseach-1652-luchdon--nechtanas-1651-fiachiontach",
    "marriage-fionaas-1655-fiachiontach--haodh-1653-rioga",
    "marriage-fiachraas-1658-fiachiontach--mornaachan-1660-gaisgh",
    "marriage-heilbhic-1673-ceallaigh--padraigas-1669-fiachiontach",
    "marriage-bridin-1676-fiachiontach--cathalin-1676-morgacht",
    "marriage-jaimhin-1678-fiachiontach--ziocha-unknown-fiachiontach-130-2",
    "marriage-gavinas-1680-fiachiontach--raonaid-1684-giolla",
    "marriage-cathal-1691-fiachiontach--ibhail-1695-marcaigh",
    "marriage-glaisne-1708-fiachiontach--lannan-1705-eachtrai",
    "marriage-breasal-1700-fiachiontach--wicche-unknown-fiachiontach-140-2",
    "marriage-bruide-1703-fiachiontach--gundula-unknown-fiachiontach-140-3",
    "marriage-cathalach-1699-tartarfhuil--warin-1705-fiachiontach"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-sile-unknown-fiachiontach-88-0--ultan-founder-fiachiontach",
      "childIds": [
        "ultanach-1603-fiachiontach",
        "turloughas-1605-fiachiontach",
        "padraigas-1609-fiachiontach"
      ],
      "timeJumpId": "gap-aislearneach-fiachiontach-founders"
    },
    {
      "partnershipId": "marriage-eithne-1610-cleirigh--ultanach-1603-fiachiontach",
      "childIds": [
        "colmach-1628-fiachiontach",
        "tailltein-1634-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-isibealach-unknown-fiachiontach-100-1--padraigas-1609-fiachiontach",
      "childIds": [
        "eamonan-1630-fiachiontach",
        "eunan-1634-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-bridachach-1630-magach--colmach-1628-fiachiontach",
      "childIds": [
        "dairine-1657-fiachiontach",
        "nechtanas-1651-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-eunan-1634-fiachiontach--neasaach-unknown-fiachiontach-110-2",
      "childIds": [
        "fionaas-1655-fiachiontach",
        "fiachraas-1658-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-luiseach-1652-luchdon--nechtanas-1651-fiachiontach",
      "childIds": [
        "padraigas-1669-fiachiontach",
        "bridin-1676-fiachiontach",
        "jaimhin-1678-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-fiachraas-1658-fiachiontach--mornaachan-1660-gaisgh",
      "childIds": [
        "gavinas-1680-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-heilbhic-1673-ceallaigh--padraigas-1669-fiachiontach",
      "childIds": [
        "cathal-1691-fiachiontach",
        "glaisne-1708-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-jaimhin-1678-fiachiontach--ziocha-unknown-fiachiontach-130-2",
      "childIds": [
        "breasal-1700-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-gavinas-1680-fiachiontach--raonaid-1684-giolla",
      "childIds": [
        "bruide-1703-fiachiontach",
        "warin-1705-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-cathal-1691-fiachiontach--ibhail-1695-marcaigh",
      "childIds": [
        "peadar-1715-fiachiontach",
        "ultan-tir-fiachiontach",
        "padhla-1727-fiachiontach",
        "jiarla-1730-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-breasal-1700-fiachiontach--wicche-unknown-fiachiontach-140-2",
      "childIds": [
        "eunan-1722-fiachiontach",
        "sile-1724-fiachiontach",
        "caolan-1727-fiachiontach"
      ]
    },
    {
      "partnershipId": "marriage-bruide-1703-fiachiontach--gundula-unknown-fiachiontach-140-3",
      "childIds": [
        "nithin-1728-fiachiontach",
        "ealar-1732-fiachiontach"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-domhnall-1629-morna--tailltein-1634-fiachiontach",
      "targetFamilyId": "haus-morna",
      "houseId": "house-morna"
    },
    {
      "partnershipId": "marriage-dairine-1657-fiachiontach--eanbharr-1655-ceallaigh",
      "targetFamilyId": "haus-ceallaigh",
      "houseId": "house-ceallaigh"
    },
    {
      "partnershipId": "marriage-fionaas-1655-fiachiontach--haodh-1653-rioga",
      "targetFamilyId": "haus-rioga",
      "houseId": "house-rioga"
    },
    {
      "partnershipId": "marriage-bridin-1676-fiachiontach--cathalin-1676-morgacht",
      "targetFamilyId": "haus-morgacht",
      "houseId": "house-morgacht"
    },
    {
      "partnershipId": "marriage-glaisne-1708-fiachiontach--lannan-1705-eachtrai",
      "targetFamilyId": "haus-eachtrai",
      "houseId": "house-eachtrai"
    },
    {
      "partnershipId": "marriage-cathalach-1699-tartarfhuil--warin-1705-fiachiontach",
      "targetFamilyId": "haus-tartarfhuil",
      "houseId": "house-tartarfhuil"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "ultan-tir-fiachiontach",
      "targetFamilyId": "haus-ciarog",
      "houseId": "house-ciarog",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    },
    {
      "personId": "caolan-1727-fiachiontach",
      "targetFamilyId": "haus-ailella",
      "houseId": "house-ailella",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [
    "ultan-founder-fiachiontach",
    "ultanach-1603-fiachiontach",
    "padraigas-1609-fiachiontach",
    "colmach-1628-fiachiontach"
  ],
  "titles": {
    "ultan-founder-fiachiontach": "Historisches Oberhaupt",
    "ultanach-1603-fiachiontach": "Historisches Oberhaupt",
    "padraigas-1609-fiachiontach": "Historisches Oberhaupt",
    "colmach-1628-fiachiontach": "Laird von Koldair",
    "eamonan-1630-fiachiontach": "Erbfolge: 1",
    "nechtanas-1651-fiachiontach": "Erbfolge: 2",
    "fiachraas-1658-fiachiontach": "Erbfolge: 3",
    "padraigas-1669-fiachiontach": "Erbfolge: 4",
    "jaimhin-1678-fiachiontach": "Erbfolge: 5"
  },
  "personRoles": {},
  "personExtensions": {},
  "sourceNote": "Eine Überlieferungslücke. Cathals vier Kinder stammen laut Grafik von Ibhail Marcaigh; die Tabellenüberschrift nennt fälschlich seine Schwester Glaisne. Ultán wird nach Ciaróg, Caolán nach Ailella vermittelt (Blumenwappen und Gegenakte). Lange Lebenszeiten bleiben erhalten; sie belegen für sich keinen Tod.",
  "currentHeadId": "colmach-1628-fiachiontach",
  "heirIds": [
    "eamonan-1630-fiachiontach",
    "nechtanas-1651-fiachiontach",
    "fiachraas-1658-fiachiontach",
    "padraigas-1669-fiachiontach",
    "jaimhin-1678-fiachiontach"
  ],
  "description": "Fiachiontach ist ein in Koldair ansässiges Laird-Haus, dessen überlieferte Linie mit Ultán beginnt. Das älteste Familienmitglied übernimmt die Führung; gegenwärtig ist dies der 1628 geborene Colmach. Die weitverzweigte Familie ist mit den Häusern Ceallaigh, Morgacht und anderen Nachbarn verbunden. Ultán wächst als Mündel bei Ciaróg auf, Caolán bei Ailella."
});

export const HOUSE_FIACHIONTACH_FAMILY = withAlbenSourcePortraitUpgrade(createAislearneachSourceFamily("fiachiontach", SOURCE));
