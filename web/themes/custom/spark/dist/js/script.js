/**
 * @file
 * Spark behaviors.
 */
(function (Drupal, $, once) {
  'use strict';

  Drupal.behaviors.spark = {
    attach(context) {
      if (once('spark', 'html').length) {
        $(function () {

          console.log('It works!');

        });
      }
    }
  };

}(Drupal, jQuery, once));
