import { WARRIORS } from './warrior-data.mjs';
import { EMBLEM_WARRIORS } from './emblem-warrior-data.mjs';

const representatives = {
  nefer: 'source-06', derwisch: 'source-05', sipahi: 'source-01',
  aschik: 'source-02', nizet: 'source-10', keman: 'source-04', lewent: 'source-08',
};

/** Class copy stays central; the overview reuses current emblem-specific art. */
export const CLASS_OVERVIEW_WARRIORS = Object.freeze(WARRIORS.map(base => {
  if (base.id === 'ghulam') return base; // The user explicitly retained this original class illustration.
  const representative = EMBLEM_WARRIORS.find(item => item.emblemId === representatives[base.id]);
  if (!representative || representative.classId !== base.id) throw Error(`Ungültige Klassen-Bildreferenz: ${base.id}.`);
  return Object.freeze({
    ...base,
    image: representative.image,
    original: representative.original,
    equipment: representative.equipment,
    mount: representative.mount,
    helmet: representative.helmet,
    armor: representative.armor,
    ageSpec: representative.ageSpec,
    representativeEmblemId: representative.emblemId,
  });
}));
