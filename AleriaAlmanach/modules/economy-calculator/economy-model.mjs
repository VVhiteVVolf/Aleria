// Money remains in Kupfertalern at the storage boundary, as in the inventory.
// The calculation engine converts every ledger line to integer Eisenpfennige.
const text = (value, length = 1600) => String(value ?? '').trim().slice(0, length);
const number = (value, fallback = 0, max = 1e10) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : fallback;
const list = value => Array.isArray(value) ? value.slice(0, 300) : [];
const kind = (value, choices, fallback) => choices.includes(value) ? value : fallback;

export function calendarFactors(calendar) {
  const { daysPerWeek, daysPerMonth, daysPerYear, monthsPerYear } = calendar || {};
  if (![daysPerWeek, daysPerMonth, daysPerYear, monthsPerYear].every(value => Number.isInteger(value) && value > 0)
    || daysPerMonth * monthsPerYear !== daysPerYear) throw Error('Der gemeinsame Aleria-Kalender fehlt oder ist widersprüchlich.');
  return { daysPerWeek, daysPerMonth, daysPerYear, monthsPerYear, weeksPerMonth: daysPerMonth / daysPerWeek, weeksPerYear: daysPerYear / daysPerWeek };
}

export function sanitizeScenario(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const row = item => ({ id: text(item?.id, 100), label: text(item?.label, 200), note: text(item?.note), source: text(item?.source, 500) });
  const s = {
    id: text(source.id, 100), title: text(source.title, 200), tier: text(source.tier, 100), contextId: kind(source.contextId, ['gwynthor'], ''),
    introduction: text(source.introduction, 4000), assumptions: list(source.assumptions).map(item => text(item)),
    seats: number(source.seats), turns: number(source.turns, 1, 20), occupancy: number(source.occupancy, 0.5, 1), openDays: number(source.openDays, 8, 100),
    workers: list(source.workers).map(item => ({ ...row(item), name: text(item.name, 200), role: text(item.role, 300), areas: list(item.areas).map(area => text(area, 100)),
      kind: kind(item.kind, ['owner', 'family', 'employee', 'apprentice', 'dependent', 'animal', 'vacancy'], 'employee'),
      count: Math.round(number(item.count, 1, 10000)), days: number(item.days, 7, 100), dailyCash: number(item.dailyCash),
      boardDays: number(item.boardDays, 0, 100), boardDaily: number(item.boardDaily), lodgingWeekly: number(item.lodgingWeekly),
      fairDaily: number(item.fairDaily), ownerShare: number(item.ownerShare, 0, 1), anonymous: item.anonymous === true,
      salesShare: number(item.salesShare, 0, 1), salesChannelIds: list(item.salesChannelIds).map(id => text(id, 100)) })),
    channels: list(source.channels).map(item => ({ ...row(item), basis: kind(item.basis, ['visits', 'capacity', 'fixed'], 'visits'),
      quantity: number(item.quantity), occupancy: number(item.occupancy, 1, 1), days: number(item.days, 9, 100), unitCopper: number(item.unitCopper),
      materialRatio: number(item.materialRatio, 0.5, 1), lossRate: number(item.lossRate, 0, 0.95), maxWeekly: item.maxWeekly == null ? null : number(item.maxWeekly),
      stockUnits: item.stockUnits == null ? null : number(item.stockUnits), unit: text(item.unit, 100) })),
    overheads: list(source.overheads).map(item => ({ ...row(item), weeklyCopper: number(item.weeklyCopper) })),
    rentWeekly: number(source.rentWeekly), levyRate: number(source.levyRate, 0.02, 1), guildWeekly: number(source.guildWeekly),
    badDebtRate: number(source.badDebtRate, 0, 1), churchEnabled: source.churchEnabled === true, churchRate: number(source.churchRate, 0.1, 1),
    churchBasis: kind(source.churchBasis, ['surplus', 'receipts'], 'surplus'),
    debt: number(source.debt), annualInterestRate: number(source.annualInterestRate, 0.08, 1), principalWeekly: number(source.principalWeekly),
    replacementWeekly: number(source.replacementWeekly), householdWeekly: number(source.householdWeekly),
    assetValuesKnown: source.assetValuesKnown !== false,
    assets: Object.fromEntries(['cash', 'receivables', 'building', 'equipment', 'inventory'].map(key => [key, number(source.assets?.[key])])),
    coverage: list(source.coverage).map(item => ({ ...row(item), workerIds: list(item.workerIds).map(id => text(id, 100)), dailyHours: number(item.dailyHours), shiftHours: number(item.shiftHours, 8, 24) }))
  };
  return s;
}

export function validateScenario(scenario, calendar) {
  const errors = [], factors = calendarFactors(calendar);
  if (!scenario.title) errors.push('Ein Titel fehlt.');
  if (scenario.openDays > factors.daysPerWeek) errors.push('Öffnungstage überschreiten die Neuntagewoche.');
  for (const key of ['workers', 'channels', 'overheads']) {
    const ids = scenario[key].map(row => row.id);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) errors.push(`${key}: fehlende oder doppelte Identität.`);
  }
  if (scenario.workers.some(worker => worker.days > factors.daysPerWeek || worker.boardDays > factors.daysPerWeek)) errors.push('Dienst- oder Kosttage überschreiten die Woche.');
  const shares = scenario.workers.filter(worker => worker.kind === 'owner').reduce((sum, worker) => sum + worker.ownerShare, 0);
  if (shares && Math.abs(shares - 1) > 0.00001) errors.push('Die Inhaberanteile müssen zusammen 100 % ergeben.');
  for (const channel of scenario.channels) {
    const allocated = scenario.workers.filter(worker => !['vacancy', 'animal', 'dependent', 'owner'].includes(worker.kind) && worker.salesChannelIds.includes(channel.id))
      .reduce((sum, worker) => sum + worker.salesShare, 0);
    if (allocated > 1.000001) errors.push(`Erfolgsanteile übersteigen den Umsatz von ${channel.label || channel.id}.`);
  }
  return errors;
}

export function sanitizePageData(value = {}) {
  return { scenario: sanitizeScenario(value?.scenario), showComparison: value?.showComparison !== false, showHouseholds: value?.showHouseholds !== false };
}

export const ECONOMY_PAGE_KEY = 'wirtschaft-kalkulation';
export function createPage(scenario = {}, index = 0) {
  return { schemaVersion: 1, pageTitle: 'Kalkulation · Einnahmen und Lebensunterhalt', commentThreadKey: ECONOMY_PAGE_KEY,
    economyCalculationPage: true, enableComments: false, economyCalculation: sanitizePageData({ scenario }) };
}
