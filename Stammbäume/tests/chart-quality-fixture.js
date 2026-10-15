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
  // Initial chart rendering has transition_time: 0. Wait for fonts and the two
  // paint frames needed by D3's zero-duration timers, rather than sleeping for
  // 350 ms for every family regardless of actual rendering time.
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const result = auditRenderedFamilyChart(container);
  if (!result.cardCount) throw new Error(`Keine gerenderten Karten für ${familyId}.`);
  return { familyId, orientation, ...result };
}
