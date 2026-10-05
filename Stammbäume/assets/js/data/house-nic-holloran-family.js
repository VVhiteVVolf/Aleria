import { createCeitheachSourceFamily } from './ceitheach-source-family-builder.js';
import { CEITHEACH_ADDITIONAL_SOURCE_CATALOG } from './ceitheach-additional-source-catalog.js';

// Elternpaare und Kinder nach beschrifteter Tabelle und Stammbaumgrafik.
const SOURCE = Object.freeze({
  "personIds": [
    "quibhna-founder-holloran",
    "ruaidhrigh-unknown-nic-holloran-founder",
    "maebhin-holloran",
    "naoiseag-holloran",
    "fionnghuala-1588-holloran",
    "sinead-1582-holloran",
    "puirseil-cetchthach",
    "saoirse-1582-ceinselaig",
    "artair-mochoe",
    "giorsail-1605-holloran",
    "tormodog-1607-holloran",
    "sceolaigh-1606-holloran",
    "lachtna-1608-holloran",
    "faolan-leite",
    "fola-reannachain",
    "leogan-caolan",
    "gormfhlaith-blar",
    "fionnghuala-holloran",
    "sinead-1634-holloran",
    "uachall-holloran",
    "feamainn-holloran",
    "bearnard-holloran",
    "donnacha-rochraide",
    "gaothaire-unknown-nic-holloran-1648",
    "ylorcan-birn",
    "mairthin-unknown-nic-holloran-1635",
    "aindi-unknown-nic-holloran-1646",
    "ionnrachtaigh-1628-tuirseach",
    "saoirse-unknown-nic-holloran-1630",
    "liadan-eamhra",
    "sceolaigh-1649-holloran",
    "meabhin-1655-holloran",
    "conan-holloran",
    "dubhshlaine-holloran",
    "iobhar-holloran",
    "beiste-holloran",
    "eairdsidh-holloran",
    "ruaidhrigh-holloran",
    "banan-mochoe",
    "fearghas-duibhne",
    "eilidhan-eldath",
    "valinach-seaghdha",
    "eilidh-bhaird",
    "cearbhall-unknown-nic-holloran-1660",
    "wighnach-holloran",
    "giorsail-1674-holloran",
    "tormodog-1675-holloran",
    "lachtna-1671-holloran",
    "taillteach-holloran",
    "cuilinn-holloran",
    "moirin-holloran",
    "maonait-caolan",
    "gadhra-unknown-nic-holloran-1674",
    "kelch-ceinselaig",
    "oirigh-1677-tuirseach",
    "iolanda-unknown-nic-holloran-1680",
    "jorna-unknown-nic-holloran-1676",
    "heulyn-tordarroch",
    "gorman-unknown-nic-holloran-1676",
    "hoidhre-unknown-nic-holloran-1679",
    "giollan-durthacht",
    "neart-holloran",
    "fionnghuala-1696-holloran",
    "quibhna-1698-holloran",
    "morag-holloran",
    "sinead-1703-holloran",
    "deorsa-holloran",
    "qubhna-holloran",
    "saraan-holloran",
    "goban-holloran",
    "meabhin-holloran",
    "oran-holloran",
    "mebh-holloran",
    "padraig-cleirigh",
    "nogh-rochraide"
  ],
  "partnershipIds": [
    "marriage-quibhna-founder-holloran--ruaidhrigh-unknown-nic-holloran-founder",
    "marriage-maebhin-holloran--puirseil-cetchthach",
    "marriage-naoiseag-holloran--saoirse-1582-ceinselaig",
    "marriage-artair-mochoe--sinead-1582-holloran",
    "marriage-faolan-leite--giorsail-1605-holloran",
    "marriage-fola-reannachain--tormodog-1607-holloran",
    "marriage-leogan-caolan--sceolaigh-1606-holloran",
    "marriage-gormfhlaith-blar--lachtna-1608-holloran",
    "marriage-donnacha-rochraide--fionnghuala-holloran",
    "affair-fionnghuala-holloran--gaothaire-unknown-nic-holloran-1648",
    "marriage-sinead-1634-holloran--ylorcan-birn",
    "marriage-mairthin-unknown-nic-holloran-1635--uachall-holloran",
    "affair-aindi-unknown-nic-holloran-1646--uachall-holloran",
    "marriage-feamainn-holloran--ionnrachtaigh-1628-tuirseach",
    "affair-bearnard-holloran--saoirse-unknown-nic-holloran-1630",
    "marriage-bearnard-holloran--liadan-eamhra",
    "marriage-banan-mochoe--sceolaigh-1649-holloran",
    "marriage-fearghas-duibhne--meabhin-1655-holloran",
    "marriage-dubhshlaine-holloran--eilidhan-eldath",
    "marriage-eairdsidh-holloran--valinach-seaghdha",
    "marriage-eilidh-bhaird--ruaidhrigh-holloran",
    "affair-cearbhall-unknown-nic-holloran-1660--ruaidhrigh-holloran",
    "marriage-maonait-caolan--wighnach-holloran",
    "affair-gadhra-unknown-nic-holloran-1674--giorsail-1674-holloran",
    "marriage-giorsail-1674-holloran--kelch-ceinselaig",
    "marriage-oirigh-1677-tuirseach--tormodog-1675-holloran",
    "affair-iolanda-unknown-nic-holloran-1680--tormodog-1675-holloran",
    "affair-jorna-unknown-nic-holloran-1676--lachtna-1671-holloran",
    "marriage-heulyn-tordarroch--lachtna-1671-holloran",
    "marriage-gorman-unknown-nic-holloran-1676--taillteach-holloran",
    "affair-hoidhre-unknown-nic-holloran-1679--taillteach-holloran",
    "marriage-cuilinn-holloran--giollan-durthacht",
    "engagement-padraig-cleirigh--quibhna-1698-holloran",
    "engagement-meabhin-holloran--nogh-rochraide"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-quibhna-founder-holloran--ruaidhrigh-unknown-nic-holloran-founder",
      "childIds": [
        "maebhin-holloran",
        "naoiseag-holloran",
        "fionnghuala-1588-holloran",
        "sinead-1582-holloran"
      ],
      "timeJumpId": "gap-nic-holloran-founder"
    },
    {
      "partnershipId": "marriage-maebhin-holloran--puirseil-cetchthach",
      "childIds": [
        "giorsail-1605-holloran",
        "tormodog-1607-holloran",
        "sceolaigh-1606-holloran"
      ]
    },
    {
      "partnershipId": "marriage-artair-mochoe--sinead-1582-holloran",
      "childIds": [
        "lachtna-1608-holloran"
      ]
    },
    {
      "partnershipId": "marriage-faolan-leite--giorsail-1605-holloran",
      "childIds": [
        "fionnghuala-holloran",
        "sinead-1634-holloran"
      ]
    },
    {
      "partnershipId": "marriage-fola-reannachain--tormodog-1607-holloran",
      "childIds": [
        "uachall-holloran"
      ]
    },
    {
      "partnershipId": "marriage-leogan-caolan--sceolaigh-1606-holloran",
      "childIds": [
        "feamainn-holloran",
        "bearnard-holloran"
      ]
    },
    {
      "partnershipId": "marriage-donnacha-rochraide--fionnghuala-holloran",
      "childIds": [
        "sceolaigh-1649-holloran",
        "meabhin-1655-holloran"
      ]
    },
    {
      "partnershipId": "affair-fionnghuala-holloran--gaothaire-unknown-nic-holloran-1648",
      "childIds": [
        "conan-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-mairthin-unknown-nic-holloran-1635--uachall-holloran",
      "childIds": [
        "dubhshlaine-holloran"
      ]
    },
    {
      "partnershipId": "affair-aindi-unknown-nic-holloran-1646--uachall-holloran",
      "childIds": [
        "iobhar-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-bearnard-holloran--saoirse-unknown-nic-holloran-1630",
      "childIds": [
        "beiste-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-bearnard-holloran--liadan-eamhra",
      "childIds": [
        "eairdsidh-holloran",
        "ruaidhrigh-holloran"
      ]
    },
    {
      "partnershipId": "marriage-banan-mochoe--sceolaigh-1649-holloran",
      "childIds": [
        "wighnach-holloran",
        "giorsail-1674-holloran"
      ]
    },
    {
      "partnershipId": "marriage-dubhshlaine-holloran--eilidhan-eldath",
      "childIds": [
        "tormodog-1675-holloran",
        "lachtna-1671-holloran"
      ]
    },
    {
      "partnershipId": "marriage-eilidh-bhaird--ruaidhrigh-holloran",
      "childIds": [
        "taillteach-holloran",
        "cuilinn-holloran"
      ]
    },
    {
      "partnershipId": "affair-cearbhall-unknown-nic-holloran-1660--ruaidhrigh-holloran",
      "childIds": [
        "moirin-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-gadhra-unknown-nic-holloran-1674--giorsail-1674-holloran",
      "childIds": [
        "neart-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-giorsail-1674-holloran--kelch-ceinselaig",
      "childIds": [
        "fionnghuala-1696-holloran",
        "quibhna-1698-holloran"
      ]
    },
    {
      "partnershipId": "marriage-oirigh-1677-tuirseach--tormodog-1675-holloran",
      "childIds": [
        "morag-holloran",
        "sinead-1703-holloran"
      ]
    },
    {
      "partnershipId": "affair-iolanda-unknown-nic-holloran-1680--tormodog-1675-holloran",
      "childIds": [
        "deorsa-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "affair-jorna-unknown-nic-holloran-1676--lachtna-1671-holloran",
      "childIds": [
        "qubhna-holloran"
      ],
      "legitimacy": "bastard"
    },
    {
      "partnershipId": "marriage-heulyn-tordarroch--lachtna-1671-holloran",
      "childIds": [
        "saraan-holloran",
        "goban-holloran"
      ]
    },
    {
      "partnershipId": "marriage-gorman-unknown-nic-holloran-1676--taillteach-holloran",
      "childIds": [
        "meabhin-holloran",
        "oran-holloran"
      ]
    },
    {
      "partnershipId": "affair-hoidhre-unknown-nic-holloran-1679--taillteach-holloran",
      "childIds": [
        "mebh-holloran"
      ],
      "legitimacy": "bastard"
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-naoiseag-holloran--saoirse-1582-ceinselaig",
      "targetFamilyId": "haus-ua-nic-ceinselaig",
      "houseId": "house-ua-nic-ceinselaig"
    },
    {
      "partnershipId": "marriage-gormfhlaith-blar--lachtna-1608-holloran",
      "targetFamilyId": "haus-nic-blar",
      "houseId": "house-nic-blar"
    },
    {
      "partnershipId": "marriage-sinead-1634-holloran--ylorcan-birn",
      "targetFamilyId": "haus-birn",
      "houseId": "house-birn"
    },
    {
      "partnershipId": "marriage-feamainn-holloran--ionnrachtaigh-1628-tuirseach",
      "targetFamilyId": "haus-mac-tuirseach",
      "houseId": "house-mac-tuirseach"
    },
    {
      "partnershipId": "marriage-fearghas-duibhne--meabhin-1655-holloran",
      "targetFamilyId": "haus-duibhne",
      "houseId": "house-duibhne"
    },
    {
      "partnershipId": "marriage-eairdsidh-holloran--valinach-seaghdha",
      "targetFamilyId": "haus-seaghda",
      "houseId": "house-seaghda"
    },
    {
      "partnershipId": "marriage-maonait-caolan--wighnach-holloran",
      "targetFamilyId": "haus-caolan",
      "houseId": "house-caolan"
    },
    {
      "partnershipId": "marriage-cuilinn-holloran--giollan-durthacht",
      "targetFamilyId": "haus-durthacht",
      "houseId": "house-durthacht"
    },
    {
      "partnershipId": "engagement-padraig-cleirigh--quibhna-1698-holloran",
      "targetFamilyId": "haus-cleirigh",
      "houseId": "house-cleirigh"
    },
    {
      "partnershipId": "engagement-meabhin-holloran--nogh-rochraide",
      "targetFamilyId": "haus-ui-rochraide",
      "houseId": "house-rochraide"
    }
  ],
  "cadets": [],
  "wards": [],
  "historicalWards": [],
  "heads": [
    "quibhna-founder-holloran",
    "maebhin-holloran"
  ],
  "titles": {
    "quibhna-founder-holloran": "Legendäre Gründerin des Clans",
    "maebhin-holloran": "Mor Tiarna · Oberhaupt bis 1720"
  },
  "personRoles": {
    "gaothaire-unknown-nic-holloran-1648": "affair",
    "aindi-unknown-nic-holloran-1646": "affair",
    "saoirse-unknown-nic-holloran-1630": "affair",
    "cearbhall-unknown-nic-holloran-1660": "affair",
    "gadhra-unknown-nic-holloran-1674": "affair",
    "iolanda-unknown-nic-holloran-1680": "affair",
    "jorna-unknown-nic-holloran-1676": "affair",
    "hoidhre-unknown-nic-holloran-1679": "affair"
  },
  "sourceNote": "Ein serieller Quellenzeitsprung. Acht Affären führen getrennte Mutter-/Vatergruppen; Bastarde bleiben ihren tatsächlichen Eltern zugeordnet. Mebhs unmögliches Geburtsjahr 11700 wird als offensichtlicher zusätzlicher Ziffernfehler zu 1700 berichtigt. Die historischen Vormundschaften Donnachas werden nicht als neue Adoptionen angelegt."
});

export const HOUSE_NIC_HOLLORAN_FAMILY = createCeitheachSourceFamily('nic-holloran', SOURCE, CEITHEACH_ADDITIONAL_SOURCE_CATALOG);
