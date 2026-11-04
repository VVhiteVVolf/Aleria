import { writeFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS, TRAIT_BALANCE_BASELINE } from '../../AleriaAlmanach/modules/character-development/development-trait-revision-source.js';
import { getHealthTraitOrigin } from '../../AleriaAlmanach/modules/character-health/health-trait-catalog.js';
import { getBloodlineTraitOrigin } from '../../AleriaAlmanach/modules/character-development/development-bloodline-traits.js';
import { getTransformationTraitOrigin } from '../../AleriaAlmanach/modules/character-development/development-theriantrophie-traits.js';

const previous = new Map(PREVIOUS_DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
const reasons = {
  'feuer-phobie': 'Angst erschwert Rettungen, verursacht aber keine physische Feueranfälligkeit.',
  'frost-phobie': 'Angst erschwert Rettungen, verursacht aber keine physische Kälteanfälligkeit.',
  'blitz-phobie': 'Angst erschwert Rettungen, verursacht aber keine physische Blitzanfälligkeit.',
  'gift-phobie': 'Angst erschwert Rettungen, verändert aber keinen Giftstoffwechsel.',
  naturkind: 'Umgebungserfahrung gibt kleine Boni, keine automatische Expertise.',
  vertraeumt: 'Aufmerksamkeitsnachteil erhalten; unbegründete arkane Fachkenntnis entfernt.',
  zerbrechlich: 'Empfindlichkeit erhalten; unbegründete Akrobatik entfernt.',
  aengstlich: 'Furchtmalus erhalten; unbegründete Schleichfertigkeit entfernt.',
  glutgewoehnt: 'Ruhigerer Umgang mit Feuer hilft der Rettung; Gewöhnung halbiert keinen Brandschaden.',
  empathisch: 'Einfühlung unterstützt zwei soziale Fertigkeiten um einen kleinen Betrag.',
  schroff: 'Kleine gegenläufige soziale Einflüsse statt pauschalem Expertenvorsprung.',
  ungeschickt: 'Feinmotorischer Nachteil ohne sachfremde zusätzliche TP.',
  'arkaner-fokus': 'Ein Zauberer nutzt den Waffenmalus häufig kaum; Preis des wirksamen Zauberbonus erhöht.',
  glueckspilz: 'Explizite einmalige Würfelwiederholung macht Glück spürbar; Preis berücksichtigt sie.',
  pechvogel: 'Explizite Fehlschlagszone 1–3 macht Pech spürbar; Gutschrift berücksichtigt sie.',
  konzentriert: 'Vorteil nur zum Erhalten einer Konzentration; kein unverdienter Gift-/Krankheitsschutz.',
  duennhaeutig: 'Kleiner passender CHA-Malus; keine aus Empfindlichkeit abgeleitete Bühnenausbildung.',
  vollbusig: 'Körperform bleibt Beschreibung und vergibt keine pauschale Fertigkeit.',
  haesslich: 'Kleiner enger Eindrucksmalus; keine automatische Einschüchterung.',
  gutaussehend: 'Kleiner enger Eindrucksbonus; Aussehen ersetzt keine Rhetorik/Bühnenausbildung.',
  klein: 'Größenwirkung auf ±1 mit ausgeglichenem Richtpreis verkleinert.',
  gross: 'Größenwirkung auf ±1 mit ausgeglichenem Richtpreis verkleinert.',
  riesenblut: 'Masse hilft Athletik und TP; kein pauschaler Bonus auf Bogen-/Feuerwaffenschaden.',
  breitschultrig: 'Kleiner Kraftbonus; Schulterbreite beeinträchtigt keine Fingerfertigkeit.',
  heilerhaende: 'Begabung gibt begrenzte Versorgungshilfe statt stufenabhängiger automatischer Expertise.',
  spuernase: 'Ausgeprägte Beobachtung ist stärker als bloße Neugier, aber keine automatische Expertise.',
  buehnenbegabt: 'Begrenzte Ausdrucksbegabung statt automatischer Expertise.',
  'flinke-finger': 'Begrenzte manuelle Begabung statt automatischer Expertise.',
  faehrtenleser: 'Begrenztes Spurengespür statt automatischer Expertise.',
  luegenriecher: 'Kleines Gespür; weder unfehlbares Erkennen von Lügen noch automatische Expertise.',
  frohnatur: 'Freundlicher Eindruck unterstützt Kontakt; Fröhlichkeit erkennt keine versteckten Motive.',
  buehnenmensch: 'Kleiner Ausdrucks-/Wildnisgegensatz; sachfremder Einschüchterungsmalus entfernt.',
  'schuldengewissen': 'Verlässlichkeit hilft Überzeugen; Gewissen vermittelt kein Gedankenlesen.',
  'pazifistische-ader': 'Versöhnliche Haltung bleibt; medizinische Fachfertigkeit aus Überzeugung entfernt.',
  zahlenintuition: 'Kleines Mustererkennen ohne historisches Fachwissen.',
  'feines-musikgehoer': 'Musikalisches Gehör hilft Ausdruck, nicht dem Erkennen fremder Absichten.',
  raumgefuehl: 'Räumliches Körpergefühl hilft Bewegung, nicht allgemeinen Ermittlungen.',
  'tierisches-taktgefuehl': 'Umgang mit Tieren verbessert keine allgemeine Körperausbildung.',
  psychopath: 'Autorische Spielprägung mit kleinem Paket; keine automatische Detektivkompetenz.',
  soziopath: 'Autorische Spielprägung mit kleinem Paket; keine automatische Detektivkompetenz.',
  narzisstisch: 'Kleine Selbstdarstellungs-/Selbstbehauptungswirkung mit kleinen sozialen Nachteilen.',
  'eidetisches-gedaechtnis': 'Erinnern unterstützt bekanntes Wissen, erhöht aber nicht INT oder Heilkunde.',
  genie: 'Geistige Begabung wirkt auf INT und Nachforschung; körperliche und pauschale Fertigkeitsbuffs entfallen.',
  'geistig-beschraenkt': 'Ausdrückliche feste Autorenregel erhalten; INT/WEI-Wertobergrenze 3 bleibt wirksam.',
  vollidiot: 'Ausdrückliche alternative Autorenregel erhalten; stärkere Grenze ersetzt statt stapelt.',
  'arkanistenfieber-anzeichen': 'Spürbarer Zauberangriffsbonus ist ein positiver Richtpreis; keine kostenlose Buff-Optimierung.',
  'arkanistenfieber-symptome': 'Zusätzlicher KON-Malus neutralisiert den Richtpreis des frühen Magieschubs.',
  'schwere-knochen': 'Kleine feste Widerstandskraft mit nachvollziehbarer Trägheit.',
  'scharfe-augen': 'Ausgeprägter körperlicher Sinn darf stärker sein; +3 passive Wahrnehmung ist ausdrücklich erklärt.',
  schwerhoerig: 'Bestehender allgemeiner Wahrnehmungsabzug bleibt als ausdrücklich erklärte Regelabstraktion.',
  'giftfest': 'Tatsächliche körperliche Giftfestigkeit darf Schaden und Giftrettungen betreffen; Preis 4 erhalten.',
  'gelehrt': 'Wissensorientierter Ausbildungs-Trait mit Expertise und körperlichem Tradeoff bleibt erhalten.',
  silberzunge: 'Ausgesprochener rhetorischer Ausbildungs-Trait mit Expertise und Tradeoff bleibt erhalten.',
  'kampfbereit': 'Kleiner begrenzter Kampfeinstiegs-Vorrat; fehlende Engine-Anwendung separat behoben.',
  'lebhafter-geist': 'Breiter kleiner Fertigkeitsbonus kostet Punkte und dauerhaften Rüstungsschutz.',
  'buehnensicher': 'Enger Fertigkeitsvorteil; keine zusätzlichen Würfel bei mehreren Quellen.',
  'arkan-geschult': 'Explizite Schulung betrifft nur Arkane Kunde, keine zusätzliche Zaubermacht.'
};

function reason(trait) {
  const id = trait.id.replace('development-trait-', '');
  if (reasons[id]) return reasons[id];
  const health = getHealthTraitOrigin(trait);
  if (health) return health.group === 'fever' ? 'Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift.'
    : health.group === 'addiction' ? 'Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge.'
    : health.group === 'tolerance' ? 'Enger stoffgebundener Schwelleneffekt, ohne Schutz vor Schaden oder Risiken.'
    : 'Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet.';
  if (getBloodlineTraitOrigin(trait.id)) return 'Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe.';
  if (getTransformationTraitOrigin(trait.id)) return 'Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung.';
  if (trait.tags.includes('Begabung')) return previous.has(trait.id) ? 'Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete.' : 'Kleine Initiative-/Willenskombination ist begrenzt und passend bepreist.';
  if (trait.tags.includes('Besondere Eigenheit')) return previous.has(trait.id) ? 'Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung.' : 'Eng gefilterte kleine Waffen-/Magiewirkung ist bereits stimmig; keine weitere Ausweitung.';
  if (trait.mechanics.damageAffinities?.length) return 'Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal.';
  if (trait.tags.includes('Körper')) return 'Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar.';
  return 'Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe.';
}

const rows = DEVELOPMENT_TRAITS.map(trait => ({ id: trait.id, name: trait.name, revised: previous.has(trait.id),
  previousCost: previous.get(trait.id)?.cost ?? trait.cost, cost: trait.cost,
  description: trait.description, reason: reason(trait) }));
const header = `# Trait-Balanceprüfung vom 3. November 2026

Alle 185 auswählbaren Definitionen wurden nach Wirkung, logischem Zusammenhang,
Reichweite, Preis und Überschneidungen geprüft: 65 Definitionen überarbeitet,
120 bewusst unverändert. Grundlage des Vorher-Vergleichs ist Git-Stand
\`${TRAIT_BALANCE_BASELINE}\`. Die Tabelle enthält jeden Eintrag einzeln.

## Maßstab und Entscheidungen

- Ein normaler Bonus +1 verändert eine nicht gedeckelte normale W20-Erfolgschance
  um fünf Prozentpunkte. +3 sind bereits fünfzehn Prozentpunkte. Gewöhnliche
  Eigenheiten und Begabungen bleiben deshalb bei meist ±1. Besondere ausgeprägte
  Sinne und Talente können +2 rechtfertigen; Expertise ist eigene Ausbildung.
- Neugier vor Vorsicht ist jetzt +1 Nachforschung / −1 GES-Rettung für 0 Punkte.
  Die kleinen Werte sind allgemeine Regelabstraktionen, keine behauptete
  automatische Ermittlerausbildung oder heimlich ungeprüfte Situationsfilter.
- Tagträume verleihen kein arkanes Wissen, Ängstlichkeit keine Schleichausbildung,
  Pazifismus keine Medizin, Musikgehör keine Menschenkenntnis und Körperformen
  keine automatische Bühnenausbildung. Entsprechende sachfremde Boni entfallen.
- Phobien erschweren passende Rettungen. Physische Anfälligkeit ist weiterhin
  ein eigener Trait. Feuergewöhnung gibt +1 auf passende Rettungen statt halben
  Brandschaden. Eiserne Konzentration hilft ausschließlich Konzentrationsrettungen.
- Die sieben psychologischen Namen bleiben autorische Aleria-Spieldefinitionen.
  Die Pakete behaupten keine klinischen Eigenschaften. Die automatische
  Detektivverstärkung entfällt. Gedächtnis erhöht bekanntes Wissen, Genie INT
  und eine kleine Nachforschungskomponente. Die ausdrücklich festgelegten
  kognitiven Wertobergrenzen bleiben erhalten.
- Das frühe Arkanistenfieber behält seine Autorenwirkungen; allein seine Preise
  werden auf 1 / 0 angehoben. Ein Magieschub ist kein kostenloser Punktegenerator.
- Preise sind Richtwerte für eine frei bearbeitbare Figur. Negative Salden bleiben
  erlaubt; Grundausbildung und persönliche Absprachen werden nicht rückwirkend
  neu berechnet. Viele kleine unabhängige Traits können sich weiter addieren.
  Neue Hinweise zeigen mehr als +3 Fertigkeitsbonus bzw. mehr als +2 Attributsrettung
  aus kombinierten numerischen Merkmalen. Nicht stapelbare Wirkungen zählen einmal.

## Glück und Pech

| Merkmal | Normale natürliche Fehlschlagszone | Weitere Wirkung | Richtpreis |
| --- | --- | --- | --- |
| Ohne Merkmal | natürliche 1: 5 % | unverändert | 0 |
| Glückspilz | zweimal hintereinander natürliche 1: 0,25 % | jede 1 einmal neu; +1 Attributsrettung | 5 |
| Pechvogel | natürliche 1–3: 15 % | −1 Attributsrettung | −5 |

Die Prozentwerte beschreiben nur die natürliche Fehlschlagszone bei einem W20,
nicht die gesamte SG-abhängige Fehlerrate. Vorteil/Nachteil würfeln jeden
betroffenen W20 einmal neu; eine zweite 1 bleibt verbindlich. Beide Traits
zusammen erhalten beide Regeln: 1 einmal neu, 2/3 weiter kritischer Fehlschlag;
die Rettungsboni heben sich auf. Wiederholte Quellen gewähren keine weiteren Rerolls.

## Kampfstart und bestehende Daten

Immer kampfbereit war gespeichert, wurde aber bei eigenen Figuren nicht angewandt.
Neue versionierte \`startApplications\` gewähren jetzt bei erstem Kampfeintritt
den stärksten eigenen temporären TP-Vorrat einschließlich aktiver Self-Aura.
Mit vorhandenen temporären TP zählt das Maximum. Verlassen/Wiedereintritt,
Wiederaufnahme und Neuladen füllen den Vorrat nicht auf. Aktuelle TP und andere
Ressourcen bleiben erhalten. Die Anwendung läuft vor fremden Auren, damit deren
späteres Ende den eigenen verbleibenden Vorrat richtig erhält.

Historische Kampfstartbelege ohne dieses Feld erhalten keine nachträgliche Wirkung.
Eine eigene Katalogrevision erkennt ausschließlich exakt bekannte unveränderte
Altkopien anhand vollständiger vorheriger Definitionen. Persönliche Varianten
bleiben erhalten; die Revision verändert keine vergangenen Würfe und füllt keine
Live-Ressourcen auf. Das Vorher-Manifest bleibt als reversible Quelle erhalten.

## Prüfungen

- \`character-development-balance.test.mjs\`: zehn semantische Prüfungen zu Neugier,
  kleinen Begabungen, Phobien, Feuergewöhnung, Körpermasse, Konzentration,
  Glück/Pech-Preisanteilen, Stapelhinweisen und frühen Fieberpreisen.
- \`combat-encounter-start-effects.test.mjs\`: sechs Lebenszyklusprüfungen zu neuen
  und historischen Starts, Wiedereintritt, Replay, inaktiven Quellen, stärkeren
  vorhandenen temporären TP und eigener/fremder Aura.
- Bestehende Entwicklungs-/Psyche-/Erweiterungs-/Audit-Regressionen prüfen die
  neuen Sollwerte und die unveränderte Grundausbildung. Die finale Browser/Server-
  Prüfung erfolgt nach gemeinsamem Mechanik-Sync; Teilprotokolle liegen unter
  \`diagnostics/trait-balance-20261103/\`.

## Vollständige Prüfmatrix

„Geändert“ schließt reine Preis- oder präzisierte Wirkungsänderungen ein.
Die Wertebeschreibung ist die jetzt sichtbare Katalogregel.

| Merkmal | Entscheidung | Punkte vorher → jetzt | Aktuelle Regel | Begründung |
| --- | --- | --- | --- | --- |
`;
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const report = header + rows.map(row => `| ${cell(row.name)} | ${row.revised ? 'Geändert' : 'Erhalten'} | ${row.previousCost} → ${row.cost} | ${cell(row.description)} | ${cell(row.reason)} |`).join('\n') + '\n';
await writeFile(new URL('../../AleriaAlmanach/docs/combat/TRAIT_BALANCE_2026-11-03.md', import.meta.url), report);
await writeFile(new URL('./catalog-review.json', import.meta.url), JSON.stringify({ baseline: TRAIT_BALANCE_BASELINE, total: rows.length, revised: rows.filter(row => row.revised).length, rows }, null, 2) + '\n');
console.log(JSON.stringify({ total: rows.length, revised: rows.filter(row => row.revised).length, retained: rows.filter(row => !row.revised).length }));
