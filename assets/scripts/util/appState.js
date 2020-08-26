// Shared var storage for state

const appState = {
  isAnimating: false,
  navOpen: false,
  navStuck: false,
  popState: false,
  modalOpen: false,
  requestInProgress: false,
  breakpointIndicator: {},
  breakpoints: {},

  init() {
    // Create breakpoint-indicator div
    appState.breakpointIndicator = document.createElement('div');
    appState.breakpointIndicator.id = 'breakpoint-indicator';
    document.body.appendChild(appState.breakpointIndicator);
    // Bind updateBreakpoints to domready and resize
    document.addEventListener('DOMContentLoaded', appState.updateBreakpoints);
    window.addEventListener('resize', appState.updateBreakpoints);
    appState.updateBreakpoints();
  },

  updateBreakpoints() {
  	// Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
  	let breakpointIndicatorString = window.getComputedStyle( appState.breakpointIndicator, ':after' ).getPropertyValue('content').replace(/['"]+/g, '');
  	appState.breakpoints['xl'] = breakpointIndicatorString === 'xl';
  	appState.breakpoints['lg'] = breakpointIndicatorString === 'lg' || appState.breakpoints['xl'];
  	appState.breakpoints['nav'] = breakpointIndicatorString === 'nav' || appState.breakpoints['lg'];
  	appState.breakpoints['md'] = breakpointIndicatorString === 'md' || appState.breakpoints['nav'];
  	appState.breakpoints['sm'] = breakpointIndicatorString === 'sm' || appState.breakpoints['md'];
  	appState.breakpoints['xs'] = breakpointIndicatorString === 'xs' || appState.breakpoints['sm'];
  },
};

export default appState
