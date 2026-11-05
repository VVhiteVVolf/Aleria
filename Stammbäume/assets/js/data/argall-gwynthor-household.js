import { ARGALL_CAPTAIN_HOME, ARGALL_CAPTAIN_PEOPLE } from '../../../../AleriaAlmanach/modules/fleischsammler-argall/household.mjs';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';

const { captain, squire, mother, bard } = ARGALL_CAPTAIN_PEOPLE;

export const ARGALL_GWYNTHOR_MARRIAGE_ID = 'marriage-rhydric-gwenella-argall';
// Retain the first draft's ID when correcting its relationship type to affair.
export const ARGALL_GWYNTHOR_UNION_ID = 'union-gwenella-maelor-ffionydd';

function householdPerson(spec, familyStatus, residence, familyRole = 'core') {
  const portrait = `..${spec.portrait}`;
  return createFamilyPerson({
    id: spec.id,
    worldPersonId: spec.worldPersonId,
    name: spec.name,
    sex: spec.sex,
    birth: spec.birth,
    houseId: spec.houseId,
    familyRole,
    title: spec.role,
    portrait,
    tags: [`${spec.age} Jahre`],
    notes: spec.biography,
    extensions: {
      registryManagedSourceRevision: 3,
      registryManagedFields: ['portrait', 'title', 'notes', 'familyRole'],
      // Source 7 repairs exactly the former root-relative default and missing
      // images through source 6. Individually supplied portraits stay local.
      registryManagedFieldRevisions: { portrait: 7 },
      registryManagedFieldPreviousValues: { portrait: ['', spec.portrait] },
      registryManagedExtensionFields: ['biographyModule', ...(spec === mother ? ['chartRepeatForPartnershipIds'] : [])],
      registryManagedExtensionFieldRevisions: { biographyModule: 7, ...(spec === mother ? { chartRepeatForPartnershipIds: 7 } : {}) },
      registryManagedExtensionFieldMergeModes: { biographyModule: 'replace-known-paths', ...(spec === mother ? { chartRepeatForPartnershipIds: 'remove-known-values' } : {}) },
      registryManagedExtensionFieldCorrections: {
        biographyModule: [{ path: ['biography', 'portrait'], previousValues: ['', spec.portrait], value: portrait }],
        ...(spec === mother ? { chartRepeatForPartnershipIds: [ARGALL_GWYNTHOR_UNION_ID] } : {})
      },
      ...(spec === mother ? {
        // Retire only the former authored duplicate; other personal views survive.
        chartRepeatForPartnershipIds: []
      } : {}),
      biographyModule: {
        schema: 'aleria.biography-module', schemaVersion: 1,
        stats: [
          { label: 'Vollständiger Name', value: spec.name },
          { label: 'Geboren', value: spec.birth },
          { label: 'Alter im Jahr 1740', value: `${spec.age} Jahre` },
          { label: 'Familienstand', value: familyStatus },
          { label: 'Tätigkeit', value: spec.role },
          { label: 'Wohnsitz', value: residence }
        ],
        biography: {
          portrait,
          biographyTitle: 'Biografie', biographyText: spec.biography,
          extraSections: [{ position: 'afterIntro', mode: 'text', title: 'Erscheinung', text: spec.appearance }]
        }
      }
    }
  });
}

const fortressResidence = `${ARGALL_CAPTAIN_HOME.name} · Gwynthor`;

export const ARGALL_GWYNTHOR_PERSONS = Object.freeze([
  householdPerson(captain, 'Geschieden', fortressResidence),
  householdPerson(squire, 'Unverheiratet', fortressResidence),
  householdPerson(mother, 'Geschieden · Affäre mit Maelor Ffionydd', 'Aberon', 'married'),
  householdPerson(bard, 'Affäre mit Gwenella', 'Aberon', 'affair')
]);

export const ARGALL_GWYNTHOR_PARTNERSHIPS = Object.freeze([
  createMarriage(ARGALL_GWYNTHOR_MARRIAGE_ID, captain.id, mother.id, {
    status: 'divorced',
    notes: 'Geschiedene Ehe; das Jahr der Scheidung ist nicht festgelegt. Der gemeinsame Sohn ist Perwyn Argall.'
  }),
  createMarriage(ARGALL_GWYNTHOR_UNION_ID, mother.id, bard.id, {
    type: 'affair',
    status: 'active',
    notes: 'Durchgebrannt nach Aberon',
    extensions: {
      registryManagedSourceRevision: 3,
      registryManagedFields: ['type', 'status', 'notes'],
      registryManagedFieldRevisions: { type: 6, status: 6, notes: 6 },
      registryManagedFieldPreviousValues: {
        type: ['union', 'marriage', 'affair'],
        status: ['', 'unknown', 'active'],
        notes: ['', 'Alter Entwurf', 'Durchgebrannt nach Aberon']
      }
    }
  })
]);

export const ARGALL_GWYNTHOR_PARENTAGES = Object.freeze([
  ...createParentages([captain.id], ['iwrian-argall', 'avelyn-spouse-argall'], 'marriage-iwrian-avelyn-argall'),
  ...createParentages([squire.id], [captain.id, mother.id], ARGALL_GWYNTHOR_MARRIAGE_ID)
]);
