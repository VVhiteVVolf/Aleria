import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { readEconomyCalendar, readEconomyVenues } from '../modules/economy-calculator/economy-source-venues.mjs';
import { buildEconomyExamples } from '../modules/economy-calculator/economy-examples.mjs';
import { calculateBusiness, demandCases, projectBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { calendarFactors, createPage, sanitizePageData } from '../modules/economy-calculator/economy-model.mjs';
import { calculateHousehold } from '../modules/economy-calculator/economy-households.mjs';
import { createPurchasingReference, calculatePurchasingPower } from '../modules/economy-calculator/economy-purchasing-power.mjs';
import { CENYR_WORK_CYCLE, getEconomyContext } from '../modules/economy-calculator/economy-world-context.mjs';
import { renderPurchasingPower } from '../modules/economy-calculator/economy-purchasing-view.mjs';
import { createServiceIncomeGuide } from '../modules/economy-calculator/economy-service-income.mjs';
import { renderServiceIncomeGuide } from '../modules/economy-calculator/economy-service-income-view.mjs';
const calendar = await readEconomyCalendar(), venues = await readEconomyVenues(), examples = buildEconomyExamples(venues, calendar);

const fixture = () => ({ id: 'ledger-test', title: 'Nachvollziehbare Testrechnung', seats: 10, turns: 1, occupancy: 0.5, openDays: 9,
  workers: [{ id: 'worker', name: 'Hilfe', kind: 'employee', count: 1, dailyCash: 1, fairDaily: 1, days: 7, boardDaily: 0.3, boardDays: 9, lodgingWeekly: 0.5 },
    { id: 'owner', name: 'Inhaber', kind: 'owner', count: 1, days: 7, fairDaily: 0.5, ownerShare: 1 }],
  channels: [{ id: 'beer', label: 'Ausschank', basis: 'visits', quantity: 1, unitCopper: 2, materialRatio: 0.5, lossRate: 0.1 }],
  overheads: [{ id: 'fuel', label: 'Feuer', weeklyCopper: 2 }], rentWeekly: 1, levyRate: 0.02, badDebtRate: 0,
  debt: 520, annualInterestRate: 0.1, principalWeekly: 3, replacementWeekly: 2, householdWeekly: 5, churchEnabled: true, churchRate: 0.1, churchBasis: 'surplus' });

test('uses the authoritative 9 / 36 / 468 calendar and exact period factors', () => {
  assert.deepEqual(calendarFactors(calendar), { daysPerWeek: 9, daysPerMonth: 36, daysPerYear: 468, monthsPerYear: 13, weeksPerMonth: 4, weeksPerYear: 52 });
  assert.throws(() => calendarFactors({ ...calendar, daysPerYear: 365 }), /Kalender/);
});

test('service income distinguishes training, salary, family allowance and irregular work over thirteen months', () => {
  const guide = createServiceIncomeGuide(calendar), byId = id => guide.roles.find(role => role.id === id);
  assert.equal(guide.roles.length, 15);
  assert.equal(new Set(guide.roles.map(role => role.id)).size, 15);
  const knight = byId('hausritter');
  assert.equal(knight.monthly, 62400);
  assert.equal(knight.weekly, 15600);
  assert.equal(knight.annual, 811200);
  assert.equal(byId('amtsritter').monthly, 93600, 'full office salary is one amount, not base salary plus a second full salary');
  assert.equal(byId('fahrender-ritter').monthly, 0);
  assert.equal(byId('fahrender-ritter').incomeKind, 'variable');
  for (const id of ['niederes-adelshaus', 'hoeheres-adelshaus', 'grafenhaus']) assert.equal(byId(id).incomeKind, 'household');
  for (const id of ['page', 'knappe']) assert.equal(byId(id).incomeKind, 'training');
  for (const role of guide.roles) {
    assert.ok(role.monthlyMin <= role.monthly && role.monthly <= role.monthlyMax);
    assert.equal(role.annual, role.monthly * calendar.monthsPerYear);
  }
  guide.roles[0].monthly = 1;
  assert.equal(createServiceIncomeGuide(calendar).roles[0].monthly, 1200, 'a comparison edit cannot mutate the shared scale');
  assert.match(renderServiceIncomeGuide(calendar), /8\.112,00 KT/);
});

test('watch affiliation is distinct from selection into a guard, whose knight and armsman keep different full salaries', () => {
  const guide = createServiceIncomeGuide(calendar), byId = id => guide.roles.find(role => role.id === id);
  assert.deepEqual(guide.watchGroups.map(group => group.id), ['dorfwache', 'wachmann', 'stadtwache', 'hausmacht', 'garde']);
  assert.equal(byId('stadtwache').organizationType, 'stadtwache');
  assert.equal(byId('hausmacht-waffenknecht').organizationType, 'hausmacht');
  assert.equal(byId('hausritter').organizationType, 'hausmacht');
  assert.equal(byId('garde-waffenknecht').militaryStatus, 'waffenknecht');
  assert.equal(byId('garde-ritter').militaryStatus, 'ritter');
  assert.equal(byId('garde-waffenknecht').monthly, 43680);
  assert.equal(byId('garde-ritter').monthly, 78000, 'the 780 KT total does not add another 624 KT base salary');
  assert.equal(byId('dorfwache').weekly, 3000);
  assert.equal(byId('garde-ritter').annual, 1014000);
  guide.watchGroups[0].assignment = 'changed';
  assert.notEqual(createServiceIncomeGuide(calendar).watchGroups[0].assignment, 'changed');
  const html = renderServiceIncomeGuide(calendar);
  assert.equal((html.match(/data-economy-watch-group=/g) || []).length, 5);
  assert.equal((html.match(/data-economy-income-role=/g) || []).length, 15);
});

test('the thirty percent military salary revision is once-only and leaves unrelated income types unchanged', () => {
  const guide = createServiceIncomeGuide(calendar), byId = id => guide.roles.find(role => role.id === id);
  for (const [id, before] of Object.entries({ hausritter: 48000, amtsritter: 72000,
    'hausmacht-waffenknecht': 24000, 'garde-waffenknecht': 33600, 'garde-ritter': 60000 })) {
    assert.equal(byId(id).monthly, Math.round(before * 1.3));
  }
  for (const [id, amount] of Object.entries({ page: 1200, knappe: 6000, 'fahrender-ritter': 0,
    'niederes-adelshaus': 72000, 'hoeheres-adelshaus': 144000, grafenhaus: 240000,
    'hoher-beamter': 192000, dorfwache: 12000, wachmann: 14400, stadtwache: 19200 })) {
    assert.equal(byId(id).monthly, amount, id);
  }
  assert.equal(byId('amtsritter').monthlyMin, 78000);
  assert.equal(byId('amtsritter').monthlyMax, 124800);
  assert.equal(byId('garde-waffenknecht').annual, 567840);
  assert.equal(guide.baseMonthly, byId('hausritter').monthly);
  assert.deepEqual(createServiceIncomeGuide(calendar), guide);
});

test('Cenyr social cycle provides six duty days without silently changing existing contracts', () => {
  assert.equal(CENYR_WORK_CYCLE.length, calendar.daysPerWeek);
  assert.equal(CENYR_WORK_CYCLE.filter(day => day === 'work').length, 6);
  assert.equal(CENYR_WORK_CYCLE.filter(day => day === 'rest').length, 3);
  const result = calculateBusiness({ ...examples[0], workers: examples[0].workers.map(worker => worker.id === 'person-carys' ? { ...worker, days: 7 } : worker) }, calendar);
  const reference = calculatePurchasingPower(result);
  assert.equal(reference.workers.find(row => row.id === 'person-carys').dutyAboveReference, true);
  assert.equal(result.workers.find(row => row.id === 'person-carys').days, 7, 'unconfirmed old contract is flagged, not silently shortened');
});

test('family reference derives one sustaining wage, remains editable and never rewrites a business', () => {
  const scenario = fixture(), result = calculateBusiness(scenario, calendar), before = JSON.stringify(result);
  const reference = createPurchasingReference(), original = JSON.stringify(reference);
  const ordinary = calculatePurchasingPower(result, reference);
  assert.equal(ordinary.householdWeekly, 2400); assert.equal(ordinary.wageWeekly, 2700); assert.equal(ordinary.dailyWage, 450);
  assert.equal(ordinary.reference.status, 'unconfirmed-scale');
  const altered = createPurchasingReference(reference); altered.costs.find(row => row.id === 'housing').weeklyCopper += 2;
  const changed = calculatePurchasingPower(result, altered);
  assert.equal(changed.wageWeekly, 2900);
  assert.equal(changed.leisureWeekly, ordinary.leisureWeekly);
  assert.equal(JSON.stringify(reference), original); assert.equal(JSON.stringify(result), before);
});

test('affordability uses disposable money and excludes lodging and banquet sales from the visit basket', () => {
  const result = calculateBusiness({ ...fixture(), channels: [
    { id: 'meal', basis: 'visits', quantity: 1, unitCopper: 6, materialRatio: 0.5 },
    { id: 'room', basis: 'fixed', quantity: 10, unitCopper: 100, materialRatio: 0.2 }
  ] }, calendar);
  const p = calculatePurchasingPower(result);
  assert.equal(p.meanBill, 600); assert.equal(p.savingWeeksPerVisit, 2);
  assert.equal(p.wageWeeksPerVisit, 6 / 27);
  assert.equal(p.workers[0].cash, 700);
  assert.equal(p.workers[0].wageRatio, 7 / 27, 'board self-cost is not family cash income');
});

test('zero demand or a zero reference leaves affordability open rather than inventing income or infinite savings', () => {
  const result = calculateBusiness(fixture(), calendar, { demand: 0 });
  assert.equal(calculatePurchasingPower(result).meanBill, null);
  const zero = createPurchasingReference({ costs: createPurchasingReference().costs.map(row => ({ ...row, weeklyCopper: 0 })), leisureWeekly: 0 });
  const p = calculatePurchasingPower(calculateBusiness(fixture(), calendar), zero);
  assert.equal(p.wageWeekly, 0); assert.equal(p.savingWeeksPerVisit, null);
  assert.equal(p.wageWeeksPerVisit, null); assert.equal(p.workers[0].wageRatio, null);
  assert.equal(createPurchasingReference({ leisureWeekly: NaN }).leisureWeekly, 3);
});

test('Gwynthor context survives serialization and never becomes a default for another location', () => {
  for (const example of examples) assert.equal(example.contextId, 'gwynthor');
  assert.equal(sanitizePageData({ scenario: examples[0] }).scenario.contextId, 'gwynthor');
  const other = sanitizePageData({ scenario: { ...fixture(), contextId: 'rhonwens-traenen' } }).scenario;
  assert.equal(other.contextId, ''); assert.equal(getEconomyContext(other.contextId), null);
  const html = renderPurchasingPower(other, calculateBusiness(other, calendar), createPurchasingReference());
  assert.match(html, /Örtlicher Wirtschaftsrahmen noch offen/);
  assert.doesNotMatch(html, /reichlich vorhanden und verderblich/);
});

test('reconciles gross sales, purchasing losses, wages, tax, debt service and private cash', () => {
  const r = calculateBusiness(fixture(), calendar), t = r.totals;
  assert.equal(r.visits, 45);
  assert.equal(t.gross, 9000); assert.equal(t.materials, 5000); assert.equal(t.payroll, 700); assert.equal(t.board, 320);
  assert.equal(t.interest, 100); assert.equal(t.operatingCash, 2400); assert.equal(t.church, 240);
  assert.equal(t.profit, 1960); assert.equal(t.principal, 300); assert.equal(t.freeCash, 1160); assert.equal(t.economicProfit, 1610);
  assert.equal(t.receipts - t.expenses - t.church - t.principal - t.replacement - t.household, t.freeCash);
  assert.ok(Object.values(t).every(Number.isSafeInteger));
});

test('principal changes liquidity and liabilities, never operating profit', () => {
  const s = fixture(), original = JSON.stringify(s), a = calculateBusiness(s, calendar), b = calculateBusiness({ ...s, principalWeekly: 10 }, calendar);
  assert.equal(a.totals.profit, b.totals.profit); assert.equal(a.totals.freeCash - b.totals.freeCash, 700);
  assert.equal(JSON.stringify(s), original, 'calculations must not mutate sources');
});

test('month and year projections stop repayment at zero and reduce interest with remaining debt', () => {
  const s = { ...fixture(), debt: 5, principalWeekly: 3 }, r = projectBusiness(s, calendar, 4);
  assert.equal(r.debtEnd, 0); assert.equal(r.totals.principal, 500);
  assert.equal(r.totals.interest, 1, 'rounded interest on 5 KT, then 2 KT, then zero');
  assert.ok(!Object.hasOwn(r.totals, 'netWorth'), 'wealth is a stock, not four income payments');
});

test('optional church levy has an explicit base and no invented credit during losses', () => {
  const s = fixture(), none = calculateBusiness(s, calendar, { churchEnabled: false }), gross = calculateBusiness(s, calendar, { churchBasis: 'receipts' });
  assert.equal(none.totals.church, 0); assert.equal(gross.totals.church, 900);
  assert.equal(calculateBusiness({ ...s, rentWeekly: 200 }, calendar).totals.church, 0);
});

test('capacities and rare monthly supply stay capped even in a strong week', () => {
  const s = examples[0], r = calculateBusiness(s, calendar, { demand: 10 });
  assert.ok(r.occupancy <= 1);
  assert.ok(r.channels.find(row => row.id === 'goods-monatsfang').quantity <= 4);
  assert.ok(demandCases(s, calendar)[0].totals.freeCash < calculateBusiness(s, calendar).totals.freeCash);
});

test('changing retail prices does not secretly scale supplier costs', () => {
  const s = fixture(), a = calculateBusiness(s, calendar), b = calculateBusiness(s, calendar, { priceFactor: 2 });
  assert.equal(b.totals.gross, a.totals.gross * 2); assert.equal(b.totals.materials, a.totals.materials);
});

test('all recorded people are covered once; animals and vacant posts receive no salary', () => {
  assert.deepEqual(examples.map(s => calculateBusiness(s, calendar).activeCount), [6, 25, 60]);
  const kanne = examples[1]; assert.equal(kanne.workers.filter(w => w.name === 'Celyn').length, 1);
  assert.equal(kanne.workers.find(w => w.name === 'Celyn').areas.length, 2);
  assert.ok(!kanne.workers.some(w => w.name.includes('Caradog')));
  const rast = calculateBusiness(examples[2], calendar);
  assert.equal(rast.vacancyCount, 19); assert.equal(rast.workers.filter(w => w.anonymous).reduce((n, w) => n + w.count, 0), 38);
  for (const r of examples.map(s => calculateBusiness(s, calendar))) {
    for (const w of r.workers.filter(w => ['dependent', 'animal', 'vacancy'].includes(w.kind))) assert.equal(w.cash + w.board, 0);
    assert.equal(r.workers.reduce((n, w) => n + w.cash, 0), r.totals.payroll);
    assert.equal(r.owners.reduce((n, owner) => n + owner.householdShare, 0), r.totals.household);
    assert.equal(r.owners.reduce((n, owner) => n + owner.residualShare, 0), r.totals.freeCash);
  }
});

test('unpaid family work stays visible without enforcing a desired poverty or profit level', () => {
  const ordinary = calculateBusiness(examples[0], calendar);
  const busy = calculateBusiness(examples[0], calendar, { occupancy: 1 });
  assert.ok(ordinary.totals.imputed > 0);
  assert.equal(ordinary.totals.economicProfit, ordinary.totals.profit - ordinary.totals.imputed);
  assert.equal(busy.totals.imputed, ordinary.totals.imputed);
  assert.ok(busy.totals.freeCash > ordinary.totals.freeCash);
  assert.equal(busy.totals.economicProfit, busy.totals.profit - busy.totals.imputed);
});

test('all restaurant and service prices retain an actual source and monthly rooms do not overlap', () => {
  for (const scenario of examples) for (const channel of scenario.channels) {
    assert.ok(channel.source.includes('Güterregister') || channel.source.includes('Dienstleistungsseite'));
    assert.ok(channel.unitCopper > 0);
  }
  const rooms = examples[2].channels.filter(c => /kammer|suite/i.test(c.label) && c.basis === 'capacity');
  assert.equal(rooms.reduce((n, row) => n + row.quantity, 0), 60);
  assert.equal(rooms.find(c => c.label.startsWith('Monats-Einzel')).unitCopper, 396 / calendar.daysPerMonth);
});

test('household accounting never turns own food or leased land into additional cash income', () => {
  const p = { income: [{ cash: 100, inKind: 40 }], costs: [{ cash: 20, inKind: 60 }], assets: [{ label: 'Bargeld', cash: 50 }], debt: 10 };
  const r = calculateHousehold(p, calendar);
  assert.equal(r.naturalShortfall, 2000); assert.equal(r.netCashYear, 6000); assert.equal(r.netWorth, 4000);
  const extra = calculateHousehold({ ...p, income: [{ cash: 100, inKind: 80 }] }, calendar);
  assert.equal(extra.netCashYear, 8000); assert.equal(extra.netKindYear, 2000);
});

test('template serialization is idempotent and rejects duplicate personnel identities', () => {
  const data = createPage(examples[0]).economyCalculation;
  assert.deepEqual(sanitizePageData(JSON.parse(JSON.stringify(data))), data);
  const s = fixture(); s.workers.push({ ...s.workers[0] });
  assert.throws(() => calculateBusiness(s, calendar), /doppelte Identität/);
});

test('legacy automatic comment pages are retired while scene keys and positions remain unchanged', async () => {
  const context = vm.createContext({});
  vm.runInContext(await readFile(new URL('../modules/modal/modal-controller.js', import.meta.url), 'utf8'), context);
  const page = { pageTitle: 'Szene', sessionPage: true, commentThreadKey: 'stable-scene' };
  for (const appendCommentsPage of [undefined, true, false]) {
    const pages = context.getPages({ multipage: true, appendCommentsPage, pages: [page] });
    assert.equal(pages.length, 1); assert.equal(pages[0], page);
  }
  assert.equal(context.getPages({ multipage: true, pages: [page, { _commentsPage: true }] }).length, 1);
});

test('feature upgrade appends one final page, preserves current edits and never rekeys scenes', async () => {
  const context = vm.createContext({ structuredClone, AleriaCalendar: calendar, document: { addEventListener() {} } });
  vm.runInContext(await readFile(new URL('../modules/economy-calculator/economy-runtime.global.js', import.meta.url), 'utf8'), context);
  for (const entry of venues) {
    const section = { tab: 'Völker & Kulturen', path: ['Cenyr', 'Gwynthor'] };
    const before = JSON.stringify(entry.pages), upgraded = context.AleriaEconomy.upgradeEntry(entry, section);
    assert.equal(JSON.stringify(upgraded.pages.slice(0, -1)), before);
    assert.equal(upgraded.pages.at(-1).economyCalculationPage, true);
    upgraded.pages.at(-1).economyCalculation.scenario.householdWeekly = 999;
    assert.equal(context.AleriaEconomy.upgradeEntry(upgraded, section), upgraded);
    assert.equal(upgraded.pages.at(-1).economyCalculation.scenario.householdWeekly, 999);
  }
});
