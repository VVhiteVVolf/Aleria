const SCRIPT_TABLE_ROW_LIMIT = 160;
const SCRIPT_TABLE_SYLLABLE_LIMIT = 80;

function sanitizeScriptTableStyle(value) {
  const style = String(value || 'plain').trim();
  return ['rheunwaith', 'ogham', 'karnrith', 'infernal', 'futhark', 'kanaanith', 'argenti', 'stoicheia', 'plain'].includes(style) ? style : 'plain';
}

function sanitizeScriptTableRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(row => ({
      symbol: String(row?.symbol || '').trim(),
      name: String(row?.name || '').trim(),
      sound: String(row?.sound || '').trim(),
      meaning: String(row?.meaning || '').trim()
    }))
    .filter(row => row.symbol || row.name || row.sound || row.meaning)
    .slice(0, SCRIPT_TABLE_ROW_LIMIT);
}

function sanitizeScriptTableSyllables(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(row => ({
      syllable: String(row?.syllable || '').trim(),
      meaning: String(row?.meaning || '').trim(),
      usage: String(row?.usage || '').trim()
    }))
    .filter(row => row.syllable || row.meaning || row.usage)
    .slice(0, SCRIPT_TABLE_SYLLABLE_LIMIT);
}

function sanitizeScriptTableData(data = {}) {
  return {
    archiveLabel: String(data.archiveLabel || 'Schriftarchiv · Zeichentabelle').trim(),
    title: String(data.title || 'Alphabet & Lautwerte').trim(),
    subtitle: String(data.subtitle || '').trim(),
    ornamentText: String(data.ornamentText || '').trim(),
    scriptStyle: sanitizeScriptTableStyle(data.scriptStyle),
    symbolHeader: String(data.symbolHeader || 'Zeichen').trim(),
    nameHeader: String(data.nameHeader || 'Name').trim(),
    soundHeader: String(data.soundHeader || 'Laut').trim(),
    meaningHeader: String(data.meaningHeader || 'Bedeutung').trim(),
    rows: sanitizeScriptTableRows(data.rows),
    syllablesTitle: String(data.syllablesTitle || 'Wichtige Silben & Wortbausteine').trim(),
    syllablesSubtitle: String(data.syllablesSubtitle || '').trim(),
    syllableHeader: String(data.syllableHeader || 'Silbe').trim(),
    syllableMeaningHeader: String(data.syllableMeaningHeader || 'Bedeutung').trim(),
    syllableUsageHeader: String(data.syllableUsageHeader || 'Verwendung').trim(),
    syllables: sanitizeScriptTableSyllables(data.syllables),
    footer: String(data.footer || 'Aleria Almanach · Schriftarchiv').trim()
  };
}

function createDefaultScriptTablePage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Zeichentabelle`,
    image: '',
    scriptTablePage: true,
    scriptTable: sanitizeScriptTableData({
      title: 'Alphabet & Lautwerte',
      subtitle: 'Zeichen, Namen und Bedeutungen',
      rows: [
        { symbol: 'A', name: 'Beispielzeichen', sound: 'A', meaning: 'Bedeutung ergänzen' }
      ],
      syllables: []
    })
  };
}

function createRheunwaithScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Rheunwaith · Vollständiges Zeichenregister',
    title: 'Avallornisch · Rheunwaith',
    subtitle: 'Runen des Westvolkes',
    ornamentText: 'Rheunwaith',
    scriptStyle: 'rheunwaith',
    symbolHeader: 'Rune',
    rows: [
      ['A', 'Abael', 'A', 'Wasserquelle, Ursprung'],
      ['B', 'Brenn', 'B', 'Flamme, Wille'],
      ['C', 'Cyrr', 'C', 'Nebel, Schleier'],
      ['D', 'Dynn', 'D', 'Gezeiten, Wandel'],
      ['E', 'Ellin', 'E', 'Schimmer, Offenbarung'],
      ['F', 'Fira', 'F', 'Strömung, Sehnsucht'],
      ['G', 'Gwaed', 'G', 'Blut, Opfer'],
      ['H', 'Helyg', 'H', 'Weide, Sanftheit'],
      ['I', 'Iwr', 'I', 'Stille, Tiefe'],
      ['J', 'Jann', 'J', 'Bewegung, Tanz'],
      ['K', 'Kyrr', 'K', 'Stein, Halt'],
      ['L', 'Lleu', 'L', 'Strahl, Licht'],
      ['M', 'Mwdd', 'M', 'Ruhe, Schlaf'],
      ['N', 'Nedd', 'N', 'Fluss, Linie'],
      ['O', 'Oen', 'O', 'Sturm, Entscheidung'],
      ['P', 'Perdd', 'P', 'Klang, Ruf'],
      ['R', 'Rhyd', 'R', 'Furt, Schwelle'],
      ['S', 'Saith', 'S', 'Sieben, Kreislauf'],
      ['Th', 'Thal', 'Th', 'Ebene, Ausgleich'],
      ['U', 'Uwch', 'U', 'Höhe, Überstieg'],
      ['V', 'Vann', 'V', 'Welle, Wiederkehr'],
      ['W', 'Wynn', 'W', 'Freude, Flussgöttin'],
      ['X', 'Xeir', 'X', 'Fremde, Gefahr'],
      ['Y', 'Ydd', 'Y', 'Geheimnis, Ursprung'],
      ['Z', 'Zarr', 'Z', 'Riss, Teilung'],
      ['Ll', 'Llwyd', 'Ll', 'Nebel, Schatten'],
      ['Ng', 'Ngoll', 'Ng', 'Opferung, Verlust'],
      ['Ch', 'Chwerw', 'Ch', 'Bitterkeit, Prüfung'],
      ['Rh', 'Rhew', 'Rh', 'Frost, Erstarrung'],
      ['Ü', 'Uffyr', 'Ü', 'Tiefe, Unsichtbares']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Wichtige Silben & Bedeutungsträger',
    syllablesSubtitle: 'Häufige Bausteine in Namen, Titeln und rituellen Begriffen',
    syllables: [
      ['Rhe', 'Fluss, Bewegung', 'Namen, Wege und Strömungsbilder'],
      ['Un', 'Bindung, Vereinigung', 'Verträge, Gelübde und Bündnisse'],
      ['Waith', 'Geheimnis, Absicht', 'Sakrale Begriffe und verborgene Ziele'],
      ['Mael', 'Strudel, Leidenschaft', 'Charakterzüge und Schicksalsnamen'],
      ['Ell', 'Licht, Offenbarung', 'Segnungen und Erkenntnis'],
      ['Rhaig', 'Wellenkraft, Auflösung', 'Zauber, Warnungen und Umbruch'],
      ['Llif', 'Strom, gelenkte Strömung', 'Priestertitel und rituelle Wege'],
      ['Weir', 'Hüter, Bewahrer', 'Ämter und Schutzbezeichnungen'],
      ['Don', 'Welle, klingende Bewegung', 'Botschaft und Kommunikation'],
      ['Pwll', 'Tiefe, stilles Wasser', 'Seele, Erinnerung und Geheimnis'],
      ['Rhaeadr', 'Wasserfall, Entladung', 'Kraft, Offenbarung und Wandlung']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Rheunwaith · Zeichen und Silben'
  });
}

function createOghamScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Ogham · Vollständiges Zeichenregister',
    title: 'Das Ogham-Alphabet',
    subtitle: 'Runen der frühen Alben und Druiden',
    ornamentText: 'ᚁᚂᚃᚄᚅ · ᚆᚇᚈᚉᚊ · ᚋᚌᚍᚎᚏ',
    scriptStyle: 'ogham',
    rows: [
      ['ᚁ', 'Beith', 'B', 'Birke — Neubeginn, Reinigung'],
      ['ᚂ', 'Luis', 'L', 'Eberesche — Schutz, Vision'],
      ['ᚃ', 'Fearn', 'F', 'Erle — Übergang, Wasserwesen'],
      ['ᚄ', 'Saille', 'S', 'Weide — Intuition, Träume'],
      ['ᚅ', 'Nion', 'N', 'Esche — Weltenbaum, Verbindung'],
      ['ᚆ', 'Húath', 'H', 'Weißdorn — Prüfung, Angst'],
      ['ᚇ', 'Duir', 'D', 'Eiche — Stärke, Pforte'],
      ['ᚈ', 'Tinne', 'T', 'Stechpalme — Kampf, Herausforderung'],
      ['ᚉ', 'Coll', 'C', 'Hasel — Weisheit, Inspiration'],
      ['ᚊ', 'Ceirt', 'K / Q', 'Apfelbaum — Schönheit, Anderswelt'],
      ['ᚋ', 'Muin', 'M', 'Rebe — Kommunikation, Verbindung'],
      ['ᚌ', 'Gort', 'G', 'Efeu — Beharrlichkeit, Wachstum'],
      ['ᚍ', 'nGéadal', 'Ng', 'Rohr — Heilung, Schwingung'],
      ['ᚎ', 'Straif', 'Z', 'Schwarzdorn — Zorn, Chaos'],
      ['ᚏ', 'Ruis', 'R', 'Holunder — Tod, Reinigung'],
      ['ᚐ', 'Ailm', 'A', 'Kiefer — Hoffnung, Reinheit'],
      ['ᚑ', 'Onn', 'O', 'Ginster — Hitze, Eifer'],
      ['ᚒ', 'Úr', 'U', 'Heide — Fruchtbarkeit, Erde'],
      ['ᚓ', 'Eadha', 'E', 'Pappel — Widerstandskraft'],
      ['ᚔ', 'Idad', 'I', 'Eibe — Tod und Wiedergeburt']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Wichtige Namensstämme & Sinnträger',
    syllablesSubtitle: 'Gebräuchliche Bestandteile druidischer Namensflechten',
    syllables: [
      ['Ail / Ailm', 'Hoffnung, Licht, Beginn', 'Berufung und königswürdige Namen'],
      ['Beith', 'Wurzel, Reinigung, Neubeginn', 'Geburt, Pflicht und Erneuerung'],
      ['Duir', 'Eiche, Stärke, Pforte', 'Schutz, Übergang und Herrschaft'],
      ['Fearn', 'Erle, Wasser, Wandlung', 'Reise, Übergang und Heilung'],
      ['Muin', 'Rebe, Sprache, Bindung', 'Erinnerung und Verständigung'],
      ['Ruis', 'Holunder, Tod, Reinigung', 'Ende, Umkehr und Initiation'],
      ['Tinn / Tinne', 'Stechpalme, Waffe, Prüfung', 'Kampf, Urteil und Wille'],
      ['Sail / Saille', 'Weide, Intuition, Traum', 'Sehersicht und weibliches Wissen'],
      ['Nion', 'Esche, Weltenbaum, Verbindung', 'Ordnung, Stamm und Gemeinschaft'],
      ['Idad', 'Eibe, Schwelle, Wiedergeburt', 'Seelenkraft und Rückkehr'],
      ['Úr', 'Erde, Fruchtbarkeit, Ursprung', 'Fundament und natürliches Gesetz'],
      ['Onn', 'Hitze, Eifer, Verzehrung', 'Leidenschaft und Feuerkraft']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Ogham · Zeichen und Namensstämme'
  });
}

function createKarnrithScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Karnrith · Vollständiges Register der fünf Klüfte',
    title: 'Morgar · Karnrith',
    subtitle: '30 Bedeutungszeichen der morgornischen Steinschrift',
    ornamentText: 'MORGAR · KARNRITH · URORTHARN · GHAIRQARN',
    scriptStyle: 'karnrith',
    symbolHeader: 'Zeichen',
    rows: [
      ['A', 'Ard', 'A · [a]', 'Erde, Stoff, Grund — Ursprung, Boden und tragende Tatsache'],
      ['K', 'Karn', 'K · [k]', 'Stein, Form, Dauer — Festigkeit, Bau und Widerstand'],
      ['G', 'Gor', 'G · [g]', 'Erz, Metall, Wert — Werkzeugstoff, Gewicht und Besitz'],
      ['F', 'Faurn', 'F · [f]', 'Feuer, Hitze, Schmiede — Herd, Licht und Wandlung durch Arbeit'],
      ['U', 'Urd', 'U · [u]', 'Wasser, Masse, Fülle — Strom, Vorrat und Gemeinschaft'],
      ['V', 'Veth', 'V · [v]', 'Luft, Wetter, Bewegung — Tempo, Ferne und ungebundene Kraft'],
      ['O', 'Orn', 'O · [o]', 'Ganzes, Amt, Träger — Rang, Ordnung und vollendete Funktion'],
      ['D', 'Dorn', 'D · [d]', 'Grenze, Mauer, Trennung — Tor, Rand und Schutz durch Scheidung'],
      ['H', 'Hald', 'H · [h]', 'Haus, Halt, Obhut — Heim, Besitz und bewahrter Raum'],
      ['L', 'Lann', 'L · [l]', 'Land, Feld, Gebiet — Heimat, Nutzung, Herrschaft und Ertrag'],
      ['T', 'Targ', 'T · [t]', 'Weg, Richtung, Reise — Ziel, Befehl, Folge und Zugang'],
      ['W', 'Warg', 'W · [w]', 'Tier, Wildnis, Herde — Jagd, Instinkt und ungezähmtes Land'],
      ['B', 'Bram', 'B · [b]', 'Leib, Fleisch, Gewicht — Kraft, Hunger, Last und körperliche Grenze'],
      ['M', 'Morn', 'M · [m]', 'Mensch, Volk, Arbeit — Gemeinwesen, Alltag und Pflicht'],
      ['N', 'Nair', 'N · [n]', 'Atem, Leben, Stimme — Gesundheit, Ruf und belebende Kraft'],
      ['R', 'Rann', 'R · [r]', 'Sippe, Bund, Versammlung — Treue, Rat und Gefolgschaft'],
      ['Y', 'Yrn', 'Y · [y/ü]', 'Ahne, Saat, Fortgang — Abstammung, Kind, Erbe und Wiederkehr'],
      ['NG', 'Ngrum', 'NG · [ŋ]', 'Tod, Schweigen, Ruhe — Grab, Schlaf und abgelegte Pflicht'],
      ['E', 'Erd', 'E · [e]', 'Tat, Vorgang, Tausch — Handel, Schuld, Dienst und Veränderung'],
      ['P', 'Parg', 'P · [p]', 'Hand, Werk, Machen — Handwerk, Bau und Verantwortung'],
      ['S', 'Skar', 'S · [s]', 'Schnitt, Waffe, Streit — Entscheidung, Trennung und Angriff'],
      ['TH', 'Tharn', 'TH · [θ]', 'Eid, Recht, Bindung — Gesetz, Vertrag und zugesagte Wahrheit'],
      ['KH', 'Khorr', 'KH · [x]', 'Bruch, Wandel, Prüfung — Verlust, Krise und Bewährung'],
      ['Z', 'Zarn', 'Z · [z]', 'Schirm, Wacht, Erhalt — Verteidigung, Pflege und Vorrat'],
      ['I', 'Irin', 'I · [i]', 'Werkzeug, Teil, Genauigkeit — Maß, Feinarbeit und Einzelheit'],
      ['GH', 'Ghair', 'GH · [ɣ]', 'Wort, Name, Wahrheit — Benennung, Zeugnis und ausgesprochene Wirklichkeit'],
      ['SH', 'Shenn', 'SH · [ʃ]', 'Gedächtnis, Wissen, Erzählung — Lehre, Chronik und bewahrtes Können'],
      ['CH', 'Chor', 'CH · [tʃ]', 'Wille, Ehre, Absicht — Ruf, Mut, Entscheidung und Würde'],
      ['DH', 'Dhair', 'DH · [ð]', 'Gott, Schicksal, Jenseits — Vorsehung, Heiligkeit und Tabu'],
      ['Q', 'Qarn', 'Q · [q]', 'Magie, Verborgenes, Geist — Zauber, Geheimnis und unsichtbare Ursache']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Produktive Wortbausteine & Vokalstufen',
    syllablesSubtitle: 'Die vollständigen Präfixe, Suffixe und sechs Ableitungsstufen der Morgar-Sprachbibel',
    syllables: [
      ['ur-', 'groß, hoch, zahlreich', 'Steigert Rang oder Umfang: urortharn · Hochkönig'],
      ['dun-', 'klein, nieder, nachgeordnet', 'Mindert Rang oder Ausdehnung: dunhald · Nebenhaus'],
      ['an-', 'ohne, un-, entzogen', 'Negiert einen greifbaren Zustand: anzarn · unbewacht'],
      ['bar-', 'oben, über, hochgelegen', 'Markiert Höhenlage: barkarn · Berg'],
      ['dur-', 'unten, tief, unterirdisch', 'Markiert Tiefe: durkarn · Höhle'],
      ['inn-', 'innen, innerhalb', 'Innerer Bereich oder Zugehörigkeit: inndorn · Innenmauer'],
      ['dor-', 'außen, Rand, Grenze', 'Äußerer Bereich oder Grenzfunktion: dorzarn · Grenzwacht'],
      ['ein-', 'einzeln, einzig', 'Einzelstück oder alleinige Stellung: einorn · Alleininhaber'],
      ['dra-', 'drei, vollständige Gruppe', 'Rituelle oder handwerkliche Dreizahl: dratharn · Dreifacheid'],
      ['sam-', 'zusammen, gemeinsam', 'Gemeinsames Handeln: samrann · Bündnis'],
      ['fyr-', 'voran, erster, voraus', 'Zeitlicher oder ranglicher Vorrang: fyrtarg · Vorhutweg'],
      ['ath-', 'danach, hinter, letzter', 'Nachfolge oder rückwärtige Lage: athorn · Amtsnachfolger'],
      ['-ar', 'Gegenstand oder Stoff', 'Greifbares Einzelstück: gorar · Metallstück'],
      ['-er', 'Handlung oder Verb', 'Tätigkeit: tharner · richten'],
      ['-ir', 'Werkzeug, Teil, Präzisionsding', 'Mittel oder Instrument: skarir · Klinge'],
      ['-or', 'Person, Träger, Amt', 'Handelnde und Ämter: qaror · Magier'],
      ['-ur', 'Menge, Kollektiv, Gebiet', 'Sammelbegriff: morur · Bevölkerung'],
      ['-yr', 'ahnisch, ererbt, geweiht', 'Fortbestand und Tradition: choryr · Ahnenehre'],
      ['-en', 'zugehörig, aus, von', 'Adjektivische Beziehung: karnen · steinern'],
      ['-in', 'hervorgegangen aus, Nachkomme', 'Herkunft oder Abstammung: rannin · Sippenkind'],
      ['-ath', 'Ort, Stelle, Platz', 'Schauplatz: gorath · Mine'],
      ['-dorn', 'ummauerter oder geschiedener Ort', 'Befestigung oder Bruchkante: khordorn · Bresche'],
      ['-hald', 'Haus, Halle, bewahrter Raum', 'Gebäude oder Niederlassung: karhald · Steinhalle'],
      ['-lann', 'Land, Flur, Herrschaftsraum', 'Gebiet oder Landschaft: durlann · Tal'],
      ['-rann', 'Sippe, Bund, versammelte Gruppe', 'Sozialer Verband: halrann · Hausgemeinschaft'],
      ['-targ', 'Weg, Zug, gerichtete Folge', 'Route oder Marsch: skartarg · Feldzug'],
      ['-tharn', 'Eid, Recht, bindende Ordnung', 'Rechtsbegriff: lantharn · Landrecht'],
      ['-zarn', 'Wacht, Schutz, Erhalt', 'Schutzobjekt oder -dienst: dorzarn · Grenzwacht'],
      ['-ghair', 'Wort, Name, verkündeter Text', 'Gesprochenes oder bezeugtes Wissen: tharghair · Erlass'],
      ['-shenn', 'Lehre, Erinnerung, Wissen', 'Fachwissen oder Überlieferung: qarshenn · Zauberkunde'],
      ['-chor', 'Würde, Wille, ehrenhafter Zustand', 'Rang oder moralische Qualität: orchor · Amtswürde'],
      ['-ngrum', 'Tod, Ruhe, Grabzustand', 'Ende oder Bestattung: yrngrum · Ahnengruft'],
      ['-rith', 'geritztes Zeichen, Inschrift', 'Sichtbare Schnittspur: karnrith · Steinschrift'],
      ['A-Stufe', 'Gegenstand, Stoff, Grundlage', 'Beantwortet: Was ist greifbar?'],
      ['E-Stufe', 'Handlung, Vorgang, Tausch', 'Beantwortet: Was geschieht oder wird getan?'],
      ['I-Stufe', 'Werkzeug, Einzelteil, Genauigkeit', 'Beantwortet: Womit oder in welchem Teil?'],
      ['O-Stufe', 'Person, Träger, Amt', 'Beantwortet: Wer trägt die Funktion?'],
      ['U-Stufe', 'Menge, Masse, Kollektiv, Gebiet', 'Beantwortet: Was bildet ein Ganzes aus vielen?'],
      ['Y-Stufe', 'Ahne, Erbe, Weihung, Fortbestand', 'Beantwortet: Was wird weitergetragen?']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Morgar · Karnrith · Zeichen und Wortbildung'
  });
}

function createInfernalScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Nharazim · Register der 30 Hauptsigillen',
    title: 'Infernal · Nharazim',
    subtitle: 'Brand-, Beschwörungs- und Vertragssigillen',
    ornamentText: 'NHARAZIM · GHOL · ISH · QEZHAR · OVRUN · ZHAUR',
    scriptStyle: 'infernal',
    symbolHeader: 'Sigill',
    rows: [
      ['A', 'Ashra', 'A', 'Asche, Ursprung — verbrannte Grundlage und Beginn nach der Vernichtung'],
      ['B', 'Belkhar', 'B', 'Bindung, Vertrag — auferlegte Pflicht und magische Verkettung'],
      ['C', 'Cyrrek', 'C', 'Befehl, Zwang — ausgesprochener Imperativ und gebrochener Widerstand'],
      ['D', 'Drazhun', 'D', 'Schuld, Tribut — geschuldeter Preis und eingeforderte Leistung'],
      ['E', 'Eshra', 'E', 'Glut, Wille — fortdauernde Absicht und innere infernale Hitze'],
      ['F', 'Fhaur', 'F', 'Flamme, Hunger — verzehrende Kraft und ungestilltes Begehren'],
      ['G', 'Ghol', 'G', 'Tor, Beschwörung — geöffneter Übergang und gerufene Gegenwart'],
      ['H', 'Hekraz', 'H', 'Rang, Herrschaft — Überordnung, Krone und Befehlsrecht'],
      ['I', 'Ish', 'I', 'Wahrer Name, Selbst — unverhüllte Identität und innerster Wesenskern'],
      ['J', 'Jhazel', 'J', 'Urteil, Verurteilung — gesprochenes Verdikt und festgelegte Strafe'],
      ['K', 'Khar', 'K', 'Gefangenschaft, Fessel — gebundene Bewegung und verlorene Freiheit'],
      ['L', 'Lazeth', 'L', 'Lüge, Verführung — falsches Versprechen und gelenktes Begehren'],
      ['M', 'Mordrak', 'M', 'Bosheit, Absicht — bewusst gesetzter Schaden und feindlicher Zweck'],
      ['N', 'Nhal', 'N', 'Verneinung, Entzug — verweigerte Gabe und ausgelöschter Anspruch'],
      ['O', 'Ovrun', 'O', 'Eid, Siegel — vollendete Bindung und rechtskräftiger Abschluss'],
      ['P', 'Phaeg', 'P', 'Schmerz, Prüfung — Leid als Maßstab, Schlüssel oder Beweis'],
      ['Q', 'Qezhar', 'Q', 'Preis, Gegenleistung — notwendiges Opfer und ausgeglichene Schuld'],
      ['R', 'Rhaz', 'R', 'Ruin, Sturz — gebrochene Ordnung und niedergerissene Höhe'],
      ['S', 'Ssarakh', 'S', 'Sünde, Makel — verderbte Spur und schuldhafte Öffnung'],
      ['T', 'Thurvek', 'T', 'Qual, Dauer — fortgesetztes Leiden und ungebrochene Wirkung'],
      ['U', 'Urzhal', 'U', 'Besitz, Anspruch — beanspruchtes Wesen, Gebiet oder Recht'],
      ['V', 'Veyrakh', 'V', 'Rache, Rückforderung — gewaltsame Wiederaneignung und Vergeltung'],
      ['W', 'Wexir', 'W', 'Zeuge, Erinnerung — bewahrter Vorgang und bestätigende Gegenwart'],
      ['X', 'Xarth', 'X', 'Auslöschung, Leere — Entfernung von Name, Form und Fortbestand'],
      ['Y', 'Ygrem', 'Y', 'Unterwerfung, Kniefall — anerkannte Niederlage und erzwungener Gehorsam'],
      ['Z', 'Zhaur', 'Z', 'Ende, Vollstreckung — ausgeführtes Urteil und unwiderruflicher Schluss'],
      ['Ä', 'Aeshra', 'Ä', 'Verdorbene Herkunft — befleckter Ursprung und vererbte Verderbnis'],
      ['Ö', 'Othrum', 'Ö', 'Gebrochener Vertrag — zerrissene Bindung und freigesetzte Strafe'],
      ['Ü', 'Uzhrek', 'Ü', 'Besessenheit, fremder Wille — verdrängtes Selbst und eindringende Macht'],
      ['ß', 'Ssevr', 'ß', 'Doppelzunge, Meineid — widersprüchliches Wort und vorsätzlicher Eidbruch']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Rangendungen, Wirkungspräfixe & Ritualketten',
    syllablesSubtitle: 'Produktive Bausteine für Namen, Befehle, Beschwörungen und Verträge',
    syllables: [
      ['ul-', 'absolut, höchst, unbeschränkt', 'Steigert Herrschaft oder Wirkung bis zum äußersten Rang'],
      ['nar-', 'unten, darunter, im Abgrund', 'Bezeichnet Tiefe, Unterwelt oder Unterordnung'],
      ['va-', 'gegen, wider, zurück', 'Richtet eine Wirkung gegen ein Ziel oder ihren Ursprung'],
      ['ka-', 'gebunden, festgesetzt', 'Markiert eine bereits bestehende Fessel oder Verpflichtung'],
      ['sha-', 'verborgen, geflüstert, ungesehen', 'Verschleiert Namen, Preis oder wirkende Instanz'],
      ['zha-', 'letzt, endgültig, vollstreckt', 'Macht eine Handlung abschließend oder unwiderruflich'],
      ['ir-', 'eigen, wahr, selbst', 'Bezieht eine Formel auf Identität oder wahren Namen'],
      ['gor-', 'geöffnet, herbeigerufen', 'Öffnet einen Weg für Erscheinung oder Einfluss'],
      ['mal-', 'verdorben, befleckt, entweiht', 'Kehrt Herkunft, Schutz oder heilige Ordnung um'],
      ['thur-', 'andauernd, nicht endend', 'Verlängert Schmerz, Dienst oder Bindungsdauer'],
      ['-ak / -a', 'Vollstrecker oder Vollstreckerin', 'Dienstname für unmittelbar handelnde infernale Wesen'],
      ['-ar / -aeth', 'Träger oder Trägerin', 'Bezeichnet das Wesen, das eine Macht in sich trägt'],
      ['-ek / -ara', 'Werkzeug oder Klinge', 'Name eines Wesens, das als Instrument eingesetzt wird'],
      ['-im / -ess', 'benanntes Selbst', 'Verdichtete Personenform nahe am verborgenen wahren Namen'],
      ['-or / -ira', 'Herr oder Herrin', 'Rangendung für Befehl, Domäne und Gefolgschaft'],
      ['-uth / -ith', 'gebundener Zustand', 'Markiert fortdauernden Dienst oder eingeschriebene Pflicht'],
      ['-vek / -yra', 'Dauer und Qual', 'Name für Wächter, Peiniger und unermüdliche Verfolger'],
      ['-zhal / -zha', 'Anspruch und Besitz', 'Rangname für Eroberer, Besitzer und Paktnehmer'],
      ['-drax / -veth', 'Tribut und Einforderung', 'Bezeichnet Eintreiber, Opfernehmer und Schuldenhüter'],
      ['-mor / -nara', 'bewusste feindliche Absicht', 'Name für Strategen, Verführer und Verderber'],
      ['Belkhar · Ovrun', 'Bindung + Siegel', 'Grundform eines rechtskräftigen infernalen Paktes'],
      ['Ghol · Ish', 'Tor + wahrer Name', 'Kontaktformel, die ein bestimmtes infernales Wesen ruft'],
      ['Cyrrek · Ygrem', 'Befehl + Unterwerfung', 'Zwangsformel gegen den Willen eines Zieles'],
      ['Qezhar · Drazhun', 'Preis + Tribut', 'Legt Opfer, Schuld und Gegenleistung einer Beschwörung fest'],
      ['Urzhal · Khar', 'Anspruch + Fessel', 'Bindet Wesen, Gegenstand oder Gebiet an einen Besitzer'],
      ['Wexir · Ovrun', 'Zeuge + Siegel', 'Bewahrt und bestätigt einen geschlossenen Vertrag'],
      ['Xarth · Zhaur', 'Auslöschung + Vollstreckung', 'Endformel für endgültige Vernichtung'],
      ['Ssevr · Othrum', 'Meineid + Vertragsbruch', 'Bezeichnet Eidbruch und die dadurch ausgelöste Strafe']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Infernal · Nharazim · Sigillen und Wirkungslehre'
  });
}

function createFutharkScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Futhark · Vollständiges Register der drei Ættir',
    title: 'Die Steinrunen · Futhark',
    subtitle: '24 Runen des Nordvolkes',
    ornamentText: 'ᚠᚢᚦᚨᚱᚲ · ᚺᚾᛁᛃᛇᛈᛉᛋ · ᛏᛒᛖᛗᛚᛜᛞᛟ',
    scriptStyle: 'futhark',
    symbolHeader: 'Rune',
    rows: [
      ['ᚠ', 'Fehu', 'F', 'Vieh, Reichtum, beweglicher Besitz — Gewinn, Verlangen und Verantwortung'],
      ['ᚢ', 'Uruz', 'U', 'Auerochse, Urkraft, rohe Stärke — Gesundheit, Ausdauer und ungezähmte Macht'],
      ['ᚦ', 'Thurisaz', 'Th', 'Riese, Dorn, gefährliche Macht — Abwehr, Konflikt und zerstörender Durchbruch'],
      ['ᚨ', 'Ansuz', 'A', 'Gottheit, Weisheit, Offenbarung — Wort, Atem und göttliche Weisung'],
      ['ᚱ', 'Raido', 'R', 'Reise, Rhythmus, Bewegung — rechter Weg, Ordnung und Schicksalsfahrt'],
      ['ᚲ', 'Kaunan', 'K', 'Fackel, Feuer, Krankheit — Erkenntnis, Handwerk und verzehrende Glut'],
      ['ᚷ', 'Gebo', 'G', 'Geschenk, Gabe, Verbindung — Tausch, Gegenseitigkeit und Bündnis'],
      ['ᚹ', 'Wunjo', 'W', 'Freude, Harmonie, Trost — Zugehörigkeit, Frieden und erfüllter Wunsch'],
      ['ᚺ', 'Hagalaz', 'H', 'Hagel, Umbruch, Naturgewalt — Zerstörung, Reinigung und erzwungener Wandel'],
      ['ᚾ', 'Nauthiz', 'N', 'Not, Bedürfnis, Zwang — Mangel, Widerstand und notwendige Prüfung'],
      ['ᛁ', 'Isa', 'I', 'Eis, Starre, Selbstbeherrschung — Konzentration, Stillstand und Bewahrung'],
      ['ᛃ', 'Jera', 'J', 'Jahr, Ernte, zyklisches Werden — Lohn, Reife und wiederkehrende Zeit'],
      ['ᛇ', 'Eiwaz', 'Ei', 'Eibe, Tod und Wiedergeburt — Weltachse, Übergang und Widerstandskraft'],
      ['ᛈ', 'Perthro', 'P', 'Schicksal, Los, Mysterium — verborgenes Wissen und ungeöffnete Möglichkeit'],
      ['ᛉ', 'Algiz', 'Z', 'Schutz, Instinkt, Wächter — geweihte Grenze und warnende Aufmerksamkeit'],
      ['ᛋ', 'Sowilo', 'S', 'Sonne, Sieg, Klarheit — Lebenskraft, Zielgewissheit und Offenbarung'],
      ['ᛏ', 'Tiwaz', 'T', 'Tyrdras, Gerechtigkeit, Opfer — Recht, Mut und aufrechte Sühne'],
      ['ᛒ', 'Berkano', 'B', 'Birke, Geburt, Mütterlichkeit — Heilung, Schutz und neues Leben'],
      ['ᛖ', 'Ehwaz', 'E', 'Pferd, Vertrauen, Bewegung — Partnerschaft, Treue und gemeinsamer Weg'],
      ['ᛗ', 'Mannaz', 'M', 'Mensch, Selbst, Gesellschaft — Vernunft, Gemeinschaft und Spiegelung'],
      ['ᛚ', 'Laguz', 'L', 'Wasser, Intuition, Fluss — Traum, Tiefe und gelenkte Veränderung'],
      ['ᛜ', 'Ingwaz', 'Ng', 'Fruchtbarkeit, Samen, Ruhe — gespeicherte Kraft und vollendete Reife'],
      ['ᛞ', 'Dagaz', 'D', 'Tag, Erwachen, Wende — Durchbruch, Erkenntnis und Schicksalsumschlag'],
      ['ᛟ', 'Othala', 'O', 'Erbe, Ahnenheim, Besitz — Herkunft, Sippe und übertragene Pflicht']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Namensendungen & wichtige Runenbindungen',
    syllablesSubtitle: 'Produktive Bestandteile nordischer Namen und ritueller Kraftformeln',
    syllables: [
      ['-ar', 'Träger, Handelnder', 'Männliche Namen, Ämter und Gefolgsleute'],
      ['-bjorn', 'Bär, schwere Schutzkraft', 'Krieger-, Wächter- und Sippennamen'],
      ['-brand', 'Klinge, Feuerbrand', 'Kampf, Schmiede und wehrhafte Pflicht'],
      ['-dag', 'Tag, Wende', 'Erwachen, Hoffnung und Neubeginn'],
      ['-grim', 'Maske, entschlossener Zorn', 'Krieger, Runenhüter und Schwurträger'],
      ['-rik', 'Herrschaft, Machtbereich', 'Fürsten-, Jarl- und Erbnamen'],
      ['-sten', 'Stein, Dauer', 'Beständigkeit, Bau und Erinnerung'],
      ['-thor', 'Donner und schützende Gewalt', 'Kampf- und Schutzbezeichnungen'],
      ['-ulf', 'Wolf, Jagdinstinkt', 'Späher, Jäger und Rudelbindung'],
      ['-urd', 'Schicksal, Gewordenes', 'Prophetische Namen wie Sigurd'],
      ['-a', 'weibliche Personenform', 'Kurze, alte Namensform'],
      ['-dis', 'weiblicher Schutzgeist', 'Seherinnen, Ahninnen und Hüterinnen'],
      ['-frid', 'Frieden, Schönheit, Schutz', 'Bindung, Heim und versöhnte Ordnung'],
      ['-gerd', 'umhegter Raum, Schutzwall', 'Hof-, Grenz- und Wächterinnennamen'],
      ['-hild', 'Kampf, Schlacht', 'Kriegerinnen und Schwurkämpferinnen'],
      ['-liva', 'Leben, Fortbestand', 'Heilung, Geburt und Sippenerhalt'],
      ['-runa', 'Geheimnis, Runenwissen', 'Runensängerinnen und Schriftkundige'],
      ['-sigr', 'Sieg', 'Herrschaft, Erfolg und überwundene Prüfung'],
      ['-vara', 'Wacht, Versprechen', 'Hüterinnen, Zeuginnen und Eidnamen'],
      ['-yng', 'Abstammung, junge Linie', 'Erbe, Nachfolge und Sippenzweig'],
      ['Fehu · Gebo', 'Besitz + Gabe', 'Tausch, Wohlstand und verpflichtende Gegenseitigkeit'],
      ['Uruz · Algiz', 'Stärke + Schutz', 'Körperkraft, Abwehr und Wächtersegen'],
      ['Ansuz · Raido', 'Weisung + Weg', 'Göttliche Führung, Reise und richtiger Pfad'],
      ['Hagalaz · Dagaz', 'Umbruch + Wende', 'Zerstörung einer Ordnung zugunsten eines Neubeginns'],
      ['Nauthiz · Isa', 'Not + Starre', 'Bannung, Einschränkung und beherrschter Mangel'],
      ['Jera · Ingwaz', 'Ernte + Samen', 'Fruchtbarkeit, Reife und bewahrte Zukunft'],
      ['Sowilo · Tiwaz', 'Sieg + Recht', 'Gerechter Triumph und ehrenhafte Vollstreckung'],
      ['Tiwaz · Othala', 'Recht + Erbe', 'Sippenpflicht, Landrecht und rechtmäßige Nachfolge']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Futhark · Runen, Namen und Bindungen'
  });
}

function createKanaanithScriptTableData() {
  return sanitizeScriptTableData({
    archiveLabel: 'Kana’anith · Vollständiges Register der 22 Wurzelzeichen',
    title: 'Kana’anith · Monumentalschrift',
    subtitle: 'Rechts-nach-links-Abjad Südost-Tirnaras',
    ornamentText: '𐤀𐤁𐤂𐤃𐤄𐤅𐤆𐤇𐤈𐤉𐤊𐤋𐤌𐤍𐤎𐤏𐤐𐤑𐤒𐤓𐤔𐤕',
    scriptStyle: 'kanaanith',
    symbolHeader: 'Zeichen',
    rows: [
      ['𐤀', 'Aleph', 'ʾ', 'Ochse, Stier — Kraft, Führung, Last und Ursprung · Wurzel AL'],
      ['𐤁', 'Beth', 'b', 'Haus — Familie, Schutz, Innenraum und Besitz · Wurzel BET'],
      ['𐤂', 'Gimel', 'g', 'Kamel — Reise, Karawane, Ausdauer und Fernhandel · Wurzel GAM'],
      ['𐤃', 'Daleth', 'd', 'Tür — Zugang, Übergang, Aufnahme und Beginn · Wurzel DAL'],
      ['𐤄', 'He', 'h', 'Fenster — Licht, Atem, Offenbarung und Sichtbarkeit · Wurzel HEN'],
      ['𐤅', 'Waw', 'w', 'Haken, Nagel — Bindung, Verbindung, Befestigung und Vertrag · Wurzel WAR'],
      ['𐤆', 'Zayin', 'z', 'Waffe, Schwert — Verteidigung, Krieg, Entscheidung und Schneide · Wurzel ZAY'],
      ['𐤇', 'Heth', 'ḥ / HH', 'Zaun, Mauer — Grenze, Schutz, Stadt und Einschluss · Wurzel HET'],
      ['𐤈', 'Teth', 'ṭ / TT', 'Rad — Zyklus, Zeit, Schicksal und Wiederkehr · Wurzel TAR'],
      ['𐤉', 'Yodh', 'y', 'Hand, Arm — Tat, Arbeit, Macht und Ausführung · Wurzel YAD'],
      ['𐤊', 'Kaph', 'k', 'Handfläche — Empfang, Besitz, Gabe und Handwerk · Wurzel KAF'],
      ['𐤋', 'Lamedh', 'l', 'Ochsenstachel — Führung, Lehre, Antrieb und Befehl · Wurzel LAM'],
      ['𐤌', 'Mem', 'm', 'Wasser — Leben, Reinigung, Fluss und Tiefe · Wurzel MER'],
      ['𐤍', 'Nun', 'n', 'Fisch — Fruchtbarkeit, Nahrung, Fülle und Fortbestand · Wurzel NUN'],
      ['𐤎', 'Samekh', 's', 'Stütze, Pfeiler — Stabilität, Tempel, Beistand und Ordnung · Wurzel SAM'],
      ['𐤏', 'Ayin', 'ʿ', 'Auge — Sicht, Wacht, Wissen und Urteil · Wurzel AYEN'],
      ['𐤐', 'Pe', 'p', 'Mund — Sprache, Verkündung, Befehl und Name · Wurzel PAR'],
      ['𐤑', 'Sade', 'ṣ / SS', 'Angelhaken — Fang, Auswahl, Jagd und Zugriff · Wurzel SAD'],
      ['𐤒', 'Qoph', 'q', 'Nadel, Ahle — Genauigkeit, Maß, Schrift und feines Handwerk · Wurzel QEN'],
      ['𐤓', 'Resh', 'r', 'Kopf — Herrschaft, Anfang, Leitung und Rang · Wurzel RESH'],
      ['𐤔', 'Shin', 'š / SH', 'Zahn — Kraft, Verzehr, Hunger und Durchsetzung · Wurzel SHEN'],
      ['𐤕', 'Taw', 't', 'Zeichen, Markierung — Eid, Vollendung, Siegel und festgehaltenes Recht · Wurzel TAV']
    ].map(([symbol, name, sound, meaning]) => ({ symbol, name, sound, meaning })),
    syllablesTitle: 'Präfixe, Suffixe & Vokalmuster',
    syllablesSubtitle: 'Der vollständige produktive Formenbestand der kana’anithischen Sprachbibel',
    syllables: [
      ['a-', 'belebt, handelnd', 'Macht einen Begriff zu einem aktiven Wesen oder Träger'],
      ['ba-', 'Ort, Innenraum', 'Bezeichnet einen umschlossenen oder bewohnten Ort'],
      ['da-', 'Übergang, Beginn', 'Markiert Eintritt, Öffnung oder den Beginn eines Vorgangs'],
      ['ha-', 'sichtbar, offen, erhellt', 'Bezeichnet Offenlegung, Licht oder öffentliche Geltung'],
      ['ka-', 'gemacht, beherrscht', 'Markiert absichtlich hergestellte oder kontrollierte Dinge'],
      ['ma-', 'Kollektiv, Institution', 'Fasst Personen oder Dinge zu einer geordneten Einheit'],
      ['mi-', 'am Wasser, fließend', 'Kennzeichnet Fluss, Küste, Hafen oder Bewässerung'],
      ['na-', 'lebend, wachsend', 'Bezeichnet Wachstum, Fruchtbarkeit oder Ernährung'],
      ['ra-', 'königlich, amtlich', 'Kennzeichnet Herrschaft, Verwaltung und offiziellen Rang'],
      ['sa-', 'verursacht, erzwungen', 'Bildet befohlene oder herbeigeführte Handlungen'],
      ['ta-', 'Ergebnis, Niederschrift', 'Bezeichnet das festgehaltene Ergebnis einer Handlung'],
      ['du-', 'verborgen, unterirdisch', 'Kennzeichnet Grab, Nacht, Geheimnis und Jenseits'],
      ['ur-', 'groß, hoch, heilig', 'Steigert Rang, Umfang oder sakrale Bedeutung'],
      ['aya-', 'gesehen, erkannt', 'Markiert beobachtetes, geprüftes oder gelehrtes Wissen'],
      ['-u', 'einzelne Person oder Sache', 'Unmarkierter greifbarer Singular'],
      ['-at', 'weibliche Person oder Institution', 'Traditionelle Personen-, Amts- und Institutionsform'],
      ['-ir', 'Beruf oder handelnde Person', 'Bildet Berufe und regelmäßige Tätigkeiten'],
      ['-or', 'Amt oder Würdenträger', 'Kennzeichnet einen offiziellen Träger einer Funktion'],
      ['-im', 'Kollektiv oder Mehrzahl', 'Fasst mehrere Dinge oder Personen zusammen'],
      ['-um', 'Ort oder Gebiet', 'Bildet Siedlungen, Räume und Landschaftsbegriffe'],
      ['-an', 'Vorgang oder Zustand', 'Bildet Handlungen und andauernde Zustände'],
      ['-et', 'kleines oder genaues Einzelstück', 'Verkleinerung, Werkzeugteil oder Maßeinheit'],
      ['-esh', 'Werkzeug oder greifbares Objekt', 'Bildet Gebrauchsgegenstände'],
      ['-aya', 'Abstammung oder Traditionslinie', 'Bezeichnet Nachkommen, Dynastien und Schulen'],
      ['-en', 'zugehörig, stammend aus', 'Adjektivische Herkunftsform'],
      ['-i', 'Eigenschaft', 'Kurze Adjektivendung'],
      ['-em', 'Material oder Substanz', 'Bildet Stoff- und Rohmaterialbegriffe'],
      ['-ut', 'abstrakte Eigenschaft', 'Bildet kulturelle und religiöse Abstrakta'],
      ['-ka', 'Gefäß oder Behältnis', 'Bezeichnet etwas, das aufnimmt oder bewahrt'],
      ['-ra', 'geehrt, erhöht', 'Ehrenform für Personen, Orte und Gegenstände'],
      ['-ni', 'Fluss-, Meer- oder Küstenbezug', 'Spezialendung der Wasser- und Hafenmundarten'],
      ['-tav', 'vereidigt, versiegelt, vollendet', 'Macht eine Handlung oder Sache rechtlich bindend'],
      ['CaCaC', 'greifbares Grundwort', 'Gaman · Reise'],
      ['CiCiC', 'Beruf oder regelmäßige Tätigkeit', 'Gamir · Karawanenführer'],
      ['CuCaC', 'erhöhter oder ritueller Begriff', 'Uralor · Gottheit'],
      ['CaCāt', 'weibliche oder institutionelle Form', 'Rareshat · Königin'],
      ['ma-CaC-im', 'geordnetes Kollektiv', 'Magamim · Karawane'],
      ['CaC-um', 'Ort oder Gebiet', 'Merum · Brunnen oder Zisterne']
    ].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Kana’anith · Zeichen, Wurzeln und Formenlehre'
  });
}

function createLinguaArgentiScriptTableData() {
  const alphabet = [
    ['A','Auctoritas','a','Ansehen, gesellschaftliches Gewicht, Recht zu sprechen','Ordo Primus'],
    ['B','Bellum','b','Krieg als organisiertes Mittel der Staatsgewalt','Ordo Secundus'],
    ['C','Civitas','k / z','Bürgerschaft und Zugehörigkeit zum Reich','Ordo Primus'],
    ['D','Disciplina','d','Militärische und geistige Zucht','Ordo Secundus'],
    ['E','Eloquentia','e','Beredsamkeit und Macht des Wortes','Ordo Tertius'],
    ['F','Fides','f','Treue, Eid und gegebenes Wort','Ordo Secundus'],
    ['G','Gloria','g','Durch Taten erworbener Ruhm','Ordo Secundus'],
    ['H','Harmonia','h','Gleichgewicht von Geist und Staat','Ordo Tertius'],
    ['I','Imperium','i / j','Befehlsgewalt und höchstes Herrschaftsrecht','Ordo Primus'],
    ['L','Lex','l','Gesetz und unverbrüchliche Regel','Ordo Primus'],
    ['M','Mars','m','Kriegsgott und rohe Kampfkraft','Ordo Secundus'],
    ['N','Nobilitas','n','Adel, ererbtes Blut und Geburtsstand','Ordo Primus'],
    ['O','Ordo','o','Ordnung und Struktur des Reiches','Ordo Primus'],
    ['P','Potestas','p','Verliehene Amtsgewalt','Ordo Secundus'],
    ['Q','Quaestio','qu','Frage, Wissensdurst und Gelehrsamkeit','Ordo Tertius'],
    ['R','Ratio','r','Vernunft und ordnendes Denken','Ordo Primus'],
    ['S','Senatus','s','Senat und kollektive Stimme der Macht','Ordo Primus'],
    ['T','Triumphus','t','Öffentlicher Sieg und Recht auf Ehrung','Ordo Secundus'],
    ['U','Unitas','u / v','Einheit und Band der Bürger','Ordo Tertius'],
    ['V','Virtus','v / w','Tugend und innere Kraft','Ordo Primus'],
    ['X','Xenium','ks','Gastgeschenk, Fremde und Nutzen des Unbekannten','Ordo Tertius'],
    ['Y','Zephyrus','ü / y','Wind des Denkens, Freiheit und Schutzgottheit','Ordo Tertius'],
    ['Z','Zelus','z / ts','Eifer und brennendes Streben','Ordo Tertius']
  ];
  const potentSyllables = [
    ['-val-','Stärke','Tugend, Ansehen und Gesetz in einem'],
    ['-lex-','Gesetz','Unverbrüchliches Recht und Bindung durch Ordnung'],
    ['sen-','Rat','Kollektive Weisheit und Stimme der Versammlung'],
    ['-civ-','Bürgerschaft','Zugehörigkeit und Recht auf Schutz des Reiches'],
    ['-hon-','Ehre','Gesellschaftliches Ansehen, das nicht erkauft werden kann'],
    ['-nob-','Adel','Ererbter Stand und Gewicht der Vorfahren'],
    ['-ord-','Ordnung','Struktur, Rang und tragendes System'],
    ['-pot-','Amtsgewalt','Verliehene Macht und Amt als Werkzeug des Staates'],
    ['-bell-','Krieg','Organisierter Kampf und Schwert des Staates'],
    ['-vict-','Sieg','Triumph, Niederwerfung und errungener Ruhm'],
    ['-leg-','Legion','Geordnetes Heer und Disziplin in Formation'],
    ['-fort-','Kraft','Körperkraft, Standhaftigkeit und das Ungebrochene'],
    ['-glo-','Ruhm','Öffentliche Ehrung und ewiges Andenken'],
    ['-fid-','Treue','Eid und unverbrüchliches Band zum Reich'],
    ['-disc-','Zucht','Militärische Disziplin und geformtes Werkzeug'],
    ['-rat-','Vernunft','Ordnendes Denken und Logik als Herrschaftsmittel'],
    ['-sap-','Weisheit','Gewonnene Erkenntnis und Wissen der Alten'],
    ['-arg-','Silber','Reinheit, Wert und geistiger Glanz'],
    ['-vent-','Wind','Freiheit, Gedankenfluss und Atem des Zephyr'],
    ['-lib-','Freiheit','Recht auf eigene Meinung'],
    ['-scrib-','Schrift','Niedergeschriebenes und überdauerndes Wissen'],
    ['-zel-','Eifer','Wissensdurst und unermüdlicher Antrieb'],
    ['-navig-','Seefahrt','Erkundung und Wagnis auf unbekanntem Wasser'],
    ['-spir-','Atem','Lebensatem, Inspiration und Götterhauch']
  ];
  const prefixes = [
    ['prae-','voran, ober-, vorher','Vorrang in Zeit, Rang oder Formation'],
    ['sub-','unter, nachgeordnet','Unterordnung oder Stellvertretung'],
    ['con-','gemeinsam, verbunden','Zusammenwirken mehrerer Personen oder Institutionen'],
    ['re-','wieder, zurück','Wiederholung oder Rückführung'],
    ['in-','innen, hinein','Innerer Zustand oder Eintritt'],
    ['ex-','hinaus, ehemalig','Austritt, Herkunft oder beendetes Amt'],
    ['pro-','für, anstelle, vorwärts','Vertretung oder Förderung'],
    ['contra-','gegen, entgegen','Widerspruch oder Gegenmaßnahme'],
    ['magna-','groß, hoch','Steigerung von Rang und Umfang'],
    ['min-','klein, geringer','Verkleinerung oder niedriger Rang'],
    ['civ-','bürgerlich, reichszugehörig','Bezug auf Bürgerschaft und Stadt'],
    ['sen-','senatorisch, beratend','Bezug auf Rat und Senat'],
    ['legi-','gesetzlich oder legionär','Geordnete staatliche Ausführung'],
    ['arg-','silbern, rein, gelehrt','Materieller oder geistiger Bezug auf Silber']
  ];
  const suffixes = [
    ['-ius','männlicher Träger','Personen- und Namensendung'],
    ['-ia','weibliche Trägerin oder Fachgebiet','Personen-, Länder- und Disziplinform'],
    ['-ian','Abstammung','Zugehörigkeit zu einer Linie'],
    ['-inus','geprägt oder gebildet durch','Herkunfts- und Eigenschaftsform'],
    ['-atus','Amt, Körperschaft oder Ergebnis','Institutionelle Form'],
    ['-ellus','jüngere oder geehrte Form','Verkleinernde Namensform'],
    ['-or','Amtsträger oder Handelnder','Berufs- und Amtsendung'],
    ['-rix','weibliche Amtsträgerin','Weibliche Amtsendung'],
    ['-arius','Beruf oder regelmäßige Funktion','Berufsbezeichnung'],
    ['-alis','zugehörige Eigenschaft','Adjektivische Form'],
    ['-ium','Institution, Ort oder Stoff','Sächliche Sammel- und Ortsform'],
    ['-itas','abstrakte Eigenschaft','Tugend, Zustand oder Rechtsbegriff'],
    ['-ica','Wissenschaft oder Lehre','Systematisches Wissensgebiet'],
    ['-mentum','Werkzeug oder Ergebnis','Instrumentelle Form'],
    ['-torium','Funktionsort','Gebäude oder zweckgebundener Raum'],
    ['-ensis','stammend aus','Regionale oder institutionelle Herkunft'],
    ['-culus','kleines Einzelstück','Verkleinerung und Fachsprache'],
    ['-um','greifbarer Gegenstand','Neutrale Sachform']
  ];

  return sanitizeScriptTableData({
    archiveLabel: 'Lingua Argenti · Register der 23 Litterae',
    title: 'Argentisch · Lingua Argenti',
    subtitle: 'Monumentalschrift des Kaiserreichs Argentum',
    ornamentText: 'IMPERIUS · SENATUS · ARGENTUM · VIRTUS',
    scriptStyle: 'argenti',
    symbolHeader: 'Littera',
    rows: alphabet.map(([symbol, name, sound, meaning, order]) => ({ symbol, name, sound, meaning: `${meaning} · ${order}` })),
    syllablesTitle: 'Syllabae Potentes, Präfixe & Suffixe',
    syllablesSubtitle: 'Der vollständige produktive Formenbestand des Gesamtpakets',
    syllables: [...potentSyllables, ...prefixes, ...suffixes].map(([syllable, meaning, usage]) => ({ syllable, meaning, usage })),
    footer: 'Aleria Almanach · Lingua Argenti · Litterae und Formenlehre'
  });
}

function createStoicheiaScriptTableData() {
  const alphabet = [
    ['Α','Alpha','A','Anführer, erste Kraft, Ursprung aller Ordnung','Polis'],
    ['Β','Beta','B','Wurf, Geschoss, erster Schlag','Ares'],
    ['Γ','Gamma','G','Heimatboden, Erde unter den Füßen','Physis'],
    ['Δ','Delta','D','Volk, Gemeinschaft, Masse der Bürger','Demos'],
    ['Ε','Epsilon','E','Ruf in die Schlacht','Ares'],
    ['Ζ','Zeta','Z','Leben und Lebensatem','Kosmos'],
    ['Η','Eta','Ē','Sonne und ewiges Auge der Götter','Kosmos'],
    ['Θ','Theta','Th','Tod und unausweichliches Ende','Kosmos'],
    ['Ι','Iota','I','Gespannte Kraft, Bogen und Präzision','Ares'],
    ['Κ','Kappa','K','Herrschaft und rohe Macht','Polis'],
    ['Λ','Lambda','L','Aufgebotenes Heer','Ares'],
    ['Μ','My','M','Schicksal und Zuteilung','Kosmos'],
    ['Ν','Ny','N','Tempel und heiliger Ort','Polis'],
    ['Ξ','Xi','Ks','Fremder und äußere Gefahr','Demos'],
    ['Ο','Omikron','O','Berg, Grenze, Unüberwindbares','Physis'],
    ['Π','Pi','P','Stadt, Schutzwall, organisiertes Leben','Polis'],
    ['Ρ','Rho','R','Strömung und Unaufhaltsames','Physis'],
    ['Σ','Sigma','S','Körperkraft und Überlegenheit','Ares'],
    ['Τ','Tau','T','Ordnung und Schlachtreihe','Polis'],
    ['Υ','Ypsilon','Y / U','Wasser, Meer und Weite','Physis'],
    ['Φ','Phi','Ph','Fackel und Signalfeuer','Ares'],
    ['Χ','Chi','Ch / Kh','Gnade und Gunst der Götter','Kosmos'],
    ['Ψ','Psi','Ps','Seele und innerer Geist','Kosmos'],
    ['Ω','Omega','Ō','Eid und bindendes Wort','Polis']
  ];
  const rhemata = [
    ['Ares','Ar-','Beginn','Ursprung und Gründung'], ['Ares','Sthen-','Stärke','Körper, Kampfkraft, Ausdauer'],
    ['Ares','-mach-','Kampf','Ringen und direkter Konflikt'], ['Ares','-nik-','Sieg','Triumph und Niederwerfung'],
    ['Ares','-strat-','Heer','Feldheer und Strategie'], ['Ares','Dory-','Speer','Gezielter Angriff'],
    ['Ares','-erg-','Tat','Vollbrachtes Werk'], ['Ares','Oxy-','Schärfe','Schnelligkeit und Präzision'],
    ['Ares','Nyk-','Nacht','Verborgenheit und Geheimplan'], ['Ares','Pyro-','Feuer','Zerstörung und Reinigung'],
    ['Polis','Pol-','Kollektiv','Gemeinschaft und Mauer'], ['Polis','-krat-','Herrschaft','Regieren und Unterwerfen'],
    ['Polis','-nom-','Gesetz','Regel und geltende Ordnung'], ['Polis','-arch-','Amt','Rang und Herrschaft'],
    ['Polis','Iso-','Gleichheit','Gerechtes Maß'], ['Polis','-phyl-','Wächter','Hüter und Wachtposten'],
    ['Polis','-krit-','Urteil','Gericht und Entscheidung'], ['Kosmos','Mir-','Schicksal','Bestimmung und Verhängnis'],
    ['Kosmos','-than-','Ende','Tod und letztes Urteil'], ['Kosmos','-the-','Göttliches','Heilige Nähe'],
    ['Kosmos','-dor-','Gabe','Talent und göttliche Zuteilung'], ['Kosmos','Apo-','Ferne','Abkehr und Verbannung'],
    ['Kosmos','-mne-','Erinnerung','Gedenken und Nachruhm'], ['Kosmos','Nekro-','Totenreich','Schwelle zur Unterwelt'],
    ['Kosmos','-dox-','Ruhm','Dauerhafter Glanz'], ['Kosmos','-phor-','Tragen','Bürde, Ehre und Botschaft'],
    ['Physis','Geo-','Erde','Boden und Heimatland'], ['Physis','Hydro-','Wasser','Flut und Reinigung'],
    ['Physis','-lith-','Stein','Dauer und Substanz'], ['Physis','Aero-','Wind','Atem und flüchtiger Geist'],
    ['Physis','-phy-','Wachstum','Organische Kraft'], ['Demos','-nym-','Name','Identität, Ruhm oder Schande'],
    ['Demos','-gen-','Abstammung','Blutlinie und Herkunft'], ['Demos','-log-','Wort','Rede und Gesetz durch Sprache'],
    ['Demos','-xen-','Fremder','Gast oder äußere Gefahr'], ['Demos','-tim-','Ehre','Würde und Ansehen'],
    ['Demos','Demo-','Volk','Stimme und Kraft der Vielen']
  ];
  const prefixes = [
    ['Amphi-','beidseitig, umfassend'], ['Ana-','empor, erneut'], ['Anti-','gegen, entgegen'], ['Apo-','fort, fern'],
    ['Dia-','durch, hindurch'], ['Epi-','auf, über'], ['Hyper-','übermäßig, oberhalb'], ['Hypo-','untergeordnet, darunter'],
    ['Kata-','herab, vollständig'], ['Meta-','Wandel, jenseits'], ['Para-','neben, abweichend'], ['Peri-','ringsum, schützend']
  ];
  const suffixes = [
    ['-os','männlicher Träger'], ['-on','Werk, Ort oder neutrales Ding'], ['-es','Amtsträger'],
    ['-ios','Zugehöriger einer Linie'], ['-ides','Sohn oder Nachkomme'], ['-ia','weibliche Trägerin'],
    ['-eia','Zustand oder Lehre'], ['-is','wirkende Kraft'], ['-ikon','Werkzeug oder Abbild'],
    ['-ion','Institution oder Handlung'], ['-ikos','zugehörig, fachlich'], ['-archos','führender Amtsträger']
  ];

  return sanitizeScriptTableData({
    archiveLabel: 'Stoicheia · Register der 24 Poliszeichen',
    title: 'Stoicheia · Schrift der Stadtstaaten',
    subtitle: 'Zeichen, Tetrades und schicksalstragende Rhemata',
    ornamentText: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    scriptStyle: 'stoicheia',
    symbolHeader: 'Stoicheion',
    rows: alphabet.map(([symbol, name, sound, meaning, sphere]) => ({ symbol, name, sound, meaning: `${meaning} · Sphäre ${sphere}` })),
    syllablesTitle: 'Rhemata, Präfixe & Suffixe',
    syllablesSubtitle: '37 Kernsilben und 24 produktive Formen des Gesamtpakets',
    syllables: [
      ...rhemata.map(([sphere, syllable, meaning, usage]) => ({ syllable, meaning, usage: `${sphere} · ${usage}` })),
      ...prefixes.map(([syllable, meaning]) => ({ syllable, meaning, usage: 'Produktives Präfix' })),
      ...suffixes.map(([syllable, meaning]) => ({ syllable, meaning, usage: 'Produktives Suffix' }))
    ],
    footer: 'Aleria Almanach · Stoicheia · Zeichen, Rhemata und Formenlehre'
  });
}
