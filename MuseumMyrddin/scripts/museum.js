const COMMENT_CODE = '7777';
const STORAGE_KEY = 'myrddin-museum-modules:v1';
const PLACEHOLDER_IMAGE = 'https://66.media.tumblr.com/c11fe8f7aab917bc90215beef3e83c10/tumblr_otwjgn7mfU1wwqdobo1_1280.png';

const defaultModules = [
  { id: 'museum-malerei-01', target: 'painting-modules', number: 'Werk I', kind: 'Malerei', title: 'Die noch verh&uuml;llte Tafel', meta: 'Myrddin Draig - Mischtechnik - undatiert', image: '', description: 'Ein schwerer Vorhang bedeckt diese Arbeit noch immer. Auf dem kleinen Messingschild darunter steht lediglich, der Meister habe den rechten Augenblick der Enth&uuml;llung noch nicht f&uuml;r gekommen erkl&auml;rt.', masterComment: 'Geduld ist eine untersch&auml;tzte Tugend des Publikums. Ich kultiviere sie hier in au&szlig;ergew&ouml;hnlicher Reinheit.' },
  { id: 'museum-malerei-02', target: 'painting-modules', number: 'Werk II', kind: 'Illustration', title: 'Studie im goldenen Halblicht', meta: 'Myrddin Draig - Tusche, Lasur, Blattgold - undatiert', image: '', description: 'Diese Bildtafel wartet im westlichen Licht der Galerie. Die Linien sind sparsam, die Absicht gro&szlig;, und die Kuratoren fl&uuml;stern, dass Myrddin sie mehrfach als beinahe vollendet bezeichnet habe.', masterComment: 'Beinahe vollendet ist ein Zustand, den viele K&uuml;nstler nie erreichen. Man sollte also nicht vorschnell urteilen.' },
  { id: 'museum-malerei-03', target: 'painting-modules', number: 'Werk III', kind: 'Studie', title: 'Das kleine Schweigen der Farben', meta: 'Myrddin Draig - Pigmentprobe - undatiert', image: '', description: 'Auf dem Pergament liegt eine Stille, als h&auml;tte die Farbe selbst beschlossen, erst nach angemessener W&uuml;rdigung zu sprechen. Besucher bleiben hier oft l&auml;nger stehen, als sie zugeben.', masterComment: 'Farbe muss nicht schreien. Sie muss nur wissen, dass sie recht hat.' },
  { id: 'museum-malerei-04', target: 'painting-modules', number: 'Werk IV', kind: 'Skizze', title: 'Vorzeichnung einer gro&szlig;en Behauptung', meta: 'Myrddin Draig - Kohle und Silberstift - undatiert', image: '', description: 'Nur wenige Striche sind sichtbar, doch sie ordnen den Raum um sich mit auff&auml;lliger Selbstsicherheit. Man hat den Eindruck, das eigentliche Bild warte bereits hinter der Linie.', masterComment: 'Eine gute Linie erkl&auml;rt nicht. Sie befiehlt.' },
  { id: 'museum-artefakt-01', target: 'artifact-modules', number: 'Objekt I', kind: 'Artefakt', title: 'Das versiegelte Etwas', meta: 'Myrddin Draig - Bronze, Wachs, Bannfaden - undatiert', image: '', description: 'Dieses Objekt ruht unter Glas und drei sehr alten Warnungen. Niemand ist sich einig, ob es summt, fl&uuml;stert oder nur besonders eindringlich schweigt.', masterComment: 'Wenn ein Ding nicht ge&ouml;ffnet werden m&ouml;chte, sollte man ihm diesen Wunsch lassen. Zumindest, wenn man an seinen Fingern h&auml;ngt.' },
  { id: 'museum-artefakt-02', target: 'artifact-modules', number: 'Objekt II', kind: 'Gegenstand', title: 'Der Stabhalter ohne Stab', meta: 'Myrddin Draig - Eichenholz, Messing, Sternenstaub - undatiert', image: '', description: 'Der Halter steht leer, doch der Teppich darunter zeigt einen deutlichen Abdruck. Die Aufsicht behauptet, der zugeh&ouml;rige Stab sei nicht verschwunden, sondern lediglich anderweitig wichtig.', masterComment: 'Abwesenheit kann eine sehr pr&auml;zise Form der Anwesenheit sein. Diese Einsicht wird h&auml;ufig untersch&auml;tzt.' },
  { id: 'museum-artefakt-03', target: 'artifact-modules', number: 'Objekt III', kind: 'Konzept', title: 'Die gebundene M&ouml;glichkeit', meta: 'Myrddin Draig - Diagramm, Faden, stiller Widerstand - undatiert', image: '', description: 'Ein kleines Gestell aus F&auml;den und Zeichen h&auml;lt eine Idee in Form. Wer es zu lange betrachtet, meint eine Bewegung zu sehen, die kurz vor dem Denken beginnt.', masterComment: 'Nicht jede Erfindung muss sofort n&uuml;tzlich sein. Manche sind zun&auml;chst nur richtig.' },
  { id: 'museum-artefakt-04', target: 'artifact-modules', number: 'Objekt IV', kind: 'Apparatur', title: 'Apparat zur Messung unverdienter Zweifel', meta: 'Myrddin Draig - Kupfer, Glas, gereizte Pr&auml;zision - undatiert', image: '', description: 'Die Nadel dieser Apparatur zittert besonders stark, wenn sich Skeptiker n&auml;hern. Myrddin betrachtet das Ger&auml;t als eines seiner sozial n&uuml;tzlichsten Werke.', masterComment: 'Die Messung ist nicht ungenau. Die Zweifel sind es.' }
];

let modules = loadModules();
let editMode = false;
let activeModuleId = null;
let activeCommentThreadId = null;
let activeUnsubscribe = null;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function sanitizeRichHtml(value) {
  const template = document.createElement('template');
  template.innerHTML = String(value || '');
  const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV']);

  function cleanNode(node) {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;

      if (!allowedTags.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }

      const textAlign = child.style?.textAlign || '';
      Array.from(child.attributes).forEach(attribute => child.removeAttribute(attribute.name));
      if ((child.tagName === 'P' || child.tagName === 'DIV') && ['left', 'center', 'right'].includes(textAlign)) {
        child.style.textAlign = textAlign;
      }
      cleanNode(child);
    });
  }

  cleanNode(template.content);
  return template.innerHTML.trim();
}

function richTextToDisplayHtml(value) {
  const raw = String(value || '');
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeRichHtml(raw);
  return escapeHtml(raw).replace(/\n/g, '<br>');
}

function richTextToPlainText(value) {
  const template = document.createElement('template');
  template.innerHTML = richTextToDisplayHtml(value);
  return template.content.textContent.replace(/\s+/g, ' ').trim();
}

function normalizeImgurUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!/^https:\/\/(i\.)?imgur\.com\//i.test(raw)) return '';
  return raw;
}

function loadModules() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return defaultModules.map(item => ({ ...item }));
    const defaultIds = new Set(defaultModules.map(item => item.id));
    const mergedDefaults = defaultModules.map(item => ({ ...item, ...(saved.find(savedItem => savedItem.id === item.id) || {}) }));
    const customModules = saved.filter(savedItem => savedItem?.id && !defaultIds.has(savedItem.id));
    return [...mergedDefaults, ...customModules];
  } catch {
    return defaultModules.map(item => ({ ...item }));
  }
}

function saveModules() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
}

function getModule(id) {
  return modules.find(module => module.id === id);
}

function getNextModuleNumber(target) {
  const count = modules.filter(module => module.target === target).length + 1;
  return target === 'painting-modules' ? `Werk ${toRoman(count)}` : `Objekt ${toRoman(count)}`;
}

function toRoman(number) {
  const numerals = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let value = Math.max(1, Number(number) || 1);
  let result = '';
  numerals.forEach(([amount, numeral]) => {
    while (value >= amount) {
      result += numeral;
      value -= amount;
    }
  });
  return result;
}

function createNewModule(target) {
  const now = Date.now();
  const isPainting = target === 'painting-modules';
  const module = {
    id: `museum-${isPainting ? 'malerei' : 'artefakt'}-${now}`,
    target,
    number: getNextModuleNumber(target),
    kind: isPainting ? 'Malerei' : 'Artefakt',
    title: isPainting ? 'Die neu verh&uuml;llte Tafel' : 'Der neu bereitete Sockel',
    meta: isPainting ? 'Myrddin Draig - noch nicht katalogisiert' : 'Myrddin Draig - unter Aufsicht gestellt',
    image: '',
    description: isPainting
      ? 'Ein frischer Platz im Fl&uuml;gel der Bilder. Der Rahmen ist gesetzt, das Licht f&auml;llt bereits g&uuml;nstig, und irgendwo in Myrddins Archiv wartet die passende Offenbarung.'
      : 'Ein Sockel wurde frei ger&auml;umt und mit stiller Vorsicht markiert. Was hier ruhen wird, ist noch nicht benannt, doch die Aufsicht hat bereits Abstand genommen.',
    masterComment: isPainting
      ? 'Nicht jedes Werk muss sich dem Publikum sofort zeigen. Manche warten, bis das Publikum bereit ist.'
      : 'Ein leerer Sockel ist kein Mangel. Er ist eine Drohung an die Zukunft.'
  };
  modules.push(module);
  saveModules();
  renderAllCards();
  openModule(module.id);
  showStatus(isPainting ? 'Eine neue Tafel wurde eingeh&auml;ngt.' : 'Ein neuer Sockel wurde vorbereitet.', 'success');
}

function deleteActiveModule() {
  const module = getModule(activeModuleId);
  if (!module) return;
  const confirmed = window.confirm(`Soll "${richTextToPlainText(module.title) || module.number}" wirklich aus dem Saal entfernt werden?`);
  if (!confirmed) return;
  modules = modules.filter(item => item.id !== module.id);
  saveModules();
  closeModule();
  renderAllCards();
  showStatus('Die Tafel wurde aus der Sammlung entfernt.', 'success');
}

function displayImage(module) {
  return normalizeImgurUrl(module.image) || PLACEHOLDER_IMAGE;
}

function isPlaceholderImage(module) {
  return !normalizeImgurUrl(module.image);
}

function waitForFirebase() {
  if (window._fbReady && window._fb) return Promise.resolve();
  return new Promise(resolve => window.addEventListener('fb-ready', resolve, { once: true }));
}

function showStatus(message, type = 'info') {
  const toast = document.getElementById('status-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.type = type;
  toast.hidden = false;
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    toast.hidden = true;
    toast.textContent = '';
  }, 3600);
}

function renderCard(module, index) {
  return `
    <article class="entry-card ${isPlaceholderImage(module) ? 'entry-card-empty' : ''}" data-module-id="${module.id}" tabindex="0" style="--delay:${index * 0.05}s">
      <div class="card-image-wrap">
        <img src="${displayImage(module)}" alt="${escapeHtml(module.title)}" loading="lazy">
        <div class="card-vellum"></div>
        <div class="card-stamp">${escapeHtml(module.kind)}</div>
      </div>
      <div class="card-body">
        <div class="card-number">${escapeHtml(module.number)}</div>
        <h3>${escapeHtml(module.title)}</h3>
        <p class="card-meta">${escapeHtml(module.meta)}</p>
        <p class="card-preview">${escapeHtml(richTextToPlainText(module.description))}</p>
      </div>
      <div class="card-footer">
        <span>Betrachten</span>
        <span class="card-sigil">*</span>
      </div>
    </article>
  `;
}

function renderAllCards() {
  document.getElementById('painting-modules').innerHTML = modules
    .filter(module => module.target === 'painting-modules')
    .map(renderCard)
    .join('');
  document.getElementById('artifact-modules').innerHTML = modules
    .filter(module => module.target === 'artifact-modules')
    .map(renderCard)
    .join('');

  document.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', () => openModule(card.dataset.moduleId));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter') openModule(card.dataset.moduleId);
    });
  });
}

function renderDetail(module) {
  const editPanel = editMode ? renderEditPanel(module) : '';
  return `
    <div class="book-spread">
      <section class="book-page art-page">
        <div class="detail-image-frame">
          <img src="${displayImage(module)}" alt="${escapeHtml(module.title)}">
          ${isPlaceholderImage(module) ? '<div class="placeholder-ribbon">Noch verh&uuml;llt</div>' : ''}
        </div>
        <div class="detail-caption">${escapeHtml(module.number)} - ${escapeHtml(module.kind)}</div>
      </section>
      <section class="book-page text-page">
        <div class="section-kicker">Archivblatt</div>
        <h2 id="detail-title">${escapeHtml(module.title)}</h2>
        <div class="detail-meta">${escapeHtml(module.meta)}</div>
        <div class="detail-description">${richTextToDisplayHtml(module.description)}</div>
        <div class="master-comment">
          <img src="https://i.imgur.com/yNfM9GJ.png" alt="Myrddin Draig">
          <div>
            <div class="master-comment-name">Myrddin Draig notiert</div>
            <div class="master-comment-text">${richTextToDisplayHtml(module.masterComment)}</div>
          </div>
        </div>
        ${editPanel}
      </section>
    </div>
    <section class="detail-guestbook">
      <div class="guestbook-title-row">
        <div>
          <div class="section-kicker">Werkbuch</div>
          <h3>Stimmen am Sockel</h3>
        </div>
        <button class="add-comment-btn" type="button" id="open-comment-form">Stimme hinterlassen</button>
      </div>
      <div class="comment-list" id="detail-comments">
        <div class="comment-loading">Der Schreiber schl&auml;gt das Werkbuch auf...</div>
      </div>
    </section>
  `;
}

function renderEditPanel(module) {
  return `
    <form class="edit-panel" id="edit-panel">
      <div class="section-kicker">Kuratorenpult</div>
      <label>Titel<input name="title" value="${escapeHtml(module.title)}"></label>
      <label>Meta<input name="meta" value="${escapeHtml(module.meta)}"></label>
      <label>Bildtafel<input name="image" value="${escapeHtml(module.image || '')}" placeholder="https://i.imgur.com/..."></label>
      <div class="rich-field">
        <div class="rich-label">Archivtext</div>
        ${renderRichToolbar('description-editor')}
        <div class="rich-editor" id="description-editor" contenteditable="true" data-field="description">${richTextToDisplayHtml(module.description)}</div>
      </div>
      <div class="rich-field">
        <div class="rich-label">Randnotiz des Meisters</div>
        ${renderRichToolbar('master-comment-editor')}
        <div class="rich-editor" id="master-comment-editor" contenteditable="true" data-field="masterComment">${richTextToDisplayHtml(module.masterComment)}</div>
      </div>
      <div class="edit-panel-actions">
        <button type="submit">Tafel versiegeln</button>
        <button class="delete-module-btn" type="button" id="delete-module-btn">Aus der Sammlung entfernen</button>
      </div>
    </form>
  `;
}

function renderRichToolbar(editorId) {
  return `
    <div class="rich-toolbar" data-editor="${editorId}">
      <button type="button" data-command="bold" title="Fett"><strong>B</strong></button>
      <button type="button" data-command="italic" title="Kursiv"><em>I</em></button>
      <button type="button" data-command="underline" title="Unterstrichen"><u>U</u></button>
      <span class="rich-separator"></span>
      <button type="button" data-command="justifyLeft" title="Linksb&uuml;ndig">L</button>
      <button type="button" data-command="justifyCenter" title="Zentriert">C</button>
      <button type="button" data-command="justifyRight" title="Rechtsb&uuml;ndig">R</button>
    </div>
  `;
}

function openModule(moduleId) {
  const module = getModule(moduleId);
  if (!module) return;
  activeModuleId = moduleId;
  const overlay = document.getElementById('module-overlay');
  document.getElementById('detail-content').innerHTML = renderDetail(module);
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  document.getElementById('open-comment-form').addEventListener('click', () => openCommentForm(moduleId));
  document.getElementById('edit-panel')?.addEventListener('submit', saveModuleFromForm);
  document.getElementById('delete-module-btn')?.addEventListener('click', deleteActiveModule);
  bindRichEditorControls();
  subscribeDetailComments(moduleId);
}

function closeModule() {
  document.getElementById('module-overlay').classList.remove('active');
  document.getElementById('module-overlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
  activeModuleId = null;
  stopDetailComments();
}

function saveModuleFromForm(event) {
  event.preventDefault();
  const module = getModule(activeModuleId);
  if (!module) return;
  const data = new FormData(event.currentTarget);
  const image = String(data.get('image') || '').trim();
  if (image && !normalizeImgurUrl(image)) {
    showStatus('Die Bildtafel verlangt eine g&uuml;ltige Imgur-Adresse.', 'error');
    return;
  }
  module.title = String(data.get('title') || '').trim() || module.title;
  module.meta = String(data.get('meta') || '').trim() || module.meta;
  module.image = image;
  const descriptionHtml = sanitizeRichHtml(document.getElementById('description-editor')?.innerHTML || '');
  const masterCommentHtml = sanitizeRichHtml(document.getElementById('master-comment-editor')?.innerHTML || '');
  module.description = descriptionHtml || module.description;
  module.masterComment = masterCommentHtml || module.masterComment;
  saveModules();
  renderAllCards();
  openModule(module.id);
  showStatus('Die Tafel wurde neu beschriftet.', 'success');
}

function bindRichEditorControls() {
  document.querySelectorAll('.rich-toolbar button[data-command]').forEach(button => {
    button.addEventListener('click', () => {
      const toolbar = button.closest('.rich-toolbar');
      const editor = document.getElementById(toolbar?.dataset.editor || '');
      if (!editor) return;
      editor.focus();
      document.execCommand(button.dataset.command, false, null);
      editor.focus();
    });
  });

  document.querySelectorAll('.rich-editor').forEach(editor => {
    editor.addEventListener('paste', event => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
  });
}

function stopDetailComments() {
  if (typeof activeUnsubscribe === 'function') activeUnsubscribe();
  activeUnsubscribe = null;
}

async function subscribeDetailComments(threadId) {
  stopDetailComments();
  const list = document.getElementById('detail-comments');
  if (!list) return;
  try {
    await waitForFirebase();
    activeUnsubscribe = window._fb.subscribeComments(threadId, comments => renderComments(comments), () => {
      list.innerHTML = '<div class="comment-empty">Der Schreiber erreicht das Werkbuch im Augenblick nicht.</div>';
    });
  } catch (error) {
    console.error(error);
    list.innerHTML = '<div class="comment-empty">Das Werkbuch bleibt vorerst verschlossen.</div>';
  }
}

function renderComments(comments) {
  const list = document.getElementById('detail-comments');
  if (!list) return;
  const visibleComments = comments.filter(comment => !comment.narrator);
  if (!visibleComments.length) {
    list.innerHTML = '<div class="comment-empty">Noch hat niemand am Sockel verweilt und eine Stimme hinterlassen.</div>';
    return;
  }
  list.innerHTML = visibleComments.map(renderComment).join('');
}

function renderComment(comment, index) {
  const name = comment.charName || 'Museumsbesucher';
  const title = comment.charTitle || 'Gast des Hauses';
  const portrait = normalizeImgurUrl(comment.portrait);
  const avatar = portrait
    ? `<img class="comment-avatar" src="${escapeHtml(portrait)}" alt="${escapeHtml(name)}" loading="lazy">`
    : `<div class="comment-avatar-fallback">${escapeHtml(name.slice(0, 1).toUpperCase() || '?')}</div>`;

  return `
    <article class="comment-entry ${index % 2 ? 'right' : 'left'}">
      ${avatar}
      <div class="comment-bubble">
        <div class="comment-name">${escapeHtml(name)}</div>
        <div class="comment-title">${escapeHtml(title)}</div>
        <div class="comment-text">${escapeHtml(comment.text || '')}</div>
      </div>
    </article>
  `;
}

function openCommentForm(threadId) {
  activeCommentThreadId = threadId;
  const overlay = document.getElementById('comment-overlay');
  const form = document.getElementById('comment-form');
  form.reset();
  document.getElementById('comment-error').textContent = '';
  updateAvatarPreview('');
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  form.querySelector('input[name="name"]').focus();
}

function closeCommentForm() {
  document.getElementById('comment-overlay').classList.remove('active');
  document.getElementById('comment-overlay').setAttribute('aria-hidden', 'true');
  activeCommentThreadId = null;
}

function updateAvatarPreview(value) {
  const preview = document.getElementById('avatar-preview');
  const img = normalizeImgurUrl(value);
  preview.innerHTML = img ? `<img src="${escapeHtml(img)}" alt="Siegelbild">` : '?';
}

async function submitComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const error = document.getElementById('comment-error');
  const data = new FormData(form);
  const code = String(data.get('code') || '').trim();
  const name = String(data.get('name') || '').trim();
  const title = String(data.get('title') || '').trim();
  const portraitInput = String(data.get('portrait') || '').trim();
  const portrait = normalizeImgurUrl(portraitInput);
  const text = String(data.get('text') || '').trim();

  error.textContent = '';
  if (code !== COMMENT_CODE) {
    error.textContent = 'Das Siegelwort wird vom Schreiber nicht anerkannt.';
    return;
  }
  if (!name || !text) {
    error.textContent = 'Name und Stimme muessen leserlich hinterlassen werden.';
    return;
  }
  if (portraitInput && !portrait) {
    error.textContent = 'Das Siegelbild muss aus dem Imgur-Archiv stammen.';
    return;
  }

  try {
    button.disabled = true;
    await waitForFirebase();
    await window._fb.addComment(activeCommentThreadId, name, title, portrait, text, COMMENT_CODE, false);
    closeCommentForm();
    showStatus('Die Stimme wurde ins Werkbuch eingetragen.', 'success');
  } catch (submitError) {
    console.error(submitError);
    error.textContent = 'Die Stimme konnte nicht ins Werkbuch gesetzt werden.';
  } finally {
    button.disabled = false;
  }
}

function setEditMode(nextValue) {
  editMode = nextValue;
  document.body.classList.toggle('is-editing', editMode);
  document.getElementById('edit-toggle').textContent = editMode ? 'Ansicht' : 'Bearbeiten';
  if (activeModuleId) openModule(activeModuleId);
}

function bindGlobalEvents() {
  document.getElementById('detail-close').addEventListener('click', closeModule);
  document.getElementById('comment-close').addEventListener('click', closeCommentForm);
  document.getElementById('comment-form').addEventListener('submit', submitComment);
  document.querySelector('#comment-form input[name="portrait"]').addEventListener('input', event => updateAvatarPreview(event.target.value));
  document.getElementById('edit-toggle').addEventListener('click', () => setEditMode(!editMode));
  document.querySelectorAll('[data-add-module]').forEach(button => {
    button.addEventListener('click', () => createNewModule(button.dataset.addModule));
  });
  document.getElementById('module-overlay').addEventListener('click', event => {
    if (event.target.id === 'module-overlay') closeModule();
  });
  document.getElementById('comment-overlay').addEventListener('click', event => {
    if (event.target.id === 'comment-overlay') closeCommentForm();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (document.getElementById('comment-overlay').classList.contains('active')) closeCommentForm();
    else if (document.getElementById('module-overlay').classList.contains('active')) closeModule();
  });
}

renderAllCards();
bindGlobalEvents();
