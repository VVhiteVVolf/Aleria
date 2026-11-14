import { createLandfamilienFamily } from './landfamilien-family-builder.mjs';
import { createFamilyPerson, createParentages } from '../family-record-builders.js';
import { MARCHWERN_REPORT_PERSON as victim } from './marchwern-report-person.mjs';
import { HOUSE_BIOGRAPHY } from '../../../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Marchwern/haus.biography.mjs';

const base = createLandfamilienFamily('marchwern', HOUSE_BIOGRAPHY);
// Existing living relatives are retained. This new victim has no portrait.
export const MARCHWERN_FAMILY = Object.freeze({ ...base,
  persons: [...base.persons, createFamilyPerson({ ...victim,
    houseId: 'house-marchwern', title: victim.role,
    notes: `${victim.age} Jahre. ${victim.bio}`, extensions: { authoredSource: 'fleischsammler-familien-20261114' } })],
  parentages: [...base.parentages, ...createParentages(['ffraid-marchwern'], ['gwrgi-marchwern', 'mared-spouse-marchwern'], 'marriage-gwrgi-mared-marchwern')],
  extensions: { ...base.extensions, sourceRevision: 3,
    sourceNote: `${base.extensions.sourceNote} Ergänzung vom 14. November 2026: Ffraid, 25, als eigenständige verstorbene Tochter ohne Porträt. Bestehende lebende Angehörige und Gegenakten bleiben erhalten.` }
});
