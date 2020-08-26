// Import local dependencies
import jQuery from 'jquery';

import Router from './util/Router';
import appState from './util/appState';
import stickyNav from './util/stickyNav';
// import navWaypoints from './util/navWaypoints';
import imageReveals from './util/imageReveals';

import common from './routes/common';
import home from './routes/home';
import contact from './routes/contact';

window.$ = window.jQuery = jQuery;

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

// Init nav waypoints
// navWaypoints.init();

// Init image reveals
imageReveals.init();

// Load Events
document.addEventListener('DOMContentLoaded', () => routes.loadEvents());
