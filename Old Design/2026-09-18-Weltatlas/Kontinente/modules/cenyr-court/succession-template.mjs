import { HOUSE_PENDRAG_FAMILY } from '../../../Stammbäume/assets/js/data/house-pendrag-family.js';
import { createFamilyViewLink } from '../../../Stammbäume/assets/js/services/family-links.js';
import { CENYR_MONARCHS, SUCCESSION_PRINCIPLES } from './succession-data.mjs';
import { courtPage, escapeHtml, paragraphs } from './court-template.mjs';

const treeRoot = '../../../Stammbäume/';

export function monarchLink(personId) {
  return treeRoot + createFamilyViewLink(HOUSE_PENDRAG_FAMILY.document.id, personId);
}

function monarchEntry(monarch) {
  const person = HOUSE_PENDRAG_FAMILY.persons.find(candidate => candidate.id === monarch.personId);
  if (!person) throw new Error(`Stammbaumperson fehlt: ${monarch.personId}`);
  const portrait = person.portrait || HOUSE_PENDRAG_FAMILY.document.emblem;
  const image = /^(https?:)?\/\//.test(portrait) ? portrait : treeRoot + portrait;
  return `${monarch.gapBefore ? `<li class="court-timeline-gap"><span>${escapeHtml(monarch.gapBefore)}</span></li>` : ''}
    <li class="court-monarch${monarch.current ? ' court-monarch-current' : ''}" id="${monarch.personId}">
      <a class="court-monarch-link" href="${escapeHtml(monarchLink(monarch.personId))}" aria-label="${escapeHtml(monarch.name)} Pendrag im Stammbaum öffnen">
        <img class="court-monarch-portrait${person.portrait ? '' : ' court-monarch-crest'}" src="${escapeHtml(image)}" alt="" width="72" height="88" loading="lazy">
        <div class="court-monarch-name"><p class="court-label">${monarch.current ? 'Die gegenwärtige Krone' : 'Haus Pendrag · König von Cenyr'}</p><h3>${escapeHtml(monarch.name)}</h3>${monarch.note ? `<p class="court-monarch-note">${escapeHtml(monarch.note)}</p>` : ''}</div>
        <div class="court-monarch-reign"><span>Regentschaft</span><strong>${escapeHtml(monarch.reign)}</strong></div>
        <span class="court-monarch-open">Im Stammbaum <span aria-hidden="true">↗</span></span>
      </a>
    </li>`;
}

export function renderSuccessionPage() {
  return courtPage({
    title: 'Die Kronfolge Cenyrs', subtitle: 'Die Chronik der Könige', page: 'succession', icon: 'kronfolge',
    description: 'Vom ersten König Vortigern bis zur Herrschaft Tristans: die überlieferten Könige des Hauses Pendrag und das Recht auf Cenyrs Krone.',
    navigation: [['koenigtum', 'Das Königtum'], ['herrscher', 'Die Könige Cenyrs'], ['ursprung', 'Ursprung des Reiches'], ['erbrecht', 'Das Recht auf die Krone'], ['nimues-versprechen', 'Nimues Versprechen']],
    body: `
      <section class="court-intro" id="koenigtum">
        <p class="court-eyebrow">Unter dem Zeichen des Golddrachen</p>
        <h2>Eine Krone, zwei Wurzeln</h2>
        <p>Aus dem Bündnis der geflohenen Avallornier und der einheimischen Crannath-Alben entstand Cenyr. Ritterlichkeit, Ehre und Tugend prägen sein Königtum. Seine Herrscher und Ritter trugen den Ehrenkodex weit über die Grenzen des Reiches hinaus.</p>
        <dl class="court-facts"><div><dt>Regierungsform</dt><dd>Erbmonarchie</dd></div><div><dt>Dynastie</dt><dd>Haus Pendrag</dd></div><div><dt>Hauptstadt</dt><dd>Mathragon</dd></div><div><dt>Erbrecht</dt><dd>Primogenitur</dd></div><div><dt>Lehnsautorität</dt><dd>Sehr hoch</dd></div><div><dt>Glaube</dt><dd><a href="../../../Religionen/index.html">Alerische Kirche</a></dd></div></dl>
      </section>
      <section class="court-section" id="herrscher">
        <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">I</span><div><p class="court-eyebrow">Die überlieferte Herrscherfolge</p><h2>Die Könige Cenyrs</h2></div></header>
        <p>Wähle einen König, um ihn im Stammbaum des Hauses Pendrag zu öffnen und seine familiären Verbindungen zu erkunden.</p>
        <p class="court-source-note">Die frühe Chronik ist lückenhaft. Die markierten Zeitsprünge bezeichnen nicht überlieferte Abschnitte; aufeinanderfolgende Einträge bilden daher keine lückenlose Thronfolge ab. Unbekannte Regierungszeiten bleiben offen.</p>
        <ol class="court-timeline" aria-label="Überlieferte Könige Cenyrs">${CENYR_MONARCHS.map(monarchEntry).join('\n')}</ol>
      </section>
      <section class="court-section" id="ursprung">
        <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">II</span><div><p class="court-eyebrow">Flucht, Bündnis & Gründung</p><h2>Der Ursprung des Reiches</h2></div></header>
        <p>Die Avallornier lebten einst im reichen westlichen Reich Avallorn. Als ihre Heimat unterging, flohen die Überlebenden über das Meer an die Küsten der heutigen Westlande. Dort trafen sie auf die Crannath-Alben, die bereits gegen die einfallenden Norrnaigh kämpften.</p>
        <p>Auf der Suche nach einer neuen Heimat schlossen die Avallornier ein Bündnis mit den Crannath. Gemeinsam vertrieben sie die Nordmänner. Ihr Sieg verband die Naturverbundenheit und Weisheit der Crannath mit dem militärischen Geschick und den ritterlichen Idealen der Avallornier.</p>
        <p>Unter <a href="${escapeHtml(monarchLink('vortigern-pendrag'))}">Vortigern Pendrag</a>, dem ersten König Cenyrs, wuchsen die beiden Völker zu den Cenyri zusammen. Über die Jahrhunderte wurde das Reich zu einem Zentrum des Rittertums. Äußere Bedrohungen, Rivalitäten im Inneren und die Gefahren seiner Grenzlande stellten es dennoch immer wieder auf die Probe.</p>
        <p>Das heutige Cenyr versteht sich als Hüter ritterlicher Ideale, des Glaubens und der Gerechtigkeit. Seine Grafschaften, Küstenregionen und Berglande verbinden alte Traditionen mit den Anforderungen ihrer jeweiligen Lebensräume. Auf den früheren Glauben an den <a href="../../../Religionen/religionen/alter-pantheon/index.html">Alten Pantheon</a> folgte die Alerische Kirche.</p>
      </section>
      <section class="court-section" id="erbrecht">
        <header class="court-section-heading"><span class="court-section-number" aria-hidden="true">III</span><div><p class="court-eyebrow">Abstammung verpflichtet</p><h2>Das Recht auf die Krone</h2></div></header>
        <p>Das cenyrische Erbrecht verbindet familiäre Ansprüche mit Lehnstreue und ritterlicher Bewährung. Legitimität, Eignung und die Anerkennung durch Kirche und Vasallen bestimmen, wer ein Erbe antreten kann.</p>
        <ol class="court-principles">${SUCCESSION_PRINCIPLES.map(principle => `<li><h3>${escapeHtml(principle.title)}</h3>${paragraphs(principle.description)}</li>`).join('\n')}</ol>
      </section>
      <section class="court-section court-legend" id="nimues-versprechen">
        <p class="court-eyebrow">Glaube & Königswürde · Das Schwert im Stein</p><h2>Nimues Versprechen</h2>
        <p>Der Legende nach kehrt das Schwert der Könige an eine verborgene heilige Stätte zurück und ruht dort im Stein, wenn die königliche Linie erlischt oder kein geeigneter Erbe bleibt.</p>
        <p>Wer es herausziehen kann, gilt als von Nimue, der Dame des Sees, erwählt und als rechtmäßiger König Cenyrs. Diese göttliche Prüfung soll die Krone einem würdigen, tugendhaften und starken Menschen anvertrauen.</p>
        <p>Die Überlieferung schenkt dem Volk in Krisenzeiten Hoffnung. Sie erinnert daran, dass Herrschaft in Cenyr mit Tugend, göttlicher Bestimmung und einer Führung im Einklang mit den Göttern verbunden sein soll.</p>
      </section>`
  });
}
