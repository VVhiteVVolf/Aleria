// Authored Skellor genealogy. The bandit keeps his established character ID.
export const SKELLOR_ART = '/Stammbäume/assets/images/portraits/haus-skellor';
export const SKELLOR_EMBLEM = '/Stammbäume/assets/images/houses/Rhonwens Tränen/Ritterliche/Skellor.png';
export const ARVEL_CHARACTER_ID = 'zitteraale-schwarzer-zitteraal';
export const ARVEL_WORLD_PERSON_ID = 'person--haus-skellor--arvel-skellor';
export const ARVEL_CURRENT_PORTRAIT = '/AleriaAlmanach/assets/schwarze-zitteraale/portraits/schwarzer-zitteraal.png';
export const ARVEL_BIO_ART = '/AleriaAlmanach/assets/biographies/arvel-skellor/2026-10-21';

export const SKELLOR_PEOPLE = Object.freeze([
  { id: 'caradog-skellor', name: 'Caradog Skellor', sex: 'male', birth: '1647', death: '1716', role: 'Ritterherr von Caer Creigfryn', lineageRole: 'head', bio: 'Arvels Großvater. Führte das niedere Ritterhaus auf seiner kleinen Inselburg unter der Lehnsherrschaft der Illysywen. Starb vor dem Krieg.' },
  { id: 'meirwen', name: 'Meirwen', sex: 'female', birth: '1650', death: '1718', role: 'Caradogs Gemahlin', familyRole: 'married', bio: 'Arvels Großmutter. Ihr Herkunftshaus ist nicht überliefert; sie starb vor dem Fall Creigfryns.' },
  { id: 'rhydan-skellor', name: 'Rhydan Skellor', sex: 'male', birth: '1674', death: '1720', role: 'Letzter belehnter Ritterherr von Caer Creigfryn', lineageRole: 'head', bio: 'Arvels Vater. Folgte 1720 dem Banner der Illysywen. Kündigte zunächst die Kapitulation an, hielt die Burg nach der Flucht seiner Familie jedoch weiter, um deren vermeintlich gelungene Rettung zu sichern. Schlug die angebotenen Bedingungen aus und fiel beim Sturm auf Creigfryn.' },
  { id: 'enid', name: 'Enid', sex: 'female', birth: '1677', death: '1720', role: 'Rhydans Gemahlin · Arvels Mutter', familyRole: 'married', bio: 'Blieb bei Rhydan in Creigfryn und starb beim Fall der Burg. Ihr Herkunftshaus bleibt unbenannt.' },
  { id: 'cadfan-skellor', name: 'Cadfan Skellor', sex: 'male', birth: '1678', death: '1720', role: 'Rhydans jüngerer Bruder', bio: 'Arvels Onkel. Blieb 1720 bei seinem Bruder in Creigfryn und fiel bei der Erstürmung. Seine Linie überlebte den Untergang nicht.' },
  { id: 'olwen', name: 'Olwen', sex: 'female', birth: '1681', death: '1720', role: 'Cadfans Gemahlin', familyRole: 'married', bio: 'Begleitete die jüngeren Angehörigen bei der Flucht. Ertrank mit ihren Kindern, als das Schiff im Sturm auf ein Riff lief.' },
  { id: 'arvel-skellor', name: 'Arvel Skellor', sex: 'male', birth: '1699', death: '', role: 'Der Schwarze Zitteraal · überlebender Namensträger', lineageRole: 'head', bio: 'Einziger Überlebender des Fluchtschiffs von 1720. Führt seit beinahe zwanzig Jahren die Schwarzen Zitteraale. Besitzt weder Creigfryn noch eine anerkannte Lehnsherrschaft; betrachtet sich selbst als rechtmäßigen Erben.', portrait: ARVEL_CURRENT_PORTRAIT, characterId: ARVEL_CHARACTER_ID },
  { id: 'eirlys-talinvyr', name: 'Eirlys Talinvyr', sex: 'female', birth: '1700', death: '1720', role: 'Arvels Gemahlin', familyRole: 'married', houseId: 'house-talinvyr', bio: 'Tochter des bislang nicht weiter ausgearbeiteten Ritterhauses Talinvyr aus Celtigerns Wacht. Heiratete Arvel 1720 und erwartete ihr erstes Kind. Ertrank während der Flucht von Creigfryn; das ungeborene Kind überlebte ebenfalls nicht.' },
  { id: 'alys-skellor', name: 'Alys Skellor', sex: 'female', birth: '1702', death: '1720', role: 'Arvels jüngere Schwester', bio: 'Die ältere von Arvels beiden Schwestern war achtzehn Jahre alt. Sie ertrank beim Schiffbruch auf der Flucht von Creigfryn.' },
  { id: 'nerys-skellor', name: 'Nerys Skellor', sex: 'female', birth: '1706', death: '1720', role: 'Arvels jüngste Schwester', bio: 'Die jüngste Tochter Rhydans und Enids war vierzehn Jahre alt. Sie ertrank mit den übrigen Flüchtenden; Arvel blieb als Einziger am Leben.' },
  { id: 'iorren-skellor', name: 'Iorren Skellor', sex: 'male', birth: '1703', death: '1720', role: 'Cadfans Sohn · Arvels Vetter', bio: 'Siebzehnjähriger Knappe der jüngeren Linie. Ertrank mit seiner Mutter und seiner Schwester auf dem Fluchtschiff.' },
  { id: 'catrin-skellor', name: 'Catrin Skellor', sex: 'female', birth: '1708', death: '1720', role: 'Cadfans Tochter · Arvels Cousine', bio: 'Zwölfjährige Tochter Cadfans und Olwens. Ertrank beim Versuch, während des Sturms das Festland zu erreichen.' }
].map(person => Object.freeze({ ...person, familyRole: person.familyRole || 'core', houseId: person.houseId ?? (person.familyRole === 'married' ? '' : 'house-skellor'),
  worldPersonId: person.id === 'arvel-skellor' ? ARVEL_WORLD_PERSON_ID : `person--${person.id === 'eirlys-talinvyr' ? 'haus-talinvyr' : 'haus-skellor'}--${person.id}`,
  portrait: person.portrait || `${SKELLOR_ART}/${person.id}.png` })));

export const skellorPerson = id => {
  const person = SKELLOR_PEOPLE.find(person => person.id === id);
  if (!person) throw new Error(`Unbekannte Skellor-Person: ${id}`);
  return person;
};
