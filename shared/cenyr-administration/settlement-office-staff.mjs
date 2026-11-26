const group = (id, title, icon, posts) => ({ id, title, icon, posts });

function section({ id, title, icon, posts }, reportsTo, town) {
  return {
    id, title, icon, repeatableHere: true,
    slots: posts.flatMap(([id, title, icon, description, count]) => {
      const total = Array.isArray(count) ? count[Number(town)] : count;
      const role = { title, icon, description, reportsTo };
      if (!total) return [{ id, ...role }];
      return Array.from({ length: total }, (_, index) => ({
        id: `${id}-${index + 1}`, ...role, kind: 'service', templateId: `r-${id}`,
      }));
    }),
  };
}

const civic = [group('ortskanzlei', 'Kanzlei der Ortsleitung', 'quill', [
  ['sekretaer', 'Sekretär der Ortsleitung', 'quill', 'Bereitet Termine und Eingaben vor und hält Beschlüsse zur Wiedervorlage bereit.'],
  ['leitungsschreiber', 'Schreiber der Ortsleitung', 'records', 'Fertigt Bescheide aus und führt die Register über eingehende Anliegen.', [1, 2]],
  ['amtsbote', 'Amtsbote', 'courier', 'Überbringt Bescheide, Vorladungen und die Schreiben der Ortsleitung.', 1],
])];

const watch = [
  group('garnisonsfuehrung', 'Wachverteidigung & Garnison', 'watch', [
    ['waffenmeister', 'Waffenmeister der Wache', 'arms', 'Verantwortet Waffen und Rüstzeug der Wache und leitet die Ausbildung am Gerät.'],
    ['wachvogt', 'Wachvogt', 'watch', 'Ordnet Wachwechsel, Dienstlisten und die Besetzung der örtlichen Wachposten.'],
    ['leutnant', 'Leutnant der Wache', 'command', 'Führt einen Wachzug und vertritt den Hauptmann im zugewiesenen Dienst.', [1, 2]],
  ]),
  group('wachdienst', 'Wachmannschaft und Dienste', 'watch', [
    ['torwache', 'Torwächter', 'watch', 'Bewacht den zugeteilten Zugang und meldet besondere Vorkommnisse.', [1, 2]],
    ['waechter', 'Wächter der Ortswache', 'watch', 'Versieht Wach- und Streifendienst im Ort und seinem Bannkreis.', [2, 4]],
    ['wachtbote', 'Wachbote', 'courier', 'Überbringt Wachmeldungen zwischen den Diensten des Ortes.', 1],
  ]),
];

const church = [group('kirchendienst', 'Sakristei und Kirchendienst', 'faith', [
  ['sakristan', 'Sakristan', 'faith', 'Verwahrt die liturgischen Geräte und bereitet die Gottesdienste vor.'],
  ['kirchenschreiber', 'Kirchenschreiber', 'quill', 'Führt das örtliche Kirchenbuch und fertigt Schreiben der geistlichen Leitung aus.'],
  ['akolyth', 'Akolyth', 'faith', 'Unterstützt den liturgischen Dienst der Ortskirche.', [1, 2]],
])];

const finance = [
  group('rechnung', 'Rechnung und Abgaben', 'money', [
    ['rentamtsschreiber', 'Rentamtsschreiber', 'quill', 'Führt die örtlichen Einnahme- und Ausgabebücher und bereitet die Abrechnung vor.', [1, 2]],
    ['abgabeneinnehmer', 'Abgabeneinnehmer', 'money', 'Erfasst fällige Geld- und Naturalabgaben und quittiert ihre Ablieferung.', [1, 2]],
    ['steuereinnehmer', 'Steuereinnehmer', 'records', 'Erhebt die ausgewiesenen Steuern und meldet Rückstände an den Rentmeister.', 1],
  ]),
  group('zoll', 'Zoll und Warenlisten', 'toll', [
    ['zoellner', 'Zöllner', 'toll', 'Erhebt den Zoll am zugewiesenen Übergang und rechnet die Einnahmen mit dem Rentmeister ab.', [1, 2]],
  ]),
];

const civicClerks = [group('schriftverkehr', 'Schriftverkehr und Siegel', 'quill', [
  ['kanzleigehilfe', 'Kanzleigehilfe', 'records', 'Fertigt Abschriften der Ratsbeschlüsse und der ausgehenden Amtsschreiben an.', [1, 2]],
  ['siegelwart', 'Siegelwart', 'records', 'Verwahrt das Ortssiegel und führt Buch über seinen Gebrauch.'],
  ['ortsbote', 'Ortsbote', 'courier', 'Überbringt Ratsbriefe an Nachbarorte und an die Herrschaft.', 1],
])];

const byOffice = {
  wache: watch,
  diakon: church,
  burgkaplan: church,
  gericht: [group('gerichtsstube', 'Gerichtsstube', 'justice', [
    ['gerichtsschreiber', 'Gerichtsschreiber', 'quill', 'Protokolliert Anhörungen, Urteile und Fristen.'],
    ['schoeffe', 'Schöffe', 'judgment', 'Wirkt als Beisitzer bei den örtlichen Verhandlungen mit.', [1, 2]],
    ['gerichtsbote', 'Gerichtsbote', 'courier', 'Stellt Vorladungen und Entscheidungen zu.', 1],
  ])],
  kasse: finance,
  meldestelle: [group('meldedienst', 'Örtlicher Meldedienst', 'secrecy', [
    ['meldeschreiber', 'Meldeschreiber', 'quill', 'Ordnet eingegangene Berichte und hält die Übergaben fest.'],
    ['ermittler', 'Ermittler', 'inquiry', 'Klärt besondere Vorkommnisse im Auftrag des Zellenführers.', [1, 2]],
    ['kundschafter', 'Kundschafter', 'scouting', 'Berichtet über bemerkenswerte Veränderungen im Umland.', 1],
    ['kurier', 'Kurier der Meldestelle', 'courier', 'Überbringt die Meldungen an die zuständige Stelle.', 1],
  ])],
  kanzlei: civicClerks,
  buergermeister: civic,
  ortsbarde: [group('festdienste', 'Feste und Spielleute', 'music', [
    ['festordner', 'Festordner', 'hospitality', 'Stimmt Auftritte, Proben und Plätze für öffentliche Feste ab.'],
    ['spielmann', 'Spielmann', 'music', 'Wirkt bei Festen und Feiern des Ortes mit.', [1, 3]],
    ['ausrufer', 'Ausrufer', 'proclamation', 'Kündigt Feste und öffentliche Auftritte an.', 1],
  ])],
  sakristan: [group('sakristei', 'Sakristeidienst', 'faith', [
    ['kirchendiener', 'Kirchendiener', 'faith', 'Bereitet den Kirchenraum vor und pflegt das Kirchengerät.', 1],
  ])],
  vogt: [group('kirchenvogtei', 'Schriftverkehr der Kirchenvogtei', 'diplomacy', [
    ['vogtschreiber', 'Schreiber der Kirchenvogtei', 'quill', 'Führt Urkunden, Eingaben und die Korrespondenz mit der Herrschaft.'],
    ['kirchenbote', 'Kirchenbote', 'courier', 'Überbringt Schreiben zwischen Gemeinschaft und Herrschaft.', 1],
  ])],
  rechnung: [group('pachtfinanzen', 'Pachtrechnung und Kasse', 'money', [
    ['pachtschreiber', 'Schreiber der Pachtrechnung', 'quill', 'Führt Einnahmen, Zahlungsfristen und die Belege der Pachtsiedlung.'],
    ['kassengehilfe', 'Kassengehilfe', 'money', 'Erfasst Zahlungen und bereitet Abrechnungen für Gilde und Verpächter vor.', 1],
  ])],
  markt: [group('marktaufsicht', 'Marktaufsicht', 'guild', [
    ['marktschreiber', 'Marktschreiber', 'quill', 'Führt das Verzeichnis der Stände und der fälligen Marktgebühren.'],
    ['masspruefer', 'Maß- und Gewichtsprüfer', 'inquiry', 'Prüft Maße, Waagen und Gewichte am Markt.'],
    ['marktdiener', 'Marktdiener', 'guild', 'Weist Stände zu und unterstützt die Marktaufsicht.', 1],
  ])],
};

const headStaff = {
  civic,
  church: [group('geistliche-kanzlei', 'Kanzlei und geistlicher Dienst', 'faith', [
    ['kirchenschreiber', 'Kirchenschreiber', 'quill', 'Führt Urkunden, das Kirchenbuch und die Schreiben der geistlichen Obrigkeit.'],
    ['akolyth', 'Akolyth', 'faith', 'Unterstützt den liturgischen Dienst der Gemeinschaft.', 2],
  ])],
  guild: [group('pachtkanzlei', 'Pachtkanzlei', 'guild', [
    ['stellvertreter', 'Stellvertretung der Pachtverwaltung', 'coordination', 'Führt die laufenden Geschäfte bei Abwesenheit der Pachtleitung.'],
    ['pachtbote', 'Pachtbote', 'courier', 'Überbringt die Schreiben der Pachtleitung an Gilde und Obrigkeit.', 1],
  ])],
  military: watch,
};

export function settlementOfficeStaff({ kind, label, type }, post, retained = []) {
  const profile = kind === 'military' && post.authority?.role === 'burgverwalter' ? 'civic' : kind;
  const groups = post.id === 'leitung' ? headStaff[profile] : byOffice[post.id];
  const substantial = label === 'Stadtherrschaft' || /burg|festung|kastell|garnison/iu.test(type);
  return groups.map((source, index) => {
    const group = section(source, `der Amtsleitung · ${post.title}`, substantial);
    if (index === 0 && retained.length) {
      const lieutenant = retained.find(slot => slot.id === 'stellvertretung');
      const posts = lieutenant ? group.slots.filter(slot => slot.id !== 'leutnant-1').map(slot => slot.templateId === 'r-leutnant'
        ? { ...slot, title: lieutenant.title, description: lieutenant.description } : slot) : group.slots;
      group.slots = [...retained, ...posts];
    }
    return group;
  });
}
