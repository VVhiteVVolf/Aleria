import { toMinor } from '../item-register/item-register-money.js';
import { calendarFactors, sanitizeScenario, validateScenario } from './economy-model.mjs';

const sum = rows => rows.reduce((total, row) => total + row, 0);
const scaled = (copper, factor = 1) => toMinor(copper * factor);
const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));

function ledger(s, calendar, controls) {
  const factors = calendarFactors(calendar), demand = controls.demand ?? 1;
  const days = clamp(controls.openDays ?? s.openDays, 0, factors.daysPerWeek);
  const occupancy = clamp((controls.occupancy ?? s.occupancy) * demand, 0, 1);
  const visits = s.seats * s.turns * occupancy * days;
  const priceFactor = clamp(controls.priceFactor ?? 1, 0, 100), materialFactor = clamp(controls.materialFactor ?? 1, 0, 100);
  const wageFactor = clamp(controls.wageFactor ?? 1, 0, 100);
  const channels = s.channels.map(channel => {
    let quantity = channel.basis === 'visits' ? visits * channel.quantity
      : channel.basis === 'capacity' ? channel.quantity * clamp(channel.occupancy * demand, 0, 1) * Math.min(channel.days, factors.daysPerWeek)
      : channel.quantity * demand;
    if (channel.maxWeekly != null) quantity = Math.min(quantity, channel.maxWeekly);
    if (channel.stockUnits != null) quantity = Math.min(quantity, channel.stockUnits);
    const sales = scaled(channel.unitCopper, quantity * priceFactor);
    // Cost ratios describe delivered procurement at the original menu price.
    // Hypothetical price changes do not silently change purchasing costs.
    const materials = scaled(channel.unitCopper, quantity * channel.materialRatio * materialFactor / (1 - channel.lossRate));
    return { ...channel, quantity, sales, materials };
  });
  const workers = s.workers.map(worker => {
    const active = !['dependent', 'animal', 'vacancy'].includes(worker.kind);
    const perHeadBaseCash = active && worker.kind !== 'owner' ? scaled(worker.dailyCash, worker.days * wageFactor) : 0;
    const eligibleSales = sum(channels.filter(channel => worker.salesChannelIds.includes(channel.id)).map(channel => channel.sales));
    const commissionPerHead = active && worker.kind !== 'owner' && worker.count > 0 ? Math.round(eligibleSales * worker.salesShare / worker.count) : 0;
    const perHeadCash = perHeadBaseCash + commissionPerHead;
    const cash = perHeadCash * worker.count;
    const boardPerHead = active ? scaled(worker.boardDaily, worker.boardDays) + scaled(worker.lodgingWeekly) : 0;
    const board = boardPerHead * worker.count;
    const fairCash = active ? scaled(worker.fairDaily, worker.days) * worker.count : 0;
    return { ...worker, cash, perHeadCash, perHeadBaseCash, commissionPerHead, board, boardPerHead, imputed: Math.max(0, fairCash - cash) };
  });
  const gross = sum(channels.map(channel => channel.sales));
  const badDebt = Math.round(gross * (controls.badDebtRate ?? s.badDebtRate));
  const receipts = gross - badDebt;
  const materials = sum(channels.map(channel => channel.materials));
  const payroll = sum(workers.map(worker => worker.cash)), board = sum(workers.map(worker => worker.board));
  const overheads = s.overheads.map(row => ({ ...row, amount: scaled(row.weeklyCopper) }));
  const rent = scaled(controls.rentWeekly ?? s.rentWeekly), guild = scaled(s.guildWeekly);
  const levy = Math.round(receipts * clamp(controls.levyRate ?? s.levyRate, 0, 1));
  const interest = scaled(s.debt, s.annualInterestRate / factors.weeksPerYear);
  const expenses = materials + payroll + board + sum(overheads.map(row => row.amount)) + rent + guild + levy + interest;
  const operatingCash = receipts - expenses;
  const churchEnabled = controls.churchEnabled ?? s.churchEnabled;
  const churchBasis = controls.churchBasis ?? s.churchBasis;
  const titheBase = churchBasis === 'receipts' ? receipts : Math.max(0, operatingCash);
  const church = churchEnabled ? Math.round(titheBase * clamp(controls.churchRate ?? s.churchRate, 0, 1)) : 0;
  const replacement = scaled(s.replacementWeekly), household = scaled(s.householdWeekly);
  const principal = Math.min(scaled(s.principalWeekly), scaled(s.debt));
  const profit = operatingCash - church - replacement;
  const freeCash = operatingCash - church - principal - replacement - household;
  const imputed = sum(workers.map(worker => worker.imputed));
  const assets = sum(Object.values(s.assets).map(value => scaled(value)));
  const netWorth = assets - scaled(s.debt);
  if (![gross, expenses, payroll, freeCash, assets, netWorth].every(Number.isSafeInteger)) throw Error('Die Rechnung überschreitet den sicheren Geldbereich.');
  const owners = workers.filter(worker => worker.kind === 'owner');
  const apportion = amount => {
    let assigned = 0;
    return owners.map((worker, index) => {
      const share = index === owners.length - 1 ? amount - assigned : Math.round(amount * worker.ownerShare);
      assigned += share; return share;
    });
  };
  const householdShares = apportion(household), residualShares = apportion(freeCash);
  return { factors, visits, occupancy, openDays: days, channels, workers, overheads,
    totals: { gross, badDebt, receipts, materials, payroll, board, rent, guild, levy, interest, expenses, operatingCash,
      church, replacement, profit, principal, household, freeCash, imputed, economicProfit: profit - imputed, assets, netWorth },
    owners: owners.map((worker, index) => ({ id: worker.id, name: worker.name, share: worker.ownerShare,
      householdShare: householdShares[index], residualShare: residualShares[index] })) };
}

export function calculateBusiness(raw, calendar, controls = {}, { breakEven = true } = {}) {
  const scenario = sanitizeScenario(raw);
  const errors = validateScenario(scenario, calendar);
  if (errors.length) throw Error(errors.join(' '));
  const result = ledger(scenario, calendar, controls);
  const warnings = [];
  const activeCount = sum(result.workers.filter(worker => !['dependent', 'animal', 'vacancy'].includes(worker.kind)).map(worker => worker.count));
  const vacancyCount = sum(result.workers.filter(worker => worker.kind === 'vacancy').map(worker => worker.count));
  if (result.totals.freeCash < 0) warnings.push('Nach Tilgung, Rücklage und Familienunterhalt fehlt Geld. Die Anfangskasse ist keine zusätzliche Einnahme.');
  if (result.totals.economicProfit < 0) warnings.push('Die Rechnung trägt keine vollständige marktübliche Vergütung der Familien- und Inhaberarbeit.');
  if (vacancyCount) warnings.push(`${vacancyCount} ausdrücklich freie Posten sind mit 0 Lohn angesetzt. Anonyme bestehende Beschäftigte werden separat bezahlt.`);
  if (scenario.debt > 0 && scenario.principalWeekly === 0) warnings.push('Es werden nur Zinsen bezahlt; die Schulden werden nicht kleiner.');
  if (!scenario.assetValuesKnown) warnings.push('Besitzwerte, Anfangskasse und bestehende Schulden sind noch nicht erhoben. Das ausgewiesene Betriebsszenario ist keine Vermögensfeststellung.');
  for (const coverage of scenario.coverage) {
    const available = sum(result.workers.filter(worker => coverage.workerIds.includes(worker.id)).map(worker => worker.days * coverage.shiftHours * worker.count));
    const required = result.openDays * coverage.dailyHours;
    if (available < required) warnings.push(`${coverage.label}: ${available.toFixed(0)} Dienststunden decken ${required.toFixed(0)} benötigte Stunden nicht. Zusätzliche Ablösung oder kürzere Öffnung nötig.`);
  }
  let demandBreakEven = null;
  if (breakEven && ledger(scenario, calendar, { ...controls, demand: 3 }).totals.freeCash >= 0) {
    let lower = 0, upper = 3;
    for (let i = 0; i < 35; i++) {
      const middle = (lower + upper) / 2;
      if (ledger(scenario, calendar, { ...controls, demand: middle }).totals.freeCash >= 0) upper = middle;
      else lower = middle;
    }
    demandBreakEven = upper;
  }
  const monthlyDeficit = Math.max(0, -result.totals.freeCash) * result.factors.weeksPerMonth;
  return { ...result, scenarioId: scenario.id, activeCount, vacancyCount, warnings, demandBreakEven,
    cashRunwayMonths: monthlyDeficit && scenario.assetValuesKnown ? scaled(scenario.assets.cash) / monthlyDeficit : null };
}

export function demandCases(scenario, calendar, controls = {}) {
  return [['Schwache Woche', 0.7], ['Gewöhnliche Woche', 1], ['Gute Woche', 1.25]].map(([label, demand]) =>
    ({ label, demand, ...calculateBusiness(scenario, calendar, { ...controls, demand }, { breakEven: false }) }));
}

export function projectBusiness(raw, calendar, weeks, controls = {}) {
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 1000) throw Error('Ungültiger Projektionszeitraum.');
  const scenario = sanitizeScenario(raw), totals = {};
  let debt = toMinor(scenario.debt);
  const stock = new Map(scenario.channels.filter(channel => channel.stockUnits != null).map(channel => [channel.id, channel.stockUnits]));
  for (let week = 0; week < weeks; week++) {
    const channels = scenario.channels.map(channel => stock.has(channel.id) ? { ...channel, stockUnits: stock.get(channel.id) } : channel);
    const result = calculateBusiness({ ...scenario, channels, debt: debt / 100 }, calendar, controls, { breakEven: false });
    for (const [key, amount] of Object.entries(result.totals)) totals[key] = (totals[key] || 0) + amount;
    debt -= result.totals.principal;
    for (const channel of result.channels) if (stock.has(channel.id)) stock.set(channel.id, Math.max(0, stock.get(channel.id) - channel.quantity));
  }
  // Balance-sheet stocks are not multiplied into fictional annual assets.
  delete totals.assets; delete totals.netWorth;
  return { weeks, totals, debtEnd: debt, stockEnd: Object.fromEntries(stock), note: 'Gleichmäßige Nachfrage; endliche Altbestände werden verbraucht, Restschuld und Zinsen sinken mit der Tilgung. Keine automatische Saison- oder Preisänderung.' };
}
