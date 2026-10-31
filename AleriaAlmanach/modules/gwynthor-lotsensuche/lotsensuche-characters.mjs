// Public character records and notice identities share one source.
const portraits = '/AleriaAlmanach/assets/gwynthor-lotsensuche/portraits';
const timestamp = '2026-10-31T00:00:00Z';

export const LOTSENSUCHE_PEOPLE = Object.freeze({
  vebrand: Object.freeze({ id: 'vebrand-wolfsruf', name: 'Vébrand Wolfsruf', age: 43,
    portrait: `${portraits}/vebrand-wolfsruf.png`, handwriting: 'schoolbell', signature: 'vebrand-unterschrift-v1.webp' }),
  rob: Object.freeze({ id: 'rob-gwynthor-tageloehner', name: 'Rob', age: 33,
    portrait: `${portraits}/rob.png`, handwriting: 'kalam' }),
});

function biography(person, stats, text, traits) {
  return { schema: 'aleria.biography-module', schemaVersion: 1,
    stats: stats.map(([label, value]) => ({ label, value })), quote: '', quoteBy: '',
    biography: { portrait: person.portrait, portraitFit: 'cover', crestImage: '',
      biographyTitle: person.name, biographyText: text,
      abilitiesTitle: 'Auftreten', abilities: traits.map(([title, detail]) => ({ title, detail, icon: '' })),
      worksTitle: 'Tätigkeit', works: [], backgroundTitle: 'Weitere Angaben', backgroundText: '',
      portraitStages: [], portraitCaptions: [] } };
}

export function buildLotsensucheCharacterExports() {
  const vebrand = LOTSENSUCHE_PEOPLE.vebrand;
  const rob = LOTSENSUCHE_PEOPLE.rob;
  const profiles = [
    { person: vebrand, title: 'Freiberuflicher Blutbundsöldner', fraktion: 'Blutbund',
      bio: 'Vébrand Wolfsruf, 43 Jahre, stammt aus Ulfsstad im aldrimarischen Dämmergrund. Seine Familie gehörte zur örtlichen Priesterschaft. Mit fünfzehn verließ er diesen Weg und schloss sich dem Blutbund an. Seitdem verdient er seinen Lebensunterhalt als Söldner, ohne ein eigenes Banner zu führen.\n\nSeit vier Jahren nimmt er über den Blutbund Vertragsarbeit für einen Mathragoner Auftraggeber an. Die Bezahlung ist gut; über weitere Geschäfte seines Auftraggebers stellt er keine Fragen. Gegenwärtig hält er sich beruflich in Gwynthor auf und sucht ortskundige Unterstützung.\n\nBlondes Haar im Nacken, ein langer breiter Bart und eine aus unterschiedlichen Stücken zusammengesetzte Rüstung prägen sein Auftreten. In seinen Harnisch ist eine Faust eingraviert. Er redet unverblümt und schreibt mit deutlich mehr Entschlossenheit als Übung.',
      stats: [['Name', vebrand.name], ['Alter', '43 Jahre'], ['Herkunft', 'Ulfsstad · Dämmergrund · Aldrimar'],
        ['Stand', 'Söldner'], ['Verbindung', 'Blutbund'], ['Derzeit', 'Gwynthor']],
      text: '<p>Vébrand Wolfsruf stammt aus einer Priesterfamilie in Ulfsstad, einer Waldsiedlung im aldrimarischen Dämmergrund. Das Leben der Priesterschaft wollte er nicht übernehmen. Mit fünfzehn ging er zum Blutbund und suchte sich seinen eigenen Erwerb mit der Klinge.</p><p>Heute ist er dreiundvierzig und arbeitet freiberuflich, ohne eigenes Banner. Seit vier Jahren vermittelt ihm der Blutbund feste Vertragsarbeit für einen Mathragoner Auftraggeber. Solange der Sold stimmt, hält Vébrand sich mit Fragen nach dessen übrigen Unternehmungen zurück.</p><p>Seine Ausrüstung ist über viele Jahre zusammengekommen: Kettenzeug, unterschiedlich gearbeitete Schulterstücke, Leder und ein verbeulter Harnisch mit eingravierter Faust. Er trägt blondes Haar, im Nacken lang, und einen dichten breiten Bart. Derzeit arbeitet er in Gwynthor. Seine unverblümten Worte und seine unbeholfene Handschrift machen ihn auf der Anzeigetafel leicht erkennbar.</p>',
      traits: [['Pragmatischer Erwerb', 'Nimmt Arbeit an, wenn Auftrag und Bezahlung für ihn passen.'],
        ['Zusammengesuchte Ausrüstung', 'Behält und ersetzt brauchbare Rüstungsteile nach Bedarf.'],
        ['Unverblümte Worte', 'Spricht direkt und wird bei Ärger rasch ausfällig.']] },
    { person: rob, title: 'Tagelöhner', fraktion: '',
      bio: 'Rob ist ein dreiunddreißigjähriger Tagelöhner, der sich in Gwynthor mit wechselnden Hilfsarbeiten verdingt. Er trägt braunes Haar, ist glatt rasiert und kleidet sich schlicht. Mit seinem lockeren Mundwerk kommt er rasch ins Gespräch und hat zu vielen Dingen eine freche Bemerkung bereit.\n\nEr nimmt kleinere Besorgungen und Botengänge an und ist bei der Suche nach Tagesarbeit im Hafen und den umliegenden Straßen anzutreffen.',
      stats: [['Name', 'Rob'], ['Alter', '33 Jahre'], ['Tätigkeit', 'Tagelöhner'], ['Aufenthalt', 'Gwynthor']],
      text: '<p>Rob verdient sich in Gwynthor seinen Unterhalt mit wechselnden Tagesarbeiten. Er hilft bei kleineren Besorgungen, übernimmt Botengänge und sucht im Hafenviertel nach dem nächsten Verdienst.</p><p>Der dreiunddreißigjährige Mann trägt braunes Haar und ein glatt rasiertes Gesicht. Seine Kleidung ist schlicht und alltagstauglich. Er redet ungezwungen, grinst gern und lässt eine Gelegenheit für eine freche Antwort selten aus. Im Gespräch gibt er sich umgänglich und findet schnell Anschluss.</p>',
      traits: [['Gesprächig', 'Kommt mit anderen Leuten rasch ins Gespräch.'], ['Freches Mundwerk', 'Hat oft eine spöttische oder schlagfertige Bemerkung bereit.'],
        ['Wechselnde Arbeit', 'Nimmt kleinere Hilfsarbeiten und Besorgungen an.']] },
  ];
  return profiles.map(profile => ({ type: 'aleria-character', version: 1, exportedAt: timestamp, assignedTab: 'Gwynthor',
    character: { id: profile.person.id, name: profile.person.name, title: profile.title, fraktion: profile.fraktion,
      portrait: profile.person.portrait, bio: profile.bio, status: 'Lebend', archived: false,
      createdAt: timestamp, updatedAt: timestamp,
      imageSets: [{ id: 'standard', name: 'Standard', portrait: profile.person.portrait, emotes: [] }],
      activeImageSetId: 'standard', imageSetSchemaVersion: 1,
      biography: biography(profile.person, profile.stats, profile.text, profile.traits) } }));
}
