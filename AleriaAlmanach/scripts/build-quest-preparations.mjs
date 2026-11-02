import { buildTroetzliQuest } from './build-troetzli-quest.mjs';

const check = process.argv.includes('--check');
await buildTroetzliQuest({ check });
console.log(check ? 'Öffentliche Questvorbereitungen geprüft.' : 'Öffentliche Questvorbereitungen aktualisiert.');
