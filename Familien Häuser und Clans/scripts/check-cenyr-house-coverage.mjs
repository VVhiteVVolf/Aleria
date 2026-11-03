import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

function parseArguments(argv) {
  let allowlistPath = '', check = false, json = false;
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--check') check = true;
    else if (argument === '--json') json = true;
    else if (argument === '--allowlist') allowlistPath = argv[++index] || '';
    else if (argument.startsWith('--allowlist=')) allowlistPath = argument.slice('--allowlist='.length);
    else throw new Error('Aufruf: --allowlist <geprüfte öffentliche ID-Liste.json> [--check] [--json]');
  }
  if (!allowlistPath) throw new Error('Eine geprüfte öffentliche Familien-ID-Allowlist ist erforderlich (--allowlist).');
  return { allowlistPath, check, json };
}

export async function runCenyrCoverageCli(argv, { output = console.log, error = console.error } = {}) {
  try {
    const options = parseArguments(argv);
    let allowlist;
    try { allowlist = JSON.parse(fs.readFileSync(options.allowlistPath, 'utf8')); }
    catch { throw new Error('Die geprüfte öffentliche Allowlist konnte nicht gelesen werden.'); }
    const { auditCenyrHouseCoverage } = await import('../modules/house-coverage/cenyr-house-coverage-node.mjs');
    const report = await auditCenyrHouseCoverage({ allowlistIds: Array.isArray(allowlist) ? allowlist : allowlist.familyIds });
    output(JSON.stringify(options.json ? report : { ok: report.ok, scope: report.scope, summary: report.summary }, null, 2));
    return options.check && !report.ok ? 1 : 0;
  } catch (failure) {
    const message = String(failure?.message || '');
    // Invalid unreviewed inputs never cause private identifiers or JSON source
    // fragments to be echoed into logs.
    error(/Allowlist|^Aufruf:/.test(message) ? message : 'Die Coverage-Prüfung konnte nicht vollständig ausgeführt werden.');
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runCenyrCoverageCli(process.argv.slice(2));
}
