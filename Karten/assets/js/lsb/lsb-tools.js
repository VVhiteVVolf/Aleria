(function(){
  const calculations = window.KartoLsbCalculations;

  let calibrationPoints = [];
  let measurePoints = [];

  function runtime(){
    return window.KartoRuntime;
  }

  function state(){
    return runtime().lsbState();
  }

  function travelMode(){
    return runtime().travelMode();
  }

  function setTravelMode(mode){
    runtime().setTravelMode(mode);
  }

  function save(){
    runtime().saveTravel();
  }

  function toast(message){
    runtime().toast(message);
  }

  function scale(){
    return state().calScale;
  }

  function setScale(value){
    state().calScale = value;
  }

  function pathKm(points){
    return calculations.pathKm(points, scale());
  }

  function updateCalibrationUi(){
    const status = document.getElementById('lsb-cal-status');
    const scaleLabel = document.getElementById('lsb-scale-lbl');
    if(!status) return;
    if(scale()){
      status.textContent = '✓ Kalibriert: 1 px = ' + scale().toFixed(5) + ' km';
      status.className = 'ok';
      scaleLabel.textContent = '1 km ≈ ' + (1 / scale()).toFixed(1) + ' px';
    } else if(travelMode() === 'calib'){
      status.textContent = 'Setze Punkt ' + (calibrationPoints.length + 1) + ' von 2.';
      status.className = '';
      scaleLabel.textContent = '';
    } else {
      status.textContent = 'Wähle „Kalibrieren" → 2 Punkte setzen.';
      status.className = '';
      scaleLabel.textContent = '';
    }
  }

  function startCalibration(){
    setTravelMode('calib');
    calibrationPoints = [];
    updateCalibrationUi();
    toast('⚖ 2 Punkte auf der Karte klicken');
  }

  function resetCalibration(){
    calibrationPoints = [];
    setScale(null);
    updateCalibrationUi();
    save();
  }

  function finishCalibration(){
    const dx = calibrationPoints[1].x - calibrationPoints[0].x;
    const dy = calibrationPoints[1].y - calibrationPoints[0].y;
    const px = Math.sqrt(dx * dx + dy * dy);
    const km = parseFloat(document.getElementById('lsb-ckm').value) || 10;
    setScale(km / px);
    calibrationPoints = [];
    setTravelMode('pan');
    updateCalibrationUi();
    save();
    toast('✓ Kalibriert');
  }

  function addCalibrationPoint(point){
    calibrationPoints.push({x:point.x, y:point.y});
    updateCalibrationUi();
    if(calibrationPoints.length === 2) finishCalibration();
  }

  function updateMeasureResult(){
    const result = document.getElementById('lsb-mea-result');
    if(!result) return;
    if(measurePoints.length < 2 || !scale()){
      result.textContent = '— noch keine Messung —';
      result.style.opacity = '.4';
      return;
    }
    result.innerHTML = '📏 <strong>' + pathKm(measurePoints).toFixed(2) + '</strong> km';
    result.style.opacity = '1';
  }

  function startMeasure(){
    setTravelMode('measure');
    measurePoints = [];
    document.getElementById('lmb-mea').classList.add('on');
    toast('📏 Klicken = Messpunkt · Doppelklick = fertig');
  }

  function clearMeasure(){
    measurePoints = [];
    setTravelMode('pan');
    document.getElementById('lmb-mea').classList.remove('on');
    updateMeasureResult();
  }

  function addMeasurePoint(point){
    measurePoints.push({x:point.x, y:point.y});
    updateMeasureResult();
  }

  function finishMeasure(){
    if(travelMode() !== 'measure' || measurePoints.length <= 1) return false;
    setTravelMode('pan');
    document.getElementById('lmb-mea').classList.remove('on');
    updateMeasureResult();
    return true;
  }

  function cancelTransientTools(){
    calibrationPoints = [];
    document.getElementById('lmb-mea')?.classList.remove('on');
  }

  window.KartoLsbTools = {
    calibrationPoints: () => calibrationPoints,
    measurePoints: () => measurePoints,
    pathKm,
    startCalibration,
    resetCalibration,
    updateCalibrationUi,
    addCalibrationPoint,
    startMeasure,
    clearMeasure,
    addMeasurePoint,
    updateMeasureResult,
    finishMeasure,
    cancelTransientTools,
  };

  window.lsbStartCal = startCalibration;
  window.lsbResetCal = resetCalibration;
  window.lsbUpdCalUI = updateCalibrationUi;
  window.lsbStartMeasure = startMeasure;
  window.lsbClearMeasure = clearMeasure;
  window.lsbUpdMeaResult = updateMeasureResult;
  window.lsbPathKm = pathKm;
})();
