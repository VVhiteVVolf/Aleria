import { KANNE_PEOPLE, KANNE_PETS, KANNE_DEPARTMENTS } from './krumme-kanne-roster.mjs';
import { buildKanneTradeCatalog } from './krumme-kanne-trade-catalog.mjs';
import { KANNE_ROOMS } from './krumme-kanne-rooms.mjs';
import { expandKanneGuestRegister } from './krumme-kanne-guests.mjs';
import { withHouseholdWorkplaceLinks } from '../gwynthor-heime/household-workplaces.mjs';

export const KANNE_MODULE_ID = 'modul-1781474092957';
const asset = (folder, id) => `./assets/krumme-kanne/${folder}/${id}.png`;
const portrait = id => KANNE_PEOPLE.find(p => p.id === id)?.portrait || asset(['merrik', 'hrolf', 'aedan'].includes(id) ? 'references' : 'portraits', id);
const paragraphs = (...texts) => texts.map(text => `<p>${text}</p>`).join('');
const trait = (name, title, detail) => ({ icon: `../IconOrdner/${['gregarious', 'generous', 'just', 'diligent'].includes(name) ? 'Big Traits' : 'Cktraits'}/Trait_${name === 'loyal' ? 'family_first' : name}.png`, title, detail });

function biography(page) {
  const founders = KANNE_PEOPLE.slice(0, 3);
  page.pageTitle = 'Die Krumme Kanne · Haus & Inhaber';
  page.description = paragraphs('Im Osten des Hafenviertels von <strong>Gwynthor</strong> verspricht der krumme Holzkrug über der Tür warmes Essen und gute Gesellschaft. Die Krumme Kanne ist bei Veteranen, Söldnern und Hafenleuten gleichermaßen beliebt.', 'Merrik Trevoryn aus Gwynthor, Hrolf Svathamar aus <strong>Rorikshall in Aldrimar</strong> und der Albe Aedan Dubhdarach aus <strong>Leitheach</strong> wurden vor zwanzig Jahren auf dem Schlachtfeld Freunde. Nach dem Großen Krieg legten sie ihren Sold zusammen und eröffneten 1722 die Schenke. Bis heute führen die drei Kameraden das Haus gemeinsam.');
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
  b.extraSections = founders.map(p => ({ position: 'afterIntro', mode: 'text', title: `${p.name} · ${p.age} Jahre`, text: paragraphs(p.biography) }));
  b.extraSections.push({ position: 'afterWorks', mode: 'text', title: 'Ein Haus voller Leben', text: paragraphs('Am Tresen gibt <strong>Elidyr</strong> den Takt vor, während <strong>Eirian</strong> die Schichten zusammenhält. <strong>Mair</strong> wacht über die Kasse und <strong>Celyn</strong> darüber, dass weder die Küche noch die Wäschetruhe leer bleibt.', 'Im Hof lässt <strong>Gorwyst</strong> Fässer rollen. <strong>Runa</strong> hält die Kammern in Ordnung, <strong>Tadhg</strong> den Herd in Gang und <strong>Ketil</strong> mit seinen Wachen die Tür frei. Dazwischen finden die Kinder immer einen Weg zu Nestwens Fensterplatz oder zum Hauskater.', 'Mairs ältester Sohn <strong>Caradog Tonnarth</strong> fährt als Schreiber auf der <em>Tiefenwyrm</em>. Wenn er in Gwynthor ist, bringt er Nachrichten vom Hafen mit an den Familientisch.') });
  b.historyTitle = 'Geschichte & Ruf in Gwynthor';
  b.historyText = paragraphs('Merrik fand das Fachwerkhaus; der schiefe Krug hing bereits über der Tür. Anfangs schenkten die drei Wirte selbst aus und schliefen zwischen ungestrichenen Wänden. Heute kommen Sir Roderic, Hywel Craigddu und viele alte Waffenknechte wegen der kräftigen Küche und des vertrauten Empfangs. Wer Ruhe braucht, findet sie im Hinterzimmer. Wer Streit sucht, lernt Ketil kennen.');
  b.worksTitle = 'Was das Haus ausmacht';
  b.works = ['Alte Kameraden, Hafenleute und reisende Söldner teilen sich die Tische.', 'Delyth, Tesni und Tangwystl kennen ihre Stammgäste beim Namen.', 'Tadhgs Küche duftet nach Kräutern, dunklem Bier und offenem Feuer.', 'An den angekündigten Wildtagen wird es früh voll.', 'Über der Tür hängt noch immer der krumme Holzkrug.', 'Carreg bewacht den Hof; Briwsion beansprucht die warmen Plätze.'];
  b.trivia = ['Dies ist Sir Roderics Lieblingskneipe!', 'Nestwen hebt aus alter Gewohnheit einen zusätzlichen Teller auf.', 'Elidyr behält Bestellungen besser als Geburtstage; Mair vergisst keines von beidem.', 'Der Hauskater Briwsion hat mehr Sitzplätze als jeder zahlende Stammgast.'];
  b.quotes = ['„Wenn du den Krieg erzählen willst, hören wir zu. Wenn nicht, gibt es trotzdem Suppe.“ — Merrik', '„Drei Männer haben das Haus gekauft. Die anderen haben erst eine Kanne daraus gemacht.“ — Hrolf', '„Eine offene Rechnung ist nicht immer eine unbezahlte Schuld.“ — Mair'];
  b.connectionsTitle = 'Inhaber & Hausgemeinschaft';
  b.connections = [...founders.map(p => ({ type: 'connection', name: p.name, detail: p.role, image: portrait(p.id), imageFormat: 'portrait' })), { type: 'heading', title: 'Menschen des Hauses', detail: '' }, ...['eirian', 'mair', 'celyn', 'gorwyst', 'nestwen', 'caradog'].map(id => { const p = KANNE_PEOPLE.find(p => p.id === id); return { type: 'connection', name: p.name, detail: p.role, image: portrait(id), imageFormat: 'portrait' }; })];
  b.documents = [{ icon: '../IconOrdner/Cktraits/Trait_education_stewardship_3.png', title: 'Kassenbuch & Hausordnung', text: 'Mairs Bücher liegen neben der Kasse. Wer eine Zeche stunden lassen muss, spricht leise mit ihr.', link: '' }];
  b.footer = '„Der Krieg machte uns zu Brüdern. Die Kanne gab uns ein Zuhause.“';
}

function hierarchy(page) {
  const people = new Map([...KANNE_PEOPLE, ...KANNE_PETS].map(p => [p.id, p]));
  const node = id => {
    const p = people.get(id);
    if (!p) throw new Error(`Unbekannter Personalplatz: ${id}`);
    return { title: p.name, subtitle: `${p.role} · ${p.age} Jahre${p.culture ? ` · ${p.culture}` : ''}`, portrait: portrait(id), text: paragraphs(p.biography) + (p.bestiary ? `<p><a href="${p.bestiary}" target="_blank" rel="noopener">Bestiarium · ${p.role.split(' · ')[0]}</a></p>` : '') };
  };
  Object.assign(page.hierarchy, {
    layoutMode: 'vertical', treeDisplayMode: 'tabs', portraitScale: 130, cardFontScale: 95,
    emblem: asset('references', 'kanne-schild'), sideImage: asset('references', 'kanne-schild'),
    description: paragraphs('Drei Wirte halten die Kanne zusammen; Eirian hält sie auf Trab. Am Tresen, am Herd und in den Kammern kennt jeder seine Arbeit. Wenn der Abend laut wird, greifen die Handgriffe ineinander.'),
    chartIntro: 'Vom ersten Feuer in Tadhgs Herd bis zu Rhunels letzter Runde durch den Hof ist immer jemand auf den Beinen.',
    chartTitle: 'Menschen der Krummen Kanne',
    details: [
      { icon: '*', label: 'Gegründet', value: '1722 · nach dem Großen Krieg' },
      { icon: '*', label: 'Standort', value: 'Östliches Hafenviertel, Gwynthor' },
      { icon: '*', label: 'Inhaber', value: 'Merrik, Hrolf & Aedan · gleichberechtigt' },
      { icon: '*', label: 'Hausgemeinschaft', value: `${KANNE_PEOPLE.filter(p => p.resident !== false && p.age >= 18).length} Erwachsene · 6 Kinder · 2 Tiere` },
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
  expandKanneGuestRegister(e.pages[4]);
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
  return withHouseholdWorkplaceLinks(e);
}
