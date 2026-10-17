export const BATHHOUSE_ART = './assets/gwynthor-bathhouse';
export const FONTANI_EMBLEM = '../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Fontani.png';

// Pure shared records: the almanac and genealogy use the same identities.
export const FONTANI_PEOPLE = Object.freeze([
  { id: 'cassiano-fontani', worldPersonId: 'person--haus-fontani--cassiano-fontani',
    name: 'Cassiano Lucius Fontani', sex: 'male', birth: '1691', age: 49,
    role: 'Inhaber und Badermeister', portrait: `${BATHHOUSE_ART}/portraits/cassiano.png`,
    bio: 'Aus dem Kaiserreich Argentum gebürtig, kam Cassiano als junger Mann zu seiner bereits seit Generationen in Gwynthor ansässigen Familie. Heute führt er das ererbte Badehaus mit ruhiger Aufmerksamkeit und dem Stolz eines Handwerkers, der sein Haus vom Feuerzug bis zum frischen Leinen kennt.',
    appearance: '49-jähriger menschlicher Mann; sehr hellbraunes, kurz gelocktes Haar und ein kurzer gepflegter Bart in derselben Haarfarbe; silbergraue Augen. Breite Nase, kräftige Brauen, reife Lachfalten. Cremefarbenes Hemd, dunkelblaue Weste und braune Arbeitsschürze. Entspannt stehend, Dreiviertelansicht nach rechts, Arme locker.' },
  { id: 'livia-fontani', worldPersonId: 'person--haus-fontani--livia-fontani',
    name: 'Livia', sex: 'female', birth: '1694', age: 46, maidenHouseUnknown: true,
    role: 'Hausführung, Empfang und Wäsche', portrait: `${BATHHOUSE_ART}/portraits/livia.png`,
    bio: 'Cassianos Gemahlin führt den Empfang und den Haushalt des Badehauses. Sie kennt die Wünsche der Stammgäste, behält Vorräte und Wäsche im Blick und setzt die Sauberkeit des Hauses mit freundlicher Bestimmtheit durch. Ihr Herkunftshaus ist noch nicht festgelegt.',
    appearance: '46-jährige menschliche Frau; sehr hellbraunes, voluminös gelocktes Haar, locker halb hochgesteckt, silbergraue Augen. Rundliches Gesicht, lebhafte Augenbrauen, erkennbare reife Lachfältchen. Cremefarbenes und schieferblaues cenyrisch-argentisches Alltagskleid mit langen Ärmeln, schlichte Messingbrosche. Entspannt stehend nach links, eine Hand an der Hüfte, anderer Arm locker.' },
  { id: 'terenzio-fontani', worldPersonId: 'person--haus-fontani--terenzio-fontani',
    name: 'Terenzio Fontani', sex: 'male', birth: '1716', age: 24,
    role: 'Wasser- und Heizwerk, Bader in Ausbildung', portrait: `${BATHHOUSE_ART}/portraits/terenzio.png`,
    bio: 'Der in Gwynthor geborene Sohn Cassianos und Livias erlernt das Baderhandwerk. Er betreut Brunnen, Vorratsbehälter und Feuerzüge, teilt mit dem Heizer die Arbeit ein und achtet darauf, dass Wärme und Wasser rechtzeitig bereitstehen. Er ist unverheiratet.',
    appearance: '24-jähriger menschlicher Mann; sehr hellbraunes, mittellanges dicht gelocktes Haar, silbergraue Augen, glatt rasiert. Längeres schmaleres Gesicht als sein Vater, jugendlich, kräftige Unterarme. Elfenbeinfarbenes hochgekrempeltes Hemd und dunkelblaue Hüftschürze. Frontal stehend mit Gewicht auf einem Bein, eine Hand am Gürtel, andere locker.' }
]);

export const [CASSIANO, LIVIA, TERENZIO] = FONTANI_PEOPLE;
