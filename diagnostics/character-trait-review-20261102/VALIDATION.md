# Prüfbeleg

Stand 2. November 2026. Keine Veröffentlichung und keine Online-Schreibzugriffe.

- Vollständiges Frontend: **2.241 Tests bestanden**, keine Fehler.
- Gemeinsame Servermechanik: **330 Tests bestanden**, keine Fehler.
- Release-Unit-Tests: **37 Tests bestanden**, keine Fehler; kein Push/Deploy.
- Abschließender gezielter Lauf mit Archiv-Overlay, Gawain-Datenbankabgleich und
  Biografiekarten: **27 Tests bestanden**, keine Fehler.
- Produktionsbuild: Vite erfolgreich, expliziter Prozess-Exitcode **0**.
- 268 generierte Servermodule stimmen bytegenau mit ihren gemeinsamen Quellen
  überein. Keine separate Kopie der Traitregeln implementiert.
- Eigenschaftsabgleich, Gawain-Biografieabgleich und öffentlicher
  Biografiekatalog bestehen jeweils ihren schreibfreien `--check`.
- Dependency-Check: alle 1.565 von den Gameplay-Guides verwendeten Quellmodule
  werden durch ihre Build-Eingaben abgedeckt.
- `git diff --check`: bestanden.

Browserprüfung: Alle 14 geänderten Altbögen öffnen und sammeln genau die geprüfte
Auswahl, einschließlich der drei leeren Auswahlen. Aktuelle TP, Stufe und die vom
gleichen UI normalisierten Ressourcen sind vor/nach dem Abgleich identisch.
Fünf Biografien stimmen mit den Eigenschaftskarten überein. Icons dekodieren;
Freya auf Desktop und Handy ohne horizontalen Überlauf. Keine JavaScriptfehler;
externe Schreibzugriffe sind vom Testserver blockiert. Das dadurch in der Vorschau
angezeigte Offline-/Synchronisationssignal ist kein Produktions-Schreibversuch.

Browserbelege:
`E:/Aleria/.tmp/character-trait-review-20261102/browser-1793649927395/`

- `report.json`
- `freya-traits-desktop.png`
- `freya-traits-phone.png` (visuell angesehen)
- `freya-biography-desktop.png`

Die Tests prüfen außerdem:

- Nur 18 Eigenschaften auf 14 Altbögen, höchstens drei; fünf neue ausgerüstete
  Figuren bewusst unverändert ohne hinzugedichtete Traits.
- Keine klinische Zuschreibung aus Zahlenwerten, keine neue Krankheit und kein
  unbelegter Blutträgerstatus.
- Alte Quirks kehren beim Archiv-Replay nicht zurück. Entfernt werden zusätzlich
  nur die ausdrücklich benannten alten persönlichen Ability-/Condition-IDs.
- Ein späterer vollständiger Bogen gewinnt gegen einen älteren Traitabgleich.
  Fehlende Bögen und Biografien werden nicht neu erzeugt, deaktivierte Bios
  bleiben deaktiviert. Gezielte Technik- und Traitexporte sind miteinander
  verträglich.
- Inventare, Ausrüstung, Grundattribute, Arsenal, Nutzungsstände und aktuelle TP
  der ausgewählten Figuren bleiben exakt erhalten. Max-TP-Boni werden abgeleitet
  und heilen nicht. Unausgewählte Figuren und Registerpfade bleiben bei der
  begrenzten Projektion unverändert.
- Bei einer zwischenzeitlich geänderten Eigenschaftsauswahl bricht der Builder
  ab. Eine erneute Ausführung schreibt keine Änderungen.
- Öffentliche Prosa, Geschichte, Beziehungen, Mentoren und Statistiken bleiben
  unverändert; ausschließlich fünf Eigenschaftskartengruppen werden ersetzt.
  Gais’ Stammbaumquelle und Gawains öffentliche Biografie verwenden denselben
  gemeinsamen Kartenadapter.

Zwei bestehende Tests wurden an die bewusste Datenänderung angepasst: Der
Legacy-Deduplizierungstest verwendet nun den historischen Ausgangsbogen, statt
alte Merkmale im aktuellen Bogen vorauszusetzen. Im Szenariotest wird Guineveres
Wurf für einen ausdrücklich deutlichen Fehlschlag passend zur neuen Expertise
gewählt; Browser und Server berechnen das Ergebnis weiterhin unabhängig gleich.

Die ersten Browser-/Compiler-Starts wurden durch die lokale Prozess-Sandbox
blockiert (`EPERM`). Die erneuten lokalen Prüfungen mit erlaubtem Prozessstart
bestanden. Die vollständige Frontend-Suite wurde nach den Korrekturen vollständig
wiederholt; danach bestand zusätzlich der gezielte Lauf für die ergänzte
Gais-Stammbaumquelle. Vorhandene allgemeine Vite-Hinweise zu klassischen Scripts
und Paketgrößen bleiben unverändert.
