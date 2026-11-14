import { GLANNADEOR_LAMENT, GLANNADEOR_SAGA } from './glannadeor-lore.mjs';
import { GLANNADEOR_PLAY } from './glannadeor-play.mjs';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const verse = (lines, label = '') => '<section class="glannadeor-verse">' + (label ? '<h3>' + escape(label) + '</h3>' : '') + '<p>' + lines.map(escape).join('<br>') + '</p></section>';

function documentPage({ title, subtitle, backHref, backLabel, body, image }) {
  return '<!doctype html>\n<!-- Generated from shared/urgren author sources. -->\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#eee5ce"><title>' + escape(title) + ' · Aleria</title><meta name="description" content="' + escape(subtitle) + '"><link rel="stylesheet" href="/shared/urgren/glannadeor.css?v=20261114"></head><body><a class="glannadeor-skip" href="#inhalt">Zum Text</a><main class="glannadeor-document"><nav><a href="' + escape(backHref) + '">← ' + escape(backLabel) + '</a></nav><header><p class="glannadeor-eyebrow">Aleria · Tír na nDoirí · Glannadeor</p><h1>' + escape(title) + '</h1><p>' + escape(subtitle) + '</p></header>' + (image ? '<figure class="glannadeor-cover"><img src="' + escape(image) + '" alt="Bühnenbild zum Eid von Glannadeor" width="1024" height="1536"></figure>' : '') + '<div id="inhalt">' + body + '</div><footer><a href="' + escape(backHref) + '">← ' + escape(backLabel) + '</a></footer></main></body></html>\n';
}

export function formatGlannadeorLament() {
  const song = GLANNADEOR_LAMENT;
  const parts = [song.title, song.subtitle, '', song.note, '', 'Vortrag: ' + song.performance, ''];
  for (const [index, lines] of song.verses.entries()) {
    parts.push('Strophe ' + (index + 1), ...lines, '');
    if (song.chorusAfter.includes(index + 1)) parts.push('Kehrvers', ...song.chorus, '');
  }
  parts.push('Schlussklage', ...song.coda, '');
  return parts.join('\n');
}

export function renderGlannadeorLament() {
  const song = GLANNADEOR_LAMENT;
  const body = '<aside class="glannadeor-note"><p>' + escape(song.note) + '</p><p>' + escape(song.performance) + '</p><a href="./unter-eichen-unter-stein.txt" download>Liedtext als Textdatei herunterladen</a></aside>'
    + song.verses.map((lines, index) => verse(lines, 'Strophe ' + (index + 1)) + (song.chorusAfter.includes(index + 1) ? verse(song.chorus, 'Kehrvers') : '')).join('')
    + verse(song.coda, 'Schlussklage');
  return documentPage({ title: song.title, subtitle: song.subtitle, body, backHref: './index.html#sage', backLabel: 'Zur Sage der Urgren' });
}

export function renderGlannadeorPlay(cast) {
  const play = GLANNADEOR_PLAY;
  const body = '<aside class="glannadeor-note"><p>' + escape(GLANNADEOR_SAGA.chronology) + '</p><p>Eine Bühnenbearbeitung der albischen Ursprungssage der Madrúach. Die sieben Söhne und die Tochter des frühantiken Cormac bleiben in dieser Überlieferung namenlos.</p><p><a href="/Bestiarium/tiere/raubtiere/baeren/urgren/index.html#sage">Die vollständige Ursprungssage</a> · <a href="/Bestiarium/tiere/raubtiere/baeren/urgren/klagelied.html">Klagelied mit allen Strophen</a></p></aside>'
    + '<section aria-labelledby="besetzung"><h2 id="besetzung">Die Besetzung</h2><dl class="glannadeor-cast">' + cast.map(item => '<div><dt>' + escape(item.actor) + '</dt><dd><strong>' + escape(item.role) + '</strong><br>' + escape(item.note || '') + '</dd></div>').join('') + '</dl><p>Regie und dramatische Arbeit: Elenid Awenfryn. Die sieben Söhne Cormacs erscheinen als sieben namenlose Eichenmasken; die Freier stammen aus anderen Fürstenhäusern. Die Rollen der Fürstentochter und des Sohnes bleiben ohne erfundenen Eigennamen.</p></section>'
    + '<nav class="glannadeor-acts" aria-label="Aufzüge">' + play.acts.map((act, i) => '<a href="#aufzug-' + (i + 1) + '">' + escape(act.title) + '</a>').join('') + '</nav>'
    + play.acts.map((act, index) => '<section class="glannadeor-act" id="aufzug-' + (index + 1) + '"><h2>' + escape(act.title) + '</h2>' + act.scenes.map(scene => '<section><h3>' + escape(scene.title) + '</h3><p class="glannadeor-direction">' + escape(scene.direction) + '</p>' + scene.lines.map(([role, text]) => '<p class="glannadeor-dialogue"><strong>' + escape(role) + ':</strong> ' + escape(text) + '</p>').join('') + '</section>').join('') + '</section>').join('')
    + '<section><h2>Das Schlusslied</h2><p>' + escape(GLANNADEOR_LAMENT.performance) + '</p>' + verse(GLANNADEOR_LAMENT.chorus, 'Kehrvers') + verse(GLANNADEOR_LAMENT.coda, 'Schlussklage') + '<p><a href="/Bestiarium/tiere/raubtiere/baeren/urgren/klagelied.html">Vollständiger Liedtext mit 18 Strophen</a></p></section>';
  return documentPage({ title: play.title, subtitle: play.subtitle, body, image: '../der-eid-von-glannadeor.png', backHref: '/AleriaAlmanach/AleriaAlmanach.html', backLabel: 'Zum Gwynthorer Theater im Almanach' });
}
