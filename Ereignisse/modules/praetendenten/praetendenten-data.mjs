// Navigation for the agreed editorial edition. Archived originals stay separate.
// Approximate dates remain approximate; reading views do not write calendar state.
export const WAR = Object.freeze({
  id:'krieg-der-praetendenten',title:'Der Krieg der Prätendenten',years:'1627–1647',
  root:'Ereignisse/Kriege/krieg-der-praetendenten/',source:'source-01',
  image:'thron-1627-v1.webp',imageAlt:'Eine Krone auf dem leeren Widderthron, dahinter grüne, rote und blaue Banner.',
  summary:'Zwanzig Jahre Bürgerkrieg. Drei Brüder beanspruchen die Krone, während Aldrimar an ihren Ansprüchen zerbricht.',
  outcome:'Galmar Vaeren wird gegen Ende des Krieges Hochkönig. Die Vaeren stehen vor der beinahe vollständigen Auslöschung; die Herdwächter werden gegründet.'
});

export const FACTIONS = Object.freeze([
  {id:'gruene',source:'source-04',title:'Die Grünen',epithet:'Die Traditionalisten',leader:'Arn Vaeren',person:'arn-vaeren',birth:1608,age:19,
    image:'arn-1627-v1.webp',file:'fraktionen/die-gruenen.html',color:'green',
    seat:'Heldenwacht und Rorikshall',strength:'Früh rund 11.000 Mann Landaufgebot, dazu 2.700 Seeleute; später Landheer unter 4.000 und wieder bis 8.000',
    aim:'Arn als König einsetzen',support:'Sturmgeborene, Frostauge und Varulv; später Unterstützung durch die Trachwyll',
    summary:'Arn sichert sich die Hauptstadt. Die Grünen stützen ihren Anspruch auf die alten Clans, militärische Stärke und die überlieferte Ordnung.',
    ending:'Militärischer Sieg, doch Arn stirbt vor seiner Krönung.'},
  {id:'rote',source:'source-03',title:'Die Roten',epithet:'Die Kapitalisten',leader:'Sinding Vaeren',person:'sinding-vaeren',birth:1611,age:16,
    image:'sinding-1627-v1.webp',file:'fraktionen/die-roten.html',color:'red',
    seat:'Moortal und Wolfsklamm',strength:'Anfangs 4.000–6.000, später durch Söldner verstärkt',
    aim:'Sinding als König einsetzen; mehr Einfluss für Gilden und die Münze',support:'Varangr, Ragnulf, Königinmutter Elisef und die Klingende Münze; später Söldnerkompanien',
    summary:'Sinding und Elisef finden Rückhalt bei den Varangr. Finanzielle Macht, Gilden und angeworbene Kompanien tragen den roten Anspruch.',
    ending:'Kapitulation am 24.02.1647 nach Sindings Tod durch Fieber.'},
  {id:'blaue',source:'source-02',title:'Die Blauen',epithet:'Die Religiösen',leader:'Bjoern Vaeren',person:'bjoern-vaeren',birth:1610,age:17,
    image:'bjoern-1627-v1.webp',file:'fraktionen/die-blauen.html',color:'blue',
    seat:'Ivarsfels und Schwertfall',strength:'Zwischen 5.000 und 8.000 Krieger',
    aim:'Bjoern als König einsetzen; Reformation der Kirche in Aldrimar',support:'Arvid Helgr, der Klerus, Wargh, Skaal und der Orden der Neun',
    summary:'Der fromme Bjoern wird zum Hoffnungsträger des Klerus. Die Blauen verbinden seinen Thronanspruch mit einer religiösen Neuordnung Aldrimars.',
    ending:'Nach Bjoerns Ermordung am 13.08.1633 löst sich die Fraktion auf.'}
].map(Object.freeze));

export const WAR_ACTS = Object.freeze([
  {id:'bruch',years:'1627',title:'Ein König stirbt. Drei Ansprüche erwachen.'},
  {id:'feldzuege',years:'1628–1629',title:'Die ersten Feldzüge'},
  {id:'gegenoffensive',years:'1630–1633',title:'Das Blatt wendet sich'},
  {id:'spaetkrieg',years:'1637–1647',title:'Ein erschöpftes Reich'}
].map(Object.freeze));

export const WAR_EVENTS = Object.freeze([
  {id:'roger-astrid',source:'source-05',act:'bruch',title:'Die Ermordung von Roger und Astrid',date:'25.06.1627',year:1627,
    sides:[],file:'ereignisse/ermordung-roger-und-astrid.html',content:'Ausgearbeitet',image:'roger-astrid-kelch-v1.webp',
    note:'Der Mord geschieht am 25.06.1627, 21 Tage nach Rogers Krönung. Ulfrik und Helga werden beschuldigt und ohne Untersuchung hingerichtet; ihre Schuld bleibt ungeklärt.'},
  {id:'uebernahme-heldenwacht',source:'source-06',act:'bruch',title:'Die Übernahme von Heldenwacht',date:'25.06.–01.07.1627',year:1627,sides:['gruene'],content:'Ausgearbeitet',
    file:'ereignisse/uebernahme-von-heldenwacht.html',image:'uebernahme-heldenwacht-1627-v1.webp',
    note:'Die Machtübernahme folgt auf den Hochzeitsmord. Im zwölf Tage umfassenden Zeitraum des Aleria-Kalenders liegen die sechs bis sieben Tage gegen die verbarrikadierten Anwesen.'},
  {id:'aufruhr-ivarsfels',source:'source-08',act:'bruch',title:'Der Aufruhr in Ivarsfels',date:'06.–18.07.1627',year:1627,sides:['blaue','gruene'],content:'Ausgearbeitet',
    file:'ereignisse/aufruhr-in-ivarsfels.html',image:'aufruhr-ivarsfels-1627-v1.webp',
    note:'Nachricht, Bjoerns Reise und Aufruhr liegen nach dem Giftmord. Asger ist etwa 22 Jahre alt; Herleifs Kontrolle beruht auf politischem Druck, nicht auf einer Vormundschaft.'},
  {id:'aufruhr-rorikshall',source:'source-10',act:'bruch',title:'Der Aufruhr in Rorikshall',date:'1627 · Tag und Monat offen',year:1627,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/aufruhr-in-rorikshall.html',image:'aufruhr-rorikshall-1627-v1.webp',
    note:'Tag und Monat fehlen. Die Kriegszeittafel nennt den Aufruhr 1627 und das Unterbinden von Streitigkeiten im ersten Monat 1629. Daraus wird kein durchgehender Zeitraum berechnet. Die Rebellen werden in der Einzeltabelle als „Die Roten“ bezeichnet.'},
  {id:'trauerwald',source:'source-11',act:'feldzuege',title:'Die Belagerung von Trauerwald',date:'03.–06.1628 · Tage offen',year:1628,sides:['gruene','rote'],content:'Ausgearbeitet',
    file:'ereignisse/belagerung-von-trauerwald.html',image:'belagerung-trauerwald-1628-v1.webp',
    note:'Beginn im dritten Monat, Kapitulation nach rund drei Monaten im sechsten Monat 1628. Arn Vaeren führt das grüne Heer. Die genauen Tage bleiben unbekannt.'},
  {id:'erste-seeschlacht-wellenruh',source:'source-12',act:'feldzuege',title:'Die I. Seeschlacht bei Wellenruh',date:'11.04.1628',year:1628,sides:['gruene','rote'],content:'Ausgearbeitet',
    existingHref:'Ereignisse/Schlachten/Erste-Seeschlacht-bei-Wellenruh.html',note:'Das vorhandene Dossier enthält bereits die animierte Rekonstruktion und den festen Kalendereintrag.'},
  {id:'flusswall',source:'source-13',act:'feldzuege',title:'Die Schändung von Flusswall',date:'22.07.1628',year:1628,sides:['gruene','blaue'],content:'Ausgearbeitet',
    file:'ereignisse/schaendung-von-flusswall.html',image:'schaendung-flusswall-1628-v1.webp',
    note:'Die Blauen verteidigen Flusswall. Die Verteidiger werden vernichtet; die ergriffenen Einwohner massakriert. Zuvor entkommene Menschen wie Gulda überleben. Eine vollständige zivile Opferzahl ist nicht bekannt.'},
  {id:'hurinn',source:'source-14',act:'feldzuege',title:'Die Schlacht am Fluss Hurinn',date:'01.1629 · Tag offen',year:1629,sides:['gruene','rote'],content:'Ausgearbeitet',
    file:'ereignisse/schlacht-am-fluss-hurinn.html',image:'schlacht-hurinn-v1.webp',
    note:'Nach Dunkelmoors Öffnung im zwölften Monat 1628 trifft Moortals Entsatzheer auf die Grünen. Deren rechte Flanke durchbricht die linke der Roten; Entsatz kommt aus Wolfsklamm. Die genaue Brückenlage und der Tag bleiben unbekannt.'},
  {id:'yogrim',source:'source-15',act:'feldzuege',title:'Die Schlacht bei Schwertfall am Yogrim',date:'02.1629 · Tag offen',year:1629,sides:['gruene','blaue'],content:'Ausgearbeitet',
    file:'ereignisse/schlacht-am-yogrim.html',image:'schlacht-yogrim-1629-v1.webp',
    note:'2.500 Grüne gegen 4.500 Blaue. Die abgeglichene Fassung rechnet mit rund 1.300 grünen und 3.000 blauen Gesamtausfällen, zusammen rund 4.300. Das umfasst Tote, Verwundete, Gefangene und Vermisste, keine reine Totenzahl. Der genaue Tag bleibt offen.'},
  {id:'belagerung-schwertfall',source:'source-16',act:'feldzuege',title:'Die Belagerung von Schwertfall',date:'12.08.–11.12.1629',year:1629,sides:['gruene','blaue'],content:'Ausgearbeitet',
    file:'ereignisse/belagerung-von-schwertfall.html',image:'belagerung-schwertfall-1629-v1.webp',
    note:'Auf Yogrim folgen Verfolgung, Neuaufstellung und die Einnahme Grabesruhs im siebten Monat. Die förmliche Belagerung beginnt am 12.08. und endet mit dem Burgabzug am 11.12.1629. Die Stadt wird erkämpft, die Inselburg aufgegeben; der Hafen bleibt für den Abzug offen.'},
  {id:'wolfswacht',source:'source-18',act:'gegenoffensive',title:'Der Angriff auf Wolfswacht',date:'20.07.1630',year:1630,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/angriff-auf-wolfswacht.html',image:'angriff-wolfswacht-1630-v1.webp',
    note:'Die Einzeltabelle nennt den 20.07.1630; die Kriegszeittafel nur den Monat. Vorgeschichte, Status und Verlauf enthalten in der Einzelvorlage keine ausformulierte Darstellung. Die Verlust- und Gefangenenangaben bleiben Tabellenwerte.'},
  {id:'zweite-seeschlacht-wellenruh',source:'source-19',act:'gegenoffensive',title:'Die II. Seeschlacht bei Wellenruh',date:'11.12.1630',year:1630,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/zweite-seeschlacht-bei-wellenruh.html',image:'zweite-seeschlacht-wellenruh-1630-v1.webp',
    note:'25 Schiffe der Heckenritter und 20 der Aldrimarer ergeben 45 rote Schiffe mit 3.300 Mann. Sie stehen 35 grünen Schiffen gegenüber. Ein Manöverablauf ist noch nicht ausgearbeitet.'},
  {id:'belagerung-heldenwacht',source:'source-20',act:'gegenoffensive',title:'Die Belagerung von Heldenwacht',date:'03.12.1631–07.12.1637',year:1631,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/belagerung-von-heldenwacht.html',image:'belagerung-heldenwacht-1631-1637-v1.webp',
    note:'Die eigentliche Belagerung dauert sechs Jahre und vier Tage; der Durchbruch erfolgt zu Beginn des siebten Belagerungsjahres. Die Trachwyll und Heckenritter helfen 1635, im vierten Belagerungsjahr. Die Grünen halten Heldenwacht durchgehend.'},
  {id:'hinterhalt-rorikshall',source:'source-21',act:'gegenoffensive',title:'Der Hinterhalt bei Rorikshall',date:'13.04.1632',year:1632,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/hinterhalt-bei-rorikshall.html',image:'hinterhalt-rorikshall-1632-v1.webp',
    note:'Die Tabelle nennt den 13.04.1632. Die Kriegszeittafel verzeichnet im vierten Monat den Kampf bei Rorikshall und im fünften das Zurückdrängen der Roten bis Rabenfurt. Die einzelnen Schritte dazwischen sind nicht ausgeführt.'},
  {id:'ermordung-bjoern',source:'source-22',act:'gegenoffensive',title:'Die Ermordung von Prinz Bjoern Vaeren',date:'13.08.1633',year:1633,sides:['blaue'],content:'Eckdaten',
    file:'ereignisse/ermordung-von-bjoern-vaeren.html',image:'bjoern-gedenkbild-1633-v1.webp',
    note:'Die Angreifer sind unbekannt. Ihnen wird weder ein Name noch eine Fraktionszugehörigkeit zugeschrieben.'},
  {id:'ceitheach-rorikshall',source:'source-23',act:'spaetkrieg',title:'Ceitheachs Angriff auf Rorikshall',date:'11.11.1637',year:1637,sides:['gruene'],content:'Eckdaten',
    file:'ereignisse/ceitheachs-angriff-auf-rorikshall.html',image:'ceitheach-rorikshall-1637-v1.webp',
    note:'Die Einzeltabelle datiert den Angriff auf den 11.11.1637. Die Kriegszeittafel nennt Kämpfe im elften Monat 1637 und die Einrichtung des Protektorats im dritten Monat 1638. Angriff und Protektorat werden nicht auf denselben Tag gesetzt.'},
  {id:'dunkelmoor',source:'source-24',act:'spaetkrieg',title:'Die Schlacht im Dunkelmoor',date:'08.1639 · Tag offen',year:1639,sides:['gruene','rote'],content:'Eckdaten',
    file:'ereignisse/schlacht-im-dunkelmoor.html',image:'dunkelmoor-arn-1639-v2.webp',
    note:'Der grün-trachwyllische Sieg liegt im achten Monat 1639; die Kapitulation Wolfsklamms und Dunkelmoors Seitenwechsel folgen im neunten. Arn ist seit 1636 bettlägerig und führt den Oberbefehl vom Krankenlager; Sverre und Gavin führen im Feld. Der genaue Schlachttag bleibt offen.'}
].map(Object.freeze));

export const SOURCE_NOTES = Object.freeze([
  '24 Originaldateien enthalten 21 unterschiedliche Dokumente: Krieg, drei Fraktionen und 17 Einzelereignisse. Die Übernahme von Heldenwacht, der Aufruhr in Ivarsfels und die Belagerung von Schwertfall wurden jeweils doppelt geliefert.',
  'Die angezeigten Texte sind die redaktionell abgeglichene Fassung vom 24.10.2026. 33 Prüfpunkte wurden anhand der Stammbäume und einer gemeinsamen Chronologie bereinigt. Die unveränderten Originale bleiben zum Vergleich erhalten.',
  'Die Urheberschaft des Giftmords bleibt ungeklärt. Tat, Beschuldigung und persönliche Zeugnisse werden getrennt; weder Arn noch Ulfrik und Helga werden durch eine redaktionelle Entscheidung zu bewiesenen Tätern.',
  'Der Aleria-Kalender hat 13 Monate mit jeweils 36 Tagen und Neuntagewochen. Fehlende Tage und nicht ausgearbeitete Verläufe bleiben offen; sie erhalten keine erfundene Genauigkeit.',
  'Die „Chroniken der Könige“ sind die in der Vorlage enthaltene Stimme Alarik Skalds. Seine Deutungen und Berichte werden als Chroniktext gezeigt, nicht als zusätzliche unabhängige Beweise.',
  'Die Illustrationen zeigen symbolische Szenen und zeitlich angepasste Figuren. Räume, Licht und Bildkomposition sind Darstellung, keine ergänzte Ereignisüberlieferung.'
]);
