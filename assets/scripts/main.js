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
  prevent: ({ el }) => el.classList && el.classList.contains('no-ajaxy'),
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
      let updateClassItems = $(data.next.html).find('[data-barba-update-class]');
      $('[data-barba-update-class]').each(function(index) {
        this.className = updateClassItems[index].className;
      });
      // Sync up nav active classes based on next page
      let updateMarkupItems = $(data.next.html).find('[data-barba-update-markup]');
      $('[data-barba-update-markup]').each(function(index) {
        this.innerHTML = updateMarkupItems[index].innerHTML;
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

  // Set <body> classes for "next" page
  let nextHtml = data.next.html;
  let response = nextHtml.replace(/(<\/?)body( .+?)?>/gi, '$1notbody$2>', nextHtml);
  let bodyClasses = $(response).filter('notbody').attr('class');
  document.body.className = bodyClasses;
});
barba.hooks.before(() => {
  // Set HTML to no-smooth-scroll to jump right to the top
  $('html').addClass('no-smooth-scroll');
});
barba.hooks.beforeEnter(() => {
  // Scroll To Hash if it exists
  // This actually seems like a hack workaround,
  // and it throws `barba.js:1 Uncaught RangeError: Maximum call stack size exceeded.` in the console
  // But using it for now — taken directly from Barba.js docs main.js
  const oldHash = window.location.hash;

  if (oldHash) {
    window.location.hash = '';
    window.location.hash = oldHash;
  } else {
    // Scroll back to the top before revealing new page
    $(window).scrollTop(0);
  }
});
barba.hooks.after(() => {
  $('html').removeClass('no-smooth-scroll');
  routes.loadEvents();
  imageReveals.init();
  accordions.init();

  ga('set', 'page', window.location.pathname);
  ga('send', 'pageview');
});

// Load events
$(document).ready(() => routes.loadEvents());
