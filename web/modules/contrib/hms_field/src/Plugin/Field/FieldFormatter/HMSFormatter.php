<?php

namespace Drupal\hms_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'hms_default_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "hms_default_formatter",
 *   label = @Translation("Hours Minutes and Seconds"),
 *   field_types = {
 *     "hms"
 *   }
 * )
 */
class HMSFormatter extends HmsFormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings(): array {
    return [
      'format' => 'h:mm',
      'leading_zero' => TRUE,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state): array {
    $settings = $this->getSettings();
    $elements['format'] = [
      '#type' => 'select',
      '#title' => $this->t('Display format'),
      '#options' => $this->hmsService->formatOptions(),
      '#description' => $this->t('The display format used for this field'),
      '#default_value' => $settings['format'],
      '#required' => TRUE,
    ];
    $elements['leading_zero'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Leading zero'),
      '#description' => $this->t('Leading zero values will be displayed when this option is checked'),
      '#default_value' => $settings['leading_zero'],
    ];
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary(): array {
    $summary = [];
    $settings = $this->getSettings();
    $summary[] = $this->t('Format: @format', ['@format' => $settings['format']]);
    $summary[] = $this->t('Leading zero: @zero', ['@zero' => ($settings['leading_zero'] ? $this->t('On') : $this->t('Off'))]);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode): array {
    $element = [];

    foreach ($items as $delta => $item) {
      $element[$delta] = [
        '#theme' => 'hms',
        '#value' => $item->value,
        '#format' => $this->getSetting('format'),
        '#leading_zero' => $this->getSetting('leading_zero'),
      ];
    }

    return $element;
  }

}
