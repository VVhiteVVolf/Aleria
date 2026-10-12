import { SPEERDRACHEN_TECHNIQUES } from '../../combat-styles/drachentanz/techniques/spear-path-techniques.js';
import { createDrachentanzTechnique, secondarySave, temporaryCondition } from '../../combat-styles/drachentanz/techniques/drachentanz-technique-factory.js';

export const NUDD_CHARACTER_ID = 'person--haus-saethwyr--nudd-saethwyr';
const formId = 'nudd-speerdrache-vorformen';
const shared = {
  formId, minimumLevel: 6, status: 'confirmed', maximumTargets: 1, singleTargetOnly: true,
  allowedClassIds: ['cantref'], weaponTypes: ['spear', 'polearm'],
  classWeaponProfiles: { cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'] },
  weaponRuleSetId: 'cantref-polearm', auraBypassAllowed: false,
  requirements: 'Persönliche Ausbildung Nudds; ein geführter Speer oder eine passende Stangenwaffe.',
  tier: 'Persönliche Vorform',
  designNotes: 'Persönliche abgeschwächte Ausbildung auf Stufe 6; schaltet keine Expertenform und keinen Klassenpfad frei.'
};

function personalTechnique(spec) {
  const technique = createDrachentanzTechnique({ ...shared, ...spec });
  technique.damageModel.weaponBonuses = (technique.damageModel.weaponBonuses || []).map(group => ({ ...group, dieCap: Math.min(6, group.dieCap) }));
  // Personal IDs survive the automatic, canonical class-arsenal reconciliation.
  return { ...technique, id: `nudd-${spec.slug}`, trainingForm: spec.trainingForm || 'Tanz des Speerdrachens · Persönliche Vorformen' };
}

function spearPrelude(sourceSlug, spec) {
  const source = SPEERDRACHEN_TECHNIQUES.find(entry => entry.id === `combat-style-drachentanz-${sourceSlug}`);
  if (!source) throw new Error(`Unbekannte Speerdrachen-Vorlage: ${sourceSlug}`);
  return personalTechnique({ ...spec, description: `${source.description} Nudd beherrscht eine abgeschwächte Vorform.`,
    mechanicNotes: [`Abgeleitet von ${source.name} (regulär ab Stufe ${source.minimumLevel}).`],
    designNotes: `${shared.designNotes} Quelle: ${source.id}.` });
}

export function createNuddPersonalTechniques() {
  const watch = temporaryCondition('nudd-wacht', 'Unbeirrbare Wacht', 'Der nächste schädigende Treffer verursacht 3 Schaden weniger.', {},
    { target: 'self', on: 'always', stanceGroup: 'nudd-guard' });
  watch.condition.damageGuard = { reduction: 3, charges: 1 };
  return [
    spearPrelude('speerdrache-fliessende-eroeffnung', {
      slug: 'fliessende-eroeffnung', name: 'Fließende Eröffnung · Vorform', costs: ['action', 'reaction'], attackBonus: 1,
      effect: 'Ein Angriff mit Technikschaden und +1 Angriff. Die Vorform gewährt keinen zusätzlichen Stellungsschutz.'
    }),
    spearPrelude('speerdrache-gleitende-bindung', {
      slug: 'gleitende-bindung', name: 'Gleitende Bindung · Vorform', costs: ['reaction', 'special-action'],
      effect: 'Ein Angriff mit Technikschaden; bis zum Ende des nächsten eigenen Beitrags +1 RK. Andere positive Kampfform-RK-Haltungen werden nicht addiert.',
      effects: [temporaryCondition('nudd-bindung', 'Gleitende Bindung', 'Die geführte Waffenlinie gewährt +1 RK.',
        { armorClass: 1 }, { target: 'self', on: 'always', stanceGroup: 'nudd-guard' })]
    }),
    spearPrelude('speerdrache-rankenspitze', {
      slug: 'rankenspitze', name: 'Rankenspitze · Vorform', costs: ['action', 'special-action'], targetDefenseModifier: -1,
      effect: 'Ein Angriff mit Technikschaden; die Zielverteidigung zählt für diesen Angriff als 1 Punkt niedriger.'
    }),
    personalTechnique({
      slug: 'pflicht-vor-ruhm', name: 'Pflicht vor Ruhm', costs: ['action', 'special-action'],
      trainingForm: 'Nudd Saethwyr · Persönliche Techniken',
      description: 'Nudd verzichtet auf einen prunkvollen Ausfall und drängt mit einem nüchternen Stoß den Gegner aus seinem Angriffstakt. Eine Waffenlehre aus seinem Pflichtverständnis, ohne magische Glaubenswirkung.',
      effect: 'Ein Angriff mit Technikschaden. Nach einem Treffer: KRF-Rettungswurf gegen 8 + Nudds KRF-Modifikator + Übungsbonus; bei Scheitern −1 Angriff für einen eigenen Beitrag.',
      secondarySave: secondarySave('nudd-pflicht', 'Gestörter Angriffstakt', 'Nudds geradliniger Pflichtstoß stört die Waffenführung: −1 Angriff für einen eigenen Beitrag.', { attack: -1 })
    }),
    personalTechnique({
      slug: 'unbeirrbare-wacht', name: 'Unbeirrbare Wacht', costs: ['reaction', 'special-action'],
      trainingForm: 'Nudd Saethwyr · Persönliche Techniken',
      description: 'Mit ruhigem Atem und festem Schaft lässt Nudd auf den Gegenstoß eine sparsame Abfangbewegung folgen. Sein Glaube gibt ihm Disziplin; die Abwehr bleibt rein körperlich.',
      effect: 'Ein Angriff mit Technikschaden. Der nächste schädigende Treffer verursacht 3 Schaden weniger, einmalig bis zum Ende des nächsten eigenen Beitrags; ersetzt andere persönliche Wachthaltungen.',
      effects: [watch]
    })
  ];
}

export function applyNuddPersonalTraining(profile) {
  const techniques = createNuddPersonalTechniques();
  const ids = new Set(techniques.map(entry => entry.id));
  return { ...profile, techniques: [...(profile.techniques || []).filter(entry => !ids.has(entry.id)), ...techniques] };
}
