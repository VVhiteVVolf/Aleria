import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(process.cwd());
const access = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
const project = 'aleriaprojekt';
const projectNumber = '377039244960';
const apply = process.argv.includes('--apply');
const budgetName = 'Aleria – monatliche Kostenwarnung';
async function api(url, body, method = 'GET') {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${access.access_token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000) });
  const data = await response.json(); if (!response.ok) throw new Error(`HTTP ${response.status}: ${data.error?.message || 'Google API fehlgeschlagen.'}`); return data;
}
const budget = {
  displayName: budgetName,
  budgetFilter: { projects: [`projects/${projectNumber}`], calendarPeriod: 'MONTH', creditTypesTreatment: 'EXCLUDE_ALL_CREDITS' },
  amount: { specifiedAmount: { currencyCode: 'EUR', units: '10' } },
  thresholdRules: [0.2, 0.5, 0.8, 1].map(thresholdPercent => ({ thresholdPercent, spendBasis: 'CURRENT_SPEND' })).concat([{ thresholdPercent: 1, spendBasis: 'FORECASTED_SPEND' }]),
  notificationsRule: { disableDefaultIamRecipients: false }
};
if (!apply) { console.log(JSON.stringify({ mode: 'preview', project, budget, stopsServices: false }, null, 2)); process.exit(0); }
const service = await api(`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/billingbudgets.googleapis.com`);
if (service.state !== 'ENABLED') {
  const operation = await api(`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/billingbudgets.googleapis.com:enable`, {}, 'POST');
  for (let count = 0; count < 20 && !operation.done; count++) {
    const state = await api(`https://serviceusage.googleapis.com/v1/${operation.name}`);
    if (state.error) throw new Error('Budget-API konnte nicht aktiviert werden.');
    if (state.done) break;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}
const billing = await api(`https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`);
const endpoint = `https://billingbudgets.googleapis.com/v1/${billing.billingAccountName}/budgets`;
const existing = await api(`${endpoint}?pageSize=100`);
const owned = (existing.budgets || []).find(item => item.displayName === budgetName);
const result = owned
  ? await api(`https://billingbudgets.googleapis.com/v1/${owned.name}?updateMask=budgetFilter,amount,thresholdRules,notificationsRule`, { ...budget, name: owned.name }, 'PATCH')
  : await api(endpoint, budget, 'POST');
const verified = await api(`https://billingbudgets.googleapis.com/v1/${result.name}`);
if (verified.amount?.specifiedAmount?.units !== '10' || verified.budgetFilter?.creditTypesTreatment !== 'EXCLUDE_ALL_CREDITS') throw new Error('Budgetprüfung fehlgeschlagen.');
console.log(JSON.stringify({ project, budgetConfigured: true, amount: '10 EUR/month', creditsExcluded: true, thresholds: verified.thresholdRules, existingBudgetsPreserved: (existing.budgets || []).filter(item => item.name !== owned?.name).length, stopsServices: false }));
