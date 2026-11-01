import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { questAvailabilityAt } from '../../../AleriaAlmanach/modules/quests/quest-board-availability.js';
const catalog = JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/quests/quest-catalog.json', import.meta.url), 'utf8'));
const quest = catalog.quests.find(row => row.id.endsWith(':gwynthor-reisegeleit-nach-llysfaen'));
assert.ok(quest);
const dates = [8, 9, 10, 11].map(day => ({ date: { year: 1740, month: 3, day },
  availability: questAvailabilityAt(quest, { year: 1740, month: 3, day }) }));
assert.deepEqual(dates.map(row => row.availability), ['not-published', 'available', 'archived', 'archived']);
const report = { id: quest.id, title: quest.title, boardAvailability: quest.boardAvailability, dates };
await writeFile(new URL('./travel-source-window.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
