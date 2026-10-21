export const KLAUE_ID = 'gwynthor-die-rote-klaue';
export const KLAUE_ART = './assets/rote-klaue';
export const VALERUS_EMBLEM = 'assets/images/houses/Venalys/haus-valerus.png';
export const VALERUS_FAMILY_LINK = '../Stammb%C3%A4ume/Stammbaum.html?family=haus-valerus&mode=view';
export const VALERUS_MOTTO = 'Was bleibt, hat Wert.';
const person = (key, name, sex, age, role, bio, appearance, extra = {}) => ({
  key, id: `klaue-${key}`, worldPersonId: `person--rote-klaue--${key}`, name, sex, age, birth: String(1740 - age),
  role, bio, appearance, portrait: `${KLAUE_ART}/portraits/${key}.png`, ...extra
});
export const KLAUE_FAMILY = Object.freeze([
  person('decian', 'Decian Valerus', 'male', 69, 'Gründer · ehemaliger Söldner der Roten Kompanie',
    '1667–1736. Nach langen Dienstjahren bei der Roten Kompanie gründete Decian 1712 mit seinem angesparten Sold und seiner Pension die Rote Klaue in Gwynthor. Er starb an einer Lebensmittelvergiftung. Einzelne Nachlassforderungen und die abschließende Teilung seines Vermögens sind weiterhin ungeklärt.',
    'Verstorbener Vater der Zwillinge; sein Harnisch wird im Laden auf einer Büste verwahrt.',
    { birth: '1667', death: '1736', culture: 'Venalys', portrait: '', familyRole: 'head' }),
  person('severina', 'Severina', 'female', 51, 'Mutter der Zwillinge · verstorben',
    '1678–1729. Decians Gemahlin und Mutter von Lucan und Camilla. Ihre Herkunftsfamilie ist nicht ausgearbeitet.',
    'Keine individuelle Bildüberlieferung.', { birth: '1678', death: '1729', culture: 'Venalys', portrait: '', familyRole: 'married' }),
  person('lucan', 'Lucan Valerus', 'male', 33, 'Mitinhaber · Darlehen und Kundenverträge',
    'Lucan nennt den Betrag zuerst, den ein Kunde heute erhalten könnte. Über den Preis des nächsten Monats spricht er erst, wenn der andere bereits erleichtert auf die Münzen schaut. Er und Camilla führen den geerbten Laden gemeinsam; ihre Einigkeit wiegt für beide schwerer als jede offene Frage im väterlichen Nachlass. Seit 1735 mit Aerwen verheiratet.',
    'Navyblaues lockiges Haar mit etwas helleren blauen Spitzen, dichter lockiger Bart, türkisgrüne Augen. Weinroter Händlerrock, Waage in einer Hand, selbstgefälliges Lächeln.',
    { culture: 'Venalys · in Gwynthor aufgewachsen', familyRole: 'core' }),
  person('camilla', 'Camilla Valerus', 'female', 33, 'Mitinhaberin · Bewertung und Pfandfreigaben',
    'Camilla legt Schmuck auf das Tuch, nennt jede Kerbe und wartet, bis der Besitzer selbst einen niedrigeren Wert für vernünftig hält. Sie teilt mit ihrem Zwillingsbruder Kasse und Entscheidungen. Aerwens Ansprüche duldet sie um Lucans willen; eine Stimme über seine Hälfte des Geschäfts räumt sie ihr deshalb noch lange nicht ein. Unverheiratet.',
    'Navyblaue Locken im hohen lockeren Knoten, an den Enden etwas heller blau; türkisgrüne Augen. Petrolfarbenes Kleid mit pflaumenfarbenen Ärmeln, geschlossenes Pfandbuch im Arm, prüfendes schiefes Lächeln.',
    { culture: 'Venalys · in Gwynthor aufgewachsen', familyRole: 'core' }),
  person('aerwen', 'Aerwen', 'female', 28, 'Lucans Gemahlin · Empfang und vermögende Kundschaft',
    'Eine Cenyri aus Aberon in der benachbarten Grafschaft Sonnenküste. Gute Gesellschaft, kostbare Kleidung und aufmerksame Bedienung hält sie für selbstverständliche Lebensumstände. Lucan gefällt ihr Auftreten; er erwartet von ihr keine Hausarbeit. Sie empfängt ausgewählte Kunden und pflegt Einladungen. Gegenüber Camilla wahrt sie eine kühle Höflichkeit.',
    'Aufwendige kupferrote Hochfrisur, grüne Augen, pompöses elfenbeinfarbenes und altgoldenes Kleid, Perlen und auffällige Schmuckstücke. Hebt das Kinn und betrachtet einen Ring an ihrer Hand; würdigt den Betrachter keines Blickes.',
    { culture: 'Cenyr · Aberon, Sonnenküste', familyRole: 'married' })
]);
export const KLAUE_STAFF = Object.freeze([
  person('cadwyst', 'Cadwyst', 'male', 52, 'Meier · Bücher, Fälligkeiten und Personal',
    'Führt Schuldbriefe, Quittungen, Löhne und Fristen. Er beantwortet Einwände mit der Stelle im Vertrag, die er bereits aufgeschlagen hat.',
    'Schmaler älterer Cenyri, graubraunes kurzes Haar mit zurückweichendem Ansatz, braune Augen, langer schmaler Schnurrbart, ockerfarbener Rock. Hält ein offenes Buch tief vor sich und blickt trocken über dessen Rand.', { culture: 'Cenyr' }),
  person('dewrys', 'Dewrys', 'male', 44, 'Pfandwart · Annahme, Lagerzeichen und Auslösung',
    'Prüft die Übereinstimmung von Pfandzettel, Zeichen und hinterlegtem Gegenstand. Holt Pfänder aus dem Magazin und führt die Listen anstehender Verwertungen; die Bewertung unterschreibt Camilla.',
    'Stämmiger Cenyri, dichtes kastanienbraunes Haar in geradem kurzem Schnitt, braune Augen, kleine Narbe im Kinn, bartlos. Graugrüne Weste und einfache Lederschürze. Ein Schlüsselbund locker in einer Hand, andere am Gürtel, geduldiger skeptischer Blick.', { culture: 'Cenyr' }),
  person('hroald', 'Hroald', 'male', 39, 'Legionär der Roten Kompanie · Tür und Schalter',
    'Ein grinsender Grobian mit gutem Gedächtnis für Gesichter. Hält sich am Eingang auf und lässt die Hand gern etwas zu lange auf einer Schulter liegen. Einer von drei dem Pfandhaus zugewiesenen Kompaniesöldnern.',
    'Breiter Aldrimarer, blondes geflochtenes Haar, dichter kurzer blonder Bart, blaue Augen, krumme Nase. Rote und goldene Kompanierüstung. Helm unter dem Arm, freches zahnlückiges Grinsen, Kopf leicht schief.', { culture: 'Aldrimar' }),
  person('kettil', 'Kettil', 'male', 35, 'Legionär der Roten Kompanie · Magazin und Hinterhof',
    'Spricht leise und lacht zuerst, wenn ein Kunde nervös wird. Kontrolliert Hintertür und Magazin. Er hat keinen Offiziersrang und untersteht beim Wachdienst dem örtlichen Auftrag der Kompanie.',
    'Hagerer Aldrimarer mit strohblonden schulterlangen Haaren, lockerer niedriger Bindung, hellblauen Augen, langem Schnurrbart und rauen Wangen. Rote und goldene Kompanierüstung. Unbedeckter Kopf, schultert eine Axt, schmieriges seitliches Grinsen.', { culture: 'Aldrimar' }),
  person('rhydog', 'Rhydog', 'male', 42, 'Legionär der Roten Kompanie · Begleitung und Hunde',
    'Begleitet Geld- und Pfandtransporte und führt die Hunde. Seine spöttischen Bemerkungen beendet er sofort, wenn Camilla den Raum betritt.',
    'Kräftiger Cenyri, kupferrote kurz rasierte Seiten und kurzer roter Haarschopf, grüne Augen, kurze rote Bartstoppeln, breite freche Miene. Rote und goldene Kompanierüstung ohne Helm. Beide Hände gelassen auf dem Knauf eines senkrecht abgestellten Schwertes.', { culture: 'Cenyr' }),
  person('eneth', 'Eneth', 'female', 31, 'Magd · Reinigung und Hausdienst',
    'Hält Schalter, Stufen und die oberen Zimmer sauber. An den verschlossenen Pfandschränken arbeitet sie nur, wenn Dewrys danebensteht. Sie weiß, welcher Legionär seine Stiefel nie abtritt.',
    'Cenyri mit kastanienrotem Haar in zwei eng gesteckten Flechten, graugrünen Augen, rundem Gesicht und Sommersprossen. Schlichtes taubenblaues Kleid, cremefarbene Schürze, entspannt stehend mit gefaltetem Tuch über dem Unterarm, müdes amüsiertes Lächeln.', { culture: 'Cenyr' })
]);
export const KLAUE_LIVING = Object.freeze([...KLAUE_FAMILY.filter(p => !p.death), ...KLAUE_STAFF]);
const bestiary = { id: 'tiere/vieh/haustiere/hunde/clachair', name: 'Clachair', url: '/Bestiarium/tiere/vieh/haustiere/hunde/clachair/index.html' };
export const KLAUE_DOGS = Object.freeze([
  { key: 'zoll', name: 'Zoll', age: 6, species: 'Clachair', role: 'Cenyrischer Wachhund · Eingang und Hof', portrait: `${KLAUE_ART}/pets/zoll.png`, bestiaryReference: bestiary,
    bio: 'Großer schwerer Rüde mit breiter Brust und dichtem graubraunem Fell. Sitzt am Hofzugang und hebt bei fremden Schritten den Kopf. Rhydog führt ihn; Kunden sollen ihn nicht anfassen.' },
  { key: 'pfand', name: 'Pfand', age: 4, species: 'Clachair', role: 'Cenyrischer Wachhund · Magazin und Nachtwache', portrait: `${KLAUE_ART}/pets/pfand.png`, bestiaryReference: bestiary,
    bio: 'Breite dunkelbraune Hündin mit dichtem Fell und schwerem Kopf. Liegt tagsüber an der Magazintür und folgt abends ihrem Hundeführer durch den Hof. Kein frei laufender Hund im Kundenraum.' }
]);
export const klauePerson = key => [...KLAUE_FAMILY, ...KLAUE_STAFF].find(p => p.key === key);
