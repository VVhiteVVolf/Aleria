import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { CADWGAN_ID, CADWGAN_NAME, CADWGAN_WORLD_PERSON_ID, CADWGAN_PORTRAIT, CADWGAN_FAMILY_EMBLEM, BWACH_WARRIOR, SUMPFNATTERN_ID, SUMPFNATTERN_LIEUTENANTS } from './sumpfnattern-people.mjs';

export const CADWGAN_SUMMARY = 'Cadwgan Bwach aus dem Haus Bwach in Gwaulwyn, genannt die Grüne Natter, führt die Sumpfnattern als Unterbande der Schwarzen Zitteraale. Im Großen Krieg diente er als Ritter unter den Gafyr. Nach der Plünderung eines albischen Dorfes in Ceitheach verlor er seinen Ritterstand und floh vor dem vorgesehenen Gerichtsverfahren. Seine heutige Bande handelt weitgehend nach eigenen Interessen und richtet sich besonders gegen die Herrschaft und Ländereien des Hauses Gafyr.';

export const CADWGAN_HISTORY = Object.freeze([
  { title: 'Haus Bwach aus Gwaulwyn', text: '<p>Cadwgan stammt aus dem Haus Bwach in Gwaulwyn. Dessen Familienwappen zeigt einen hellen Geißbock, der sich aufbäumt und eine sich windende grüne Natter unter seinen Hufen zertritt. Weinrot, Elfenbein und Dunkelgrün bestimmen das Wappen. Cadwgans heutiges Bandzeichen kehrt das Verhältnis der Tiere um: Dort beißt die Natter dem Bock in den Nacken.</p>' },
  { title: 'Ritter im Großen Krieg', text: '<p>Vor rund zwanzig Jahren zog Cadwgan als Ritter unter den Gafyr in den Großen Krieg. Er führte einen eigenen Trupp und kannte den Dienst unter ihrem Banner, bevor er selbst zum Verfolgten wurde.</p>' },
  { title: 'Die Plünderung in Ceitheach', text: '<p>Während des Krieges plünderten Cadwgan und sein Trupp ein albisches Dorf in Ceitheach. Darüber hinaus standen schwere weitere Übergriffe auf die Dorfbevölkerung im Raum. Diese zusätzlichen Taten ließen sich ihnen jedoch nicht unmittelbar nachweisen. Der Name des Dorfes und die Einzelheiten dieser Vorwürfe sind nicht überliefert.</p>' },
  { title: 'Verlust der Ritterwürde und Flucht', text: '<p>Cadwgan wurde seines Ritterstandes enthoben und sollte sich wegen seiner Taten vor Gericht verantworten. Er floh, bevor es zu diesem Verfahren kam. Seine Flucht war keine Freisprechung; ebenso ist kein abgeschlossenes Urteil über die zusätzlichen Vorwürfe belegt.</p>' },
  { title: 'Von der Räuberbande zu den Sumpfnattern', text: '<p>Nach seiner Flucht sammelte er eine eigene Räuberbande um sich. Die Schwarzen Zitteraale gliederten diese Schar später in ihre Struktur ein. Seitdem dient Cadwgan ihrem Bandenhaupt und führt seine Leute als die Sumpfnattern, die zweite der acht Unterbanden.</p>' },
  { title: 'Eine Fehde gegen die Gafyr', text: '<p>Die Eingliederung hat seine eigenen Absichten nicht verdrängt. Die Sumpfnattern verfolgen ihre Geschäfte innerhalb des größeren Verbandes, kochen aber weitgehend ihr eigenes Süppchen. Cadwgan trägt den Gafyr den Verlust seines früheren Standes nach. Seine persönliche Vendetta richtet sich gegen das Haus und besonders gegen dessen Oberhaupt. Höfe, Wege und Besitzungen der Gafyr bekommen diese Fehde immer wieder zu spüren.</p>' },
  { title: 'Zwischen den Fundamenten Lycaths', text: '<p>Seinen Stützpunkt hat Cadwgan in den Ruinen Lycaths eingerichtet. Von der antiken Crannath-Festung sind alte Fundamente geblieben. Zwischen diesen Resten nutzen die Sumpfnattern behelfsmäßige Unterstände, Zelte und hölzerne Einfassungen als Lager.</p>' }
]);

export function buildCadwganBiography() {
  return {
    schema: 'aleria.biography-module', schemaVersion: 1, pageTitle: `${CADWGAN_NAME} · Grüne Natter`,
    stats: [['Name', CADWGAN_NAME], ['Beiname', 'Die Grüne Natter'], ['Volk', 'Rheunwaith'], ['Herkunft', 'Haus Bwach · Gwaulwyn'],
      ['Früherer Stand', 'Ritter unter den Gafyr · Ritterstand aberkannt'], ['Heutige Stellung', 'Anführer der Sumpfnattern'],
      ['Zugehörigkeit', 'Die Schwarzen Zitteraale · Gruppe II.'], ['Stützpunkt', 'Ruinen Lycaths'], ['Feindschaft', 'Haus Gafyr · persönliche Vendetta']],
    biography: {
      portrait: CADWGAN_PORTRAIT,
      biographyTitle: 'Die Grüne Natter', biographyText: `<p>${CADWGAN_SUMMARY}</p>`,
      abilitiesTitle: 'Wesen und Antrieb', abilities: [
        { title: 'Nachtragend', icon: '/IconOrdner/Traits%20Icon/Proud.png', detail: 'Trägt den Gafyr seinen verlorenen Stand nach und macht ihre Besitzungen zum Ziel seiner Fehde.' },
        { title: 'Ritterliche Kriegserfahrung', icon: '/IconOrdner/Traits%20Icon/Brave.png', detail: 'Führte bereits im Großen Krieg einen Trupp im Dienst der Gafyr.' },
        { title: 'Eigene Interessen', icon: '/IconOrdner/Traits%20Icon/Ambitious.png', detail: 'Dient den Schwarzen Zitteraalen, verfolgt mit seiner Unterbande zugleich eigene Geschäfte und Ziele.' }
      ],
      historyTitle: 'Erscheinung und Zeichen',
      historyText: '<p>Dunkelrotes Haar, ein kantiges Gesicht und ein grimmiger Blick kennzeichnen die Grüne Natter. Geschwärzte Platten schützen Schultern und Arme; dunkelgrüne Schuppenpanzerung liegt unter einem halb offenen, zerfledderten und grob geflickten Wappenrock. Sein stählerner Helm ist wie das geöffnete Maul einer Natter geformt. Er trägt ihn unter dem Arm und stützt sich mit der anderen Hand auf den Knauf seines Zweihänders.</p><p>Sein Zeichen zeigt eine grüne Natter, die einen hellen Geißbock umschlingt und ihm in den Nacken beißt. Der Bock bäumt sich gegen sie auf. Das Zeichen verhöhnt seine früheren Dienstherren und kennzeichnet heute seine eigene Schar.</p>',
      extraSections: CADWGAN_HISTORY.map(section => ({ ...section, position: 'afterWorks', mode: 'text' })),
      connectionsTitle: 'Gefolgschaft und Feindschaft', connections: [
        { name: 'Haus Bwach · Gwaulwyn', image: CADWGAN_FAMILY_EMBLEM, imageFormat: 'square', detail: 'Seine Herkunftsfamilie; ihr Bock zertritt die Natter, während sein heutiges Bandzeichen das umgekehrte Motiv zeigt.' },
        ...SUMPFNATTERN_LIEUTENANTS.map(person => ({ name: person.title, image: person.portrait, imageFormat: 'portrait', detail: `${person.role}. ${person.appearance}` })),
        { name: 'Die Schwarzen Zitteraale', image: '/AleriaAlmanach/assets/schwarze-zitteraale/emblem.png', detail: 'Übergeordneter Verband, der seine ursprüngliche Räuberbande eingliederte.' },
        { name: 'Haus Gafyr', image: '/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-gafyr.png', detail: 'Frühere Dienstherren und heutiges Ziel seiner persönlichen Vendetta.' }
      ],
      documentsTitle: 'Bandenakte und Hausdarstellung', documents: [
        { title: 'Die Sumpfnattern', text: 'Gruppenbio, Anführerbio, Hierarchie und interaktives Lager.', link: `/AleriaAlmanach/AleriaAlmanach.html?entry=${SUMPFNATTERN_ID}` },
        { title: 'Regulärer Ritter des Hauses Bwach', text: 'Plattenrüstung mit Geißbock-Hornhelm, Schild, Schwert und Wappenrock in den Hausfarben.', link: BWACH_WARRIOR }
      ],
      footer: `${CADWGAN_NAME} · Die Grüne Natter · Lycath`
    }
  };
}

export function buildCadwganCharacterExport() {
  const biography = sanitizeCharacterBiographyForFirestore({ biography: buildCadwganBiography() }).biography;
  return { type: 'aleria-character', version: 1, exportedAt: '2026-11-22T12:00:00Z', assignedTab: 'Schwarze Zitteraale',
    character: { id: CADWGAN_ID, name: CADWGAN_NAME, aliases: ['Die Grüne Natter', 'Grüne Natter'], gender: 'male', race: 'Mensch',
      title: 'Die Grüne Natter · ehemaliger Ritter', role: 'Anführer der Sumpfnattern', fraktion: 'Schwarze Zitteraale', portrait: CADWGAN_PORTRAIT,
      bio: `${CADWGAN_SUMMARY}\n\n${CADWGAN_HISTORY.map(s => `${s.title}\n${s.text.replace(/<[^>]*>/g, '')}`).join('\n\n')}`,
      biography, archived: false, worldPersonId: CADWGAN_WORLD_PERSON_ID,
      genealogy: { worldPersonId: CADWGAN_WORLD_PERSON_ID, sex: 'male', status: 'alive',
        familyId: 'haus-bwach', houseId: 'house-bwach', houseName: 'Haus Bwach', personId: 'cadwgan-bwach', familyRole: 'core',
        sources: [{ familyId: 'haus-bwach', personId: 'cadwgan-bwach',
          url: '/Stammbäume/Stammbaum.html?family=haus-bwach&person=cadwgan-bwach&mode=view' }],
        relationships: { parents: [], partners: [], children: [] } } } };
}
