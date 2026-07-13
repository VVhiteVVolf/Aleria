const NAME_LIST_GROUP_LIMIT = 6;
const NAME_LIST_NAMES_PER_GROUP_LIMIT = 500;

function sanitizeNameListNames(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || '').split(/\r?\n/);
  const seen = new Set();
  return source
    .map(name => String(name || '').trim())
    .filter(name => {
      const key = name.toLocaleLowerCase('de');
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, NAME_LIST_NAMES_PER_GROUP_LIMIT);
}

function sanitizeNameListGroups(groups) {
  const defaults = [
    { label: 'Männliche Namen', subtitle: 'Namensvorschläge', names: ['Beispielname'] },
    { label: 'Weibliche Namen', subtitle: 'Namensvorschläge', names: ['Beispielname'] }
  ];
  const source = Array.isArray(groups) ? groups : defaults;
  return source
    .map(group => ({
      label: String(group?.label || '').trim(),
      subtitle: String(group?.subtitle || '').trim(),
      names: sanitizeNameListNames(group?.names)
    }))
    .filter(group => group.label || group.subtitle || group.names.length)
    .slice(0, NAME_LIST_GROUP_LIMIT);
}

function sanitizeNameListData(data = {}) {
  const ornamentStyle = String(data.ornamentStyle || 'rheunwaith').trim();
  return {
    archiveLabel: String(data.archiveLabel || 'Namensarchiv').trim(),
    introduction: String(data.introduction || '').trim(),
    ornamentText: String(data.ornamentText || 'Rheunwaith').trim(),
    ornamentStyle: ['rheunwaith', 'ogham', 'karnrith', 'infernal', 'futhark', 'kanaanith', 'argenti', 'stoicheia', 'plain'].includes(ornamentStyle) ? ornamentStyle : 'plain',
    groups: sanitizeNameListGroups(data.groups),
    footer: String(data.footer || 'Aleria Almanach · Namensarchiv').trim()
  };
}

function createDefaultNameListPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Namenslisten`,
    image: '',
    nameListPage: true,
    nameList: sanitizeNameListData({
      archiveLabel: 'Namensarchiv · Sprachkunde',
      introduction: 'Sammle hier Namensvorschläge und ordne sie in getrennten Listen.',
      groups: [
        { label: 'Männliche Namen', subtitle: '0 Vorschläge', names: [] },
        { label: 'Weibliche Namen', subtitle: '0 Vorschläge', names: [] }
      ],
      ornamentStyle: 'plain'
    })
  };
}

function combineRheunwaithNameParts(prefix, suffix) {
  const left = String(prefix || '').trim();
  const right = String(suffix || '').trim();
  if (!left || !right) return `${left}${right}`;
  const last = left.slice(-1).toLocaleLowerCase('de');
  const first = right.charAt(0).toLocaleLowerCase('de');
  return last === first ? `${left}${right.slice(1)}` : `${left}${right}`;
}

function buildRheunwaithNameSuggestions(prefixes, suffixes) {
  return prefixes
    .flatMap(prefix => suffixes.map(suffix => combineRheunwaithNameParts(prefix, suffix)))
    .filter((name, index, names) => names.indexOf(name) === index)
    .sort((left, right) => left.localeCompare(right, 'de'));
}

function createRheunwaithNameListData() {
  const masculinePrefixes = [
    'Abael', 'Bren', 'Cyr', 'Dyr', 'Ell', 'Fir', 'Gwaed', 'Hel', 'Iwr', 'Jan',
    'Kyr', 'Lleu', 'Mael', 'Nedd', 'Oen', 'Per', 'Rhyd', 'Saith', 'Thal', 'Uwch'
  ];
  const masculineSuffixes = ['an', 'ar', 'ban', 'en', 'eth', 'ian', 'or', 'ric', 'wyn', 'yr'];
  const femininePrefixes = [
    'Avel', 'Bren', 'Cyr', 'Dyn', 'Ell', 'Fir', 'Gwen', 'Helyg', 'Iwr', 'Jann',
    'Kyr', 'Lleir', 'Mael', 'Ner', 'Oen', 'Perd', 'Rhew', 'Sair', 'Thal', 'Uffyr'
  ];
  const feminineSuffixes = ['a', 'ae', 'ella', 'ena', 'eth', 'ia', 'in', 'wen', 'yn', 'ys'];
  const masculineNames = buildRheunwaithNameSuggestions(masculinePrefixes, masculineSuffixes);
  const feminineNames = buildRheunwaithNameSuggestions(femininePrefixes, feminineSuffixes);

  return sanitizeNameListData({
    archiveLabel: 'Rheunwaith · Namensarchiv',
    introduction: 'Die folgenden Namen sind aus den Lautfolgen und Zeichenbezeichnungen des Rheunwaith abgeleitet. Sie sind Vorschläge für avallornische Figuren und werden in gewöhnlicher Schrift wiedergegeben; die Runen dienen ausschließlich als Verzierung.',
    ornamentText: 'Rheunwaith',
    ornamentStyle: 'rheunwaith',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Vorschläge`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Vorschläge`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Rheunwaith · 400 Namensvorschläge'
  });
}

function buildOghamNameSuggestions(prefixes, suffixes) {
  return prefixes
    .flatMap(prefix => suffixes.map(suffix => `${prefix}${suffix}`))
    .filter((name, index, names) => names.indexOf(name) === index)
    .sort((left, right) => left.localeCompare(right, 'de'));
}

function createOghamNameListData() {
  const masculinePrefixes = [
    'Aedh', 'Bran', 'Cael', 'Duir', 'Eog', 'Fearn', 'Gort', 'Huath', 'Id', 'Luir',
    'Mael', 'Nial', 'Ois', 'Ruan', 'Sael', 'Taran', 'Uill', 'Corm', 'Brec', 'Finn'
  ];
  const masculineSuffixes = ['ach', 'an', 'ar', 'en', 'eth', 'in', 'or', 'rian', 'ui', 'yn'];
  const femininePrefixes = [
    'Ail', 'Beith', 'Cael', 'Dair', 'Eir', 'Fian', 'Gwen', 'Huan', 'Ion', 'Laer',
    'Mair', 'Ness', 'Oir', 'Rion', 'Sail', 'Tal', 'Uil', 'Eadh', 'Coll', 'Ruis'
  ];
  const feminineSuffixes = ['a', 'ae', 'ala', 'ena', 'eth', 'ia', 'in', 'ora', 'wen', 'ys'];
  const masculineNames = buildOghamNameSuggestions(masculinePrefixes, masculineSuffixes);
  const feminineNames = buildOghamNameSuggestions(femininePrefixes, feminineSuffixes);

  return sanitizeNameListData({
    archiveLabel: 'Ogham · Namensflechten',
    introduction: 'Diese Vorschläge verbinden albische Lautstämme mit den Namen und Bedeutungsfeldern der Ogham-Zeichen. Sie werden in gewöhnlicher Schrift wiedergegeben; die Ogham-Zeichen dienen ausschließlich als Verzierung.',
    ornamentText: 'ᚁᚂᚃᚄᚅ · ᚆᚇᚈᚉᚊ · ᚋᚌᚍᚎᚏ',
    ornamentStyle: 'ogham',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Vorschläge`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Vorschläge`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Ogham · 400 Namensvorschläge'
  });
}

function combineMorgarNameParts(prefix, suffix) {
  const left = String(prefix || '').trim();
  const right = String(suffix || '').trim();
  if (!left || !right) return `${left}${right}`;
  // Im Morgar verschmilzt TH an einer Stammfuge: Veth + Tharn → Vetharn.
  return left.toLocaleLowerCase('de').endsWith('th') && right.toLocaleLowerCase('de').startsWith('th')
    ? `${left}${right.slice(2)}`
    : `${left}${right}`;
}

function buildMorgarNameSuggestions(prefixes, endings) {
  return prefixes
    .flatMap(prefix => endings.map(ending => combineMorgarNameParts(prefix, ending)))
    .filter((name, index, names) => names.indexOf(name) === index);
}

function createKarnrithNameListData() {
  // Die 20 Anfangsstämme und zehn Endstämme entstammen der Morgar-Sprachbibel.
  // Ihre vollständige Kreuzung erweitert die dort belegten 100 Namen auf je 200,
  // ohne fremde Silben oder zufällige Lautfolgen einzuführen.
  const firstRoots = [
    'Ar', 'Kar', 'Gor', 'Faur', 'Veth', 'Or', 'Dor', 'Hal', 'Lan', 'Tar',
    'War', 'Bra', 'Mor', 'Nai', 'Yr', 'Er', 'Par', 'Skar', 'Ghar', 'Shen'
  ];
  const masculineEndings = ['karn', 'hald', 'ran', 'tharn', 'chor', 'targ', 'skar', 'zarn', 'orn', 'gor'];
  const feminineEndings = ['karna', 'helda', 'rena', 'thera', 'chora', 'terga', 'skara', 'zara', 'orna', 'gora'];
  const masculineNames = buildMorgarNameSuggestions(firstRoots, masculineEndings);
  const feminineNames = buildMorgarNameSuggestions(firstRoots, feminineEndings);

  return sanitizeNameListData({
    archiveLabel: 'Morgar · Karnrith-Namensarchiv',
    introduction: 'Morgornische Traditionsnamen verbinden zwei Bedeutungswurzeln. Der erste Stamm trägt Wunsch oder Erinnerung der Sippe, der zweite benennt die bewahrende Eigenschaft. Die weiblichen Formen verwenden alte, weichere Endstämme. Alle Namen stehen in gewöhnlicher Schrift; Karnrith erscheint ausschließlich als Verzierung.',
    ornamentText: 'MORGAR · KARNRITH · THARN · GHAIR',
    ornamentStyle: 'karnrith',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Vorschläge`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Vorschläge`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Morgar · 400 semantisch gebildete Namen'
  });
}

function combineInfernalNameParts(root, ending) {
  const left = String(root || '').trim();
  const right = String(ending || '').trim();
  if (!left || !right) return `${left}${right}`;
  return left.slice(-1).toLocaleLowerCase('de') === right.charAt(0).toLocaleLowerCase('de')
    ? `${left}${right.slice(1)}`
    : `${left}${right}`;
}

function buildInfernalNameSuggestions(roots, endings) {
  return roots
    .flatMap(root => endings.map(ending => combineInfernalNameParts(root, ending)))
    .filter((name, index, names) => names.indexOf(name) === index);
}

function createInfernalNameListData() {
  // Die Anfangsstämme sind aus den kanonischen Nharazim-Sigillennamen gekürzt.
  // Zehn belegungstreue Rangendungen pro Stamm ergeben je 200 Dienstnamen.
  const sigilRoots = [
    'Ashr', 'Belkh', 'Cyrr', 'Drazh', 'Eshr', 'Fhaur', 'Ghol', 'Hekr', 'Ish', 'Jhaz',
    'Khar', 'Laz', 'Mordr', 'Nhal', 'Ovr', 'Phaeg', 'Qezh', 'Rhaz', 'Ssar', 'Thur'
  ];
  const masculineEndings = ['ak', 'ar', 'ek', 'im', 'or', 'uth', 'vek', 'zhal', 'drax', 'mor'];
  const feminineEndings = ['a', 'aeth', 'ara', 'ess', 'ira', 'ith', 'yra', 'zha', 'veth', 'nara'];
  const masculineNames = buildInfernalNameSuggestions(sigilRoots, masculineEndings);
  const feminineNames = buildInfernalNameSuggestions(sigilRoots, feminineEndings);

  return sanitizeNameListData({
    archiveLabel: 'Infernal · Nharazim-Namensregister',
    introduction: 'Infernale Wesen offenbaren ihren wahren Namen nur in bindender Magie. Im Umgang mit Sterblichen verwenden sie Dienst-, Rang- oder Herrschaftsnamen aus einem Sigillenstamm und einer Funktionsendung. Die folgenden Namen sind vollständig aus den Lautformen des Nharazim gebildet und stehen in gewöhnlicher Schrift; die Brandsigillen dienen ausschließlich als Verzierung.',
    ornamentText: 'NHARAZIM · BELKHAR · GHOL · OVRUN · ZHAUR',
    ornamentStyle: 'infernal',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Herrschafts- und Dienstnamen`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Herrschafts- und Dienstnamen`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Infernal · 400 Namen aus Nharazim-Stämmen'
  });
}

function combineFutharkNameParts(root, ending) {
  const left = String(root || '').trim();
  const right = String(ending || '').trim();
  if (!left || !right) return `${left}${right}`;
  return left.slice(-1).toLocaleLowerCase('de') === right.charAt(0).toLocaleLowerCase('de')
    ? `${left}${right.slice(1)}`
    : `${left}${right}`;
}

function buildFutharkNameSuggestions(roots, endings) {
  return roots
    .flatMap(root => endings.map(ending => combineFutharkNameParts(root, ending)))
    .filter((name, index, names) => names.indexOf(name) === index);
}

function createFutharkNameListData() {
  const masculineRoots = [
    'Feh', 'Ur', 'Thur', 'Ans', 'Rai', 'Kaun', 'Geb', 'Wun', 'Hag', 'Naut',
    'Is', 'Jer', 'Eiw', 'Perth', 'Alg', 'Sig', 'Tiw', 'Berk', 'Ehw', 'Mann'
  ];
  const masculineEndings = ['ar', 'bjorn', 'brand', 'dag', 'grim', 'rik', 'sten', 'thor', 'ulf', 'urd'];
  const feminineRoots = [
    'Feha', 'Ura', 'Thura', 'Ansa', 'Raia', 'Kauna', 'Geba', 'Wuna', 'Haga', 'Nautha',
    'Isa', 'Jera', 'Eiwa', 'Pertha', 'Alga', 'Sola', 'Tiwa', 'Berka', 'Ehwa', 'Laga'
  ];
  const feminineEndings = ['a', 'dis', 'frid', 'gerd', 'hild', 'liva', 'runa', 'sigr', 'vara', 'yng'];
  const masculineNames = buildFutharkNameSuggestions(masculineRoots, masculineEndings);
  const feminineNames = buildFutharkNameSuggestions(feminineRoots, feminineEndings);

  return sanitizeNameListData({
    archiveLabel: 'Futhark · Namens- und Runenarchiv',
    introduction: 'Nordische Namen verbinden Runenstämme mit Endungen für Tierkraft, Schutz, Herrschaft, Kampf, Schicksal oder Sippe. Sie gelten als gebundene Aussagen über Herkunft, Wunsch oder mögliche Bestimmung. Alle Vorschläge werden in gewöhnlicher Schrift wiedergegeben; die Futhark-Runen dienen ausschließlich als Verzierung.',
    ornamentText: 'ᚠᚢᚦᚨᚱᚲ · ᚺᚾᛁᛃᛇᛈᛉᛋ · ᛏᛒᛖᛗᛚᛜᛞᛟ',
    ornamentStyle: 'futhark',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Runennamen`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Runennamen`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Futhark · 400 Namen aus Runenstämmen'
  });
}

function buildKanaanithNameSuggestions(firstStems, endings) {
  return firstStems
    .flatMap(first => endings.map(ending => `${first}${ending}`))
    .filter((name, index, names) => names.indexOf(name) === index);
}

function createKanaanithNameListData() {
  // Die Sprachbibel belegt je fünf Kombinationen pro Erststamm. Die vollständige
  // Kreuzung mit allen zehn kanonischen Endstämmen bewahrt diese 100 Namen und
  // erweitert jede Liste regelgetreu auf 200 Einträge.
  const firstStems = [
    'Aru', 'Beti', 'Gamu', 'Dalu', 'Henu', 'Waru', 'Zayi', 'Hetu', 'Tari', 'Yadi',
    'Kafu', 'Lamu', 'Meru', 'Nuni', 'Samu', 'Aynu', 'Paru', 'Sadu', 'Qenu', 'Reshu'
  ];
  const masculineEndings = ['bar', 'gam', 'dar', 'zan', 'yad', 'lam', 'mer', 'sam', 'resh', 'tav'];
  const feminineEndings = ['bara', 'gama', 'dara', 'zana', 'yada', 'lama', 'mera', 'sama', 'resha', 'tava'];
  const masculineNames = buildKanaanithNameSuggestions(firstStems, masculineEndings);
  const feminineNames = buildKanaanithNameSuggestions(firstStems, feminineEndings);

  return sanitizeNameListData({
    archiveLabel: 'Kana’anith · Namensarchiv Südost-Tirnaras',
    introduction: 'Ein kana’anithischer Personenname verbindet zwei positive Zeichenbedeutungen. Der erste Stamm bezeichnet die erhoffte Grundanlage; der zweite Aufgabe, Schutz oder öffentliches Vermächtnis. Weibliche Traditionsformen tragen weichere Endungen auf -a. Alle Namen stehen in lateinischer Umschrift; die kana’anithischen Zeichen dienen ausschließlich als Verzierung.',
    ornamentText: '𐤀𐤁𐤂𐤃𐤄𐤅𐤆𐤇𐤈𐤉𐤊 · 𐤋𐤌𐤍𐤎𐤏𐤐𐤑𐤒𐤓𐤔𐤕',
    ornamentStyle: 'kanaanith',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Traditionsnamen`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Traditionsnamen`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Kana’anith · 400 semantisch gebildete Namen'
  });
}

function buildDocumentedNameMatrix(roots, endings) {
  return roots
    .flatMap(root => endings.map(ending => `${root}${ending}`))
    .filter((name, index, names) => names.indexOf(name) === index);
}

function createLinguaArgentiNameListData() {
  // Die ersten fünf Endungen jeder Liste bilden exakt die 100 Namen des
  // Gesamtpakets ab. Fünf weitere, ebenfalls dokumentierte Formen erweitern
  // die Auswahl regelgebunden auf die im Almanach üblichen 200 Namen.
  const roots = [
    'Valer', 'Lexar', 'Senar', 'Civer', 'Honor', 'Nobil', 'Ordin', 'Poten', 'Bellar', 'Victor',
    'Legar', 'Forten', 'Glori', 'Fidel', 'Discip', 'Ration', 'Sapien', 'Argent', 'Ventur', 'Liber'
  ];
  const masculineNames = [
    ...buildDocumentedNameMatrix(roots, ['ius', 'ian', 'inus', 'atus', 'ellus']),
    ...buildDocumentedNameMatrix(roots, ['or', 'arius', 'alis', 'ensis', 'culus'])
  ];
  const feminineNames = [
    ...buildDocumentedNameMatrix(roots, ['ia', 'iana', 'ina', 'ata', 'ella']),
    ...buildDocumentedNameMatrix(roots, ['rix', 'ica', 'alis', 'ensis', 'itas'])
  ];

  return sanitizeNameListData({
    archiveLabel: 'Lingua Argenti · Reichsnamensregister',
    introduction: 'Argentische Namen sind öffentliche Aussagen über Tugend, Stand und Pflicht. Ein Bedeutungsstamm wird mit einer Personen-, Amts-, Herkunfts- oder Ehrenform verbunden. Die ersten hundert Namen jeder Liste entsprechen dem kanonischen Gesamtpaket; die folgenden Vorschläge verwenden ausschließlich dort dokumentierte Stämme und Endungen. Alle Namen stehen in gewöhnlicher Schrift, während die monumentalen Litterae nur als Verzierung erscheinen.',
    ornamentText: 'IMPERIUS · SENATUS · ARGENTUM · VIRTUS',
    ornamentStyle: 'argenti',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} Reichs- und Traditionsnamen`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} Reichs- und Traditionsnamen`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Lingua Argenti · 400 regelgebundene Namensvorschläge'
  });
}

function buildStoicheiaFeminineExtensions(roots) {
  const formations = [
    ['Amphi', 'ia'],
    ['Ana', 'eia'],
    ['Anti', 'is'],
    ['Epi', 'andra'],
    ['Meta', 'thea']
  ];
  return formations.flatMap(([prefix, ending]) => roots.map(root =>
    `${prefix}${root.charAt(0).toLocaleLowerCase('de')}${root.slice(1)}${ending}`
  ));
}

function createStoicheiaNameListData() {
  const roots = [
    'Ar', 'Sthen', 'Mach', 'Nik', 'Strat', 'Dory', 'Erg', 'Oxy', 'Nyk', 'Pyr',
    'Pol', 'Krat', 'Nom', 'Arch', 'Iso', 'Phyl', 'Krit', 'Mir', 'The', 'Dor'
  ];
  const masculineNames = [
    ...buildDocumentedNameMatrix(roots, ['os', 'ion', 'ides', 'archos', 'andros']),
    ...buildDocumentedNameMatrix(roots, ['on', 'es', 'ios', 'ikon', 'ikos'])
  ];
  const canonicalFeminineNames = buildDocumentedNameMatrix(roots, ['ia', 'eia', 'is', 'andra', 'thea']);
  const feminineNames = [...canonicalFeminineNames, ...buildStoicheiaFeminineExtensions(roots)];

  return sanitizeNameListData({
    archiveLabel: 'Stoicheia · Archiv der gebundenen Namen',
    introduction: 'Phalantische und klythesische Namen verbinden bedeutungstragende Rhemata mit Personen- und Schicksalsformen. Die ersten hundert Einträge jeder Liste sind im Gesamtpaket belegt. Die Erweiterungen kombinieren ausschließlich dokumentierte Rhemata, Präfixe und Endungen. Die Namen werden in gewöhnlicher Schrift gelesen; die Poliszeichen dienen als Verzierung.',
    ornamentText: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    ornamentStyle: 'stoicheia',
    groups: [
      { label: 'Männliche Namen', subtitle: `${masculineNames.length} gebundene Namen`, names: masculineNames },
      { label: 'Weibliche Namen', subtitle: `${feminineNames.length} gebundene Namen`, names: feminineNames }
    ],
    footer: 'Aleria Almanach · Stoicheia · 400 Namen aus Rhemata und Formenlehre'
  });
}
