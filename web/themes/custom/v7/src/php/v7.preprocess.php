<?php

use Drupal\Component\Utility\Html;
use Drupal\block\Entity\Block;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\Url;

/***
 * BASE
 */

/**
 * Implements hook_preprocess().
 * Function to make the 'is_front' variable
 * available in all Twig templates
 */
function v7_preprocess(&$variables, $hook) {
  try {
    $variables['is_front'] = \Drupal::service('path.matcher')->isFrontPage();
  }
  catch (Exception $e) {
    $variables['is_front'] = FALSE;
  }
  // Ensure the cache varies correctly (new in Drupal 8.3).
  $variables['#cache']['contexts'][] = 'url.path.is_front';
}

/***
 * BLOCK
 */

/**
 * Implements hook_preprocess_block().
 */
function v7_preprocess_block(&$variables) {
  $variables['content']['#attributes']['block'] = @$variables['attributes']['id'] ?: '';
}
