// Import local dependencies
import jQuery from 'jquery';
import Velocity from 'velocity-animate';
import barba from '@barba/core/dist/barba.js';
import gsap from 'gsap';

import Router from './util/Router';
import appState from './util/appState';
import stickyNav from './util/stickyNav';
import accordions from './util/accordions';
import imageReveals from './util/imageReveals';

import common from './routes/common';
import home from './routes/home';
import contact from './routes/contact';

window.$ = window.jQuery = jQuery;
const curtain = document.getElementById('curtain');

// Populate Router instance with DOM routes
const routes = new Router({
  common,
  home,
  contact,
});

// Init appState utility object
appState.init();

// Init sticky nav
stickyNav.init();

// Init image reveals
imageReveals.init();

// Init Accordions
accordions.init();

// Init Barba for smooth page transitions
barba.init({
  transitions: [{
    name: 'curtain-slide',
    leave() {
      return gsap.to(curtain, {
        scaleY: 1,
        duration: 0.5,
        ease: 'slow(0.7, 0.7, false)',
        onComplete: function() {
          curtain.classList.add('enter');
        }
      });
    },
    beforeEnter(data) {
      // Sync up nav active classes based on next page
      let updateItems = $(data.next.html).find('[data-barba-update]');
      $('[data-barba-update]').each(function(index) {
        this.className = updateItems[index].className;
      });
    },
    after() {
      return gsap.to(curtain, {
        scaleY: 0,
        duration: 0.5,
        ease: 'slow(0.7, 0.7, false)',
        onComplete: function() {
          curtain.classList.remove('enter');
        }
      });
    }
  }]
});
// Adjustments made after barba page leave
barba.hooks.afterLeave((data) => {
  // Remove any focused elements before transition
  document.activeElement.blur()
  // Cleanup calls for js
  routes.unload();
  imageReveals.unload();
  // Scroll back to the top before revealing new page
  $(window).scrollTop(0);

  // Set <body> classes for "next" page
  let nextHtml = data.next.html;
  let response = nextHtml.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', nextHtml);
  let bodyClasses = $(response).filter('notbody').attr('class');
  document.body.className = bodyClasses;
});
barba.hooks.after(() => {
  routes.loadEvents();
  imageReveals.init();
  accordions.init();
});

// Load events
$(document).ready(() => routes.loadEvents());
