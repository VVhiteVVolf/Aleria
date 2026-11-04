# Ayluun: Webfassung für Aleria

Quelle ist das unveränderte Nutzerpaket `../Ishtaran-Gesamtpaket-1.000`.
Dessen Tirghan-Wortschatz enthält das punktlose `ı` (U+0131), das in der
gelieferten Schrift noch nicht belegt ist. Diese abgeleitete Fassung ergänzt
dafür einen Zeichenzuordnungs-Alias auf das vorhandene kleine `i`.
Alle bisherigen Zuordnungen, Glyphenkonturen, Maße und Schriftfamilien bleiben
erhalten; gespeicherte Texte werden nicht verändert. WOFF ist die gemeinsame
Webschrift für Almanach, Szene, Anzeigetafel und Dokumentwerkstatt; TTF dient
der überprüfbaren Glyphenquelle. Die gelieferten vier Fontformate bleiben im
Originalpaket vollständig erhalten.

Reproduzierbar mit Python 3 und `fontTools`:

```text
python Fonts/Ishtaran-Web-1.001/build-webfont.py
python Fonts/Ishtaran-Web-1.001/build-webfont.py --check
```

Die Tests in `AleriaAlmanach/tests/tlapanui-ishtaran-fonts.test.mjs` prüfen
den vollständigen Wort-, Silben- und Namensbestand, den einzigen neuen Alias
und die unveränderten Glyphen- und Metriktabellen.
