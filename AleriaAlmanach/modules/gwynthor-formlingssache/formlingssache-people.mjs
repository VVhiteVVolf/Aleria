// Shared identities for the cathedral, administration, theater and proclamation.
// The Schattentänzer connection is a family proposal, not a genealogy import.
import { EUDDOGWY } from '../gwynthor-cathedral/patriarch-adjutant.mjs';
export { EUDDOGWY };
export const FORMLING_ART = '/AleriaAlmanach/assets/gwynthor-formlingssache';
const portrait = file => `${FORMLING_ART}/portraits/${file}.png`;
const person = (key, data) => Object.freeze({ key,
  id: `person--gwynthor-formlingssache--${key}`,
  worldPersonId: `person--gwynthor-formlingssache--${key}`,
  sex: 'male', race: 'Mensch', ...data });

export const LLEUWEN = person('lleuwen', {
  name: 'Lleuwen', sex: 'female', race: 'Formling', birth: '', apparentAge: 28,
  origin: 'Herkunft nicht bekannt · seit Jahren in Gwynthor',
  currentLocation: 'Gwynthor · kirchlicher Gewahrsam',
  role: 'Statistin am Gwynthorer Theater · derzeit in kirchlicher Obhut',
  portrait: portrait('lleuwen-gefangen'), theaterPortrait: portrait('lleuwen-menschlich'),
  bestiaryReference: Object.freeze({ id: 'wesen/inferniiden/formwandler',
    name: 'Formling & Formwandler', url: '/Bestiarium/wesen/inferniiden/formwandler/index.html' }),
  appearances: Object.freeze([
    { id: 'menschlich', name: 'Menschliche Erscheinung', portrait: portrait('lleuwen-menschlich') },
    { id: 'wahre-gestalt', name: 'Wahre Gestalt', portrait: portrait('lleuwen-wahre-gestalt') },
    { id: 'gewahrsam', name: 'Gegenwärtiger Gewahrsam', portrait: portrait('lleuwen-gefangen') },
  ]),
  bio: 'Lleuwen arbeitet seit mehreren Jahren als Statistin am Gwynthorer Theater. Unter den Menschen gewann sie mit der Zeit Vertrauen und ein vertrautes Auskommen im Haus. In ihrer menschlichen Erscheinung wirkt sie etwa achtundzwanzig: eine schöne Frau mit sehr voluminösen roten Locken, grünen Augen, Sommersprossen und einem frechen Lächeln. Ihr tatsächliches Alter und ihre frühere Herkunft sind nicht bekannt.\n\nIhre Natur als Formling wurde bei einem öffentlichen Zwischenfall durch den Hexenjäger Ulrich Schniedel enthüllt. Die Stadtwache unterband die Auseinandersetzung. Seither befindet Lleuwen sich in kirchlicher Obhut und wartet auf die Entscheidung des Patriarchen. Halsreif und Fesseln aus Tenebrit halten sie gebunden; an den Kontaktstellen treten stark hervortretende violette Adern auf.\n\nOrvar Schattentänzer, ihr langjähriger Gefährte und ebenfalls Schauspieler, setzt sich für ihre Freilassung ein. Er erklärt, sie habe ihm ihre Natur schon vor dem Zwischenfall anvertraut. Über ihre Zukunft, Ulrichs Forderungen und den tätlichen Streit ist noch kein Urteil ergangen.',
});

export const ULRICH = person('ulrich', {
  name: 'Ulrich Schniedel', age: 59, birth: '1681', origin: 'Aldingen · einfache Verhältnisse',
  role: 'Hexenjäger · Richter des Reinen Blutes', portrait: portrait('ulrich-schniedel'),
  bio: 'Ulrich Schniedel stammt aus einfachen Verhältnissen in Aldingen. Der neunundfünfzigjährige Krieger gehört zu den Richtern des Reinen Blutes, einer eigenständigen Söldnergilde von Hexenjägern. Er arbeitet als Einzelgänger und hat sich in Lothir einen angesehenen Namen als Entlarver infernaler Wesen gemacht.\n\nNach seinem letzten Aufenthalt in Weisenfluh wechselte er nach Estryll. Über die persönlichen Gründe spricht er nicht. Hier begegnet er seltener Formwandlern und hält sich auch mit Geisterfällen und kleineren infernalen Aufgaben über Wasser. Ein verzaubertes Amulett, ein Tenebrit-Schwert, Tenebrium-Bolzen und alchemistische Mittel gehören zu seiner Ausrüstung.\n\nIn Gwynthor wurde er bei einer Theateraufführung auf Lleuwen aufmerksam. Nach einer Woche der Beobachtung setzte er aus kurzer Entfernung Tenebriumstaub ein, um ihre Verwandlung aufzubrechen. Orvar Schattentänzer schlug ihn mit einem Übungsschwert; die Stadtwache beendete den Streit. Ulrich fordert Lohn für die Entlarvung und Entschädigung für den Angriff und die aus seiner Sicht vereitelte Arbeit. Über diese Ansprüche ist noch nicht entschieden.\n\nGraues zurückgebundenes Haar, ein Bart, die Augenklappe über dem vernarbten linken Auge und eine häufig gerauchte Pfeife prägen sein Erscheinungsbild. Er trägt vorwiegend Lederzeug mit wenigen Stahlteilen und einem Bandolier voller schmaler Phiolen.',
});

export const ORVAR = person('orvar', {
  name: 'Orvar Schattentänzer', age: 33, birth: '1707', origin: 'Klangheim · Aldrimar',
  role: 'Schauspieler · kleinere Ritter- und Kriegerrollen', portrait: portrait('orvar-schattentaenzer'),
  familyOrigin: Object.freeze({ name: 'Familie Schattentänzer', seat: 'Klangheim', developed: false }),
  bio: 'Orvar Schattentänzer stammt aus Klangheim in Aldrimar und spielt am Gwynthorer Theater kleinere Nebenrollen. Mit dreiunddreißig ist er ein kräftiger, gutaussehender Darsteller mit blondem Haar, blauen Augen und einem offenen, charismatischen Auftreten. Seine Statur bringt ihm häufig die Rollen von Rittern und Kriegern ein.\n\nMit der Statistin Lleuwen ist er seit längerer Zeit verbunden. Nach seiner Aussage hatte sie ihm ihre Natur als Formling schon vor ihrer Entlarvung gestanden. Er habe sie dennoch geliebt und versprochen, auf sie aufzupassen. Beide wollten eines Tages gemeinsam weiterziehen und sich vielleicht einer Zirkusgruppe anschließen.\n\nAls Ulrich Schniedel Lleuwen mit Tenebriumstaub entlarvte, griff Orvar nach einem Übungsschwert und schlug den Hexenjäger. Die Stadtwache unterband den Streit. Orvar beruft sich auf seine Liebe und bittet um Lleuwens Freilassung; wegen des Schlages steht zugleich Ulrichs Beschwerde gegen ihn im Raum. Die Anhörung und ihre Entscheidung stehen noch aus.',
});

export const FORMLING_PEOPLE = Object.freeze([EUDDOGWY, LLEUWEN, ULRICH, ORVAR]);
export const FORMLING_THEATER_PEOPLE = Object.freeze([LLEUWEN, ORVAR].map(p =>
  Object.freeze({ ...p, portrait: p.theaterPortrait || p.portrait })));
