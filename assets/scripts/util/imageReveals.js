// Image reveal treatment as you scroll
//
// Fades and slides in images as they appear in the viewport

let reveals,
    activated = [],
    $window,
    windowHeight,
    scrollTop,
    ticking;

const imageReveals = {

  // Init sticky headers
  init() {
    if ($('.-reveal').length) {
      $window = $(window);
      reveals = document.querySelectorAll('.-reveal,.lines');

      imageReveals.resize();
      imageReveals.update();

      $window.off('scroll.reveals').on('scroll.reveals', imageReveals.scrolling);
      $window.off('resize.reveals').on('resize.reveals', imageReveals.resize);
      $window.off('load.reveals').on('load.reveals', imageReveals.resize);
    }
  },

  // Request update using requestAnimationFrame
  requestTick() {
    if(!ticking) {
      requestAnimationFrame(imageReveals.update);
    }
    ticking = true;
  },

  // Update image reveal
  update() {
    ticking = false;
    scrollTop = $window.scrollTop();
    // Loop through each reveal image and check if in viewport
    reveals.forEach((el, i) => {
      if (el.getBoundingClientRect().top + window.scrollY <= (scrollTop + windowHeight - (windowHeight * 0.03)) && !activated[i]) {
        el.classList.add('-active');
        activated[i] = 1;
      }
    });
  },

  // Resize, recalculate positions
  resize(event) {
    windowHeight = $window.height();
  },

  // Scrolling
  scrolling(event) {
    imageReveals.requestTick();
  }

};

export default imageReveals
