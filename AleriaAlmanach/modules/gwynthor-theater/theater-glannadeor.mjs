import { GLANNADEOR_PLAY } from '../../../shared/urgren/glannadeor-play.mjs';
import { theaterPerson } from './theater-people.mjs';

const roles = [
  ['aelir', 'Fear Doirich', 'Ratsdruide, Liebender und trauernder Vater; derselbe Darsteller vor und nach dem Zeitsprung.'],
  ['roderich', 'Madra Rua und seine verfluchte Bärengestalt', 'Der bronzene Reif verbindet den Krieger mit dem späteren Unhold.'],
  ['florian', 'Púca / der befreite Brannoc', 'Große Bärenpuppe mit abnehmbarem dunklem Überwurf; nach der Erlösung erscheint das helle Fell.'],
  ['rhoswen', 'Cormacs Tochter', 'Unbenannte Fürstentochter, später Fear Doirichs Frau und Mutter seines Sohnes.'],
  ['geraint', 'Der Sohn Fear Doirichs', 'Erwachsener Druidenkrieger, der seine Feuerprobe gegen den Wunsch des Vaters sucht.'],
  ['cadfan', 'Fürst Cormac Ui Talamh', 'Der frühantike Fürst dieser Sage, Herr Oseneachs.'],
  ['nuala', 'Chorführerin und Klagestimme', 'Erzählt die Jahrhunderte und führt „Unter Eichen, unter Stein“.'],
  ['faelan', 'Kriegsherr, Bote und Rabenstimme', 'Getrennte Nebenrollen mit sichtbarem Maskenwechsel.'],
  ['eleri', 'Hof- und Dorfchor', 'Mit Rosalie, Samira, Sigrun und Sabjorn; Freier, Ratsleute und stumme Maskenrollen.'],
  ['rosalie', 'Hof- und Dorfchor', 'Gesungene Antworten im Kehrvers.'],
  ['samira', 'Hof- und Dorfchor', 'Ratsszene und Entfaltung des unterirdischen Ahnenbaums.'],
  ['sigrun', 'Hof- und Dorfchor', 'Freier- und Dorfszenen, Wurzelkulisse im Schlussbild.'],
  ['sabjorn', 'Hof- und Dorfchor', 'Bühnenkampf als Schattenbild, Wurzelkulisse im Schlussbild.']
];
export const GLANNADEOR_CAST = Object.freeze(roles.map(([key, role, note]) => Object.freeze({ key, actor: theaterPerson(key).name, role, note })));

export const GLANNADEOR_PRODUCTION = Object.freeze({
  id: GLANNADEOR_PLAY.id,
  title: GLANNADEOR_PLAY.title,
  genre: 'Albisches Trauerspiel · fünf Aufzüge mit Klagelied',
  setting: 'Tír na nDoirí im alten Oseneach · Dún Áinmardh und Glannadeor · viele Jahrtausende vor Celtigern',
  synopsis: '<p>Fürst Cormac Ui Talamh regiert ein blühendes Land und hat sieben Söhne und eine Tochter. Als der Púca Monat um Monat die Dörfer und selbst Dún Áinmardhs Mauern angreift, verspricht er seine Tochter dem Bezwinger. Kein ausgezogener Krieger kehrt zurück.</p>'
    + '<p>Madra Rua handelt mit dem Unhold um einen vorgetäuschten Sieg, die Braut und Glannadeor. Untertanen und selbst die sieben Fürstensöhne genügen dem Bären nicht: Er verlangt den Ratsdruiden Fear Doirich. Mit der Aussicht, einen von Zatrach verdorbenen Brannoc-Fürsten zu erlösen, lockt Madra ihn in die Berge.</p>'
    + '<p>Von den Tieren gewarnt, lenkt Fear Doirich den Handel durch Madras freiwilligen Eid um. Er befreit den Brannoc und überträgt die Verderbnis auf den habgierigen Krieger. Der Druide kehrt auf dem Bären heim, heiratet die Fürstentochter und erzieht ihren Sohn zum Druidenkrieger.</p>'
    + '<p>Jahrhunderte später sucht der Sohn gegen den Wunsch des Vaters seine Feuerprobe. In Glannadeors Ruinen bezwingt und frisst ihn Madras Bärengestalt. Am bronzenen Reif erkennt Fear Doirich die eigene frühere Tat. Er verflucht sich selbst und stirbt; aus seinem Leib wächst der Ahnenbaum, dessen Äste die unterirdischen Mauern umschließen und nie das Tageslicht erreichen. Der Epilog erzählt von den seltenen Madrúach-Urgren in Celtigerns Bergen.</p>'
    + '<p><a href="./assets/gwynthor-theater/productions/der-eid-von-glannadeor/rollenheft.html" target="_blank" rel="noopener">Vollständiges Rollenheft mit Dialogen und Besetzung</a> · <a href="../Bestiarium/tiere/raubtiere/baeren/urgren/klagelied.html" target="_blank" rel="noopener">Klagelied: Unter Eichen, unter Stein</a> · <a href="../Bestiarium/tiere/raubtiere/baeren/urgren/index.html#sage" target="_blank" rel="noopener">Die Ursprungssage im Bestiarium</a></p>',
  cast: GLANNADEOR_CAST.slice(0, 8).map(item => item.actor + ' als ' + item.role).join(' · ') + ' · Eleri, Rosalie, Samira, Sigrun und Sabjorn als Hof- und Dorfchor',
  staging: 'Elenids Inszenierung verbindet sieben Eichenmasken, eine wandelbare Bärenpuppe, rote Seide für den Fluch und Schattenkampf. Ein bronzener Reif führt durch beide Zeitebenen. Im Schlussbild entfaltet das Ensemble einen Ahnenbaum unter der Gewölbedecke; kein Zweig erreicht die Oberwelt. Tod und Gewalt werden durch Chor, Schatten und zurückgelassene Requisiten vermittelt.',
  actors: ['aelir', 'roderich', 'florian'],
  visual: 'Aelir als Fear Doirich, Roderich als Madra Rua und Florian an der großen hellen Brannoc-Bärenpuppe beim bindenden Eid auf einer wirklichen Theaterbühne. Eichenstab, bronzener Reif, rote Seide und ein vorausdeutender Bärenschatten; burgunderrote Vorhänge und sichere Kerzenrampen. Alle Darsteller haben ordinary rounded HUMAN ears.'
});
