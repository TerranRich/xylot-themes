/**
 * @file
 * Admin Overrides - JavaScript overrides and tweaks for admin pages.
 */
(function (Drupal, $, once) {

  Drupal.behaviors.v7AdminOverrides = {
    attach: function (context) {

      // Cannot use `window` or `document` directly.
      if (once('v7AdminOverrides', 'html').length) {
        $(function () {
          const initThemesOpt = '<option value="_none">- Select a Wrestler/Team above first -</option>';
          // (1) Undo unset of z-index by some other module.
          $('#toolbar-administration').css('z-index', '');
          // (2) Handle themes listing on Borrowed From field change.
          $(document).ajaxComplete(function(event, xhr, settings) {
            let uniqueId;
            // Check if the request is a Drupal AJAX request.
            if (!settings.hasOwnProperty('extraData') || !settings.extraData.hasOwnProperty('_triggering_element_name')) {
              return true;
            }
            const trigger = settings.extraData._triggering_element_name || '';
            let action;
            if (trigger === "ief-field_themes_list-form-add") {
              // We're adding a new BTU.
              action = 'add';
            } else if (trigger.includes("ief-field_themes_list-form-entity-edit-")) {
              // We're editing an existing BTU.
              action = 'edit';
            } else {
              return true;
            }
            const $iefForm = $('.ief-form');
            let ownerSel  = '';
            let themesSel = '';
            
            // Go through each .form-item, find the one that says "Borrowed
            // Theme", and assign it a randomized data attrib as a selector.
            $iefForm.find('.form-item').each((index, elem) => {
              const $label = $(elem).find('label');
              if (
                $label.length && (
                  $label.text() === 'Borrowed Theme' ||
                  $label.text() === 'Borrowed From'
                )
              ) {
                // Read parent div classes and find the one that matches
                // .js-form-item-field-themes-list-form-*.
                const classes = $(elem).attr('class').split(/\s+/);
                classes.forEach(className => {
                  if (
                    className.includes('js-form-item-field-themes-list-form-') &&
                    className.includes('-field-borrowed-theme')
                  ) {
                    // Generate a unique identifier for this dropdown.
                    uniqueId = `borrowed-theme-${Date.now()}`;
                    $(elem).find('select').attr('data-unique-id', uniqueId);
                    themesSel = className;
                  }
                  if (
                    className.includes('js-form-item-field-themes-list-form-') &&
                    className.includes('-field-owner')
                  ) {
                    ownerSel = className;
                  }
                });
              }
            });
            // Make sure we have selectors for both Owner and Themes dropdowns.
            if (ownerSel === '' || themesSel === '') {
              // We didn't find anything for some reason. Just gracefully exit.
              return;
            }
            ownerSel  = `.${ownerSel} .form-autocomplete`;  // target the autocomplete
            themesSel = `.${themesSel} select`; // target the dropdown

            if (action === 'add') {
              // If we're adding a new BTU, we want the Borrowed Theme field to
              // initially be blank.
              $(themesSel).html(initThemesOpt);
            } else {
              // We're editing, which means we need to take the existing Owner,
              // grabs its Themes, and populate the dropdown while ALSO keeping
              // the selected option selected.
              const selectedThemeId = $(themesSel).val();
              const ownerValMatches = $(ownerSel).val().match(/\((\d+)\)/);
              const selectedOwnerId = ownerValMatches[ownerValMatches.length - 1];
              const ajaxCallInit = Drupal.ajax({
                url: Drupal.url(`admin/list-themes/${selectedOwnerId}/${uniqueId}`),
                type: 'GET',
                dataType: 'json',
                data: {
                  node_id: selectedOwnerId,
                  unique_id: uniqueId,
                },
                element: $(themesSel).get(0),
                progress: {
                  type: 'throbber',
                },
                submit: {
                  js: true,
                },
              });

              // Extend the success callback to set active select option.
              const originalSuccess = ajaxCallInit.success;
              ajaxCallInit.success = function (response, status, xhr) {
                // Call the original success handler first.
                if (typeof originalSuccess === 'function') {
                  originalSuccess.call(this, response, status, xhr);
                }

                // Re-set the originally selected theme ID after population.
                // Every 100ms, check for existence of Borrowed Theme dropdown.
                let selCheck = window.setInterval(_ => {
                  if ($(themesSel).length) {
                    $(themesSel).val(selectedThemeId.toString());
                    window.clearInterval(selCheck);
                  }
                }, 100);
              };

              // Execute the AJAX call.
              ajaxCallInit.execute();
            }

            let matches, nid;
            // When we select a Wrestler/Team, we send a custom AJAX call to
            // get a list of IDs and full titles to populate the dropdown.
            $(ownerSel).on('autocompleteselect', function(event, ui) {
              matches = ui.item.value.match(/\((\d+)\)/);
              nid = matches[matches.length - 1];
            });
            $(ownerSel).on('autocompleteclose', function(event, ui) {
              // Send the AJAX request through Drupal.
              const ajaxCall = Drupal.ajax({
                url: Drupal.url(`admin/list-themes/${nid}/${uniqueId}`),
                type: 'GET',
                dataType: 'json',
                data: {
                  node_id: nid,
                  unique_id: uniqueId,
                },
                element: $(themesSel).get(0),
                progress: {
                  type: 'throbber',
                },
                submit: {
                  js: true,
                },
              });

              // Execute the AJAX request.
              ajaxCall.execute();
            });
          });
        });
      }
      
    }
  };

}(Drupal, jQuery, once));
