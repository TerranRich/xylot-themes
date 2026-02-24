/**
 * @file
 * Admin Overrides - JavaScript overrides and tweaks for admin pages.
 */

(function (Drupal, $, once) {

  function initializeGroupMenu() {
    // Detect group menu and populate with links using group headings (h3.group-header).
    const $groupMenu = $('#group-menu');
    if ($groupMenu.length) {
      // First, clear warning text to indicate that it is being populated.
      $groupMenu.html('');
      // Detect all group headers.
      const $groupHeaders = $('h3.group-header');
      if ($groupHeaders.length) {
        // Iterate over each group header.
        $groupHeaders.each(function () {
          const $this = $(this);
          // Construct link out of header ID and text (first character or "#").
          const $link = $('<a href="#' + $this.attr('id') + '">' + $this.text() + '</a>');
          // Animated smooth scroll to group header.
          $link.click(function () {
            // Scroll to the group header.
            $('html, body').animate({
              scrollTop: $this.offset().top,
            }, 500);
            return false;
          });
          // Add link to menu.
          $groupMenu.append($link);
        });
      }
      else {
        // Nothing here, so nothing to link to.
        $groupMenu.hide();
      }
    }
  }

  Drupal.behaviors.groupMenu = {
    attach: function (context) {

      // Cannot use `window` or `document` directly.
      if (once('groupMenu', 'html').length) {
        $(function () {
          initializeGroupMenu();
          // Also listen for AJAX events.
          $(document).ajaxComplete(function() {
            initializeGroupMenu();
          });
        });
      }

    }
  };

}(Drupal, jQuery, once));
