import { sanitizePageData } from './economy-model.mjs';
import { calculateBusiness, projectBusiness } from './economy-engine.mjs';
import { renderBusinessLedger, renderRevenueLedger } from './economy-ledger-view.mjs';
import { renderPayroll } from './economy-payroll-view.mjs';
import { HOUSEHOLD_PROFILES } from './economy-households.mjs';
import { renderHousehold } from './economy-household-view.mjs';
import { createPurchasingReference, calculatePurchasingPower } from './economy-purchasing-power.mjs';
import { renderPurchasingPower } from './economy-purchasing-view.mjs';

const mounted = new WeakMap();
const percentFields = new Set(['occupancy', 'levyRate', 'badDebtRate', 'churchRate', 'annualInterestRate']);
const factors = new Set(['priceFactor', 'materialFactor', 'wageFactor']);
const scenarioFields = new Set(['openDays', 'rentWeekly', 'levyRate', 'badDebtRate', 'churchRate', 'churchBasis', 'churchEnabled', 'debt', 'annualInterestRate', 'principalWeekly', 'replacementWeekly', 'householdWeekly', 'occupancy']);
const roots = scope => [...(scope?.matches?.('[data-economy-root]') ? [scope] : []), ...scope.querySelectorAll('[data-economy-root]')];

function showStatus(root, message, error = false) {
  const status = root.querySelector('[data-economy-status]');
  status.textContent = message; status.classList.toggle('economy-negative', error);
}

function renderState(root, state) {
  const result = calculateBusiness(state.scenario, state.calendar, state.controls);
  root.querySelector('[data-economy-output="ledger"]').innerHTML = renderBusinessLedger(state.scenario, result, state.showComparison ? state.examples : [], state.calendar, state.controls);
  root.querySelector('[data-economy-output="payroll"]').innerHTML = renderPayroll(result);
  root.querySelector('[data-economy-output="revenue"]').innerHTML = renderRevenueLedger(state.scenario, result);
  root.querySelector('[data-economy-output="purchasing"]').innerHTML = renderPurchasingPower(state.scenario, result, state.reference);
  state.result = result;
}

function renderHouseholdState(root, state) {
  const target = root.querySelector('[data-economy-household-result]');
  if (!target) return;
  const profile = HOUSEHOLD_PROFILES.find(profile => profile.id === state.household.profile) || HOUSEHOLD_PROFILES[0];
  target.innerHTML = renderHousehold(profile, state.calendar, state.household);
}

function selectTab(root, button) {
  root.querySelectorAll('[data-economy-tab]').forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  root.querySelectorAll('[data-economy-panel]').forEach(panel => { panel.hidden = panel.dataset.economyPanel !== button.dataset.economyTab; });
}

function exportCalculation(root, state) {
  if ([...root.querySelectorAll('input')].some(input => !input.checkValidity())) throw Error('Bitte zuerst die ungültigen Eingaben korrigieren.');
  const payload = { type: 'aleria-economy-calculation', version: 1, createdAt: new Date().toISOString(), inputMoneyUnit: 'Kupfertaler', resultMoneyUnit: 'Eisenpfennig',
    calendar: state.result.factors, scenario: state.scenario, controls: state.controls, result: state.result,
    purchasingReference: state.reference, purchasingPower: calculatePurchasingPower(state.result, state.reference),
    month: projectBusiness(state.scenario, state.calendar, state.result.factors.weeksPerMonth, state.controls),
    year: projectBusiness(state.scenario, state.calendar, state.result.factors.weeksPerYear, state.controls) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = root.ownerDocument.createElement('a');
  anchor.href = url; anchor.download = `wirtschaft-${state.scenario.id.replace(/[^a-z0-9-]/gi, '-') || 'rechnung'}.json`;
  root.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
}

function resetState(root, state) {
  state.scenario = structuredClone(state.initial); state.controls = {};
  state.reference = createPurchasingReference();
  root.querySelectorAll('[data-economy-reference]').forEach(field => {
    field.value = field.dataset.economyReference === 'leisureWeekly' ? state.reference.leisureWeekly
      : state.reference.costs.find(row => row.id === field.dataset.economyReference).weeklyCopper;
    field.setCustomValidity?.('');
  });
  root.querySelectorAll('[data-economy-field]').forEach(field => {
    const key = field.dataset.economyField;
    if (field.type === 'checkbox') field.checked = !!state.scenario[key];
    else field.value = factors.has(key) ? 1 : percentFields.has(key) ? state.scenario[key] * 100 : state.scenario[key];
    field.setCustomValidity?.('');
  });
  renderState(root, state); showStatus(root, 'Ausgangsrechnung wiederhergestellt.');
}

function handleChange(root, state, event) {
  const field = event.target;
  if (!(field instanceof root.ownerDocument.defaultView.HTMLElement)) return;
  if (field.matches('input') && (!field.checkValidity() || field.value === '' && field.type === 'number')) {
    showStatus(root, 'Ergebnis nicht verändert: Bitte eine gültige Zahl innerhalb der angegebenen Grenzen eingeben.', true); return;
  }
  if (field.dataset.economyHousehold) {
    const key = field.dataset.economyHousehold;
    state.household[key] = field.type === 'checkbox' ? field.checked : key === 'profile' ? field.value : Number(field.value);
    renderHouseholdState(root, state); return;
  }
  if (field.dataset.economyReference) {
    const key = field.dataset.economyReference;
    if (key === 'leisureWeekly') state.reference.leisureWeekly = Number(field.value);
    else {
      const row = state.reference.costs.find(row => row.id === key);
      if (!row) return;
      row.weeklyCopper = Number(field.value);
    }
    renderState(root, state);
    showStatus(root, 'Vergleichsskala neu berechnet · Betriebslohnliste und Warenpreise bleiben eigene Eingaben.'); return;
  }
  const key = field.dataset.economyField;
  if (key && (scenarioFields.has(key) || factors.has(key))) {
    const value = field.type === 'checkbox' ? field.checked : key === 'churchBasis' ? field.value : Number(field.value) / (percentFields.has(key) ? 100 : 1);
    if (factors.has(key)) state.controls[key] = value;
    else state.scenario[key] = value;
  } else if (field.dataset.economyPay) {
    const worker = state.scenario.workers.find(worker => worker.id === field.dataset.economyPay);
    if (!worker || !worker.days) return;
    const factor = state.controls.wageFactor ?? 1;
    if (!factor) { showStatus(root, 'Für einen einzelnen Lohn bitte zuerst einen Lohnfaktor größer als null wählen.', true); return; }
    worker.dailyCash = Number(field.value) / worker.days / factor;
  } else return;
  const wageId = field.dataset.economyPay;
  renderState(root, state);
  if (wageId) [...root.querySelectorAll('[data-economy-pay]')].find(input => input.dataset.economyPay === wageId)?.focus();
  showStatus(root, 'Neu berechnet · Änderungen gelten nur in dieser Ansicht.');
}

export function mount({ root, page, calendar, examples }) {
  for (const container of roots(root)) {
    mounted.get(container)?.abort.abort();
    const data = sanitizePageData(page.economyCalculation), abort = new AbortController();
    const state = { initial: data.scenario, scenario: structuredClone(data.scenario), controls: {}, calendar, examples, showComparison: data.showComparison,
      household: { profile: HOUSEHOLD_PROFILES[0].id, incomeFactor: 1, costFactor: 1, churchEnabled: false }, reference: createPurchasingReference(), abort };
    mounted.set(container, state);
    const safely = fn => event => { try { fn(event); } catch (error) { showStatus(container, error.message, true); } };
    container.addEventListener('change', safely(event => handleChange(container, state, event)), { signal: abort.signal });
    container.addEventListener('click', safely(event => {
      const tab = event.target.closest?.('[data-economy-tab]');
      if (tab) { selectTab(container, tab); return; }
      const action = event.target.closest?.('[data-economy-action]')?.dataset.economyAction;
      if (action === 'reset') resetState(container, state);
      else if (action === 'export') exportCalculation(container, state);
    }), { signal: abort.signal });
    container.addEventListener('keydown', event => {
      const tab = event.target.closest?.('[data-economy-tab]');
      if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const tabs = [...container.querySelectorAll('[data-economy-tab]')], index = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(container, tabs[next]); tabs[next].focus();
    }, { signal: abort.signal });
    renderState(container, state); renderHouseholdState(container, state);
  }
}

export function unmount({ root }) {
  for (const container of roots(root)) { mounted.get(container)?.abort.abort(); mounted.delete(container); }
}
