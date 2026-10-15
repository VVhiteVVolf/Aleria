// Reduced, immutable rendering fixtures from the recorded Asgeir–Nudd duel. No current character mechanics.
export const fourStrikes = {
  "actorId": "oUlhJyX6C4Q69mtLS9u1",
  "actorName": "Asgeir Wolfshorn",
  "targetId": "person--haus-saethwyr--nudd-saethwyr",
  "targetName": "Nudd Saethwyr",
  "profileActionKind": "technique",
  "attack": {
    "notation": "1d20+8",
    "naturalRoll": 4,
    "diceResults": [
      4
    ],
    "keptDice": [
      4
    ],
    "modifier": 8,
    "total": 12,
    "targetDefense": 16,
    "resolutionMode": "weapon-attack",
    "rollOwner": "actor",
    "saveAttribute": "",
    "saveSucceeded": null,
    "forcedSuccess": false,
    "rollMode": "normal",
    "criticalSuccess": false,
    "criticalFailure": false,
    "hit": false,
    "visualMode": "server-validated",
    "rollId": "c2d58e0f-f698-4c70-b21a-b7e627d6c928"
  },
  "damage": {
    "rollSource": "effect",
    "notation": "1d6+6",
    "diceResults": [],
    "modifier": 6,
    "total": 6,
    "primaryTotal": 8,
    "rawTotal": 8,
    "damageReduction": 2,
    "halvedBySave": false,
    "damageType": "Hieb",
    "damageResponse": {
      "response": "normal",
      "sources": [],
      "multiplier": 1
    },
    "visualMode": "text",
    "rollId": ""
  },
  "weapon": {
    "name": "Vier Fänge des Wolfshorns",
    "damageFormula": "1d6",
    "damageType": "Hieb"
  },
  "followUpAttacks": [
    {
      "weaponId": "asgeir-axt-links",
      "weaponName": "Wolfshorn-Axt · linke Hand",
      "sameTarget": true,
      "triggerFurtherEffects": false,
      "wardResolution": null,
      "attack": {
        "naturalRoll": 12,
        "diceResults": [
          12
        ],
        "modifier": 8,
        "total": 20,
        "targetDefense": 16,
        "hit": true,
        "criticalSuccess": false,
        "criticalFailure": false,
        "rollMode": "normal",
        "rollId": "91757427-8614-4b96-9ebe-a2c82c534cfc"
      },
      "damage": {
        "notation": "1d6+6",
        "diceResults": [
          2
        ],
        "modifier": 6,
        "total": 8,
        "reductionBypass": 0,
        "damageType": "Hieb",
        "rollId": "db9362b2-7afa-4f2b-9fc1-9dc7548d67ec"
      }
    },
    {
      "weaponId": "asgeir-axt-rechts",
      "weaponName": "Wolfshorn-Axt · rechte Hand",
      "sameTarget": true,
      "triggerFurtherEffects": false,
      "wardResolution": null,
      "attack": {
        "naturalRoll": 6,
        "diceResults": [
          6
        ],
        "modifier": 8,
        "total": 14,
        "targetDefense": 16,
        "hit": false,
        "criticalSuccess": false,
        "criticalFailure": false,
        "rollMode": "normal",
        "rollId": "a86949f6-6790-4085-92a0-53b13ce9b13e"
      },
      "damage": null
    },
    {
      "weaponId": "asgeir-axt-links",
      "weaponName": "Wolfshorn-Axt · linke Hand",
      "sameTarget": true,
      "triggerFurtherEffects": false,
      "wardResolution": null,
      "attack": {
        "naturalRoll": 2,
        "diceResults": [
          2
        ],
        "modifier": 8,
        "total": 10,
        "targetDefense": 16,
        "hit": false,
        "criticalSuccess": false,
        "criticalFailure": false,
        "rollMode": "normal",
        "rollId": "0da2fc54-faaa-4b43-b876-b60bdf646554"
      },
      "damage": null
    }
  ],
  "secondarySaves": [],
  "targetSnapshot": {
    "currentHitPoints": 56,
    "hitPointsBefore": 56,
    "hitPointsAfter": 50,
    "temporaryHitPointsBefore": 0,
    "temporaryHitPointsAfter": 0,
    "defeated": false,
    "maximumHitPoints": 73,
    "defense": 16,
    "armorName": "Goldene Wacht · Saethwyr-Plattenrüstung"
  },
  "narration": {
    "source": "deterministic",
    "text": "Nudd Saethwyr entzieht sich dem Angriff von Asgeir Wolfshorn, bevor Vier Fänge des Wolfshorns Wirkung entfalten kann.",
    "generatedAt": "2026-10-13T10:05:29.550Z",
    "serverFactChecked": true,
    "contradictions": []
  },
  "actorResourceSnapshot": {
    "changes": [
      {
        "resourceId": "action",
        "name": "Aktion",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "comment"
      },
      {
        "resourceId": "bonus-action",
        "name": "Bonusaktion",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "comment"
      },
      {
        "resourceId": "reaction",
        "name": "Reaktion",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "comment"
      },
      {
        "resourceId": "asgeir-four-fangs-use",
        "name": "Vier Fänge · Kampfnutzung",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "persistent"
      }
    ]
  },
  "effectResults": [
    {
      "effect": {
        "id": "follow-up-damage-1",
        "type": "damage",
        "target": "target",
        "damageType": "Hieb",
        "formula": "",
        "notes": "Vollständig geprüfter Folgeangriff"
      },
      "amount": 8,
      "roll": {
        "notation": "1d6+6",
        "diceResults": [
          2
        ],
        "modifier": 6,
        "total": 8,
        "reductionBypass": 0,
        "damageType": "Hieb",
        "rollId": "db9362b2-7afa-4f2b-9fc1-9dc7548d67ec"
      },
      "applied": {
        "before": {
          "current": 56,
          "maximum": 73,
          "temporary": 0
        },
        "after": {
          "current": 50,
          "maximum": 73,
          "temporary": 0
        },
        "incoming": 6,
        "rawIncoming": 8,
        "hitPointDamage": 6,
        "absorbedByTemporary": 0,
        "equipmentProtection": {
          "reduction": 2,
          "sources": [
            {
              "amount": 2,
              "name": "Saethwyr-Plattenschutz",
              "damageTypes": [
                "hieb",
                "stich"
              ],
              "excludedDamageTypes": [],
              "armorId": "starter-cantref-chainmail",
              "armorName": "Goldene Wacht · Saethwyr-Plattenrüstung"
            }
          ]
        },
        "damageResponse": {
          "response": "normal",
          "sources": [],
          "multiplier": 1
        }
      }
    }
  ],
  "targetConditionSnapshot": null,
  "actorConditionSnapshot": null
};
export const selfCounter = {
  "actorId": "person--haus-saethwyr--nudd-saethwyr",
  "actorName": "Nudd Saethwyr",
  "targetId": "person--haus-saethwyr--nudd-saethwyr",
  "targetName": "Nudd Saethwyr",
  "profileActionKind": "technique",
  "attack": {
    "notation": "1d20+5",
    "naturalRoll": 20,
    "diceResults": [],
    "keptDice": [],
    "modifier": 5,
    "total": 16,
    "targetDefense": 16,
    "resolutionMode": "automatic",
    "rollOwner": "actor",
    "saveAttribute": "",
    "saveSucceeded": null,
    "forcedSuccess": false,
    "rollMode": "normal",
    "criticalSuccess": false,
    "criticalFailure": false,
    "hit": true,
    "visualMode": "automatic",
    "rollId": ""
  },
  "damage": null,
  "weapon": {
    "name": "Entwaffnende Klaue",
    "damageFormula": "",
    "damageType": "Stich"
  },
  "followUpAttacks": [],
  "secondarySaves": [],
  "targetSnapshot": {
    "currentHitPoints": 50,
    "hitPointsBefore": 50,
    "hitPointsAfter": 50,
    "temporaryHitPointsBefore": 0,
    "temporaryHitPointsAfter": 0,
    "defeated": false,
    "maximumHitPoints": 73,
    "defense": 16,
    "armorName": "Goldene Wacht · Saethwyr-Plattenrüstung"
  },
  "narration": {
    "source": "deterministic",
    "text": "Nudd Saethwyr lässt die vorbereitete Wirkung auf Nudd Saethwyr einwirken.",
    "generatedAt": "2026-10-13T10:09:45.122Z",
    "serverFactChecked": true,
    "contradictions": []
  },
  "actorResourceSnapshot": {
    "changes": [
      {
        "resourceId": "action",
        "name": "Aktion",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "comment"
      },
      {
        "resourceId": "reaction",
        "name": "Reaktion",
        "amount": 1,
        "before": 1,
        "after": 0,
        "maximum": 1,
        "scope": "comment"
      },
      {
        "resourceId": "special-action",
        "name": "Besondere Aktion",
        "amount": 1,
        "before": 2,
        "after": 1,
        "maximum": 2,
        "scope": "persistent"
      }
    ]
  },
  "effectResults": [
    {
      "effect": {
        "id": "jungdrache-shared-entwaffnende-klaue-condition",
        "type": "buff",
        "target": "self",
        "damageType": "physisch",
        "formula": "",
        "notes": "Lauert auf den nächsten verfehlten Waffen- oder Technikangriff: ein automatischer Gegenangriff mit Vorteil und normalem Schaden der aktuell geführten Waffe. Bei Treffer: STÄ-Rettungswurf SG 13; bei Scheitern Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene. Einmalig, bis zum Ende des nächsten eigenen Beitrags; keine Konterketten. Treffer des Gegners lösen den Konter nicht aus."
      },
      "roll": null,
      "condition": {
        "id": "jungdrache-shared-entwaffnende-klaue-condition-2883dd5e-3af6-441b-93a2-c1bda2cba038",
        "name": "Entwaffnende Klaue",
        "description": "Lauert auf den nächsten verfehlten Waffen- oder Technikangriff: ein automatischer Gegenangriff mit Vorteil und normalem Schaden der aktuell geführten Waffe. Bei Treffer: STÄ-Rettungswurf SG 13; bei Scheitern Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene. Einmalig, bis zum Ende des nächsten eigenen Beitrags; keine Konterketten. Treffer des Gegners lösen den Konter nicht aus.",
        "duration": "Bis zum Ende des nächsten eigenen Beitrags",
        "mechanics": {},
        "counterAttack": {
          "enabled": true,
          "secondarySave": {
            "enabled": true,
            "attributeKey": "strength",
            "fixedDc": 13,
            "dcBase": 8,
            "dcAttributeKey": "strength",
            "addProficiency": true,
            "failureCondition": {
              "id": "jungdrache-shared-entwaffnet",
              "name": "Entwaffnet",
              "duration": "1 eigener Beitrag",
              "description": "Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene.",
              "disarm": true,
              "mechanics": {}
            }
          }
        }
      },
      "applied": true,
      "recipient": "target"
    }
  ],
  "targetConditionSnapshot": {
    "before": [
      {
        "id": "teulu-geschlossene-schuppe-condition-290dfccb-5fad-4d8f-bb06-e981254ca1cf",
        "name": "Geschlossene Schuppe",
        "description": "Die enge Waffenhaltung gewährt +1 RK bis zum Ende des nächsten eigenen Kampfposts.",
        "duration": "1 eigener Beitrag",
        "mechanics": {
          "armorClass": 1
        }
      },
      {
        "id": "critical:kZG5agcmzyx3xjTGOyOe:9:0",
        "name": "Verheddert",
        "description": "Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.",
        "mechanics": {
          "armorClass": 0,
          "movement": 0
        },
        "blockedResource": "bonus-action"
      }
    ],
    "after": [
      {
        "id": "critical:kZG5agcmzyx3xjTGOyOe:9:0",
        "name": "Verheddert",
        "description": "Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion.",
        "mechanics": {
          "armorClass": 0,
          "movement": 0
        },
        "blockedResource": "bonus-action"
      },
      {
        "id": "jungdrache-shared-entwaffnende-klaue-condition-2883dd5e-3af6-441b-93a2-c1bda2cba038",
        "name": "Entwaffnende Klaue",
        "description": "Lauert auf den nächsten verfehlten Waffen- oder Technikangriff: ein automatischer Gegenangriff mit Vorteil und normalem Schaden der aktuell geführten Waffe. Bei Treffer: STÄ-Rettungswurf SG 13; bei Scheitern Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene. Einmalig, bis zum Ende des nächsten eigenen Beitrags; keine Konterketten. Treffer des Gegners lösen den Konter nicht aus.",
        "duration": "Bis zum Ende des nächsten eigenen Beitrags",
        "mechanics": {},
        "counterAttack": {
          "enabled": true,
          "secondarySave": {
            "enabled": true,
            "attributeKey": "strength",
            "fixedDc": 13,
            "dcBase": 8,
            "dcAttributeKey": "strength",
            "addProficiency": true,
            "failureCondition": {
              "id": "jungdrache-shared-entwaffnet",
              "name": "Entwaffnet",
              "duration": "1 eigener Beitrag",
              "description": "Die geführte Waffe wird entwaffnet und liegt aufnehmbar in der Szene.",
              "disarm": true,
              "mechanics": {}
            }
          }
        }
      }
    ],
    "applied": null
  },
  "actorConditionSnapshot": null
};
