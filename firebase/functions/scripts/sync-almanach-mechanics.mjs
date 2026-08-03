import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const sourceRoot = resolve(root, 'AleriaAlmanach/modules');
const targetRoot = resolve(root, 'firebase/functions/src/generated');
const files = [
  'combat/combat-action-economy.js',
  'combat/combat-ability-uses.js',
  'combat/combat-profile-context.js',
  'combat/combat-profile-model.js',
  'combat/combat-profile-resolver.js',
  'combat/combat-spell-slots.js',
  'combat/combat-resolution-service.js',
  'combat/combat-state-model.js',
  'combat/combat-trigger-rules.js',
  'combat/rules/combat-mvp-rules.js',
  'inventory-use/inventory-use-model.js',
  'scene-inventory/scene-inventory-transfer-model.js',
  'scene-rest/scene-rest-model.js',
  'skill-checks/skill-check-model.js',
  'skill-checks/skill-resolution-service.js'
];

await rm(targetRoot, { recursive: true, force: true });
for (const relativePath of files) {
  const target = resolve(targetRoot, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await cp(resolve(sourceRoot, relativePath), target);
}
