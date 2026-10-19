import { toMinor } from '../item-register/item-register-money.js';
import { CENYR_WORK_CYCLE } from './economy-world-context.mjs';

// An explicit, editable measuring scale, NOT established market or wage data.
// These draft costs describe home provision for 2 adults + 2 children over
// nine days, not four restaurant meals multiplied into a household budget.
const draftCosts = [
  ['staples', 'Getreide, Brot, Hülsenfrüchte und Gemüse', 7.2],
  ['fish', 'Örtlicher Fisch, Milchprodukte und Eier', 4.5],
  ['meat', 'Gelegentliche Fleischportionen', 0.9],
  ['housing', 'Anteilige Wohnpacht', 5.4],
  ['fuel', 'Brennstoff und Wasser', 1.8],
  ['clothing', 'Kleidung, Schuhe und Ausbesserung', 1.8],
  ['household', 'Seife und einfache Haushaltsmittel', 0.9],
  ['dues', 'Kleine persönliche Geldabgabe · Platzhalter', 0.3],
  ['replacement', 'Vorsorge für Krankheit und Ersatzanschaffungen', 1.2]
];
const amount = (value, fallback) => value != null && value !== '' && Number.isFinite(Number(value))
  ? Math.min(1e8, Math.max(0, Number(value))) : fallback;

export function createPurchasingReference(raw = {}) {
  return { version: 1, status: 'unconfirmed-scale', household: 'Zwei Erwachsene und zwei Kinder · sparsame Versorgung zu Hause',
    costs: draftCosts.map(([id, label, weeklyCopper]) => ({ id, label, weeklyCopper: amount(raw.costs?.find(row => row.id === id)?.weeklyCopper, weeklyCopper) })),
    leisureWeekly: amount(raw.leisureWeekly, 3) };
}

export function calculatePurchasingPower(result, raw = {}) {
  const reference = createPurchasingReference(raw);
  const costs = reference.costs.map(row => ({ ...row, amount: toMinor(row.weeklyCopper) }));
  const householdWeekly = costs.reduce((total, row) => total + row.amount, 0);
  const leisureWeekly = toMinor(reference.leisureWeekly), wageWeekly = householdWeekly + leisureWeekly;
  const dutyDays = CENYR_WORK_CYCLE.filter(day => day === 'work').length;
  // Only channels driven by tavern/restaurant visits form this mean basket.
  // Hotel, banquets and room hire must not inflate a walk-in customer's bill.
  const restaurantSales = result.channels.filter(row => row.basis === 'visits').reduce((total, row) => total + row.sales, 0);
  const meanBill = result.visits > 0 ? Math.round(restaurantSales / result.visits) : null;
  const paid = result.workers.filter(row => ['employee', 'family', 'apprentice'].includes(row.kind));
  return { reference, costs, householdWeekly, leisureWeekly, wageWeekly, dutyDays,
    dailyWage: wageWeekly > 0 ? wageWeekly / dutyDays : null, meanBill,
    wageWeeksPerVisit: wageWeekly > 0 && meanBill != null ? meanBill / wageWeekly : null,
    savingWeeksPerVisit: leisureWeekly > 0 && meanBill != null ? meanBill / leisureWeekly : null,
    workers: paid.map(row => ({ id: row.id, name: row.name, role: row.role, count: row.count, days: row.days,
      cash: row.perHeadCash, boardAtCost: row.boardPerHead, wageRatio: wageWeekly > 0 ? row.perHeadCash / wageWeekly : null,
      dutyAboveReference: row.days > dutyDays })) };
}
