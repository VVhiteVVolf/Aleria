import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const folder = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const args = process.argv.slice(2), write = args.includes('--write');
if (args.some(a => !['--write', '--check'].includes(a)) || args.length > 1) throw Error('Use --write or --check.');
const source = JSON.parse(await fs.readFile(new URL('halenrhyd.source.json', folder), 'utf8'));
const target = new URL('data.json', folder), beforeText = await fs.readFile(target, 'utf8'), before = JSON.parse(beforeText), next = structuredClone(before);
const owned = new Set(source.pins.map(p => p.id)); let changed = false;
for (const p of source.pins) {
  const pin = next.state.pins.find(x => x.id === p.id); assert(pin, p.id);
  if (pin.title !== p.title) assert(pin.title === p.previousTitle && !pin.house && !pin.text && !pin.faction && !pin.dominionId && pin.table.every(row => !row.v), `Standort nicht frei: ${p.id}`);
  const fields = { title: p.title, house: 'Familie Halenrhyd', faction: 'Im Dienst Haus Wyrms', region: 'Bannkreis Gwynthor · Llamreis Ankunft · Celtigerns Wacht',
    crest: '/AleriaAlmanach/assets/gwynthor-horse-studs/wappen/halenrhyd-wappen-v2.png', crestLink: '/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-halenrhyd', residentFamilyIds: [source.familyId],
    table: [{ k: 'Name', v: p.title }, { k: 'Typ', v: p.type }, { k: 'Besitzer', v: 'Familie Halenrhyd' }, { k: 'Leitung', v: p.lead }, { k: 'Aufgaben', v: p.work }, { k: 'Dienstbindung', v: 'Haus Wyrm · keine neue Hoheitsgrenze' }],
    img: '/AleriaAlmanach/assets/gwynthor-horse-studs/signs/halenrhyd-schild-v1.png',
    imgLink: `/AleriaAlmanach/AleriaAlmanach.html?entry=${source.moduleId}`, text: p.text };
  if (Object.entries(fields).some(([k, v]) => JSON.stringify(pin[k]) !== JSON.stringify(v))) { Object.assign(pin, fields); changed = true; }
}
assert.deepEqual(next.state.pins.filter(x => !owned.has(x.id)), before.state.pins.filter(x => !owned.has(x.id)));
assert.deepEqual(next.state.dominions, before.state.dominions);
if (changed) { if (!write) throw Error('Halenrhyd-Kartenprojektion veraltet.'); next.revision = Number(before.revision || 0) + 1; next.updatedAt = new Date().toISOString();
  const newline = beforeText.includes('\r\n') ? '\r\n' : '\n'; await fs.writeFile(target, (JSON.stringify(next, null, 2) + '\n').replace(/\n/g, newline)); }
console.log(JSON.stringify({ changed, pins: [...owned], otherPinsPreserved: before.state.pins.length - owned.size, dominionsPreserved: true, write }));
