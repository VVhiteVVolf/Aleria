// Navigation and ownership of the farm scenes. A household stays with its workplace.
export const HOF_AREAS = [
  { id: 'tirfelyn-hof', title: 'Familie Tirfelyn', label: 'Familie und Haus',
    description: 'Die Familie, ihre Geschichte und ihre eigenen Wohn- und Arbeitsorte.',
    poiKeys: ['bauernherrenhaus', 'gerberhaus', 'imkerei', 'gestuet', 'raeucherhaus', 'hausgarten', 'obstgarten'] },
  { id: 'tirfelyn-hof-holzfaeller', title: 'Holzfäller und Waldhäuser', label: 'Holz und Wald',
    description: 'Hallvard, Rannveig und Torleif am Holzfällerlager und in den beiden aneinandergebauten Wohnhäusern.',
    poiKeys: ['holzfaellerlager', 'holzfaellerhaus-ost', 'holzfaellerhaus-sued'] },
  { id: 'tirfelyn-hof-muehle', title: 'Mühle und Müllerhaus', label: 'Die Müllerfamilie',
    description: 'Meirigs Hofmühle und der gemeinsame Haushalt mit Gwenneth, Iorfin und Eifor.',
    poiKeys: ['muehle', 'bedienstetenhuette-04'] },
  { id: 'tirfelyn-hof-hufschmiede', title: 'Hufschmiede und Schmiedehaus', label: 'Die Hufschmiede',
    description: 'Cynfarchs Arbeitsplatz und seine Wohnhütte auf dem Hof.',
    poiKeys: ['hufschmiede', 'bedienstetenhuette-05'] },
  { id: 'tirfelyn-hof-hofhelfer', title: 'Hofhelfer und Hütten', label: 'Die Hofhelfer',
    description: 'Die Wohnhütten von Nefydd, Rhufon, Maldwyn und Eiluned und ihre Aufgaben im Hofalltag.',
    poiKeys: ['bedienstetenhuette-01', 'bedienstetenhuette-02', 'bedienstetenhuette-03', 'bedienstetenhuette-06'] },
  { id: 'tirfelyn-hof-felder-weiden', title: 'Felder und Weiden', label: 'Feld- und Viehwirtschaft',
    description: 'Die gemeinsam bewirtschafteten Äcker und Weiden des Tirfelyn-Hofs.',
    poiKeys: ['acker-mitte', 'acker-west', 'getreide-suedwest', 'acker-sued', 'schafweide', 'rinderweide-west', 'rinderweide-suedost', 'bullenweide', 'weide-nordost'] },
  { id: 'tirfelyn-hof-wirtschaftshof', title: 'Wirtschaftsgebäude und Vorräte', label: 'Der Wirtschaftshof',
    description: 'Gemeinsame Speicher, Lager, Brunnen und das Schweinegehege rund um die Wirtschaftsgebäude.',
    poiKeys: ['kornspeicher', 'lager-west', 'geraeteschuppen', 'lager-sued', 'lager-ost', 'schweinegehege', 'hofbrunnen', 'wirtschaftsbrunnen'] }
];

export function hofAreaFor(poi) {
  const key = typeof poi === 'string' ? poi : poi.key;
  const area = HOF_AREAS.find(area => area.poiKeys.includes(key));
  if (!area) throw Error(`Hofbereich fehlt: ${key}`);
  return area;
}

export const hofSceneKey = poi => `tirfelyn-hof-poi-${typeof poi === 'string' ? poi : poi.key}`;
export function hofSceneDestination(poi) {
  const entryId = hofAreaFor(poi).id;
  return { entryId, threadId: `${entryId}::session:${hofSceneKey(poi)}` };
}
export function hofSceneLink(poi) {
  const { entryId, threadId } = hofSceneDestination(poi);
  return `/AleriaAlmanach/AleriaAlmanach.html?entry=${entryId}&thread=${encodeURIComponent(threadId)}`;
}

// Navigation aliases only. Publication must first prove that the moved threads
// have no comments or saved scene state; this does not migrate their history.
export const HOF_SCENE_RELOCATIONS = HOF_AREAS.filter(area => area.id !== 'tirfelyn-hof').flatMap(area =>
  area.poiKeys.map(key => ({ oldThreadId: `tirfelyn-hof::session:${hofSceneKey(key)}`, ...hofSceneDestination(key) })));
