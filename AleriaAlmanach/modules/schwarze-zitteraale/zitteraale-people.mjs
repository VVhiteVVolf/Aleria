export const ZITTERAALE_ART = '/AleriaAlmanach/assets/schwarze-zitteraale';
export const ZITTERAALE_ID = 'schwarze-zitteraale';
export const ZITTERAALE_REVISION = '20261021-arvel-v3';
export const ZITTERAALE_EMBLEM = `${ZITTERAALE_ART}/emblem.png`;
const art = (kind, id) => `${ZITTERAALE_ART}/${kind}/${id}.png`;

// Public aliases only. Former manuscript names are deliberately not identities.
// Bounties follow the five occupied slots of the supplied HTML (copper units).
export const ZITTERAALE_LEADERS = Object.freeze([
  { id: 'schwarzer-zitteraal', name: 'Der Schwarze Zitteraal', role: 'Bandenhaupt · letzter Befehl', age: 41, height: '1,86 Schritt',
    bountyCopper: 35000, bountyGold: 35, status: 'Tot oder lebendig',
    appearance: 'Dunkelbraunes Haar unter schwarzer Kapuze, graugrüne Augen, gepflegter kurzer Bart; hochgewachsen und sehnig. Dunkler Panzer mit goldenen Kanten und Aalzeichen.',
    character: 'Beherrscht, charismatisch und berechnend. Spricht leise und lässt andere auf seine Antwort warten. Abmachungen gelten ihm, solange sie seinem Anspruch dienen.',
    background: 'Einst ein Krieger im Dienst der Illysywen. Er überlebte deren Untergang im Krieg von 1720 und sammelte später Versprengte und Deserteure. Aus der verlorenen Gefolgschaft formte er eine Bande, deren Beutezüge seinen eigenen Machtanspruch nähren.',
    method: 'Wählt Ziele und Rückzugswege, verteilt Beute und hält die Rudelführer durch Abhängigkeit und Furcht zusammen. Sein Morgenstern Donnergrollen und der Hengst Zunder machen ihn im offenen Gefecht erkennbar.',
    charges: ['Mord und Plünderung', 'Raub und Erpressung', 'Brandstiftung', 'Anführung einer Raubritterbande', 'Schändung und Gewalt gegen Schutzlose'],
    traits: ['Berechnend', 'Charismatisch', 'Grausam'], danger: [5, 5, 4, 4, 5] },
  { id: 'schlickzahn', name: 'Schlickzahn', role: 'Rechte Hand · Überfälle und Einschüchterung', age: 46, height: '1,93 Schritt',
    bountyCopper: 13000, bountyGold: 13, status: 'Lebendig bevorzugt',
    appearance: 'Breiter Cenyri mit kahl rasiertem Kopf, kurzem rostbraunem Kinnbart und einer Lücke zwischen den oberen Schneidezähnen. Gebrochene Nase, schwere dunkle Lederweste über Kettenzeug.',
    character: 'Reizbar, besitzergreifend und geduldig, wenn Angst ihm nützt. Lacht über kleine Demütigungen und merkt sich jeden Widerspruch.',
    background: 'Unter wechselnden Feldzeichen lernte er, dass bewaffnete Männer von den Vorräten anderer leben können. Beim Zitteraal fand er einen Herrn, der diese Gewohnheit belohnt. Seinen Beinamen verdankt er der Zahnlücke und den schlammigen Hohlwegen seiner Überfälle.',
    method: 'Führt den ersten Zugriff, schüchtert Gehöfte ein und treibt Forderungen ein. Er bindet Opfer im Gespräch, bis Komplizen die Ausgänge besetzt haben.',
    charges: ['Bewaffneter Raub', 'Schwere Körperverletzung und Mord', 'Erpressung', 'Brandstiftung'],
    traits: ['Jähzornig', 'Grausam', 'Beharrlich'], danger: [5, 3, 2, 4, 4] },
  { id: 'nachtkieme', name: 'Nachtkieme', role: 'Linke Hand · Kundschaft und Verbindungen', age: 37, height: '1,71 Schritt',
    bountyCopper: 11000, bountyGold: 11, status: 'Lebendig bevorzugt',
    appearance: 'Schmale braunhaarige Frau mit graubraunen Augen, tiefem seitlichem Zopf und kurz geschnittener rechter Schläfe. Dunkler Reisemantel, schmales Gesicht, Kerbe in der linken Braue.',
    character: 'Aufmerksam, misstrauisch und wortkarg. Merkt sich Stimmen und kleine Unstimmigkeiten; antwortet selten auf die eigentliche Frage.',
    background: 'Sie kannte die Straßen der Grafschaft bereits, bevor die Bande ihre Wege nutzte. Aus kleinen Botengängen wurden bezahlte Hinweise und schließlich die Planung von Hinterhalten. Niemand in der Bande verwendet einen anderen Namen für sie.',
    method: 'Beobachtet Reisegewohnheiten, stellt Kontakte zu Abnehmern her und prüft fremde Nachrichten. Nur wenige erfahren von ihr mehr als ihren nächsten Treffpunkt.',
    charges: ['Vorbereitung bewaffneter Überfälle', 'Beihilfe zu Mord und Raub', 'Erpressung', 'Hehlerei'],
    traits: ['Geduldig', 'Misstrauisch', 'Verschwiegen'], danger: [3, 5, 5, 4, 5] },
  { id: 'donnerkiefer', name: 'Donnerkiefer', role: 'Innerer Kreis · Waffen und Rudeldisziplin', age: 43, height: '1,90 Schritt',
    bountyCopper: 5000, bountyGold: 5, status: 'Lebendig bevorzugt',
    appearance: 'Kräftiger Aldrimarer mit langem strohblondem Haar, einem straffen Nackenzopf und breitem geflochtenem Bart. Alte helle Narbe vom rechten Mundwinkel zum Kiefer; dunkles Eisen und grauer Wollkragen.',
    character: 'Diszipliniert, nachtragend und stolz auf seine Härte. Hält Furcht für eine zuverlässigere Bindung als Freundschaft.',
    background: 'Ein ehemaliger Kriegsknecht, der nach Jahren wechselnder Dienste bei den Zitteraalen blieb. Er ordnet das erbeutete Gerät und übt mit den Komplizen, bis aus einem Überfall ein eingeübter Griff wird.',
    method: 'Überwacht Waffen und Wachen, setzt Befehle im Lager durch und übernimmt die Nachhut bei Rückzügen. Sein Beiname meint die donnernde Stimme hinter dem vernarbten Kiefer.',
    charges: ['Bewaffneter Raub', 'Beihilfe zu Mord', 'Gewaltsame Einschüchterung', 'Beteiligung an Plünderungen'],
    traits: ['Diszipliniert', 'Rachsüchtig', 'Hochmütig'], danger: [5, 3, 2, 3, 4] },
  { id: 'netznadel', name: 'Netznadel', role: 'Innerer Kreis · Beute, Vorräte und Schleusung', age: 34, height: '1,79 Schritt',
    bountyCopper: 3400, bountyGold: 3.4, status: 'Lebendig bevorzugt',
    appearance: 'Dünner rothaariger Cenyri mit grünen Augen, ungleichmäßig kurzem Pony, schmalem Schnurrbart und schiefer dunkler Kappe. Brauner Arbeitsrock, geflickte schwarze Schulterdecke, drahtige Hände.',
    character: 'Geschäftig, habgierig und ausweichend. Zählt selbst beim Reden mit und macht aus jeder Gefälligkeit eine offene Schuld.',
    background: 'Er begann als Gelegenheitshehler an wechselnden Anlegeplätzen. Im inneren Kreis der Bande zählt sein Gedächtnis für Gebinde, Schulden und brauchbare Namen mehr als ein sauberer Hieb.',
    method: 'Verteilt Vorräte, trennt auffällige Beute von gewöhnlicher Fracht und organisiert Übergaben. Er kennt die Vorratswege, aber seine Abnehmer erhalten nur einzelne Lieferungen zu sehen.',
    charges: ['Hehlerei', 'Schmuggel', 'Beihilfe zu Raub und Erpressung', 'Versorgung einer Raubritterbande'],
    traits: ['Habgierig', 'Gewieft', 'Feige'], danger: [2, 4, 4, 5, 4] }
].map(person => Object.freeze({ ...person, characterId: `zitteraale-${person.id}`, portrait: art('portraits', person.id), sketch: art('sketches', person.id) })));

// Existing scene/document IDs remain stable; these display aliases never rewrite
// their historic dialogue, verdicts, inventories or combat results.
export const BRADHRITH_FORMER_MEMBERS = Object.freeze([
  { id: '01OfFXeScnCoL2eNMPAM', name: 'Jungaal', status: 'Gefangen · zum Tod verurteilt', sourceName: 'Tegid' },
  { id: '2UgcQTdEEpSJDTNKxx0U', name: 'Riffbrecher', status: 'Gefangen · für Verhöre zurückgehalten', sourceName: 'Rhodri' },
  { id: 'ax26chmgvtaURnzC0n0l', name: 'Grubenschlick', status: 'Gefangen · zum Tod verurteilt', sourceName: 'Brychan' }
]);
export const ZITTERAALE_GROUPS = Object.freeze([
  { id: 'hohlweg', name: 'Hohlwegrudel', task: 'Überfälle auf Straßen und Gehöfte', former: true },
  { id: 'ufer', name: 'Uferschatten', task: 'Anlegeplätze und Übergaben' },
  { id: 'schilf', name: 'Schilfmesser', task: 'Kundschaft und heimliche Wege' },
  { id: 'fracht', name: 'Nachtfracht', task: 'Beute und Vorratstransporte' },
  { id: 'bruch', name: 'Bruchzähne', task: 'Gewaltsamer Zugriff und Rückendeckung' },
  { id: 'ruine', name: 'Grundwache', task: 'Wachen und Laufwege in der Ruinenstadt' }
]);
