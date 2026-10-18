# Handelsposten der Klingenden Münze · Gwynthor

Zwei redaktionelle Module unter einem gemeinsamen Archivpfad: Handelsposten mit getrennten Hierarchieseiten für Kaufmannsgilde, Bank und Kompanie sowie die fünf führenden Interessenbünde. Bestehende Mitgliedsbetriebe werden anhand ihrer bestehenden IDs verschoben, niemals kopiert. Archiveigene Benutzerplatzierungen und Inhaltsübersteuerungen bleiben wirksam.

- `post-section.mjs`: gemeinsamer Zielpfad, Gildensymbole, vier Grafschaftskontore.
- `post-factions.mjs`: fünf Interessenbünde, acht gleichrangige institutionelle Ratssitze. Keine neuen Personen oder Familienakten.
- `post-members.mjs`: ausschließlich belegte Geschäftsinhaber aus bestehenden Personenmodellen; Lieferbeziehungen und Altschulden reichen nicht aus.
- `post-*-hierarchy.mjs`: getrennte Verantwortung für Kaufmannsgilde, Bank und Kompanie. Kompaniedetachements bleiben in den Betriebsmodulen.
- `post-module.mjs`: Storyseiten und vier interaktive Szenen mit stabilen Kommentar-Threadschlüsseln.
- `post-data.js`: generierte Archivregistrierung; muss nach den bisherigen Geschäftsregistrierungen laden.

## Festgelegte Weltregeln

Klingende Münze, Rote Bank und Rote Kompanie bilden weltweit einen gemeinsam auftretenden Verbund. Münze-Mitglieder werden Bankmitglieder und Kontoinhaber. Unternehmer und Zunftsmeister erhalten Zugang zu Personal und vertraglichen Kompaniediensten, keine automatisch unbegrenzte Finanzierung oder persönliche Soldatenmitgliedschaft.

Celtigerns Wacht: vier große Kontore in Gwynthor, Abergwint, Castellbryn und Rhosmere; Gwynthor ist das größte und koordiniert die Grafschaft. Ratssitze: Falveri 2, Ergalla 2, Gwlannor 1, Halenrhyd 1, Aurdden 1, Loer 1. Kein einzelner oberster Kaufmann. Bankleitung Ergalla; Kontor-Kommandant Falveri; Aldo ehemaliges Kompaniemitglied. Falveri/Ergalla haben örtliche Zweige, ihre Hauptlinien bleiben in Venalys. Neue Leitfiguren werden auf ausdrücklichen Nutzerwunsch erst später angelegt.

Halenrhyd-Rosszucht bleibt im Bannkreis; städtisches Verkaufsgestüt, Hufschmied und Fleischbetriebe liegen nicht automatisch im Gildenkomplex. Aurdden dienen Loer, Loer dienen Wyrm; nur Loer besitzen die genannte Prägelizenz. Gwlannor dienen Saethwyr. Gwregysdu sind Mitglied, kein sechster führender Interessenblock.

## Quellen und Abgrenzung

Grundlage: Nutzerauftrag vom 18.10.2026 und Antwort zugunsten institutioneller Sitze. Bestehende Falveri- und Loer-Stammbäume werden unverändert verlinkt. Bestätigte Betriebsmitglieder: Finlay (`krone-biography.mjs`), Bleddyn (`harbor-module.mjs`), Albrecht (Nixe-Originalbiografie: eingetragenes Mitglied). Brenn Vann gehört zum Markt der Fortuna und nennt die Münze als Rivalen. Helviane hat Lieferbeziehungen; Alasdair eine Kredit-/Rezeptvorgeschichte. Diese drei sind keine hier belegten Gildeninhaber.

Die Stellenzahlen unterhalb der Führung sind redaktionelle Organisationsplanung dieses Auftrags. Offene Registerplätze sind keine erfundenen Personen. Keine Live-Daten, Ressourcen, Guthaben oder Wachdienstverträge werden geschrieben.

`npm run build:klingende-muenze-gwynthor`, `npm run check:klingende-muenze-gwynthor`, `npm run test:klingende-muenze-gwynthor`.

Vier Bilder: `assets/klingende-muenze-gwynthor/`; vollständige Prompts und Generatorquellen stehen in `image-prompts.json`. Built-in image_gen, Preset anime-scene-portrait, 2:3, unveränderte PNG-Dateien. Keine neuen Familienwappen.
