import { YSABEL_CHARACTER_ID, YSABEL_GUARD_PORTRAIT, YSABEL_COMPANION_DETAILS } from '../../ysabel-biography/ysabel-biography.js';
import { createHouseholdCompanion } from './household-companion-profiles.js';

const ownerName = 'Ysabel Bronnor';

export const YSABEL_COMPANIONS = Object.freeze(YSABEL_COMPANION_DETAILS.map(spec => {
  const base = createHouseholdCompanion({
    ...spec,
    ownerSlug: 'ysabel',
    ownerId: YSABEL_CHARACTER_ID,
    ownerName,
    level: 1,
    location: 'Gwynthor',
    house: 'Haus Bronnor',
    habitat: spec.profile === 'horse' ? 'Gwynthor · Stallungen der Draig-Leibgarde' : 'Gwynthor und Umgebung'
  });
  return {
    ...base,
    needsStatReview: true,
    ...(spec.bestiaryId ? { bestiaryReference: { id: spec.bestiaryId } } : {}),
    biography: {
      ...base.biography,
      appearance: spec.appearance,
      facts: [
        ...base.biography.facts,
        { label: 'Besitzerin', value: ownerName },
        ...(spec.sex ? [{ label: 'Geschlecht', value: spec.sex }] : [])
      ],
      connections: [
        { type: 'connection', name: ownerName, image: YSABEL_GUARD_PORTRAIT, detail: 'Seine Besitzerin.' }
      ]
    }
  };
}));
