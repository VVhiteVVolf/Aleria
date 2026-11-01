import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { TROETZLI_PEOPLE, TROETZLI_PORTRAIT } from '../modules/gwynthor-troetzli/troetzli-household.mjs';
import { TROETZLI_REWARD_ITEMS } from '../modules/gwynthor-troetzli/troetzli-items.mjs';
import { normalizeQuestDossier, questTravelGroup } from '../modules/quests/quest-dossier-model.js';
export async function buildTroetzliQuest({ check = false } = {}) {
const root = new URL('../../', import.meta.url), read = path => readFile(new URL(path, root), 'utf8');
const mapId = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';
const mapPath = 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis';
const pins = JSON.parse(await read(`${mapPath}/data.json`)).state.pins;
const family = JSON.parse(await read('Stammbäume/assets/data/published-families/haus-penrudd.json')).family;
const tudur = family.persons.find(row => row.id === 'tudur-penrudd');
const pin = id => { const row = pins.find(row => row.id === `gwynthor-marking-${id}`); if (!row) throw Error(`Kartenort fehlt: ${id}`); return row; };
const stop = (id, minutes, label) => ({ ...pin(id), name: pin(id).title, pinId: pin(id).id, ...(minutes ? { event: { type: 'custom', name: label, custH: minutes / 60, custSp: 1 } } : {}) });
// Road bends traced on the existing 8192 × 6300 raster. No straight-line shortcut through terrain.
const gate = { x: .484, y: .426, name: 'Nordtor / nördliche Brücke', event: { type: 'custom', name: 'Ruhiger Aufbruch und Brückenpassage', custH: 10 / 60, custSp: 1 } };
const common = [gate, { x: .480, y: .399 }, stop('080', 10, 'Tränken und Lage prüfen am Roten Tor'), { x: .478, y: .355 }, stop('071', 0), { x: .475, y: .302 }, stop('058', 10, 'Ruhepause am Weg beim Gwerfil-Hof')];
const paths = [
  { id: 'troetzli-nordweg', title: 'Direkter Nordweg', description: 'Kürzester vorbereiteter Straßenweg zum Penrudd-Hof.', travelMode: 'foot_e', points: [...common, { x: .485, y: .238 }, { x: .511, y: .218 }, { x: .525, y: .205 }, stop('041', 15, 'Ruhige Übergabe an Tudur')] },
  { id: 'troetzli-owain', title: 'Über Owains Pferdehof', description: 'Ausweichplan mit zusätzlichem Halt für pferdekundige Hilfe; Verfügbarkeit vor Ort erfragen.', travelMode: 'foot_e', points: [...common, { x: .471, y: .229 }, stop('048', 15, 'Zusätzliche Beratung bei Owains Pferdehof'), { x: .505, y: .208 }, stop('041', 15, 'Ruhige Übergabe an Tudur')] }
];
const context = vm.createContext({ window: {} });
for (const file of ['lsb-config.js','lsb-calculations.js']) vm.runInContext(await read(`Karten/assets/js/lsb/${file}`), context);
const route = { mapId, width: 8192, height: 6300, widthKm: 30,
  image: `/${mapPath}/Kartenbilder/display/gwynthor-normal-2048-q90.webp`, approachMinutes: 30,
  note: 'Die Karte zeigt dreißig Kilometer von einem Rand zum anderen. Die eingetragenen Straßen führen vom Nordtor über den nördlichen Landweg zum Hof. Für ein ruhig geführtes Pferd sind 3,5 Kilometer in der Stunde ein günstiges Tempo. Cynddelws Abholung, die Vorbereitung und der Weg durch Gwynthor brauchen zusätzlich etwa eine halbe Stunde. Wenn Trötzli scheut, können weitere dreißig bis sechzig Minuten vergehen. Ein Eilritt kommt mit ihm nicht in Frage. Die Entfernungen folgen dem sichtbaren Straßenverlauf und bleiben Näherungen.', paths };
for (const path of paths) path.estimate = context.window.KartoLsbCalculations.calcRoute(questTravelGroup(route, path.id), 30 / 8192);
const participant = (key, role, description) => ({ name: TROETZLI_PEOPLE[key].name, role, description, kind: 'character', recordId: TROETZLI_PEOPLE[key].worldPersonId, image: TROETZLI_PEOPLE[key].portrait, profile: '' });
const dossier = normalizeQuestDossier({ tagline: 'Ein kurzer Weg. Ein großer Dickkopf. Und ein Platz, an dem Ruhe einkehren darf.',
  coverImage: '/AleriaAlmanach/assets/gwynthor-troetzli/troetzli-road-v1.png',
  cardImage: '/AleriaAlmanach/assets/gwynthor-troetzli/chibi/troetzli-v1.png',
  invitation: '„Nun muss ich ihn nur noch dorthin bekommen. Das Wort ›nur‹ schreibe ich mit einiger Beschämung. Ich bitte um erfahrene, ruhige Hilfe. Ich möchte, dass Mensch und Tier dort heil ankommen.“',
  rewardPromise: 'Wenn Trötzli heil bei Tudur ankommt, hält Cynddelw sein Versprechen.',
  preparation: 'Hinterlasst bei Celtigerns Echo eine Nachricht für Cynddelw. Er wird Euch Trötzli zeigen und offen von seinen bisherigen Versuchen erzählen. Nehmt Euch Zeit für den Hengst, prüft Halfter und Führstrick und lasst ihm an Brücke und Wegesrand genügend Raum. Niemand muss ihn zureiten. Eirlys bleibt bei ihrer Familie, während Ihr Euch auf den Weg macht. Auf dem Penrudd-Hof erwartet Tudur Euch bereits – mit Platz, Ruhe und dem Wissen, dass dieses Pferd Geduld braucht.',
  participants: [participant('cynddelw', 'Auftraggeber · Besitzer', 'Berichterstatter bei Celtigerns Echo. Organisiert Abholung und Belohnung.'),
    { name: 'Trötzli', role: 'Schützling · Rhyfel-Hengst', kind: 'creature', recordId: 'companion-cynddelw-troetzli', image: TROETZLI_PORTRAIT, description: 'Erwachsen, schreckhaft und derzeit nicht sicher reitbar. Alte Narben sind verheilt; ihre Geschichte ist unbekannt.' },
    { name: tudur.name, role: 'Empfänger · Penrudd-Hof', kind: 'character', recordId: tudur.worldPersonId, image: tudur.portrait.replace(/^\.\./, ''), description: 'Cynddelws Schwiegervater. Weiß von den Schwierigkeiten und nimmt Trötzli zur Unterbringung auf.' },
    participant('esyllt', 'Familie · Verbindung zum Hof', 'Tudurs Tochter, Cynddelws Frau. Die Aufnahme ist mit ihrer Familie abgesprochen.'),
    participant('eirlys', 'Familie · Namensgeberin', 'Zehn Jahre alt, mit Malstift, Zahnlückengrinsen und einer großen Zuneigung zu Trötzli. Von ihr stammen sein Name und die Zeichnung am Aushang.')],
  route,
  pois: [ ['080', 'Verpflegung, Tränken und Kontakt zur Familie Penrudd; auf dem Weg.'], ['071', 'Obstplantage und Imkerei der Afelwyn. Vom Weg aus besuchbar; Privatgelände nur nach Absprache.'], ['058', 'Weizen, Tierfutter und Viehhaltung der Gwerfil. Ruhiger kurzer Zwischenhalt nach Absprache.'], ['048', 'Pferdekundige Hilfe nahe dem Ziel; eigener Ausweichplan mit zusätzlichem Zeitbedarf.'] ].map(([id, description]) => ({ name: pin(id).title, description, mapId, pinId: pin(id).id })),
  encounters: [ { title: 'Ein Schatten hinter den Hecken', location: 'Zwischen Obstplantage und Gwerfil-Hof', description: 'Wo der Weg unübersichtlich wird, könnten Wegelagerer auf unachtsame Reisende hoffen. Haltet die Augen offen und bringt Trötzli zuerst aus dem Gedränge. Manchmal genügt ein entschlossenes Wort; manchmal ist der klügere Weg ein kleiner Bogen. Ob dort jemand wartet, wird erst die Reise zeigen.' },
    { title: 'Wölfe am Waldrand', location: 'Die Waldsäume des nördlichen Weges', description: 'Ein ferner Ruf, Pfotenabdrücke im weichen Boden oder ein graues Fell zwischen den Bäumen könnten den Hengst unruhig machen. Besonders in der Dämmerung lohnt es sich, beisammenzubleiben. Spuren bedeuten noch keinen Angriff – und nicht jeder Schatten folgt Euch.', profile: '/Bestiarium/' } ],
  rewardArt: [{ kind: 'money', currency: 'copper', title: 'Ein Kupfertaler', image: '/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png' }, ...TROETZLI_REWARD_ITEMS.map(item => ({ title: item.title, image: item.image }))] });
const preparation = { dossier,
  summary: 'Cynddelw Llythfor braucht erfahrene Hilfe: Sein schreckhafter Rhyfel-Hengst Trötzli muss von Gwynthor zum Penrudd-Hof nördlich der Stadt geführt werden. Tudur Penrudd ist unterrichtet und nimmt ihn auf. Gesucht ist eine sichere Überführung, keine Zähmung oder Probe zum Zureiten. Für die sichere Übergabe winken 50 Kupferstücke, ein schickes unbeschriebenes Notizbuch und Schreibutensilien.',
  objectives: [{ id: 'meet-cynddelw', title: 'Bei Celtigerns Echo melden und die Überführung vorbereiten' }, { id: 'lead-troetzli', title: 'Trötzli ruhig und sicher über den nördlichen Weg führen' }, { id: 'handover-tudur', title: 'Trötzli heil an Tudur auf dem Penrudd-Hof übergeben' }, { id: 'report-cynddelw', title: 'Cynddelw die Übergabe bestätigen und die Belohnung abholen' }],
  modules: ['zum-roten-tor'] };
const output = `// Generated from public quest, family and map sources. Rebuild: node scripts/build-troetzli-quest.mjs\nexport const AUTHORED_QUEST_PREPARATIONS = ${JSON.stringify({ 'gwynthor-der-staedter-und-sein-pferd': preparation }, null, 2)};\n`;
const target = new URL('../modules/quests/quest-authored-dossiers.js', import.meta.url);
if (check) { if (await readFile(target, 'utf8') !== output) throw Error('Trötzli-Questvorbereitung ist veraltet.'); }
else await writeFile(target, output);
return paths.map(({ id, estimate }) => ({ id, ...estimate }));
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) console.log(JSON.stringify(await buildTroetzliQuest({ check: process.argv.includes('--check') }), null, 2));
