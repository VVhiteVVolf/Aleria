(function(){
  'use strict';

  function esc(value){
    return window.TafelRuntime.esc(value);
  }

  function renderDiary({body, sessions, groups, groupStatus, scale, regionTitle, formatHours, calcRoute}){
    body.innerHTML = '';
    if(!sessions.length){
      body.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:var(--fs-sm);opacity:.65;text-align:center;padding:1.5rem;">Noch keine Sitzungen — füge zuerst Sitzungen hinzu.</div>';
      return;
    }

    sessions.forEach((session, index) => {
      const sessionGroups = groups.filter(group => session.groups?.includes(group.id));
      const div = document.createElement('div');
      div.className = 'diary-entry';
      let html = `<div class="diary-session-hdr">Session ${index + 1}${session.name ? ' — ' + esc(session.name) : ''}</div>`;
      const dates = [];
      if(session.date) dates.push(new Date(session.date + 'T12:00').toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long', year:'numeric'}));
      if(session.igdate) dates.push('⚔ ' + esc(session.igdate));
      if(dates.length) html += `<div class="diary-date">${dates.join(' · ')}</div>`;
      if(session.notes) html += `<div class="diary-text">${esc(session.notes)}</div>`;

      sessionGroups.forEach(group => {
        if(!group.route?.length) return;
        const calc = scale && group.route.length > 1 ? calcRoute(group) : null;
        const status = groupStatus[group.id] || {};
        html += `<div class="diary-route">`;
        html += `<strong>${group.icon && !group.iconIsImg ? group.icon + ' ' : ''}${esc(group.name)}</strong>`;
        if(calc) html += ` · ${calc.totalKm.toFixed(1)} km · ${formatHours(calc.totalH)}`;
        if(status.location) html += `<br>📍 ${esc(status.location)}`;
        if(status.resources) html += `<br>🎒 ${esc(status.resources)}`;
        if(status.note) html += `<br>📝 ${esc(status.note)}`;
        const events = group.route.filter(point => point.event && point.event.type !== 'none');
        if(events.length){
          html += `<br><span class="diary-event">` + events.map(point => {
            const info = window.TafelLsbConfig.EVENT_INFO[point.event.type];
            return `${info?.ic || ''} ${point.event.name || info?.label || ''}`;
          }).join(' → ') + `</span>`;
        }
        html += `</div>`;
      });

      div.innerHTML = html;
      body.appendChild(div);
    });
  }

  function buildExportText({sessions, groups, notes, scale, regionTitle, formatHours, calcRoute}){
    let text = `REISE-TAGEBUCH — ${regionTitle || 'Karte'}\n${'═'.repeat(50)}\n\n`;
    sessions.forEach((session, index) => {
      text += `SESSION ${index + 1}${session.name ? ' — ' + session.name : ''}\n${'-'.repeat(40)}\n`;
      if(session.date) text += `Datum: ${new Date(session.date + 'T12:00').toLocaleDateString('de-DE')}\n`;
      if(session.igdate) text += `In-Game: ${session.igdate}\n`;
      if(session.notes) text += `\n${session.notes}\n`;
      const sessionGroups = groups.filter(group => session.groups?.includes(group.id));
      sessionGroups.forEach(group => {
        if(!group.route?.length) return;
        const calc = scale && group.route.length > 1 ? calcRoute(group) : null;
        text += `\n[${group.name}]`;
        if(calc) text += ` ${calc.totalKm.toFixed(1)} km · ${formatHours(calc.totalH)}`;
        text += '\n';
      });
      text += '\n';
    });
    if(notes) text += `\nDM-NOTIZEN\n${'-'.repeat(40)}\n${notes}\n`;
    return text;
  }

  window.TafelLsbDiary = {
    renderDiary,
    buildExportText
  };
})();
