import { applyCondition, condition, costs, creatureAbility, damage, encounterCard, naturalAttack } from './encounter-card-model.js';

const prone = condition('raubtier-niedergeworfen', 'Liegend', 'Der Angriff bringt das Ziel zu Fall.', {
  presetId: 'prone', blockedResource: 'bonus-action'
});

const packMark = condition('rhewddann-rudelspur', 'Vom Rudel bedrängt', 'Ein anderer Rhewddann findet eine offene Flanke.', { creatureMark: 'rhewddann' });

export const PREDATOR_ENCOUNTERS = [
  encounterCard({ id: 'madruach-urgr', groupId: 'urgren', name: 'Madrúach Urgr', species: 'Madrúach',
    habitat: 'Bergwälder und Ruinen in Celtigerns Wacht', level: 14, hp: 184, defense: 17, speed: 10, size: 'Groß', hitDie: 12,
    scores: [23, 12, 22, 7, 15, 13], saves: ['strength', 'constitution', 'wisdom'], tags: ['urgr'],
    traits: [{ id: 'urgr-masse', name: 'Unnachgiebiger Körper', description: 'Massiger Urgr mit schweren Pranken. Geübt in Stärke-, Konstitutions- und Weisheitsrettungen.' }],
    weapons: [naturalAttack('urgr-tatze', 'Schwere Tatze', '2d8', 'Hieb')],
    abilities: [
      creatureAbility('urgr-prankenbogen', 'Brechender Prankenbogen', { activationType: 'special-action', costs: costs('special-action', 'action', 'bonus-action'),
        saveDc: 16, saveAttribute: 'dexterity', resolutionType: 'saving-throw', maximumTargets: 3, halfDamageOnSave: true, range: 'Umkreis · 3 m',
        description: 'Weiter Prankenschlag gegen bis zu drei Gegner. Misslungene GES-Rettung wirft zu Boden.',
        effects: [damage('urgr-prankenwucht', '4d8', 'Hieb', 'hit', 'selected'), applyCondition(prone, 'save-failure', 'selected')] }),
      creatureAbility('urgr-bruell', 'Ohrenbetäubendes Brüllen', { costs: costs('action', 'reaction'), requiresVoice: true,
        saveDc: 16, saveAttribute: 'constitution', resolutionType: 'saving-throw', maximumTargets: 4, range: 'Umkreis · 8 m',
        description: 'Wer die KON-Rettung verfehlt, verliert bis zum Ende seines nächsten Beitrags den Zugriff auf Reaktionen.',
        effects: [applyCondition(condition('urgr-reaktion-gesperrt', 'Vom Brüllen benommen', 'Reaktionen gesperrt.', { blockedResource: 'reaction' }), 'save-failure', 'selected')] })]
  }),
  encounterCard({ id: 'rhewddann-warg', groupId: 'warge', name: 'Rhewddann Warg', species: 'Rhewddann',
    habitat: 'Gebirgspässe und Höhlensysteme Cenyrs', level: 5, hp: 65, defense: 15, speed: 14, size: 'Groß', hitDie: 10,
    scores: [17, 16, 15, 7, 14, 9], saves: ['dexterity', 'wisdom'], tags: ['tier', 'warg'],
    traits: [{ id: 'rhewddann-rudeldruck', name: 'Rudeldruck', description: 'Ein verbündeter Rhewddann erhält +1 auf seinen Angriff gegen ein bereits bedrängtes Ziel.',
      triggerRules: [{ id: 'rhewddann-rudeldruck', name: 'Rudeldruck', actionScope: 'global', phase: 'pre-roll', weaponAttackOnly: true,
        requiredOtherMark: 'rhewddann', effects: { attackModifier: 1 } }] }],
    weapons: [naturalAttack('rhewddann-biss', 'Rudelbiss', '1d10', 'Stich', { triggerRules: [{ id: 'rhewddann-spur', name: 'Vom Rudel bedrängt',
      recipient: 'actor', actionScope: 'entry', phase: 'pre-hit-damage', condition: 'would-hit', resultEffects: [applyCondition(packMark)] }] })],
    abilities: [creatureAbility('rhewddann-sprung', 'Niedersprung', { costs: costs('action', 'reaction'), range: 'Anlauf · bis 6 m',
      saveDc: 13, saveAttribute: 'strength', resolutionType: 'saving-throw', description: 'Ein Sprung, der das Ziel bei misslungener ST-Rettung zu Boden reißt.',
      effects: [damage('niedersprung-schaden', '2d6', 'Wucht'), applyCondition(prone, 'save-failure'), applyCondition(packMark, 'save-failure')] })]
  }),
  encounterCard({ id: 'ulfr-warg', groupId: 'warge', name: 'Ulfr Warg', species: 'Ulfr',
    habitat: 'Schneisen in dunklen Nadelwäldern Nordestrylls', level: 4, hp: 47, defense: 15, speed: 15, size: 'Groß', hitDie: 10,
    scores: [15, 18, 13, 6, 14, 8], saves: ['dexterity'], tags: ['tier', 'warg'],
    traits: [{ id: 'ulfr-jagd', name: 'Lauerjäger', description: 'Der Ulfr stößt aus dem Schatten vor und verbeißt sich in einzelne Beute.' }],
    weapons: [naturalAttack('ulfr-biss', 'Reißbiss', '1d8', 'Stich', { attackAttribute: 'dexterity', damageAttribute: 'dexterity' })],
    abilities: [creatureAbility('ulfr-schwarzsprung', 'Schwarzsprung', { costs: costs('action', 'bonus-action'), rollFormula: '2d6', damageType: 'Stich',
      range: 'Anlauf · bis 6 m', description: 'Schneller Biss. Ein Treffer verwundet das Bein und mindert die Bewegung bis zum nächsten Beitrag um 3 m.',
      effects: [damage('schwarzsprung-schaden', '2d6', 'Stich'), applyCondition(condition('ulfr-bein', 'Gerissene Sehne', '−3 m Bewegung.', { mechanics: { movement: -3 } }))] })]
  })
];
