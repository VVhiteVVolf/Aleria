import { CENYR_PASSIVE_STAGES } from './cenyr-passive-stages.js';
import { VENNYR_PASSIVE_STAGES } from './vennyr-passive-stages.js';

const LEVELS = Object.freeze([5, 7, 8, 10, 14, 16, 18, 20]);
const CURRICULA = { ...CENYR_PASSIVE_STAGES, ...VENNYR_PASSIVE_STAGES };

export function getClassPassiveFeatures(classId) {
  return (Object.hasOwn(CURRICULA, classId) ? CURRICULA[classId] : []).map(([name, description], index) => ({
    id: `class-passive-${classId}-${LEVELS[index]}`,
    minimumLevel: LEVELS[index], name, description, status: 'confirmed'
  }));
}

const ALIASES = Object.freeze({ hewlyr: 'helwyr', rhyfelwr: 'rhyfelwyr', ceidwynr: 'ceidwyn', rhiddwyrr: 'rhiddwyr' });
const clean = value => String(value || '').trim().toLowerCase();

export function getCombatPassiveClassId(profile = {}) {
  const training = clean(profile.classTraining?.curriculumId);
  const selected = clean(profile.templateSelections?.classId);
  const identity = clean(profile.identity?.archetype);
  const id = selected || training || identity;
  if (id === 'milwr') {
    if (['cenyr-milwr', 'vennyr-milwr'].includes(training)) return training;
    const culture = clean(profile.templateSelections?.ancestryId || profile.identity?.ancestry);
    if (['cenyr', 'cenyri'].includes(culture)) return 'cenyr-milwr';
    if (['vennyr', 'vennyri'].includes(culture)) return 'vennyr-milwr';
    return selected === 'milwr' ? 'vennyr-milwr' : '';
  }
  if (['cenyr-milwr', 'vennyr-milwr'].includes(id)) return id;
  const unprefixed = id.replace(/^(?:cenyr|vennyr)-/, '');
  const key = Object.hasOwn(ALIASES, unprefixed) ? ALIASES[unprefixed] : unprefixed;
  return Object.hasOwn(CURRICULA, key) ? key : '';
}

export function getEarnedClassPassiveFeatures(profile) {
  const level = Number(profile?.progression?.level) || 1;
  return getClassPassiveFeatures(getCombatPassiveClassId(profile)).filter(feature => feature.minimumLevel <= level);
}
