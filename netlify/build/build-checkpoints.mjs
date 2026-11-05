import { mkdir, lstat, realpath, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { MAX_VALIDATION_AGE_MS } from './site-build-plan.mjs';

const VERSION = 1;
const MAX_BYTES = 1024 * 1024;
const DIGEST = /^[a-f0-9]{64}$/;

// Existing release checks have a validation-only contract. Keep explicit entry
// points: an unknown script does not become checkpointable by taking --check.
const VALIDATION_CHECKS = new Set([
  "AleriaAlmanach/modules/language/package-language-build.mjs",
  "AleriaAlmanach/modules/patrick-biographies/build-biography-source.mjs",
  "AleriaAlmanach/scripts/build-arkaneum.mjs",
  "AleriaAlmanach/scripts/build-authored-item-catalog.mjs",
  "AleriaAlmanach/scripts/build-balchder-vertragsstube.mjs",
  "AleriaAlmanach/scripts/build-character-trait-review.mjs",
  "AleriaAlmanach/scripts/build-companion-ownership-review.mjs",
  "AleriaAlmanach/scripts/build-creature-bestiary-index.mjs",
  "AleriaAlmanach/scripts/build-currency-art.mjs",
  "AleriaAlmanach/scripts/build-draig-rooms.mjs",
  "AleriaAlmanach/scripts/build-economy-calculator.mjs",
  "AleriaAlmanach/scripts/build-economy-price-reference.mjs",
  "AleriaAlmanach/scripts/build-economy-price-review.mjs",
  "AleriaAlmanach/scripts/build-fleischsammler-argall.mjs",
  "AleriaAlmanach/scripts/build-gawain-character-database.mjs",
  "AleriaAlmanach/scripts/build-gawain-duncan-content.mjs",
  "AleriaAlmanach/scripts/build-gawain-family-snapshot.mjs",
  "AleriaAlmanach/scripts/build-gestiefelte-muschi.mjs",
  "AleriaAlmanach/scripts/build-group-adventures.mjs",
  "AleriaAlmanach/scripts/build-group-section-migration.mjs",
  "AleriaAlmanach/scripts/build-gwregysdu-harbor.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-erbstreit-assets.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-geography.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-heime.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-lotsensuche.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-marktplatz.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-seven.mjs",
  "AleriaAlmanach/scripts/build-gwynthor-troetzli.mjs",
  "AleriaAlmanach/scripts/build-item-register.mjs",
  "AleriaAlmanach/scripts/build-klingende-krone.mjs",
  "AleriaAlmanach/scripts/build-klingende-muenze-gwynthor.mjs",
  "AleriaAlmanach/scripts/build-landing-model.mjs",
  "AleriaAlmanach/scripts/build-letzter-heller.mjs",
  "AleriaAlmanach/scripts/build-markt-der-fortuna-gwynthor.mjs",
  "AleriaAlmanach/scripts/build-natural-resources.mjs",
  "AleriaAlmanach/scripts/build-quest-catalog.mjs",
  "AleriaAlmanach/scripts/build-quest-preparations.mjs",
  "AleriaAlmanach/scripts/build-rote-klaue.mjs",
  "AleriaAlmanach/scripts/build-rotes-tor.mjs",
  "AleriaAlmanach/scripts/build-schwarze-zitteraale.mjs",
  "AleriaAlmanach/scripts/build-skalli-retinue.mjs",
  "AleriaAlmanach/scripts/build-substance-item-catalog.mjs",
  "AleriaAlmanach/scripts/build-weapon-standards.mjs",
  "AleriaAlmanach/scripts/sync-character-archive-pages.mjs",
  "AleriaAlmanach/tools/build-spell-attack-library.mjs",
  "Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs",
  "Anzeigetafeln/tools/build-lotsensuche.mjs",
  "Anzeigetafeln/tools/build-notice-reward-catalog.mjs",
  "Anzeigetafeln/tools/build-notice-signoffs.mjs",
  "Anzeigetafeln/tools/vendor-notice-handwriting.mjs",
  "Bestiarium/scripts/build-bird-profiles.mjs",
  "Bestiarium/scripts/build-horse-breeding.mjs",
  "CharakterDatenbank/scripts/import-balchder-publication.mjs",
  "CharakterDatenbank/scripts/sync-house-signets.mjs",
  "CharakterDatenbank/scripts/sync-knight-starting-possessions.mjs",
  "CharakterDatenbank/scripts/sync-patrick-biographies.mjs",
  "Ereignisse/scripts/build-battles.mjs",
  "Ereignisse/scripts/build-coastal-history.mjs",
  "Ereignisse/scripts/build-events.mjs",
  "Ereignisse/scripts/build-praetendenten.mjs",
  "Ereignisse/scripts/build-weddings.mjs",
  "Fraktionen/scripts/build-factions.mjs",
  "Gameplay Guide/scripts/build-guides.mjs",
  "Karten/tools/build-fleischsammler-localities.mjs",
  "Karten/tools/build-households.mjs",
  "Karten/tools/build-leitheach.mjs",
  "Karten/tools/build-roriksheim-transfer.mjs",
  "Karten/tools/build-uathneach.mjs",
  "Karten/tools/import-leitheach-source.mjs",
  "Karten/tools/reconcile-gwynthor-affiliations.mjs",
  "Karten/tools/sync-albic-territory-labels.mjs",
  "Klassenordner/scripts/build-culture-classes.mjs",
  "Kontinente/scripts/build-administration-vassals.mjs",
  "Kontinente/scripts/build-aislearneach.mjs",
  "Kontinente/scripts/build-alben.mjs",
  "Kontinente/scripts/build-aldrimar.mjs",
  "Kontinente/scripts/build-blaithneach.mjs",
  "Kontinente/scripts/build-ceitheach.mjs",
  "Kontinente/scripts/build-cenyr-court.mjs",
  "Kontinente/scripts/build-continent-overviews.mjs",
  "Kontinente/scripts/build-dunfal.mjs",
  "Kontinente/scripts/build-dunkelhain.mjs",
  "Kontinente/scripts/build-faelaorn.mjs",
  "Kontinente/scripts/build-fjordheim.mjs",
  "Kontinente/scripts/build-heldenwacht.mjs",
  "Kontinente/scripts/build-ivarsheim.mjs",
  "Kontinente/scripts/build-kraehenmoor.mjs",
  "Kontinente/scripts/build-leitheach.mjs",
  "Kontinente/scripts/build-roriksheim.mjs",
  "Kontinente/scripts/build-schwarzfenn.mjs",
  "Kontinente/scripts/build-skjaerheim.mjs",
  "Kontinente/scripts/build-uathneach.mjs",
  "Kontinente/scripts/build-vennyr.mjs",
  "Kontinente/scripts/review-albic-territories.mjs",
  "js/biography/build-public-biographies.mjs",
  "shared/accepted-realms/scripts/admit-art.mjs",
  "shared/accepted-realms/scripts/build-maps.mjs",
  "shared/accepted-realms/scripts/build-pages.mjs",
]);

// Task checkpoints use the same validation-only command contract as published
// task receipts. Preparations may install tools, but create no website output;
// they are not skipped independently within a running task. Unknown commands and
// output generators conservatively prevent checkpointing the entire task.
export function canCheckpointTask(task) {
  if (task.always || !DIGEST.test(task.fingerprint || '')) return false;
  return task.commands.every(args => args[0] === '--test'
    || (args.length === 2 && args[1] === '--check' && VALIDATION_CHECKS.has(args[0]))
    || args[0] === 'netlify/build/prepare-runtime-checks.mjs'
    || args[0] === 'netlify/build/verify-task-inputs.mjs'
    || (args.length === 1 && args[0] === 'netlify/build/check-mechanics-projection.mjs')
    || (args.length === 1 && args[0] === 'AleriaAlmanach/scripts/check-character-archive.mjs')
    || (args.length === 2 && args[0] === 'Stammbäume/tools/check-release.mjs' && args[1] === '--prepare-browser')
    || (args.length === 2 && args[0] === 'AleriaAlmanach/modules/character-inventory/scripts/build-ui-art.mjs' && args[1] === '--verify'));
}

export async function openBuildCheckpoints(root, options) {
  if (!options) return null;
  const { file, runtime, force = false, validateBeforeSave, now = Date.now } = options;
  if (typeof runtime !== 'string' || !runtime || typeof validateBeforeSave !== 'function') {
    throw Error('Local checkpoints require runtime and a workspace validation callback.');
  }
  const resolvedRoot = await realpath(root);
  const directory = path.join(resolvedRoot, '.release-state');
  const target = path.resolve(file);
  if (path.dirname(target) !== directory || !target.endsWith('.json')) {
    throw Error('Local checkpoints must be a JSON file directly inside .release-state.');
  }
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw Error('Local checkpoint directory is redirected.');
  const existing = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing && (!existing.isFile() || existing.isSymbolicLink())) throw Error('Local checkpoint file is redirected.');
  let records = new Map();
  if (!force && existing?.size <= MAX_BYTES) {
    try {
      const saved = JSON.parse(await readFile(target, 'utf8'));
      if (saved.version === VERSION && saved.runtime === runtime && saved.tasks
        && typeof saved.tasks === 'object' && !Array.isArray(saved.tasks)) {
        records = new Map(Object.entries(saved.tasks));
      }
    } catch { /* A missing/malformed checkpoint never authorizes reuse. */ }
  }
  const usable = record => {
    const age = now() - Date.parse(record?.verifiedAt || '');
    return DIGEST.test(record?.fingerprint || '') && age >= 0 && age < MAX_VALIDATION_AGE_MS;
  };
  return {
    validate: validateBeforeSave,
    async reuse(task) {
      if (force || !canCheckpointTask(task)) return null;
      const record = records.get(task.id);
      if (!usable(record) || record.fingerprint !== task.fingerprint) return null;
      await validateBeforeSave();
      return record.verifiedAt;
    },
    async save(task) {
      if (!canCheckpointTask(task)) return;
      await validateBeforeSave();
      records = new Map([...records].filter(([, record]) => usable(record)));
      records.set(task.id, { fingerprint: task.fingerprint, verifiedAt: task.verifiedAt });
      const temporary = path.join(directory, `.task-checkpoints-${randomUUID()}.tmp`);
      try {
        await writeFile(temporary, JSON.stringify({ version: VERSION, runtime, tasks: Object.fromEntries(records) }, null, 2) + '\n', { flag: 'wx' });
        await rename(temporary, target);
      } finally {
        await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
    },
  };
}
