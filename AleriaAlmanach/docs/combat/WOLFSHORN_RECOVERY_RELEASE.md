# Wolfshorn-Verstärkung und Durchschnaufen · 26. September 2026

Freigegeben durch den Nutzer. Bestehende Würfe und Beiträge werden weder verändert noch erneut ausgewertet.

## Gemeinsame Erholung und Bestandsabgleich

`modules/classes/martial-recovery.js` ersetzt die generischen `class-special-*`-Einträge durch **Durchschnaufen**. Alle bisherigen Klassen erhalten dieselbe Fähigkeit, insbesondere jede Nahkampfklasse. Kosten: eine Bonusaktion; einmal pro langer Rast. Heilung: eigener Trefferwürfel plus aufgerundete 10 % des aktuellen maximalen TP-Wertes, ohne KON-Bonus, begrenzt auf das TP-Maximum. Keine temporären TP, kein Tages- oder Kampfreset. Wiederholte Normalisierung erhält verbrauchte Nutzungen. Neue und vorhandene Figuren sowie Listen-/Tabellenauswahl verwenden dieselbe Quelle. Die Klassenseiten zeigen diese Fähigkeit statt Besonderer Klassenmanöver. Reguläre Techniken mit Besonderer Aktion bleiben bestehen.

## Ylva · Skytte 7

**Veteranin des Dunkelhains:** +20 maximale TP (75 → 95), +2 Angriff/+1 Schaden mit Bogen und Speer einschließlich Techniken, +3 Wahrnehmung, +3 Rettungswürfe gegen Furcht und +2 gegen Niederwerfen/erzwungene Bewegung. Ihre persönliche Ausbildung erlaubt Geschicklichkeit für Speere. Kein Schild und keine neuen Schildtechniken.

**Dornwacht:** 1W8, vielseitig 1W10, +1 Waffenschaden. Bei GES 17 einschließlich persönlicher Passive 1W8+5 bzw. 1W10+5. Langbogen: +1 Schaden; kritischer Treffer verlangsamt das Ziel um 2 m für dessen nächsten eigenen Beitrag, ohne Stapelung. Handaxt: +1 Angriff. Jagdleder: −1 Hieb/Stich pro Schadensinstanz und +2 Rettungswürfe gegen Gift, nur angelegt. Kein zusätzlicher RK-Bonus.

**Der fallende Dorn:** Aktion + Reaktion + Besondere Aktion. Zwei bezahlte Speerangriffe gegen dasselbe Ziel, getrennte Angriffs- und Schadenswürfe. Nach einem Treffer des ersten Angriffs GES-Rettungswurf SG 15. Bei Scheitern erhält ausschließlich der unmittelbare zweite Angriff Vorteil und einen weiteren Waffenschadenswürfel. Bei Erfolg oder verfehltem Auftakt wird der zweite Angriff normal ausgeführt. Keine zusätzliche Nutzungsgrenze; keine Aura-Ersatzkosten.

## Asgeir · Skjaldr 7

**Grenzer des Dunkelhains:** +14 maximale TP (94 → 108), +1 Nahkampfwaffenschaden einschließlich Techniken, +2 gegen Furcht/Niederwerfen/erzwungene Bewegung. Berserkergang bleibt bestehen.

Beide Einhandäxte: jeweils +1 Angriff/+1 Schaden, nur für die verwendete Waffe. Lange Streitaxt: +1 Schaden und +2 kritischer Zusatzschaden, der nicht verdoppelt wird. Schuppenrüstung: −2 Hieb/Wucht pro Schadensinstanz. Rundschild: Abfangen reduziert den ersten körperlichen Treffer pro gegnerischem Beitrag um 2; nur geführt. Keine zusätzliche Rüstungs-RK.

**Vier Fänge des Wolfshorns:** einmal pro Kampf; erfordert zwei geführte Äxte. Verbraucht sämtliche verbleibenden Aktionen, Bonusaktionen und Reaktionen, mindestens je eine, keine Besondere Aktion. Vier getrennte Angriffe gegen dasselbe Ziel, rechts/links/rechts/links, auch nach einem Fehlschlag. Passende Waffenboni, kritischer Schaden, Berserkergang, Rüstungsschutz und Abwehrladungen werden je Angriff berücksichtigt. Bei vier Treffern erhält das Ziel für seinen nächsten eigenen Beitrag **Benommen**: keine Aktion, Bonusaktion und Reaktion bleiben verfügbar. Erneuter Beitritt zum selben Kampf erneuert die Nutzung nicht.

## Zuständigkeiten und Veröffentlichung

- Persönliche Definitionen: `classes/aldrimar/wolfshorn-personal-training.js`.
- Gegenstandsdefinitionen: `classes/aldrimar/wolfshorn-equipment.js`; Inventar und Kampfbogen über bestehende Ausrüstungssynchronisation.
- Bedingte Personenboni: `combat/combat-personal-modifiers.js`.
- Gemeinsame Folgeangriffe: `combat/combat-follow-up-resolution.js`, aus dem bestehenden Auswertungsdienst extrahiert.
- Heilung wird bei Auswertung aus Trefferwürfel/TP-Maximum berechnet. Browser und generierter Server verwenden identische Regeln und prüfen jeden eingereichten Würfelbeleg.
- Online-Abgleich: `firebase/functions/scripts/wolfshorn-recovery-release-model.mjs`. Nur ausdrücklich betroffene Felder, Schreibvorbedingung auf `updateTime`, Sicherung und vollständiger Vergleich der übrigen Felder. HP-Defizite bleiben erhalten; keine Heilung bei 0 TP. Keine Änderung an vorhandenen Kampfkommentaren.
- Archivexporte, Charakterdatenbank und Klassen-HTML werden über die vorhandenen Generatoren aktualisiert.
