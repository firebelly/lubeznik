import appState from '../util/appState';

const contact = {
  init() {
    // AJAXify contact form submission
    let form = $('#contact-form');
    let formResponse = document.querySelector('#page-contact .form-response');
    let formWrap = document.querySelector('#page-contact .form-wrap');
    form.submit(function(e) {
      e.preventDefault();
      $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        dataType: 'html',
        data: form.serialize(),
        success: (result) => {
          formResponse.innerHTML = result;
          if (result.match('success')) {
            formWrap.classList.add('-success');
          }
          // zenscroll.center(formResponse);
        },
        error: (result) => {
          formWrap.classList.add('-error');
          formResponse.innerHTML = '<p>There was an error, please try again.</p>';
          // zenscroll.center(formResponse);
        }
      });
    });

  },

  finalize() {
  },

  unload() {
  },
};

export default contact
