import { SUMPFNATTERN_GROUP } from './sumpfnattern-people.mjs';

export const ZITTERAALE_ART = '/AleriaAlmanach/assets/schwarze-zitteraale';
export const ZITTERAALE_ID = 'schwarze-zitteraale';
export const ZITTERAALE_REVISION = '20261116-unterbanden-v4';
export const ZITTERAALE_EMBLEM = `${ZITTERAALE_ART}/emblem.png`;
const art = (kind, id) => `${ZITTERAALE_ART}/${kind}/${id}.png`;

// Stable document IDs retain the original sources of the revised display names.
// The four retained wanted people keep their established bounties (copper units).
export const ZITTERAALE_LEADERS = Object.freeze([
  { id: 'schwarzer-zitteraal', name: 'Der Schwarze Zitteraal', role: 'Bandenhaupt · letzter Befehl', age: 41, height: '1,86 Schritt',
    bountyCopper: 35000, bountyGold: 35, status: 'Tot oder lebendig',
    appearance: 'Dunkelbraunes Haar unter schwarzer Kapuze, graugrüne Augen, gepflegter kurzer Bart; hochgewachsen und sehnig. Dunkler Panzer mit goldenen Kanten und Aalzeichen.',
    character: 'Beherrscht, charismatisch und berechnend. Spricht leise und lässt andere auf seine Antwort warten. Abmachungen gelten ihm, solange sie seinem Anspruch dienen.',
    background: 'Einst ein Krieger im Dienst der Illysywen. Er überlebte deren Untergang im Krieg von 1720 und sammelte später Versprengte und Deserteure. Aus der verlorenen Gefolgschaft formte er eine Bande, deren Beutezüge seinen eigenen Machtanspruch nähren.',
    method: 'Wählt Ziele und Rückzugswege, verteilt Beute und hält die Rudelführer durch Abhängigkeit und Furcht zusammen. Sein Morgenstern Donnergrollen und der Hengst Zunder machen ihn im offenen Gefecht erkennbar.',
    charges: ['Mord und Plünderung', 'Raub und Erpressung', 'Brandstiftung', 'Anführung einer Raubritterbande', 'Schändung und Gewalt gegen Schutzlose'],
    traits: ['Berechnend', 'Charismatisch', 'Grausam'], danger: [5, 5, 4, 4, 5] },
  { id: 'schlickzahn', name: 'Der Schinder', role: 'Rechte Hand · Überfälle und Einschüchterung', age: 46, height: '1,93 Schritt',
    bountyCopper: 13000, bountyGold: 13, status: 'Lebendig bevorzugt',
    appearance: 'Breiter Cenyri mit kahl rasiertem Kopf, kurzem rostbraunem Kinnbart und einer Lücke zwischen den oberen Schneidezähnen. Gebrochene Nase, schwere dunkle Lederweste über Kettenzeug.',
    character: 'Reizbar, besitzergreifend und geduldig, wenn Angst ihm nützt. Lacht über kleine Demütigungen und merkt sich jeden Widerspruch.',
    background: 'Unter wechselnden Feldzeichen lernte er, dass bewaffnete Männer von den Vorräten anderer leben können. Beim Zitteraal fand er einen Herrn, der diese Gewohnheit belohnt. Als dessen rechte Hand treibt er Forderungen ein und bereitet größere Überfälle vor.',
    method: 'Führt den ersten Zugriff, schüchtert Gehöfte ein und treibt Forderungen ein. Er bindet Opfer im Gespräch, bis Komplizen die Ausgänge besetzt haben.',
    charges: ['Bewaffneter Raub', 'Schwere Körperverletzung und Mord', 'Erpressung', 'Brandstiftung'],
    traits: ['Jähzornig', 'Grausam', 'Beharrlich'], danger: [5, 3, 2, 4, 4] },
  { id: 'nachtkieme', name: 'Llineth', role: 'Verbindungen · Kundschaft und Abnehmer', age: 37, height: '1,71 Schritt',
    bountyCopper: 11000, bountyGold: 11, status: 'Lebendig bevorzugt',
    appearance: 'Schmale braunhaarige Frau mit graubraunen Augen, tiefem seitlichem Zopf und kurz geschnittener rechter Schläfe. Dunkler Reisemantel, schmales Gesicht, Kerbe in der linken Braue.',
    character: 'Aufmerksam, misstrauisch und wortkarg. Merkt sich Stimmen und kleine Unstimmigkeiten; antwortet selten auf die eigentliche Frage.',
    background: 'Llineth kannte die Straßen der Grafschaft bereits, bevor die Bande ihre Wege nutzte. Aus kleinen Botengängen wurden bezahlte Hinweise und schließlich die Planung von Hinterhalten. Sie hält Kontakte zu Kundschaftern, Boten und Abnehmern der Beute.',
    method: 'Beobachtet Reisegewohnheiten, stellt Kontakte zu Abnehmern her und prüft fremde Nachrichten. Nur wenige erfahren von ihr mehr als ihren nächsten Treffpunkt.',
    charges: ['Vorbereitung bewaffneter Überfälle', 'Beihilfe zu Mord und Raub', 'Erpressung', 'Hehlerei'],
    traits: ['Geduldig', 'Misstrauisch', 'Verschwiegen'], danger: [3, 5, 5, 4, 5] },
  { id: 'donnerkiefer', name: 'Der Eidlose', role: 'Linke Hand · Waffen und Bandenordnung', age: 43, height: '1,90 Schritt',
    bountyCopper: 5000, bountyGold: 5, status: 'Lebendig bevorzugt',
    appearance: 'Kräftiger Aldrimarer mit langem strohblondem Haar, einem straffen Nackenzopf und breitem geflochtenem Bart. Alte helle Narbe vom rechten Mundwinkel zum Kiefer; dunkles Eisen und grauer Wollkragen.',
    character: 'Diszipliniert, nachtragend und stolz auf seine Härte. Hält Furcht für eine zuverlässigere Bindung als Freundschaft.',
    background: 'Ein ehemaliger Kriegsknecht, der nach Jahren wechselnder Dienste bei den Zitteraalen blieb. Er ordnet das erbeutete Gerät und übt mit den Komplizen, bis aus einem Überfall ein eingeübter Griff wird.',
    method: 'Überwacht Waffen und Wachen, setzt Befehle im Lager durch und stimmt Verstärkungen aus dem Hauptquartier mit den Gruppenführern ab.',
    charges: ['Bewaffneter Raub', 'Beihilfe zu Mord', 'Gewaltsame Einschüchterung', 'Beteiligung an Plünderungen'],
    traits: ['Diszipliniert', 'Rachsüchtig', 'Hochmütig'], danger: [5, 3, 2, 3, 4] }
].map(person => Object.freeze({ ...person, characterId: `zitteraale-${person.id}`, portrait: art('portraits', person.id), sketch: art('sketches', person.id) })));

export const ZITTERAALE_DEPUTIES = Object.freeze(['schlickzahn', 'donnerkiefer'].map(id => ZITTERAALE_LEADERS.find(person => person.id === id)));
export const ZITTERAALE_CONTACT = ZITTERAALE_LEADERS.find(person => person.id === 'nachtkieme');

// Current membership follows the user's November 16 clarification. The earlier
// trial source is retained separately as a historical account.
export const BRADHRITH_FORMER_MEMBERS = Object.freeze([
  { id: 'ax26chmgvtaURnzC0n0l', name: 'Brychan', status: 'Verstorben · früheres einfaches Mitglied', portrait: `${ZITTERAALE_ART}/references/brychan.png`, deceased: true },
  { id: '01OfFXeScnCoL2eNMPAM', name: 'Tegid', status: 'Verstorben · früheres einfaches Mitglied', portrait: `${ZITTERAALE_ART}/references/tegid.png`, deceased: true },
  { id: '2UgcQTdEEpSJDTNKxx0U', name: 'Rhodri', status: 'Ex-Mitglied · früherer zweiter Leutnant', portrait: `${ZITTERAALE_ART}/references/rhodri.png`, deceased: false }
]);
export const ZITTERAALE_GROUPS = Object.freeze(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((numeral, index) => Object.freeze({
  id: `zitteraale-gruppe-${numeral.toLowerCase()}`, numeral, name: index === 0 ? 'Die Untoten Aale' : `Gruppe ${numeral}.`,
  banner: `${ZITTERAALE_ART}/groups/banners/${index === 0 ? 'banner-untote-aele-v1' : 'banner-blank-v1'}.png`,
  overviewImage: index === 0 ? `${ZITTERAALE_ART}/groups/scenes/untote-aale-lager-v1.png` : '',
  headquartersImage: index === 0 ? `${ZITTERAALE_ART}/groups/scenes/untote-aale-lager-v1.png` : '',
  leaderId: index === 0 ? 'zitteraale-medrawd-angau' : `zitteraale-gruppe-${numeral.toLowerCase()}-fuehrer`,
  leaderName: index === 0 ? 'Medrawd Angau' : 'Gruppenführer · unbenannt',
  leaderPortrait: `${ZITTERAALE_ART}/groups/portraits/${index === 0 ? 'medrawd-angau-v3' : `leader-${numeral.toLowerCase()}-v1`}.png`,
  detailed: index === 0,
  ...(index === 1 ? SUMPFNATTERN_GROUP : {})
})));
