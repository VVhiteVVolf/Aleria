import { RHYDIAN_FAMILY_MEMBERS } from './rhydian-members.js';
import { createParentages } from '../family-record-builders.js';
import { PARZIFAL_FAMILY_SOURCE } from './family-expansion.js';

export function extendBerynWithGwaeden(base) {
  const gwaeden = RHYDIAN_FAMILY_MEMBERS.find(person => person.id === 'gwaeden-beryn');
  return Object.freeze({ ...base,
    view: { ...base.view, focusPersonId: '', limitGenerations: false },
    persons: [...base.persons, {
      ...gwaeden, notes: `${gwaeden.notes} Sohn Brychan Beryns und Serens; Ifors Cousin.`
    }],
    parentages: [...base.parentages, ...createParentages([gwaeden.id], ['brychan-beryn', 'seren-brychan-spouse'],
      'marriage-brychan-seren-beryn', { idPrefix: 'beryn-parentage', notes: PARZIFAL_FAMILY_SOURCE })],
    extensions: { ...base.extensions, sourceRevision: 6, registryManagedEntitySourceRevision: 5,
      sourceNote: `${base.extensions.sourceNote} ${PARZIFAL_FAMILY_SOURCE} Gwaeden (1714) ergänzt Brychans und Serens Kinder; alle bisherigen Verbindungen bleiben erhalten.` }
  });
}
