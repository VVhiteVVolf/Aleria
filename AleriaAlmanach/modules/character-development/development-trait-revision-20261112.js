// Exact catalog definitions immediately before the mapless balance review of 12 November 2026.
// Immutable revision input; personal variants are never replaced by ID alone.
export const PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS = Object.freeze([
  {
    "id": "development-trait-flink",
    "name": "Flinke Füße",
    "description": "+2 m Bewegung, −1 RK.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/flink.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "movement": 2,
      "armorClass": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-standfest",
    "name": "Standfest",
    "description": "+1 RK, −1 m Bewegung.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/standfest.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "armorClass": 1,
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-glutgewoehnt",
    "name": "An Glut gewöhnt",
    "description": "Ruhe beim Umgang mit Feuer: +1 auf Rettungswürfe gegen feuerbasierte Angriffe; −1 Initiative. Gewöhnung halbiert keinen Feuerschaden.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/glutgewoehnt.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "initiative": -1
    },
    "triggerRules": [
      {
        "id": "glutgewoehnung-pre-roll",
        "name": "glutgewoehnung",
        "phase": "pre-roll",
        "recipient": "target",
        "sourceRelation": "self",
        "activation": "passive",
        "frequency": "always",
        "condition": "always",
        "saveAttributes": [
          "strength",
          "dexterity",
          "constitution",
          "intelligence",
          "wisdom",
          "charisma"
        ],
        "damageTypes": [
          "feuer",
          "fire"
        ],
        "effects": {
          "savingThrowModifier": 1
        }
      },
      {
        "id": "glutgewoehnung-pre-secondary-save",
        "name": "glutgewoehnung",
        "phase": "pre-secondary-save",
        "recipient": "target",
        "sourceRelation": "self",
        "activation": "passive",
        "frequency": "always",
        "condition": "always",
        "saveAttributes": [
          "strength",
          "dexterity",
          "constitution",
          "intelligence",
          "wisdom",
          "charisma"
        ],
        "damageTypes": [
          "feuer",
          "fire"
        ],
        "effects": {
          "savingThrowModifier": 1
        }
      }
    ]
  },
  {
    "id": "development-trait-gelehrt",
    "name": "Bücherwurm",
    "description": "Expertise in Geschichte; −1 auf Athletik.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/gelehrt.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "skillProficiencies": [
        {
          "name": "Geschichte",
          "proficiency": "expertise"
        }
      ],
      "skillModifiers": [
        {
          "name": "Athletik",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-silberzunge",
    "name": "Silberzunge",
    "description": "Expertise in Überzeugen; −1 auf Motiv erkennen.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/silberzunge.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "skillProficiencies": [
        {
          "name": "Überzeugen",
          "proficiency": "expertise"
        }
      ],
      "skillModifiers": [
        {
          "name": "Motiv erkennen",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-zaehe-magie",
    "name": "Zähe Magie",
    "description": "+1 Zauber-SG; −1 m Bewegung.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/zaehe-magie.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "spellSaveDc": 1,
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-kampfbereit",
    "name": "Immer kampfbereit",
    "description": "Zu Kampfbeginn 3 temporäre TP; −1 passive Wahrnehmung.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/kampfbereit.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "combatStartTemporaryHitPoints": 3,
      "passivePerception": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-konzentriert",
    "name": "Eiserne Konzentration",
    "description": "Vorteil auf KON-Rettungswürfe zum Aufrechterhalten einer Konzentration; −1 Initiative. Andere KON-Rettungswürfe bleiben unverändert.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/konzentriert.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "initiative": -1
    },
    "triggerRules": [
      {
        "id": "eiserne-konzentration",
        "phase": "on-concentration-check",
        "recipient": "target",
        "sourceRelation": "self",
        "activation": "passive",
        "frequency": "always",
        "condition": "always",
        "effects": {
          "rollMode": "advantage"
        }
      }
    ]
  },
  {
    "id": "development-trait-lebhafter-geist",
    "name": "Lebhafter Geist",
    "description": "+1 auf alle Fertigkeitsproben; −1 RK.",
    "cost": 3,
    "icon": "/AleriaAlmanach/assets/development-traits/web/lebhafter-geist.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung",
    "mechanics": {
      "skill": 1,
      "armorClass": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-steife-gelenke",
    "name": "Steife Gelenke",
    "description": "Eingeschränkte Gelenkbeweglichkeit; −2 auf Akrobatik und −1 m Bewegung.",
    "cost": -2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/steife-gelenke.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Körper",
    "mechanics": {
      "movement": -1,
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": -2
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-schneller-stoffwechsel",
    "name": "Schneller Stoffwechsel",
    "description": "Leichter, rasch ermüdender Körper; +1 m Bewegung und −2 maximale TP.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/schneller-stoffwechsel.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Körper",
    "mechanics": {
      "movement": 1,
      "maximumHitPoints": -2
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-robuste-haut",
    "name": "Robuste Haut",
    "description": "Widerstandsfähige, vernarbte Haut; +1 RK und −1 auf Auftreten.",
    "cost": 2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/robuste-haut.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Körper",
    "mechanics": {
      "armorClass": 1,
      "skillModifiers": [
        {
          "name": "Auftreten",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-namenhueter",
    "name": "Namenhüter",
    "description": "Namen und gehörte Lebensgeschichten bleiben dir im Gedächtnis: +1 auf Geschichte und Überzeugen, −1 auf Wahrnehmung.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/namenhueter.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Besondere Eigenheit",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Geschichte",
          "bonus": 1
        },
        {
          "name": "Überzeugen",
          "bonus": 1
        },
        {
          "name": "Wahrnehmung",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-wanderlust",
    "name": "Wanderlust",
    "description": "Du bleibst lieber unterwegs, als dich lange an einer Stelle aufzuhalten: +1 m Bewegung und +1 auf Überleben, −1 auf Nachforschungen.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/wanderlust.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Besondere Eigenheit",
    "mechanics": {
      "movement": 1,
      "skillModifiers": [
        {
          "name": "Überleben",
          "bonus": 1
        },
        {
          "name": "Nachforschungen",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-deckungssucher",
    "name": "Deckungssucher",
    "description": "Du bewegst dich bedächtig und schützt dich vor Beschuss: −1 m Bewegung; eingehender Fernkampf-Waffenschaden wird um 1 reduziert. Keine Wirkung gegen Nahkampf oder Zauber.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/deckungssucher.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Besondere Eigenheit",
    "mechanics": {
      "movement": -1
    },
    "triggerRules": [
      {
        "id": "deckung-beschuss",
        "phase": "pre-damage",
        "recipient": "target",
        "sourceRelation": "self",
        "activation": "passive",
        "frequency": "always",
        "condition": "always",
        "actionKinds": [
          "weapon",
          "technique"
        ],
        "weaponAttackOnly": true,
        "attackRange": "ranged",
        "effects": {
          "damageReduction": 1
        }
      }
    ]
  },
  {
    "id": "development-trait-bluttraeger-windspross",
    "name": "Blutträger (Windspross)",
    "description": "Angeborenes menschliches Erbe eines humanoiden Celestialen der Winde: +1 Zauberangriff, +1 m Bewegung und +1 auf Akrobatik.",
    "cost": 4,
    "icon": "/AleriaAlmanach/assets/development-traits/web/bluttraeger-windspross.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Angeborenes menschliches Erbe eines infernalen oder celestialen Vorfahren",
    "tags": "Charakterentwicklung · Blutträger · Angeboren",
    "mechanics": {
      "spellAttack": 1,
      "movement": 1,
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": 1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-ruhiger-atem",
    "name": "Ruhiger Atem",
    "description": "Gleichmäßiges Atmen hilft dir, den Körper ruhig und Bewegungen unauffällig zu halten; bis du handelst, vergeht etwas Zeit: +1 auf Körperbeherrschung und Heimlichkeit, −1 Initiative.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/ruhiger-atem.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Körperbeherrschung",
          "bonus": 1
        },
        {
          "name": "Heimlichkeit",
          "bonus": 1
        }
      ],
      "initiative": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-kraftvoller-griff",
    "name": "Kraftvoller Griff",
    "description": "Deine Hände packen sicher und kräftig zu, sind bei feinen Handgriffen aber weniger behutsam: +1 auf Athletik, −1 auf Fingerfertigkeit.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/kraftvoller-griff.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Athletik",
          "bonus": 1
        },
        {
          "name": "Fingerfertigkeit",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-behutsame-haende",
    "name": "Behutsame Hände",
    "description": "Du arbeitest an kleinen Dingen und bei der Versorgung besonders vorsichtig; spontane Handlungen fallen dir schwerer: +1 auf Fingerfertigkeit und Heilkunde, −1 Initiative. Medizinische Kenntnisse werden dadurch nicht ersetzt.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/behutsame-haende.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Fingerfertigkeit",
          "bonus": 1
        },
        {
          "name": "Heilkunde",
          "bonus": 1
        }
      ],
      "initiative": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-federnder-gang",
    "name": "Federnder Gang",
    "description": "Dein schwungvoller Gang unterstützt schnelle, bewegliche Schritte, ist aber hörbarer: +1 auf Akrobatik und +1 m Bewegung, −1 auf Heimlichkeit.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/federnder-gang.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": 1
        },
        {
          "name": "Heimlichkeit",
          "bonus": -1
        }
      ],
      "movement": 1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-leiser-tritt",
    "name": "Leiser Tritt",
    "description": "Du setzt jeden Schritt bedacht und möglichst geräuschlos: +1 auf Heimlichkeit, −1 m Bewegung.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/leiser-tritt.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Heimlichkeit",
          "bonus": 1
        }
      ],
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-zaeher-marsch",
    "name": "Zäher Marsch",
    "description": "Du teilst körperliche Anstrengung gut ein und hältst ein gleichmäßiges, langsameres Tempo: +1 auf Athletik und Körperbeherrschung, −1 m Bewegung. Keine automatische Immunität gegen Erschöpfung.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/zaeher-marsch.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Athletik",
          "bonus": 1
        },
        {
          "name": "Körperbeherrschung",
          "bonus": 1
        }
      ],
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-hastiger-schritt",
    "name": "Hastiger Schritt",
    "description": "Du bist rasch unterwegs und setzt deine Füße dabei weniger sorgfältig: +1 m Bewegung, −1 auf Akrobatik.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/hastiger-schritt.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "movement": 1,
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-wissensdurst",
    "name": "Wissensdurst",
    "description": "Du sammelst gern Erzählungen und Naturbeobachtungen, verlierst dabei aber dein unmittelbares Umfeld aus dem Blick: +1 auf Geschichte und Naturkunde, −1 auf Wahrnehmung. Unbekanntes Wissen muss weiterhin beschafft werden.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/wissensdurst.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Geschichte",
          "bonus": 1
        },
        {
          "name": "Naturkunde",
          "bonus": 1
        },
        {
          "name": "Wahrnehmung",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-unerschuetterliche-ruhe",
    "name": "Unerschütterliche Ruhe",
    "description": "Du hältst Atmung und Körper auch bei Schrecken ruhiger, brauchst aber einen Moment zum Anlaufen: +1 auf Körperbeherrschung und Rettungswürfe gegen Furcht, −1 Initiative.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/unerschuetterliche-ruhe.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Körperbeherrschung",
          "bonus": 1
        }
      ],
      "saveModifiers": [
        {
          "kind": "fear",
          "bonus": 1
        }
      ],
      "initiative": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-trockener-humor",
    "name": "Trockener Humor",
    "description": "Deine knappen, nüchternen Pointen gelingen vor Publikum besser als bei zärtlichen Annäherungen: +1 auf Auftreten, −1 auf Flirten.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/trockener-humor.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Auftreten",
          "bonus": 1
        },
        {
          "name": "Flirten",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-skeptischer-zuhoerer",
    "name": "Skeptischer Zuhörer",
    "description": "Du achtest auf verborgene Absichten und hältst deine eigenen zurück, wirkst dabei jedoch misstrauisch: +1 auf Motiv erkennen und Täuschen, −1 auf Überzeugen.",
    "cost": 1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/skeptischer-zuhoerer.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Allgemeine Eigenschaft",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Motiv erkennen",
          "bonus": 1
        },
        {
          "name": "Täuschen",
          "bonus": 1
        },
        {
          "name": "Überzeugen",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-talent-kundschafter",
    "name": "Kundschafter",
    "description": "Unauffällig und aufmerksam unterwegs: +1 m Bewegung, +2 auf Heimlichkeit und je +1 auf Wahrnehmung und Überleben.",
    "cost": 4,
    "icon": "/AleriaAlmanach/assets/development-traits/web/talent-kundschafter.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Talent",
    "mechanics": {
      "movement": 1,
      "skillModifiers": [
        {
          "name": "Heimlichkeit",
          "bonus": 2
        },
        {
          "name": "Wahrnehmung",
          "bonus": 1
        },
        {
          "name": "Überleben",
          "bonus": 1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-rechthaberei",
    "name": "Rechthaberei",
    "description": "Du bestehst nachdrücklich auf deiner Sicht und übersiehst dabei leichter, was andere bewegt: +1 auf Einschüchtern, −1 auf Motiv erkennen.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-rechthaberei.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Einschüchtern",
          "bonus": 1
        },
        {
          "name": "Motiv erkennen",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-umwege-aus-neugier",
    "name": "Umwege aus Neugier",
    "description": "Du schweifst mit Blick und Schritten gern zum Rand des Weges ab: +1 auf Wahrnehmung, −1 m Bewegung. Der Wahrnehmungsbonus gilt allgemein, ohne automatisches Entdecken verborgener Dinge.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-umwege-aus-neugier.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Wahrnehmung",
          "bonus": 1
        }
      ],
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-nestelnde-finger",
    "name": "Nestelnde Finger",
    "description": "Du beschäftigst die Hände ständig mit Schnüren, Knöpfen und kleinen Bewegungen; dabei entgeht dir eher etwas im Umfeld: +1 auf Fingerfertigkeit, −1 auf Wahrnehmung.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-nestelnde-finger.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Fingerfertigkeit",
          "bonus": 1
        },
        {
          "name": "Wahrnehmung",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-notizdrang",
    "name": "Notizdrang",
    "description": "Du hältst Erlebtes und gehörte Überlieferungen beharrlich fest und hältst vor spontanem Handeln erst inne: +1 auf Geschichte, −1 Initiative. Unbekanntes Wissen wird dadurch nicht verfügbar.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-notizdrang.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Geschichte",
          "bonus": 1
        }
      ],
      "initiative": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-schuhputzfimmel",
    "name": "Schuhputzfimmel",
    "description": "Du hältst beim Gehen immer wieder kurz inne, um Staub oder Schlamm von den Schuhen zu streifen: −1 m Bewegung. Die Verzögerung wird als allgemeiner Bewegungsabzug geführt.",
    "cost": -1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-schuhputzfimmel.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "movement": -1
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-marotte-kraeftemessen",
    "name": "Ständiges Kräftemessen",
    "description": "Jahrelange Gewohnheit kraftbetonter Wettbewerbe hat dich im Ziehen, Stemmen und Ringen geübt; fremde Absichten verlieren sich hinter deinem Siegeswillen: +1 auf Athletik, −1 auf Motiv erkennen.",
    "cost": 0,
    "icon": "/AleriaAlmanach/assets/development-traits/web/marotte-kraeftemessen.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Solange ausgewählt und aktiv",
    "tags": "Charakterentwicklung · Marotte",
    "mechanics": {
      "skillModifiers": [
        {
          "name": "Athletik",
          "bonus": 1
        },
        {
          "name": "Motiv erkennen",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-chronisches-hinken",
    "name": "Chronisches Hinken",
    "description": "Dauerhaft beeinträchtigter Gang: −1 m Bewegung und −1 auf Akrobatik.",
    "cost": -1,
    "icon": "/AleriaAlmanach/assets/development-traits/web/chronisches-hinken.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Dauerhaftes Leiden",
    "mechanics": {
      "movement": -1,
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-versteiftes-knie",
    "name": "Versteiftes Knie",
    "description": "−2 m Bewegung und −2 auf Akrobatik. Die Einschränkung bleibt nach Rasten bestehen.",
    "cost": -2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/versteiftes-knie.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Dauerhaftes Leiden",
    "mechanics": {
      "movement": -2,
      "skillModifiers": [
        {
          "name": "Akrobatik",
          "bonus": -2
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-fehlender-fuss",
    "name": "Fehlender Fuß",
    "description": "Ein Fuß fehlt oder ist dauerhaft unbrauchbar: −3 m Bewegung und −2 auf Körperbeherrschung. Hilfsmittel werden individuell abgebildet.",
    "cost": -3,
    "icon": "/AleriaAlmanach/assets/development-traits/web/fehlender-fuss.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Dauerhaftes Leiden",
    "mechanics": {
      "movement": -3,
      "skillModifiers": [
        {
          "name": "Körperbeherrschung",
          "bonus": -2
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-wirbelsaeulenverkruemmung",
    "name": "Angeborene Wirbelsäulenverkrümmung",
    "description": "−1 auf Athletik und Körperbeherrschung sowie −1 m Bewegung.",
    "cost": -2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/wirbelsaeulenverkruemmung.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Dauerhaftes Leiden · Angeboren",
    "mechanics": {
      "movement": -1,
      "skillModifiers": [
        {
          "name": "Athletik",
          "bonus": -1
        },
        {
          "name": "Körperbeherrschung",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-human-1",
    "name": "Arkanes Fieber I. Stadium",
    "description": "Müdigkeit, Blässe und entzündete Augen. −1 auf Fertigkeiten, Rettungswürfe und Initiative; −1 m Bewegung. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-human-1.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -1,
      "initiative": -1,
      "savingThrow": -1,
      "movement": -1,
      "maximumHitPoints": 0
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-human-2",
    "name": "Arkanes Fieber II. Stadium",
    "description": "Krämpfe, Fieber und Organstörungen. −2 auf Fertigkeiten, Rettungswürfe und Initiative; −2 m Bewegung; −2 maximale TP. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -4,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-human-2.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -2,
      "initiative": -2,
      "savingThrow": -2,
      "movement": -2,
      "maximumHitPoints": -2
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-human-3",
    "name": "Arkanes Fieber III. Stadium",
    "description": "Fortschreitende Nekrose und geistiger Verfall. −3 auf Fertigkeiten, Rettungswürfe und Initiative; −3 m Bewegung; −6 maximale TP. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -6,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-human-3.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -3,
      "initiative": -3,
      "savingThrow": -3,
      "movement": -3,
      "maximumHitPoints": -6
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-human-4",
    "name": "Arkanes Fieber IV. Stadium",
    "description": "Vollständiger Ich-Verlust. −4 auf Fertigkeiten, Rettungswürfe und Initiative; −4 m Bewegung; −8 maximale TP. Keine selbstbestimmten Kampfhandlungen; Abwarten bleibt möglich. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -8,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-human-4.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -4,
      "initiative": -4,
      "savingThrow": -4,
      "movement": -4,
      "maximumHitPoints": -8,
      "blocksActions": true
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-druid-1",
    "name": "Arkanes Fieber I. Stadium (Druidenvariante)",
    "description": "Erschöpfung und gestörte Aura. −1 auf Fertigkeiten, Rettungswürfe und Initiative; −1 m Bewegung; zusätzlich −1 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -2,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-druid-1.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -1,
      "initiative": -1,
      "savingThrow": -1,
      "movement": -1,
      "saveAttributeModifiers": [
        {
          "attributeKey": "wisdom",
          "bonus": -1
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-druid-2",
    "name": "Arkanes Fieber II. Stadium (Druidenvariante)",
    "description": "Halluzinationen und instabile Instinkte. −2 auf Fertigkeiten, Rettungswürfe und Initiative; −2 m Bewegung; zusätzlich −2 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -4,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-druid-2.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -2,
      "initiative": -2,
      "savingThrow": -2,
      "movement": -2,
      "saveAttributeModifiers": [
        {
          "attributeKey": "wisdom",
          "bonus": -2
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-druid-3",
    "name": "Arkanes Fieber III. Stadium (Druidenvariante)",
    "description": "Schwerer geistiger Verfall ohne Nekrose. −3 auf Fertigkeiten, Rettungswürfe und Initiative; −3 m Bewegung; zusätzlich −3 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -6,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-druid-3.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -3,
      "initiative": -3,
      "savingThrow": -3,
      "movement": -3,
      "saveAttributeModifiers": [
        {
          "attributeKey": "wisdom",
          "bonus": -3
        }
      ]
    },
    "triggerRules": []
  },
  {
    "id": "development-trait-arkanes-fieber-druid-4",
    "name": "Arkanes Fieber IV. Stadium (Druidenvariante)",
    "description": "Vollständiger Ich-Verlust ohne Nekrose. −4 auf Fertigkeiten, Rettungswürfe und Initiative; −4 m Bewegung; zusätzlich −4 auf WEI-Rettungswürfe. Keine selbstbestimmten Kampfhandlungen; Abwarten bleibt möglich. Keine Heilung durch TP-Heilung oder Rast.",
    "cost": -8,
    "icon": "/AleriaAlmanach/assets/development-traits/web/arkanes-fieber-druid-4.webp",
    "type": "trait",
    "active": true,
    "target": "Selbst",
    "duration": "Dauerhaft",
    "appliesWhen": "Dauerhaft; nicht durch Heilung oder Rast entfernt",
    "limitations": "",
    "tags": "Charakterentwicklung · Arkanistenfieber",
    "mechanics": {
      "skill": -4,
      "initiative": -4,
      "savingThrow": -4,
      "movement": -4,
      "saveAttributeModifiers": [
        {
          "attributeKey": "wisdom",
          "bonus": -4
        }
      ],
      "blocksActions": true
    },
    "triggerRules": []
  }
]);
