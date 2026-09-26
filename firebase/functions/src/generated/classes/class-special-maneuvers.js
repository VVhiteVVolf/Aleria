// Compatibility for existing imports and archived release planners. No generic special maneuvers remain.
export { getMartialClassDefinition as getClassSpecialCurriculum, MARTIAL_CLASS_IDS as CLASS_SPECIAL_IDS, reconcileMartialRecovery as reconcileClassSpecialManeuvers } from './martial-recovery.js';
export const CLASS_SPECIAL_MILESTONES = Object.freeze([]);
export function getClassSpecialManeuvers() { return { abilities: [], techniques: [] }; }
