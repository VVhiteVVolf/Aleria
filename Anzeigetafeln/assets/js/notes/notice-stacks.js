(function () {
  'use strict';

  function groups(notices = [], { includeSecret = false } = {}) {
    const visible = notices.filter(notice => includeSecret || !notice.secret);
    const referenced = new Set(visible.map(notice => notice.stackId).filter(Boolean));
    const grouped = new Map();
    visible.forEach((notice, index) => {
      const stack = notice.stackId || (referenced.has(notice.id) ? notice.id : '');
      const key = stack ? `stack:${stack}` : `notice:${notice.id}`;
      if (!grouped.has(key)) grouped.set(key, { key, notices: [] });
      grouped.get(key).notices.push({ notice, index });
    });
    return [...grouped.values()].map(group => ({
      key: group.key,
      notices: group.notices.sort((a, b) => (Number(a.notice.stackOrder) || 0) - (Number(b.notice.stackOrder) || 0) || a.index - b.index).map(item => item.notice),
    }));
  }

  function members(notices, id, options) {
    return groups(notices, options).find(group => group.notices.some(notice => notice.id === id))?.notices || [];
  }

  // One physical nail can hold several independent publications. A publication
  // is one announcement plus its explicitly assigned supplementary sheets.
  // Old stacks remain independent unless their author groups them deliberately.
  function publications(notices = [], options) {
    return groups(notices, options).flatMap(stack => {
      const entries = new Map();
      for (const notice of stack.notices) {
        const key = notice.noticeGroupId ? `group:${notice.noticeGroupId}` : `notice:${notice.id}`;
        if (!entries.has(key)) entries.set(key, { key: `${stack.key}/${key}`, stackKey: stack.key, notices: [] });
        entries.get(key).notices.push(notice);
      }
      return [...entries.values()].map(entry => {
        const primary = entry.notices.find(notice => notice.id === notice.noticeGroupId) || entry.notices[0];
        return { ...entry, id: primary.id, primary, notices: [primary, ...entry.notices.filter(notice => notice !== primary)] };
      });
    });
  }

  function publication(notices, id, options) {
    return publications(notices, options).find(entry => entry.notices.some(notice => notice.id === id));
  }

  function combine(notices, id, targetId) {
    const source = publication(notices, id, { includeSecret: true });
    const target = publication(notices, targetId, { includeSecret: true });
    if (!source || !target || source.key === target.key || source.stackKey !== target.stackKey) return false;
    [...target.notices, ...source.notices].forEach(notice => { notice.noticeGroupId = target.id; });
    return true;
  }

  function separate(notices, id) {
    const entry = publication(notices, id, { includeSecret: true });
    const notice = entry?.notices.find(item => item.id === id);
    if (!notice || entry.notices.length < 2) return false;
    delete notice.noticeGroupId;
    return true;
  }

  function attachPublication(notices, id, targetId) {
    const entry = publication(notices, id, { includeSecret: true });
    const target = publication(notices, targetId, { includeSecret: true });
    if (!entry || !target || entry.stackKey === target.stackKey) return false;
    entry.notices.forEach(notice => attach(notices, notice.id, targetId));
    return true;
  }

  function detachPublication(notices, id) {
    const entry = publication(notices, id, { includeSecret: true });
    const stack = members(notices, id, { includeSecret: true });
    if (!entry || stack.length === entry.notices.length) return false;
    const remaining = stack.filter(notice => !entry.notices.includes(notice));
    const { x, y } = stack[0];
    remaining.forEach(notice => { notice.stackId = remaining[0].id; });
    entry.notices.forEach(notice => {
      notice.stackId = entry.id;
      notice.x = Math.max(0, Math.min(1, Number(x) + (x > .9 ? -.035 : .035)));
      notice.y = Math.max(0, Math.min(1, Number(y) + (y > .9 ? -.035 : .035)));
    });
    reorder(remaining);
    reorder(entry.notices);
    return true;
  }

  function reorder(items) {
    items.forEach((notice, index) => { notice.stackOrder = index; });
  }

  function releaseAnchor(notices, source) {
    const remaining = members(notices, source.id, { includeSecret: true }).filter(item => item !== source);
    if (remaining.some(item => item.stackId === source.id)) {
      remaining.forEach(item => { item.stackId = remaining[0].id; });
    }
  }

  function attach(notices, id, targetId) {
    const source = notices.find(notice => notice.id === id);
    const target = notices.find(notice => notice.id === targetId);
    if (!source || !target || source === target) return false;
    const group = members(notices, targetId, { includeSecret: true });
    if (group.includes(source)) return false;
    releaseAnchor(notices, source);
    const stackId = target.stackId || target.id;
    for (const notice of [...group, source]) {
      notice.stackId = stackId;
      notice.x = group[0].x;
      notice.y = group[0].y;
    }
    reorder([...group, source]);
    return true;
  }

  function detach(notices, id) {
    const group = members(notices, id, { includeSecret: true });
    const notice = group.find(item => item.id === id);
    if (!notice || group.length < 2) return false;
    releaseAnchor(notices, notice);
    delete notice.stackId;
    delete notice.stackOrder;
    notice.x = Math.max(0, Math.min(1, Number(group[0].x) + (group[0].x > .9 ? -.035 : .035)));
    notice.y = Math.max(0, Math.min(1, Number(group[0].y) + (group[0].y > .9 ? -.035 : .035)));
    reorder(group.filter(item => item !== notice));
    return true;
  }

  function move(notices, id, direction) {
    const group = members(notices, id, { includeSecret: true });
    const index = group.findIndex(notice => notice.id === id);
    const next = index + Math.sign(direction);
    if (index < 0 || next < 0 || next >= group.length) return false;
    [group[index], group[next]] = [group[next], group[index]];
    reorder(group);
    // A new leading sheet must keep the nail in the same place.
    const anchor = notices.find(notice => notice.id === id);
    group.forEach(notice => { notice.x = anchor.x; notice.y = anchor.y; });
    return true;
  }

  function position(notices, id, x, y) {
    members(notices, id, { includeSecret: true }).forEach(notice => {
      notice.x = Math.max(0, Math.min(1, x));
      notice.y = Math.max(0, Math.min(1, y));
    });
  }

  window.TafelNoticeStacks = Object.freeze({ groups, members, publications, publication, combine, separate,
    attachPublication, detachPublication, attach, detach, move, position });
})();
