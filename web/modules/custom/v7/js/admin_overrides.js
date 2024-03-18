/**
 * @file
 * Admin Overrides - JavaScript overrides and tweaks for admin pages.
 */

(function (Drupal, $, once) {

  Drupal.behaviors.adminOverrides = {
    attach: function (context) {

      // Cannot use `window` or `document` directly.
      if (once('admin-overrides', 'html').length) {
        $(function () {
          // (1) Undo unset of z-index by some other module.
          $('#toolbar-administration').css('z-index', '');
        });
      }

    }
  };

}(Drupal, jQuery, once));
