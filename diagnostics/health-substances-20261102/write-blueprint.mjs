import { mkdir, writeFile } from 'node:fs/promises';
import { PERMANENT_AFFLICTIONS, ARCANE_FEVER_TRAITS, ADDICTION_TRAITS, TOLERANCE_TRAITS } from '../../AleriaAlmanach/modules/character-health/health-trait-catalog.js';
import { SUBSTANCE_ITEM_CATALOG } from '../../AleriaAlmanach/modules/character-health/substance-item-catalog.js';
const root = new URL('../../', import.meta.url), target = new URL('AleriaAlmanach/docs/health/', root);
await mkdir(target, { recursive: true });
const table = entries => '| Merkmal | Tatsächliche Wirkung | Punkte |\n| --- | --- | ---: |\n' + entries.map(entry => `| ${entry.name} | ${entry.description} | ${entry.cost} |`).join('\n');
const text = `# Dauerhafte Leiden, Arkanistenfieber und Rauschmittel

Regel- und Umsetzungsplan vom 2. November 2026, nach ausdrücklicher Freigabe
„Plan und direkt umsetzen“. Die Regeln sind Aleria-Spielmechanik. Die folgenden
Zahlen sind keine Blutalkoholberechnung oder medizinische Dosierungsempfehlung.

## Dauerhafte Leiden

Diese 30 Merkmale liegen dauerhaft auf dem Charakterbogen. TP-Heilung, Rast,
Kampfende und das Ablaufen eines Rausches entfernen sie nicht. Sie können eine
angeborene oder erworbene Beeinträchtigung abbilden; nur ausdrücklich angeborene
Merkmale sind entsprechend markiert. Bewusste redaktionelle Bogenkorrekturen
bleiben wie bisher möglich. Es erfolgt keine automatische Vergabe an bestehende
Figuren und keine pauschale Änderung ihrer Rasse, Klasse oder Lebensgeschichte.

${table(PERMANENT_AFFLICTIONS)}

Einschränkungen werden funktional beschrieben. Blindheit macht visuelle Aufgaben
ohne geeigneten Ersatz unmöglich, beeinträchtigt aber nicht pauschal jeden
anderen Sinn. Taubheit mindert keine visuelle Wahrnehmung und gibt keinen
Charisma-Malus. Stumme Figuren können geeignete andere Verständigungswege
benutzen. Prothesen, Rollstühle, Ersatzsinne und individuelle Hilfen werden
gesondert ausgestaltet und nicht als geschenkte Ausrüstung angelegt.

Bei Wahrnehmungs- und Nachforschungsproben lässt sich der benötigte Sinn wählen.
Explizit unmögliche Sinnesproben werden vor dem Würfeln in Browser und Server
abgewiesen. Gemischte oder alternative Methoden bleiben wählbar und müssen zur
Situation passen. Handverlust sperrt ausgewiesene Zweihandführung,
Zweiwaffenführung und entsprechende gleichzeitige Waffen-/Schildnutzung.
Die gewöhnliche Darstellung von Sprache oder Hilfsmitteln bleibt eine
individuelle Erzählerentscheidung; das System interpretiert keinen freien
Rollenspieltext als medizinische oder körperliche Prüfung.

## Arkanistenfieber

Grundlage ist das vorhandene Almanach-Modul „Das Arkanistenfieber“ mit seinen
vier Hauptstadien. Die beiden Vorstufen und ihre kleinen frühen Magieboni sind
neue Spielausarbeitungen. Die Druidenvariante erhält ausdrücklich keine Nekrose.
Ein Zusammenhang mit der Entstehung von Nekrophagen bleibt die im Modul genannte
Theorie und bewirkt keine automatische Verwandlung.

${table(ARCANE_FEVER_TRAITS)}

Der Verlauf lautet **Anzeichen → Erste Symptome → I → II → III → IV**.
Ab Stadium I wird die menschliche oder die druidische Ausprägung geführt.
Die Auswahl einer neuen Stufe ersetzt im Assistenten die bisherige Auswahl
derselben Krankheit. Bei importierten Mehrfachstufen wirkt nur die stärkste;
auch ihre Punkte werden nicht mehrfach gutgeschrieben. Ein Hinweis erklärt dies.

Fortschritt wird bewusst eingetragen. Das Quellenmodul nennt keine festen
Stunden- oder Tagesfristen, deshalb wird keine solche Frist behauptet. Magiepause,
Bettruhe und Naturalchemie können gemäß Modul früh lindern oder verlangsamen;
gewöhnliche Heilung entfernt das Merkmal nicht. Endstadium IV sperrt
selbstbestimmte Kampfhandlungen; „Abwarten / Zug aussetzen“ bleibt möglich.
Aktuelle TP werden beim Eintragen von Maximal-TP-Mali nicht aufgefüllt.

## Abhängigkeiten

${table(ADDICTION_TRAITS)}

Die drei Stoffe haben getrennte Abhängigkeiten. Nur der jeweils passende aktive
Rausch unterdrückt die genannten Entzugsabzüge. Eine kleine Dosis unterhalb der
Rauschschwelle genügt nicht; Alkohol lindert keinen Kriss-Entzug. Mit Rauschende
kehren die Entzugsabzüge zurück und können mit dem Kater zusammenwirken.
Das Merkmal selbst wird nie durch Konsum geheilt oder entfernt. Je Stoff gilt
ein Stadium; mehrere Abhängigkeiten verschiedener Stoffe sind möglich.

Eine neue Abhängigkeit oder eine Verschlimmerung wird bewusst dokumentiert,
nicht nach einem einzelnen Getränk heimlich vergeben. Die Auswahl ändert keine
vorhandenen Vorräte oder Inventare.

## Stoffbezogene Toleranz

${table(TOLERANCE_TRAITS)}

Toleranz wird je Stoff einmal angewandt. Sie erhöht die nötige Menge um den
Faktor zwei. Sie gibt weder Giftresistenz noch vermindert sie die Nachwirkungen
oder das Krankheitsrisiko größerer Mengen. Die Dauer des Katers richtet sich
deshalb nach der unverminderten körperlichen Belastung. Chronische
Leberschwäche erhöht die Alkoholbelastung zusätzlich um 25 Prozent.

## Mengen, Stärke und Rauschschwelle

Alkoholbelastung = **Inhalt in ml × Alkoholgehalt in Prozent ÷ 1000**.
Die normale Schwelle für „Betrunken“ liegt bei **4,8 Belastungspunkten**.
Ein Becher Normalbier mit 0,20 l und 5 Prozent liefert 1 Punkt: der fünfte Becher
erreicht die Schwelle. Ein Whiskyglas mit 4 cl und 40 Prozent liefert 1,6 Punkte:
das dritte Glas erreicht sie. Mit Alkoholtoleranz gilt die doppelte Schwelle.

| Gebinde | Normalbier, 5 % | Whisky, 40 % |
| --- | ---: | ---: |
| Becher Bier, 0,20 l / Glas Whisky, 4 cl | 1 | 1,6 |
| Krug Bier, 0,50 l / Flasche Whisky, 0,70 l | 2,5 | 28 |
| Flasche Bier, 1 l | 5 | — |
| Fass, 50 l | 250 | 2000 |

Es zählt die tatsächlich konsumierte Menge. Kauf, Besitz und Aufheben erzeugen
keinen Rausch. Ein konsumiertes ganzes Fass ist das ganze Gebinde, keine einzelne
Portion. Der Konsumdialog zeigt die Belastung je Exemplar. Teilgebinde werden
nicht still als Glas interpretiert; eine ausgeschenkte Portion benötigt eine
eigene passende Menge beziehungsweise ein entsprechendes Item.

Vor Erreichen der Schwelle sammeln sich Dosen in einem gemeinsamen Fenster
von einer Szenenstunde. Danach verfällt diese unterschwellige Belastung.
Sobald der Rausch aktiv ist, erhöht weiterer Konsum seine Belastung und kann
die Wirkzeit verlängern. Toleranz muss auch bei Drogen zunächst durch die
entsprechende Zahl tatsächlicher Dosen überwunden werden.

Bekannte Prozentwerte, etwa die sechs Gortach-Biere und die Gortach-Whiskys,
werden aus ihren tatsächlichen Beschreibungen übernommen. Fehlende Werte sind
ausdrücklich neue Spielvorgaben: Normalbier 5, Dünnbier 2, Starkbier 7,5,
Apfelwein 5, gewöhnlicher Met 10, leichter Met 6, Wein 12, gewöhnliche
Spirituose 40 und Klosterspiritus 60 Prozent. Alte Rausch-Bewertungen auf einer
Skala von 0–10 werden nicht als Alkoholprozente missverstanden.

Die Quellenprüfung erfasst **27 öffentliche Module**, die Standardmärkte und
**${SUBSTANCE_ITEM_CATALOG.length} eindeutige Wirkprofile** einschließlich ihrer
Gebinde. Wasser, Tee, Speisen in Getränkekategorien und Platzhalter werden
ausgeschlossen. Die vollständige Zuordnung steht in
[DRINK_EXPOSURE_AUDIT.md](DRINK_EXPOSURE_AUDIT.md).

## Rausch und Nachwirkungen

| Zustand | Wirkung | Grunddauer |
| --- | --- | --- |
| Betrunken | +2 gegen Furcht; −1 Angriff, Initiative und Zauber-SG, −2 Fertigkeiten | 60 / 120 / 180 Szenenminuten |
| Kriss-Rausch | +2 Wahrnehmung, +1 Initiative und GES-Rettung; −2 WEI-Rettung | 60 / 120 / 180 Szenenminuten |
| Smaragdflux-Rausch | +2 Zauberangriff, +1 Zauber-SG; −1 RK, −2 KON-Rettung | 30 / 60 / 90 Szenenminuten |
| Blutstaub-Rausch | +1 Initiative, +2 Nachforschungen; −1 Motiv erkennen und KON-Rettung | 60 / 120 / 180 Szenenminuten |
| Verkatert, je Stoff | −1 Fertigkeiten und Initiative; Entzug wirkt wieder | 60 / 120 / 180 Szenenminuten |

Die normalen Drogenprofile verwenden eine veröffentlichte Phiole beziehungsweise
Portion als Wirkdosis. Traumkorn bleibt die regulierte Rohsubstanz und wird
nicht automatisch mit fertigem Kriss gleichgesetzt. Kriss-Reflexe und
Smaragdflux-Magieschub folgen den bestehenden Markttexten. Die Zahlen und
Zeitprofile sind neue Spielausarbeitungen. Keine Droge füllt automatisch Mana
oder Aktionsressourcen auf. Mögliche Organschäden und Arkanistenfieber werden
gesondert anhand der Geschichte beziehungsweise einer ausdrücklich vereinbarten
Prüfung beurteilt; der Konsumdialog meldet diese Risiken, ohne heimlich eine
unheilbare Krankheit oder einen Tod zu vergeben.

Die Dauerstaffel steigt ab dem 1,5-fachen beziehungsweise 2,5-fachen der
jeweiligen Rauschschwelle. Ein neuer Konsum kann den Ablauf nach hinten schieben.
Ein Schluck unterhalb der Schwelle entfernt einen bestehenden Kater nicht.
Ein erneuter passender Rausch überlagert die Nachwirkung dieses Stoffes;
Nachwirkungen anderer Stoffe bleiben erhalten. Mehrere Stoffe werden getrennt
geführt; ihre unterschiedlichen Wirkungen können zusammentreffen.

## Zustandsübergänge und Szenenzeit

**Nüchtern → Belastung unter der Schwelle → Rausch → Verkatert → Nüchtern**.

Gespeichert werden der Stoff, die Phase, aktuelle und höchste Belastung,
Toleranz, Beginn, Ablauf und folgende Katerdauer. Mehrfaches Laden erzeugt
keine zweite Dosis und keinen zusätzlichen Kater. Ein großer Zeitsprung kann
Rausch und Kater in einem Schritt vollständig beenden. Die Katerdauer beginnt
am tatsächlichen Rauschende und nicht erst beim nächsten Öffnen des Fensters.

Ausschließlich die interaktive Szenenuhr zählt: gesetzte Szenenanker und
tatsächliche Beitragsabschnittsdauern, mit demselben Fünf-Sekunden-Standard
wie die vorhandene Zeitlinie. Reale Wartezeit, Seitenaktualisierung und bloßes
Zählen eigener Beiträge lassen diese Zustände nicht ablaufen. Ohne gesetzte
Szenenuhr wird mechanischer Rauschmittelkonsum mit einer klaren Meldung
abgewiesen; der Bestand bleibt dabei unverändert.

Rasten löschen diese zeitgebundenen Zustände nicht pauschal. Eine Rast kann
aber die Szenenuhr ausreichend weiterstellen, sodass beide Phasen ablaufen.
Ein Zeitrücksprung belebt bereits abgelaufene Wirkungen nicht wieder. Die
vorhandenen Kalender- und Ressourcenerholungsschlüssel bleiben unverändert.
Wie andere temporäre Szeneneffekte werden die Zustände im jeweiligen
Szenenverlauf geführt; ein automatischer globaler Transfer zwischen getrennten
Szenenthreads wurde nicht eingeführt.

## Zuständigkeiten und künftige Einträge

- modules/character-health/ besitzt Leiden, Stadien, Unterdrückungsregeln,
  Wirkprofile, Mengenprojektion, Zustandsübergänge und Vorschau.
- scene-time/scene-condition-clock.js besitzt die reine vertrauenswürdige
  Szenenuhr für zeitgebundene Zustände. Sie verändert keinen Kalenderbeginn.
- Das Inventarsystem prüft weiter tatsächlichen Besitz und veröffentlichtes
  Itemregelwerk. Konsum und Zustand werden in derselben Transaktion gespeichert.
- Das bestehende Zustandsfenster zeigt feste und gezielte Boni, Mali, eigene
  Icons und verbleibende Szenenminuten. Beide Assistenten nutzen dieselben
  vier neuen Filter und dieselben dauerhaften Katalogmerkmale.

Neue Getränke und Drogen erhalten im Item-Builder ein ausdrückliches
Rauschmittelprofil. Alkohol benötigt Inhalt und Stärke, Drogen die Wirkdosen
je ganzem Exemplar. Das liegt unter useDefinition.substance und bleibt beim
Erstellen einer Variante erhalten. Autoren neuer öffentlicher Quellangebote
aktualisieren den geprüften Stoffkatalog; unklare alkoholische Angebote werden
beim Bau sichtbar zurückgewiesen. Mechaniken werden nicht aus einem frei
umbenannten Inventargegenstand abgeleitet. Unverknüpfte Altitems benötigen eine
passende Definition; bestehende Inventare werden nicht pauschal migriert.

Alle **52 neuen Merkmale und fünf Rausch-/Katerzustände** erhalten nach der
ausdrücklichen Nutzerkorrektur eigene neue kreisförmige Comicicons.
Keine alten Baldur's-Gate-Icons und keine bloßen Neuverknüpfungen alter
Traitbilder dienen als Endfassung. Hochaufgelöste Originale und vollständige
Prompts bleiben erhalten, die Oberfläche verwendet kleine WebP-Ableitungen.

Prüfbelege, Quellen und Bildaufträge liegen unter
diagnostics/health-substances-20261102/. Produktivdaten und historische
Würfe werden nicht verändert; dieser Auftrag enthält keinen Push oder Deploy.
`;
await writeFile(new URL('HEALTH_AND_SUBSTANCES_2026-11-02.md', target), text, 'utf8');
const audit = '# Geprüfte Alkohol- und Drogenangebote\n\nQuelle: die öffentlichen Standardmärkte und tatsächlich geladenen Handelsmodule.\n„Spielvorgabe“ kennzeichnet neu angenommene Stärke, nicht einen Quellenbeleg.\n\n| Angebot | Einheit | Inhalt | Stärke | Belastung / Dosen | Grundlage |\n| --- | --- | ---: | ---: | ---: | --- |\n' + SUBSTANCE_ITEM_CATALOG.map(item => `| ${item.name} | ${item.unit} | ${item.volumeMl ? item.volumeMl + ' ml' : '1 Portion'} | ${item.abv ? item.abv + ' %' : '—'} | ${Number(item.exposure.amount.toFixed(3))} | ${item.basis === 'source-abv' ? 'Belegter Prozentwert' : item.basis === 'game-design-default' ? 'Spielvorgabe' : 'Veröffentlichte Phiole / Portion'} |`).join('\n') + '\n';
await writeFile(new URL('DRINK_EXPOSURE_AUDIT.md', target), audit, 'utf8');
console.log(JSON.stringify({ afflictions: 30, fever: 10, addictions: 9, tolerances: 3, substanceProfiles: SUBSTANCE_ITEM_CATALOG.length }));
