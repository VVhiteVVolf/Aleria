const classProfiles = {
  nefer: ['Nefer', 'Der gewöhnliche Fußsoldat bildet das Rückgrat der Armee und kämpft in geschlossenen Formationen.', ['Speer', 'Rundschild', 'Gegürteter Krummsäbel'], 'kampfer', 'Waffenknecht'],
  derwisch: ['Derwisch', 'Schwertmeister, der fließende Bewegungen mit meisterhafter Schwertführung verbindet. Er führt einen zweihändigen Krummsäbel oder zwei Krummsäbel.', ['Zwei Krummsäbel', 'Janitscharen-Börk'], 'kampfer', 'Schwertmeister'],
  sipahi: ['Sipahi', 'Berittener Lanzierer auf einem Sarkal. Die Lanze führt den Angriff, der Krummsäbel dient dem Nahkampf.', ['Orientalische Lanze', 'Krummsäbel', 'Sarkal'], 'reiter', 'Berittener Lanzierer'],
  ghulam: ['Ghulam', 'Schwerer Krieger, dessen schwere Rüstung und rohe Schlagkraft darauf ausgerichtet sind, Rüstungen und Schildformationen zu durchbrechen.', ['Flegel, Morgenstern oder Streitkolben', 'Schwere Ketten- und Lamellenrüstung', 'Gesichtsmaske'], 'kampfer', 'Schwerer Krieger'],
  aschik: ['Aschik', 'Fechter, Dichter und Musiker, der alte Überlieferungen bewahrt.', ['Krummsäbel', 'Dolch', 'Kleine Langhalslaute'], 'barde', 'Poetischer Fechter und Musiker'],
  nizet: ['Nizet', 'Disziplinierter Stangenwaffenkämpfer der Infanterie. Seine lange Waffe hält Gegner auf Abstand, besonders Reiterei und schwere Feinde.', ['Langstielige Klingenwaffe', 'Hohe Janitscharenhaube'], 'kampfer', 'Stangenwaffenkämpfer'],
  keman: ['Keman', 'Berittener Bogenschütze auf einem Sarkal, der auf Distanz und schnelle Positionswechsel setzt.', ['Kompositbogen', 'Krummsäbel', 'Köcher', 'Sarkal'], 'reiter', 'Berittener Bogenschütze'],
  lewent: ['Lewent', 'Marinekrieger, der Schiffe verteidigt, Decksbeschuss mit dem Bogen führt und im Enterkampf den Krummsäbel zieht.', ['Bogen', 'Krummsäbel', 'Köcher'], 'seefahrer', 'Marinekrieger'],
};

export const WARRIORS = Object.freeze(Object.entries(classProfiles).map(([id, [name, description, equipment, baseClass, role]]) => Object.freeze({
  id, name, description, equipment, role,
  image: `assets/warriors/previews/${id}.webp`,
  original: `assets/warriors/production/${id}.png`,
  href: `../../Klassenordner/Basisklassen/${baseClass}/index.html`,
  classHrefLabel: 'Grundklasse',
  mount: id === 'sipahi' || id === 'keman'
    ? Object.freeze({ name: 'Sarkal', href: '../../Bestiarium/tiere/pferde/sarkal/index.html' })
    : null,
  status: 'proposal',
})));

export const WARRIOR_STATUS_NOTE = 'Acht bestätigte Klassen in seldschukisch, osmanisch und kumanisch geprägter Ausrüstung. Die Bilder sind Entwürfe im freigegebenen Aleria-Kriegerstil.';
