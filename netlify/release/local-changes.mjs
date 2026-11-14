import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectLocalChanges } from './local-change-overview.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const labels = { new: 'Neu', 'local-change': 'Lokal geändert', conflict: 'Manuell abgleichen', deleted: 'Lokal entfernt',
  blocked: 'Lesen gesperrt', excluded: 'Ausgeschlossen', reconciled: 'Bereits abgeglichen', 'public-equivalent': 'Entspricht öffentlich' };

export function formatLocalChanges(report, { limit = 30 } = {}) {
  const lines = ['Lokale Änderungsübersicht (nur lesend)', `Öffentlicher Beleg: ${report.baseline.publishedCommit}`,
    ...Object.entries(report.summary.counts).map(([key, count]) => `${labels[key]}: ${count}`),
    `Dauer: ${report.totalSeconds.toFixed(2)} s`];
  if (report.baseline.unpublishedPublicHead) lines.push('Hinweis: Der öffentliche Checkout enthält noch nicht veröffentlichte Commits; verglichen wurde der letzte verifizierte Release.');
  const changes = report.entries.filter(entry => !['excluded', 'reconciled', 'public-equivalent'].includes(entry.status));
  for (const entry of changes.slice(0, limit)) lines.push(`${labels[entry.status]}: ${entry.path}`);
  if (changes.length > limit) lines.push(`${changes.length - limit} weitere Prüffälle; vollständig mit --json.`);
  lines.push('Keine Datei wird übernommen oder veröffentlicht.');
  return lines.join('\n');
}

async function main() {
  const options = {}, args = process.argv.slice(2);
  let json = false, limit = 30;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--json') json = true;
    else if (arg === '--help') {
      console.log('node netlify/release/local-changes.mjs [--json] [--limit=30] [--public-root PATH] [--receipt PATH] [--scope PATH]');
      return;
    } else if (/^--limit=\d+$/.test(arg)) {
      limit = Number(arg.slice(8));
      if (limit > 1000) throw Error('Limit must be 0..1000.');
    } else if (['--public-root', '--receipt', '--scope'].includes(arg)) {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw Error('Missing option path.');
      options[{ '--public-root': 'publicRoot', '--receipt': 'receiptFile', '--scope': 'scopeFile' }[arg]] = path.resolve(root, value);
    } else throw Error('Unknown local-change option. Use --help.');
  }
  const report = await collectLocalChanges({ root, ...options });
  console.log(json ? JSON.stringify(report, null, 2) : formatLocalChanges(report, { limit }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error('[local-changes] ' + error.message); process.exitCode = 1; });
}
