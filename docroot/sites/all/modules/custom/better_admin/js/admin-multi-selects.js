/**
 * @file
 * Custom multiselects with Select2
 */

!function ($) {
  // Always use strict mode to enable better error handling in modern browsers.
  "use strict";

  Drupal.behaviors.adminMultiSelects = {
    attach: function (context) {

      /**
       * Select2
       */
      $("select[multiple]").select2({
        placeholder: "Select some options",
        width: "style"
      });

    }
  }

}(jQuery);