import { buildCadwganBiography } from './sumpfnattern-biography.mjs';
import { CADWGAN_NAME } from './sumpfnattern-people.mjs';

export function buildSumpfnatternPages(group) {
  const bio = buildCadwganBiography();
  return {
    overview: {
      schemaVersion: 1, pageTitle: group.name, commentThreadKey: `${group.id}-uebersicht`,
      image: group.overviewImage, imageWidth: 38, imageTall: true, imageFit: 'cover', imagePosition: 'center',
      description: `<p><strong>Die Sumpfnattern</strong> sind die zweite Unterbande der Schwarzen Zitteraale. Ihr Anführer <strong>${CADWGAN_NAME}</strong>, genannt <strong>die Grüne Natter</strong>, war im Großen Krieg Ritter unter den Gafyr. Seine heutige Schar terrorisiert die Herrschaft und Ländereien seiner früheren Dienstherren.</p><p>Aus einer zunächst eigenständigen Räuberbande wurde durch die Eingliederung in die Schwarzen Zitteraale eine Unterbande mit eigener Führung. Cadwgan dient dem Bandenhaupt, verfolgt mit seinen Leuten jedoch weiterhin eigene Geschäfte. Seine persönliche Vendetta gegen die Gafyr prägt die Wahl seiner Ziele.</p><p>Ihr Stützpunkt liegt in den <strong>Ruinen Lycaths</strong>, einer antiken Crannath-Festung, von der alte Fundamente geblieben sind. Dazwischen haben die Sumpfnattern ein behelfsmäßiges Lager aus Holz und Tuch eingerichtet. Die rechte Hand organisiert Räuber und Wachen; die linke Hand ist ein abtrünniger, exzentrischer Alchemist.</p><p>Das schwarze und dunkelgrüne Banner zeigt eine grüne Natter, die einen sich aufbäumenden Geißbock umschlingt und ihm in den Nacken beißt.</p>`,
      stats: [['Zugehörigkeit', 'Die Schwarzen Zitteraale · Gruppe II.'], ['Anführer', `${CADWGAN_NAME} · Die Grüne Natter`],
        ['Wirkungsgebiet', 'Herrschaft und Ländereien des Hauses Gafyr'], ['Stützpunkt', 'Ruinen Lycaths'],
        ['Ursprung', 'Eigenständige Räuberbande · später eingegliedert'], ['Führung', 'Gruppenführer · rechte und linke Hand'],
        ['Aufgebot', 'Sechzehn Räuberplätze'], ['Farben', 'Schwarz · Dunkelgrün · Silber']]
    },
    leader: {
      schemaVersion: 1, pageTitle: bio.pageTitle, commentThreadKey: `${group.id}-anfuehrer`, biographyPage: true,
      image: group.leaderPortrait, imageWidth: 38, imageTall: true,
      description: 'Die Grüne Natter · ehemaliger Ritter unter den Gafyr · Anführer der Sumpfnattern', stats: bio.stats, biography: bio.biography
    },
    headquarters: {
      schemaVersion: 1, pageTitle: 'Lager der Sumpfnattern · Lycath', commentThreadKey: `${group.id}-hauptquartier`, sessionPage: true,
      image: group.headquartersImage, imageWidth: 38, imageTall: true, imageFit: 'cover', imagePosition: 'center',
      sessionIntro: '<p>Zwischen den moosigen Fundamenten der alten Crannath-Festung Lycath stehen geflickte Zelte und roh gezimmerte Unterstände. Holzschirme und Palisadenstücke schließen die offenen Seiten des Lagers. Über dem größeren Zelt hängt das Zeichen der Sumpfnattern: die grüne Natter am Hals des sich aufbäumenden Bocks.</p><p>Am Feuer liegen einfache Bänke, unter einem Schutzdach stapeln sich Vorräte und Waffen. Seitlich steht ein Arbeitstisch mit Mörser und verkorkten Fläschchen. Hier findet die linke Hand der Grünen Natter Platz für ihre alchemistischen Arbeiten. Zwischen den Unterständen führen schmale Wege zurück in das Gehölz.</p><p>Cadwgans Schar dient den Schwarzen Zitteraalen und verfolgt zugleich ihre eigene Fehde gegen die Gafyr. Wer das Lager betritt, steht auf dem Boden dieser Unterbande.</p>',
      sessionLocation: 'Lycath · Lager der Sumpfnattern', sessionHint: 'Ruinen Lycaths · alte Fundamente, Holzunterstände und Zelte',
      sessionEmptyTitle: 'Zwischen den alten Fundamenten', sessionEmptyText: 'Die Szene im Lager der Sumpfnattern ist offen.',
      sessionDateAleria: { year: null, month: null, day: null }
    }
  };
}
