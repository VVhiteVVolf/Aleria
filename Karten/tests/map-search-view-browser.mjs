import assert from 'node:assert/strict';

// Run through native browser input: a DOM .click() cannot expose the old
// change/blur race between pressing and releasing a search result.
export async function verifyMapSearch({ command, evaluate }) {
  const typeSearch = async text => {
    await evaluate(`document.getElementById('search-inp').focus(); document.getElementById('search-inp').select();`);
    await command('Input.insertText', { text });
  };
  const place = await evaluate(`(() => {
    const pin=KartoRuntime.visiblePins().find(pin=>pin.kind!=='text');
    const other=KartoRuntime.state().cats.find(cat=>cat.id!==pin.cat);
    setFilter(other.id); resetLayers();
    return {id:pin.id,title:pin.title};
  })()`);
  await typeSearch(place.title);
  const target = await evaluate(`(() => {
    const result=[...document.querySelectorAll('.sr-item')].find(item=>item.dataset.pinId===${JSON.stringify(place.id)});
    const r=result.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...target });
  await new Promise(resolve => setTimeout(resolve, 300));
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...target });
  const clicked = await evaluate(`(() => {
    const pin=KartoRuntime.state().pins.find(pin=>pin.id===${JSON.stringify(place.id)});
    const image=KartoRuntime.mapImageSize(), view=KartoRuntime.mapViewportSize(), t=KartoRuntime.mapTransform();
    const marker=document.querySelector('#pl .navigation-target');
    return {open:document.getElementById('scroll-mo').classList.contains('open'), title:document.getElementById('pin-detail-title')?.textContent,
      filter:KartoRuntime.activeFilter(), layer:document.getElementById('lb-pins').classList.contains('on'), id:marker?.dataset.id,
      dx:Math.abs(pin.x*image.width*t.z+t.x-view.width/2), dy:Math.abs(pin.y*image.height*t.z+t.y-view.height/2)};
  })()`);
  assert.equal(clicked.open, true, 'Ein nativer, länger gehaltener Klick muss den Ort öffnen.');
  assert.equal(clicked.title, place.title);
  assert.equal(clicked.filter, 'all');
  assert.equal(clicked.layer, true);
  assert.equal(clicked.id, place.id);
  assert.ok(clicked.dx < 1 && clicked.dy < 1, 'Der Pin muss im Kartenfenster zentriert sein.');
  await evaluate('closeScroll()');
  await typeSearch('Mine');
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown' });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown' });
  const active = await evaluate(`document.getElementById('search-inp').getAttribute('aria-activedescendant')`);
  assert.ok(active);
  const expected = await evaluate(`KartoRuntime.state().pins.find(pin=>pin.id===document.getElementById(${JSON.stringify(active)}).dataset.pinId).title`);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter' });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter' });
  assert.equal(await evaluate(`document.getElementById('pin-detail-title').textContent`), expected);
  assert.equal(await evaluate(`document.getElementById('scroll-mo').classList.contains('open')`), true);
  await evaluate('closeScroll()');
  await typeSearch('kein-ort-mit-diesem-namen-89371');
  assert.equal(await evaluate(`document.querySelector('.sr-empty')?.textContent`), 'Kein Ort gefunden.');
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  assert.equal(await evaluate(`document.getElementById('search-inp').getAttribute('aria-expanded')`), 'false');
  await evaluate('clearSearch(); resetLayers();');
  return { mouse: 'passed', keyboard: 'passed', filters: 'passed', centering: 'passed' };
}

export async function verifyMapViewSettings({ command, evaluate }) {
  const original = await evaluate('JSON.stringify(KartoRuntime.state())');
  try {
    await evaluate(`(() => {
      const state=KartoRuntime.state();
      state.pins.push({id:'view-test-lettering',title:'Prüfschriftzug',kind:'text',cat:state.cats[0].id,x:.5,y:.5});
      state.pins.push({id:'view-test-secret',title:'Geheimer Prüfschriftzug',kind:'text',secret:true,cat:state.cats[0].id,x:.4,y:.5});
      KartoRuntime.renderPins();
      if(!KartoRuntime.isEditMode()) document.getElementById('btn-edit').click();
      document.querySelector('.map-view-settings').open=true;
      for(const role of ['always-show-lettering','show-pin-labels']) {
        const input=document.querySelector('[data-role="'+role+'"]'); if(!input.checked) input.click();
      }
      document.getElementById('btn-edit').click();
      resetLayers();
    })()`);
    const visibility = await evaluate(`(() => ({
      layer:getComputedStyle(document.getElementById('pl')).display,
      raster:getComputedStyle(document.getElementById('lm')).opacity,
      ordinary:getComputedStyle(document.querySelector('.pin:not(.pin-text)')).display,
      lettering:getComputedStyle(document.querySelector('[data-id="view-test-lettering"]')).display,
      secret:!!document.querySelector('[data-id="view-test-secret"]'),
      settings:getComputedStyle(document.querySelector('.map-view-settings')).display
    }))()`);
    assert.equal(visibility.layer, 'block');
    assert.equal(visibility.raster, '0');
    assert.equal(visibility.ordinary, 'none');
    assert.notEqual(visibility.lettering, 'none');
    assert.equal(visibility.secret, false);
    assert.equal(visibility.settings, 'none');
    await evaluate('activateLayer("pins")');
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.pin:not(.navigation-target) .pin-label')).opacity`), '1');
    await evaluate('KartoRuntime.flushSave()');
    await command('Page.reload', { ignoreCache: true });
    let reloaded = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      reloaded = await evaluate(`!!window.KartoRuntime?.state().pins.some(pin=>pin.id==='view-test-lettering') && !!document.querySelector('.pin .pin-label')`);
      if (reloaded) break;
    }
    assert.ok(reloaded, 'Der gespeicherte Kartenentwurf muss erneut geladen werden.');
    assert.deepEqual(await evaluate(`({lettering:KartoRuntime.state().alwaysShowLettering,labels:KartoRuntime.state().showPinLabels,layer:getComputedStyle(document.getElementById('pl')).display})`),
      { lettering: true, labels: true, layer: 'block' });
    await evaluate(`(() => {
      document.getElementById('btn-edit').click();
      for(const role of ['always-show-lettering','show-pin-labels']) document.querySelector('[data-role="'+role+'"]')?.click();
      document.getElementById('btn-edit').click(); resetLayers();
    })()`);
    assert.equal(await evaluate(`getComputedStyle(document.getElementById('pl')).display`), 'none');
    await evaluate('activateLayer("pins")');
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.pin .pin-label')).opacity`), '0');
    return { lettering: 'passed', labels: 'passed', reload: 'passed', secrets: 'passed' };
  } finally {
    await evaluate(`KartoRuntime.applyState(${original}); KartoRuntime.flushSave();`);
  }
}
