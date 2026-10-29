# Blutstadt · Prüfung vom 29. Oktober 2026

- 5 Aristokratenhäuser und 10 Ministerialenhäuser, 15 vollständige Hausvertretungen.
- 5 farbige Herrschaftsgebiete, je ein äußerer Hauptort; 21 äußere Kartenorte
  sowie Blutstadt. Alle Ausgangszuordnungen null. Stadtresidenzen separat.
- 11 gelieferte Quellen archiviert und über SHA-256 unverändert belegt.
- 12 neue Heraldikbilder (7 Wappen einschließlich Rappenau, 5 Banner) und
  15 Figuren mit Original-/Produktions-/Vorschaudateien und Hashbelegen.
- Alpha-Freigabe: „Ja, Alpha bereinigen“. Beide gemeinsamen Bildpipelines
  bestätigen RGB-Erhaltung. Keine Auditfehler. Bei sieben Figuren ist der
  transparente Rand schmal (4–13 Pixel); alle Motive und Füße sind vollständig.
- 30 Tests aus Blutstadt, Aldingen, Deitheach, Iathneach/Triarchie sowie
  gemeinsamem Entwurfszustand und Drag-Controller erfolgreich.
  Auf diesem Rechner mit Node `--experimental-test-isolation=none`, weil
  die Sandbox Kindprozesse des Test-Runners mit EPERM blockiert.
- Neue Orts-, Residenz- und Hausnamen ohne Treffer im übrigen Projektbestand;
  neue Blutstadt- und Diagnose-Dateien bei der Kollisionssuche ausgeschlossen.
- Chrome: alle 15 Hausfenster am Desktop und bei 390×844 geöffnet;
  korrekte Titel und Bildzuordnungen, vollständige Figur, Scrollbeginn 0,
  keine horizontale Überbreite. Mobile Ladenachweise in JSON gespeichert.
- Im Browser geprüft: Ablehnung Bismarcks bei Stadt Rubrikenhall;
  gültiger Burgsitz; Persistenz nach Reload; Rückgängig; lokaler JSON-Import;
  Maus-Drag vom freien Bismarck-Wappen zur Burg Präzeptenfels.
- Testzuordnungen anschließend auf den vollständig freien Ausgangsstand
  zurückgesetzt; temporäre mobile Viewport-Vorgabe entfernt.
- Keine kanonischen Register, Stammbäume oder Firebase-Daten geändert.
  Keine Veröffentlichung, kein Commit, kein Push.
