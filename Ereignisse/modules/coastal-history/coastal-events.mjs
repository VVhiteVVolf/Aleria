import { LEITHEACH_INCIDENTS } from './coastal-incidents.mjs';
export { LEITHEACH_INCIDENTS } from './coastal-incidents.mjs';
import { sourceParagraphs, sourceTimeline } from '../../../shared/coastal-history/coastal-sources.mjs';
import { LEITHEACH_CHRONOLOGY, LEITHEACH_DURATION } from '../../../shared/coastal-history/leitheach-chronology.mjs';

export const VENNYR_FIGURES = Object.freeze([
  { id: 'jygallag', name: 'Jygallag Blodyn', role: 'König von Vennyr', birth: 1670, death: 1720, year: 1720, family: 'haus-blodyn', person: 'jygallag-blodyn', note: 'Um 50 Jahre alt · letztes Regierungsjahr.' },
  { id: 'rhodri', name: 'Rhodri Draig', role: 'Marschall von Cenyr', birth: 1662, death: 1720, year: 1720, family: 'haus-draig', person: 'rhodri-draig', note: 'Um 58 Jahre alt · nach schwerer Verwundung 1719 zurückgezogen.' },
  { id: 'rag', name: 'Rag Vaeren · Blauzahn', role: 'König von Aldrimar', birth: 1657, death: 1727, year: 1720, family: 'haus-vaeren', person: 'rag-vaeren', note: 'Um 63 Jahre alt · Darstellung im Jahr 1720.' },
  { id: 'ketill', name: 'Ketill der Rote · Draca', role: 'Heermeister der Invasion', birth: null, year: 1720, note: 'Rekonstruiertes Bildnis · Alter und verbindliche Porträtvorlage nicht überliefert. 1720 erster Reik Fjordheims.' }
]);
export const VENNYR = Object.freeze({
  id: 'invasion-von-vennyr', title: 'Die Invasion von Vennyr', period: '1717–1720', type: 'Invasion', sourceId: 'coastal-01',
  file: 'Ereignisse/Kriege/invasion-von-vennyr/index.html', imageId: 'vennyr-1720',
  subtitle: 'Vom Königreich Vennyr zu Fjordheim',
  lead: sourceParagraphs('coastal-01', [4])[0].text,
  facts: [['Zeitraum', '1717–1720'], ['Schauplatz', 'Königreich Vennyr'], ['Kriegsparteien', 'Vennyr, Cenyr und Aldrimar · Invasionsheer des Hohen Nordens'], ['Ausgang', 'Eroberung Vennyrs; Gründung Fjordheims'], ['Folgen', 'Flucht vieler Vennyri nach Cenyr'], ['Genaues Datum', 'Tage, Monate und Jahreszeit nicht überliefert'], ['Bildnisse', 'Stand 1720; Altersangaben nach Stammbäumen']],
  sections: [
    { title: 'Ein altes Land, ein erneuter Anspruch', paragraphs: sourceParagraphs('coastal-01', [8]) },
    { title: 'Hintergrund und Ursachen', paragraphs: sourceParagraphs('coastal-01', [10, 11, 12, 13, 14, 15, 16]) }
  ], timeline: sourceTimeline('coastal-01', 30)
});
export const LEITHEACH = Object.freeze({
  id: 'raubzug-durch-leitheach', title: 'Der Raubzug durch Leitheach', period: 'Winter 1733', type: 'Raubzug', sourceId: 'coastal-02',
  file: 'Ereignisse/Kriege/raubzug-durch-leitheach/index.html', imageId: 'raubzug-leitheach-1733',
  subtitle: 'Sieben Tage zwischen Küste und Hauptstadt', lead: sourceParagraphs('coastal-02', [4])[0].text,
  facts: [['Zeitraum', 'Winter 1733'], ['Dauer', LEITHEACH_DURATION], ['Schauplatz', 'Fürstentum Leitheach · Estryll'], ['Angreifer', 'Vier Banden aus dem Schwarzblut-Kollektiv'], ['Flotte', '15 Schiffe · 710–880 Besatzungsmitglieder'], ['Landungstruppen', 'Je Gefecht bis zu 800; Teil der Gesamtbesatzung'], ['Ausgang', 'Angriff auf Dun Laog abgewehrt; Großteil der Piraten entkommt'], ['Datum', 'Relative Raubzugstage; Tag und Monat unbekannt']],
  sections: [
    { title: 'Ein verwundbares Fürstentum', paragraphs: sourceParagraphs('coastal-02', [8, 9, 10, 11, 12]) },
    { title: 'Ablenkung und Täuschung', paragraphs: sourceParagraphs('coastal-02', [29, 31]) },
    { title: 'Der Fall von Broch an Clais', paragraphs: sourceParagraphs('coastal-02', [33]) },
    { title: 'Die Plünderung am Fluss', paragraphs: sourceParagraphs('coastal-02', [35]) },
    { title: 'Dun Laog und der Rückzug', paragraphs: sourceParagraphs('coastal-02', [37]) }
  ], witness: sourceParagraphs('coastal-02', Array.from({ length: 13 }, (_, index) => 13 + index)), timeline: LEITHEACH_CHRONOLOGY.milestones
});
export const COASTAL_EVENT_PAGES = Object.freeze([VENNYR, LEITHEACH, ...LEITHEACH_INCIDENTS]);
