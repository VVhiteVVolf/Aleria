import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';

export const COURT_ART_ROOT = '../AleriaAlmanach/assets/gwynthor-erbstreit';
export const COURT_EMBLEMS = Object.freeze({
  cochdon: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Cochdon.png',
  twyllod: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Twyllod.png',
  llafnfor: 'assets/images/houses/Klaueninsel/haus-llafnfor.png',
  swyll: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png'
});

export const GWRGAN_COCHDON = Object.freeze(createFamilyPerson({
  id: 'gwrgan-cochdon', name: 'Gwrgan Cochdon', sex: 'male', birth: '1697',
  houseId: 'house-cochdon', title: 'Heimgekehrter Seehändler · Kläger',
  portrait: `${COURT_ART_ROOT}/portraits/gwrgan-cochdon.png`,
  notes: 'Gebürtiger Gwynthorer. Zog mit seinen drei Brüdern mit Rhodri Draigs Aufgebot nach Vennyr. Nach der Schlacht der tausend Wellen 1720 geriet er als einzig überlebender Bruder in nordische Gefangenschaft. Sechs Jahre Minenarbeit, danach bis 1737 zunehmende Verantwortung als Thrallführer des Clans Valdruna; anschließend drei Jahre Hafenaufsicht und Fluchtvorbereitung. Entkam 1740 mit fünfzig weiteren Thralls. Cynfarch Llafnfor rettete ihn und zwölf Mitflüchtende vor den Verfolgern; 38 starben. Nach der Heimkehr bestreitet er die Folgen seiner Todesannahme für Vermögen und Ehe. Seine Forderungen sind keine bereits feststehenden Gerichtsurteile.',
  extensions: { registryManagedFields: ['portrait', 'title', 'notes'] }
}));

export const LLEUCU_SWYLL = Object.freeze(createFamilyPerson({
  id: 'lleucu-swyll', name: 'Lleucu Swyll', sex: 'female', birth: '1702',
  houseId: 'house-swyll', title: 'Reederin · Mitglied des Marktes der Fortuna',
  portrait: `${COURT_ART_ROOT}/portraits/lleucu-swyll.png`,
  notes: '38 Jahre. Tochter Emyr Swylls und Tegwens, Zwillingsschwester Rhodri Swylls. Nach der vermuteten Niederlage und dem Verlust Gwrgans 1720 zunächst achtzehnjährige Frau eines verschollenen Seehändlers. Gwrgan wurde 1724 amtlich für tot erklärt. Sein Vater vererbte ihr 1728 den verbliebenen Besitz ausdrücklich. Mit Anschubhilfe ihrer Verwandten verkaufte sie eines der beiden heruntergekommenen Schiffe und baute mit Eifion Twyllod den Betrieb neu auf. Heute fünf Handelsschiffe und gegenüber der damaligen Lage vervierfachtes Vermögen. Heiratete Eifion 1729 nach anerkannter Witwenschaft; drei gemeinsame Kinder. Mit Gwrgan hat sie kein Kind. Erkennt den Heimkehrer als Gwrgan an; der Ausgang seines Gesuchs ist offen.',
  extensions: { twinGroupId: 'twins-rhodri-lleucu-swyll-1702', registryManagedFields: ['portrait', 'title', 'notes'] }
}));

export const EIFION_TWYLLOD = Object.freeze(createFamilyPerson({
  id: 'eifion-twyllod', name: 'Eifion Twyllod', sex: 'male', birth: '1696',
  houseId: 'house-twyllod', title: 'Kapitän des Hauptschiffes · Lleucus zweiter Ehemann',
  portrait: `${COURT_ART_ROOT}/portraits/eifion-twyllod.png`,
  notes: '44 Jahre. Jüngerer Bruder Arian Twyllods, aus einer gewöhnlichen Fischerfamilie in Gwynthors Bannkreis. Erarbeitete sich sein Können und seine Stellung auf See. Arbeitete für die Cochdon und stand Lleucu nach dem Verlust ihres Mannes im Alltag und beim Aufbau des Betriebes bei. Aus Beistand entstand Liebe. Führt heute das Hauptschiff und hält die Arbeit der fünf Schiffe zusammen. Vater von drei Kindern mit Lleucu. Die Vorgeschichte seiner Herkunftsfamilie um Eithne, Arian und Glendower bleibt bestehen; Eifions konkrete damalige Haltung wird nicht nachträglich als belegt ausgegeben.',
  extensions: { registryManagedFields: ['portrait', 'title', 'notes'] }
}));

export const CYNFARCH_LLAFNFOR = Object.freeze(createFamilyPerson({
  id: 'cynfarch-llafnfor', name: 'Cynfarch Llafnfor', sex: 'male', birth: '1694',
  houseId: 'house-llafnfor', title: 'Ritterherr der Dyfrgi · Kapitän und Gwrgans Retter',
  portrait: `${COURT_ART_ROOT}/portraits/cynfarch-llafnfor.png`,
  notes: '46 Jahre. Treuer Vasall des Hauses Dyfrgi von Caer Cryftlawd. Rettete auf Patrouille unweit der Klaueninseln Gwrgan Cochdon und zwölf weitere geflohene Thralls, vertrieb ihre Verfolger und sorgte für eine fürsorgliche Heimführung. Gwrgan verbindet mit ihm verlässliche Freundschaft. Die weitere Verwandtschaft und ein eigener Familiensitz sind noch nicht ausgearbeitet.',
  extensions: { registryManagedFields: ['portrait', 'title', 'notes'] }
}));

export const VALERIANO_FALTO = Object.freeze(createFamilyPerson({
  id: 'valeriano-falto', name: 'Valeriano Falto', sex: 'male', birth: '1702',
  houseId: 'house-falto', title: 'Gildenfürsprecher des Marktes der Fortuna · Gwynthor',
  portrait: `${COURT_ART_ROOT}/portraits/valeriano-falto.png`,
  notes: '38 Jahre. Angehöriger des venalysischen Magnarierhauses Falto im Dienst der Vinicius. In Venalys ausgebildeter Fürsprecher, in Gwynthor für Erb-, Eigentums-, Vertrags- und vergleichbare Angelegenheiten der Gildenmitglieder tätig. Von Fortuna zur Vertretung Lleucu Swylls bestellt. Sehr hellblaues stark gelocktes Haar, sehr helle blaue Augen und gelockter hellblauer Bart. Seine professionelle Interessenvertretung begründet keine unterstellte Unredlichkeit.',
  extensions: { registryManagedFields: ['portrait', 'title', 'notes'] }
}));

export const LLEUCU_FIRST_MARRIAGE = Object.freeze(createMarriage(
  'marriage-gwrgan-cochdon-lleucu-swyll', GWRGAN_COCHDON.id, LLEUCU_SWYLL.id,
  { start: '1720', end: '1724', status: 'ended',
    notes: '1724 infolge der amtlichen Todesannahme als beendet behandelt. Gwrgan lebt und kehrte 1740 zurück. Die Rechtsfolgen für diese und die zweite Ehe sind Gegenstand des noch offenen Verfahrens; keine belegte Scheidung und kein neues Urteil vorwegnehmen.',
    extensions: { endedByPresumedDeath: true, returneeLegalStatus: 'pending', registryManagedFields: ['notes', 'extensions'] } }
));
export const LLEUCU_SECOND_MARRIAGE = Object.freeze(createMarriage(
  'marriage-eifion-twyllod-lleucu-swyll', EIFION_TWYLLOD.id, LLEUCU_SWYLL.id,
  { start: '1729', notes: 'Nach anerkannter Witwenschaft geschlossen. Gwrgan bestreitet die Rechtsfolgen; ein Gerichtsurteil hierzu liegt noch nicht vor.' }
));

export const TWYLLOD_CHILDREN = Object.freeze([
  createFamilyPerson({ id: 'gwenfor-twyllod', name: 'Gwenfor Twyllod', sex: 'male', birth: '1730', houseId: 'house-twyllod', notes: 'Ältestes der drei Kinder Eifions und Lleucus.' }),
  createFamilyPerson({ id: 'eirwen-twyllod', name: 'Eirwen Twyllod', sex: 'female', birth: '1733', houseId: 'house-twyllod', notes: 'Tochter Eifions und Lleucus.' }),
  createFamilyPerson({ id: 'nudd-twyllod', name: 'Nudd Twyllod', sex: 'male', birth: '1736', houseId: 'house-twyllod', notes: 'Jüngstes der drei Kinder Eifions und Lleucus.' })
]);
export const TWYLLOD_CHILD_PARENTAGES = Object.freeze(createParentages(
  TWYLLOD_CHILDREN.map(p => p.id), [EIFION_TWYLLOD.id, LLEUCU_SWYLL.id], LLEUCU_SECOND_MARRIAGE.id,
  { legitimacy: 'legitimate', notes: 'Kinder der anerkannt geschlossenen zweiten Ehe. Gwrgans gegenteilige Forderung ist kein festgestellter Personenstand.' }
));
