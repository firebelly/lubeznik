import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import appState from '../util/appState';

let $document,
    $body,
		$window,
		$html,
		$siteNav,
    transitionElements,
    resizeTimer;

const common = {
  init() {
    // JavaScript to be fired on all pages
    $document = $(document);
    $body = $('body');
    $window = $(window);
    $html = $('html');
    $siteNav = $('.nav-main');
    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav];

    // Duplicate footer logo into mobile nav
    $('footer .logo-stacked').clone().appendTo('.nav-main');

    // Mobile hamburger and X close icons toggle mobile nav
    $('.hamburger').on('click', function(e) {
      e.preventDefault();
      common.openNav();
    });
    $('.site-nav a').on('focus', function() {
      if (!appState.navOpen) {
        common.openNav();
      }
    });
    $('a.toggle-nav.close').on('click', function(e) {
      e.preventDefault();
      common.closeNav();
    });

    // Keyboard navigation and esc handlers
    $(document).keyup(function(e) {
      // esc
      if (e.keyCode === 27) {
        common.closeNav();
        // Unfocus any focused elements
        if (document.activeElement != document.body) {
          document.activeElement.blur();
        }
      }
    }).on('click', 'body.nav-open', function(e) {
      // Clicking outside of modal closes modal
      let $target = $(e.target);
      // Make sure target inside modal content
      if ($target.parents('.toggle-nav').length === 0 && !$target.hasClass('site-nav')  && !$target.hasClass('toggle-nav') && $target.parents('.site-nav').length === 0) {
        common.closeNav();
      }
    });

    // Bigclicky™ (large clickable area that pulls first a[href] as URL)
    $document.on('click.bigClicky', '.bigclicky', function(e) {
      console.log('hello');
      if (!$(e.target).is('a')) {
        e.preventDefault();
        common.bigClicky(e, $(this));
      }
    });

    function _resize() {
      // Disable transitions when resizing
      common.disableTransitions();

      // Reset inline styles for navigation for medium breakpoint
      if (appState.breakpoints.nav && appState.navOpen) {
        common.resetNav();
      }

      // Functions to run on resize end
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Re-enable transitions
        common.enableTransitions();
      }, 250);
    }
    $window.on('resize.fb', _resize);
  },

  // Big Clicky Functionality
  bigClicky(e, $target) {
    let link = $target.find('a:first');
    let href = link[0].href;
    if (href) {
      if (e.metaKey || link.attr('target')) {
        window.open(href);
      } else {
        // Use swup if available
        if (typeof swup !== 'undefined') {
          swup.loadPage({ url: link[0].pathname });
        } else {
          location.href = href;
        }
      }
    }
  },

  // Close main and any child nav elements
  closeNav() {
    if (!appState.navOpen) {
      return;
    }
    $('.site-nav li.open').removeClass('open');
    document.body.classList.remove('nav-open');
    enableBodyScroll($siteNav[0]);
    $html.css('overflow', '');
  },

  openNav() {
  	document.body.classList.add('nav-open');
    appState.navOpen = true;
    disableBodyScroll($siteNav[0]);
    $html.css('overflow', 'hidden');
  },

  // Reset Nav after resize
  resetNav() {
    // _hideOverlay();
    document.body.classList.remove('nav-open');
    $siteNav.attr('style', '');
    appState.navOpen = false;
  },

  // Disabling transitions on certain elements on resize
  disableTransitions() {
    $.each(transitionElements, function() {
      $(this).css('transition', 'none');
    });
  },

  enableTransitions() {
    $.each(transitionElements, function() {
      $(this).attr('style', '');
    });
  },

  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },

  unload() {
    // JavaScript to clean up before live page reload

    // Remove custom event watchers
    $document.off('click.bigClicky');
    $window.off('resize.fb');
  },
};

export default common;
