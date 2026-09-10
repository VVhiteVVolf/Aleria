# Göttlicher Kreis – Inhaltspflege

Stand 10.09.2026: 9 primäre Gottheiten, 5 Souveräne, 5 Untergottheiten und 8 namentlich bekannte Heilige. Die Sammlung ist über die Hauptseite und die Alerische Kirche erreichbar. Jede Gottheit besitzt genau eine Inhaltsquelle und ein eigenes Archivblatt.

## Quellen und Bilder

Die Kirchenübersicht und 19 Einzelprofile wurden aus den Nutzeranhängen übernommen. Ordan wurde separat nachgereicht (`63ad4af2-f33e-465e-b6de-358e1c149f9b`); sein ausführlicher Artikel ersetzt den anfänglichen kurzen Klerusverweis vollständig. Die strukturierten Originalabschnitte enthalten auch seine vier beschriebenen Gaben und drei Bünde. Nur die unbeschriebenen Eide und Artefakte bleiben offen.

`goettlicher-kreis-import.json` und das `source`-Feld jedes Eintrags dokumentieren Herkunft und SHA-256. Im Hauptregister erscheinen die bestehenden farbigen Icons aus `BilderRüstungen`. Im Artikelkopf stehen die großen Glasmalerei-Porträts aus den jeweils zweiten Bildverweisen der gelieferten Einzelprofile. Sie sind unverändert lokal gespeichert; Bildquellen und Hashes stehen in `assets/divine-art/sources.json`. Die ersten Bilder der Vorlagen sind schwarze Symbole und werden nicht verwendet.

## Ergänzungen und Abgleich

- Tethyra: die drei begonnenen Eide und den abgebrochenen Bund der Wildnis ausgearbeitet. Die bereits ausführlich beschriebenen Gaben bleiben erhalten.
- Jovena: die begonnenen Eide ausgeführt und Aspekte, Segen und Bünde ergänzt; Schwerpunkt Wohlwollen, Fröhlichkeit und Mitgefühl.
- Auron: Wesenheit, Brauchtum, Eide, Gaben, Bünde und Kult anhand der überlieferten Baukunst- und Erfindungsdomäne sowie seiner Beinamen ausgearbeitet.
- Selarion: Fortsetzung anhand von Wettstreit, Sport, Herolden und Abgesandten.
- Orith: Fortsetzung anhand von Magie, Zauberei, Mystik und der Verbindung zu den Druiden.

Neue Abschnitte sind durch `authorship: "continuation"` bzw. `source.continuation` nachvollziehbar. Die Ergänzungen beschreiben fiktionale Gaben und verändern keine Spielmechaniken, Charakterdaten oder Firebase-Systeme.

Eindeutige Fremdnamen aus kopierten Vorlagen wurden dem jeweiligen Gott zugeordnet: Akatosh → Ordan, Talos → Baldran, Dibella → Lyris, Kynareth → Sylvana, Zenithar → Tharim, Julianos → Orin, Arkay → Kharon, Rhellar → Thyrael. Yondalla im abgebrochenen Bund der Wildnis wurde zu Tethyra. Wiederholte allgemeine Lehre liegt einmal in `data/goettliche-lehre.json`; Namen, Absätze und Listen enthalten Klartext, kein Legacy-HTML.

Widersprüchliche Verwandtschaftsbilder von Nimue/Tethyra/Zephyr und die verschiedenen Mutterbezeichnungen Jovenas bleiben als unterschiedliche mythische Überlieferungen erkennbar. Kopierte Seitenleistenangaben zu Tethyra wurden bei Jovena/Auron nicht als sichere Abstammung übernommen. Ordans Quelle nennt Loyalität, Gefolgschaft und Omnipotenz in unterschiedlichen Tugendformulierungen; diese Unterschiede wurden nicht stillschweigend umgeschrieben. `relations` stellt ungerichtete Verbindungen dar, keine verbindliche Genealogie.

## Bewusst offen

Die Kirchenhierarchie ist separat unter `Religionen/klerus/index.html` umgesetzt. Dort stehen die sechs Kasten, die korrigierte Priesterordnung mit 14 Stufen und die individuellen Gemeinschaften aller 19 Gottheiten. Inhaltspflege: [Klerus](../klerus/README.md).

Leere Artefakttabellen, Dialogplatzhalter und unbenannte Heiligenplätze erscheinen nicht. Die acht bekannten Heiligen werden ausschließlich mit Namen und überlieferten Beinamen aufgeführt; Sankt Ninians noch fehlender Beiname bleibt offen. Ihre Bildnisse und Lebensgeschichten sind nicht erfunden.
