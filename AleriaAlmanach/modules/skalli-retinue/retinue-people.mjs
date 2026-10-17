import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../character-genealogy/genealogy-mapping.js';

export const RETINUE_ID = 'skallis-gefolge';
export const RETINUE_PATH = Object.freeze(['Aldrimar', 'Roriksheim', 'Haus Varulv']);
export const RETINUE_ART = './public/assets/skalli-retinue';
export const RETINUE_EMBLEM = '../Stammbäume/assets/images/houses/Aldrimar/clan-varulv.png';
export const RETINUE_EXISTING_IDS = Object.freeze({
  'fenrir-varulv': 'FKiXsSWVoV74rTgmpPip',
  'freya-skald': 'ksJQe8Ai4KbRE9jOAvb7'
});

const specs = [
  ['haus-varulv', 'skalli-varulv', 'Anführerin', 'Walküre', 'Skalli führt die Schar mit strategischem Verstand und entschlossenem Tatendrang. Der Schutz Roriksheims und seiner Ortschaften steht für sie an erster Stelle.'],
  ['haus-baerenherz', 'ragna-baerenherz', 'Rechte Hand', 'Walküre', 'Ragna steht Skalli als rechte Hand zur Seite. Die vierundzwanzigjährige Bärenherz trägt hellblondes Haar mit weißen Spitzen; ihre jüngere Schwester Svala lernt als Maer bei Skalli.'],
  ['haus-rotstahl', 'torben-rotstahl', 'Linke Hand', 'Huskarl', 'Der sechsundzwanzigjährige Torben ist Skallis linke Hand. Zu seiner Verantwortung gehört die Ausbildung Kjells als Drengr. Rotgraue Rüstung, stark gelocktes blondes Haar und der Rotstahl-Schild machen ihn unverwechselbar.'],
  ['haus-varulv', 'skadi-varulv', 'Walküre · angehende Priesterin', 'Walküre', 'Skallis Cousine Skadi bringt ihre Ausbildung als angehende Priesterin mit in die Gemeinschaft. Ihre Verbindung zu Harold Skjegg bleibt Teil ihrer Geschichte.'],
  ['haus-varulv', 'fenrir-varulv', 'Huskarl', 'Huskarl', 'Skallis jüngerer Bruder ist Huskarl aus Rorikshall. Er zieht als Krieger mit seiner Schwester; seine enge Freundschaft mit Freya gehört zum vertrauten Alltag der Gruppe.'],
  ['haus-skald', 'freya-skald', 'Skaldin', 'Walküre', 'Freya verbindet Musik, Dichtung und skaldische Magie mit einer Ausbildung an Schwert und Schild. Sie begleitet die Schar mit ihrer Laute, großer Neugier und der Sehnsucht nach eigenen Geschichten.'],
  ['haus-varulv', 'embla-varulv', 'Maer', 'Nachwuchs', 'Die siebzehnjährige Embla ist die jüngere Schwester Asks und eine Cousine zweiten Grades Skallis. Als Maer gehört sie zum lernenden Nachwuchs der Schar.'],
  ['haus-varulv', 'jordis-varulv', 'Walküre', 'Walküre', 'Jördis ist Skirnirs und Bodvilds ältestes Kind und gehört mit achtzehn Jahren zu den jungen Walküren der Schar. Sie zieht mit ihren Varulv-Verwandten unter Skallis Führung.'],
  ['haus-varulv', 'gundel-varulv', 'Maer von Skalli', 'Nachwuchs', 'Gundel Varulv ist fünfzehn Jahre alt und Skallis Maer, die aldrimarische Bezeichnung für eine weibliche Knappe. Gemeinsam mit Svala lernt sie unter Skallis unmittelbarer Aufsicht Waffenführung, Lagerdienst und Verantwortung für die Gefährten.'],
  ['haus-unholdbann', 'hakon-unholdbann', 'Kundschafterführer', 'Huskarl', 'Hakon ist dreiundzwanzig Jahre alt und dient der Schar als Reiter und Kundschafter. Er erkundet Wege, beobachtet das Umland und bringt seine Meldungen zur Führung zurück.'],
  ['haus-skald', 'hvitserk-skald', 'Erster Skalde', 'Huskarl', 'Hvitserk ist vierundzwanzig Jahre alt, Sohn Ragnars und Lagerthas sowie älterer Bruder Freyas und Ivars. Als Erster Skalde gehört er zum Führungsstab und trägt Verantwortung für die skaldische Begleitung der Schar.'],
  ['haus-skald', 'ivar-skald', 'Huskarl', 'Huskarl', 'Der einundzwanzigjährige Ivar zieht gemeinsam mit Hvitserk und Freya unter Skallis Führung. Er gehört zum erwachsenen Kriegerkreis der Schar.'],
  ['haus-eisenjungfer', 'aslaug-eisenjungfer', 'Walküre', 'Walküre', 'Aslaug ist achtzehn Jahre alt und eine jüngere Tochter Runas. Sie bringt die Schildmaidtradition der Eisenjungfern in die Schar ein. Ihr goldenblondes Haar und ihre blauen Augen entsprechen dem Erscheinungsbild ihrer Familie.'],
  ['haus-eisenjungfer', 'eira-eisenjungfer', 'Walküre', 'Walküre', 'Eira ist zweiundzwanzig Jahre alt und eine Tochter Brynhilds. Die Eisenjungfer zieht gemeinsam mit Aslaug und den Skald-Geschwistern in Skallis Gefolge.'],
  ['haus-nachtjaeger', 'joric-nachtjaeger', 'Huskarl', 'Huskarl', 'Der zweiundzwanzigjährige Joric gehört zum Clan Nachtjäger und zum erwachsenen Kriegerkreis. Seine bestehenden Familienverhältnisse bleiben in der Familienakte erhalten.'],
  ['haus-varulv', 'hati-varulv', 'Drengr', 'Nachwuchs', 'Hati ist mit fünfzehn Jahren das jüngste Kind Sleipnirs und Svantjes. Die erkennbare magische Begabung erhält neben dem gemeinsamen Lernen im Gefolge ihren eigenen Raum.'],
  ['haus-schwarzdorn', 'aradin-hyrmgardr', 'Huskarl', 'Huskarl', 'Aradin Hyrmgarthr ist vierundzwanzig Jahre alt und Sohn Mavens Schwarzdorn und Jarells Hyrmgarthr. Er gehört auf Skallis ausdrückliche Auswahl als Ausnahme zur Schar.'],
  ['haus-baerenherz', 'svala-baerenherz', 'Maer von Skalli', 'Nachwuchs', 'Die sechzehnjährige Svala ist Ragnas jüngere Schwester und neben Gundel Skallis zweite persönliche Maer. Sie trägt das helle, zu den Spitzen weiße Haar ihrer Familie.'],
  ['haus-rotstahl', 'kjell-rotstahl', 'Drengr von Torben', 'Nachwuchs', 'Kjell ist vierzehn Jahre alt und lernt als Drengr bei Torben Rotstahl. Eine Vetternschaft ist vorgesehen; der genaue Familienzweig ist noch nicht festgelegt.']
];

export const RETINUE_PEOPLE = Object.freeze(specs.map(([familyId, personId, role, division, bio]) => {
  const record = FAMILY_REGISTRY.find(item => item.id === familyId);
  const person = record?.family.persons.find(item => item.id === personId);
  if (!person) throw Error(`Gefolgsmitglied fehlt im Stammbaum: ${familyId}/${personId}`);
  const candidate = createFamilyPersonCandidate({ ...record, source: 'github' }, person);
  return Object.freeze({ key: personId, familyId, personId, worldPersonId: person.worldPersonId,
    name: person.name, birth: person.birth, age: 1740 - Number(person.birth), sex: person.sex,
    portrait: candidate.portrait, role, division, bio, candidate,
    link: `../Stammbäume/Stammbaum.html?family=${familyId}&mode=view&person=${personId}` });
}));

export function retinuePerson(key) {
  const person = RETINUE_PEOPLE.find(item => item.key === key);
  if (!person) throw Error(`Unbekanntes Gefolgsmitglied: ${key}`);
  return person;
}
