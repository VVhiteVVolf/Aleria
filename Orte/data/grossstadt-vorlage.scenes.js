(function () {
  "use strict";

  window.AleriaOrteScenes = {
    schemaVersion: 1,
    ortId: "grossstadt-vorlage",
    ortName: "Grossstadt-Vorlage",
    firebase: {
      collection: "orte_scenes"
    },
    scenes: {
      einleitung: {
        id: "einleitung",
        title: "Einleitungsszene",
        threadId: "orte:grossstadt-vorlage:einleitung",
        blocks: [
          {
            type: "intro",
            text: "[Szene oder Stimmung einleiten]"
          },
          {
            type: "speech",
            speaker: "[Name 1]",
            text: "Dialog von Figur 1."
          },
          {
            type: "action",
            speaker: "[Name 2]",
            text: "Handlungsbeschreibung: Antwort von Figur 2."
          }
        ]
      },
      konflikte: {
        id: "konflikte",
        title: "Konfliktszene",
        threadId: "orte:grossstadt-vorlage:konflikte",
        blocks: [
          {
            type: "intro",
            text: "[Konfliktlage, Stimmung oder Ausloeser einleiten]"
          },
          {
            type: "speech",
            speaker: "[Name 1]",
            text: "Dialog zur aktuellen Spannung."
          },
          {
            type: "action",
            speaker: "[Name 2]",
            text: "Reaktion, Handlung oder sichtbare Folge des Konflikts."
          }
        ]
      }
    }
  };
})();
