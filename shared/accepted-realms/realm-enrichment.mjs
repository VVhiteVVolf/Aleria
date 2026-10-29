import { goldmundContext } from '../../Kontinente/modules/goldmund/goldmund-context.mjs';

// Accepted editorial corrections take precedence over older workshop captions.
export function enrichRealm(source, legacy) {
  const realm = structuredClone(source);
  for (const house of realm.houses) if (house.warrior?.classId && !house.warrior.classHref && ['goldmund', 'aldingen', 'weisenfluh', 'moinneach'].includes(realm.id)) {
    house.warrior.classHref = `/Klassenordner/Klassenseite.html#klasse-${realm.id === 'aldingen' ? 'goldmund' : realm.id}-${house.warrior.classId}`;
  }
  if (realm.id === 'goldmund') for (const seat of realm.settlements) seat.regionName = realm.design.regionNames?.[seat.region] || seat.name;
  if (realm.id === 'goldmund') realm.context = {
    introduction: goldmundContext.introduction.replace('das Fürstentum', 'das Herzogtum'),
    history: goldmundContext.sections.slice(0, 2).map(s => ({ title: s.title, text: s.paragraphs.join('\n\n') })),
    themes: goldmundContext.sections.slice(2).map(s => ({ title: s.title, text: s.paragraphs.join('\n\n') })),
  };
  if (realm.id === 'weisenfluh') {
    realm.context = {
      introduction: 'Weisenfluh war einst das albische Fürstentum Bànneach, das weiße oder helle Land. Heute führt das Haus Goldkranz die Krone des Erlenkönigs. Fünf Provinzen verbinden die königliche Domäne und die Freiherrentümer mit den örtlichen Junkern und Ministerialen.',
      history: [{ title: 'Aus Bànneach wurde Weisenfluh', text: 'Über Jahrhunderte wirkten die Kaiserstadt, die heutige Blutstadt, sowie Aldingen und Goldmund auf das Land ein. Besonders die Eliten öffneten sich ihrem Einfluss. Sprache, höfisches Selbstverständnis und Sitten wandelten sich; die führende Aristokratie versteht sich heute als weisenfluhisch.' }],
      themes: [{ title: 'Krone und alte Clans', text: 'Der Erlenkönig entspricht seiner tatsächlichen Machtstellung nach eher einem Fürsten. Alte albische Clans bestehen weiterhin: Einige passten ihre Namen und Lebensweisen an, andere bewahrten ihre Herkunft und verloren in langen Konflikten Besitz und Bedeutung.' },
        { title: 'Hof und Rittertum', text: 'Weisenfluh ist für höfische Pracht bekannter als für sein Kriegertum. Feine Stoffe, elegante Harnische und individuelle Helme prägen seine Ritter. Ährensass ist ein gesondert verpachtetes geistliches Ordensgebiet.' }],
    };
    for (const r of realm.regions) {
      if (r.id === 'ewiggruen') { r.ruler = 'rosenbluth'; r.description = 'Das Freiherrentum der Rosenblüth mit dem Junkersitz Mährenfeld.'; }
      if (r.id === 'weisshort') r.name = 'Weishort';
      if (r.id === 'weisslauf') r.name = 'Weislauf';
    }
    realm.settlements.push(...legacy.settlements);
    realm.houses.push(...legacy.houses);
  }
  if (realm.id === 'moinneach') realm.context = {
    introduction: 'Moinneach ist ein gewaltiges Sumpfland. Mangrovenwurzeln, schwarzes Wasser, Pilze und versunkene Wege prägen seine gefährliche Landschaft. In Gergonax residieren die Tir An Cethrenn als Fürstenclan; die An Barrex dienen ihnen dort als Lairds.',
    history: [], themes: [{ title: 'Bewohnbare Inseln im Sumpf', text: 'Jeder bewohnbare Platz ist dem Sumpf mühsam abgerungen. Grobe, abgenutzte Banner greifen diesen Alltag auf. Zehn Stadtgebiete bilden die örtliche Gliederung; die Wege zwischen ihnen folgen den wenigen festen Übergängen und Wasserläufen.' }],
  };
  // These were layout labels, never a source for the accepted western titles.
  const rename = text => String(text || '').replaceAll('Fürstliche Grafschaft', 'Herzogliche Grafschaft').replaceAll('Fürstliche Baronie', 'Herzogliche Eigenherrschaft').replaceAll('Fürstliche Residenz', 'Herzogliche Residenz').replaceAll('Fürstentum Goldmund', 'Herzogtum Goldmund').replaceAll('dem Fürstentum', 'dem Herzogtum');
  if (realm.id === 'goldmund') for (const list of [realm.regions, realm.settlements]) for (const item of list) {
    for (const key of ['name', 'kind', 'description']) if (item[key]) item[key] = rename(item[key]);
  }
  return realm;
}
