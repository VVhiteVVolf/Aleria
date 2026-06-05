(function(){
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.TafelInit);
  } else {
    window.TafelInit();
  }
})();
