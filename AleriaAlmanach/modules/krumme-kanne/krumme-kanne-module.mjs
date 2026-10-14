import { KANNE_PEOPLE, KANNE_PETS, KANNE_DEPARTMENTS } from './krumme-kanne-roster.mjs';
import { buildKanneTradeCatalog } from './krumme-kanne-trade-catalog.mjs';
import { KANNE_ROOMS } from './krumme-kanne-rooms.mjs';

export const KANNE_MODULE_ID = 'modul-1781474092957';
const asset = (folder, id) => `./assets/krumme-kanne/${folder}/${id}.png`;
const portrait = id => asset(['merrik', 'hrolf', 'aedan'].includes(id) ? 'references' : 'portraits', id);
const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const trait = (name, title, detail) => ({ icon: `../IconOrdner/${['gregarious', 'generous', 'just', 'diligent'].includes(name) ? 'Big Traits' : 'Cktraits'}/Trait_${name === 'loyal' ? 'family_first' : name}.png`, title, detail });

function biography(page) {
  const founders = KANNE_PEOPLE.slice(0, 3);
  page.pageTitle = 'Die Krumme Kanne · Haus & Inhaber';
  page.description = paragraphs('Im Osten des Hafenviertels von <strong>Gwynthor</strong>, an der Gasse Richtung Osttor, steht die Krumme Kanne. Ihr krummer Holzkrug verspricht kein vornehmes Haus, sondern eine warme Mahlzeit, ein ordentlich gefülltes Gefäß und Gesellschaft, in der niemand einen alten Feldzug erklären muss.', 'Merrik Trevoryn aus Gwynthor, Hrolf Svathamar aus <strong>Rorikshall in Aldrimar</strong> und der Albe Aedan Dubhdarach aus <strong>Leitheach</strong> fanden vor zwanzig Jahren im Großen Krieg zueinander. Auf dem Schlachtfeld wurden aus drei Männern verschiedener Herkunft Freunde. Als der Krieg 1720 endete, beschlossen sie, gemeinsam etwas aufzubauen, das länger halten sollte als das nächste Lager.', '1722 legten sie ihren Sold zusammen und eröffneten die Kanne. Achtzehn Jahre später gehört die Veteranen- und Söldnerkneipe zu den beliebtesten Häusern Gwynthors. Hier sitzen Heimkehrer neben Hafenarbeitern, reisende Söldner neben Stadtwachen und gelegentlich ein Ritter, der für einen Abend nur Gast sein möchte. Die drei Inhaber bleiben gleichberechtigt; die gewachsene Hausgemeinschaft hält ihnen im Alltag den Rücken frei.');
  page.stats = [['Name', 'Die Krumme Kanne'], ['Art', 'Veteranen- & Söldnerkneipe'], ['Gründung', '1722 · zwei Jahre nach Kriegsende'], ['Standort', 'Östliches Hafenviertel, Gwynthor'], ['Inhaber', founders.map(p => p.name).join(', ')], ['Hausgemeinschaft', 'Drei Familien, Personal und zwei Haustiere'], ['Küche', 'Cenyrisch · Aldrimarisch · Albisch'], ['Gäste', 'Etwa 40 Plätze im Schankraum']];
  const b = page.biography;
  b.biographyTitle = 'Aus Feldkameraden werden Wirte';
  b.biographyText = page.description;
  b.abilitiesTitle = 'Spezielles';
  b.abilities = [
    trait('loyal', 'Kameradschaft vor Herkunft', 'Wer einem anderen aus der Kanne geholfen hat, wird nicht vergessen. Alte Fronten bleiben vor der Tür; gezogene Waffen ebenfalls.'),
    trait('gregarious', 'Ein Platz bei den anderen', 'Neue Gäste werden am Tresen empfangen. Ein Tisch wird geteilt, bevor ein erschöpfter Heimkehrer allein in einer Ecke verschwindet.'),
    trait('generous', 'Die aufgeschriebene Schüssel', 'Mair führt eine kleine, diskrete Liste gestundeter Mahlzeiten. Die Inhaber entscheiden gemeinsam, welche Schulden eines Tages aus dem Buch verschwinden.'),
    trait('just', 'Derselbe Maßstab', 'Adel, Sold und Bekanntschaft erkaufen kein Recht auf grobe Hände oder Demütigungen. Elidyr hört Beschwerden an; Ketil setzt den Hausfrieden durch.'),
    trait('diligent', 'Drei Küchen, ein verlässlicher Herd', 'Tadhg kocht mit zwei festen Gehilfen. Rauch, Kräuter und deftige Sättigung gehören zusammen; jede Portion hat ihren eigenen Grund, auf der Karte zu stehen.'),
    trait('scarred', 'Was vom Krieg bleibt', 'Nicht jede Stille verlangt nach einer Geschichte. Ein geschützter Sitzplatz, ein leiser Empfang und ein unaufgeregter Becher Wasser helfen manchmal mehr als Fragen.')
  ];
  b.extraSections = founders.map(p => ({ position: 'afterIntro', mode: 'text', title: `${p.name} · ${p.age} Jahre`, text: paragraphs(p.biography, p.family) }));
  b.extraSections.push({ position: 'afterWorks', mode: 'text', title: 'Drei Familien unter einem Dach', text: paragraphs('Hrolf heiratete Merriks Schwester <strong>Eirian Trevoryn</strong>. Sie führt als Hausvögtin Personal und Dienstpläne; ihre Kinder sind <strong>Styr (15)</strong> und <strong>Heledd (10)</strong>. Hrolfs Geschwister <strong>Ketil (38)</strong> und <strong>Runa (34)</strong> tragen Verantwortung für Wache und Zimmer.', 'Aedan und <strong>Mair (43)</strong> sind seit 1724 verheiratet. Aus ihrer Ehe stammen <strong>Neifion (14)</strong> und <strong>Eirlys (9)</strong>. Mairs Sohn <strong>Caradog Tonnarth (22)</strong> aus ihrer früheren Verbindung mit Gareth Tonnarth ist Aedans Stiefsohn und der Meier der Kanne.', 'Merrik ist mit <strong>Celyn (41)</strong> verheiratet; ihre Kinder heißen <strong>Cadri (12)</strong> und <strong>Enlli (6)</strong>. Merriks Bruder <strong>Elidyr (35)</strong> führt den Tresen, seine Mutter <strong>Nestwen (68)</strong> hält in der Flickstube die Fäden zusammen. Jüngere Kinder gehören zur Hausgemeinschaft, nicht zum regulären Dienstplan.') });
  b.historyTitle = 'Geschichte & Ruf in Gwynthor';
  b.historyText = paragraphs('Der Große Krieg endete 1720. Während der folgenden zwei Jahre suchten die drei Freunde einen Ort, an dem ihre Ersparnisse und Fähigkeiten zusammenkommen konnten. Merriks Ortskenntnis führte sie zum Fachwerkhaus im östlichen Hafenviertel. Der schiefe Krug wurde nicht ersetzt: Er gab dem neuen Haus seinen Namen.', 'Anfangs bedienten die drei Gründer selbst, trugen Holz und schliefen zwischen ungestrichenen Wänden. Mit Familien und festem Personal wurde daraus eine verlässliche Schenke. Ihren Ruf verdankt sie weniger prunkvollen Festen als warmem Essen, vernünftigen Absprachen und Wirten, die einen schlechten Tag nicht mit schlechtem Charakter verwechseln.', 'Sir Roderic zählt zu ihren treuen Gästen. Auch Hywel Craigddu und andere Waffenknechte Gwynthors kehren nach dem Dienst ein. Vertrauliche Gespräche finden im Hinterzimmer statt; Streit wird nicht als Unterhaltung für den ganzen Schankraum geduldet.');
  b.worksTitle = 'Was das Haus ausmacht';
  b.works = ['Drei gleichberechtigte Teilhaber, die wichtige Entscheidungen gemeinsam treffen.', 'Drei erwachsene Schankmägde mit eigenem Charakter: Delyth, Tesni und Tangwystl.', 'Ein eingespielter Haushalt mit eigenen Verantwortlichen für Schank, Küche, Zimmer, Vorräte und Hausfrieden.', 'Vier Vorspeisen, acht Hauptgerichte und drei wöchentliche Wildspezialitäten.', 'Die Schenke liegt im Osten des Hafenviertels; das Osttor ist die nahe Wegmarke.', 'Ein Ponter meldet den Lieferhof; ein Cenyric-Kater hält trockene Lagerräume frei.'];
  b.trivia = ['Dies ist Sir Roderics Lieblingskneipe!', 'Nestwen hebt aus alter Gewohnheit einen zusätzlichen Teller auf.', 'Elidyr behält Bestellungen besser als Geburtstage; Mair vergisst keines von beidem.', 'Der Hauskater Briwsion hat mehr Sitzplätze als jeder zahlende Stammgast.'];
  b.quotes = ['„Wenn du den Krieg erzählen willst, hören wir zu. Wenn nicht, gibt es trotzdem Suppe.“ — Merrik', '„Drei Männer haben das Haus gekauft. Die anderen haben erst eine Kanne daraus gemacht.“ — Hrolf', '„Eine offene Rechnung ist nicht immer eine unbezahlte Schuld.“ — Mair'];
  b.connectionsTitle = 'Inhaber & Hausgemeinschaft';
  b.connections = [...founders.map(p => ({ type: 'connection', name: p.name, detail: p.role, image: portrait(p.id), imageFormat: 'portrait' })), { type: 'heading', title: 'Verwaltung & Familie', detail: 'Die einzelnen Personalplätze mit Alter, Herkunft und Biografie stehen in den sechs Hierarchiereitern.' }, ...['eirian', 'mair', 'celyn', 'caradog', 'nestwen'].map(id => { const p = KANNE_PEOPLE.find(p => p.id === id); return { type: 'connection', name: p.name, detail: `${p.role} · ${p.family}`, image: portrait(id), imageFormat: 'portrait' }; })];
  b.documents = [{ icon: '../IconOrdner/Cktraits/Trait_education_stewardship_3.png', title: 'Kassenbuch & Hausordnung', text: 'Mair führt Rechnungen und Gästebuch; Eirian Dienstpläne und Löhne. Der Lieferhof gehört zu Caradogs Verantwortung.', link: '' }];
  b.footer = '„Der Krieg machte uns zu Brüdern. Die Kanne gab uns ein Zuhause.“';
}

function hierarchy(page) {
  const people = new Map([...KANNE_PEOPLE, ...KANNE_PETS].map(p => [p.id, p]));
  const node = id => {
    const p = people.get(id);
    if (!p) throw new Error(`Unbekannter Personalplatz: ${id}`);
    return { title: p.name, subtitle: `${p.role} · ${p.age} Jahre${p.culture ? ` · ${p.culture}` : ''}`, portrait: portrait(id), text: paragraphs(...[p.family, p.biography].filter(Boolean)) + (p.bestiary ? `<p><a href="${p.bestiary}" target="_blank" rel="noopener">Bestiarium · ${p.role.split(' · ')[0]}</a></p>` : '') };
  };
  Object.assign(page.hierarchy, {
    layoutMode: 'vertical', treeDisplayMode: 'tabs', portraitScale: 130, cardFontScale: 95,
    emblem: asset('references', 'kanne-schild'), sideImage: asset('references', 'kanne-schild'),
    description: paragraphs('Die Krumme Kanne liegt im Osten des Hafenviertels von Gwynthor. Die drei Inhaber stehen gleichberechtigt nebeneinander. Darunter führen benannte Verantwortliche klar abgegrenzte Bereiche; jeder gezeigte Platz gehört einer konkreten Person.'),
    chartIntro: 'Die Reiter wechseln den angezeigten Bereich innerhalb dieser Seite. Mehrfach gezeigte Angehörige bleiben dieselben Personen. Dienstleitungen teilen Schichten ein; Kinder helfen nur altersgemäß und haben Zeit für Unterricht und Familie.',
    chartTitle: 'Menschen der Krummen Kanne',
    details: [
      { icon: '*', label: 'Gegründet', value: '1722 · nach dem Großen Krieg' },
      { icon: '*', label: 'Standort', value: 'Östliches Hafenviertel, Gwynthor' },
      { icon: '*', label: 'Inhaber', value: 'Merrik, Hrolf & Aedan · gleichberechtigt' },
      { icon: '*', label: 'Hausgemeinschaft', value: `${KANNE_PEOPLE.filter(p => p.age >= 18).length} Erwachsene · 6 Kinder · 2 Tiere` },
      { icon: '*', label: 'Küche', value: '1 Meisterkoch · 2 Kochgehilfen' },
      { icon: '*', label: 'Sicherheit', value: '3 feste Wachplätze · Ponter' },
      { icon: '*', label: 'Schankraum', value: 'Etwa 40 Gäste · wechselnde Schichten' }
    ],
    trees: KANNE_DEPARTMENTS.map(d => ({ id: d.id, label: d.label, parentTreeId: d.id === 'fuehrung' ? '' : 'fuehrung', levels: d.levels.map(([label, ...ids]) => ({ label, nodes: ids.map(node) })) }))
  });
  page.hierarchy.levels = structuredClone(page.hierarchy.trees[0].levels);
}

function menu(page, catalogs) {
  page.tradeCatalog = buildKanneTradeCatalog(page, catalogs);
  page.tradeCatalogPage = true;
  delete page.goodsTablePage;
  delete page.goodsTable;
}

export function completeKrummeKanne(source, catalogs) {
  if (source?.id !== KANNE_MODULE_ID || source.pages?.length !== 10) throw new Error('Die bestehende Krumme Kanne mit zehn Seiten wird benötigt.');
  const e = structuredClone(source);
  biography(e.pages[1]);
  hierarchy(e.pages[2]);
  menu(e.pages[3], catalogs);
  e.pages[0].description = paragraphs('Im <strong>Osten des Hafenviertels von Gwynthor</strong>, an der Gasse Richtung Osttor, steht ein schmales Fachwerkhaus mit einem krummen hölzernen Krug über der Tür. <strong>Die Krumme Kanne</strong> ist eine beliebte Veteranen- und Söldnerkneipe: warmes Licht, kräftige Küche und Wirte, die den Großen Krieg vor zwanzig Jahren selbst erlebt haben.', 'Merrik Trevoryn, Hrolf Svathamar und Aedan Dubhdarach wurden auf dem Schlachtfeld Freunde. Nach dem Frieden beschlossen sie, zusammenzubleiben; 1722 eröffneten sie ihre gemeinsame Schenke. Heute finden hier alte Kameraden, Hafenleute, Reisende und jene Ritter Platz, die einen Abend ohne höfisches Zeremoniell verbringen möchten.');
  e.pages[0].stats = e.pages[0].stats.map(([label, value]) => [label, label === 'Standort' ? 'Östliches Hafenviertel, Gwynthor' : value]);
  for (const room of KANNE_ROOMS) {
    const p = e.pages[room.page];
    p.image = asset('rooms', room.id); p.imageFit = 'cover'; p.imagePosition = 'center'; p.imageWidth = 30; p.imageTall = true;
    delete p.imageSquare;
    if (room.title) p.pageTitle = room.title;
    if (room.intro) p.sessionIntro = room.intro;
  }
  e.image = e.pages[0].image;
  return e;
}
