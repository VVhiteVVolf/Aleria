// ══════════════════════════════════════════════════════════
//  FILTER — multi-select tags, single-select everything else
// ══════════════════════════════════════════════════════════
const AF = { tier: null, tag: new Set(), region: null, section: null };
let   priceUnit = 1; // multiplier to convert input → Kupfer
const KI_PROXY_BASE = 'https://proxy-production-3a62.up.railway.app';

function setUnit(u) {
  priceUnit = u === 'G' ? 1000 : u === 'S' ? 100 : 1;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('unit'+u).classList.add('on');
  applyFilters();
}

function toggleF(btn) {
  const f = btn.dataset.f, v = btn.dataset.v;
  if (f === 'tag') {
    // multi-select
    if (AF.tag.has(v)) { AF.tag.delete(v); btn.classList.remove('on'); }
    else               { AF.tag.add(v);    btn.classList.add('on');    }
  } else {
    // single-select
    if (AF[f] === v) {
      AF[f] = null; btn.classList.remove('on');
    } else {
      document.querySelectorAll('.fbtn[data-f="'+f+'"]').forEach(b => b.classList.remove('on'));
      AF[f] = v; btn.classList.add('on');
    }
  }
  applyFilters();
}

function applyFilters() {
  const q    = (document.getElementById('ctrlQ').value || '').trim().toLowerCase();
  const pRaw = v => parseInt(v) || 0;
  const pMin = pRaw(document.getElementById('pMin').value) * priceUnit;
  const pMax = (pRaw(document.getElementById('pMax').value) * priceUnit) || Infinity;

  const rows = document.querySelectorAll('tr.horse-row');
  let shown = 0;

  rows.forEach(row => {
    const tier    = row.dataset.tier    || '';
    const tags    = (row.dataset.tags   || '').split(' ');
    const region  = row.dataset.region  || '';
    const section = row.dataset.section || '';
    const rMin    = parseInt(row.dataset.pmin) || 0;
    const rMax    = parseInt(row.dataset.pmax) || 0;
    const text    = row.textContent.toLowerCase();

    let pass = true;
    if (q             && !text.includes(q))                         pass = false;
    if (AF.tier       && tier !== AF.tier)                          pass = false;
    if (AF.tag.size   && ![...AF.tag].every(t => tags.includes(t))) pass = false;
    if (AF.region     && region !== AF.region)                      pass = false;
    if (AF.section    && section !== AF.section)                    pass = false;
    if (pMax < Infinity && rMin > pMax)                             pass = false;
    if (pMin > 0        && rMax < pMin)                             pass = false;

    row.classList.toggle('hide', !pass);
    // also hide/show the associated detail-row
    const nm = row.dataset.name;
    if (nm) {
      const dr = document.getElementById('detail-' + nm);
      if (dr) dr.classList.toggle('hide', !pass);
    }
    if (pass) shown++;
  });

  document.querySelectorAll('tbody').forEach(tb => {
    const any = [...tb.querySelectorAll('tr.horse-row')].some(r => !r.classList.contains('hide'));
    const noR = tb.querySelector('tr.no-results');
    if (noR) noR.classList.toggle('show', !any);
  });

  const total = rows.length;
  const st = document.getElementById('ctrlStatus');
  const isDefault = !q && !AF.tier && AF.tag.size === 0 && !AF.region && !AF.section && pMin === 0 && pMax === Infinity;
  st.innerHTML = isDefault ? '' : '<b>' + shown + '</b> von <b>' + total + '</b> Reittieren angezeigt';
}

function resetAll() {
  document.getElementById('ctrlQ').value = '';
  document.getElementById('pMin').value  = '';
  document.getElementById('pMax').value  = '';
  AF.tier = null; AF.tag = new Set(); AF.region = null; AF.section = null;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
  setUnit('K');
  applyFilters();
}

// ══════════════════════════════════════════════════════════
//  ATTRIBUT-DATEN & RADAR
// ══════════════════════════════════════════════════════════
const HORSE_STATS = {
  'hross': [2, 5, 5, 2, 4, 8],
  'skuggr': [3, 6, 7, 3, 3, 9],
  'hest': [4, 7, 5, 4, 7, 9],
  'cuanach': [3, 6, 4, 5, 6, 7],
  'skaer': [5, 6, 4, 5, 3, 7],
  'tirashan': [6, 6, 5, 6, 6, 7],
  'afol': [5, 6, 4, 5, 7, 6],
  'xanathos': [2, 7, 9, 2, 6, 8],
  'goldmaehne': [7, 7, 6, 6, 8, 7],
  'curragh': [9, 8, 2, 10, 9, 2],
  'nebtu': [8, 9, 4, 8, 3, 6],
  'rhyfel': [6, 7, 6, 6, 6, 8],
  'sale': [6, 7, 5, 6, 7, 8],
  'equo': [7, 7, 7, 7, 7, 7],
  'shahzad': [9, 9, 4, 8, 3, 5],
  'cheval': [8, 8, 7, 8, 7, 7],
  'cyning': [2, 8, 10, 1, 8, 10],
  'ceffyl': [9, 8, 7, 8, 10, 8],
  'sarkal': [10, 9, 7, 9, 5, 7],
  'herzogsschimmer': [7, 7, 7, 7, 6, 7],
  'erlenglanz': [9, 3, 2, 9, 2, 2],
  'aurelianer': [8, 7, 7, 7, 6, 7],
  'drake': [9, 9, 8, 9, 9, 8],
  'brycing': [9, 10, 9, 9, 9, 9],
  'crafan': [2, 4, 2, 3, 8, 5],
  'myrr': [2, 3, 2, 3, 5, 6],
  'skelmir': [3, 6, 4, 3, 6, 8],
  'kamel': [3, 10, 6, 2, 5, 10],
  'sturmbock': [4, 7, 8, 5, 4, 9],
  'mondlaufer': [7, 7, 4, 9, 6, 6],
  'druchtan': [2, 6, 7, 3, 3, 9],
  // Legendäre (Würfel-only)
  'eiarach':      [9, 10, 10, 9, 10, 10],
  'furstenglanz': [10, 10, 9, 10, 10, 9],
};

const HORSE_AGES = {
  'hross':           [20, 25],
  'skuggr':          [20, 25],
  'hest':            [25, 30],
  'cuanach':         [20, 25],
  'skaer':           [20, 25],
  'tirashan':        [20, 25],
  'afol':            [25, 30],
  'xanathos':        [20, 30],
  'goldmaehne':      [35, 40],
  'curragh':         [30, 40],
  'nebtu':           [30, 35],
  'rhyfel':          [30, 35],
  'sale':            [30, 35],
  'equo':            [30, 35],
  'shahzad':         [25, 45],
  'cheval':          [40, 50],
  'cyning':          [50, 60],
  'ceffyl':          [40, 60],
  'sarkal':          [30, 45],
  'herzogsschimmer': [30, 45],
  'erlenglanz':      [20, 25],
  'aurelianer':      [30, 45],
  'drake':           [45, 60],
  'brycing':         [60, 75],
  'crafan':          [20, 25],
  'myrr':            [20, 25],
  'skelmir':         [20, 25],
  'eiarach':         [null, 100],
  'furstenglanz':    [null, 300],
};

function getAge(name) {
  const k = name.toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/ß/g,'ss').replace(/é/g,'e');
  return HORSE_AGES[k] || null;
}

function fmtAge(name) {
  const a = getAge(name);
  if (!a) return null;
  if (a[0] === null) return 'Bis zu ' + a[1] + ' Jahre';
  return a[0] + ' – ' + a[1] + ' Jahre';
}


const STAT_LABELS = ['Schnelligkeit','Ausdauer','Stärke','Agiliät','Sozialverhalten','Robustheit'];

function buildRadarSVG(vals) {
  const N = 6, cx = 105, cy = 105, maxR = 72;
  const ang = i => (Math.PI / 2) - (2 * Math.PI * i / N);
  const pt  = (i, r) => [(cx + r * Math.cos(ang(i))).toFixed(2), (cy - r * Math.sin(ang(i))).toFixed(2)];

  let out = '<svg class="radar-svg" viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg">';

  // grid rings
  for (let ring = 1; ring <= 5; ring++) {
    const r = maxR * ring / 5;
    const cls = ring === 5 ? 'radar-grid-ring outer' : 'radar-grid-ring';
    const pts = Array.from({length:N}, (_,i) => pt(i,r).join(',')).join(' ');
    out += '<polygon class="' + cls + '" points="' + pts + '"/>';
  }

  // axes
  for (let i = 0; i < N; i++) {
    const [x,y] = pt(i, maxR);
    out += '<line class="radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"/>';
  }

  // data shape
  const shapePts = vals.map((v,i) => pt(i, maxR * (Math.min(v,10)/10)).join(',')).join(' ');
  out += '<polygon class="radar-shape" points="' + shapePts + '"/>';

  // dots
  vals.forEach((v,i) => {
    const [x,y] = pt(i, maxR * (Math.min(v,10)/10));
    out += '<circle class="radar-dot" cx="' + x + '" cy="' + y + '" r="3"/>';
  });

  // labels
  const lblOff = 20;
  STAT_LABELS.forEach((lbl, i) => {
    const [x,y] = pt(i, maxR + lblOff);
    const ca = Math.cos(ang(i)), sa = Math.sin(ang(i));
    const anchor = ca > 0.15 ? 'start' : ca < -0.15 ? 'end' : 'middle';
    const dy     = sa > 0.15 ? '-0.3em' : sa < -0.15 ? '1em' : '0.35em';
    out += '<text class="radar-label" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" dy="' + dy + '">' + lbl + '</text>';
  });

  out += '</svg>';
  return out;
}

function buildStatBars(vals) {
  return '<div class="stat-bars">' +
    STAT_LABELS.map((lbl,i) =>
      '<div class="stat-row">' +
      '<div class="stat-lbl">' + lbl + '</div>' +
      '<div class="stat-bar"><div class="stat-fill" style="width:' + (vals[i]*10) + '%"></div></div>' +
      '<div class="stat-val">' + vals[i] + '</div>' +
      '</div>'
    ).join('') +
  '</div>';
}


// ══════════════════════════════════════════════════════════
//  TIER-NOTIZEN
// ══════════════════════════════════════════════════════════
var NOTES_KEY = 'rmskt_notes_v1';

function loadNote(name) {
  try {
    var d = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
    var v = d[name] || '';
    // Escape for textarea (no HTML)
    return v.replace(/</g,'&lt;').replace(/>/g,'&gt;');
  } catch(e) { return ''; }
}

function saveNote(name) {
  var ta = document.getElementById('notes-' + name);
  if (!ta) return;
  try {
    var d = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
    if (ta.value.trim()) { d[name] = ta.value; }
    else { delete d[name]; }
    localStorage.setItem(NOTES_KEY, JSON.stringify(d));
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════
//  EXPANDABLE ROWS
// ══════════════════════════════════════════════════════════
document.addEventListener('click', function(e) {
  const row = e.target.closest('tr.horse-row');
  if (!row || !row.dataset.name) return;
  // Ignore if in compare mode and clicking to select
  if (compareMode) { toggleCompareSelect(row); return; }

  const name = row.dataset.name;
  const detailRow = document.getElementById('detail-' + name);
  const inner     = document.getElementById('detail-inner-' + name);
  if (!detailRow) return;

  const isOpen = detailRow.classList.contains('open');

  // Close all other detail rows first
  document.querySelectorAll('.detail-row.open').forEach(dr => {
    dr.classList.remove('open');
    const parentRow = dr.previousElementSibling;
    if (parentRow) parentRow.classList.remove('expanded');
  });

  if (!isOpen) {
    // Build detail content from the row's own data
    const img    = row.querySelector('.horse-img')?.src || '';
    const origin = row.querySelector('.origin-val')?.textContent?.trim() || '—';
    const desc   = row.querySelector('.horse-desc')?.innerHTML || '';
    const tags   = [...row.querySelectorAll('.use-tag')].map(t => t.outerHTML).join(' ');
    const price  = row.querySelector('.price-text')?.textContent?.trim() || '—';
    const curr   = row.querySelector('.price-currency')?.textContent?.trim() || '';
    const badge  = row.querySelector('.tier-badge');
    const badgeH = badge ? `<span class="${[...badge.classList].join(' ')}">${badge.textContent}</span>` : '';

    // Normalise key: replace umlauts for lookup
    const statsKey = name.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
    const statsVals = HORSE_STATS[statsKey] || HORSE_STATS[name] || [5,5,5,5,5,5];

    const ageStr = fmtAge(name);
    inner.innerHTML =
      '<div class="detail-text">' +
        '<div><strong>Herkunft</strong>' + origin + '</div>' +
        '<div><strong>Preis</strong>' + price + ' ' + curr + '</div>' +
        '<div><strong>Seltenheit</strong>' + badgeH + '</div>' +
        (ageStr ? '<div><strong>Lebensalter</strong>' + ageStr + '</div>' : '') +
        '<div><strong>Verwendung</strong><div style="display:flex;flex-wrap:wrap;gap:.22rem;margin-top:.2rem">' + tags + '</div></div>' +
      '</div>' +

      '<div class="detail-radar-wrap">' +
        '<strong>Attribute</strong>' +
        buildRadarSVG(statsVals) +
        buildStatBars(statsVals) +
      '</div>';

    detailRow.classList.add('open');
    row.classList.add('expanded');
  }
});

// ══════════════════════════════════════════════════════════
//  VERGLEICHSMODUS
// ══════════════════════════════════════════════════════════
let compareMode = false;
const compareSelected = [];

function toggleCompareMode() {
  compareMode = !compareMode;
  compareSelected.length = 0;
  document.querySelectorAll('.horse-row.compare-selected').forEach(r => r.classList.remove('compare-selected'));
  updateCompareBar();
  document.getElementById('compareModeHint').classList.toggle('visible', compareMode);
  document.getElementById('compareModeBtn').textContent = compareMode ? '✕ Modus beenden' : '⚖ Vergleichen';
  // Close any open detail rows in compare mode
  if (compareMode) {
    document.querySelectorAll('.detail-row.open').forEach(dr => dr.classList.remove('open'));
    document.querySelectorAll('.horse-row.expanded').forEach(r => r.classList.remove('expanded'));
  }
}

function cancelCompare() {
  compareMode = false;
  compareSelected.length = 0;
  document.querySelectorAll('.horse-row.compare-selected').forEach(r => r.classList.remove('compare-selected'));
  document.getElementById('compareBar').classList.remove('visible');
  document.getElementById('compareModeHint').classList.remove('visible');
  document.getElementById('compareModeBtn').textContent = '⚖ Vergleichen';
}

function toggleCompareSelect(row) {
  if (!row.dataset.name) return;
  const idx = compareSelected.indexOf(row);
  if (idx > -1) {
    compareSelected.splice(idx, 1);
    row.classList.remove('compare-selected');
  } else {
    if (compareSelected.length >= 2) {
      // Deselect oldest
      compareSelected[0].classList.remove('compare-selected');
      compareSelected.shift();
    }
    compareSelected.push(row);
    row.classList.add('compare-selected');
  }
  updateCompareBar();
}

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  if (!compareMode) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');

  [0,1].forEach(i => {
    const slot = document.getElementById('cmpSlot' + i);
    const row  = compareSelected[i];
    if (row) {
      const name = row.querySelector('.horse-name')?.textContent?.replace('▾','').trim() || '?';
      slot.className = 'compare-slot';
      slot.innerHTML = name + ' <span class="rm" onclick="removeCompare('+i+')">✕</span>';
    } else {
      slot.className = 'compare-slot empty';
      slot.innerHTML = '— Tier ' + (i+1) + ' —';
    }
  });

  document.getElementById('compareGoBtn').disabled = compareSelected.length < 2;
}

function removeCompare(i) {
  if (compareSelected[i]) {
    compareSelected[i].classList.remove('compare-selected');
    compareSelected.splice(i, 1);
    updateCompareBar();
  }
}

function openCompare() {
  if (compareSelected.length < 2) return;
  const [r1, r2] = compareSelected;

  function extractData(row) {
    return {
      name:   row.querySelector('.horse-name')?.textContent?.replace('▾','').trim() || '?',
      nick:   row.querySelector('.horse-nickname')?.textContent?.trim() || '',
      img:    row.querySelector('.horse-img')?.src || '',
      badge:  row.querySelector('.tier-badge'),
      origin: row.querySelector('.origin-val')?.textContent?.trim() || '—',
      desc:   row.querySelector('.horse-desc')?.innerHTML || '',
      price:  row.querySelector('.price-text')?.textContent?.trim() || '—',
      curr:   row.querySelector('.price-currency')?.textContent?.trim() || '',
      tags:   [...row.querySelectorAll('.use-tag')].map(t => t.outerHTML).join(' '),
      pmin:   parseInt(row.dataset.pmin) || 0,
      pmax:   parseInt(row.dataset.pmax) || 0,
      tier:   row.dataset.tier || '',
    };
  }

  const d1 = extractData(r1), d2 = extractData(r2);

  function nKey(n) {
    return n.toLowerCase()
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
      .replace(/ß/g,'ss').replace(/é/g,'e');
  }

  function col(d, other) {
    const badgeCls = d.badge ? [...d.badge.classList].join(' ') : '';
    const badgeTxt = d.badge ? d.badge.textContent : '';
    const cheaper  = d.pmax < other.pmax ? 'winner' : '';
    const sv = HORSE_STATS[nKey(d.name)]     || HORSE_STATS[d.name.toLowerCase()]     || [5,5,5,5,5,5];
    const ov = HORSE_STATS[nKey(other.name)] || HORSE_STATS[other.name.toLowerCase()] || [5,5,5,5,5,5];

    const statRows = STAT_LABELS.map(function(lbl, i) {
      const cls = sv[i] > ov[i] ? 'winner' : sv[i] < ov[i] ? 'loser' : '';
      return '<div class="cmp-row" style="padding:.1rem 0;border-bottom:1px solid var(--parchment-dark)">' +
        '<div class="cmp-row-lbl">' + lbl + '</div>' +
        '<div class="cmp-row-val ' + cls + '" style="display:flex;align-items:center;gap:.4rem">' +
          '<div style="flex:1;height:5px;background:var(--parchment-darker);border-radius:3px;overflow:hidden">' +
            '<div style="width:' + (sv[i]*10) + '%;height:100%;border-radius:3px;background:linear-gradient(to right,var(--gold-dark),var(--gold-bright))"></div>' +
          '</div>' + sv[i] +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="cmp-col">' +
      '<img class="cmp-img" src="' + d.img + '" alt="' + d.name + '">' +
      '<div class="cmp-name">' + d.name + '</div>' +
      (d.nick ? '<div style="text-align:center;font-size:.78rem;font-style:italic;color:var(--ink-faint)">' + d.nick + '</div>' : '') +
      '<div style="text-align:center;margin:.3rem 0"><span class="' + badgeCls + '">' + badgeTxt + '</span></div>' +
      '<div style="display:flex;justify-content:center;margin:.4rem 0">' + buildRadarSVG(sv) + '</div>' +
      '<div class="cmp-row"><div class="cmp-row-lbl">Herkunft</div><div class="cmp-row-val">' + d.origin + '</div></div>' +
      '<div class="cmp-row"><div class="cmp-row-lbl">Lebensalter</div><div class="cmp-row-val">' + (fmtAge(d.name) || '—') + '</div></div>' +
      '<div class="cmp-row"><div class="cmp-row-lbl">Preis (max.)</div><div class="cmp-row-val ' + cheaper + '">' + d.price + ' ' + d.curr + '</div></div>' +
      '<div class="cmp-row"><div class="cmp-row-lbl">Verwendung</div><div class="cmp-row-val" style="display:flex;flex-wrap:wrap;gap:.2rem">' + d.tags + '</div></div>' +
      '<div class="cmp-row" style="flex-direction:column"><div class="cmp-row-lbl" style="margin-bottom:.3rem">Attribute</div>' + statRows + '</div>' +
      '<div class="cmp-row" style="border:none"><div class="cmp-row-lbl">Beschreibung</div><div class="cmp-row-val" style="font-size:.82rem">' + d.desc + '</div></div>' +
    '</div>';
  }

  document.getElementById('cmpGrid').innerHTML = col(d1, d2) + col(d2, d1);
  document.getElementById('cmpOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCmp() {
  document.getElementById('cmpOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cmpOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('cmpOverlay')) closeCmp();
});

// ══════════════════════════════════════════════════════════
//  WÜRFEL — inkl. Eiarach & Fürstenglanz
// ══════════════════════════════════════════════════════════
const SPECIAL_ENTRIES = [
  {
    name: 'Eiarach', nick: '', badge: 't-unv', badgeTxt: 'Legendär',
    img: 'https://i.imgur.com/Xg5BXas.png',
    origin: 'Clan der Morna (Estryll)',
    desc: 'Das mythische Urpferd, aus dem alle bekannten Pferderassen Estrylls hervorgegangen sind. Wird ausschließlich im <strong>Clan der Morna</strong> gezüchtet und nur an würdige Freunde des Clans verschenkt — nie verkauft.',
    price: '— Nicht käuflich', tags: ['Legendär','Prestige','Ehre'],
  },
  {
    name: 'Fürstenglanz', nick: 'Tighearna', badge: 't-unv', badgeTxt: 'Legendär',
    img: 'https://i.imgur.com/8VmJEcB.png',
    origin: 'Fianna / Königsgeschlecht Tuathánach (Estryll)',
    desc: 'Das Pferd des albischen Königsgeschlechts der <strong>Tuathánach</strong> — gezüchtet und behütet von der Fianna. Symbol des rechtmäßigen Throns; wird von niemand anderem geritten, bis ein neuer König sich erhebt.',
    price: '— Nicht käuflich', tags: ['Legendär','Königlich'],
  },
];

function rollDice() {
  const tableRows = [...document.querySelectorAll('tr.horse-row[data-name]')];
  // 10% chance for a special entry
  let entry;
  if (Math.random() < 0.10) {
    const sp = SPECIAL_ENTRIES[Math.floor(Math.random() * SPECIAL_ENTRIES.length)];
    document.getElementById('dImg').src   = sp.img;
    document.getElementById('dImg').alt   = sp.name;
    document.getElementById('dName').textContent   = sp.name;
    document.getElementById('dNick').textContent   = sp.nick;
    document.getElementById('dOrigin').textContent = sp.origin ? '📍 ' + sp.origin : '';
    document.getElementById('dDesc').innerHTML     = sp.desc;
    document.getElementById('dTags').innerHTML     = sp.tags.map(t => `<span class="use-tag tag-legende">${t}</span>`).join(' ');
    document.getElementById('dBadge').innerHTML    = `<span class="tier-badge ${sp.badge}">${sp.badgeTxt}</span>`;
    document.getElementById('dPrice').innerHTML    = sp.price;
    // Radar for special
    const spKey = sp.name.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
    const spStats = HORSE_STATS[spKey] || [10,10,10,10,10,10];
    const oldSR = document.getElementById('diceRadar');
    if (oldSR) oldSR.remove();
    const sDiv = document.createElement('div');
    sDiv.id = 'diceRadar';
    sDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:.3rem;margin:.4rem 0';
    sDiv.innerHTML = buildRadarSVG(spStats) + buildStatBars(spStats);
    document.getElementById('dBadge').after(sDiv);
  } else {
    const row = tableRows[Math.floor(Math.random() * tableRows.length)];
    const img    = row.querySelector('.horse-img');
    const name   = row.querySelector('.horse-name')?.textContent?.replace('▾','').trim() || '';
    const nick   = row.querySelector('.horse-nickname')?.textContent?.trim() || '';
    const badge  = row.querySelector('.tier-badge');
    const origin = row.querySelector('.origin-val')?.textContent?.trim() || '';
    const desc   = row.querySelector('.horse-desc')?.innerHTML || '';
    const pText  = row.querySelector('.price-text')?.textContent?.trim() || '—';
    const pCurrEl= row.querySelector('.price-currency');
    const pImg   = pCurrEl?.querySelector('img')?.outerHTML || '';
    const pLabel = pCurrEl?.textContent?.trim() || '';
    const tags   = [...row.querySelectorAll('.use-tag')].map(t => t.outerHTML).join('');

    document.getElementById('dImg').src            = img ? img.src : '';
    document.getElementById('dImg').alt            = name;
    document.getElementById('dName').textContent   = name;
    document.getElementById('dNick').textContent   = nick;
    document.getElementById('dOrigin').textContent = origin ? '📍 ' + origin : '';
    document.getElementById('dDesc').innerHTML     = desc;
    document.getElementById('dTags').innerHTML     = tags;
    document.getElementById('dBadge').innerHTML    = badge ? `<span class="${[...badge.classList].join(' ')}">${badge.textContent}</span>` : '';
    document.getElementById('dPrice').innerHTML    = pText !== '—'
      ? pImg + ' ' + pText + ' <span style="font-size:.75em;color:var(--ink-faint);margin-left:.2rem">' + pLabel + '</span>'
      : '— Nicht käuflich';
    // Radar
    const dKey   = name.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
    const dStats = HORSE_STATS[dKey] || HORSE_STATS[name.toLowerCase()] || [5,5,5,5,5,5];
    const oldDR  = document.getElementById('diceRadar');
    if (oldDR) oldDR.remove();
    const rDiv = document.createElement('div');
    rDiv.id = 'diceRadar';
    rDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:.3rem;margin:.4rem 0';
    rDiv.innerHTML = buildRadarSVG(dStats) + buildStatBars(dStats);
    document.getElementById('dBadge').after(rDiv);
  }

  document.getElementById('diceVeil').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDice() {
  document.getElementById('diceVeil').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('diceVeil').addEventListener('click', e => {
  if (e.target === document.getElementById('diceVeil')) closeDice();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDice(); closeCmp(); ZB && ZB.close(); }
});



// ══════════════════════════════════════════════════════════
//  NACHZUCHT-RECHNER
// ══════════════════════════════════════════════════════════
(function() {

  var STAT_NAMES = ['Schnelligkeit','Ausdauer','Stärke','Agilität','Sozialverhalten','Robustheit'];
  var FOAL_IMG   = 'https://i.imgur.com/aGXNyve.png';

  function nzrKey(n) {
    return n.toLowerCase()
      .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
      .replace(/ß/g,'ss').replace(/é/g,'e');
  }

  function getStats(name) {
    return HORSE_STATS[nzrKey(name)] || HORSE_STATS[name.toLowerCase()] || [5,5,5,5,5,5];
  }

  function getImg(name) {
    // Find the horse row image
    var row = document.querySelector('.horse-row[data-name="' + nzrKey(name) + '"]');
    if (row) {
      var img = row.querySelector('.horse-img');
      if (img) return img.src;
    }
    return FOAL_IMG;
  }

  function renderParentPreview(elId, name) {
    var el = document.getElementById(elId);
    if (!name) {
      el.innerHTML = '<div class="nzr-hint" style="font-size:.72rem;padding:.2rem">Noch keine Auswahl</div>';
      return;
    }
    var stats = getStats(name);
    var img   = getImg(name);
    var bars  = STAT_NAMES.map(function(lbl, i) {
      return '<div class="nzr-mini-bar">' +
        '<div class="nzr-mini-lbl">' + lbl.slice(0,5) + '.</div>' +
        '<div class="nzr-mini-track"><div class="nzr-mini-fill" style="width:' + (stats[i]*10) + '%"></div></div>' +
        '<div class="nzr-mini-val">' + stats[i] + '</div>' +
      '</div>';
    }).join('');
    var ageLabel = fmtAge(name);
    el.innerHTML =
      '<img class="nzr-parent-img" src="' + img + '" alt="' + name + '">' +
      '<div class="nzr-parent-stats">' + bars +
        (ageLabel ? '<div style="font-family:serif;font-size:.52rem;color:#8b6914;margin-top:3px">&#9767; ' + ageLabel + '</div>' : '') +
      '</div>';
  }

  window.nzrUpdate = function() {
    var mare = document.getElementById('nzrMare').value;
    var sire = document.getElementById('nzrSire').value;
    renderParentPreview('nzrMarePreview', mare);
    renderParentPreview('nzrSirePreview', sire);
    var btn = document.getElementById('nzrRollBtn');
    btn.disabled = !(mare && sire && mare !== sire);
    // Hide old result when selection changes
    document.getElementById('nzrResult').classList.remove('show');
  };

  // ── Roll foal stats ──────────────────────────────────────
  // Formula:
  //   base    = avg(parent1, parent2) per attribute
  //   variance = ±2 max, weighted random (bell-ish via two dice)
  //   mutation = 5% chance of a +1 bonus on one random stat ("Talent")
  //   clamp to 1–10
  function rollFoalStats(s1, s2) {
    var result = [];
    for (var i = 0; i < 6; i++) {
      var base = (s1[i] + s2[i]) / 2;
      // Bell-curve variance: avg of two random values -1..1 = range -1..1
      // we scale to -2..2 by multiplying
      var r1 = Math.random() * 2 - 1;
      var r2 = Math.random() * 2 - 1;
      var variance = (r1 + r2); // -2 to +2, bell-shaped
      var val = Math.round(base + variance);
      val = Math.max(1, Math.min(10, val));
      result.push(val);
    }
    // 5% mutation: one random stat gets +1 (talent)
    var hasTalent = Math.random() < 0.05;
    var talentIdx = hasTalent ? Math.floor(Math.random() * 6) : -1;
    if (hasTalent && result[talentIdx] < 10) result[talentIdx]++;
    return { stats: result, talentIdx: talentIdx };
  }

  // ── Trait labels based on highest/lowest stats ───────────
  var TRAIT_LABELS = [
    ['Blitzschnell','Träge'],
    ['Ausdauernd','Kurzatmig'],
    ['Kräftig','Schwächlich'],
    ['Wendig','Schwerfällig'],
    ['Sanftmütig','Schwierig'],
    ['Zäh','Empfindlich']
  ];

  function getTraits(stats) {
    var traits = [];
    for (var i = 0; i < 6; i++) {
      if (stats[i] >= 9) traits.push({ label: TRAIT_LABELS[i][0], type: 'strong' });
      else if (stats[i] <= 2) traits.push({ label: TRAIT_LABELS[i][1], type: 'weak' });
    }
    // Overall tendency
    var avg = stats.reduce(function(a,b){ return a+b; },0) / 6;
    if (avg >= 8)      traits.unshift({ label: 'Außerordentlich', type: 'strong' });
    else if (avg >= 7) traits.unshift({ label: 'Überdurchschnittlich', type: 'strong' });
    else if (avg <= 3) traits.unshift({ label: 'Unterdurchschnittlich', type: 'weak' });
    return traits;
  }

  window.nzrRoll = function() {
    var mare = document.getElementById('nzrMare').value;
    var sire = document.getElementById('nzrSire').value;
    if (!mare || !sire || mare === sire) return;

    var ms = getStats(mare);
    var ss = getStats(sire);
    var rolled = rollFoalStats(ms, ss);
    var fs = rolled.stats;
    var talentIdx = rolled.talentIdx;

    var mImg = getImg(mare);
    var sImg = getImg(sire);

    // Cross name from Zuchtbuch if available
    var zbCell = document.querySelector('.zb-cell[data-mare="' + mare + '"][data-stallion="' + sire + '"]');
    var crossName = '';
    if (zbCell) {
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem('rmskt_zb2')) || {}; } catch(e) {}
      var k = mare + '|' + sire;
      crossName = saved[k] || zbCell.dataset.default || '';
    }

    // Build attribute comparison rows
    var attrRows = STAT_NAMES.map(function(lbl, i) {
      var fv = fs[i];
      var avg = (ms[i] + ss[i]) / 2;
      var cls = fv >= avg + 1.5 ? 'high' : fv <= avg - 1.5 ? 'low' : 'mid';
      var talentMark = (i === talentIdx) ? ' <span style="color:var(--gold-dark);font-size:.6rem">★</span>' : '';
      return '<div class="nzr-attr-row">' +
        // Left: stat name
        '<div class="nzr-attr-lbl-l">' + lbl + '</div>' +
        // Left bar (Stute)
        '<div class="nzr-attr-bar-l"><div class="nzr-attr-track"><div class="nzr-attr-fill-l" style="width:' + (ms[i]*10) + '%"></div></div></div>' +
        // Center: foal value
        '<div class="nzr-attr-center"><span class="nzr-foal-val ' + cls + '">' + fv + talentMark + '</span></div>' +
        // Right bar (Hengst)
        '<div class="nzr-attr-bar-r"><div class="nzr-attr-track"><div class="nzr-attr-fill-r" style="width:' + (ss[i]*10) + '%"></div></div></div>' +
        // Right label
        '<div class="nzr-attr-lbl-r">' + lbl + '</div>' +
      '</div>';
    }).join('');

    // Traits
    var traits = getTraits(fs);
    var traitHTML = traits.length
      ? traits.map(function(t) {
          return '<span class="nzr-trait ' + t.type + '">' + t.label + '</span>';
        }).join('')
      : '<span class="nzr-trait">Unauffällig</span>';

    var talentNote = talentIdx >= 0
      ? '<div style="font-size:.68rem;color:var(--gold-dark);text-align:center;margin-top:.4rem;font-style:italic">★ Talent: ' + STAT_NAMES[talentIdx] + '</div>'
      : '';

    var crossLabel = crossName
      ? '<div class="nzr-foal-cross">Rasse: ' + crossName + '</div>'
      : '<div class="nzr-foal-cross">Kreuzung noch unbenannt</div>';

    // ── Foal lifespan ─────────────────────────────────────────
    var mAge = getAge(mare);
    var sAge = getAge(sire);
    var lifespanMin = null, lifespanMax = null;
    if (mAge && sAge) {
      lifespanMin = (mAge[0] !== null && sAge[0] !== null) ? Math.round((mAge[0] + sAge[0]) / 2) : null;
      lifespanMax = Math.round((mAge[1] + sAge[1]) / 2);
    }
    var lifespanStr = lifespanMin !== null
      ? lifespanMin + ' – ' + lifespanMax + ' Jahre'
      : (lifespanMax ? 'Bis zu ' + lifespanMax + ' Jahre' : null);
    var foalAgeHTML = lifespanStr
      ? '<div style="font-family:serif;font-size:.62rem;color:#8b6914;margin-top:.3rem">&#9767; ' + lifespanStr + '</div>'
      : '';

    // ── Price range calculation ───────────────────────────────
    var mRow = document.querySelector('.horse-row[data-name="' + nzrKey(mare) + '"]');
    var sRow = document.querySelector('.horse-row[data-name="' + nzrKey(sire) + '"]');
    var mPmin = mRow ? parseInt(mRow.dataset.pmin) : 500;
    var mPmax = mRow ? parseInt(mRow.dataset.pmax) : 5000;
    var sPmin = sRow ? parseInt(sRow.dataset.pmin) : 500;
    var sPmax = sRow ? parseInt(sRow.dataset.pmax) : 5000;

    // Geometric mean of parent ranges
    var baseMin = Math.round(Math.sqrt(mPmin * sPmin));
    var baseMax = Math.round(Math.sqrt(mPmax * sPmax));

    // Quality modifier based on foal vs parent average
    var parentAvg = (ms.reduce(function(a,b){return a+b;},0) + ss.reduce(function(a,b){return a+b;},0)) / 12;
    var foalAvg   = fs.reduce(function(a,b){return a+b;},0) / 6;
    var qualityMod = foalAvg / parentAvg;

    // Apply modifier — foals sell at 60-80% of adult price (unproven)
    var foalPmin = Math.max(50, Math.round(baseMin * qualityMod * 0.6 / 50) * 50);
    var foalPmax = Math.max(foalPmin + 100, Math.round(baseMax * qualityMod * 0.85 / 50) * 50);

    // Format in K, always as whole numbers, then convert display
    function fmtPrice(k) {
      if (k >= 10000) return Math.round(k/1000) + ' G';
      if (k >= 1000)  return (k/1000).toFixed(1).replace(/\.0$/,'') + ' G';
      if (k >= 1000)  return Math.round(k/100) / 10 + ' S';
      if (k >= 100)   return Math.round(k/10) / 10 + ' S';
      return k + ' K';
    }

    var priceQualLabel = qualityMod >= 1.15 ? 'Überdurchschnittlich' :
                         qualityMod >= 0.95 ? 'Rassentypisch' :
                         qualityMod >= 0.80 ? 'Leicht unterdurchschnittlich' : 'Unterdurchschnittlich';
    var priceQualColor = qualityMod >= 1.15 ? '#2a5a2a' : qualityMod >= 0.95 ? '#5a3d0c' : '#7a2a2a';
    var parentMaxAvg = Math.round((mPmax + sPmax) / 2);

    var priceHTML =
      '<div class="nzr-price-box">' +
        '<div class="nzr-price-title">◆ Geschätzte Preisspanne ◆</div>' +
        '<div class="nzr-price-range">' + fmtPrice(foalPmin) + ' – ' + fmtPrice(foalPmax) + '</div>' +
        '<div class="nzr-price-meta">' +
          '<span style="color:' + priceQualColor + ';font-weight:700">' + priceQualLabel + '</span>' +
          ' &nbsp;·&nbsp; Eltern Ø Max: ' + fmtPrice(parentMaxAvg) +
        '</div>' +
        '<div class="nzr-price-note">Richtwert für ein unausgebildetes Fohlen. Preis steigt erheblich mit Ausbildung &amp; Bewährung.</div>' +
      '</div>';

    // ── Radar ─────────────────────────────────────────────────
    var radarHTML =
      '<div class="nzr-radar-wrap">' +
        '<div class="nzr-attrs-title" style="margin-bottom:.5rem">Attribut-Profil</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:.8rem;align-items:flex-start;justify-content:center">' +
          '<div>' + buildRadarSVG(fs) + '</div>' +
          '<div style="padding-top:.3rem;min-width:180px">' + buildStatBars(fs) + '</div>' +
        '</div>' +
      '</div>';

    var res = document.getElementById('nzrResult');
    res.innerHTML =
      // ── Mini-Stammbaum — symmetrical T-shape ──
      '<div class="nzr-tree">' +
        // Stute (left)
        '<div class="nzr-tree-parent">' +
          '<img class="nzr-tree-img" src="' + mImg + '" alt="' + mare + '">' +
          '<div class="nzr-tree-name">' + mare + '</div>' +
          '<div class="nzr-tree-role">Stute</div>' +
        '</div>' +

        // Left connector: horizontal line going right
        '<div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;padding-top:35px;flex-shrink:0">' +
          '<div style="width:40px;height:2px;background:var(--gold-dark)"></div>' +
        '</div>' +

        // Center column: vertical line + foal card
        '<div class="nzr-tree-center">' +
          '<div style="width:2px;height:35px;background:var(--gold-dark);margin:0 auto"></div>' +
          '<div class="nzr-foal-card">' +
            '<img class="nzr-foal-img" src="' + FOAL_IMG + '" alt="Fohlen">' +
            '<div class="nzr-foal-name">Fohlen</div>' +
            crossLabel +
            foalAgeHTML +
            '<div class="nzr-traits">' + traitHTML + '</div>' +
            talentNote +
          '</div>' +
        '</div>' +

        // Right connector: horizontal line going left
        '<div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding-top:35px;flex-shrink:0">' +
          '<div style="width:40px;height:2px;background:var(--gold-dark)"></div>' +
        '</div>' +

        // Hengst (right)
        '<div class="nzr-tree-parent">' +
          '<img class="nzr-tree-img" src="' + sImg + '" alt="' + sire + '">' +
          '<div class="nzr-tree-name">' + sire + '</div>' +
          '<div class="nzr-tree-role">Hengst</div>' +
        '</div>' +
      '</div>' +

      // ── Attribut-Vergleich ──
      '<div class="nzr-attrs">' +
        '<div class="nzr-attrs-title">← Stute &nbsp;|&nbsp; Fohlen (Mitte) &nbsp;|&nbsp; Hengst →</div>' +
        attrRows +
        '<div style="font-size:.6rem;color:var(--ink-faint);text-align:center;margin-top:.35rem;font-style:italic">' +
          'Grün = über Elterndurchschnitt &nbsp;·&nbsp; Rot = darunter &nbsp;·&nbsp; Beige = im Rahmen' +
        '</div>' +
      '</div>' +

      // ── Radar ──
      radarHTML +

      // ── Preis ──
      priceHTML +

      '<button class="nzr-reroll" onclick="nzrRoll()">⚄ Nochmal würfeln</button>' +
      '<div id="nzrLoreBox" style="margin-top:1rem;background:linear-gradient(135deg,#fdf8ee 0%,#f5eccc 50%,#fdf8ee 100%);border:2px solid var(--gold-dark);border-radius:3px;padding:1rem 1.2rem;">' +
        '<div style="font-family:\'Cinzel\',serif;font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:.5rem;">◆ Charakterbeschreibung ◆</div>' +
        '<div id="nzrLoreText" style="font-size:.92rem;line-height:1.75;color:var(--ink);font-style:italic;"><span style="color:var(--ink-faint);">Beschreibung wird generiert …</span></div>' +
      '</div>';

    res.classList.add('show');

    // KI-Beschreibung generieren
    nzrGenerateLore({
      mare: mare, sire: sire,
      crossName: crossName,
      stats: fs, talentIdx: talentIdx,
      traits: traits,
      lifespanStr: lifespanStr,
      foalPmin: foalPmin, foalPmax: foalPmax,
      fmtPrice: fmtPrice
    });
  };

})();

// ══════════════════════════════════════════════════════════
//  NACHZUCHT-RECHNER KI-BESCHREIBUNG
// ══════════════════════════════════════════════════════════
var STAT_NAMES_DE = ['Schnelligkeit','Ausdauer','Stärke','Agilität','Sozialverhalten','Robustheit'];

function getMarkdownKontext() {
  return (window.ROSSMARKT_PFERDE_KONTEXT_MD || '').trim();
}

function normalisiereKontextKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function kuerzeText(text, maxLen) {
  text = String(text || '').trim();
  if (!maxLen || text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '\n[Auszug gekuerzt]';
}

function getMarkdownRasseProfil(name) {
  var md = getMarkdownKontext();
  if (!md) return '';

  var needle = normalisiereKontextKey(name);
  var headingRe = /^###\s+(.+)$/gm;
  var headings = [];
  var match;

  while ((match = headingRe.exec(md))) {
    headings.push({ title: match[1], index: match.index });
  }

  for (var i = 0; i < headings.length; i++) {
    var titleKey = normalisiereKontextKey(headings[i].title);
    if (titleKey.indexOf(needle) === -1 && needle.indexOf(titleKey) === -1) continue;
    var end = i + 1 < headings.length ? headings[i + 1].index : md.length;
    return kuerzeText(md.slice(headings[i].index, end), 2600);
  }

  return '';
}

function getAllgemeinerMarkdownKontext() {
  return kuerzeText(getMarkdownKontext(), 4500);
}

function getRelevanterMarkdownKontext(query) {
  var md = getMarkdownKontext();
  if (!md) return '';

  var blocks = [];
  var introEnd = md.search(/^##\s+DETAILPROFILE/m);
  if (introEnd > 0) blocks.push(kuerzeText(md.slice(0, introEnd), 1800));

  var queryKey = normalisiereKontextKey(query);
  if (ROSSMARKT_WISSEN && ROSSMARKT_WISSEN.rassen) {
    Object.keys(ROSSMARKT_WISSEN.rassen).forEach(function(name) {
      if (queryKey.indexOf(normalisiereKontextKey(name)) !== -1) {
        var profil = getMarkdownRasseProfil(name);
        if (profil) blocks.push(profil);
      }
    });
  }

  if (/owain|draig|ritter|kenner|person|charakter/i.test(query || '')) {
    var owainStart = md.search(/^##\s+OWAIN DRAIG/m);
    if (owainStart >= 0) {
      var next = md.slice(owainStart + 1).search(/^##\s+/m);
      var owainEnd = next >= 0 ? owainStart + 1 + next : md.length;
      blocks.push(kuerzeText(md.slice(owainStart, owainEnd), 1800));
    }
  }

  if (!blocks.length) return getAllgemeinerMarkdownKontext();
  return kuerzeText(blocks.join('\n\n---\n\n'), 9000);
}

async function fetchMitTimeout(url, options, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, timeoutMs || 20000);
  try {
    options = options || {};
    options.signal = controller.signal;
    return await fetch(url, options);
  } finally {
    clearTimeout(timer);
  }
}

function getErwaehnteRassen(text) {
  if (!ROSSMARKT_WISSEN || !ROSSMARKT_WISSEN.rassen) return [];
  var key = normalisiereKontextKey(text);
  return Object.keys(ROSSMARKT_WISSEN.rassen).filter(function(name) {
    return key.indexOf(normalisiereKontextKey(name)) !== -1;
  });
}

function formatStatsSatz(stats) {
  if (!stats) return '';
  return 'Bei den Werten steht er etwa bei Schnelligkeit ' + stats.Schnelligkeit +
    ', Ausdauer ' + stats.Ausdauer +
    ', Stärke ' + stats.Staerke +
    ', Agilität ' + stats.Agilitaet +
    ', Sozialverhalten ' + stats.Sozialverhalten +
    ' und Robustheit ' + stats.Robustheit + ' von 10.';
}

function lokaleOwainAntwort(text) {
  var rassen = getErwaehnteRassen(text);
  if (!rassen.length) {
    return 'Jung, der Bote zur großen KI ist gerade nicht zu erreichen, aber mein Rossmarkt-Wissen liegt hier im Stall. Frag mich nach einer Rasse wie Ceffyl, Hest, Rhyfel oder Sarkal, dann gebe ich dir Werte, Herkunft und Einschätzung direkt aus dem Zuchtbuch.';
  }

  if (rassen.length >= 2 && /kreuz|zucht|fohlen|paar| x |×|\+/i.test(text)) {
    var a = rassen[0], b = rassen[1];
    var ia = ROSSMARKT_WISSEN.rassen[a], ib = ROSSMARKT_WISSEN.rassen[b];
    var avgA = Object.values(ia.stats).reduce(function(x,y){ return x + y; }, 0) / 6;
    var avgB = Object.values(ib.stats).reduce(function(x,y){ return x + y; }, 0) / 6;
    var basis = avgA >= avgB ? b : a;
    var edel = avgA >= avgB ? a : b;
    return 'Ah, ' + a + ' mit ' + b + ' - das kann funktionieren, wenn der Züchter eine ruhige Hand hat. Ich würde den Namen vom schwächeren Blut her denken und es mit dem stärkeren veredeln: ' + edel + basis + ', Glanz' + basis + ' oder ' + basis + 'läufer klingen brauchbar. Erwartet kein Wunder auf Befehl, Bursche; die Linie muss zeigen, ob sie eher nach ' + a + ' oder nach ' + b + ' schlägt.';
  }

  var name = rassen[0];
  var info = ROSSMARKT_WISSEN.rassen[name];
  var traits = info.traits && info.traits.length ? ' Seine Merkmale: ' + info.traits.join(', ') + '.' : '';
  return name + ' kenne ich gut, Bursche. ' + info.beschreibung + ' ' + formatStatsSatz(info.stats) + traits + ' Preislich liegt er ungefähr bei ' + info.preis + ', wenn der Händler nicht gerade Mondpreise wittert.';
}

function lokaleFohlenBeschreibung(data) {
  var highIdx = 0;
  data.stats.forEach(function(v, i) {
    if (v > data.stats[highIdx]) highIdx = i;
  });
  var staerke = STAT_NAMES_DE[highIdx].toLowerCase();
  var traitNames = data.traits.map(function(t) { return t.label; }).join(', ');
  return 'Das Fohlen aus ' + data.mare + ' und ' + data.sire + ' zeigt schon frueh, wohin sein Blut will: Besonders in der ' + staerke + ' liegt ein Versprechen, das ein guter Zuechter nicht uebersehen sollte. ' + (traitNames ? 'Sein Wesen traegt Anzeichen von ' + traitNames + ', ' : '') + 'doch wie bei jedem jungen Tier wird erst Geduld zeigen, ob daraus ein verlaessliches Ross oder ein eigensinniger Pruefstein fuer den Reiter wird.';
}

async function nzrGenerateLore(data) {
  var loreEl = document.getElementById('nzrLoreText');
  if (!loreEl) return;

  var statLines = STAT_NAMES_DE.map(function(n, i) {
    return n + ': ' + data.stats[i] + '/10' + (i === data.talentIdx ? ' (Talent!)' : '');
  }).join(', ');

  var traitNames = data.traits.map(function(t) { return t.label; }).join(', ') || 'Unauffällig';

  var mareInfo = getRasseInfo(data.mare);
  var sireInfo = getRasseInfo(data.sire);
  var rasseKontext = '';
  if (mareInfo) rasseKontext += '\nMutter-Rasse ' + data.mare + ': ' + mareInfo.beschreibung;
  if (sireInfo) rasseKontext += '\nVater-Rasse ' + data.sire + ': ' + sireInfo.beschreibung;
  var markdownKontext = [
    getMarkdownRasseProfil(data.mare),
    getMarkdownRasseProfil(data.sire)
  ].filter(Boolean).join('\n\n---\n\n');

  var prompt = [
    'Du bist ein erfahrener Pferdezüchter und Chronist in einer mittelalterlichen Fantasywelt.',
    'Schreibe eine immersive, poetisch angehauchte Charakterbeschreibung für ein neugeborenes Fohlen in 1-2 Absätzen auf Deutsch.',
    'Verwende keine Aufzählungen oder Listen — nur fließenden Text.',
    'Gehe auf die Eltern, die Attribute und die Besonderheiten des Tieres ein, ohne die Zahlen direkt zu nennen.',
    'Nutze stattdessen bildhafte Sprache (z.B. statt "Schnelligkeit 9" lieber "blitzschnell wie der Wind").',
    markdownKontext ? '\nWelt- und Rassekontext aus kontext_pferde.md:\n' + markdownKontext : '',
    '',
    'Daten des Fohlens:',
    '- Mutter: ' + data.mare,
    rasseKontext ? rasseKontext : '',
    '- Vater: ' + data.sire,
    (data.crossName ? '- Rassenname: ' + data.crossName : ''),
    (data.lifespanStr ? '- Geschätzte Lebensspanne: ' + data.lifespanStr : ''),
    '- Attribute: ' + statLines,
    '- Charakterzüge: ' + traitNames,
    '- Geschätzter Wert: ' + data.fmtPrice(data.foalPmin) + ' – ' + data.fmtPrice(data.foalPmax)
  ].filter(Boolean).join('\n');

  try {
    var resp = await fetchMitTimeout(KI_PROXY_BASE + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    }, 25000);
    if (!resp.ok) throw new Error('KI-Dienst antwortet mit HTTP ' + resp.status);
    var json = await resp.json();
    var text = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
    if (text) {
      var parts = text.trim().split(/\n\n+/);
      loreEl.innerHTML = parts.map(function(p) {
        return '<p style="margin-bottom:.5rem">' + p.replace(/\n/g, ' ') + '</p>';
      }).join('');
    } else {
      loreEl.textContent = 'Keine Beschreibung verfügbar.';
    }
  } catch(e) {
    loreEl.innerHTML = '<p style="margin-bottom:.5rem">' + lokaleFohlenBeschreibung(data) + '</p>';
    console.error('Lore error:', e);
  }
}

// ══════════════════════════════════════════════════════════
//  ZUCHTBUCH
// ══════════════════════════════════════════════════════════
var ZB = (function() {
  var KEY = 'rmskt_zb2';
  var cur = null;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e) {} }

  function apply() {
    var d = load();
    document.querySelectorAll('.zb-cell').forEach(function(c) {
      var k = c.dataset.mare + '|' + c.dataset.stallion;
      if (d[k]) {
        c.querySelector('.zb-val').textContent = d[k];
        c.classList.remove('zb-open','zb-known');
        c.classList.add('zb-user');
      }
    });
  }

  function openModal(cell) {
    cur = cell;
    var k = cell.dataset.mare + '|' + cell.dataset.stallion;
    var d = load();
    document.getElementById('zbPair').textContent = cell.dataset.mare + '  ✕  ' + cell.dataset.stallion;
    document.getElementById('zbInp').value = d[k] || cell.dataset.default || '';
    document.getElementById('zbVeil').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function() { document.getElementById('zbInp').focus(); }, 60);
  }

  // Public API
  return {
    apply: apply,
    openModal: openModal,
    close: function() {
      document.getElementById('zbVeil').classList.remove('open');
      document.body.style.overflow = '';
      cur = null;
    },
    save: function() {
      if (!cur) return;
      var k   = cur.dataset.mare + '|' + cur.dataset.stallion;
      var val = (document.getElementById('zbInp').value || '').trim();
      var d   = load();
      if (val) {
        d[k] = val;
        cur.querySelector('.zb-val').textContent = val;
        cur.classList.remove('zb-open','zb-known');
        cur.classList.add('zb-user');
      } else {
        delete d[k];
        var def = cur.dataset.default;
        cur.querySelector('.zb-val').textContent = def || '–';
        cur.classList.remove('zb-user','zb-known','zb-open');
        cur.classList.add(def ? 'zb-known' : 'zb-open');
      }
      save(d);
      ZB.close();
      zbLookup();
    },
    lookup: function() {
      var mare = document.getElementById('zbMare').value;
      var stal = document.getElementById('zbStallion').value;
      var res  = document.getElementById('zbResult');
      if (!mare || !stal) { res.innerHTML = '<span class="zb-result-hint">Wähle Stute und Hengst aus</span>'; return; }
      if (mare === stal)  { res.innerHTML = '<span class="zb-result-same">Gleiche Rasse — keine Kreuzung möglich</span>'; return; }
      var k    = mare + '|' + stal;
      var d    = load();
      var cell = document.querySelector('.zb-cell[data-mare="' + mare + '"][data-stallion="' + stal + '"]');
      var name = d[k] || (cell && cell.dataset.default) || '';
      var editBtn = '<button class="zb-edit-lnk" onclick="ZB.openModal(document.querySelector(\'.zb-cell[data-mare=\\"' + mare + '\\"]\' + \'[data-stallion=\\"' + stal + '\\"]\'))">' + (name ? '✎ Bearbeiten' : '✎ Eintragen') + '</button>';
      if (name) {
        res.innerHTML = '<span class="zb-result-known">' + name + '</span>' + editBtn;
      } else {
        res.innerHTML = '<span class="zb-result-open">Noch nicht benannt</span>' + editBtn;
      }
    },
    toggle: function() {
      var w = document.getElementById('zbWrap');
      var t = document.getElementById('zbToggle');
      var hidden = w.style.display === 'none' || w.style.display === '';
      w.style.display = hidden ? 'block' : 'none';
      t.textContent   = hidden ? '▼ Kreuzungsmatrix ausblenden' : '▶ Vollständige Kreuzungsmatrix anzeigen';
    },
    filter: function() {
      var q       = (document.getElementById('zbQ').value || '').toLowerCase().trim();
      var named   = document.getElementById('zbNamed').checked;
      var d       = load();
      document.querySelectorAll('#zbTbl tbody tr').forEach(function(row) {
        var hdr  = row.querySelector('.zb-row-hdr');
        var name = hdr ? hdr.textContent.toLowerCase() : '';
        row.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
      var hdrs = document.querySelectorAll('.zb-col-hdr');
      hdrs.forEach(function(th, ci) {
        var cn   = th.textContent.toLowerCase().replace(/\./g,'');
        var show = !q || cn.includes(q.replace(/\./g,''));
        document.querySelectorAll('#zbTbl tr').forEach(function(row) {
          var c = row.children[ci+1];
          if (c) c.style.display = show ? '' : 'none';
        });
      });
      if (named) {
        document.querySelectorAll('#zbTbl .zb-cell').forEach(function(c) {
          var k = c.dataset.mare + '|' + c.dataset.stallion;
          c.style.display = (c.dataset.default || d[k]) ? '' : 'none';
        });
        document.querySelectorAll('.zb-diag').forEach(function(c) { c.style.display = 'none'; });
      }
    },
    reset: function() {
      if (!confirm('Alle selbst eingetragenen Namen löschen?')) return;
      var d = load();
      document.querySelectorAll('.zb-cell.zb-user').forEach(function(c) {
        var k = c.dataset.mare + '|' + c.dataset.stallion;
        delete d[k];
        var def = c.dataset.default;
        c.querySelector('.zb-val').textContent = def || '–';
        c.classList.remove('zb-user','zb-known','zb-open');
        c.classList.add(def ? 'zb-known' : 'zb-open');
      });
      save(d);
      zbLookup();
    }
  };
})();

// Global wrappers for inline handlers
function zbLookup()  { ZB.lookup(); }
function zbToggle()  { ZB.toggle(); }
function zbFilter()  { ZB.filter(); }
function zbReset()   { ZB.reset(); }
function zbClose()   { ZB.close(); }
function zbSave()    { ZB.save(); }

// Table events
document.getElementById('zbTbl').addEventListener('click', function(e) {
  var cell = e.target.closest('.zb-cell');
  if (cell) ZB.openModal(cell);
});
document.getElementById('zbVeil').addEventListener('click', function(e) {
  if (e.target === this) ZB.close();
});
document.getElementById('zbInp').addEventListener('keydown', function(e) {
  if (e.key === 'Enter')  ZB.save();
  if (e.key === 'Escape') ZB.close();
});

// Crosshair
var zbTbl = document.getElementById('zbTbl');
zbTbl.addEventListener('mouseover', function(e) {
  var cell = e.target.closest('td,th');
  if (!cell) return;
  cell.closest('tr').classList.add('zb-hl');
  var ci = cell.cellIndex;
  zbTbl.querySelectorAll('tr').forEach(function(r) { if(r.children[ci]) r.children[ci].classList.add('zb-hl-c'); });
});
zbTbl.addEventListener('mouseout', function(e) {
  var cell = e.target.closest('td,th');
  if (!cell) return;
  cell.closest('tr').classList.remove('zb-hl');
  var ci = cell.cellIndex;
  zbTbl.querySelectorAll('tr').forEach(function(r) { if(r.children[ci]) r.children[ci].classList.remove('zb-hl-c'); });
});

ZB.apply();

// ══════════════════════════════════════════════════════════
//  LEGENDÄRE KARTEN — aufklappbares Radar (Eiarach & Fürstenglanz)
// ══════════════════════════════════════════════════════════
document.querySelectorAll('.besondere-card[data-legend]').forEach(function(card) {
  card.addEventListener('click', function() {
    var key    = this.dataset.legend;
    var panel  = document.getElementById('radar-' + key);
    var svgEl  = document.getElementById('radar-svg-' + key);
    var barsEl = document.getElementById('radar-bars-' + key);
    if (!panel) return;

    var isOpen = panel.style.display !== 'none';
    var arrow  = this.querySelector('.expand-arrow');

    if (isOpen) {
      panel.style.display = 'none';
      if (arrow) arrow.style.transform = '';
    } else {
      if (!svgEl.innerHTML) {
        var stats = HORSE_STATS[key] || [10,10,10,10,10,10];
        svgEl.innerHTML  = buildRadarSVG(stats);
        barsEl.innerHTML = buildStatBars(stats);
      }
      panel.style.display = 'block';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  });
});



// ═══════════════════════════════════════════════════════
//  OWAIN DRAIG CHATBOT
// ═══════════════════════════════════════════════════════
// ── Wissensdaten (inline) ──────────────────────────────────
var ROSSMARKT_WISSEN = {
  "welt": "Der Rossmarkt ist ein Reittierverzeichnis einer mittelalterlichen Fantasywelt. Die Welt umfasst Regionen wie Yrmandrall (hoher Norden), Estryll (nördliche Fürstentümer), Tirnara (südliche Steppen und Wüsten), Aldervan (westliches Großreich), Lothir (zentrales Kaiserreich) und Avallorn (mythisches Ursprungsland der edelsten Rassen). Das Königreich Cenyr liegt in Estryll, seine Hauptstadt ist Mathragon. Die Stadt Gwynthor gehört zur Grafschaft Celtigerns Wacht.",
  "owain": {
    "name": "Owain Draig",
    "titel": "Ritter von Cenyr, Kriegsheld, Lebemann, Pferdekenner Nr. 1",
    "herkunft": "Gwynthor, Königreich Cenyr",
    "wohnort": "Mathragon (Hauptstadt Cenyrs), beim König",
    "backstory": "Owain Draig ist ein Kriegsheld aus Cenyr — einer der bekanntesten Ritter des Königreichs. Er ist der Bruder von Galahad, dem Grafen von Celtigerns Wacht, und einer der engsten Freunde von König Tristan Pendrag. Owain hat mindestens acht Bastarde, von denen er weiß — und lacht darüber mit der Unbeschwertheit eines Mannes, der das Leben voll auslebt. Sein ehemaliges Pferd hieß Windric, das Bruderpferd von Cynric — dem Ross von König Ceolwulf von Aeldrumar, Owains bestem Freund. Windric und Cynric waren unzertrennlich, genau wie ihre Reiter.",
    "persoenlichkeit": "Owain spricht aus der Hüfte — direkt, locker, herzlich. Nie hochtrabend, nie vulgär, aber immer klar. Er trägt das Herz auf der Zunge und sagt gern 'Jung' oder 'Bursche' zu seinem Gegenüber. Er ist ein echter Lebemann, Frauenheld und Pferdenarr. Pferde sind seine Leidenschaft — er kann Stunden darüber reden. Er gibt Tipps aus Erfahrung, nicht aus Büchern.",
    "sprechstil": "Locker, direkt, warmherzig. Gelegentlich 'Jung' oder 'Bursche'. Kurze, klare Sätze. Gelegentlich selbstironisch. Nie langweilig.",
    "pferd": "Windric (ehemals), Bruderpferd von Cynric (Ross von König Ceolwulf von Aeldrumar)",
    "familie": {
      "bruder": "Galahad, Graf von Celtigerns Wacht",
      "koenig_freund": "Tristan Pendrag, König von Cenyr",
      "bester_freund": "Ceolwulf, König von Aeldrumar"
    },
    "zucht_philosophie": "Owain veredelt immer das schwächere Pferd mit dem stärkeren — namenstechnisch. Wenn ein Erlenglanz mit einem Hest gekreuzt wird, hebt er den Hest hervor: Edelhest, Glanzhest, Jarlsglanz. Bei gleichwertigen Rassen kombiniert er beide Namen in einer Symbiose. Namensvorschläge passen immer zur Namenskultur beider Rassen."
  },
  "stats_erklaerung": {
    "Schnelligkeit": "Wie schnell das Pferd galoppieren kann (1-10)",
    "Ausdauer": "Wie lange das Pferd durchhalten kann (1-10)",
    "Staerke": "Körperkraft, Zugkraft, Tragfähigkeit (1-10)",
    "Agilitaet": "Wendigkeit, Reaktionsschnelligkeit (1-10)",
    "Sozialverhalten": "Umgänglichkeit, Bindung zum Reiter, Temperament (1-10)",
    "Robustheit": "Widerstandsfähigkeit gegen Krankheit, Klima, Strapazen (1-10)"
  },
  "traits": {
    "Blitzschnell": "Schnelligkeit 9-10 — übertrifft fast alle anderen Rassen im Galopp",
    "Traege": "Schnelligkeit 1-2 — langsam, für Rennen oder Kavallerie ungeeignet",
    "Ausdauernd": "Ausdauer 9-10 — hält extrem lange durch, ideal für lange Märsche",
    "Kurzatmig": "Ausdauer 1-2 — ermüdet schnell, benötigt häufige Pausen",
    "Kraeftig": "Stärke 9-10 — außergewöhnliche Körperkraft, zieht schwere Lasten",
    "Schwaechlich": "Stärke 1-2 — wenig Körperkraft, nicht für schwere Arbeit geeignet",
    "Wendig": "Agilität 9-10 — meistert engstes Gelände, reagiert blitzschnell",
    "Schwerfaellig": "Agilität 1-2 — schwerfällig, ungeeignet für enge Manöver",
    "Sanftmuetig": "Sozialverhalten 9-10 — außergewöhnlich zahm, bindet sich stark an Reiter",
    "Schwierig": "Sozialverhalten 1-2 — schwer zu zähmen, braucht erfahrene Hand",
    "Zaeh": "Robustheit 9-10 — nahezu unverwüstlich, trotzt jedem Klima",
    "Empfindlich": "Robustheit 1-2 — braucht besondere Pflege, anfällig für Krankheiten",
    "Ausserordentlich": "Durchschnitt aller Werte über 8 — ein außergewöhnliches Tier in jeder Hinsicht",
    "Ueberdurchschnittlich": "Durchschnitt aller Werte über 7 — deutlich über dem Mittelfeld",
    "Unterdurchschnittlich": "Durchschnitt aller Werte unter 3 — ein schwaches Tier"
  },
  "rassen": {
    "Hross": {
      "tier": "gewöhnlich",
      "region": "Yrmandrall",
      "preis": "100–300 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 2,
        "Ausdauer": 5,
        "Staerke": 5,
        "Agilitaet": 2,
        "Sozialverhalten": 4,
        "Robustheit": 8
      },
      "traits": [
        "Träge",
        "Schwerfällig",
        "Zäh"
      ],
      "beschreibung": "Das grobschlächtige Nordpferd Yrmandralls — pelzig, kräftig, zäh, stur, fast eselsartig im Wesen. Für Kavallerie und Krieg ungeeignet. Solides Arbeitspferd der Bauernschaft. Anspruchslos und robust.",
      "verwendung": [
        "Arbeit",
        "Landwirtschaft"
      ]
    },
    "Skuggr": {
      "tier": "ungewöhnlich",
      "region": "Yrmandrall",
      "preis": "300–1.000 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 3,
        "Ausdauer": 6,
        "Staerke": 7,
        "Agilitaet": 3,
        "Sozialverhalten": 3,
        "Robustheit": 9
      },
      "traits": [
        "Zäh",
        "Schwierig"
      ],
      "beschreibung": "Das kräftigere Nordpferd Yrmandralls — groß, pelzig, muskulös. Von Nordmännern gelegentlich als Streitross verwendet, langsam und sperrig. Taugt bedingt als Kriegspferd wo Schnelligkeit weniger zählt als schiere Masse.",
      "verwendung": [
        "Kavallerie",
        "Arbeit"
      ]
    },
    "Hest": {
      "tier": "ungewöhnlich",
      "region": "Estryll",
      "preis": "300–1.000 Münzen",
      "lebensspanne": "25–30 Jahre",
      "stats": {
        "Schnelligkeit": 4,
        "Ausdauer": 7,
        "Staerke": 5,
        "Agilitaet": 4,
        "Sozialverhalten": 7,
        "Robustheit": 9
      },
      "traits": [
        "Zäh",
        "Sanftmütig"
      ],
      "beschreibung": "Das typische nordische Pferd Estrylls. Dichtes Fell, trotzt eisiger Kälte. Als Kriegspferd nur mittelmäßig — dafür zäh und nahezu unverwüstlich. Ideal für unerfahrene Reiter. Von der aldrimischen Reiterklasse der Thegn bevorzugt.",
      "verwendung": [
        "Kavallerie",
        "Transport"
      ]
    },
    "Cuanach": {
      "tier": "ungewöhnlich",
      "region": "Estryll",
      "preis": "400–1.000 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 3,
        "Ausdauer": 6,
        "Staerke": 4,
        "Agilitaet": 5,
        "Sozialverhalten": 6,
        "Robustheit": 7
      },
      "traits": [],
      "beschreibung": "Naher Verwandter des Tirashan; mit den Kronalben nach Lothir gelangt. Flache Hufe trotzen Moor und Morast; verträgt für andere Rassen giftige Pflanzen. Als Kriegspferd ungeeignet. Beliebt bei Bauern, Händlern und Kundschaftern in Sumpfregionen.",
      "verwendung": [
        "Sumpf",
        "Kundschaft",
        "Transport"
      ]
    },
    "Skaer": {
      "tier": "ungewöhnlich",
      "region": "Yrmandrall",
      "preis": "400–2.000 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 5,
        "Ausdauer": 6,
        "Staerke": 4,
        "Agilitaet": 5,
        "Sozialverhalten": 3,
        "Robustheit": 7
      },
      "traits": [
        "Schwierig"
      ],
      "beschreibung": "Kaum in domestizierter Form verfügbar — die Nordmänner haben sich selten darum geschert, den Skaer zu bändigen. Von Jägern eher gejagt als geritten; gilt als Delikatesse. Exotischer Preis durch Seltenheit.",
      "verwendung": [
        "Exotisch"
      ]
    },
    "Tirashan": {
      "tier": "Mittelklasse",
      "region": "Estryll",
      "preis": "400–1.800 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 6,
        "Ausdauer": 6,
        "Staerke": 5,
        "Agilitaet": 6,
        "Sozialverhalten": 6,
        "Robustheit": 7
      },
      "traits": [],
      "beschreibung": "Einheimisches Pferd der südlichen Fürstentümer Estrylls. Aus Kreuzungen zwischen Curragh und Hest entstanden — schneller und militärisch geeigneter als der Cuanach. Meistert dichtes Waldgelände. Beliebt bei den Mormaer.",
      "verwendung": [
        "Kavallerie",
        "Wald",
        "Krieg"
      ]
    },
    "Afol": {
      "tier": "Mittelklasse",
      "region": "Tirnara",
      "preis": "400–2.000 Münzen",
      "lebensspanne": "25–30 Jahre",
      "stats": {
        "Schnelligkeit": 5,
        "Ausdauer": 6,
        "Staerke": 4,
        "Agilitaet": 5,
        "Sozialverhalten": 7,
        "Robustheit": 6
      },
      "traits": [
        "Sanftmütig"
      ],
      "beschreibung": "Auffällig geschecktes, schwarz-weißes Fell mit grauer Mähne. Gute Geschwindigkeit und Ausdauer, verspieltes Temperament. Die Volksversion des edlen Equo — günstig, vielseitig, beliebt bei der Bauernschaft Tirnaras.",
      "verwendung": [
        "Arbeit",
        "Transport"
      ]
    },
    "Xanathos": {
      "tier": "Mittelklasse",
      "region": "Tirnara",
      "preis": "500–4.000 Münzen",
      "lebensspanne": "20–30 Jahre",
      "stats": {
        "Schnelligkeit": 2,
        "Ausdauer": 7,
        "Staerke": 9,
        "Agilitaet": 2,
        "Sozialverhalten": 6,
        "Robustheit": 8
      },
      "traits": [
        "Kräftig",
        "Träge",
        "Schwerfällig"
      ],
      "beschreibung": "Wenig Geschwindigkeit und Agilität — doch in Kraft und Zugleistung das stärkste normale Pferd des Kontinents. Ideal beim Ziehen schwerer Wagen und Lasten. Verlässlich, bodenstämmig, bärenstark.",
      "verwendung": [
        "Schwerlast",
        "Transport"
      ]
    },
    "Goldmähne": {
      "tier": "gehoben",
      "region": "Lothir",
      "preis": "700–8.000 Münzen",
      "lebensspanne": "35–40 Jahre",
      "stats": {
        "Schnelligkeit": 7,
        "Ausdauer": 7,
        "Staerke": 6,
        "Agilitaet": 6,
        "Sozialverhalten": 8,
        "Robustheit": 7
      },
      "traits": [
        "Überdurchschnittlich"
      ],
      "beschreibung": "Das beliebteste Pferd Lothirs — aus dem Erlenglanz hervorgegangen, aber deutlich kampftauglicher. Schnell, verlässlich, standhaft. Der Allrounder schlechthin: Kavallerie, Adelsreittier, Kurierdienst oder leichtes Arbeitstier.",
      "verwendung": [
        "Kavallerie",
        "Arbeit",
        "Parade"
      ]
    },
    "Curragh": {
      "tier": "gehoben",
      "region": "Estryll",
      "preis": "800–3.000 Münzen",
      "lebensspanne": "30–40 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 8,
        "Staerke": 2,
        "Agilitaet": 10,
        "Sozialverhalten": 9,
        "Robustheit": 2
      },
      "traits": [
        "Blitzschnell",
        "Wendig",
        "Sanftmütig",
        "Schwächlich",
        "Empfindlich"
      ],
      "beschreibung": "Aus dem Eiarach hervorgegangen. Trägt markantes hirschartiges Geweih. Als Kavalleriepferd schwer zu bändigen — doch im Wald nahezu unerreicht. Viele Tiarna-Reiter halten ihn aus Tradition und Stolz.",
      "verwendung": [
        "Wald",
        "Prestige",
        "Kundschaft"
      ]
    },
    "Nebtu": {
      "tier": "gehoben",
      "region": "Tirnara",
      "preis": "800–4.000 Münzen",
      "lebensspanne": "30–35 Jahre",
      "stats": {
        "Schnelligkeit": 8,
        "Ausdauer": 9,
        "Staerke": 4,
        "Agilitaet": 8,
        "Sozialverhalten": 3,
        "Robustheit": 6
      },
      "traits": [
        "Ausdauernd",
        "Schwierig"
      ],
      "beschreibung": "Eng verwandt mit dem Zebra — unverkennbar gestreift. Nationalpferd Kemetaras; Wagenpferd und Reittier der Stürmerkavallerie. Eines der agilsten Pferde überhaupt. Kann außergewöhnlich lange ohne Wasser auskommen.",
      "verwendung": [
        "Kavallerie",
        "Wüste",
        "Transport"
      ]
    },
    "Rhyfel": {
      "tier": "gehoben",
      "region": "Estryll",
      "preis": "800–4.000 Münzen",
      "lebensspanne": "30–35 Jahre",
      "stats": {
        "Schnelligkeit": 6,
        "Ausdauer": 7,
        "Staerke": 6,
        "Agilitaet": 6,
        "Sozialverhalten": 6,
        "Robustheit": 8
      },
      "traits": [
        "Zäh"
      ],
      "beschreibung": "Nationalpferd der Königreiche Cenyr und Vennyr. Kreuzung aus Hest und dem avallornischen Ceffyl — robuste Kaltblüternatur trifft edle Wendigkeit. Sowohl als Arbeitspferd als auch als kampftaugliche Kavallerie geeignet. Gezüchtet von der Gilde Rhosmeres Rösser.",
      "verwendung": [
        "Kavallerie",
        "Krieg",
        "Arbeit"
      ]
    },
    "Sale": {
      "tier": "gehoben",
      "region": "Aldervan",
      "preis": "400–6.000 Münzen",
      "lebensspanne": "30–35 Jahre",
      "stats": {
        "Schnelligkeit": 6,
        "Ausdauer": 7,
        "Staerke": 5,
        "Agilitaet": 6,
        "Sozialverhalten": 7,
        "Robustheit": 8
      },
      "traits": [
        "Zäh"
      ],
      "beschreibung": "Das klassische Nordpferd Aldervans und Nationalpferd Mathringens. Vom Cyning abstammend — leichter und wendiger. Schnell, robust, geländegängig. Von Bauern, Kriegsreitern, Kundschaftern und Rittern gleichermaßen genutzt.",
      "verwendung": [
        "Kavallerie",
        "Kundschaft",
        "Arbeit"
      ]
    },
    "Equo": {
      "tier": "besonders",
      "region": "Tirnara",
      "preis": "1.000–10.000 Münzen",
      "lebensspanne": "30–35 Jahre",
      "stats": {
        "Schnelligkeit": 7,
        "Ausdauer": 7,
        "Staerke": 7,
        "Agilitaet": 7,
        "Sozialverhalten": 7,
        "Robustheit": 7
      },
      "traits": [
        "Überdurchschnittlich"
      ],
      "beschreibung": "Militärpferd des Imperiums Argentum, aus Brycing-Zuchtlinien. Verlässliches Kriegs- und Kavalleriepferd — schnell, zugstark, ausdauernd. Standard für Kavallerie, Eskorte und Frontdienste im gesamten Imperium.",
      "verwendung": [
        "Kavallerie",
        "Krieg",
        "Transport"
      ]
    },
    "Shahzad": {
      "tier": "außerordentlich",
      "region": "Tirnara",
      "preis": "4.000–25.000 Münzen",
      "lebensspanne": "25–45 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 9,
        "Staerke": 4,
        "Agilitaet": 8,
        "Sozialverhalten": 3,
        "Robustheit": 5
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Schwierig"
      ],
      "beschreibung": "Das Nationalpferd der Shirazad — das perfekte Wüstenpferd. Galoppiert auf Sand, trotzt extremer Hitze, übersteht Dürre. Im Direktkampf weniger kraftvoll als der Sarkal, doch in der Wüste hat er keine Gegner. Unentbehrlich für Karawanen, Späher und Wüstenkrieger.",
      "verwendung": [
        "Wüste",
        "Kundschaft",
        "Transport"
      ]
    },
    "Cheval": {
      "tier": "außerordentlich",
      "region": "Aldervan",
      "preis": "3.000–20.000 Münzen",
      "lebensspanne": "40–50 Jahre",
      "stats": {
        "Schnelligkeit": 8,
        "Ausdauer": 8,
        "Staerke": 7,
        "Agilitaet": 8,
        "Sozialverhalten": 7,
        "Robustheit": 7
      },
      "traits": [
        "Außerordentlich"
      ],
      "beschreibung": "In Aldervan als das perfekte Kavalleriepferd gehandelt. Neben Sarkal, Brycing, Drake und Ceffyl zählt er zu den besten Reitpferden der Welt. Leistungsstark, günstiger in der Haltung als andere Elitepferde und rein effizient.",
      "verwendung": [
        "Kavallerie",
        "Krieg"
      ]
    },
    "Cyning": {
      "tier": "hervorragend",
      "region": "Aldervan",
      "preis": "3.000–20.000 Münzen",
      "lebensspanne": "50–60 Jahre",
      "stats": {
        "Schnelligkeit": 2,
        "Ausdauer": 8,
        "Staerke": 10,
        "Agilitaet": 1,
        "Sozialverhalten": 8,
        "Robustheit": 10
      },
      "traits": [
        "Kräftig",
        "Zäh",
        "Träge",
        "Schwerfällig"
      ],
      "beschreibung": "Direkter Nachfahre des Urpferdes von Aldervan — die größte Pferderasse der Welt. Für Reiterei und Kampf ungeeignet, doch in Zugkraft übertrifft er selbst Ochsen. Für militärische und ländliche Logistik unverzichtbar.",
      "verwendung": [
        "Schwerlast",
        "Transport"
      ]
    },
    "Ceffyl": {
      "tier": "außerordentlich",
      "region": "Estryll",
      "preis": "5.000–35.000 Münzen",
      "lebensspanne": "40–60 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 8,
        "Staerke": 7,
        "Agilitaet": 8,
        "Sozialverhalten": 10,
        "Robustheit": 8
      },
      "traits": [
        "Blitzschnell",
        "Sanftmütig",
        "Außerordentlich"
      ],
      "beschreibung": "Edler Nachkomme des mythischen Urpferdes von Avallorn — das ideale Ritterpferd. Gilt als das intelligenteste aller Pferde. Ein Ceffyl bindet sich lebenslang an seinen Reiter. Außerordentlich schnell und ausdauernd. Einen Ceffyl zu reiten bedeutet, Würde und Prestige zu tragen.",
      "verwendung": [
        "Kavallerie",
        "Krieg",
        "Parade"
      ]
    },
    "Sarkal": {
      "tier": "außerordentlich",
      "region": "Tirnara",
      "preis": "5.000–35.000 Münzen",
      "lebensspanne": "30–45 Jahre",
      "stats": {
        "Schnelligkeit": 10,
        "Ausdauer": 9,
        "Staerke": 7,
        "Agilitaet": 9,
        "Sozialverhalten": 5,
        "Robustheit": 7
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Wendig",
        "Außerordentlich"
      ],
      "beschreibung": "Gezüchtet von der Gilde der Steppenläufer — das schnellste Pferd Tirnaras. Reines Militärpferd, perfekt auf die legendäre Sipahi-Reiterei abgestimmt: außerordentlich schnell, überraschend kräftig, beeindruckende Ausdauer. Nahezu ausschließlich dem Adel und Militär vorbehalten.",
      "verwendung": [
        "Kavallerie",
        "Krieg"
      ]
    },
    "Herzogsschimmer": {
      "tier": "Prestige",
      "region": "Lothir",
      "preis": "5.000–35.000 Münzen",
      "lebensspanne": "30–45 Jahre",
      "stats": {
        "Schnelligkeit": 7,
        "Ausdauer": 7,
        "Staerke": 7,
        "Agilitaet": 7,
        "Sozialverhalten": 6,
        "Robustheit": 7
      },
      "traits": [
        "Überdurchschnittlich"
      ],
      "beschreibung": "Aus einer Erlenglanz-Zucht entstanden — ein schwarzes Ross mit silberner Mähne, elegant und kampftauglich. Von den Rittern Aldingens bevorzugt. Vereint Stil und Stärke.",
      "verwendung": [
        "Kavallerie",
        "Prestige"
      ]
    },
    "Erlenglanz": {
      "tier": "Prestige",
      "region": "Lothir",
      "preis": "5.000–60.000 Münzen",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 3,
        "Staerke": 2,
        "Agilitaet": 9,
        "Sozialverhalten": 2,
        "Robustheit": 2
      },
      "traits": [
        "Blitzschnell",
        "Wendig",
        "Schwächlich",
        "Schwierig",
        "Empfindlich"
      ],
      "beschreibung": "Strahlendes weißes Fell, silberne Mähne, anmutige Statur. Das Paradepferd schlechthin — für Festzüge, Turniere und hochkarätige Empfänge. Für echten Krieg und Arbeit völlig ungeeignet — zu sensibel, zu unrobust. Teuer nicht wegen Leistung, sondern wegen reinem Prestige.",
      "verwendung": [
        "Parade",
        "Prestige"
      ]
    },
    "Aurelianer": {
      "tier": "Prestige",
      "region": "Lothir",
      "preis": "10.000–40.000 Münzen",
      "lebensspanne": "30–45 Jahre",
      "stats": {
        "Schnelligkeit": 8,
        "Ausdauer": 7,
        "Staerke": 7,
        "Agilitaet": 7,
        "Sozialverhalten": 6,
        "Robustheit": 7
      },
      "traits": [
        "Außerordentlich"
      ],
      "beschreibung": "Aus einer unbekannten Zuchtlinie im Fürstentum Goldmund entstanden — das prestigeträchtige Schlachtross der Güldner und Oraner, der goldenen Garde des Fürsten. Ein fürstliches Gut.",
      "verwendung": [
        "Krieg",
        "Kavallerie",
        "Prestige"
      ]
    },
    "Drake": {
      "tier": "außerordentlich",
      "region": "Aldervan",
      "preis": "5.000–35.000 Münzen",
      "lebensspanne": "45–60 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 9,
        "Staerke": 8,
        "Agilitaet": 9,
        "Sozialverhalten": 9,
        "Robustheit": 8
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Wendig",
        "Sanftmütig",
        "Außerordentlich"
      ],
      "beschreibung": "Gehört unangefochten zu den besten Pferden der Welt. Mitgebracht von den Gründern Baldreskas. Eine Legende auf vier Beinen: schnell, ausdauernd, extrem intelligent, überdurchschnittlich langlebig.",
      "verwendung": [
        "Kavallerie",
        "Krieg",
        "Prestige"
      ]
    },
    "Brycing": {
      "tier": "erstklassig",
      "region": "Aldervan",
      "preis": "10.000–100.000 Münzen",
      "lebensspanne": "60–75 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 10,
        "Staerke": 9,
        "Agilitaet": 9,
        "Sozialverhalten": 9,
        "Robustheit": 9
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Kräftig",
        "Wendig",
        "Sanftmütig",
        "Zäh",
        "Außerordentlich"
      ],
      "beschreibung": "Vielerorts schlicht als das beste Pferd der Welt bezeichnet. Kreuzung aus Cyning und Drake — vereint Größe, Ausdauer, Langlebigkeit, Intelligenz und Schnelligkeit. Ein Symbol für Herrschaft und Macht.",
      "verwendung": [
        "Kavallerie",
        "Krieg",
        "Prestige"
      ]
    },
    "Crafan": {
      "tier": "selten",
      "region": "unbekannt",
      "preis": "unbekannt",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 2,
        "Ausdauer": 4,
        "Staerke": 2,
        "Agilitaet": 3,
        "Sozialverhalten": 8,
        "Robustheit": 5
      },
      "traits": [
        "Sanftmütig",
        "Träge"
      ],
      "beschreibung": "Selten und kaum dokumentiert. Auffallend sanftmütig für seine bescheidenen körperlichen Werte.",
      "verwendung": []
    },
    "Myrr": {
      "tier": "selten",
      "region": "unbekannt",
      "preis": "unbekannt",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 2,
        "Ausdauer": 3,
        "Staerke": 2,
        "Agilitaet": 3,
        "Sozialverhalten": 5,
        "Robustheit": 6
      },
      "traits": [
        "Träge",
        "Unterdurchschnittlich"
      ],
      "beschreibung": "Selten und kaum dokumentiert. Eines der schwächeren Tiere auf dem Markt.",
      "verwendung": []
    },
    "Skelmir": {
      "tier": "selten",
      "region": "unbekannt",
      "preis": "unbekannt",
      "lebensspanne": "20–25 Jahre",
      "stats": {
        "Schnelligkeit": 3,
        "Ausdauer": 6,
        "Staerke": 4,
        "Agilitaet": 3,
        "Sozialverhalten": 6,
        "Robustheit": 8
      },
      "traits": [
        "Zäh"
      ],
      "beschreibung": "Selten und kaum dokumentiert. Robust und ausdauernd für seine Klasse.",
      "verwendung": []
    },
    "Eiarach": {
      "tier": "mythisch",
      "region": "Estryll",
      "preis": "unbezahlbar",
      "lebensspanne": "bis zu 100 Jahre",
      "stats": {
        "Schnelligkeit": 9,
        "Ausdauer": 10,
        "Staerke": 10,
        "Agilitaet": 9,
        "Sozialverhalten": 10,
        "Robustheit": 10
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Kräftig",
        "Wendig",
        "Sanftmütig",
        "Zäh",
        "Außerordentlich"
      ],
      "beschreibung": "Das Urpferd aller Rassen Estrylls. Nahezu mythisch — kaum in lebender Form anzutreffen. Vorfahre des Curragh und vieler anderer Rassen des Nordens.",
      "verwendung": [
        "mythisch"
      ]
    },
    "Fürstenglanz": {
      "tier": "legendär",
      "region": "Lothir",
      "preis": "unbezahlbar",
      "lebensspanne": "bis zu 300 Jahre",
      "stats": {
        "Schnelligkeit": 10,
        "Ausdauer": 10,
        "Staerke": 9,
        "Agilitaet": 10,
        "Sozialverhalten": 10,
        "Robustheit": 9
      },
      "traits": [
        "Blitzschnell",
        "Ausdauernd",
        "Kräftig",
        "Wendig",
        "Sanftmütig",
        "Zäh",
        "Außerordentlich"
      ],
      "beschreibung": "Eine Legende unter den Pferden — kaum einem sterblichen Reiter begegnet. Das prächtigste und langlebigste Ross das je auf dem Kontinent gesichtet wurde.",
      "verwendung": [
        "legendär"
      ]
    }
  }
};

var owainAudio = null;

async function owainSpeak(text, btn) {
  if (owainAudio) { owainAudio.pause(); owainAudio = null; }
  var origText = btn.textContent;
  btn.textContent = '⏳ …';
  btn.disabled = true;

  try {
    var resp = await fetchMitTimeout(KI_PROXY_BASE + '/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    }, 25000);
    if (!resp.ok) throw new Error('TTS fehlgeschlagen');
    var blob = await resp.blob();
    var url = URL.createObjectURL(blob);
    owainAudio = new Audio(url);
    owainAudio.play();
    btn.textContent = '⏹ Stop';
    btn.disabled = false;
    btn.onclick = function() {
      owainAudio.pause();
      owainAudio = null;
      btn.textContent = '🔊 Vorlesen';
      btn.onclick = function() { owainSpeak(text, btn); };
    };
    owainAudio.onended = function() {
      btn.textContent = '🔊 Vorlesen';
      btn.onclick = function() { owainSpeak(text, btn); };
    };
  } catch(e) {
    btn.textContent = '🔊 Vorlesen';
    btn.disabled = false;
    console.error('TTS error:', e);
  }
}

function getWissenPrompt(query) {
  if (!ROSSMARKT_WISSEN) return getRelevanterMarkdownKontext(query);
  var lines = ['\n\n=== ROSSMARKT WISSENSDATENBANK ==='];
  lines.push('Welt: ' + ROSSMARKT_WISSEN.welt);
  lines.push('\nPferderassen (Werte 1-10: Schnelligkeit/Ausdauer/Stärke/Agilität/Sozialverhalten/Robustheit):');
  Object.entries(ROSSMARKT_WISSEN.rassen).forEach(function(entry) {
    var name = entry[0], r = entry[1];
    var s = r.stats;
    var traits = r.traits && r.traits.length ? ' [' + r.traits.join(', ') + ']' : '';
    lines.push('- ' + name + ' (' + r.tier + ', ' + r.region + '): Schn=' + s.Schnelligkeit + ' Aus=' + s.Ausdauer + ' Str=' + s.Staerke + ' Agi=' + s.Agilitaet + ' Soz=' + s.Sozialverhalten + ' Rob=' + s.Robustheit + traits + '. ' + r.beschreibung);
  });
  var markdownKontext = getRelevanterMarkdownKontext(query);
  if (markdownKontext) {
    lines.push('\n=== KONTEXT_PFERDE.MD AUSZUG ===');
    lines.push(markdownKontext);
  }
  return lines.join('\n');
}

function getRasseInfo(name) {
  if (!ROSSMARKT_WISSEN) return null;
  return ROSSMARKT_WISSEN.rassen[name] || null;
}

var owainHistory = [];
var owainSystemPrompt = [
  'Du bist Owain Draig — Ritter aus Cenyr, Kriegsheld und der beste Pferdekenner des Kontinents.',
  'Du bist der Bruder von Galahad, Graf von Celtigerns Wacht, und einer der engsten Freunde von König Tristan Pendrag von Cenyr.',
  'Du hast mindestens acht Bastarde von denen du weißt — und lachst drüber wie ein Mann, der das Leben voll auslebt.',
  'Dein ehemaliges Pferd hieß Windric, das Bruderpferd von Cynric — dem Ross deines besten Freundes König Ceolwulf von Aeldrumar.',
  'Du stammst aus Gwynthor, lebst aber meist in Mathragon beim König.',
  'DU SPRICHST: locker, direkt, herzlich. Nie hochtrabend, nie vulgär. Du sagst gern "Jung" oder "Bursche". Kurze klare Sätze. Herz auf der Zunge.',
  'Du kennst ALLE Pferderassen auswendig — ihre genauen Werte (Schnelligkeit, Ausdauer, Stärke, Agilität, Sozialverhalten, Robustheit je 1-10) und Traits.',
  'Wenn jemand nach Rassen fragt, nennst du die Werte immersiv in Fließtext — nicht als Liste, sondern wie ein Kenner der schwärmt.',
  'Bei Kreuzungen schlägst du Namen vor: das bessere Pferd veredelt das schwächere. Erlenglanz x Hest = Hest wird veredelt: Edelhest, Glanzhest, Jarlsglanz.',
  'Bei gleichwertigen Rassen kombinierst du beide Namen: Hest x Sale = Salehest, Nordsale, Grenzläufer.',
  'Antworte immer auf Deutsch. 2-4 Sätze. Keine Aufzählungslisten.'
].join(' ');

function owainOpen() {
  document.getElementById('owainSidebar').style.display = 'flex';
  document.getElementById('owainToggle').style.display = 'none';
  setTimeout(function() { document.getElementById('owainInput').focus(); }, 100);
}

function owainClose() {
  document.getElementById('owainSidebar').style.display = 'none';
  document.getElementById('owainToggle').style.display = 'flex';
}

function owainAddMsg(text, isUser) {
  var box = document.getElementById('owainMessages');
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:.3rem;' + (isUser ? 'align-items:flex-end;' : 'align-items:flex-start;');

  var div = document.createElement('div');
  div.style.cssText = isUser
    ? 'max-width:85%;background:#2a3a1a;border:1px solid #6a8a3a44;border-radius:6px;padding:.7rem .9rem;color:#d4e8a0;font-size:.88rem;line-height:1.6;'
    : 'max-width:90%;background:#2a1f0844;border:1px solid #c8a84b33;border-radius:6px;padding:.8rem 1rem;color:#d4c090;font-size:.88rem;line-height:1.6;font-style:italic;';
  div.textContent = text;
  wrap.appendChild(div);

  if (!isUser) {
    var speakBtn = document.createElement('button');
    speakBtn.textContent = '🔊 Vorlesen';
    speakBtn.style.cssText = 'background:none;border:1px solid #c8a84b44;border-radius:3px;color:#8b7a4a;font-size:.72rem;padding:.2rem .5rem;cursor:pointer;align-self:flex-start;';
    speakBtn.onmouseover = function() { this.style.color='#c8a84b'; this.style.borderColor='#c8a84b'; };
    speakBtn.onmouseout  = function() { this.style.color='#8b7a4a'; this.style.borderColor='#c8a84b44'; };
    speakBtn.onclick = function() { owainSpeak(text, speakBtn); };
    wrap.appendChild(speakBtn);
  }

  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
  return div;
}

async function owainSend() {
  var inp = document.getElementById('owainInput');
  var text = (inp.value || '').trim();
  if (!text) return;
  inp.value = '';

  owainAddMsg(text, true);
  owainHistory.push({ role: 'user', content: text });

  var loadingDiv = owainAddMsg('…', false);
  loadingDiv.style.opacity = '.5';

  try {
    var resp = await fetchMitTimeout(KI_PROXY_BASE + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        max_tokens: 300,
        system: owainSystemPrompt + getWissenPrompt(text),
        messages: owainHistory
      })
    }, 25000);
    if (!resp.ok) throw new Error('KI-Dienst antwortet mit HTTP ' + resp.status);
    var json = await resp.json();
    var reply = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
    if (reply) {
      loadingDiv.textContent = reply;
      loadingDiv.style.opacity = '1';
      owainHistory.push({ role: 'assistant', content: reply });
      // Verlauf auf 20 Nachrichten begrenzen
      if (owainHistory.length > 20) owainHistory = owainHistory.slice(-20);
    } else {
      loadingDiv.textContent = '„Verzeiht, meine Gedanken sind gerade anderswo…"';
      loadingDiv.style.opacity = '.6';
    }
  } catch(e) {
    var fallback = lokaleOwainAntwort(text);
    loadingDiv.textContent = fallback;
    loadingDiv.style.opacity = '1';
    owainHistory.push({ role: 'assistant', content: fallback });
    if (owainHistory.length > 20) owainHistory = owainHistory.slice(-20);
    console.error('Owain KI error:', e);
  }
}
