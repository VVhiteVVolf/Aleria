import { LOTHAIRE_EMBLEM, LOTHAIRE_FAMILY_LINK, LOTHAIRE_MOTTO, arkaneumPerson } from './arkaneum-people.mjs';
const crestImage = `../Stammbäume/${LOTHAIRE_EMBLEM}`;
const connection = id => { const person = arkaneumPerson(id); return { name: person.name, detail: person.role, image: person.portrait }; };
const familyDocument = { title: 'Haus Lothaire und die O’Cenyr-Linie', icon: crestImage, text: 'Herkunft, frühere Verbindungen und die drei Generationen im Arkaneum.', link: LOTHAIRE_FAMILY_LINK };

export function buildHerluinBiography() {
  return { crestImage, biographyTitle: 'Ein Einfall wartet selten auf Erlaubnis',
    biographyText: '<p>Herluin Lothaire begrüßt einen neuen Gedanken mit demselben breiten Grinsen wie einen Kunden. Er spricht schnell, schweift ab und kehrt mit einer Behauptung zurück, die nach seiner Auffassung alles erklärt. Das wilde Haar steht dunkelgrau vom Kopf, an den Spitzen fast weiß. Im einen Auge liegt ein silbriger Schimmer; im anderen sitzt ein Amethyst. Violette Äderchen ziehen sich von seiner Fassung unter der Haut bis zum Hals.</p><p>Der Mann hinter dem Tresen wirkt etwa dreiunddreißig. Tatsächlich ist er hundertdreiundsechzig. Wenn sein betagter Sohn ihn an einen vergessenen Ansatz erinnert, sieht für Fremde zunächst der Falsche wie der Vater aus. Herluin genießt diese Verwechslung mehr, als Rhydian lieb ist.</p>',
    historyTitle: 'Aus Brevanor nach Gwynthor',
    historyText: '<p>Herluin entstammt einer brevanorischen Alchemistenfamilie. Vor rund hundertzwanzig Jahren studierte er bei der Magiergilde in der Blutstadt. Wegen seiner Experimente wurde er ausgeschlossen und verbannt. Was genau in jenen Räumen geschah, erzählt er selten zweimal auf dieselbe Weise.</p><p>In Gwynthor ließ er sich mit seiner Arbeit nieder. Nahe dem Park und dem Badehaus betreibt er heute sein Arkaneum. Der Garten liefert gewöhnliche Kräuter, drei Beschaffer bringen Funde aus dem Umland. Seltenere Dinge gelangen einzeln und unregelmäßig in den verschlossenen Schrank.</p>',
    abilitiesTitle: 'Eigenarten', abilities: [
      { title: 'Unermüdliche Neugier', icon: '✦', detail: 'Fragt zuerst, was ein Fund bewirken könnte, und erst danach, wer den Tisch wieder säubert.' },
      { title: 'Kräuterkundiger', icon: '❧', detail: 'Verbindet überlieferte Laborarbeit mit eigener Beobachtung; gewöhnliche Vorräte prüft Rhydian mit.' },
      { title: 'Widerspruch als Antrieb', icon: '⚗', detail: 'Eine vernünftige Einwendung kann einen Versuch beenden. Bei Herluin beginnt damit häufig eine längere Besprechung.' }
    ], worksTitle: 'Sein Alltag', works: ['Führt Labor und Laden, nimmt besondere Arbeiten an und prüft die neuen Funde.', 'Unterrichtet seinen magiebegabten Enkel Maelwyn; Rhydian ist sein nicht magiebegabter Gehilfe.'],
    triviaTitle: 'Am Tresen', trivia: ['Die purpurne Kugel schimmert, ohne eine deutliche Vision zu zeigen.', 'Perban verwaltet die Bücher. Ein begeistertes Versprechen Herluins ist noch kein eingetragener Auftrag.'],
    quotesTitle: 'Wahlspruch des Hauses', quotes: [LOTHAIRE_MOTTO], connectionsTitle: 'Seine nächsten Hände',
    connections: ['rhydian-o-cenyr', 'maelwyn-o-cenyr', 'perban', 'nauthagerd'].map(connection), documentsTitle: 'Familie', documents: [familyDocument] };
}
export function buildLothaireBiography() {
  return { crestImage, biographyTitle: 'Drei Generationen unter einem Dach',
    biographyText: '<p>Der Name Lothaire stammt aus einer brevanorischen Alchemistenfamilie. Ihr Zeichen zeigt eine helle Marmorruine, an der Blüten emporranken: Nachtblau, Elfenbein und Altrosa im silbernen Rahmen. Im Arkaneum steht die Familie heute für drei Menschen, deren Lebensalter man ihnen nur teilweise ansieht.</p>',
    historyTitle: 'Helygyn, Rhydian und Perdella',
    historyText: '<p>Herluin und die Cenyri Helygyn hatten eine außereheliche Verbindung. Ihr einziger Sohn Rhydian wurde 1668 geboren und trägt den Bastardbeinamen O’Cenyr. Helygyn starb 1701. Rhydian heiratete 1695 Perdella; 1697 wurde ihr einziges Kind Maelwyn geboren. Perdella starb 1729.</p><p>Rhydian ist zweiundsiebzig und ohne magische Begabung gealtert. Sein dreiundvierzigjähriger Sohn besitzt diese Gabe und wirkt deutlich jünger. Beide gehören zur nicht legitimierten O’Cenyr-Linie. Maelwyn wurde in Rhydians Ehe geboren; der Ursprung seiner Linie bleibt dennoch außerehelich. Vater und Sohn führen weder den Namen noch das Wappen der Lothaire.</p>',
    abilitiesTitle: 'Was die Familie verbindet', abilities: [{ title: 'Überlieferung', icon: '⚗', detail: 'Herluin bewahrt das Handwerk seiner Herkunftsfamilie und entwickelt es nach eigenem Ermessen weiter.' },
      { title: 'Geduld', icon: '❧', detail: 'Rhydian bringt jahrzehntelange Erfahrung mit Kräutern und Vorräten ein.' },
      { title: 'Lehre', icon: '✦', detail: 'Maelwyn ist Herluins einziger Enkel und sein persönlicher Lehrling.' }],
    worksTitle: 'Im Haus', works: ['Herluin führt; Rhydian hilft und prüft; Maelwyn lernt und bereitet Arbeiten vor.'],
    triviaTitle: 'Frühere Generationen', trivia: ['Die Gründer bleiben unbekannt. Zwischen ihnen und Herluin liegen nicht einzeln überlieferte Generationen.', 'Helygyn und Perdella stammten aus Cenyr. Ihre Namen bleiben in der Familie ebenso in Erinnerung wie die Arbeit der Männer.'],
    quotesTitle: 'Wahlspruch', quotes: [LOTHAIRE_MOTTO], connectionsTitle: 'Familie und frühere Verbindungen',
    connections: ['herluin-lothaire', 'rhydian-o-cenyr', 'maelwyn-o-cenyr', 'helygyn', 'perdella'].map(connection), documentsTitle: 'Der vollständige Stammbaum', documents: [familyDocument] };
}
