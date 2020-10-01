// Accordion Functionality

import appState from '../util/appState';

const accordions = {

  // Init Accordions
  init() {
    $('.accordion').each(function() {
      let $this = $(this);
      $this.on('click', (e) => {
        if (!appState.isAnimating && !$this.hasClass('-active')) {
          e.preventDefault();
          // Expand!
          accordions.expand($this);
        }
      });
      // Toggle Button
      $this.find('button.toggle').on('click', (e) => {
        e.preventDefault();
        if ($this.hasClass('-active')) {
          accordions.collapse()
        } else {
          accordions.expand($this);
        }
      });
    });
  },

  // Expand the accordion
  expand($accordion) {
    if ($accordion.hasClass('-active') || appState.isAnimating) {
      return false;
    }

    // Accordion already open? Collapse, scroll to position, and open selected
    if ($('.accordion.-active').length) {
      $('.accordion.-active').each(function() {
        appState.isAnimating = true;
        if (!appState.reducedMotionMQ.matches) {
          $(this).removeClass('-active')
            .find('.accordion-content')
            .velocity('slideUp', 0, () => {
              $accordion.addClass('-active')
                .find('.accordion-content')
                .velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
            });
        } else {
          // If prefers reduced motion is enabled, just hide/show/jump — no movement
          $(this).removeClass('-active');
          $(this).find('.accordion-content')
            .css({
              'display': 'none',
              'opacity': 0
            });
          $accordion.addClass('-active')
            .find('.accordion-content')
            .css({
              'display': 'block',
              'opacity': 1
            });
          appState.isAnimating = false;
        }
      });
    } else {
      // Just open accordion if none are already open
      $accordion.addClass('-active');
      if (!appState.reducedMotionMQ.matches) {
        $accordion.find('.accordion-content').velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
      } else {
        // If reduced motion is enabled just show it
        $accordion.find('.accordion-content').css({
          'display': 'block',
          'opacity': 1
        });
        appState.isAnimating = false;
      }
    }
  },

  // Collapse the accordion
  collapse() {
    appState.isAnimating = true;

    if (!appState.reducedMotionMQ.matches) {
      $('.accordion.-active')
        .removeClass('-active')
        .find('.accordion-content')
        .velocity('slideUp', 500, 'easeOutCubic', () => {
          appState.isAnimating = false;
        });
    } else {
      // If reduced motion is enabled, just hide it
      $('.accordion.-active')
        .removeClass('-active')
        .find('.accordion-content')
        .css({
          'display': 'none',
          'css': 0
        });
      appState.isAnimating = false;
    }
  },

};

export default accordions
