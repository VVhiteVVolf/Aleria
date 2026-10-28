const portraits = '/Stammbäume/assets/images/portraits';
const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht';
const clergyHref = '/Religionen/klerus/index.html';
const cathedral = {
  label: 'Große Kathedrale der Neun',
  href: '/AleriaAlmanach/AleriaAlmanach.html?entry=gwynthor-kathedrale-der-neun',
  image: '/AleriaAlmanach/assets/gwynthor-cathedral/scenes/kathedrale.png',
};
const patriarch = 'Patriarch von Celtigerns Wacht';
const clergyLink = { label: 'Berufungen und Rangordnungen des Klerus', href: clergyHref };

function lordshipLink(directory, page = `${directory}.html`) {
  return { label: directory, href: encodeURI(`${county}/${directory}/${page}`) };
}

function priestRank(id, title, description, reportsTo) {
  return { id, title, name: '', portrait: '', description, reportsTo, links: [clergyLink] };
}

// The cathedral supplies the local chapter; the clergy codex supplies vocations
// and ranks. The nine prelates are an explicit local exception to five offices.
export default {
  id: 'klerus',
  title: 'Klerus',
  intro: 'Von der Großen Kathedrale der Neun aus führt Patriarch Gwalchgwyn Saethwyr die geistliche Ordnung Celtigerns Wacht. Unmittelbar unter ihm stehen neun gleichrangige hohe Prälaten. Die Gemeinden der Vasallen bleiben in ihren örtlichen Dienstwegen verankert und verantworten ihre geistlichen Angelegenheiten vor der übergeordneten Kirche. Sechs unterschiedliche Berufungen tragen gemeinsam Glauben, Fürsorge, Bildung und Schutz.',
  groups: [
    {
      id: 'klerus-fuehrung',
      title: 'Patriarchat der Grafschaft',
      kind: 'leadership',
      description: 'Die örtliche Spitze ist der Patriarch. Erzpatriarch Yvain Neidr steht auf der Ebene der cenyrischen Landeskirche über ihm.',
      roles: [{
        id: 'klerus-patriarch',
        title: patriarch,
        name: 'Gwalchgwyn Saethwyr',
        portrait: `${portraits}/haus-saethwyr/gwalchgwyn-saethwyr.jpg`,
        description: 'Oberster Geistlicher Celtigerns Wacht und der Gemeinde Gwynthors. Er verantwortet Seelsorge, kirchliche Ordnung und den persönlichen Stab der Kathedrale. Seine neun hohen Prälaten beraten und unterstützen ihn. Der nächste Patriarch geht nach seinem Tod aus ihrem Kreis hervor; ein nicht überliefertes Wahlverfahren wird hier nicht festgelegt.',
        reportsTo: 'Erzpatriarch Yvain Neidr · cenyrische Landeskirche',
        authority: 'Geistliche Leitung der Grafschaft; weltliche Urteile bleiben Sache der zuständigen Gerichtsbarkeit.',
        links: [cathedral, clergyLink],
        connections: [
          { area: 'gerichtsbarkeit', label: 'Buße und weltliches Recht', description: 'Geistliche Begleitung und vereinbarte Buße ergänzen die weltliche Rechtsprechung; der Patriarch übernimmt nicht das Amt des Justiziars.' },
          { area: 'finanzen', label: 'Fürsorge und kirchlicher Haushalt', description: 'Almosen, Versorgung und zugesagte Hilfe werden mit den zuständigen Haushalten abgestimmt.' },
          { area: 'diplomatie', label: 'Gelübde und Vermittlung', description: 'Geistlicher Beistand begleitet Eide, höfische Gespräche und verbindliche Zusagen.' },
        ],
      }],
    },
    {
      id: 'klerus-adjutantur',
      title: 'Persönliche Kanzlei',
      kind: 'adjutant',
      description: 'Ein persönlicher Dienst für die Tagesführung. Er bildet keinen zusätzlichen geistlichen Rang zwischen Patriarch und Prälaten.',
      roles: [{
        id: 'klerus-sekretaer',
        title: 'Persönlicher Sekretär des Patriarchen',
        name: '',
        portrait: '',
        description: 'Führt die persönliche Korrespondenz und unterstützt Termine, Schriftverkehr und die Weitergabe von Aufträgen. Der Dienst gehört zum bereits beschriebenen Kreis der Kirchdiener. Eine Person ist noch nicht benannt; die Kanzleifunktion verleiht weder Priesterweihe noch ein Prälatenamt.',
        reportsTo: patriarch,
        authority: 'Koordination im persönlichen Auftrag; keine eigene geistliche Oberhoheit.',
        links: [cathedral],
      }],
    },
    {
      id: 'klerus-praelaten',
      title: 'Neun hohe Prälaten · gleicher Rang',
      kind: 'core',
      description: 'Neun hohe Geistliche stehen unmittelbar nach dem Patriarchen an der örtlichen Spitze. Peredur ist benannt; acht Plätze bleiben offen. Ihnen sind bislang keine einzelnen Ressorts oder je eine Gottheit zugewiesen.',
      roles: [
        {
          id: 'klerus-peredur',
          title: 'Hoher Prälat · Priester des Vaters',
          name: 'Peredur Eneiniog',
          portrait: `${portraits}/haus-eneiniog/peredur-eneiniog.jpg`,
          description: 'Einer der neun hohen Prälaten Gwalchgwyns und Priester Ordans. Ruhige Güte und maßvolle Autorität prägen seinen Dienst. Sein Prälatenamt ist nicht an einen eigenen Ort gebunden; ein besonderes Ressort ist bisher nicht festgelegt.',
          reportsTo: patriarch,
          links: [cathedral, { label: 'Ordans Klerus', href: '/Religionen/klerus/gottheiten/ordan/index.html' }],
        },
        ...Array.from({ length: 8 }, (_, index) => ({
          id: `klerus-praelat-${index + 2}`,
          title: `Hoher Prälat · Platz ${index + 2}`,
          name: '',
          portrait: '',
          description: 'Einer der neun gleichrangigen hohen Prälaten im unmittelbaren Kreis des Patriarchen. Die Person und ihr besonderer Aufgabenbereich sind noch nicht benannt. Dieser Platz steht auf derselben Ebene wie Peredur Eneiniog.',
          reportsTo: patriarch,
          links: [cathedral],
        })),
      ],
    },
    {
      id: 'klerus-vasallen',
      title: 'Geistliche der Vasallen',
      kind: 'vassals',
      description: 'Die örtlichen Vikare betreuen ihre Gemeinden und Bannkreise. Ihre Zugehörigkeit zu einem Vasallenhof hebt die übergeordnete geistliche Verantwortung gegenüber dem Patriarchen nicht auf. Sie sind keine weiteren Prälaten.',
      roles: [
        {
          id: 'klerus-gwendolyn', title: 'Vikar · Gwendolyns Ufer', name: 'Gwenydd Anghof',
          portrait: 'https://i.imgur.com/yEiU1My.png',
          description: 'Vikar am Hof des Barons von Gwendolyns Ufer. Verantwortet den örtlichen geistlichen Dienst und stimmt übergreifende Angelegenheiten mit dem Patriarchat Celtigerns Wacht ab. Seine genealogische Zuordnung ist nicht abschließend belegt.',
          reportsTo: patriarch, links: [lordshipLink('Baronie Gwendolyns Ufer')],
        },
        {
          id: 'klerus-arthus', title: 'Vikar · Arthus Streben', name: '', portrait: '',
          description: 'Das Vikaramt der Baronie Arthus Streben ist in der örtlichen Ratsordnung vorgesehen. Eine amtierende Person ist noch nicht benannt.',
          reportsTo: patriarch, links: [lordshipLink('Baronie Arthus Streben')],
        },
        {
          id: 'klerus-saethwyr', title: 'Vikarin · Herrschaft der Saethwyr', name: 'Jenniffer Saethwyr',
          portrait: `${portraits}/haus-saethwyr/jenniffer-marwolaeth.jpg`,
          description: 'Vikarin des Ritterfürsten der Saethwyr. Betreut den geistlichen Dienst seiner Herrschaft und bleibt dem übergeordneten Patriarchat verantwortlich.',
          reportsTo: patriarch, links: [lordshipLink('Herrschaft der Saethwyr')],
        },
        {
          id: 'klerus-gafyr', title: 'Vikarin · Herrschaft der Gafyr', name: 'Eleri Gafyr',
          portrait: `${portraits}/haus-gafyr/eleri-marwolaeth.jpg`,
          description: 'Vikarin des Ritterfürsten der Gafyr. Führt die örtliche geistliche Betreuung innerhalb der kirchlichen Ordnung Celtigerns Wacht.',
          reportsTo: patriarch, links: [lordshipLink('Herrschaft der Gafyr')],
        },
        {
          id: 'klerus-wyrm', title: 'Vikar · Herrschaft der Wyrm', name: 'Torri',
          portrait: 'https://i.imgur.com/Vn4wYAD.png',
          description: 'Vikar des Ritterfürsten der Wyrm. Sein Amt ist in der örtlichen Ratsordnung belegt; ein weiterer Familienname wird nicht ergänzt.',
          reportsTo: patriarch, links: [lordshipLink('Herrschaft der Wyrm')],
        },
        {
          id: 'klerus-rhonwen', title: 'Vikar · Rhonwens Tränen', name: '', portrait: '',
          description: 'Das Vikaramt von Rhonwens Tränen ist in der örtlichen Ratsordnung vorgesehen. Eine amtierende Person ist noch nicht benannt.',
          reportsTo: patriarch, links: [lordshipLink('Herrschaft Rhonwens Tränen')],
        },
      ],
    },
    {
      id: 'klerus-priesterordnung',
      title: 'Priesterordnung unterhalb der Prälaten',
      kind: 'service',
      description: 'Die folgenden Karten erklären die kirchlichen Rang- und Ausbildungsstufen. Sie bedeuten nicht, dass genau eine Stelle je Rang existiert. Bischofstitel sind optional und werden nicht als zusätzliche örtliche Pflichtstufen eingeführt.',
      roles: [
        priestRank('klerus-vikar', 'Vikar / Vikarin', 'Leitet eine größere Gemeinde, etwa eine kleinere Stadt mit ihrem Bannkreis. Zahlreiche Diakone können dieser örtlichen Leitung unterstehen.', 'Patriarchat und zuständige hohe geistliche Leitung'),
        priestRank('klerus-diakon', 'Diakon / Diakonin · Pastor', 'Leitet eine Ortskirche und trägt die Verantwortung für deren geistliches Leben.', 'Zuständiger Vikar / zuständige Vikarin'),
        priestRank('klerus-priester', 'Priester / Priesterin', 'Trägt die Priesterweihe und begleitet die Gläubigen bei Gottesdienst, Seelsorge und Lebensübergängen. Pfarrer bezeichnet das Gemeindeamt.', 'Zuständige Ortskirche und Gemeindeleitung'),
        priestRank('klerus-kurator', 'Kurator', 'Unterstützt Liturgie, Fürsorge und Gemeindedienst im Rahmen der örtlichen kirchlichen Aufgaben.', 'Zuständige Priesterschaft'),
        priestRank('klerus-adept', 'Adept', 'Vertieft die geistliche Ausbildung und übernimmt angeleitete Aufgaben.', 'Zuständige geistliche Lehrenden'),
        priestRank('klerus-novize', 'Novize / Novizin', 'Erlernt Liturgie, Lehre und gemeinschaftliche Pflichten. Der Noviziat ist eine Vorstufe der geistlichen Laufbahn.', 'Zuständiges kirchliches Ausbildungshaus'),
        priestRank('klerus-oblat', 'Oblat', 'Bindet sich zunächst an ein kirchliches Haus und erprobt den Dienst.', 'Aufnehmendes kirchliches Haus'),
        priestRank('klerus-laie', 'Laie', 'Lebt im Glauben, ohne ein geistliches Amt zu bekleiden. Daraus entsteht keine dienstliche Unterstellung wie bei einem Amtsträger.', 'Kein geistliches Amt'),
      ],
    },
    {
      id: 'klerus-kaste-priester', title: 'I · Priester', kind: 'service',
      description: 'Den Glauben lehren. Die Priesterordnung trägt die geistliche Leitung; ihre Stufen sind oben erläutert. Diese Berufung ist keine übergeordnete Kaste gegenüber den fünf anderen.',
      roles: [{
        id: 'klerus-gemeindedienst', title: 'Seelsorge und Gemeindedienst', name: '', portrait: '',
        description: 'Priesterinnen und Priester verkünden die Lehren der Göttlichen, begleiten Geburt und Tod, segnen, hören Anliegen und betreuen Gelübde. Haus- und Militärkapläne der Kathedrale sind konkrete Dienste dieser geistlichen Begleitung, keine zusätzliche Kaste.',
        reportsTo: 'Zuständige geistliche Leitung', links: [clergyLink, cathedral],
        connections: [{ area: 'unterhaltung', label: 'Gemeinsame Festtage', description: 'Gottesdienste und weltliche Feiern werden zeitlich und örtlich abgestimmt; die geistliche Verantwortung bleibt bei der Kirche.' }],
      }],
    },
    {
      id: 'klerus-kaste-moenche', title: 'II · Mönche und Nonnen', kind: 'service',
      description: 'Den Glauben bewahren. Profess, klösterlicher Alltag und gemeinsame Arbeit bilden einen eigenen Lebensweg.',
      roles: [{
        id: 'klerus-konvente', title: 'Konvente und monastische Zünfte', name: '', portrait: '',
        description: 'Abt oder Äbtissin leiten eine Abtei, Prior oder Priorin ein kleineres Haus oder den Alltag eines größeren Konvents. Mönche und Nonnen tragen Gebet und regelmäßigen Dienst; Novizen und Oblaten erproben diese Lebensform. Zunftmeister leiten Fachgemeinschaften etwa für Heilkunde, Abschriften oder Gartenbau. Solche Zünfte gehören ausschließlich zur monastischen Kaste.',
        reportsTo: 'Leitung des jeweiligen Konvents', links: [clergyLink],
        connections: [{ area: 'finanzen', label: 'Versorgung kirchlicher Häuser', description: 'Vorräte, Herbergen und praktische Hilfe verbinden den Konvent mit den zuständigen Haushalten und der örtlichen Versorgung.' }],
      }],
    },
    {
      id: 'klerus-kaste-paladine', title: 'III · Paladine', kind: 'service',
      description: 'Den Glauben verteidigen. Ritterlicher Dienst begründet keine allgemeine Gewalt über Priester oder Klöster.',
      roles: [{
        id: 'klerus-angharad', title: 'Paladin im persönlichen Stab des Patriarchen', name: 'Angharad Eneiniog',
        portrait: `${portraits}/haus-eneiniog/angharad-eneiniog.jpg`,
        description: 'Eine von sechs Paladinen des persönlichen Stabes Gwalchgwyns. Ein Hochpaladin führt diesen Stab; Glaubensritter, Schwurknechte, Knappen und Pagen ergänzen ihn. Zwei Militärkapläne begleiten ihn geistlich. Die vollständige örtliche Gliederung steht im Kathedralenmodul.',
        reportsTo: 'Hochpaladin des Patriarchen · unter Gwalchgwyn Saethwyr', links: [cathedral, clergyLink],
        connections: [{ area: 'militaer', label: 'Schutz und Geleit', description: 'Kirchliche Wachen und weltliche Kräfte stimmen Geleit, Reisen und den Schutz gemeinsamer Wege ab. Ihre jeweiligen Befehlsketten bleiben nachvollziehbar.' }],
      }],
    },
    {
      id: 'klerus-kaste-asketen', title: 'IV · Asketen', kind: 'service',
      description: 'Den Glauben verkörpern. Meditation, geregelte Entbehrung und körperliche Schulung bilden einen eigenen geistlichen Weg.',
      roles: [{
        id: 'klerus-asketische-schulen', title: 'Asketische Schulen und Pfade', name: '', portrait: '',
        description: 'Wo eine entsprechende Gemeinschaft besteht, führt ein Meister oder eine Meisterin des Pfades die Schule. Hüter und Lehrmeister tragen Schutz und Unterricht; Asketen, Adepten, Novizen und Anwärter gehören ihrer jeweiligen Ausbildung an. Ein solcher Rang ist kein Paladinrang. Es wird hier weder für jede Gottheit noch für jede Herrschaft ein eigener Orden vorausgesetzt.',
        reportsTo: 'Leitung der jeweiligen asketischen Schule', links: [clergyLink],
      }],
    },
    {
      id: 'klerus-kaste-magister', title: 'V · Magister', kind: 'service',
      description: 'Den Glauben verstehen. Akademische Abschlüsse, Lehraufträge und Leitungsämter unterscheiden sich von Priesterweihe und Gemeindeleitung.',
      roles: [{
        id: 'klerus-lehrhaeuser', title: 'Kirchliche Lehrhäuser und Magisterium', name: '', portrait: '',
        description: 'Lernende, Bakkalare und Magister erwerben und bewahren Wissen. Dozenten und Lehrstuhlinhaber unterrichten; Dekan und Rektor sind akademische Leitungsämter. Ein Abschluss allein macht niemanden zum Geistlichen, und auch Menschen außerhalb des Klerus können an kirchlichen Hochschulen studieren.',
        reportsTo: 'Leitung des jeweiligen Lehrhauses', links: [{ label: 'Das Magisterium', href: `${clergyHref}#magisterium` }],
        connections: [{ area: 'magie', label: 'Wissen und Fachberatung', description: 'Gelehrte und arkane Fachleute tauschen Wissen aus. Der kirchliche Magister ist dadurch weder automatisch Hofmagier noch dem Ratsmagier dienstlich unterstellt.' }],
      }],
    },
    {
      id: 'klerus-kaste-busse', title: 'VI · Büßer und Geläuterte', kind: 'service',
      description: 'Durch den Glauben Erlösung suchen. Genau zwei Stände; die abgeschlossene Buße begründet keinen weiteren Pflichtdienst.',
      roles: [{
        id: 'klerus-arianwen', title: 'Bußgängerin unter persönlicher geistlicher Leitung', name: 'Arianwen Bradrhith',
        portrait: `${portraits}/haus-bradrhith/arianwen-bradrhith.png`,
        description: 'Arianwen befindet sich in laufender Buße unter Gwalchgwyns persönlicher Führung. Bußgänger leisten den individuell vereinbarten Dienst unter Eid und Schweigegelübde. Nach anerkannter Vollendung endet diese Verpflichtung: Geläuterte dürfen als freie Menschen in die Gesellschaft zurückkehren. Eine Bußdauer oder ein lebenslanger Dienst wird nicht ergänzt.',
        reportsTo: 'Gwalchgwyn Saethwyr · persönlicher Bußvater', links: [cathedral, clergyLink],
        connections: [{ area: 'gerichtsbarkeit', label: 'Urteil und Wiedereingliederung', description: 'Anlass, Bedingungen und Abschluss einer Buße werden verantwortet, ohne frühere Urteile umzudeuten oder eine zusätzliche Bestrafung zu erfinden.' }],
      }],
    },
  ],
  sources: [
    cathedral,
    clergyLink,
    { label: 'Die Alerische Kirche', href: '/Religionen/religionen/alerische-kirche/index.html' },
    lordshipLink('Baronie Gwendolyns Ufer'),
    lordshipLink('Baronie Arthus Streben'),
    lordshipLink('Herrschaft der Saethwyr'),
    lordshipLink('Herrschaft der Gafyr'),
    lordshipLink('Herrschaft der Wyrm'),
    lordshipLink('Herrschaft Rhonwens Tränen'),
  ],
};
