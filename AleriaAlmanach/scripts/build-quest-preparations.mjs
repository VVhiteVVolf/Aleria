import { buildTroetzliQuest } from './build-troetzli-quest.mjs';
import { buildFleischsammlerQuest } from './build-fleischsammler-quest.mjs';

const check = process.argv.includes('--check');
await buildTroetzliQuest({ check });
await buildFleischsammlerQuest({ check });
console.log(check ? 'Öffentliche Questvorbereitungen geprüft.' : 'Öffentliche Questvorbereitungen aktualisiert.');
