import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { createFamilyChartSession } from '../assets/js/adapters/family-chart-adapter.js';
import { auditRenderedFamilyChart } from '../assets/js/modules/chart-quality/chart-geometry-audit.js';

let session;

export async function auditFamily(familyId, orientation = 'vertical') {
  const family = FAMILY_REGISTRY.find(record => record.id === familyId)?.family;
  if (!family?.persons.length) throw new Error(`Keine ausgearbeitete Familienakte: ${familyId}`);
  session?.destroy();
  const container = document.querySelector('#family-chart');
  session = createFamilyChartSession({ container, family, view: { orientation }, runtime: window });
  await new Promise(resolve => setTimeout(resolve, 350));
  const result = auditRenderedFamilyChart(container);
  return { familyId, orientation, ...result };
}
