import { ECONOMY_EXAMPLES } from './economy-catalog.generated.mjs';
import { createPage, calendarFactors, sanitizePageData } from './economy-model.mjs';
import { renderPageBody } from './economy-page-view.mjs';
import { mount as mountView, unmount } from './economy-events.mjs';
import { buildEditor, collectEditor, bindEditorEvents } from './economy-editor.mjs';
import { applyVenuePriceReview } from '../economy-pricing/price-review-model.mjs';
import { evaluateVenueScope } from './economy-venue-scope.mjs';
import { buildVenueScenario } from './economy-venue-scenario.mjs';
import { buildExampleScenario } from './economy-examples.mjs';
import { COMPARISON_IDS } from './economy-venue-profiles.mjs';

export { sanitizePageData, buildEditor, collectEditor, unmount };
export { applyVenuePriceReview as applyPriceReview, evaluateVenueScope };
export function createDefaultPage(index = 0) { return createPage(ECONOMY_EXAMPLES[0], index); }
export function renderPage(page, entry, index, total) {
  calendarFactors(globalThis.AleriaCalendar);
  return globalThis.buildNav(page, index, total) + renderPageBody(page, globalThis.AleriaCalendar);
}
export function mount(context) { mountView({ ...context, calendar: globalThis.AleriaCalendar, examples: ECONOMY_EXAMPLES.filter(scenario => COMPARISON_IDS.includes(scenario.id)) }); }
export function upgradeEntry(original, section) {
  const entry = applyVenuePriceReview(original);
  if (!evaluateVenueScope(entry, section).eligible || !globalThis.AleriaCalendar) return entry;
  const calculations = entry.pages.filter(page => page.economyCalculationPage);
  if (calculations.length) {
    if (calculations.length === 1 && entry.pages.at(-1) === calculations[0]) return entry;
    // Only exact duplicates are discarded; distinct authored scenarios survive.
    const seen = new Set(), unique = calculations.filter(page => {
      const key = JSON.stringify(page); if (seen.has(key)) return false; seen.add(key); return true;
    });
    return { ...entry, pages: [...entry.pages.filter(page => !page.economyCalculationPage), ...unique] };
  }
  const scenario = buildExampleScenario(entry, globalThis.AleriaCalendar) || buildVenueScenario(entry, section, globalThis.AleriaCalendar);
  return { ...entry, pages: [...entry.pages, createPage(scenario)] };
}
if (typeof document !== 'undefined') bindEditorEvents(document);
