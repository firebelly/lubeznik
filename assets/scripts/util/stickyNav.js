// Sticky header nav
//
// Toggles "nav-stuck" class to body as you scroll down past nav

import appState from './appState';

let $nav,
    $body,
    $window,
    navBottom,
    offset = 0,
    scrollTop,
    ticking;

const stickyNav = {

  // Init sticky headers
  init() {
    $body = $('body');
    $nav = $('.header');
    $window = $(window);

    stickyNav.resize();
    stickyNav.scrolling();
    stickyNav.update();

    $window.off('scroll.stickyNav').on('scroll.stickyNav', stickyNav.scrolling);
    $window.off('resize.stickyNav').on('resize.stickyNav', stickyNav.resize);
    $window.off('load.stickyNav').on('load.stickyNav', () => {
      stickyNav.resize();
      stickyNav.scrolling();
      stickyNav.update();
    });
  },

  // Request update using requestAnimationFrame
  requestTick() {
    if(!ticking) {
      requestAnimationFrame(stickyNav.update);
    }
    ticking = true;
  },

  // Update positions of sticky nav
  update() {
    ticking = false;
    if (navBottom <= scrollTop + 40 && !appState.navStuck) {
      $body.addClass('nav-stuck');
      appState.navStuck = true;
    }
    if (navBottom >= scrollTop + 40 && appState.navStuck) {
      $body.removeClass('nav-stuck');
      appState.navStuck = false;
    }
  },

  // Resizing window
  resize() {
    navBottom = $nav.outerHeight();
  },

  // Scrolling
  scrolling() {
    scrollTop = $window.scrollTop() + offset;
    stickyNav.requestTick();
  }

};

export default stickyNav
