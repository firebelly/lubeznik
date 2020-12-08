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
    if (document.querySelector('#adminbar')) {
      document.querySelector('#adminbar').setAttribute('data-barba-prevent', 'all');
    }

    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav[0]];

    // Fit them vids
    fitvids();

    // Lightboxes
    lightbox = GLightbox({
      selector: '.lightbox',
    });

    // View full gallery button
    const viewFullGallery = document.querySelector('.view-full-gallery');
    if (viewFullGallery) {
      viewFullGallery.addEventListener('click', e => {
        e.preventDefault();
        viewFullGallery.classList.add('hidden');
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
        common.bigClicky(this, e);
      }
    });

    // Smooth scroll to an element
    function _scrollBody(element) {
      let offset = $('.site-header').outerHeight();

      if ($(element).length) {
        appState.isAnimating = true;
        element.velocity('scroll', {
          duration: 500,
          offset: -offset,
          complete: function(elements) {
            appState.isAnimating = false;
          }
        }, 'easeOutCubic');
      }
    }

    function _resize() {
      // Disable transitions when resizing
      common.disableTransitions();

      // Reset inline styles for navigation for medium breakpoint
      if (appState.breakpoints.nav && appState.navOpen) {
        common.resetNav();
      }

      // Reset filter styles
      $('ul.filters').attr('style', '').removeClass('-active');

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

    // Form Functions
    common.initFormFunctions();

    // Flash Messages
    common.initFlashMessages();

    // Floating Stuff!
    common.initFloatingObjects();
  },

  // General Form Functionality
  initFormFunctions() {
    const autoFocusElement = document.querySelector('[autofocus]');
    if (autoFocusElement) {
      autoFocusElement.parentElement.classList.add('-focus');
      const focusTop = autoFocusElement.getBoundingClientRect().top - 100;
      window.scrollTo({
        top: focusTop,
        behavior: "smooth"
      });
    }

    $('[autofocus], .input-wrap input, .input-wrap select, .input-wrap textarea').on('focus', function() {
      $(this).closest('.input-wrap').addClass('-focus');
    }).on('blur', function() {
      $(this).closest('.input-wrap').removeClass('-focus');
    });

    // Ajaxy Newsletter signup with Constant Contact
    const $newsletterForm = $('#newsletter-signup');
    const $newsletterStatus = $('#newsletter-signup .status');
    $newsletterForm.on("submit", function(event) {
      event.preventDefault();
      $newsletterStatus.removeClass('-error');
      $newsletterForm.find('button').html('Working...');

      $.ajax({url: '/', type: "POST", data: $(this).serialize(), dataType:"json", success: function (data) {
        if (!data.success) {
          $newsletterForm.find('button').html('Submit');
          $newsletterStatus.addClass('-error').html(data.message);
          $newsletterStatus.velocity({
            opacity: 1,
          }, {
            display: 'block'
          });
        } else {
          $newsletterStatus.addClass('-success').html('<svg class="icon sprite-check" aria-hidden="true"><use xlink:href="#sprite-check"/></svg> Success! You\'re in.');
          $newsletterForm.closest('.newsletter-form').addClass('-success');
          $newsletterForm.find('.form-row').velocity({
            opacity: 0,
          }, {
            display: 'none',
            complete: function() {
              $newsletterStatus.velocity({
                opacity: 1,
              }, {
                display: 'block'
              });
            }
          });
          $newsletterForm.find('button').html('Submit');
        }
      }})
    });
  },

  // Ajaxify filter links on events/classes/exhibitions pages
  initFilters() {
    const $filters = $('ul.filters');
    const $container = $('.ajax-wrap');

    $filters.each(function() {
      let $this = $(this);
      $this.find('a:not(.view-archive)').on('click', function(e){
        e.preventDefault();

        if (!appState.breakpoints.md) {
          hideFilters();
        }

        if ($('.filter-container .page').length) {
          $('.filter-container .page')[0].innerHTML = 'Page 1';
        }

        let $el = $(this);
        // Just return if already active
        if ($el.hasClass('active')) {
          return;
        }
        // Mark active filter
        $this.find('a').removeClass('active');
        $el.addClass('active');

        // Slide up container and load content
        fetchContent($el);
      });
    });

    // Lumping in event pagination here too, but should probably refactor
    $document.on('click', '.event-pagination a', function(e) {
      e.preventDefault();
      $container.addClass('-loading');

      const pageNumber = $(this).attr('data-page-number');
      const $filterContainer = $('.filter-container');
      const pageLabel = $filterContainer.find('.page');

      pageLabel.innerHTML = 'Page ' + pageNumber;
      let $el = $(this);

      appState.isAnimating = true;
      $filterContainer.velocity('scroll', {
        duration: 250,
        offset: -100,
        complete: function(elements) {
          appState.isAnimating = false;
          fetchContent($el);
        }
      }, 'easeOutCubic');
    });

    function fetchContent($el) {
      $container.addClass('-loading');
      $.ajax({
        url: $el.attr('href')
      }).done(function(result) {
        // Replace URL with filter link to allow linking
        history.replaceState(null, null, $el.attr('href'));
        let content = $('.ajax-content', result);
        // // Slide out container with new content
        $container.html(content);
        $container.removeClass('-loading');
        // $container.html(content).find('.ajax-content').velocity('slideUp', 0, () => {
        //   $container.html(content).find('.ajax-content').velocity('slideDown', { delay: 150 });
        // });
        accordions.init();
      });
    }

    function showFilters() {
      $filters.addClass('-active').show();
      // $filters.velocity('slideDown');
    }

    function hideFilters() {
      $filters.removeClass('-active').hide();
      // $filters.velocity('slideUp');
    }

    // Click/tap to open filter options on small-screen
    $('.filter-label, .active-filter').on('click', function() {
      if (!appState.breakpoints.md) {
        if (!$filters.is('.-active')) {
          showFilters();
        } else {
          hideFilters();
        }
      }
    });
  },

  // Big Clicky Functionality
  bigClicky(target, e) {
    let $target = $(target);
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

  initFlashMessages() {
    let $flashMessage = $('.site-flash');
    let flashCookie = $flashMessage.attr('data-flash-cookie');
    document.querySelector('.flash-close').addEventListener('click', hideFlash);

    if ($flashMessage) {
      if (flashCookie !== '' && flashCookie !== undefined) {
        // If the flash cookie exisists, do nothing
        if (document.cookie.split(';').some(function(item) {
            return item.trim().indexOf(flashCookie) == 0
        })) {
          return;
          // If not, show the flash message and set the cookie
        } else {
          showFlash();
          document.cookie = flashCookie + ';max-age=21600';
        }
        // System flash messages
      } else {
        showFlash();
      }
    }

    function showFlash() {
      $flashMessage.velocity('slideDown');
    }

    function hideFlash() {
      $flashMessage.velocity('slideUp');
    }
  },

  initFloatingObjects() {
    const objects = document.querySelectorAll(".floaty");
    const limit = 8;

    for (let i = 0; i < objects.length; i++) {
      objects[i].setAttribute("data-x", "0");
      objects[i].setAttribute("data-y", "0");

      setTransform(objects[i]);
    }

    function setTransform(object) {
      let prevX = parseInt(object.getAttribute("data-x"));
      let prevY = parseInt(object.getAttribute("data-y"));
      let xDelta =
        Math.floor(Math.random() * limit) * (Math.round(Math.random()) ? 1 : -1);
      let yDelta =
        Math.floor(Math.random() * limit) * (Math.round(Math.random()) ? 1 : -1);
      let tX = prevX + xDelta;
      let tY = prevY + yDelta;

      object.setAttribute("data-x", tX);
      object.setAttribute("data-y", tY);
      object.style.setProperty(
        "transform",
        "translate3d(" + tX + "px, " + tY + "px, 0)"
      );

      window.requestAnimationFrame(function () {
        setTransform(object);
      });
    }
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
