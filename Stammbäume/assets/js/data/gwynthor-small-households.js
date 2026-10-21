import { GWYNTHOR_HOUSEHOLDS } from '../../../../AleriaAlmanach/modules/gwynthor-heime/households.mjs';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const GWYNTHOR_SMALL_HOUSEHOLD_FAMILIES = GWYNTHOR_HOUSEHOLDS.map(home => {
  const id = `haus-${home.slug}`, houseId = `house-${home.slug}`;
  const emblem = `../AleriaAlmanach/assets/gwynthor-heime/${home.slug}/wappen.png`;
  const base = createFounderPlaceholderHouseFamily({ id, title: `Familie ${home.surname}`, emblem,
    houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' }),
    description: home.summary });
  const [father, mother, ...children] = home.people;
  const marriage = createMarriage(`marriage-${home.slug}`, father.id, mother.id, { start: home.marriageYear, notes: `Gemeinsamer Haushalt im ${home.district} von Gwynthor.`,
    extensions: { ...(children.length === 1 ? { chartAlignParentPairOverChildPersonId: children[0].id } : children.length > 1 ? { chartAlignChildGroupBelowParentPair: true } : {}),
      registryManagedExtensionFields: ['chartAlignParentPairOverChildPersonId', 'chartAlignChildGroupBelowParentPair'] } });
  return Object.freeze({ ...base,
    persons: home.people.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex, birth: p.birth,
      houseId: p.married ? '' : houseId, familyRole: p.married ? 'married' : 'core', lineageRole: p.id === father.id ? 'mainline' : 'branch', title: p.role,
      portrait: `../AleriaAlmanach/${p.portrait.slice(2)}`, notes: p.bio,
      extensions: { appearance: p.appearance, culture: p.culture, portraitAge: p.age,
        registryManagedFields: ['name', 'title', 'portrait', 'notes', 'lineageRole'], registryManagedExtensionFields: ['appearance', 'culture', 'portraitAge'],
        ...(p.workplaceModuleId ? { workplaceModuleId: p.workplaceModuleId, sourcePersonId: 'llinos', sourceGroup: 'Die Krumme Kanne' } : {}) } })),
    partnerships: [marriage], parentages: createParentages(children.map(p => p.id), marriage.participantIds, marriage.id),
    lineage: { ...base.lineage, founderPartnershipId: marriage.id, crestSubtitle: home.district },
    view: { ...base.view, focusPersonId: father.id, ancestorDepth: 2, descendantDepth: 2, limitGenerations: false },
    extensions: { ...base.extensions, blankFamily: false, sourceRevision: 2, chartLayoutPolicy: 'strict-v1', registryManagedExtensionFields: ['chartLayoutPolicy'],
      sourceNote: 'Drei kleine private Haushalte aus dem Nutzerauftrag vom 20.10.2026. Nur der derzeitige Familienkreis; keine erfundene ältere Dynastie. Llinos ist dieselbe Person wie die Hausmagd der Krummen Kanne und behält ihre Identität und ihr Porträt.' }
  });
});
