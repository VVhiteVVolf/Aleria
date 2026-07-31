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

test('ships browser-ready vendor modules, board artwork and page-relative Dice Box assets', async () => {
  const [engineSource, parserSource, diceBoxSource, diceBoxBundle, parserBundle, ammoAsset, boardAsset] = await Promise.all([
    readFile('modules/scene-dice/dice-engine.js', 'utf8'),
    readFile('modules/scene-dice/dice-parser-adapter.js', 'utf8'),
    readFile('vendor/scene-dice/dice-box.esm.js', 'utf8'),
    stat('vendor/scene-dice/dice-box.esm.js'),
    stat('vendor/scene-dice/dice-parser-interface.esm.js'),
    stat('public/assets/dice-box/ammo/ammo.wasm.wasm'),
    stat('assets/scene-dice/dice-board.png')
  ]);

  assert.doesNotMatch(engineSource, /from\s+['"]@3d-dice\//);
  assert.doesNotMatch(parserSource, /from\s+['"]@3d-dice\//);
  assert.match(engineSource, /\.\/public\/assets\/dice-box\//);
  assert.ok(diceBoxBundle.size > 100_000);
  assert.ok(parserBundle.size > 1_000);
  assert.ok(ammoAsset.size > 100_000);
  assert.ok(boardAsset.size > 100_000);
  const embeddedWorkers = Array.from(diceBoxSource.matchAll(/["']([A-Za-z0-9+/=]{100000,})["']/g), match => match[1]);
  assert.ok(embeddedWorkers.some(value => {
    const workerSource = Buffer.from(value, 'base64').toString('utf8');
    return workerSource.includes('ALERIA_ELLIPSE_BOUNDARY="v1"')
      && workerSource.includes('ALERIA_DICE_DYNAMICS="v1"');
  }));
});
