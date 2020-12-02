/**
 * Lubeznik plugin for Craft CMS
 *
 * Admin Index JS
 *
 * @author    Firebelly
 * @copyright Copyright (c) 2020 Firebelly
 * @link      https://firebellydesign.com/
 * @package   Eventbrite
 * @since     1
 */

// Good Design for Good Reason for Good Namespace
var EventbriteImportIndex = (function($) {
  var $importForm,
      $log;

  function _init() {
    $importForm = $('#eventbrite-import-form');
    $log = $('#eventbrite-import-form .log-output');

    // Hijack import form to send AJAX request
    $importForm.on('submit', function(e) {
      e.preventDefault();

      // Show spinner + Working text after submitting, disable submit button
      $importForm.addClass('importing').find('input[type=submit]').prop('disabled', true).val('Please wait...');
      $importForm.find('input').removeClass('done');
      $log.removeClass('hidden').html('<h2>Log output:</h2>');
      // Start importing all sections checked
      _import();
    });
  }

  // Run importer
  function _import(section) {
      $.ajax({
        dataType: 'json',
        url: $importForm.attr('action'),
        data: {
          CRAFT_CSRF_TOKEN: $importForm.find('input[name=CRAFT_CSRF_TOKEN]').val(),
          'import-mode': $importForm.find('input[name=import-mode]:checked').val()
        }
      }).done(function(data) {
        if (data.status == 1) {
          // Display log messages from import script (after slight pause)
          setTimeout(function() {
            $log.append('<h3>' + data.summary + '</h3>' + data.log);
            // Reset import form (after slight pause)
            setTimeout(_finishImport, 500);
          }, 500);
        } else {
          _importError('<h3>There was an error</h3>' + data.message);
        }
      }).fail(function(jqXHR) {
        _importError('<h3>There was an error sending the request</h3>' + jqXHR.responseJSON.error);
      });
  }

  // Finish import and reset form
  function _finishImport() {
    $importForm.removeClass('importing').find('input[type=submit]').prop('disabled', false).val('Run Importer');
  }

  // Something went wrong
  function _importError(message) {
    $log.append(message);
    $importForm.removeClass('importing').find('input[type=submit]').prop('disabled', false).val('Run Importer');
  }

  // Public functions
  return {
    init: _init
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(EventbriteImportIndex.init);
