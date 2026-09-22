// Authored alternatives share the existing damage budget and cost normalizer.
// Each pair adds a distinct choice at that level, not another automatically learned attack.
const options = {
  'hird-maid': [
    ['Speerspitze voran','spear','quick'], ['Hut am Hoftor','militia','guard'],
    ['Schildrand abtasten','shield','strike'], ['Sammeln in der Reihe','militia','aim'],
    ['Kurzer Axtzug','militia','feint'], ['Schritt auf festen Boden','militia','step'],
    ['Speer querstellen','spear','slow'], ['Deckung am Nachbarn','shield','guard'],
    ['Hieb auf den Waffenarm','militia','bind'], ['Entschlossener Hofstoß','spear','heavy'],
    ['Schild der Hofwacht','shield','bulwark'], ['Vorstoß am Torpfosten','militia','advance'],
    ['Speer gegen die Lücke','spear','feint'], ['Atem der Wache','militia','resolve'],
    ['Hieb durch die Engstelle','militia','heavy'], ['Stand am Palisadenfuß','shield','brace']
  ],
  skjoldr: [
    ['Knauf am Kinn','flexible','quick'], ['Tiefe Schildhut','shield','guard'],
    ['Klinge am Schildrand','shield','strike'], ['Maß der Entfernung','flexible','aim'],
    ['Seitlicher Eisenstoß','longblade','feint'], ['Fußarbeit des Frontmanns','flexible','step'],
    ['Schnitt zur Fessel','flexible','slow'], ['Geschlossene Schildseite','shield','brace'],
    ['Gegengriff der Klingen','paired','bind'], ['Langer Druckhieb','longblade','heavy'],
    ['Schildschulter','shield','bulwark'], ['Wechsel über die Kante','flexible','advance'],
    ['Doppelhut öffnen','paired','feint'], ['Atem hinter Eisen','flexible','resolve'],
    ['Linienbrecher','longblade','heavy'], ['Hut der beiden Klingen','paired','brace']
  ],
  thegnar: [
    ['Kurzer Hieb zu Fuß','rider','quick'], ['Hut neben dem Ross','rider','guard'],
    ['Abgesessener Lanzenstoß','lance','strike'], ['Blick über die Flanke','rider','aim'],
    ['Sattelkantenhieb','rider','mountedFeint'], ['Schritt zum Zügel','rider','step'],
    ['Lanzenschaft zur Fessel','lance','slow'], ['Gesicherte Sattelhut','rider','mountedBrace'],
    ['Bindung im Vorbeireiten','rider','mountedBind'], ['Lanze des freien Anritts','lance','mountedHeavy'],
    ['Wache am abgestiegenen Ross','rider','bulwark'], ['Hieb von der Wegkante','rider','advance'],
    ['Kurze Reiterwende','rider','mountedFeint'], ['Ruhe des Patrouillenreiters','rider','resolve'],
    ['Langer Stoß zu Fuß','lance','heavy'], ['Geschlossene Reiterhut','rider','mountedBrace']
  ],
  skeidr: [
    ['Beilhieb am Tau','deck','quick'], ['Hut im Seegang','deck','guard'],
    ['Sax unter der Reling','sidearm','strike'], ['Ruhe zwischen zwei Wellen','deck','aim'],
    ['Wurf zur Schanz','throwing','feint'], ['Sicherer Plankenschritt','deck','step'],
    ['Haken an der Fessel','deck','slow'], ['Kauernde Deckhut','sidearm','brace'],
    ['Klingenfang am Mast','deck','bind'], ['Hammer auf die Öffnung','deck','heavy'],
    ['Halt am Vorschiff','deck','bulwark'], ['Sax durch die Enge','sidearm','advance'],
    ['Wurf aus der Drehung','throwing','feint'], ['Atem des Ruderers','deck','resolve'],
    ['Enterhieb auf kurze Distanz','deck','heavy'], ['Abwehr am Niedergang','sidearm','brace']
  ],
  skjaldr: [
    ['Kurzer Bartzug','flexible','quick'], ['Ruhige Axtdeckung','flexible','guard'],
    ['Schneide über den Schaft','greatAxe','strike'], ['Zorn im Zaum','flexible','aim'],
    ['Doppelter Kantenwechsel','twinAxes','feint'], ['Schritt des Schildbeißers','flexible','step'],
    ['Axtbart zur Fessel','flexible','slow'], ['Hut am langen Schaft','greatAxe','brace'],
    ['Äxte am Waffenarm','twinAxes','bind'], ['Tiefer Spaltbogen','greatAxe','heavy'],
    ['Schild vor dem Zorn','shield','bulwark'], ['Gerichteter Doppelhieb','twinAxes','advance'],
    ['Schneidender Richtungswechsel','greatAxe','feint'], ['Atem unter Spannung','flexible','resolve'],
    ['Eiserner Doppelkeil','twinAxes','heavy'], ['Gebändigte Langhut','greatAxe','brace']
  ],
  skytte: [
    ['Pfeil auf kurze Distanz','bow','quick'], ['Sax in der Hut','sidearm','guard'],
    ['Speer aus dem Knie','spear','strike'], ['Ziel zwischen den Zweigen','bow','aim'],
    ['Schuss auf die Öffnung','bow','feint'], ['Leiser Standortwechsel','sidearm','step'],
    ['Speer gegen den Schritt','spear','slow'], ['Deckung im Unterholz','sidearm','brace'],
    ['Axt am Waffenarm','sidearm','bind'], ['Voller Jagdauszug','bow','heavy'],
    ['Stand hinter dem Speer','spear','bulwark'], ['Klinge am Wildwechsel','sidearm','advance'],
    ['Versetzter Grenzpfeil','bow','feint'], ['Atem des Fährtenlesers','sidearm','resolve'],
    ['Speer des gestellten Wilds','spear','heavy'], ['Bogen in sicherer Deckung','bow','brace']
  ],
  skalde: [
    ['Klinge im Takt','sidearm','quick'], ['Standvers','voice','guard'],
    ['Schwert zwischen den Takten','sidearm','strike'], ['Gezählter Atem','voice','aim'],
    ['Antäuschender Refrain','sidearm','feint'], ['Schritt zum nächsten Takt','voice','step'],
    ['Sax an der Fessel','sidearm','slow'], ['Vers der Sammlung','voice','brace'],
    ['Klinge und Gegenrhythmus','sidearm','bind'], ['Betonter Schlusshieb','sidearm','heavy'],
    ['Standhafte Strophe','voice','bulwark'], ['Vorwärts im Gleichklang','sidearm','advance'],
    ['Rhythmuswechsel','sidearm','feint'], ['Vers des Durchhaltens','voice','resolve'],
    ['Hieb zum Hallenruf','sidearm','heavy'], ['Ruhiger Refrain','voice','brace']
  ]
};

const modes = {
  quick: {cost:'light',effect:'Ein leichter Einzelangriff. Kein kostenloser Folgeangriff.'},
  strike: {cost:'strike',effect:'Ein gezielter Einzelangriff mit der geführten Waffe.'},
  guard: {cost:'guard',noDamage:true,guard:1,effect:'Schadenslose Vorbereitung: +1 RK für einen eigenen Beitrag.'},
  aim: {cost:'prepare',noDamage:true,aim:true,effect:'Schadenslose Vorbereitung: +1 Angriff für einen eigenen Beitrag.'},
  step: {cost:'light',noDamage:true,mobility:2,effect:'+2 m Bewegungsbudget für einen eigenen Beitrag; keine freie Bewegung und kein automatisches Lösen aus dem Nahkampf.'},
  feint: {cost:'advance',attackBonus:1,effect:'Ein sorgfältig vorbereiteter Einzelangriff mit +1 auf den Angriffswurf.'},
  slow: {cost:'bind',slow:true,effect:'Nach Treffer KRF-Rettungswurf: bei Fehlschlag −2 m Bewegung für einen eigenen Beitrag.'},
  bind: {cost:'bind',penalty:true,effect:'Nach Treffer KRF-Rettungswurf: bei Fehlschlag −1 Angriff für einen eigenen Beitrag.'},
  heavy: {cost:'specialStrike',effect:'Ein kraftvoller Einzelangriff mit Besonderer Aktion. Keine automatische Entwaffnung oder Rüstungszerstörung.'},
  brace: {cost:'prepare',noDamage:true,guard:2,effect:'Schadenslose Abwehr: +2 RK für einen eigenen Beitrag; ersetzt schwächere Deckung.'},
  bulwark: {cost:'specialGuard',noDamage:true,guard:2,temporaryHp:'1d4',effect:'+2 RK für einen eigenen Beitrag und 1W4 temporäre TP. Temporäre TP werden nicht addiert.'},
  advance: {cost:'advance',mobility:1,effect:'Ein Einzelangriff. Bei Treffer +1 m Bewegungsbudget für einen eigenen Beitrag; keine freie Bewegung.'},
  resolve: {cost:'specialFlow',noDamage:true,temporaryHp:'1d6',effect:'1W6 temporäre TP; ersetzt nur einen niedrigeren Vorrat. Keine Heilung verlorener TP.'}
};

export function additionalHuskarlSpec([name, weapon, mode], level, slug) {
  const mounted = mode.startsWith('mounted');
  const key = mounted ? mode.slice(7).toLowerCase() : mode;
  if (!modes[key]) throw new Error(`Unbekannte Huskarl-Lektion: ${mode}`);
  return { ...modes[key], name, weapon, level, slug, mounted,
    ...(weapon === 'voice' ? {requirement:'Hörbare eigene Stimme. Nichtmagische Selbstvorbereitung; kein Effekt auf fremde Figuren, keine Manakosten.'} : {}) };
}

export function getAdditionalHuskarlLessons(classId) {
  return (options[classId] || []).map((option,index) => additionalHuskarlSpec(option,Math.floor(index / 2) + 1,`wahl-${index + 1}`));
}
