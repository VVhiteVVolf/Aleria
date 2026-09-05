import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const sourceRoot = resolve(root, 'AleriaAlmanach/modules');
const targetRoot = resolve(root, 'firebase/functions/src/generated');
const files = [
  'classes/class-damage-revisions.js',
  'combat-styles/drachentanz/drachentanz-damage-progression.js',
  'classes/cenyr/cenyr-class-registry.js',
  'classes/cenyr/cenyr-class-ids.js',
  'classes/cenyr/cenyr-class-combat-rules.js',
  'classes/cenyr/cenyr-class-training.js',
  'classes/cenyr/cenyr-class-progression.js',
  'classes/cenyr/cenyr-combat-profile-autofill.js',
  'classes/cenyr/cenyr-technique-selection.js',
  'classes/cenyr/cenyr-technique-weapon-rules.js',
  'combat-styles/combat-style-registry.js',
  'combat-styles/drachentanz/drachentanz-registry.js',
  'combat-styles/drachentanz/drachentanz-ids.js',
  'combat-styles/drachentanz/techniques/abwartender-techniques.js',
  'combat-styles/drachentanz/techniques/ausgeglichener-techniques.js',
  'combat-styles/drachentanz/techniques/barddwyr-techniques.js',
  'combat-styles/drachentanz/techniques/bruellender-techniques.js',
  'combat-styles/drachentanz/techniques/drachentanz-technique-factory.js',
  'combat-styles/drachentanz/techniques/duelist-techniques.js',
  'combat-styles/drachentanz/techniques/expert-path-helpers.js',
  'combat-styles/drachentanz/techniques/fliegender-techniques.js',
  'combat-styles/drachentanz/techniques/foundation-techniques.js',
  'combat-styles/drachentanz/techniques/helwyr-expert-techniques.js',
  'combat-styles/drachentanz/techniques/milwr-techniques.js',
  'combat-styles/drachentanz/techniques/uchelwyr-mounted-techniques.js',
  'combat-styles/drachentanz/techniques/zorniger-techniques.js',
  'combat/combat-action-economy.js',
  'combat/combat-action-progression.js',
  'combat/combat-ability-uses.js',
  'combat/combat-condition-duration.js',
  'combat/combat-encounter-aura.js',
  'combat/combat-effect-model.js',
  'combat/combat-encounter-model.js',
  'combat/combat-encounter-outcome.js',
  'combat/combat-encounter-summary.js',
  'combat/combat-encounter-lifecycle.js',
  'combat/combat-equipment-state.js',
  'combat/combat-progression.js',
  'combat/combat-rule-consumption.js',
  'combat/combat-resolution-storage.js',
  'combat/combat-ammunition.js',
  'combat/combat-profile-context.js',
  'combat/combat-profile-model.js',
  'combat/combat-profile-resolver.js',
  'combat/combat-resource-progression.js',
  'combat/combat-spell-slots.js',
  'combat/combat-resolution-service.js',
  'combat/combat-state-model.js',
  'combat/combat-technique-damage.js',
  'combat/combat-segment-model.js',
  'combat/combat-trigger-rules.js',
  'combat/combat-ward-resolution.js',
  'combat/rules/combat-mvp-rules.js',
  'herausforderung/herausforderung-model.js',
  'inventory-use/inventory-use-model.js',
  'loot/loot-model.js',
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
