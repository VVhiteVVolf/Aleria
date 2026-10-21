import { ARKANEUM_PEOPLE } from '../../../AleriaAlmanach/modules/arkaneum/arkaneum-people.mjs';

export const HERLUIN_MISSING_NOTICE_ID = 'gwynthor-herluin-angestellte-vermisst';

// Herluin's identification sheets stay visual; his pedantic asides are his own.
// Address readers as Ihr/Euch, never with the modern formal Sie.
const employeeLetters = {
  cyrwyn: [
    '<p><strong>Cyrwyn</strong>, Cenyri, fünfundvierzig Jahre. Rotes Haar und roter Bart, gewöhnlich unter beziehungsweise vor einer braunen Kapuze. Er trägt eine gebrauchte Lederrüstung, einen Köcher auf dem Rücken und ein Schwert am Gürtel; dazu einen Bogen.</p>',
    '<p>Das Leder ist an den Kanten abgeschabt und von jenem stumpfen Braun, das sein Träger als „noch vollkommen brauchbar“ bezeichnet. Ich würde „museumswürdig“ vorziehen. Achtet zur Wiedererkennung auf die Verbindung von brauner Kapuze und rotem Bart; eine ungepflegte Lederrüstung allein dürfte im Hafenviertel leider wenig eingrenzen.</p>',
    '<p>Herluin Lothaire<br>Arkaneum am Park, nahe dem Badehaus</p>',
  ].join(''),
  torvald: [
    '<p><strong>Torvald</strong>, Aldrimarer, einundvierzig Jahre. Sehr breite Schultern, kräftiger Hals, ausgeprägt kantige Gesichtszüge. Blaue Augen, blondes Haar, am Hinterkopf zusammengebunden, und ein kurzer, voller blonder Bart. Zuletzt trug er Kettenzeug unter einem schlichten Wollmantel.</p>',
    '<p>Die Schulterbreite auf der Zeichnung ist kein perspektivischer Fehler. Der Mann ist tatsächlich so beschaffen. Überhaupt zeigt seine Anatomie eine bemerkenswerte Vorliebe für rechte Winkel; solltet Ihr zwischen zwei Beschreibungen schwanken, wählt die kantigere.</p>',
    '<p>Herluin Lothaire<br>Am Park von Gwynthor, nahe dem Badehaus</p>',
  ].join(''),
  rioneth: [
    '<p><strong>Rioneth</strong>, Albin, sechsunddreißig Jahre. Brünette Haare, zu einem langen seitlichen Zopf geflochten; an einer Schläfe deutlich kürzer geschnitten. Bernsteinbraune Augen. Waldgrüner Mantel über praktischer Lederkleidung.</p>',
    '<p>Die ungleiche Haarlänge ist beabsichtigt und sollte Euch die Zuordnung erleichtern. Ferner eine ausgesprochen ansehnliche Frau. Diese Feststellung dient ausschließlich der Präzision der Personenbeschreibung; ich ersuche darum, sie Rioneth gegenüber nicht als wörtliche Äußerung meinerseits anzuführen.</p>',
    '<p>Herluin Lothaire<br>Arkaneum am Park, nahe dem Badehaus</p>',
  ].join(''),
};
export function buildHerluinMissingNotice() {
  const herluin = ARKANEUM_PEOPLE.find(person => person.id === 'herluin-lothaire');
  const missing = ['cyrwyn', 'torvald', 'rioneth'].map(id => {
    const person = ARKANEUM_PEOPLE.find(person => person.id === id);
    if (!person) throw new Error(`Beschaffer fehlt: ${id}`);
    return person;
  });
  const portrait = `../AleriaAlmanach/${herluin.portrait.slice(2)}`;
  const signature = 'assets/images/quests/herluin-angestellte-vermisst/unterschrift-v1.png';
  return {
    id: HERLUIN_MISSING_NOTICE_ID, typ: 'quest',
    stackId: HERLUIN_MISSING_NOTICE_ID, stackOrder: 0,
    noticeGroupId: HERLUIN_MISSING_NOTICE_ID,
    rewards: [{ kind: 'money', currency: 'silver', amount: 5 }],
    // Original board: 4096×3072. Nail centered on the upper-left fastening of
    // the painted "Vermisst!" sheet shown in the user's crop: pixel 2883/1509.
    x: 2883 / 4096, y: 1509 / 3072,
    title: 'Angestellte Vermisst!', untertitel: 'Dringendes Ersuchen aus Lothaires Arkaneum',
    text: [
      '<p>An ruinenerfahrene Abenteurer und Söldner von belastbarer Urteilskraft.</p>',
      '<p>Ich ersuche um <strong>unverzügliche Hilfe bei der Bergung dreier vermisster Mitarbeiter</strong>. <strong>Cyrwyn, Torvald und Rioneth</strong> wurden von mir zur Untersuchung und Sicherstellung möglicher Artefakte nach <strong>Glannadeor</strong> entsandt. Der vereinbarte Rückkehrtermin ist längst verstrichen. Es liegt weder eine Nachricht noch irgendeine anderweitige Erklärung für ihr Ausbleiben vor.</p>',
      '<p>Ich habe die Verzögerung zunächst der üblichen Diskrepanz zwischen meiner Zeitplanung und Cyrwyns Auffassung von Eile zugeschrieben. Diese Erklärung ist erschöpft. Ebenso meine Bereitschaft, Angehörigen an meiner Tür noch einmal zu versichern, man müsse vernünftigerweise abwarten. Diese Reise erfolgte auf meine Weisung.</p>',
      '<p>Ich benötige eine befähigte Gruppe, die <strong>nach Glannadeor aufbricht, die Ruine betritt und meine Leute nach Hause bringt</strong>. Die beigefügten Zeichnungen und Beschreibungen dienen ihrer Wiedererkennung. Etwaige Altertümer sind zurückzulassen, sobald sie die Bergung behindern. Ich bin durchaus imstande, den Verlust einer einzigartigen Inschrift zu verwinden. Über die erforderliche Dauer werde ich mich gegebenenfalls später beklagen.</p>',
      '<p>Für die <strong>sichere Rückführung aller drei Vermissten</strong> zahle ich <strong>insgesamt fünf Silbertaler</strong>. Zur Übernahme des Auftrags erscheint unverzüglich in <strong>Lothaires Arkaneum, am Park von Gwynthor nahe dem Badehaus</strong>. Ich werde Euch persönlich darlegen, welche Anweisungen sie erhielten und was mir über ihren Aufbruch bekannt ist. Sollte jemand von ihnen verletzt sein, hat dessen Versorgung selbstverständlich Vorrang vor der Vollständigkeit meines Berichts.</p>',
      '<p><strong>Bringt brauchbare Ausrüstung mit.</strong> Ich werde mich von ihrer Eignung überzeugen. Der Besitz eines Schwertes ist eine erfreuliche Voraussetzung, aber noch kein Bergungskonzept. Wer lediglich beabsichtigt, am Ruineneingang dreimal ihre Namen zu rufen, möge bitte einer anderen Beschäftigung nachgehen; dazu wäre ich selbst noch hinreichend qualifiziert.</p>',
      '<p>Und sollte Euch Rioneth erklären, ich hätte sie mit einer unvernünftig langen Sammelliste losgeschickt, widersprecht ihr meinetwegen nicht. Teilt ihr mit, dass ich die Liste persönlich kürzen werde. Darüber können wir uns streiten, sobald sie wieder hier ist.</p>',
      '<p><strong>Kommt heute. Ich benötige meine Leute zurück. Alle drei.</strong></p>',
    ].join(''),
    bild: '', portrait: '', verfasser: portrait, verfasserName: herluin.name,
    emblem: '../Stammb%C3%A4ume/assets/images/houses/Brevanor/Lothaire.png',
    unterschrift: signature,
    siegel: 'assets/images/quests/herluin-angestellte-vermisst/wachssiegel-v1.png',
    media: {
      verfasser: { kind: 'character', familyId: 'haus-lothaire', personId: herluin.id, name: herluin.name, src: portrait },
      // Present the horizontal ink within its square transparent source. The
      // generated PNG and its alpha remain unmodified.
      unterschrift: { kind: 'image', name: 'Herluin Lothaire – Unterschrift', src: signature, fit: 'cover', position: 'center' },
    },
    sideWidth: 180, imageFit: 'cover', imagePosition: 'top',
    table: [
      { k: 'Auftraggeber', v: herluin.name }, { k: 'Belohnung', v: '5 Silbertaler' },
      { k: 'Frist', v: 'Dringend, offen' }, { k: 'Zielort', v: 'Glannadeor · Suche in der Ruine und Rückführung' },
      { k: 'Gesucht', v: missing.map(person => person.name).join(' · ') },
      { k: 'Kontakt', v: 'Lothaires Arkaneum · am Park, nahe dem Badehaus' },
    ],
    artikel: [], personen: [], comments: [], secret: false,
  };
}

export function buildHerluinMissingNotices() {
  const quest = buildHerluinMissingNotice();
  const missing = ['cyrwyn', 'torvald', 'rioneth'].map(id => ARKANEUM_PEOPLE.find(person => person.id === id));
  return [quest, ...missing.map((person, index) => ({
    id: `${HERLUIN_MISSING_NOTICE_ID}-${person.id}`, typ: 'vermisst',
    stackId: HERLUIN_MISSING_NOTICE_ID, stackOrder: index + 1,
    noticeGroupId: HERLUIN_MISSING_NOTICE_ID,
    x: quest.x, y: quest.y, title: `Vermisst: ${person.name}`,
    untertitel: 'Personenbeschreibung zum Gesuch „Angestellte Vermisst!“',
    portrait: `assets/images/missing-sketches/${person.id}-v1.png`, verfasser: quest.verfasser,
    verfasserName: 'Herluin Lothaire', emblem: quest.emblem,
    unterschrift: quest.unterschrift, siegel: quest.siegel, media: structuredClone(quest.media),
    imageFit: 'cover', imagePosition: 'top', sideWidth: 240,
    text: employeeLetters[person.id],
    table: [{ k: 'Name', v: person.name }, { k: 'Alter', v: `${person.age} Jahre` },
      { k: 'Herkunft', v: person.culture }, { k: 'Tätigkeit', v: person.role },
      { k: 'Auftragsziel', v: 'Glannadeor' }, { k: 'Kontakt', v: 'Herluin Lothaire · Lothaires Arkaneum' }],
    artikel: [], personen: [], comments: [], secret: false,
  }))];
}
