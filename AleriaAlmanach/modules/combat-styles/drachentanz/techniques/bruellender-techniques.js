import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';
import { createExpertPathTechnique } from './expert-path-helpers.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.bruellender;
const make = spec => createExpertPathTechnique(F, 'bruellender', { attackBonus: -1, ...spec });

export const ARTHWYR_EARLY_ROARING_TECHNIQUE = Object.freeze(make({
  slug: 'welpengebruell', name: 'Welpengebrüll', minimumLevel: 6, slotBands: ['earlyRoaring'], costs: ['action', 'special-action'],
  description: 'Der Arthwyr stößt den ersten rauen Ruf des Pfades aus und hämmert die schwere Waffe gegen die Deckung.',
  effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1,
  allowedClassIds: ['arthwyr'], classWeaponProfiles: { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] }, weaponRuleSetId: '', uchelwyrCompatible: false
}));

export const BRUELLENDER_TECHNIQUES = Object.freeze([
  make({ slug: 'brechender-ruf', name: 'Brechender Ruf', minimumLevel: 9, costs: ['action', 'bonus-action'], uchelwyrLance: true,
    description: 'Ein scharfer Kampfruf begleitet einen geraden, kraftvollen Schlag gegen die Mitte der Deckung.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf senkt die Rüstungsklasse des Ziels um 1.', secondarySave: secondarySave('bruellender-ruf', 'Erschütterte Deckung', 'Der brechende Schlag öffnet die Verteidigung.', { armorClass: -1 }) }),
  make({ slug: 'schulter-des-kraftdrachen', name: 'Schulter des Kraftdrachen', minimumLevel: 10, costs: ['action', 'reaction'],
    description: 'Körper und Waffe treffen gemeinsam und treiben den Gegner aus seinem Stand.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt −1 Angriff und −1 Rüstungsklasse.', secondarySave: secondarySave('bruellender-schulter', 'Versetzter Stand', 'Der Körperstoß verschiebt den Schwerpunkt.', { attack: -1, armorClass: -1 }) }),
  make({ slug: 'panzerbeisser', name: 'Panzerbeißer', minimumLevel: 11, costs: ['action', 'reaction'], uchelwyrLance: true,
    description: 'Der Angriff zielt auf Fuge, Schildrand oder den schwächsten Punkt einer schweren Rüstung.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 2 Punkte niedriger.', targetDefenseModifier: -2 }),
  make({ slug: 'hallender-rundschlag', name: 'Hallender Rundschlag', minimumLevel: 12, costs: ['action', 'special-action'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Ein breiter Kraftkreis zwingt die gesamte Front zurück.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden.' }),
  make({ slug: 'aurabruch', name: 'Aurabruch', minimumLevel: 13, costs: ['action', 'aura-focus'], uchelwyrLance: true,
    description: 'Aura wird im Auftreffen entladen und lässt selbst eine feste Deckung für einen Augenblick nachgeben.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 2 Punkte niedriger.', targetDefenseModifier: -2 }),
  make({ slug: 'eisernes-gebruell', name: 'Eisernes Gebrüll', minimumLevel: 14, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Ritter empfängt den gegnerischen Schlag mit angespannter Aura und antwortet aus der Erschütterung.', effect: 'Verursacht Technikschaden und gewährt bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.', effects: [temporaryCondition('bruellender-eisen', 'Eisernes Gebrüll', 'Körper und Aura bilden eine kurze, starre Wehr.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'mauerspalter', name: 'Mauerspalter', minimumLevel: 15, costs: ['action', 'bonus-action', 'reaction'], uchelwyrLance: true,
    description: 'Der Ritter schlägt immer wieder dieselbe Linie, bis Schild, Rüstung oder Haltung bricht.', effect: 'Verursacht Technikschaden; bei misslungenem Konstitutionsrettungswurf −2 Rüstungsklasse.', secondarySave: secondarySave('bruellender-mauerspalter', 'Gespaltene Wehr', 'Die wiederholte Wucht hat die Verteidigung aufgebrochen.', { armorClass: -2 }, { attributeKey: 'constitution' }) }),
  make({ slug: 'erdbebenpranke', name: 'Erdbebenpranke', minimumLevel: 16, costs: ['action', 'reaction', 'special-action'], maximumTargets: 4, target: 'Bis zu vier Gegner',
    description: 'Ein bodennaher Kraftschlag trägt die Erschütterung durch die gesamte gegnerische Reihe.', effect: 'Trifft bis zu vier Gegner mit je Technikschaden; misslingt ein Stärkerettungswurf, verlieren sie 1 Rüstungsklasse.', secondarySave: secondarySave('bruellender-erdbeben', 'Erschütterte Reihe', 'Der Bodenstoß nimmt der Reihe ihren festen Stand.', { armorClass: -1 }) }),
  make({ slug: 'herzschlag-des-kolosses', name: 'Herzschlag des Kolosses', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'], uchelwyrLance: true,
    description: 'Ein einziger schwerer Schlag wird im Rhythmus von Herz und Aura bis in die gegnerische Rüstung getragen.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 2 Punkte niedriger.', targetDefenseModifier: -2 }),
  make({ slug: 'ruestungssenker', name: 'Rüstungssenker', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Der Meister zwingt seine Aura durch jede starre Schicht und lässt die gesamte Wehr nach unten brechen.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 3 Punkte niedriger.', targetDefenseModifier: -3 }),
  make({ slug: 'bruellende-katastrophe', name: 'Brüllende Katastrophe', minimumLevel: 19, costs: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'], maximumTargets: 4, target: 'Bis zu vier Gegner',
    description: 'Eine Folge vernichtender Rundschläge rollt wie ein Einsturz durch die feindliche Front.', effect: 'Trifft bis zu vier Gegner mit je Technikschaden.' }),
  make({ slug: 'weltenbrecher', name: 'Weltenbrecher', minimumLevel: 20, costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister sammelt Körper, Waffe und Aura in einem Schlag, der jede feste Linie als vorläufig behandelt.', effect: 'Verursacht Technikschaden, senkt die Zielverteidigung um 3 und gibt bei misslungenem Konstitutionsrettungswurf −2 Angriff und −2 Rüstungsklasse.', targetDefenseModifier: -3,
    secondarySave: secondarySave('bruellender-weltenbrecher', 'Vernichtete Haltung', 'Der Weltenbrecher lässt Angriff und Verteidigung zusammenbrechen.', { attack: -2, armorClass: -2 }, { attributeKey: 'constitution' }) })
]);
