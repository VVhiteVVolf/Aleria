import { createFamilyPerson, createParentages } from './family-record-builders.js';

const MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole', 'lineageRole', 'tags', 'notes'
]);

const RETINUE_BRANCHES = Object.freeze({
  'haus-baerenherz': {
    focusPersonId: 'ragna-baerenherz',
    description: 'Huskarlclan aus Rorikshall im Jarltum Roriksheim. Ragna und ihre jüngere Schwester Svala gehören Skallis Gefolge an. Die Bärenherz tragen hellblondes Haar mit einem weißen Verlauf zu den Spitzen. Die weitere Clanfolge ist noch nicht ausgearbeitet.',
    people: [
      { id: 'ragna-baerenherz', name: 'Ragna Bärenherz', sex: 'female', birth: '1716',
        title: 'Rechte Hand Skallis · Walküre', tags: ['Skallis Gefolge', 'Rechte Hand', 'Walküre', 'Unverheiratet'],
        notes: 'Im Jahr 1740 vierundzwanzig Jahre alt und unverheiratet. Rechte Hand Skalli Varulvs in ihrer Kriegerschar. Drittes Kind ihrer Eltern; die älteren Geschwister sind noch nicht ausgearbeitet. Ihre jüngere Schwester Svala wird als zweite Maer von Skalli ausgebildet. Hellblondes Haar mit weißem Verlauf zu den Spitzen.' },
      { id: 'svala-baerenherz', name: 'Svala Bärenherz', sex: 'female', birth: '1724',
        portrait: 'assets/images/portraits/haus-baerenherz/svala-baerenherz-v2.png',
        title: 'Maer von Skalli Varulv', tags: ['Skallis Gefolge', 'Maer', 'In Ausbildung', 'Unverheiratet'],
        notes: 'Ragnas jüngere Schwester; im Jahr 1740 sechzehn Jahre alt und unverheiratet. Zweite Maer von Skalli Varulv neben Gundel Varulv. Maer ist die aldrimarische Bezeichnung für eine weibliche Knappe. Ihre Ausbildung erfolgt unter Skallis Aufsicht. Hellblondes Haar mit weißem Verlauf zu den Spitzen.' }
    ],
    sharedSiblingParents: ['ragna-baerenherz', 'svala-baerenherz']
  },
  'haus-rotstahl': {
    focusPersonId: 'torben-rotstahl',
    description: 'Huskarlclan aus Rorikshall im Jarltum Roriksheim. Torben Rotstahl dient als Skallis Linke Hand; der vierzehnjährige Kjell lernt bei ihm als Drengr. Die ältere Clanfolge und der genaue Verwandtschaftsweg zwischen beiden bleiben offen.',
    people: [
      { id: 'torben-rotstahl', name: 'Torben Rotstahl', sex: 'male', birth: '1714',
        title: 'Linke Hand Skallis · Huskarl', tags: ['Skallis Gefolge', 'Linke Hand', 'Huskarl', 'Unverheiratet'],
        notes: 'Im Jahr 1740 sechsundzwanzig Jahre alt und unverheiratet. Linke Hand Skalli Varulvs in ihrer Kriegerschar. Zweites Kind; Eltern und ältere Geschwister sind noch nicht ausgearbeitet. Bildet Kjell Rotstahl als Drengr aus. Kjell ist als sein Vetter vorgesehen; der genaue Abstammungsweg ist noch nicht festgelegt. Blond und mit stark gelocktem Haar; trägt rotgraue Huskarlrüstung und das Schild des Clans Rotstahl.' },
      { id: 'kjell-rotstahl', name: 'Kjell Rotstahl', sex: 'male', birth: '1726',
        title: 'Drengr von Torben Rotstahl', tags: ['Skallis Gefolge', 'Drengr', 'In Ausbildung', 'Unverheiratet'],
        notes: 'Im Jahr 1740 vierzehn Jahre alt und unverheiratet. Drengr von Torben Rotstahl in Skallis Gefolge; Drengr bezeichnet hier einen männlichen Knappen in Ausbildung. Als Torbens Vetter vorgesehen. Seine Eltern und der genaue Verwandtschaftsweg bleiben bis zur Ausarbeitung der Clanlinie unbenannt; es wird keine Abstammung behauptet.' }
    ]
  },
  'haus-unholdbann': {
    focusPersonId: 'hakon-unholdbann',
    description: 'Huskarlclan aus Rorikshall im Jarltum Roriksheim. Hakon Unholdbann gehört als Reiter und Kundschafter zu Skallis Kriegerschar. Seine Eltern und die übrige Clanfolge sind noch nicht ausgearbeitet.',
    people: [
      { id: 'hakon-unholdbann', name: 'Hakon Unholdbann', sex: 'male', birth: '1717',
        title: 'Reiter und Kundschafter · Skallis Gefolge', tags: ['Skallis Gefolge', 'Huskarl', 'Reiter', 'Kundschafter', 'Unverheiratet'],
        notes: 'Im Jahr 1740 dreiundzwanzig Jahre alt und unverheiratet. Reiter und Kundschafter in Skalli Varulvs Gefolge. Dunkelblondes Haar und ein frecher kurzer Kinnbart. Eltern, Geschwister und Geburtenfolge sind noch nicht festgelegt.' }
    ]
  }
});

function retinuePerson(familyId, data) {
  return createFamilyPerson({ ...data, houseId: familyId.replace(/^haus-/, 'house-'),
    portrait: data.portrait || `assets/images/portraits/${familyId}/${data.id}.png`,
    extensions: { registryManagedFields: MANAGED_PERSON_FIELDS }
  });
}

function unnamedSiblingParents(familyId) {
  return ['male', 'female'].map((sex, index) => createFamilyPerson({
    id: `${familyId}-ragna-svala-parent-${index + 1}`, name: '???', sex,
    worldPersonId: `person--${familyId}--${familyId}-ragna-svala-parent-${index + 1}`,
    houseId: '', familyRole: index === 0 ? 'core' : 'married', status: 'unknown',
    title: `Nicht benanntes Elternteil von Ragna und Svala`,
    notes: 'Struktureller Platzhalter für die belegte Geschwisterverbindung. Name, Lebensdaten, Herkunft und eine etwaige Ehe sind nicht festgelegt. Keine Verbindung zum historischen Gründerpaar behauptet.',
    extensions: { structuralPlaceholder: true }
  }));
}

// Extend only the three commissioned clan branches. The existing unnamed
// founders remain intact; no unsupported path connects them to the new people.
export function extendRorikshallSkalliRetinueFamily(base) {
  const branch = RETINUE_BRANCHES[base.document.id];
  if (!branch) return base;
  const parents = branch.sharedSiblingParents ? unnamedSiblingParents(base.document.id) : [];
  const people = branch.people.map(data => retinuePerson(base.document.id, data));
  return Object.freeze({
    ...base,
    document: Object.freeze({ ...base.document, description: branch.description }),
    persons: Object.freeze([...base.persons, ...parents, ...people]),
    parentages: Object.freeze([...base.parentages, ...(parents.length
      ? createParentages(branch.sharedSiblingParents, parents.map(person => person.id), '', {
        legitimacy: 'unknown', notes: 'Gemeinsame unbenannte Eltern der Schwestern Ragna und Svala; keine darüber hinausgehende Abstammung festgelegt.'
      }) : [])]),
    view: Object.freeze({ ...base.view, focusPersonId: branch.focusPersonId }),
    extensions: Object.freeze({
      ...base.extensions, blankFamily: false, sourceRevision: 2,
      sourceNote: 'Skallis Gefolge · Nutzervorgaben vom 18.10.2026. Nur die beauftragten jungen Clanangehörigen ergänzt. Bestehende Gründerplatzhalter und ihre IDs bleiben erhalten. Die Verbindung zu diesen Gründern ist unbekannt. Eltern der Bärenherz-Schwestern sind ausschließlich unbenannte Strukturplätze ohne erfundene Ehe oder Lebensdaten; Kjells mögliche Vetternschaft wird nicht als unbelegte Abstammung eingetragen.',
      registryManagedDocumentFields: Object.freeze(['description']),
      registryManagedExtensionFields: Object.freeze(['blankFamily', 'sourceNote']),
      registryManagedViewFields: Object.freeze(['focusPersonId'])
    })
  });
}
