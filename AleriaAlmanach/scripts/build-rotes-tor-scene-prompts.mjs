import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { TOR_EXTERIOR, TOR_ROOMS } from '../modules/rotes-tor/tor-rooms.mjs';

const root = new URL('../../', import.meta.url);
const presets = JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/image-style-presets.json', root), 'utf8'));
const style = presets.presets['anime-scene-portrait'].prompt.replace('[ANIME EINTRAGEN]', 'Tales of Xillia/Frieren');
const destination = 'AleriaAlmanach/assets/rotes-tor';
const reference = 'AleriaAlmanach/assets/kleiner-durst/scenes/aussenansicht.png';
const entries = [TOR_EXTERIOR, ...TOR_ROOMS].map(room => ({
  id: `scene-${room.id}`, kind: 'scene', preset: 'anime-scene-portrait',
  destination: `${destination}/scenes/${room.id}.png`, references: [reference, ...(room.id === 'aussenansicht' ? [] : [`${destination}/scenes/aussenansicht.png`])],
  prompt: `${style}\n\nMotiv: ${room.visual}\n\nVerwendung: Ortsillustration und interaktive Rollenspielszene für Zum Roten Tor im Bannkreis Gwynthor, Haus Penrudd. Hochformat 2:3, vollständige Szene ohne Bildrahmen, keine Schrift oder Wasserzeichen. Die beigefügte Hafenkneipe dient ausschließlich als Referenz für Anime-Lineart, Cel-Shading und einfache Materialdarstellung. Weder ihre schäbige Fassade noch ihren Hafen, ihr Schildmotiv oder ihre Architektur kopieren. Das Rote Tor ist ein gepflegter ländlicher Gasthof vor der Stadt, mit goldenem Strohdach, cremefarbenen Wänden, dunklen Eichenbalken und dunkelroten Türen. Keine neue Person erfinden, vorhandene Figurenporträts werden separat verwendet.${room.id === 'aussenansicht' ? '' : '\nDie zweite Bildreferenz zeigt die bereits fertige Außenansicht des Roten Tors. Sie definiert die gemeinsame Architektur, Farben und bodenständige Wohlgepflegtheit. Jetzt den ausdrücklich beschriebenen Innenraum beziehungsweise Hof zeichnen, nicht die Außenansicht wiederholen.'}`
}));
await mkdir(new URL(`${destination}/scenes/`, root), { recursive: true });
await writeFile(new URL(`${destination}/scene-prompts.json`, root), JSON.stringify({ schemaVersion: 1, date: '2026-10-20', tool: 'built-in image_gen', entries }, null, 2) + '\n');
console.log(JSON.stringify({ scenes: entries.length }));
