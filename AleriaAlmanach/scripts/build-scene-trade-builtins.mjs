import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readCommittedTradeSections } from './scene-trade/scene-trade-builtin-source.mjs';
import { builtinTradeSource, projectBuiltinTradeModules } from './scene-trade/scene-trade-builtin-projection.mjs';

export async function buildSceneTradeBuiltins({ root = fileURLToPath(new URL('../../', import.meta.url)), check = false } = {}) {
  const sources = await readCommittedTradeSections(root);
  const modules = projectBuiltinTradeModules(sources.sections, { isPublicSection: sources.isPublicSection });
  const source = builtinTradeSource(modules, sources);
  const target = resolve(root, 'AleriaAlmanach/modules/scene-trade/scene-trade-builtins.js');
  if (check) {
    if (await readFile(target, 'utf8') !== source) throw Error('Builtin trade catalogue is stale. Run firebase/functions/scripts/sync-almanach-mechanics.mjs in the canonical public checkout.');
  } else {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, source);
  }
  return { modules: modules.length, merchants: modules.filter(module => module.entry.pages.some(page => page.tradeCatalogPage || page.goodsTablePage)).length,
    sessions: modules.reduce((sum, module) => sum + module.entry.pages.filter(page => page.sessionPage).length, 0),
    sourceFiles: sources.sourceFiles.length, inputDigest: sources.inputDigest, sourceCommit: sources.sourceCommit, target,
    bytes: Buffer.byteLength(source), check };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.slice(2).some(argument => argument !== '--check')) throw Error('Use build-scene-trade-builtins.mjs [--check].');
  console.log(JSON.stringify(await buildSceneTradeBuiltins({ check: process.argv.includes('--check') })));
}
