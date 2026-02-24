<?php

namespace Drupal\imagecroper\Plugin\Field\FieldWidget;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\ElementInfoManagerInterface;
use Drupal\Core\Url;
use Drupal\file\FileRepositoryInterface;
use Drupal\image\Plugin\Field\FieldWidget\ImageWidget;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'imagecroper' widget.
 *
 * @FieldWidget(
 *   id = "imagecroper",
 *   label = @Translation("Imager Widget"),
 *   field_types = {
 *     "image"
 *   }
 * )
 */
class Imagecroper extends ImageWidget implements ContainerFactoryPluginInterface {

  /**
   * The config factory.
   *
   * Subclasses should use the self::config() method, which may be overridden to
   * address specific needs when loading config, rather than this property
   * directly. See \Drupal\Core\Form\ConfigFormBase::config() for an example of
   * this.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The storage handler class for files.
   *
   * @var \Drupal\file\FileStorage
   */
  private $fileStorage;

  /**
   * File Repository service.
   *
   * @var \Drupal\file\FileRepositoryInterface
   */
  protected $fileRepository;

  /**
   * Entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
   * File system service.
   *
   * @var \Drupal\Core\File\FileSystem
   */
  protected $fileSystem;

  /**
   * Constructs an ImageWidget object.
   *
   * @param string $plugin_id
   *   The plugin_id for the widget.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the widget is associated.
   * @param array $settings
   *   The widget settings.
   * @param array $third_party_settings
   *   Any third party settings.
   * @param \Drupal\Core\Render\ElementInfoManagerInterface $element_info
   *   The element info manager service.
   * @param \Drupal\Core\Image\ImageFactory $image_factory
   *   The image factory service.
   * @param \Drupal\file\FileRepositoryInterface $file_repository
   *   File Repository service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   Entity type manager service.
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   File system service.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, ElementInfoManagerInterface $element_info, ImageFactory $image_factory = NULL, FileRepositoryInterface $file_repository = NULL, EntityTypeManagerInterface $entity_type_manager = NULL, FileSystemInterface $file_system = NULL) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings, $element_info, $image_factory);
    $this->fileRepository = $file_repository ?: \Drupal::service('file.repository');
    $this->entityTypeManager = $entity_type_manager ?: \Drupal::service('entity_type.manager');
    $this->fileSystem = $file_system ?: \Drupal::service('file_system');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings'],
      $container->get('element_info'),
      NULL,
      $container->get('file.repository'),
      NULL,
      $container->get('file_system')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'update_image_type' => 'new',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::settingsForm($form, $form_state);

    $element['update_image_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Type of update image'),
      '#default_value' => $this->getSetting('update_image_type') ? $this->getSetting('update_image_type') : 'replace',
      '#required' => TRUE,
      '#options' => $this->getUpdateImageTypeOptions(),
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();

    $options = $this->getUpdateImageTypeOptions();
    $summary[] = $this->t('Type of update image: @type', ['@type' => $options[$this->getSetting('update_image_type')]]);

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  private function getUpdateImageTypeOptions() {
    return [
      'replace' => $this->t('Replace existing image'),
      'new' => $this->t('Create new image'),
    ];
  }

  /**
   * Form API callback: Processes a crop_image field element.
   *
   * Expands the image_image type to include the alt and title fields.
   *
   * This method is assigned as a #process callback in formElement() method.
   *
   * @return array
   *   The elements with parents fields.
   */
  public static function process($element, FormStateInterface $form_state, $form) {
    if ($element['#files']) {
      foreach ($element['#files'] as $key => $file) {
        if (!empty($file)) {
          $element['imagecroper_wrapper'] = [
            '#type' => 'fieldset',
            '#title' => t('Edit your image'),
          ];
          $element['imagecroper_wrapper']['imagecroper'] = [
            '#markup' => '<a class="add-new-imager button" id = "image_' . $key . '" href="#">' . t('Start Editing') . '</a>
                          <div class="description image_' . $key . '">' . t('To rotate or crop image: IMPORTANT: Click Save icon at top right corner of the image to save your edited photo. Click Save button at the bottom of profile to save the profile before navigating away from the page.') . '</div>
                          <div class="imagers image_' . $key . '" ></div>',
          ];
          $element['imagecroper_wrapper']['imager_output'] = [
            '#type' => 'textarea',
            '#prefix' => '<div class="hidden">',
            '#suffix' => '</div>',
          ];
        }
      }
      $element['#attached']['library'][] = 'imagecroper/imagerjs';
    }
    $element['#attached']['drupalSettings']['path']['baseUrl'] = Url::fromRoute('<front>', [], ['absolute' => TRUE])->toString();

    return parent::process($element, $form_state, $form);
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {

    // Get original file.
    $i = 0;
    foreach ($values as $file_item) {

      if (count($file_item['fids']) > 0) {

        $original_file = $this->entityTypeManager->getStorage('file')->load($file_item['fids'][0]);
        // String (26) "alutech-am-5000kit-1-o.jpg".
        $original_file_name = $original_file->getFilename();
        // Get data from saved image data.
        $file_content = $file_item['imagecroper_wrapper']['imager_output'];

        if (strlen($file_content) > 0) {
          [$type, $data] = explode(';', $file_content);
          [, $data] = explode(',', $data);
          $data_decoded = base64_decode($data);
          [, $mimetype] = explode(':', $type);

          if ($this->getSetting('update_image_type') == 'replace') {
            $path_uri = $original_file->getFileUri();
            $this->fileRepository->writeData($data_decoded, $path_uri, FileSystemInterface::EXISTS_REPLACE);

            $original_file->setMimeType($mimetype);
            $original_file->save();

            $this->flushImageStyles($path_uri);

            unset($values[$i]['imager_output']);
          }
          else {
            // Save new file to drupal file managed.
            $file = \Drupal::service('file.repository')->writeData($data_decoded, 'public://' . $original_file_name, FileSystemInterface::EXISTS_RENAME);

            $file->setMimeType($mimetype);
            $file->save();
            // Set new fid to field values.
            if (is_object($file)) {
              $values[$i]['fids'][0] = $file->id();
              unset($values[$i]['imager_output']);
            }
          }
        }
        $i++;
      }

    }
    return parent::massageFormValues($values, $form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  private function flushImageStyles($path_uri) {
    // Rebuild image styles.
    $styles = $this->entityTypeManager->getStorage('image_style')
      ->loadMultiple();

    foreach ($styles as $style) {
      /** @var \Drupal\image\Entity\ImageStyle  $style */
      $style_path = $style->buildUri($path_uri);
      if (is_file($style_path) && file_exists($style_path)) {
        $this->fileSystem->unlink($style_path);
      }
      $path_parts = pathinfo($style_path);
      $style_path_webp = $path_parts['dirname'] . '/' . $path_parts['filename'] . '.webp';
      if (is_file($style_path_webp) && file_exists($style_path_webp)) {
        $this->fileSystem->unlink($style_path_webp);
      }
    }
  }

}
