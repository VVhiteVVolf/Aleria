# Ylvas Saex · 28. September 2026

Auf Nutzerwunsch erhält Ylva Wolfshorn eine weitere Waffe. Das Bild wurde zuerst mit der integrierten Bildgenerierung nach der beigefügten Saex-Vorlage erstellt: dunkler Holzgriff, Goldranken, kleines Wolfsmotiv, bestehender illustrierter Item-Stil. Die ausgewählte PNG-Datei ist quadratisch und besitzt einen geprüften transparenten Alphakanal.

## Gemeinsames Grundprofil

Quelle ist `Markt/WaffenRüstungen/data/shop-data.js`, daraus erzeugt `build-item-register.mjs` die Browser- und Serverkataloge. Saex, Sax und Seax sind über Titel bzw. Suchbegriffe auffindbar.

- Standard: **1W8 Hieb**, einhändig, Kraft, eine Aktion, keine zweihändige Schadensvariante.
- Die vorhandene Waffenfamilie `dagger` umfasst das einschneidige Langmesser. Dadurch funktionieren die bereits vorhandenen Skytte-Techniken für Schwert, Axt oder Sax ohne zusätzliche Ausnahmelogik.
- Ylvas Bogen-/Speerausbildung gilt weiterhin ausschließlich für diese Waffenarten. Ihre Saex verursacht bei KRF 12 regulär **1W8+1**.
- Standardpreis 400 Kupfer, Gewicht 0,8 kg. Die ausdrückliche Vergabe an Ylva erzeugt weder eine Kaufquittung noch einen Geldabzug.

## Besitz und Verknüpfung

| Bereich | Stabile Kennung |
| --- | --- |
| Figur | `bSYZYAEOwiRgy44f6OmO` |
| Standardvorlage | `standard:waffen-rustungen:saex` |
| Inventar | `equipment-weapon-ylva-saex` |
| Kampfprofil | `ylva-saex` |
| Bild | `ylva-saex-v2.png` |

Die einmalige Vergabe in `firebase/functions/scripts/ylva-saex-release-model.mjs` nutzt die bestehende Ausrüstungsverknüpfung ausschließlich für den neuen Eintrag. Der gespeicherte Besitz speist Inventar, Marktbesitz, Charakterbogen, Waffenliste/-tabelle, Archiv und Kommentarausrüstung. Die Waffe wird verstaut ergänzt; die aktuell geführte Waffe und reguläre Wechselkosten bleiben erhalten. Verkäufe oder Übergaben führen nicht zu einer automatischen Neuvergabe.

Online werden ausschließlich `inventory.items`, `combatProfile.weapons` und die beiden Schutzrevisionen geändert, mit Schreibvorbedingung auf den zuvor gelesenen Dokumentzeitstempel. Alle bisherigen Einträge bleiben unverändert; TP, Ressourcen, Zustände, Geld, Begleiter und historische Kommentare werden nicht verändert. Lokaler Figurenexport und Datenbankprojektion enthalten dieselbe neue Verknüpfung.

Prüfungen decken Vergabe bei verbrauchten Ressourcen/0 TP, Wiederholbarkeit, Einhandführung, Skytte-Techniken, alle Bildprojektionen, Marktankauf und Weitergabe ab.
