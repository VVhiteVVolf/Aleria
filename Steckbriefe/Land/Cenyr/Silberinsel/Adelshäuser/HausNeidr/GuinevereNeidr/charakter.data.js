(function () {
  "use strict";

  const base = window.STECKBRIEF_DATA || {};
  const overrides = {
    meta: {
      id: "cenyr-silberinsel-adelshaeuser-hausneidr-guinevere-neidr",
      titel: "Guinevere Neidr - Cenyr",
      kategorie: "Charaktersteckbrief",
      status: "Vorlage",
      editorVersion: 2
    },
    name: {
      vorname: "Guinevere",
      nachname: "Neidr",
      vollstaendig: "Guinevere Neidr",
      titel: "-",
      rufname: "-",
      alias: "-"
    },
    wappen: {
      src: "https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png",
      alt: "Wappen von Haus Neidr",
      scale: 1,
      format: "square",
      fit: "contain"
    },
    hierarchie: [
      { typ: "Land", name: "Cenyr", slug: "cenyr" },
      { typ: "Region", name: "Silberinsel", slug: "silberinsel" },
      { typ: "Ebene", name: "Adelsh\u00e4user", slug: "adelshaeuser" },
      { typ: "Haus", name: "Haus Neidr", slug: "haus-neidr" },
      { typ: "Charakter", name: "Guinevere Neidr", slug: "guinevere-neidr" }
    ],
    fakten: [
      setFact(base, 0, [
        ["Vorname", "Guinevere"],
        ["Nachname", "Neidr"],
        ["Titel / Anrede", "-"],
        ["Rufname", "-"],
        ["Alias", "-"],
        ["Geschlecht", "-"],
        ["Alter", "-"],
        ["Geburtstag", "-"],
        ["Sternzeichen", "-"],
        ["Gr\u00f6\u00dfe", "-"],
        ["Herkunft", "Cenyr, Silberinsel"]
      ]),
      setFact(base, 1, [
        ["Familie", "Haus Neidr"],
        ["Vater", "-"],
        ["Mutter", "-"],
        ["Geschwister", "-"],
        ["Partner", "-"],
        ["Kinder", "-"]
      ]),
      setFact(base, 2, [
        ["Stand", "-"],
        ["Amt / Rolle", "-"],
        ["Aufgabe", "-"],
        ["Zugeh\u00f6rigkeit", "Haus Neidr"]
      ]),
      ...(base.fakten || []).slice(3)
    ]
  };

  window.STECKBRIEF_DATA = mergeDeep(base, overrides);

  function setFact(source, index, eintraege) {
    return { ...(source.fakten?.[index] || {}), eintraege };
  }

  function mergeDeep(target, source) {
    const output = Array.isArray(target) ? [...target] : { ...target };
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        output[key] = mergeDeep(output[key] || {}, value);
      } else {
        output[key] = value;
      }
    });
    return output;
  }
})();
