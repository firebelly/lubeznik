import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import appState from '../util/appState';
import barba from '@barba/core/dist/barba.js';
import GLightbox from 'glightbox';
import Velocity from 'velocity-animate';
import fitvids from 'fitvids';
import accordions from '../util/accordions';

let $document,
    $body,
		$window,
		$html,
		$siteNav,
    transitionElements,
    resizeTimer,
    lightbox,
    colors = [];

const common = {
  init() {
    // JavaScript to be fired on all pages
    $document = $(document);
    $body = $('body');
    $window = $(window);
    $html = $('html');
    $siteNav = $('.nav-main');

    // No barba ajaxifying of #adminbar links
    document.querySelector('#adminbar').setAttribute('data-barba-prevent', 'all');

    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav[0]];

    // Fit them vids
    fitvids();

    // Lightboxes
    lightbox = GLightbox({
      selector: '.lightbox',
    });

    // View full gallery button
    if (document.querySelector('.view-full-gallery')) {
      document.querySelector('.view-full-gallery').addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.gallery li.hidden').forEach((el, i) => {
          Velocity(el, { 'scale': 0, 'opacity': 0 }, { duration: 0, display: 'block' });
          Velocity(el, { 'scale': 1, 'opacity': 1 }, { duration: 500, delay: i * 50, easing: 'easeOutCubic' });
          // Velocity(el, 'fadeIn', { duration: 250 });
        });
      });
    }


    // Set random selection color pairs
    colors = {
      '#5A5AE0': '#EFEEEA',
      '#F65F92': '#2B2C2A',
      '#F4CF31': '#2B2C2A',
      '#A7AA3D': '#2B2C2A'
    }

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

    // Establish random selection colors on load
    common.randomSelectionColor();

    // Switch up the selection color on click
    $document.on('mousedown.randomColor', common.randomSelectionColor);

    // Keyboard navigation and esc handlers
    $document.on('keyup.fb', e => {
      // esc
      if (e.keyCode === 27) {
        common.closeNav();
        // Unfocus any focused elements
        if (document.activeElement != document.body) {
          document.activeElement.blur();
        }
      }
    }).on('click', 'body.nav-open', e => {
      // Clicking outside of modal closes modal
      let $target = $(e.target);
      // Make sure target inside modal content
      if ($target.parents('.toggle-nav').length === 0 && !$target.hasClass('site-nav')  && !$target.hasClass('toggle-nav') && $target.parents('.site-nav').length === 0) {
        common.closeNav();
      }
    });

    // Bigclicky™ (large clickable area that pulls first a[href] as URL)
    $document.on('click.bigClicky', '.bigclicky', function(e) {

      if (!$(e.target).is('a')) {
        e.preventDefault();
        common.bigClicky(e);
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


    // Event/class filters
    common.initFilters();
  },

  // Ajaxify filter links on events/classes/exhibitions pages
  initFilters() {
    $('ul.filters').each(function() {
      let $filters = $(this);
      let $container = $filters.parents('.filter-container:first').next();
      $filters.find('a:not(.view-archive)').on('click', function(e){
        e.preventDefault();
        let $el = $(this);
        // Just return if already active
        if ($el.hasClass('active')) {
          return;
        }
        // Mark active filter
        $filters.find('a').removeClass('active');
        $el.addClass('active');
        // Slide up container
        $container.find('.ajax-content').velocity('slideUp');
        // Load content based on filter
        $.ajax({
          url: $el.attr('href')
        }).done(function(result) {
          // Replace URL with filter link to allow linking
          history.replaceState(null, null, $el.attr('href'));
          let content = $('.ajax-content', result);
          // Slide out container with new content
          $container.html(content).find('.ajax-content').velocity('slideUp', 0, () => {
            $container.html(content).find('.ajax-content').velocity('slideDown', { delay: 150 });
            accordions.init();
          });
        });
      });
    });
  },

  // Big Clicky Functionality
  bigClicky(e) {
    let $target = $(e.target);
    let link = $target.find('a:first');
    let href = link[0].href;
    if (href) {
      if (e.metaKey || link.attr('target')) {
        window.open(href);
      } else {
        // Use barba if available
        if (typeof barba !== 'undefined') {
          barba.go(href, e);
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
    transitionElements.forEach(el => {
      el.style.transition = 'none';
    });
  },

  enableTransitions() {
    transitionElements.forEach(el => {
      el.removeAttribute('style');
    });
  },

  randomSelectionColor() {
    let selectColor = Math.floor(Math.random() * Object.keys(colors).length);
    document.documentElement.style.setProperty('--selection-color-bg', Object.keys(colors)[selectColor]);
    document.documentElement.style.setProperty('--selection-color-text', Object.values(colors)[selectColor]);
  },

  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },

  unload() {
    // JavaScript to clean up before live page reload

    lightbox.close();

    // Remove custom event watchers
    $document.off('click.bigClicky keyup.fb body.nav-open mousedown.randomColor');
    $window.off('resize.fb');
  },
};

export default common;
