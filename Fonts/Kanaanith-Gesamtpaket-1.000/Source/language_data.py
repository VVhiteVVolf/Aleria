from __future__ import annotations

from collections import Counter


ALPHABET = [
    ("𐤀", "Aleph", "ʾ", "Ochse, Stier", "Kraft, Führung, Last, Ursprung", "al"),
    ("𐤁", "Beth", "b", "Haus", "Familie, Schutz, Innenraum, Besitz", "bet"),
    ("𐤂", "Gimel", "g", "Kamel", "Reise, Karawane, Ausdauer, Fernhandel", "gam"),
    ("𐤃", "Daleth", "d", "Tür", "Zugang, Übergang, Aufnahme, Beginn", "dal"),
    ("𐤄", "He", "h", "Fenster", "Licht, Atem, Offenbarung, Sichtbarkeit", "hen"),
    ("𐤅", "Waw", "w", "Haken, Nagel", "Bindung, Verbindung, Befestigung, Vertrag", "war"),
    ("𐤆", "Zayin", "z", "Waffe, Schwert", "Verteidigung, Krieg, Entscheidung, Schneide", "zay"),
    ("𐤇", "Heth", "ḥ", "Zaun, Mauer", "Grenze, Schutz, Stadt, Einschluss", "het"),
    ("𐤈", "Teth", "ṭ", "Rad", "Zyklus, Zeit, Schicksal, Wiederkehr", "tar"),
    ("𐤉", "Yodh", "y", "Hand, Arm", "Tat, Arbeit, Macht, Ausführung", "yad"),
    ("𐤊", "Kaph", "k", "Handfläche", "Empfang, Besitz, Gabe, Handwerk", "kaf"),
    ("𐤋", "Lamedh", "l", "Ochsenstachel", "Führung, Lehre, Antrieb, Befehl", "lam"),
    ("𐤌", "Mem", "m", "Wasser", "Leben, Reinigung, Fluss, Tiefe", "mer"),
    ("𐤍", "Nun", "n", "Fisch", "Fruchtbarkeit, Nahrung, Fülle, Fortbestand", "nun"),
    ("𐤎", "Samekh", "s", "Stütze, Pfeiler", "Stabilität, Tempel, Beistand, Ordnung", "sam"),
    ("𐤏", "Ayin", "ʿ", "Auge", "Sicht, Wacht, Wissen, Urteil", "ayen"),
    ("𐤐", "Pe", "p", "Mund", "Sprache, Verkündung, Befehl, Name", "par"),
    ("𐤑", "Sade", "ṣ", "Angelhaken", "Fang, Auswahl, Jagd, Zugriff", "sad"),
    ("𐤒", "Qoph", "q", "Nadel, Ahle", "Genauigkeit, Maß, Schrift, feines Handwerk", "qen"),
    ("𐤓", "Resh", "r", "Kopf", "Herrschaft, Anfang, Leitung, Rang", "resh"),
    ("𐤔", "Shin", "š", "Zahn", "Kraft, Verzehr, Hunger, Durchsetzung", "shen"),
    ("𐤕", "Taw", "t", "Zeichen, Markierung", "Eid, Vollendung, Siegel, festgehaltenes Recht", "tav"),
]


PREFIXES = [
    ("a-", "belebt, handelnd", "Macht einen Begriff zu einem aktiven Wesen oder Träger."),
    ("ba-", "Ort, Innenraum", "Bezeichnet einen umschlossenen oder bewohnten Ort."),
    ("da-", "Übergang, Beginn", "Markiert Eintritt, Öffnung oder den Beginn eines Vorgangs."),
    ("ha-", "sichtbar, offen, erhellt", "Bezeichnet Offenlegung, Licht oder öffentliche Geltung."),
    ("ka-", "gemacht, beherrscht", "Markiert absichtlich hergestellte oder kontrollierte Dinge."),
    ("ma-", "Kollektiv, Institution", "Fasst Personen oder Dinge zu einer geordneten Einheit."),
    ("mi-", "am Wasser, fließend", "Kennzeichnet Fluss, Küste, Hafen oder Bewässerung."),
    ("na-", "lebend, wachsend", "Bezeichnet Wachstum, Fruchtbarkeit oder Ernährung."),
    ("ra-", "königlich, amtlich", "Kennzeichnet Herrschaft, Verwaltung und offiziellen Rang."),
    ("sa-", "verursacht, erzwungen", "Bildet befohlene oder herbeigeführte Handlungen."),
    ("ta-", "Ergebnis, Niederschrift", "Bezeichnet das festgehaltene Ergebnis einer Handlung."),
    ("du-", "verborgen, unterirdisch", "Kennzeichnet Grab, Nacht, Geheimnis und Jenseits."),
    ("ur-", "groß, hoch, heilig", "Steigert Rang, Umfang oder sakrale Bedeutung."),
    ("aya-", "gesehen, erkannt", "Markiert beobachtetes, geprüftes oder gelehrtes Wissen."),
]


SUFFIXES = [
    ("-u", "einzelne Person oder Sache", "Unmarkierter greifbarer Singular."),
    ("-at", "weibliche Person oder Institution", "Traditionelle Personen- und Amtsform; außerdem Institutionen."),
    ("-ir", "Beruf oder handelnde Person", "Bildet Berufe und regelmäßige Tätigkeiten."),
    ("-or", "Amt oder Würdenträger", "Kennzeichnet einen offiziellen Träger einer Funktion."),
    ("-im", "Kollektiv oder Mehrzahl", "Fasst mehrere Dinge oder Personen zusammen."),
    ("-um", "Ort oder Gebiet", "Bildet Siedlungen, Räume und Landschaftsbegriffe."),
    ("-an", "Vorgang oder Zustand", "Bildet Handlungen und andauernde Zustände."),
    ("-et", "kleines oder genaues Einzelstück", "Verkleinerung, Werkzeugteil oder Maßeinheit."),
    ("-esh", "Werkzeug oder greifbares Objekt", "Bildet Gebrauchsgegenstände."),
    ("-aya", "Abstammung oder Traditionslinie", "Bezeichnet Nachkommen, Dynastien und Schulen."),
    ("-en", "zugehörig, stammend aus", "Adjektivische Herkunftsform."),
    ("-i", "Eigenschaft", "Kurze Adjektivendung."),
    ("-em", "Material oder Substanz", "Bildet Stoff- und Rohmaterialbegriffe."),
    ("-ut", "abstrakte Eigenschaft", "Bildet kulturelle und religiöse Abstrakta."),
    ("-ka", "Gefäß oder Behältnis", "Bezeichnet etwas, das aufnimmt oder bewahrt."),
    ("-ra", "geehrt, erhöht", "Ehrenform für Personen, Orte und Gegenstände."),
    ("-ni", "Fluss-, Meer- oder Küstenbezug", "Spezialendung der Wasser- und Hafenmundarten."),
    ("-tav", "vereidigt, versiegelt, vollendet", "Macht eine Handlung oder Sache rechtlich bindend."),
]


FIRST_NAMES = [
    ("Aru", "Kraft und Führung"), ("Beti", "Haus und Schutz"),
    ("Gamu", "Reise und Ausdauer"), ("Dalu", "Tor und Neubeginn"),
    ("Henu", "Licht und Offenbarung"), ("Waru", "Bindung und Treue"),
    ("Zayi", "Schwert und Entschlossenheit"), ("Hetu", "Mauer und Bewahrung"),
    ("Tari", "Zyklus und Schicksal"), ("Yadi", "Hand und Tat"),
    ("Kafu", "Gabe und Handwerk"), ("Lamu", "Führung und Lehre"),
    ("Meru", "Wasser und Leben"), ("Nuni", "Fülle und Fortbestand"),
    ("Samu", "Pfeiler und Ordnung"), ("Aynu", "Auge und Wissen"),
    ("Paru", "Mund und Verkündung"), ("Sadu", "Fang und Auswahl"),
    ("Qenu", "Maß und Genauigkeit"), ("Reshu", "Kopf und Herrschaft"),
]

MALE_ENDINGS = [
    ("bar", "Haus und Familie"), ("gam", "Reise und Ausdauer"),
    ("dar", "Tor und Gelegenheit"), ("zan", "Schutz und Schwert"),
    ("yad", "Tat und Hand"), ("lam", "Führung und Lehre"),
    ("mer", "Wasser und Leben"), ("sam", "Pfeiler und Beständigkeit"),
    ("resh", "Herrschaft und Rang"), ("tav", "Zeichen und Eid"),
]

FEMALE_ENDINGS = [
    ("bara", "Haus und Familie"), ("gama", "Reise und Ausdauer"),
    ("dara", "Tor und Gelegenheit"), ("zana", "Schutz und Schwert"),
    ("yada", "Tat und Hand"), ("lama", "Führung und Lehre"),
    ("mera", "Wasser und Leben"), ("sama", "Pfeiler und Beständigkeit"),
    ("resha", "Herrschaft und Rang"), ("tava", "Zeichen und Eid"),
]


def generate_names(endings, offset, step):
    names = []
    for i, (first, first_meaning) in enumerate(FIRST_NAMES):
        chosen = []
        order = []
        for j in range(len(endings)):
            idx = (offset + i * 3 + j * step) % len(endings)
            if idx not in order:
                order.append(idx)
        for idx in range(len(endings)):
            if idx not in order:
                order.append(idx)
        for idx in order:
            ending, ending_meaning = endings[idx]
            candidate = first + ending
            if candidate.casefold() not in {n[0].casefold() for n in names}:
                chosen.append((candidate, first, ending, first_meaning, ending_meaning))
            if len(chosen) == 5:
                break
        names.extend(chosen)
    return names


MALE_NAMES = generate_names(MALE_ENDINGS, 0, 3)
FEMALE_NAMES = generate_names(FEMALE_ENDINGS, 1, 7)


LEXICON = [
    # Herrschaft und Recht: 15
    ("Herrschaft und Recht", "Rareshor", "Substantiv", "RA- + RESH + -OR", "königlicher Amtsträger des Kopfes", "König; oberster weltlicher Herrscher"),
    ("Herrschaft und Recht", "Urrareshor", "Substantiv", "UR- + RARESHOR", "erhöhter König", "Hochkönig; Großherrscher"),
    ("Herrschaft und Recht", "Rareshat", "Substantiv", "RA- + RESH + -AT", "königliche Trägerin der Herrschaft", "Königin; souveräne Herrscherin"),
    ("Herrschaft und Recht", "Reshir", "Substantiv", "RESH + -IR", "beruflicher Leiter", "Statthalter; Provinzverwalter"),
    ("Herrschaft und Recht", "Paror", "Substantiv", "PAR + -OR", "Amt des Mundes", "Herold; offizieller Sprecher"),
    ("Herrschaft und Recht", "Lamor", "Substantiv", "LAM + -OR", "Amt der Führung", "Kanzler; leitender Ratgeber"),
    ("Herrschaft und Recht", "Tayad", "Substantiv", "TA- + YAD", "festgehaltene Tat", "Erlass; ausgeführter königlicher Befehl"),
    ("Herrschaft und Recht", "Tatav", "Substantiv", "TA- + TAV", "aufgezeichnetes Zeichen", "Gesetz; Rechtskodex"),
    ("Herrschaft und Recht", "Wartav", "Substantiv", "WAR + TAV", "versiegelte Bindung", "Vertrag; rechtskräftiger Bund"),
    ("Herrschaft und Recht", "Ayenor", "Substantiv", "AYEN + -OR", "Amt des Auges", "Richter; königlicher Prüfer"),
    ("Herrschaft und Recht", "Sadir", "Substantiv", "SAD + -IR", "beruflicher Ergreifer", "Gerichtsdiener; Steuereinnehmer"),
    ("Herrschaft und Recht", "Betim", "Substantiv", "BET + -IM", "Gesamtheit eines Hauses", "Adelshaus; Dynastie"),
    ("Herrschaft und Recht", "Reshaya", "Substantiv", "RESH + -AYA", "Linie des Hauptes", "Königsdynastie; Thronfolge"),
    ("Herrschaft und Recht", "Rahetum", "Substantiv", "RA- + HET + -UM", "königlich umgrenztes Gebiet", "Provinz; Verwaltungsbezirk"),
    ("Herrschaft und Recht", "Samor", "Substantiv", "SAM + -OR", "Amt des tragenden Pfeilers", "Großhofmeister; oberster Verwalter"),

    # Tempel, Götter und Magie: 15
    ("Tempel, Götter und Magie", "Uralor", "Substantiv", "UR- + AL + -OR", "erhöhte Kraftperson", "Gott; hohe göttliche Macht"),
    ("Tempel, Götter und Magie", "Uralat", "Substantiv", "UR- + AL + -AT", "erhöhte weibliche Kraft", "Göttin; hohe göttliche Macht"),
    ("Tempel, Götter und Magie", "Ursamor", "Substantiv", "UR- + SAM + -OR", "hoher Träger des Tempelpfeilers", "Hohepriester"),
    ("Tempel, Götter und Magie", "Samir", "Substantiv", "SAM + -IR", "Diener des Pfeilers", "Priester; Tempeldiener"),
    ("Tempel, Götter und Magie", "Basamum", "Substantiv", "BA- + SAM + -UM", "Ort der heiligen Pfeiler", "Tempel; großes Heiligtum"),
    ("Tempel, Götter und Magie", "Duhetum", "Substantiv", "DU- + HET + -UM", "verborgener ummauerter Ort", "Grabkammer; Gruft"),
    ("Tempel, Götter und Magie", "Mertav", "Substantiv", "MER + TAV", "Zeichen des reinigenden Wassers", "Reinigungsritus"),
    ("Tempel, Götter und Magie", "Hanun", "Substantiv", "HA- + NUN", "sichtbar gemachte Fülle", "Segen; Fruchtbarkeitsgabe"),
    ("Tempel, Götter und Magie", "Ayenpar", "Substantiv", "AYEN + PAR", "sprechendes Auge", "Orakel; Weissagung"),
    ("Tempel, Götter und Magie", "Qentav", "Substantiv", "QEN + TAV", "genau gearbeitetes Machtzeichen", "Amulett; magisches Siegel"),
    ("Tempel, Götter und Magie", "Tartav", "Substantiv", "TAR + TAV", "Markierung des Zyklus", "Ritualkalender; heilige Zeitrechnung"),
    ("Tempel, Götter und Magie", "Mamerim", "Substantiv", "MA- + MER + -IM", "Gemeinschaft der Reinigung", "Priesterschaft eines Wasserkultes"),
    ("Tempel, Götter und Magie", "Dumeran", "Substantiv", "DU- + MER + -AN", "verborgener Lebensstrom", "Jenseitsreise; Weg der Seele"),
    ("Tempel, Götter und Magie", "Shenut", "Substantiv", "SHEN + -UT", "Eigenschaft des Zahnes", "heilige Durchsetzungskraft; göttliche Macht"),
    ("Tempel, Götter und Magie", "Tavaya", "Substantiv", "TAV + -AYA", "Linie des heiligen Zeichens", "Kulttradition; geweihte Schule"),

    # Stadt und Architektur: 15
    ("Stadt und Architektur", "Bet", "Substantiv", "BET", "Haus", "Haus; Wohnraum"),
    ("Stadt und Architektur", "Mabetim", "Substantiv", "MA- + BET + -IM", "geordnete Häusergemeinschaft", "Stadtviertel"),
    ("Stadt und Architektur", "Bahetum", "Substantiv", "BA- + HET + -UM", "ummauerter bewohnter Ort", "Stadt; befestigte Siedlung"),
    ("Stadt und Architektur", "Dalet", "Substantiv", "DAL + -ET", "kleiner genauer Zugang", "Tür; Torflügel"),
    ("Stadt und Architektur", "Hebet", "Substantiv", "HEN + BET", "Lichtöffnung des Hauses", "Fenster; Lichtschacht"),
    ("Stadt und Architektur", "Samet", "Substantiv", "SAM + -ET", "einzelnes Stützstück", "Säule; Pfeiler"),
    ("Stadt und Architektur", "Samum", "Substantiv", "SAM + -UM", "Ort der Pfeiler", "Säulenhalle; Audienzhalle"),
    ("Stadt und Architektur", "Merdal", "Substantiv", "MER + DAL", "Tor des Wassers", "Schleuse; Kanaltor"),
    ("Stadt und Architektur", "Qenbet", "Substantiv", "QEN + BET", "Haus der feinen Arbeit", "Werkstatt; Schreibstube"),
    ("Stadt und Architektur", "Qenet", "Substantiv", "QEN + -ET", "genaues kleines Bauteil", "Ziegel; geschnittener Baustein"),
    ("Stadt und Architektur", "Hetan", "Substantiv", "HET + -AN", "Zustand des Umschließens", "Mauerwerk; Befestigung"),
    ("Stadt und Architektur", "Tardal", "Substantiv", "TAR + DAL", "kreisender Zugang", "Straßenkreuzung; großer Platz"),
    ("Stadt und Architektur", "Reshbet", "Substantiv", "RESH + BET", "Haus des Herrschers", "Palast"),
    ("Stadt und Architektur", "Nabet", "Substantiv", "NA- + BET", "Haus des Wachstums", "Speicherhaus; Kornkammer"),
    ("Stadt und Architektur", "Dabetum", "Substantiv", "DA- + BET + -UM", "Ort vor dem Eintritt ins Haus", "Vorhof; Vestibül"),

    # Handel und Seefahrt: 15
    ("Handel und Seefahrt", "Magamim", "Substantiv", "MA- + GAM + -IM", "geordnete Reisegemeinschaft", "Karawane"),
    ("Handel und Seefahrt", "Gamir", "Substantiv", "GAM + -IR", "beruflicher Reisender", "Karawanenführer; Fernhändler"),
    ("Handel und Seefahrt", "Gaman", "Substantiv", "GAM + -AN", "andauernde Reise", "Reise; Handelszug"),
    ("Handel und Seefahrt", "Waran", "Substantiv", "WAR + -AN", "Zustand der Bindung", "Handelspakt; Geschäftsbeziehung"),
    ("Handel und Seefahrt", "Kafwar", "Substantiv", "KAF + WAR", "gebundener Handschlag", "Tausch; Kaufgeschäft"),
    ("Handel und Seefahrt", "Kafir", "Substantiv", "KAF + -IR", "beruflicher Empfänger und Geber", "Kaufmann; Händler"),
    ("Handel und Seefahrt", "Kafet", "Substantiv", "KAF + -ET", "kleines empfangenes Wertstück", "Münze; Handelsgewicht"),
    ("Handel und Seefahrt", "Tavqen", "Substantiv", "TAV + QEN", "genaues Handelszeichen", "Buchhaltung; Kerbregister"),
    ("Handel und Seefahrt", "Tavqenir", "Substantiv", "TAV + QEN + -IR", "Beruf des genauen Zeichens", "Schreiber; Buchhalter"),
    ("Handel und Seefahrt", "Mimerum", "Substantiv", "MI- + MER + -UM", "Ort am Wasser", "Hafen"),
    ("Handel und Seefahrt", "Mergam", "Substantiv", "MER + GAM", "Reise über Wasser", "Seefahrt; Überfahrt"),
    ("Handel und Seefahrt", "Nunir", "Substantiv", "NUN + -IR", "Beruf des Fisches", "Fischer"),
    ("Handel und Seefahrt", "Sadnunesh", "Substantiv", "SAD + NUN + -ESH", "Werkzeug zum Fischfang", "Fischernetz; Fanggerät"),
    ("Handel und Seefahrt", "Betmer", "Substantiv", "BET + MER", "Haus auf dem Wasser", "Schiff; größeres Boot"),
    ("Handel und Seefahrt", "Betmerim", "Substantiv", "BET + MER + -IM", "Gemeinschaft der Wasserhäuser", "Flotte"),

    # Land, Wasser und Nahrung: 15
    ("Land, Wasser und Nahrung", "Mer", "Substantiv", "MER", "Wasser", "Wasser; lebensspendende Flüssigkeit"),
    ("Land, Wasser und Nahrung", "Mimeran", "Substantiv", "MI- + MER + -AN", "fließender Wasserzustand", "Fluss; großer Kanal"),
    ("Land, Wasser und Nahrung", "Merum", "Substantiv", "MER + -UM", "Ort des Wassers", "Brunnen; Zisterne"),
    ("Land, Wasser und Nahrung", "Nun", "Substantiv", "NUN", "Fisch und Fülle", "Fisch; essbares Wassertier"),
    ("Land, Wasser und Nahrung", "Nunim", "Substantiv", "NUN + -IM", "Menge von Fisch und Fülle", "Fischfang; Nahrungsvorrat"),
    ("Land, Wasser und Nahrung", "Al", "Substantiv", "AL", "starkes Rind", "Rind; Zugochse"),
    ("Land, Wasser und Nahrung", "Alim", "Substantiv", "AL + -IM", "Gemeinschaft der Rinder", "Herde"),
    ("Land, Wasser und Nahrung", "Lamir", "Substantiv", "LAM + -IR", "Beruf des Treibens und Führens", "Hirte; Viehtreiber"),
    ("Land, Wasser und Nahrung", "Namerum", "Substantiv", "NA- + MER + -UM", "wachsender Ort durch Wasser", "bewässertes Feld; Gartenland"),
    ("Land, Wasser und Nahrung", "Mertar", "Substantiv", "MER + TAR", "Zyklus des Wassers", "jährliche Flut; Hochwasserzeit"),
    ("Land, Wasser und Nahrung", "Betnun", "Substantiv", "BET + NUN", "Haus des Fisches", "Fischteich; Fischerei"),
    ("Land, Wasser und Nahrung", "Shenun", "Substantiv", "SHEN + NUN", "was Zahn und Fülle verbindet", "Speise; Mahlzeit"),
    ("Land, Wasser und Nahrung", "Shenan", "Substantiv", "SHEN + -AN", "Zustand des Verzehrens", "Hunger; Appetit"),
    ("Land, Wasser und Nahrung", "Kafmerka", "Substantiv", "KAF + MER + -KA", "Gefäß für gehaltenes Wasser", "Krug; Schale"),
    ("Land, Wasser und Nahrung", "Gammer", "Substantiv", "GAM + MER", "Wasser der Reisenden", "Oase; Karawanenbrunnen"),

    # Krieg und Handwerk: 15
    ("Krieg und Handwerk", "Zay", "Substantiv", "ZAY", "Waffe und Schneide", "Waffe; Schwert"),
    ("Krieg und Handwerk", "Zayir", "Substantiv", "ZAY + -IR", "Beruf der Waffe", "Soldat; Krieger"),
    ("Krieg und Handwerk", "Razayor", "Substantiv", "RA- + ZAY + -OR", "königliches Waffenamt", "Heerführer; General"),
    ("Krieg und Handwerk", "Hetzay", "Substantiv", "HET + ZAY", "Mauer gegen Waffen", "Schild; große Schutzwand"),
    ("Krieg und Handwerk", "Mahetim", "Substantiv", "MA- + HET + -IM", "geordnete Gemeinschaft der Mauer", "Garnison; Stadtwache"),
    ("Krieg und Handwerk", "Zayesh", "Substantiv", "ZAY + -ESH", "greifbares Waffenwerkzeug", "Klinge; Dolch"),
    ("Krieg und Handwerk", "Qenir", "Substantiv", "QEN + -IR", "Beruf der Genauigkeit", "Feinhandwerker; Juwelier"),
    ("Krieg und Handwerk", "Yadir", "Substantiv", "YAD + -IR", "Beruf der Hand", "Arbeiter; Bauhandwerker"),
    ("Krieg und Handwerk", "Kayadan", "Substantiv", "KA- + YAD + -AN", "beherrschte Arbeit der Hand", "Handwerk; Herstellung"),
    ("Krieg und Handwerk", "Qenesh", "Substantiv", "QEN + -ESH", "Werkzeug der Genauigkeit", "Meißel; Ahle"),
    ("Krieg und Handwerk", "Waresh", "Substantiv", "WAR + -ESH", "Werkzeug der Befestigung", "Nagel; Haken; Klammer"),
    ("Krieg und Handwerk", "Kafesh", "Substantiv", "KAF + -ESH", "Werkzeug der Handfläche", "Hammer; Handwerkzeug"),
    ("Krieg und Handwerk", "Sadzay", "Substantiv", "SAD + ZAY", "fangende Waffe", "Bogen; Jagdwaffe"),
    ("Krieg und Handwerk", "Zayem", "Substantiv", "ZAY + -EM", "Stoff der Waffe", "Metall; Bronze"),
    ("Krieg und Handwerk", "Samyad", "Substantiv", "SAM + YAD", "tragende Handarbeit", "Baukunst; Steinsetzen"),

    # Volk, Familie und Alltag: 10
    ("Volk, Familie und Alltag", "Betaya", "Substantiv", "BET + -AYA", "Linie des Hauses", "Familie; Abstammungslinie"),
    ("Volk, Familie und Alltag", "Nunu", "Substantiv", "NUN + -U", "einzelner Fortbestand", "Kind; Nachkomme"),
    ("Volk, Familie und Alltag", "Nunat", "Substantiv", "NUN + -AT", "weiblicher Fortbestand", "Tochter; junge Frau der Linie"),
    ("Volk, Familie und Alltag", "Alor", "Substantiv", "AL + -OR", "Träger von Kraft und Führung", "Vater; Familienoberhaupt"),
    ("Volk, Familie und Alltag", "Betat", "Substantiv", "BET + -AT", "Trägerin des Hauses", "Mutter; Hausherrin"),
    ("Volk, Familie und Alltag", "Warim", "Substantiv", "WAR + -IM", "Gemeinschaft der Gebundenen", "Verwandtschaft; Sippe"),
    ("Volk, Familie und Alltag", "Paran", "Substantiv", "PAR + -AN", "Zustand des Sprechens", "Rede; Sprache"),
    ("Volk, Familie und Alltag", "Parir", "Substantiv", "PAR + -IR", "Beruf des Mundes", "Erzähler; Sänger; öffentlicher Sprecher"),
    ("Volk, Familie und Alltag", "Hayen", "Substantiv", "HA- + AYEN", "erhelltes Auge", "Wissen; Verständnis"),
    ("Volk, Familie und Alltag", "Shenesh", "Substantiv", "SHEN + -ESH", "greifbare Nahrung für den Zahn", "Brot; feste Speise"),
]


def validate():
    assert len(ALPHABET) == 22
    assert len(MALE_NAMES) == 100
    assert len(FEMALE_NAMES) == 100
    assert len(LEXICON) == 100
    all_names = [n[0].casefold() for n in MALE_NAMES + FEMALE_NAMES]
    assert len(all_names) == len(set(all_names))
    words = [row[1].casefold() for row in LEXICON]
    assert len(words) == len(set(words))
    assert Counter(row[0] for row in LEXICON) == {
        "Herrschaft und Recht": 15,
        "Tempel, Götter und Magie": 15,
        "Stadt und Architektur": 15,
        "Handel und Seefahrt": 15,
        "Land, Wasser und Nahrung": 15,
        "Krieg und Handwerk": 15,
        "Volk, Familie und Alltag": 10,
    }


validate()
