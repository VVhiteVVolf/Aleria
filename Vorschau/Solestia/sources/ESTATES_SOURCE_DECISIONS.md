# Solestia: Stände und Anreden

Quelle ist die ausdrückliche Nutzererweiterung vom 4. November 2026. Sie gilt
für Solestia; die argentischen Kasten und Verwaltungsämter werden nicht übernommen.
Die neun Comicbilder zeigen gesellschaftliche Typen, keine benannten Personen.

## Nutzerwortlaut

> Herzog = Sobirà (Geläufig ist Herzog, deswegen sagt man auch einfach herzog, da sich alle an die Gemeine Zunge gewöhnt haben)
>
> Grafen = Es gibt hier keine Grafen, aber wenn, dann wäre es der Conde
>
> Die Barone nennt man hierzulande auch Regulo
>
> Die Ritterfürsten sind rar in Solestia, der Baron unterhält 2 Ritterfürstliche Familien in der Hauptstadt, diese nennt man Hidalgo.
>
> Der Ritterliche Herrr, bzw Ritterherr, ist hier der Señor, er darf weitere Ritter schlagen und führen und seine nachkommen als Ritter fortführen, er hat genau so wie andere Ritterherren auch Landbesitz bzw eine Burg.
>
> Der Ritterliche Pendant Solestia heißt Caballero!
>
> Während der Knappe hier Escudero und der Page, Paje genannt wird.
>
> Allerdings hat man sich so sehr an die gemeine Zunge gewohnt... dass diese titel längst nicht mehr in gebrauch kommen. Jedoch werden sie öfter in schriftlicher form gestgehalten.
>
> Eine sache die anders in Solestia ist, ist dass man die Ritter des Landes mit Don + Vorname / Doña + Vorname anredet
>
> Während man Prinzen und Prinzessinnen der Herzoglichen Familie mit Infant und Infanta anrspricht.
>
> Das gemeine Volk heißt schlicht Pechero
>
> Eine leibeigenschaft herrscht in Solestia nicht, das liegt an der noch zu nahen Albsichen Kulturellen Vermächtnis.

## Umsetzung und Grenzen der Aussage

- `estate-facts.json` besitzt die bestätigten neun Typen, ihre deutsche
  Entsprechung und die Anrederegeln. Conde trägt ausdrücklich `present: false`;
  sein Bild veranschaulicht einen hypothetischen Rang, keinen amtierenden Grafen.
- Die bereits vorhandenen Hauptstadtfamilien Meroval (`pool-10`) und Zerain
  (`pool-11`) konkretisieren die beiden Hidalgo-Familien. Haus-IDs, Wappen,
  Personenentwürfe und Ausgangssitze bleiben erhalten. Ihr gemeinsamer Rang ist
  Ritterfürst; die schriftliche solestische Bezeichnung lautet Hidalgo.
- Der nicht näher benannte „Baron“ begründet keine neue Baronie in der
  herzoglichen Domäne und keine Zuordnung eines bestimmten Lehnsherrn zu diesen
  Familien. Es wird kein neuer Regulo erfunden.
- Der Señor darf seine Nachkommen im Ritterstand fortführen. Daraus wird keine
  zusätzliche Erbregel für andere Stände und keine genaue Erbfolge abgeleitet.
- Don/Doña mit Vornamen gilt als persönliche Ritteranrede. Infant/Infanta gilt
  ausschließlich für Prinzen und Prinzessinnen der herzoglichen Familie.
- Es werden keine konkreten Amtsinhaber, neuen Häuser, Personen oder
  genealogischen Verbindungen angelegt. Sitzverschiebungen im lokalen Entwurf
  ändern keinen Hausrang.

Die Runtime-Datei `estate-data.mjs` wird durch
`scripts/build-estate-catalog.mjs` aus diesen Fakten und den tatsächlich
vorhandenen Produktionsbildern erzeugt. Bildprompts und technische Belege
bleiben getrennte Quellen; sie gelangen nicht in den Seitenkatalog.
