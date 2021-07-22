window.onload = function(e) {
  let preloaderFadeOutTime = 1500;
  function hidePreloader() {
    var preloader = $(".spinner-wrapper");
    preloader.fadeOut(preloaderFadeOutTime);
  }
  hidePreloader();
};