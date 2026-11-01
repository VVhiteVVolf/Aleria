// Public play only. Evidence and original public sources live in ./source.
export const GAWAIN_ID = 'q1QtSIug74FzzwUAqWrs';
export const GAWAIN_WORLD_ID = 'person--haus-draig--gawain-draig';
export const DUNCAN_ID = 'tmfBA2zPTc88EMMGkyyA';
export const GAWAIN_PORTRAIT = 'https://i.imgur.com/BceZTJo.jpeg';
export const DUNCAN_PORTRAIT = 'https://i.imgur.com/zdChj0a.png';
export const GAWAIN_PUBLIC_TITLE = 'Ritter des Hauses Draig · Mundschenk, Gwynthor';
export const GAWAIN_PUBLIC_SUMMARY = 'Sir Gawain Draig, jüngster ehelicher Sohn Galahads und Gwendolyns, ist Ritter und Mundschenk am Hof von Gwynthor. Begabt, eitel und schlagfertig, sucht er ein Leben jenseits der Burgmauern. Unter seinem früheren Rittervater Sir Duncan Gafyr soll er nun im Dienst an der Stadt zeigen, dass seinem Mut auch Verlässlichkeit und Urteilskraft folgen.';
const trait = (title, detail, icon) => ({ title, detail, icon: `/IconOrdner/Traits%20Icon/${icon}.png` });
export const GAWAIN_PUBLIC_BIOGRAPHY = {
  schema: 'aleria.biography-module', schemaVersion: 1,
  stats: [ ['Name','Sir Gawain Draig'], ['Geboren','1722 · 18 Jahre im Jahr 1740'], ['Haus','Draig · Celtigerns Wacht'],
    ['Stand','Prinz des Hauses Draig · Ritter'], ['Dienst','Mundschenk · ritterliche Bewährung in Gwynthor'], ['Rittervater','Sir Duncan Gafyr'], ['Verlobt','Guinevere Neidr'] ],
  quote: 'Ich möchte nur sehen, wofür ich eines Tages Verantwortung tragen soll.', quoteBy: '— Gawain vor dem Offenen Gericht',
  biography: {
    portrait: GAWAIN_PORTRAIT, portraitStages: ['', '', '', ''], sideWidth: 100, connectionPortraitHeight: 68, connectionTextOffset: 0,
    biographyTitle: 'Ein Prinz vor der Burgpforte',
    biographyText: '<p>Gawain Draig ist in einem Haus aufgewachsen, in dem sein Name Türen öffnet, bevor er selbst die Hand an die Klinke legt. Der jüngste eheliche Sohn Galahads und Gwendolyns kennt die Stimmen des Rates, den Geschmack guter Weine und die kleinen Kriege einer großen Familie. Als Mundschenk steht er oft nahe genug am Thron, um alles zu hören. Stillzustehen und bloß zuzuhören fällt ihm erheblich schwerer.</p>'
      + '<p>Er liebt schöne Kleidung, glänzende Rüstung und ausgesuchte Düfte mit einer Ernsthaftigkeit, die andere Menschen für wichtigere Dinge aufheben. Dabei fehlt ihm keineswegs der Geschmack; er kann durchaus erklären, weshalb ein Parfüm zu einem Menschen passt. Was er nur widerwillig versteht, ist die Vorstellung, dass nicht jeder seine Bequemlichkeiten für unentbehrlich hält. Für Regen, schmutzige Stiefel und das eigenhändige Richten eines widerspenstigen Riemens besitzt er wenig Geduld. Für eine treffende Bemerkung findet er dagegen fast immer Zeit.</p>'
      + '<p>Hinter dieser Eitelkeit steckt ein junger Mann mit echtem Können. Duncan Gafyr bildete ihn als Knappen aus; sein Vater schlug ihn bereits zum Ritter. Die Grundstellungen des Drachentanzes sitzen auch dann, wenn Gawain über die Übung klagt. Er erkennt Öffnungen und findet im Kampf überraschend gute Antworten. Nur vertraut er seinem Talent häufig lieber als der mühsamen Wiederholung. Wo ihm vieles leichtfällt, hält er Ausdauer zu schnell für eine Zumutung.</p>'
      + '<p>Gawain will hinaus. Nicht nur, um einer besonders schönen Heldengeschichte nachzureiten, sondern auch, um die Dörfer, Wege und Menschen kennenzulernen, für die sein Haus Verantwortung trägt. Beides lässt sich bei ihm noch schwer voneinander trennen: die ehrliche Neugier auf die Welt und der Wunsch, darin eine eindrucksvolle Rolle zu spielen. Dass seine Mutter ihn schützen möchte, erlebt er leicht als Bevormundung. Dass sie Gründe für ihre Sorge hat, sieht er erheblich seltener ein.</p>'
      + '<p>Seine Schlagfertigkeit hat eine scharfe Kante. Er kann einen langen Bericht über Hunger, Heimatverlust und gestorbene Angehörige mit einer gelangweilten Bemerkung verletzen, weil er zuerst an seine eigene Unterhaltung denkt. Ylva Wolfshorn ließ ihn damit nicht davonkommen. Gawain versuchte nicht, sich hinter seinem Rang zu verstecken: Er hörte ihre Antwort, entschuldigte sich vor dem Hof und bot Hilfe an. Das macht aus ihm keinen geläuterten Musterknaben. Es zeigt aber, dass er erreichbar bleibt, wenn jemand seinen Übermut durchdringt.</p>'
      + '<p>Auch seine Zuneigung ist selten leise. Taliesin Draenmelyn ist für ihn nicht irgendein austauschbarer Diener, sondern sein bester Freund und engster Vertrauter. Dennoch denkt Gawain Freundschaft und Bedienung so selbstverständlich zusammen, dass ihm der Widerspruch kaum auffällt. Guinevere Neidr nennt er seine beste Freundin; die von ihren Eltern vereinbarte Verlobung wollte er selbst nicht. Seine wachsende Aufmerksamkeit für Ylva ist im Hof und auf dem Übungsplatz unübersehbar. Daraus ist jedoch weder eine aufgehobene Verlobung noch ein neuer Ehebund geworden.</p>'
      + '<p>Gawain kann Anerkennung annehmen und sie auch einem anderen geben. Nach seinem ersten Sieg über Gildas Gafyr reichte er dem unterlegenen Ritter die Hand und dankte ihm aufrichtig. Als Asgeir und Ylva ihr Können zeigten, wich seine Selbstsicherheit sichtlichem Respekt. Unter dem Wunsch, bewundert zu werden, liegt damit etwas, woran Duncan anknüpfen kann: Gawain möchte nicht bloß als Prinz behandelt werden. Er möchte, dass sein Können zählt.</p>'
      + '<p>Nun soll er lernen, dass ein Ritter auch dann gebraucht wird, wenn niemand eine Ballade über ihn schreibt. Zwei Wochen Dienst in Gwynthor, bis zu Tudwals Hochzeit: Patrouillen, Bürgeranliegen und die kleinen Pflichten außerhalb des Burghofs, unter Duncans wachsamen Augen und ohne Taliesins helfende Hände. Für Gawain ist das zugleich Einschränkung und endlich ein erster Schritt durch die Burgpforte. Ob daraus Verlässlichkeit wird, muss er noch zeigen.</p>',
    abilitiesTitle: 'Wesen & Widersprüche',
    abilities: [
      trait('Eitel','Er pflegt sein Äußeres mit Überzeugung und möchte, dass sein Auftreten seinem Rang entspricht. Schmutz und Unordnung treffen ihn oft unmittelbarer als eine ernste Ermahnung.','Proud'),
      trait('Schlagfertig','Gawain erkennt die komische Seite einer Lage schnell und genießt eine gute Pointe. Nicht immer merkt er rechtzeitig, dass er gerade über die Wunde eines anderen lacht.','Gregarious'),
      trait('Begabt, aber bequem','Sein Gespür für den Schwertkampf ist echt. Die Geduld, daraus durch tägliche Übung verlässliches Handwerk zu machen, muss Duncan ihm noch immer abverlangen.','Slothful'),
      trait('Hungrig auf die Welt','Abenteuer locken ihn, aber auch die Menschen jenseits der Burgmauern. Er möchte eigene Erfahrungen sammeln und seinen Platz nicht allein von anderen bestimmen lassen.','Curious'),
      trait('Loyal auf seine Weise','Taliesin und Guinevere sind ihm wichtig, auch wenn er Zuneigung, Stand und eigene Ansprüche nicht sauber auseinanderhält. Über vertraute Menschen darf nach seiner Auffassung längst nicht jeder spotten.','Trusting'),
      trait('Empfänglich für Anerkennung','Lob richtet ihn auf; Kränkungen reizen ihn. Trotzdem kann er eigene Grenzen benennen, einen Gegner respektieren und eine aufrichtige Entschuldigung aussprechen.','Willful')
    ],
    historyTitle: 'Ritterschlag und Bewährung',
    historyText: '<p>Geboren 1722 als Sohn Galahad Draigs und Gwendolyns, geborener Aderyn, wuchs Gawain am Hof von Gwynthor auf. Duncan Gafyr war sein Rittervater während der Knappenzeit. Galahad hat ihn inzwischen zum Ritter geschlagen. An Duncans Seite soll er nun lernen, seinen Rang auch in den unscheinbaren Pflichten des Alltags auszufüllen.</p>'
      + '<p>Im Offenen Gericht entzündete sich an seiner Abenteuerlust die Frage, ob er Verantwortung schon tragen könne. Meurig schlug einen Dienst in Stadt und Vororten vor, Egon versprach den Dienstplan, und Gwendolyn band den Versuch an den Verzicht auf seinen Kammerdiener. Duncan sollte beobachten, anleiten und urteilen. Gawain stimmte zu, weil darin trotz aller Auflagen eine Möglichkeit lag, endlich häufiger aus der Burg zu kommen.</p>'
      + '<p>Auf dem Übungsplatz gelang ihm anschließend der erste Sieg gegen seinen langjährigen Trainingsgegner Gildas. Duncan erkannte das Verdienst an und benannte zugleich den riskanten Übermut der letzten Angriffsfolge. Für ihre gemeinsame Zeit ist das bezeichnend: Ein Fortschritt wird gewürdigt, aber nicht mit einer abgeschlossenen Entwicklung verwechselt.</p>',
    worksTitle: 'Gegenwärtiger Weg', works: ['Ritterlicher Dienst in Gwynthor unter Sir Duncans Aufsicht; die Bewährung ist noch nicht abgeschlossen.'],
    triviaTitle: 'Vertraute Dinge', trivia: ['Sein Rhyfelhengst Tanor war ein Geschenk Sir Owains zu seinem achtzehnten Geburtstag.','Er möchte Ylva sowohl den Drachentanz mit der Klinge als auch den Volkstanz zeigen.'],
    quotesTitle: 'Eigene Worte', quotes: ['„Ich pflege mich eben. Dafür schäme ich mich nicht.“'],
    connectionsTitle: 'Menschen an seiner Seite', connections: [
      {type:'connection',name:'Sir Duncan Gafyr',detail:'Früherer Rittervater und jetziger Leiter seiner Bewährung. Der alte Waffenmeister erkennt sein Talent, lässt aber Rang und Charme nicht für Arbeit gelten.',image:DUNCAN_PORTRAIT,imageFormat:'portrait'},
      {type:'connection',name:'Gwendolyn Draig, geb. Aderyn',detail:'Seine Mutter schützt ihn mit Nachdruck. Gawain liebt sie und wehrt sich zugleich gegen die engen Grenzen, die ihre Sorge ihm setzt.'},
      {type:'connection',name:'Taliesin Draenmelyn',detail:'Kammerdiener, bester Freund und Vertrauter. Während der Bewährung darf er Gawain auf den Patrouillen ausdrücklich nicht bedienen.'},
      {type:'connection',name:'Guinevere Neidr',detail:'Seine beste Freundin und von den Eltern bestimmte Verlobte. Gawain beschreibt ihre Bindung als freundschaftlich, nicht als von ihm gewählte Liebesverbindung.'},
      {type:'connection',name:'Ylva Wolfshorn',detail:'Gast aus Aldrimar, die seinen Spott zurückwies und seine Entschuldigung annahm. Zwischen beiden wachsen Neugier, Flirt und gegenseitiger Respekt.'},
      {type:'connection',name:'Sir Gildas Gafyr',detail:'Langjähriger Trainingsgegner und vertrauter junger Ritter. Konkurrenz und Spott schließen gegenseitige Hilfe und Anerkennung nicht aus.'}
    ],
    documentsTitle:'Eigentum & Begleiter', documents:[{title:'Tanor',text:'Sein Rhyfelhengst, ein Geschenk Sir Owains zu seinem achtzehnten Geburtstag.',icon:'♞'}],
    extraSections: [], footer: 'Sir Gawain Draig · Haus Draig · Gwynthor'
  }
};

const OLD_SUMMARY = 'Gawain Draig ist der jüngste Sohn von Galahad Draig und Gwendolyn Draig geb. Aderyn als auch der Mundschenk seiner hochwürden des Grafen.';
const empty = value => !String(value || '').replace(/<[^>]*>/g, '').replace(/[.\s…]/g, '');
function hasAuthoredBiography(module) {
  const bio = module?.biography || {};
  return !empty(module?.quote) || !empty(bio.biographyText) || !empty(bio.historyText)
    || ['works','trivia','quotes'].some(key => (bio[key] || []).some(value => !empty(value)))
    || ['abilities','connections','documents','extraSections'].some(key => (bio[key] || []).some(row => !empty(row.detail || row.text || row.name || row.title)));
}
// A read projection: never changes identity, ownership, inventory or live mechanics.
export function withGawainPublicBiography(character) {
  if (character?.id !== GAWAIN_ID && character?.identity?.worldPersonId !== GAWAIN_WORLD_ID && character?.genealogy?.worldPersonId !== GAWAIN_WORLD_ID) return character;
  const patch = {};
  if (empty(character.bio) || character.bio === OLD_SUMMARY) patch.bio = GAWAIN_PUBLIC_SUMMARY;
  if (empty(character.title) || character.title === 'Mundschenk des Grafen, Gwynthor') patch.title = GAWAIN_PUBLIC_TITLE;
  if (!hasAuthoredBiography(character.biography)) {
    const authored = structuredClone(GAWAIN_PUBLIC_BIOGRAPHY);
    authored.stats = authored.stats.map(([label, value]) => ({ label, value }));
    if (character.biography?.biography?.portrait) authored.biography.portrait = character.biography.biography.portrait;
    patch.biography = authored;
  }
  return Object.keys(patch).length ? { ...character, ...patch } : character;
}
