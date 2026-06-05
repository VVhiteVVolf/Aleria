(function(){
  const runtime = window.KartoRuntime;
  let sessionEditId = null;
  let notesTimer = null;

  function state(){
    return runtime.state();
  }

  function dmState(){
    const appState = state();
    if(!appState.dm) appState.dm = {sessions:[], notes:'', groupStatus:{}};
    appState.dm.sessions = appState.dm.sessions || [];
    appState.dm.groupStatus = appState.dm.groupStatus || {};
    return appState.dm;
  }

  function travelGroups(){
    return runtime.travelGroups();
  }

  function load(){
    const dm = dmState();
    const notes = document.getElementById('dm-notes');
    if(notes) notes.value = dm.notes || '';
    renderSessions();
  }

  function toggleMenu(){
    const menu = document.getElementById('dm-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }

  function closeMenuIfOutside(target){
    const wrap = document.getElementById('dm-btn-wrap');
    if(wrap && !wrap.contains(target)) document.getElementById('dm-menu').style.display = 'none';
  }

  function togglePanel(){
    const panel = document.getElementById('dm-panel');
    const open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    document.getElementById('btn-dm').classList.toggle('on', open);
    if(open) runtime.ensureToolsSidebarOpen();
    if(open) renderSessions();
  }

  function renderSessions(){
    const element = document.getElementById('dm-sessions');
    if(!element) return;
    const sessions = dmState().sessions || [];
    if(!sessions.length){
      element.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.55;text-align:center;padding:.4rem;">Noch keine Sitzungen — ＋ drücken</div>';
      return;
    }

    element.innerHTML = '';
    [...sessions].reverse().forEach((session, reverseIndex) => {
      const index = sessions.length - 1 - reverseIndex;
      const groups = travelGroups().filter(group => session.groups?.includes(group.id));
      const item = document.createElement('div');
      item.className = 'dm-session';
      item.dataset.action = 'open-dm-session';
      item.dataset.sessionId = session.id;
      item.innerHTML = `<div class="dm-session-hdr">
        <span class="dm-sess-num">S${index + 1}</span>
        <span class="dm-sess-ttl">${runtime.esc(session.name || 'Unbenannte Sitzung')}</span>
        <span class="dm-sess-date">${session.date ? new Date(session.date + 'T12:00').toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'2-digit'}) : ''}</span>
      </div>
      ${session.igdate ? `<div style="font-size:var(--fs-sm);color:var(--gold);opacity:.65;font-style:italic;margin:.08rem 0 .1rem;">⚔ ${runtime.esc(session.igdate)}</div>` : ''}
      ${session.notes ? `<div class="dm-sess-note">${runtime.esc(session.notes)}</div>` : ''}
      ${groups.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:.25rem;">${groups.map(group => `<span class="dm-sess-tag" style="color:${group.color};border-color:${group.color}55;">${group.icon && !group.iconIsImg ? group.icon : ''} ${runtime.esc(group.name)}</span>`).join('')}</div>` : ''}`;
      element.appendChild(item);
    });
  }

  function addSession(){
    sessionEditId = null;
    const nextNumber = dmState().sessions.length + 1;
    document.getElementById('dmsess-mo-ttl').textContent = 'Neue Sitzung';
    document.getElementById('dmsess-name').value = 'Session ' + nextNumber + ' — ';
    document.getElementById('dmsess-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('dmsess-igdate').value = '';
    document.getElementById('dmsess-notes').value = '';
    document.getElementById('dmsess-del-btn').style.display = 'none';
    renderSessionGroups(null);
    document.getElementById('dmsess-mo').classList.add('open');
    setTimeout(() => {
      const name = document.getElementById('dmsess-name');
      name.focus();
      name.setSelectionRange(name.value.length, name.value.length);
    }, 60);
  }

  function openSession(sessionId){
    const session = dmState().sessions.find(item => item.id === sessionId);
    if(!session) return;
    sessionEditId = sessionId;
    document.getElementById('dmsess-mo-ttl').textContent = 'Sitzung bearbeiten';
    document.getElementById('dmsess-name').value = session.name || '';
    document.getElementById('dmsess-date').value = session.date || '';
    document.getElementById('dmsess-igdate').value = session.igdate || '';
    document.getElementById('dmsess-notes').value = session.notes || '';
    document.getElementById('dmsess-del-btn').style.display = 'block';
    renderSessionGroups(session.groups || []);
    document.getElementById('dmsess-mo').classList.add('open');
  }

  function renderSessionGroups(selected){
    const wrap = document.getElementById('dmsess-groups');
    wrap.innerHTML = '';
    travelGroups().forEach(group => {
      const on = selected ? selected.includes(group.id) : false;
      const button = document.createElement('button');
      button.className = 'sess-grp-toggle' + (on ? ' on' : '');
      button.dataset.action = 'toggle-dm-session-group';
      button.innerHTML = (group.iconIsImg ? '' : group.icon + ' ') + runtime.esc(group.name);
      wrap.appendChild(button);
    });
  }

  function toggleSessionGroup(element){
    element.classList.toggle('on');
  }

  function saveSession(){
    const dm = dmState();
    const name = document.getElementById('dmsess-name').value.trim();
    const date = document.getElementById('dmsess-date').value;
    const igdate = document.getElementById('dmsess-igdate').value.trim();
    const notes = document.getElementById('dmsess-notes').value.trim();
    const groups = [...document.querySelectorAll('#dmsess-groups .sess-grp-toggle.on')]
      .map((_, index) => travelGroups()[index]?.id)
      .filter(Boolean);

    if(sessionEditId){
      const session = dm.sessions.find(item => item.id === sessionEditId);
      if(session) Object.assign(session, {name, date, igdate, notes, groups});
    } else {
      dm.sessions.push({id:runtime.uid(), name, date, igdate, notes, groups});
    }
    runtime.closeModal('dmsess-mo');
    renderSessions();
    runtime.save();
    runtime.toast('✓ Sitzung gespeichert');
  }

  function deleteSession(){
    if(!sessionEditId) return;
    if(!confirm('Sitzung wirklich löschen?')) return;
    const dm = dmState();
    dm.sessions = dm.sessions.filter(item => item.id !== sessionEditId);
    state().dm = dm;
    runtime.closeModal('dmsess-mo');
    renderSessions();
    runtime.save();
    runtime.toast('Sitzung gelöscht');
  }

  function saveNotes(){
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      dmState().notes = document.getElementById('dm-notes').value;
      runtime.save();
    }, 1200);
  }

  function openGroupStatus(){
    const dm = dmState();
    const body = document.getElementById('dmstat-body');
    body.innerHTML = '';
    travelGroups().forEach(group => {
      const status = dm.groupStatus[group.id] || {};
      const size = Math.max(18, runtime.travelIconSize() || 22);
      const iconHtml = group.iconIsImg && group.icon
        ? `<img src="${group.icon}" style="width:${size}px;height:${size}px;object-fit:contain;"/>`
        : `<span style="font-size:${size}px">${group.icon || '📍'}</span>`;
      const hpPct = status.hp && status.hpMax ? Math.round(status.hp / status.hpMax * 100) : 100;
      const hpColor = hpPct > 60 ? '#3a8a3a' : hpPct > 30 ? '#c07820' : '#a03030';
      body.innerHTML += `<div class="stat-card" data-gid="${group.id}">
        <div class="stat-card-hdr">
          <div style="width:${size}px;height:${size}px;background:${group.color};border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${iconHtml}</div>
          <span class="stat-name">${runtime.esc(group.name)}</span>
        </div>
        <div class="stat-row">
          <span class="stat-lbl">💙 HP</span>
          <input class="stat-inp" type="number" min="0" placeholder="aktuell" value="${status.hp || ''}" data-f="hp"/>
          <span style="opacity:.3;font-size:var(--fs-sm)">/</span>
          <input class="stat-inp" type="number" min="0" placeholder="max" value="${status.hpMax || ''}" data-f="hpMax"/>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${hpPct}%;background:${hpColor}"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-lbl">📍 Aufenthaltsort</span>
          <input class="stat-inp wide" type="text" placeholder="z.B. Gasthaus zum Roten Hirsch…" value="${runtime.esc(status.location || '')}" data-f="location"/>
        </div>
        <div class="stat-row">
          <span class="stat-lbl">🎒 Ressourcen</span>
          <input class="stat-inp wide" type="text" placeholder="Gold, Vorräte, Zaubertränke…" value="${runtime.esc(status.resources || '')}" data-f="resources"/>
        </div>
        <div class="stat-row">
          <span class="stat-lbl">📝 Status-Notiz</span>
          <input class="stat-inp wide" type="text" placeholder="Erschöpft, verwundet, auf der Flucht…" value="${runtime.esc(status.note || '')}" data-f="note"/>
        </div>
      </div>`;
    });
    if(!travelGroups().length) body.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.65;text-align:center;padding:1rem;">Keine Gruppen vorhanden</div>';
    document.getElementById('dmstat-mo').classList.add('open');
  }

  function saveStatus(){
    const dm = dmState();
    document.querySelectorAll('#dmstat-body .stat-card').forEach(card => {
      const groupId = card.dataset.gid;
      if(!groupId) return;
      const status = {};
      card.querySelectorAll('[data-f]').forEach(input => {
        status[input.dataset.f] = input.value;
      });
      if(status.hp) status.hp = +status.hp;
      if(status.hpMax) status.hpMax = +status.hpMax;
      dm.groupStatus[groupId] = status;
    });
    runtime.closeModal('dmstat-mo');
    runtime.save();
    runtime.toast('✓ Status gespeichert');
  }

  function openDiary(){
    const dm = dmState();
    const body = document.getElementById('dmdiary-body');
    body.innerHTML = '';
    const sessions = dm.sessions || [];
    if(!sessions.length){
      body.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.65;text-align:center;padding:1.5rem;">Noch keine Sitzungen — füge zuerst Sitzungen hinzu.</div>';
      document.getElementById('dmdiary-mo').classList.add('open');
      return;
    }

    sessions.forEach((session, index) => {
      const groups = travelGroups().filter(group => session.groups?.includes(group.id));
      const div = document.createElement('div');
      div.className = 'diary-entry';
      let html = `<div class="diary-session-hdr">Session ${index + 1}${session.name ? ' — ' + runtime.esc(session.name) : ''}</div>`;
      const dates = [];
      if(session.date) dates.push(new Date(session.date + 'T12:00').toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long', year:'numeric'}));
      if(session.igdate) dates.push('⚔ ' + runtime.esc(session.igdate));
      if(dates.length) html += `<div class="diary-date">${dates.join(' · ')}</div>`;
      if(session.notes) html += `<div class="diary-text">${runtime.esc(session.notes)}</div>`;
      groups.forEach(group => {
        if(!group.route?.length) return;
        const calc = runtime.travelScale() && group.route.length > 1 ? runtime.calcTravelRoute(group) : null;
        const status = dm.groupStatus[group.id] || {};
        html += '<div class="diary-route">';
        html += `<strong>${group.icon && !group.iconIsImg ? group.icon + ' ' : ''}${runtime.esc(group.name)}</strong>`;
        if(calc) html += ` · ${calc.totalKm.toFixed(1)} km · ${runtime.formatTravelHours(calc.totalH)}`;
        if(status.location) html += `<br>📍 ${runtime.esc(status.location)}`;
        if(status.resources) html += `<br>🎒 ${runtime.esc(status.resources)}`;
        if(status.note) html += `<br>📝 ${runtime.esc(status.note)}`;
        const events = group.route.filter(point => point.event && point.event.type !== 'none');
        if(events.length){
          const eventInfo = runtime.travelEventInfo();
          html += '<br><span class="diary-event">' + events.map(point => {
            const info = eventInfo[point.event.type];
            return `${info?.ic || ''} ${point.event.name || info?.label || ''}`;
          }).join(' → ') + '</span>';
        }
        html += '</div>';
      });
      div.innerHTML = html;
      body.appendChild(div);
    });
    document.getElementById('dmdiary-mo').classList.add('open');
  }

  function exportDiary(){
    const dm = dmState();
    let text = `REISE-TAGEBUCH — ${state().regionTitle || 'Karte'}\n${'═'.repeat(50)}\n\n`;
    const sessions = dm.sessions || [];
    sessions.forEach((session, index) => {
      text += `SESSION ${index + 1}${session.name ? ' — ' + session.name : ''}\n${'-'.repeat(40)}\n`;
      if(session.date) text += `Datum: ${new Date(session.date + 'T12:00').toLocaleDateString('de-DE')}\n`;
      if(session.igdate) text += `In-Game: ${session.igdate}\n`;
      if(session.notes) text += `\n${session.notes}\n`;
      const groups = travelGroups().filter(group => session.groups?.includes(group.id));
      groups.forEach(group => {
        if(!group.route?.length) return;
        const calc = runtime.travelScale() && group.route.length > 1 ? runtime.calcTravelRoute(group) : null;
        text += `\n[${group.name}]`;
        if(calc) text += ` ${calc.totalKm.toFixed(1)} km · ${runtime.formatTravelHours(calc.totalH)}`;
        text += '\n';
      });
      text += '\n';
    });
    if(dm.notes) text += `\nDM-NOTIZEN\n${'-'.repeat(40)}\n${dm.notes}\n`;
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state().regionTitle || 'Karte').replace(/\s+/g, '-') + '_Tagebuch_' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    runtime.toast('✓ Tagebuch exportiert');
  }

  document.addEventListener('click', event => closeMenuIfOutside(event.target));
  document.getElementById('dmsess-mo').addEventListener('click', event => {
    if(event.target === document.getElementById('dmsess-mo')) runtime.closeModal('dmsess-mo');
  });
  document.getElementById('dmstat-mo').addEventListener('click', event => {
    if(event.target === document.getElementById('dmstat-mo')) runtime.closeModal('dmstat-mo');
  });
  document.getElementById('dmdiary-mo').addEventListener('click', event => {
    if(event.target === document.getElementById('dmdiary-mo')) runtime.closeModal('dmdiary-mo');
  });

  window.KartoDmTools = {
    load,
    toggleMenu,
    togglePanel,
    renderSessions,
    addSession,
    openSession,
    toggleSessionGroup,
    saveSession,
    deleteSession,
    saveNotes,
    openGroupStatus,
    saveStatus,
    openDiary,
    exportDiary,
  };

  window.dmLoad = load;
  window.toggleDmMenu = toggleMenu;
  window.toggleDmPanel = togglePanel;
  window.dmRenderSessions = renderSessions;
  window.dmAddSession = addSession;
  window.dmOpenSession = openSession;
  window.dmSaveSession = saveSession;
  window.dmDelSession = deleteSession;
  window.dmSaveNotes = saveNotes;
  window.openGroupStatus = openGroupStatus;
  window.dmSaveStatus = saveStatus;
  window.openDiary = openDiary;
  window.dmExportDiary = exportDiary;
})();
