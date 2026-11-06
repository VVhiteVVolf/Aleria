/** Public display data; full prompts and generator provenance stay in sources/. */
export const WARRIOR_PROTOTYPES = Object.freeze([
  {
    "id": "mounted-archer",
    "name": "Berittener Bogenschütze",
    "role": "Berittener Bogenschütze",
    "description": "Ein beweglicher Bogenschütze mit Rückenköcher auf einem schlanken Nebtu. Auch Sarkal, Shahzad oder andere geeignete Pferde kommen als Reittiere infrage. Leichte Ausrüstung und Sonnenschutz erhalten die Wendigkeit des Reiters.",
    "equipment": "Kurzbogen, Rückenköcher, kurze Seitenwaffe, leichte Reitausrüstung",
    "mounted": true,
    "mount": {
      "name": "Nebtu",
      "href": "../../Bestiarium/tiere/pferde/nebtu/"
    },
    "image": "assets/warriors/production/mounted-archer.png",
    "preview": "assets/warriors/previews/mounted-archer.webp",
    "original": "assets/warriors/production/mounted-archer.png",
    "fullsize": "assets/warriors/production/mounted-archer.png"
  },
  {
    "id": "desert-druchtan-rider",
    "name": "Wüstenläufer-Reiter",
    "role": "Wüstenläufer-Reiter",
    "description": "Der berittene Krieger nutzt den Wüstenläufer, eine sandfarbene Wüstenvariante des horntragenden Drúchtán. Seine leichte Reitausrüstung folgt dem kräftigen Reptilkörper.",
    "equipment": "Kurzer Speer, kleiner Rückenschild, Reitharnisch",
    "mounted": true,
    "mount": {
      "name": "Drúchtán · Wüstenläufer",
      "href": "../../Bestiarium/tiere/reptilien/druchtan/",
      "note": "Wüstenvariante des Drúchtán; das verlinkte Dossier beschreibt die Grundart."
    },
    "image": "assets/warriors/production/desert-druchtan-rider.png",
    "preview": "assets/warriors/previews/desert-druchtan-rider.webp",
    "original": "assets/warriors/production/desert-druchtan-rider.png",
    "fullsize": "assets/warriors/production/desert-druchtan-rider.png"
  },
  {
    "id": "heavy-warrior",
    "name": "Schwerer Kämpfer",
    "role": "Schwerer Kämpfer",
    "description": "Ein vergleichsweise gut geschützter Fußkämpfer mit Kettenhemd, gepolsterten Stofflagen und kräftiger Streitaxt. Säbel oder Keule gehören zu den möglichen Varianten dieser Rolle.",
    "equipment": "Streitaxt, Säbel in der Scheide, Kettenhemd, Lederschutz",
    "mounted": false,
    "mount": null,
    "image": "assets/warriors/production/heavy-warrior.png",
    "preview": "assets/warriors/previews/heavy-warrior.webp",
    "original": "assets/warriors/production/heavy-warrior.png",
    "fullsize": "assets/warriors/production/heavy-warrior.png"
  },
  {
    "id": "giant-eagle-rider",
    "name": "Adlerreiter",
    "role": "Adlerreiter",
    "description": "Ein leichter Bogenschütze auf einem gesattelten Riesenadler. Bogen, Rückenköcher und ein an den Vogelkörper angepasster Reitsattel bilden seine Ausrüstung.",
    "equipment": "Kurzbogen, Rückenköcher, leichter Reitsattel",
    "mounted": true,
    "mount": {
      "name": "Riesenadler",
      "href": null
    },
    "image": "assets/warriors/production/giant-eagle-rider.png",
    "preview": "assets/warriors/previews/giant-eagle-rider.webp",
    "original": "assets/warriors/production/giant-eagle-rider.png",
    "fullsize": "assets/warriors/production/giant-eagle-rider.png"
  },
  {
    "id": "schwertsaengerin",
    "name": "Schwertsängerin",
    "role": "Schwertsängerin",
    "description": "Eine leicht bekleidete Schwertsängerin verbindet bewegliche Schwertkunst mit dem Erbe der wandernden Clans. Sie führt in jeder Hand einen Säbel und trägt leichte Leinen- und Webstofflagen.",
    "equipment": "Zwei Säbel, leichtes Wickelgewand",
    "gender": "female",
    "mounted": false,
    "mount": null,
    "image": "assets/warriors/production/schwertsaengerin.png",
    "preview": "assets/warriors/previews/schwertsaengerin.webp",
    "original": "assets/warriors/production/schwertsaengerin.png",
    "fullsize": "assets/warriors/production/schwertsaengerin.png"
  }
].map(entry => Object.freeze(entry)));

export const WARRIOR_BY_ID = Object.freeze(Object.fromEntries(WARRIOR_PROTOTYPES.map(entry => [entry.id, entry])));
