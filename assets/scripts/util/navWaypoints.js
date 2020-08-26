// Nav waypoints tied to section.page elements

import appState from './appState';

let pages = [],
    $window,
    scrollTop,
    ticking;

const navWaypoints = {

  // Init sticky headers
  init() {
    if ($('section.page').length) {
      $window = $(window);
      pages = document.querySelectorAll('section.page');

      $window.off('scroll.navWaypoints').on('scroll.navWaypoints', navWaypoints.scrolling);
      $window.off('resize.navWaypoints').on('resize.navWaypoints', navWaypoints.resizing);
      $window.off('load.navWaypoints').on('load.navWaypoints', navWaypoints.resizing);
    }
  },

  // Request update using requestAnimationFrame
  requestTick() {
    if(!ticking) {
      requestAnimationFrame(navWaypoints.update);
    }
    ticking = true;
  },

  // Update sticky title
  update() {
    ticking = false;
    if (appState.isAnimating) {
      return;
    }
    let currentPage = '';
    // Find current sticky section title based on scroll position
    pages.forEach(el => {
      if (el.getBoundingClientRect().top + window.scrollY - 10 <= scrollTop) {
        currentPage = el.getAttribute('data-title');
      }
    });
    document.querySelectorAll('.nav-main a').forEach(el => {
      if (el.getAttribute('data-title') == currentPage) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
        // Remove focus if previously clicked to disable active state
        el.blur();
      }
    });
  },

  // Scrolling
  scrolling(event) {
    scrollTop = $window.scrollTop();
    navWaypoints.requestTick();
  }

};

export default navWaypoints
