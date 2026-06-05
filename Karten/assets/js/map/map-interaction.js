(function(){
  const mapWrap = document.getElementById('map-wrap');
  const placementCursor = document.getElementById('pc');
  const stampCursor = document.getElementById('stamp-cursor');

  function setCursor(cursor){
    mapWrap.style.cursor = cursor;
  }

  function resetCursor(){
    setCursor('grab');
  }

  function showPlacementCursor(){
    setCursor('none');
    placementCursor.style.display = 'block';
  }

  function hidePlacementCursor(){
    placementCursor.style.display = 'none';
  }

  function movePlacementCursor(clientX, clientY){
    placementCursor.style.left = clientX + 'px';
    placementCursor.style.top = clientY + 'px';
  }

  function showStampCursor(){
    setCursor('none');
    stampCursor.style.display = 'block';
  }

  function hideStampCursor(){
    stampCursor.style.display = 'none';
  }

  function moveStampCursor(clientX, clientY){
    stampCursor.style.left = clientX + 'px';
    stampCursor.style.top = clientY + 'px';
  }

  function isAuxPanButton(button){
    return button === 1 || button === 2;
  }

  function canPrimaryPan({button, addingPin, draggingPin, stamping}){
    return button === 0 && !addingPin && !draggingPin && !stamping;
  }

  window.KartoMapInteraction = {
    setCursor,
    resetCursor,
    showPlacementCursor,
    hidePlacementCursor,
    movePlacementCursor,
    showStampCursor,
    hideStampCursor,
    moveStampCursor,
    isAuxPanButton,
    canPrimaryPan,
  };
})();
