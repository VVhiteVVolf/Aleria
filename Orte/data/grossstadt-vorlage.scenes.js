(function () {
  "use strict";

  window.AleriaOrteScenes = {
    schemaVersion: 2,
    ortId: "grossstadt-vorlage",
    ortName: "Grossstadt-Vorlage",
    firebase: {
      collection: "orte_scenes"
    },
    modules: {
      einleitung: {
        id: "einleitung",
        title: "Einleitungsszene",
        subtitle: "Interaktive Szene zur Stimmung und Ankunft",
        stamp: "ORTSZENE",
        image: "",
        imageWidth: 36,
        threadId: "orte:grossstadt-vorlage:einleitung",
        page: {
          pageTitle: "I - Interaktive Szene",
          sessionPage: true,
          sessionIntro: "Einleitung der Szene. Beschreibe Ort, Anlass und Stimmung. Der eigentliche Szenenverlauf entsteht spaeter ueber Kommentare.",
          sessionHint: "Fuehre diese Szene als Kommentar fort.",
          sessionEmptyTitle: "Die Szene ist offen",
          sessionEmptyText: "Hier kann die Szene im fertigen Modus beginnen."
        }
      },
      konflikte: {
        id: "konflikte",
        title: "Konfliktszene",
        subtitle: "Interaktive Szene zu Spannungen, Gefahren und offenen Fronten",
        stamp: "KONFLIKT",
        image: "",
        imageWidth: 36,
        threadId: "orte:grossstadt-vorlage:konflikte",
        page: {
          pageTitle: "II - Interaktive Szene",
          sessionPage: true,
          sessionIntro: "Leite die Konfliktlage ein: Wer steht unter Druck, welche Geruechte gehen um, und welche Entscheidung liegt in der Luft?",
          sessionHint: "Fuehre den Konflikt als Kommentar fort.",
          sessionEmptyTitle: "Der Konflikt wartet",
          sessionEmptyText: "Noch ist kein Beitrag eingetragen."
        }
      }
    }
  };
})();
