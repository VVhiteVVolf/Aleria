(function () {
  "use strict";

  const base = window.STECKBRIEF_DATA || {};
  const overrides = {
    meta: {
      id: "aldrimar-roriksheim-klangheim-clans-skald-freya-skald",
      titel: "Freya Skald - Aldrimar",
      kategorie: "Charaktersteckbrief",
      status: "Vorlage",
      editorVersion: 2
    },
    name: {
      vorname: "Freya",
      nachname: "Skald",
      vollstaendig: "Freya Skald",
      titel: "-",
      rufname: "-",
      alias: "-"
    },
    hierarchie: [
      { typ: "Land", name: "Aldrimar", slug: "aldrimar" },
      { typ: "Ort", name: "Roriksheim", slug: "roriksheim" },
      { typ: "Ortsteil", name: "Klangheim", slug: "klangheim" },
      { typ: "Ebene", name: "Clans", slug: "clans" },
      { typ: "Clan", name: "Skald", slug: "skald" },
      { typ: "Charakter", name: "Freya Skald", slug: "freya-skald" }
    ],
    fakten: [
      setFact(base, 0, [
        ["Vorname", "Freya"],
        ["Nachname", "Skald"],
        ["Titel / Anrede", "-"],
        ["Rufname", "-"],
        ["Alias", "-"],
        ["Geschlecht", "-"],
        ["Alter", "-"],
        ["Geburtstag", "-"],
        ["Sternzeichen", "-"],
        ["Gr\u00f6\u00dfe", "-"],
        ["Herkunft", "Aldrimar, Roriksheim, Klangheim"]
      ]),
      setFact(base, 1, [
        ["Familie", "Clan Skald"],
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
        ["Zugeh\u00f6rigkeit", "Clan Skald"]
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
