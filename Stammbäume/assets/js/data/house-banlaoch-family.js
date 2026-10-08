import { createMathghamSourceFamily } from './mathgham-source-family-builder.js';

// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.
const SOURCE = Object.freeze({
  "personIds": [
    "morrioghan-founder-banlaoch",
    "hearn-unknown-banlaoch-0-1",
    "morag-1588-banlaoch",
    "polan-1593-banlaoch",
    "daire-1589-luthsach",
    "sceolaigh-1595-kerlaouen",
    "morrioghan-1609-banlaoch",
    "faolan-1612-banlaoch",
    "parthas-1606-tairise",
    "ronnat-1615-deaghaide",
    "hearn-1630-banlaoch",
    "maeve-1632-banlaoch",
    "fionn-1632-banlaoch",
    "glaodhaich-1631-agnew",
    "fergal-1629-caolan",
    "eilidh-1630-luthsach",
    "morrigan-1651-banlaoch",
    "cormac-1656-banlaoch",
    "nalainn-1658-banlaoch",
    "dubhan-1650-diuid",
    "wailbhe-1657-kerlaouen",
    "wrath-1658-lockart",
    "morag-1673-banlaoch",
    "lorcan-1676-banlaoch",
    "sluagh-1676-banlaoch",
    "peathgho-1677-banlaoch",
    "leogan-1670-tairise",
    "gormlaith-1674-luthsach",
    "haelan-1677-deaghaide",
    "suibhne-1672-haig",
    "nalainn-1695-banlaoch",
    "wairbhin-1700-banlaoch",
    "meara-1705-banlaoch",
    "keebh-1699-banlaoch",
    "keitha-1715-banlaoch",
    "conall-1692-caolan",
    "sulach-1696-goidin",
    "bairrfhionn-1701-agnew",
    "artan-1701-kerlaouen",
    "maeve-1717-banlaoch",
    "slaine-1721-banlaoch",
    "hearn-1727-banlaoch",
    "fola-1733-banlaoch",
    "sionna-1725-banlaoch",
    "jainn-1732-banlaoch",
    "tola-1722-banlaoch",
    "tolai-1728-banlaoch"
  ],
  "partnershipIds": [
    "marriage-hearn-unknown-banlaoch-0-1--morrioghan-founder-banlaoch",
    "marriage-daire-1589-luthsach--morag-1588-banlaoch",
    "marriage-polan-1593-banlaoch--sceolaigh-1595-kerlaouen",
    "marriage-morrioghan-1609-banlaoch--parthas-1606-tairise",
    "marriage-faolan-1612-banlaoch--ronnat-1615-deaghaide",
    "marriage-glaodhaich-1631-agnew--hearn-1630-banlaoch",
    "marriage-fergal-1629-caolan--maeve-1632-banlaoch",
    "marriage-eilidh-1630-luthsach--fionn-1632-banlaoch",
    "marriage-dubhan-1650-diuid--morrigan-1651-banlaoch",
    "marriage-cormac-1656-banlaoch--wailbhe-1657-kerlaouen",
    "marriage-nalainn-1658-banlaoch--wrath-1658-lockart",
    "marriage-leogan-1670-tairise--morag-1673-banlaoch",
    "marriage-gormlaith-1674-luthsach--lorcan-1676-banlaoch",
    "marriage-haelan-1677-deaghaide--sluagh-1676-banlaoch",
    "marriage-peathgho-1677-banlaoch--suibhne-1672-haig",
    "marriage-conall-1692-caolan--nalainn-1695-banlaoch",
    "marriage-sulach-1696-goidin--wairbhin-1700-banlaoch",
    "marriage-bairrfhionn-1701-agnew--meara-1705-banlaoch",
    "marriage-artan-1701-kerlaouen--keebh-1699-banlaoch"
  ],
  "descendants": [
    {
      "partnershipId": "marriage-hearn-unknown-banlaoch-0-1--morrioghan-founder-banlaoch",
      "childIds": [
        "morag-1588-banlaoch",
        "polan-1593-banlaoch"
      ],
      "timeJumpId": "gap-mathgham-banlaoch-founders"
    },
    {
      "partnershipId": "marriage-daire-1589-luthsach--morag-1588-banlaoch",
      "childIds": [
        "morrioghan-1609-banlaoch",
        "faolan-1612-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-morrioghan-1609-banlaoch--parthas-1606-tairise",
      "childIds": [
        "hearn-1630-banlaoch",
        "maeve-1632-banlaoch",
        "fionn-1632-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-fergal-1629-caolan--maeve-1632-banlaoch",
      "childIds": [
        "morrigan-1651-banlaoch",
        "cormac-1656-banlaoch",
        "nalainn-1658-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-dubhan-1650-diuid--morrigan-1651-banlaoch",
      "childIds": [
        "morag-1673-banlaoch",
        "lorcan-1676-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-nalainn-1658-banlaoch--wrath-1658-lockart",
      "childIds": [
        "sluagh-1676-banlaoch",
        "peathgho-1677-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-leogan-1670-tairise--morag-1673-banlaoch",
      "childIds": [
        "nalainn-1695-banlaoch",
        "wairbhin-1700-banlaoch",
        "meara-1705-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-haelan-1677-deaghaide--sluagh-1676-banlaoch",
      "childIds": [
        "keebh-1699-banlaoch",
        "keitha-1715-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-conall-1692-caolan--nalainn-1695-banlaoch",
      "childIds": [
        "maeve-1717-banlaoch",
        "slaine-1721-banlaoch",
        "hearn-1727-banlaoch",
        "fola-1733-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-bairrfhionn-1701-agnew--meara-1705-banlaoch",
      "childIds": [
        "sionna-1725-banlaoch",
        "jainn-1732-banlaoch"
      ]
    },
    {
      "partnershipId": "marriage-artan-1701-kerlaouen--keebh-1699-banlaoch",
      "childIds": [
        "tola-1722-banlaoch",
        "tolai-1728-banlaoch"
      ]
    }
  ],
  "away": [
    {
      "partnershipId": "marriage-polan-1593-banlaoch--sceolaigh-1595-kerlaouen",
      "targetFamilyId": "haus-kerlaouen",
      "houseId": "house-kerlaouen"
    },
    {
      "partnershipId": "marriage-faolan-1612-banlaoch--ronnat-1615-deaghaide",
      "targetFamilyId": "haus-deaghaide",
      "houseId": "house-deaghaide"
    },
    {
      "partnershipId": "marriage-glaodhaich-1631-agnew--hearn-1630-banlaoch",
      "targetFamilyId": "haus-agnew",
      "houseId": "house-agnew"
    },
    {
      "partnershipId": "marriage-eilidh-1630-luthsach--fionn-1632-banlaoch",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach"
    },
    {
      "partnershipId": "marriage-cormac-1656-banlaoch--wailbhe-1657-kerlaouen",
      "targetFamilyId": "haus-kerlaouen",
      "houseId": "house-kerlaouen"
    },
    {
      "partnershipId": "marriage-gormlaith-1674-luthsach--lorcan-1676-banlaoch",
      "targetFamilyId": "haus-luthsach",
      "houseId": "house-luthsach"
    },
    {
      "partnershipId": "marriage-peathgho-1677-banlaoch--suibhne-1672-haig",
      "targetFamilyId": "haus-haig",
      "houseId": "house-haig"
    },
    {
      "partnershipId": "marriage-sulach-1696-goidin--wairbhin-1700-banlaoch",
      "targetFamilyId": "haus-goidin",
      "houseId": "house-goidin"
    }
  ],
  "cadets": [],
  "wards": [
    {
      "personId": "fola-1733-banlaoch",
      "targetFamilyId": "haus-tairise",
      "houseId": "house-tairise",
      "notes": "Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt."
    }
  ],
  "foster": [],
  "heads": [],
  "titles": {},
  "personRoles": {},
  "personExtensions": {
    "polan-1593-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "sceolaigh-1595-kerlaouen": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "morrioghan-1609-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "faolan-1612-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "parthas-1606-tairise": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "ronnat-1615-deaghaide": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "hearn-1630-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "maeve-1632-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "glaodhaich-1631-agnew": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "fergal-1629-caolan": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "cormac-1656-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "nalainn-1658-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "wailbhe-1657-kerlaouen": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "morag-1673-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "sluagh-1676-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "leogan-1670-tairise": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "haelan-1677-deaghaide": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "nalainn-1695-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "meara-1705-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "keebh-1699-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "keitha-1715-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "conall-1692-caolan": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "bairrfhionn-1701-agnew": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "artan-1701-kerlaouen": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "maeve-1717-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "slaine-1721-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "hearn-1727-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "fola-1733-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "sionna-1725-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "jainn-1732-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "tola-1722-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    },
    "tolai-1728-banlaoch": {
      "sourceChronology": {
        "kind": "authorized-reconstruction",
        "referenceYear": 1740,
        "assignedFields": [
          "birth",
          "death"
        ],
        "note": "Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik."
      }
    }
  },
  "sourceNote": "Vom Nutzer ausdrücklich zur Datenergänzung freigegebene Stammbaumstruktur. Ergänzte Jahre sind gegen das Bezugsjahr 1740 und belegte Gegenpersonen abgestimmt; die jüngsten Nachkommen sind 6 bis 25 Jahre alt. Das Gründerpaar vor dem einzigen Zeitsprung bleibt undatiert. Fóla ist als auswärtiges Mündel bei Tairise markiert. Ein heutiges Oberhaupt wird aus der Grafik nicht erfunden.",
  "currentHeadId": "",
  "heirIds": [],
  "description": "Nic Banlaoch ist die alte Linie von Caisteal Gorm in Tir na Mathgham. Die überlieferte Genealogie beginnt mit Mórríoghan und Hearn; nach einer Überlieferungslücke setzt sie mit Morag und Pólán fort. Ehen verbinden den Clan mit Luthsach, Diuid, Lockart, Haig, Tairise und weiteren albenischen Häusern. Fóla lebt als Mündel bei Tairise. Ein heutiges Oberhaupt und eine eigene Kriegstradition sind in der gelieferten Grafik nicht benannt. Die Einordnung folgt den alten Herrschaften Faelaorns während Krieg und Teilbesetzung.",
  "warriorReference": "",
  "unknownDataNote": "Ausschließlich fehlende Banlaoch-Jahre wurden mit ausdrücklicher Nutzerfreigabe ergänzt. Gründer vor dem Zeitsprung bleiben undatiert. Unbekannte Geschlechter und Herkunftshäuser bleiben offen."
});

export const HOUSE_BANLAOCH_FAMILY = createMathghamSourceFamily("banlaoch", SOURCE);
