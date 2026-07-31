import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { build } from 'esbuild';

const projectRoot = process.cwd();

test('bundles the raw-deployment bridge without unresolved package imports', async () => {
  const result = await build({
    entryPoints: ['modules/scene-dice/scene-dice-bridge.js'],
    absWorkingDir: projectRoot,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: ['es2020'],
    write: false,
    logLevel: 'silent'
  });

  assert.equal(result.errors.length, 0);
  assert.ok(result.outputFiles[0].contents.length > 1000);
});

test('ships browser-ready vendor modules and page-relative Dice Box assets', async () => {
  const [engineSource, parserSource, diceBoxBundle, parserBundle, ammoAsset] = await Promise.all([
    readFile('modules/scene-dice/dice-engine.js', 'utf8'),
    readFile('modules/scene-dice/dice-parser-adapter.js', 'utf8'),
    stat('vendor/scene-dice/dice-box.esm.js'),
    stat('vendor/scene-dice/dice-parser-interface.esm.js'),
    stat('public/assets/dice-box/ammo/ammo.wasm.wasm')
  ]);

  assert.doesNotMatch(engineSource, /from\s+['"]@3d-dice\//);
  assert.doesNotMatch(parserSource, /from\s+['"]@3d-dice\//);
  assert.match(engineSource, /\.\/public\/assets\/dice-box\//);
  assert.ok(diceBoxBundle.size > 100_000);
  assert.ok(parserBundle.size > 1_000);
  assert.ok(ammoAsset.size > 100_000);
});
