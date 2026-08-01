#!/usr/bin/env node
// Migration CLI: reads the real, already-migrated structural data
// (data/maps/*/registry.json, data/categories.json,
// data/marker-catalog.json, data/pin-templates.json - all transcribed
// verbatim from Karten/, see docs/LEGACY_AUDIT.md) and additionally looks
// for an optional legacy Firestore-shaped export (pins/cats/markerCatalog)
// per map to convert into real PointFeatures.
//
// No live pin data for Celtigerns Wacht exists anywhere in this repository
// - it lives only in Firestore (see docs/LEGACY_AUDIT.md section 5) and a
// read attempt was blocked by the agent's own safety controls and not
// retried. This script is therefore ready to run in full once a legacy
// export becomes available, but currently reports zero migrated pins,
// truthfully.
//
// How to get a real export later: open the OLD app locally
// (Karten/karte.html?map=cenyr-celtigerns-wacht), enter edit mode
// (password from Karten/assets/js/karto-app.js), open "Daten-Manager" ->
// "Exportieren" -> download the JSON, save it as
// karten-v2/data/legacy-export/<mapId>.json, then re-run this script.
//
// This script NEVER writes into Karten/ - it only reads from there once
// (already done during the audit) and writes exclusively under karten-v2/.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { migrateLegacyExport } from '../src/data/legacy-adapter.js';

const ROOT = dirname(fileURLToPath(import.meta.url)).replace(/tools$/, '');
const DATA_DIR = resolve(ROOT, 'data');
const MAPS_DIR = resolve(DATA_DIR, 'maps');
const LEGACY_EXPORT_DIR = resolve(DATA_DIR, 'legacy-export');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readAllMaps() {
  return readdirSync(MAPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readJson(resolve(MAPS_DIR, entry.name, 'registry.json')));
}

function main() {
  const maps = readAllMaps();
  const categories = readJson(resolve(DATA_DIR, 'categories.json')).categories;
  const markerCatalog = readJson(resolve(DATA_DIR, 'marker-catalog.json')).markers;
  const pinTemplates = readJson(resolve(DATA_DIR, 'pin-templates.json')).templates;
  const activeMaps = maps.filter((map) => map.status === 'active');

  const reportLines = [];
  reportLines.push('# Migration Report');
  reportLines.push('');
  reportLines.push(`Ausgefuehrt: ${new Date().toISOString()}`);
  reportLines.push('');
  reportLines.push('## Strukturelle Daten (aus Karten/-Quellcode transkribiert, siehe LEGACY_AUDIT.md)');
  reportLines.push('');
  reportLines.push('| Datensatz | alte Anzahl | migrierte Anzahl |');
  reportLines.push('| --- | ---: | ---: |');
  reportLines.push(`| Kartenregistry-Eintraege | 13 | ${maps.length} (13 aus Legacy + 1 zusaetzlich verdrahtet: cenyr-graue-weite, siehe unten) |`);
  reportLines.push(`| Kategorien | 20 | ${categories.length} |`);
  reportLines.push(`| Marker-Katalog-Eintraege | 74 | ${markerCatalog.length} |`);
  reportLines.push(`| Pin-Vorlagen | 6 | ${pinTemplates.length} |`);
  reportLines.push(`| Aktive Karten mit echtem Bild | 1 (Celtigerns Wacht) | ${activeMaps.length} (Celtigerns Wacht + Graue Weite, siehe LEGACY_AUDIT.md Abschnitt 8) |`);
  reportLines.push('');

  reportLines.push('## Pins / konkrete Orte');
  reportLines.push('');

  let totalMigratedPins = 0;
  let totalFailedPins = 0;
  const perMapResults = [];

  if (!existsSync(LEGACY_EXPORT_DIR)) {
    mkdirSync(LEGACY_EXPORT_DIR, { recursive: true });
  }

  for (const map of activeMaps) {
    const exportPath = resolve(LEGACY_EXPORT_DIR, `${map.id}.json`);
    if (!existsSync(exportPath)) {
      perMapResults.push({ map, found: false });
      continue;
    }
    const legacyExport = readJson(exportPath);
    const report = migrateLegacyExport(legacyExport, map);
    totalMigratedPins += report.pointFeatures.length;
    totalFailedPins += report.failed.length;
    perMapResults.push({ map, found: true, report });

    const outPath = resolve(MAPS_DIR, map.id, 'locations.json');
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          schemaVersion: 1,
          mapId: map.id,
          migratedAt: new Date().toISOString(),
          features: report.pointFeatures,
        },
        null,
        2,
      ),
    );
  }

  for (const result of perMapResults) {
    if (!result.found) {
      reportLines.push(
        `- **${result.map.title}** (\`${result.map.id}\`): kein lokaler Export unter \`data/legacy-export/${result.map.id}.json\` gefunden -> 0 Pins migriert. Alte Anzahl unbekannt (nur live in Firestore einsehbar, siehe LEGACY_AUDIT.md Abschnitt 5).`,
      );
      continue;
    }
    const { report, map } = result;
    reportLines.push(
      `- **${map.title}** (\`${map.id}\`): ${report.pointFeatures.length} Pins migriert, ${report.failed.length} fehlgeschlagen, ${report.categories.length} Kategorien aus dem Export uebernommen, ${report.skipped.length} Eintraege bewusst uebersprungen. Ergebnis: \`data/maps/${map.id}/locations.json\`.`,
    );
    for (const failure of report.failed) {
      reportLines.push(`  - Fehlgeschlagen: Pin \`${failure.id}\` - ${failure.reason}`);
    }
    for (const skipped of report.skipped) {
      reportLines.push(`  - Uebersprungen: \`${skipped.id}\` - ${skipped.reason}`);
    }
  }

  reportLines.push('');
  reportLines.push('## Zusammenfassung');
  reportLines.push('');
  reportLines.push(`- Migrierte Pins gesamt: ${totalMigratedPins}`);
  reportLines.push(`- Fehlgeschlagene Pins gesamt: ${totalFailedPins}`);
  reportLines.push(
    `- Bewusst nicht uebernommen: DM-Sitzungen/Notizen/Gruppenstatus, LSB-Reisegruppen/Routen/Kalibrierung, Stempel-/Ueberschreiben-Werkzeug-Daten - siehe FEATURE_PRESERVATION_MATRIX.md fuer die Begruendung je Funktion.`,
  );
  const stillMissing = perMapResults.filter((result) => !result.found);
  if (stillMissing.length) {
    reportLines.push('');
    reportLines.push('## Naechster Schritt fuer echte Pin-Daten der verbleibenden Karten');
    reportLines.push('');
    for (const result of stillMissing) {
      reportLines.push(`### ${result.map.title} (\`${result.map.id}\`)`);
      reportLines.push('');
      reportLines.push(`1. Das alte Kartenmodul lokal oeffnen: \`Karten/karte.html?map=${result.map.id}\` (falls es dort noch keine eigene Karte gibt, entfaellt dieser Weg - dann gibt es aktuell keine bekannte Quelle fuer echte Pins).`);
      reportLines.push('2. Editormodus aktivieren (Passwort siehe `Karten/assets/js/karto-app.js`).');
      reportLines.push('3. "📦 Daten" -> "⬇ Exportieren" -> JSON herunterladen.');
      reportLines.push(`4. Datei speichern als \`karten-v2/data/legacy-export/${result.map.id}.json\`.`);
      reportLines.push('5. Pruefen, ob die Datei sauberes UTF-8 ist (siehe Hinweis unten) - dann `npm run migrate:legacy` erneut ausfuehren.');
      reportLines.push('');
    }
  }
  reportLines.push('## Hinweis zu Zeichenkodierung');
  reportLines.push('');
  reportLines.push(
    'Der Celtigerns-Wacht-Export kam mit einem Mojibake-Problem an (UTF-8 wurde als Latin-1 gelesen, z. B. "FÃ¼hrung" statt "Führung"). Das wurde vor der Migration behoben, siehe `docs/KNOWN_LIMITATIONS.md`. Ein neuer Export einer anderen Karte kann dasselbe Problem haben - vor dem Ausfuehren von `npm run migrate:legacy` stichprobenartig auf sowas wie "Ã¼"/"Ã¶"/"Ã¤" in der Datei pruefen.',
  );
  reportLines.push('');

  writeFileSync(resolve(ROOT, 'docs', 'MIGRATION_REPORT.md'), reportLines.join('\n'));
  console.log(`Migrated ${totalMigratedPins} pins across ${activeMaps.length} active map(s). Report written to docs/MIGRATION_REPORT.md`);
}

main();
