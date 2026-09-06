import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js';
import { createDrachentanzTechnique, temporaryCondition, movementEffect } from './drachentanz-technique-factory.js';

const make = spec => createDrachentanzTechnique({
  formId: F.jungdrache, status: 'confirmed', tier: 'Grundform', slotBands: ['foundation'],
  branchId: 'teulu-sword', allowedClassIds: ['teulu'], classWeaponProfiles: { teulu: ['sword'] },
  weaponTypes: ['sword'], ...spec
});

export const TEULU_FOUNDATION_ADDITIONS = Object.freeze([
  make({ slug: 'jungdrache-schuppenschnitt', name: 'Schuppenschnitt', minimumLevel: 2,
    description: 'Ein sauberer Diagonalhieb aus festem Stand, ohne die ganze Folge vorwegzunehmen.',
    effect: 'Ein kräftiger Einzelhieb mit Technikschaden. Bonusaktion und Reaktion bleiben verfügbar.',
    costs: ['action'] }),
  make({ slug: 'jungdrache-geschlossene-schuppe', name: 'Geschlossene Schuppe', minimumLevel: 3,
    description: 'Der Teulu nimmt die Klinge eng vor den Körper und schließt seine offene Seite.',
    effect: 'Kein Schaden. +2 RK bis zum Ende des nächsten eigenen Kampfposts. Erneutes Anwenden erneuert nur die Dauer.',
    activationType: 'reaction', costs: ['reaction'], noPrimaryDamage: true, target: 'Selbst',
    effects: [temporaryCondition('teulu-geschlossene-schuppe', 'Geschlossene Schuppe',
      'Die enge Klingenhaltung gewährt +2 RK bis zum Ende des nächsten eigenen Kampfposts.',
      { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  make({ slug: 'jungdrache-fluegelschritt', name: 'Flügelschritt des Jungdrachens', minimumLevel: 4,
    description: 'Ein kurzer Schnitt begleitet den seitlichen Schritt in eine gedeckte Waffenlinie.',
    effect: 'Technikschaden; bei Treffer bis zu 2 m Eigenbewegung im verfügbaren Bewegungsbudget und +1 RK bis zum Ende des nächsten eigenen Kampfposts.',
    activationType: 'bonus-action', costs: ['bonus-action', 'special-action'],
    effects: [movementEffect('teulu-fluegelschritt', 2, 'move', 'self', 'Freier Weg und verbleibende Bewegung erforderlich.'),
      temporaryCondition('teulu-fluegelschritt', 'Gedeckter Flügel', 'Der gedeckte Seitenschritt gewährt vorübergehend +1 RK.',
        { armorClass: 1 }, { target: 'self' })] }),
  make({ slug: 'jungdrache-ruhiger-drachenatem', name: 'Ruhiger Drachenatem', minimumLevel: 6,
    description: 'Ein bewusster Atemzug ordnet Griff, Blick und den nächsten Schwerthieb.',
    effect: 'Kein Schaden. +1 Angriff bis zum Ende des nächsten eigenen Kampfposts. Wiederholtes Vorbereiten stapelt den Bonus nicht.',
    activationType: 'bonus-action', costs: ['bonus-action'], noPrimaryDamage: true, target: 'Selbst',
    effects: [temporaryCondition('teulu-drachenatem', 'Ruhiger Drachenatem', 'Der gesammelte Atem gibt +1 auf Angriffswürfe.',
      { attack: 1 }, { target: 'self', on: 'always' })] })
]);
