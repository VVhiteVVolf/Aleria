export const KRONENSPIEGEL_DISTRIBUTION_SITES = Object.freeze({
  mathragon: site({
    id: "mathragon",
    name: "Mathragon",
    printLocation: "Hauptsitz und Zentraldruckerei des Kronenspiegels zu Mathragon",
    href: "",
    remit: "Der Mathragoner Stadtstab nimmt Meldungen aus der Hauptstadt auf, betreut den Zentraldruck und versorgt die Hauptredaktion des Hauses Pengair. Auch er ergänzt keine örtliche Sonderausgabe, sondern arbeitet an derselben cenyrweiten Fassung."
  }),
  gwynthor: site({
    id: "gwynthor",
    name: "Gwynthor",
    printLocation: "Druck- und Korrespondenzhaus des Kronenspiegels zu Gwynthor",
    href: "/Orte/grossstadt.html?id=gwynthor",
    remit: "Der Standort sammelt große Entwicklungen aus Celtigerns Wacht, prüft seine regionalen Quellen und übermittelt die Berichte nach Mathragon. Gedruckt wird die unveränderte cenyrweite Ausgabe."
  }),
  abergwint: site({
    id: "abergwint",
    name: "Abergwint",
    printLocation: "Druck- und Korrespondenzhaus des Kronenspiegels zu Abergwint",
    href: "/Orte/grossstadt.html?id=abergwint",
    remit: "Der Standort bündelt große Nachrichten von Küste, Flotte und Seehandel für Mathragon. Seine Druckerei vervielfältigt dieselbe Ausgabe, die im gesamten Königreich erscheint."
  }),
  castellbryn: site({
    id: "castellbryn",
    name: "Castellbryn",
    printLocation: "Druck- und Korrespondenzhaus des Kronenspiegels zu Castellbryn",
    href: "/Orte/grossstadt.html?id=castellbryn",
    remit: "Der Standort beobachtet die großen politischen, rechtlichen und wirtschaftlichen Entwicklungen in Rhonwens Tränen. Er ist Zuleitung und Druckhaus, keine eigene Lokalzeitung."
  }),
  rhosmere: site({
    id: "rhosmere",
    name: "Rhosmere",
    printLocation: "Druck- und Korrespondenzhaus des Kronenspiegels zu Rhosmere",
    href: "/Orte/grossstadt.html?id=rhosmere",
    remit: "Der Standort meldet große Entwicklungen aus Arthus Streben, besonders zu Heer, Straßen und Landhandel. Auch hier bleibt der gedruckte Inhalt mit allen anderen Standorten identisch."
  })
});

function site(value) {
  return Object.freeze({ ...value });
}
