# Neue Organisation oder Gruppe anlegen

Diese Struktur ist fuer eigenstaendige Organisationen und fuer Untergruppen gedacht. Jede Ebene darf eine eigene Seite und eine eigene Datendatei bekommen.

Beispiel:

```text
Organisationen und Gruppen/
  Gilden/
    Windreiter/
      gruppe.data.js
      Windreiter.html
      Windreiter-Estryll/
        gruppe.data.js
        Windreiter-Estryll.html
        Schwarzfische/
          gruppe.data.js
          Schwarzfische.html
          Schwarzfische_I_Trupp/
            gruppe.data.js
            Schwarzfische-I-Trupp.html
```

## Konvention

- Neue konkrete Gruppen bekommen einen eigenen Ordner.
- Die fachlichen Daten liegen im jeweiligen Ordner in `gruppe.data.js`.
- Der Eintrag in `gruppen.registry.js` verweist auf diese Datendatei.
- Die `hierarchy` dokumentiert den fachlichen Pfad.
- `classification.parentGroupId` verweist auf die direkte Obergruppe, wenn es eine gibt.
- `classification.rootGroupId` verweist auf die oberste Gruppe der Kette.
- Keine alten `Gilden`-Ordner dafuer verwenden; dieser Bereich ist bewusst separat.

## Minimaler Registry-Eintrag

```js
{
  id: "windreiter-schwarzfische-i-trupp",
  slug: "schwarzfische-i-trupp",
  name: "Schwarzfische I. Trupp",
  status: "draft",
  type: "troop",
  data: "Gilden/Windreiter/Windreiter-Estryll/Schwarzfische/Schwarzfische_I_Trupp/gruppe.data.js",
  hierarchy: [
    { type: "Sammlung", name: "Organisationen und Gruppen", slug: "organisationen-und-gruppen" },
    { type: "Kategorie", name: "Gilden", slug: "gilden" },
    { type: "Gilde", name: "Windreiter", slug: "windreiter" },
    { type: "Untergilde", name: "Windreiter-Estryll", slug: "windreiter-estryll" },
    { type: "Banner", name: "Schwarzfische", slug: "schwarzfische" },
    { type: "Trupp", name: "Schwarzfische I. Trupp", slug: "schwarzfische-i-trupp" },
  ],
  tags: ["gruppen", "gilde", "windreiter", "schwarzfische", "trupp"],
}
```
