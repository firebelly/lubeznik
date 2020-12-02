import appState from '../util/appState';
import autosize from 'autosize';

const contact = {
  init() {
    // JavaScript to be fired on the contact page

    // Contact form
    let $form = $('#contact-form');

    // Contact message autoexpands
    let contactText = document.querySelector('#contact-form textarea');
    if (contactText) {
      autosize(contactText);
    }

    // Contact submit button changes text on hover
    let submitButton = document.querySelector('.contact-form-wrap button[type=submit]');
    let submitButtonSpan = submitButton.querySelector('span');

    // AJAXify contact form submission
    let formResponse = document.querySelector('.contact-form-wrap .form-response');
    let formWrap = document.querySelector('.contact-form-wrap .form-wrap');

    // Store initial thanks copy if replaced by error
    let thanksHtml = formResponse.innerHTML;

    $form.on('submit', (e) => {
      e.preventDefault();
      if (appState.requestInProgress) {
        return false;
      }
      let $subject = $form.find('input[name=subject]');
      let fromName = $form.find('input[name=fromName]').val();

      // Set dynamic subject line to avoid gmail making a conversation thread and hiding text
      $subject.val($subject.data('original-value') + ' from ' + fromName);

      // Set appState flag to avoid multiple submits
      appState.requestInProgress = true;

      $form.addClass('working');
      submitButtonSpan.textContent = 'Working...';

      // Submit form
      $.ajax({
        url: '/',
        'type': 'POST',
        dataType: 'json',
        data: $form.serialize(),
        success: (response) => {
          if (response.success) {
            formResponse.innerHTML = thanksHtml;
            formWrap.classList.add('-success');
          } else {
            formResponse.innerHTML = response.error || '<p>There was an error, please refresh and <a href="/contact">try again</a>.</p>';
          }
        }
      }).fail(() => {
        formResponse.innerHTML = '<p>There was an error, please refresh and <a href="/contact">try again</a>.</p>';
      }).always(() => {
        $form.removeClass('working');
        submitButtonSpan.textContent = 'Submit';
        formResponse.classList.add('-active');
        appState.requestInProgress = false;
      });
    });

  },

  finalize() {
  },

  unload() {
  },
};

export default contact
