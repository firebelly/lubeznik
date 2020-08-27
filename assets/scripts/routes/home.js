import zenscroll from 'zenscroll';
import appState from '../util/appState';

const home = {
  init() {
    // Nav links scroll to page containers
    document.querySelectorAll('.nav-main a').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        // Set nav item to active state immediately
        document.querySelectorAll('.nav-main a').forEach(el => { el.classList.remove('active'); })
        el.classList.add('active');
        // Find matching page
        let title = el.getAttribute('data-title');
        let page = document.querySelector(`section.page[data-title="${title}"`);
        // Set state to animating for various checks
        appState.isAnimating = true;
        zenscroll.intoView(page, 500, () => {
          appState.isAnimating = false;
        });
      });
    });

    // Logo click scrolls to top of page
    document.querySelectorAll('.header a.logo,footer .logo-stacked a').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        // Ignore click if already animating
        if (!appState.isAnimating) {
          // Set nav item to active state immediately
          document.querySelectorAll('.nav-main a').forEach(el => { el.classList.remove('active'); })
          appState.isAnimating = true;
          zenscroll.toY(0, 500, () => {
            appState.isAnimating = false;
          });
        }
      });
    });

  },

  finalize() {
  },
};

export default home
