import { getAldrimarClassProgression } from './aldrimar/aldrimar-class-progression.js';
import { getVennyrClassProgression } from './vennyr/vennyr-class-progression.js';

// Canonical form membership and unlock levels own the arsenal. Historical slot
// selections remain migration metadata; they no longer limit learned attacks.
export function materializeClassFormArsenal(profile, plan, { preserveExisting = true } = {}) {
  if (!plan?.styles?.length) return profile;
  const level = Math.max(1, Math.min(20, Number(plan.selectedLevel) || 1));
  const branches = new Set((profile.classTraining?.selections || []).filter(s=>s.kind==='branch').map(s=>s.selectionId));
  const forms = plan.styles.flatMap(style => style.forms).filter(form => form.available);
  const techniques = forms.flatMap(form => form.techniques).filter(technique => technique.minimumLevel <= level)
    .filter(technique => {
      if (plan.classId !== 'barddwyr' || technique.cenyrTraining?.slotBands?.includes('foundation')) return true;
      const rapier = /traellernder|kreischender/.test(technique.combatStyleFormId || '');
      return branches.has(rapier ? 'barddwyr-rapier' : 'barddwyr-sword');
    });
  const catalogIds = new Set(plan.attackCatalog.map(technique=>technique.id));
  const previous = new Map((profile.techniques || []).map(technique=>[technique.id,technique]));
  const classOwned = technique => catalogIds.has(technique.id)
    || (technique.cultureTraining?.allowedClassIds || technique.cenyrTraining?.allowedClassIds || []).includes(plan.classId)
      && /^combat-style-/.test(technique.id);
  const retained = (profile.techniques || []).filter(technique=>!classOwned(technique));
  const learned = [...new Map(techniques.map(technique=>[technique.id,technique])).values()].map(technique => ({
    ...(preserveExisting ? structuredClone(previous.get(technique.id) || {}) : {}),
    ...structuredClone(technique), active: true, live: true, status: 'confirmed',
    compatibleWeaponIds: [],
    ...(technique.cenyrTraining ? { cenyrTraining: { ...structuredClone(technique.cenyrTraining),
      selectedAtLevel: technique.minimumLevel, sourceStatus: technique.status || 'draft' } } : {})
  }));
  return { ...profile, techniques: [...retained, ...learned] };
}

export function reconcileCultureFormArsenal(profile = {}, targetLevel = profile.progression?.level) {
  const classId = profile.templateSelections?.classId || profile.identity?.archetype || profile.identity?.className;
  const plan = getAldrimarClassProgression(classId, targetLevel) || getVennyrClassProgression(classId, targetLevel);
  if (!plan || plan.classId === 'derwyn') return profile; // Derwyn uses its selected Cenyr/Vennyr foundation.
  const training = profile.classTraining?.curriculumId === plan.id ? structuredClone(profile.classTraining)
    : { schemaVersion: 2, curriculumId: plan.id, selections: [], techniqueSelections: [] };
  const selections = training.selections || [];
  const paths = new Set(selections.filter(s=>s.kind==='path'&&s.selectedAtLevel<=plan.selectedLevel).map(s=>s.selectionId));
  const forms = plan.styles.flatMap(style=>style.forms);
  const first = forms.find(form=>form.isChoice && form.eligible);
  if (!paths.size && first && plan.pathSelection?.firstSelectionRequired) {
    paths.add(first.id); selections.push({kind:'path',selectionId:first.id,selectedAtLevel:first.minimumLevel,spentTechniqueSlotId:''});
  }
  training.selections = selections;
  const unlockedPlan = {...plan, styles:plan.styles.map(style=>({...style,forms:style.forms.map(form=>({...form,
    available:form.eligible && !form.blocked && (!form.isChoice || paths.has(form.id))
  }))}))};
  return materializeClassFormArsenal({...profile,classTraining:training},unlockedPlan);
}
