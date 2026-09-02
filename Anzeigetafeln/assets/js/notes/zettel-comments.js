(function(){
  'use strict';

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
    const url = String(value || '').trim();
    return /^https?:\/\//i.test(url) ? url : '';
  }

  function cssEscape(value){
    if(window.CSS?.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function renderAvatar(comment){
    const avatar = normalizeUrl(comment.avatar);
    if(avatar){
      return `<img src="${esc(avatar)}" alt="" loading="lazy" decoding="async" data-image-fallback="hide-self">`;
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
        <input type="url" class="e-inp" data-zettel-comment-avatar placeholder="Avatarbild-URL, optional">
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
    commentsOf(zettel).push({
      id: rt().uid(),
      avatar: normalizeUrl(root.querySelector('[data-zettel-comment-avatar]')?.value),
      name: String(root.querySelector('[data-zettel-comment-name]')?.value || '').trim(),
      text,
      createdAt: Date.now()
    });
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
    add,
    remove
  };
})();
