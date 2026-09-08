import { defineConfig } from 'vite';
import { cp, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UNIVERSAL_CLASS_IDS } from '../Klassenordner/modules/pages/universal-class-registry.js';
import { CENYR_CLASS_IDS } from './modules/classes/cenyr/cenyr-class-ids.js';
import { VENNYR_CLASS_IDS } from './modules/classes/vennyr/vennyr-class-registry.js';
import { ALDRIMAR_CLASS_IDS } from './modules/classes/aldrimar/aldrimar-class-registry.js';
import { ALBEN_CLASS_IDS } from './modules/classes/alben/alben-class-registry.js';
import { NORDMAENNER_CLASS_IDS } from './modules/classes/nordmaenner/nordmaenner-class-registry.js';
import { CREATURE_PROFILE_IDS } from '../Bestiarium/modules/creature-profile/profile-registry.mjs';
import { TOPIC_ARTICLE_IDS } from '../Bestiarium/modules/topic-article/topic-article-registry.mjs';
import { NATURAL_SPECIES_IDS } from '../Bestiarium/modules/natural-species/natural-species-registry.mjs';
import { HORSE_PROFILE_IDS } from '../Bestiarium/modules/horse-profile/horse-profile-registry.mjs';
import { PREDATOR_GROUPS, PREDATOR_PROFILE_IDS } from '../Bestiarium/modules/predator-profile/predator-registry.mjs';
import { LIVESTOCK_CATEGORY_IDS } from '../Bestiarium/modules/livestock-category/livestock-category-registry.mjs';
import { PET_BREED_GROUP_IDS } from '../Bestiarium/modules/pet-breed/pet-breed-registry.mjs';
import { DOG_PROFILE_IDS } from '../Bestiarium/modules/dog-profile/dog-profile-registry.mjs';

const classicDirectories = ['modules', 'data', 'vendor', 'licenses'];
const classicRootFiles = ['app.js', 'module-richtext.js', 'module-import-export.js', 'THIRD_PARTY_NOTICES.md'];
const almanachRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(almanachRoot, '..');
const buildRoot = resolve(almanachRoot, 'dist');
const buildAlmanachRoot = resolve(buildRoot, 'AleriaAlmanach');
const workspaceIconDirectories = [
  ['Zauber Icons', 'Oblivion Style'],
  ['Zauber Icons', 'Baldurs Gate'],
  ['Traits Icon'],
  ['ReiterIcons']
];

function preserveClassicAlmanachScripts() {
  return {
    name: 'preserve-classic-almanach-scripts',
    async closeBundle() {
      await Promise.all(classicDirectories.map(directory => (
        cp(resolve(almanachRoot, directory), resolve(buildAlmanachRoot, directory), { recursive: true, force: true })
      )));
      await mkdir(buildAlmanachRoot, { recursive: true });
      await Promise.all(classicRootFiles.map(file => copyFile(resolve(almanachRoot, file), resolve(buildAlmanachRoot, file))));
      await cp(
        resolve(almanachRoot, 'public/assets'),
        resolve(buildAlmanachRoot, 'public/assets'),
        { recursive: true, force: true }
      );
      await cp(
        resolve(workspaceRoot, 'CharakterDatenbank'),
        resolve(buildRoot, 'CharakterDatenbank'),
        { recursive: true, force: true }
      );
      await Promise.all(workspaceIconDirectories.map(pathParts => cp(
        resolve(workspaceRoot, 'IconOrdner', ...pathParts),
        resolve(buildRoot, 'IconOrdner', ...pathParts),
        { recursive: true, force: true }
      )));
    }
  };
}

export default defineConfig({
  root: workspaceRoot,
  publicDir: false,
  base: './',
  html: {
    additionalAssetSources: {
      // Keep full-size gallery links aligned with Vite's processed image URLs.
      a: {
        srcAttributes: ['href'],
        filter: ({ attributes }) => Object.hasOwn(attributes, 'data-bestiary-image-link')
      }
    }
  },
  plugins: [preserveClassicAlmanachScripts()],
  build: {
    outDir: buildRoot,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        almanach: resolve(almanachRoot, 'AleriaAlmanach.html'),
        bestiarium: resolve(workspaceRoot, 'Bestiarium/index.html'),
        ...Object.fromEntries(CREATURE_PROFILE_IDS.map(id => [
          `bestiary-${id}`, resolve(workspaceRoot, 'Bestiarium/wesen', id, 'index.html')
        ])),
        ...Object.fromEntries(TOPIC_ARTICLE_IDS.map(id => [
          `bestiary-topic-${id}`, resolve(workspaceRoot, 'Bestiarium/themen', id, 'index.html')
        ])),
        ...Object.fromEntries(NATURAL_SPECIES_IDS.map(id => [
          `bestiary-animal-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere', id, 'index.html')
        ])),
        ...Object.fromEntries(HORSE_PROFILE_IDS.map(id => [
          `bestiary-horse-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere/pferde', id, 'index.html')
        ])),
        ...Object.fromEntries(PREDATOR_GROUPS.map(group => [
          `bestiary-predator-${group.id}`, resolve(workspaceRoot, 'Bestiarium/tiere/raubtiere', group.id, 'index.html')
        ])),
        ...Object.fromEntries(PREDATOR_PROFILE_IDS.map(id => {
          const group = PREDATOR_GROUPS.find(candidate => candidate.profileIds.includes(id));
          return [`bestiary-predator-${group.id}-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere/raubtiere', group.id, id, 'index.html')];
        })),
        ...Object.fromEntries(LIVESTOCK_CATEGORY_IDS.map(id => [
          `bestiary-livestock-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere/vieh', id, 'index.html')
        ])),
        ...Object.fromEntries(PET_BREED_GROUP_IDS.map(id => [
          `bestiary-pet-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere/vieh/haustiere', id, 'index.html')
        ])),
        ...Object.fromEntries(DOG_PROFILE_IDS.map(id => [
          `bestiary-dog-${id}`, resolve(workspaceRoot, 'Bestiarium/tiere/vieh/haustiere/hunde', id, 'index.html')
        ])),
        classes: resolve(workspaceRoot, 'Klassenordner/Klassenseite.html'),
        ...Object.fromEntries(UNIVERSAL_CLASS_IDS.map(id => [
          `class-${id}`, resolve(workspaceRoot, 'Klassenordner/Basisklassen', id, 'index.html')
        ])),
        ...Object.fromEntries(CENYR_CLASS_IDS.map(id => [
          `class-cenyr-${id}`, resolve(workspaceRoot, 'Klassenordner/Cenyr', id, 'index.html')
        ])),
        ...Object.fromEntries(VENNYR_CLASS_IDS.map(id => [
          `class-vennyr-${id}`, resolve(workspaceRoot, 'Klassenordner/Vennyr', id, 'index.html')
        ])),
        ...Object.fromEntries(ALDRIMAR_CLASS_IDS.map(id => [
          `class-aldrimar-${id}`, resolve(workspaceRoot, 'Klassenordner/Aldrimar', id, 'index.html')
        ])),
        ...Object.fromEntries(ALBEN_CLASS_IDS.map(id => [
          `class-alben-${id}`, resolve(workspaceRoot, 'Klassenordner/Alben', id, 'index.html')
        ])),
        ...Object.fromEntries(NORDMAENNER_CLASS_IDS.map(id => [
          `class-nordmaenner-${id}`, resolve(workspaceRoot, 'Klassenordner/Nordmaenner', id, 'index.html')
        ]))
      }
    }
  }
});
