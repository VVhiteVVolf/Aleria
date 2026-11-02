import { readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { THERIANTHROPY_TRAIT_DEFINITIONS, SYMBIOSIS_TRAIT_DEFINITIONS, getTransformationTraitOrigin } from '../../AleriaAlmanach/modules/character-development/development-theriantrophie-traits.js';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';

const directory = new URL('./', import.meta.url);
async function log(name) {
  const bytes = await readFile(new URL(name, directory));
  return bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
}
async function suite(name) {
  const text = await log(name), tests = text.match(/^# tests (\d+)$/m), failures = text.match(/^# fail (\d+)$/m);
  if (!tests || !failures || Number(failures[1])) throw Error(`Unvollständige oder fehlgeschlagene Prüfung: ${name}`);
  return Number(tests[1]);
}
async function browser(logName, target) {
  const result = (await log(logName)).split(/\r?\n/).filter(line => line.startsWith('{')).map(line => JSON.parse(line)).find(result => result.passed);
  if (!result) throw Error(`Fehlender Browserbeleg: ${logName}`);
  await cp(result.output, fileURLToPath(new URL(target, directory)), { recursive: true, force: false, errorOnExist: true });
  return JSON.parse(await readFile(new URL(`${target}/report.json`, directory), 'utf8'));
}
const tests = await suite('frontend-tests-verified.txt');
const releaseTests = await suite('release-tests.txt');
const focused = await suite('development-tests.txt');
if (!(await log('build-verified.txt')).includes('built in')) throw Error('Produktionsbuild nicht abgeschlossen');
const level = await browser('level-up-browser-verified.txt', 'level-up-browser');
const creation = await browser('creation-browser-verified.txt', 'creation-browser');
const parity = JSON.parse(await readFile(new URL('server-parity.json', directory), 'utf8'));
if (!parity.passed || !level.passed || !creation.passed) throw Error('Prüfbeleg unvollständig');
const rows = [...THERIANTHROPY_TRAIT_DEFINITIONS, ...SYMBIOSIS_TRAIT_DEFINITIONS].map(([id, name, description, , cost]) => {
  const origin = getTransformationTraitOrigin(`development-trait-${id}`);
  const basis = origin.kind === 'symbiosis' ? origin.clanName === 'Varulv' ? 'Ausdrückliche Autorenfestlegung' : 'Archivierte Clanüberlieferung' : origin.sourceBasis === 'authored-variant' ? 'Ergänzende Tierausarbeitung' : 'Theriantrophie-Modul';
  return `| ${name} | ${description} | ${cost} | ${basis} |`;
}).join('\n');
const report = `# Theriantrophie und Silvanische Symbiose · 2. November 2026

Zwölf neue Merkmale ergänzen den Katalog auf **${DEVELOPMENT_TRAITS.length} Traits**.
Beide Assistenten bieten eigene Filter für Zatracher Theriantrophie und Silvanische
Symbiose. Jeder Eintrag hat ein neues kreisförmiges Comicicon und einen Verweis
auf das bestehende Almanach-Modul. Symbiose-Einträge zeigen zusätzlich die
vorhandenen Clanwappen und den passenden Stammbaum.

## Merkmale und tatsächliche Werte

| Merkmal | Wirkung und Einordnung | Punkte | Herkunftsgrundlage |
| --- | --- | ---: | --- |
${rows}

Die Grundwerte wirken, solange das Merkmal aktiv ist. Fertigkeits- und
Rettungswurfboni verändern keine gespeicherten Basisattribute. Zusätzliche
maximale TP füllen aktuelle TP nicht auf. Wahrnehmungsboni wirken auch auf die
daraus abgeleitete passive Wahrnehmung; Lockart erhält seinen zusätzlichen
passiven Bonus ohne Erhöhung aktiver Wahrnehmungsproben.

## Modul und Clanbelege

Gelesen wurden alle fünf Seiten des Moduls **Theriantrophie & Silvanische
Symbiose**, gespeichert in [sections.js](../../AleriaAlmanach/data/sections.js).
Der [Modulbeleg](source-review.json) hält Text, Hash und tatsächlich vorhandene
Clanregistereinträge fest. Die [archivierten Clanquellen](clan-source-review.json)
enthalten Dateipfade, Hashes und die entscheidenden Auszüge.

- **Zatrachs Fluchform:** ungewollte Hybridwandlung mit Kontrollverlust;
  Mondbindung ist charakteristisch, laut Modul aber nicht bei jeder
  Herbeiführung zwingend gleich. Die negativen WEI-Rettungswurfwerte sind
  ausdrücklich berechnete Nachteile, keine automatischen Kontrollwürfe.
- **Zatrachs Jüngersegen:** grundsätzlich willentliche Wandlung mit erhaltenem
  Verstand; keine pauschale völlige Mühelosigkeit oder unbedingte Kontrolle.
  Eine Wahl schreibt weder einen Kult noch eine Kriegerklasse automatisch zu.
- **Tierformen:** Wolf/Lykanthropie und Bär/Ayllanthropie sind im Modul ausdrücklich
  genannt. Eber und Luchs sind neue spielbare Ausarbeitungen seiner offen
  gelassenen weiteren Wer-Varianten. Sie werden im Assistenten entsprechend
  gekennzeichnet und nicht als bereits vollständig ausgearbeitete Quellprofile
  behauptet.
- **Varulv (Wolf):** folgt der ausdrücklichen aktuellen Autorenfestlegung.
- **Mac Ard Diuid (Bär):** Raghallach Diuid und Rogaire Mhathain verbinden die
  Diuid-Linie mit dem seltenen Bärenerbe des alten, inzwischen erloschenen
  Mhathain-Clans. Kein zusätzlicher heutiger Clan wurde angelegt.
- **Ó Lockart (Bär):** über Rúairc Diuid überlieferte, abgeschwächte Anlage;
  keine generelle Bärenverwandlung aller Clanmitglieder.
- **Dál Haig (Bär):** über Torcall Diuid überlieferte schwache und seltene Anlage.
  Gründergeschichte und Rabhán-Überlieferung bleiben Überlieferungen; eine
  sichere Manifestation jedes Angehörigen wird nicht behauptet.

Die Bezeichnungen verwenden durchgehend die Tierform in Klammern und bei
Symbiose den Clan. Die Archivschreibweise „Sylvanisch“ wurde nicht als zweite
Regelart eingeführt; die sichtbaren Merkmale verwenden die gewünschte aktuelle
Schreibweise „Silvanisch“.

## Wirkungsgrenzen und Balance

Diese Merkmale bilden **passive Grundprägungen** ab. Die im Modul beschriebenen
höheren Ausprägungen Tierkommunikation, vollständige kontrollierte Tiergestalt
und Champion-Urform werden individuell belegt und ausgearbeitet. Es wurde keine
automatische Verwandlungs-, Mondphasen- oder Kontrollverlust-Engine eingeführt.
Auch freie Tiersprache, Flugfähigkeit, neue Attacken und Zauber werden nicht
aus dem Clan- oder Tiernamen abgeleitet.

Silvanische Symbiose bleibt erblich und nicht ansteckend. Der separate
Silvanische Fluch aus Seite V setzt zuvor hohe göttliche Gunst und deren Bruch
voraus; er wurde keinem Clan oder gewöhnlichen Symbioseträger zugeschrieben.

Die Preise bewerten die hier genannten Zahlenpakete. Die Fluchformen haben
begrenzte Wahrnehmungs-, Körper- oder Überlebensvorteile und feste Nachteile,
vor allem auf WEI-Rettungswürfe. Ihr erzählerischer Kontrollverlust erzeugt keine
zusätzliche verdeckte Punktegutschrift. Segen und Symbiosen kosten je nach
Paket 1–3 Punkte. Der Saldo bleibt eine anpassbare Orientierung und darf negativ
werden; höhere persönliche Formfähigkeiten sind darin nicht pauschal eingepreist.

Fluchform und Jüngersegen derselben Tierform erzeugen bei doppelter Wahl einen
klaren Hinweis auf alternative Ausprägungen. Mehrere der drei verwandten
Bärenclans erzeugen einen Hinweis auf dieselbe Mhathain-Abstammung. Die Hinweise
sperren keine Auswahl und ändern keine Figurenwerte still. Zahlenboni würden
sich bei einer bewusst beibehaltenen Mehrfachauswahl weiterhin addieren.

Die bisherigen **114 Katalogdefinitionen** bleiben gegen den
[vorherigen Katalog](catalog-before.json) unverändert geprüft. Vorhandene
Figuren, Elternschaften, Rassen, Klassen, Inventare, Zauberzugänge, aktuelle
Ressourcen und historische Kampfbelege werden nicht migriert. Der Katalog darf
mehr als 120 Optionen enthalten; die bestehende technische Grenze von 120
Merkmalen je Figur bleibt erhalten und wird sichtbar geprüft.

## Bilder und Oberfläche

Alle zwölf Icons sind mit dem eingebauten Bildgenerator erstellt, mit echten
transparenten PNG-Außenbereichen übernommen und als kleine WebP-Fassungen
abgeleitet. Quellen und vollständige Prompts stehen in den
[Bildaufträgen](theriantrophie-traits-image-jobs.json), Hashes und Alphaprüfungen
im [Bildbeleg](theriantrophie-traits-art-receipt.json).
Die [Kontaktübersicht](theriantrophie-traits-contact-review.jpg) wurde angesehen.
Ein Wolf-Segen-Kandidat hatte in einer Ecke einen schwachen Alpharest; eine
separate Bildbearbeitung korrigierte ihn. Die Erstquelle bleibt unverändert
erhalten. Die endgültigen zwölf PNGs bestehen die strenge Alphaprüfung.

Aktive Bilder: [Traitbilder](../../AleriaAlmanach/assets/development-traits/).
Die vier bestehenden Clanwappen werden direkt verwendet, nicht neu interpretiert.
Die Sichtprüfung korrigierte eine zu breit greifende Bildregel: große Traiticons
und kleine Clanwappen erhalten jetzt ihre jeweils vorgesehene Größe. Modul- und
Clanlinks passen farblich zum bestehenden bronzenen Fensterstil.

## Verifikation

- Entwicklungssuite: **${focused} Tests, 0 Fehler**.
- Vollständiges Frontend: **${tests} Tests, 0 Fehler**.
- Build-/Release-Schutz: **${releaseTests} Tests, 0 Fehler**.
- **${parity.count} generierte Servermodule** stimmen bytegenau mit ihren
  Browserquellen überein; die tatsächlich gespeicherten Traits behalten auf
  beiden Seiten ihre Mechanik und Kennung.
- Lokaler Produktionsbuild erfolgreich. Die vorhandenen Vite-Hinweise zur
  Konfigurationsladung und zu großen Paketen bleiben bestehen.
- Lokale Chrome-Prüfung des Stufenassistenten: acht gewählte Merkmale einschließlich
  Werwolf-Jüngersegen und Varulv-Symbiose, eine gekaufte Attacke, Stufe 5,
  erlaubter Minusstand, unveränderte Ausrüstung, erneutes Laden ohne Verlust.
- Lokale Chrome-Prüfung der Starthilfe: vier Merkmale einschließlich Haig-Symbiose,
  manuelle Fertigkeiten, mehrere Klassen und eigene Ausbildung, keine
  Standardausrüstung; bestehender Besitz erhalten.
- Beide Filter zeigen **acht Zatracher** und **vier Clanmerkmale**, mit korrekt
  geladenen Icons und vier Clanwappen von je 22 Pixeln. Desktop und schmale
  Ansicht passen ohne horizontales Überlaufen.
- Die vorhandene Gameplay-Guide-Abhängigkeitsprüfung deckt 1540 Quellmodule ab.

Die erste Gesamtsuite lief während der Neuerzeugung der Serverkopien; zwei
Testdateien trafen dabei kurzzeitig auf noch fehlende Importdateien. Nach
abgeschlossenem Abgleich wurde die gesamte Suite erneut ausgeführt. Maßgeblich
ist [frontend-tests-verified.txt](frontend-tests-verified.txt); an der betroffenen
Herausforderungslogik wurde nichts geändert.

Browserbelege: [Stufenassistent](level-up-browser/report.json),
[Starthilfe](creation-browser/report.json),
[Symbiose am Desktop](level-up-browser/symbiose-desktop.png),
[Symbiose in schmaler Ansicht](level-up-browser/symbiose-phone.png).
Die Browserprüfungen blockieren alle externen Schreibzugriffe und verwenden
kein Livekonto. Der sichtbare Synchronisationshinweis entsteht durch diese
absichtlich gesperrte Onlineverbindung; es wurden keine Live-Daten geändert.

**Lokal umgesetzt und geprüft. Kein Commit, Push oder Deploy.**
`;
await writeFile(new URL('REVIEW.md', directory), report, 'utf8');
console.log(JSON.stringify({ traits: DEVELOPMENT_TRAITS.length, tests, focused, releaseTests, serverModules: parity.count }));
