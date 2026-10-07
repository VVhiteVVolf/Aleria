const emblem = '../Fraktionen/assets/emblems/gilden/windreiter.webp';
const office = '../IconOrdner/Organisationsicons/Administration.png';
const military = '../IconOrdner/Organisationsicons/Militär.png';

function windreiterHierarchy(title, intro, trees, footer) {
  return { pageTitle: title, hierarchyPage: true, commentSequence: [], hierarchy: {
    layoutMode: 'vertical', treeDisplayMode: 'tabs', cardFontScale: 100, portraitScale: 50, chartScale: 90,
    eyebrow: 'Windreiter · Gildenordnung', subtitle: title, centerLabel: 'Windreiter',
    emblem, sideImage: emblem, organizationTitle: 'Die Windreiter', motto: 'Ehre · Pflichtgefühl · Loyalität',
    description: intro, detailsTitle: 'Zuständigkeit', details: [], chartTitle: title,
    chartIntro: 'Rang, Aufgabe und Zugehörigkeit werden getrennt gelesen. Personenbesetzungen bleiben offen.',
    trees, levels: trees[0].levels, footerNote: footer
  } };
}
const node = (title, text, subtitle = 'Überliefertes Amt · Besetzung offen', portrait = office) => ({ title, text, subtitle, portrait });
const level = (label, ...nodes) => ({ label, nodes });

export function buildWindreiterHierarchies(source) {
  const copy = i => source.blocks[i].html;
  return [
    windreiterHierarchy('Bürokratie · Kasse, Verträge & Gildenhäuser',
      '<p>Die Verwaltung hält die weit verstreuten Banner arbeitsfähig. Der Obergildenkämmerer ist dem Gildenoberhaupt unterstellt, besitzt aber erheblichen eigenen administrativen Einfluss. Örtlich führt der Zerberus das Gildenhaus und wird von Kämmerern unterstützt.</p>', [
        { id: 'verwaltung', parentTreeId: '', label: 'Gildenverwaltung', levels: [
          level('Gesamtverantwortung', node('Gildenoberhaupt', 'Trägt die Gesamtverantwortung; die Verwaltung besitzt einen eigenen Aufgabenbereich.', undefined, emblem)),
          level('Gildenweite Verwaltung', node('Obergildenkämmerer', 'Verantwortet den administrativen Zusammenhang von Kasse, Verträgen und Gildenhäusern. Sein Einfluss begrenzt die alleinige Macht des Gildenoberhaupts.')),
          level('Örtliche Leitung', node('Zerberus', copy(34))),
          level('Laufende Verwaltung', node('Kämmerer', 'Unterstützen den Zerberus bei Verwaltung, Abrechnung und örtlichen Verpflichtungen.'))
        ] },
        { id: 'aufgaben', parentTreeId: 'verwaltung', label: 'Verwaltungsaufgaben', levels: [
          level('Verantwortliche Stelle', node('Kämmerer des Gildenhauses', 'Arbeiten im Auftrag des Zerberus und halten Vereinbarungen nachvollziehbar fest.')),
          level('Aufgabenteilung',
            node('Verträge & Vermittlung', 'Auftrag, Dauer, Sold, Umfang und Auftraggeber festhalten; Aushänge pflegen und passende Kräfte vermitteln.', 'Ausgearbeiteter Aufgabenbereich'),
            node('Sold & Versorgung', 'Soldlisten, Vorräte, Ausrüstung und Ablösungen abrechnen; Engpässe früh melden.', 'Ausgearbeiteter Aufgabenbereich'),
            node('Register & Berichte', 'Mitglieder, Zugehörigkeiten, Aufträge und Rückmeldungen führen; Berichte an die zuständige Führung weitergeben.', 'Ausgearbeiteter Aufgabenbereich'))
        ] }
      ], 'Obergildenkämmerer, Zerberus und Kämmerer sind belegt. Die Aufgabenteilung erläutert ihre Arbeit; sie schafft keine zusätzlichen Dienstgrade.'),
    windreiterHierarchy('Führungsränge & Rollen',
      '<p>Die fünf Kommandanten werden in der Überlieferung auch Hauptmänner genannt. Bannerführer führen die einzelnen Banden; Champions sind persönliche Vertrauensstellen. Ein Haudegen ist ein verdientes ehemaliges Führungsmitglied und kein zusätzlicher Kommandant.</p>', [
        { id: 'fuehrung', parentTreeId: '', label: 'Führung', levels: [
          level('Gildenspitze', node('Gildenoberhaupt', copy(29), undefined, emblem)),
          level('Fünf Hauptbanner', node('Kommandant / Hauptmann', copy(30), undefined, military)),
          level('Banden & einzelne Banner', node('Bannerführer', copy(32), undefined, military))
        ] },
        { id: 'vertrauen', parentTreeId: 'fuehrung', label: 'Champions & Stellvertretung', levels: [
          level('Persönliche Bindung', node('Hauptmann oder Bannerführer', 'Jedem dieser Führenden sind zwei persönliche Champions unmittelbar zugeordnet.', undefined, military)),
          level('Zwei Champions', node('Rechte Hand', copy(33), 'Champion · persönliche Vertrauensrolle', military),
            node('Linke Hand', 'Zweiter persönlicher Champion: Leibschutz, Beratung, Stellvertretung und besondere militärische Aufträge im unmittelbaren Dienst des Führenden.', 'Champion · persönliche Vertrauensrolle', military))
        ] },
        { id: 'veteranen', parentTreeId: 'fuehrung', label: 'Verdiente ehemalige Führung', levels: [
          level('Sonderrang', node('Haudegen', copy(31), 'Überlieferter Sonderrang', military)),
          level('Mögliche Aufgaben', node('Ausbildung & Beratung', 'Erfahrung an jüngere Mitglieder weitergeben oder bei Verwaltungs- und Strategiefragen unterstützen. Ein konkreter Auftrag bestimmt die Verantwortung.', 'Rollen eines Haudegens', office))
        ] }
      ], 'Wahlberechtigt sind Mitglieder ab Beschützer. Die Vorlage beschreibt den genauen Wahlgang uneindeutig; hier wird keine zusätzliche Wahlordnung festgelegt. Leutnants werden historisch genannt, aber nicht als gesondertes aktuelles Führungsamt eingeordnet.'),
    windreiterHierarchy('Klassische Kriegerränge',
      '<p>Die reguläre Laufbahn beschreibt Erfahrung und Vertrauen innerhalb der Gilde. Sie verleiht nicht automatisch ein Führungsamt. Der Rang Beschützer und das Wahlrecht ab diesem Rang sind belegt; die übrige Rangfolge ist eine ergänzende Ausarbeitung für das bisher leere Register.</p>', [
        { id: 'krieger', parentTreeId: '', label: 'Reguläre Laufbahn', levels: [
          level('Langjährige Bewährung', node('Veteran', 'Trägt Erfahrung aus vielen Diensten, begleitet schwierige Aufträge und unterstützt die Ausbildung. Wahlberechtigt; kein automatisches Bannerkommando.', 'Ergänzter regulärer Rang', military)),
          level('Vertrauen & Mitbestimmung', node('Beschützer', 'Bewährtes Gildenmitglied. Ab diesem Rang besteht das in der Überlieferung genannte Wahlrecht bei der Bestimmung des Gildenoberhaupts.', 'Überlieferter Rang · Wahlrecht', military)),
          level('Voller Dienst', node('Windreiter', 'Ausgebildeter Söldner im regulären Schutz- und Geleitdienst. Arbeitet unter der zuständigen Einsatzführung oder nimmt im erlaubten Rahmen freie Aufträge an.', 'Ergänzter regulärer Rang', military)),
          level('Aufnahme & Ausbildung', node('Rekrut', 'Lernt Wachwechsel, Ausrüstungspflege, Gildengepflogenheiten und verlässliches Zusammenwirken unter Anleitung erfahrener Mitglieder.', 'Ergänzter regulärer Rang', military))
        ] }
      ], 'Ergänzender Rangentwurf: Rekrut → Windreiter → Beschützer → Veteran. Haudegen bleibt ein Sonderrang ehemaliger Führung; Champion, Zerberus und Bannerführer bleiben eigene Rollen.')
  ];
}

export function buildWindreiterBannerHierarchy(source) {
  const art = name => `./public/assets/windreiter/references/${name}.png`;
  const banner = (title, region, file) => node(title, `Zugehörigkeit: ${region}. Besetzungen, Geschichte und Standorte werden in den jeweiligen Verbandsmodulen geführt.`, 'Überlieferter Verband', art(file));
  return windreiterHierarchy('Banner & Unterbanden', source.blocks[36].html + source.blocks[37].html, [
    { id: 'hauptbanner', parentTreeId: '', label: 'Hauptbanner', levels: [
      level('Anführerbanner · Blutstadt', node('Kettensprenger', source.blocks[35].html, 'Banner des Oberkommandanten', art('hYDXEHa'))),
      level('Fünf territoriale Hauptbanner', banner('Schwarzfische', 'Estryll', 'xYZyjk3'), banner('Windkriecher', 'Lothir', 'j7kdWaF'), banner('Schattenhunde', 'Tirnara', 'iKmfEUQ'), banner('Nagerlegion', 'Aldervan Nord', 'QAH2omf'), banner('Blutadler', 'Aldervan Süd', 'sgOHGlu'))
    ] },
    { id: 'estryll', parentTreeId: 'hauptbanner', label: 'Estryll · Banden', levels: [
      level('Hauptbanner', banner('Schwarzfische', 'Estryll', 'xYZyjk3')),
      level('Banden im regionalen Register', banner('Stollenbrüder', 'Estryll', 'sUclfSI'), banner('Schredderstaffel', 'Estryll', 'R0PSiop'), banner('Höllenreiter', 'Estryll', 'hkxJGZD'), banner('Klingensturz', 'Estryll', 'cu1UUzB'), banner('Sturmreiter', 'Estryll', 'kloZ4RG'))
    ] },
    { id: 'lothir', parentTreeId: 'hauptbanner', label: 'Lothir · Banden', levels: [
      level('Hauptbanner', banner('Windkriecher', 'Lothir', 'j7kdWaF')),
      level('Bande im regionalen Register', banner('Sumpfstreiter', 'Lothir', 'v6mkTkf'))
    ] },
    { id: 'tirnara', parentTreeId: 'hauptbanner', label: 'Tirnara · Banden', levels: [
      level('Hauptbanner', banner('Schattenhunde', 'Tirnara', 'iKmfEUQ')),
      level('Banden im regionalen Register', banner('Dschungelpirscher', 'Tirnara', 'ROIyUtf'), banner('Schuppenschar', 'Tirnara', 'WYdt7Ab'))
    ] },
    { id: 'aldervan', parentTreeId: 'hauptbanner', label: 'Aldervan · Banden', levels: [
      level('Nord & Süd', banner('Nagerlegion', 'Aldervan Nord', 'QAH2omf'), banner('Blutadler', 'Aldervan Süd', 'sgOHGlu')),
      level('Regionale Zuordnung; Nord/Süd offen', banner('Langohrbande', 'Aldervan', 'KklNJ67'), banner('Stachelbund', 'Aldervan', 'y5ZjTcr'))
    ] }
  ], 'Sundara ist in der Vorlage gestrichen und erhält kein aktives Hauptbanner. Die regionalen Bandenlisten benennen noch keine einzelnen Standorte oder Personen. Die Zuordnung der Aldervan-Banden zu Nord oder Süd bleibt offen.');
}
