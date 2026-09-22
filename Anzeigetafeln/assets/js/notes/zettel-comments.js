(function(){
  'use strict';
  const selectedAvatars = new WeakMap();

  function rt(){ return window.TafelRuntime; }
  function state(){ return rt().state(); }
  function esc(value){ return rt().esc(value); }

  function zettelById(id){
    return state().zettel.find(z => z.id === id);
  }

  function commentsOf(zettel){
    if(!Array.isArray(zettel.comments)) zettel.comments = [];
    return zettel.comments;
  }

  function normalizeUrl(value){
    return window.TafelNoticeMediaModel.imageUrl(value);
  }

  function cssEscape(value){
    if(window.CSS?.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function renderAvatar(comment){
    const avatar = normalizeUrl(comment.avatar);
    if(avatar || comment.media?.avatar?.kind === 'character'){
      return window.TafelNoticeMediaModel.render(comment, 'avatar', {label:comment.name || 'Avatar'});
    }
    const name = String(comment.name || '').trim();
    return `<span>${esc(name ? name.slice(0, 1).toUpperCase() : '?')}</span>`;
  }

  function renderComment(comment, zettelId){
    const name = String(comment.name || '').trim() || 'Anonym';
    const text = String(comment.text || '').trim();
    const time = comment.createdAt ? new Date(comment.createdAt).toLocaleString('de-DE') : '';
    const canDelete = rt().canEditZettel?.();
    return `<article class="zettel-comment" data-comment-id="${esc(comment.id)}">
      <div class="zettel-comment-avatar">${renderAvatar(comment)}</div>
      <div class="zettel-comment-body">
        <div class="zettel-comment-meta">
          <strong>${esc(name)}</strong>
          ${time ? `<span>${esc(time)}</span>` : ''}
          ${canDelete ? `<button type="button" data-action="zettel-comment-delete" data-zettel-id="${esc(zettelId)}" data-comment-id="${esc(comment.id)}">Entfernen</button>` : ''}
        </div>
        <p>${esc(text).replace(/\n/g, '<br>')}</p>
      </div>
    </article>`;
  }

  function render(zettel){
    const comments = commentsOf(zettel);
    return `<section class="zettel-comments" data-zettel-comments="${esc(zettel.id)}">
      <div class="zettel-comments-head">
        <h3>Kommentare</h3>
        <span>${comments.length} Eintrag${comments.length === 1 ? '' : 'e'}</span>
      </div>
      <div class="zettel-comments-list">
        ${comments.length
          ? comments.map(comment => renderComment(comment, zettel.id)).join('')
          : '<p class="zettel-comments-empty">Noch keine Kommentare vorhanden.</p>'}
      </div>
      <div class="zettel-comment-compose">
        <div class="notice-comment-image"><input type="url" class="e-inp" data-zettel-comment-avatar placeholder="Avatarbild-URL, optional"><button type="button" class="s-btn s-cancel" data-action="zettel-comment-image" data-zettel-id="${esc(zettel.id)}">Bild wählen</button></div>
        <input type="text" class="e-inp" data-zettel-comment-name placeholder="Name, optional">
        <textarea class="e-ta" rows="3" data-zettel-comment-text placeholder="Kommentar hinterlassen..."></textarea>
        <button type="button" class="s-btn s-save" data-action="zettel-comment-add" data-zettel-id="${esc(zettel.id)}">Kommentar eintragen</button>
      </div>
    </section>`;
  }

  function refresh(zettel){
    const node = document.querySelector(`[data-zettel-comments="${cssEscape(zettel.id)}"]`);
    if(node) node.outerHTML = render(zettel);
  }

  function chooseImage(zettelId){
    const root = document.querySelector(`[data-zettel-comments="${cssEscape(zettelId)}"]`);
    if(!root) return;
    const input = root.querySelector('[data-zettel-comment-avatar]');
    window.TafelNoticeMediaPicker.open({value:input.value, title:'Kommentarbild wählen', onSelect:item => {
      if(!root.isConnected) return;
      input.value = item?.src || '';
      selectedAvatars.set(root, item);
      if(item?.kind === 'character') root.querySelector('[data-zettel-comment-name]').value = item.name;
    }});
  }

  function add(zettelId){
    const zettel = zettelById(zettelId);
    if(!zettel) return;
    const root = document.querySelector(`[data-zettel-comments="${cssEscape(zettelId)}"]`);
    if(!root) return;
    const text = root.querySelector('[data-zettel-comment-text]')?.value.trim() || '';
    if(!text){
      rt().toast('Kommentartext fehlt');
      return;
    }
    const comment = {
      id: rt().uid(),
      avatar: normalizeUrl(root.querySelector('[data-zettel-comment-avatar]')?.value),
      name: String(root.querySelector('[data-zettel-comment-name]')?.value || '').trim(),
      text,
      createdAt: Date.now()
    };
    const avatar = selectedAvatars.get(root);
    if(avatar && normalizeUrl(avatar.src) === comment.avatar) window.TafelNoticeMediaModel.apply(comment, 'avatar', avatar);
    commentsOf(zettel).push(comment);
    rt().save();
    refresh(zettel);
    rt().toast('Kommentar gespeichert');
  }

  function remove(zettelId, commentId){
    const zettel = zettelById(zettelId);
    if(!zettel || !rt().canEditZettel?.()) return;
    zettel.comments = commentsOf(zettel).filter(comment => comment.id !== commentId);
    rt().save();
    refresh(zettel);
    rt().toast('Kommentar entfernt');
  }

  window.TafelZettelComments = {
    render,
    chooseImage,
    add,
    remove
  };
})();
