<?php

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function v7_theme_suggestions_menu_alter(array &$suggestions, array $variables) {
  // Remove the block and replace dashes with underscores in the block ID to
  // use for the hook name.
  if (isset($variables['attributes']['block'])) {
    $hook = str_replace(array('block-', '-'), array('', '_'), $variables['attributes']['block']);
    $suggestions[] = $variables['theme_hook_original'] . '__' . $hook;
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function v7_theme_suggestions_page_alter(array &$suggestions, array $variables) {
  // If we're on a node, grab its bundle (content type) and add in a suggestion.
  if ($node = \Drupal::routeMatch()->getParameter('node')) {
    $content_type = $node->bundle();
    $suggestions[] = 'page__' . $content_type;
  }
}
