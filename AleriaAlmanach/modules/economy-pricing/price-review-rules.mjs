// Editorial review 2026-10-19. All amounts are KT, not denomination-specific
// display numbers. Explicit before/after pairs prevent compounding or changing
// later authored prices. Animals, horse breeds and magical effects are intact.
const rule = (id, before, after, reason) => ({ id, before: Array.isArray(before) ? before : [before, before], after: Array.isArray(after) ? after : [after, after], reason });
export const PRICE_REVIEW_VERSION = '2026-10-19-v1';
export const MARKET_PRICE_REVIEW = {
  Taverne: [
    rule('hafergruetze', .1, .25, 'Auch eine billige warme Schale trägt Brennstoff, Bedienung und Grundzutaten.'),
    rule('gebackenes-huhn', 1.8, 4.5, 'Halbes gebackenes Huhn mit Beilagen muss zum erhaltenen Preis lebender Hühner von 4–8 KT passen.'),
    rule('bauernbrot', .35, .2, 'Zwei einfache geröstete Scheiben bleiben unter dem Preis eines vollständigen einfachen Gerichts.'),
    rule('fruehstuecksteller', .5, 1.2, 'Brot, Ei, Käse und gegebenenfalls Speck sind mehr als eine reine Brotportion.')
  ],
  'Gemischtwarenhändler': [
    rule('wasserschlauch', 1, 3, 'Dichter genähter Zwei-Liter-Lederschlauch braucht mehr Material und Arbeit als die kleine Ausführung.'),
    rule('bettrolle', 3, 8, 'Eine ganze Wolldecke mit Leinenrolle ist kein billiger Stoffrest.'),
    rule('fackel', 1, .25, 'Eine Stunde einfaches Verbrauchslicht darf keinen großen Teil eines Tageslohns kosten.'),
    rule('lampenoel', 4, .6, 'Sechs Stunden gewöhnliches Lampenlicht sollen gegenüber dem Anschaffungspreis der Laterne tragbar bleiben.'),
    rule('seil', 2, 6, 'Fünfzehn Meter verlässliches Hanfseil enthalten spürbar Material und Seilerarbeit.'),
    rule('kreide', 1, .05, 'Ein einzelnes gewöhnliches Kreidestück ist ein billiges Verbrauchsgut.'),
    rule('notizbuch', 5, 8, 'Handgeschöpftes Papier und Lederbindung stehen über einfachen Schreibutensilien.'),
    rule('seife', 1, .5, 'Einfache Kernseife bleibt ein regelmäßig erschwingliches Haushaltsgut.'),
    rule('kochgeschirr', 2, 12, 'Kupferner Topf samt Zubehör darf nicht ungefähr wie eine einfache Holzschüssel kosten.'),
    rule('rationen', [5, 10], [1.5, 3], 'Eine Tagesration ist teurer als Eigenversorgung, aber keine täglichen Luxusausgaben über einem gewöhnlichen Tageslohn.'),
    rule('signalpfeife', 10, 3, 'Kleine gewöhnliche Metallpfeife gegenüber aufwendigerem Reisegepäck eingeordnet.'),
    rule('verbandstoff', 25, 4, 'Gewöhnliche Leinenbinden mit Kräuterpaste sind deutlich günstiger als magische Heilmittel.'),
    rule('kraeutermoerser', 35, 6, 'Kleiner Tonmörser ohne seltenen Werkstoff ist ein einfaches Handwerksgerät.'),
    rule('holzloeffel', 1, .4, 'Schlichtes geschnitztes Einzelstück gegenüber haltbaren Werkzeugen eingeordnet.'),
    rule('tonbecher', 1, .3, 'Einfaches gewöhnliches Geschirr ist erschwingliches Massenhandwerk.'),
    rule('trinkschlauch-klein', 2, 1.5, 'Halber Liter Fassungsvermögen liegt unter dem Zwei-Liter-Schlauch.'),
    rule('kieselsteinbeutel', 1, .1, 'Der Wert liegt im kleinen Beutel und dem Zusammenstellen, nicht in seltenem Material.'),
    rule('salzbeutel', 4, .5, 'Kleine gewöhnliche Würzmenge für die Küche statt mehrerer einfacher Mahlzeiten.'),
    rule('holznadel', 1, .15, 'Schlichte Holznadel liegt unter dem Metallnähset.'),
    rule('talgkerze', 1, .2, 'Zwei Stunden einfaches Hauslicht bleiben regelmäßig erschwinglich.'),
    rule('stoffstreifen', 3, 1.5, 'Zehn einfache saubere Stoffstreifen ohne seltene Medizin.'),
    rule('lederflicken', 2, .5, 'Kleiner Reparaturrest statt eines größeren verarbeiteten Lederstücks.'),
    rule('tonlampe', 6, 2, 'Schlichte offene Tonlampe liegt deutlich unter der Blech- und Glaslaterne.')
  ],
  'Waffen & Rüstungen': [
    rule('dreizack', 800, 350, 'Geschmiedeter Mehrzackenkopf bleibt aufwendiger als ein einfacher Spieß, unter einer langen Schwertklinge.'),
    rule('flegel', 600, 150, 'Schlichter Kriegsflegel ohne die Arbeit einer langen Stahlklinge.'),
    rule('streitaxt', 1300, 450, 'Gewöhnliche Axt aus Holz und Stahl unter einem Langschwert, Meisterarbeiten bleiben separat.'),
    rule('rattenpruegel', 300, 25, 'Die ausdrücklich billige einfache Holz-Eisen-Wuchtwaffe wird gegenüber Standardschwert und Handwerksaufwand eingeordnet.'),
    rule('hellebarde', [2000, 3000], [500, 800], 'Gewöhnliche Infanteriewaffe unter einem ritterlichen Maßschwert; Kopf und Schaft bleiben wertvolles Handwerk.'),
    rule('streitkolben', 800, 300, 'Gewöhnliche Stahl-Eisen-Wuchtwaffe relativ zum Standardschwert eingeordnet.'),
    rule('kriegshammer', 1500, 650, 'Großer geschmiedeter Kopf bleibt teurer als einfacher Kolben, ohne ritterliche Luxusausführung.'),
    rule('morgenstern', 1000, 400, 'Komplexerer Kopf über einfachem Streitkolben, ohne den Preis eines Langschwerts.'),
    rule('lanze', 1200, 150, 'Die Beschreibung nennt einen einfach herstellbaren Spieß für Formationen, keinen prunkvollen Turnierspeer.'),
    rule('langbogen', 1000, 500, 'Ausgewähltes Bogenholz und Bogenbauerarbeit bleiben teuer, stehen aber im Verhältnis zu gewöhnlichen Waffen.'),
    rule('buckler', 15, 30, 'Geschmiedeter kleiner Stahlschild trägt Metallarbeit; bleibt unter veredelten Hausarbeiten.'),
    rule('saex', 400, 250, 'Gutes einschneidiges Langmesser unter einem vollständigen Standardschwert.')
  ]
};

export const VENUE_PRICE_REVIEW = {
  'goettliche-eleganz': [
    rule('lichtleinen', 18, 45, 'Mehrteilige angepasste Leinen-Wollgarnitur muss Stoff und ausgebildete Schneiderarbeit tragen.'),
    rule('heller-faden', 18, 45, 'Dreiteilige angepasste Herrengarnitur über gewöhnlicher Standardkleidung.'),
    rule('gassenbluete', 32, 75, 'Gefüttertes Wollkleid mit Wechselärmeln und Anpassung ist gelernte mehrtägige Arbeit.'),
    rule('innenstadt', 35, 80, 'Gefüttertes Wams, Hemd und Hose stehen über der einfachen Einstiegsarbeit.'),
    rule('kaufmannstochter', 65, 130, 'Gefüttertes Besuchskleid mit feiner Wollqualität, Seidenborte und Anprobe.'),
    rule('kontorrock', 70, 140, 'Gutes mehrteiliges Kontorgewand mit zusätzlicher Verarbeitung gegenüber der Alltagseinstiegsarbeit.')
  ],
  'zum-dritten-funken': [
    rule('gofrann:speer', 650, 350, 'Gute handwerkliche Hausausführung bleibt über dem gewöhnlichen Spieß, unter einer langen Hausklinge.'),
    rule('gofrann:hellebarde', 3900, 1600, 'Hausqualität bleibt deutlich über der gewöhnlichen Infanteriewaffe ohne ein Vielfaches der Haus-Langschwertarbeit zu verlangen.')
  ]
};
