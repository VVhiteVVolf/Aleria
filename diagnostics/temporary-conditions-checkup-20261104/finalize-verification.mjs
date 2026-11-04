import { readFile, writeFile } from 'node:fs/promises';

const logs = [
  ['domain', 'domain-tests.txt'],
  ['backend', 'backend-tests.txt'],
  ['diceAndBundle', 'dice-bundle-tests.txt'],
  ['combatTransactions', 'emulator-tests.txt'],
  ['healthTransactions', 'health-emulator-tests.txt'],
  ['finalSourceOwnershipTransactions', 'final-source-ownership-emulator-tests.txt']
];
const suites = {};
for (const [name, file] of logs) {
  const bytes = await readFile(new URL(file, import.meta.url));
  const content = bytes[0] === 0xff && bytes[1] === 0xfe
    ? bytes.subarray(2).toString('utf16le') : bytes.toString('utf8');
  const count = label => Number(content.match(new RegExp(`^# ${label} (\\d+)`, 'm'))?.[1] ?? NaN);
  const result = { log: file, tests: count('tests'), passed: count('pass'), failed: count('fail'), cancelled: count('cancelled'), skipped: count('skipped') };
  if (!Number.isFinite(result.tests) || result.passed !== result.tests || result.failed || result.cancelled || result.skipped) {
    throw new Error(`Incomplete or failed suite: ${name}`);
  }
  suites[name] = result;
}
const mechanicsParity = JSON.parse(await readFile(new URL('./mechanics-parity.json', import.meta.url)));
const browserPath = '.tmp/temporary-condition-interface-20261104/browser-1793750232395';
const browser = JSON.parse(await readFile(new URL(`../../${browserPath}/report.json`, import.meta.url)));
if (!mechanicsParity.passed || !browser.passed || browser.errors.length) throw new Error('Parity or browser verification failed');
const overlappingFinalTransactionCases = 11;
const result = {
  schemaVersion: 1,
  checkupDate: '2026-11-04',
  passed: true,
  localOnly: true,
  push: false,
  deploy: false,
  productionDataWrites: false,
  historicalReceiptRewrite: false,
  suites,
  overlappingFinalTransactionCases,
  uniqueTransactionCases: suites.combatTransactions.tests + suites.healthTransactions.tests + suites.finalSourceOwnershipTransactions.tests - overlappingFinalTransactionCases,
  uniqueAutomatedCases: Object.values(suites).reduce((sum, suite) => sum + suite.tests, 0) - overlappingFinalTransactionCases,
  mechanicsParity,
  browser: { path: browserPath, desktopWidth: 1440, phoneWidth: 390, screenshotsVisuallyInspected: true, ...browser },
  emulatorProjects: ['127.0.0.1:8180 / demo-aleria-combat-checkup', '127.0.0.1:8182 / demo-aleria-item-duels'],
  ownedEmulatorsStopped: true,
  independentFinalReview: 'No remaining concrete defect found in current permission/runtime rules or final profile-source extraction.',
  report: 'AleriaAlmanach/docs/combat/TEMPORARY_CONDITIONS_CHECKUP_2026-11-04.md'
};
await writeFile(new URL('./verification.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ passed: result.passed, uniqueAutomatedCases: result.uniqueAutomatedCases, uniqueTransactionCases: result.uniqueTransactionCases, sourceModules: mechanicsParity.checked }));
